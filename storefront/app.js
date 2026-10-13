// Twenty Sides storefront behavior: catalog, product art, cart and rendering.
// Loaded at the end of index.html, after the containers it fills exist. See README.md for an overview.

// Everything is wrapped in an arrow function that runs immediately, so none of these
// names leak into the global scope.
(() => {
  // ===== Store settings =====
  const FREE_SHIP = 50;  // subtotal (USD) at which shipping becomes free
  const SHIP_FEE = 5;    // flat shipping fee (USD) below that threshold

  // Filter categories, in the order the chips appear. "all" is a special case meaning no filter.
  const CATS = [
    { id: "all", label: "All" },
    { id: "sets", label: "Dice sets" },
    { id: "singles", label: "Single dice" },
    { id: "trays", label: "Trays & towers" },
    { id: "storage", label: "Bags & storage" },
    { id: "gm", label: "GM gear" },
  ];
  // ===== Product catalog =====
  // Each product has:
  //   id     unique key; also the key used in the saved cart
  //   name   display name
  //   cat    category id from CATS above
  //   price  price in USD
  //   spec   short spec line shown under the name (piece count, size, material)
  //   art    which drawing art() should use: d4, d6, d8, d10, d12, d20, tray, fold,
  //          tower, bag, vault, screen or tracker
  //   pal    four colors for the drawing: [light face, base face, dark face/outline, ink].
  //          "ink" is used for numerals, pips and accent details.
  //   roll   optional. Adds a test-roll button: 20 rolls a d20, 100 rolls d%,
  //          "4d6" rolls four d6 and keeps the highest three (a character stat roll).
  //   badge  optional corner label; low: true colors it as a scarcity warning.
  // The array order is the "Featured" sort order.
  const PRODUCTS = [
    { id: "ember", name: "Ember Resin Set", cat: "sets", price: 24, spec: "7 pcs · 16 mm · swirl resin", art: "d20", pal: ["#F6A25E","#E0662F","#9C3A17","#FFF4E8"], roll: 20, badge: "Bestseller" },
    { id: "glacier", name: "Glacier Glass Set", cat: "sets", price: 42, spec: "7 pcs · 16 mm · K9 glass", art: "d12", pal: ["#DCF0F8","#9CCBE2","#5A93B5","#0E3A55"], roll: 20 },
    { id: "obsidian", name: "Obsidian Metal Set", cat: "sets", price: 49, spec: "7 pcs · 16 mm · zinc alloy", art: "d20", pal: ["#73777F","#41444B","#1E2024","#E3C77A"], roll: 20 },
    { id: "moss", name: "Moss Agate Set", cat: "sets", price: 89, spec: "7 pcs · 16 mm · natural stone", art: "d10", pal: ["#C3D7AE","#86A472","#4B6440","#F6F3E8"], roll: 20, badge: "Only 3 left", low: true },
    { id: "bone", name: "Bone & Ink Set", cat: "sets", price: 12, spec: "7 pcs · 16 mm · acrylic", art: "d8", pal: ["#FFFFFF","#E9E5DC","#B9B2A3","#1A1A1A"], roll: 20 },
    { id: "nebula", name: "Nebula Sharp-Edge Set", cat: "sets", price: 36, spec: "7 pcs · 16 mm · sharp-edge resin", art: "d4", pal: ["#97D9D3","#5F6FCC","#33307A","#FFFFFF"], roll: 20, badge: "New" },
    { id: "big-d20", name: "Oversized d20", cat: "singles", price: 12, spec: "1 pc · 32 mm · resin", art: "d20", pal: ["#F19196","#C8323C","#7F1A22","#FFFFFF"], roll: 20 },
    { id: "brass-d20", name: "Brass d20", cat: "singles", price: 22, spec: "1 pc · 22 mm · solid brass", art: "d20", pal: ["#EED38C","#C79D3E","#7E5E1C","#3A2A08"], roll: 20 },
    { id: "pct", name: "Percentile d10 Pair", cat: "singles", price: 6, spec: "2 pcs · 16 mm · d10 + d%", art: "d10", pal: ["#9EDBCB","#3E9C88","#1F5E52","#FFFFFF"], roll: 100 },
    { id: "brick", name: "d6 Brick", cat: "singles", price: 18, spec: "12 pcs · 12 mm · pipped d6", art: "d6", pal: ["#FFFFFF","#E4E7EE","#B5BCCB","#24345C"], roll: "4d6" },
    { id: "hex-tray", name: "Hex Rolling Tray", cat: "trays", price: 38, spec: "10 in · walnut + felt", art: "tray", pal: ["#A06C47","#7A4E30","#4A2E1B","#2E5E4E"] },
    { id: "fold-tray", name: "Folding Dice Tray", cat: "trays", price: 19, spec: "8 in · vegan leather · snaps flat", art: "fold", pal: ["#4E5560","#30353D","#1C1F24","#A3213A"] },
    { id: "tower", name: "Walnut Dice Tower", cat: "trays", price: 64, spec: "9 in tall · 3 baffles", art: "tower", pal: ["#B07D55","#7A4E30","#4A2E1B","#2E5E4E"], badge: "Low stock", low: true },
    { id: "bag", name: "Waxed Canvas Dice Bag", cat: "storage", price: 16, spec: "holds ~50 dice · drawstring", art: "bag", pal: ["#C9B48A","#A08A5F","#6C5B3A","#3A2E1C"] },
    { id: "vault", name: "Magnetic Dice Vault", cat: "storage", price: 29, spec: "holds one 7-pc set · walnut", art: "vault", pal: ["#A06C47","#7A4E30","#4A2E1B","#E0662F"] },
    { id: "screen", name: "Four-Panel GM Screen", cat: "gm", price: 34, spec: "landscape · 4 × 8.5 × 11 in", art: "screen", pal: ["#E8E3D8","#3A3D44","#1E2024","#A3213A"] },
    { id: "tracker", name: "Initiative Tracker", cat: "gm", price: 15, spec: "magnetic · 8 tokens + dry-erase", art: "tracker", pal: ["#F2F3F6","#5D6270","#2A2D35","#A3213A"] },
  ];
  // Lookup table: product id -> product object.
  const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

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
  // Wraps art() in a full <svg> element for a product. Pass cls = "" for the small cart thumbnails.
  const svg = (p, cls = "art") => `<svg class="${cls}" viewBox="0 0 120 120" aria-hidden="true">${art(p.art, p.pal)}</svg>`;
  // The header logo is a d20 in the accent colors.
  document.getElementById("logo-die").innerHTML = art("d20", ["#E0566F", "#A3213A", "#6E1427", "#FFFFFF"]);

  // ===== State =====
  // localStorage wrapper. Storage can be unavailable (private windows, blocked site data),
  // so every call is wrapped in try/catch and falls back to the default value.
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  // The cart maps product id -> quantity, e.g. { ember: 2, tower: 1 }. It is saved under "ts-cart".
  let cart = store.get("ts-cart", {});
  // Drop saved entries that no longer make sense (a removed product, or a bad quantity).
  for (const id of Object.keys(cart)) if (!byId[id] || !(cart[id] > 0)) delete cart[id];
  // Current catalog view: selected category, sort order and lowercased search text.
  let cat = "all", sort = "featured", q = "";
  const money = n => "$" + n.toFixed(2);
  // Call after every cart change: persists the cart and redraws the drawer and header count.
  const saveCart = () => { store.set("ts-cart", cart); renderCart(); };

  // ===== Catalog: filters, search, sort and product cards =====
  // The UI is redrawn from state by replacing innerHTML. With 17 products this is instant
  // and keeps the code simple. Clicks are handled with event delegation: one listener on
  // the container reads data-* attributes from the clicked button, so the listeners keep
  // working after each redraw.
  const chips = document.getElementById("chips");
  // Draws the category chips with their product counts and marks the selected one.
  function renderChips() {
    chips.innerHTML = CATS.map(c => {
      const n = c.id === "all" ? PRODUCTS.length : PRODUCTS.filter(p => p.cat === c.id).length;
      return `<button class="chip" data-cat="${c.id}" aria-pressed="${c.id === cat}">${c.label}<span class="n">${n}</span></button>`;
    }).join("");
  }
  chips.addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    cat = b.dataset.cat; renderChips(); renderGrid();
  });
  document.getElementById("sort").addEventListener("change", e => { sort = e.target.value; renderGrid(); });
  document.getElementById("q").addEventListener("input", e => { q = e.target.value.trim().toLowerCase(); renderGrid(); });

  const grid = document.getElementById("grid");
  // Draws the product cards that match the current category and search text, in the current sort order.
  function renderGrid() {
    let list = PRODUCTS.filter(p => (cat === "all" || p.cat === cat)
      && (!q || (p.name + " " + p.spec).toLowerCase().includes(q)));
    // "featured" keeps catalog order. Sorting copies the list so PRODUCTS itself is never reordered.
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (!list.length) {
      // The search text is echoed back, so strip characters that could inject HTML.
      grid.innerHTML = `<div class="empty">Nothing matches “${q.replace(/[<&"]/g, "")}”.<br><button class="chip" id="clear">Clear search</button></div>`;
      return;
    }
    grid.innerHTML = list.map(p => `
      <article class="card" data-id="${p.id}">
        <div class="media">
          ${p.badge ? `<span class="badge${p.low ? " low" : ""}">${p.badge}</span>` : ""}
          ${svg(p)}
          ${p.roll ? `<button class="roll-btn" data-roll="${p.id}" aria-label="Test roll ${p.name}">${p.roll === "4d6" ? "Roll 4d6" : p.roll === 100 ? "Roll d%" : "Roll d20"}</button>` : ""}
        </div>
        <div class="info">
          <h3>${p.name}</h3>
          <span class="spec">${p.spec}</span>
        </div>
        <div class="buy">
          <span class="price">${money(p.price)}</span>
          <button class="add" data-add="${p.id}">Add to cart</button>
        </div>
      </article>`).join("");
  }
  // One click handler for every card button: "Clear search", "Add to cart" and "Roll".
  grid.addEventListener("click", e => {
    if (e.target.id === "clear") { q = ""; document.getElementById("q").value = ""; renderGrid(); return; }
    const add = e.target.closest("[data-add]");
    if (add) {
      const id = add.dataset.add;
      cart[id] = (cart[id] || 0) + 1; saveCart();
      add.textContent = "Added"; add.classList.add("added");
      // Show "Added" for about a second, then restore the button.
      setTimeout(() => { add.textContent = "Add to cart"; add.classList.remove("added"); }, 1100);
      toast(`Added ${byId[id].name}`);
      return;
    }
    const r = e.target.closest("[data-roll]");
    if (r) roll(r);
  });

  // ===== Test rolls =====
  // Random integer from 1 to n, like rolling an n-sided die.
  const d = n => 1 + Math.floor(Math.random() * n);
  // Rolls the dice for one product card, plays the spin animation, then shows the result
  // in the card's bottom-left corner.
  function roll(btn) {
    const p = byId[btn.dataset.roll], media = btn.closest(".media");
    let text, crit = false;
    if (p.roll === "4d6") {
      // 4d6 drop lowest: sort high to low and add the top three.
      const rs = [d(6), d(6), d(6), d(6)].sort((a, b) => b - a);
      text = `${rs.join(" ")} → ${rs[0] + rs[1] + rs[2]}`;
    } else if (p.roll === 100) {
      const v = d(100); text = `Rolled ${v}`; crit = v === 100;
    } else {
      const v = d(20); crit = v === 20;
      text = v === 20 ? "Natural 20" : v === 1 ? "Natural 1" : `Rolled ${v}`;
    }
    media.querySelector(".roll-out")?.remove(); // clear the previous result
    // Removing the class and reading offsetWidth forces a reflow, so the animation
    // restarts even when the button is clicked again mid-spin.
    media.classList.remove("rolling"); void media.offsetWidth; media.classList.add("rolling");
    // Show the result after the 450ms spin, or right away when reduced motion is on.
    setTimeout(() => {
      media.classList.remove("rolling");
      const out = document.createElement("span");
      out.className = "roll-out" + (crit ? " crit" : "");
      out.textContent = text;
      media.appendChild(out);
    }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450);
  }

  // ===== Cart drawer =====
  const drawer = document.getElementById("drawer"), scrim = document.getElementById("scrim"), body = document.getElementById("drawer-body");
  // True right after checkout, so the drawer shows the confirmation screen instead of the cart.
  let placed = false;
  // Opening moves keyboard focus into the drawer; Escape, the close button or the backdrop close it.
  function openCart() { placed = false; renderCart(); scrim.hidden = false; drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); document.getElementById("close-cart").focus(); }
  function closeCart() { scrim.hidden = true; drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); }
  document.getElementById("open-cart").addEventListener("click", openCart);
  document.getElementById("close-cart").addEventListener("click", closeCart);
  scrim.addEventListener("click", closeCart);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("open")) closeCart(); });

  // Redraws the header cart count and the drawer contents: the free-shipping bar, one line per
  // product, and the totals. Called on load and after every cart change.
  function renderCart() {
    const ids = Object.keys(cart);
    const count = ids.reduce((n, id) => n + cart[id], 0);
    document.getElementById("cart-count").textContent = count;
    if (placed) {
      body.innerHTML = `<div class="done">
        <svg class="art" viewBox="0 0 120 120" aria-hidden="true">${art("d20", ["#7FD3A8", "#2F9467", "#1F5E42", "#FFFFFF"])}</svg>
        <h3>Order confirmed</h3>
        <p>This is a demo store, so nothing was charged and nothing will ship. Your cart has been cleared.</p>
        <button class="chip" id="keep">Keep shopping</button></div>`;
      return;
    }
    // Shipping is free on an empty cart or once the subtotal reaches FREE_SHIP.
    const sub = ids.reduce((s, id) => s + byId[id].price * cart[id], 0);
    const ship = sub === 0 || sub >= FREE_SHIP ? 0 : SHIP_FEE;
    const pct = Math.min(100, sub / FREE_SHIP * 100);
    body.innerHTML = `
      <div class="ship">
        ${sub >= FREE_SHIP ? `<span><strong>Free shipping unlocked.</strong></span>` : `<span>Add <strong>${money(FREE_SHIP - sub)}</strong> more for free shipping.</span>`}
        <div class="bar"><i style="width:${pct}%"></i></div>
      </div>
      <div class="lines">
        ${ids.length ? ids.map(id => {
          const p = byId[id];
          return `<div class="line">
            <div class="thumb">${svg(p, "")}</div>
            <div class="line-info"><b>${p.name}</b>
              <div class="qty"><button data-dec="${id}" aria-label="Remove one ${p.name}">−</button><span>${cart[id]}</span><button data-inc="${id}" aria-label="Add one ${p.name}">+</button></div>
            </div>
            <div class="line-right"><span class="price">${money(p.price * cart[id])}</span><button class="remove" data-rm="${id}">Remove</button></div>
          </div>`;
        }).join("") : `<div class="drawer-empty">Your cart is empty. Add a dice set to get rolling.</div>`}
      </div>
      <div class="totals">
        <div class="row"><span>Subtotal</span><span>${money(sub)}</span></div>
        <div class="row"><span>Shipping</span><span>${sub === 0 ? "—" : ship ? money(ship) : "Free"}</span></div>
        <div class="row total"><span>Total</span><span>${money(sub + ship)}</span></div>
        <button class="checkout" id="checkout" ${ids.length ? "" : "disabled"}>Check out</button>
        <p class="note">Demo store. Checkout does not charge anything.</p>
      </div>`;
  }
  // One click handler for every drawer button: quantity +/-, Remove, Check out and Keep shopping.
  // Checkout is a demo: it empties the cart and shows a confirmation. Nothing is sent anywhere.
  body.addEventListener("click", e => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.dataset.inc) { cart[t.dataset.inc]++; saveCart(); }
    else if (t.dataset.dec) { if (--cart[t.dataset.dec] <= 0) delete cart[t.dataset.dec]; saveCart(); }
    else if (t.dataset.rm) { delete cart[t.dataset.rm]; saveCart(); }
    else if (t.id === "checkout") { cart = {}; store.set("ts-cart", cart); placed = true; renderCart(); }
    else if (t.id === "keep") { placed = false; closeCart(); renderCart(); }
  });

  // Shows a short message at the bottom of the screen for 1.6 seconds.
  // tt holds the hide timer so a new toast resets it instead of hiding early.
  let tt;
  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg; el.hidden = false;
    clearTimeout(tt); tt = setTimeout(() => { el.hidden = true; }, 1600);
  }

  // ===== Start =====
  renderChips(); renderGrid(); renderCart();
})();
