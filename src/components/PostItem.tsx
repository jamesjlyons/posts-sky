"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type {
  AppBskyFeedDefs,
  AppBskyFeedPost,
  AppBskyEmbedImages,
} from "@atproto/api";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { agent } from "../lib/api";
import { useState, useCallback } from "react";

interface PostItemProps {
  post: AppBskyFeedDefs.PostView;
  isClickable?: boolean;
  showTimeAgo?: boolean;
  showBorder?: boolean;
  isThreadView?: boolean;
  showTopLine?: boolean;
  showBottomLine?: boolean;
  showFullDate?: boolean;
  isMainThreadPost?: boolean;
  ref?: ((node: HTMLElement | null) => void) | null;
}

export function PostItem({
  post,
  isClickable = true,
  showTimeAgo = true,
  showBorder = true,
  isThreadView = false,
  showTopLine = false,
  showBottomLine = false,
  showFullDate = false,
  isMainThreadPost = false,
  ref,
}: PostItemProps) {
  const router = useRouter();
  const author = post.author;
  const record = post.record as AppBskyFeedPost.Record;
  const [isLiked, setIsLiked] = useState(post.viewer?.like ? true : false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const timeAgo = showTimeAgo
    ? formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })
    : null;

  const timeDisplay = showFullDate
    ? format(new Date(record.createdAt), "MMM d 'at' h:mm a")
    : timeAgo;

  const handleClick = () => {
    if (!isClickable) return;
    const uriParts = post.uri.split("/");
    const postId = uriParts[uriParts.length - 1];
    const authorHandle = post.author.handle;
    router.push(`/${authorHandle}/${postId}`);
  };

  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent post click when clicking like button

      try {
        if (isLiked) {
          // Unlike the post
          if (post.viewer?.like) {
            await agent.deleteLike(post.viewer.like);
            setIsLiked(false);
            setLikeCount((prev) => Math.max(0, prev - 1));
          }
        } else {
          // Like the post
          await agent.like(post.uri, post.cid);
          setIsLiked(true);
          setLikeCount((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error toggling like:", error);
      }
    },
    [post.uri, post.cid, post.viewer?.like, isLiked]
  );

  const LikeButton = () => (
    <div
      className="flex items-center gap-1 cursor-pointer hover:bg-hover rounded-md p-1.5 -m-1.5 transition-colors"
      onClick={handleLike}
      role="button"
      tabIndex={0}
      aria-label={isLiked ? "Unlike post" : "Like post"}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleLike(e as unknown as React.MouseEvent);
        }
      }}
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
          d={
            isLiked
              ? "M12.642 19.073a1.25 1.25 0 01-1.284 0l-.003-.002-.006-.004-.018-.011a24.1 24.1 0 01-1.104-.73 25.19 25.19 0 01-2.444-1.948c-.888-.81-1.814-1.79-2.525-2.88C4.55 12.412 4 11.132 4 9.75c0-2.815 2.185-5 5-5 1.193 0 2.219.493 3 1.215.781-.722 1.807-1.215 3-1.215 2.815 0 5 2.185 5 5 0 1.383-.55 2.663-1.258 3.747-.71 1.091-1.637 2.072-2.526 2.88a25.192 25.192 0 01-3.547 2.679l-.018.011-.006.004-.003.002z"
              : "M11.358 19.073L12 18l.642 1.073a1.25 1.25 0 01-1.284 0zM12 18s6.75-4.04 6.75-8.25C18.75 7.625 17.125 6 15 6c-1.145 0-2.126.656-2.756 1.591a.3.3 0 01-.488 0C11.126 6.656 10.145 6 9 6 6.875 6 5.25 7.625 5.25 9.75 5.25 13.96 12 18 12 18zm0-12.035c-.781-.722-1.807-1.215-3-1.215-2.815 0-5 2.185-5 5 0 1.383.55 2.663 1.258 3.747.71 1.091 1.637 2.072 2.525 2.88a25.19 25.19 0 003.548 2.679l.018.011.006.004.003.002L12 18l.642 1.073.003-.002.006-.004.018-.011.065-.04a24.1 24.1 0 001.04-.69 25.192 25.192 0 002.443-1.948c.888-.81 1.814-1.79 2.526-2.88C19.448 12.412 20 11.132 20 9.75c0-2.815-2.185-5-5-5-1.193 0-2.219.493-3 1.215z"
          }
          fill={isLiked ? "#f04b4b" : "#888"}
        />
      </svg>
      {likeCount > 0 && (
        <span
          className="text-sm"
          style={{ color: isLiked ? "#f04b4b" : "#888" }}
        >
          {likeCount}
        </span>
      )}
    </div>
  );

  return (
    <div
      ref={ref}
      className={`px-6 pt-5 pb-4 ${isClickable ? "cursor-pointer" : ""} ${
        showBorder ? "border-b border-border-primary" : ""
      }`}
      onClick={handleClick}
    >
      {isMainThreadPost ? (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex flex-col items-center">
              {showTopLine && (
                <div className="w-0.5 bg-border-primary flex-1 mb-2" />
              )}
              <Link
                href={`/${author.handle}`}
                onClick={(e) => e.stopPropagation()}
                className="cursor-pointer"
              >
                <Image
                  src={author.avatar || "/default-avatar.png"}
                  alt={`${author.displayName}'s avatar`}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
              </Link>
              {showBottomLine && (
                <div className="w-0.5 bg-border-primary flex-1 mt-2" />
              )}
            </div>
            <div className="flex flex-col">
              <Link
                href={`/${author.handle}`}
                onClick={(e) => e.stopPropagation()}
                className="text-text-primary hover:text-text-primary hover:underline whitespace-nowrap"
              >
                {author.displayName}
              </Link>
              <div className="text-text-tertiary">@{author.handle}</div>
            </div>
          </div>
          <div className="mb-3 text-xl text-text-secondary">{record.text}</div>
          {post.embed?.$type === "app.bsky.embed.images#view" && (
            <div className="grid gap-2 media-container">
              {(post.embed as AppBskyEmbedImages.View).images.map(
                (image, imageIndex) => (
                  <Image
                    key={`${post.cid}-image-${imageIndex}`}
                    src={image.fullsize || "/default-post-image.png"}
                    alt={image.alt || "Post media"}
                    width={600}
                    height={
                      image.aspectRatio
                        ? (600 / image.aspectRatio.width) *
                          image.aspectRatio.height
                        : 600
                    }
                    className="w-full h-auto max-h-[600px] rounded-lg object-cover"
                  />
                )
              )}
            </div>
          )}
          {timeDisplay && (
            <div className="mt-3 text-sm text-text-tertiary">{timeDisplay}</div>
          )}
          <div className="flex items-center justify-between mt-4 text-text-tertiary">
            <div className="flex items-center gap-1">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.875 10.5A6.125 6.125 0 0110 4.375h4a6.125 6.125 0 013.6 11.08l-5.939 4.315a.625.625 0 01-.978-.638l.542-2.507H10A6.125 6.125 0 013.875 10.5zm14.07-2.866A4.868 4.868 0 0014 5.625h-4a4.875 4.875 0 100 9.75h1.69c.558 0 .973.515.855 1.06l-.294 1.362 4.615-3.353a4.875 4.875 0 001.078-6.81z"
                  fill="currentColor"
                />
              </svg>
              {post.replyCount && post.replyCount > 0 && (
                <span className="text-sm">{post.replyCount}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5.625a6.352 6.352 0 00-4.462 1.821.625.625 0 01-.874-.892A7.626 7.626 0 0119.56 11H21a.5.5 0 01.4.8l-2 2.667a.5.5 0 01-.8 0l-2-2.667a.5.5 0 01.4-.8h1.297A6.377 6.377 0 0012 5.625zM3 13h1.44a7.627 7.627 0 0012.896 4.446.625.625 0 10-.874-.892A6.377 6.377 0 015.703 13H7a.5.5 0 00.4-.8l-2-2.667a.5.5 0 00-.8 0l-2 2.667a.5.5 0 00.4.8z"
                  fill="currentColor"
                />
              </svg>
              {post.repostCount && post.repostCount > 0 && (
                <span className="text-sm">{post.repostCount}</span>
              )}
            </div>
            <LikeButton />
          </div>
        </div>
      ) : (
        <div className="flex mb-2">
          <div className="flex flex-col items-center">
            {isThreadView && showTopLine && (
              <div className="w-0.5 bg-border-primary flex-1 mb-2" />
            )}
            <Link
              href={`/${author.handle}`}
              onClick={(e) => e.stopPropagation()}
              className="cursor-pointer"
            >
              <Image
                src={author.avatar || "/default-avatar.png"}
                alt={`${author.displayName}'s avatar`}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full"
              />
            </Link>
            {isThreadView && showBottomLine && (
              <div className="w-0.5 bg-border-primary flex-1 mt-2" />
            )}
          </div>
          <div className="flex flex-col flex-1 ml-3">
            <div className="flex flex-row gap-2">
              <Link
                href={`/${author.handle}`}
                onClick={(e) => e.stopPropagation()}
                className="text-text-primary hover:text-text-primary hover:underline whitespace-nowrap"
              >
                {author.displayName}
              </Link>
              <div className="text-text-tertiary">@{author.handle}</div>
              {!showFullDate && timeDisplay && (
                <div className="text-text-tertiary">{timeDisplay}</div>
              )}
            </div>
            <div className="text-text-secondary">
              {record.text}
              {post.embed?.$type === "app.bsky.embed.images#view" && (
                <div className="grid gap-2 mt-2 media-container">
                  {(post.embed as AppBskyEmbedImages.View).images.map(
                    (image, imageIndex) => (
                      <Image
                        key={`${post.cid}-image-${imageIndex}`}
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
            {showFullDate && timeDisplay && (
              <div className="mt-3 text-text-tertiary">{timeDisplay}</div>
            )}
            <div className="flex items-center justify-between mt-4 text-text-tertiary">
              <div className="flex items-center gap-1">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.875 10.5A6.125 6.125 0 0110 4.375h4a6.125 6.125 0 013.6 11.08l-5.939 4.315a.625.625 0 01-.978-.638l.542-2.507H10A6.125 6.125 0 013.875 10.5zm14.07-2.866A4.868 4.868 0 0014 5.625h-4a4.875 4.875 0 100 9.75h1.69c.558 0 .973.515.855 1.06l-.294 1.362 4.615-3.353a4.875 4.875 0 001.078-6.81z"
                    fill="currentColor"
                  />
                </svg>
                {post.replyCount && post.replyCount > 0 && (
                  <span className="text-sm">{post.replyCount}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5.625a6.352 6.352 0 00-4.462 1.821.625.625 0 01-.874-.892A7.626 7.626 0 0119.56 11H21a.5.5 0 01.4.8l-2 2.667a.5.5 0 01-.8 0l-2-2.667a.5.5 0 01.4-.8h1.297A6.377 6.377 0 0012 5.625zM3 13h1.44a7.627 7.627 0 0012.896 4.446.625.625 0 10-.874-.892A6.377 6.377 0 015.703 13H7a.5.5 0 00.4-.8l-2-2.667a.5.5 0 00-.8 0l-2 2.667a.5.5 0 00.4.8z"
                    fill="currentColor"
                  />
                </svg>
                {post.repostCount && post.repostCount > 0 && (
                  <span className="text-sm">{post.repostCount}</span>
                )}
              </div>
              <LikeButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
