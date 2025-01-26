// src/app/page.tsx
import { agent } from "~/lib/api";
import { formatDistanceToNow } from "date-fns";

export default async function Homepage() {
  // const feedUrl = "at://did:plc:tft77e5qkblxtneeib4lp3zk/feed/aaahltvlqwftc";
  const feedUrl =
    "at://did:plc:tft77e5qkblxtneeib4lp3zk/app.bsky.feed.generator/aaahltvlqwftc";

  // Assuming the correct method is `getPostsFromFeed` for demonstration purposes
  // const posts = await agent.app.bsky.getPostsFromFeed({
  //   feed: feedUrl,
  //   limit: 10,
  // });

  // const { feed: postsArray, cursor: nextPage } = data;

  const { data } = await agent.app.bsky.feed.getFeed(
    {
      feed: feedUrl,
      limit: 30,
    },
    {
      headers: {
        // TODO: get preferred languages from user
        // "Accept-Language": preferredLanguages,
        "Accept-Language": "en-US",
      },
    }
  );

  console.log("API Response:", data);

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-xl my-4">PostsSky</h1>
      {/* <ul>
        {posts.data.posts.map((post) => (
          <li key={post.id}>{post.content}</li>
        ))}
      </ul> */}
      {/* <ul>
        {data.feed.map((post) => (
          <li key={post.id as string}>{post.content as string}</li>
        ))}
      </ul> */}
      <ul>
        {data.feed.map((item) => {
          const post = item.post;
          const author = post.author;
          const timeAgo = formatDistanceToNow(new Date(post.record.createdAt), {
            addSuffix: true,
          });

          return (
            <li key={post.cid as string} className="border-b py-4">
              <div className="flex items-center mb-2">
                <img
                  src={author.avatar}
                  alt={`${author.displayName}'s avatar`}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <div className="font-bold">{author.displayName}</div>
                  <div className="text-sm text-gray-500">@{author.handle}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-2">{timeAgo}</div>
              <div className="text-lg">{post.record.text}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
