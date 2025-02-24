"use client";

import { useParams } from "next/navigation";
import { useAuth, useThread } from "../../hooks";
import { PostItem } from "../../../components/PostItem";
import { BackArrowIcon } from "../../icons/back-arrow";
import { LoadingSpinner } from "~/components/LoadingSpinner";

export default function PostPage() {
  const params = useParams();
  const { isAuthenticated } = useAuth();

  const {
    data: threadData,
    isLoading,
    isError,
  } = useThread(params.author as string, params.id as string, isAuthenticated);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !threadData?.post) {
    return <div className="p-6">Post not found</div>;
  }

  return (
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
          <BackArrowIcon />
          Thread
        </li>
      </ul>

      {/* Parent Post (if exists) */}
      {threadData.parentPost && (
        <PostItem
          post={threadData.parentPost}
          showTimeAgo={false}
          isThreadView={true}
          showBottomLine={true}
        />
      )}

      {/* Current Post */}
      <PostItem
        post={threadData.post}
        isClickable={false}
        showTimeAgo={false}
        showFullDate={true}
        showBorder={false}
        isThreadView={true}
        showTopLine={!!threadData.parentPost}
        showBottomLine={threadData.replies.length > 0}
        isMainThreadPost={true}
      />

      {/* Replies */}
      <div className="replies">
        {threadData.replies.map((reply, index) => (
          <PostItem
            key={reply.post.cid}
            post={reply.post}
            showTimeAgo={false}
            isThreadView={true}
            showTopLine={true}
            showBottomLine={index !== threadData.replies.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
