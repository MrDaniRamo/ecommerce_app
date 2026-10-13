// Twenty Sides storefront app: React components for the shop, product pages and cart.
// Loaded last in index.html, after React, ReactDOM, htm, data.js and art.js.
//
// The page is a small single-page app. There is one HTML file, and React decides what to
// show from the address hash:
//   (no hash) or #shop    the shop: intro, filters and the product grid
//   #product-<id>         the product page for that product, e.g. #product-ember
// Product pages are not separate files. <ProductPage> builds each one from the product's
// entry in PRODUCTS (data.js), so adding a product to the catalog also gives it a page.
//
// Components are written with htm, which turns tagged template strings into React elements.
// It reads like JSX, but runs in the browser with no build step:
//   html`<${Price} value=${p.price} />`  is the same as  <Price value={p.price} />  in JSX.

const { useState, useEffect, useRef, useCallback } = React;
const html = htm.bind(React.createElement);
const Fragment = React.Fragment; // groups several elements without adding a wrapper element

// ===== Helpers =====

// Formats a number of dollars, e.g. 24 -> "$24.00".
const money = n => "$" + n.toFixed(2);

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
const catLabel = id => CATS.find(c => c.id === id)?.label ?? "";

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

// The cart maps product id -> quantity, e.g. { ember: 2, tower: 1 }. It is saved to
// localStorage under "ts-cart" on every change, so it survives a reload.
function useCart() {
  const [cart, setCart] = useState(() => {
    const saved = store.get("ts-cart", {});
    // Drop saved entries that no longer make sense (a removed product, or a bad quantity).
    for (const id of Object.keys(saved)) if (!byId[id] || !(saved[id] > 0)) delete saved[id];
    return saved;
  });
  useEffect(() => { store.set("ts-cart", cart); }, [cart]);

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
// ends (straight away when the viewer has asked for reduced motion).
function useRoll(product) {
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null); // { text, crit }
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  // Clear the old result when the same component starts showing a different product.
  useEffect(() => { setResult(null); setRolling(false); }, [product.id]);

  const roll = () => {
    let text, crit = false;
    if (product.roll === "4d6") {
      // 4d6 drop lowest: sort high to low and add the top three.
      const rs = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)].sort((a, b) => b - a);
      text = `${rs.join(" ")} → ${rs[0] + rs[1] + rs[2]}`;
    } else if (product.roll === 100) {
      const v = rollDie(100); text = `Rolled ${v}`; crit = v === 100;
    } else {
      const v = rollDie(20); crit = v === 20;
      text = v === 20 ? "Natural 20" : v === 1 ? "Natural 1" : `Rolled ${v}`;
    }
    setResult(null);
    setRolling(false);
    // Restart the spin on the next frame, so a second click mid-spin still replays it.
    requestAnimationFrame(() => setRolling(true));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setRolling(false); setResult({ text, crit }); }, reducedMotion() ? 0 : 450);
  };
  return { rolling, result, roll };
}

// ===== Small components =====

// A product drawing. `art` is the markup string from art.js; it comes from our own catalog,
// never from user input, so inserting it as HTML is safe.
function ProductArt({ product, className = "art" }) {
  return html`<svg className=${className} viewBox="0 0 120 120" aria-hidden="true"
    dangerouslySetInnerHTML=${{ __html: art(product.art, product.pal) }} />`;
}

// The label on a product's Roll button.
const rollLabel = p => p.roll === "4d6" ? "Roll 4d6" : p.roll === 100 ? "Roll d%" : "Roll d20";

// The square picture panel used on cards and the product page: drawing, corner badge,
// and for dice a Roll button with the latest result.
function Media({ product, large = false }) {
  const { rolling, result, roll } = useRoll(product);
  return html`
    <div className=${"media" + (large ? " media-lg" : "") + (rolling ? " rolling" : "")}>
      ${product.badge && html`<span className=${"badge" + (product.low ? " low" : "")}>${product.badge}</span>`}
      <${ProductArt} product=${product} />
      ${product.roll && html`
        <button type="button" className="roll-btn" onClick=${roll} aria-label=${`Test roll: ${product.name}`}>${rollLabel(product)}</button>`}
      ${result && html`<span className=${"roll-out" + (result.crit ? " crit" : "")} role="status">${result.text}</span>`}
    </div>`;
}

// "Add to cart" button that shows "Added" for about a second after each click.
function AddButton({ onAdd, large = false, label = "Add to cart" }) {
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
    ${added ? "Added" : label}</button>`;
}

// A "− 1 +" quantity control. Used in the cart and on the product page.
function Stepper({ value, onChange, min = 1, name }) {
  return html`
    <div className="qty">
      <button type="button" onClick=${() => onChange(value - 1)} disabled=${value <= min} aria-label=${`Fewer ${name}`}>−</button>
      <span aria-live="polite">${value}</span>
      <button type="button" onClick=${() => onChange(value + 1)} aria-label=${`More ${name}`}>+</button>
    </div>`;
}

// ===== Header =====

function Header({ count, query, onQuery, onOpenCart }) {
  return html`
    <header className="top">
      <div className="wrap top-inner">
        <a className="brand" href="#shop" aria-label="Twenty Sides shop home">
          <svg viewBox="0 0 120 120" aria-hidden="true"
            dangerouslySetInnerHTML=${{ __html: art("d20", ["#E0566F", "#A3213A", "#6E1427", "#FFFFFF"]) }} />
          <b>Twenty Sides</b>
        </a>
        <label className="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input id="q" type="search" placeholder="Search dice, trays, bags…" aria-label="Search products"
            value=${query} onChange=${e => onQuery(e.target.value)} />
        </label>
        <button type="button" className="cart-btn" onClick=${onOpenCart} aria-label=${`Open cart, ${count} items`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
          <span className="label">Cart</span>
          <span className="cart-count">${count}</span>
        </button>
      </div>
    </header>`;
}

// ===== Shop page =====

// One product in the grid. The picture and the name link to the product page; the Roll
// and Add buttons work in place without leaving the shop.
function ProductCard({ product, onAdd }) {
  const href = productHref(product.id);
  return html`
    <article className="card">
      <div className="card-media">
        <${Media} product=${product} />
        <a className="card-cover" href=${href} tabIndex="-1" aria-hidden="true"></a>
      </div>
      <div className="info">
        <h3><a className="card-link" href=${href}>${product.name}</a></h3>
        <span className="spec">${product.spec}</span>
      </div>
      <div className="buy">
        <span className="price">${money(product.price)}</span>
        <${AddButton} onAdd=${() => onAdd(product.id)} />
      </div>
    </article>`;
}

function Shop({ cat, setCat, sort, setSort, query, setQuery, onAdd }) {
  const q = query.trim().toLowerCase();
  let list = PRODUCTS.filter(p => (cat === "all" || p.cat === cat)
    && (!q || (p.name + " " + p.spec).toLowerCase().includes(q)));
  // "featured" keeps catalog order. Sorting copies the list so PRODUCTS itself is never reordered.
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

  return html`<${Fragment}>
    <section className="intro">
      <span className="eyebrow">Dice & table gear</span>
      <h1>Polyhedral sets and the gear that keeps them on the table</h1>
      <p>Every set is a full 7-piece kit: d4, d6, d8, d10, d%, d12 and d20. Test-roll any die, or open a product to see its details.</p>
      <div className="perks"><span>Free shipping over ${money(FREE_SHIP).replace(".00", "")}</span><span>Each set checked for balance</span><span>30-day returns</span></div>
    </section>

    <div className="controls">
      <div className="chips" role="group" aria-label="Filter by category">
        ${CATS.map(c => {
          const n = c.id === "all" ? PRODUCTS.length : PRODUCTS.filter(p => p.cat === c.id).length;
          return html`<button type="button" key=${c.id} className="chip" aria-pressed=${c.id === cat} onClick=${() => setCat(c.id)}>
            ${c.label}<span className="n">${n}</span></button>`;
        })}
      </div>
      <label className="sort">Sort
        <select id="sort" value=${sort} onChange=${e => setSort(e.target.value)}>
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name</option>
        </select>
      </label>
    </div>

    <section className="grid" aria-label="Products">
      ${list.length
        ? list.map(p => html`<${ProductCard} key=${p.id} product=${p} onAdd=${onAdd} />`)
        : html`<div className="empty">Nothing matches “${query}”.<br />
            <button type="button" className="chip" onClick=${() => setQuery("")}>Clear search</button></div>`}
    </section><//>`;
}

// ===== Product page =====

// Built from the product's catalog entry; there is no separate file per product.
function ProductPage({ id, onAdd }) {
  const product = byId[id];
  const [qty, setQty] = useState(1);
  const heading = useRef();

  // Opening a product: reset the quantity, name the browser tab, and move keyboard focus
  // to the heading so screen readers announce the new page.
  useEffect(() => {
    setQty(1);
    document.title = product ? `${product.name} · Twenty Sides` : "Product not found · Twenty Sides";
    heading.current?.focus({ preventScroll: true });
  }, [id]);

  if (!product) {
    return html`
      <section className="missing">
        <h1 tabIndex="-1" ref=${heading}>We couldn’t find that product</h1>
        <p>It may have been removed from the catalog.</p>
        <a className="chip" href="#shop">Back to the shop</a>
      </section>`;
  }

  // Up to three other products from the same category.
  const related = PRODUCTS.filter(p => p.cat === product.cat && p.id !== product.id).slice(0, 3);
  const freeShip = product.price * qty >= FREE_SHIP;

  return html`<${Fragment}>
    <nav className="crumbs" aria-label="Breadcrumb">
      <a href="#shop">Shop</a><span aria-hidden="true">/</span>
      <span>${catLabel(product.cat)}</span><span aria-hidden="true">/</span>
      <span aria-current="page">${product.name}</span>
    </nav>

    <article className="pdp">
      <${Media} product=${product} large />
      <div className="pdp-info">
        <span className="eyebrow">${catLabel(product.cat)}</span>
        <h1 tabIndex="-1" ref=${heading}>${product.name}</h1>
        <span className="pdp-price">${money(product.price)}</span>
        <p className="pdp-desc">${product.desc}</p>

        <div className="pdp-buy">
          <${Stepper} value=${qty} onChange=${v => setQty(Math.max(1, v))} name=${product.name} />
          <${AddButton} large label=${qty > 1 ? `Add ${qty} to cart` : "Add to cart"} onAdd=${() => onAdd(product.id, qty)} />
        </div>
        <p className="pdp-ship">${freeShip
          ? "This order ships free."
          : `Free shipping on orders over ${money(FREE_SHIP).replace(".00", "")}.`} 30-day returns.</p>

        <h2 className="pdp-h2">Details</h2>
        <dl className="details">
          ${product.details.map(([k, v]) => html`<div key=${k}><dt>${k}</dt><dd>${v}</dd></div>`)}
        </dl>
      </div>
    </article>

    ${related.length > 0 && html`
      <section className="related">
        <h2 className="pdp-h2">More ${catLabel(product.cat).toLowerCase()}</h2>
        <div className="grid">
          ${related.map(p => html`<${ProductCard} key=${p.id} product=${p} onAdd=${onAdd} />`)}
        </div>
      </section>`}<//>`;
}

// ===== Cart drawer =====

function CartDrawer({ open, onClose, cart, add, remove, clear }) {
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
    <aside className=${"drawer" + (open ? " open" : "")} aria-label="Cart" aria-hidden=${!open} inert=${open ? undefined : ""}>
      <div className="drawer-head">
        <h2>Your cart</h2>
        <button type="button" className="icon-btn" ref=${closeBtn} onClick=${onClose} aria-label="Close cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </div>
      <div className="drawer-body">
        ${placed ? html`
          <div className="done">
            <svg className="art" viewBox="0 0 120 120" aria-hidden="true"
              dangerouslySetInnerHTML=${{ __html: art("d20", ["#7FD3A8", "#2F9467", "#1F5E42", "#FFFFFF"]) }} />
            <h3>Order confirmed</h3>
            <p>This is a demo store, so nothing was charged and nothing will ship. Your cart has been cleared.</p>
            <button type="button" className="chip" onClick=${onClose}>Keep shopping</button>
          </div>` : html`
          <div className="ship">
            ${sub >= FREE_SHIP
              ? html`<span><strong>Free shipping unlocked.</strong></span>`
              : html`<span>Add <strong>${money(FREE_SHIP - sub)}</strong> more for free shipping.</span>`}
            <div className="bar"><i style=${{ width: pct + "%" }}></i></div>
          </div>
          <div className="lines">
            ${ids.length ? ids.map(id => {
              const p = byId[id];
              return html`
                <div className="line" key=${id}>
                  <a className="thumb" href=${productHref(id)} onClick=${onClose} tabIndex="-1" aria-hidden="true"><${ProductArt} product=${p} className="" /></a>
                  <div className="line-info">
                    <a className="line-name" href=${productHref(id)} onClick=${onClose}>${p.name}</a>
                    <${Stepper} value=${cart[id]} min=${0} onChange=${v => add(id, v - cart[id])} name=${p.name} />
                  </div>
                  <div className="line-right">
                    <span className="price">${money(p.price * cart[id])}</span>
                    <button type="button" className="remove" onClick=${() => remove(id)}>Remove</button>
                  </div>
                </div>`;
            }) : html`<div className="drawer-empty">Your cart is empty. Add a dice set to get rolling.</div>`}
          </div>
          <div className="totals">
            <div className="row"><span>Subtotal</span><span>${money(sub)}</span></div>
            <div className="row"><span>Shipping</span><span>${sub === 0 ? "—" : ship ? money(ship) : "Free"}</span></div>
            <div className="row total"><span>Total</span><span>${money(sub + ship)}</span></div>
            <button type="button" className="checkout" onClick=${checkout} disabled=${!ids.length}>Check out</button>
            <p className="note">Demo store. Checkout does not charge anything.</p>
          </div>`}
      </div>
    </aside><//>`;
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
// Owns all shared state: the route, the cart, the shop's filters (kept here so they survive
// a visit to a product page) and whether the cart drawer is open.
function App() {
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
      document.title = "Twenty Sides Shop";
      if (lastPage.current !== "shop") requestAnimationFrame(() => scrollTo(0, shopScroll.current));
    } else {
      scrollTo(0, 0);
    }
    lastPage.current = route.page;
  }, [route.page, route.id]);
  useEffect(() => {
    const onScroll = () => { if (lastPage.current === "shop") shopScroll.current = scrollY; };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  const addToCart = useCallback((id, n = 1) => {
    add(id, n);
    showToast(n > 1 ? `Added ${n} × ${byId[id].name}` : `Added ${byId[id].name}`);
  }, [add, showToast]);

  // Typing in the search box from a product page goes back to the shop to show results.
  const onQuery = value => {
    setQuery(value);
    if (route.page !== "shop") location.hash = "shop";
  };

  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  return html`<${Fragment}>
    <${Header} count=${count} query=${query} onQuery=${onQuery} onOpenCart=${() => setCartOpen(true)} />
    <main className="wrap" id="top">
      ${route.page === "product"
        ? html`<${ProductPage} id=${route.id} onAdd=${addToCart} />`
        : html`<${Shop} cat=${cat} setCat=${setCat} sort=${sort} setSort=${setSort}
            query=${query} setQuery=${setQuery} onAdd=${addToCart} />`}
    </main>
    <footer><div className="wrap">Twenty Sides is a demo storefront. Products and prices are examples and no orders are placed.</div></footer>
    <${CartDrawer} open=${cartOpen} onClose=${() => setCartOpen(false)} cart=${cart} add=${add} remove=${remove} clear=${clear} />
    ${toast && html`<div className="toast" role="status">${toast}</div>`}<//>`;
}

// ===== Start =====
ReactDOM.createRoot(document.getElementById("root")).render(html`<${App} />`);
