"use client";

import { useState } from "react";
import { useAuth, useNotifications, useInfiniteScroll } from "../hooks";
import { NotificationItem } from "~/components/NotificationItem";
import { LoadingSpinner } from "~/components/LoadingSpinner";

export type FeedType = "all" | "mentions";

const FeedTypeSelector = ({
  selected,
  onChange,
}: {
  selected: FeedType;
  onChange: (type: FeedType) => void;
}) => (
  <ul className="feedlist text-text-secondary font-medium list-none tap-highlight-color-[rgba(0,0,0,0)] font-smoothing-antialiased m-0 box-border h-15 shadow-[0_1px_0_var(--transparentBorder)] flex flex-row px-6 items-center w-full sticky top-0 bg-[var(--backgroundColor)] z-10 gap-6 justify-center">
    <li
      className={`cursor-pointer ${
        selected === "all" ? "text-text-primary" : "text-text-secondary"
      }`}
      onClick={() => onChange("all")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onChange("all")}
      aria-label="Show all notifications"
    >
      All
    </li>
    <li
      className={`cursor-pointer ${
        selected === "mentions" ? "text-text-primary" : "text-text-secondary"
      }`}
      onClick={() => onChange("mentions")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onChange("mentions")}
      aria-label="Show mentions only"
    >
      Mentions
    </li>
  </ul>
);

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const [selectedFeed, setSelectedFeed] = useState<FeedType>("all");

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useNotifications(
    isAuthenticated,
    selectedFeed
  );

  const { lastElementRef } = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  const allNotifications = data?.pages.flatMap((page) => page.notifications) ?? [];

  return (
    <div className="flex flex-col">
      <FeedTypeSelector selected={selectedFeed} onChange={setSelectedFeed} />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="notifications">
          {allNotifications.map((notification, index) => {
            const isLast = index === allNotifications.length - 1;
            return (
              <div key={`${notification.uri}-${index}`} ref={isLast ? lastElementRef : null}>
                <NotificationItem notification={notification} />
              </div>
            );
          })}
          {isFetchingNextPage && (
            <div className="p-4 text-center text-text-secondary">Loading more notifications...</div>
          )}
        </div>
      )}
    </div>
  );
}
