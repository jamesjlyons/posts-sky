import { useInfiniteQuery } from "@tanstack/react-query";
import { agent } from "../../lib/api";
import { queryConfig } from "../../config/query";
import type { AppBskyFeedDefs } from "@atproto/api";

type FeedResponse = {
  feed: AppBskyFeedDefs.FeedViewPost[];
  cursor?: string;
};

interface InfiniteFeedResponse extends FeedResponse {
  pages: FeedResponse[];
}

const feedUrls = {
  feed1:
    "at://did:plc:tft77e5qkblxtneeib4lp3zk/app.bsky.feed.generator/posts-only",
  feed2:
    "at://did:plc:tft77e5qkblxtneeib4lp3zk/app.bsky.feed.generator/aaahltvlqwftc",
  feed3:
    "at://did:plc:tft77e5qkblxtneeib4lp3zk/app.bsky.feed.generator/posts-cv-media",
} as const;

export function useHomeFeed(
  selectedFeed: "feed1" | "feed2" | "feed3",
  isAuthenticated: boolean
) {
  return useInfiniteQuery<
    FeedResponse,
    Error,
    InfiniteFeedResponse,
    string[],
    string | undefined
  >({
    queryKey: ["home-feed", selectedFeed],
    queryFn: async ({ pageParam }) => {
      const { data } = await agent.app.bsky.feed.getFeed({
        feed: feedUrls[selectedFeed],
        limit: queryConfig.limit,
        cursor: pageParam,
      });
      return data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
    enabled: isAuthenticated,
    ...queryConfig.homeFeed,
  });
}

export function useProfileFeed(
  identifier: string | null,
  feedType: "posts" | "replies" | "media",
  isAuthenticated: boolean
) {
  return useInfiniteQuery<
    FeedResponse,
    Error,
    InfiniteFeedResponse,
    (string | null)[],
    string | undefined
  >({
    queryKey: ["profile-feed", identifier, feedType] as (string | null)[],
    queryFn: async ({ pageParam }) => {
      if (!identifier || !isAuthenticated) return { feed: [], cursor: undefined };

      const feedData = await agent.getAuthorFeed({
        actor: identifier,
        limit: queryConfig.limit,
        cursor: pageParam,
      });

      return feedData.data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
    enabled: !!identifier && isAuthenticated,
    ...queryConfig.profileFeed,
  });
}
