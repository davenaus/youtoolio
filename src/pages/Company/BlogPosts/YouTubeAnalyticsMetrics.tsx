// src/pages/Company/BlogPosts/YouTubeAnalyticsMetrics.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../../components/SEO';
import {
  Container, ContentWrapper, BackButton, PostHeader, Category,
  Title, Meta, Content, TipBox, ToolCallout, KeyTakeaway,
  StatGrid, StatCard, TableWrapper, DataTable,
} from './BlogComponents';

export const YouTubeAnalyticsMetrics: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <SEO
        title="10 YouTube Analytics Metrics Every Creator Should Track in 2025 | YouTool.io"
        description="Discover the most important YouTube analytics metrics for channel growth. Learn what watch time, CTR, audience retention and engagement rate really mean for your strategy."
        canonical="https://youtool.io/blog/youtube-analytics-metrics-2025"
      />
      <ContentWrapper>
        <BackButton onClick={() => navigate('/blog')}>
          <i className="bx bx-arrow-back"></i> Back to Blog
        </BackButton>

        <PostHeader>
          <Category color="#16a34a">Analytics</Category>
          <Title>10 YouTube Analytics Metrics Every Creator Should Track in 2025</Title>
          <Meta>
            <span><i className="bx bx-calendar"></i> July 15, 2025</span>
            <span><i className="bx bx-time"></i> 10 min read</span>
            <span><i className="bx bx-user"></i> YouTool Team</span>
          </Meta>
        </PostHeader>

        <Content>
          <p>
            Data-driven creators grow faster. Not because they obsess over every number, but because
            they know which metrics actually move the needle — and which ones are vanity metrics that
            feel good but don't tell you anything actionable. This guide covers the 10 metrics that
            matter most in 2025, what each one actually means, and the benchmarks to aim for.
          </p>

          {/* Key metric benchmarks */}
          <StatGrid>
            <StatCard accent="#16a34a">
              <div className="label">Good CTR (most niches)</div>
              <div className="value">4–8%</div>
              <div className="desc">Below 2% = thumbnail or title problem. Above 10% = exceptional.</div>
            </StatCard>
            <StatCard accent="#16a34a">
              <div className="label">Average View Duration Target</div>
              <div className="value">40–60%</div>
              <div className="desc">Percentage of total video length viewed on average</div>
            </StatCard>
            <StatCard accent="#16a34a">
              <div className="label">Good Engagement Rate</div>
              <div className="value">3–6%</div>
              <div className="desc">(Likes + Comments) ÷ Views — above 6% is strong</div>
            </StatCard>
            <StatCard accent="#16a34a">
              <div className="label">Subscriber Conversion Rate</div>
              <div className="value">1–3%</div>
              <div className="desc">Percentage of views that result in a new subscriber</div>
            </StatCard>
          </StatGrid>

          <h2>The 10 Metrics That Actually Matter</h2>

          <h3>1. Click-Through Rate (CTR)</h3>
          <p>
            CTR measures how often viewers click your video when shown the thumbnail. It's one of
            the clearest signals of how well your thumbnail and title work together. A low CTR means
            your packaging isn't compelling enough — even if the content itself is excellent.
          </p>
          <p>
            Most channels see 2–5% CTR. If you're consistently below 2%, start with your thumbnail.
            If below the average for your niche, your title may not be speaking to search intent.
          </p>

          <ToolCallout
            icon="bx-video"
            toolName="Video Analyzer"
            description="Analyse any video's engagement rate, estimated performance, and SEO score in seconds. Compare against channel averages to identify which videos are punching above their weight."
            href="/tools/video-analyzer"
          />

          <h3>2. Average View Duration</h3>
          <p>
            This tells you how long, on average, people watch your videos. The YouTube algorithm
            uses this heavily in its recommendation decisions. A 40–60% average view duration is
            considered good for longer-form content. For videos under 5 minutes, aim for 60%+.
          </p>

          <h3>3. Audience Retention</h3>
          <p>
            The retention graph in YouTube Studio shows you exactly where viewers drop off. More
            valuable than the average — it tells you which sections are losing people. If there's
            a cliff at the 0:15 mark, your hook is weak. If people leave at the 80% mark, you're
            spending too long on your outro.
          </p>

          <h3>4. Impressions</h3>
          <p>
            Impressions count how many times your thumbnail was shown to logged-in YouTube users.
            High impressions with low CTR = packaging problem. Low impressions = algorithm isn't
            surfacing your content — look at SEO, publishing time, and topic selection.
          </p>

          <h3>5. Watch Time (Hours)</h3>
          <p>
            Total watch time is the cumulative hours viewers have spent on your channel. YouTube
            uses this as a proxy for value created. Channels that generate more watch time per
            subscriber get better distribution. Longer videos don't automatically mean more
            watch time — high retention on shorter videos can outperform.
          </p>

          <h3>6. Engagement Rate</h3>
          <p>
            Engagement rate = (Likes + Comments) ÷ Views. A high engagement rate signals to the
            algorithm that your content is resonating, not just being watched passively. Aim to
            create content that prompts a reaction — ask questions, take positions, include
            memorable moments people want to comment on.
          </p>

          <KeyTakeaway>
            <i className="bx bx-bar-chart-alt-2"></i>
            <div>
              <p><strong>The ratio that matters most:</strong> Watch time × Engagement rate. A video
              with both high watch time AND high engagement gets dramatically better algorithmic
              distribution than one with just one of these.</p>
            </div>
          </KeyTakeaway>

          <h3>7. Subscriber Growth Rate</h3>
          <p>
            How many new subscribers you gain per video and per month. A slow growth rate relative
            to views means people are watching but not finding enough value to subscribe. If
            subscriber growth accelerates after certain videos, look carefully at what was different
            about those — topic, format, CTA placement.
          </p>

          <h3>8. Traffic Sources</h3>
          <p>
            Where your views come from matters as much as how many you get. Browse features
            (home feed + suggested) = algorithm is recommending you. Search = your SEO is working.
            External = you have audience outside YouTube. Direct = your subscribers actively
            seeking out your content.
          </p>

          <h3>9. Revenue per Mille (RPM)</h3>
          <p>
            RPM is how much you earn per 1,000 video views after YouTube takes its cut. Different
            niches have wildly different RPMs — finance and B2B content earns 10–20× more per view
            than gaming or entertainment. Understanding your RPM helps you make better content
            strategy decisions.
          </p>

          <ToolCallout
            icon="bx-dollar-circle"
            toolName="YouTube Calculator"
            description="Estimate your earnings based on your views, niche, and geography. Understand how RPM varies across content categories and what it means for your channel's revenue potential."
            href="/tools/youtube-calculator"
          />

          <h3>10. Re-watch Rate</h3>
          <p>
            Portions of your video that viewers watch multiple times show up as spikes in the
            retention graph. These spikes indicate your most valuable content — the moments that
            made people stop and rewind. Study these sections and create more content around
            what drives them.
          </p>

          <h2>A Practical Dashboard: What to Check Each Week</h2>

          <TableWrapper>
            <DataTable>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Check frequency</th>
                  <th>Action if below target</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>CTR</strong></td>
                  <td>First 48 hours post-upload</td>
                  <td>A/B test a new thumbnail or rewrite the title</td>
                </tr>
                <tr>
                  <td><strong>Avg View Duration</strong></td>
                  <td>First 72 hours post-upload</td>
                  <td>Strengthen your hook; audit the first 30 seconds</td>
                </tr>
                <tr>
                  <td><strong>Impressions</strong></td>
                  <td>Weekly</td>
                  <td>Review SEO, tags, publish time, topic demand</td>
                </tr>
                <tr>
                  <td><strong>Engagement Rate</strong></td>
                  <td>Weekly</td>
                  <td>Add a clear CTA; ask a question in the video</td>
                </tr>
                <tr>
                  <td><strong>Subscriber Growth</strong></td>
                  <td>Monthly</td>
                  <td>Improve subscribe CTA; refine channel proposition</td>
                </tr>
                <tr>
                  <td><strong>Traffic Sources</strong></td>
                  <td>Monthly</td>
                  <td>If mostly external, improve internal SEO; if 0 browse, fix packaging</td>
                </tr>
              </tbody>
            </DataTable>
          </TableWrapper>

          <h2>Common Analytics Mistakes</h2>

          <h3>Chasing Views Over Watch Time</h3>
          <p>
            A video with 100,000 views and 20% retention delivers less value to the algorithm than
            one with 30,000 views and 70% retention. Don't optimise for the vanity number.
          </p>

          <h3>Ignoring Traffic Source Breakdown</h3>
          <p>
            If 80% of your traffic comes from External (links you share), the algorithm isn't
            recommending you — which means you don't have a compounding growth engine. Shift
            focus to content that gets browse and suggested traffic.
          </p>

          <TipBox>
            <h4><i className="bx bx-trending-up"></i> Advanced Analytics</h4>
            <p>
              Use YouTool's Channel Analyzer to get an independent view of your channel's performance
              score across four dimensions: SEO, engagement, consistency, and branding. Compare against
              channels in your niche to benchmark your progress.
            </p>
          </TipBox>

          <ToolCallout
            icon="bx-bar-chart-alt-2"
            toolName="Channel Analyzer"
            description="Get a full channel health score — covering SEO, engagement rate, upload consistency, and branding — plus a breakdown of your top-performing videos and what made them work."
            href="/tools/channel-analyzer"
          />
        </Content>
      </ContentWrapper>
    </Container>
  );
};
