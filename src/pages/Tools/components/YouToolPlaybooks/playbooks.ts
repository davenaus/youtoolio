// ═══════════════════════════════════════════════════════
// PLAYBOOK DATA STRUCTURE
// ═══════════════════════════════════════════════════════

export interface PlaybookInput {
  id: string;
  label: string;
  type: 'text' | 'select' | 'textarea';
  placeholder?: string;
  options?: string[];
  required: boolean;
  defaultValue?: string;
}

export interface Playbook {
  id: string;
  title: string;
  description: string;
  category: 'Content Creation' | 'Strategy & Planning' | 'Competitive & Trend Analysis' | 'Audience & Community' | 'Technical Optimization' | 'Website Building';
  icon: string;
  inputs: PlaybookInput[];
  promptTemplate: string;
  fullDescription: string;
}

// ═══════════════════════════════════════════════════════
// PLAYBOOK DEFINITIONS
// ═══════════════════════════════════════════════════════

export const playbooks: Playbook[] = [
  {
    id: 'platform-algorithm-analysis',
    title: 'Platform Algorithm Analysis',
    description: 'Understand platform mechanics and optimize content for algorithmic visibility with detailed breakdowns.',
    category: 'Strategy & Planning',
    icon: 'bx-bar-chart-alt-2',
    fullDescription: 'When you need to understand specific platform mechanics and optimize content for algorithmic visibility.',
    inputs: [
      {
        id: 'platform',
        label: 'Platform',
        type: 'select',
        options: ['YouTube', 'TikTok', 'Instagram', 'Twitter/X', 'LinkedIn', 'Facebook'],
        required: true,
        defaultValue: 'YouTube'
      }
    ],
    promptTemplate: `Analyze {{platform}}'s current algorithm priorities and provide a detailed breakdown of:

Algorithm Factors
- Primary ranking signals and their weight/importance
- Content format preferences (video length, image specs, text limits)
- Engagement velocity requirements for viral potential
- Optimal posting times and frequency

Optimization Strategy
- 5 specific tactics to maximize algorithmic reach
- Content structure recommendations
- Hashtag/keyword strategies
- Cross-platform amplification methods

Success Metrics
- KPIs to track for algorithm optimization
- Benchmarks for viral threshold on this platform
- Timeline expectations for results

Base recommendations on current 2025 platform data and provide specific, actionable steps I can implement immediately.`
  },
  {
    id: 'viral-content-idea-generator',
    title: 'Viral Content Idea Generator',
    description: 'Generate multiple creative concepts quickly with execution details, hooks, and viral triggers.',
    category: 'Content Creation',
    icon: 'bx-bulb',
    fullDescription: 'When you need multiple creative concepts quickly with execution details.',
    inputs: [
      {
        id: 'industry',
        label: 'Industry/Niche',
        type: 'text',
        placeholder: 'e.g., Fitness, Tech Reviews, Personal Finance',
        required: true
      },
      {
        id: 'audience',
        label: 'Target Audience',
        type: 'text',
        placeholder: 'e.g., Young professionals, Parents, Students',
        required: true
      },
      {
        id: 'platform',
        label: 'Platform',
        type: 'select',
        options: ['YouTube', 'TikTok', 'Instagram', 'Twitter/X', 'LinkedIn'],
        required: true,
        defaultValue: 'YouTube'
      }
    ],
    promptTemplate: `Generate 10 viral content ideas for {{industry}} targeting {{audience}} on {{platform}}.

For each idea, provide:

Content Structure
- Hook: First 3-5 seconds/opening line
- Core Message: Main value proposition
- Format: Specific content type and duration
- Call-to-Action: Engagement driver

Execution Details
- Props/Materials: What's needed to create
- Script/Outline: Key talking points or visual sequence
- Posting Strategy: Best time and accompanying text
- Viral Triggers: Psychology/emotion being activated

Success Prediction
- Viral Potential: 1-10 scale with reasoning
- Target Metrics: Expected reach/engagement numbers
- Follow-up: How to capitalize if it goes viral

Focus on authentic, value-driven content that serves the audience while maximizing shareability.`
  },
  {
    id: 'competitor-viral-analysis',
    title: 'Competitor Viral Analysis',
    description: 'Reverse-engineer successful viral content in your space with actionable adaptation strategies.',
    category: 'Competitive & Trend Analysis',
    icon: 'bx-search-alt',
    fullDescription: 'When you want to reverse-engineer successful viral content in your space.',
    inputs: [
      {
        id: 'competitor',
        label: 'Competitor/Account',
        type: 'text',
        placeholder: 'e.g., @channelname, CompanyName',
        required: true
      },
      {
        id: 'business_type',
        label: 'Your Business Type',
        type: 'text',
        placeholder: 'e.g., Tech reviewer, Fitness coach, SaaS company',
        required: true
      }
    ],
    promptTemplate: `Analyze the viral content strategy of {{competitor}} and create an actionable playbook for my {{business_type}}.

Competitor Analysis
- Top 5 most viral posts from last 3 months with performance metrics
- Common content themes and formats they use
- Posting patterns and timing strategies
- Audience engagement tactics and response strategies

Pattern Identification
- Viral triggers they consistently use
- Content pillars and topic categories
- Visual/audio elements that drive engagement
- Hashtag and caption strategies

Adaptation Strategy
- How to differentiate while using similar successful elements
- 5 content concepts inspired by their approach but unique to my brand
- Improvement opportunities they're missing
- Risk factors to avoid from their strategy

Implementation Plan
- 30-day content calendar incorporating these insights
- Metrics to track competitive performance
- Methods to monitor their future content for ongoing insights

Ensure all recommendations maintain authentic brand voice while leveraging proven viral mechanics.`
  },
  {
    id: 'trend-hijacking-strategy',
    title: 'Trend Hijacking Strategy',
    description: 'Capitalize on current trends and viral moments for maximum reach with authentic connection.',
    category: 'Competitive & Trend Analysis',
    icon: 'bx-trending-up',
    fullDescription: 'When you want to capitalize on current trends and viral moments for maximum reach.',
    inputs: [
      {
        id: 'trend',
        label: 'Current Trend/Viral Moment',
        type: 'text',
        placeholder: 'e.g., #TikTokMadeMeBuyIt, AI controversy, viral meme',
        required: true
      },
      {
        id: 'business',
        label: 'Your Business/Product',
        type: 'text',
        placeholder: 'e.g., Eco-friendly products, Marketing agency',
        required: true
      }
    ],
    promptTemplate: `Create a trend hijacking strategy for {{trend}} that connects to my {{business}}.

Trend Analysis
- Trend Lifecycle: Where this trend is in its viral cycle
- Core Elements: What makes this trend shareable
- Audience Demographics: Who's engaging with this trend
- Platform Performance: Which platforms it's performing best on

Connection Strategy
- Brand Alignment: How this trend naturally connects to my business
- Value Addition: What unique perspective/value I can add
- Differentiation: How to stand out among others using this trend
- Risk Assessment: Potential downsides and how to avoid them

Content Execution
- 3 Content Variations: Different approaches to the trend
- Posting Timeline: When to publish for maximum impact
- Cross-Platform Adaptation: How to modify for different platforms
- Engagement Strategy: How to interact with comments and shares

Amplification Plan
- Influencer Outreach: Relevant accounts to engage
- Community Activation: How to get audience to share
- Paid Boost Strategy: Budget allocation if using ads
- Follow-up Content: How to sustain momentum

Ensure the approach feels authentic and adds genuine value rather than forced trend-chasing.`
  },
  {
    id: 'viral-video-script',
    title: 'Viral Video Script Generator',
    description: 'Create complete video scripts optimized for viral performance with hooks, structure, and CTAs.',
    category: 'Content Creation',
    icon: 'bx-video',
    fullDescription: 'When you need a complete script structure optimized for viral video content.',
    inputs: [
      {
        id: 'topic',
        label: 'Video Topic',
        type: 'text',
        placeholder: 'e.g., How to gain 1000 subscribers fast',
        required: true
      },
      {
        id: 'audience',
        label: 'Target Audience',
        type: 'text',
        placeholder: 'e.g., New YouTubers, Fitness enthusiasts',
        required: true
      },
      {
        id: 'platform',
        label: 'Platform',
        type: 'select',
        options: ['YouTube', 'TikTok', 'Instagram Reels', 'YouTube Shorts'],
        required: true,
        defaultValue: 'YouTube'
      },
      {
        id: 'duration',
        label: 'Video Duration',
        type: 'select',
        options: ['15 seconds', '30 seconds', '60 seconds', '3-5 minutes', '10+ minutes'],
        required: false,
        defaultValue: '60 seconds'
      }
    ],
    promptTemplate: `Create a viral video script for {{topic}} targeting {{audience}} on {{platform}} with {{duration}} length.

Script Structure
Hook (0-3 seconds):
- Opening statement/visual that stops scroll
- Specific words/phrases to use
- Visual/audio elements to include

Problem/Setup (3-15 seconds):
- Pain point or curiosity gap to establish
- Emotional tone to set
- Transition technique to next section

Solution/Payoff (15-[X] seconds):
- Main content/value delivery
- Key points in logical sequence
- Visual demonstrations or examples

Call-to-Action (Final 5 seconds):
- Specific engagement request
- Follow-up content teaser
- Social proof element

Production Notes
- Visual Requirements: Shots, angles, props needed
- Audio Strategy: Music, sound effects, voice tone
- Text Overlays: Key phrases to highlight on screen
- Editing Techniques: Cuts, transitions, effects for engagement

Optimization Elements
- Platform-Specific Adaptations: Format adjustments for platform
- A/B Testing Variables: Elements to test different versions
- Engagement Triggers: Psychological hooks throughout
- Shareability Factors: Moments designed for clips/shares

Success Metrics
- Target completion rate, engagement rate, and share rate
- Specific KPIs to track performance
- Optimization opportunities based on performance data

Provide the complete script with timing, visual cues, and specific language optimized for viral potential.`
  },
  {
    id: 'viral-hashtag-strategy',
    title: 'Viral Hashtag Strategy',
    description: 'Develop comprehensive hashtag strategies to maximize discoverability and viral potential.',
    category: 'Competitive & Trend Analysis',
    icon: 'bx-hash',
    fullDescription: 'When you need a comprehensive hashtag strategy to maximize discoverability and viral potential.',
    inputs: [
      {
        id: 'content_type',
        label: 'Content Type',
        type: 'text',
        placeholder: 'e.g., Fitness tutorials, Product reviews',
        required: true
      },
      {
        id: 'industry',
        label: 'Industry/Niche',
        type: 'text',
        placeholder: 'e.g., Health & Wellness, Tech',
        required: true
      },
      {
        id: 'audience',
        label: 'Target Audience',
        type: 'text',
        placeholder: 'e.g., Gen Z fitness enthusiasts',
        required: true
      },
      {
        id: 'platform',
        label: 'Platform',
        type: 'select',
        options: ['Instagram', 'TikTok', 'Twitter/X', 'LinkedIn', 'YouTube'],
        required: true,
        defaultValue: 'Instagram'
      }
    ],
    promptTemplate: `Develop a viral hashtag strategy for {{content_type}} in {{industry}} targeting {{audience}} on {{platform}}.

Hashtag Research
- High-Volume Tags: 5 hashtags with 1M+ posts for maximum reach
- Medium-Competition Tags: 10 hashtags with 100K-1M posts for visibility
- Niche-Specific Tags: 10 hashtags with 10K-100K posts for targeted reach
- Branded Tags: 3 unique hashtags for campaign tracking

Strategic Mixing
- Trending Tags: Current trending hashtags relevant to content
- Evergreen Tags: Consistently performing hashtags in your niche
- Location Tags: Geographic hashtags if relevant
- Community Tags: Hashtags used by your target audience

Platform Optimization
- Optimal Quantity: Exact number of hashtags for this platform
- Placement Strategy: Where to put hashtags (caption, comments, etc.)
- Timing Considerations: When hashtag performance peaks
- Cross-Platform Variations: How to adapt for other platforms

Performance Tracking
- Metrics to Monitor: Reach, impressions, engagement from each tag
- Testing Protocol: How to A/B test different hashtag combinations
- Refresh Strategy: When and how to update hashtag sets
- Competitor Monitoring: Tools and methods to track competitor hashtag success

Hashtag Calendar
- Weekly Rotation: Different hashtag sets for different content types
- Campaign Specific: Special hashtag combinations for viral pushes
- Seasonal Adaptations: Holiday and event-based hashtag planning

Provide specific hashtag lists formatted for easy copy-paste implementation.`
  },
  {
    id: 'crisis-to-viral',
    title: 'Crisis-to-Viral Content Strategy',
    description: 'Turn challenges, failures, or negative situations into viral content that builds authenticity.',
    category: 'Content Creation',
    icon: 'bx-first-aid',
    fullDescription: 'When you want to turn challenges, failures, or negative situations into viral content opportunities.',
    inputs: [
      {
        id: 'challenge',
        label: 'Challenge/Setback/Negative Situation',
        type: 'textarea',
        placeholder: 'Describe the situation you want to turn into content',
        required: true
      }
    ],
    promptTemplate: `Transform {{challenge}} into viral content that builds brand authenticity and engagement.

Situation Reframing
- Authenticity Angle: How to present the challenge honestly
- Value Extraction: Lessons/insights others can learn from this experience
- Relatability Factor: How audience can connect with this struggle
- Growth Narrative: The journey from problem to solution/learning

Content Strategy
- Format Options: 3 different content formats for this story
- Emotional Journey: How to take audience through the experience
- Visual Storytelling: Key moments to show vs. tell
- Vulnerability Balance: How much detail to share appropriately

Viral Elements
- Hook Creation: Attention-grabbing opening that draws people in
- Plot Twist: Unexpected element that creates shareability
- Universal Truth: Broader life/business lesson that resonates widely
- Action Inspiration: How this motivates others to take action

Risk Management
- Boundary Setting: What not to share publicly
- Professional Impact: Ensuring content enhances rather than hurts reputation
- Audience Sensitivity: How to present struggles without appearing unprofessional
- Follow-up Strategy: How to handle various audience reactions

Implementation Timeline
- Content Creation: When and how to create this content after the event
- Platform Selection: Best platforms for this type of vulnerable content
- Engagement Strategy: How to respond to comments and shares
- Long-term Integration: How this fits into broader brand narrative

Create content that turns setbacks into connection points while maintaining professional credibility.`
  },
  {
    id: 'ugc-campaign',
    title: 'User-Generated Content Viral Campaign',
    description: 'Design campaigns that encourage audience participation and viral sharing through UGC.',
    category: 'Audience & Community',
    icon: 'bx-group',
    fullDescription: 'When you want to create a campaign that encourages audience participation and viral sharing.',
    inputs: [
      {
        id: 'product',
        label: 'Product/Service/Brand',
        type: 'text',
        placeholder: 'e.g., New fitness app, sustainable clothing line',
        required: true
      },
      {
        id: 'audience',
        label: 'Target Audience',
        type: 'text',
        placeholder: 'e.g., College students, busy parents',
        required: true
      }
    ],
    promptTemplate: `Design a user-generated content campaign for {{product}} that encourages viral participation from {{audience}}.

Campaign Concept
- Challenge/Theme: Core activity users will participate in
- Participation Barrier: How easy/difficult it should be to join
- Value Proposition: What participants gain from involvement
- Shareability Factor: Why participants will want to share their content

Campaign Mechanics
- Submission Process: Step-by-step how users participate
- Platform Strategy: Primary platform and cross-platform amplification
- Hashtag System: Campaign-specific hashtags and tracking methods
- Content Guidelines: Parameters for acceptable submissions

Viral Amplification
- Seed Content: Initial content to demonstrate and inspire participation
- Influencer Strategy: How to get key accounts to participate first
- Community Building: Methods to encourage participants to engage with each other
- Momentum Building: Techniques to maintain and accelerate participation

Incentive Structure
- Recognition System: How to highlight and celebrate participants
- Prize Strategy: If using rewards, what and how to distribute
- Social Proof: Methods to showcase campaign success and participation
- Exclusive Access: Special perks for participants

Campaign Timeline
- Pre-Launch (Week 1): Preparation and seed content creation
- Launch (Week 2-3): Active promotion and initial participation push
- Peak Phase (Week 4-5): Maximum participation and viral potential
- Wrap-up (Week 6): Final submissions and celebration of results

Success Metrics
- Participation Rate: Target number of submissions
- Reach Amplification: Expected viral coefficient and total reach
- Engagement Quality: Depth of interaction beyond just submissions
- Brand Impact: How campaign affects brand awareness and sentiment

Provide complete campaign brief with timeline, promotional materials needed, and measurement framework.`
  },
  {
    id: 'behind-the-scenes',
    title: 'Behind-the-Scenes Viral Content',
    description: 'Transform business processes and daily operations into engaging, authentic viral content.',
    category: 'Content Creation',
    icon: 'bx-camera',
    fullDescription: 'When you want to create engaging, authentic content that shows the human side of your business or process.',
    inputs: [
      {
        id: 'process',
        label: 'Business Process/Daily Operations',
        type: 'text',
        placeholder: 'e.g., Product creation, client meetings, content planning',
        required: true
      }
    ],
    promptTemplate: `Create a behind-the-scenes content strategy that transforms {{process}} into viral, engaging content.

Content Identification
- Hidden Processes: Interesting parts of your work most people never see
- Human Moments: Personal, relatable situations that happen during work
- Surprising Elements: Aspects of your process that would surprise your audience
- Educational Opportunities: Complex processes explained simply

Storytelling Framework
- Character Development: Key people to feature and their unique personalities
- Conflict/Challenge: Problems that arise and how they're solved
- Transformation: Before/after or process evolution moments
- Emotional Hooks: Moments that create connection with audience

Content Series Structure
- Episode Planning: 5-10 content pieces showing different aspects
- Progressive Revelation: How to build curiosity and anticipation
- Cliffhangers: Techniques to make people want to see the next installment
- Payoff Moments: Satisfying conclusions that encourage sharing

Production Strategy
- Equipment Needs: Simple tools to capture authentic behind-the-scenes content
- Filming Approach: Candid vs. staged moments balance
- Editing Style: How to maintain authenticity while keeping content engaging
- Sound Strategy: Natural audio vs. music vs. voiceover decisions

Distribution Plan
- Content Calendar: When and where to post each piece
- Platform Optimization: How to adapt content for different platforms
- Cross-Promotion: Using one piece of content across multiple formats
- Audience Building: Techniques to grow following through this content

Engagement Strategy
- Comment Prompts: Questions to ask audience about their own experiences
- Interactive Elements: Polls, questions, challenges related to the content
- Community Building: How to connect audience members through shared interest
- Follow-up Content: Responding to audience interest and questions

Transform everyday business activities into compelling content that builds authentic connection and viral potential.`
  },
  {
    id: 'controversial-opinion',
    title: 'Controversial Opinion Viral Strategy',
    description: 'Create discussion-driving content around industry topics while maintaining professionalism.',
    category: 'Audience & Community',
    icon: 'bx-conversation',
    fullDescription: 'When you want to create discussion-driving content around industry topics while maintaining professionalism.',
    inputs: [
      {
        id: 'topic',
        label: 'Industry Topic/Common Belief',
        type: 'text',
        placeholder: 'e.g., "You don\'t need 10,000 hours to master a skill"',
        required: true
      }
    ],
    promptTemplate: `Develop a controversial opinion content strategy around {{topic}} that drives engagement while building authority.

Opinion Development
- Contrarian Position: Specific belief that goes against common wisdom
- Evidence Foundation: Data, experience, or reasoning supporting this position
- Nuance Explanation: How this opinion isn't black-and-white
- Audience Benefit: Why sharing this perspective helps your audience

Content Framing
- Hook Strategy: How to present the controversial opinion to grab attention
- Context Setting: Background information needed for audience understanding
- Evidence Presentation: How to share supporting information credibly
- Counterargument Acknowledgment: Addressing obvious objections thoughtfully

Discussion Management
- Comment Strategy: How to engage with agreement and disagreement
- Boundary Setting: Lines you won't cross in debate
- Value Addition: Continuing to provide value throughout discussions
- Community Building: Using controversy to build engaged community

Risk Mitigation
- Professional Impact: Ensuring opinion enhances rather than hurts credibility
- Relationship Management: Maintaining important professional relationships
- Brand Alignment: How this opinion fits with overall brand messaging
- Damage Control: Plan for if reaction is more negative than expected

Content Execution
- Format Selection: Best content format for this type of discussion
- Supporting Content: Follow-up content to deepen the conversation
- Cross-Platform Strategy: How to adapt discussion for different platforms
- Timing Considerations: When to post for maximum thoughtful engagement

Long-term Strategy
- Authority Building: How this positions you as a thought leader
- Community Development: Building audience of people who appreciate your perspective
- Content Pipeline: Other controversial topics you could address over time
- Relationship Building: Connecting with others who share or respect your viewpoint

Create content that drives meaningful discussion and positions you as a thoughtful contrarian voice in your industry.`
  },
  {
    id: 'micro-influencer-collaboration',
    title: 'Micro-Influencer Collaboration Strategy',
    description: 'Create viral content through strategic partnerships with smaller influencers in your niche.',
    category: 'Audience & Community',
    icon: 'bx-user-voice',
    fullDescription: 'When you want to create viral content through strategic partnerships with smaller influencers in your niche.',
    inputs: [
      {
        id: 'campaign_goal',
        label: 'Campaign Goal',
        type: 'text',
        placeholder: 'e.g., Product launch, brand awareness, lead generation',
        required: true
      },
      {
        id: 'audience',
        label: 'Target Audience',
        type: 'text',
        placeholder: 'e.g., Women 25-35 interested in sustainable fashion',
        required: true
      },
      {
        id: 'budget',
        label: 'Budget Range',
        type: 'select',
        options: ['Under $1,000', '$1,000-$5,000', '$5,000-$10,000', '$10,000+'],
        required: true,
        defaultValue: '$1,000-$5,000'
      }
    ],
    promptTemplate: `Design a micro-influencer collaboration strategy for {{campaign_goal}} targeting {{audience}} with {{budget}} budget.

Influencer Identification
- Ideal Profile: Follower count, engagement rate, and audience demographics
- Content Style: Type of content they create that aligns with your brand
- Values Alignment: Shared values and messaging compatibility
- Niche Authority: Level of expertise and trust in your industry

Outreach Strategy
- Research Process: How to identify and vet potential collaborators
- Initial Contact: Personalized outreach templates and approach
- Value Proposition: What you offer beyond monetary compensation
- Partnership Framework: Different collaboration types (gifted, paid, long-term)

Content Collaboration
- Creative Brief: Guidelines while allowing creative freedom
- Content Types: Mix of posts, stories, reels, and other formats
- Cross-Promotion: How you and influencer promote each other
- Authenticity Maintenance: Ensuring partnerships feel genuine

Campaign Execution
- Timeline Management: Coordination of content publishing
- Quality Control: Review process while respecting creative autonomy
- Performance Tracking: Metrics to monitor during campaign
- Relationship Building: Nurturing long-term partnerships

Amplification Strategy
- Content Repurposing: How to use influencer content on your channels
- Community Crossover: Encouraging audience interaction between accounts
- Viral Mechanics: Techniques to increase shareability of collaborative content
- Momentum Building: Using successful collaborations to attract other influencers

ROI Optimization
- Performance Metrics: KPIs for measuring collaboration success
- Cost Per Engagement: Calculating value from different partnership types
- Long-term Value: Building relationships that provide ongoing benefit
- Scaling Strategy: Growing from individual collaborations to influencer community

Legal and Ethical Considerations
- Disclosure Requirements: Proper FTC compliance for partnerships
- Contract Essentials: Key terms for influencer agreements
- Content Rights: Usage rights for collaborative content
- Expectation Management: Clear communication of deliverables and timeline

Create a systematic approach to micro-influencer partnerships that generates authentic viral content while building lasting professional relationships.`
  },
  {
    id: 'live-content-strategy',
    title: 'Live Content Viral Strategy',
    description: 'Create viral moments through live streaming, real-time events, or time-sensitive content.',
    category: 'Audience & Community',
    icon: 'bx-broadcast',
    fullDescription: 'When you want to create viral moments through live streaming, real-time events, or time-sensitive content.',
    inputs: [
      {
        id: 'event',
        label: 'Event/Topic/Process',
        type: 'text',
        placeholder: 'e.g., Product launch, Q&A session, creative process',
        required: true
      }
    ],
    promptTemplate: `Develop a live content strategy for {{event}} that maximizes real-time engagement and viral potential.

Live Content Planning
- Format Selection: Choose between live stream, live posting, real-time stories, etc.
- Duration Strategy: Optimal length for maintaining audience attention
- Content Structure: Beginning, middle, end framework for live content
- Interaction Design: How to encourage and manage real-time audience participation

Pre-Event Buildup
- Anticipation Creation: Content leading up to live event
- Audience Education: Preparing audience for what to expect
- Technical Preparation: Equipment, platform, and backup plan setup
- Promotion Strategy: How and when to announce the live content

Real-Time Engagement
- Opening Hook: First 30 seconds to capture and retain viewers
- Audience Interaction: Responding to comments, questions, and reactions
- Energy Management: Maintaining enthusiasm throughout the session
- Pivot Strategies: Adapting content based on real-time audience response

Viral Moment Creation
- Climax Planning: Key moments designed for maximum shareability
- Surprise Elements: Unexpected content that drives immediate sharing
- Quotable Moments: Planned phrases or insights designed for clipping
- Visual Highlights: Moments optimized for screenshot and sharing

Cross-Platform Amplification
- Multi-Platform Broadcasting: Streaming to multiple platforms simultaneously
- Real-Time Clips: Creating shareable moments during the live session
- Story Integration: Using other platform features to drive traffic to live content
- Community Activation: Encouraging audience to share and invite others

Post-Live Optimization
- Content Repurposing: Turning live content into multiple post formats
- Highlight Creation: Identifying and promoting best moments
- Follow-Up Strategy: Continuing conversations started during live session
- Performance Analysis: Measuring success and planning future live content

Technical Execution
- Platform Selection: Best platform for your audience and content type
- Quality Standards: Minimum technical requirements for professional appearance
- Backup Plans: Contingencies for technical difficulties
- Archive Strategy: How to preserve and utilize live content long-term

Audience Development
- Community Building: Using live content to strengthen audience relationships
- Regular Schedule: Creating expectation for ongoing live content
- Exclusive Access: Making live viewers feel special and valued
- Feedback Integration: Using live audience input to improve future content

Transform real-time moments into viral content that builds authentic connection and community engagement.`
  },
  {
    id: 'youtube-comment-sentiment',
    title: 'YouTube Comment Sentiment Analyzer',
    description: 'Analyze YouTube comments for sentiment, emotions, topics, and generate comprehensive HTML reports.',
    category: 'Audience & Community',
    icon: 'bx-comment-dots',
    fullDescription: 'When you want to know average sentiments of a video\'s commenters with detailed analysis and visualization.',
    inputs: [
      {
        id: 'video_url',
        label: 'YouTube Video URL',
        type: 'text',
        placeholder: 'e.g., https://youtube.com/watch?v=...',
        required: true
      },
      {
        id: 'host_name',
        label: 'Host Name (Optional)',
        type: 'text',
        placeholder: 'e.g., Reagan',
        required: false,
        defaultValue: 'Host'
      }
    ],
    promptTemplate: `YouTube Comments → Sentiment + Topics → FULL HTML REPORT (Dark UI)

ROLE
You are a careful analyst and front-end formatter. You will (a) analyze YouTube comments and (b) return ONE self-contained HTML document that exactly matches the style and layout defined below. Do not return JSON. Do not add explanations. Output only the final HTML.

INPUTS
- video_url: {{video_url}}
- host_name: {{host_name}}

TAXONOMY
Primary sentiment (pick exactly one): positive | negative | neutral | mixed
Emotions (0–3 most salient): joy, admiration, amusement, curiosity, surprise, neutral_calm, sadness, anger, disgust, fear, disappointment, confusion, frustration, sarcasm_irony
Toxicity flags (boolean): insult, harassment, hate, sexual, threat
Other flags (boolean): spam, off_topic

REQUIREMENTS
1. PER-COMMENT CLASSIFICATION - For each comment classify sentiment, emotions, toxicity, topics
2. AGGREGATION - Calculate percentages, top emotions, top topics, host mentions
3. OUTPUT - Generate a complete HTML report with dark UI styling

The report should include:
- KPI cards showing total comments, sentiment breakdown, toxicity rate, spam rate
- Sentiment distribution bars with percentages
- Top 5 emotions with visual indicators
- Topic analysis table
- Host focus section (comments mentioning {{host_name}})
- Topic focus section (grouped by non-host topics)
- Representative comments sample (10 rows)

Use professional dark mode styling with charts, progress bars, and data visualizations.`
  },
  {
    id: 'data-driven-optimization',
    title: 'Data-Driven Viral Content Optimization',
    description: 'Use analytics and data to systematically improve viral content performance with testing frameworks.',
    category: 'Strategy & Planning',
    icon: 'bx-line-chart',
    fullDescription: 'When you want to use analytics and data to systematically improve your viral content performance.',
    inputs: [
      {
        id: 'platform',
        label: 'Platform/Tools',
        type: 'text',
        placeholder: 'e.g., YouTube Analytics, Instagram Insights, Google Analytics',
        required: true
      }
    ],
    promptTemplate: `Create a data-driven optimization strategy for improving viral content performance using analytics from {{platform}}.

Analytics Audit
- Current Performance Baseline: Key metrics for existing content
- Top Performing Content: Analysis of your most successful posts
- Audience Insights: Demographics, behavior patterns, and preferences
- Engagement Patterns: When, how, and why your audience interacts

Viral Pattern Identification
- Common Elements: Shared characteristics of high-performing content
- Timing Analysis: Optimal posting times and frequency patterns
- Format Performance: Which content types generate most engagement
- Topic Resonance: Subjects that consistently perform well

Testing Framework
- A/B Testing Strategy: Elements to test systematically
- Variable Isolation: Testing one element at a time for clear results
- Sample Size Requirements: Ensuring statistical significance
- Testing Timeline: How long to run tests for reliable data

Content Optimization
- Hook Improvement: Data-driven optimization of opening moments
- Length Optimization: Finding ideal content duration based on completion rates
- Visual Elements: Testing thumbnails, colors, and visual composition
- Call-to-Action Testing: Optimizing engagement requests based on response data

Audience Segmentation
- Performance by Segment: How different audience groups respond to content
- Content Customization: Tailoring content for different audience segments
- Growth Opportunities: Identifying underserved audience segments
- Retention Analysis: Content that keeps audiences coming back

Predictive Modeling
- Success Indicators: Early metrics that predict viral potential
- Content Scoring: System for evaluating content before publishing
- Trend Prediction: Using data to identify emerging opportunities
- Resource Allocation: Investing more in content with highest viral probability

Performance Dashboard
- Key Metrics Tracking: Essential KPIs to monitor regularly
- Reporting Automation: Systems for regular performance reporting
- Alert Systems: Notifications for unusually high or low performance
- Competitive Benchmarking: Comparing performance to industry standards

Optimization Workflow
- Content Planning: Using data to inform content calendar
- Pre-Publishing Checklist: Data-driven quality control process
- Post-Publishing Monitoring: Real-time performance tracking
- Optimization Iterations: Systematic improvement based on results

ROI Measurement
- Value Attribution: Connecting viral content to business outcomes
- Cost Per Engagement: Calculating efficiency of different content types
- Long-term Impact: Measuring sustained effects of viral content
- Investment Prioritization: Allocating resources based on data-driven insights

Transform gut-feeling content creation into a systematic, data-driven process that consistently improves viral content performance.`
  },
  {
    id: 'cross-platform-viral',
    title: 'Cross-Platform Viral Strategy',
    description: 'Create content that goes viral across multiple social media platforms simultaneously.',
    category: 'Strategy & Planning',
    icon: 'bx-devices',
    fullDescription: 'When you want to create content that goes viral across multiple social media platforms simultaneously.',
    inputs: [
      {
        id: 'content_concept',
        label: 'Content Concept',
        type: 'text',
        placeholder: 'e.g., Product launch video, educational series',
        required: true
      },
      {
        id: 'platforms',
        label: 'Target Platforms',
        type: 'text',
        placeholder: 'e.g., YouTube, TikTok, Instagram, LinkedIn',
        required: true
      }
    ],
    promptTemplate: `Develop a cross-platform viral strategy for {{content_concept}} that maximizes reach across {{platforms}}.

Platform Analysis
- Unique Characteristics: Key differences in audience, algorithm, and content preferences for each platform
- Optimal Formats: Best content formats for each platform (video length, image specs, text limits)
- Timing Strategy: Optimal posting times for each platform and coordination between them
- Cross-Pollination Opportunities: How success on one platform can drive traffic to others

Content Adaptation Framework
- Core Message: Universal value proposition that works across all platforms
- Format Variations: How to adapt content for each platform's strengths
- Visual Consistency: Maintaining brand recognition while optimizing for platform preferences
- Platform-Specific Elements: Unique features to leverage on each platform (hashtags, stories, etc.)

Sequential Launch Strategy
- Lead Platform: Which platform to launch on first and why
- Timing Cascade: Strategic delays between platform launches
- Momentum Building: Using early success to fuel performance on subsequent platforms
- Cross-Promotion: How to drive audience from one platform to others

Content Customization
For each platform in {{platforms}}, provide:
- Specific format requirements and optimization
- Unique engagement strategies
- Platform-specific hashtags/keywords
- Community interaction approach

Viral Amplification
- Cross-Platform Hashtag Strategy: Coordinated hashtag use across platforms
- Influencer Coordination: Leveraging relationships across multiple platforms
- Community Activation: Encouraging audience to share across their preferred platforms
- Paid Amplification: Strategic ad spend across platforms for maximum impact

Performance Tracking
- Platform-Specific Metrics: Key performance indicators for each platform
- Cross-Platform Analytics: Tools and methods for unified performance tracking
- Attribution Modeling: Understanding how platforms influence each other
- Optimization Triggers: When and how to boost performing content

Resource Management
- Content Creation Workflow: Efficient process for creating multiple platform versions
- Time Allocation: Balancing effort across platforms based on potential return
- Quality Standards: Maintaining high standards while creating multiple versions
- Team Coordination: Managing multiple platform managers/creators

Crisis Management
- Platform-Specific Risks: Unique risks and considerations for each platform
- Coordinated Response: Managing negative reactions across multiple platforms
- Damage Control: Preventing issues on one platform from spreading to others
- Recovery Strategy: Rebuilding momentum after setbacks

Create a systematic approach to viral content that leverages the unique strengths of each platform while maintaining consistent brand messaging and maximizing total reach.`
  },
  {
    id: 'seasonal-content-calendar',
    title: 'Seasonal Viral Content Calendar',
    description: 'Plan viral content around holidays, seasons, and annual events for maximum relevance and engagement.',
    category: 'Strategy & Planning',
    icon: 'bx-calendar',
    fullDescription: 'When you want to plan viral content around holidays, seasons, and annual events for maximum relevance and engagement.',
    inputs: [
      {
        id: 'business',
        label: 'Business/Industry',
        type: 'text',
        placeholder: 'e.g., E-commerce fashion, SaaS productivity tool',
        required: true
      },
      {
        id: 'time_period',
        label: 'Time Period',
        type: 'select',
        options: ['Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Oct-Dec)', 'Full Year'],
        required: true,
        defaultValue: 'Full Year'
      }
    ],
    promptTemplate: `Create a seasonal viral content calendar for {{business}} covering {{time_period}} with content tied to holidays, seasons, and cultural moments.

Seasonal Opportunity Mapping
- Major Holidays: Primary holidays relevant to your audience with viral potential
- Minor Observances: Lesser-known days that could provide unique content opportunities
- Cultural Moments: Annual events, award shows, sporting events that capture attention
- Industry-Specific Seasons: Business cycles, conference seasons, or industry-specific timing

Content Strategy by Season
For each quarter/season, provide:
- Key Opportunities: List relevant holidays/events
- Content Themes: Overarching messages that connect to season
- Viral Angles: Specific approaches for maximum shareability
- Cross-Platform Strategy: How to adapt seasonal content across platforms

Holiday-Specific Strategies
For each major holiday/event:
- Lead-Up Content: Building anticipation 2-4 weeks before
- Day-Of Strategy: Real-time content during the event/holiday
- Follow-Up Opportunities: Post-event content that extends engagement
- Unique Angle: Your distinctive take that differentiates from competitors

Content Production Timeline
- Planning Phase: When to begin planning for each seasonal moment
- Content Creation: Production timeline for different content types
- Review and Approval: Buffer time for quality control and approvals
- Publishing Schedule: Exact timing for maximum impact

Viral Mechanics Integration
- Nostalgia Triggers: Using seasonal memories and traditions
- FOMO Creation: Limited-time offers and seasonal exclusivity
- Community Building: Shared seasonal experiences and traditions
- Trend Hijacking: Connecting seasonal moments to current trends

Cross-Seasonal Strategy
- Content Repurposing: How to adapt successful seasonal content for other times
- Evergreen Integration: Balancing seasonal content with year-round messaging
- Audience Retention: Maintaining engagement between major seasonal moments
- International Considerations: Adapting for different cultural calendars if relevant

Performance Optimization
- Historical Analysis: Learning from previous years' seasonal content performance
- Competitive Research: Analyzing how others in your space approach seasonal content
- A/B Testing: Testing different seasonal approaches for optimization
- Real-Time Adjustment: Adapting strategy based on current performance

Resource Planning
- Budget Allocation: Distributing resources across seasonal opportunities
- Team Coordination: Planning team availability around key seasonal moments
- Asset Creation: Photography, graphics, and other materials needed in advance
- Technology Needs: Platform features, tools, or software for seasonal campaigns

Measurement Framework
- Seasonal Benchmarks: Expected performance standards for different times of year
- Year-Over-Year Growth: Tracking improvement in seasonal content performance
- ROI by Season: Understanding which seasonal moments provide best return
- Audience Growth: How seasonal content contributes to overall audience building

Create a comprehensive calendar that maximizes viral opportunities throughout the year while maintaining authentic connection to seasonal moments your audience cares about.`
  },
  {
    id: 'capture-style',
    title: 'Capture a Visual Style (JSON Profile)',
    description: 'Create JSON profiles that extract visual style data for consistent replication by AI tools.',
    category: 'Content Creation',
    icon: 'bx-palette',
    fullDescription: 'When wanting a JSON File of a Style - creates a comprehensive style profile for AI replication.',
    inputs: [
      {
        id: 'style_type',
        label: 'Style Type',
        type: 'select',
        options: ['Thumbnail Style', 'Brand Style', 'Design System', 'Visual Identity'],
        required: true,
        defaultValue: 'Thumbnail Style'
      },
      {
        id: 'source_description',
        label: 'Source Description',
        type: 'textarea',
        placeholder: 'Describe the visual elements you want to capture (or provide image URLs)',
        required: true
      }
    ],
    promptTemplate: `Create a JSON profile for {{style_type}} that extracts comprehensive visual data for AI replication.

OBJECTIVE
Create a "{{style_type}}" profile that gives AI immediate context on how to replicate such style consistently. It should NOT include specific instance-by-instance data, but a broad overview of how to generate content in this style.

PROFILE STRUCTURE

The JSON should include detailed specifications for:

1. COLOR SYSTEM
- Primary color palette (hex codes, RGB, HSL)
- Secondary/accent colors
- Color temperature (warm/cool)
- Saturation levels (high/low/medium)
- Contrast ratios
- Color application patterns

2. TYPOGRAPHY
- Font families (primary, secondary, accent)
- Font weights used
- Font sizes and hierarchy
- Text alignment patterns
- Text effects (shadows, outlines, etc.)
- Readability considerations

3. COMPOSITION & LAYOUT
- Element placement patterns
- Rule of thirds application
- Symmetry vs. asymmetry
- White space usage
- Focal point strategies
- Layering techniques

4. VISUAL ELEMENTS
- Icon style (flat, 3D, outlined, filled)
- Image treatment (filters, overlays, borders)
- Background patterns
- Texture usage
- Graphic elements (shapes, lines, decorative)
- Branding elements placement

5. CONTRAST & DEPTH
- Contrast level (high/medium/low)
- Shadow usage (depth, direction, intensity)
- Highlight techniques
- 3D effects or flat design
- Depth layering

6. STYLE CHARACTERISTICS
- Overall aesthetic (modern, retro, minimalist, maximalist, etc.)
- Emotional tone (energetic, calm, professional, playful)
- Industry alignment
- Target audience considerations

7. TECHNICAL SPECIFICATIONS
- Dimensions and aspect ratios
- Resolution requirements
- File format preferences
- Export settings

SOURCE INPUT
{{source_description}}

OUTPUT FORMAT
Return a complete, well-structured JSON object that an AI can use to replicate this style consistently. Include:
- Clear key-value pairs
- Nested objects for complex specifications
- Arrays for multiple options
- Comments explaining style decisions
- Example use cases

The profile should be comprehensive enough that an AI can generate new content in this exact style without seeing the original examples.`
  }
];
