/** The film and the song pause each other: whoever starts playing announces it here. */
const EVENT = "cplp-media-play";

export function announcePlay(id: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: id }));
}

export function onOtherPlay(id: string, pause: () => void) {
  const listener = (e: Event) => {
    if ((e as CustomEvent<string>).detail !== id) pause();
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
