// Analytics Questions for Video Analyzer Ask Tab

export interface AnalyticsQuestion {
  id: string;
  question: string;
  category: string;
  description: string;
  videoType: 'both' | 'long-form' | 'shorts';
  complexity: 'simple' | 'medium' | 'complex';
  tags: string[];
}

export const ANALYTICS_QUESTIONS: AnalyticsQuestion[] = [
  // Posting Frequency & Consistency - Long Form
  {
    id: 'posting-frequency-avg',
    question: 'On average, how often does this channel post videos?',
    category: 'Posting Frequency & Consistency',
    description: 'Calculate average posting frequency per week or month based on upload history',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['frequency', 'posting', 'schedule', 'consistency']
  },
  {
    id: 'posting-day-pattern',
    question: 'What day(s) of the week does the channel post most frequently?',
    category: 'Posting Frequency & Consistency',
    description: 'Analyze which days show highest upload activity',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['posting', 'schedule', 'weekday', 'pattern']
  },
  {
    id: 'posting-time-pattern',
    question: 'What time of day are most videos published?',
    category: 'Posting Frequency & Consistency',
    description: 'Identify optimal posting times based on upload history',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['time', 'posting', 'schedule', 'optimization']
  },
  {
    id: 'upload-gaps',
    question: 'What is the longest gap between uploads, and the shortest?',
    category: 'Posting Frequency & Consistency',
    description: 'Analyze consistency by finding upload gaps',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['gaps', 'consistency', 'frequency', 'uploads']
  },
  {
    id: 'frequency-trend',
    question: 'Has their posting frequency increased, decreased, or stayed consistent over time?',
    category: 'Posting Frequency & Consistency',
    description: 'Track changes in upload frequency over time',
    videoType: 'long-form',
    complexity: 'complex',
    tags: ['trend', 'frequency', 'growth', 'consistency']
  },
  {
    id: 'yearly-uploads',
    question: 'What is the average number of uploads per year, and how has that trended?',
    category: 'Posting Frequency & Consistency',
    description: 'Calculate yearly upload averages and trend analysis',
    videoType: 'long-form',
    complexity: 'complex',
    tags: ['yearly', 'uploads', 'trend', 'average']
  },
  {
    id: 'consecutive-streak',
    question: 'What is the average streak length of consecutive weeks/months with uploads?',
    category: 'Posting Frequency & Consistency',
    description: 'Measure consistency through upload streaks',
    videoType: 'long-form',
    complexity: 'complex',
    tags: ['streak', 'consistency', 'consecutive', 'uploads']
  },
  {
    id: 'hiatuses-analysis',
    question: 'Has the channel ever had notable hiatuses (gaps of more than X months)?',
    category: 'Posting Frequency & Consistency',
    description: 'Identify significant breaks in content creation',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['hiatus', 'gaps', 'breaks', 'analysis']
  },
  {
    id: 'recent-upload-percentage',
    question: 'What percentage of total uploads were made in the last 12 months?',
    category: 'Posting Frequency & Consistency',
    description: 'Measure recent activity vs historical content',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['recent', 'percentage', 'activity', 'uploads']
  },

  // Video Length & Content Mix - Long Form
  {
    id: 'average-video-length',
    question: 'What is the average video length on this channel?',
    category: 'Video Length & Content Mix',
    description: 'Calculate mean duration across all videos',
    videoType: 'long-form',
    complexity: 'simple',
    tags: ['duration', 'length', 'average', 'content']
  },
  {
    id: 'length-trend',
    question: 'How has the average video length changed over time?',
    category: 'Video Length & Content Mix',
    description: 'Track video length trends across upload timeline',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['duration', 'trend', 'change', 'length']
  },
  {
    id: 'length-extremes',
    question: 'What\'s the longest and shortest video uploaded?',
    category: 'Video Length & Content Mix',
    description: 'Find duration extremes in video catalog',
    videoType: 'long-form',
    complexity: 'simple',
    tags: ['duration', 'extremes', 'longest', 'shortest']
  },
  {
    id: 'length-performance',
    question: 'Do certain lengths perform better in terms of views or engagement?',
    category: 'Video Length & Content Mix',
    description: 'Correlate video length with performance metrics',
    videoType: 'long-form',
    complexity: 'complex',
    tags: ['duration', 'performance', 'correlation', 'optimization']
  },
  {
    id: 'length-distribution',
    question: 'What is the distribution of video lengths (% under 5 min, 5–15 min, etc.)?',
    category: 'Video Length & Content Mix',
    description: 'Categorize videos by length buckets',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['distribution', 'categories', 'buckets', 'length']
  },
  {
    id: 'top-videos-length',
    question: 'How do the top 10 most-viewed videos compare in length to channel average?',
    category: 'Video Length & Content Mix',
    description: 'Compare top performers length vs overall average',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['top-videos', 'length', 'comparison', 'performance']
  },
  {
    id: 'length-buckets-preference',
    question: 'Does the channel tend to favor certain length "buckets" (8–12 minutes)?',
    category: 'Video Length & Content Mix',
    description: 'Identify preferred video length ranges',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['buckets', 'preference', 'length', 'patterns']
  },
  {
    id: 'shorts-vs-longform-views',
    question: 'How do Shorts compare in average view count vs. long-form uploads?',
    category: 'Video Length & Content Mix',
    description: 'Compare performance between content formats',
    videoType: 'both',
    complexity: 'medium',
    tags: ['shorts', 'comparison', 'views', 'performance']
  },
  {
    id: 'recurring-themes-performance',
    question: 'Are there recurring themes, formats, or series that get higher-than-average views?',
    category: 'Video Length & Content Mix',
    description: 'Identify successful content patterns and formats',
    videoType: 'long-form',
    complexity: 'complex',
    tags: ['themes', 'series', 'formats', 'performance']
  },
  {
    id: 'collab-performance',
    question: 'Do collab videos perform differently compared to solo ones?',
    category: 'Video Length & Content Mix',
    description: 'Compare collaboration vs solo content performance',
    videoType: 'long-form',
    complexity: 'complex',
    tags: ['collaboration', 'solo', 'performance', 'comparison']
  },

  // Viewership & Performance Metrics - Long Form
  {
    id: 'average-views',
    question: 'What is the average number of views per video?',
    category: 'Viewership & Performance Metrics',
    description: 'Calculate mean views across all videos',
    videoType: 'long-form',
    complexity: 'simple',
    tags: ['views', 'average', 'performance', 'metrics']
  },
  {
    id: 'average-views-recent',
    question: 'What is the average number of views per video in the past 6 months?',
    category: 'Viewership & Performance Metrics',
    description: 'Calculate recent performance vs historical',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['views', 'recent', 'average', 'performance']
  },
  {
    id: 'median-views',
    question: 'What is the median view count to reduce skew from viral hits?',
    category: 'Viewership & Performance Metrics',
    description: 'Calculate median views for better central tendency',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['views', 'median', 'distribution', 'outliers']
  },
  {
    id: 'milestone-percentage',
    question: 'What percentage of videos cross certain milestones (10K, 100K views)?',
    category: 'Viewership & Performance Metrics',
    description: 'Calculate success rates for view milestones',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['milestones', 'success', 'percentage', 'achievement']
  },
  {
    id: 'newer-vs-older-traction',
    question: 'Do newer uploads gain traction faster than older ones did at time of release?',
    category: 'Viewership & Performance Metrics',
    description: 'Compare initial performance across time periods',
    videoType: 'long-form',
    complexity: 'complex',
    tags: ['traction', 'comparison', 'growth', 'timeline']
  },
  {
    id: 'views-by-year',
    question: 'What is the average view count by year of upload?',
    category: 'Viewership & Performance Metrics',
    description: 'Track performance changes across years',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['yearly', 'views', 'trend', 'performance']
  },
  {
    id: 'top-videos-view-percentage',
    question: 'What percentage of total channel views come from the top 10 videos?',
    category: 'Viewership & Performance Metrics',
    description: 'Measure reliance on viral content vs consistent performance',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['top-videos', 'percentage', 'distribution', 'concentration']
  },
  {
    id: 'view-distribution-skew',
    question: 'How skewed is the view distribution? Does the channel rely on viral hits?',
    category: 'Viewership & Performance Metrics',
    description: 'Analyze view distribution patterns and viral dependency',
    videoType: 'long-form',
    complexity: 'complex',
    tags: ['distribution', 'skew', 'viral', 'analysis']
  },
  {
    id: 'views-per-day-rate',
    question: 'What is the average views per day since upload for videos?',
    category: 'Viewership & Performance Metrics',
    description: 'Calculate daily view velocity for content',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['velocity', 'daily', 'views', 'rate']
  },
  {
    id: 'view-velocity-comparison',
    question: 'How does view velocity of recent uploads compare to older ones?',
    category: 'Viewership & Performance Metrics',
    description: 'Compare views per day across time periods',
    videoType: 'long-form',
    complexity: 'complex',
    tags: ['velocity', 'comparison', 'recent', 'historical']
  },
  {
    id: 'old-vs-new-views',
    question: 'What percentage of views come from older videos vs. new uploads?',
    category: 'Viewership & Performance Metrics',
    description: 'Analyze catalog performance vs recent content',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['catalog', 'new', 'percentage', 'distribution']
  },

  // Audience Engagement - Long Form
  {
    id: 'average-likes',
    question: 'What is the average number of likes per video?',
    category: 'Audience Engagement',
    description: 'Calculate mean likes across all videos',
    videoType: 'long-form',
    complexity: 'simple',
    tags: ['likes', 'average', 'engagement', 'social']
  },
  {
    id: 'like-to-view-ratio',
    question: 'What is the average like-to-view ratio?',
    category: 'Audience Engagement',
    description: 'Calculate engagement rate based on likes vs views',
    videoType: 'long-form',
    complexity: 'simple',
    tags: ['ratio', 'likes', 'views', 'engagement']
  },
  {
    id: 'engagement-outliers',
    question: 'Which videos are outliers with especially high or low like/view ratios?',
    category: 'Audience Engagement',
    description: 'Identify videos with unusual engagement patterns',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['outliers', 'engagement', 'analysis', 'anomaly']
  },
  {
    id: 'comment-analysis',
    question: 'How many comments does an average video receive?',
    category: 'Audience Engagement',
    description: 'Calculate mean comment count per video',
    videoType: 'long-form',
    complexity: 'simple',
    tags: ['comments', 'average', 'engagement', 'discussion']
  },
  {
    id: 'comment-trend',
    question: 'How has comment engagement trended over time?',
    category: 'Audience Engagement',
    description: 'Track changes in comment activity',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['comments', 'trend', 'engagement', 'timeline']
  },
  {
    id: 'comment-to-view-ratio',
    question: 'What is the comment-to-view ratio across the channel?',
    category: 'Audience Engagement',
    description: 'Calculate comment engagement rate',
    videoType: 'long-form',
    complexity: 'simple',
    tags: ['comments', 'ratio', 'views', 'engagement']
  },
  {
    id: 'highest-engagement-videos',
    question: 'Which videos have the highest engagement relative to their view count?',
    category: 'Audience Engagement',
    description: 'Identify most engaging content based on engagement-to-view ratio',
    videoType: 'long-form',
    complexity: 'medium',
    tags: ['engagement', 'relative', 'performance', 'ratio']
  },
  {
    id: 'disabled-comments-percentage',
    question: 'What percentage of videos have disabled comments or hidden likes?',
    category: 'Audience Engagement',
    description: 'Analyze moderation practices across content',
    videoType: 'long-form',
    complexity: 'simple',
    tags: ['moderation', 'disabled', 'comments', 'percentage']
  },

  // Channel Growth & Momentum - Both
  {
    id: 'subscriber-growth-monthly',
    question: 'How many subscribers does the channel gain per month on average?',
    category: 'Channel Growth & Momentum',
    description: 'Calculate monthly subscriber growth rate',
    videoType: 'both',
    complexity: 'complex',
    tags: ['subscribers', 'growth', 'monthly', 'rate']
  },
  {
    id: 'growth-acceleration-trend',
    question: 'Is subscriber growth accelerating, slowing down, or steady?',
    category: 'Channel Growth & Momentum',
    description: 'Analyze trends in subscriber growth velocity',
    videoType: 'both',
    complexity: 'complex',
    tags: ['growth', 'acceleration', 'trend', 'velocity']
  },

  // Shorts-Specific Questions
  {
    id: 'shorts-frequency',
    question: 'On average, how often does this channel post Shorts?',
    category: 'Posting Frequency & Consistency',
    description: 'Calculate Shorts posting frequency per week or month',
    videoType: 'shorts',
    complexity: 'medium',
    tags: ['shorts', 'frequency', 'posting', 'schedule']
  },
  {
    id: 'shorts-percentage',
    question: 'What percentage of total uploads are Shorts vs. long-form?',
    category: 'Video Length & Content Mix',
    description: 'Compare Shorts vs long-form upload ratios',
    videoType: 'shorts',
    complexity: 'medium',
    tags: ['shorts', 'percentage', 'ratio', 'content-mix']
  },
  {
    id: 'shorts-frequency-trend',
    question: 'Has the frequency of Shorts uploads increased, decreased, or stayed consistent?',
    category: 'Posting Frequency & Consistency',
    description: 'Track changes in Shorts posting patterns',
    videoType: 'shorts',
    complexity: 'medium',
    tags: ['shorts', 'frequency', 'trend', 'consistency']
  },
  {
    id: 'shorts-posting-pattern',
    question: 'Do Shorts uploads cluster on certain days of the week or times of day?',
    category: 'Posting Frequency & Consistency',
    description: 'Identify Shorts posting schedule patterns',
    videoType: 'shorts',
    complexity: 'medium',
    tags: ['shorts', 'schedule', 'pattern', 'timing']
  },
  {
    id: 'shorts-upload-gaps',
    question: 'What is the longest gap between Shorts uploads, and the shortest?',
    category: 'Posting Frequency & Consistency',
    description: 'Analyze Shorts posting consistency',
    videoType: 'shorts',
    complexity: 'medium',
    tags: ['shorts', 'gaps', 'consistency', 'uploads']
  },
  {
    id: 'shorts-length-avg',
    question: 'What is the average length of Shorts on this channel?',
    category: 'Video Length & Content Mix',
    description: 'Calculate mean duration of Shorts content',
    videoType: 'shorts',
    complexity: 'simple',
    tags: ['shorts', 'duration', 'average', 'length']
  },
  {
    id: 'shorts-length-distribution',
    question: 'What is the distribution of Shorts lengths (% under 20s, 20–40s, 40–60s)?',
    category: 'Video Length & Content Mix',
    description: 'Categorize Shorts by duration buckets',
    videoType: 'shorts',
    complexity: 'medium',
    tags: ['shorts', 'distribution', 'buckets', 'duration']
  },
  {
    id: 'shorts-length-buckets',
    question: 'Does the channel tend to favor certain length "buckets" for Shorts?',
    category: 'Video Length & Content Mix',
    description: 'Identify preferred Shorts duration ranges',
    videoType: 'shorts',
    complexity: 'medium',
    tags: ['shorts', 'buckets', 'preference', 'duration']
  },
  {
    id: 'shorts-vs-longform-engagement',
    question: 'How do Shorts compare in engagement to long-form uploads?',
    category: 'Audience Engagement',
    description: 'Compare engagement metrics between content types',
    videoType: 'both',
    complexity: 'medium',
    tags: ['shorts', 'comparison', 'engagement', 'long-form']
  },
  {
    id: 'shorts-themes-performance',
    question: 'Do certain themes, trends, or formats in Shorts outperform others?',
    category: 'Video Length & Content Mix',
    description: 'Identify successful Shorts content patterns',
    videoType: 'shorts',
    complexity: 'complex',
    tags: ['shorts', 'themes', 'trends', 'performance']
  },
  {
    id: 'shorts-views-avg',
    question: 'What is the average number of views per Short?',
    category: 'Viewership & Performance Metrics',
    description: 'Calculate mean views for Shorts content',
    videoType: 'shorts',
    complexity: 'simple',
    tags: ['shorts', 'views', 'average', 'performance']
  },
  {
    id: 'shorts-views-recent',
    question: 'What is the average number of views per Short in the past 6 months?',
    category: 'Viewership & Performance Metrics',
    description: 'Calculate recent Shorts performance',
    videoType: 'shorts',
    complexity: 'medium',
    tags: ['shorts', 'views', 'recent', 'performance']
  },
  {
    id: 'shorts-median-views',
    question: 'What is the median view count for Shorts?',
    category: 'Viewership & Performance Metrics',
    description: 'Calculate median Shorts views for better central tendency',
    videoType: 'shorts',
    complexity: 'medium',
    tags: ['shorts', 'median', 'views', 'distribution']
  },
  {
    id: 'shorts-milestones',
    question: 'What percentage of Shorts reach common milestones (1K, 10K, 100K views)?',
    category: 'Viewership & Performance Metrics',
    description: 'Calculate Shorts success rates for view milestones',
    videoType: 'shorts',
    complexity: 'medium',
    tags: ['shorts', 'milestones', 'success', 'percentage']
  },
  {
    id: 'shorts-top-performers',
    question: 'How do the top 10 most-viewed Shorts compare to the average Short?',
    category: 'Viewership & Performance Metrics',
    description: 'Compare top Shorts performance vs average',
    videoType: 'shorts',
    complexity: 'medium',
    tags: ['shorts', 'top-performers', 'comparison', 'average']
  },
  {
    id: 'shorts-velocity',
    question: 'What is the average views per day since upload for Shorts?',
    category: 'Viewership & Performance Metrics',
    description: 'Calculate daily view velocity for Shorts',
    videoType: 'shorts',
    complexity: 'medium',
    tags: ['shorts', 'velocity', 'daily', 'views']
  },
  {
    id: 'shorts-velocity-comparison',
    question: 'How does the view velocity of recent Shorts compare to earlier ones?',
    category: 'Viewership & Performance Metrics',
    description: 'Compare Shorts performance across time periods',
    videoType: 'shorts',
    complexity: 'complex',
    tags: ['shorts', 'velocity', 'comparison', 'trend']
  },
  {
    id: 'shorts-total-views-contribution',
    question: 'What percentage of the channel\'s total views come from Shorts?',
    category: 'Viewership & Performance Metrics',
    description: 'Calculate Shorts contribution to overall channel performance',
    videoType: 'shorts',
    complexity: 'medium',
    tags: ['shorts', 'percentage', 'total-views', 'contribution']
  },
  {
    id: 'shorts-engagement-ratio',
    question: 'What is the average like-to-view ratio for Shorts?',
    category: 'Audience Engagement',
    description: 'Calculate engagement rate specifically for Shorts',
    videoType: 'shorts',
    complexity: 'simple',
    tags: ['shorts', 'engagement', 'ratio', 'likes']
  },
  {
    id: 'shorts-comment-ratio',
    question: 'What is the comment-to-view ratio across Shorts?',
    category: 'Audience Engagement',
    description: 'Calculate comment engagement for Shorts content',
    videoType: 'shorts',
    complexity: 'simple',
    tags: ['shorts', 'comments', 'ratio', 'engagement']
  },
  {
    id: 'shorts-engagement-outliers',
    question: 'Which Shorts are outliers with unusually high or low engagement ratios?',
    category: 'Audience Engagement',
    description: 'Identify Shorts with unusual engagement patterns',
    videoType: 'shorts',
    complexity: 'medium',
    tags: ['shorts', 'outliers', 'engagement', 'analysis']
  },
  {
    id: 'shorts-vs-longform-engagement-type',
    question: 'Do Shorts generate proportionally more likes but fewer comments vs long-form?',
    category: 'Audience Engagement',
    description: 'Compare engagement patterns between content types',
    videoType: 'both',
    complexity: 'complex',
    tags: ['comparison', 'engagement-patterns', 'likes', 'comments']
  },
  {
    id: 'shorts-disabled-comments',
    question: 'What percentage of Shorts have comments disabled?',
    category: 'Audience Engagement',
    description: 'Analyze moderation practices for Shorts content',
    videoType: 'shorts',
    complexity: 'simple',
    tags: ['shorts', 'moderation', 'disabled', 'comments']
  },
  {
    id: 'shorts-subscriber-contribution',
    question: 'What percentage of new subscribers come from Shorts vs. long-form videos?',
    category: 'Channel Growth & Momentum',
    description: 'Attribute subscriber growth to content types',
    videoType: 'both',
    complexity: 'complex',
    tags: ['subscribers', 'attribution', 'shorts', 'growth-source']
  },
  {
    id: 'shorts-subscriber-spikes',
    question: 'Do Shorts tend to drive spikes in subscriber growth more than regular videos?',
    category: 'Channel Growth & Momentum',
    description: 'Analyze subscriber growth patterns related to Shorts',
    videoType: 'both',
    complexity: 'complex',
    tags: ['shorts', 'growth-spikes', 'subscribers', 'impact']
  },
  {
    id: 'shorts-posting-frequency-impact',
    question: 'Has Shorts adoption led to increased overall posting frequency?',
    category: 'Channel Growth & Momentum',
    description: 'Analyze how Shorts affect overall content strategy',
    videoType: 'both',
    complexity: 'medium',
    tags: ['shorts', 'frequency', 'impact', 'strategy']
  }
];
