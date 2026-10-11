import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wishlist";

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState(readStorage);

  // Keep state in sync if another tab changes localStorage
  useEffect(() => {
    const handler = () => setWishlist(readStorage());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const isWished = useCallback(
    (productId) => wishlist.some((item) => item.id === productId),
    [wishlist]
  );

  const toggleWish = useCallback(
    (product) => {
      setWishlist((prev) => {
        const exists = prev.some((item) => item.id === product.id);
        const next = exists
          ? prev.filter((item) => item.id !== product.id)
          : [
              ...prev,
              {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.primaryImageUrl || product.image || null,
              },
            ];
        writeStorage(next);
        return next;
      });
    },
    []
  );

  const removeFromWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      const next = prev.filter((item) => item.id !== productId);
      writeStorage(next);
      return next;
    });
  }, []);

  return { wishlist, isWished, toggleWish, removeFromWishlist };
}
