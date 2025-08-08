// src/pages/Company/Blog.tsx
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
  max-width: 1000px;
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
  margin: 0 auto;
`;

const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BlogPost = styled.article`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  height: fit-content;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.red4};
  }
`;

const PostImage = styled.div`
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const PostDate = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PostCategory = styled.span`
  background: ${({ theme }) => theme.colors.red4};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const PostTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.75rem;
  line-height: 1.3;
`;

const PostExcerpt = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ReadMoreLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.red4};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.red5};
  }

  i {
    transition: transform 0.2s ease;
  }

  &:hover i {
    transform: translateX(3px);
  }
`;

const ComingSoon = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 3rem 2rem;
  text-align: center;
  margin-top: 2rem;

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.muted};
    margin-bottom: 1.5rem;
  }
`;

const SubscribeButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

export const Blog: React.FC = () => {
  const navigate = useNavigate();

  const blogPosts = [
    {
      id: 1,
      title: "10 YouTube Analytics Metrics Every Creator Should Track in 2025",
      excerpt: "Discover the most important metrics that successful YouTubers monitor to grow their channels. From watch time to audience retention, learn which data points matter most for your content strategy.",
      category: "Analytics",
      date: "July 15, 2025",
      icon: "bx-chart",
      slug: "youtube-analytics-metrics-2025"
    },
    {
      id: 2,
      title: "How to Optimize Your YouTube Videos for Discoverability",
      excerpt: "Master the art of YouTube SEO with these proven strategies. Learn how to research keywords, craft compelling titles, and optimize your descriptions to get more views and subscribers.",
      category: "SEO",
      date: "July 8, 2025",
      icon: "bx-search-alt",
      slug: "youtube-seo-optimization-guide"
    },
    {
      id: 3,
      title: "Understanding the YouTube Algorithm in 2025: A Creator's Complete Guide",
      excerpt: "Dive deep into how YouTube's algorithm actually works and learn proven strategies to optimize your content for better reach, engagement, and sustainable growth.",
      category: "Algorithm",
      date: "August 5, 2025",
      icon: "bx-brain",
      slug: "youtube-algorithm-2025"
    },
    {
      id: 4,
      title: "The Complete Guide to YouTube Thumbnails That Get Clicks",
      excerpt: "Master the art and science of creating compelling thumbnails that stand out and drive clicks. Learn design principles, psychology, and testing strategies that work.",
      category: "Design",
      date: "August 3, 2025",
      icon: "bx-image",
      slug: "youtube-thumbnail-guide"
    },
    {
      id: 5,
      title: "Complete Guide to YouTube Monetization in 2025",
      excerpt: "Explore every monetization method available to creators, from the YouTube Partner Program to advanced revenue strategies that build sustainable income streams.",
      category: "Monetization",
      date: "August 1, 2025",
      icon: "bx-dollar-circle",
      slug: "youtube-monetization-2025"
    },
    {
      id: 6,
      title: "Building a YouTube Content Strategy That Drives Long-Term Growth",
      excerpt: "Develop a comprehensive content strategy that builds loyal audiences and drives sustainable channel success through strategic planning and execution.",
      category: "Strategy",
      date: "July 28, 2025",
      icon: "bx-target-lock",
      slug: "youtube-content-strategy"
    },
    {
      id: 7,
      title: "15 Proven YouTube Growth Hacks That Actually Work in 2025",
      excerpt: "Discover specific strategies and techniques that successful creators use to accelerate growth, improve discoverability, and build engaged communities.",
      category: "Growth",
      date: "July 25, 2025",
      icon: "bx-trending-up",
      slug: "youtube-growth-hacks"
    }
  ];

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>YouTool Blog</Title>
          <Subtitle>
            Insights, tips, and strategies to help you grow your YouTube channel and succeed as a content creator.
          </Subtitle>
        </Header>

        <BlogGrid>
          {blogPosts.map((post) => (
            <BlogPost key={post.id} onClick={() => navigate(`/blog/${post.slug}`)}>
              <PostImage>
                <i className={`bx ${post.icon}`}></i>
              </PostImage>
              
              <PostMeta>
                <PostDate>
                  <i className="bx bx-calendar"></i>
                  {post.date}
                </PostDate>
                <PostCategory>{post.category}</PostCategory>
              </PostMeta>
              
              <PostTitle>{post.title}</PostTitle>
              <PostExcerpt>{post.excerpt}</PostExcerpt>
              
              <ReadMoreLink onClick={(e) => { e.stopPropagation(); navigate(`/blog/${post.slug}`); }}>
                Read Full Article
                <i className="bx bx-right-arrow-alt"></i>
              </ReadMoreLink>
            </BlogPost>
          ))}
        </BlogGrid>
      </ContentWrapper>
    </Container>
  );
};