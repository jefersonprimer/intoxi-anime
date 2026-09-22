import { Extension, mergeAttributes } from "@tiptap/core";
import {
  Table as BaseTable,
  type TableOptions,
} from "@tiptap/extension-table";
import type { Node as PMNode } from "@tiptap/pm/model";
import { TextSelection, type Transaction } from "@tiptap/pm/state";
import {
  TableMap,
  addColumn,
  addRow,
  deleteTable,
  removeColumn,
  removeRow,
  setCellAttr,
  type TableRect as PMTableRect,
} from "@tiptap/pm/tables";
import type { EditorView, NodeView, ViewMutationRecord } from "@tiptap/pm/view";

import { blockColorSwatches, cellColorSwatches } from "./palette";

const iconPlus =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
const iconMinus =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 12h14"/></svg>';
const iconTrash =
  '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-.8 12.1a2 2 0 0 1-2 1.9H7.8a2 2 0 0 1-2-1.9L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>';
const iconPalette =
  '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C7 2 2 6.5 2 12c0 3.3 2.4 6.1 5.5 6.1H9a1.5 1.5 0 0 1 1.1 2.5c-.4.4-.5.7-.5 1.1 0 .8.8 1.4 1.7 1.4 5.6 0 10.7-4.7 10.7-10.4C22 5.5 17.5 2 12 2z"/></svg>';

const controlBtnClass = "tbl-btn";

export function tableColCount(node: PMNode): number {
  const firstRow = node.firstChild;
  if (!firstRow) {
    return 1;
  }
  let width = 0;
  firstRow.forEach((cell: PMNode) => {
    width += (cell.attrs.colspan as number) || 1;
  });
  return Math.max(1, width);
}

function tableRect(node: PMNode, tablePos: number): PMTableRect {
  const map = TableMap.get(node);
  const rect = map.findCell(map.positionAt(0, 0, node));
  return { table: node, tableStart: tablePos + 1, map, ...rect };
}

function makeButton(innerHTML: string, title: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = controlBtnClass;
  button.title = title;
  button.setAttribute("aria-label", title);
  button.innerHTML = innerHTML;
  button.addEventListener("mousedown", (event) => event.preventDefault());
  return button;
}

type ColorTarget = "header" | "accent" | "cell";

export class EditableTableView implements NodeView {
  node: PMNode;
  dom: HTMLDivElement;
  table: HTMLTableElement;
  colgroup: HTMLTableColElement;
  contentDOM: HTMLTableSectionElement;

  private readonly view: EditorView;
  private readonly getPos: () => number;

  private readonly addColBtn: HTMLButtonElement;
  private readonly removeColBtn: HTMLButtonElement;
  private readonly addRowBtn: HTMLButtonElement;
  private readonly removeRowBtn: HTMLButtonElement;
  private readonly colCountLabel: HTMLSpanElement;
  private readonly rowCountLabel: HTMLSpanElement;
  private readonly colorBtn: HTMLButtonElement;
  private readonly trashBtn: HTMLButtonElement;
  private readonly colorMenu: HTMLDivElement;
  private readonly colorTargets: Record<ColorTarget, HTMLButtonElement>;
  private colorTarget: ColorTarget = "header";

  constructor(
    node: PMNode,
    _cellMinWidth: number,
    view: EditorView,
    getPos: () => number,
    HTMLAttributes: Record<string, unknown> = {},
  ) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    this.dom = document.createElement("div");
    this.dom.className = "tiptap-table-wrapper";
    this.dom.setAttribute("data-node-view-wrapper", "");

    const scroll = this.dom.appendChild(document.createElement("div"));
    scroll.className = "tiptap-table-scroll";

    this.table = scroll.appendChild(document.createElement("table"));
    this.table.className = "tiptap-table";

    for (const [key, value] of Object.entries(HTMLAttributes)) {
      if (value === undefined || value === null) {
        continue;
      }
      if (key === "style") {
        this.table.setAttribute("style", String(value));
      } else {
        this.table.setAttribute(key, String(value));
      }
    }

    this.colgroup = this.table.appendChild(document.createElement("colgroup"));
    this.renderCols();
    this.contentDOM = this.table.appendChild(document.createElement("tbody"));

    this.addColBtn = makeButton(iconPlus, "Adicionar coluna a direita");
    this.removeColBtn = makeButton(iconMinus, "Remover ultima coluna");
    this.addRowBtn = makeButton(iconPlus, "Adicionar linha abaixo");
    this.removeRowBtn = makeButton(iconMinus, "Remover ultima linha");
    this.colorBtn = makeButton(iconPalette, "Cor da tabela");
    this.trashBtn = makeButton(iconTrash, "Excluir tabela");
    this.colCountLabel = document.createElement("span");
    this.colCountLabel.className = "tbl-count";
    this.rowCountLabel = document.createElement("span");
    this.rowCountLabel.className = "tbl-count";

    this.colorMenu = document.createElement("div");
    this.colorMenu.className = "tbl-color-menu";
    this.colorTargets = {
      header: makeButton("Cabecalho", "Cor do cabecalho"),
      accent: makeButton("Borda", "Cor das bordas"),
      cell: makeButton("Celula", "Cor da celula atual"),
    };

    this.buildControls();
    this.buildColorMenu();
    this.bind();
    this.syncState();
    this.attachDocListener();
  }

  private renderCols() {
    this.colgroup.replaceChildren();
    const count = tableColCount(this.node);
    for (let i = 0; i < count; i += 1) {
      this.colgroup.appendChild(document.createElement("col"));
    }
  }

  private syncState() {
    const map = TableMap.get(this.node);
    this.colCountLabel.textContent = String(map.width);
    this.rowCountLabel.textContent = String(map.height);
    this.removeColBtn.disabled = map.width <= 1;
    this.removeRowBtn.disabled = map.height <= 1;
    this.table.style.width = "100%";
    this.table.style.minWidth = "";

    const header = this.node.attrs.headerColor as string | null;
    const accent = this.node.attrs.accentColor as string | null;
    if (header) {
      this.table.style.setProperty("--th-bg", header);
    } else {
      this.table.style.removeProperty("--th-bg");
    }
    if (accent) {
      this.table.style.setProperty("--accent", accent);
    } else {
      this.table.style.removeProperty("--accent");
    }
  }

  private bind() {
    this.addColBtn.addEventListener("click", () => this.addColumnAtEnd());
    this.removeColBtn.addEventListener("click", () => this.removeColumnAtEnd());
    this.addRowBtn.addEventListener("click", () => this.addRowAtEnd());
    this.removeRowBtn.addEventListener("click", () => this.removeRowAtEnd());
    this.trashBtn.addEventListener("click", () => this.removeTable());
    this.colorBtn.addEventListener("click", () => {
      this.colorMenu.classList.toggle("is-open");
    });
    for (const [target, btn] of Object.entries(this.colorTargets)) {
      btn.addEventListener("click", () => this.setColorTarget(target as ColorTarget));
    }
  }

  private getTableNode(): PMNode | null {
    const pos = this.getPos();
    if (typeof pos !== "number") {
      return null;
    }
    const node = this.view.state.doc.nodeAt(pos);
    return node && node.type.name === "table" ? node : null;
  }

  private run(tr: Transaction) {
    this.view.dispatch(tr);
    this.view.focus();
  }

  private addColumnAtEnd() {
    const pos = this.getPos();
    const node = this.view.state.doc.nodeAt(pos);
    if (!node) {
      return;
    }
    const tr = this.view.state.tr;
    addColumn(tr, tableRect(node, pos), TableMap.get(node).width);
    this.run(tr);
  }

  private removeColumnAtEnd() {
    const pos = this.getPos();
    const node = this.view.state.doc.nodeAt(pos);
    if (!node) {
      return;
    }
    const rect = tableRect(node, pos);
    if (rect.map.width <= 1) {
      return;
    }
    const tr = this.view.state.tr;
    removeColumn(tr, rect, rect.map.width - 1);
    this.run(tr);
  }

  private addRowAtEnd() {
    const pos = this.getPos();
    const node = this.view.state.doc.nodeAt(pos);
    if (!node) {
      return;
    }
    const rect = tableRect(node, pos);
    const tr = this.view.state.tr;
    addRow(tr, rect, rect.map.height);
    this.run(tr);
  }

  private removeRowAtEnd() {
    const pos = this.getPos();
    const node = this.view.state.doc.nodeAt(pos);
    if (!node) {
      return;
    }
    const rect = tableRect(node, pos);
    if (rect.map.height <= 1) {
      return;
    }
    const tr = this.view.state.tr;
    removeRow(tr, rect, rect.map.height - 1);
    this.run(tr);
  }

  private removeTable() {
    const pos = this.getPos();
    const node = this.view.state.doc.nodeAt(pos);
    if (!node) {
      return;
    }
    const tr = this.view.state.tr;
    tr.setSelection(TextSelection.create(tr.doc, pos + 1));
    this.view.dispatch(tr);
    if (deleteTable(this.view.state, (t) => this.view.dispatch(t))) {
      this.view.focus();
    }
  }

  private setColorTarget(target: ColorTarget) {
    this.colorTarget = target;
    for (const [key, btn] of Object.entries(this.colorTargets)) {
      btn.classList.toggle("is-active", key === target);
    }
  }

  private applyColor(value: string | null) {
    if (this.colorTarget === "cell") {
      this.colorCell(value);
    } else if (value) {
      this.colorTable(value);
    } else {
      this.resetTableColor();
    }
  }

  private colorTable(value: string) {
    const pos = this.getPos();
    const node = this.view.state.doc.nodeAt(pos);
    if (!node) {
      return;
    }
    const tr = this.view.state.tr;
    const attrs = { ...node.attrs } as Record<string, unknown>;
    if (this.colorTarget === "header") {
      attrs.headerColor = value;
    } else {
      attrs.accentColor = value;
    }
    tr.setNodeMarkup(pos, null, attrs);
    this.run(tr);
  }

  private resetTableColor() {
    const pos = this.getPos();
    const node = this.view.state.doc.nodeAt(pos);
    if (!node) {
      return;
    }
    const tr = this.view.state.tr;
    const attrs = { ...node.attrs } as Record<string, unknown>;
    if (this.colorTarget === "header") {
      // Precisa ser explicito: null so remove o attr e o CSS volta ao azul padrao.
      attrs.headerColor = "transparent";
    } else {
      attrs.accentColor = null;
    }
    tr.setNodeMarkup(pos, null, attrs);
    this.run(tr);
  }

  private colorCell(value: string | null) {
    const apply = () =>
      setCellAttr("backgroundColor", value)(this.view.state, (tr) => {
        this.view.dispatch(tr);
      });

    if (apply()) {
      this.view.focus();
      return;
    }

    // Sem celula selecionada: foca a primeira celula e tenta de novo.
    const pos = this.getPos();
    if (typeof pos !== "number") {
      return;
    }
    try {
      this.view.dispatch(
        this.view.state.tr.setSelection(
          TextSelection.create(this.view.state.doc, pos + 2),
        ),
      );
    } catch {
      this.view.focus();
      return;
    }

    apply();
    this.view.focus();
  }

  private buildControls() {
    const topBar = document.createElement("div");
    topBar.className = "tbl-owner-top";
    topBar.append(this.colorBtn, this.trashBtn);

    const colCtl = document.createElement("div");
    colCtl.className = "tbl-owner-side";
    colCtl.append(this.addColBtn, this.colCountLabel, this.removeColBtn);

    const rowCtl = document.createElement("div");
    rowCtl.className = "tbl-owner-bottom";
    rowCtl.append(this.addRowBtn, this.rowCountLabel, this.removeRowBtn);

    topBar.append(this.colorMenu);
    this.dom.append(topBar, colCtl, rowCtl);

    this.colorMenu.addEventListener("click", (event) => event.stopPropagation());
    this.colorMenu.addEventListener("mousedown", (event) => event.preventDefault());
  }

  private buildColorMenu() {
    const title = document.createElement("p");
    title.className = "tbl-color-title";
    title.textContent = "Cor";

    const targets = document.createElement("div");
    targets.className = "tbl-color-targets";
    targets.append(
      this.colorTargets.header,
      this.colorTargets.accent,
      this.colorTargets.cell,
    );
    this.setColorTarget("header");

    const swatches = document.createElement("div");
    swatches.className = "tbl-color-swatches";

    const none = makeButton("", "Sem cor");
    none.className = "tbl-color-none";
    none.innerHTML =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12h16"/></svg>';
    none.addEventListener("click", () => this.applyColor(null));
    swatches.appendChild(none);

    for (const swatch of cellColorSwatches) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tbl-color-swatch";
      btn.style.background = swatch.value;
      btn.title = swatch.name;
      btn.setAttribute("aria-label", swatch.name);
      btn.addEventListener("mousedown", (event) => event.preventDefault());
      btn.addEventListener("click", () => this.applyColor(swatch.value));
      swatches.appendChild(btn);
    }

    const swatchBg = document.createElement("div");
    swatchBg.className = "tbl-color-bg";
    for (const swatch of blockColorSwatches) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tbl-color-swatch";
      btn.style.background = swatch.value;
      btn.title = swatch.name;
      btn.setAttribute("aria-label", swatch.name);
      btn.addEventListener("mousedown", (event) => event.preventDefault());
      btn.addEventListener("click", () => this.applyColor(swatch.value));
      swatchBg.appendChild(btn);
    }

    this.colorMenu.append(title, targets, swatches, swatchBg);
  }

  update(node: PMNode): boolean {
    if (node.type !== this.node.type) {
      return false;
    }
    this.node = node;
    this.renderCols();
    this.syncState();
    return true;
  }

  ignoreMutation(mutation: ViewMutationRecord) {
    const target = mutation.target as Node;
    const isInsideWrapper = this.dom.contains(target);
    const isInsideContent = this.contentDOM.contains(target);

    if (isInsideWrapper && !isInsideContent) {
      if (
        mutation.type === "attributes" ||
        mutation.type === "childList" ||
        mutation.type === "characterData"
      ) {
        return true;
      }
    }
    return false;
  }

  destroy() {
    document.removeEventListener("pointerdown", this.handleDocPointerDown);
  }

  private readonly handleDocPointerDown = (event: PointerEvent) => {
    const target = event.target as Node;
    if (
      this.colorMenu.classList.contains("is-open") &&
      !this.colorMenu.contains(target) &&
      !this.colorBtn.contains(target)
    ) {
      this.colorMenu.classList.remove("is-open");
    }
  };

  private attachDocListener() {
    document.addEventListener("pointerdown", this.handleDocPointerDown);
  }
}

export const TableCellBackground = Extension.create({
  name: "tableCellBackground",

  addGlobalAttributes() {
    return [
      {
        types: ["tableCell", "tableHeader"],
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: (element) => element.style.backgroundColor || null,
            renderHTML: (attributes) => {
              if (!attributes.backgroundColor) {
                return {};
              }
              return { style: `background-color: ${attributes.backgroundColor}` };
            },
          },
        },
      },
    ];
  },
});

export const EditableTable = BaseTable.extend<TableOptions>({
  addAttributes() {
    return {
      ...this.parent?.(),
      headerColor: {
        default: null,
        parseHTML: (element) => {
          const value = element.style.getPropertyValue("--th-bg").trim();
          return value || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.headerColor) {
            return {};
          }
          return { style: `--th-bg: ${attributes.headerColor}` };
        },
      },
      accentColor: {
        default: null,
        parseHTML: (element) => {
          const value = element.style.getPropertyValue("--accent").trim();
          return value || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.accentColor) {
            return {};
          }
          return { style: `--accent: ${attributes.accentColor}` };
        },
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const colCount = tableColCount(node);
    const colgroup: unknown[] = ["colgroup"];
    for (let i = 0; i < colCount; i += 1) {
      colgroup.push(["col", {}]);
    }

    const userStyle = HTMLAttributes.style as string | undefined;
    const style = userStyle
      ? `${userStyle}; width: 100%`
      : "width: 100%";

    const table: unknown[] = [
      "table",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        style,
      }),
      colgroup,
      ["tbody", 0],
    ];

    return (
      this.options.renderWrapper
        ? ["div", { class: "tableWrapper" }, table]
        : table
    ) as any;
  },

  addNodeView() {
    return ({
      node,
      view,
      getPos,
      HTMLAttributes,
    }: {
      node: PMNode;
      view: EditorView;
      getPos: () => number | undefined;
      HTMLAttributes: Record<string, unknown>;
    }) => {
      return new EditableTableView(
        node,
        this.options.cellMinWidth,
        view,
        getPos as () => number,
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      );
    };
  },
});