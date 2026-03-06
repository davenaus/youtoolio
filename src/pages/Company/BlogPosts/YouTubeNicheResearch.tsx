// src/pages/Company/BlogPosts/YouTubeNicheResearch.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../../components/SEO';
import {
  Container, ContentWrapper, BackButton, PostHeader, Category,
  Title, Meta, Content, TipBox, ToolCallout, KeyTakeaway,
  StepFlow, StepItem, StepNum, StepContent,
} from './BlogComponents';

export const YouTubeNicheResearch: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <SEO
        title="How to Find Your YouTube Niche: A Data-Driven Research Framework | YouTool.io"
        description="Stop guessing what to make. Use keyword data, competitor gap analysis, and outlier video research to find a profitable YouTube niche with real audience demand."
        canonical="https://youtool.io/blog/youtube-niche-research"
      />
      <ContentWrapper>
        <BackButton onClick={() => navigate('/blog')}>
          <i className="bx bx-arrow-back"></i> Back to Blog
        </BackButton>

        <PostHeader>
          <Category color="#be123c">Strategy</Category>
          <Title>How to Find Your YouTube Niche: A Data-Driven Research Framework</Title>
          <Meta>
            <span><i className="bx bx-calendar"></i> January 20, 2026</span>
            <span><i className="bx bx-time"></i> 13 min read</span>
            <span><i className="bx bx-user"></i> YouTool Team</span>
          </Meta>
        </PostHeader>

        <Content>
          <p>
            Most creators choose their niche based on personal passion or a vague sense that
            "there's an audience for this." Passion matters — but passion without demand is a
            hobby, not a channel. The creators who build fast-growing channels combine genuine
            interest with data: they find niches where real audiences are actively searching,
            competitor channels are leaving gaps, and the algorithm is hungry for more content.
          </p>
          <p>
            This guide gives you a repeatable research framework to do exactly that — find a
            niche that's specific enough for the algorithm to understand you, broad enough to
            sustain 100+ video ideas, and competitive enough to validate that there's real demand.
          </p>

          <ToolCallout
            icon="bx-trending-up"
            toolName="Outlier Finder"
            description="Before committing to a niche, use Outlier Finder to see which video topics in that space are generating 3×–10× their channel's average views. High outlier frequency signals a hungry audience and algorithm-friendly subject matter."
            href="/tools/outlier-finder"
          />

          <h2>What Makes a Good YouTube Niche?</h2>
          <p>
            A strong niche satisfies three conditions simultaneously:
          </p>
          <ul>
            <li><strong>Search demand:</strong> People are actively typing queries related to this topic into YouTube's search bar. If there's no search volume, you're broadcasting into silence.</li>
            <li><strong>Audience specificity:</strong> The algorithm can clearly identify who your ideal viewer is. "Finance" is too broad. "Investing strategies for new nurses in the UK" is a niche — YouTube knows exactly who to show it to.</li>
            <li><strong>Content depth:</strong> You can generate 50–100 distinct video ideas without repeating yourself. If you exhaust your ideas in 20 videos, the niche is too narrow.</li>
          </ul>

          <KeyTakeaway>
            <i className="bx bx-target-lock"></i>
            <div>
              <p><strong>The niche test:</strong> Write down your niche in one sentence that answers: who is your viewer, what specific problem do you solve, and why should they watch you instead of the 10 other channels on this topic? If you can't answer all three, keep narrowing.</p>
            </div>
          </KeyTakeaway>

          <h2>The 5-Step Niche Research Framework</h2>

          <StepFlow>
            <StepItem>
              <StepNum>1</StepNum>
              <StepContent>
                <h4>List Your Broad Interest Areas</h4>
                <p>
                  Start with 3–5 topics you genuinely know or care about. You'll be making
                  videos on this for years — you need real interest. But keep these broad at
                  first: "personal finance", "cooking", "software development", "fitness".
                  You'll narrow them in step 3.
                </p>
              </StepContent>
            </StepItem>

            <StepItem>
              <StepNum>2</StepNum>
              <StepContent>
                <h4>Research Search Demand With Keywords</h4>
                <p>
                  For each broad topic, find 20–30 keywords people actually search. Look at
                  search volume, competition, and how specific the queries get. High search
                  volume on very specific queries (long-tail) is a strong signal of a niche
                  with real, findable demand. Low competition on these specifics means you
                  can rank faster.
                </p>
              </StepContent>
            </StepItem>

            <StepItem>
              <StepNum>3</StepNum>
              <StepContent>
                <h4>Identify the Intersection Point</h4>
                <p>
                  The best niches are the intersection of a topic, a specific audience, and a
                  unique angle. Take your broad topic and add an audience qualifier ("for
                  beginners", "for freelancers", "for people over 50") plus an angle qualifier
                  ("on a budget", "in 2026", "the honest guide to"). This intersection becomes
                  your channel's specific identity.
                </p>
              </StepContent>
            </StepItem>

            <StepItem>
              <StepNum>4</StepNum>
              <StepContent>
                <h4>Analyse Competitor Channels</h4>
                <p>
                  Find the top 5 channels already in your niche. Study their subscriber count,
                  average views per video, upload frequency, and which specific sub-topics they
                  cover most. Where are they thin? What questions do their viewers ask in
                  comments that aren't being answered? These gaps are your opportunity.
                </p>
              </StepContent>
            </StepItem>

            <StepItem>
              <StepNum>5</StepNum>
              <StepContent>
                <h4>Validate With Outlier Video Research</h4>
                <p>
                  Find which videos in your target niche dramatically outperform their channel's
                  average views. This tells you what the algorithm is currently rewarding and
                  what viewers are hungry for. If you can see a consistent pattern of outlier
                  videos on a specific sub-topic, that sub-topic is where you should launch.
                </p>
              </StepContent>
            </StepItem>
          </StepFlow>

          <ToolCallout
            icon="bx-search-alt"
            toolName="Keyword Analyzer"
            description="Research YouTube search demand for any topic — see search volume estimates, competition levels, and related keyword clusters to find the specific angles your target audience is actively searching for."
            href="/tools/keyword-analyzer"
          />

          <h2>Analysing the Competition</h2>
          <p>
            Competitor research isn't about copying — it's about finding where you can be
            10× better or serve a specific audience segment that's being underserved. When
            you analyse competitor channels, look for:
          </p>
          <ul>
            <li><strong>Content gaps:</strong> Topics their audience clearly wants but the channel hasn't covered (check comment sections for requests)</li>
            <li><strong>Format gaps:</strong> Channels doing only long-form with no Shorts, no series, no community content — leaving room for you to reach the audience differently</li>
            <li><strong>Production-quality mismatches:</strong> High-effort production on topics that don't need it, or low-effort production where a well-produced video would dominate</li>
            <li><strong>Audience demographic gaps:</strong> A finance channel speaking to 35-year-old Americans when the same topic has an untapped audience of 22-year-old Australians</li>
          </ul>

          <ToolCallout
            icon="bx-git-compare"
            toolName="Channel Comparer"
            description="Side-by-side comparison of any two YouTube channels. See subscriber growth, average views, engagement rates, upload frequency, and content focus — essential data for identifying where competitor channels are weak and you can be stronger."
            href="/tools/channel-comparer"
          />

          <TipBox>
            <h4><i className="bx bx-bulb"></i> The 100-Idea Test</h4>
            <p>
              Before committing to a niche, try to write 100 distinct video titles in that
              space without repeating the same concept. If you can't reach 100, the niche
              is too narrow for a sustainable channel. If you reach 100 easily, you have
              enough depth to build a content engine that runs for years.
            </p>
          </TipBox>

          <h2>Common Niche-Selection Mistakes</h2>

          <h3>Being Too Broad</h3>
          <p>
            A channel called "Health Tips" is competing with millions of creators across
            every health sub-category. The algorithm doesn't know who to show it to, and
            viewers don't feel it's specifically for them. Narrow your niche until you feel
            almost uncomfortable with how specific you've gone — that's usually the right
            level.
          </p>

          <h3>Choosing Based Purely on Trending Topics</h3>
          <p>
            Trends spike and collapse. If your niche is built on a trend rather than a
            durable audience need, your channel's relevance will decay as the trend fades.
            Durable niches solve a persistent human problem — health, money, relationships,
            skills, entertainment in a specific format that always has demand.
          </p>

          <h3>Ignoring Monetization From Day One</h3>
          <p>
            Not all niches monetise equally. Audiences in finance, software, B2B services,
            and health have significantly higher CPM rates than entertainment or gaming niches.
            If revenue matters, research the advertiser demand in your niche before you
            commit. A niche with high search volume but low advertiser interest will deliver
            low CPMs regardless of how many views you generate.
          </p>

          <KeyTakeaway>
            <i className="bx bx-rocket"></i>
            <div>
              <p><strong>Where to start:</strong> Pick the intersection of what you genuinely know well, what has verifiable search demand, and what has competitor channels with clear gaps. Run the 100-idea test, validate with outlier video research, and commit for at least 6 months before evaluating whether to pivot.</p>
            </div>
          </KeyTakeaway>
        </Content>
      </ContentWrapper>
    </Container>
  );
};
