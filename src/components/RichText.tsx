import React from "react";
import Link from "next/link";
// It looks like we have no choice but to import the whole API to get the RichText functionality
// This is not ideal from a perf perspective (708.5k import), but the alternative is to write our own parser, which, no.
import { RichText as RichTextAPI, AppBskyRichtextFacet } from "@atproto/api";

interface RichTextProps {
  text: string;
  facets?: AppBskyRichtextFacet.Main[];
  disableLinks?: boolean;
}

export function RichText({ text, facets, disableLinks = false }: RichTextProps) {
  const richText = React.useMemo(() => new RichTextAPI({ text, facets }), [text, facets]);

  const elements = [];
  let key = 0;

  for (const segment of richText.segments()) {
    const link = segment.link;
    const mention = segment.mention;
    // TODO: Add search route for hashtags, then uncomment this
    // const tag = segment.tag;

    if (link && !disableLinks && AppBskyRichtextFacet.validateLink(link).success) {
      elements.push(
        <a
          key={key}
          href={link.uri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {segment.text}
        </a>
      );
    } else if (mention && !disableLinks && AppBskyRichtextFacet.validateMention(mention).success) {
      elements.push(
        <Link
          key={key}
          href={`/${mention.did}`}
          className="text-text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {segment.text}
        </Link>
      );
      // TODO: Add search route for hashtags, then uncomment this
      // } else if (tag && !disableLinks && AppBskyRichtextFacet.validateTag(tag).success) {
      //   elements.push(
      //     <Link
      //       key={key}
      //       href={`/search?q=${encodeURIComponent(tag.tag)}`}
      //       onClick={(e) => e.stopPropagation()}
      //     >
      //       {segment.text}
      //     </Link>
      //   );
    } else {
      elements.push(segment.text);
    }
    key++;
  }

  return <span className="whitespace-pre-wrap">{elements}</span>;
}
