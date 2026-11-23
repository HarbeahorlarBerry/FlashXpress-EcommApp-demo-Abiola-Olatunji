import { useState } from "react";

const PRODUCTS = [
  { id: 1, title: "Wireless Noise-Canceling Earbuds Pro", price: 39.99, rating: 4.8, reviews: 128, image: "🎧", badge: "Hot" },
  { id: 2, title: "Smart Watch Series X - Fitness & Health", price: 89.00, rating: 4.9, reviews: 312, image: "⌚", badge: "Sale" },
  { id: 3, title: "Pro Running Sneakers & Sports Shoes", price: 64.50, rating: 4.7, reviews: 95, image: "👟", badge: "New" },
  { id: 4, title: "Waterproof Minimalist Canvas Backpack", price: 42.00, rating: 4.6, reviews: 64, image: "🎒", badge: "Popular" },
  { id: 5, title: "Ultra HD 4K Action Camera 60FPS", price: 129.99, rating: 4.9, reviews: 210, image: "📷", badge: "Top Rated" },
  { id: 6, title: "Ergonomic Mechanical Gaming Keyboard", price: 75.00, rating: 4.8, reviews: 142, image: "⌨️", badge: "Sale" },
];

export default function StoreFront() {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(2);

  const filteredProducts = PRODUCTS.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090b", color: "#f4f4f5", fontFamily: "system-ui, sans-serif" }}>
      {/* Navbar */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid #27272a", backgroundColor: "#121215", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ fontSize: "20px", fontWeight: 900, color: "#f97316", letterSpacing: "-0.5px" }}>
          Alie<span style={{ color: "#fff" }}>Xpress</span>
        </div>

        <div style={{ flex: 1, maxWidth: "500px", margin: "0 24px" }}>
          <input
            type="text"
            placeholder="Search products, brands, and categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "10px 16px", borderRadius: "9999px", border: "1px solid #3f3f46", backgroundColor: "#18181b", color: "#fff", outline: "none", fontSize: "14px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button 
            onClick={() => setActiveTab("home")}
            style={{ padding: "8px 16px", borderRadius: "9999px", background: activeTab === "home" ? "#f97316" : "transparent", color: activeTab === "home" ? "#fff" : "#a1a1aa", border: activeTab === "home" ? "none" : "1px solid #3f3f46", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}
          >
            Store
          </button>
          <button 
            onClick={() => setActiveTab("chat")}
            style={{ padding: "8px 16px", borderRadius: "9999px", background: activeTab === "chat" ? "#f97316" : "transparent", color: activeTab === "chat" ? "#fff" : "#a1a1aa", border: activeTab === "chat" ? "none" : "1px solid #3f3f46", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}
          >
            AI Assistant
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#27272a", padding: "8px 16px", borderRadius: "9999px", fontSize: "13px", fontWeight: "bold" }}>
            🛒 <span style={{ color: "#f97316" }}>{cartCount}</span>
          </div>
        </div>
      </header>

      {/* Body content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px" }}>
        {activeTab === "home" ? (
          <>
            {/* Hero banner */}
            <div style={{ background: "linear-gradient(135deg, #ea580c, #c2410c, #9a3412)", borderRadius: "24px", padding: "48px", marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)" }}>
              <div style={{ maxWidth: "600px" }}>
                <span style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "6px 14px", borderRadius: "9999px", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Global Marketplace · Super Deals
                </span>
                <h1 style={{ fontSize: "38px", fontWeight: 900, margin: "16px 0 12px", lineHeight: 1.1, color: "#fff" }}>
                  Everything you love, delivered instantly.
                </h1>
                <p style={{ color: "#ffedd5", fontSize: "15px", marginBottom: "24px", lineHeight: 1.5 }}>
                  Discover millions of products with smart AI recommendations, secured payment gateways, and real-time tracking.
                </p>
                <button style={{ backgroundColor: "#fff", color: "#c2410c", padding: "12px 28px", borderRadius: "12px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "14px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  Explore Deals →
                </button>
              </div>
              <div style={{ fontSize: "110px", background: "rgba(255,255,255,0.1)", padding: "20px 30px", borderRadius: "24px" }}>
                🛍️
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "#fff" }}>Trending Products</h2>
              <span style={{ fontSize: "13px", color: "#a1a1aa" }}>Live catalog</span>
            </div>

            {/* Product Grid using standard CSS Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
              {filteredProducts.map((product) => (
                <div key={product.id} style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "transform 0.2s, border-color 0.2s" }}>
                  <div>
                    <div style={{ backgroundColor: "#27272a", height: "160px", borderRadius: "14px", display: "grid", placeItems: "center", fontSize: "64px", marginBottom: "16px", position: "relative" }}>
                      {product.image}
                      <span style={{ position: "absolute", top: "12px", left: "12px", backgroundColor: "#f97316", color: "#fff", fontSize: "10px", fontWeight: "bold", padding: "4px 10px", borderRadius: "9999px", textTransform: "uppercase" }}>
                        {product.badge}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 8px", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#fbbf24", marginBottom: "16px" }}>
                      <span>★</span>
                      <span style={{ fontWeight: "bold", color: "#fff" }}>{product.rating}</span>
                      <span style={{ color: "#a1a1aa" }}>({product.reviews})</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid #27272a" }}>
                    <span style={{ fontSize: "18px", fontWeight: 900, color: "#f97316" }}>
                      ${product.price.toFixed(2)}
                    </span>
                    <button 
                      onClick={() => setCartCount(cartCount + 1)}
                      style={{ backgroundColor: "#f97316", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* AI Assistant View */
          <div style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "24px", padding: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>🤖 AI Shopping Assistant</h2>
            <p style={{ fontSize: "13px", color: "#a1a1aa", marginBottom: "24px" }}>Ask for gift ideas, price comparisons, or instant customer support.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div style={{ backgroundColor: "#27272a", padding: "12px 16px", borderRadius: "16px", fontSize: "13px", maxWidth: "80%" }}>
                Hello! What can I help you find today?
              </div>
              <div style={{ backgroundColor: "#f97316", color: "#fff", padding: "12px 16px", borderRadius: "16px", fontSize: "13px", maxWidth: "80%", alignSelf: "flex-end" }}>
                I need a durable waterproof backpack for traveling.
              </div>
              <div style={{ backgroundColor: "#27272a", padding: "12px 16px", borderRadius: "16px", fontSize: "13px", maxWidth: "80%" }}>
                I recommend the <b>Waterproof Minimalist Canvas Backpack</b> ($42.00). It features rugged waterproof fabric and 64+ top reviews!
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <input 
                type="text" 
                placeholder="Ask anything..." 
                style={{ flex: 1, backgroundColor: "#27272a", border: "1px solid #3f3f46", borderRadius: "12px", padding: "12px 16px", color: "#fff", outline: "none", fontSize: "13px" }}
              />
              <button style={{ backgroundColor: "#f97316", color: "#fff", border: "none", padding: "0 24px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                Send
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}