"use client";

import { Fragment, type ReactNode } from "react";

const buttonClass =
  "grid size-8 place-items-center rounded-full text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40";
const activeButtonClass = "!bg-[#1e73be] !text-white";

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
  extra,
}: {
  top: number;
  left: number;
  tools: WordTool[];
  onAction: (tool: WordTool) => void;
  extra?: ReactNode;
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
        className="toolbar-pop pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-surface p-1.5 shadow-xl shadow-black/20"
        onMouseDown={(event) => {
          const target = event.target as HTMLElement;
          // Allow focus/paste in form fields (e.g. custom hex color).
          if (target.closest("input, textarea, select")) {
            return;
          }
          event.preventDefault();
        }}
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
        {extra ? (
          <Fragment>
            <span className="mx-1 h-6 w-px bg-border" />
            {extra}
          </Fragment>
        ) : null}
      </div>
    </div>
  );
}
