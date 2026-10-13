# Twenty Sides storefront

A demo online shop for D&D dice and table accessories. It is three static files with no build step, no framework and no image files:

| File | Contents |
| --- | --- |
| `index.html` | The markup. It loads `styles.css` and `app.js`. |
| `styles.css` | All styling: design tokens for light and dark themes, then component styles. |
| `app.js` | All behavior: the product catalog, product drawings, cart and rendering. |

Live page: https://claude.ai/artifact/XMVCeNVSqyYdztuNRa9jF9

## Running it locally

Open `storefront/index.html` in a browser. Keep the three files together in the same folder, since the page loads the other two by relative path. Nothing needs to be installed. The only network requests are for Google Fonts, and the page falls back to system fonts without them.

## What the page does

| Feature | How it works |
| --- | --- |
| Product grid | 17 example products, drawn from the `PRODUCTS` array. |
| Category filter | Chips across the top (All, Dice sets, Single dice, Trays & towers, Bags & storage, GM gear), each with a product count. |
| Search | Matches the typed text against each product's name and spec line. Updates as you type. |
| Sort | Featured (catalog order), price low to high, price high to low, or name. |
| Test roll | Dice products have a Roll button. Sets and single d20s roll a d20 and call out a natural 20 or natural 1. The percentile pair rolls d% (1–100). The d6 brick rolls 4d6 and drops the lowest die, the usual way to roll a character stat. |
| Cart | A drawer that slides in from the right. You can change quantities and remove items, and it shows subtotal, shipping and total. |
| Shipping | $5 flat. Free when the subtotal reaches $50, with a progress bar showing how far away that is. |
| Checkout | Demo only. It empties the cart and shows a confirmation. Nothing is charged or sent anywhere. |
| Saved cart | The cart is saved in the browser's `localStorage`, so it survives a reload. Each browser has its own cart. |
| Themes | Light and dark, following the system setting. |
| Phones | Two-column grid, chips scroll sideways, and the header hides the wordmark to make room for search. |

## How the code is organized

### 1. Styles (`styles.css`)

- **Design tokens.** The `:root` block defines every color (`--bg`, `--fg`, `--accent`…) and font (`--font-display`, `--font-body`, `--font-mono`) as a CSS variable. Components use only these variables, never raw colors.
- **Dark theme.** Two blocks redefine the same variables with dark values. The first applies when the OS is in dark mode; the second applies when `data-theme="dark"` is set on `<html>`. Changing a color means editing it in `:root` and, for dark mode, in both dark blocks.
- **Components.** Each section of the page has its own commented block: header, intro, filter chips, product grid and cards, cart drawer, toast.
- **Reduced motion.** The last block turns off the drawer slide and the roll spin for people who have "reduce motion" turned on.

### 2. Markup (`index.html`)

A static shell with empty containers that the script fills in:

| Element | Filled by |
| --- | --- |
| `#logo-die` (header logo) | a d20 drawing from `art()` |
| `#chips` (category filter) | `renderChips()` |
| `#grid` (product cards) | `renderGrid()` |
| `#drawer-body` (cart contents) | `renderCart()` |
| `#toast` (status message) | `toast()` |

### 3. Script (`app.js`)

`index.html` loads it at the end of the page, after all the containers below exist, so the script can find them as soon as it runs.

All code runs inside one function that runs immediately, so nothing leaks into the global scope. The sections, top to bottom:

1. **Store settings.** `FREE_SHIP` (free-shipping threshold) and `SHIP_FEE`.
2. **Categories.** `CATS` lists the filter chips in display order.
3. **Product catalog.** `PRODUCTS` is the full catalog. Its order is the "Featured" sort order. `byId` is a lookup from product id to product.
4. **Product art.** `art(kind, palette)` returns SVG markup for a die or accessory. It is built from three helpers: `pt()` (a point on a circle), `poly()` (a polygon) and `label()` (a die's number). `svg(product)` wraps it in an `<svg>` element.
5. **State.** `store` is a `localStorage` wrapper that never throws. `cart` maps product id to quantity, for example `{ ember: 2, tower: 1 }`, saved under the key `ts-cart`. `cat`, `sort` and `q` hold the current category, sort order and search text.
6. **Catalog rendering.** `renderChips()` and `renderGrid()` redraw from the state above. The grid has one click handler for Add to cart, Roll and Clear search.
7. **Test rolls.** `d(n)` rolls an n-sided die. `roll(button)` picks the dice for that product, plays the spin, then shows the result.
8. **Cart drawer.** `openCart()` and `closeCart()` show and hide it. `renderCart()` draws the count, shipping bar, cart lines and totals. The drawer has one click handler for +/−, Remove, Check out and Keep shopping.
9. **Toast.** `toast(message)` shows a short message for 1.6 seconds.
10. **Start.** Draws the chips, grid and cart once on load.

### How changes flow

The page does not use a framework. It follows one simple loop:

```
user clicks or types
  → a handler updates state (cat / sort / q / cart)
  → the matching render function rebuilds that part of the page with innerHTML
  → saveCart() also writes the cart to localStorage
```

The click handlers are attached once, to the containers (`#chips`, `#grid`, `#drawer-body`), not to each button. When a container's contents are rebuilt, its handler still works. Each handler reads the clicked button's `data-*` attribute (`data-add`, `data-roll`, `data-inc`, `data-dec`, `data-rm`, `data-cat`) to tell what was clicked. This pattern is called event delegation.

## Common changes

**Add a product.** Add an object to `PRODUCTS` in `app.js`:

```js
{ id: "ruby-set", name: "Ruby Resin Set", cat: "sets", price: 26,
  spec: "7 pcs · 16 mm · resin", art: "d20",
  pal: ["#F19196", "#C8323C", "#7F1A22", "#FFFFFF"], roll: 20, badge: "New" }
```

| Field | Meaning |
| --- | --- |
| `id` | Unique key. It is also stored in saved carts, so don't rename an existing one. |
| `name` | Display name. |
| `cat` | One of the ids in `CATS`. |
| `price` | Price in USD. |
| `spec` | The short line under the name. |
| `art` | The drawing: `d4`, `d6`, `d8`, `d10`, `d12`, `d20`, `tray`, `fold`, `tower`, `bag`, `vault`, `screen` or `tracker`. |
| `pal` | Four colors: light face, base face, dark face/outline, and ink (for numbers and details). |
| `roll` | Optional. `20`, `100` or `"4d6"` adds a Roll button. |
| `badge` | Optional corner label. Add `low: true` to show it in the accent color as a stock warning. |

**Add a category.** Add `{ id, label }` to `CATS` in `app.js` and use that id as `cat` on some products. The chip and its count appear on their own.

**Change shipping.** Edit `FREE_SHIP` and `SHIP_FEE` at the top of `app.js`. Also update the "Free shipping over $50" line in the intro markup in `index.html`.

**Change colors or fonts.** Edit the tokens in `:root` in `styles.css`, and the matching dark values in both dark-theme blocks. The fonts are loaded by the Google Fonts `<link>` near the top of `index.html`.

**Add a new drawing.** Add an `if (kind === "...")` branch to `art()` in `app.js` that returns SVG markup for a 120 × 120 canvas, then use that name as a product's `art`.

## Limitations

- There is no backend. Products are hard-coded, and checkout only shows a confirmation.
- The cart is saved per browser. It doesn't follow a person to another device.
- Search matches plain substrings in the name and spec, with no typo tolerance.
