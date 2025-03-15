"use client";

import { type Dispatch, type SetStateAction } from "react";

type HomeFeedType = "feed1" | "feed2" | "feed3";

interface HomeHeaderProps {
  selectedFeed: HomeFeedType;
  setSelectedFeed: Dispatch<SetStateAction<HomeFeedType>>;
}

const FEED_OPTIONS = [
  { id: "feed1", label: "Posts" },
  { id: "feed2", label: "Everything" },
  { id: "feed3", label: "Media" },
] as const;

export function HomeHeader({ selectedFeed, setSelectedFeed }: HomeHeaderProps) {
  return (
    <ul className="feedlist text-text-secondary font-medium list-none tap-highlight-color-[rgba(0,0,0,0)] font-smoothing-antialiased m-0 box-border h-15 shadow-[0_1px_0_var(--transparentBorder)] flex flex-row px-6 items-center w-full sticky top-0 bg-[var(--backgroundColor)] z-10 gap-6 justify-center">
      {FEED_OPTIONS.map(({ id, label }) => (
        <li
          key={id}
          className={`text-text-primary cursor-pointer ${
            selectedFeed === id ? "text-text-primary" : "text-text-secondary"
          }`}
          onClick={() => setSelectedFeed(id)}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
