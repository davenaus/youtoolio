// src/pages/LinkInBioLanding/LinkInBioLanding.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as S from './styles';

export const LinkInBioLanding: React.FC = () => {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const handleEnterTool = () => {
    window.open('https://sites.google.com/view/youtoolio/link-in-bio-page-maker', '_blank');
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const features = [
    {
      icon: 'bx bx-rocket',
      title: 'No-Code Solution',
      description: 'Build your page with our simple, intuitive UI. No coding skills needed!'
    },
    {
      icon: 'bx bx-link',
      title: 'Unlimited Links',
      description: 'Add as many links as you want, fully customizable and reorderable.'
    },
    {
      icon: 'bx bx-star',
      title: 'Premium Features',
      description: 'Custom themes, animations, and locked links - all included!'
    },
    {
      icon: 'bx bx-video',
      title: 'YouTube Integration',
      description: 'Embed YouTube videos directly into your bio page.'
    },
    {
      icon: 'bx bx-bar-chart-alt-2',
      title: 'Analytics & QR Codes',
      description: 'Track performance and generate QR codes for easy sharing.'
    },
    {
      icon: 'bx bx-lock-open',
      title: 'Lifetime Ownership',
      description: 'Pay once, own forever. All future updates included!'
    }
  ];

  const faqItems = [
    {
      question: "How does the licensing work?",
      answer: "Our tool is available for a one-time payment of $2.99, which gives you lifetime access and all future updates. No recurring fees or subscriptions!"
    },
    {
      question: "Do I need coding skills to use this tool?",
      answer: "Not at all! Our tool is designed to be user-friendly and requires no coding knowledge. Simply use our intuitive drag-and-drop interface."
    },
    {
      question: "How does this compare to Linktree?",
      answer: "Our tool offers similar functionality to Linktree but with more customization options, no monthly fees, lifetime ownership, and premium features included at no extra cost."
    },
    {
      question: "Can I customize the design?",
      answer: "Yes! You can customize themes, colors, fonts, animations, and layouts. Add your own branding, images, and create a page that truly represents your style."
    },
    {
      question: "Is there a limit on links I can add?",
      answer: "No limits! Add as many links as you need. Organize them however you want, reorder them anytime, and group them into categories."
    }
  ];

  return (
    <S.PageWrapper>
      <S.MainContainer>
        <S.Header>
          <S.BackButton onClick={() => navigate('/tools')}>
            <i className="bx bx-arrow-back"></i>
            Back to Tools
          </S.BackButton>
        </S.Header>

        <S.ContentContainer>
          <S.HeroSection>
            <S.HeroImageContainer>
              <S.HeroImage 
                src="https://64.media.tumblr.com/8efa58296a2a91be37a888d86681f6d7/5abf9011cc81db67-7c/s2048x3072/95458f0c770ecd27b343d7365d47cbd5e8aaa0ff.jpg"
                alt="Link-In-Bio Page Maker"
              />
            </S.HeroImageContainer>

            <S.Title>Link-In-Bio Page Maker</S.Title>
            
            <S.Subtitle>
              Create your ultimate link-in-bio page - no coding required! 
              Build stunning, professional pages that showcase all your content 
              and social media links in one beautiful, customizable landing page.
            </S.Subtitle>

            <S.CTASection>
              <S.GreenButton
                variant="primary"
                size="lg"
                onClick={handleEnterTool}
              >
                <i className="bx bx-right-arrow-alt"></i>
                Enter Link-In-Bio Page Maker
              </S.GreenButton>
              
              <S.CTANote>
                Opens in a new tab • No account required
              </S.CTANote>
            </S.CTASection>
          </S.HeroSection>

          <S.FeaturesSection>
            <S.SectionTitle>Why Choose Our Link-In-Bio Page Maker?</S.SectionTitle>
            <S.FeaturesGrid>
              {features.map((feature, index) => (
                <S.FeatureCard key={index}>
                  <S.FeatureIcon className={feature.icon}></S.FeatureIcon>
                  <S.FeatureTitle>{feature.title}</S.FeatureTitle>
                  <S.FeatureDescription>{feature.description}</S.FeatureDescription>
                </S.FeatureCard>
              ))}
            </S.FeaturesGrid>
          </S.FeaturesSection>

          <S.ValueSection>
            <S.ValueContent>
              <S.ValueBadge>Unbeatable Value</S.ValueBadge>
              <S.ValueTitle>Better Than Linktree</S.ValueTitle>
              <S.ValuePrice>$2.99 <S.ValuePriceNote>one-time</S.ValuePriceNote></S.ValuePrice>
              <S.ValueComparison>
                Instead of $9/month from Linktree, get lifetime access for a one-time payment!
              </S.ValueComparison>
              
              <S.ValueFeatures>
                <S.ValueFeature>
                  <i className="bx bx-check-circle"></i>
                  <span>No monthly fees</span>
                </S.ValueFeature>
                <S.ValueFeature>
                  <i className="bx bx-check-circle"></i>
                  <span>Lifetime ownership</span>
                </S.ValueFeature>
                <S.ValueFeature>
                  <i className="bx bx-check-circle"></i>
                  <span>All future updates</span>
                </S.ValueFeature>
                <S.ValueFeature>
                  <i className="bx bx-check-circle"></i>
                  <span>More customization</span>
                </S.ValueFeature>
              </S.ValueFeatures>

              <S.ValueCTA>
                <S.GreenButton
                  variant="primary"
                  size="lg"
                  onClick={() => window.open('https://austindavenport-shop.fourthwall.com/products/link-in-bio-page-maker', '_blank')}
                >
                  <i className="bx bx-shopping-cart"></i>
                  Get Your License Now
                </S.GreenButton>
              </S.ValueCTA>
            </S.ValueContent>
          </S.ValueSection>

          <S.VideoSection>
            <S.SectionTitle>See It In Action</S.SectionTitle>
            <S.VideoWrapper>
              <iframe
                src="https://www.youtube.com/embed/TMvD8sElvRE"
                title="Link-In-Bio Page Maker Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </S.VideoWrapper>
          </S.VideoSection>

          <S.FAQSection>
            <S.SectionTitle>Frequently Asked Questions</S.SectionTitle>
            <S.FAQList>
              {faqItems.map((item, index) => (
                <S.FAQItem key={index} isOpen={openFAQ === index}>
                  <S.FAQQuestion onClick={() => toggleFAQ(index)}>
                    <span>{item.question}</span>
                    <S.FAQToggle isOpen={openFAQ === index}>+</S.FAQToggle>
                  </S.FAQQuestion>
                  <S.FAQAnswer isOpen={openFAQ === index}>
                    <p>{item.answer}</p>
                  </S.FAQAnswer>
                </S.FAQItem>
              ))}
            </S.FAQList>
          </S.FAQSection>

          <S.FinalCTA>
            <S.FinalCTAContent>
              <S.FinalCTATitle>Ready to Ditch Monthly Fees?</S.FinalCTATitle>
              <S.FinalCTASubtitle>
                Join thousands who've switched from expensive monthly subscriptions to our one-time solution.
              </S.FinalCTASubtitle>
              <S.FinalCTAButtons>
                <S.GreenButton
                  variant="primary"
                  size="lg"
                  onClick={handleEnterTool}
                >
                  <i className="bx bx-right-arrow-alt"></i>
                  Enter The Tool
                </S.GreenButton>
                <S.GreenButton
                  variant="secondary"
                  size="lg"
                  onClick={() => window.open('https://austindavenport-shop.fourthwall.com/products/link-in-bio-page-maker', '_blank')}
                >
                  <i className="bx bx-shopping-cart"></i>
                  Buy License ($2.99)
                </S.GreenButton>
              </S.FinalCTAButtons>
              <S.FinalCTANote>

              </S.FinalCTANote>
            </S.FinalCTAContent>
          </S.FinalCTA>
        </S.ContentContainer>
      </S.MainContainer>
    </S.PageWrapper>
  );
};

export default LinkInBioLanding;