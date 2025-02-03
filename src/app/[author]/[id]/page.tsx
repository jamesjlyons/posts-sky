"use client";

import { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AppBskyFeedDefs, AppBskyFeedPost } from "@atproto/api";
import { agent, checkSession, login } from "../../../lib/api";
import { MainLayout } from "../../../components/MainLayout";
import { LoginDialog } from "../../../components/LoginDialog";
import Image from "next/image";
import { format } from "date-fns";

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
      const { data: resolveData } =
        await agent.com.atproto.identity.resolveHandle({
          handle: author as string,
        });

      const postId = `at://${resolveData.did}/app.bsky.feed.post/${id}`;
      const { data } = await agent.app.bsky.feed.getPostThread({
        uri: postId,
        depth: 1,
        parentHeight: 1,
      });

      if (data.thread.post) {
        setPost(data.thread.post as AppBskyFeedDefs.PostView);
        if (
          data.thread.parent &&
          typeof data.thread.parent === "object" &&
          "post" in data.thread.parent
        ) {
          setParentPost(data.thread.parent.post as AppBskyFeedDefs.PostView);
        }
        if (data.thread.replies) {
          setReplies(data.thread.replies as AppBskyFeedDefs.FeedViewPost[]);
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

  const record = post.record as AppBskyFeedPost.Record;
  const formattedDate = format(new Date(record.createdAt), "MMM d 'at' h:mm a");

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
              <div className="px-6 pt-5">
                <div className="flex">
                  <div className="flex flex-col items-center">
                    <Image
                      src={parentPost.author.avatar || "/default-avatar.png"}
                      alt={`${parentPost.author.displayName}'s avatar`}
                      width={40}
                      height={40}
                      className="rounded-full w-10 h-10"
                    />
                    <div className="w-0.5 bg-border-primary flex-1 mt-2"></div>
                  </div>
                  <div className="flex flex-col flex-1 ml-3">
                    <div className="flex flex-row gap-2">
                      <div className="text-text-primary">
                        {parentPost.author.displayName}
                      </div>
                      <div className="text-text-tertiary">
                        @{parentPost.author.handle}
                      </div>
                    </div>
                    <div className="text-text-secondary">
                      {(parentPost.record as AppBskyFeedPost.Record).text}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="px-6 pb-4">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 bg-border-primary flex-1 mb-2"></div>
                    <Image
                      src={post.author.avatar || "/default-avatar.png"}
                      alt={`${post.author.displayName}'s avatar`}
                      width={40}
                      height={40}
                      className="rounded-full w-10 h-10 flex-shrink-0"
                    />
                  </div>
                  <div className="flex flex-row gap-2 ml-3">
                    <div className="text-text-primary">
                      {post.author.displayName}
                    </div>
                    <div className="text-text-tertiary">
                      @{post.author.handle}
                    </div>
                  </div>
                </div>
                <div className="text-text-secondary text-base mt-3">
                  {record.text}
                </div>
                <div className="text-text-tertiary text-sm mt-3">
                  {formattedDate}
                </div>
              </div>
            </div>
            <div className="replies">
              {replies.map((reply) => (
                <div
                  key={reply.post.cid}
                  className="border-b border-border-primary px-6 pt-5 pb-4"
                >
                  <div className="flex mb-2">
                    <Image
                      src={reply.post.author.avatar || "/default-avatar.png"}
                      alt={`${reply.post.author.displayName}'s avatar`}
                      width={40}
                      height={40}
                      className="rounded-full mr-3 w-10 h-10"
                    />
                    <div className="flex flex-col">
                      <div className="flex flex-row gap-2">
                        <div className="text-text-primary">
                          {reply.post.author.displayName}
                        </div>
                        <div className="text-text-tertiary">
                          @{reply.post.author.handle}
                        </div>
                      </div>
                      <div className="text-text-secondary">
                        {(reply.post.record as AppBskyFeedPost.Record).text}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      />
    </>
  );
}
