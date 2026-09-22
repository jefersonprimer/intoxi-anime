"use client";

import { WordToolbar } from "@/components/WordToolbar";
import { MediaSizeLarge } from "@/components/icons/MediaSizeLarge";
import { MediaSizeMedium } from "@/components/icons/MediaSizeMedium";
import { MediaSizeSmall } from "@/components/icons/MediaSizeSmall";
import {
  isNodeSelection,
  Editor as TiptapEditor,
  Extension as TiptapExtension,
  Mark as TiptapMark,
  mergeAttributes,
} from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Columns3,
  Heading2,
  ImagePlus,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  PlaySquare,
  Plus,
  Quote,
  Table2,
} from "lucide-react";
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { ColumnExtension, ColumnsExtension } from "./editor/columns";
import { EditableTable, TableCellBackground } from "./editor/table";

const buttonClass =
  "grid size-9 place-items-center rounded-full border border-[#1e73be] text-[#1e73be] transition hover:border-sky-300/50 hover:bg-sky-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40";
const activeButtonClass = "border-sky-300/60 bg-sky-400 !text-slate-950";
const plusButtonLeftOffset = 24;

const fontSizeConstants = {
  base: 22,
  step: 2,
  min: 12,
  max: 48,
};

const textColorSwatches: { name: string; value: string }[] = [
  { name: "Azul claro", value: "#7dd3fc" },
  { name: "Azul", value: "#38bdf8" },
  { name: "Azul escuro", value: "#60a5fa" },
  { name: "Ciano", value: "#22d3ee" },
  { name: "Verde", value: "#4ade80" },
  { name: "Verde claro", value: "#34d399" },
  { name: "Amarelo", value: "#fbbf24" },
  { name: "Laranja", value: "#fb923c" },
  { name: "Vermelho", value: "#f87171" },
  { name: "Rosa", value: "#f472b6" },
  { name: "Roxo", value: "#c084fc" },
  { name: "Branco", value: "#ffffff" },
];

function normalizeHex(value: string): string {
  const match = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(value.trim());
  if (!match) {
    return "";
  }
  let hex = match[1];
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  return `#${hex.toLowerCase()}`;
}

const FontSizeMark = TiptapMark.create({
  name: "fontSize",
  inclusive: false,

  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => element.style.fontSize || null,
        renderHTML: (attributes) => {
          if (!attributes.size) {
            return {};
          }
          return { style: `font-size: ${attributes.size}` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (element) =>
          element.style.fontSize ? {} : false,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },
});

const TextColorMark = TiptapMark.create({
  name: "textColor",

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.color || null,
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }
          return { style: `color: ${attributes.color}` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (element) => (element.style.color ? {} : false),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },
});

const SizedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      size: {
        default: "large",
        parseHTML: (element) =>
          element.getAttribute("data-media-size") ?? "large",
        renderHTML: (attributes) => ({
          "data-media-size": attributes.size,
        }),
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.style.width;
          if (!width) {
            return null;
          }
          const match = /^(\d+(?:\.\d+)?)%$/.exec(width.trim());
          return match ? Number.parseFloat(match[1]) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return { style: `width: ${attributes.width}%` };
        },
      },
      align: {
        default: "center",
        parseHTML: (element) =>
          element.getAttribute("data-media-align") ?? "center",
        renderHTML: (attributes) => {
          if (!attributes.align || attributes.align === "center") {
            return {};
          }
          return { "data-media-align": attributes.align };
        },
      },
    };
  },
});

const SizedYoutube = Youtube.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      size: {
        default: "large",
        parseHTML: (element) =>
          element.getAttribute("data-media-size") ?? "large",
        renderHTML: (attributes) => ({
          "data-media-size": attributes.size,
        }),
      },
      align: {
        default: "center",
        parseHTML: (element) =>
          element.getAttribute("data-media-align") ?? "center",
        renderHTML: (attributes) => {
          if (!attributes.align || attributes.align === "center") {
            return {};
          }
          return { "data-media-align": attributes.align };
        },
      },
    };
  },
});

const TextAlignExtension = TiptapExtension.create({
  name: "textAlign",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element) => element.style.textAlign || null,
            renderHTML: (attributes) => {
              if (!attributes.textAlign) {
                return {};
              }
              return { style: `text-align: ${attributes.textAlign}` };
            },
          },
        },
      },
    ];
  },
});


type Tool = {
  key: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  persist?: boolean;
};

function positionsDiffer(
  a: {
    top: number;
    left: number;
    imgLeft?: number;
    imgRight?: number;
    bottom?: number;
  } | null,
  b: {
    top: number;
    left: number;
    imgLeft?: number;
    imgRight?: number;
    bottom?: number;
  } | null,
): boolean {
  if (!a || !b) {
    return a !== b;
  }
  return (
    Math.abs(a.top - b.top) >= 1 ||
    Math.abs(a.left - b.left) >= 1 ||
    Math.abs((a.imgLeft ?? 0) - (b.imgLeft ?? 0)) >= 1 ||
    Math.abs((a.imgRight ?? 0) - (b.imgRight ?? 0)) >= 1 ||
    Math.abs((a.bottom ?? 0) - (b.bottom ?? 0)) >= 1
  );
}

const MIN_MEDIA_WIDTH_PCT = 10;

function mediaPresetWidth(size: string | null | undefined): number {
  if (size === "small") {
    return 50;
  }
  if (size === "medium") {
    return 75;
  }
  return 100;
}

type MediaCorner = "tl" | "tr" | "bl" | "br";

function ResizeMediaHandle({
  editor,
  align,
  imgLeft,
  imgRight,
  top,
  bottom,
}: {
  editor: TiptapEditor;
  align: string;
  imgLeft: number;
  imgRight: number;
  top: number;
  bottom: number;
}) {
  const dragRef = useRef<{
    pointerId: number;
    side: "left" | "right";
    startWidth: number;
    containerWidth: number;
    viewLeft: number;
    containerLeft: number;
    containerRight: number;
    imgLeft: number;
    imgRight: number;
  } | null>(null);

  function currentWidthPct(node: { attrs: Record<string, unknown> }): number {
    const width = node.attrs.width as number | null | undefined;
    if (typeof width === "number" && Number.isFinite(width)) {
      return width;
    }
    return mediaPresetWidth(node.attrs.size as string | null | undefined);
  }

  function getDragState(): {
    startWidth: number;
    containerWidth: number;
    viewLeft: number;
    containerLeft: number;
    containerRight: number;
    imgLeft: number;
    imgRight: number;
  } | null {
    const selection = editor.state.selection;
    if (!isNodeSelection(selection)) {
      return null;
    }
    const dom = editor.view.nodeDOM(selection.from);
    if (!(dom instanceof HTMLElement)) {
      return null;
    }
    const domRect = dom.getBoundingClientRect();
    const parentRect = dom.parentElement?.getBoundingClientRect();
    const viewRect = editor.view.dom.getBoundingClientRect();
    const viewLeft = viewRect.left;
    const containerWidth = Math.max(
      1,
      parentRect?.width ?? editor.view.dom.clientWidth,
    );
    const containerLeft = (parentRect?.left ?? viewRect.left) - viewLeft;
    const containerRight = (parentRect?.right ?? viewRect.right) - viewLeft;
    return {
      startWidth: currentWidthPct(selection.node),
      containerWidth,
      viewLeft,
      containerLeft,
      containerRight,
      imgLeft: domRect.left - viewLeft,
      imgRight: domRect.right - viewLeft,
    };
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    side: "left" | "right",
  ) {
    event.preventDefault();
    event.stopPropagation();
    const state = getDragState();
    if (!state) {
      return;
    }
    dragRef.current = {
      pointerId: event.pointerId,
      side,
      ...state,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function clampWidth(value: number): number {
    return Math.round(
      Math.min(100, Math.max(MIN_MEDIA_WIDTH_PCT, value)),
    );
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    event.preventDefault();
    const pointerX = event.clientX - drag.viewLeft;
    let next: number;
    if (align === "center") {
      next =
        drag.side === "right"
          ? clampWidth(
              ((pointerX - drag.imgLeft) / drag.containerWidth) * 100,
            )
          : clampWidth(
              ((drag.imgRight - pointerX) / drag.containerWidth) * 100,
            );
    } else if (align === "left") {
      next = clampWidth(
        ((pointerX - drag.containerLeft) / drag.containerWidth) * 100,
      );
    } else {
      next = clampWidth(
        ((drag.containerRight - pointerX) / drag.containerWidth) * 100,
      );
    }
    if (next !== drag.startWidth) {
      drag.startWidth = next;
      editor.chain().focus().updateAttributes("image", { width: next }).run();
    }
  }

  function endDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (dragRef.current && dragRef.current.pointerId === event.pointerId) {
      dragRef.current = null;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // ignore
      }
    }
  }

  const corners: {
    corner: MediaCorner;
    side: "left" | "right";
    left: number;
    anchorTop: number;
  }[] = [
    { corner: "tl", side: "left", left: imgLeft, anchorTop: top },
    { corner: "tr", side: "right", left: imgRight, anchorTop: top },
    { corner: "bl", side: "left", left: imgLeft, anchorTop: bottom },
    { corner: "br", side: "right", left: imgRight, anchorTop: bottom },
  ];

  return (
    <>
      {corners.map(({ corner, side, left, anchorTop }) => {
        const isDiag =
          corner === "tl" || corner === "br" ? "nwse-resize" : "nesw-resize";
        return (
          <button
            key={corner}
            type="button"
            aria-label="Redimensionar imagem"
            title="Arraste para redimensionar a imagem"
            className="resize-handle"
            style={{ left, top: anchorTop, cursor: isDiag }}
            onPointerDown={(event) => handlePointerDown(event, side)}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
        );
      })}
    </>
  );
}

export function RichTextEditor({
  value,
  onChange,
  autofocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  autofocus?: boolean;
}) {
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [customColor, setCustomColor] = useState("");
  const [selectionAnchor, setSelectionAnchor] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [mediaAnchor, setMediaAnchor] = useState<{
    top: number;
    left: number;
    imgLeft: number;
    imgRight: number;
    bottom: number;
  } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [layoutSubmenu, setLayoutSubmenu] = useState<
    "columns" | "table" | null
  >(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const colorMenuOpenRef = useRef(false);
  const frameRef = useRef(0);
  const lastAnchorRef = useRef<{ top: number; left: number } | null>(null);
  const lastSelectionRef = useRef<{ top: number; left: number } | null>(null);
  const lastMediaRef = useRef<{
    top: number;
    left: number;
    imgLeft: number;
    imgRight: number;
    bottom: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  colorMenuOpenRef.current = colorMenuOpen;

  const editor = useEditor({
    immediatelyRender: false,
    autofocus,
    extensions: [
      StarterKit,
      TextAlignExtension,
      FontSizeMark,
      TextColorMark,
      Placeholder.configure({
        placeholder: "Conteudo",
        includeChildren: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      SizedImage.configure({
        allowBase64: false,
      }),
      SizedYoutube.configure({
        controls: true,
        nocookie: true,
      }),
      TableCellBackground,
      TableCell,
      TableHeader,
      TableRow,
      EditableTable,
      ColumnsExtension,
      ColumnExtension,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-72  border-white/10 px-4 py-4 text-slate-100 outline-none",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  const [, setVersion] = useState(0);

  const updateAnchor = useCallback(() => {
    if (!editor) {
      return;
    }

    if (!editor.view.hasFocus()) {
      // Keep the selection toolbar while the hex color input is focused.
      if (
        colorMenuOpenRef.current &&
        colorRef.current?.contains(document.activeElement)
      ) {
        return;
      }
      if (
        lastAnchorRef.current !== null ||
        lastSelectionRef.current !== null ||
        lastMediaRef.current !== null
      ) {
        lastAnchorRef.current = null;
        lastSelectionRef.current = null;
        lastMediaRef.current = null;
        setAnchor(null);
        setSelectionAnchor(null);
        setMediaAnchor(null);
      }
      return;
    }

    const rect = editor.view.dom.getBoundingClientRect();
    if (rect.width === 0) {
      return;
    }

    const { from, to } = editor.state.selection;

    if (isNodeSelection(editor.state.selection)) {
      if (lastAnchorRef.current !== null) {
        lastAnchorRef.current = null;
        setAnchor(null);
      }
      if (lastSelectionRef.current !== null) {
        lastSelectionRef.current = null;
        setSelectionAnchor(null);
      }

      const nodeTypeName = editor.state.selection.node.type.name;
      if (nodeTypeName !== "image" && nodeTypeName !== "youtube") {
        if (lastMediaRef.current !== null) {
          lastMediaRef.current = null;
          setMediaAnchor(null);
        }
        return;
      }

      const nodeDom = editor.view.nodeDOM(from);
      if (nodeDom instanceof HTMLElement) {
        const mediaRect = nodeDom.getBoundingClientRect();
        if (mediaRect.width > 0 || mediaRect.height > 0) {
          const next = {
            top: mediaRect.top - rect.top,
            left: Math.min(
              Math.max(
                mediaRect.left + mediaRect.width / 2 - rect.left,
                28,
              ),
              rect.width - 28,
            ),
            imgLeft: mediaRect.left - rect.left,
            imgRight: mediaRect.right - rect.left,
            bottom: mediaRect.bottom - rect.top,
          };
          if (positionsDiffer(next, lastMediaRef.current)) {
            lastMediaRef.current = next;
            setMediaAnchor(next);
          }
        }
      }
      return;
    }

    if (from !== to) {
      const domSelection = window.getSelection();
      const selectedText = editor.state.doc.textBetween(from, to, " ");
      if (
        domSelection &&
        !domSelection.isCollapsed &&
        domSelection.rangeCount > 0 &&
        editor.view.dom.contains(domSelection.anchorNode) &&
        selectedText.trim().length > 0
      ) {
        const selectionRect = domSelection
          .getRangeAt(0)
          .getBoundingClientRect();
        if (selectionRect.width > 0 || selectionRect.height > 0) {
          const next = {
            top: selectionRect.top - rect.top,
            left: Math.min(
              Math.max(
                selectionRect.left + selectionRect.width / 2 - rect.left,
                28,
              ),
              rect.width - 28,
            ),
          };
          if (positionsDiffer(next, lastSelectionRef.current)) {
            lastSelectionRef.current = next;
            setSelectionAnchor(next);
          }
        }
      } else if (lastSelectionRef.current !== null) {
        lastSelectionRef.current = null;
        setSelectionAnchor(null);
      }

      if (lastAnchorRef.current !== null) {
        lastAnchorRef.current = null;
        setAnchor(null);
      }
      return;
    }

    if (lastMediaRef.current !== null) {
      lastMediaRef.current = null;
      setMediaAnchor(null);
    }

    if (lastSelectionRef.current !== null) {
      lastSelectionRef.current = null;
      setSelectionAnchor(null);
    }

    const block = editor.state.doc.resolve(from).parent;
    if (!block.isTextblock || block.childCount > 0) {
      if (lastAnchorRef.current !== null) {
        lastAnchorRef.current = null;
        setAnchor(null);
      }
      return;
    }

    const coord = editor.view.coordsAtPos(from);
    if (!coord) {
      return;
    }

    const next = {
      top: (coord.top + coord.bottom) / 2 - rect.top,
      left: coord.left - rect.left - plusButtonLeftOffset,
    };
    if (positionsDiffer(next, lastAnchorRef.current)) {
      lastAnchorRef.current = next;
      setAnchor(next);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const schedule = () => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        updateAnchor();
        setVersion((v) => v + 1);
      });
    };

    const handleBlur = () => {
      schedule();
      // Defer so we can see if focus moved into the color picker input.
      requestAnimationFrame(() => {
        if (colorRef.current?.contains(document.activeElement)) {
          return;
        }
        setColorMenuOpen(false);
      });
    };

    editor.on("transaction", schedule);
    editor.on("selectionUpdate", schedule);
    editor.on("focus", schedule);
    editor.on("blur", handleBlur);
    updateAnchor();

    return () => {
      cancelAnimationFrame(frameRef.current);
      editor.off("transaction", schedule);
      editor.off("selectionUpdate", schedule);
      editor.off("focus", schedule);
      editor.off("blur", handleBlur);
    };
  }, [editor, updateAnchor]);

  useEffect(() => {
    if (!colorMenuOpen) {
      updateAnchor();
    }
  }, [colorMenuOpen, updateAnchor]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        floatingRef.current &&
        !floatingRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
        setLayoutSubmenu(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!colorMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        colorRef.current &&
        !colorRef.current.contains(event.target as Node)
      ) {
        setColorMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown);
  }, [colorMenuOpen]);

  function addImage() {
    const url = window.prompt("URL da imagem");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }

  function addYoutube() {
    const src = window.prompt("URL do video do YouTube");
    if (src) {
      editor
        ?.chain()
        .focus()
        .setYoutubeVideo({ src, width: 900, height: 506 })
        .run();
    }
  }

  function setLink() {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL do link", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }

  function getSelectionFontSize(): number {
    const current = editor?.getAttributes("fontSize").size as
      | string
      | undefined;
    const parsed = current ? Number.parseInt(current, 10) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : fontSizeConstants.base;
  }

  function changeFontSize(delta: number) {
    const next = Math.min(
      Math.max(
        getSelectionFontSize() + delta,
        fontSizeConstants.min,
      ),
      fontSizeConstants.max,
    );
    editor
      ?.chain()
      .focus()
      .setMark("fontSize", { size: `${next}px` })
      .run();
  }

  function applyTextColor(color: string) {
    if (color) {
      editor?.chain().focus().setMark("textColor", { color }).run();
    } else {
      editor?.chain().focus().unsetMark("textColor").run();
    }
    setColorMenuOpen(false);
  }

  function setMediaSize(size: string) {
    const selection = editor?.state.selection;
    if (!selection || !isNodeSelection(selection)) {
      return;
    }
    const nodeTypeName = selection.node.type.name;
    if (nodeTypeName !== "image" && nodeTypeName !== "youtube") {
      return;
    }
    editor
      ?.chain()
      .focus()
      .updateAttributes(nodeTypeName, { size, width: null })
      .run();
  }

  function setMediaAlign(align: string) {
    const selection = editor?.state.selection;
    if (!selection || !isNodeSelection(selection)) {
      return;
    }
    const nodeTypeName = selection.node.type.name;
    if (nodeTypeName !== "image" && nodeTypeName !== "youtube") {
      return;
    }
    editor?.chain().focus().updateAttributes(nodeTypeName, { align }).run();
  }

  function setTextAlign(align: string) {
    const $from = editor?.state.selection.$from;
    const block = $from?.parent;
    if (!block || !block.isTextblock) {
      return;
    }
    const typeName = block.type.name;
    if (typeName !== "paragraph" && typeName !== "heading") {
      return;
    }
    editor?.chain().focus().updateAttributes(typeName, { textAlign: align }).run();
  }

  function insertColumns(count: number) {
    if (!editor) {
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "columns",
        content: Array.from({ length: count }, () => ({
          type: "column",
          content: [{ type: "paragraph" }],
        })),
      })
      .run();
    setLayoutSubmenu(null);
    setMenuOpen(false);
  }

  function insertTable(count: number) {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: count, withHeaderRow: true })
      .run();
    setLayoutSubmenu(null);
    setMenuOpen(false);
  }

  const isBold = editor?.isActive("bold") ?? false;
  const isItalic = editor?.isActive("italic") ?? false;
  const isHeading = editor?.isActive("heading", { level: 2 }) ?? false;
  const isBulletList = editor?.isActive("bulletList") ?? false;
  const isOrderedList = editor?.isActive("orderedList") ?? false;
  const isBlockquote = editor?.isActive("blockquote") ?? false;
  const isLink = editor?.isActive("link") ?? false;

  const currentTextColor =
    typeof editor?.getAttributes("textColor").color === "string"
      ? (editor.getAttributes("textColor").color as string)
      : "";

  const currentTextAlign =
    editor && editor.state.selection.$from?.parent
      ? ((editor.state.selection.$from.parent.attrs.textAlign as
          | string
          | undefined) ??
        null)
      : null;

  const textAlignTools: Tool[] = editor
    ? [
        {
          key: "alignLeft",
          icon: <AlignLeft size={18} />,
          label: "Alinhar texto a esquerda",
          active: currentTextAlign === "left",
          persist: true,
          onClick: () => setTextAlign("left"),
        },
        {
          key: "alignCenter",
          icon: <AlignCenter size={18} />,
          label: "Alinhar texto ao centro",
          active: currentTextAlign === "center",
          persist: true,
          onClick: () => setTextAlign("center"),
        },
        {
          key: "alignRight",
          icon: <AlignRight size={18} />,
          label: "Alinhar texto a direita",
          active: currentTextAlign === "right",
          persist: true,
          onClick: () => setTextAlign("right"),
        },
        {
          key: "alignJustify",
          icon: <AlignJustify size={18} />,
          label: "Justificar texto",
          active: currentTextAlign === "justify",
          persist: true,
          onClick: () => setTextAlign("justify"),
        },
      ]
    : [];

  const textGroup: Tool[] = editor
    ? [
        {
          key: "bold",
          icon: <Bold size={18} />,
          label: "Negrito (Ctrl+B)",
          active: isBold,
          persist: true,
          onClick: () => editor.chain().focus().toggleBold().run(),
        },
        {
          key: "italic",
          icon: <Italic size={18} />,
          label: "Italico (Ctrl+I)",
          active: isItalic,
          persist: true,
          onClick: () => editor.chain().focus().toggleItalic().run(),
        },
        {
          key: "heading",
          icon: <Heading2 size={18} />,
          label: "Subtitulo",
          active: isHeading,
          persist: true,
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
      ]
    : [];

  const blockGroup: Tool[] = editor
    ? [
        {
          key: "bullet",
          icon: <List size={18} />,
          label: "Lista",
          active: isBulletList,
          persist: true,
          onClick: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
          key: "ordered",
          icon: <ListOrdered size={18} />,
          label: "Lista numerada",
          active: isOrderedList,
          persist: true,
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
          key: "quote",
          icon: <Quote size={18} />,
          label: "Citacao",
          active: isBlockquote,
          persist: true,
          onClick: () => editor.chain().focus().toggleBlockquote().run(),
        },
        ...textAlignTools,
      ]
    : [];

  const mediaGroup: Tool[] = editor
    ? [
        {
          key: "link",
          icon: <LinkIcon size={18} />,
          label: "Link",
          active: isLink,
          onClick: setLink,
        },
        {
          key: "image",
          icon: <ImagePlus size={18} />,
          label: "Imagem",
          onClick: addImage,
        },
        {
          key: "youtube",
          icon: <PlaySquare size={18} />,
          label: "Video",
          onClick: addYoutube,
        },
      ]
    : [];

  const layoutGroup: Tool[] = editor
    ? [
        {
          key: "columns",
          icon: <Columns3 size={18} />,
          label: "Colunas (sem divisao de linhas)",
          active: layoutSubmenu === "columns",
          persist: true,
          onClick: () =>
            setLayoutSubmenu((submenu) =>
              submenu === "columns" ? null : "columns",
            ),
        },
        {
          key: "table",
          icon: <Table2 size={18} />,
          label: "Tabela (com divisao de linhas)",
          active: layoutSubmenu === "table",
          persist: true,
          onClick: () =>
            setLayoutSubmenu((submenu) => (submenu === "table" ? null : "table")),
        },
      ]
    : [];

  const toolGroups = [textGroup, blockGroup, mediaGroup, layoutGroup];

  const wordTools: Tool[] = editor
    ? [
        {
          key: "bold",
          icon: <Bold size={18} />,
          label: "Negrito (Ctrl+B)",
          active: isBold,
          persist: true,
          onClick: () => editor.chain().focus().toggleBold().run(),
        },
        {
          key: "italic",
          icon: <Italic size={18} />,
          label: "Italico (Ctrl+I)",
          active: isItalic,
          persist: true,
          onClick: () => editor.chain().focus().toggleItalic().run(),
        },
        ...textAlignTools,
        {
          key: "fontSizeUp",
          icon: (
            <span
              aria-hidden="true"
              className="text-xl font-black leading-none"
            >
              T
            </span>
          ),
          label: "Aumentar texto",
          persist: true,
          onClick: () => changeFontSize(fontSizeConstants.step),
        },
        {
          key: "fontSizeDown",
          icon: (
            <span
              aria-hidden="true"
              className="text-xs font-black leading-none"
            >
              T
            </span>
          ),
          label: "Diminuir texto",
          persist: true,
          onClick: () => changeFontSize(-fontSizeConstants.step),
        },
        {
          key: "link",
          icon: <LinkIcon size={18} />,
          label: "Link",
          active: isLink,
          onClick: setLink,
        },
      ]
    : [];

  const selectedMediaSize =
    editor && isNodeSelection(editor.state.selection)
      ? ((editor.state.selection.node.attrs.size as string | undefined) ??
        "large")
      : "large";

  const selectedMediaAlign =
    editor && isNodeSelection(editor.state.selection)
      ? ((editor.state.selection.node.attrs.align as string | undefined) ??
        "center")
      : "center";

  const selectedMediaType =
    editor && isNodeSelection(editor.state.selection)
      ? editor.state.selection.node.type.name
      : "";

  const mediaAlignTools: Tool[] = editor
    ? [
        {
          key: "alignLeft",
          icon: <AlignLeft size={18} />,
          label: "Alinhar a esquerda",
          active: selectedMediaAlign === "left",
          persist: true,
          onClick: () => setMediaAlign("left"),
        },
        {
          key: "alignCenter",
          icon: <AlignCenter size={18} />,
          label: "Alinhar ao centro",
          active: selectedMediaAlign === "center",
          persist: true,
          onClick: () => setMediaAlign("center"),
        },
        {
          key: "alignRight",
          icon: <AlignRight size={18} />,
          label: "Alinhar a direita",
          active: selectedMediaAlign === "right",
          persist: true,
          onClick: () => setMediaAlign("right"),
        },
      ]
    : [];

  const mediaSizeTools: Tool[] = editor
    ? [
        {
          key: "small",
          icon: <MediaSizeSmall />,
          label: "Tamanho pequeno",
          active: selectedMediaSize === "small",
          persist: true,
          onClick: () => setMediaSize("small"),
        },
        {
          key: "medium",
          icon: <MediaSizeMedium />,
          label: "Tamanho medio",
          active: selectedMediaSize === "medium",
          persist: true,
          onClick: () => setMediaSize("medium"),
        },
        {
          key: "large",
          icon: <MediaSizeLarge />,
          label: "Tamanho grande",
          active: selectedMediaSize === "large",
          persist: true,
          onClick: () => setMediaSize("large"),
        },
      ]
    : [];

  function runTool(tool: Tool) {
    tool.onClick();
    if (!tool.persist) {
      setMenuOpen(false);
    }
  }

  return (
    <div ref={rootRef}>
      <div className="relative">
        <EditorContent
          editor={editor}
          className="post-content editor-content"
        />

        {anchor && editor ? (
          <div
            ref={floatingRef}
            className="pointer-events-none absolute z-30 transition-[top,left] duration-150 ease-out"
            style={{ top: anchor.top, left: anchor.left }}
          >
            <div className="relative h-0 w-0">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() =>
                  setMenuOpen((open) => {
                    const next = !open;
                    if (!next) {
                      setLayoutSubmenu(null);
                    }
                    return next;
                  })
                }
                aria-label={
                  menuOpen ? "Fechar ferramentas" : "Abrir ferramentas"
                }
                aria-expanded={menuOpen}
                title="Ferramentas de formatacao"
                className="toolbar-pop pointer-events-auto absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white p-1.5 text-white transition hover:border-[#f2f2f2] hover:text-[#f2f2f2]"
              >
                <Plus
                  size={24}
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${
                    menuOpen ? "rotate-45" : ""
                  }`}
                />
              </button>

              {menuOpen ? (
                <div
                  className="toolbar-pop-right pointer-events-auto absolute left-6 top-0 flex -translate-y-1/2 items-center gap-0.5"
                  onMouseDown={(event) => event.preventDefault()}
                >
                  {toolGroups.map((group, groupIndex) => (
                    <Fragment key={groupIndex}>
                      {groupIndex > 0 ? (
                        <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />
                      ) : null}
                      {group.length > 0
                        ? group.map((tool) => (
                            <button
                              key={tool.key}
                              type="button"
                              title={tool.label}
                              aria-pressed={tool.active ?? false}
                              className={`${buttonClass} ${
                                tool.active ? activeButtonClass : ""
                              }`}
                              onClick={() => runTool(tool)}
                            >
                              {tool.icon}
                            </button>
                          ))
                        : null}
                    </Fragment>
                  ))}
                </div>
              ) : null}

              {layoutSubmenu ? (
                <div
                  className="toolbar-pop pointer-events-auto absolute left-0 top-full z-50 mt-3 w-56 rounded-2xl border border-white/10 bg-[#262625] p-3 shadow-xl shadow-black/60"
                  onMouseDown={(event) => event.preventDefault()}
                >
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.15em] text-sky-300">
                    {layoutSubmenu === "columns" ? "Colunas" : "Tabela"}
                  </p>
                  <p className="-mt-1 mb-2 text-[11px] text-slate-400">
                    {layoutSubmenu === "columns"
                      ? "Divide a largura do post lado a lado"
                      : "Com divisao de linhas"}
                  </p>
                  <div
                    className={
                      layoutSubmenu === "columns"
                        ? "grid grid-cols-3 gap-1.5"
                        : "grid grid-cols-2 gap-1.5"
                    }
                  >
                    {(layoutSubmenu === "columns"
                      ? [1, 2, 3, 4, 5]
                      : [2, 3, 4, 5]
                    ).map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() =>
                          layoutSubmenu === "columns"
                            ? insertColumns(count)
                            : insertTable(count)
                        }
                        className="flex h-14 flex-col items-stretch justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-white transition hover:border-sky-300/60 hover:bg-sky-400 hover:text-slate-950"
                      >
                        {layoutSubmenu === "columns" ? (
                          <>
                            <span
                              aria-hidden="true"
                              className="flex h-5 w-full gap-0.5"
                            >
                              {Array.from({ length: count }, (_, index) => (
                                <span
                                  key={index}
                                  className="h-full flex-1 rounded-[3px] border border-current/35 bg-current/15"
                                />
                              ))}
                            </span>
                            <span className="text-center text-[11px] font-bold leading-none">
                              {count}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold">{count} colunas</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {selectionAnchor && editor ? (
          <WordToolbar
            top={selectionAnchor.top}
            left={selectionAnchor.left}
            tools={wordTools}
            onAction={runTool}
            extra={
              <div ref={colorRef} className="relative">
                <button
                  type="button"
                  title="Cor do texto"
                  aria-pressed={!!currentTextColor}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setColorMenuOpen((open) => {
                    if (!open) {
                      setCustomColor("");
                    }
                    return !open;
                  })}
                  className={`${buttonClass} ${
                    currentTextColor ? activeButtonClass : ""
                  }`}
                >
                  <span className="relative flex h-full w-full items-end justify-center pb-1.5">
                    <span
                      aria-hidden="true"
                      className="text-lg font-black leading-none text-current"
                    >
                      A
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-1.5 bottom-0.5 h-[3px] rounded-full"
                      style={{ background: currentTextColor || "#9ca3af" }}
                    />
                  </span>
                </button>

                {colorMenuOpen ? (
                  <div
                    className="toolbar-pop absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#262625] p-2 shadow-xl shadow-black/60"
                    onMouseDown={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest("input, textarea, select")) {
                        return;
                      }
                      event.preventDefault();
                    }}
                  >
                    <div className="grid w-44 grid-cols-5 gap-1.5">
                      <button
                        type="button"
                        title="Sem cor (padrao)"
                        aria-label="Sem cor (padrao)"
                        onClick={() => applyTextColor("")}
                        className="relative grid size-7 place-items-center rounded-full border border-white/20 bg-white/10 transition hover:scale-110"
                      >
                        <span className="absolute h-[2px] w-4 rotate-45 rounded bg-white/80" />
                      </button>
                      {textColorSwatches.map((swatch) => (
                        <button
                          key={swatch.value}
                          type="button"
                          title={swatch.name}
                          aria-label={swatch.name}
                          onClick={() => applyTextColor(swatch.value)}
                          className="size-7 rounded-full border border-white/20 transition hover:scale-110"
                          style={{ background: swatch.value }}
                        />
                      ))}
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 border-t border-white/10 pt-2">
                      <input
                        type="text"
                        value={customColor}
                        onChange={(event) => {
                          let next = event.target.value.trimStart();
                          if (next && !next.startsWith("#")) {
                            next = `#${next}`;
                          }
                          setCustomColor(next);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            if (normalizeHex(customColor)) {
                              applyTextColor(normalizeHex(customColor));
                            }
                          }
                        }}
                        placeholder="#00ffcc (hex)"
                        spellCheck={false}
                        autoComplete="off"
                        aria-label="Cor personalizada em hexadecimal"
                        className="h-7 min-w-0 flex-1 rounded-md border border-white/10 bg-slate-950/70 px-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-sky-300"
                      />
                      <button
                        type="button"
                        title="Aplicar cor"
                        aria-label="Aplicar cor"
                        onClick={() => {
                          if (normalizeHex(customColor)) {
                            applyTextColor(normalizeHex(customColor));
                          }
                        }}
                        disabled={!normalizeHex(customColor)}
                        className="h-7 rounded-md px-2.5 text-xs font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                        style={{
                          background:
                            normalizeHex(customColor) || "#9ca3af",
                        }}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            }
          />
        ) : null}

        {mediaAnchor && editor ? (
          <WordToolbar
            top={mediaAnchor.top}
            left={mediaAnchor.left}
            tools={[...mediaAlignTools, ...mediaSizeTools]}
            onAction={runTool}
          />
        ) : null}

        {mediaAnchor && editor && selectedMediaType === "image" ? (
          <ResizeMediaHandle
            editor={editor}
            align={selectedMediaAlign}
            imgLeft={mediaAnchor.imgLeft}
            imgRight={mediaAnchor.imgRight}
            top={mediaAnchor.top}
            bottom={mediaAnchor.bottom}
          />
        ) : null}
      </div>
    </div>
  );
}
