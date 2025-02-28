import { useQuery } from "@tanstack/react-query";
import { agent } from "~/lib/api";
import { queryConfig } from "~/config/query";
import type { AppBskyFeedDefs } from "@atproto/api";

interface ThreadResponse {
  post: AppBskyFeedDefs.PostView | null;
  parentPost: AppBskyFeedDefs.PostView | null;
  replies: AppBskyFeedDefs.FeedViewPost[];
}

export function useThread(author: string | null, id: string | null, isAuthenticated: boolean) {
  return useQuery<ThreadResponse>({
    queryKey: ["thread", author, id],
    queryFn: async () => {
      if (!author || !id) {
        return { post: null, parentPost: null, replies: [] };
      }

      const { data: resolveData } = await agent.com.atproto.identity.resolveHandle({
        handle: author,
      });

      const postId = `at://${resolveData.did}/app.bsky.feed.post/${id}`;
      const { data } = await agent.app.bsky.feed.getPostThread({
        uri: postId,
        depth: 1,
        parentHeight: 1,
      });

      const threadData: ThreadResponse = {
        post: null,
        parentPost: null,
        replies: [],
      };

      if (data.thread.post) {
        threadData.post = data.thread.post as AppBskyFeedDefs.PostView;

        if (
          data.thread.parent &&
          typeof data.thread.parent === "object" &&
          "post" in data.thread.parent
        ) {
          threadData.parentPost = data.thread.parent.post as AppBskyFeedDefs.PostView;
        }

        if (data.thread.replies) {
          threadData.replies = data.thread.replies as AppBskyFeedDefs.FeedViewPost[];
        }
      }

      return threadData;
    },
    enabled: !!author && !!id && isAuthenticated,
    ...queryConfig.profile, // We can reuse the profile config since it's similar. 
  });
}
