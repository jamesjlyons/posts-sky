// src/lib/api.ts
import { BskyAgent } from "@atproto/api";

export const agent = new BskyAgent({
  service: "https://bsky.social",
});

// await agent.login({
//   identifier: "jameslyons.bsky.social",
//   password: "rs2u-a3s5-bspp-po3u",
// });

export type LoginCredentials = {
  identifier: string;
  password: string;
};

export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await agent.login(credentials);
    // Store session data
    if (typeof window !== "undefined") {
      localStorage.setItem("bsky_session", JSON.stringify(response.data));
    }
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const checkSession = async () => {
  try {
    // Get stored session
    const sessionStr =
      typeof window !== "undefined"
        ? localStorage.getItem("bsky_session")
        : null;
    if (!sessionStr) {
      return { success: false, error: "No session found" };
    }

    const session = JSON.parse(sessionStr);
    await agent.resumeSession(session);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("bsky_session");
  }
  agent.logout();
};
