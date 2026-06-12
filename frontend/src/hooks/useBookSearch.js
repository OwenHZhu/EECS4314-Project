import { useState, useEffect, useRef } from "react";
import { BOOKS } from "../data/mockBook";

export function useBookSearch(query, genre) {
  const [results, setResults] = useState(BOOKS);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => {
      const q = query.trim().toLowerCase();
      setResults(
        BOOKS.filter((b) => {
          const matchGenre = genre === "all" || b.genre === genre;
          const matchQuery =
            !q ||
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.genre.toLowerCase().includes(q);
          return matchGenre && matchQuery;
        }),
      );
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer.current);
  }, [query, genre]);

  return { results, loading };
}
