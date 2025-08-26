import { Report } from '@/types/admin';

export const mockReports: Report[] = [
  {
    _id: "1",
    reporterId: "2",
    reporterName: "jane_smith",
    reportedContent: {
      type: "post",
      id: "3",
      preview: "SPAM: Buy now! Limited time offer! Click here for amazing deals!"
    },
    reason: "spam",
    description: "This post appears to be promotional content and violates our spam policy. Multiple users have reported similar content from this account.",
    status: "pending",
    priority: "medium",
    createdAt: "2024-03-20T15:30:00Z"
  },
  {
    _id: "2",
    reporterId: "6",
    reporterName: "emma_davis",
    reportedContent: {
      type: "post",
      id: "7",
      preview: "This content violates community guidelines and contains inappropriate material."
    },
    reason: "nudity",
    description: "This post contains explicit content that is not appropriate for our platform. It violates our community guidelines regarding adult content.",
    status: "reviewed",
    priority: "high",
    createdAt: "2024-03-19T22:15:00Z"
  },
  {
    _id: "3",
    reporterId: "1",
    reporterName: "john_doe",
    reportedContent: {
      type: "user",
      id: "3",
      preview: "mike_wilson"
    },
    reason: "harassment",
    description: "This user has been sending threatening messages and making inappropriate comments on multiple posts. Their behavior is causing distress to other users.",
    status: "resolved",
    priority: "urgent",
    createdAt: "2024-03-18T14:20:00Z"
  },
  {
    _id: "4",
    reporterId: "4",
    reporterName: "sarah_jones",
    reportedContent: {
      type: "comment",
      id: "15",
      preview: "This is fake news and should be removed immediately!"
    },
    reason: "fake_news",
    description: "This comment contains false information that could mislead other users. The user is spreading misinformation about current events.",
    status: "pending",
    priority: "medium",
    createdAt: "2024-03-20T10:45:00Z"
  },
  {
    _id: "5",
    reporterId: "8",
    reporterName: "lisa_garcia",
    reportedContent: {
      type: "business",
      id: "2",
      preview: "Tech Solutions Inc."
    },
    reason: "spam",
    description: "This business account is posting excessive promotional content and using misleading hashtags to gain visibility. They are not following our business guidelines.",
    status: "pending",
    priority: "low",
    createdAt: "2024-03-20T09:30:00Z"
  },
  {
    _id: "6",
    reporterId: "5",
    reporterName: "david_brown",
    reportedContent: {
      type: "post",
      id: "8",
      preview: "Delicious homemade pasta! Recipe in the comments below."
    },
    reason: "other",
    description: "This post contains copyrighted content from a cooking website. The user did not credit the original source and is claiming it as their own work.",
    status: "dismissed",
    priority: "low",
    createdAt: "2024-03-19T16:20:00Z"
  },
  {
    _id: "7",
    reporterId: "7",
    reporterName: "alex_taylor",
    reportedContent: {
      type: "user",
      id: "5",
      preview: "david_brown"
    },
    reason: "harassment",
    description: "This user has been following me and commenting on all my posts with inappropriate remarks. I've asked them to stop but they continue.",
    status: "pending",
    priority: "high",
    createdAt: "2024-03-20T13:10:00Z"
  },
  {
    _id: "8",
    reporterId: "3",
    reporterName: "mike_wilson",
    reportedContent: {
      type: "post",
      id: "1",
      preview: "Amazing sunset at the beach! Perfect way to end the day."
    },
    reason: "violence",
    description: "This post contains graphic content that promotes violence. The image shows disturbing content that could trigger other users.",
    status: "pending",
    priority: "urgent",
    createdAt: "2024-03-20T17:45:00Z"
  }
];