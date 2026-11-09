// Builds the brand background patterns in public/images/patterns/.
// Run: node scripts/patterns.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const out = path.resolve(import.meta.dirname, "../public/images/patterns");
await mkdir(out, { recursive: true });
const r2 = (n) => Math.round(n * 100) / 100;

// Lusona (Chokwe sand drawing): one continuous line that runs diagonally
// between an m x n grid of dots and loops around the edge dots where it
// meets the frame. gcd(m, n) = 1 gives a single closed line.
function lusona(m, n, u) {
  const W = 2 * m;
  const H = 2 * n;
  let p = [0, 1];
  let d = [1, 1];
  const turns = [{ p: [...p], din: [-1, 1], dout: [1, 1] }];
  for (let guard = 0; guard < 10000; guard++) {
    p = [p[0] + d[0], p[1] + d[1]];
    const din = [...d];
    if (p[0] === 0 || p[0] === W) d[0] = -d[0];
    if (p[1] === 0 || p[1] === H) d[1] = -d[1];
    if (d[0] !== din[0] || d[1] !== din[1]) {
      if (p[0] === 0 && p[1] === 1 && d[0] === 1 && d[1] === 1) break;
      turns.push({ p: [...p], din, dout: [...d] });
    }
  }
  const pad = 1.6;
  const X = (v) => r2((v + pad) * u);
  const pt = (q) => `${X(q[0])} ${X(q[1])}`;
  // Each turn is a round loop around the edge dot: A -> apex just outside the frame -> B.
  const reach = 0.55;
  const pull = 0.38;
  const half = 0.5;
  let dpath = "";
  turns.forEach((t, i) => {
    const flipX = t.din[0] !== t.dout[0];
    const out = [flipX ? t.din[0] : 0, flipX ? 0 : t.din[1]];
    const tan = [flipX ? 0 : t.din[0], flipX ? t.din[1] : 0];
    const a = [t.p[0] - t.din[0] * half, t.p[1] - t.din[1] * half];
    const b = [t.p[0] + t.dout[0] * half, t.p[1] + t.dout[1] * half];
    const apex = [t.p[0] + out[0] * reach, t.p[1] + out[1] * reach];
    const c1 = [a[0] + t.din[0] * pull, a[1] + t.din[1] * pull];
    const c2 = [apex[0] - tan[0] * pull, apex[1] - tan[1] * pull];
    const c3 = [apex[0] + tan[0] * pull, apex[1] + tan[1] * pull];
    const c4 = [b[0] - t.dout[0] * pull, b[1] - t.dout[1] * pull];
    dpath += `${i === 0 ? "M" : "L"}${pt(a)}C${pt(c1)} ${pt(c2)} ${pt(apex)}C${pt(c3)} ${pt(c4)} ${pt(b)}`;
  });
  dpath += "Z";
  let dots = "";
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) dots += `<circle cx="${X(2 * i + 1)}" cy="${X(2 * j + 1)}" r="${r2(u * 0.16)}"/>`;
  const size = [X(W + pad), X(H + pad)];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size[0]}" height="${size[1]}" viewBox="0 0 ${size[0]} ${size[1]}"><path d="${dpath}" fill="none" stroke="#fff" stroke-opacity=".11" stroke-width="${r2(u * 0.09)}" stroke-linecap="round" stroke-linejoin="round"/><g fill="#fff" fill-opacity=".2">${dots}</g></svg>`;
}
await writeFile(path.join(out, "lusona.svg"), lusona(7, 5, 40));
console.log("patterns: lusona");
