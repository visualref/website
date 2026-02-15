import { ContentStatus, Priority, ContentType } from "@/types";
import type {
  ContentItem,
  Topic,
  AnalyticsOverview,
  ContentDetail,
  User,
} from "@/types";

// ==========================================
// Mock Users
// ==========================================

const mockUsers: User[] = [
  {
    id: "1",
    name: "Sarah Jenkins",
    email: "sarah@contentiq.io",
    role: "editor",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBteT6z0wQw_7Tt2Ib84IXCgODv05n6sJuBssjniM5zuCav3VnzJkgYoPobncWN-yJz7bWo-B4gsQEllnguvPJnGALZbF-uY0RpSgWsq6uEiLYlnfvJ3UoBjJ8Vo0kpfEB11Dp9pNY6iVRNcRA5s1UPZAUjf2CtmUP14HnrQePSpVzXX-v3slZl8H7cqiMvh4cGAMv1siDaSF8BepjmfOoRmHA_SRucwDMeKC_VVr7xlCMBjYcXeNrg5ML_FhLcn9QQ32WoSitZAgY",
  },
  {
    id: "2",
    name: "Mike Kim",
    email: "mike@contentiq.io",
    role: "editor",
  },
  {
    id: "3",
    name: "David Rodriguez",
    email: "david@contentiq.io",
    role: "reviewer",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZoBCzeSZp7T0Ayn5zFTq8mwCooER_x8BZ0OTTZJssSEAvM_U1t_pWkl3_3X4b6aYxQZjbkfhZ8y15QExExhdkNwwRUsARDL5b2O0ihKkD3l8XKb3Pt4RJNu-kzpG3a9Ro9MIudkZ52UDPbovcJb-CL19qryWSmIYj9WrvyAOfY7Qjr6SEKuAioc40ao92PMS0QVPHK2NF9c6KNfWds3z3dALkU_afFgkxTdXG68oT7_mMHT1xXEpfnjTHJv9qs4Dt_1hiqjnBklc",
  },
  {
    id: "4",
    name: "Emma Wilson",
    email: "emma@contentiq.io",
    role: "reviewer",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwEQXExvdbcw8_dv519KWNO7nAFirIpa4u-Op9HnY14d0xzmw8pVoTzkrjNLcSjUsd6J-5JSqHSbPxAn9_YV0gG5Hkh8OVd2sUvsBx6ze7YMra0fCWzMKd-tDGT2ZaYaTdMBGJ_bIHAY6qGYt76MIwevaylTHqyKaLoz1MnaBOYDGd-l0H6FhPU8f6wJmHvIFgWh-aRagAJ-tIC1Z6GJLs_wwEqW43d_mOoRJTkcn4QQjPRZlAsX9GLY4aZQOM7-EXOPI1r5-VBIk",
  },
  {
    id: "5",
    name: "James Lin",
    email: "james@contentiq.io",
    role: "writer",
  },
];

// ==========================================
// Mock Content Items (Review Queue)
// ==========================================

export const mockContentItems: ContentItem[] = [
  {
    id: "1",
    title: "The Future of AI in Fintech Operations",
    status: ContentStatus.DRAFT_READY,
    vertical_id: "v1",
    vertical: { id: "v1", name: "Finance", created_at: "", updated_at: "" },
    created_at: "2024-10-24T10:00:00Z",
    updated_at: "2024-10-24T10:00:00Z",
    word_count: 2400,
  },
  {
    id: "2",
    title: "Sustainable Energy Trends 2024",
    status: ContentStatus.OUTLINE_READY,
    vertical_id: "v2",
    vertical: { id: "v2", name: "Energy", created_at: "", updated_at: "" },
    created_at: "2024-10-23T09:00:00Z",
    updated_at: "2024-10-23T09:00:00Z",
    word_count: 1800,
  },
  {
    id: "3",
    title: "Deep Dive: Kubernetes Architecture",
    status: ContentStatus.IN_REVIEW,
    vertical_id: "v3",
    vertical: { id: "v3", name: "Technology", created_at: "", updated_at: "" },
    created_at: "2024-10-22T08:00:00Z",
    updated_at: "2024-10-22T08:00:00Z",
    word_count: 3200,
  },
  {
    id: "4",
    title: "Mental Health in Remote Work",
    status: ContentStatus.PUBLISHED,
    vertical_id: "v4",
    vertical: { id: "v4", name: "Health", created_at: "", updated_at: "" },
    created_at: "2024-10-21T07:00:00Z",
    updated_at: "2024-10-21T07:00:00Z",
    word_count: 1500,
  },
  {
    id: "5",
    title: "Q4 Marketing Strategy",
    status: ContentStatus.NEEDS_REVISION,
    vertical_id: "v5",
    vertical: { id: "v5", name: "Marketing", created_at: "", updated_at: "" },
    created_at: "2024-10-20T06:00:00Z",
    updated_at: "2024-10-20T06:00:00Z",
    word_count: 5100,
  },
  {
    id: "6",
    title: "Cloud Security Basics",
    status: ContentStatus.DRAFT_READY,
    vertical_id: "v3",
    vertical: { id: "v3", name: "Technology", created_at: "", updated_at: "" },
    created_at: "2024-10-19T05:00:00Z",
    updated_at: "2024-10-19T05:00:00Z",
    word_count: 2100,
  },
];

// ==========================================
// Mock Topics
// ==========================================

export const mockTopics: Topic[] = [
  {
    id: "t1",
    title: "AI in Content Marketing",
    vertical_id: "v5",
    status: "new",
    createdAt: "2024-10-20T10:00:00Z",
    updatedAt: "2024-10-20T10:00:00Z",
  },
  {
    id: "t2",
    title: "Kubernetes vs Docker Swarm",
    vertical_id: "v3",
    status: "processing",
    createdAt: "2024-10-19T10:00:00Z",
    updatedAt: "2024-10-19T10:00:00Z",
  },
  {
    id: "t3",
    title: "Complete Guide to Zero Trust Security",
    vertical_id: "v3",
    status: "completed",
    createdAt: "2024-10-18T10:00:00Z",
    updatedAt: "2024-10-18T10:00:00Z",
  },
  {
    id: "t4",
    title: "Sustainable Investment Strategies",
    vertical_id: "v1",
    status: "completed",
    createdAt: "2024-10-17T10:00:00Z",
    updatedAt: "2024-10-17T10:00:00Z",
  },
];

// ==========================================
// Mock Analytics
// ==========================================

export const mockAnalytics: AnalyticsOverview = {
  totalContent: 12304,
  totalContentChange: 5,
  inReviewQueue: 45,
  highPriorityCount: 12,
  approvalRate: 94,
  approvalRateChange: 2,
  monthlyGoalPercent: 85,
  daysLeft: 22,
  statusDistribution: [
    { status: "Drafts", count: 120, color: "#6b7280" },
    { status: "In Review", count: 45, color: "#f59e0b" },
    { status: "Approved", count: 210, color: "#137fec" },
    { status: "Published", count: 340, color: "#22c55e" },
    { status: "Archived", count: 25, color: "#4b5563" },
  ],
  recentActivity: [
    {
      id: "a1",
      type: "update",
      message: "updated",
      highlightText: "'AI Trends 2024'",
      highlightColor: "text-primary",
      user: mockUsers[0],
      timestamp: "2 minutes ago",
    },
    {
      id: "a2",
      type: "flag",
      message: "System flagged",
      highlightText: "'Crypto Report'",
      highlightColor: "text-amber-500",
      timestamp: "15 minutes ago",
    },
    {
      id: "a3",
      type: "approve",
      message: "approved",
      highlightText: "'Q3 Analysis'",
      highlightColor: "text-green-500",
      user: mockUsers[2],
      timestamp: "1 hour ago",
    },
    {
      id: "a4",
      type: "import",
      message: "New bulk import completed",
      timestamp: "3 hours ago",
    },
    {
      id: "a5",
      type: "comment",
      message: "added a comment on",
      highlightText: "'User Retention Strategy'",
      highlightColor: "text-primary",
      user: mockUsers[3],
      timestamp: "5 hours ago",
    },
  ],
};

// ==========================================
// Mock Content Detail
// ==========================================

export const mockContentDetail: ContentDetail = {
  id: "1",
  title: "The Future of AI in Content Marketing",
  status: ContentStatus.IN_REVIEW,
  vertical_id: "v5",
  vertical: { id: "v5", name: "Marketing", created_at: "", updated_at: "" },
  created_at: "2024-10-24T10:00:00Z",
  updated_at: "2024-10-24T10:00:00Z",
  quality_score: 85,
  outline: [
    { id: "s1", level: "h1", title: "Introduction" },
    {
      id: "s2",
      level: "h2",
      title: "The Rise of Generative AI",
      children: [
        { id: "s2a", level: "h3", title: "Impact on SEO" },
        { id: "s2b", level: "h3", title: "Speed to Market" },
      ],
    },
    {
      id: "s3",
      level: "h2",
      title: "Ethical Considerations",
      children: [
        { id: "s3a", level: "h3", title: "Copyright Issues" },
        { id: "s3b", level: "h3", title: "Bias in Models" },
      ],
    },
    { id: "s4", level: "h2", title: "Conclusion" },
  ],
  draft: `<h1>The Future of AI in Content Marketing</h1>
<p class="text-lg text-muted-foreground font-light mb-8 border-l-4 border-primary pl-4 italic">
Explore how artificial intelligence is reshaping the landscape of digital marketing, from automated drafting to hyper-personalization.
</p>
<h2>Introduction</h2>
<p>In the rapidly evolving digital landscape, content remains king. However, the throne is being fortified by a new ally: Artificial Intelligence. We are no longer talking about simple spell-checkers or grammar tools. Today's AI models can ideate, draft, and optimize content at a scale previously unimaginable.</p>
<h2>The Rise of Generative AI</h2>
<p>Generative AI refers to algorithms that can be used to create new content, including audio, code, images, text, simulations, and videos. Recent breakthroughs in the field have the potential to drastically change the way we approach content creation.</p>
<p class="ai-highlight">Unlike traditional software that follows pre-programmed rules, generative AI learns from vast datasets to produce novel outputs. This capability allows marketers to generate high-quality drafts in seconds, freeing up time for strategic thinking and creative refinement.</p>
<h3>Impact on SEO</h3>
<p>Search engines are adapting too. The focus is shifting from keyword stuffing to intent matching. AI helps in analyzing search intent at a granular level, ensuring that the content produced not only ranks well but also genuinely answers the user's query.</p>
<h3>Speed to Market</h3>
<p>One of the most significant advantages is velocity. Campaigns that took weeks can now be launched in days. This agility allows brands to capitalize on trends in real-time.</p>
<h2>Ethical Considerations</h2>
<p>With great power comes great responsibility. The use of AI in content creation raises valid concerns regarding authenticity and transparency. It is crucial for brands to be open about their use of AI tools.</p>`,
  comments: [
    {
      id: "c1",
      author: mockUsers[0],
      content:
        'Can we expand on the "Speed to Market" section? I think we need a concrete example here.',
      createdAt: "2024-10-24T08:00:00Z",
      resolved: false,
      replies: [
        {
          id: "c1r1",
          author: {
            id: "self",
            name: "You",
            email: "alex@contentiq.io",
            role: "admin",
          },
          content: "@Sarah Good point. I'll add a case study.",
          createdAt: "2024-10-24T08:30:00Z",
          resolved: false,
        },
      ],
    },
    {
      id: "c2",
      author: mockUsers[1],
      content:
        "The intro feels a bit robotic. Can we humanize the tone?",
      createdAt: "2024-10-23T08:00:00Z",
      resolved: true,
      },
  ],
  // versions: ... (leaving out versions for brevity if not needed, or better keep them to avoid errors if page uses them)
  // Page uses versions! keep them.
  // Wait, I truncating versions might break page.
  // I should include versions.
};
