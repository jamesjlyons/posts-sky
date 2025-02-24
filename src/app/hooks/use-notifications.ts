import { useInfiniteQuery } from "@tanstack/react-query";
import { agent } from "~/lib/api";
import { queryConfig } from "~/config/query";
import type { AppBskyNotificationListNotifications } from "@atproto/api";

export type NotificationType = AppBskyNotificationListNotifications.Notification;

interface NotificationsResponse {
  notifications: NotificationType[];
  cursor?: string;
}

export function useNotifications(isAuthenticated: boolean) {
  return useInfiniteQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: async ({ pageParam }) => {
      const { data } = await agent.listNotifications({
        limit: queryConfig.limit,
        cursor: pageParam as string | undefined,
      });
      return data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
    enabled: isAuthenticated,
    ...queryConfig.notifications,
  });
}
