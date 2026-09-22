import { mergeAttributes, Node, type Editor, type NodeViewProps } from "@tiptap/core";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Minus, Palette, Plus, Trash2 } from "lucide-react";
import type { Node as PMNode } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";

import { blockColorSwatches } from "./palette";

const roundControlClass =
  "grid size-6 place-items-center rounded-full border border-white/25 bg-[#262625] text-white shadow-md shadow-black/30 transition hover:scale-110 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-30";

function insertColumnAfter(editor: Editor, columnsPos: number, columnsNode: PMNode) {
  const schema = editor.schema;
  const columnType = schema.nodes.column;
  if (!columnType) {
    return;
  }
  const paragraph = schema.nodes.paragraph.createAndFill();
  if (!paragraph) {
    return;
  }
  const tr = editor.state.tr;
  tr.insert(
    columnsPos + columnsNode.nodeSize - 1,
    columnType.create(null, paragraph),
  );
  editor.view.dispatch(tr);
  editor.commands.focus();
}

/** Posiciona o cursor no primeiro textblock da coluna (clique em area vazia). */
function focusInsideColumn(editor: Editor, columnPos: number) {
  const $start = editor.state.doc.resolve(columnPos + 1);
  const selection = TextSelection.near($start, 1);
  editor.view.dispatch(editor.state.tr.setSelection(selection));
  editor.view.focus();
}

function ColumnsView({ node, editor, getPos }: NodeViewProps) {
  const count = node.childCount;

  function addColumn() {
    const pos = getPos();
    if (typeof pos !== "number") {
      return;
    }
    insertColumnAfter(editor, pos, node);
  }

  function removeLastColumn() {
    const pos = getPos();
    if (typeof pos !== "number") {
      return;
    }
    if (count <= 1) {
      editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize });
      return;
    }
    const last = node.lastChild;
    if (!last) {
      return;
    }
    const to = pos + node.nodeSize - 1;
    const from = to - last.nodeSize;
    editor.commands.deleteRange({ from, to });
  }

  return (
    <NodeViewWrapper
      data-columns
      data-col-count={count}
      className="columns-node group relative"
      style={{ ["--col-count" as string]: count }}
    >
      <div className="columns-controls columns-controls--left" contentEditable={false}>
        <button
          type="button"
          title="Remover ultima coluna"
          aria-label="Remover ultima coluna"
          onMouseDown={(event) => event.preventDefault()}
          onClick={removeLastColumn}
          disabled={count <= 1}
          className={roundControlClass}
        >
          <Minus size={15} />
        </button>
        <span className="columns-count">{count}</span>
      </div>
      <NodeViewContent className="cols-content" />
      <div className="columns-controls columns-controls--right" contentEditable={false}>
        <button
          type="button"
          title="Adicionar coluna a direita"
          aria-label="Adicionar coluna a direita"
          onMouseDown={(event) => event.preventDefault()}
          onClick={addColumn}
          className={roundControlClass}
        >
          <Plus size={15} />
        </button>
      </div>
    </NodeViewWrapper>
  );
}

function ColumnView({ node, editor, getPos, updateAttributes }: NodeViewProps) {
  const [colorOpen, setColorOpen] = useState(false);
  const colorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!colorOpen) {
      return;
    }
    function handlePointerDown(event: PointerEvent) {
      if (
        colorRef.current &&
        !colorRef.current.contains(event.target as globalThis.Node)
      ) {
        setColorOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown);
  }, [colorOpen]);

  function removeColumn() {
    const pos = getPos();
    if (typeof pos !== "number") {
      return;
    }
    const $pos = editor.state.doc.resolve(pos);
    const parent = $pos.parent;
    if (parent.type.name === "columns") {
      if (parent.childCount <= 1) {
        const blockStart = $pos.before($pos.depth);
        editor.commands.deleteRange({
          from: blockStart,
          to: blockStart + parent.nodeSize,
        });
        return;
      }
      editor.commands.deleteRange({
        from: pos,
        to: pos + node.nodeSize,
      });
      return;
    }
    editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize });
  }

  function applyColor(value: string | null) {
    updateAttributes({ color: value });
    setColorOpen(false);
  }

  /** Se o clique caiu na “casca” da coluna (nao num texto), foca o paragrafo. */
  function handleColumnMouseDown(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("button, .column-chrome, .column-tools, .column-color-menu")) {
      return;
    }
    if (target.closest("p, h1, h2, h3, h4, li, blockquote, pre, a, img")) {
      return;
    }
    const pos = getPos();
    if (typeof pos !== "number") {
      return;
    }
    event.preventDefault();
    focusInsideColumn(editor, pos);
  }

  const bg = typeof node.attrs.color === "string" ? node.attrs.color : undefined;

  return (
    <NodeViewWrapper
      ref={colorRef}
      data-column
      className={`column-node group relative${colorOpen ? " is-tools-open" : ""}`}
      onMouseDown={handleColumnMouseDown}
    >
      <div className="column-chrome" contentEditable={false}>
        <div className="column-tools">
          <button
            type="button"
            title={colorOpen ? "Fechar cor" : "Cor da coluna"}
            aria-label={colorOpen ? "Fechar cor" : "Cor da coluna"}
            aria-expanded={colorOpen}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setColorOpen((open) => !open)}
            className={roundControlClass}
          >
            <Palette size={15} />
          </button>
          <button
            type="button"
            title="Remover coluna"
            aria-label="Remover coluna"
            onMouseDown={(event) => event.preventDefault()}
            onClick={removeColumn}
            className={roundControlClass}
          >
            <Trash2 size={15} />
          </button>
        </div>

        {colorOpen ? (
          <div
            className="column-color-menu"
            onMouseDown={(event) => event.preventDefault()}
          >
            <button
              type="button"
              title="Sem cor"
              aria-label="Sem cor"
              onClick={() => applyColor(null)}
              className="column-color-none"
            >
              <Minus size={14} />
            </button>
            {blockColorSwatches.map((swatch) => (
              <button
                key={swatch.value}
                type="button"
                title={swatch.name}
                aria-label={swatch.name}
                onClick={() => applyColor(swatch.value)}
                className="column-color-swatch"
                style={{ background: swatch.value }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div
        className="column-frame"
        style={bg ? { backgroundColor: bg, ["--col-bg" as string]: bg } : undefined}
      >
        <NodeViewContent className="col-content" />
      </div>
    </NodeViewWrapper>
  );
}

export const ColumnsExtension = Node.create({
  name: "columns",

  group: "block",

  content: "column+",

  isolating: true,

  defining: true,

  parseHTML() {
    return [{ tag: "div[data-columns]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-columns": "",
        "data-col-count": String(node.childCount),
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnsView);
  },
});

export const ColumnExtension = Node.create({
  name: "column",

  content: "block+",

  isolating: true,

  defining: true,

  selectable: false,

  draggable: false,

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }
          return {
            style: `background-color: ${attributes.color}; --col-bg: ${attributes.color}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-column]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-column": "" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnView);
  },
});
