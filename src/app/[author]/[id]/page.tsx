"use client";

import { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AppBskyFeedDefs } from "@atproto/api";
import { agent, checkSession, login } from "../../../lib/api";
import { MainLayout } from "../../../components/MainLayout";
import { LoginDialog } from "../../../components/LoginDialog";
import { PostItem } from "../../../components/PostItem";

export default function PostPage() {
  const params = useParams();
  const [post, setPost] = useState<AppBskyFeedDefs.PostView | null>(null);
  const [parentPost, setParentPost] = useState<AppBskyFeedDefs.PostView | null>(
    null
  );
  const [replies, setReplies] = useState<AppBskyFeedDefs.FeedViewPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleLogin = async (credentials: {
    identifier: string;
    password: string;
  }) => {
    const result = await login(credentials);
    if (result.success) {
      setIsAuthenticated(true);
      setShowLoginDialog(false);
      fetchPost();
    } else {
      throw new Error("Login failed");
    }
  };

  const fetchPost = useCallback(async () => {
    try {
      const { author, id } = params;
      // First resolve the handle
      const resolveResponse = await agent.com.atproto.identity.resolveHandle({
        handle: author as string,
      });

      // Then get the thread using the resolved DID
      const threadResponse = await agent.app.bsky.feed.getPostThread({
        uri: `at://${resolveResponse.data.did}/app.bsky.feed.post/${id}`,
        depth: 1,
        parentHeight: 1,
      });

      if (threadResponse.data.thread.post) {
        setPost(threadResponse.data.thread.post as AppBskyFeedDefs.PostView);
        if (
          threadResponse.data.thread.parent &&
          typeof threadResponse.data.thread.parent === "object" &&
          "post" in
            (threadResponse.data.thread.parent as Record<string, unknown>)
        ) {
          setParentPost(
            (
              threadResponse.data.thread.parent as {
                post: AppBskyFeedDefs.PostView;
              }
            ).post
          );
        }
        if (threadResponse.data.thread.replies) {
          setReplies(
            threadResponse.data.thread.replies as AppBskyFeedDefs.FeedViewPost[]
          );
        }
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    }
    setIsLoading(false);
  }, [params]);

  useEffect(() => {
    const init = async () => {
      const sessionCheck = await checkSession();
      if (sessionCheck.success) {
        setIsAuthenticated(true);
        fetchPost();
      } else {
        setShowLoginDialog(true);
        setIsLoading(false);
      }
    };

    init();
  }, [fetchPost]);

  if (isLoading) {
    return <MainLayout mainContent={<div>Loading...</div>} />;
  }

  if (!post) {
    return <MainLayout mainContent={<div>Post not found</div>} />;
  }

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
          setIsAuthenticated(false);
          setShowLoginDialog(true);
        }}
        mainContent={
          <div className="flex flex-col">
            <ul className="feedlist text-text-secondary font-medium list-none tap-highlight-color-[rgba(0,0,0,0)] font-smoothing-antialiased m-0 box-border h-15 shadow-[0_1px_0_var(--transparentBorder)] flex flex-row px-6 items-center w-full sticky top-0 bg-[var(--backgroundColor)] z-10 gap-6">
              <li
                className="text-text-primary cursor-pointer flex items-center gap-2"
                onClick={() => window.history.back()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && window.history.back()}
                aria-label="Go back"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.3258 6.05806C12.5699 6.30214 12.5699 6.69786 12.3258 6.94194L7.26777 12L12.3258 17.0581C12.5699 17.3021 12.5699 17.6979 12.3258 17.9419C12.0817 18.186 11.686 18.186 11.4419 17.9419L5.5 12L11.4419 6.05806C11.686 5.81398 12.0817 5.81398 12.3258 6.05806Z"
                    fill="var(--grey1)"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.75888 12C6.75888 11.6548 7.0387 11.375 7.38388 11.375H17.8839C18.2291 11.375 18.5 11.6548 18.5 12C18.5 12.3452 18.2291 12.625 17.8839 12.625H7.38388C7.0387 12.625 6.75888 12.3452 6.75888 12Z"
                    fill="var(--grey1)"
                  />
                </svg>
                Thread
              </li>
            </ul>
            {/* Parent Post (if exists) */}
            {parentPost && (
              <PostItem
                post={parentPost}
                showTimeAgo={false}
                isThreadView={true}
                showBottomLine={true}
              />
            )}
            {/* Current Post */}
            <PostItem
              post={post}
              isClickable={false}
              showTimeAgo={false}
              showFullDate={true}
              showBorder={false}
              isThreadView={true}
              showTopLine={!!parentPost}
              showBottomLine={replies.length > 0}
              isMainThreadPost={true}
            />
            {/* Replies */}
            <div className="replies">
              {replies.map((reply, index) => (
                <PostItem
                  key={reply.post.cid}
                  post={reply.post}
                  showTimeAgo={false}
                  isThreadView={true}
                  showTopLine={true}
                  showBottomLine={index !== replies.length - 1}
                />
              ))}
            </div>
          </div>
        }
      />
    </>
  );
}
