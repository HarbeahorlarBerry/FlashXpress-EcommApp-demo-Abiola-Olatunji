import React, { useState, useEffect, useRef } from "react";

const C = {
  USD: { r: 1, l: "en-US" },
  NGN: { r: 1500, l: "en-NG" },
  GBP: { r: 0.78, l: "en-GB" },
  EUR: { r: 0.92, l: "de-DE" },
};

const P = [
  { n: "Wireless Earbuds Pro", e: "🎧", p: 39.99, c: "#fde68a" },
  { n: "Smart Watch X", e: "⌚", p: 89, c: "#bfdbfe" },
  { n: "Running Shoes", e: "👟", p: 64.5, c: "#fecaca" },
  { n: "Canvas Backpack", e: "🎒", p: 42, c: "#bbf7d0" },
];

export default function App3DPreview() {
  const [cur, setCur] = useState("USD");
  const [view, setView] = useState("store");
  const [mode, setMode] = useState("screens");
  const [theme, setTheme] = useState("system");
  const [gap, setGap] = useState(90);
  
  const stageRef = useRef(null);
  const rigRef = useRef(null);
  
  // Drag rotation state refs
  const dragRef = useRef(null);
  const rotRef = useRef({ rx: 0, ry: 0, tx: 0, ty: 0 });

  const f = (u) =>
    new Intl.NumberFormat(C[cur].l, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: cur === "NGN" ? 0 : 2,
    }).format(u * C[cur].r);

  // Theme effect
  useEffect(() => {
    if (theme === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  // 3D Drag physics & Idle Sway loop
  useEffect(() => {
    const stage = stageRef.current;
    const rig = rigRef.current;
    if (!stage || !rig) return;

    let animId;
    const sway = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onPointerDown = (e) => {
      dragRef.current = { x: e.clientX, y: e.clientY };
      stage.setPointerCapture(e.pointerId);
      stage.style.cursor = "grabbing";
    };

    const onPointerMove = (e) => {
      if (!dragRef.current) return;
      rotRef.current.ty += (e.clientX - dragRef.current.x) * 0.45;
      rotRef.current.tx = Math.max(-40, Math.min(40, rotRef.current.tx - (e.clientY - dragRef.current.y) * 0.3));
      dragRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      dragRef.current = null;
      stage.style.cursor = "grab";
    };

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);

    let t = 0;
    const frame = () => {
      t += 16;
      rotRef.current.rx += (rotRef.current.tx - rotRef.current.rx) * 0.12;
      rotRef.current.ry += (rotRef.current.ty - rotRef.current.ry) * 0.12;
      const s = !dragRef.current && sway && mode === "screens" ? Math.sin(t / 1800) * 6 : 0;
      
      rig.style.setProperty("--rx", `${rotRef.current.rx}deg`);
      rig.style.setProperty("--ry", `${rotRef.current.ry + s}deg`);
      animId = requestAnimationFrame(frame);
    };
    animId = requestAnimationFrame(frame);

    const fit = () => {
      const scale = Math.min(1, (stage.clientWidth - 24) / (mode === "layers" ? 700 : 780)).toFixed(3);
      rig.style.setProperty("--s", scale);
    };
    fit();
    window.addEventListener("resize", fit);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", fit);
    };
  }, [mode]);

  const cycleCurrency = () => {
    const keys = Object.keys(C);
    setCur(keys[(keys.indexOf(cur) + 1) % keys.length]);
  };

  const renderMiniApp = () => {
    switch (view) {
      case "store":
        return (
          <>
            <div className="hero">
              <div>
                <h2>Shop everything.<br />Ship anywhere.</h2>
                <button className="pb" style={{ background: "#fff", color: "#ea580c" }}>Start shopping →</button>
              </div>
              <span>🛍️</span>
            </div>
            <div className="row">
              <b>Trending products</b>
              <small>typo-tolerant search · AI picks</small>
            </div>
            <div className="g4">
              {P.map((x, i) => (
                <div key={i} className="c">
                  <div className="im" style={{ background: x.c }}>{x.e}</div>
                  <b>{x.n}</b>
                  <div className="pr">{f(x.p)}</div>
                  <small>⭐ 4.8 · ♡ Wishlist</small>
                </div>
              ))}
            </div>
          </>
        );
      case "product": {
        const x = P[0];
        return (
          <div className="two">
            <div className="im big" style={{ background: x.c }}>{x.e}</div>
            <div>
              <span className="tag">electronics</span>
              <h3>{x.n}</h3>
              <small>⭐⭐⭐⭐⭐ 4.8 (126 reviews)</small>
              <div className="pr xl">{f(x.p)}</div>
              <small className="ok">● In stock · 38 left</small>
              <div className="btns">
                <button className="pb">Add to cart</button>
                <button className="ob">♡</button>
              </div>
              <div className="seller">
                <span>Sold by <b>techstore</b></span>
                <button className="ob">💬 Chat with seller</button>
              </div>
              <small>“Great sound, fast delivery.” – verified buyer</small>
            </div>
          </div>
        );
      }
      case "checkout":
        return (
          <div className="two">
            <div>
              <h3>Shipping address</h3>
              <div className="fi">Ada Obi</div>
              <div className="fi">+234 801 234 5678</div>
              <div className="fi">12 Allen Avenue, Ikeja</div>
              <div className="fi">Lagos · Nigeria</div>
              <small>☑ Save this address for next time</small>
            </div>
            <div className="sum">
              <h3>Order summary</h3>
              {P.slice(0, 2).map((item, idx) => (
                <div key={idx} className="ln">
                  <span>{item.n} ×1</span>
                  <b>{f(item.p)}</b>
                </div>
              ))}
              <hr />
              <div className="ln">
                <b>Total</b>
                <b className="pr">{f(P[0].p + P[1].p)}</b>
              </div>
              <button className="pb w">🔒 Pay securely</button>
              <small>You’ll be charged in {cur}. Cards, bank transfer and more on the hosted payment page.</small>
            </div>
          </div>
        );
      case "chat":
        return (
          <div className="two">
            <div>
              <h3>💬 Messages</h3>
              <div className="b">Hi! Is this earbud waterproof?</div>
              <div className="b r">Yes, IPX5. Ships tomorrow 📦</div>
              <div className="b">Great, ordering now!</div>
              <small>● live via sockets</small>
            </div>
            <div className="ai">
              <b>🤖 Shopping assistant</b>
              <div className="b" style={{ marginTop: "6px" }}>A gift under {f(50)} for a runner</div>
              <div className="b r">{P[0].n} ({f(P[0].p)}) fits your budget, and {P[2].n} is a close second.</div>
              <div className="c" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "24px" }}>🎧</span>
                <span><b>{P[0].n}</b><br /><span className="pr">{f(P[0].p)}</span></span>
              </div>
            </div>
          </div>
        );
      case "seller":
        return (
          <>
            <div className="g4s">
              <div className="st"><small>Live products</small><b>12</b></div>
              <div className="st"><small>Low stock</small><b>2</b></div>
              <div className="st"><small>To ship</small><b>5</b></div>
              <div className="st"><small>Sales</small><b>{f(1840)}</b></div>
            </div>
            <div className="row"><b>Orders</b><small>buyer confirms receipt = earnings released</small></div>
            <div className="ordr">
              <b>ORD-7K2F9</b><small>Ada Obi · Lagos</small>
              <select defaultValue="Processing"><option>Processing</option><option>Shipped</option><option>Delivered</option></select>
              <input defaultValue="TRK-48213" size="9" />
              <button className="pb">Update</button>
            </div>
            <div className="ordr" style={{ marginTop: "8px" }}>
              <b>💰 Wallet</b><small>Available</small><b className="pr">{f(620)}</b>
              <small>Pending</small><b>{f(214)}</b>
              <button className="ob">Withdraw</button>
            </div>
          </>
        );
      case "admin":
        return (
          <>
            <div className="g4s">
              <div className="st"><small>Revenue</small><b>{f(48250)}</b></div>
              <div className="st"><small>Paid orders</small><b>312</b></div>
              <div className="st"><small>Users</small><b>1,204</b></div>
              <div className="st"><small>Sellers</small><b>48</b></div>
            </div>
            <div className="bars">
              {Array.from({ length: 14 }, (_, i) => (
                <i key={i} style={{ height: `${28 + ((i * 37) % 62)}%` }}></i>
              ))}
            </div>
            <div className="fl">
              <b>🚨 ORD-9X1C4</b> <span className="risk">risk 62 · high</span><br />
              <small>New account · 3 orders in 15 min · high order value</small>
              <div className="btns" style={{ margin: "6px 0 0" }}>
                <button className="pb">Approve</button>
                <button className="ob">Block</button>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <header>
        <h1>Alie<b>Xpress</b><small>3D preview</small></h1>
        <div className="ctl">
          <div className="seg">
            <button data-m="screens" aria-pressed={mode === "screens"} onClick={() => setMode("screens")}>Screens</button>
            <button data-m="layers" aria-pressed={mode === "layers"} onClick={() => setMode("layers")}>Architecture</button>
          </div>
          <div className="seg">
            <button aria-pressed={theme === "light"} onClick={() => setTheme("light")} title="Light theme">☀️</button>
            <button aria-pressed={theme === "system"} onClick={() => setTheme("system")} title="System theme">💻</button>
            <button aria-pressed={theme === "dark"} onClick={() => setTheme("dark")} title="Dark theme">🌙</button>
          </div>
          <button className="pill" onClick={cycleCurrency}>💱 {cur}</button>
          {mode === "layers" && (
            <button className="pill" onClick={() => setGap(gap > 40 ? 22 : 90)}>
              {gap > 40 ? "↕ Collapse" : "↕ Explode"}
            </button>
          )}
          <button className="pill" onClick={() => { rotRef.current.tx = 0; rotRef.current.ty = 0; }}>⟲ Reset</button>
        </div>
      </header>

      <div id="stage" ref={stageRef} aria-label="Interactive 3D preview. Drag to rotate.">
        <div id="rig" ref={rigRef} data-mode={mode} style={{ "--gap": `${gap}px` }}>
          <div id="laptop">
            <div className="floor"></div>
            <div className="deck"></div>
            <div className="back">A</div>
            <div className="screen">
              <div id="app">
                <div className="bar">
                  <span className="logo">Alie<i>Xpress</i></span>
                  <span className="srch">🔍 Search products…</span>
                  <span className="chip">🌍 {cur}</span>
                  <span className="chip">🛒 2</span>
                </div>
                <div className="view">{renderMiniApp()}</div>
              </div>
            </div>
          </div>
          <div id="layers">
            <div className="layer" style={{ "--i": 0, background: "linear-gradient(135deg,#065f46,#10b981)" }}>
              <h3>MongoDB<small>data layer</small></h3>
              <div className="chips">
                {["Users", "Products", "Orders", "Carts", "Wishlists", "Wallets", "Wallet transactions", "Conversations", "Messages", "Search queries", "System logs"].map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
            </div>
            <div className="layer" style={{ "--i": 1, background: "linear-gradient(135deg,#6d28d9,#a78bfa)" }}>
              <h3>Services<small>third parties</small></h3>
              <div className="chips">
                {["Flutterwave payments", "Stripe (optional)", "Cloudinary images", "Claude AI assistant", "Live FX rates", "Google sign-in", "Email (OTP)"].map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
            </div>
            <div className="layer" style={{ "--i": 2, background: "linear-gradient(135deg,#1d4ed8,#60a5fa)" }}>
              <h3>Express API<small>Node 20 · secured</small></h3>
              <div className="chips">
                {["Auth + OTP", "Products", "Cart", "Orders", "Payments + webhooks", "Wallet", "Chat (sockets)", "Search", "AI", "ML", "Fraud", "Insights", "Currency", "Admin"].map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
            </div>
            <div className="layer" style={{ "--i": 3, background: "linear-gradient(135deg,#c2410c,#fb923c)" }}>
              <h3>React frontend<small>light · dark · system</small></h3>
              <div className="chips">
                {["Storefront", "Search + filters", "Product page", "Cart", "Checkout", "Orders", "Wishlist", "Chat + AI", "Seller dashboard", "Admin dashboard", "Wallet", "Insights", "Country currency picker"].map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="tabs">
        {[
          ["store", "Storefront"],
          ["product", "Product"],
          ["checkout", "Checkout"],
          ["chat", "Chat + AI"],
          ["seller", "Seller"],
          ["admin", "Admin"],
        ].map(([k, l]) => (
          <button key={k} aria-pressed={view === k} onClick={() => { setView(k); if (mode !== "screens") setMode("screens"); }}>
            {l}
          </button>
        ))}
      </nav>
      <p className="hint">Drag to rotate · pick a screen below · try the theme, currency and Architecture buttons. Sample data only.</p>
    </div>
  );
}