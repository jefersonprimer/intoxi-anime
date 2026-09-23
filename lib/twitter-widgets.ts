const WIDGETS_SRC = "https://platform.x.com/widgets.js";
const WIDGETS_SCRIPT_ID = "twitter-wjs";

type TwitterWidgetsApi = {
  createTweet: (
    tweetId: string,
    element: HTMLElement,
    options?: Record<string, unknown>,
  ) => Promise<HTMLElement | undefined>;
  load: (element?: HTMLElement | null) => void;
};

type TwitterReadyApi = {
  widgets: TwitterWidgetsApi;
  ready: (callback: (twttr: TwitterReadyApi) => void) => void;
  _e?: Array<(twttr: TwitterReadyApi) => void>;
};

declare global {
  interface Window {
    twttr?: TwitterReadyApi;
  }
}

const TWEET_ID_RE =
  /(?:twitter|x)\.com\/(?:#!\/)?(?:\w+\/)?status(?:es)?\/(\d+)/i;

export function extractTweetId(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const match = TWEET_ID_RE.exec(value);
  return match?.[1] ?? null;
}

function ensureTwitterStub() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.twttr?.ready) {
    return;
  }

  const queue: Array<(twttr: TwitterReadyApi) => void> = [];
  window.twttr = {
    _e: queue,
    ready(callback) {
      queue.push(callback);
    },
    widgets: undefined as unknown as TwitterWidgetsApi,
  };
}

export function loadTwitterWidgets(): Promise<TwitterReadyApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Twitter widgets require a browser."));
  }

  ensureTwitterStub();

  return new Promise((resolve, reject) => {
    if (window.twttr?.widgets?.createTweet) {
      resolve(window.twttr);
      return;
    }

    window.twttr?.ready((api) => {
      if (api.widgets?.createTweet) {
        resolve(api);
      }
    });

    if (document.getElementById(WIDGETS_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement("script");
    script.id = WIDGETS_SCRIPT_ID;
    script.src = WIDGETS_SRC;
    script.async = true;
    script.charset = "utf-8";
    script.onerror = () =>
      reject(new Error("Failed to load X/Twitter widgets."));
    document.body.appendChild(script);
  });
}

export async function renderTweetEmbed(
  container: HTMLElement,
  src: string,
  options?: { theme?: "light" | "dark" },
) {
  const tweetId = extractTweetId(src);
  if (!tweetId) {
    return null;
  }

  container.replaceChildren();
  container.dataset.tweetId = tweetId;
  container.dataset.twitterSrc = src;
  container.classList.add("twitter-embed-mount");

  const twttr = await loadTwitterWidgets();
  const widget = await twttr.widgets.createTweet(tweetId, container, {
    theme: options?.theme ?? "dark",
    align: "center",
    dnt: true,
    conversation: "none",
  });

  return widget ?? null;
}

export async function hydrateTwitterEmbeds(root: HTMLElement) {
  const embeds = [
    ...root.querySelectorAll<HTMLElement>(
      ".twitter-tweet[data-twitter-src], .twitter-embed[data-twitter-src], blockquote.twitter-tweet",
    ),
  ];

  if (embeds.length === 0) {
    return;
  }

  await loadTwitterWidgets();

  await Promise.all(
    embeds.map(async (element) => {
      if (element.dataset.twitterHydrated === "1") {
        return;
      }

      const src =
        element.getAttribute("data-twitter-src") ||
        element.querySelector("a[href*='/status/']")?.getAttribute("href") ||
        "";
      const tweetId = extractTweetId(src);
      if (!tweetId) {
        return;
      }

      element.dataset.twitterHydrated = "1";

      const mount = document.createElement("div");
      mount.className = "twitter-embed-mount";
      element.replaceWith(mount);

      await renderTweetEmbed(mount, src, { theme: "dark" });
    }),
  );
}
