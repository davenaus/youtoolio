// src/pages/Company/Partnerships.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 2rem 0;
`;

const ContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
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
  margin-bottom: 2rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  i {
    font-size: 1.2rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.muted};
  line-height: 1.6;
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  margin-bottom: 2rem;

  h2 {
    color: ${({ theme }) => theme.colors.red4};
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    i {
      font-size: 1.5rem;
    }
  }

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.3rem;
    font-weight: 600;
    margin: 1.5rem 0 1rem 0;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.7;
    margin-bottom: 1rem;
  }

  ul {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.6;
    padding-left: 1.5rem;
    margin-bottom: 1rem;

    li {
      margin-bottom: 0.5rem;
    }
  }
`;

const PartnerTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const PartnerTypeCard = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: ${({ theme }) => theme.colors.red4};
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .partner-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    color: white;
    font-size: 1.5rem;
  }

  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  ul {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.9rem;
    
    li {
      margin-bottom: 0.5rem;
      
      &::before {
        content: '✓';
        color: ${({ theme }) => theme.colors.success};
        font-weight: bold;
        margin-right: 0.5rem;
      }
    }
  }
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const BenefitCard = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1.5rem;
  text-align: center;

  .benefit-icon {
    width: 50px;
    height: 50px;
    background: ${({ theme }) => theme.colors.red3};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem auto;
    color: white;
    font-size: 1.2rem;
  }

  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
  }
`;

const CTASection = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red1}, ${({ theme }) => theme.colors.red2});
  border: 1px solid ${({ theme }) => theme.colors.red3};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2.5rem;
  text-align: center;

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.1rem;
    margin-bottom: 2rem;
    line-height: 1.6;
  }
`;

const ContactButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  border: none;
  padding: 1.25rem 2.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 auto;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(185, 28, 28, 0.4);
  }

  i {
    font-size: 1.3rem;
  }
`;

export const Partnerships: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>Partnerships</Title>
          <Subtitle>
            Collaborate with YouTool to help creators succeed. Let's grow the creator economy together.
          </Subtitle>
        </Header>

        <Section>
          <h2>
            <i className="bx bx-handshake"></i>
            Partner With Us
          </h2>
          <p>
            We're always looking for meaningful partnerships that benefit the creator community. 
            Whether you're an influencer, educator, tool developer, or platform, we'd love to 
            explore how we can work together to support creators worldwide.
          </p>
          
          <h3>Our Partnership Philosophy</h3>
          <p>
            We believe in partnerships that create genuine value for creators, not just revenue. 
            Our ideal partners share our commitment to transparency, creator empowerment, and 
            building tools that actually help people succeed on YouTube.
          </p>
        </Section>

        <Section>
          <h2>
            <i className="bx bx-group"></i>
            Who We're Looking For
          </h2>

          <PartnerTypeGrid>
            <PartnerTypeCard>
              <div className="partner-icon">
                <i className="bx bx-star"></i>
              </div>
              <h4>Content Creators & Influencers</h4>
              <p>
                YouTube creators, educators, and influencers who want to help their audience 
                understand analytics and grow their channels.
              </p>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                <li>YouTube educators and "how-to" creators</li>
                <li>Marketing and business influencers</li>
                <li>Tech reviewers and tool testers</li>
                <li>Creator economy focused content makers</li>
              </ul>
            </PartnerTypeCard>

            <PartnerTypeCard>
              <div className="partner-icon">
                <i className="bx bx-code-alt"></i>
              </div>
              <h4>Developer & Tool Platforms</h4>
              <p>
                Platforms, APIs, and tools that complement our analytics suite and serve 
                the creator community.
              </p>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                <li>Video editing and production tools</li>
                <li>Creator management platforms</li>
                <li>Social media scheduling tools</li>
                <li>Analytics and data platforms</li>
              </ul>
            </PartnerTypeCard>

            <PartnerTypeCard>
              <div className="partner-icon">
                <i className="bx bx-building"></i>
              </div>
              <h4>Educational Institutions</h4>
              <p>
                Schools, universities, and training programs teaching digital marketing, 
                content creation, or entrepreneurship.
              </p>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                <li>Digital marketing programs</li>
                <li>Film and media schools</li>
                <li>Business and entrepreneurship courses</li>
                <li>Online learning platforms</li>
              </ul>
            </PartnerTypeCard>

            <PartnerTypeCard>
              <div className="partner-icon">
                <i className="bx bx-store"></i>
              </div>
              <h4>Creator Service Businesses</h4>
              <p>
                Agencies, consultants, and service providers who help creators grow and 
                optimize their YouTube presence.
              </p>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                <li>YouTube growth agencies</li>
                <li>Content strategy consultants</li>
                <li>Thumbnail and design services</li>
                <li>Creator coaching businesses</li>
              </ul>
            </PartnerTypeCard>
          </PartnerTypeGrid>
        </Section>

        <Section>
          <h2>
            <i className="bx bx-gift"></i>
            Partnership Benefits
          </h2>
          <p>
            We offer various partnership benefits depending on the type and scope of collaboration:
          </p>

          <BenefitsGrid>
            <BenefitCard>
              <div className="benefit-icon">
                <i className="bx bx-share-alt"></i>
              </div>
              <h4>Co-Marketing</h4>
              <p>Joint content creation, cross-promotion, and shared marketing initiatives.</p>
            </BenefitCard>

            <BenefitCard>
              <div className="benefit-icon">
                <i className="bx bx-data"></i>
              </div>
              <h4>Early Access</h4>
              <p>Get early access to new features and tools before they're publicly released.</p>
            </BenefitCard>

            <BenefitCard>
              <div className="benefit-icon">
                <i className="bx bx-support"></i>
              </div>
              <h4>Dedicated Support</h4>
              <p>Priority support and direct communication with our team for collaboration needs.</p>
            </BenefitCard>

            <BenefitCard>
              <div className="benefit-icon">
                <i className="bx bx-network-chart"></i>
              </div>
              <h4>Integration Opportunities</h4>
              <p>Explore API integrations and technical partnerships for complementary tools.</p>
            </BenefitCard>

            <BenefitCard>
              <div className="benefit-icon">
                <i className="bx bx-trophy"></i>
              </div>
              <h4>Recognition</h4>
              <p>Featured partner status and recognition in our community and marketing materials.</p>
            </BenefitCard>

            <BenefitCard>
              <div className="benefit-icon">
                <i className="bx bx-brain"></i>
              </div>
              <h4>Insights Sharing</h4>
              <p>Exchange insights about creator trends, best practices, and industry developments.</p>
            </BenefitCard>
          </BenefitsGrid>
        </Section>

        <Section>
          <h2>
            <i className="bx bx-check-shield"></i>
            What We Value in Partners
          </h2>
          <ul>
            <li><strong>Creator-First Mindset:</strong> Genuine commitment to helping creators succeed</li>
            <li><strong>Quality Focus:</strong> High standards for user experience and value delivery</li>
            <li><strong>Transparency:</strong> Open, honest communication and ethical business practices</li>
            <li><strong>Innovation:</strong> Interest in pushing boundaries and improving creator tools</li>
            <li><strong>Community Building:</strong> Active engagement with and support of creator communities</li>
            <li><strong>Long-term Vision:</strong> Interest in sustainable, mutually beneficial relationships</li>
          </ul>
        </Section>

        <CTASection>
          <h3>Ready to Partner?</h3>
          <p>
            If you're interested in exploring a partnership with YouTool, we'd love to hear from you. 
            Tell us about your vision, how you serve creators, and what kind of collaboration you're 
            interested in.
          </p>
          <ContactButton onClick={() => window.open('mailto:youtool.io.business@gmail.com?subject=Partnership Opportunity')}>
            <i className="bx bx-envelope"></i>
            Start the Conversation
          </ContactButton>
        </CTASection>
      </ContentWrapper>
    </Container>
  );
};
