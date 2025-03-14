"use client";

import React, { useState, useRef } from "react";
import { PostItem } from "../components/PostItem";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { useAuth, useHomeFeed, useInfiniteScroll } from "./hooks";

export default function Homepage() {
  const { isAuthenticated } = useAuth();
  const [selectedFeed, setSelectedFeed] = useState<"feed1" | "feed2" | "feed3">(
    "feed1"
  );
  const loadingRef = useRef<HTMLDivElement | null>(null);

  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useHomeFeed(selectedFeed, isAuthenticated);

  const { lastElementRef } = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  const allPosts = feedData?.pages.flatMap((page) => page.feed) ?? [];

  return (
    <>
      <ul className="feedlist text-text-secondary font-medium list-none tap-highlight-color-[rgba(0,0,0,0)] font-smoothing-antialiased m-0 box-border h-15 shadow-[0_1px_0_var(--transparentBorder)] flex flex-row px-6 items-center w-full sticky top-0 bg-[var(--backgroundColor)] z-10 gap-6 justify-center">
        <li
          className={`text-text-primary cursor-pointer ${
            selectedFeed === "feed1"
              ? "text-text-primary"
              : "text-text-secondary"
          }`}
          onClick={() => setSelectedFeed("feed1")}
        >
          Posts
        </li>
        <li
          className={`text-text-primary cursor-pointer ${
            selectedFeed === "feed2"
              ? "text-text-primary"
              : "text-text-secondary"
          }`}
          onClick={() => setSelectedFeed("feed2")}
        >
          Everything
        </li>
        <li
          className={`text-text-primary cursor-pointer ${
            selectedFeed === "feed3"
              ? "text-text-primary"
              : "text-text-secondary"
          }`}
          onClick={() => setSelectedFeed("feed3")}
        >
          Media
        </li>
      </ul>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ul className="feedPosts">
          {allPosts.map((item, index) => {
            const isLastPost = index === allPosts.length - 1;
            return (
              <li key={`${item.post.cid}-${index}`}>
                <PostItem
                  post={item.post}
                  ref={isLastPost ? lastElementRef : null}
                  showTimeAgo={true}
                  showBorder={true}
                />
              </li>
            );
          })}
          <div ref={loadingRef} className="p-4 text-center">
            {isFetchingNextPage && "Loading more posts..."}
          </div>
        </ul>
      )}
    </>
  );
}
