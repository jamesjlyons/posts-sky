"use client";

import { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  AppBskyFeedDefs,
  AppBskyFeedPost,
  AppBskyEmbedImages,
} from "@atproto/api";
import { agent, checkSession, login } from "../../../lib/api";
import { MainLayout } from "../../../components/MainLayout";
import { LoginDialog } from "../../../components/LoginDialog";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

export default function PostPage() {
  const params = useParams();
  const [post, setPost] = useState<AppBskyFeedDefs.PostView | null>(null);
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
      });

      if (data.thread.post) {
        setPost(data.thread.post as AppBskyFeedDefs.PostView);
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
  const timeAgo = formatDistanceToNow(new Date(record.createdAt), {
    addSuffix: true,
  });

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
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                    fill="currentColor"
                  />
                </svg>
                Thread
              </li>
            </ul>
            <div className="border-b border-border-primary px-6 pt-5 pb-4">
              <div className="flex mb-2">
                <Image
                  src={post.author.avatar || "/default-avatar.png"}
                  alt={`${post.author.displayName}'s avatar`}
                  width={40}
                  height={40}
                  className="rounded-full mr-3 w-10 h-10"
                />
                <div className="flex flex-col">
                  <div className="flex flex-row gap-2">
                    <div className="text-text-primary">
                      {post.author.displayName}
                    </div>
                    <div className="text-text-tertiary">
                      @{post.author.handle}
                    </div>
                    <div className="text-text-tertiary">{timeAgo}</div>
                  </div>
                  <div className="text-text-secondary">{record.text}</div>
                </div>
              </div>
              {post.embed?.$type === "app.bsky.embed.images#view" && (
                <div className="media-container mt-2 grid gap-2">
                  {(post.embed as AppBskyEmbedImages.View).images.map(
                    (image, imageIndex) => (
                      <Image
                        key={`image-${imageIndex}`}
                        src={image.fullsize || "/default-post-image.png"}
                        alt={image.alt || "Post media"}
                        width={600}
                        height={
                          image.aspectRatio
                            ? (600 / image.aspectRatio.width) *
                              image.aspectRatio.height
                            : 600
                        }
                        className="w-full h-auto max-h-[600px] rounded-lg object-cover mt-2"
                      />
                    )
                  )}
                </div>
              )}
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
