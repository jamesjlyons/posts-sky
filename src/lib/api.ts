// src/lib/api.ts
import { BskyAgent } from "@atproto/api";

export const agent = new BskyAgent({
  // App View URL
  // service: "https://api.bsky.app",
  service: "https://bsky.social",
  // If you were making an authenticated client, you would
  // use the PDS URL here instead - the main one is bsky.social
  // service: "https://bsky.social",
});
await agent.login({
  identifier: "jameslyons.bsky.social",
  password: "rs2u-a3s5-bspp-po3u",
});
