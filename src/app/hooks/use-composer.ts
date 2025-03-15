import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RichText as RichTextAPI } from "@atproto/api";
import { useState, useCallback } from "react";
import { agent } from "~/lib/api";

interface PostMutationInput {
  richText: RichTextAPI;
}

interface UseComposerOptions {
  onSuccess?: () => void;
}

export function useComposer({ onSuccess }: UseComposerOptions = {}) {
  const [richText, setRichText] = useState(() => new RichTextAPI({ text: "" }));
  const queryClient = useQueryClient();

  const postMutation = useMutation({
    mutationFn: async ({ richText }: PostMutationInput) => {
      // We already have facets detected without resolution from the editor
      // Now we need to resolve them (e.g., fetch mention details)
      await richText.detectFacets(agent);

      const response = await agent.post({
        text: richText.text,
        facets: richText.facets,
      });

      return response;
    },
    onSuccess: (data) => {
      setRichText(new RichTextAPI({ text: "" }));

      // Refetch after posting
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      onSuccess?.();
    },
  });

  const handleSubmit = useCallback(() => {
    if (!richText.text.trim()) return;

    postMutation.mutate({ richText });
  }, [richText, postMutation]);

  return {
    richText,
    setRichText,
    isSubmitting: postMutation.isPending,
    error: postMutation.error,
    handleSubmit,
  };
}
