// src/app/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { agent, login, checkSession, logout } from "~/lib/api";
import { LoginDialog } from "../components/LoginDialog";
import type { AppBskyFeedDefs } from "@atproto/api";
import { MainLayout } from "../components/MainLayout";
import { PostItem } from "../components/PostItem";

const feedUrls = {
  feed1:
    "at://did:plc:tft77e5qkblxtneeib4lp3zk/app.bsky.feed.generator/posts-only",
  feed2:
    "at://did:plc:tft77e5qkblxtneeib4lp3zk/app.bsky.feed.generator/aaahltvlqwftc",
} as const;

export default function Homepage() {
  const [selectedFeed, setSelectedFeed] = useState<"feed1" | "feed2">("feed1");
  const [postsFeed1, setPostsFeed1] = useState<AppBskyFeedDefs.FeedViewPost[]>(
    []
  );
  const [postsFeed2, setPostsFeed2] = useState<AppBskyFeedDefs.FeedViewPost[]>(
    []
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursorFeed1, setCursorFeed1] = useState<string | undefined>();
  const [cursorFeed2, setCursorFeed2] = useState<string | undefined>();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  // const { feed: postsArray, cursor: nextPage } = data;

  const handleLogin = async (credentials: {
    identifier: string;
    password: string;
  }) => {
    const result = await login(credentials);
    if (result.success) {
      setIsAuthenticated(true);
      setShowLoginDialog(false);
      loadPosts(selectedFeed);
    } else {
      throw new Error("Login failed");
    }
  };

  const checkAuth = async () => {
    const result = await checkSession();
    if (result.success) {
      setIsAuthenticated(true);
    } else {
      setShowLoginDialog(true);
    }
  };

  const fetchPosts = useCallback(
    async (feedKey: "feed1" | "feed2", cursor?: string) => {
      if (!isAuthenticated) return { posts: [], cursor: undefined };

      const { data } = await agent.app.bsky.feed.getFeed(
        {
          feed: feedUrls[feedKey],
          limit: 30,
          cursor,
        },
        {
          headers: {
            "Accept-Language": "en-US",
          },
        }
      );
      return { posts: data.feed, cursor: data.cursor };
    },
    [isAuthenticated]
  );

  const loadMorePosts = useCallback(async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    try {
      const cursor = selectedFeed === "feed1" ? cursorFeed1 : cursorFeed2;
      const { posts, cursor: newCursor } = await fetchPosts(
        selectedFeed,
        cursor
      );

      if (selectedFeed === "feed1") {
        setPostsFeed1((prev) => [...prev, ...posts]);
        setCursorFeed1(newCursor);
      } else {
        setPostsFeed2((prev) => [...prev, ...posts]);
        setCursorFeed2(newCursor);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, selectedFeed, cursorFeed1, cursorFeed2, fetchPosts]);

  const lastPostRef = useCallback(
    (node: HTMLElement | null) => {
      if (loadingMore) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loadingMore, loadMorePosts]
  );

  const loadPosts = useCallback(
    async (feedKey: "feed1" | "feed2") => {
      if (feedKey === "feed1" && postsFeed1.length === 0) {
        const { posts, cursor } = await fetchPosts("feed1");
        setPostsFeed1(posts);
        setCursorFeed1(cursor);
      } else if (feedKey === "feed2" && postsFeed2.length === 0) {
        const { posts, cursor } = await fetchPosts("feed2");
        setPostsFeed2(posts);
        setCursorFeed2(cursor);
      }
    },
    [
      fetchPosts,
      postsFeed1.length,
      postsFeed2.length,
      setPostsFeed1,
      setPostsFeed2,
      setCursorFeed1,
      setCursorFeed2,
    ]
  );

  const prefetchNextPage = useCallback(async () => {
    const cursor = selectedFeed === "feed1" ? cursorFeed1 : cursorFeed2;
    await fetchPosts(selectedFeed, cursor); // Next.js will automatically cache this
  }, [selectedFeed, cursorFeed1, cursorFeed2, fetchPosts]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadPosts(selectedFeed);
    }
  }, [selectedFeed, isAuthenticated, loadPosts]);

  const currentPosts = selectedFeed === "feed1" ? postsFeed1 : postsFeed2;

  return (
    <>
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onLogin={handleLogin}
      />
      <MainLayout
        isAuthenticated={isAuthenticated}
        onLogout={() => {
          logout();
          setIsAuthenticated(false);
          setShowLoginDialog(true);
          setPostsFeed1([]);
          setPostsFeed2([]);
        }}
        mainContent={
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
            </ul>
            <ul className="feedPosts">
              {currentPosts.map((item, index) => {
                const isLastPost = index === currentPosts.length - 1;
                return (
                  <li key={`${item.post.cid}-${index}`}>
                    <PostItem
                      post={item.post}
                      ref={isLastPost ? lastPostRef : null}
                      showTimeAgo={true}
                      showBorder={true}
                    />
                  </li>
                );
              })}
              <div ref={loadingRef} className="p-4 text-center">
                {loadingMore && "Loading more posts..."}
              </div>
            </ul>
          </>
        }
      />
    </>
  );
}
