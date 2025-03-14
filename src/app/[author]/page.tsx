"use client";

import Image from "next/image";
import { useState } from "react";
import { useParams } from "next/navigation";
import { PostItem } from "~/components/PostItem";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { useAuth, useProfile, useProfileFeed, useInfiniteScroll } from "../hooks";
import { filterPosts } from "../../utils/posts";
import { BackArrowIcon } from "../icons/back-arrow";
import Link from "next/link";
import type { AppBskyActorDefs, AppBskyFeedDefs } from "@atproto/api";
import { ProfileDescription } from "~/components/ProfileDescription";

function ProfileHeader({ profile }: { profile: AppBskyActorDefs.ProfileViewDetailed }) {
  return (
    <div>
      <ul className="feedlist text-text-secondary font-medium list-none tap-highlight-color-[rgba(0,0,0,0)] font-smoothing-antialiased m-0 box-border h-15 shadow-[0_1px_0_var(--transparentBorder)] flex flex-row px-6 items-center w-full sticky top-0 bg-[var(--backgroundColor)] z-10 gap-6">
        <Link href="/">
          <li className="flex items-center gap-2 cursor-pointer text-text-primary">
            <BackArrowIcon />
            {profile.displayName || profile.handle}
          </li>
        </Link>
      </ul>

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
            <ProfileDescription description={profile.description} />
          </p>
        )}
      </div>
    </div>
  );
}

function FeedTypeSelector({
  selected,
  onChange,
}: {
  selected: "posts" | "replies" | "media";
  onChange: (type: "posts" | "replies" | "media") => void;
}) {
  return (
    <ul className="relative flex w-full border-b border-border-primary">
      <div
        className="absolute bottom-0 h-[1px] bg-text-primary transition-transform duration-200 ease-in-out w-1/3"
        style={{
          transform: `translateX(${
            selected === "posts" ? 0 : selected === "replies" ? 100 : 200
          }%)`,
        }}
      />

      {["posts", "replies", "media"].map((feedType) => (
        <li
          key={feedType}
          className={`flex-1 text-center cursor-pointer py-3 ${
            selected === feedType ? "text-text-primary" : "text-text-secondary"
          }`}
          onClick={() => onChange(feedType as typeof selected)}
        >
          {feedType.charAt(0).toUpperCase() + feedType.slice(1)}
        </li>
      ))}
    </ul>
  );
}

function PostsFeed({
  posts,
  isFetchingNextPage,
  lastPostRef,
}: {
  posts: AppBskyFeedDefs.FeedViewPost[];
  isFetchingNextPage: boolean;
  lastPostRef: (node: HTMLElement | null) => void;
}) {
  return (
    <div className="posts">
      {posts.map((item, index) => {
        const isLastPost = index === posts.length - 1;
        return (
          <PostItem
            key={`${item.post.cid}-${index}`}
            post={item.post}
            ref={isLastPost ? lastPostRef : null}
            showTimeAgo={true}
            showBorder={true}
          />
        );
      })}
      <div className="p-4 text-center">{isFetchingNextPage && "Loading more posts..."}</div>
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [selectedFeed, setSelectedFeed] = useState<"posts" | "replies" | "media">("posts");
  // Need to decode the identifier for DIDs
  const identifier = decodeURIComponent(params.author as string);

  const { data: profile } = useProfile(identifier, isAuthenticated);

  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isFeedPending,
  } = useProfileFeed(identifier, selectedFeed, isAuthenticated);

  const { lastElementRef } = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  const allPosts = feedData?.pages.flatMap((page) => filterPosts(page.feed, selectedFeed)) ?? [];

  return (
    <div className="flex flex-col">
      {/* Stable content with initial load transition */}
      <div
        className={`transition-opacity duration-200 ease-in ${
          !feedData && !profile ? "opacity-0" : "opacity-100"
        }`}
      >
        {profile && (
          <>
            <ProfileHeader profile={profile} />
            <FeedTypeSelector selected={selectedFeed} onChange={setSelectedFeed} />
          </>
        )}
      </div>
      {/* Feed content with its own transition */}
      <div>
        {isFeedPending && profile && <LoadingSpinner />}
        {!isFeedPending && profile && (
          <PostsFeed
            posts={allPosts}
            isFetchingNextPage={isFetchingNextPage}
            lastPostRef={lastElementRef}
          />
        )}
      </div>
    </div>
  );
}
