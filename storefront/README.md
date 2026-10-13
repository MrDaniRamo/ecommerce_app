# Twenty Sides storefront

A demo online shop for D&D dice and table accessories, built with React. Every product has its own page, and React builds that page from the product's catalog entry, so no product has an HTML file of its own. There is no build step and there are no image files.

| File | Contents |
| --- | --- |
| `index.html` | The page shell. It loads the stylesheet, the libraries and the three app scripts. |
| `styles.css` | All styling: design tokens for light and dark themes, then component styles. |
| `data.js` | Store settings, categories and the product catalog. |
| `art.js` | The SVG drawing for each product. |
| `app.js` | The React components: header, shop, product page, cart drawer. |

Live page: https://claude.ai/artifact/XMVCeNVSqyYdztuNRa9jF9

## Running it locally

Open `storefront/index.html` in a browser. Keep the files together in one folder, because the page loads the others by relative path. Nothing needs to be installed.

The page needs an internet connection the first time, to load these pinned libraries from the jsDelivr CDN:

| Library | Version | Used for |
| --- | --- | --- |
| React | 18.3.1 | Components and state |
| ReactDOM | 18.3.1 | Drawing components into the page |
| htm | 3.1.1 | JSX-like syntax without a build step (see below) |

Google Fonts load from the web too. Without them the page falls back to system fonts.

## What the page does

| Feature | How it works |
| --- | --- |
| Product grid | 17 example products from the `PRODUCTS` array. Clicking a product's picture or name opens its product page. |
| Product page | A large picture, price, description, details table, quantity picker and Add to cart, plus up to three more products from the same category. |
| Links and history | Each product page has its own address, such as `#product-ember`, so the browser's Back and Forward buttons work and a product link can be shared. An unknown product id shows a "couldn't find that product" message. |
| Category filter | Chips across the top (All, Dice sets, Single dice, Trays & towers, Bags & storage, GM gear), each with a product count. |
| Search | Matches the typed text against each product's name and spec line, as you type. Searching from a product page jumps back to the shop to show the results. |
| Sort | Featured (catalog order), price low to high, price high to low, or name. |
| Kept place | The filter, sort, search and scroll position are kept while you visit a product page, so going back returns you to the same spot. |
| Test roll | Dice products have a Roll button, on the card and on the product page. Sets and single d20s roll a d20 and call out a natural 20 or natural 1. The percentile pair rolls d% (1–100). The d6 brick rolls 4d6 and drops the lowest die, the usual way to roll a character stat. |
| Cart | A drawer that slides in from the right. You can change quantities and remove items, and it shows subtotal, shipping and total. Product names in the cart link to their pages. |
| Shipping | $5 flat. Free when the subtotal reaches $50, with a progress bar showing how far away that is. |
| Checkout | Demo only. It empties the cart and shows a confirmation. Nothing is charged or sent anywhere. |
| Saved cart | The cart is saved in the browser's `localStorage`, so it survives a reload. Each browser has its own cart. |
| Themes | Light and dark, following the system setting. |
| Phones | Two-column grid, chips scroll sideways, product pages stack the picture above the details, and the header hides the wordmark to make room for search. |

## How it works

### One page, two views

There is only one HTML page. React looks at the part of the address after `#` and picks what to show:

| Address | Shows |
| --- | --- |
| `index.html` or `index.html#shop` | The shop: intro, filters and the product grid |
| `index.html#product-<id>` | The product page for the product with that `id` |

Product links are plain links to those addresses, such as `<a href="#product-ember">`. Following one changes the address, the browser fires a `hashchange` event, and the `useRoute()` hook re-renders the app with the new view. No request goes to a server. This is called hash-based routing.

`<ProductPage>` takes the id from the address, looks the product up in the catalog with `byId[id]`, and builds the page from its fields: `name`, `price`, `desc`, `details`, the drawing, and so on. Adding a product to `PRODUCTS` therefore gives it a page automatically.

### Components without a build step

React components are usually written in JSX, which needs a build tool to turn it into plain JavaScript. This project uses [htm](https://github.com/developit/htm) instead. htm reads JSX-like markup from a tagged template string, in the browser:

```js
// JSX (needs a build step)          // htm (runs as is)
<Price value={p.price} />            html`<${Price} value=${p.price} />`
<div className="card">{name}</div>   html`<div className="card">${name}</div>`
```

The main differences from JSX: components are written as `<${Name}>`, values go in `${…}`, and a component's closing tag can be written `<//>`.

### Load order

`index.html` loads the scripts in this order, and each one can use what the earlier ones define:

1. **React, ReactDOM, htm** from the CDN. They define the globals `React`, `ReactDOM` and `htm`.
2. **`data.js`** defines `FREE_SHIP`, `SHIP_FEE`, `CATS`, `PRODUCTS` and `byId`.
3. **`art.js`** defines `art(kind, palette)`, which returns the SVG markup for a drawing.
4. **`app.js`** defines the components and draws `<App>` into `<div id="root">`.

These are ordinary scripts, not ES modules, because modules don't load from a page opened straight from disk (`file://`). Top-level `const`s in one script are visible to the scripts after it.

### Components (`app.js`)

```
App                      owns shared state: route, cart, filters, cart drawer, toast
├── Header               logo, search box, cart button with item count
├── Shop                 (address is #shop or empty)
│   └── ProductCard ×N   picture + name link to the product page; Roll and Add work in place
│       ├── Media        picture panel: drawing, badge, Roll button, roll result
│       └── AddButton    "Add to cart" that shows "Added" for a moment
├── ProductPage          (address is #product-<id>)
│   ├── Media (large)
│   ├── Stepper          quantity picker
│   ├── AddButton
│   └── ProductCard ×3   "More …" from the same category
├── CartDrawer           cart lines (with Stepper), totals, demo checkout
└── toast                short "Added …" message
```

Hooks in `app.js`:

| Hook | What it does |
| --- | --- |
| `useRoute()` | Reads the address hash and returns `{ page: "shop" }` or `{ page: "product", id }`. Re-renders on Back, Forward and link clicks. |
| `useCart()` | Holds the cart as `{ productId: quantity }`, saves it to `localStorage` under `ts-cart` on every change, and returns `add`, `remove` and `clear`. |
| `useRoll(product)` | Rolls that product's dice, runs the spin animation, and returns the result. |
| `useToast()` | Shows a message for 1.6 seconds. |

The filters live in `<App>`, not in `<Shop>`. When you open a product page, `<Shop>` is removed from the page, and any state it held would be lost. Keeping the filters in `<App>` means they are still set when you come back. `<App>` also records the shop's scroll position and restores it.

Opening a product page scrolls to the top, sets the browser tab title to the product name, and moves keyboard focus to the product's heading, so screen readers announce the new page.

### Drawings (`art.js`)

Every picture is SVG drawn from simple polygons on a 120 × 120 canvas. `art(kind, palette)` returns the markup for one drawing, built from three helpers: `pt()` (a point on a circle), `poly()` (a polygon) and `label()` (a die's number). React inserts the markup with `dangerouslySetInnerHTML`. That is safe here because the markup is built only from our own catalog data, never from anything a visitor types.

### Styles (`styles.css`)

- **Design tokens.** The `:root` block defines every color (`--bg`, `--fg`, `--accent`…) and font (`--font-display`, `--font-body`, `--font-mono`) as a CSS variable. Components use only these variables, never raw colors.
- **Dark theme.** Two blocks redefine the same variables with dark values. The first applies when the OS is in dark mode; the second applies when `data-theme="dark"` is set on `<html>`. Changing a color means editing it in `:root` and, for dark mode, in both dark blocks.
- **Components.** Each part of the page has its own commented block: header, intro, filter chips, product grid and cards, cart drawer, toast, clickable cards, product page.
- **Clickable cards.** The picture link on each card is an invisible layer over the picture. The Roll button sits above that layer, so it rolls instead of opening the page.
- **Reduced motion.** The last block turns off the drawer slide and the roll spin for people who have "reduce motion" turned on.

## Common changes

**Add a product.** Add an object to `PRODUCTS` in `data.js`. It appears in the grid and gets its own page at `#product-<id>`.

```js
{
  id: "ruby-set", name: "Ruby Resin Set", cat: "sets", price: 26, spec: "7 pcs · 16 mm · resin",
  desc: "Deep red resin with gold numerals.",
  details: [["Pieces", SET_PIECES], ["Size", "16 mm d20"], ["Material", "Resin"]],
  art: "d20", pal: ["#F19196", "#C8323C", "#7F1A22", "#FFFFFF"], roll: 20, badge: "New",
},
```

| Field | Meaning |
| --- | --- |
| `id` | Unique key, used in saved carts and in the page address. Use letters, digits and dashes, and don't rename an existing one. |
| `name` | Display name. |
| `cat` | One of the ids in `CATS`. |
| `price` | Price in USD. |
| `spec` | The short line under the name on cards. |
| `desc` | One or two sentences for the product page. |
| `details` | `[label, value]` rows for the product page's Details table. `SET_PIECES` is a shared value for 7-piece sets. |
| `art` | The drawing: `d4`, `d6`, `d8`, `d10`, `d12`, `d20`, `tray`, `fold`, `tower`, `bag`, `vault`, `screen` or `tracker`. |
| `pal` | Four colors: light face, base face, dark face/outline, and ink (for numbers and details). |
| `roll` | Optional. `20`, `100` or `"4d6"` adds a Roll button. |
| `badge` | Optional corner label. Add `low: true` to show it in the accent color as a stock warning. |

**Add a category.** Add `{ id, label }` to `CATS` in `data.js` and use that id as `cat` on some products. The chip, its count and the product-page breadcrumb follow on their own.

**Change shipping.** Edit `FREE_SHIP` and `SHIP_FEE` at the top of `data.js`. The intro and product-page shipping lines read `FREE_SHIP`, so they update too.

**Change the product page layout.** Edit `ProductPage` in `app.js` for content and order, and the "Product page" block in `styles.css` for layout.

**Change colors or fonts.** Edit the tokens in `:root` in `styles.css`, and the matching dark values in both dark-theme blocks. The fonts are loaded by the Google Fonts `<link>` near the top of `index.html`.

**Add a new drawing.** Add an `if (kind === "...")` branch to `art()` in `art.js` that returns SVG markup for a 120 × 120 canvas, then use that name as a product's `art`.

## Limitations

- There is no backend. Products are hard-coded, and checkout only shows a confirmation.
- The cart is saved per browser. It doesn't follow a person to another device.
- Search matches plain substrings in the name and spec, with no typo tolerance.
- React loads from a CDN, so the page needs an internet connection. If the CDN can't be reached, the page stays blank.
