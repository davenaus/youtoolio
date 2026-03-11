// src/pages/Company/CreatorGuides.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 2rem 0 6rem;

  @media (max-width: 640px) { padding: 1.25rem 0 4rem; }
`;

const ContentWrapper = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 480px) { padding: 0 1rem; }
`;

const BackButton = styled.button`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2.5rem;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  @media (max-width: 640px) { margin-bottom: 1.5rem; }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  @media (max-width: 640px) { margin-bottom: 2rem; }
`;

const PageEyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(185, 28, 28, 0.1);
  border: 1px solid rgba(185, 28, 28, 0.25);
  color: ${({ theme }) => theme.colors.red4};
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.3rem 0.9rem;
  border-radius: 20px;
  letter-spacing: 0.04em;
  margin-bottom: 1.25rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  letter-spacing: -0.02em;

  @media (max-width: 768px) { font-size: 2rem; }
  @media (max-width: 480px) { font-size: 1.75rem; }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.muted};
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;

  @media (max-width: 640px) { font-size: 0.95rem; }
`;

const CategoriesNav = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    margin-left: -1rem;
    margin-right: -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
    /* hide scrollbar but keep scrollable */
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    margin-bottom: 1.75rem;
  }
`;

const CategoryButton = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) => $active ? theme.colors.red4 : theme.colors.dark3};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.red4 : theme.colors.dark5};
  padding: 0.6rem 1.25rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  flex-shrink: 0;

  i { font-size: 1rem; }

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.red5 : theme.colors.dark4};
    color: ${({ $active }) => $active ? 'white' : 'inherit'};
    border-color: ${({ $active, theme }) => $active ? theme.colors.red5 : theme.colors.dark5};
  }

  @media (max-width: 480px) {
    font-size: 0.82rem;
    padding: 0.55rem 1rem;
    i { display: none; }
  }
`;

const GuidesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const GuideCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.red3};
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
`;

const CardTop = styled.div`
  padding: 1.5rem 1.5rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};

  @media (max-width: 480px) { padding: 1.1rem 1.1rem 1rem; }
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const DifficultyBadge = styled.span`
  background: rgba(185, 28, 28, 0.12);
  border: 1px solid rgba(185, 28, 28, 0.2);
  color: ${({ theme }) => theme.colors.red4};
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  letter-spacing: 0.03em;
`;

const TimeBadge = styled.span`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.72rem;
  font-weight: 500;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  i { font-size: 0.8rem; }
`;

const StepCountBadge = styled.span`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.72rem;
  font-weight: 500;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  i { font-size: 0.8rem; }
`;

const CardIconRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
`;

const CardIcon = styled.div`
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  flex-shrink: 0;
`;

const CardTitleBlock = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.35rem;
  line-height: 1.3;
`;

const CardGoal = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
  margin: 0;
`;

const StepsSection = styled.div`
  padding: 1.25rem 1.5rem;
  flex: 1;

  @media (max-width: 480px) { padding: 1rem 1.1rem; }
`;

const StepRow = styled.div`
  display: flex;
  gap: 0.9rem;
`;

const StepLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
`;

const StepNumBadge = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  color: white;
  font-size: 0.68rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StepConnector = styled.div`
  width: 2px;
  flex: 1;
  min-height: 12px;
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.red3}55, ${({ theme }) => theme.colors.dark5});
  margin: 3px 0;
`;

const StepBody = styled.div`
  padding-bottom: 1.1rem;
  flex: 1;
`;

const ToolLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(185, 28, 28, 0.12);
  border: 1px solid rgba(185, 28, 28, 0.25);
  color: ${({ theme }) => theme.colors.red5};
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  text-decoration: none;
  margin-bottom: 0.35rem;
  transition: all 0.15s ease;

  i { font-size: 0.75rem; }

  &:hover {
    background: rgba(185, 28, 28, 0.22);
    border-color: ${({ theme }) => theme.colors.red4};
    color: white;
  }

  @media (max-width: 640px) {
    font-size: 0.82rem;
    padding: 0.35rem 0.85rem;
    min-height: 34px;
  }
`;

const StepAction = styled.p`
  font-size: 0.845rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.55;
  margin: 0 0 0.3rem;

  @media (max-width: 640px) { font-size: 0.875rem; line-height: 1.6; }
`;

const StepTip = styled.p`
  font-size: 0.76rem;
  color: ${({ theme }) => theme.colors.text.muted};
  line-height: 1.5;
  margin: 0;
  font-style: italic;

  &::before {
    content: '→ ';
    color: ${({ theme }) => theme.colors.red4};
    font-style: normal;
    font-weight: 600;
  }
`;

const OutcomeBox = styled.div`
  margin: 0 1.5rem 1.5rem;
  background: ${({ theme }) => theme.colors.red1};
  border: 1px solid ${({ theme }) => theme.colors.red3}50;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0.8rem 1rem;
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;

  i {
    color: ${({ theme }) => theme.colors.red4};
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  @media (max-width: 480px) { margin: 0 1.1rem 1.1rem; }
`;

const OutcomeText = styled.p`
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.5;
  margin: 0;

  strong {
    color: ${({ theme }) => theme.colors.red4};
    font-weight: 600;
  }
`;

// ─── Types ─────────────────────────────────────────────────────────────────

interface Step {
  tool: string;
  toolPath: string;
  action: string;
  tip?: string;
}

interface Guide {
  icon: string;
  title: string;
  goal: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  time: string;
  steps: Step[];
  outcome: string;
}

type GuidesData = Record<string, Guide[]>;

// ─── Guides Data ───────────────────────────────────────────────────────────

const guidesData: GuidesData = {
  research: [
    {
      icon: 'bx-bar-chart-alt-2',
      title: 'Fully Analyze Any Channel',
      goal: 'Get a complete picture of any channel\'s performance and uncover the exact formula driving their views.',
      difficulty: 'Easy',
      time: '15 min',
      steps: [
        {
          tool: 'Channel Analyzer',
          toolPath: '/tools/channel-analyzer',
          action: 'Paste the channel URL. Note upload frequency, average views per video, and subscriber count.',
          tip: 'Views-per-video ÷ subscriber count = engagement health. Under 10% is weak; over 30% is strong.',
        },
        {
          tool: 'Video Analyzer',
          toolPath: '/tools/video-analyzer',
          action: 'Analyze their top 3 videos. Record watch time %, CTR, and like-to-view ratio on each.',
          tip: 'Compare their #1 video to their #10 — the gap reveals which topics the algorithm favors for them.',
        },
        {
          tool: 'Outlier Finder',
          toolPath: '/tools/outlier-finder',
          action: 'Run the channel to see which videos massively outperformed their average view count.',
          tip: 'Outlier videos show the exact topic + format the algorithm is currently rewarding this channel for.',
        },
      ],
      outcome: 'A full breakdown of what\'s working, which topics perform, and the content formula powering this channel.',
    },
    {
      icon: 'bx-crosshair',
      title: 'Find Your Next Winning Video Idea',
      goal: 'Steal a proven idea from your niche, validate it with data, and make a better version of it.',
      difficulty: 'Easy',
      time: '10 min',
      steps: [
        {
          tool: 'Outlier Finder',
          toolPath: '/tools/outlier-finder',
          action: 'Run a top channel in your niche. Flag any video getting 3x–10x more views than their average.',
          tip: 'These are proof-of-concept ideas — the algorithm has already validated them in your exact niche.',
        },
        {
          tool: 'Keyword Analyzer',
          toolPath: '/tools/keyword-analyzer',
          action: 'Search the outlier video\'s topic to find related keywords with real search demand.',
          tip: 'Look for long-tail variations of the topic with lower competition but similar intent.',
        },
        {
          tool: 'Video Analyzer',
          toolPath: '/tools/video-analyzer',
          action: 'Analyze the outlier video for its hook style, structure, length, and tags used.',
          tip: 'You\'re not copying — you\'re learning the blueprint so you can build something better.',
        },
      ],
      outcome: 'A validated video idea with keyword backing and a structural blueprint to out-perform the original.',
    },
    {
      icon: 'bx-glasses',
      title: 'Reverse-Engineer a Viral Video',
      goal: 'Break down exactly why a video blew up so you can replicate the formula intentionally.',
      difficulty: 'Medium',
      time: '20 min',
      steps: [
        {
          tool: 'Video Analyzer',
          toolPath: '/tools/video-analyzer',
          action: 'Paste the viral video URL. Study watch time %, CTR, and the like-to-dislike ratio.',
          tip: 'A high CTR with low watch time = great thumbnail, weak content. The opposite means great content, bad discoverability.',
        },
        {
          tool: 'Thumbnail Downloader',
          toolPath: '/tools/thumbnail-downloader',
          action: 'Download the thumbnail and compare it against the channel\'s other thumbnails.',
          tip: 'Did they break their own pattern? Unusual thumbnails in a consistent feed often trigger higher curiosity clicks.',
        },
        {
          tool: 'Channel Consultant',
          toolPath: '/tools/channel-consultant',
          action: 'Describe the video to the consultant and ask what algorithmic factors likely caused the spike.',
          tip: 'Ask specifically: "What made this video different from average videos on this topic?"',
        },
      ],
      outcome: 'A clear hypothesis for why the video went viral — and a checklist to apply those same triggers to your own.',
    },
    {
      icon: 'bx-user-check',
      title: 'Vet a Channel Before Collaborating',
      goal: 'Verify a potential collab partner has real engagement and genuine audience overlap with you.',
      difficulty: 'Easy',
      time: '10 min',
      steps: [
        {
          tool: 'Channel Analyzer',
          toolPath: '/tools/channel-analyzer',
          action: 'Run their channel. Check the views-per-video to subscriber ratio to detect inflated or bought subs.',
          tip: 'A channel with 100K subs averaging 500 views per video is a red flag — something doesn\'t add up.',
        },
        {
          tool: 'Outlier Finder',
          toolPath: '/tools/outlier-finder',
          action: 'Check if their outlier videos are recent or old. Recent outliers = active momentum.',
          tip: 'Old outlier, no recent wins = the algorithm has moved on from this channel. Collab value is lower.',
        },
        {
          tool: 'Video Analyzer',
          toolPath: '/tools/video-analyzer',
          action: 'Analyze their top 3 videos for comment engagement and watch time to gauge audience quality.',
          tip: 'High view count + low comments = passive audience. You want partners with an engaged, active community.',
        },
      ],
      outcome: 'A data-backed decision on whether the collaboration is worth pursuing — before you invest any time.',
    },
  ],
  optimize: [
    {
      icon: 'bx-file-blank',
      title: 'Upgrade Your Video Descriptions',
      goal: 'Write descriptions that rank in search, convert viewers to subscribers, and signal your topic to YouTube.',
      difficulty: 'Easy',
      time: '10 min',
      steps: [
        {
          tool: 'Keyword Analyzer',
          toolPath: '/tools/keyword-analyzer',
          action: 'Search your video\'s main topic to find the top keywords to weave naturally into your description.',
          tip: 'Place 2–3 primary keywords in the first 150 characters — that\'s the text shown before "Show More".',
        },
        {
          tool: 'Tag Generator',
          toolPath: '/tools/tag-generator',
          action: 'Generate a full tag list. Use those same terms naturally inside your description body.',
          tip: 'Mirroring your tags in the description reinforces the topic signal YouTube uses to categorize your video.',
        },
        {
          tool: 'Subscribe Link Generator',
          toolPath: '/tools/subscribe-link-generator',
          action: 'Generate a subscribe link and place it in the first 3 lines and again at the very end.',
          tip: 'The top of your description is the highest-converting real estate — don\'t bury your CTA.',
        },
      ],
      outcome: 'A keyword-rich description that helps YouTube understand your video and converts viewers to subscribers.',
    },
    {
      icon: 'bx-tag',
      title: 'Build a Full Video SEO Strategy',
      goal: 'Nail title, tags, and description before upload so your video has the best possible shot at ranking.',
      difficulty: 'Easy',
      time: '10 min',
      steps: [
        {
          tool: 'Keyword Analyzer',
          toolPath: '/tools/keyword-analyzer',
          action: 'Find your primary keyword and 3–4 secondary keywords with proven search demand.',
          tip: 'Target mid-competition keywords. Extremely high-volume terms are near-impossible to rank without an established channel.',
        },
        {
          tool: 'Tag Generator',
          toolPath: '/tools/tag-generator',
          action: 'Generate a full tag set from your keyword. Apply 10–15 of the best to your video.',
          tip: 'Mix broad tags ("YouTube tips") with specific ones ("how to grow YouTube channel 2025") to capture multiple intents.',
        },
        {
          tool: 'Channel Consultant',
          toolPath: '/tools/channel-consultant',
          action: 'Paste your draft title and description. Ask the consultant to audit them for SEO gaps and improvements.',
          tip: 'Your primary keyword should appear within the first 5 words of your title for maximum ranking signal.',
        },
      ],
      outcome: 'A fully optimized title, tag set, and description that give your video the best possible shot at discovery.',
    },
    {
      icon: 'bx-image-alt',
      title: 'Build a Repeatable Thumbnail System',
      goal: 'Reverse-engineer what\'s working in your best thumbnails and create a formula you can use every time.',
      difficulty: 'Medium',
      time: '20 min',
      steps: [
        {
          tool: 'Thumbnail Downloader',
          toolPath: '/tools/thumbnail-downloader',
          action: 'Download your top 5 performing video thumbnails. Lay them out side-by-side and look for patterns.',
          tip: 'Consistent high performers usually share 2–3 visual elements: a color, a facial expression, a text style.',
        },
        {
          tool: 'Color Picker from Image',
          toolPath: '/tools/color-picker-from-image',
          action: 'Extract the dominant colors from your best thumbnails to lock in your brand palette.',
          tip: 'Viewers scan feeds in milliseconds — a consistent color signature makes your content recognizable without reading it.',
        },
        {
          tool: 'Thumbnail Tester',
          toolPath: '/tools/thumbnail-tester',
          action: 'Test your new thumbnail against the old version before publishing.',
          tip: 'Show it to someone unfamiliar with your channel. If they can\'t explain the video in 2 seconds, redesign it.',
        },
      ],
      outcome: 'A documented thumbnail formula — colors, layout, and style — that you can replicate for every upload.',
    },
    {
      icon: 'bx-band-aid',
      title: 'Diagnose and Fix an Underperforming Video',
      goal: 'Figure out exactly why a video flopped and patch every weak point without re-uploading.',
      difficulty: 'Medium',
      time: '15 min',
      steps: [
        {
          tool: 'Video Analyzer',
          toolPath: '/tools/video-analyzer',
          action: 'Run the underperforming video. Identify if the problem is low CTR, low watch time, or low impressions.',
          tip: 'Low impressions = discoverability issue (tags/title). Low CTR = thumbnail. Low watch time = content quality.',
        },
        {
          tool: 'Tag Generator',
          toolPath: '/tools/tag-generator',
          action: 'Generate a fresh tag set for the video\'s actual topic and replace the current tags.',
          tip: 'Old or mismatched tags confuse YouTube about your topic — a fresh set can restart the distribution cycle.',
        },
        {
          tool: 'Thumbnail Tester',
          toolPath: '/tools/thumbnail-tester',
          action: 'Create and test a new thumbnail to see if a redesign can lift the click-through rate.',
          tip: 'Changing a thumbnail on a live video can give it a second chance in YouTube\'s recommendation system.',
        },
      ],
      outcome: 'A diagnosed, patched video with a new thumbnail and updated tags — often enough to trigger a second wave of distribution.',
    },
  ],
  grow: [
    {
      icon: 'bx-link',
      title: 'Build a Subscribe Funnel',
      goal: 'Turn passive viewers into subscribers at every touchpoint — video, social, and real life.',
      difficulty: 'Easy',
      time: '5 min',
      steps: [
        {
          tool: 'Subscribe Link Generator',
          toolPath: '/tools/subscribe-link-generator',
          action: 'Generate a subscribe confirmation link. Drop it into every video description and pinned comment.',
          tip: 'A direct subscribe link removes one click of friction — that single step meaningfully improves conversion.',
        },
        {
          tool: 'QR Code Generator',
          toolPath: '/tools/qr-code-generator',
          action: 'Turn your subscribe link into a QR code. Use it in video outros, Instagram stories, and printed materials.',
          tip: 'QR codes in your video outro capture viewers already watching on mobile who won\'t type a URL.',
        },
      ],
      outcome: 'A subscribe funnel running across your video descriptions, social profiles, and any real-world content.',
    },
    {
      icon: 'bx-rocket',
      title: 'Audit Your Own Channel for Growth',
      goal: 'Identify the exact weak links holding back your channel and build a plan to fix each one.',
      difficulty: 'Medium',
      time: '20 min',
      steps: [
        {
          tool: 'Channel Analyzer',
          toolPath: '/tools/channel-analyzer',
          action: 'Run your own channel. Identify which video formats, topics, or lengths drive the most views.',
          tip: 'Look at your last 20 uploads. A clear pattern in what performs vs. flops is usually hiding in plain sight.',
        },
        {
          tool: 'Outlier Finder',
          toolPath: '/tools/outlier-finder',
          action: 'Find your own outlier videos — these show what the algorithm is already rewarding you for.',
          tip: 'Make 3–5 more videos on your outlier topic before pivoting. Most creators abandon their best content too early.',
        },
        {
          tool: 'Channel Consultant',
          toolPath: '/tools/channel-consultant',
          action: 'Describe your current situation and ask the consultant for your specific growth bottleneck.',
          tip: '"Why are views dropping despite consistent uploads?" gets far better advice than a vague "how do I grow?"',
        },
      ],
      outcome: 'A clear map of what to double down on and what to drop — backed by your own channel\'s data.',
    },
    {
      icon: 'bx-calendar',
      title: 'Plan a 30-Day Content Sprint',
      goal: 'Walk away with 4 validated video topics, matching keywords, and a publishing schedule ready to go.',
      difficulty: 'Medium',
      time: '25 min',
      steps: [
        {
          tool: 'Outlier Finder',
          toolPath: '/tools/outlier-finder',
          action: 'Run 2–3 top channels in your niche. Collect the 4 strongest outlier topics across all of them.',
          tip: 'Topics that appear as outliers on multiple channels are the best signal — the niche itself is hungry for them.',
        },
        {
          tool: 'Keyword Analyzer',
          toolPath: '/tools/keyword-analyzer',
          action: 'Validate each of the 4 topics with Keyword Analyzer to confirm real search demand exists.',
          tip: 'Combine algorithm-driven topics (from Outlier Finder) with search-driven ones — you want both types in your month.',
        },
        {
          tool: 'Channel Consultant',
          toolPath: '/tools/channel-consultant',
          action: 'Give the consultant your 4 topics and ask it to structure them into an optimal publishing order.',
          tip: 'Ask it to identify which topic should go first based on momentum and which is best saved for a high-engagement week.',
        },
      ],
      outcome: 'A 30-day content calendar with 4 validated, data-backed video topics in a strategic publishing order.',
    },
    {
      icon: 'bx-copy-alt',
      title: 'Turn One Video Into a Full Asset Kit',
      goal: 'Squeeze every possible piece of value out of a single video before moving to the next one.',
      difficulty: 'Easy',
      time: '15 min',
      steps: [
        {
          tool: 'Thumbnail Downloader',
          toolPath: '/tools/thumbnail-downloader',
          action: 'Download your video\'s thumbnail to repurpose as a cover image for Shorts, Instagram, or a blog post.',
          tip: 'A YouTube thumbnail is already sized and designed for impact — it\'s free graphic design you already have.',
        },
        {
          tool: 'Color Picker from Image',
          toolPath: '/tools/color-picker-from-image',
          action: 'Extract your thumbnail\'s color palette to use across all social posts promoting this video.',
          tip: 'Matching your promo post colors to the thumbnail creates visual consistency viewers notice subconsciously.',
        },
        {
          tool: 'Subscribe Link Generator',
          toolPath: '/tools/subscribe-link-generator',
          action: 'Generate a subscribe link to drop into every piece of social content pointing back to the video.',
          tip: 'Every description box, bio link, or caption that drives traffic is a chance to convert — don\'t waste it.',
        },
      ],
      outcome: 'A complete content package from a single video: thumbnail asset, brand colors, and a conversion-optimized subscribe link.',
    },
  ],
  engage: [
    {
      icon: 'bx-gift',
      title: 'Run a Fair Comment Giveaway',
      goal: 'Host a giveaway that grows your community and picks a winner transparently on camera.',
      difficulty: 'Easy',
      time: '5 min',
      steps: [
        {
          tool: 'Comment Downloader',
          toolPath: '/tools/comment-downloader',
          action: 'Paste your giveaway video URL to download every comment into a clean, complete list.',
          tip: 'Download after your contest deadline closes — this creates a timestamped record of eligible entries.',
        },
        {
          tool: 'Comment Picker',
          toolPath: '/tools/comment-picker',
          action: 'Load your comment list and let the picker randomly select a verified winner.',
          tip: 'Record your screen during the pick and share it as a Community post — public transparency builds serious trust.',
        },
        {
          tool: 'Subscribe Link Generator',
          toolPath: '/tools/subscribe-link-generator',
          action: 'Add a subscribe link to your winner announcement video description.',
          tip: 'Announcement videos get a burst of views from curious non-subscribers — that\'s your conversion window.',
        },
      ],
      outcome: 'A verified, transparent winner selection with a built-in subscriber growth moment at announcement.',
    },
    {
      icon: 'bx-comment-detail',
      title: 'Mine Comments for Video Ideas',
      goal: 'Use your existing audience\'s own words to build a backlog of ideas they\'re already asking for.',
      difficulty: 'Easy',
      time: '15 min',
      steps: [
        {
          tool: 'Comment Downloader',
          toolPath: '/tools/comment-downloader',
          action: 'Download comments from your top 3 videos. Scan for recurring questions, requests, and complaints.',
          tip: 'Questions in your comments are literally your audience telling you what to make next — never ignore them.',
        },
        {
          tool: 'Video Analyzer',
          toolPath: '/tools/video-analyzer',
          action: 'Analyze those same videos for like/comment ratio and watch time.',
          tip: 'High comments + lower watch time = viewers love the topic but the execution needed improvement. Make a better version.',
        },
        {
          tool: 'Channel Consultant',
          toolPath: '/tools/channel-consultant',
          action: 'Paste your top audience questions into the consultant and ask it to shape them into full video concepts.',
          tip: 'The consultant can cluster 5 similar questions into one high-value comprehensive video instead of 5 mediocre ones.',
        },
      ],
      outcome: 'A backlog of audience-validated video ideas pulled directly from people who already watch your content.',
    },
    {
      icon: 'bx-trophy',
      title: 'Launch a Subscriber Milestone Celebration',
      goal: 'Turn a subscriber milestone into a community event that re-engages your whole audience.',
      difficulty: 'Easy',
      time: '10 min',
      steps: [
        {
          tool: 'Subscribe Link Generator',
          toolPath: '/tools/subscribe-link-generator',
          action: 'Generate a subscribe link and push it everywhere 1–2 weeks before the milestone to accelerate the final stretch.',
          tip: 'Create urgency by publicly tracking progress toward the milestone in your Community tab.',
        },
        {
          tool: 'Comment Downloader',
          toolPath: '/tools/comment-downloader',
          action: 'Download comments from your most-engaged video to identify your most loyal, active community members.',
          tip: 'Recognizing a long-time commenter in a milestone video creates a moment that gets shared organically.',
        },
        {
          tool: 'Comment Picker',
          toolPath: '/tools/comment-picker',
          action: 'Use the picker to select a winner from your milestone celebration video comments for a special giveaway.',
          tip: 'Milestone giveaways tied to a comment CTA ("comment your favorite video of mine to enter") drive engagement AND surface your best content.',
        },
      ],
      outcome: 'A milestone event that re-engages your entire audience, rewards your community, and accelerates the subscriber push.',
    },
    {
      icon: 'bx-user-voice',
      title: 'Identify and Activate Your Super Fans',
      goal: 'Find the viewers who comment most and turn them into advocates who amplify your channel.',
      difficulty: 'Medium',
      time: '20 min',
      steps: [
        {
          tool: 'Comment Downloader',
          toolPath: '/tools/comment-downloader',
          action: 'Download comments from your last 5 videos. Sort through them to identify repeat commenters.',
          tip: 'Someone who comments on 3+ of your videos is a super fan. They\'re more likely to share your content unprompted.',
        },
        {
          tool: 'Video Analyzer',
          toolPath: '/tools/video-analyzer',
          action: 'Identify which of your videos has the highest comment-to-view ratio — that\'s your most community-activating format.',
          tip: 'Double down on that format. High comment ratio = a topic or style that makes people feel compelled to respond.',
        },
        {
          tool: 'Channel Consultant',
          toolPath: '/tools/channel-consultant',
          action: 'Describe your community to the consultant and ask for strategies to convert engaged viewers into channel advocates.',
          tip: 'Ask specifically: "How do I create a pinned comment or CTA that encourages my engaged viewers to share this video?"',
        },
      ],
      outcome: 'A clear strategy to identify, reward, and activate the viewers already invested in your channel\'s growth.',
    },
  ],
};

// ─── Component ─────────────────────────────────────────────────────────────

export const CreatorGuides: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('research');

  const categories = [
    { id: 'research', label: 'Channel Research', icon: 'bx-search-alt' },
    { id: 'optimize', label: 'Optimize Content', icon: 'bx-edit' },
    { id: 'grow', label: 'Grow Audience', icon: 'bx-trending-up' },
    { id: 'engage', label: 'Engage Community', icon: 'bx-group' },
  ];

  const activeGuides = guidesData[activeCategory] ?? [];

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <PageEyebrow>
            <i className="bx bx-map-alt"></i>
            Tool Workflows
          </PageEyebrow>
          <Title>Creator Guides</Title>
          <Subtitle>
            Pick a goal. Follow the steps. Each guide walks you through the exact
            YouTool tools to use — in order.
          </Subtitle>
        </Header>

        <CategoriesNav>
          {categories.map((cat) => (
            <CategoryButton
              key={cat.id}
              $active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            >
              <i className={`bx ${cat.icon}`}></i>
              {cat.label}
            </CategoryButton>
          ))}
        </CategoriesNav>

        <GuidesGrid>
          {activeGuides.map((guide, idx) => (
            <GuideCard key={idx}>
              <CardTop>
                <CardMeta>
                  <DifficultyBadge>{guide.difficulty}</DifficultyBadge>
                  <TimeBadge>
                    <i className="bx bx-time-five"></i>
                    {guide.time}
                  </TimeBadge>
                  <StepCountBadge>
                    <i className="bx bx-list-ol"></i>
                    {guide.steps.length} steps
                  </StepCountBadge>
                </CardMeta>
                <CardIconRow>
                  <CardIcon>
                    <i className={`bx ${guide.icon}`}></i>
                  </CardIcon>
                  <CardTitleBlock>
                    <CardTitle>{guide.title}</CardTitle>
                    <CardGoal>{guide.goal}</CardGoal>
                  </CardTitleBlock>
                </CardIconRow>
              </CardTop>

              <StepsSection>
                {guide.steps.map((step, stepIdx) => {
                  const isLast = stepIdx === guide.steps.length - 1;
                  return (
                    <StepRow key={stepIdx}>
                      <StepLeft>
                        <StepNumBadge>{stepIdx + 1}</StepNumBadge>
                        {!isLast && <StepConnector />}
                      </StepLeft>
                      <StepBody>
                        <ToolLink href={step.toolPath}>
                          {step.tool}
                          <i className="bx bx-link-external"></i>
                        </ToolLink>
                        <StepAction>{step.action}</StepAction>
                        {step.tip && <StepTip>{step.tip}</StepTip>}
                      </StepBody>
                    </StepRow>
                  );
                })}
              </StepsSection>

              <OutcomeBox>
                <i className="bx bx-check-circle"></i>
                <OutcomeText>
                  <strong>Result: </strong>{guide.outcome}
                </OutcomeText>
              </OutcomeBox>
            </GuideCard>
          ))}
        </GuidesGrid>
      </ContentWrapper>
    </Container>
  );
};
