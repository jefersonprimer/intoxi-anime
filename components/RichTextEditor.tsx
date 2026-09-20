"use client";

import { WordToolbar } from "@/components/WordToolbar";
import { MediaSizeLarge } from "@/components/icons/MediaSizeLarge";
import { MediaSizeMedium } from "@/components/icons/MediaSizeMedium";
import { MediaSizeSmall } from "@/components/icons/MediaSizeSmall";
import {
  isNodeSelection,
  Mark as TiptapMark,
  mergeAttributes,
  Node as TiptapNode,
} from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import {
  EditorContent,
  NodeViewProps,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Columns2,
  Heading2,
  ImagePlus,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  PlaySquare,
  Plus,
  Quote,
  Trash2,
} from "lucide-react";
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

const buttonClass =
  "grid size-9 place-items-center rounded-full border border-[#1e73be] text-[#1e73be] transition hover:border-sky-300/50 hover:bg-sky-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40";
const activeButtonClass = "border-sky-300/60 bg-sky-400 !text-slate-950";
const smallInputClass =
  "h-10 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300";
const plusButtonLeftOffset = 24;

const fontSizeConstants = {
  base: 22,
  step: 2,
  min: 12,
  max: 48,
};

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
    };
  },
});



type DataField = {
  label: string;
  value: string;
};

type DataLink = {
  label: string;
  url: string;
};

type ImageDataBlockAttrs = {
  imageUrl: string;
  title: string;
  details: string;
  href: string;
  dataFields: string;
  links: string;
};

const IMAGE_DATA_EDIT_EVENT = "intoxi:edit-image-data-block";

function parseDataFields(value: string): DataField[] {
  try {
    const fields = JSON.parse(value) as DataField[];
    return Array.isArray(fields) ? fields : [];
  } catch {
    return [];
  }
}

function parseDataLinks(value: string): DataLink[] {
  try {
    const links = JSON.parse(value) as DataLink[];
    return Array.isArray(links) ? links : [];
  } catch {
    return [];
  }
}

function ImageDataBlockView(props: NodeViewProps) {
  const { node, selected } = props;
  const attrs = node.attrs as unknown as ImageDataBlockAttrs;
  let fields = parseDataFields(attrs.dataFields);
  if (fields.length === 0 && attrs.details) {
    fields = [{ label: "Informação", value: attrs.details }];
  }
  const links = parseDataLinks(attrs.links);

  function handleEdit(event: ReactMouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    let pos = -1;
    try {
      pos = props.getPos() ?? -1;
    } catch {
      pos = -1;
    }
    event.currentTarget.dispatchEvent(
      new CustomEvent(IMAGE_DATA_EDIT_EVENT, {
        bubbles: true,
        detail: { attrs, pos },
      }),
    );
  }

  function preventDefault(event: ReactMouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <NodeViewWrapper className="image-data-block-view" contentEditable={false}>
      <div
        className={`image-data-block ${
          selected ? "image-data-block--selected" : ""
        }`}
      >
        {attrs.imageUrl ? (
          <figure className="image-data-block__media">
            <img src={attrs.imageUrl} alt={attrs.title} />
          </figure>
        ) : null}
        <div className="image-data-block__content">
          {attrs.title ? <h3>{attrs.title}</h3> : null}
          {fields.length > 0 ? (
            <dl className="image-data-block__fields">
              {fields.map((field, index) => (
                <Fragment key={index}>
                  <dt>{field.label}</dt>
                  <dd>{field.value}</dd>
                </Fragment>
              ))}
            </dl>
          ) : null}
          {links.length > 0 ? (
            <div className="image-data-block__links">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={preventDefault}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
          {attrs.href ? (
            <a
              href={attrs.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={preventDefault}
            >
              Abrir referencia
            </a>
          ) : null}
        </div>
      </div>
      <div className="image-data-block-view__controls">
        <button type="button" onClick={handleEdit}>
          Editar
        </button>
      </div>
    </NodeViewWrapper>
  );
}

type Tool = {
  key: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  persist?: boolean;
};

function positionsDiffer(
  a: { top: number; left: number } | null,
  b: { top: number; left: number } | null,
): boolean {
  if (!a || !b) {
    return a !== b;
  }
  return Math.abs(a.top - b.top) >= 1 || Math.abs(a.left - b.left) >= 1;
}

const ImageDataBlock = TiptapNode.create({
  name: "imageDataBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      imageUrl: {
        default: "",
        parseHTML: (element) =>
          element.getAttribute("imageUrl") ?? element.getAttribute("imageurl"),
      },
      title: { default: "" },
      details: { default: "" },
      href: { default: "" },
      dataFields: {
        default: "[]",
        parseHTML: (element) =>
          element.getAttribute("dataFields") ??
          element.getAttribute("datafields"),
      },
      links: { default: "[]" },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageDataBlockView);
  },

  parseHTML() {
    return [{ tag: "section[data-type='image-data-block']" }];
  },

  renderHTML({ HTMLAttributes }) {
    const href = String(HTMLAttributes.href ?? "");
    const title = String(HTMLAttributes.title ?? "");
    let dataFields: DataField[] = [];

    try {
      dataFields = JSON.parse(
        String(HTMLAttributes.dataFields ?? "[]"),
      ) as DataField[];
    } catch {
      dataFields = [];
    }

    if (dataFields.length === 0 && HTMLAttributes.details) {
      dataFields = [
        { label: "Informação", value: String(HTMLAttributes.details) },
      ];
    }

    let links: DataLink[] = [];

    try {
      links = JSON.parse(String(HTMLAttributes.links ?? "[]")) as DataLink[];
    } catch {
      links = [];
    }

    return [
      "section",
      mergeAttributes(HTMLAttributes, {
        class: "image-data-block",
        "data-type": "image-data-block",
      }),
      [
        "figure",
        { class: "image-data-block__media" },
        [
          "img",
          {
            src: HTMLAttributes.imageUrl,
            alt: title,
          },
        ],
      ],
      [
        "div",
        { class: "image-data-block__content" },
        ["h3", {}, title],
        [
          "dl",
          { class: "image-data-block__fields" },
          ...dataFields.flatMap((field) => [
            ["dt", {}, field.label],
            ["dd", {}, field.value],
          ]),
        ],
        ...(links.length > 0
          ? [
              [
                "div",
                { class: "image-data-block__links" },
                ...links.map((link) => [
                  "a",
                  {
                    href: link.url,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    class: "image-data-block__link",
                  },
                  link.label,
                ]),
              ],
            ]
          : []),
        href
          ? [
              "a",
              {
                href,
                target: "_blank",
                rel: "noopener noreferrer",
              },
              "Abrir referencia",
            ]
          : ["span", { class: "image-data-block__empty" }, ""],
      ],
    ];
  },
});

export function RichTextEditor({
  value,
  onChange,
  autofocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  autofocus?: boolean;
}) {
  const [isAddingImageData, setIsAddingImageData] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageDataTitle, setImageDataTitle] = useState("");
  const [imageDataHref, setImageDataHref] = useState("");
  const [dataFields, setDataFields] = useState<DataField[]>([
    { label: "", value: "" },
  ]);
  const [dataLinks, setDataLinks] = useState<DataLink[]>([
    { label: "", url: "" },
  ]);
  const [editingTarget, setEditingTarget] = useState<{ pos: number } | null>(
    null,
  );

  const resetForm = useCallback(() => {
    setEditingTarget(null);
    setImageDataUrl("");
    setImageDataTitle("");
    setImageDataHref("");
    setDataFields([{ label: "", value: "" }]);
    setDataLinks([{ label: "", url: "" }]);
  }, []);

  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [selectionAnchor, setSelectionAnchor] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [mediaAnchor, setMediaAnchor] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [panelTop, setPanelTop] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const editHandlerRef = useRef<
    (attrs: ImageDataBlockAttrs, pos: number) => void
  >(() => {});
  const floatingRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const lastAnchorRef = useRef<{ top: number; left: number } | null>(null);
  const lastSelectionRef = useRef<{ top: number; left: number } | null>(null);
  const lastMediaRef = useRef<{ top: number; left: number } | null>(null);
  const insertPosRef = useRef(1);
  const rootRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    autofocus,
    extensions: [
      StarterKit,
      ImageDataBlock,
      FontSizeMark,
      Placeholder.configure({
        placeholder: "Conteudo",
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
    insertPosRef.current = from;

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

    editor.on("transaction", schedule);
    editor.on("selectionUpdate", schedule);
    editor.on("focus", schedule);
    editor.on("blur", schedule);
    updateAnchor();

    return () => {
      cancelAnimationFrame(frameRef.current);
      editor.off("transaction", schedule);
      editor.off("selectionUpdate", schedule);
      editor.off("focus", schedule);
      editor.off("blur", schedule);
    };
  }, [editor, updateAnchor]);

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
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    function handleEditEvent(event: Event) {
      const custom = event as CustomEvent<{
        attrs: ImageDataBlockAttrs;
        pos: number;
      }>;
      if (!custom.detail) {
        return;
      }
      editHandlerRef.current(custom.detail.attrs, custom.detail.pos);
    }

    root.addEventListener(IMAGE_DATA_EDIT_EVENT, handleEditEvent);
    return () =>
      root.removeEventListener(IMAGE_DATA_EDIT_EVENT, handleEditEvent);
  }, []);

  function addImage() {
    const url = window.prompt("URL da imagem");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }

  function startEditingNode(attrs: ImageDataBlockAttrs, pos: number) {
    setEditingTarget(pos >= 0 ? { pos } : null);
    setImageDataUrl(attrs.imageUrl);
    setImageDataTitle(attrs.title);
    setImageDataHref(attrs.href);
    const fields = parseDataFields(attrs.dataFields);
    setDataFields(fields.length > 0 ? fields : [{ label: "", value: "" }]);
    const links = parseDataLinks(attrs.links);
    setDataLinks(links.length > 0 ? links : [{ label: "", url: "" }]);

    if (editor && pos >= 0) {
      const rect = editor.view.dom.getBoundingClientRect();
      const coord = editor.view.coordsAtPos(pos);
      setPanelTop(coord ? (coord.top + coord.bottom) / 2 - rect.top + 14 : 0);
    }

    setIsAddingImageData(true);
  }

  useEffect(() => {
    editHandlerRef.current = startEditingNode;
  });

  function updateImageDataBlock(attrs: ImageDataBlockAttrs, pos: number) {
    let applied = false;
    editor?.commands.command(({ tr, state, dispatch }) => {
      const node = state.doc.nodeAt(pos);
      if (!node || node.type.name !== "imageDataBlock") {
        return false;
      }
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs });
      if (dispatch) {
        dispatch(tr);
      }
      applied = true;
      return true;
    });
    return applied;
  }

  function insertImageDataBlock() {
    if (!imageDataUrl.trim() || !imageDataTitle.trim()) {
      return;
    }

    const validFields = dataFields.filter(
      (field) => field.label.trim() || field.value.trim(),
    );
    const validLinks = dataLinks.filter(
      (link) => link.label.trim() && link.url.trim(),
    );
    const attrs = {
      imageUrl: imageDataUrl.trim(),
      title: imageDataTitle.trim(),
      details: validFields
        .map((field) => `${field.label}: ${field.value}`)
        .join("\n"),
      href: imageDataHref.trim(),
      dataFields: JSON.stringify(validFields),
      links: JSON.stringify(validLinks),
    };

    const target = editingTarget;
    if (target) {
      if (!updateImageDataBlock(attrs, target.pos)) {
        return;
      }
    } else {
      editor
        ?.chain()
        .focus()
        .insertContentAt(insertPosRef.current, {
          type: "imageDataBlock",
          attrs,
        })
        .run();
    }

    resetForm();
    setIsAddingImageData(false);
    editor?.commands.focus();
  }

  function updateDataField(index: number, key: keyof DataField, value: string) {
    setDataFields((current) =>
      current.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, [key]: value } : field,
      ),
    );
  }

  function updateDataLink(index: number, key: keyof DataLink, value: string) {
    setDataLinks((current) =>
      current.map((link, linkIndex) =>
        linkIndex === index ? { ...link, [key]: value } : link,
      ),
    );
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

  function setMediaSize(size: string) {
    const selection = editor?.state.selection;
    if (!selection || !isNodeSelection(selection)) {
      return;
    }
    const nodeTypeName = selection.node.type.name;
    if (nodeTypeName !== "image" && nodeTypeName !== "youtube") {
      return;
    }
    editor?.chain().focus().updateAttributes(nodeTypeName, { size }).run();
  }

  const isBold = editor?.isActive("bold") ?? false;
  const isItalic = editor?.isActive("italic") ?? false;
  const isHeading = editor?.isActive("heading", { level: 2 }) ?? false;
  const isBulletList = editor?.isActive("bulletList") ?? false;
  const isOrderedList = editor?.isActive("orderedList") ?? false;
  const isBlockquote = editor?.isActive("blockquote") ?? false;
  const isLink = editor?.isActive("link") ?? false;

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
          key: "imageData",
          icon: <Columns2 size={18} />,
          label: "Imagem + dados",
          active: isAddingImageData,
          onClick: () => {
            insertPosRef.current = editor.state.selection.from;
            setPanelTop(anchor ? anchor.top + 14 : 0);
            if (isAddingImageData) {
              resetForm();
              setIsAddingImageData(false);
            } else {
              resetForm();
              setIsAddingImageData(true);
            }
          },
        },
        {
          key: "youtube",
          icon: <PlaySquare size={18} />,
          label: "Video",
          onClick: addYoutube,
        },
      ]
    : [];

  const toolGroups = [textGroup, blockGroup, mediaGroup];

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

        {isAddingImageData && editor ? (
          <div
            className="absolute inset-x-0 z-40 max-h-[min(70vh,30rem)] space-y-4 overflow-y-auto rounded-lg border border-white/10 bg-[#0b1328]/95 p-4 shadow-2xl shadow-black/60 backdrop-blur-md"
            style={{ top: panelTop }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={imageDataUrl}
                onChange={(event) => setImageDataUrl(event.target.value)}
                className={smallInputClass}
                placeholder="URL da imagem"
                aria-label="URL da imagem do bloco"
              />
              <input
                value={imageDataTitle}
                onChange={(event) => setImageDataTitle(event.target.value)}
                className={smallInputClass}
                placeholder="Título dos dados"
                aria-label="Título dos dados"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-300">
                  Campos da coluna direita
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setDataFields((current) => [
                      ...current,
                      { label: "", value: "" },
                    ])
                  }
                  className="inline-flex items-center gap-1 rounded-md border border-sky-300/30 px-2 py-1 text-xs font-bold text-sky-200 transition hover:bg-sky-400 hover:text-slate-950"
                >
                  <Plus size={14} aria-hidden="true" />
                  Adicionar campo
                </button>
              </div>
              {dataFields.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={field.label}
                    onChange={(event) =>
                      updateDataField(index, "label", event.target.value)
                    }
                    className={smallInputClass}
                    placeholder="Nome (ex.: Estúdio)"
                    aria-label={`Nome do campo ${index + 1}`}
                  />
                  <input
                    value={field.value}
                    onChange={(event) =>
                      updateDataField(index, "value", event.target.value)
                    }
                    className={smallInputClass}
                    placeholder="Valor (ex.: MAPPA)"
                    aria-label={`Valor do campo ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDataFields((current) =>
                        current.filter((_, fieldIndex) => fieldIndex !== index),
                      )
                    }
                    className="grid size-10 shrink-0 place-items-center rounded-md border border-red-300/20 text-red-200 transition hover:bg-red-400 hover:text-slate-950"
                    aria-label={`Remover campo ${index + 1}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-300">
                  Links (nome + url)
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setDataLinks((current) => [
                      ...current,
                      { label: "", url: "" },
                    ])
                  }
                  className="inline-flex items-center gap-1 rounded-md border border-sky-300/30 px-2 py-1 text-xs font-bold text-sky-200 transition hover:bg-sky-400 hover:text-slate-950"
                >
                  <Plus size={14} aria-hidden="true" />
                  Adicionar link
                </button>
              </div>
              {dataLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={link.label}
                    onChange={(event) =>
                      updateDataLink(index, "label", event.target.value)
                    }
                    className={smallInputClass}
                    placeholder="Nome (ex.: MAL)"
                    aria-label={`Nome do link ${index + 1}`}
                  />
                  <input
                    value={link.url}
                    onChange={(event) =>
                      updateDataLink(index, "url", event.target.value)
                    }
                    className={smallInputClass}
                    placeholder="URL (ex.: https://myanimelist.net/anime/1)"
                    aria-label={`URL do link ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDataLinks((current) =>
                        current.filter((_, linkIndex) => linkIndex !== index),
                      )
                    }
                    className="grid size-10 shrink-0 place-items-center rounded-md border border-red-300/20 text-red-200 transition hover:bg-red-400 hover:text-slate-950"
                    aria-label={`Remover link ${index + 1}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <input
              value={imageDataHref}
              onChange={(event) => setImageDataHref(event.target.value)}
              className={smallInputClass}
              placeholder="Link opcional de referência"
              aria-label="Link opcional de referência"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsAddingImageData(false);
                }}
                className="rounded-md px-3 py-2 text-sm font-bold text-slate-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={insertImageDataBlock}
                disabled={!imageDataUrl.trim() || !imageDataTitle.trim()}
                className="rounded-md bg-sky-400 px-3 py-2 text-sm font-black text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {editingTarget ? "Atualizar bloco" : "Inserir bloco"}
              </button>
            </div>
          </div>
        ) : null}

        {!isAddingImageData && anchor && editor ? (
          <div
            ref={floatingRef}
            className="pointer-events-none absolute z-30 transition-[top,left] duration-150 ease-out"
            style={{ top: anchor.top, left: anchor.left }}
          >
            <div className="relative h-0 w-0">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setMenuOpen((open) => !open)}
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
                      {group.map((tool) => (
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
                      ))}
                    </Fragment>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {!isAddingImageData && selectionAnchor && editor ? (
          <WordToolbar
            top={selectionAnchor.top}
            left={selectionAnchor.left}
            tools={wordTools}
            onAction={runTool}
          />
        ) : null}

        {!isAddingImageData && mediaAnchor && editor ? (
          <WordToolbar
            top={mediaAnchor.top}
            left={mediaAnchor.left}
            tools={mediaSizeTools}
            onAction={runTool}
          />
        ) : null}
      </div>
    </div>
  );
}
