// src/pages/Company/BlogPosts/YouTubeContentStrategy.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../../components/SEO';
import {
  Container, ContentWrapper, BackButton, PostHeader, Category,
  Title, Meta, Content, TipBox, ToolCallout, KeyTakeaway,
  StatGrid, StatCard, Checklist, ChecklistTitle, ChecklistItems, ChecklistItem,
} from './BlogComponents';

export const YouTubeContentStrategy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <SEO
        title="Building a YouTube Content Strategy That Drives Long-Term Growth | YouTool.io"
        description="Develop a comprehensive YouTube content strategy that builds loyal audiences and drives sustainable channel success through strategic planning and consistent execution."
        canonical="https://youtool.io/blog/youtube-content-strategy"
      />
      <ContentWrapper>
        <BackButton onClick={() => navigate('/blog')}>
          <i className="bx bx-arrow-back"></i> Back to Blog
        </BackButton>

        <PostHeader>
          <Category color="#2563eb">Strategy</Category>
          <Title>Building a YouTube Content Strategy That Drives Long-Term Growth</Title>
          <Meta>
            <span><i className="bx bx-calendar"></i> July 28, 2025</span>
            <span><i className="bx bx-time"></i> 12 min read</span>
            <span><i className="bx bx-user"></i> YouTool Team</span>
          </Meta>
        </PostHeader>

        <Content>
          <p>
            Most creators fail not from lack of effort but from lack of strategy. They upload
            consistently but without a coherent content plan — each video is an isolated effort
            rather than a building block. The channels that grow year-over-year have a documented
            strategy: a clear niche, defined content pillars, a predictable upload cadence,
            and a system for turning one idea into ten.
          </p>

          <h2>The Content Strategy Framework</h2>

          <StatGrid>
            <StatCard accent="#2563eb">
              <div className="label">Niche Depth</div>
              <div className="value">1 Core Topic</div>
              <div className="desc">The narrower your niche, the faster the algorithm builds your authority</div>
            </StatCard>
            <StatCard accent="#2563eb">
              <div className="label">Content Pillars</div>
              <div className="value">3–5</div>
              <div className="desc">Recurring topic categories that rotate across your upload schedule</div>
            </StatCard>
            <StatCard accent="#2563eb">
              <div className="label">Upload Frequency</div>
              <div className="value">1–2 / week</div>
              <div className="desc">Sustainable cadence beats burst-and-burnout every time</div>
            </StatCard>
            <StatCard accent="#2563eb">
              <div className="label">Planning Horizon</div>
              <div className="value">4–6 weeks</div>
              <div className="desc">Keep this many videos planned ahead to avoid reactive uploads</div>
            </StatCard>
          </StatGrid>

          <h2>Step 1: Define Your Niche With Precision</h2>
          <p>
            A niche is not a broad category — it's the intersection of a topic, an audience, and
            a point of view. "Finance" is a category. "Investing strategies for people in their
            20s with student debt" is a niche. The more specific your niche, the faster the
            algorithm learns who to show your content to.
          </p>
          <p>
            Your niche should answer three questions: Who is your specific viewer? What problem
            do you solve for them? Why should they watch you instead of the 10 other channels
            covering this topic?
          </p>

          <KeyTakeaway>
            <i className="bx bx-target-lock"></i>
            <div>
              <p><strong>The niche test:</strong> If someone stumbles onto your channel and can't
              describe who it's for in one sentence, your niche isn't specific enough. The channels
              that grow fastest are the ones where new viewers immediately say "this is for me."</p>
            </div>
          </KeyTakeaway>

          <h2>Step 2: Build Your Content Pillars</h2>
          <p>
            Content pillars are 3–5 recurring topic categories that define the range of content
            your channel produces. Each pillar serves a different role — SEO-driven search
            content, high-engagement community content, and brand-defining signature content
            serve different growth functions.
          </p>

          <h3>Pillar Type 1: Search Content</h3>
          <p>
            Videos targeting specific search queries. These compound over time and bring in
            cold audiences who've never heard of your channel. Examples: how-to guides, tutorials,
            comparisons, reviews. Optimise heavily for SEO. These are your long-term traffic engine.
          </p>

          <h3>Pillar Type 2: Community Content</h3>
          <p>
            Videos designed to deepen relationships with existing subscribers. Opinion pieces,
            Q&amp;As, behind-the-scenes. Lower SEO value but high engagement rates — which feed
            the algorithm's satisfaction signals and keep subscribers active.
          </p>

          <h3>Pillar Type 3: Signature / Brand-Defining Content</h3>
          <p>
            Your highest-production, most shareable videos. These define your channel's identity
            and tend to be the "entry point" new subscribers see first. They're expensive to make
            but create a lasting impression of channel quality.
          </p>

          <ToolCallout
            icon="bx-brain"
            toolName="Channel Consultant"
            description="Generate a custom AI strategy prompt tailored to your specific channel — covering content ideation, SEO, script structure, and growth. Paste it directly into ChatGPT or Gemini."
            href="/tools/channel-consultant"
          />

          <h2>Step 3: Build a Content Calendar</h2>
          <p>
            A content calendar prevents reactive, last-minute uploads and lets you plan thematic
            series that compound in the algorithm. When three videos on a related topic publish
            in sequence, each sends viewers to the others — multiplying session time and boosting
            recommendations.
          </p>

          <h3>The 4-Week Content Template</h3>
          <ul>
            <li><strong>Week 1:</strong> Search-optimised tutorial or how-to (Pillar 1)</li>
            <li><strong>Week 2:</strong> Community/engagement content (Pillar 2)</li>
            <li><strong>Week 3:</strong> Search-optimised tutorial or comparison (Pillar 1)</li>
            <li><strong>Week 4:</strong> Signature / trend-adjacent piece (Pillar 3)</li>
          </ul>

          <h2>Step 4: Ideation Systems — Never Run Out of Ideas</h2>

          <h3>The Comment Mining Method</h3>
          <p>
            Your comment section is your editorial team. Comments that ask follow-up questions
            or express confusion are direct video requests. Review your top 5 videos' comments
            monthly and add ideas to your content calendar.
          </p>

          <h3>The Outlier Research Method</h3>
          <p>
            Look at channels in your niche and find videos that dramatically outperformed their
            channel average. These outlier videos reveal topics the algorithm is hungry for.
            They're your roadmap for what to make next.
          </p>

          <ToolCallout
            icon="bx-trending-up"
            toolName="Outlier Finder"
            description="Find videos in any niche that outperform their channel average by 3×, 5×, or 10×. These proven topic angles and formats are what the algorithm is currently rewarding — your best ideation starting point."
            href="/tools/outlier-finder"
          />

          <h2>Step 5: Measure and Adapt</h2>

          <Checklist>
            <ChecklistTitle>
              <i className="bx bx-calendar-check"></i>
              Monthly Strategy Review Checklist
            </ChecklistTitle>
            <ChecklistItems>
              <ChecklistItem><i className="bx bx-check-circle"></i>Which 3 videos performed best? What did they share?</ChecklistItem>
              <ChecklistItem><i className="bx bx-check-circle"></i>Which 3 underperformed? What would you change?</ChecklistItem>
              <ChecklistItem><i className="bx bx-check-circle"></i>Is your subscriber growth rate accelerating or slowing?</ChecklistItem>
              <ChecklistItem><i className="bx bx-check-circle"></i>What are your top 3 search keywords this month?</ChecklistItem>
              <ChecklistItem><i className="bx bx-check-circle"></i>Have any competitor channels published outlier videos to study?</ChecklistItem>
              <ChecklistItem><i className="bx bx-check-circle"></i>Does next month's calendar include all 3 pillar types?</ChecklistItem>
            </ChecklistItems>
          </Checklist>

          <TipBox>
            <h4><i className="bx bx-book-content"></i> Strategy Resource</h4>
            <p>
              YouTool Playbooks contains step-by-step strategy guides for specific growth stages —
              from launching a new channel to growing from 1K to 10K. Each playbook generates a
              custom AI prompt you can use directly in ChatGPT or Gemini.
            </p>
          </TipBox>

          <ToolCallout
            icon="bx-book-content"
            toolName="YouTool Playbooks"
            description="Access 20+ expert-designed strategy playbooks covering channel launch, SEO, thumbnails, monetisation, and growth. Each one generates a fully customised AI prompt — zero writing required."
            href="/tools/youtool-playbooks"
          />

          <h2>The Long-Term Mindset</h2>
          <p>
            The creators who build channels that last don't chase what's trending — they build
            systematic content engines. Each well-optimised tutorial published today can still
            generate views two years from now. Think in years, not weeks.
          </p>
          <p>
            Your content strategy should be documented, regularly reviewed, and flexible enough
            to adapt when the data tells you something isn't working. The goal isn't to follow
            the plan perfectly — it's to have a plan that keeps you moving forward.
          </p>
        </Content>
      </ContentWrapper>
    </Container>
  );
};
