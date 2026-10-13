// Twenty Sides storefront drawings: every product picture is drawn here as SVG markup.
// Loaded after data.js and before app.js; app.js calls art() to draw products and the logo.

// ===== Product art =====
// Every product picture is an inline SVG drawn from simple polygons on a 120 x 120 canvas,
// so the page needs no image files. The helpers below build SVG markup as strings.

// Point at radius r and angle deg (0 = right, -90 = straight up) around center (cx, cy).
// Used to place the corners of regular shapes such as the d20's hexagon outline.
const pt = (r, deg, cx = 60, cy = 60) => {
  const a = deg * Math.PI / 180;
  return [+(cx + r * Math.cos(a)).toFixed(1), +(cy + r * Math.sin(a)).toFixed(1)];
};
// A filled polygon with a rounded-join outline. pts is an array of [x, y] pairs.
const poly = (pts, fill, stroke) => `<polygon points="${pts.map(p => p.join(",")).join(" ")}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>`;
// Centered text, used for the number on a die's front face.
const label = (txt, x, y, ink, size = 16) => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="IBM Plex Mono, monospace" font-weight="500" font-size="${size}" fill="${ink}">${txt}</text>`;

// Returns the SVG markup (no outer <svg> tag) for one drawing.
// Dice are drawn as a dark outline shape with lighter facets on top, which reads as 3D.
function art(kind, [lt, base, dk, ink]) {
  const s = dk; // outline color
  // d20: hexagon silhouette with a front triangle; the facets join the triangle to the hexagon corners.
  if (kind === "d20") {
    const P = [-90, -30, 30, 90, 150, 210].map(d => pt(48, d));
    const T = [-90, 30, 150].map(d => pt(26, d));
    return poly(P, base, s)
      + poly([P[0], P[1], T[0]], lt, s) + poly([P[1], P[2], T[1]], dk, s)
      + poly([P[3], P[4], T[2]], dk, s) + poly([P[5], P[0], T[0]], lt, s)
      + poly(T, lt, s) + label("20", 60, 64, ink, 15);
  }
  // d12: ten-sided outline with a front pentagon and five surrounding faces.
  if (kind === "d12") {
    const O = Array.from({ length: 10 }, (_, k) => pt(48, -90 + 36 * k));
    const I = Array.from({ length: 5 }, (_, k) => pt(28, -90 + 72 * k));
    let out = poly(O, base, s);
    for (let k = 0; k < 5; k++) {
      const a = I[k], b = I[(k + 1) % 5];
      out += poly([a, O[2 * k], O[2 * k + 1], O[(2 * k + 2) % 10], b], k < 2 || k === 4 ? lt : dk, s);
    }
    return out + poly(I, lt, s) + label("12", 60, 62, ink, 15);
  }
  // d10: kite shape with a front kite face and four side facets.
  if (kind === "d10") {
    const top = [60, 10], r = [104, 56], bot = [60, 110], l = [16, 56];
    const il = [36, 64], ir = [84, 64], ic = [60, 76];
    return poly([top, r, bot, l], base, s)
      + poly([top, ir, ic, il], lt, s)
      + poly([l, il, ic, bot], dk, s) + poly([r, ir, ic, bot], base, s)
      + poly([top, l, il], base, s) + poly([top, r, ir], dk, s)
      + label("0", 60, 52, ink, 16);
  }
  // d8: diamond outline with an upward front triangle and a downward one beneath it.
  if (kind === "d8") {
    const top = [60, 12], r = [100, 64], bot = [60, 108], l = [20, 64];
    const a = [30, 74], b = [90, 74];
    return poly([top, r, bot, l], dk, s)
      + poly([top, b, a], lt, s) + poly([a, b, bot], base, s)
      + poly([top, a, l], base, s) + poly([top, r, b], dk, s)
      + label("8", 60, 58, ink, 18);
  }
  // d6: isometric cube (top, left and right faces) with pips on two faces.
  if (kind === "d6") {
    const P = [-90, -30, 30, 90, 150, 210].map(d => pt(46, d)), C = [60, 60];
    const pip = (x, y) => `<circle cx="${x}" cy="${y}" r="4" fill="${ink}"/>`;
    return poly([P[0], P[1], C, P[5]], lt, s) + poly([P[5], C, P[3], P[4]], base, s) + poly([C, P[1], P[2], P[3]], dk, s)
      + pip(60, 37) + pip(46, 37) + pip(74, 37)
      + pip(32, 72) + pip(44, 86);
  }
  // d4: triangle split into three facets that meet at an off-center point.
  if (kind === "d4") {
    const A = [60, 12], B = [106, 98], Cc = [14, 98], M = [60, 74];
    return poly([A, B, Cc], base, s) + poly([A, M, Cc], lt, s) + poly([A, B, M], dk, s) + poly([Cc, M, B], base, s)
      + label("4", 46, 64, ink, 16);
  }
  // Accessories. Trays reuse art("d20") scaled down to show a die sitting in them.
  if (kind === "tray") {
    const O = [-90, -30, 30, 90, 150, 210].map(d => pt(50, d, 60, 64));
    const I = [-90, -30, 30, 90, 150, 210].map(d => pt(40, d, 60, 64));
    return poly(O.map(([x, y]) => [x, y - 6]), lt, s) + poly(O, base, s) + poly(I, ink, s)
      + `<g transform="translate(60 64) scale(.32) translate(-60 -60)">${art("d20", ["#F6A25E","#E0662F","#9C3A17","#FFF4E8"])}</g>`;
  }
  if (kind === "fold") {
    return poly([[14, 40], [106, 40], [96, 98], [24, 98]], base, s)
      + poly([[24, 50], [96, 50], [90, 90], [30, 90]], ink, s)
      + poly([[14, 40], [24, 50], [30, 90], [24, 98]], lt, s)
      + `<circle cx="60" cy="34" r="4" fill="${lt}" stroke="${s}" stroke-width="1.5"/>`
      + `<g transform="translate(72 70) scale(.26) translate(-60 -60)">${art("d20", ["#DCF0F8","#9CCBE2","#5A93B5","#0E3A55"])}</g>`;
  }
  if (kind === "tower") {
    return poly([[32, 10], [88, 10], [88, 92], [32, 92]], base, s)
      + poly([[32, 10], [88, 10], [82, 18], [38, 18]], lt, s)
      + poly([[38, 30], [76, 40], [76, 46], [38, 36]], dk, s)
      + poly([[82, 54], [44, 64], [44, 70], [82, 60]], dk, s)
      + poly([[44, 76], [64, 92], [44, 92]], dk, s)
      + poly([[14, 92], [106, 92], [106, 110], [14, 110]], base, s)
      + poly([[20, 96], [100, 96], [100, 106], [20, 106]], ink, s);
  }
  if (kind === "bag") {
    return `<path d="M38 36 C24 54 20 74 26 92 C32 108 88 108 94 92 C100 74 96 54 82 36 Z" fill="${base}" stroke="${s}" stroke-width="1.5"/>`
      + `<path d="M38 36 Q60 26 82 36 L80 42 Q60 34 40 42 Z" fill="${lt}" stroke="${s}" stroke-width="1.5"/>`
      + `<path d="M46 24 Q60 30 74 22" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`
      + `<path d="M60 38 L60 22" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`
      + `<path d="M34 70 Q60 78 86 70" fill="none" stroke="${dk}" stroke-width="1.5" stroke-dasharray="4 4"/>`;
  }
  if (kind === "vault") {
    const O = [-90, -30, 30, 90, 150, 210].map(d => pt(46, d, 60, 66));
    const L = [-90, -30, 30, 90, 150, 210].map(d => pt(46, d, 60, 50));
    return poly([O[1], O[2], O[3], O[4], O[5], L[5], L[4], L[3], L[2], L[1]], dk, s)
      + poly(L, base, s)
      + poly([-90, -30, 30, 90, 150, 210].map(d => pt(22, d, 60, 50)), lt, s)
      + `<circle cx="60" cy="50" r="5" fill="${ink}"/>`;
  }
  if (kind === "screen") {
    return poly([[8, 30], [36, 24], [36, 96], [8, 90]], lt, s)
      + poly([[36, 24], [60, 30], [60, 98], [36, 96]], base, s)
      + poly([[60, 30], [84, 24], [84, 96], [60, 98]], lt, s)
      + poly([[84, 24], [112, 30], [112, 90], [84, 96]], base, s)
      + `<path d="M14 42 L30 39 M14 50 L30 47 M14 58 L26 56 M66 40 L78 37 M66 48 L78 45 M66 56 L74 54" stroke="${dk}" stroke-width="2" stroke-linecap="round"/>`
      + `<circle cx="98" cy="58" r="8" fill="${ink}"/>`;
  }
  if (kind === "tracker") {
    let out = poly([[10, 28], [110, 28], [110, 92], [10, 92]], lt, s);
    const cols = [ink, base, base, ink, base, base, dk, base];
    cols.forEach((c, k) => {
      const x = 24 + (k % 4) * 24, y = 46 + Math.floor(k / 4) * 28;
      out += `<circle cx="${x}" cy="${y}" r="9" fill="${c}" stroke="${s}" stroke-width="1.5"/>` + label(k + 1, x, y, "#fff", 9);
    });
    return out;
  }
  return ""; // unknown kind: draw nothing
}
