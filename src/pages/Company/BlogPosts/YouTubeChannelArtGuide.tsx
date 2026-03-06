// src/pages/Company/BlogPosts/YouTubeChannelArtGuide.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../../components/SEO';
import {
  Container, ContentWrapper, BackButton, PostHeader, Category,
  Title, Meta, Content, TipBox, ToolCallout, KeyTakeaway,
  StatGrid, StatCard,
} from './BlogComponents';

export const YouTubeChannelArtGuide: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <SEO
        title="YouTube Channel Art Guide: Banner, Profile Picture & Brand Identity | YouTool.io"
        description="Learn the right banner dimensions, profile picture specs, and design principles to build a consistent YouTube brand identity that converts first-time visitors into subscribers."
        canonical="https://youtool.io/blog/youtube-channel-art-guide"
      />
      <ContentWrapper>
        <BackButton onClick={() => navigate('/blog')}>
          <i className="bx bx-arrow-back"></i> Back to Blog
        </BackButton>

        <PostHeader>
          <Category color="#fb7185">Branding</Category>
          <Title>YouTube Channel Art Guide: Banner, Profile Picture & Visual Brand Identity</Title>
          <Meta>
            <span><i className="bx bx-calendar"></i> September 30, 2025</span>
            <span><i className="bx bx-time"></i> 10 min read</span>
            <span><i className="bx bx-user"></i> YouTool Team</span>
          </Meta>
        </PostHeader>

        <Content>
          <p>
            First impressions on YouTube are visual. When someone visits your channel for the
            first time — whether from a recommended video, a search result, or a social share
            — your banner and profile picture are the first things they see. Before they've
            watched a single second of your content, they've already formed a subconscious
            judgment about whether this channel looks professional, trustworthy, and worth
            their time. Channel art doesn't drive views directly, but it converts views into
            subscribers by telling visitors exactly what kind of channel this is.
          </p>

          <StatGrid>
            <StatCard accent="#fb7185">
              <div className="label">Banner (desktop)</div>
              <div className="value">2560 × 1440 px</div>
              <div className="desc">Maximum recommended upload size — YouTube will scale down for each device</div>
            </StatCard>
            <StatCard accent="#fb7185">
              <div className="label">Safe Zone</div>
              <div className="value">1546 × 423 px</div>
              <div className="desc">The central area visible on ALL devices — keep all critical text and logos here</div>
            </StatCard>
            <StatCard accent="#fb7185">
              <div className="label">Profile Picture</div>
              <div className="value">800 × 800 px</div>
              <div className="desc">Displays as a circle — centre your subject and avoid edge elements that will be clipped</div>
            </StatCard>
            <StatCard accent="#fb7185">
              <div className="label">Max File Size</div>
              <div className="value">6 MB</div>
              <div className="desc">PNG or JPG for banners; PNG preferred for profile pictures to preserve edge quality</div>
            </StatCard>
          </StatGrid>

          <h2>The Banner Safe Zone Explained</h2>
          <p>
            YouTube displays your banner differently on desktop browsers, tablets, mobile
            devices, and TVs. The full 2560 × 1440 px image is only visible on large
            TVs — on desktop, the effective area is much smaller, and on mobile it shrinks
            further. The safe zone (1546 × 423 px centred) is the one area that's visible
            on every device. Everything important — your channel name, tagline, upload
            schedule, and logo — must fit within this safe zone or it will be cropped off
            on some devices.
          </p>
          <p>
            Design your banner in three layers: a full-width background that fills all
            2560 × 1440 px (decorative only), a tablet-visible zone that extends slightly
            beyond the safe zone, and a mobile/safe zone that contains all critical information.
            Never position your channel name near the edges — it will disappear on mobile.
          </p>

          <ToolCallout
            icon="bx-image-download"
            toolName="Banner Downloader"
            description="Download any YouTube channel's banner at its original upload resolution. Study how successful channels in your niche structure their banners, what goes in the safe zone, and how they communicate their brand identity — then build your own with the same principles."
            href="/tools/banner-downloader"
          />

          <h2>Profile Picture Best Practices</h2>
          <p>
            Your profile picture appears as a small circle across YouTube: next to your
            channel name in search results, beside your comments, in recommendation rows,
            and in Shorts. At small sizes, detail is invisible. The principles for a strong
            profile picture are:
          </p>
          <ul>
            <li><strong>High contrast:</strong> Your subject needs to stand out against any background (light or dark) since YouTube displays your picture against both</li>
            <li><strong>Single focus:</strong> One face, one logo, or one simple icon — not a group photo or complex illustration that becomes unreadable at 40px</li>
            <li><strong>Consistent with your thumbnails:</strong> If your face is in every thumbnail, it should be in your profile picture. If you use a brand logo, be consistent</li>
            <li><strong>No text:</strong> Text is unreadable at small sizes and looks cluttered. Your channel name appears next to the picture — it doesn't need to be in the picture too</li>
          </ul>

          <ToolCallout
            icon="bx-user-circle"
            toolName="Profile Picture Downloader"
            description="Download any YouTube channel's profile picture at maximum resolution. Analyse how top channels in your niche present their brand identity at the profile picture level — then apply the same visual clarity principles to your own."
            href="/tools/profile-picture-downloader"
          />

          <h2>Building Visual Brand Consistency</h2>
          <p>
            The most recognisable YouTube channels have visual consistency across every
            touchpoint: thumbnails, banner, profile picture, end screens, and lower thirds
            all use the same 2–3 colours, the same font family, and the same compositional
            style. This consistency does two things. First, it makes your thumbnails
            instantly recognisable in recommendation rows — viewers learn to identify your
            content before reading the title. Second, it signals professionalism to new
            visitors, which increases the likelihood they subscribe.
          </p>

          <TipBox>
            <h4><i className="bx bx-palette"></i> Choosing Your Channel Colour Palette</h4>
            <p>
              Limit yourself to 2–3 primary colours for your entire visual identity. One
              dominant colour (used in banners, backgrounds), one accent colour (used for
              text highlights, borders, icons), and one neutral (usually white or a dark
              tone for contrast). Picking colours from your profile picture or banner and
              applying them consistently to thumbnails creates powerful visual brand recognition.
            </p>
          </TipBox>

          <ToolCallout
            icon="bx-droplet"
            toolName="Color Palette Generator"
            description="Extract a consistent colour palette from any image — your logo, a thumbnail, or a brand reference. Get exact hex codes to use across all your channel art, ensuring your banner, profile picture, and thumbnails share a cohesive visual identity."
            href="/tools/color-palette"
          />

          <h2>What Your Banner Should Communicate</h2>
          <p>
            A high-converting banner communicates three things in the time it takes a
            visitor to glance at it (roughly 2–3 seconds):
          </p>
          <ul>
            <li><strong>Who this channel is for:</strong> "For UK investors", "For home cooks on a budget", "For indie game developers" — specificity makes subscribers feel seen</li>
            <li><strong>What you make:</strong> A one-line description of your content format and topic, or a visual representation (icons, photos)</li>
            <li><strong>Upload schedule (optional but effective):</strong> "New videos every Tuesday" — sets expectations and gives viewers a reason to subscribe now rather than "later"</li>
          </ul>

          <KeyTakeaway>
            <i className="bx bx-palette"></i>
            <div>
              <p><strong>The priority:</strong> If you're just starting, spend more time on profile picture quality than banner complexity. Profile pictures appear everywhere on YouTube, while banners are only seen on channel pages. A clean, high-contrast, instantly recognisable profile picture generates more subscriber conversions than an elaborate banner.</p>
            </div>
          </KeyTakeaway>
        </Content>
      </ContentWrapper>
    </Container>
  );
};
