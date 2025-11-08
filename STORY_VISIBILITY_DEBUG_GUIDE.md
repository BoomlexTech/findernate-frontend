# Story Visibility Debugging Guide

## Issue: Stories not visible to other users

**Symptom:** When User A uploads a story, User A can see it, but User B (another user) cannot see it.

---

## Step 1: Verify Story Was Uploaded Successfully

**As User A (who uploaded the story):**

Open browser console and run:

```javascript
// Check if your story is in the feed
fetch('/api/v1/stories/feed', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('=== USER A (Story Owner) - Feed Response ===');
  console.log('Total stories in feed:', data.data?.length || 0);
  console.log('Your user ID:', JSON.parse(localStorage.getItem('user')).userId || JSON.parse(localStorage.getItem('user'))._id);

  const ownStories = data.data?.filter(s => {
    const userId = JSON.parse(localStorage.getItem('user')).userId || JSON.parse(localStorage.getItem('user'))._id;
    return s.userId._id === userId;
  });

  console.log('Your stories count:', ownStories?.length || 0);
  console.log('Your stories:', ownStories);
});
```

**✅ Expected Result:** You should see your uploaded story in the response

---

## Step 2: Check User A's Account Privacy

**As User A:**

```javascript
// Check your account privacy setting
fetch('/api/v1/users/profile', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('=== USER A - Account Settings ===');
  console.log('Privacy:', data.data?.privacy || 'public (default)');
  console.log('Username:', data.data?.username);
  console.log('User ID:', data.data?._id);
  console.log('Has followers:', (data.data?.followers?.length || 0) + ' followers');
  console.log('Following:', (data.data?.following?.length || 0) + ' users');
});
```

**Note the privacy setting** - is it "public" or "private"?

---

## Step 3: Check What User B Sees

**As User B (different account - cannot see User A's story):**

Open browser console and run:

```javascript
// Check what stories you can see
fetch('/api/v1/stories/feed', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('=== USER B - Feed Response ===');
  console.log('Total stories in feed:', data.data?.length || 0);
  console.log('Stories:', data.data);

  // Check if User A's stories are included
  const userAId = 'PASTE_USER_A_ID_HERE'; // Paste User A's ID from Step 2
  const userAStories = data.data?.filter(s => s.userId._id === userAId);

  console.log('User A stories visible to me:', userAStories?.length || 0);
  console.log('User A stories:', userAStories);
});
```

**❌ Current Problem:** This will show 0 User A stories

---

## Step 4: Check Follow Relationship (If User A is Private)

**As User B:**

```javascript
// Check if you follow User A
fetch('/api/v1/users/profile', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('=== USER B - Following List ===');
  console.log('Following:', data.data?.following?.length || 0, 'users');
  console.log('Following list:', data.data?.following);

  const userAId = 'PASTE_USER_A_ID_HERE';
  const isFollowingUserA = data.data?.following?.some(f =>
    (typeof f === 'string' ? f : f._id) === userAId
  );

  console.log('Am I following User A?', isFollowingUserA);
});
```

---

## Step 5: Check Block Status

**As User B:**

```javascript
// Check if there's a block between you and User A
const userAId = 'PASTE_USER_A_ID_HERE';

// Check if User A blocked you
fetch(`/api/v1/users/is-blocked/${userAId}`, {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('=== Block Status Check ===');
  console.log('User A blocked me?', data.isBlocked || false);
  console.log('I blocked User A?', data.iBlockedThem || false);
})
.catch(err => console.log('Block check endpoint may not exist'));
```

---

## Step 6: Direct Backend Story Feed Check

**Test backend filtering directly:**

```javascript
// Call the stories feed endpoint and see the FULL response
fetch('/api/v1/stories/feed', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('=== Backend Response Status ===');
  console.log('HTTP Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('=== Full Backend Response ===');
  console.log(JSON.stringify(data, null, 2));

  if (data.data && data.data.length > 0) {
    console.log('\n=== Story Details ===');
    data.data.forEach((story, index) => {
      console.log(`\nStory ${index + 1}:`);
      console.log('  ID:', story._id);
      console.log('  Owner ID:', story.userId._id);
      console.log('  Owner Username:', story.userId.username);
      console.log('  Owner Privacy:', story.userId.privacy || 'Not included in response!');
      console.log('  Created:', story.createdAt);
      console.log('  Expires:', story.expiresAt);
    });
  } else {
    console.log('\n⚠️ No stories in response!');
  }
});
```

---

## Common Backend Issues & Fixes

### Issue 1: Backend Removes Privacy Field

**Problem:** Backend removes `privacy` field from User object in response

**Check:** In the console output from Step 6, look for:
```javascript
Owner Privacy: 'Not included in response!'
```

**Backend Fix Needed:**
```javascript
// In backend story.controllers.js - DON'T remove privacy field
.populate('userId', 'username fullName profileImageUrl privacy')
// ⬆️ Include 'privacy' in the select
```

---

### Issue 2: Backend Follower/Following Check Failing

**Problem:** Backend incorrectly determines follow relationships

**Test this scenario:**
- User A privacy: "public"
- User B is a stranger (not following)
- User B should still see User A's stories (because public)

**If User B cannot see public stories, the backend has a bug in Rule 4:**

```javascript
// Backend should have this logic:
if (storyOwnerPrivacy === 'public') {
  visibleStories.push(story);
  continue; // ⬅️ MUST return story for public accounts
}
```

---

### Issue 3: Backend Using Wrong User Model Fields

**Problem:** Backend looking for `user.followers` but database uses `Follow` model

**Check backend implementation:**

```javascript
// ❌ WRONG - if using Follow model
const isFollowing = currentUser.following?.includes(storyOwnerId);

// ✅ CORRECT - if using Follow model
const followRelation = await Follow.findOne({
  followerId: currentUserId,
  followingId: storyOwnerId,
  status: 'accepted'
});
const isFollowing = !!followRelation;
```

---

### Issue 4: Story Expired

**Problem:** Story was uploaded more than 24 hours ago

**Check:** In Step 1 console output, look at `expiresAt` timestamp

```javascript
// If expiresAt is in the past, story won't appear
Expires: '2025-11-07T06:00:00.000Z'  // ❌ Already expired
```

**Backend automatically filters expired stories:**
```javascript
expiresAt: { $gt: new Date() }  // Only non-expired stories
```

---

## Backend Debugging (For Backend Developer)

**Add these console.logs to backend `getStoriesFeed` function:**

```javascript
async function getStoriesFeed(req, res) {
  console.log('🔍 [BACKEND] Stories feed request from user:', req.user.userId);

  const currentUserId = req.user.userId;
  const currentUser = await User.findById(currentUserId);

  console.log('👤 [BACKEND] Current user:', {
    id: currentUserId,
    username: currentUser.username,
    privacy: currentUser.privacy,
    followersCount: currentUser.followers?.length || 0,
    followingCount: currentUser.following?.length || 0
  });

  const activeStories = await Story.find({
    expiresAt: { $gt: new Date() },
    isArchived: false
  }).populate('userId', 'username fullName profileImageUrl privacy');

  console.log('📚 [BACKEND] Total active stories in DB:', activeStories.length);

  const visibleStories = [];

  for (const story of activeStories) {
    const storyOwnerId = story.userId._id.toString();
    const storyOwnerPrivacy = story.userId.privacy || 'public';

    console.log(`\n📖 [BACKEND] Processing story ${story._id}:`, {
      owner: story.userId.username,
      ownerId: storyOwnerId,
      privacy: storyOwnerPrivacy
    });

    // Rule 1: Own stories
    if (storyOwnerId === currentUserId.toString()) {
      console.log('  ✅ Rule 1: Own story - INCLUDE');
      visibleStories.push(story);
      continue;
    }

    // Rule 2: Blocked users
    const blockedByMe = /* check if blocked */;
    const blockedMe = /* check if blocked back */;

    if (blockedByMe || blockedMe) {
      console.log('  ❌ Rule 2: Blocked - EXCLUDE');
      continue;
    }

    // Rule 4: Public accounts
    if (storyOwnerPrivacy === 'public') {
      console.log('  ✅ Rule 4: Public account - INCLUDE');
      visibleStories.push(story);
      continue;
    }

    // Rule 5: Private accounts
    if (storyOwnerPrivacy === 'private') {
      const isFollowing = /* check follow relationship */;
      const isFollower = /* check follower relationship */;

      console.log('  🔒 Rule 5: Private account check:', {
        isFollowing,
        isFollower
      });

      if (isFollowing || isFollower) {
        console.log('  ✅ Rule 5: Following/Follower - INCLUDE');
        visibleStories.push(story);
      } else {
        console.log('  ❌ Rule 5: Not following - EXCLUDE');
      }
    }
  }

  console.log('\n✅ [BACKEND] Final visible stories count:', visibleStories.length);

  res.json({
    statusCode: 200,
    data: visibleStories,
    success: true
  });
}
```

---

## Quick Fix Test

**If User A has PUBLIC account and User B still can't see stories:**

The backend is likely missing the "public account" logic. Tell backend developer to verify:

```javascript
// This MUST be in the backend code:
if (storyOwnerPrivacy === 'public') {
  visibleStories.push(story);  // ⬅️ Add story immediately
  continue;                     // ⬆️ Skip other checks
}
```

---

## Test Scenarios Checklist

Run these tests with User A and User B:

### Scenario 1: Public Account
- [ ] User A: Set privacy to "public"
- [ ] User A: Upload story
- [ ] User B: Check feed → Should see User A's story ✅

### Scenario 2: Private Account with Follower
- [ ] User A: Set privacy to "private"
- [ ] User B: Follow User A (and get accepted)
- [ ] User A: Upload story
- [ ] User B: Check feed → Should see User A's story ✅

### Scenario 3: Private Account with Stranger
- [ ] User A: Set privacy to "private"
- [ ] User B: Don't follow User A
- [ ] User A: Upload story
- [ ] User B: Check feed → Should NOT see User A's story ❌

---

## Report Format

After running all tests, share this information:

```
=== User A (Story Owner) ===
User ID: [paste from Step 2]
Username: [paste from Step 2]
Privacy: [public or private]

=== User B (Viewer) ===
User ID: [paste]
Username: [paste]
Following User A: [yes/no]
Blocked status: [none/blocked/blocked by]

=== Story Upload Test ===
Story ID: [paste from Step 1]
Upload time: [paste]
Expires at: [paste]

=== Visibility Test ===
User A can see own story: [yes/no]
User B can see User A's story: [yes/no]

=== Backend Response ===
[Paste the full JSON from Step 6]
```

This will help identify exactly where the privacy filtering is failing!
