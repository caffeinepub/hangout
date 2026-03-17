# HangOut

## Current State
Empty project scaffold with no application logic.

## Requested Changes (Diff)

### Add
- User accounts with profiles (username, bio, avatar, followers/following counts)
- Follow system (one-way, Instagram-style; mutual followers = friends)
- Three post types: Story (24h), Post (photo/video), Hangout Post (event with spot limit)
- Hangout Post: title, description, date, location, spot limit; join requests that author approves/denies
- Personal feed showing posts from followed users
- Direct messaging: message requests from strangers, free chat between friends, group chats
- Video/photo upload for posts
- Profile pages with posts, follower/following lists

### Modify
N/A

### Remove
N/A

## Implementation Plan
- Backend: user profiles, follow relationships, three post types, hangout join requests, messaging (DMs + groups)
- Components: authorization (user accounts), blob-storage (photo/video uploads)
- Frontend: home feed, profile page, post creation (story/post/hangout), hangout detail with join requests, messaging UI, explore/search
