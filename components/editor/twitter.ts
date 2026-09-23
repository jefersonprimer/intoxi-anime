import { Node, mergeAttributes } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { extractTweetId, renderTweetEmbed } from "@/lib/twitter-widgets";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    twitter: {
      setTwitter: (options: { src: string }) => ReturnType;
    };
  }
}

const TWEET_URL_RE =
  /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/(?:#!\/)?\w+\/status(?:es)?\/(\d+)/i;

export function extractTweetUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const hrefMatch = /href=["']([^"']+)["']/i.exec(trimmed);
  const candidate = hrefMatch?.[1] ?? trimmed;
  const match = TWEET_URL_RE.exec(candidate);
  if (!match) {
    return null;
  }

  return `https://x.com/i/status/${match[1]}`;
}

export function looksLikeTwitterEmbed(value: string): boolean {
  return (
    /twitter-tweet/i.test(value) ||
    /platform\.(?:twitter|x)\.com\/widgets\.js/i.test(value) ||
    TWEET_URL_RE.test(value)
  );
}

function mountTweetPreview(container: HTMLElement, src: string) {
  const mount = document.createElement("div");
  mount.className = "twitter-embed-mount";
  container.replaceChildren(mount);

  const fallback = document.createElement("a");
  fallback.href = src || "#";
  fallback.target = "_blank";
  fallback.rel = "noopener noreferrer";
  fallback.className = "twitter-embed-editor__link";
  fallback.textContent = "Carregando post do X...";
  mount.append(fallback);

  if (!src || !extractTweetId(src)) {
    fallback.textContent = src || "URL do tweet";
    return;
  }

  void renderTweetEmbed(mount, src, { theme: "dark" }).then((widget) => {
    if (!widget) {
      mount.replaceChildren(fallback);
      fallback.textContent = src;
    }
  });
}

export const Twitter = Node.create({
  name: "twitter",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  priority: 1000,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => {
          if (element instanceof HTMLElement) {
            const dataSrc = element.getAttribute("data-twitter-src");
            if (dataSrc) {
              return extractTweetUrl(dataSrc) ?? dataSrc;
            }
            const link = element.querySelector(
              'a[href*="/status/"], a[href*="/statuses/"]',
            );
            const href = link?.getAttribute("href");
            if (href) {
              return extractTweetUrl(href) ?? href;
            }
          }
          return null;
        },
        renderHTML: (attributes) => {
          if (!attributes.src) {
            return {};
          }
          return { "data-twitter-src": attributes.src };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "blockquote.twitter-tweet",
      },
      {
        tag: 'blockquote[class*="twitter-tweet"]',
      },
      {
        tag: "div.twitter-embed",
      },
      {
        tag: "div[data-twitter-src]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = String(
      HTMLAttributes.src ?? HTMLAttributes["data-twitter-src"] ?? "",
    );
    const tweetId = extractTweetId(src);
    const attrs = mergeAttributes(HTMLAttributes, {
      class: "twitter-tweet",
      "data-theme": "dark",
      "data-twitter-src": src || undefined,
      "data-tweet-id": tweetId || undefined,
    });
    delete attrs.src;

    return [
      "blockquote",
      attrs,
      src
        ? [
            "a",
            { href: src, target: "_blank", rel: "noopener noreferrer" },
            src,
          ]
        : ["span", {}, "Tweet"],
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const src = String(node.attrs.src ?? "");
      const dom = document.createElement("div");
      dom.className = "twitter-embed-editor";
      dom.contentEditable = "false";
      dom.dataset.twitterSrc = src;

      mountTweetPreview(dom, src);

      return {
        dom,
        ignoreMutation: () => true,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "twitter") {
            return false;
          }
          const nextSrc = String(updatedNode.attrs.src ?? "");
          if (dom.dataset.twitterSrc === nextSrc) {
            return true;
          }
          dom.dataset.twitterSrc = nextSrc;
          mountTweetPreview(dom, nextSrc);
          return true;
        },
        destroy: () => {
          dom.replaceChildren();
        },
      };
    };
  },

  addCommands() {
    return {
      setTwitter:
        (options) =>
        ({ commands }) => {
          const src = extractTweetUrl(options.src);
          if (!src) {
            return false;
          }
          return commands.insertContent({
            type: this.name,
            attrs: { src },
          });
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const text =
              event.clipboardData?.getData("text/html") ||
              event.clipboardData?.getData("text/plain") ||
              "";
            if (!looksLikeTwitterEmbed(text)) {
              return false;
            }
            const src = extractTweetUrl(text);
            if (!src) {
              return false;
            }
            const type = view.state.schema.nodes.twitter;
            if (!type) {
              return false;
            }
            const node = type.create({ src });
            const transaction = view.state.tr.replaceSelectionWith(node);
            view.dispatch(transaction.scrollIntoView());
            return true;
          },
        },
      }),
    ];
  },
});
