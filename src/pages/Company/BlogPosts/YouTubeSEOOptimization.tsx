// src/pages/Company/BlogPosts/YouTubeSEOOptimization.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../../components/SEO';
import {
  Container, ContentWrapper, BackButton, PostHeader, Category,
  Title, Meta, Content, TipBox, ToolCallout, KeyTakeaway,
  StepFlow, StepItem, StepNum, StepContent,
} from './BlogComponents';

export const YouTubeSEOOptimization: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <SEO
        title="How to Optimise Your YouTube Videos for Discoverability | YouTool.io"
        description="Master YouTube SEO with proven strategies for keyword research, title crafting, description optimisation, and tag strategies that compound over time."
        canonical="https://youtool.io/blog/youtube-seo-optimization-guide"
      />
      <ContentWrapper>
        <BackButton onClick={() => navigate('/blog')}>
          <i className="bx bx-arrow-back"></i> Back to Blog
        </BackButton>

        <PostHeader>
          <Category color="#0891b2">SEO</Category>
          <Title>How to Optimise Your YouTube Videos for Discoverability</Title>
          <Meta>
            <span><i className="bx bx-calendar"></i> July 8, 2025</span>
            <span><i className="bx bx-time"></i> 13 min read</span>
            <span><i className="bx bx-user"></i> YouTool Team</span>
          </Meta>
        </PostHeader>

        <Content>
          <p>
            YouTube SEO is different from Google SEO — the signals overlap but the weights are
            different. Understanding exactly what YouTube's search algorithm evaluates, and in
            what order, is the difference between a video that compounds views for years versus
            one that spikes and dies. This guide covers the full workflow, from research to
            publishing, in the order that actually matters.
          </p>

          <h2>The YouTube SEO Workflow — Step by Step</h2>

          <StepFlow>
            <StepItem>
              <StepNum>1</StepNum>
              <StepContent>
                <h4>Keyword Research — Before You Film</h4>
                <p>
                  The keyword should be decided before the video is made, not after. Search for
                  your topic and look at what YouTube auto-suggests — these are real searches.
                  Prioritise keywords with search demand but low competition: fewer high-authority
                  channels already ranking for it.
                </p>
              </StepContent>
            </StepItem>
            <StepItem>
              <StepNum>2</StepNum>
              <StepContent>
                <h4>Title Optimisation — Lead with the Keyword</h4>
                <p>
                  Put your primary keyword near the start of the title. YouTube gives more weight
                  to words at the beginning. Keep titles under 60 characters so they don't get
                  truncated in search results. Add a compelling hook after the keyword:
                  "YouTube SEO: The Strategy That Tripled My Search Traffic."
                </p>
              </StepContent>
            </StepItem>
            <StepItem>
              <StepNum>3</StepNum>
              <StepContent>
                <h4>Description — Write for Humans and Algorithms</h4>
                <p>
                  The first 150 characters appear in search results — make them count. Include your
                  primary keyword naturally in the first two sentences. Write 200–500 words of real
                  content (not just links). Use secondary keywords naturally throughout. Add timestamps
                  — they become chapter links that improve retention.
                </p>
              </StepContent>
            </StepItem>
            <StepItem>
              <StepNum>4</StepNum>
              <StepContent>
                <h4>Tags — Supporting Context, Not the Foundation</h4>
                <p>
                  Tags matter less than they did in 2020, but they still provide context.
                  Use 5–8 targeted tags. Start with your exact keyword phrase, then variations
                  (long-tail and broad), then 2–3 niche category tags. Avoid using competitor
                  channel names — this is against YouTube's spam policies and can get your
                  video suppressed.
                </p>
              </StepContent>
            </StepItem>
            <StepItem>
              <StepNum>5</StepNum>
              <StepContent>
                <h4>Thumbnail and Title — The CTR Package</h4>
                <p>
                  After upload, your CTR in the first 48 hours is a critical SEO signal. A
                  compelling thumbnail directly boosts your search rankings by improving
                  click-through rate — which tells YouTube your result is satisfying intent.
                  Test different thumbnails on your best-performing video to see what moves CTR.
                </p>
              </StepContent>
            </StepItem>
            <StepItem>
              <StepNum>6</StepNum>
              <StepContent>
                <h4>Closed Captions — Index Every Word</h4>
                <p>
                  YouTube's auto-captions are indexed for search, but they contain errors. Upload
                  your own accurate transcript — this gives you more control over what gets indexed
                  and can improve accessibility, which YouTube increasingly factors into recommendations.
                </p>
              </StepContent>
            </StepItem>
          </StepFlow>

          <ToolCallout
            icon="bx-purchase-tag"
            toolName="Tag Generator"
            description="Generate a full set of SEO-optimised tags for any video title — including primary keywords, long-tail variants, and category tags. No more guessing what tags to use."
            href="/tools/tag-generator"
          />

          <h2>Keyword Research in Practice</h2>

          <h3>Finding Low-Competition Keywords</h3>
          <p>
            The best YouTube SEO opportunities are keywords where there's clear search demand
            (the autocomplete shows it) but existing results are thin or poorly matched to intent.
            Signs of low competition: the top videos have few views relative to their upload date,
            the titles don't match the search query closely, or the top results are from small channels.
          </p>

          <h3>Search Intent — The Overlooked Factor</h3>
          <p>
            Search intent means: what does the person searching this keyword actually want to
            accomplish? A video about "how to grow YouTube channel fast" has completely different
            intent than "YouTube channel growth tips" — the first is urgent and tactical, the second
            is educational. Match your video's angle, format, and CTA to intent.
          </p>

          <KeyTakeaway>
            <i className="bx bx-search-alt"></i>
            <div>
              <p><strong>The compound SEO play:</strong> Target 3–5 related keywords across a series
              of videos rather than one. YouTube's algorithm rewards channels that build authority
              on a topic — each video reinforces the others in the recommendation system.</p>
            </div>
          </KeyTakeaway>

          <ToolCallout
            icon="bx-search"
            toolName="Keyword Analyzer"
            description="Analyse any keyword's competition level, search volume estimate, and related phrases. Find the sweet spot between high demand and low competition before you start filming."
            href="/tools/keyword-analyzer"
          />

          <h2>Title Crafting Frameworks</h2>

          <h3>The Keyword + Hook Formula</h3>
          <p>
            <strong>[Keyword]: [Compelling Hook]</strong> — e.g., "YouTube SEO: The 6-Step Process
            That Tripled My Search Views." The keyword anchors the title for search; the hook
            creates curiosity for the suggested feed.
          </p>

          <h3>The Number Formula</h3>
          <p>
            Numbers create specificity and imply value: "7 YouTube SEO Mistakes Killing Your Views."
            Odd numbers tend to outperform even numbers in click-through tests.
          </p>

          <h3>The Question Formula</h3>
          <p>
            Questions mirror what people actually type in search: "Why Does YouTube Keep Recommending
            Small Channels?" This format is particularly effective for informational content where
            people are seeking explanations.
          </p>

          <h2>Description Best Practices</h2>

          <h3>Structure Your Descriptions</h3>
          <ul>
            <li><strong>Line 1–2:</strong> What the video covers (include primary keyword)</li>
            <li><strong>Lines 3–5:</strong> Who it's for and what they'll learn</li>
            <li><strong>Timestamps:</strong> Chapter breakdown for long videos</li>
            <li><strong>Links:</strong> Related content, tools mentioned, social profiles</li>
            <li><strong>Secondary keywords:</strong> Woven naturally into the body text</li>
          </ul>

          <h2>Advanced SEO: What Most Creators Miss</h2>

          <h3>Video Chapters</h3>
          <p>
            Adding timestamps that create chapters gives you multiple opportunities to rank. Each
            chapter title can contain additional keywords, and chapter previews appear directly in
            Google search results — giving you extra SERP real estate.
          </p>

          <h3>Playlist Optimisation</h3>
          <p>
            Playlists are their own SEO asset. A well-titled playlist can rank for keywords your
            individual videos don't. They also increase session time — a major algorithm signal —
            by queuing related content automatically.
          </p>

          <TipBox>
            <h4><i className="bx bx-trending-up"></i> Outlier Research</h4>
            <p>
              Before creating any video, search for the keyword and look at which videos are
              outperforming their channel's typical view count. These outlier videos reveal what
              format, title angle, and thumbnail style the algorithm is currently rewarding.
            </p>
          </TipBox>

          <ToolCallout
            icon="bx-trending-up"
            toolName="Outlier Finder"
            description="Find which videos in any niche are dramatically outperforming their channel's average — revealing the exact topic angles, formats, and thumbnail styles the algorithm is currently rewarding."
            href="/tools/outlier-finder"
          />

          <h2>Tracking and Measuring SEO Performance</h2>
          <p>
            After publishing, watch these metrics to judge SEO performance:
          </p>
          <ul>
            <li><strong>Search traffic %:</strong> Rising over time means SEO is compounding</li>
            <li><strong>Top search keywords:</strong> See exactly what queries your video ranks for</li>
            <li><strong>Impressions from search:</strong> Your video appearing for relevant searches</li>
            <li><strong>CTR from search:</strong> Whether your title and thumbnail win the click</li>
          </ul>
          <p>
            Good SEO doesn't peak at upload — it compounds. A properly optimised video can see
            its search traffic increase for 6–18 months after publication as it builds ranking
            authority and collects engagement signals.
          </p>
        </Content>
      </ContentWrapper>
    </Container>
  );
};
