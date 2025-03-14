import { useQuery } from "@tanstack/react-query";
import { agent } from "~/lib/api";
import { queryConfig } from "~/config/query";
import type { AppBskyActorDefs } from "@atproto/api";

// For current user's profile in MainLayout
export function useCurrentProfile(isAuthenticated: boolean) {
  return useQuery<AppBskyActorDefs.ProfileViewDetailed>({
    queryKey: ["currentProfile"],
    queryFn: async () => {
      if (!agent.session?.handle) throw new Error("Not authenticated");
      const { data } = await agent.getProfile({
        actor: agent.session.handle,
      });
      return data;
    },
    enabled: isAuthenticated,
    ...queryConfig.profile,
  });
}

// For viewing other users' profiles
export function useProfile(identifier: string | null, isAuthenticated: boolean) {
  return useQuery<AppBskyActorDefs.ProfileViewDetailed>({
    queryKey: ["profile", identifier],
    queryFn: async () => {
      if (!identifier) throw new Error("Identifier is required");

      const { data } = await agent.getProfile({
        actor: identifier,
      });
      return data;
    },
    enabled: !!identifier && isAuthenticated,
    ...queryConfig.profile,
  });
}
