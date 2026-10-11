import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as categoriesService from "../services/categoriesService";

export const CategoryContext = createContext(null);

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
}

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  const fetchCategories = async () => {
    setIsCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const data = await categoriesService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoriesError("Failed to load categories");
      setCategories([]);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const value = useMemo(
    () => ({
      categories,
      isCategoriesLoading,
      categoriesError,
      refreshCategories: fetchCategories,
      hasCategoriesLoaded: !isCategoriesLoading && categories.length > 0,
      hasNoCategoriesData: !isCategoriesLoading && categories.length === 0,
    }),
    [categories, isCategoriesLoading, categoriesError]
  );

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}
