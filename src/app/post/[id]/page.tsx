"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "../../../components/MainLayout";
import { agent } from "~/lib/api";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import type {
  AppBskyFeedDefs,
  AppBskyFeedPost,
  AppBskyEmbedImages,
} from "@atproto/api";

export default function PostPage() {
  const params = useParams();
  const [post, setPost] = useState<AppBskyFeedDefs.PostView | null>(null);
  const [replies, setReplies] = useState<AppBskyFeedDefs.FeedViewPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postId = decodeURIComponent(params.id as string);
        const { data } = await agent.app.bsky.feed.getPostThread({
          uri: postId,
          depth: 1,
        });

        if (data.thread.post) {
          setPost(data.thread.post);
          if (data.thread.replies) {
            setReplies(data.thread.replies);
          }
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  if (isLoading) {
    return <MainLayout mainContent={<div>Loading...</div>} />;
  }

  if (!post) {
    return <MainLayout mainContent={<div>Post not found</div>} />;
  }

  const record = post.record as AppBskyFeedPost.Record;
  const timeAgo = formatDistanceToNow(new Date(record.createdAt), {
    addSuffix: true,
  });

  return (
    <MainLayout
      mainContent={
        <div className="flex flex-col">
          <div className="border-b border-border-primary px-6 pt-5 pb-4">
            <div className="flex mb-2">
              <Image
                src={post.author.avatar || "/default-avatar.png"}
                alt={`${post.author.displayName}'s avatar`}
                width={40}
                height={40}
                className="rounded-full mr-3 w-10 h-10"
              />
              <div className="flex flex-col">
                <div className="flex flex-row gap-2">
                  <div className="text-text-primary">
                    {post.author.displayName}
                  </div>
                  <div className="text-text-tertiary">
                    @{post.author.handle}
                  </div>
                  <div className="text-text-tertiary">{timeAgo}</div>
                </div>
                <div className="text-text-secondary">{record.text}</div>
              </div>
            </div>
            {post.embed?.$type === "app.bsky.embed.images#view" && (
              <div className="media-container mt-2 grid gap-2">
                {(post.embed as AppBskyEmbedImages.View).images.map(
                  (image, imageIndex) => (
                    <Image
                      key={`image-${imageIndex}`}
                      src={image.fullsize || "/default-post-image.png"}
                      alt={image.alt || "Post media"}
                      width={600}
                      height={
                        image.aspectRatio
                          ? (600 / image.aspectRatio.width) *
                            image.aspectRatio.height
                          : 600
                      }
                      className="w-full h-auto max-h-[600px] rounded-lg object-cover mt-2"
                    />
                  )
                )}
              </div>
            )}
          </div>
          <div className="replies">
            {replies.map((reply) => (
              <div
                key={reply.post.cid}
                className="border-b border-border-primary px-6 pt-5 pb-4"
              >
                <div className="flex mb-2">
                  <Image
                    src={reply.post.author.avatar || "/default-avatar.png"}
                    alt={`${reply.post.author.displayName}'s avatar`}
                    width={40}
                    height={40}
                    className="rounded-full mr-3 w-10 h-10"
                  />
                  <div className="flex flex-col">
                    <div className="flex flex-row gap-2">
                      <div className="text-text-primary">
                        {reply.post.author.displayName}
                      </div>
                      <div className="text-text-tertiary">
                        @{reply.post.author.handle}
                      </div>
                    </div>
                    <div className="text-text-secondary">
                      {(reply.post.record as AppBskyFeedPost.Record).text}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
