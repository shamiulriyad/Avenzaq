import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";

export function useProducts(filters) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProducts(filters)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [filters]);

  return { items, loading };
}
