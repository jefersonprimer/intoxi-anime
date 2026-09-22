"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ColumnsExtension, ColumnExtension } from "@/components/editor/columns";

export default function ColTestPage() {
  const editor = useEditor({
    extensions: [StarterKit, ColumnsExtension, ColumnExtension],
    content: {
      type: "doc",
      content: [
        {
          type: "columns",
          content: [
            {
              type: "column",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "ESQUERDA" }],
                },
              ],
            },
            { type: "column", content: [{ type: "paragraph" }] },
          ],
        },
      ],
    },
  });

  return (
    <div style={{ padding: 40, background: "#1E1E1E", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#fff", marginBottom: 16 }}>
        Colunas — teste digitar na coluna direita vazia
      </h2>
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
