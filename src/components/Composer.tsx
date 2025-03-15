"use client";

import React from "react";
import { useAuth } from "~/app/hooks";
import { TextInput } from "~/components/TextInput";
import { useComposer } from "~/app/hooks/use-composer";

export function ComposePost() {
  const { isAuthenticated } = useAuth();
  const { richText, setRichText, isSubmitting, error, handleSubmit } = useComposer({
    onSuccess: () => {
      // Like a toast message or whatever
    },
  });

  if (!isAuthenticated) return null;

  return (
    <div className="border-b border-border p-4 flex">
      {/* Avatar column - similar to PostItem */}
      <div className="mr-3"></div>

      {/* Main content column */}
      <div className="flex-1">
        <TextInput
          richtext={richText}
          setRichText={setRichText}
          onPressPublish={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-background text-text-primary"
        />

        <div className="flex justify-between items-center mt-2">
          <div className="text-text-secondary text-sm">{richText.text.length}/300</div>
          <button
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              isSubmitting || !richText.text.trim()
                ? "bg-primary/50 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
            } text-white transition-colors`}
            onClick={handleSubmit}
            disabled={isSubmitting || !richText.text.trim()}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error instanceof Error ? error.message : "Failed to post"}
          </div>
        )}
      </div>
    </div>
  );
}
