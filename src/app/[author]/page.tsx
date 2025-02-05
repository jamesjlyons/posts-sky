"use client";

import { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { AppBskyActorDefs, AppBskyFeedDefs } from "@atproto/api";
import { agent, checkSession, login } from "../../lib/api";
import { MainLayout } from "../../components/MainLayout";
import { LoginDialog } from "../../components/LoginDialog";
import { PostItem } from "../../components/PostItem";

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
  const params = useParams();
  const [profile, setProfile] =
    useState<AppBskyActorDefs.ProfileViewDetailed | null>(null);
  const [posts, setPosts] = useState<AppBskyFeedDefs.FeedViewPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

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

  const fetchProfile = useCallback(async () => {
    try {
      const { data: resolveData } =
        await agent.com.atproto.identity.resolveHandle({
          handle: params.author as string,
        });

      const [profileData, feedData] = await Promise.all([
        agent.getProfile({ actor: resolveData.did }),
        agent.getAuthorFeed({ actor: resolveData.did, limit: 30 }),
      ]);

      setProfile(profileData.data);
      setPosts(feedData.data.feed);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
    setIsLoading(false);
  }, [params.author]);

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

  if (isLoading) {
    return <MainLayout mainContent={<div>Loading...</div>} />;
  }

  if (!profile) {
    return <MainLayout mainContent={<div>Profile not found</div>} />;
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
            <ul className="feedlist text-text-secondary font-medium list-none tap-highlight-color-[rgba(0,0,0,0)] font-smoothing-antialiased m-0 box-border h-15 shadow-[0_1px_0_var(--transparentBorder)] flex flex-row px-6 items-center w-full sticky top-0 bg-[var(--backgroundColor)] z-10 gap-6">
              <li
                className="text-text-primary cursor-pointer flex items-center gap-2"
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
            <div className="px-6 py-4 border-b border-border-primary">
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

            {/* Posts Feed */}
            <div className="posts">
              {posts.map((item) => (
                <PostItem
                  key={item.post.cid}
                  post={item.post}
                  showTimeAgo={true}
                  showBorder={true}
                />
              ))}
            </div>
          </div>
        }
      />
    </>
  );
}
