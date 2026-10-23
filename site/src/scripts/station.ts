import { station } from "../config";

const OFFLINE = "Offline — coming soon";
const THEME_KEY = "devradio-theme";

type Song = {
  text?: string;
  artist?: string;
  title?: string;
};

type NowPlayingResponse = {
  is_online?: boolean;
  now_playing?: { song?: Song };
};

function songLabel(data: NowPlayingResponse): string {
  const song = data.now_playing?.song;
  if (!song) return "";
  if (typeof song.text === "string" && song.text.trim()) return song.text.trim();
  const artist = typeof song.artist === "string" ? song.artist.trim() : "";
  const title = typeof song.title === "string" ? song.title.trim() : "";
  return [artist, title].filter(Boolean).join(" — ");
}

function startTheme(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-theme-value]");
  const apply = (theme: string) => {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--theme-color")
      .trim();
    if (meta && color) meta.content = color;
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.themeValue === theme ? "true" : "false");
    });
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* Storage can be blocked. The attribute still applies for this view. */
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const next = button.dataset.themeValue;
      if (next) apply(next);
    });
  });

  apply(document.documentElement.getAttribute("data-theme") || "tokyo");
}

function startPlayer(): void {
  const status = document.querySelector<HTMLElement>("#now-playing");
  const statusText = document.querySelector<HTMLElement>("#now-playing-text");
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-play]"));
  if (!status || !statusText || buttons.length === 0) return;

  const audio = new Audio();
  audio.preload = "none";
  audio.src = station.streamUrl;

  let playing = false;
  let title = "";
  let mountFailed = false;

  const render = () => {
    const text = playing ? title || "Live" : mountFailed || !title ? OFFLINE : title;
    statusText.textContent = text;
    status.dataset.state = text === OFFLINE ? "offline" : playing ? "live" : "idle";
    buttons.forEach((button) => {
      const slot = button.querySelector<HTMLElement>("[data-play-label]");
      const playLabel = button.dataset.labelPlay ?? "Play";
      const stopLabel = button.dataset.labelStop ?? "Stop";
      button.setAttribute("aria-pressed", playing ? "true" : "false");
      button.classList.toggle("is-playing", playing);
      if (button.classList.contains("play")) {
        button.setAttribute("aria-label", playing ? "Stop the live stream" : "Play the live stream");
      }
      if (slot) slot.textContent = playing ? stopLabel : playLabel;
    });
  };

  const failMount = () => {
    playing = false;
    mountFailed = true;
    audio.pause();
    render();
  };

  const toggle = async () => {
    if (playing) {
      audio.pause();
      playing = false;
      mountFailed = false;
      render();
      return;
    }
    mountFailed = false;
    render();
    try {
      await audio.play();
    } catch {
      failMount();
    }
  };

  audio.addEventListener("playing", () => {
    playing = true;
    mountFailed = false;
    render();
  });
  audio.addEventListener("pause", () => {
    if (!mountFailed) playing = false;
    render();
  });
  audio.addEventListener("error", () => {
    failMount();
  });

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      void toggle();
    });
  });

  const pullNowPlaying = async () => {
    const url = station.nowPlayingUrl.trim();
    if (!url) {
      title = "";
      render();
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        title = "";
        render();
        return;
      }
      const data = (await response.json()) as NowPlayingResponse;
      if (data.is_online === false) {
        title = "";
        render();
        return;
      }
      title = songLabel(data);
      render();
    } catch {
      title = "";
      render();
    } finally {
      window.clearTimeout(timer);
    }
  };

  render();
  void pullNowPlaying();
  window.setInterval(() => {
    if (document.visibilityState === "visible") void pullNowPlaying();
  }, 30000);
}

export function boot(): void {
  startTheme();
  startPlayer();
}
