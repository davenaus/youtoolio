// src/pages/Company/HelpCenter.tsx
import React, { useState } from 'react';
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

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
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
  max-width: 600px;
  margin: 0 auto 2rem auto;
`;

const SearchBox = styled.div`
  position: relative;
  max-width: 500px;
  margin: 0 auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-family: inherit;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
    font-family: inherit;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.red4};
  }
`;

const SearchIcon = styled.i`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 1.2rem;
`;

const FAQSection = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.red4};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  i {
    font-size: 1.3rem;
  }
`;

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FAQItem = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.red4};
  }
`;

const FAQQuestion = styled.button<{ isOpen: boolean }>`
  width: 100%;
  padding: 1.5rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
  }

  i {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.red4};
    transform: ${({ isOpen }) => isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: transform 0.2s ease;
  }
`;

const FAQAnswer = styled.div<{ isOpen: boolean }>`
  padding: ${({ isOpen }) => isOpen ? '0 1.5rem 1.5rem 1.5rem' : '0 1.5rem'};
  max-height: ${({ isOpen }) => isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;

  p {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  a {
    color: ${({ theme }) => theme.colors.red4};
    text-decoration: underline;

    &:hover {
      color: ${({ theme }) => theme.colors.red5};
    }
  }
`;

const ContactSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  text-align: center;
  margin-top: 3rem;

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 1.5rem;
  }
`;

const ContactButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;

  &:hover {
    transform: translateY(-2px);
  }
`;

export const HelpCenter: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqData = [
    {
      category: 'Getting Started',
      icon: 'bx-rocket',
      questions: [
        {
          question: 'How do I analyze my YouTube video?',
          answer: 'Simply copy your YouTube video URL and paste it into our Video Analyzer tool. Our system will automatically fetch and analyze all available public data including views, engagement, tags, and performance metrics. You\'ll get detailed insights about your video\'s performance and recommendations for improvement.'
        },
        {
          question: 'Do I need to create an account to use YouTool?',
          answer: 'No account required! All our tools are completely free and can be used without any registration. Simply visit our tools page and start analyzing your YouTube content immediately. Your search history is saved locally in your browser for convenience.'
        },
        {
          question: 'Is YouTool really free forever?',
          answer: 'Yes! YouTool is 100% free and always will be. We believe in supporting the YouTube creator community by providing professional-grade analytics tools at no cost. Our platform is supported by ethical advertising that doesn\'t interfere with your experience.'
        }
      ]
    },
    {
      category: 'Tools & Features',
      icon: 'bx-wrench',
      questions: [
        {
          question: 'What tools are available on YouTool?',
          answer: 'We offer 15+ professional tools including Video Analyzer, Channel Analyzer, Keyword Analyzer, Tag Generator, Thumbnail Tester, Outlier Finder, Comment Analyzer, Playlist Analyzer, and many more. Each tool is designed to help you understand and optimize different aspects of your YouTube presence.'
        },
        {
          question: 'How accurate is the analytics data?',
          answer: 'Our data comes directly from YouTube\'s official API, ensuring maximum accuracy. However, some metrics may have slight delays as YouTube updates their systems. We retrieve all publicly available data and present it in an easy-to-understand format with actionable insights.'
        },
        {
          question: 'Can I analyze any YouTube channel or video?',
          answer: 'You can analyze any public YouTube content. Private or unlisted videos cannot be analyzed as they\'re not accessible through YouTube\'s public API. Simply paste any public YouTube URL and our tools will provide comprehensive analytics and insights.'
        }
      ]
    },
    {
      category: 'Data & Privacy',
      icon: 'bx-shield-check',
      questions: [
        {
          question: 'Do you store my YouTube data?',
          answer: 'We don\'t permanently store your YouTube data. When you analyze content, we fetch the data in real-time from YouTube\'s API and display it to you immediately. Only your search history is saved locally in your browser for your convenience. Read our Privacy Policy for complete details.'
        },
        {
          question: 'Is my data safe and secure?',
          answer: 'Absolutely! We only access publicly available YouTube data through official APIs. We never ask for your YouTube login credentials or access private information. All data transmission is encrypted via HTTPS, and we follow strict privacy practices outlined in our Privacy Policy.'
        },
        {
          question: 'Can I delete my search history?',
          answer: 'Yes! Your search history is stored locally in your browser. You can clear it anytime through your browser settings or by using the "Clear Data" option in our Cookie Policy page. We also provide tools to manage your data preferences.'
        }
      ]
    },
    {
      category: 'Technical Support',
      icon: 'bx-support',
      questions: [
        {
          question: 'Why isn\'t my video/channel loading?',
          answer: 'This usually happens if the content is private, deleted, or if there\'s a temporary issue with YouTube\'s API. Make sure the URL is correct and the content is public. If the issue persists, try again in a few minutes or contact our support team.'
        },
        {
          question: 'The tool shows an error message. What should I do?',
          answer: 'Most errors are temporary and resolve quickly. Try refreshing the page or waiting a few minutes before trying again. If you continue experiencing issues, please contact us at youtool.io.business@gmail.com with details about the error and the URL you were trying to analyze.'
        },
        {
          question: 'Do your tools work on mobile devices?',
          answer: 'Yes! All our tools are fully responsive and work great on mobile devices, tablets, and desktops. The interface adapts to your screen size for the best possible experience regardless of your device.'
        }
      ]
    }
  ];

  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleFAQ = (categoryIndex: number, questionIndex: number) => {
    const faqId = categoryIndex * 100 + questionIndex;
    setOpenFAQ(openFAQ === faqId ? null : faqId);
  };

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>Help Center</Title>
          <Subtitle>
            Find answers to common questions about YouTool's features, tools, and best practices.
          </Subtitle>
          
          <SearchBox>
            <SearchIcon className="bx bx-search" />
            <SearchInput
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBox>
        </Header>

        {filteredFAQs.map((category, categoryIndex) => (
          <FAQSection key={categoryIndex}>
            <SectionTitle>
              <i className={`bx ${category.icon}`}></i>
              {category.category}
            </SectionTitle>
            
            <FAQList>
              {category.questions.map((faq, questionIndex) => {
                const faqId = categoryIndex * 100 + questionIndex;
                const isOpen = openFAQ === faqId;
                
                return (
                  <FAQItem key={questionIndex}>
                    <FAQQuestion
                      isOpen={isOpen}
                      onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                    >
                      {faq.question}
                      <i className="bx bx-chevron-down"></i>
                    </FAQQuestion>
                    
                    <FAQAnswer isOpen={isOpen}>
                      <p>{faq.answer}</p>
                    </FAQAnswer>
                  </FAQItem>
                );
              })}
            </FAQList>
          </FAQSection>
        ))}

        <ContactSection>
          <h3>Still Need Help?</h3>
          <p>
            Can't find what you're looking for? Our team is here to help! 
            Send us an email and we'll get back to you as soon as possible.
          </p>
          <ContactButton onClick={() => window.open('mailto:youtool.io.business@gmail.com?subject=Help Center Support Request')}>
            <i className="bx bx-envelope"></i>
            Contact Support
          </ContactButton>
        </ContactSection>
      </ContentWrapper>
    </Container>
  );
};