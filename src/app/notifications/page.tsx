"use client";

import { useState, useCallback, useEffect } from "react";
import { AppBskyNotificationListNotifications } from "@atproto/api";
import { agent, checkSession, login } from "../../lib/api";
import { MainLayout } from "../../components/MainLayout";
import { LoginDialog } from "../../components/LoginDialog";
import { NotificationItem } from "../../components/NotificationItem";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<
    AppBskyNotificationListNotifications.Notification[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<"all" | "mentions">("all");
  const [cursor, setCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLogin = async (credentials: {
    identifier: string;
    password: string;
  }) => {
    const result = await login(credentials);
    if (result.success) {
      setIsAuthenticated(true);
      setShowLoginDialog(false);
      fetchNotifications();
    } else {
      throw new Error("Login failed");
    }
  };

  const filterNotifications = useCallback(
    (notifs: AppBskyNotificationListNotifications.Notification[]) => {
      if (selectedFeed === "mentions") {
        return notifs.filter(
          (notif) => notif.reason === "mention" || notif.reason === "reply"
        );
      }
      return notifs;
    },
    [selectedFeed]
  );

  const fetchNotifications = useCallback(
    async (cursorParam?: string) => {
      try {
        const { data } = await agent.listNotifications({
          limit: 30,
          cursor: cursorParam,
        });

        const filteredNotifications = filterNotifications(data.notifications);

        if (data.notifications.length > 0) {
          setCursor(data.cursor);
        } else {
          setCursor(undefined);
        }

        setNotifications((prev) =>
          cursorParam
            ? [...prev, ...filteredNotifications]
            : filteredNotifications
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
      setIsLoading(false);
      setLoadingMore(false);
    },
    [filterNotifications]
  );

  const handleScroll = useCallback(
    (e: Event) => {
      const target = e.target as Document;
      const scrollHeight = target.documentElement.scrollHeight;
      const scrollTop = target.documentElement.scrollTop;
      const clientHeight = target.documentElement.clientHeight;

      if (
        scrollHeight - scrollTop <= clientHeight * 1.5 &&
        cursor &&
        !loadingMore
      ) {
        setLoadingMore(true);
        fetchNotifications(cursor);
      }
    },
    [cursor, loadingMore, fetchNotifications]
  );

  useEffect(() => {
    document.addEventListener("scroll", handleScroll);
    return () => document.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const init = async () => {
      const sessionCheck = await checkSession();
      if (sessionCheck.success) {
        setIsAuthenticated(true);
        fetchNotifications();
      } else {
        setShowLoginDialog(true);
        setIsLoading(false);
      }
    };

    init();
  }, [fetchNotifications]);

  if (isLoading) {
    return <MainLayout mainContent={<div>Loading...</div>} />;
  }

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
            <ul className="feedlist text-text-secondary font-medium list-none tap-highlight-color-[rgba(0,0,0,0)] font-smoothing-antialiased m-0 box-border h-15 shadow-[0_1px_0_var(--transparentBorder)] flex flex-row px-6 items-center w-full sticky top-0 bg-[var(--backgroundColor)] z-10 gap-6 justify-center">
              <li
                className={`cursor-pointer ${
                  selectedFeed === "all"
                    ? "text-text-primary"
                    : "text-text-secondary"
                }`}
                onClick={() => setSelectedFeed("all")}
              >
                All
              </li>
              <li
                className={`cursor-pointer ${
                  selectedFeed === "mentions"
                    ? "text-text-primary"
                    : "text-text-secondary"
                }`}
                onClick={() => setSelectedFeed("mentions")}
              >
                Mentions
              </li>
            </ul>
            <div className="notifications">
              {notifications.map((notification, index) => (
                <NotificationItem
                  key={`${notification.uri}-${index}`}
                  notification={notification}
                />
              ))}
              {loadingMore && (
                <div className="p-4 text-center">
                  Loading more notifications...
                </div>
              )}
            </div>
          </div>
        }
      />
    </>
  );
}
