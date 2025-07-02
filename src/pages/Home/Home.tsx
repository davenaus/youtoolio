// src/pages/Home/Home.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import * as S from './styles';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    if (showVideoModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showVideoModal]);

  const tools = [
    { name: 'Video Analyzer', image: '/images/tools/video-analyzer.jpg' },
    { name: 'Keyword Analyzer', image: '/images/tools/keyword-analyzer.jpg' },
    { name: 'Thumbnail Tester', image: '/images/tools/thumbnail-tester.jpg' },
    { name: 'QR Generator', image: '/images/tools/qr-code-generator.jpg' },
    { name: 'Channel Analyzer', image: '/images/tools/channel-analyzer.jpg' },
    { name: 'Tag Generator', image: '/images/tools/tag-generator.jpg' }
  ];

  const features = [
    {
      icon: 'bx bx-chart',
      title: 'Advanced Analytics',
      description: 'Deep insights into your YouTube performance with comprehensive analytics and trend analysis',
      highlight: 'Real-time data',
      image: '/images/tools/video-analyzer.jpg'
    },
    {
      icon: 'bx bx-search-alt',
      title: 'SEO Optimization',
      description: 'Optimize your content for maximum discoverability with AI-powered keyword research',
      highlight: 'Boost visibility',
      image: '/images/tools/keyword-analyzer.jpg'
    },
    {
      icon: 'bx bx-download',
      title: 'Content Tools',
      description: 'Download thumbnails, comments, and transcripts with professional-grade utilities',
      highlight: 'One-click downloads',
      image: '/images/tools/thumbnail-downloader.jpg'
    },
    {
      icon: 'bx bx-trending-up',
      title: 'Growth Insights',
      description: 'Discover what makes videos go viral and apply those insights to your content strategy',
      highlight: 'Viral patterns',
      image: '/images/tools/outlier-finder.jpg'
    }
  ];

  const featuredTools = [
    {
      id: 'video-analyzer',
      name: 'Video Analyzer',
      description: 'Deep-dive analytics for your YouTube videos. Track performance metrics, engagement rates, viewer retention patterns, and get actionable insights to improve your content strategy.',
      image: '/images/tools/video-analyzer.jpg',
      icon: 'bx bx-chart',
      features: ['Performance tracking', 'Engagement analytics', 'Retention insights', 'Growth recommendations']
    },
    {
      id: 'qr-code-generator',
      name: 'QR Code Generator', 
      description: 'Create professional QR codes with custom styling and logo integration. Perfect for linking to your YouTube channel, social media, or any content you want to promote.',
      image: '/images/tools/qr-code-generator.jpg',
      icon: 'bx bx-qr',
      features: ['Custom styling', 'Logo integration', 'Multiple formats', 'High resolution']
    }
  ];

  const testimonials = [
    {
      text: "YouTool helped me grow from 1K to 100K subscribers in 6 months. The keyword analyzer is a game-changer!",
      author: "Sarah Chen",
      role: "Tech YouTuber",
      avatar: "SC"
    },
    {
      text: "The analytics tools gave me insights I never had before. My video performance increased by 300%.",
      author: "Marcus Rivera",
      role: "Gaming Creator",
      avatar: "MR"
    },
    {
      text: "Finally, professional YouTube tools that are actually free. The thumbnail tester saved me hours.",
      author: "Emma Wilson",
      role: "Lifestyle Vlogger",
      avatar: "EW"
    }
  ];

  return (
    <S.Container>
      {/* Hero Section */}
      <S.HeroSection>
        <S.HeroBackground />
        <S.ContentWrapper>
          <S.HeroContent>
            <S.Logo>
              <S.LogoImage
                src="/images/logo.png"
                alt="YouTool Logo"
              />
            </S.Logo>

            <S.HeroTitle>
              The Ultimate Suite of <S.Highlight>Free YouTube Tools</S.Highlight>
            </S.HeroTitle>

            <S.HeroSubtitle>
              Supercharge your YouTube channel with professional-grade analytics,
              SEO tools, and content optimization features. Join 50,000+ creators 
              who've transformed their channels with our free tools.
            </S.HeroSubtitle>

            <S.HeroStats>
              <S.HeroStat>
                <S.StatNumber>15+</S.StatNumber>
                <S.StatLabel>Professional Tools</S.StatLabel>
              </S.HeroStat>
              <S.HeroStat>
                <S.StatNumber>1K+</S.StatNumber>
                <S.StatLabel>Active Creators</S.StatLabel>
              </S.HeroStat>
              <S.HeroStat>
                <S.StatNumber>100%</S.StatNumber>
                <S.StatLabel>Free Forever</S.StatLabel>
              </S.HeroStat>
            </S.HeroStats>

            <S.HeroButtons>
              <Button
                variant="primary"
                size="lg"
                icon="bx bx-right-arrow-alt"
                onClick={() => navigate('/tools')}
              >
                Explore All Tools
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon="bx bx-play"
                onClick={() => window.open('https://youtube.com', '_blank')}
              >
                Watch Demo
              </Button>
            </S.HeroButtons>
          </S.HeroContent>

          <S.HeroImage>
            <S.VideoPreview onClick={() => setShowVideoModal(true)}>
              <S.VideoThumbnail src="/images/thumbnail.jpg" alt="YouTool Demo" />
              <S.PlayButton>
                <i className="bx bx-play"></i>
              </S.PlayButton>
              <S.VideoOverlay />
            </S.VideoPreview>
          </S.HeroImage>
        </S.ContentWrapper>
      </S.HeroSection>

      {/* Features Section */}
      <S.FeaturesSection>
        <S.ContentWrapper>
          <S.SectionHeader>
            <S.SectionBadge>Why Choose YouTool?</S.SectionBadge>
            <S.SectionTitle>Everything you need to dominate YouTube</S.SectionTitle>
            <S.SectionSubtitle>
              Professional-grade tools trusted by creators worldwide. 
              No subscriptions, no limits, no catch.
            </S.SectionSubtitle>
          </S.SectionHeader>

          <S.FeaturesGrid>
            {features.map((feature, index) => (
              <S.FeatureCard key={index} delay={index * 0.1}>
                <S.FeatureContent>
                  <S.FeatureHeader>
                    <S.FeatureIcon>
                      <i className={feature.icon}></i>
                    </S.FeatureIcon>
                    <S.FeatureHighlight>{feature.highlight}</S.FeatureHighlight>
                  </S.FeatureHeader>
                  
                  <S.FeatureTitle>{feature.title}</S.FeatureTitle>
                  <S.FeatureDescription>{feature.description}</S.FeatureDescription>
                </S.FeatureContent>
              </S.FeatureCard>
            ))}
          </S.FeaturesGrid>
        </S.ContentWrapper>
      </S.FeaturesSection>

      {/* Testimonials Section */}
      <S.TestimonialsSection>
        <S.ContentWrapper>
          <S.SectionHeader>
            <S.SectionBadge>Success Stories</S.SectionBadge>
            <S.SectionTitle>Loved by creators worldwide</S.SectionTitle>
          </S.SectionHeader>

          <S.TestimonialsGrid>
            {testimonials.map((testimonial, index) => (
              <S.TestimonialCard key={index} delay={index * 0.2}>
                <S.TestimonialQuote>"{testimonial.text}"</S.TestimonialQuote>
                <S.TestimonialAuthor>
                  <S.AuthorAvatar>{testimonial.avatar}</S.AuthorAvatar>
                  <S.AuthorInfo>
                    <S.AuthorName>{testimonial.author}</S.AuthorName>
                    <S.AuthorRole>{testimonial.role}</S.AuthorRole>
                  </S.AuthorInfo>
                </S.TestimonialAuthor>
              </S.TestimonialCard>
            ))}
          </S.TestimonialsGrid>
        </S.ContentWrapper>
      </S.TestimonialsSection>

      {/* Featured Tools Section */}
      <S.FeaturedToolsSection>
        <S.ContentWrapper>
          <S.SectionHeader>
            <S.SectionBadge>Featured Tools</S.SectionBadge>
            <S.SectionTitle>Professional YouTube optimization</S.SectionTitle>
            <S.SectionSubtitle>
              Discover our most popular tools trusted by thousands of creators worldwide
            </S.SectionSubtitle>
          </S.SectionHeader>

          <S.FeaturedToolsList>
            {featuredTools.map((tool, index) => (
              <S.FeaturedToolItem key={tool.id} reverse={index % 2 === 1}>
                <S.FeaturedToolImage>
                  <img src={tool.image} alt={tool.name} />
                  <S.FeaturedToolImageOverlay />
                </S.FeaturedToolImage>
                
                <S.FeaturedToolContent>
                  <S.FeaturedToolHeader>
                    <S.FeaturedToolIcon>
                      <i className={tool.icon}></i>
                    </S.FeaturedToolIcon>
                    <S.FeaturedToolName>{tool.name}</S.FeaturedToolName>
                  </S.FeaturedToolHeader>
                  
                  <S.FeaturedToolDescription>{tool.description}</S.FeaturedToolDescription>
                  
                  <S.FeaturedToolFeatures>
                    {tool.features.map((feature, featureIndex) => (
                      <S.FeaturedToolFeature key={featureIndex}>
                        <i className="bx bx-check"></i>
                        <span>{feature}</span>
                      </S.FeaturedToolFeature>
                    ))}
                  </S.FeaturedToolFeatures>
                  
                  <S.FeaturedToolAction 
                    onClick={() => navigate(`/tools/${tool.id}`)}
                  >
                    <span>Try {tool.name}</span>
                    <i className="bx bx-right-arrow-alt"></i>
                  </S.FeaturedToolAction>
                </S.FeaturedToolContent>
              </S.FeaturedToolItem>
            ))}
          </S.FeaturedToolsList>

          <S.AllToolsAction>
            <Button
              variant="primary"
              size="lg"
              icon="bx bx-grid-alt"
              onClick={() => navigate('/tools')}
            >
              View All 15+ Tools
            </Button>
          </S.AllToolsAction>
        </S.ContentWrapper>
      </S.FeaturedToolsSection>

      {/* Stats Section */}
      <S.StatsSection>
        <S.StatsBackground />
        <S.ContentWrapper>
          <S.StatsGrid>
            <S.StatCard delay={0}>
              <S.StatIcon><i className="bx bx-wrench"></i></S.StatIcon>
              <S.StatNumber>15+</S.StatNumber>
              <S.StatLabel>Professional Tools</S.StatLabel>
              <S.StatDescription>Every tool is crafted for creators</S.StatDescription>
            </S.StatCard>
            <S.StatCard delay={0.1}>
              <S.StatIcon><i className="bx bx-group"></i></S.StatIcon>
              <S.StatNumber>50K+</S.StatNumber>
              <S.StatLabel>Active Users</S.StatLabel>
              <S.StatDescription>Trusted by creators worldwide</S.StatDescription>
            </S.StatCard>
            <S.StatCard delay={0.2}>
              <S.StatIcon><i className="bx bx-infinite"></i></S.StatIcon>
              <S.StatNumber>100%</S.StatNumber>
              <S.StatLabel>Free Forever</S.StatLabel>
              <S.StatDescription>No hidden fees or limitations</S.StatDescription>
            </S.StatCard>
            <S.StatCard delay={0.3}>
              <S.StatIcon><i className="bx bx-time"></i></S.StatIcon>
              <S.StatNumber>24/7</S.StatNumber>
              <S.StatLabel>Always Available</S.StatLabel>
              <S.StatDescription>Access tools anytime, anywhere</S.StatDescription>
            </S.StatCard>
          </S.StatsGrid>
        </S.ContentWrapper>
      </S.StatsSection>

      {/* Final CTA Section */}
      <S.CTASection>
        <S.ContentWrapper>
          <S.CTAContent>
            <S.CTABadge>Ready to grow?</S.CTABadge>
            <S.CTATitle>Transform your YouTube channel today</S.CTATitle>
            <S.CTASubtitle>
              Join thousands of successful creators who've accelerated their growth 
              with our professional-grade tools. Start your journey to YouTube success now.
            </S.CTASubtitle>
            <S.CTAButtons>
              <Button
                variant="primary"
                size="lg"
                icon="bx bx-rocket"
                onClick={() => navigate('/tools')}
              >
                Start Creating Now
              </Button>
              <S.CTASecondaryText>
                No account required • Instant access • Always free
              </S.CTASecondaryText>
            </S.CTAButtons>
          </S.CTAContent>
        </S.ContentWrapper>
      </S.CTASection>

      {/* Video Modal */}
      {showVideoModal && (
        <S.VideoModal onClick={() => setShowVideoModal(false)}>
          <S.VideoModalBackdrop />
          <S.VideoModalContent onClick={(e) => e.stopPropagation()}>
            <S.VideoModalClose onClick={() => setShowVideoModal(false)}>
              <i className="bx bx-x"></i>
            </S.VideoModalClose>
            <S.VideoPlayer>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="YouTool Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </S.VideoPlayer>
          </S.VideoModalContent>
        </S.VideoModal>
      )}
    </S.Container>
  );
};