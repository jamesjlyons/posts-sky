/* 
This is where we can configure the query cache times and other options
Everything in a nice central location
*/

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
    staleTime: 0, // Always fetch fresh on feed switch
    cacheTime: 1000 * 60 * 5, // 5 minutes
  },
  limit: 25,
  refetchOnWindowFocus: true,
  retry: 2,
} as const;
