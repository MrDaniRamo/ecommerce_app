// Los Dados del Norte storefront data: store settings, categories and the product catalog.
// Loaded before art.js and app.js; the constants below are shared with them as globals.
//
// Text that appears on the page comes in two languages. Wherever a value differs between
// Spanish and English it is written as { es: "…", en: "…" }; app.js picks the one for the
// current language. A plain string is used as is in both languages.

// ===== Store settings =====
// Prices are in Mexican pesos (MXN), in whole pesos.
const FREE_SHIP = 999;  // subtotal at which shipping becomes free
const SHIP_FEE = 99;    // flat shipping fee below that threshold

// Filter categories, in the order the chips appear. "all" is a special case meaning no filter.
const CATS = [
  { id: "all", label: { es: "Todo", en: "All" } },
  { id: "sets", label: { es: "Sets de dados", en: "Dice sets" } },
  { id: "singles", label: { es: "Dados sueltos", en: "Single dice" } },
  { id: "trays", label: { es: "Charolas y torres", en: "Trays & towers" } },
  { id: "storage", label: { es: "Bolsas y estuches", en: "Bags & storage" } },
  { id: "gm", label: { es: "Para el Máster", en: "GM gear" } },
];

// Row labels for the product page's details table. Products refer to them by key.
const DETAIL_LABELS = {
  pieces: { es: "Piezas", en: "Pieces" },
  size: { es: "Tamaño", en: "Size" },
  material: { es: "Material", en: "Material" },
  numerals: { es: "Números", en: "Numerals" },
  faces: { es: "Caras", en: "Faces" },
  weight: { es: "Peso", en: "Weight" },
  care: { es: "Cuidado", en: "Care" },
  fits: { es: "Capacidad", en: "Fits" },
  capacity: { es: "Capacidad", en: "Capacity" },
  storage: { es: "Guardado", en: "Storage" },
  baffles: { es: "Deflectores", en: "Baffles" },
  closure: { es: "Cierre", en: "Closure" },
  panels: { es: "Paneles", en: "Panels" },
  layout: { es: "Formato", en: "Layout" },
  inside: { es: "Interior", en: "Inside" },
  contents: { es: "Contenido", en: "Contents" },
  surface: { es: "Superficie", en: "Surface" },
  mounting: { es: "Montaje", en: "Mounting" },
};

// Shared detail values.
const SET_PIECES = { es: "7: d4, d6, d8, d10, d%, d12, d20", en: "7: d4, d6, d8, d10, d%, d12, d20" };
const CARE_STONE = { es: "Tíralos sobre fieltro o en charola; la piedra se puede despostillar", en: "Roll on felt or a tray; stone can chip" };

// ===== Product catalog =====
// Each product has:
//   id       unique key; used in the saved cart and in the product page address (#product-<id>)
//   name     display name, { es, en }
//   cat      category id from CATS above
//   price    price in whole Mexican pesos
//   spec     short spec line shown under the name on cards, { es, en }
//   desc     one or two sentences for the product page, { es, en }
//   details  [key, value] rows for the product page's details table. key is one of
//            DETAIL_LABELS; value is a string or { es, en }.
//   art      which drawing art() should use: d4, d6, d8, d10, d12, d20, tray, fold,
//            tower, bag, vault, screen or tracker
//   pal      four colors for the drawing: [light face, base face, dark face/outline, ink].
//            "ink" is used for numerals, pips and accent details.
//   roll     optional. Adds a test-roll button: 20 rolls a d20, 100 rolls d%,
//            "4d6" rolls four d6 and keeps the highest three (a character stat roll).
//   badge    optional corner label, { es, en }; low: true colors it as a scarcity warning.
// The array order is the "Featured" sort order.
const PRODUCTS = [
  {
    id: "ember", cat: "sets", price: 449,
    name: { es: "Set de Resina Brasa", en: "Ember Resin Set" },
    spec: { es: "7 pzas · 16 mm · resina jaspeada", en: "7 pcs · 16 mm · swirl resin" },
    desc: {
      es: "Resina naranja y roja jaspeada a mano, así que no hay dos sets iguales. Se lee desde el otro lado de la mesa, y es el favorito de quien apenas empieza a jugar.",
      en: "Orange and red resin swirled by hand, so no two sets match. Bright enough to read across the table, and the bestseller for first-time players.",
    },
    details: [["pieces", SET_PIECES], ["size", "16 mm (d20)"], ["material", { es: "Resina jaspeada", en: "Swirl resin" }], ["numerals", { es: "Crema, entintados a mano", en: "Cream, inked by hand" }]],
    art: "d20", pal: ["#F6A25E", "#E0662F", "#9C3A17", "#FFF4E8"], roll: 20, badge: { es: "Más vendido", en: "Bestseller" },
  },
  {
    id: "glacier", cat: "sets", price: 749,
    name: { es: "Set de Vidrio Glaciar", en: "Glacier Glass Set" },
    spec: { es: "7 pzas · 16 mm · vidrio K9", en: "7 pcs · 16 mm · K9 glass" },
    desc: {
      es: "Tallados en vidrio óptico K9 con un tono azul pálido. Pesan más que la resina y sus números grabados atrapan la luz.",
      en: "Cut from clear K9 optical glass with a pale blue tint. Heavier than resin, with crisp engraved numerals that catch the light.",
    },
    details: [["pieces", SET_PIECES], ["size", "16 mm (d20)"], ["material", { es: "Vidrio óptico K9", en: "K9 optical glass" }], ["numerals", { es: "Grabados, relleno azul marino", en: "Engraved, navy fill" }], ["care", { es: "Tíralos sobre fieltro o en charola para evitar despostilladuras", en: "Roll on felt or a tray to avoid chips" }]],
    art: "d12", pal: ["#DCF0F8", "#9CCBE2", "#5A93B5", "#0E3A55"], roll: 20,
  },
  {
    id: "obsidian", cat: "sets", price: 899,
    name: { es: "Set de Metal Obsidiana", en: "Obsidian Metal Set" },
    spec: { es: "7 pzas · 16 mm · aleación de zinc", en: "7 pcs · 16 mm · zinc alloy" },
    desc: {
      es: "Aleación de zinc maciza en níquel negro con números dorados. Cada dado tiene peso de verdad y suena firme al caer.",
      en: "Solid zinc alloy in black nickel with gold numerals. Each die has real weight in the hand and a satisfying clack when it lands.",
    },
    details: [["pieces", SET_PIECES], ["size", "16 mm (d20)"], ["material", { es: "Aleación de zinc, baño de níquel negro", en: "Zinc alloy, black nickel plating" }], ["numerals", { es: "Esmalte dorado", en: "Gold enamel" }], ["weight", { es: "Unos 55 g por set", en: "About 55 g per set" }]],
    art: "d20", pal: ["#73777F", "#41444B", "#1E2024", "#E3C77A"], roll: 20,
  },
  {
    id: "moss", cat: "sets", price: 1599,
    name: { es: "Set de Ágata Musgo", en: "Moss Agate Set" },
    spec: { es: "7 pzas · 16 mm · piedra natural", en: "7 pcs · 16 mm · natural stone" },
    desc: {
      es: "Tallados en ágata musgo natural, con vetas verdes distintas en cada piedra. Un set para la campaña larga.",
      en: "Carved from natural moss agate, with green inclusions that differ in every stone. A set for the long campaign.",
    },
    details: [["pieces", SET_PIECES], ["size", "16 mm (d20)"], ["material", { es: "Ágata musgo natural", en: "Natural moss agate" }], ["numerals", { es: "Grabados, relleno blanco", en: "Engraved, white fill" }], ["care", CARE_STONE]],
    art: "d10", pal: ["#C3D7AE", "#86A472", "#4B6440", "#F6F3E8"], roll: 20, badge: { es: "Quedan 3", en: "Only 3 left" }, low: true,
  },
  {
    id: "bone", cat: "sets", price: 219,
    name: { es: "Set Hueso y Tinta", en: "Bone & Ink Set" },
    spec: { es: "7 pzas · 16 mm · acrílico", en: "7 pcs · 16 mm · acrylic" },
    desc: {
      es: "Acrílico color hueso con números negros. Fáciles de leer y tan accesibles que puedes tener un set extra para los invitados.",
      en: "Classic off-white acrylic with black numerals. Easy to read and cheap enough to keep a spare set for guests.",
    },
    details: [["pieces", SET_PIECES], ["size", "16 mm (d20)"], ["material", { es: "Acrílico", en: "Acrylic" }], ["numerals", { es: "Negros, entintados", en: "Black, inked" }]],
    art: "d8", pal: ["#FFFFFF", "#E9E5DC", "#B9B2A3", "#1A1A1A"], roll: 20,
  },
  {
    id: "nebula", cat: "sets", price: 649,
    name: { es: "Set Nebulosa de Arista Viva", en: "Nebula Sharp-Edge Set" },
    spec: { es: "7 pzas · 16 mm · resina de arista viva", en: "7 pcs · 16 mm · sharp-edge resin" },
    desc: {
      es: "Turquesa que se funde en índigo, con aristas vivas en lugar de redondeadas. Los dados de arista viva ruedan menos y se detienen antes.",
      en: "Teal fading into indigo, cast with sharp edges instead of rounded ones. Sharp-edge dice tumble less and stop sooner.",
    },
    details: [["pieces", SET_PIECES], ["size", "16 mm (d20)"], ["material", { es: "Resina de arista viva", en: "Sharp-edge resin" }], ["numerals", { es: "Blancos, entintados", en: "White, inked" }]],
    art: "d4", pal: ["#97D9D3", "#5F6FCC", "#33307A", "#FFFFFF"], roll: 20, badge: { es: "Nuevo", en: "New" },
  },
  {
    id: "big-d20", cat: "singles", price: 219,
    name: { es: "d20 Gigante", en: "Oversized d20" },
    spec: { es: "1 pza · 32 mm · resina", en: "1 pc · 32 mm · resin" },
    desc: {
      es: "Un d20 de 32 mm, el doble del tamaño normal. Para los grandes momentos y para quien quiere que su crítico se vea desde el otro lado del cuarto.",
      en: "A 32 mm d20, twice the usual size. Good for big moments and for players who like their crits seen from across the room.",
    },
    details: [["pieces", "1 d20"], ["size", "32 mm"], ["material", { es: "Resina", en: "Resin" }], ["numerals", { es: "Blancos, entintados", en: "White, inked" }]],
    art: "d20", pal: ["#F19196", "#C8323C", "#7F1A22", "#FFFFFF"], roll: 20,
  },
  {
    id: "brass-d20", cat: "singles", price: 399,
    name: { es: "d20 de Latón", en: "Brass d20" },
    spec: { es: "1 pza · 22 mm · latón macizo", en: "1 pc · 22 mm · solid brass" },
    desc: {
      es: "Un d20 maquinado en latón macizo. Con el uso se oscurece y toma una pátina cálida.",
      en: "A single d20 machined from solid brass. It darkens with handling into a warm patina.",
    },
    details: [["pieces", "1 d20"], ["size", "22 mm"], ["material", { es: "Latón macizo", en: "Solid brass" }], ["numerals", { es: "Grabados", en: "Engraved" }], ["weight", { es: "Unos 40 g", en: "About 40 g" }]],
    art: "d20", pal: ["#EED38C", "#C79D3E", "#7E5E1C", "#3A2A08"], roll: 20,
  },
  {
    id: "pct", cat: "singles", price: 109,
    name: { es: "Par de d10 Percentil", en: "Percentile d10 Pair" },
    spec: { es: "2 pzas · 16 mm · d10 + d%", en: "2 pcs · 16 mm · d10 + d%" },
    desc: {
      es: "Un d10 y un d% (decenas) a juego para tiradas de porcentaje. Tira los dos y lee primero el de las decenas.",
      en: "A matched d10 and d% (tens) pair for percentile rolls. Roll both and read the tens die first.",
    },
    details: [["pieces", { es: "1 d10 (0–9) y 1 d% (00–90)", en: "1 d10 (0–9) and 1 d% (00–90)" }], ["size", "16 mm"], ["material", { es: "Resina", en: "Resin" }], ["numerals", { es: "Blancos, entintados", en: "White, inked" }]],
    art: "d10", pal: ["#9EDBCB", "#3E9C88", "#1F5E52", "#FFFFFF"], roll: 100,
  },
  {
    id: "brick", cat: "singles", price: 329,
    name: { es: "Ladrillo de d6", en: "d6 Brick" },
    spec: { es: "12 pzas · 12 mm · d6 de puntos", en: "12 pcs · 12 mm · pipped d6" },
    desc: {
      es: "Doce d6 de puntos para bolas de fuego, ataques furtivos y tirar características. Tan chicos que un puñado cabe en una mano.",
      en: "Twelve pipped d6 for fireballs, sneak attacks and rolling stats. Small enough that a handful still fits in one hand.",
    },
    details: [["pieces", "12 d6"], ["size", "12 mm"], ["material", { es: "Acrílico", en: "Acrylic" }], ["faces", { es: "Puntos, relleno azul marino", en: "Pips, navy fill" }]],
    art: "d6", pal: ["#FFFFFF", "#E4E7EE", "#B5BCCB", "#24345C"], roll: "4d6",
  },
  {
    id: "hex-tray", cat: "trays", price: 699,
    name: { es: "Charola Hexagonal", en: "Hex Rolling Tray" },
    spec: { es: "25 cm · nogal y fieltro", en: "25 cm · walnut + felt" },
    desc: {
      es: "Charola hexagonal de nogal forrada de fieltro verde. Mantiene los dados en la mesa y apaga el ruido de la tirada.",
      en: "A hexagonal walnut tray lined with green felt. It keeps dice on the table and quiets the roll.",
    },
    details: [["size", { es: "25 cm de ancho, 4 cm de fondo", en: "25 cm across, 4 cm deep" }], ["material", { es: "Nogal, forro de fieltro", en: "Walnut, felt lining" }], ["fits", { es: "Unos 3 sets completos a la vez", en: "About 3 full sets at once" }]],
    art: "tray", pal: ["#A06C47", "#7A4E30", "#4A2E1B", "#2E5E4E"],
  },
  {
    id: "fold-tray", cat: "trays", price: 349,
    name: { es: "Charola Plegable", en: "Folding Dice Tray" },
    spec: { es: "20 cm · piel vegana · se dobla", en: "20 cm · vegan leather · snaps flat" },
    desc: {
      es: "Se arma con broches en forma de charola y se desarma plana para guardarla en un libro o en la mochila.",
      en: "Snaps together into a tray, then unsnaps flat to slide into a rulebook or bag.",
    },
    details: [["size", { es: "20 cm por lado, abierta", en: "20 cm square when open" }], ["material", { es: "Piel vegana, forro de gamuza", en: "Vegan leather, suede lining" }], ["storage", { es: "Se dobla plana, menos de 6 mm", en: "Folds flat, under 6 mm" }]],
    art: "fold", pal: ["#4E5560", "#30353D", "#1C1F24", "#A3213A"],
  },
  {
    id: "tower", cat: "trays", price: 1149,
    name: { es: "Torre de Dados de Nogal", en: "Walnut Dice Tower" },
    spec: { es: "23 cm de alto · 3 deflectores", en: "23 cm tall · 3 baffles" },
    desc: {
      es: "Suelta los dados por arriba y tres deflectores los hacen rodar hasta la charola de la base. Se acaban las discusiones sobre tiradas chuecas.",
      en: "Drop dice in the top and three baffles tumble them into the tray at the base. Ends any argument about a fair roll.",
    },
    details: [["size", { es: "23 cm de alto, 15 cm de ancho", en: "23 cm tall, 15 cm wide" }], ["material", { es: "Nogal, charola forrada de fieltro", en: "Walnut, felt-lined tray" }], ["baffles", "3"]],
    art: "tower", pal: ["#B07D55", "#7A4E30", "#4A2E1B", "#2E5E4E"], badge: { es: "Pocas piezas", en: "Low stock" }, low: true,
  },
  {
    id: "bag", cat: "storage", price: 289,
    name: { es: "Bolsa de Lona Encerada", en: "Waxed Canvas Dice Bag" },
    spec: { es: "caben ~50 dados · jareta", en: "holds ~50 dice · drawstring" },
    desc: {
      es: "Bolsa de lona encerada con jareta que se queda parada cuando está abierta, para meter la mano a media sesión.",
      en: "A waxed canvas drawstring bag that stands up on its own when open, so you can dig in mid-session.",
    },
    details: [["capacity", { es: "Unos 50 dados (7 sets)", en: "About 50 dice (7 sets)" }], ["material", { es: "Lona encerada, forro de algodón", en: "Waxed canvas, cotton lining" }], ["closure", { es: "Jareta de piel", en: "Leather drawstring" }]],
    art: "bag", pal: ["#C9B48A", "#A08A5F", "#6C5B3A", "#3A2E1C"],
  },
  {
    id: "vault", cat: "storage", price: 529,
    name: { es: "Cofre Magnético para Dados", en: "Magnetic Dice Vault" },
    spec: { es: "para un set de 7 · nogal", en: "holds one 7-pc set · walnut" },
    desc: {
      es: "Caja hexagonal de nogal con tapa magnética y un hueco para cada dado de un set estándar.",
      en: "A hexagonal walnut box with a magnetic lid and a cut-out for each die in a standard set.",
    },
    details: [["capacity", { es: "Un set de 7 piezas de 16 mm", en: "One 7-piece set, 16 mm" }], ["material", { es: "Nogal, inserto de espuma", en: "Walnut, foam insert" }], ["closure", { es: "Tapa magnética", en: "Magnetic lid" }]],
    art: "vault", pal: ["#A06C47", "#7A4E30", "#4A2E1B", "#E0662F"],
  },
  {
    id: "screen", cat: "gm", price: 619,
    name: { es: "Pantalla del Máster de 4 Paneles", en: "Four-Panel GM Screen" },
    spec: { es: "horizontal · 4 paneles tamaño carta", en: "landscape · 4 letter-size panels" },
    desc: {
      es: "Pantalla resistente de cuatro paneles en formato horizontal, para que sigas viendo la mesa por encima. Por dentro tiene bolsas transparentes para tus notas.",
      en: "A sturdy four-panel screen in landscape layout, so you can still see the table over it. Clear pockets on the inside hold your notes.",
    },
    details: [["panels", { es: "4, tamaño carta (21.6 × 27.9 cm)", en: "4, letter size (21.6 × 27.9 cm)" }], ["layout", { es: "Horizontal", en: "Landscape" }], ["material", { es: "Cartón laminado", en: "Laminated board" }], ["inside", { es: "Bolsas transparentes para notas", en: "Clear pockets for notes" }]],
    art: "screen", pal: ["#E8E3D8", "#3A3D44", "#1E2024", "#A3213A"],
  },
  {
    id: "tracker", cat: "gm", price: 279,
    name: { es: "Marcador de Iniciativa", en: "Initiative Tracker" },
    spec: { es: "magnético · 8 fichas + borrable", en: "magnetic · 8 tokens + dry-erase" },
    desc: {
      es: "Pizarrón borrable con ocho fichas magnéticas para llevar el orden de los turnos. Se cuelga de la pantalla del Máster.",
      en: "A dry-erase board with eight magnetic tokens for tracking turn order. Hangs on the GM screen.",
    },
    details: [["contents", { es: "Pizarrón y 8 fichas numeradas", en: "Board and 8 numbered tokens" }], ["surface", { es: "Borrable en seco", en: "Dry-erase" }], ["mounting", { es: "Magnético", en: "Magnetic" }]],
    art: "tracker", pal: ["#F2F3F6", "#5D6270", "#2A2D35", "#A3213A"],
  },
];

// Lookup table: product id -> product object.
const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
