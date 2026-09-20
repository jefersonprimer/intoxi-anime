"use client";

import type { ReactNode } from "react";

const buttonClass =
  "grid size-8 place-items-center rounded-full text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40";
const activeButtonClass = "!bg-white !text-slate-950";

export type WordTool = {
  key: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
};

export function WordToolbar({
  top,
  left,
  tools,
  onAction,
}: {
  top: number;
  left: number;
  tools: WordTool[];
  onAction: (tool: WordTool) => void;
}) {
  if (tools.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-full pb-2"
      style={{ top, left }}
    >
      <div
        className="toolbar-pop pointer-events-auto flex items-center gap-1 rounded-full bg-[#262625] p-1.5 shadow-xl shadow-black/60"
        onMouseDown={(event) => event.preventDefault()}
      >
        {tools.map((tool) => (
          <button
            key={tool.key}
            type="button"
            title={tool.label}
            aria-pressed={tool.active ?? false}
            onClick={() => onAction(tool)}
            className={`${buttonClass} ${tool.active ? activeButtonClass : ""}`}
          >
            {tool.icon}
          </button>
        ))}
      </div>
    </div>
  );
}