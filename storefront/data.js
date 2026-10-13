// Twenty Sides storefront data: store settings, categories and the product catalog.
// Loaded before art.js and app.js; the constants below are shared with them as globals.

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
//   id       unique key; used in the saved cart and in the product page address (#product-<id>)
//   name     display name
//   cat      category id from CATS above
//   price    price in USD
//   spec     short spec line shown under the name on cards (piece count, size, material)
//   desc     one or two sentences for the product page
//   details  [label, value] rows for the product page's details table
//   art      which drawing art() should use: d4, d6, d8, d10, d12, d20, tray, fold,
//            tower, bag, vault, screen or tracker
//   pal      four colors for the drawing: [light face, base face, dark face/outline, ink].
//            "ink" is used for numerals, pips and accent details.
//   roll     optional. Adds a test-roll button: 20 rolls a d20, 100 rolls d%,
//            "4d6" rolls four d6 and keeps the highest three (a character stat roll).
//   badge    optional corner label; low: true colors it as a scarcity warning.
// The array order is the "Featured" sort order.
const SET_PIECES = "7: d4, d6, d8, d10, d%, d12, d20";
const PRODUCTS = [
  {
    id: "ember", name: "Ember Resin Set", cat: "sets", price: 24, spec: "7 pcs · 16 mm · swirl resin",
    desc: "Orange and red resin swirled by hand, so no two sets match. Bright enough to read across the table, and the bestseller for first-time players.",
    details: [["Pieces", SET_PIECES], ["Size", "16 mm d20"], ["Material", "Swirl resin"], ["Numerals", "Cream, inked by hand"]],
    art: "d20", pal: ["#F6A25E", "#E0662F", "#9C3A17", "#FFF4E8"], roll: 20, badge: "Bestseller",
  },
  {
    id: "glacier", name: "Glacier Glass Set", cat: "sets", price: 42, spec: "7 pcs · 16 mm · K9 glass",
    desc: "Cut from clear K9 optical glass with a pale blue tint. Heavier than resin, with crisp engraved numerals that catch the light.",
    details: [["Pieces", SET_PIECES], ["Size", "16 mm d20"], ["Material", "K9 optical glass"], ["Numerals", "Engraved, navy fill"], ["Care", "Roll on felt or a tray to avoid chips"]],
    art: "d12", pal: ["#DCF0F8", "#9CCBE2", "#5A93B5", "#0E3A55"], roll: 20,
  },
  {
    id: "obsidian", name: "Obsidian Metal Set", cat: "sets", price: 49, spec: "7 pcs · 16 mm · zinc alloy",
    desc: "Solid zinc alloy in black nickel with gold numerals. Each die has real weight in the hand and a satisfying clack when it lands.",
    details: [["Pieces", SET_PIECES], ["Size", "16 mm d20"], ["Material", "Zinc alloy, black nickel plating"], ["Numerals", "Gold enamel"], ["Weight", "About 55 g per set"]],
    art: "d20", pal: ["#73777F", "#41444B", "#1E2024", "#E3C77A"], roll: 20,
  },
  {
    id: "moss", name: "Moss Agate Set", cat: "sets", price: 89, spec: "7 pcs · 16 mm · natural stone",
    desc: "Carved from natural moss agate, with green inclusions that differ in every stone. A set for the long campaign.",
    details: [["Pieces", SET_PIECES], ["Size", "16 mm d20"], ["Material", "Natural moss agate"], ["Numerals", "Engraved, white fill"], ["Care", "Roll on felt or a tray; stone can chip"]],
    art: "d10", pal: ["#C3D7AE", "#86A472", "#4B6440", "#F6F3E8"], roll: 20, badge: "Only 3 left", low: true,
  },
  {
    id: "bone", name: "Bone & Ink Set", cat: "sets", price: 12, spec: "7 pcs · 16 mm · acrylic",
    desc: "Classic off-white acrylic with black numerals. Easy to read and cheap enough to keep a spare set for guests.",
    details: [["Pieces", SET_PIECES], ["Size", "16 mm d20"], ["Material", "Acrylic"], ["Numerals", "Black, inked"]],
    art: "d8", pal: ["#FFFFFF", "#E9E5DC", "#B9B2A3", "#1A1A1A"], roll: 20,
  },
  {
    id: "nebula", name: "Nebula Sharp-Edge Set", cat: "sets", price: 36, spec: "7 pcs · 16 mm · sharp-edge resin",
    desc: "Teal fading into indigo, cast with sharp edges instead of rounded ones. Sharp-edge dice tumble less and stop sooner.",
    details: [["Pieces", SET_PIECES], ["Size", "16 mm d20"], ["Material", "Sharp-edge resin"], ["Numerals", "White, inked"]],
    art: "d4", pal: ["#97D9D3", "#5F6FCC", "#33307A", "#FFFFFF"], roll: 20, badge: "New",
  },
  {
    id: "big-d20", name: "Oversized d20", cat: "singles", price: 12, spec: "1 pc · 32 mm · resin",
    desc: "A 32 mm d20, twice the usual size. Good for big moments and for players who like their crits seen from across the room.",
    details: [["Pieces", "1 d20"], ["Size", "32 mm"], ["Material", "Resin"], ["Numerals", "White, inked"]],
    art: "d20", pal: ["#F19196", "#C8323C", "#7F1A22", "#FFFFFF"], roll: 20,
  },
  {
    id: "brass-d20", name: "Brass d20", cat: "singles", price: 22, spec: "1 pc · 22 mm · solid brass",
    desc: "A single d20 machined from solid brass. It darkens with handling into a warm patina.",
    details: [["Pieces", "1 d20"], ["Size", "22 mm"], ["Material", "Solid brass"], ["Numerals", "Engraved"], ["Weight", "About 40 g"]],
    art: "d20", pal: ["#EED38C", "#C79D3E", "#7E5E1C", "#3A2A08"], roll: 20,
  },
  {
    id: "pct", name: "Percentile d10 Pair", cat: "singles", price: 6, spec: "2 pcs · 16 mm · d10 + d%",
    desc: "A matched d10 and d% (tens) pair for percentile rolls. Roll both and read the tens die first.",
    details: [["Pieces", "1 d10 (0–9) and 1 d% (00–90)"], ["Size", "16 mm"], ["Material", "Resin"], ["Numerals", "White, inked"]],
    art: "d10", pal: ["#9EDBCB", "#3E9C88", "#1F5E52", "#FFFFFF"], roll: 100,
  },
  {
    id: "brick", name: "d6 Brick", cat: "singles", price: 18, spec: "12 pcs · 12 mm · pipped d6",
    desc: "Twelve pipped d6 for fireballs, sneak attacks and rolling stats. Small enough that a handful still fits in one hand.",
    details: [["Pieces", "12 d6"], ["Size", "12 mm"], ["Material", "Acrylic"], ["Faces", "Pips, navy fill"]],
    art: "d6", pal: ["#FFFFFF", "#E4E7EE", "#B5BCCB", "#24345C"], roll: "4d6",
  },
  {
    id: "hex-tray", name: "Hex Rolling Tray", cat: "trays", price: 38, spec: "10 in · walnut + felt",
    desc: "A hexagonal walnut tray lined with green felt. It keeps dice on the table and quiets the roll.",
    details: [["Size", "10 in across, 1.5 in deep"], ["Material", "Walnut, felt lining"], ["Fits", "About 3 full sets at once"]],
    art: "tray", pal: ["#A06C47", "#7A4E30", "#4A2E1B", "#2E5E4E"],
  },
  {
    id: "fold-tray", name: "Folding Dice Tray", cat: "trays", price: 19, spec: "8 in · vegan leather · snaps flat",
    desc: "Snaps together into a tray, then unsnaps flat to slide into a rulebook or bag.",
    details: [["Size", "8 in square when open"], ["Material", "Vegan leather, suede lining"], ["Storage", "Folds flat, under 0.25 in"]],
    art: "fold", pal: ["#4E5560", "#30353D", "#1C1F24", "#A3213A"],
  },
  {
    id: "tower", name: "Walnut Dice Tower", cat: "trays", price: 64, spec: "9 in tall · 3 baffles",
    desc: "Drop dice in the top and three baffles tumble them into the tray at the base. Ends any argument about a fair roll.",
    details: [["Size", "9 in tall, 6 in wide"], ["Material", "Walnut, felt-lined tray"], ["Baffles", "3"]],
    art: "tower", pal: ["#B07D55", "#7A4E30", "#4A2E1B", "#2E5E4E"], badge: "Low stock", low: true,
  },
  {
    id: "bag", name: "Waxed Canvas Dice Bag", cat: "storage", price: 16, spec: "holds ~50 dice · drawstring",
    desc: "A waxed canvas drawstring bag that stands up on its own when open, so you can dig in mid-session.",
    details: [["Capacity", "About 50 dice (7 sets)"], ["Material", "Waxed canvas, cotton lining"], ["Closure", "Leather drawstring"]],
    art: "bag", pal: ["#C9B48A", "#A08A5F", "#6C5B3A", "#3A2E1C"],
  },
  {
    id: "vault", name: "Magnetic Dice Vault", cat: "storage", price: 29, spec: "holds one 7-pc set · walnut",
    desc: "A hexagonal walnut box with a magnetic lid and a cut-out for each die in a standard set.",
    details: [["Capacity", "One 7-piece set, 16 mm"], ["Material", "Walnut, foam insert"], ["Closure", "Magnetic lid"]],
    art: "vault", pal: ["#A06C47", "#7A4E30", "#4A2E1B", "#E0662F"],
  },
  {
    id: "screen", name: "Four-Panel GM Screen", cat: "gm", price: 34, spec: "landscape · 4 × 8.5 × 11 in",
    desc: "A sturdy four-panel screen in landscape layout, so you can still see the table over it. Clear pockets on the inside hold your notes.",
    details: [["Panels", "4, each 8.5 × 11 in"], ["Layout", "Landscape"], ["Material", "Laminated board"], ["Inside", "Clear pockets for notes"]],
    art: "screen", pal: ["#E8E3D8", "#3A3D44", "#1E2024", "#A3213A"],
  },
  {
    id: "tracker", name: "Initiative Tracker", cat: "gm", price: 15, spec: "magnetic · 8 tokens + dry-erase",
    desc: "A dry-erase board with eight magnetic tokens for tracking turn order. Hangs on the GM screen.",
    details: [["Contents", "Board and 8 numbered tokens"], ["Surface", "Dry-erase"], ["Mounting", "Magnetic"]],
    art: "tracker", pal: ["#F2F3F6", "#5D6270", "#2A2D35", "#A3213A"],
  },
];

// Lookup table: product id -> product object.
const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
