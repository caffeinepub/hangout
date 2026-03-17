import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export type PostId = bigint;
export interface Profile {
    bio: string;
    username: string;
    followers: bigint;
    following: bigint;
    avatar?: ExternalBlob;
}
export type GroupId = bigint;
export type HangoutId = bigint;
export type UserId = Principal;
export interface GroupChatView {
    id: GroupId;
    messages: Array<Message>;
    name: string;
    memberIds: Array<UserId>;
}
export type MessageId = bigint;
export interface HangoutPostView {
    id: HangoutId;
    title: string;
    maxSpots: bigint;
    date: Time;
    description: string;
    approvedAttendees: Array<UserId>;
    author: UserId;
    location: string;
}
export interface Post {
    id: PostId;
    postType: PostType;
    content?: ExternalBlob;
    author: UserId;
    timestamp: Time;
    caption: string;
}
export interface Message {
    id: MessageId;
    status: MessageStatus;
    content: string;
    recipient: UserId;
    sender: UserId;
    timestamp: Time;
}
export enum MessageStatus {
    pending = "pending",
    approved = "approved",
    declined = "declined"
}
export enum PostType {
    hangout = "hangout",
    regular = "regular",
    story = "story"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addGroupMember(groupId: GroupId, userId: UserId): Promise<void>;
    adminDeleteHangout(hangoutId: HangoutId): Promise<void>;
    adminDeleteMessage(messageId: MessageId): Promise<void>;
    adminDeletePost(postId: PostId): Promise<void>;
    approveHangoutRequest(hangoutId: HangoutId, userId: UserId): Promise<void>;
    approveMessage(messageId: MessageId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createGroupChat(name: string, members: Array<UserId>): Promise<GroupChatView>;
    createHangout(title: string, description: string, date: Time, location: string, maxSpots: bigint): Promise<HangoutPostView>;
    createPost(content: ExternalBlob | null, caption: string): Promise<Post>;
    declineMessage(messageId: MessageId): Promise<void>;
    deletePost(postId: PostId): Promise<void>;
    denyHangoutRequest(hangoutId: HangoutId, userId: UserId): Promise<void>;
    followUser(userId: UserId): Promise<void>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGroupChat(groupId: GroupId): Promise<GroupChatView | null>;
    getHomeFeed(): Promise<Array<Post>>;
    getProfile(userId: UserId): Promise<Profile | null>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    isCallerAdmin(): Promise<boolean>;
    requestJoinHangout(hangoutId: HangoutId): Promise<void>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    sendGroupMessage(groupId: GroupId, content: string): Promise<void>;
    sendMessage(recipient: UserId, content: string): Promise<Message>;
    unfollowUser(userId: UserId): Promise<void>;
}
