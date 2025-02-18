"use client";

import Image from "next/image";
import Link from "next/link";
import { AppBskyNotificationListNotifications } from "@atproto/api";
import { formatDistanceToNow } from "date-fns";
import { agent } from "../lib/api";

// Types for component props and nested data structures
interface NotificationItemProps {
  notification: AppBskyNotificationListNotifications.Notification;
}

interface ReplyRecord {
  reply: {
    parent: {
      author: {
        handle: string;
      };
    };
  };
}

/**
 * Removes the @ symbol from a handle if present
 */
function sanitizeHandle(handle: string): string {
  return handle.startsWith("@") ? handle.slice(1) : handle;
}

/**
 * Extracts author handle and post ID from a Bluesky URI
 * Handles both DID format (at://did:plc:abcdef/app.bsky.feed.post/postid)
 * and direct handle format (at://handle.bsky.social/app.bsky.feed.post/postid)
 */
function parseBlueskyUri(uri: string) {
  if (!uri) return { authorHandle: "", postId: "" };

  const parts = uri.split("/");
  const hostPart = parts[2] || "";
  const postId = parts[parts.length - 1] || "";

  // Extract handle from either DID or direct handle format
  let handle = "";
  if (hostPart.startsWith("did:")) {
    const didParts = hostPart.split(":");
    handle = didParts.length >= 3 ? didParts[2] : "";
  } else {
    handle = hostPart;
  }

  return {
    authorHandle: handle,
    postId,
  };
}

/**
 * Type guard to check if a record is a reply record
 * This ensures type safety when accessing nested reply properties
 */
function isReplyRecord(record: unknown): record is ReplyRecord {
  if (!record || typeof record !== "object") return false;
  const maybeReply = record as Partial<ReplyRecord>;

  return !!(
    maybeReply.reply?.parent?.author?.handle &&
    typeof maybeReply.reply.parent.author.handle === "string"
  );
}

export function NotificationItem({ notification }: NotificationItemProps) {
  // Format the notification timestamp
  const timeAgo = formatDistanceToNow(new Date(notification.indexedAt), {
    addSuffix: true,
  });

  // Extract post information based on notification type
  let postId: string | undefined;
  let authorHandle = "";

  if (notification.reason === "like") {
    // For likes, we use:
    // - reasonSubject for the post ID (points to the liked post)
    // - logged-in user's handle (since they're the post owner)
    if (notification.reasonSubject) {
      const likedPostInfo = parseBlueskyUri(notification.reasonSubject);
      postId = likedPostInfo.postId;
      authorHandle = sanitizeHandle(agent.session?.handle || "");
    }
  } else {
    // For other notifications (replies, mentions, etc.):
    // - use the notification's URI for post info
    // - use the notification author's handle
    const notificationPostInfo = parseBlueskyUri(notification.uri || "");
    postId = notificationPostInfo.postId;
    authorHandle = sanitizeHandle(
      (notification.record as { author?: { handle?: string } })?.author
        ?.handle || notification.author.handle
    );
  }

  const sanitizedNotificationHandle = sanitizeHandle(
    notification.author.handle
  );

  // Subcomponent to render "Replying to @handle" text
  const ReplyingTo = ({ record }: { record: ReplyRecord }) => (
    <div className="mt-1 text-sm text-text-tertiary">
      Replying to{" "}
      <Link
        href={`/${record.reply.parent.author.handle}`}
        onClick={(e) => e.stopPropagation()}
        className="hover:underline"
      >
        @{record.reply.parent.author.handle}
      </Link>
    </div>
  );

  // Subcomponent for the main notification content
  const NotificationContent = () => (
    <div className="flex items-start gap-3">
      <Link
        href={`/${sanitizedNotificationHandle}`}
        onClick={(e) => e.stopPropagation()}
        className="flex-shrink-0"
      >
        <Image
          src={notification.author.avatar || "/default-avatar.png"}
          alt={`${notification.author.displayName}'s avatar`}
          width={40}
          height={40}
          className="rounded-full"
        />
      </Link>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/${sanitizedNotificationHandle}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-text-primary hover:underline"
          >
            {notification.author.displayName}
          </Link>
          <span className="text-sm text-text-tertiary">
            @{sanitizedNotificationHandle}
          </span>
          <span className="text-sm text-text-tertiary">·</span>
          <span className="text-sm text-text-tertiary">{timeAgo}</span>
        </div>
        <div className="text-sm text-text-tertiary">
          {getNotificationText(notification.reason)}
        </div>
        {notification.record && (
          <div className="mt-2 rounded-lg text-text-secondary">
            {"text" in notification.record &&
              typeof notification.record.text === "string" && (
                <div className="text-text-secondary">
                  {notification.record.text}
                </div>
              )}
            {notification.record && isReplyRecord(notification.record) && (
              <ReplyingTo record={notification.record} />
            )}
          </div>
        )}
        {notification.reasonSubject &&
          (notification.reason === "like" ||
            notification.reason === "repost") && (
            <div className="pl-3 mt-2 border-l-2 text-text-secondary border-border-primary">
              {notification.record &&
                "text" in notification.record &&
                typeof notification.record.text === "string" && (
                  <div className="text-text-secondary line-clamp-2">
                    {notification.record.text}
                  </div>
                )}
            </div>
          )}
      </div>
    </div>
  );

  // Render the notification with appropriate wrapping
  // - Like, reply, and mention notifications are wrapped in a Link to the target post
  // - Other notifications (follow, repost) are wrapped in a div
  return (notification.reason === "like" ||
    notification.reason === "reply" ||
    notification.reason === "mention") &&
    postId ? (
    <Link
      href={`/${authorHandle}/${postId}`}
      className="block px-6 py-4 border-b border-border-primary hover:bg-hover"
    >
      <NotificationContent />
    </Link>
  ) : (
    <div className="px-6 py-4 border-b border-border-primary hover:bg-hover">
      <NotificationContent />
    </div>
  );
}

/**
 * Converts notification reason to human-readable text
 */
function getNotificationText(reason: string): string {
  switch (reason) {
    case "like":
      return "liked your post";
    case "repost":
      return "reposted your post";
    case "follow":
      return "followed you";
    case "mention":
      return "mentioned you";
    case "reply":
      return "replied to your post";
    case "quote":
      return "quoted your post";
    default:
      return reason;
  }
}
