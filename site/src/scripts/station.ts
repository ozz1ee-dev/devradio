import { station } from "../config";

const OFFLINE = "Offline — coming soon";
const THEME_KEY = "devradio-theme";
const VOLUME_KEY = "devradio-volume";
const DEFAULT_VOLUME = 0.8;
const VOLUME_STEP = 0.05;

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

function clampVolume(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function readVolume(): number {
  try {
    const stored = localStorage.getItem(VOLUME_KEY);
    if (stored === null) return DEFAULT_VOLUME;
    const parsed = Number.parseFloat(stored);
    return Number.isFinite(parsed) ? clampVolume(parsed) : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
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

  const volumeControls = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-volume-control]"),
  );

  let volume = readVolume();
  audio.volume = volume;
  let lastDragEnd = 0;

  let playing = false;
  let title = "";
  let mountFailed = false;

  const volumeLabel = () => `${Math.round(volume * 100)}%`;

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
        button.setAttribute(
          "aria-label",
          `${playing ? "Stop" : "Play"} the live stream. Volume ${volumeLabel()}. Use the arrow keys to change it.`,
        );
      }
      if (slot) slot.textContent = playing ? stopLabel : playLabel;
    });
  };

  const paintVolume = (): void => {
    volumeControls.forEach((control) => {
      control.style.setProperty("--volume", volume.toFixed(3));
      control.title = `Volume ${volumeLabel()}. Scroll or drag to change.`;
    });
  };

  const persistVolume = (): void => {
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {
      /* Storage can be blocked. The level still applies for this view. */
    }
  };

  const setVolume = (next: number): void => {
    volume = clampVolume(next);
    audio.volume = volume;
    paintVolume();
    render();
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
      if (performance.now() - lastDragEnd < 400) return;
      void toggle();
    });
  });

  volumeControls.forEach((control) => {
    control.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const step = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? VOLUME_STEP * 3 : VOLUME_STEP;
        setVolume(volume + (event.deltaY < 0 ? step : -step));
        persistVolume();
      },
      { passive: false },
    );

    control.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp" || event.key === "ArrowRight") {
        event.preventDefault();
        setVolume(volume + VOLUME_STEP);
        persistVolume();
      } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
        event.preventDefault();
        setVolume(volume - VOLUME_STEP);
        persistVolume();
      } else if (event.key === "Home") {
        event.preventDefault();
        setVolume(0);
        persistVolume();
      } else if (event.key === "End") {
        event.preventDefault();
        setVolume(1);
        persistVolume();
      }
    });

    let pointerId: number | null = null;
    let startX = 0;
    let startVolume = 0;
    let dragging = false;

    control.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startVolume = volume;
      dragging = false;
      control.setPointerCapture(event.pointerId);
    });

    control.addEventListener("pointermove", (event) => {
      if (pointerId !== event.pointerId) return;
      const dx = event.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < 5) return;
        dragging = true;
        control.classList.add("is-adjusting");
      }
      event.preventDefault();
      const span = Math.max(120, control.getBoundingClientRect().width);
      setVolume(startVolume + dx / span);
    });

    const endDrag = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;
      pointerId = null;
      if (control.hasPointerCapture(event.pointerId)) {
        control.releasePointerCapture(event.pointerId);
      }
      if (dragging) {
        lastDragEnd = performance.now();
        persistVolume();
      }
      dragging = false;
      control.classList.remove("is-adjusting");
    };

    control.addEventListener("pointerup", endDrag);
    control.addEventListener("pointercancel", endDrag);
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

  paintVolume();
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
