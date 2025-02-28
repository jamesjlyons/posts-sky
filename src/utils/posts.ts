import type { AppBskyFeedDefs } from "@atproto/api";

export function filterPosts(
  posts: AppBskyFeedDefs.FeedViewPost[],
  feedType: "posts" | "replies" | "media"
) {
  switch (feedType) {
    case "replies":
      return posts.filter((item) => "reply" in item.post.record && item.post.record.reply);
    case "media":
      return posts.filter((item) => {
        const embed = item.post.embed as {
          images?: { alt?: string; image: string }[];
          media?: { images?: { alt?: string; image: string }[] };
        } | null;
        return (
          embed &&
          ((Array.isArray(embed.images) && embed.images.length > 0) ||
            (embed.media && Array.isArray(embed.media.images) && embed.media.images.length > 0))
        );
      });
    case "posts":
      return posts.filter((item) => !("reply" in item.post.record) || !item.post.record.reply);
    default:
      return posts;
  }
}
