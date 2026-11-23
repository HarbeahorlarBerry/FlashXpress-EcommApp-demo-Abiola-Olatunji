import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import CartContext from "./CartContext";
import useAuth from "../hooks/useAuth";
import {
  fetchCartApi,
  addCartItemApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
} from "../api/cartApi";

const STORAGE_KEY = "flashxpress_cart_v1";
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

const isValidObjectId = (id) => typeof id === "string" && OBJECT_ID_RE.test(id);

function loadInitialCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeServerCart(serverCart) {
  const lines = serverCart?.products || [];
  return lines.map((line) => {
    const prod =
      line.productId && typeof line.productId === "object"
        ? line.productId
        : null;
    const productId = prod?._id || line.productId;
    return {
      _id: productId,
      productId,
      name: prod?.name || line.name || "Item",
      image: prod?.images?.[0] || line.image || "",
      images: prod?.images || [],
      price: line.price ?? prod?.price ?? 0,
      quantity: line.quantity || 1,
      totalItemPrice: line.totalItemPrice,
    };
  });
}

export default function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(loadInitialCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage quota errors
    }
  }, [cart]);

  const syncFromServer = useCallback(async () => {
    try {
      const { data } = await fetchCartApi();
      const serverCart = data?.cart ?? data?.data?.cart ?? null;
      if (serverCart) {
        setCart(normalizeServerCart(serverCart));
      }
    } catch {
      // keep current state if offline or unauthorized
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    (async () => {
      try {
        const localItems = loadInitialCart();
        const { data } = await fetchCartApi();
        const serverCart = data?.cart ?? data?.data?.cart ?? null;
        const serverItems = normalizeServerCart(serverCart);

        if (cancelled) return;

        if (serverItems.length === 0 && localItems.length > 0) {
          for (const item of localItems) {
            const pid = String(item.productId || item._id || "");
            if (isValidObjectId(pid)) {
              try {
                await addCartItemApi(pid, item.quantity || 1);
              } catch {
                // skip items that fail stock or ownership check
              }
            }
          }
          if (!cancelled) await syncFromServer();
        } else {
          setCart(serverItems);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, syncFromServer]);

  const addToCart = async (product, qty = 1) => {
    if (!product) return;
    const rawId = product.productId || product._id || product.id;
    const productId = rawId != null ? String(rawId) : "";
    const validId = isValidObjectId(productId);
    const itemKey = productId || product.name;

    if (user && !validId) {
      toast.error(
        "Demo preview items aren't in the database. Add a live product to check out."
      );
    }

    setCart((prev) => {
      const idx = prev.findIndex(
        (item) =>
          String(item.productId || item._id || item.id || item.name) ===
          String(itemKey)
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: (updated[idx].quantity || 1) + qty,
        };
        return updated;
      }
      return [
        ...prev,
        {
          ...product,
          _id: productId || product._id,
          productId: productId || product._id,
          quantity: qty,
        },
      ];
    });

    if (user && validId) {
      try {
        const { data } = await addCartItemApi(productId, qty);
        const serverCart = data?.cart ?? data?.data?.cart ?? null;
        if (serverCart) setCart(normalizeServerCart(serverCart));
      } catch (err) {
        toast.error(err.response?.data?.message || "Could not update cart");
        await syncFromServer();
      }
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    const strId = id != null ? String(id) : "";
    const validId = isValidObjectId(strId);

    setCart((prev) =>
      prev.map((item) =>
        String(item.productId || item._id || item.id || item.name) === strId
          ? { ...item, quantity }
          : item
      )
    );

    if (user && validId) {
      try {
        const { data } = await updateCartItemApi(strId, quantity);
        const serverCart = data?.cart ?? data?.data?.cart ?? null;
        if (serverCart) setCart(normalizeServerCart(serverCart));
      } catch (err) {
        toast.error(err.response?.data?.message || "Could not update quantity");
        await syncFromServer();
      }
    }
  };

  const removeFromCart = async (id) => {
    const strId = id != null ? String(id) : "";
    const validId = isValidObjectId(strId);

    setCart((prev) =>
      prev.filter(
        (item) =>
          String(item.productId || item._id || item.id || item.name) !== strId
      )
    );

    if (user && validId) {
      try {
        const { data } = await removeCartItemApi(strId);
        const serverCart = data?.cart ?? data?.data?.cart ?? null;
        if (serverCart) setCart(normalizeServerCart(serverCart));
      } catch (err) {
        toast.error(err.response?.data?.message || "Could not remove item");
        await syncFromServer();
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    if (user) {
      try {
        await clearCartApi();
      } catch {
        // ignore
      }
    }
  };

  const cartCount = cart.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        syncFromServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}