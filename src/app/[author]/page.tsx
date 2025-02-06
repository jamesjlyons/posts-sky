"use client";

import { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { AppBskyActorDefs, AppBskyFeedDefs } from "@atproto/api";
import { agent, checkSession, login } from "../../lib/api";
import { MainLayout } from "../../components/MainLayout";
import { LoginDialog } from "../../components/LoginDialog";
import { PostItem } from "../../components/PostItem";

// SVG props for the back arrow icon in the header
const backArrowSvgProps = {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  children: [
    <path
      key="1"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.3258 6.05806C12.5699 6.30214 12.5699 6.69786 12.3258 6.94194L7.26777 12L12.3258 17.0581C12.5699 17.3021 12.5699 17.6979 12.3258 17.9419C12.0817 18.186 11.686 18.186 11.4419 17.9419L5.5 12L11.4419 6.05806C11.686 5.81398 12.0817 5.81398 12.3258 6.05806Z"
      fill="var(--grey1)"
    />,
    <path
      key="2"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.75888 12C6.75888 11.6548 7.0387 11.375 7.38388 11.375H17.8839C18.2291 11.375 18.5 11.6548 18.5 12C18.5 12.3452 18.2291 12.625 17.8839 12.625H7.38388C7.0387 12.625 6.75888 12.3452 6.75888 12Z"
      fill="var(--grey1)"
    />,
  ],
};

export default function ProfilePage() {
  // URL parameters
  const params = useParams();

  // State management
  const [profile, setProfile] =
    useState<AppBskyActorDefs.ProfileViewDetailed | null>(null);
  const [posts, setPosts] = useState<AppBskyFeedDefs.FeedViewPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<
    "posts" | "replies" | "media"
  >("posts");
  const [cursor, setCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  // Add helper function to filter posts
  const filterPosts = useCallback(
    (posts: AppBskyFeedDefs.FeedViewPost[]) => {
      switch (selectedFeed) {
        case "replies":
          return posts.filter(
            (item) => "reply" in item.post.record && item.post.record.reply
          );
        case "media":
          return posts.filter((item) => {
            const embed = item.post.embed as {
              images?: { alt?: string; image: string }[];
              media?: { images?: { alt?: string; image: string }[] };
            } | null;
            return (
              embed &&
              ((Array.isArray(embed.images) && embed.images.length > 0) ||
                (embed.media &&
                  Array.isArray(embed.media.images) &&
                  embed.media.images.length > 0))
            );
          });
        case "posts":
          return posts.filter(
            (item) => !("reply" in item.post.record) || !item.post.record.reply
          );
        default:
          return posts;
      }
    },
    [selectedFeed]
  );

  // Handle user login
  const handleLogin = async (credentials: {
    identifier: string;
    password: string;
  }) => {
    const result = await login(credentials);
    if (result.success) {
      setIsAuthenticated(true);
      setShowLoginDialog(false);
      fetchProfile();
    } else {
      throw new Error("Login failed");
    }
  };

  // Add a handler for feed type changes
  const handleFeedTypeChange = (feedType: typeof selectedFeed) => {
    setSelectedFeed(feedType);
    setCursor(undefined);
    setPosts([]);
    fetchProfile();
  };

  // Modify fetchProfile to better handle cursor
  const fetchProfile = useCallback(
    async (cursorParam?: string) => {
      try {
        const { data: resolveData } =
          await agent.com.atproto.identity.resolveHandle({
            handle: params.author as string,
          });

        const [profileData, feedData] = await Promise.all([
          !cursorParam ? agent.getProfile({ actor: resolveData.did }) : null,
          agent.getAuthorFeed({
            actor: resolveData.did,
            limit: 30,
            cursor: cursorParam,
          }),
        ]);

        if (!cursorParam) {
          setProfile(profileData!.data);
        }

        const allPosts = feedData.data.feed;
        // Only set cursor if we got more posts
        if (allPosts.length > 0) {
          setCursor(feedData.data.cursor);
        } else {
          setCursor(undefined);
        }

        const filteredPosts = filterPosts(allPosts);
        setPosts((prev) =>
          cursorParam ? [...prev, ...filteredPosts] : filteredPosts
        );
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setIsLoading(false);
      setLoadingMore(false);
    },
    [params.author, filterPosts]
  );

  // Add this function at the component level
  const handleScroll = useCallback(
    (e: Event) => {
      const target = e.target as Document;
      const scrollHeight = target.documentElement.scrollHeight;
      const scrollTop = target.documentElement.scrollTop;
      const clientHeight = target.documentElement.clientHeight;

      // If we're near the bottom and not already loading more
      if (
        scrollHeight - scrollTop <= clientHeight * 1.5 &&
        cursor &&
        !loadingMore
      ) {
        setLoadingMore(true);
        fetchProfile(cursor);
      }
    },
    [cursor, loadingMore, fetchProfile]
  );

  // Replace the intersection observer useEffect with this:
  useEffect(() => {
    document.addEventListener("scroll", handleScroll);
    return () => document.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Check authentication on mount and fetch profile data
  useEffect(() => {
    const init = async () => {
      const sessionCheck = await checkSession();
      if (sessionCheck.success) {
        setIsAuthenticated(true);
        fetchProfile();
      } else {
        setShowLoginDialog(true);
        setIsLoading(false);
      }
    };

    init();
  }, [fetchProfile]);

  // Loading and error states
  if (isLoading) {
    return <MainLayout mainContent={<div>Loading...</div>} />;
  }

  if (!profile) {
    return <MainLayout mainContent={<div>Profile not found</div>} />;
  }

  return (
    <>
      {/* Login Dialog */}
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
            {/* Header with back button */}
            <ul className="feedlist text-text-secondary font-medium list-none tap-highlight-color-[rgba(0,0,0,0)] font-smoothing-antialiased m-0 box-border h-15 shadow-[0_1px_0_var(--transparentBorder)] flex flex-row px-6 items-center w-full sticky top-0 bg-[var(--backgroundColor)] z-10 gap-6">
              <li
                className="flex items-center gap-2 cursor-pointer text-text-primary"
                onClick={() => window.history.back()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && window.history.back()}
                aria-label="Go back"
              >
                <svg {...backArrowSvgProps} />
                {profile.displayName || profile.handle}
              </li>
            </ul>

            {/* Profile Header */}
            <div className="px-6 py-4">
              <div className="flex items-center gap-4">
                <Image
                  src={profile.avatar || "/default-avatar.png"}
                  alt={`${profile.displayName}'s avatar`}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
                <div>
                  <h1 className="text-xl font-bold">{profile.displayName}</h1>
                  <p className="text-text-tertiary">@{profile.handle}</p>
                </div>
              </div>
              {profile.description && (
                <p className="mt-4 text-text-secondary">
                  {profile.description}
                </p>
              )}
            </div>

            {/* Feed Type Selector */}
            <ul className="relative flex w-full border-b border-border-primary">
              {/* Add indicator line that slides */}
              <div
                className="absolute bottom-0 h-[1px] bg-text-primary transition-transform duration-200 ease-in-out w-1/3"
                style={{
                  transform: `translateX(${
                    selectedFeed === "posts"
                      ? 0
                      : selectedFeed === "replies"
                      ? 100
                      : 200
                  }%)`,
                }}
              />

              {["posts", "replies", "media"].map((feedType) => (
                <li
                  key={feedType}
                  className={`flex-1 text-center cursor-pointer py-3 ${
                    selectedFeed === feedType
                      ? "text-text-primary"
                      : "text-text-secondary"
                  }`}
                  onClick={() =>
                    handleFeedTypeChange(feedType as typeof selectedFeed)
                  }
                >
                  {feedType.charAt(0).toUpperCase() + feedType.slice(1)}
                </li>
              ))}
            </ul>

            {/* Posts Feed */}
            <div className="posts">
              {posts.map((item, index) => (
                <PostItem
                  key={`${item.post.cid}-${index}`}
                  post={item.post}
                  showTimeAgo={true}
                  showBorder={true}
                />
              ))}
              {loadingMore && (
                <div className="p-4 text-center">Loading more posts...</div>
              )}
            </div>
          </div>
        }
      />
    </>
  );
}
