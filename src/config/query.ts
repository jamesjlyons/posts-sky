export const queryConfig = {
  homeFeed: {
    staleTime: 1000 * 30, // 30 seconds
    cacheTime: 1000 * 60 * 5, // 5 minutes
  },
  profileFeed: {
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 10, // 10 minutes
  },
  profile: {
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 10, // 10 minutes
  },
  notifications: {
    staleTime: 1000 * 15, // 15 seconds
    cacheTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 30, // Poll every 30 seconds
  },
  limit: 30,
  refetchOnWindowFocus: true,
  retry: 2,
} as const;
