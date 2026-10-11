import { useEffect } from "react";

/**
 * Hook to manage and track last visited shop in localStorage
 * Usage: useLastShop(shopSlug) in shop page component
 */
export function useLastShop(shopSlug) {
  useEffect(() => {
    if (shopSlug) {
      localStorage.setItem("lastVisitedShop", shopSlug);
    }
  }, [shopSlug]);

  return {
    saveShop: (slug) => localStorage.setItem("lastVisitedShop", slug),
    getLastShop: () => localStorage.getItem("lastVisitedShop"),
    clearLastShop: () => localStorage.removeItem("lastVisitedShop"),
  };
}
