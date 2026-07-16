import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Howl, Howler } from "howler";
import { SOUNDS, type SoundKey } from "@/audio/sounds";

interface AudioContextValue {
  /** True once the browser audio context has been unlocked by a user gesture. */
  unlocked: boolean;
  /** True when the user has muted all audio. */
  muted: boolean;
  toggleMute: () => void;
  /** Play a registered sound by key. No-op until unlocked / asset exists. */
  play: (key: SoundKey) => void;
  stop: (key: SoundKey) => void;
}

export const AudioContext = createContext<AudioContextValue | null>(null);

/**
 * Provides audio playback via Howler. The Web Audio context can only start
 * after a user gesture, so we unlock on the FIRST pointer/key/touch event
 * (event-driven — no polling) and then detach the listeners.
 */
export function AudioProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const howls = useRef<Map<SoundKey, Howl>>(new Map<SoundKey, Howl>());

  // Lazily build (and cache) a Howl for a given key.
  const getHowl = useCallback((key: SoundKey): Howl | undefined => {
    const existing = howls.current.get(key);
    if (existing) return existing;

    const def = SOUNDS[key];
    if (!def) return undefined;

    const howl = new Howl({
      src: def.src,
      loop: def.loop ?? false,
      volume: def.volume ?? 1,
      preload: def.preload ?? true,
    });
    howls.current.set(key, howl);
    return howl;
  }, []);

  // Unlock on first user gesture, then remove the listeners.
  useEffect(() => {
    if (unlocked) return;

    const unlock = () => {
      // Howler resumes its AudioContext internally on interaction; we mirror
      // that in React state so the UI can react (hide the "enter" gate, etc.).
      if (Howler.ctx && Howler.ctx.state !== "running") {
        void Howler.ctx.resume();
      }
      setUnlocked(true);
    };

    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "touchstart",
    ];
    events.forEach((e) => window.addEventListener(e, unlock, { once: true }));

    return () => {
      events.forEach((e) => window.removeEventListener(e, unlock));
    };
  }, [unlocked]);

  // Reflect mute state into Howler globally.
  useEffect(() => {
    Howler.mute(muted);
  }, [muted]);

  // Clean up all loaded sounds on unmount.
  useEffect(() => {
    const loaded = howls.current;
    return () => {
      loaded.forEach((h) => h.unload());
      loaded.clear();
    };
  }, []);

  const value = useMemo<AudioContextValue>(
    () => ({
      unlocked,
      muted,
      toggleMute: () => setMuted((m) => !m),
      play: (key) => {
        if (!unlocked) return;
        getHowl(key)?.play();
      },
      stop: (key) => {
        getHowl(key)?.stop();
      },
    }),
    [unlocked, muted, getHowl],
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}
