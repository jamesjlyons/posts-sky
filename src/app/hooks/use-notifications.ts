import { useInfiniteQuery } from "@tanstack/react-query";
import { agent } from "~/lib/api";
import { queryConfig } from "~/config/query";
import type { AppBskyNotificationListNotifications } from "@atproto/api";
import type { FeedType } from "../notifications/page";

export type NotificationType = AppBskyNotificationListNotifications.Notification;

interface NotificationsResponse {
  notifications: NotificationType[];
  cursor?: string;
}

export function useNotifications(isAuthenticated: boolean, selectedFeed: FeedType) {
  return useInfiniteQuery<NotificationsResponse>({
    queryKey: ["notifications", selectedFeed],
    queryFn: async ({ pageParam }) => {
      const { data } = await agent.listNotifications({
        limit: queryConfig.limit,
        cursor: pageParam as string | undefined,
      });

      // DEBUGGING LOG
      console.log(
        "Raw notifications:",
        data.notifications.map((n) => ({
          reason: n.reason,
          uri: n.uri,
          isReply: n.reason === "reply",
          isMention: n.reason === "mention",
        }))
      );

      return data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
    enabled: isAuthenticated,
    ...queryConfig.notifications,
  });
}
