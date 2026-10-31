// Los Dados del Norte storefront app: React components for the shop, product pages and cart.
// Loaded last in index.html, after React, ReactDOM, htm, data.js and art.js.
//
// The page is a small single-page app. There is one HTML file, and React decides what to
// show from the address hash:
//   (no hash) or #shop    the shop: hero, filters and the product grid
//   #product-<id>         the product page for that product, e.g. #product-ember
// Product pages are not separate files. <ProductPage> builds each one from the product's
// entry in PRODUCTS (data.js), so adding a product to the catalog also gives it a page.
//
// The shop speaks Spanish (default) and English. Interface text lives in the STRINGS table
// below; catalog text lives in data.js as { es, en } pairs. The ES/EN switch in the header
// changes the language, and the choice is remembered in the browser.
//
// Components are written with htm, which turns tagged template strings into React elements.
// It reads like JSX, but runs in the browser with no build step:
//   html`<${Price} value=${p.price} />`  is the same as  <Price value={p.price} />  in JSX.

const { useState, useEffect, useRef, useCallback, createContext, useContext } = React;
const html = htm.bind(React.createElement);
const Fragment = React.Fragment; // groups several elements without adding a wrapper element

// ===== Interface text =====
// One entry per language. Plain values are strings; entries that need a number or name
// are functions. Keep the two languages' keys in sync when adding text.
const STRINGS = {
  es: {
    pageTitle: "Los Dados del Norte",
    homeLabel: "Los Dados del Norte, inicio de la tienda",
    place: "Monterrey, N.L.",
    searchPlaceholder: "Busca dados, charolas, bolsas…",
    searchLabel: "Buscar productos",
    cart: "Carrito",
    openCart: n => `Abrir carrito, ${n} ${n === 1 ? "artículo" : "artículos"}`,
    language: "Idioma",

    heroEyebrow: "Dados y accesorios de rol · Monterrey, Nuevo León",
    heroTagline: "Sets poliédricos y equipo para tu mesa de juego, con alma norteña. Cada set trae los 7 dados: d4, d6, d8, d10, d%, d12 y d20.",
    heroHint: "Tira cualquier dado para probarlo, o abre un producto para ver sus detalles.",
    perkShip: amount => `Envío gratis a todo México desde ${amount}`,
    perkChecked: "Cada set revisado a mano",
    perkReturns: "30 días para devoluciones",

    filterLabel: "Filtrar por categoría",
    sort: "Ordenar",
    sortFeatured: "Destacados",
    sortPriceAsc: "Precio: menor a mayor",
    sortPriceDesc: "Precio: mayor a menor",
    sortName: "Nombre",
    productsLabel: "Productos",
    noMatch: q => `Nada coincide con “${q}”.`,
    clearSearch: "Borrar búsqueda",

    add: "Agregar al carrito",
    addN: n => `Agregar ${n} al carrito`,
    added: "Agregado",
    toastAdded: name => `Agregaste ${name}`,
    toastAddedN: (n, name) => `Agregaste ${n} × ${name}`,
    fewer: name => `Menos ${name}`,
    more: name => `Más ${name}`,

    roll20: "Tirar d20",
    roll100: "Tirar d%",
    roll4d6: "Tirar 4d6",
    rollLabel: name => `Tirada de prueba: ${name}`,
    rolled: v => `Sacaste ${v}`,
    nat20: "¡20 natural!",
    nat1: "1 natural",

    crumbsLabel: "Ruta de navegación",
    shop: "Tienda",
    shipsFree: "Este pedido tiene envío gratis.",
    freeOver: amount => `Envío gratis en pedidos desde ${amount}.`,
    returns: "30 días para devoluciones.",
    details: "Detalles",
    moreIn: cat => `Más en ${cat.toLowerCase()}`,
    notFoundTitle: "No encontramos ese producto",
    notFoundBody: "Puede que ya no esté en el catálogo.",
    backToShop: "Volver a la tienda",
    notFoundPageTitle: "Producto no encontrado",

    yourCart: "Tu carrito",
    closeCart: "Cerrar carrito",
    freeUnlocked: "Ya tienes envío gratis.",
    addMore: amount => html`Agrega <strong>${amount}</strong> más y tu envío es gratis.`,
    remove: "Quitar",
    emptyCart: "Tu carrito está vacío. Agrega un set de dados para empezar a rodar.",
    subtotal: "Subtotal",
    shipping: "Envío",
    free: "Gratis",
    total: "Total",
    checkout: "Pagar",
    demoNote: "Tienda de demostración. Pagar no cobra nada.",
    orderConfirmed: "Pedido confirmado",
    orderBody: "Esta es una tienda de demostración: no se cobró nada y no se enviará nada. Vaciamos tu carrito.",
    keepShopping: "Seguir comprando",

    footerMade: "Hecho con orgullo en Monterrey, Nuevo León.",
    footerDemo: "Tienda de demostración: los productos y precios son ejemplos y no se procesan pedidos.",
  },
  en: {
    pageTitle: "Los Dados del Norte",
    homeLabel: "Los Dados del Norte, shop home",
    place: "Monterrey, N.L.",
    searchPlaceholder: "Search dice, trays, bags…",
    searchLabel: "Search products",
    cart: "Cart",
    openCart: n => `Open cart, ${n} ${n === 1 ? "item" : "items"}`,
    language: "Language",

    heroEyebrow: "Tabletop dice & gear · Monterrey, Nuevo León",
    heroTagline: "Polyhedral sets and table gear with a norteño soul. Every set is a full 7-piece kit: d4, d6, d8, d10, d%, d12 and d20.",
    heroHint: "Test-roll any die, or open a product to see its details.",
    perkShip: amount => `Free shipping anywhere in Mexico from ${amount}`,
    perkChecked: "Each set checked by hand",
    perkReturns: "30-day returns",

    filterLabel: "Filter by category",
    sort: "Sort",
    sortFeatured: "Featured",
    sortPriceAsc: "Price: low to high",
    sortPriceDesc: "Price: high to low",
    sortName: "Name",
    productsLabel: "Products",
    noMatch: q => `Nothing matches “${q}”.`,
    clearSearch: "Clear search",

    add: "Add to cart",
    addN: n => `Add ${n} to cart`,
    added: "Added",
    toastAdded: name => `Added ${name}`,
    toastAddedN: (n, name) => `Added ${n} × ${name}`,
    fewer: name => `Fewer ${name}`,
    more: name => `More ${name}`,

    roll20: "Roll d20",
    roll100: "Roll d%",
    roll4d6: "Roll 4d6",
    rollLabel: name => `Test roll: ${name}`,
    rolled: v => `Rolled ${v}`,
    nat20: "Natural 20",
    nat1: "Natural 1",

    crumbsLabel: "Breadcrumb",
    shop: "Shop",
    shipsFree: "This order ships free.",
    freeOver: amount => `Free shipping on orders from ${amount}.`,
    returns: "30-day returns.",
    details: "Details",
    moreIn: cat => `More ${cat.toLowerCase()}`,
    notFoundTitle: "We couldn’t find that product",
    notFoundBody: "It may have been removed from the catalog.",
    backToShop: "Back to the shop",
    notFoundPageTitle: "Product not found",

    yourCart: "Your cart",
    closeCart: "Close cart",
    freeUnlocked: "Free shipping unlocked.",
    addMore: amount => html`Add <strong>${amount}</strong> more for free shipping.`,
    remove: "Remove",
    emptyCart: "Your cart is empty. Add a dice set to get rolling.",
    subtotal: "Subtotal",
    shipping: "Shipping",
    free: "Free",
    total: "Total",
    checkout: "Check out",
    demoNote: "Demo store. Checkout does not charge anything.",
    orderConfirmed: "Order confirmed",
    orderBody: "This is a demo store, so nothing was charged and nothing will ship. Your cart has been cleared.",
    keepShopping: "Keep shopping",

    footerMade: "Made with pride in Monterrey, Nuevo León.",
    footerDemo: "Demo store: products and prices are examples and no orders are placed.",
  },
};

// The current language, shared with every component through React context.
// useLang() returns { lang, t, tx }:
//   t   the STRINGS entry for the current language, e.g. t.add
//   tx  picks the current language from a catalog value: tx({ es, en }) or tx("plain")
const LangContext = createContext(null);
const useLang = () => useContext(LangContext);
const pick = (value, lang) => (value && typeof value === "object" ? value[lang] ?? value.es : value);

// ===== Helpers =====

// Formats whole pesos, e.g. 1599 -> "$1,599". mxn() adds the currency code: "$1,599 MXN".
const money = n => "$" + Math.round(n).toLocaleString("es-MX");
const mxn = n => money(n) + " MXN";

// localStorage wrapper. Storage can be unavailable (private windows, blocked site data),
// so every call is wrapped in try/catch and falls back to the default value.
const store = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} },
};

// Random integer from 1 to n, like rolling an n-sided die.
const rollDie = n => 1 + Math.floor(Math.random() * n);

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Address of a product's page. Uses only letters, digits and dashes so the link also
// works when shared.
const productHref = id => `#product-${id}`;
const catOf = id => CATS.find(c => c.id === id);

// Logo colors: a red d20 with gold numerals, from the stage-suit palette in styles.css.
const LOGO_PAL = ["#E8505B", "#C8202F", "#7E1420", "#F2C14E"];

// ===== Hooks =====

// Reads the current route from the address hash and re-renders when it changes
// (clicking a product link, or the browser's back and forward buttons).
// Returns { page: "shop" } or { page: "product", id }.
function useRoute() {
  const parse = () => {
    const m = location.hash.match(/^#product-(.+)$/);
    return m ? { page: "product", id: decodeURIComponent(m[1]) } : { page: "shop" };
  };
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const onHash = () => setRoute(parse());
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

// The language: Spanish unless the viewer picked English before. Saved under "ldn-lang".
// Also sets <html lang>, so screen readers pronounce the page in the right language.
function useLanguage() {
  const [lang, setLang] = useState(() => (store.get("ldn-lang", "es") === "en" ? "en" : "es"));
  useEffect(() => {
    store.set("ldn-lang", lang);
    document.documentElement.lang = lang === "es" ? "es-MX" : "en";
  }, [lang]);
  return [lang, setLang];
}

// The cart maps product id -> quantity, e.g. { ember: 2, tower: 1 }. It is saved to
// localStorage under "ldn-cart" on every change, so it survives a reload.
function useCart() {
  const [cart, setCart] = useState(() => {
    const saved = store.get("ldn-cart", {});
    // Drop saved entries that no longer make sense (a removed product, or a bad quantity).
    for (const id of Object.keys(saved)) if (!byId[id] || !(saved[id] > 0)) delete saved[id];
    return saved;
  });
  useEffect(() => { store.set("ldn-cart", cart); }, [cart]);

  // add(id, 2) adds two; add(id, -1) removes one. A line that reaches 0 is removed.
  const add = useCallback((id, n = 1) => setCart(c => {
    const next = { ...c, [id]: (c[id] || 0) + n };
    if (next[id] <= 0) delete next[id];
    return next;
  }), []);
  const remove = useCallback(id => setCart(c => { const next = { ...c }; delete next[id]; return next; }), []);
  const clear = useCallback(() => setCart({}), []);
  return { cart, add, remove, clear };
}

// Test rolls for one product. roll() starts the spin; `result` is filled in when the spin
// ends (straight away when the viewer has asked for reduced motion). The result is stored
// as data ({ kind, value }) and turned into words at render time, so it follows the
// language switch.
function useRoll(product) {
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null); // { kind: "d20" | "d100" | "4d6", value, dice? }
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  // Clear the old result when the same component starts showing a different product.
  useEffect(() => { setResult(null); setRolling(false); }, [product.id]);

  const roll = () => {
    let next;
    if (product.roll === "4d6") {
      // 4d6 drop lowest: sort high to low and add the top three.
      const dice = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)].sort((a, b) => b - a);
      next = { kind: "4d6", dice, value: dice[0] + dice[1] + dice[2] };
    } else if (product.roll === 100) {
      next = { kind: "d100", value: rollDie(100) };
    } else {
      next = { kind: "d20", value: rollDie(20) };
    }
    setResult(null);
    setRolling(false);
    // Restart the spin on the next frame, so a second click mid-spin still replays it.
    requestAnimationFrame(() => setRolling(true));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setRolling(false); setResult(next); }, reducedMotion() ? 0 : 450);
  };
  return { rolling, result, roll };
}

// Turns a roll result into text in the current language. crit marks a natural 20 or a 100.
function describeRoll(r, t) {
  if (r.kind === "4d6") return { text: `${r.dice.join(" ")} → ${r.value}`, crit: false };
  if (r.kind === "d100") return { text: t.rolled(r.value), crit: r.value === 100 };
  if (r.value === 20) return { text: t.nat20, crit: true };
  if (r.value === 1) return { text: t.nat1, crit: false };
  return { text: t.rolled(r.value), crit: false };
}

// ===== Small components =====

// A drawing from art.js. The markup comes from our own catalog, never from user input,
// so inserting it as HTML is safe.
function Art({ kind, pal, className = "art" }) {
  return html`<svg className=${className} viewBox="0 0 120 120" aria-hidden="true"
    dangerouslySetInnerHTML=${{ __html: art(kind, pal) }} />`;
}
const ProductArt = ({ product, className }) => html`<${Art} kind=${product.art} pal=${product.pal} className=${className} />`;

// The square picture panel used on cards and the product page: drawing, corner badge,
// and for dice a Roll button with the latest result.
function Media({ product, large = false }) {
  const { t, tx } = useLang();
  const { rolling, result, roll } = useRoll(product);
  const shown = result && describeRoll(result, t);
  const rollText = product.roll === "4d6" ? t.roll4d6 : product.roll === 100 ? t.roll100 : t.roll20;
  return html`
    <div className=${"media" + (large ? " media-lg" : "") + (rolling ? " rolling" : "")}>
      ${product.badge && html`<span className=${"badge" + (product.low ? " low" : "")}>${tx(product.badge)}</span>`}
      <${ProductArt} product=${product} />
      ${product.roll && html`
        <button type="button" className="roll-btn" onClick=${roll} aria-label=${t.rollLabel(tx(product.name))}>${rollText}</button>`}
      ${shown && html`<span className=${"roll-out" + (shown.crit ? " crit" : "")} role="status">${shown.text}</span>`}
    </div>`;
}

// "Add to cart" button that shows "Added" for about a second after each click.
function AddButton({ onAdd, large = false, label }) {
  const { t } = useLang();
  const [added, setAdded] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const click = () => {
    onAdd();
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1100);
  };
  return html`<button type="button" className=${"add" + (large ? " add-lg" : "") + (added ? " added" : "")} onClick=${click}>
    ${added ? t.added : label ?? t.add}</button>`;
}

// A "− 1 +" quantity control. Used in the cart and on the product page.
function Stepper({ value, onChange, min = 1, name }) {
  const { t } = useLang();
  return html`
    <div className="qty">
      <button type="button" onClick=${() => onChange(value - 1)} disabled=${value <= min} aria-label=${t.fewer(name)}>−</button>
      <span aria-live="polite">${value}</span>
      <button type="button" onClick=${() => onChange(value + 1)} aria-label=${t.more(name)}>+</button>
    </div>`;
}

// ES / EN language switch.
function LangSwitch({ lang, setLang }) {
  const { t } = useLang();
  return html`
    <div className="lang" role="group" aria-label=${t.language}>
      ${[["es", "ES", "Español"], ["en", "EN", "English"]].map(([code, short, full]) => html`
        <button type="button" key=${code} lang=${code} aria-pressed=${lang === code} aria-label=${full}
          onClick=${() => setLang(code)}>${short}</button>`)}
    </div>`;
}

// ===== Header =====

function Header({ count, query, onQuery, onOpenCart, lang, setLang }) {
  const { t } = useLang();
  return html`
    <header className="top">
      <div className="wrap top-inner">
        <a className="brand" href="#shop" aria-label=${t.homeLabel}>
          <${Art} kind="d20" pal=${LOGO_PAL} className="brand-die" />
          <span className="brand-text">
            <b>Los Dados <span>del Norte</span></b>
            <small>${t.place}</small>
          </span>
        </a>
        <label className="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input id="q" type="search" placeholder=${t.searchPlaceholder} aria-label=${t.searchLabel}
            value=${query} onChange=${e => onQuery(e.target.value)} />
        </label>
        <${LangSwitch} lang=${lang} setLang=${setLang} />
        <button type="button" className="cart-btn" onClick=${onOpenCart} aria-label=${t.openCart(count)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
          <span className="label">${t.cart}</span>
          <span className="cart-count">${count}</span>
        </button>
      </div>
    </header>`;
}

// ===== Shop page =====

// The opening band: the name, where the shop is from, and the Cerro de la Silla on the
// horizon. The mountain is Monterrey's best-known landmark: two peaks with a deep dip
// between them, like a saddle, which gives it its name ("saddle hill"). The near ridge
// draws that profile, with the right-hand peak the taller one.
function Hero() {
  const { t } = useLang();
  return html`
    <section className="hero">
      <div className="wrap hero-inner">
        <span className="eyebrow">${t.heroEyebrow}</span>
        <h1 className="wordmark">Los Dados <span>del Norte</span></h1>
        <p className="hero-tagline">${t.heroTagline}</p>
        <ul className="perks">
          <li>${t.perkShip(money(FREE_SHIP))}</li>
          <li>${t.perkChecked}</li>
          <li>${t.perkReturns}</li>
        </ul>
      </div>
      <svg className="sierra" viewBox="0 0 1200 140" preserveAspectRatio="none" aria-hidden="true">
        <path className="sierra-back" d="M0 140V96c90-10 170-34 260-30s150 22 230 8 140-46 230-40 160 40 250 34 150-22 230-20v92Z"/>
        <path className="sierra-front" d="M0 140v-26c140-6 250-18 350-40l120-46c22-8 36-14 52-12 22 4 40 24 66 40 22 14 42 14 62 2 34-22 62-48 96-52 18-2 30 6 44 18l110 66c80 36 180 44 300 46v24Z"/>
      </svg>
    </section>`;
}

// One product in the grid. The picture and the name link to the product page; the Roll
// and Add buttons work in place without leaving the shop.
function ProductCard({ product, onAdd }) {
  const { tx } = useLang();
  const href = productHref(product.id);
  return html`
    <article className="card">
      <div className="card-media">
        <${Media} product=${product} />
        <a className="card-cover" href=${href} tabIndex="-1" aria-hidden="true"></a>
      </div>
      <div className="info">
        <h3><a className="card-link" href=${href}>${tx(product.name)}</a></h3>
        <span className="spec">${tx(product.spec)}</span>
      </div>
      <div className="buy">
        <span className="price">${money(product.price)}</span>
        <${AddButton} onAdd=${() => onAdd(product.id)} />
      </div>
    </article>`;
}

function Shop({ cat, setCat, sort, setSort, query, setQuery, onAdd }) {
  const { t, tx, lang } = useLang();
  const q = query.trim().toLowerCase();
  // Search matches the name and spec line in both languages, so either word works.
  const haystack = p => [p.name.es, p.name.en, p.spec.es, p.spec.en].join(" ").toLowerCase();
  let list = PRODUCTS.filter(p => (cat === "all" || p.cat === cat) && (!q || haystack(p).includes(q)));
  // "featured" keeps catalog order. Sorting copies the list so PRODUCTS itself is never reordered.
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "name") list = [...list].sort((a, b) => tx(a.name).localeCompare(tx(b.name), lang));

  return html`<${Fragment}>
    <${Hero} />
    <div className="wrap">
      <p className="hint">${t.heroHint}</p>
      <div className="controls">
        <div className="chips" role="group" aria-label=${t.filterLabel}>
          ${CATS.map(c => {
            const n = c.id === "all" ? PRODUCTS.length : PRODUCTS.filter(p => p.cat === c.id).length;
            return html`<button type="button" key=${c.id} className="chip" aria-pressed=${c.id === cat} onClick=${() => setCat(c.id)}>
              ${tx(c.label)}<span className="n">${n}</span></button>`;
          })}
        </div>
        <label className="sort">${t.sort}
          <select id="sort" value=${sort} onChange=${e => setSort(e.target.value)}>
            <option value="featured">${t.sortFeatured}</option>
            <option value="price-asc">${t.sortPriceAsc}</option>
            <option value="price-desc">${t.sortPriceDesc}</option>
            <option value="name">${t.sortName}</option>
          </select>
        </label>
      </div>

      <section className="grid" aria-label=${t.productsLabel}>
        ${list.length
          ? list.map(p => html`<${ProductCard} key=${p.id} product=${p} onAdd=${onAdd} />`)
          : html`<div className="empty">${t.noMatch(query)}<br />
              <button type="button" className="chip" onClick=${() => setQuery("")}>${t.clearSearch}</button></div>`}
      </section>
    </div>
  <//>`;
}

// ===== Product page =====

// Built from the product's catalog entry; there is no separate file per product.
function ProductPage({ id, onAdd }) {
  const { t, tx, lang } = useLang();
  const product = byId[id];
  const [qty, setQty] = useState(1);
  const heading = useRef();

  // Opening a product: reset the quantity and move keyboard focus to the heading so screen
  // readers announce the new page.
  useEffect(() => {
    setQty(1);
    heading.current?.focus({ preventScroll: true });
  }, [id]);
  // Name the browser tab after the product, in the current language.
  useEffect(() => {
    document.title = `${product ? tx(product.name) : t.notFoundPageTitle} · ${t.pageTitle}`;
  }, [id, lang]);

  if (!product) {
    return html`
      <section className="wrap missing">
        <h1 tabIndex="-1" ref=${heading}>${t.notFoundTitle}</h1>
        <p>${t.notFoundBody}</p>
        <a className="chip" href="#shop">${t.backToShop}</a>
      </section>`;
  }

  const catName = tx(catOf(product.cat).label);
  // Up to three other products from the same category.
  const related = PRODUCTS.filter(p => p.cat === product.cat && p.id !== product.id).slice(0, 3);
  const freeShip = product.price * qty >= FREE_SHIP;

  return html`
    <div className="wrap">
      <nav className="crumbs" aria-label=${t.crumbsLabel}>
        <a href="#shop">${t.shop}</a><span aria-hidden="true">/</span>
        <span>${catName}</span><span aria-hidden="true">/</span>
        <span aria-current="page">${tx(product.name)}</span>
      </nav>

      <article className="pdp">
        <${Media} product=${product} large />
        <div className="pdp-info">
          <span className="eyebrow">${catName}</span>
          <h1 tabIndex="-1" ref=${heading}>${tx(product.name)}</h1>
          <span className="pdp-price">${mxn(product.price)}</span>
          <p className="pdp-desc">${tx(product.desc)}</p>

          <div className="pdp-buy">
            <${Stepper} value=${qty} onChange=${v => setQty(Math.max(1, v))} name=${tx(product.name)} />
            <${AddButton} large label=${qty > 1 ? t.addN(qty) : t.add} onAdd=${() => onAdd(product.id, qty)} />
          </div>
          <p className="pdp-ship">${freeShip ? t.shipsFree : t.freeOver(money(FREE_SHIP))} ${t.returns}</p>

          <h2 className="pdp-h2">${t.details}</h2>
          <dl className="details">
            ${product.details.map(([key, value]) => html`<div key=${key}><dt>${tx(DETAIL_LABELS[key])}</dt><dd>${tx(value)}</dd></div>`)}
          </dl>
        </div>
      </article>

      ${related.length > 0 && html`
        <section className="related">
          <h2 className="pdp-h2">${t.moreIn(catName)}</h2>
          <div className="grid">
            ${related.map(p => html`<${ProductCard} key=${p.id} product=${p} onAdd=${onAdd} />`)}
          </div>
        </section>`}
    </div>`;
}

// ===== Cart drawer =====

function CartDrawer({ open, onClose, cart, add, remove, clear }) {
  const { t, tx } = useLang();
  const [placed, setPlaced] = useState(false); // true right after checkout: show the confirmation
  const closeBtn = useRef();
  const ids = Object.keys(cart);
  const sub = ids.reduce((s, id) => s + byId[id].price * cart[id], 0);
  const ship = sub === 0 || sub >= FREE_SHIP ? 0 : SHIP_FEE; // free on an empty cart or over the threshold
  const pct = Math.min(100, sub / FREE_SHIP * 100);

  // Opening moves keyboard focus into the drawer; Escape closes it.
  useEffect(() => {
    if (!open) return;
    setPlaced(false);
    closeBtn.current?.focus();
    const onKey = e => { if (e.key === "Escape") onClose(); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  // Checkout is a demo: it empties the cart and shows a confirmation. Nothing is sent anywhere.
  const checkout = () => { clear(); setPlaced(true); };

  return html`<${Fragment}>
    <div className="scrim" hidden=${!open} onClick=${onClose}></div>
    <aside className=${"drawer" + (open ? " open" : "")} aria-label=${t.yourCart} aria-hidden=${!open} inert=${open ? undefined : ""}>
      <div className="drawer-head">
        <h2>${t.yourCart}</h2>
        <button type="button" className="icon-btn" ref=${closeBtn} onClick=${onClose} aria-label=${t.closeCart}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </div>
      <div className="drawer-body">
        ${placed ? html`
          <div className="done">
            <${Art} kind="d20" pal=${["#7FD3A8", "#2F9467", "#1F5E42", "#FFFFFF"]} />
            <h3>${t.orderConfirmed}</h3>
            <p>${t.orderBody}</p>
            <button type="button" className="chip" onClick=${onClose}>${t.keepShopping}</button>
          </div>` : html`<${Fragment}>
          <div className="ship">
            ${sub >= FREE_SHIP
              ? html`<span><strong>${t.freeUnlocked}</strong></span>`
              : html`<span>${t.addMore(money(FREE_SHIP - sub))}</span>`}
            <div className="bar"><i style=${{ width: pct + "%" }}></i></div>
          </div>
          <div className="lines">
            ${ids.length ? ids.map(id => {
              const p = byId[id];
              return html`
                <div className="line" key=${id}>
                  <a className="thumb" href=${productHref(id)} onClick=${onClose} tabIndex="-1" aria-hidden="true"><${ProductArt} product=${p} className="" /></a>
                  <div className="line-info">
                    <a className="line-name" href=${productHref(id)} onClick=${onClose}>${tx(p.name)}</a>
                    <${Stepper} value=${cart[id]} min=${0} onChange=${v => add(id, v - cart[id])} name=${tx(p.name)} />
                  </div>
                  <div className="line-right">
                    <span className="price">${money(p.price * cart[id])}</span>
                    <button type="button" className="remove" onClick=${() => remove(id)}>${t.remove}</button>
                  </div>
                </div>`;
            }) : html`<div className="drawer-empty">${t.emptyCart}</div>`}
          </div>
          <div className="totals">
            <div className="row"><span>${t.subtotal}</span><span>${money(sub)}</span></div>
            <div className="row"><span>${t.shipping}</span><span>${sub === 0 ? "—" : ship ? money(ship) : t.free}</span></div>
            <div className="row total"><span>${t.total}</span><span>${mxn(sub + ship)}</span></div>
            <button type="button" className="checkout" onClick=${checkout} disabled=${!ids.length}>${t.checkout}</button>
            <p className="note">${t.demoNote}</p>
          </div>
        <//>`}
      </div>
    </aside>
  <//>`;
}

// ===== Toast =====

// Shows a short message at the bottom of the screen for 1.6 seconds. Each new message
// restarts the timer.
function useToast() {
  const [msg, setMsg] = useState(null);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const show = useCallback(text => {
    setMsg(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 1600);
  }, []);
  return [msg, show];
}

// ===== App =====
// Owns all shared state: the language, the route, the cart, the shop's filters (kept here so
// they survive a visit to a product page) and whether the cart drawer is open.
function App() {
  const [lang, setLang] = useLanguage();
  const langValue = { lang, t: STRINGS[lang], tx: value => pick(value, lang) };
  const { t, tx } = langValue;

  const route = useRoute();
  const { cart, add, remove, clear } = useCart();
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("featured");
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, showToast] = useToast();

  // Remember how far down the shop was scrolled, so "Back" returns to the same spot.
  const shopScroll = useRef(0);
  const lastPage = useRef(route.page);
  useEffect(() => {
    if (route.page === "shop") {
      if (lastPage.current !== "shop") requestAnimationFrame(() => scrollTo(0, shopScroll.current));
    } else {
      scrollTo(0, 0);
    }
    lastPage.current = route.page;
  }, [route.page, route.id]);
  useEffect(() => {
    if (route.page === "shop") document.title = t.pageTitle;
  }, [route.page, lang]);
  useEffect(() => {
    const onScroll = () => { if (lastPage.current === "shop") shopScroll.current = scrollY; };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  const addToCart = (id, n = 1) => {
    add(id, n);
    const name = tx(byId[id].name);
    showToast(n > 1 ? t.toastAddedN(n, name) : t.toastAdded(name));
  };

  // Typing in the search box from a product page goes back to the shop to show results.
  const onQuery = value => {
    setQuery(value);
    if (route.page !== "shop") location.hash = "shop";
  };

  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  return html`
    <${LangContext.Provider} value=${langValue}>
      <${Header} count=${count} query=${query} onQuery=${onQuery} onOpenCart=${() => setCartOpen(true)}
        lang=${lang} setLang=${setLang} />
      <main id="top">
        ${route.page === "product"
          ? html`<${ProductPage} id=${route.id} onAdd=${addToCart} />`
          : html`<${Shop} cat=${cat} setCat=${setCat} sort=${sort} setSort=${setSort}
              query=${query} setQuery=${setQuery} onAdd=${addToCart} />`}
      </main>
      <footer>
        <div className="wrap foot-inner">
          <${Art} kind="d20" pal=${LOGO_PAL} className="foot-die" />
          <div><strong>${t.footerMade}</strong><br />${t.footerDemo}</div>
        </div>
      </footer>
      <${CartDrawer} open=${cartOpen} onClose=${() => setCartOpen(false)} cart=${cart} add=${add} remove=${remove} clear=${clear} />
      ${toast && html`<div className="toast" role="status">${toast}</div>`}
    <//>`;
}

// ===== Start =====
ReactDOM.createRoot(document.getElementById("root")).render(html`<${App} />`);
