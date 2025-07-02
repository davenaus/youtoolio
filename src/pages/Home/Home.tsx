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
    { name: 'Video Analyzer', image: 'https://64.media.tumblr.com/f55e2ae2e5b16799fd5889c64b3fe36b/0e01452f9f6dd974-0e/s2048x3072/09051a8561ff4ab1cc8a5fa3b4b3d81f8a3a720d.jpg' },
    { name: 'Keyword Analyzer', image: 'https://64.media.tumblr.com/10c0d99fe1fe964324e1cdb293ee4756/0e01452f9f6dd974-c1/s2048x3072/4307ba680bb19d0d80529c1d1415552dffdd3b9a.jpg' },
    { name: 'Thumbnail Tester', image: 'https://64.media.tumblr.com/c16a513f772461ec4c1c27bf532b7d8f/0e01452f9f6dd974-6d/s2048x3072/8f37d7ca31ccb0b698b3e21d74c2e276c260c7a0.jpg' },
    { name: 'QR Generator', image: 'https://64.media.tumblr.com/da5e76716d812a5ccec22e37179e2575/0e01452f9f6dd974-89/s2048x3072/2c12bac7610d803f4a197ea109c839a969849ac2.jpg' },
    { name: 'Channel Analyzer', image: 'https://64.media.tumblr.com/ac9ad9e3a75b264881169b38018b6be8/0e01452f9f6dd974-e5/s2048x3072/8c12986bb347fdcb8bb1f003ca88748e35b437d8.jpg' },
    { name: 'Tag Generator', image: 'https://64.media.tumblr.com/276a73213e38fa7b326758ee7f115ed6/0e01452f9f6dd974-35/s2048x3072/a99f9ebfb857f86f0b720517850972aff27712c1.jpg' }
  ];

  const features = [
    {
      icon: 'bx bx-chart',
      title: 'Advanced Analytics',
      description: 'Deep insights into your YouTube performance with comprehensive analytics and trend analysis',
      highlight: 'Real-time data',
      image: 'https://64.media.tumblr.com/f55e2ae2e5b16799fd5889c64b3fe36b/0e01452f9f6dd974-0e/s2048x3072/09051a8561ff4ab1cc8a5fa3b4b3d81f8a3a720d.jpg'
    },
    {
      icon: 'bx bx-search-alt',
      title: 'SEO Optimization',
      description: 'Optimize your content for maximum discoverability with AI-powered keyword research',
      highlight: 'Boost visibility',
      image: 'https://64.media.tumblr.com/10c0d99fe1fe964324e1cdb293ee4756/0e01452f9f6dd974-c1/s2048x3072/4307ba680bb19d0d80529c1d1415552dffdd3b9a.jpg'
    },
    {
      icon: 'bx bx-download',
      title: 'Content Tools',
      description: 'Download thumbnails, comments, and transcripts with professional-grade utilities',
      highlight: 'One-click downloads',
      image: 'https://64.media.tumblr.com/b12f0a4e3b88cf8409200338965cf706/0e01452f9f6dd974-5e/s2048x3072/00de80d7d1ca44cb236d21cab0adbe20fc5bbfb9.jpg'
    },
    {
      icon: 'bx bx-trending-up',
      title: 'Growth Insights',
      description: 'Discover what makes videos go viral and apply those insights to your content strategy',
      highlight: 'Viral patterns',
      image: 'https://64.media.tumblr.com/60109acd631995e9b43834a7f4358e78/0e01452f9f6dd974-f2/s2048x3072/3390c9b19607d957940ac9e1b8b23b6afbdc037f.jpg'
    }
  ];

  const featuredTools = [
    {
      id: 'video-analyzer',
      name: 'Video Analyzer',
      description: 'Deep-dive analytics for your YouTube videos. Track performance metrics, engagement rates, viewer retention patterns, and get actionable insights to improve your content strategy.',
      image: 'https://64.media.tumblr.com/f55e2ae2e5b16799fd5889c64b3fe36b/0e01452f9f6dd974-0e/s2048x3072/09051a8561ff4ab1cc8a5fa3b4b3d81f8a3a720d.jpg',
      icon: 'bx bx-chart',
      features: ['Performance tracking', 'Engagement analytics', 'Retention insights', 'Growth recommendations']
    },
    {
      id: 'qr-code-generator',
      name: 'QR Code Generator', 
      description: 'Create professional QR codes with custom styling and logo integration. Perfect for linking to your YouTube channel, social media, or any content you want to promote.',
      image: 'https://64.media.tumblr.com/da5e76716d812a5ccec22e37179e2575/0e01452f9f6dd974-89/s2048x3072/2c12bac7610d803f4a197ea109c839a969849ac2.jpg',
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
                src="https://64.media.tumblr.com/e000461398dfaa9247cc9db6eca187a2/0e01452f9f6dd974-6b/s2048x3072/0457337859cea0729cdfee1d7a9407e25f8f5cca.png"
                alt="YouTool Logo"
              />
            </S.Logo>

            <S.HeroTitle>
              The Ultimate Suite of <S.Highlight>Free YouTube Tools</S.Highlight>
            </S.HeroTitle>

            <S.HeroSubtitle>
              Supercharge your YouTube channel with professional-grade analytics,
              SEO tools, and content optimization features. Join 1,000+ creators 
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
                onClick={() => setShowVideoModal(true)}
              >
                Watch Demo
              </Button>
            </S.HeroButtons>
          </S.HeroContent>

          <S.HeroImage>
            <S.VideoPreview onClick={() => setShowVideoModal(true)}>
              <S.VideoThumbnail src="https://64.media.tumblr.com/e6f81d50783e858c0607b451cb6ce268/0e01452f9f6dd974-a5/s2048x3072/f7630c48335303291ad4bfb87b376deda23a724e.jpg" alt="YouTool Demo" />
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
                src="https://www.youtube.com/embed/m02ZZL-EWg0?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&iv_load_policy=3"
                title="YouTool Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </S.VideoPlayer>
          </S.VideoModalContent>
        </S.VideoModal>
      )}
    </S.Container>
  );
};