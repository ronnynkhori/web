import { MOTION_STORAGE_KEY, THEME_STORAGE_KEY } from "./storage-keys";

/**
 * Runs synchronously in <head> before first paint:
 *  - html.js           enables reveal initial states (no-JS gets the static page)
 *  - data-motion       single reduced-motion switch (OS setting or stored toggle)
 *  - data-theme        stored theme
 *  - data-review       ?review=1 shows content markers for client review
 *  - html.hero-seen    skip the hero sequence on repeat visits in the same session
 */
export const bootScript = `(function(){try{var d=document.documentElement;d.classList.add("js");var m=localStorage.getItem("${MOTION_STORAGE_KEY}");if(m!=="reduce"&&m!=="full"){m=window.matchMedia("(prefers-reduced-motion: reduce)").matches?"reduce":"full"}d.dataset.motion=m;var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")d.dataset.theme=t;if(/[?&]review=1/.test(location.search))d.dataset.review="";if(sessionStorage.getItem("m26-hero-seen"))d.classList.add("hero-seen");else sessionStorage.setItem("m26-hero-seen","1")}catch(e){}})();`;
