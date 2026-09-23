"use client";

import { useEffect } from "react";
import { hydrateTwitterEmbeds } from "@/lib/twitter-widgets";

export function TwitterWidgets({
  rootSelector = ".post-content",
}: {
  rootSelector?: string;
}) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(rootSelector);
    if (!root) {
      return;
    }

    let cancelled = false;

    hydrateTwitterEmbeds(root).catch(() => {
      if (!cancelled) {
        // Keep the plain blockquote/link fallback if widgets fail.
      }
    });

    return () => {
      cancelled = true;
    };
  }, [rootSelector]);

  return null;
}
