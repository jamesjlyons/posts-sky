import { RichText as RichTextAPI } from "@atproto/api";
import { useState, useEffect } from "react";
import { agent } from "~/lib/api";

export function useRichText(text: string) {
  const [richText, setRichText] = useState(() => new RichTextAPI({ text }));
  const [isResolving, setIsResolving] = useState(true);

  useEffect(() => {
    const rt = new RichTextAPI({ text });
    rt.detectFacets(agent)
      .then(() => {
        setRichText(rt);
        setIsResolving(false);
      })
      .catch((error) => {
        console.error("Failed to detect facets:", error);
        setIsResolving(false);
      });
  }, [text]);

  return [richText, isResolving] as const;
}
