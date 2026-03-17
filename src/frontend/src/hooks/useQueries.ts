import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Profile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return withTimeout(actor.getCallerUserProfile(), 10000);
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 30000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Profile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
      return profile;
    },
    onSuccess: (savedProfile) => {
      // Immediately update the cache so the profile page shows new data without waiting for a refetch
      qc.setQueryData(["currentUserProfile"], savedProfile);
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetCallerGender() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["callerGender"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerGender();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000,
  });
}

export function useSaveCallerGender() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (gender: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerGender(gender);
      return gender;
    },
    onSuccess: (savedGender) => {
      // Immediately update the cache
      qc.setQueryData(["callerGender"], savedGender);
      qc.invalidateQueries({ queryKey: ["callerGender"] });
    },
  });
}

export function useGetHomeFeed() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ["homeFeed"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHomeFeed();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 15000,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetProfile(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.getProfile(Principal.fromText(userId));
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useIsFollowingUser(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isFollowing", userId],
    queryFn: async () => {
      if (!actor || !userId) return false;
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.isFollowingUser(Principal.fromText(userId));
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useGetFollowerCount(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["followerCount", userId],
    queryFn: async () => {
      if (!actor || !userId) return BigInt(0);
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.getFollowerCount(Principal.fromText(userId));
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useGetFollowingCount(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["followingCount", userId],
    queryFn: async () => {
      if (!actor || !userId) return BigInt(0);
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.getFollowingCount(Principal.fromText(userId));
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error("Actor not available");
      const { Principal } = await import("@icp-sdk/core/principal");
      await actor.followUser(Principal.fromText(userId));
    },
    onSuccess: (_d, userId) => {
      qc.invalidateQueries({ queryKey: ["profile", userId] });
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
      qc.invalidateQueries({ queryKey: ["isFollowing", userId] });
      qc.invalidateQueries({ queryKey: ["followerCount", userId] });
      qc.invalidateQueries({ queryKey: ["followingCount"] });
      qc.invalidateQueries({ queryKey: ["followersList"] });
      qc.invalidateQueries({ queryKey: ["followingList"] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error("Actor not available");
      const { Principal } = await import("@icp-sdk/core/principal");
      await actor.unfollowUser(Principal.fromText(userId));
    },
    onSuccess: (_d, userId) => {
      qc.invalidateQueries({ queryKey: ["profile", userId] });
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
      qc.invalidateQueries({ queryKey: ["isFollowing", userId] });
      qc.invalidateQueries({ queryKey: ["followerCount", userId] });
      qc.invalidateQueries({ queryKey: ["followingCount"] });
      qc.invalidateQueries({ queryKey: ["followersList"] });
      qc.invalidateQueries({ queryKey: ["followingList"] });
    },
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      caption,
    }: { file: File | null; caption: string }) => {
      if (!actor) throw new Error("Actor not available");
      let blob: ExternalBlob | null = null;
      if (file) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        blob = ExternalBlob.fromBytes(bytes);
      }
      return actor.createPost(blob, caption);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homeFeed"] });
    },
  });
}

export function useCreateHangout() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      date,
      location,
      maxSpots,
    }: {
      title: string;
      description: string;
      date: bigint;
      location: string;
      maxSpots: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createHangout(title, description, date, location, maxSpots);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homeFeed"] });
    },
  });
}

export function useRequestJoinHangout() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (hangoutId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.requestJoinHangout(hangoutId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homeFeed"] });
    },
  });
}

export function useApproveHangoutRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      hangoutId,
      userId,
    }: { hangoutId: bigint; userId: string }) => {
      if (!actor) throw new Error("Actor not available");
      const { Principal } = await import("@icp-sdk/core/principal");
      await actor.approveHangoutRequest(hangoutId, Principal.fromText(userId));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homeFeed"] });
    },
  });
}

export function useDenyHangoutRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      hangoutId,
      userId,
    }: { hangoutId: bigint; userId: string }) => {
      if (!actor) throw new Error("Actor not available");
      const { Principal } = await import("@icp-sdk/core/principal");
      await actor.denyHangoutRequest(hangoutId, Principal.fromText(userId));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homeFeed"] });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      recipientId,
      content,
    }: { recipientId: string; content: string }) => {
      if (!actor) throw new Error("Actor not available");
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.sendMessage(Principal.fromText(recipientId), content);
    },
    onSuccess: (_d, { recipientId }) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["messagesWith", recipientId] });
    },
  });
}

export function useApproveMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.approveMessage(messageId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useDeclineMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.declineMessage(messageId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useCreateGroupChat() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      members,
    }: { name: string; members: string[] }) => {
      if (!actor) throw new Error("Actor not available");
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.createGroupChat(
        name,
        members.map((m) => Principal.fromText(m)),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useGetGroupChat(groupId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ["groupChat", groupId?.toString()],
    queryFn: async () => {
      if (!actor || groupId === null) return null;
      return actor.getGroupChat(groupId);
    },
    enabled: !!actor && !actorFetching && groupId !== null,
    refetchInterval: 5000,
  });
}

export function useSendGroupMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      groupId,
      content,
    }: { groupId: bigint; content: string }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.sendGroupMessage(groupId, content);
    },
    onSuccess: (_d, { groupId }) => {
      qc.invalidateQueries({ queryKey: ["groupChat", groupId.toString()] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deletePost(postId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homeFeed"] });
    },
  });
}

export function useGetFollowersList(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ["followersList", userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.getFollowersList(Principal.fromText(userId));
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useGetFollowingList(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ["followingList", userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.getFollowingList(Principal.fromText(userId));
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useGetConversations() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversations();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function useGetMessagesWith(userId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ["messagesWith", userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.getMessagesWith(Principal.fromText(userId));
    },
    enabled: !!actor && !actorFetching && !!userId,
    refetchInterval: 3000,
  });
}
