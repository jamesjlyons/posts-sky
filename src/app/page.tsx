// src/app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { agent, login, checkSession, logout } from "~/lib/api";
import { formatDistanceToNow } from "date-fns";
import { LoginDialog } from "../components/LoginDialog";
import type {
  AppBskyFeedDefs,
  AppBskyFeedPost,
  AppBskyEmbedImages,
} from "@atproto/api";

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

  // const { feed: postsArray, cursor: nextPage } = data;

  const feedUrls = {
    feed1:
      "at://did:plc:tft77e5qkblxtneeib4lp3zk/app.bsky.feed.generator/aaahltvlqwftc",
    feed2:
      "at://did:plc:tft77e5qkblxtneeib4lp3zk/app.bsky.feed.generator/posts-only",
  };

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

  const fetchPosts = async (feedKey: "feed1" | "feed2") => {
    if (!isAuthenticated) return [];

    const { data } = await agent.app.bsky.feed.getFeed(
      {
        feed: feedUrls[feedKey],
        limit: 30,
      },
      {
        headers: {
          "Accept-Language": "en-US",
        },
      }
    );
    return data.feed;
  };

  const loadPosts = async (feedKey: "feed1" | "feed2") => {
    if (feedKey === "feed1" && postsFeed1.length === 0) {
      const posts = await fetchPosts("feed1");
      setPostsFeed1(posts);
    } else if (feedKey === "feed2" && postsFeed2.length === 0) {
      const posts = await fetchPosts("feed2");
      setPostsFeed2(posts);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadPosts(selectedFeed);
    }
  }, [selectedFeed, isAuthenticated]);

  const currentPosts = selectedFeed === "feed1" ? postsFeed1 : postsFeed2;

  return (
    <>
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onLogin={handleLogin}
      />

      <div className="grid grid-cols-[minmax(60px,_300px)_604px_300px] w-full max-w-[calc(300px+604px+300px)] mx-auto min-h-screen">
        <div className="pl-4 pr-3 py-4 flex flex-col items-end gap-4">
          <div className="bg-posts-yellow-wash rounded-4xl place-items-center p-1">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.22 9.204c-.531-.815-.886-1.69-.886-2.577 0-1.794 1.373-3.167 3.167-3.167.703 0 1.324.288 1.82.747l.68.627.678-.627c.497-.46 1.118-.747 1.822-.747 1.793 0 3.166 1.373 3.166 3.167 0 .887-.355 1.763-.885 2.575l-.001.002c-.529.812-1.235 1.564-1.939 2.204a19.99 19.99 0 01-2.81 2.123l-.015.01a.041.041 0 01-.033 0l-.016-.01a19.996 19.996 0 01-2.81-2.12c-.703-.644-1.409-1.396-1.938-2.207z"
                fill="color(display-p3 1 0.72 0.12 / 1)"
              ></path>
            </svg>
          </div>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                logout();
                setIsAuthenticated(false);
                setShowLoginDialog(true);
                setPostsFeed1([]);
                setPostsFeed2([]);
              }}
              className="px-3 py-1.5 text-xs text-text-primary bg-button-secondary rounded-lg h-8 cursor-pointer"
            >
              Logout
            </button>
          )}
        </div>
        <div className="feed border-x border-border-primary">
          <ul className="feedlist text-text-secondary font-medium list-none tap-highlight-color-[rgba(0,0,0,0)] font-smoothing-antialiased m-0 box-border h-15 shadow-[0_1px_0_var(--transparentBorder)] flex flex-row px-6 items-center w-full sticky top-0 bg-[var(--backgroundColor)] z-10 gap-6 justify-center">
            <li
              className={`text-text-primary cursor-pointer ${
                selectedFeed === "feed1"
                  ? "text-text-primary"
                  : "text-text-secondary"
              }`}
              onClick={() => setSelectedFeed("feed1")}
            >
              Posts.cv Alumni
            </li>
            <li
              className={`text-text-primary cursor-pointer ${
                selectedFeed === "feed2"
                  ? "text-text-primary"
                  : "text-text-secondary"
              }`}
              onClick={() => setSelectedFeed("feed2")}
            >
              Posts.cv (Posts Only)
            </li>
          </ul>

          <ul className="feedPosts">
            {currentPosts.map((item) => {
              const post = item.post;
              const author = post.author;
              const record = post.record as AppBskyFeedPost.Record;
              const timeAgo = formatDistanceToNow(new Date(record.createdAt), {
                addSuffix: true,
              });

              return (
                <li
                  key={post.cid}
                  className="border-b border-border-primary px-6 pt-5 pb-4"
                >
                  <div className="flex mb-2">
                    <img
                      src={author.avatar}
                      alt={`${author.displayName}'s avatar`}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div className="flex flex-col">
                      <div className="flex flex-row gap-2">
                        <div className="text-text-primary">
                          {author.displayName}
                        </div>
                        <div className="text-text-tertiary">
                          @{author.handle}
                        </div>
                        <div className="text-text-tertiary">{timeAgo}</div>
                      </div>

                      <div className="text-text-secondary">{record.text}</div>
                    </div>
                  </div>
                  {post.embed?.$type === "app.bsky.embed.images#view" && (
                    <div className="media-container mt-2 grid gap-2">
                      {(post.embed as AppBskyEmbedImages.View).images.map(
                        (image, index) => (
                          <img
                            key={index}
                            src={image.fullsize}
                            alt={image.alt || "Post media"}
                            className="w-full h-auto max-h-[600px] rounded-lg object-cover mt-2"
                            style={{
                              aspectRatio: `${image.aspectRatio.width} / ${image.aspectRatio.height}`,
                            }}
                          />
                        )
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="p-6">
          <p>PostsSky</p>
          <p className="text-text-tertiary text-xs">
            An ode to the community app by Read.cv
          </p>
        </div>
      </div>
    </>
  );
}
