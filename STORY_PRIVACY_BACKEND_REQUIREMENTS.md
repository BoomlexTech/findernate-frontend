# Story Privacy & Visibility - Backend Requirements

## Current Issue

When users upload stories, they are not visible to anyone. The story visibility needs to work like Instagram:

- **Private Account** → Only followers and following can see stories
- **Public Account** → Everyone can see stories
- **Blocked Users** → Cannot see stories at all

---

## Backend API Requirements

### 1. GET `/api/v1/stories/feed` - Fetch Stories Feed

**Current behavior:** Returns all stories without privacy filtering

**Required behavior:** Filter stories based on:
1. Account privacy settings (public/private)
2. Follower/following relationships
3. Blocked user lists

#### Required Filtering Logic:

```javascript
// Pseudo-code for backend story feed filtering

async function getStoriesFeed(currentUserId) {
  // Get current user's info
  const currentUser = await User.findById(currentUserId);
  const blockedByMe = currentUser.blockedUsers || [];
  const blockedMe = await User.find({ blockedUsers: currentUserId }).select('_id');
  const blockedMeIds = blockedMe.map(u => u._id);

  // Get all active stories (not expired)
  const activeStories = await Story.find({
    expiresAt: { $gt: new Date() },
    isArchived: false
  }).populate('userId', 'username fullName profileImageUrl privacy');

  // Filter stories based on privacy rules
  const visibleStories = [];

  for (const story of activeStories) {
    const storyOwnerId = story.userId._id.toString();
    const storyOwnerPrivacy = story.userId.privacy || 'public';

    // Rule 1: Always show own stories
    if (storyOwnerId === currentUserId.toString()) {
      visibleStories.push(story);
      continue;
    }

    // Rule 2: Never show stories from users I blocked
    if (blockedByMe.includes(storyOwnerId)) {
      continue;
    }

    // Rule 3: Never show stories from users who blocked me
    if (blockedMeIds.includes(storyOwnerId)) {
      continue;
    }

    // Rule 4: If story owner has PUBLIC account → show to everyone
    if (storyOwnerPrivacy === 'public') {
      visibleStories.push(story);
      continue;
    }

    // Rule 5: If story owner has PRIVATE account → only show to followers/following
    if (storyOwnerPrivacy === 'private') {
      // Check if I follow them or they follow me
      const isFollowing = currentUser.following?.includes(storyOwnerId);
      const isFollower = currentUser.followers?.includes(storyOwnerId);

      if (isFollowing || isFollower) {
        visibleStories.push(story);
      }
    }
  }

  return visibleStories;
}
```

#### Expected Response:

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "story123",
      "userId": {
        "_id": "user456",
        "username": "john_doe",
        "fullName": "John Doe",
        "profileImageUrl": "https://...",
        "privacy": "public"
      },
      "mediaUrl": "https://...",
      "mediaType": "image",
      "caption": "Hello world!",
      "viewers": ["user789", "user012"],
      "isArchived": false,
      "expiresAt": "2025-11-09T06:00:00.000Z",
      "createdAt": "2025-11-08T06:00:00.000Z",
      "updatedAt": "2025-11-08T06:00:00.000Z"
    }
  ],
  "message": "Stories fetched successfully",
  "success": true
}
```

---

### 2. GET `/api/v1/stories/user/:userId` - Fetch Stories by Specific User

**Current behavior:** Returns stories without privacy checks

**Required behavior:** Check if current user has permission to view target user's stories

#### Required Logic:

```javascript
async function getStoriesByUser(targetUserId, currentUserId) {
  const targetUser = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  // Get user's active stories
  const stories = await Story.find({
    userId: targetUserId,
    expiresAt: { $gt: new Date() },
    isArchived: false
  });

  // Rule 1: Can always view own stories
  if (targetUserId === currentUserId) {
    return stories;
  }

  // Rule 2: Cannot view if blocked by target user
  if (targetUser.blockedUsers?.includes(currentUserId)) {
    throw new Error('Access denied');
  }

  // Rule 3: Cannot view if I blocked target user
  if (currentUser.blockedUsers?.includes(targetUserId)) {
    throw new Error('Access denied');
  }

  // Rule 4: If target has PUBLIC account → allow
  if (targetUser.privacy === 'public') {
    return stories;
  }

  // Rule 5: If target has PRIVATE account → check follow relationship
  if (targetUser.privacy === 'private') {
    const isFollowing = currentUser.following?.includes(targetUserId);
    const isFollower = currentUser.followers?.includes(targetUserId);

    if (!isFollowing && !isFollower) {
      throw new Error('This account is private');
    }
  }

  return stories;
}
```

---

### 3. POST `/api/v1/stories/upload` - Upload Story

**Current behavior:** Uploads story but doesn't notify followers

**Required behavior:**
1. Upload story successfully
2. Optionally notify followers (like Instagram does)

#### Required Logic:

```javascript
async function uploadStory(userId, media, caption) {
  const user = await User.findById(userId);

  // Create story
  const story = await Story.create({
    userId,
    mediaUrl: uploadedMediaUrl,
    mediaType: 'image' | 'video',
    caption,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Optional: Send push notifications to followers
  if (user.privacy === 'public') {
    // For public accounts, you could notify all followers
    // (This is optional - Instagram doesn't always do this)
  } else {
    // For private accounts, notify followers only
    const followers = user.followers || [];
    // Send notifications to followers
  }

  return story;
}
```

---

## Database Schema Requirements

### User Model

Ensure the User model has these fields:

```javascript
{
  _id: ObjectId,
  username: String,
  fullName: String,
  profileImageUrl: String,
  privacy: { type: String, enum: ['public', 'private'], default: 'public' },
  followers: [ObjectId], // User IDs who follow this user
  following: [ObjectId], // User IDs this user follows
  blockedUsers: [ObjectId], // User IDs blocked by this user
  // ... other fields
}
```

### Story Model

Ensure the Story model has these fields:

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User' },
  mediaUrl: String,
  mediaType: { type: String, enum: ['image', 'video'] },
  caption: String,
  viewers: [ObjectId], // User IDs who viewed this story
  isArchived: { type: Boolean, default: false },
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing Checklist

After implementing the backend changes, test these scenarios:

### Public Account Stories

- [ ] **User A (public)** uploads story
- [ ] **User B (stranger)** can see User A's story in feed
- [ ] **User C (follower)** can see User A's story in feed
- [ ] **User D (blocked by A)** cannot see User A's story in feed

### Private Account Stories

- [ ] **User E (private)** uploads story
- [ ] **User F (stranger)** cannot see User E's story in feed
- [ ] **User G (follower)** can see User E's story in feed
- [ ] **User H (following E)** can see User E's story in feed
- [ ] **User I (blocked by E)** cannot see User E's story in feed

### Blocked Users

- [ ] **User J** blocks **User K**
- [ ] **User K** cannot see any of User J's stories
- [ ] **User J** cannot see any of User K's stories (mutual blocking)

### Own Stories

- [ ] **User L** can always see their own stories
- [ ] Own stories appear first in the feed

---

## Summary

The **backend** needs to implement privacy filtering in:

1. `GET /api/v1/stories/feed` - Filter based on privacy + relationships
2. `GET /api/v1/stories/user/:userId` - Check permissions before returning
3. Database: Ensure User model has `privacy`, `followers`, `following`, `blockedUsers` fields

The **frontend** already handles:
- Blocked users filtering (for extra safety)
- Story grouping by user
- UI display

---

## Current Backend Implementation Status

Please check and confirm:

1. ✅ User model has `privacy` field?
2. ✅ User model has `followers` and `following` arrays?
3. ✅ User model has `blockedUsers` array?
4. ❓ Does `/stories/feed` implement privacy filtering?
5. ❓ Does `/stories/user/:userId` check privacy permissions?

If any of the above are not implemented, they need to be added for stories to work correctly with privacy settings.
