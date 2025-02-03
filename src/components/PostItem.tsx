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
                loading="lazy"
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,...`}
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
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,...`}
                  />
                )
              )}
            </div>
          )}
          {timeDisplay && (
            <div className="text-text-tertiary text-sm mt-3">{timeDisplay}</div>
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
            <div className="flex items-center gap-1">
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
                  d="M11.358 19.073L12 18l.642 1.073a1.25 1.25 0 01-1.284 0zM12 18s6.75-4.04 6.75-8.25C18.75 7.625 17.125 6 15 6c-1.145 0-2.126.656-2.756 1.591a.3.3 0 01-.488 0C11.126 6.656 10.145 6 9 6 6.875 6 5.25 7.625 5.25 9.75 5.25 13.96 12 18 12 18zm0-12.035c-.781-.722-1.807-1.215-3-1.215-2.815 0-5 2.185-5 5 0 1.383.55 2.663 1.258 3.747.71 1.091 1.637 2.072 2.525 2.88a25.19 25.19 0 003.548 2.679l.018.011.006.004.003.002L12 18l.642 1.073.003-.002.006-.004.018-.011.065-.04a24.1 24.1 0 001.04-.69 25.192 25.192 0 002.443-1.948c.888-.81 1.814-1.79 2.526-2.88C19.448 12.412 20 11.132 20 9.75c0-2.815-2.185-5-5-5-1.193 0-2.219.493-3 1.215z"
                  fill="currentColor"
                />
              </svg>
              {post.likeCount && post.likeCount > 0 && (
                <span className="text-sm">{post.likeCount}</span>
              )}
            </div>
          </div>
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
              loading="lazy"
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,...`}
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
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={`data:image/svg+xml;base64,...`}
                      />
                    )
                  )}
                </div>
              )}
            </div>
            {showFullDate && timeDisplay && (
              <div className="text-text-tertiary mt-3">{timeDisplay}</div>
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
              <div className="flex items-center gap-1">
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
                    d="M11.358 19.073L12 18l.642 1.073a1.25 1.25 0 01-1.284 0zM12 18s6.75-4.04 6.75-8.25C18.75 7.625 17.125 6 15 6c-1.145 0-2.126.656-2.756 1.591a.3.3 0 01-.488 0C11.126 6.656 10.145 6 9 6 6.875 6 5.25 7.625 5.25 9.75 5.25 13.96 12 18 12 18zm0-12.035c-.781-.722-1.807-1.215-3-1.215-2.815 0-5 2.185-5 5 0 1.383.55 2.663 1.258 3.747.71 1.091 1.637 2.072 2.525 2.88a25.19 25.19 0 003.548 2.679l.018.011.006.004.003.002L12 18l.642 1.073.003-.002.006-.004.018-.011.065-.04a24.1 24.1 0 001.04-.69 25.192 25.192 0 002.443-1.948c.888-.81 1.814-1.79 2.526-2.88C19.448 12.412 20 11.132 20 9.75c0-2.815-2.185-5-5-5-1.193 0-2.219.493-3 1.215z"
                    fill="currentColor"
                  />
                </svg>
                {post.likeCount && post.likeCount > 0 && (
                  <span className="text-sm">{post.likeCount}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
