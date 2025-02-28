import { useCallback, useRef } from "react";

interface UseInfiniteScrollOptions {
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  threshold?: number;
}

export function useInfiniteScroll({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  threshold = 0.5,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node || isFetchingNextPage) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            fetchNextPage();
          }
        },
        { threshold }
      );

      observerRef.current.observe(node);
      return () => observerRef.current?.disconnect();
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, threshold]
  );

  return {
    lastElementRef,
    observerRef,
  };
}
