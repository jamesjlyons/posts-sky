"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AppBskyFeedDefs,
  AppBskyFeedPost,
  AppBskyEmbedImages,
} from "@atproto/api";
import { formatDistanceToNow, format } from "date-fns";

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
              <Image
                src={author.avatar || "/default-avatar.png"}
                alt={`${author.displayName}'s avatar`}
                width={40}
                height={40}
                className="rounded-full w-10 h-10"
              />
              {showBottomLine && (
                <div className="w-0.5 bg-border-primary flex-1 mt-2" />
              )}
            </div>
            <div className="flex flex-col">
              <div className="text-text-primary">{author.displayName}</div>
              <div className="text-text-tertiary">@{author.handle}</div>
            </div>
          </div>
          <div className="text-text-secondary text-xl mb-3">{record.text}</div>
          {post.embed?.$type === "app.bsky.embed.images#view" && (
            <div className="media-container grid gap-2">
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
            <div className="text-text-tertiary text-sm mt-3">{timeDisplay}</div>
          )}
        </div>
      ) : (
        <div className="flex mb-2">
          <div className="flex flex-col items-center">
            {isThreadView && showTopLine && (
              <div className="w-0.5 bg-border-primary flex-1 mb-2" />
            )}
            <Image
              src={author.avatar || "/default-avatar.png"}
              alt={`${author.displayName}'s avatar`}
              width={40}
              height={40}
              className="rounded-full w-10 h-10"
            />
            {isThreadView && showBottomLine && (
              <div className="w-0.5 bg-border-primary flex-1 mt-2" />
            )}
          </div>
          <div className="flex flex-col flex-1 ml-3">
            <div className="flex flex-row gap-2">
              <div className="text-text-primary">{author.displayName}</div>
              <div className="text-text-tertiary">@{author.handle}</div>
              {!showFullDate && timeDisplay && (
                <div className="text-text-tertiary">{timeDisplay}</div>
              )}
            </div>
            <div className="text-text-secondary">
              {record.text}
              {post.embed?.$type === "app.bsky.embed.images#view" && (
                <div className="media-container mt-2 grid gap-2">
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
              <div className="text-text-tertiary mt-3">{timeDisplay}</div>
            )}
            <div className="flex items-center gap-1 mt-2 text-text-tertiary">
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
          </div>
        </div>
      )}
    </div>
  );
}
