"use client";

import Image from "next/image";
import Link from "next/link";
import { AppBskyNotificationListNotifications } from "@atproto/api";
import { formatDistanceToNow } from "date-fns";

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

export function NotificationItem({ notification }: NotificationItemProps) {
  const timeAgo = formatDistanceToNow(new Date(notification.indexedAt), {
    addSuffix: true,
  });

  const postUri = notification.reasonSubject || notification.uri;
  const postId = postUri?.split("/").pop();
  const authorHandle = notification.author.handle;

  return (
    <div className="px-6 py-4 border-b border-border-primary hover:bg-hover">
      <div className="flex items-start gap-3">
        <Link
          href={`/${authorHandle}`}
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
              href={`/${authorHandle}`}
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-text-primary hover:underline"
            >
              {notification.author.displayName}
            </Link>
            <span className="text-sm text-text-tertiary">
              @{notification.author.handle}
            </span>
            <span className="text-sm text-text-tertiary">·</span>
            <span className="text-sm text-text-tertiary">{timeAgo}</span>
          </div>
          <div className="text-sm text-text-tertiary">
            {getNotificationText(notification.reason)}
          </div>
          {notification.record && (
            <Link
              href={postId ? `/${authorHandle}/${postId}` : `/${authorHandle}`}
              className="block mt-2 rounded-lg text-text-secondary hover:bg-hover"
            >
              {"text" in notification.record &&
                typeof notification.record.text === "string" && (
                  <div className="text-text-secondary">
                    {notification.record.text}
                  </div>
                )}
              {"reply" in notification.record &&
                (notification.record as ReplyRecord).reply?.parent?.author
                  ?.handle && (
                  <div className="mt-1 text-sm text-text-tertiary">
                    Replying to @
                    {
                      (notification.record as ReplyRecord).reply.parent.author
                        .handle
                    }
                  </div>
                )}
            </Link>
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
    </div>
  );
}

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
