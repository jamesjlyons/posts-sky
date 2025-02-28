import { useInfiniteQuery } from "@tanstack/react-query";
import { agent } from "~/lib/api";
import { queryConfig } from "~/config/query";
import type { AppBskyNotificationListNotifications } from "@atproto/api";
import type { FeedType } from "../notifications/page";

export type NotificationType = AppBskyNotificationListNotifications.Notification;
export type NotificationReason =
  | "like"
  | "repost"
  | "follow"
  | "mention"
  | "reply"
  | "quote"
  | "starterpack-joined";

interface NotificationsResponse {
  notifications: NotificationType[];
  cursor?: string;
}

export function useNotifications(isAuthenticated: boolean, selectedFeed: FeedType) {
  return useInfiniteQuery<NotificationsResponse>({
    queryKey: ["notifications", selectedFeed],
    queryFn: async ({ pageParam }) => {
      const params: AppBskyNotificationListNotifications.QueryParams = {
        limit: queryConfig.limit,
        cursor: pageParam as string | undefined,
      };

      if (selectedFeed === "mentions") {
        params.reasons = ["mention", "reply"];
      }

      const { data } = await agent.listNotifications(params);

      return data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
    enabled: isAuthenticated,
    ...queryConfig.notifications,
  });
}
