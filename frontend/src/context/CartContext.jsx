import { createContext, useEffect, useMemo, useState } from "react";
import * as cartService from "../services/cartService";
import { useAuth } from "../hooks/useAuth";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });

  useEffect(() => {
    if (!token) {
      setCart({ items: [], totalAmount: 0 });
      return;
    }

    cartService.getCart().then(setCart).catch(() => {});
  }, [token]);

  const refreshCart = async () => {
    const next = await cartService.getCart();
    setCart(next);
  };

  const addToCart = async (productOrPayload, quantity = 1) => {
    const payload = typeof productOrPayload === "object" && productOrPayload !== null
      ? productOrPayload
      : { productId: productOrPayload, quantity };

    const next = await cartService.addItem(payload);
    setCart(next);
  };

  const updateCartItem = async (itemId, quantity) => {
    const next = await cartService.updateItem(itemId, quantity);
    setCart(next);
  };

  const removeCartItem = async (itemId) => {
    const next = await cartService.removeItem(itemId);
    setCart(next);
  };

  const value = useMemo(
    () => ({ cart, refreshCart, addToCart, updateCartItem, removeCartItem }),
    [cart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
