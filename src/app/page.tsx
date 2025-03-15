"use client";

import React, { useState, useRef } from "react";
import { PostItem } from "../components/PostItem";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { useAuth, useHomeFeed, useInfiniteScroll } from "./hooks";
import { HomeHeader } from "~/components/HomeHeader";
import { ComposePost } from "~/components/Composer";

export default function Homepage() {
  const { isAuthenticated } = useAuth();
  const [selectedFeed, setSelectedFeed] = useState<"feed1" | "feed2" | "feed3">("feed1");
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
      <HomeHeader selectedFeed={selectedFeed} setSelectedFeed={setSelectedFeed} />
      <ComposePost />

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
