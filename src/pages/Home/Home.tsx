// src/pages/Home/Home.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentMeta } from '../../hooks/useDocumentMeta';
import styled, { keyframes } from 'styled-components';
import { Button } from '../../components/Button/Button';



// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Responsive breakpoints
const breakpoints = {
  xs: '480px',
  sm: '640px', 
  md: '937px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px'
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow-x: hidden;
`;

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.dark2} 0%, ${({ theme }) => theme.colors.dark3} 100%);
  padding-top: 2rem;
  
  @media (max-width: ${breakpoints.xs}) {
    padding-top: 1rem;
    min-height: calc(100vh - 2rem);
  }
  
  @media (max-width: ${breakpoints.md}) {
    padding-top: 2rem;
    min-height: calc(100vh - 1rem);
  }
  
  @media (min-width: ${breakpoints.xl}) {
    padding-top: 3rem;
  }
`;

const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(125, 0, 0, 0.1) 0%, transparent 70%);
  z-index: 1;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 2;

  @media (max-width: ${breakpoints.xs}) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
    padding: 0 1rem;
  }
  
  @media (max-width: ${breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
    padding: 0 1.5rem;
  }
  
  @media (max-width: ${breakpoints.lg}) {
    gap: 3rem;
  }
  
  @media (min-width: ${breakpoints.xl}) {
    max-width: 1400px;
    gap: 5rem;
    padding: 0 3rem;
  }
`;

const HeroContent = styled.div`
  animation: ${fadeInUp} 0.8s ease-out;
`;

const Logo = styled.div`
  margin-bottom: 2rem;
  
  @media (max-width: ${breakpoints.xs}) {
    margin-bottom: 1rem;
  }
  
  @media (max-width: ${breakpoints.md}) {
    margin-bottom: 1.5rem;
  }
`;

const LogoImage = styled.img`
  height: 60px;
  width: auto;
  
  @media (max-width: ${breakpoints.xs}) {
    height: 40px;
  }
  
  @media (max-width: ${breakpoints.md}) {
    height: 50px;
  }
  
  @media (min-width: ${breakpoints.xl}) {
    height: 70px;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  
  @media (max-width: ${breakpoints.xs}) {
    font-size: 1.8rem;
    line-height: 1.2;
    margin-bottom: 0.75rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    font-size: 2rem;
    line-height: 1.2;
    margin-bottom: 1rem;
  }
  
  @media (max-width: ${breakpoints.md}) {
    font-size: 2.4rem;
    line-height: 1.2;
    margin-bottom: 1rem;
  }
  
  @media (max-width: ${breakpoints.lg}) {
    font-size: 3rem;
  }
  
  @media (min-width: ${breakpoints.xl}) {
    font-size: 4rem;
    margin-bottom: 2rem;
  }
`;

const Highlight = styled.span`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 2rem;
  
  @media (max-width: ${breakpoints.xs}) {
    font-size: 1rem;
    margin-bottom: 1rem;
    padding: 0;
    line-height: 1.5;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    font-size: 1.1rem;
    margin-bottom: 1.25rem;
    padding: 0 0.25rem;
  }
  
  @media (max-width: ${breakpoints.md}) {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;
  }
  
  @media (min-width: ${breakpoints.xl}) {
    font-size: 1.375rem;
    margin-bottom: 2.5rem;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;

  @media (max-width: ${breakpoints.xs}) {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    width: 100%;
    
    button {
      width: 100%;
      max-width: 280px;
      min-height: 44px; /* Better touch target */
    }
  }
  
  @media (max-width: ${breakpoints.sm}) {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.75rem;
    
    button {
      min-width: 200px;
      min-height: 44px;
    }
  }

  @media (max-width: ${breakpoints.md}) {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 2rem;
    
    button {
      min-height: 44px;
    }
  }
  
  @media (min-width: ${breakpoints.lg}) {
    gap: 1.25rem;
  }
  
  @media (min-width: ${breakpoints.xl}) {
    gap: 1.5rem;
    margin-bottom: 3.5rem;
  }
`;

const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media (max-width: ${breakpoints.xs}) {
    gap: 0.75rem;
    margin-top: 0.5rem;
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: ${breakpoints.sm}) {
    gap: 1rem;
    margin-top: 0.75rem;
  }
  
  @media (max-width: ${breakpoints.md}) {
    gap: 1rem;
    margin-top: 1rem;
  }
  
  @media (min-width: ${breakpoints.xl}) {
    gap: 3rem;
    margin-top: 1rem;
  }
`;

const HeroStat = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.red4};
  margin-bottom: 0.5rem;
  
  @media (max-width: ${breakpoints.xs}) {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    font-size: 1.75rem;
    margin-bottom: 0.375rem;
  }
  
  @media (min-width: ${breakpoints.xl}) {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.muted};
  
  @media (max-width: ${breakpoints.xs}) {
    font-size: 0.75rem;
    line-height: 1.3;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    font-size: 0.8rem;
  }
  
  @media (min-width: ${breakpoints.xl}) {
    font-size: 1rem;
  }
`;

const HeroVisual = styled.div`
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
  position: relative;

  @media (max-width: ${breakpoints.xs}) {
    margin-top: 1rem;
  }
  
  @media (max-width: ${breakpoints.md}) {
    margin-top: 1.5rem;
  }
`;

const AnalyticsPreview = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.dark3}, ${({ theme }) => theme.colors.dark4});
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  position: relative;
  overflow: hidden;
  animation: ${float} 3s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  }
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const PreviewIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
`;

const PreviewTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};

  &:last-child {
    border-bottom: none;
  }
`;

const MetricLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;


const FeaturesSection = styled.section`
  padding: 6rem 0;
  background: ${({ theme }) => theme.colors.dark1};

  @media (max-width: ${breakpoints.xs}) {
    padding: 2rem 0;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    padding: 3rem 0;
  }
  
  @media (max-width: ${breakpoints.md}) {
    padding: 4rem 0;
  }
  
  @media (min-width: ${breakpoints.xl}) {
    padding: 8rem 0;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const SectionBadge = styled.span`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;

  @media (max-width: ${breakpoints.xs}) {
    font-size: 1.75rem;
    margin-bottom: 0.75rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    font-size: 2rem;
    margin-bottom: 0.875rem;
  }
  
  @media (max-width: ${breakpoints.md}) {
    font-size: 2.25rem;
  }
  
  @media (min-width: ${breakpoints.xl}) {
    font-size: 3rem;
    margin-bottom: 1.5rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.muted};
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  
  @media (max-width: ${breakpoints.xs}) {
    padding: 0 1rem;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    padding: 0 1.5rem;
    grid-template-columns: 1fr;
    gap: 1.75rem;
  }
  
  @media (max-width: ${breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  @media (max-width: ${breakpoints.lg}) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  @media (min-width: ${breakpoints.xl}) {
    max-width: 1400px;
    padding: 0 3rem;
    gap: 2.5rem;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  }
`;

const FeatureCard = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.dark3}, ${({ theme }) => theme.colors.dark4});
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    border-color: ${({ theme }) => theme.colors.red4};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover::before {
    transform: scaleX(1);
  }
`;

const FeatureIcon = styled.div`
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
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${({ theme }) => theme.colors.text.muted};
    margin-bottom: 0.5rem;
    font-size: 0.9rem;

    &::before {
      content: '✓';
      color: ${({ theme }) => theme.colors.success};
      font-weight: bold;
    }
  }
`;

const CTASection = styled.section`
  padding: 6rem 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.dark2} 0%, ${({ theme }) => theme.colors.dark3} 100%);
  text-align: center;
  position: relative;
`;

const CTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const CTATitle = styled.h2`
  font-size: 3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;

  @media (max-width: ${breakpoints.xs}) {
    font-size: 1.75rem;
    margin-bottom: 0.75rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    font-size: 2rem;
    margin-bottom: 0.875rem;
  }
  
  @media (max-width: ${breakpoints.md}) {
    font-size: 2.5rem;
  }
  
  @media (min-width: ${breakpoints.xl}) {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
  }
`;

const CTASubtitle = styled.p`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const CTAButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  border: none;
  padding: 1.25rem 3rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${pulse} 2s ease-in-out infinite;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;

  &:hover {
    box-shadow: 0 20px 40px rgba(185, 28, 28, 0.4);
    animation: none;
  }
`;

// Interactive Learning Path Section - Replaces Educational Section
const LearningPathSection = styled.section`
  padding: 6rem 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.dark3} 0%, ${({ theme }) => theme.colors.dark1} 100%);
  position: relative;
  overflow: hidden;

  @media (max-width: ${breakpoints.xs}) {
    padding: 2rem 0;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    padding: 3rem 0;
  }
  
  @media (max-width: ${breakpoints.md}) {
    padding: 4rem 0;
  }
  
  @media (min-width: ${breakpoints.xl}) {
    padding: 8rem 0;
  }
`;

const PathContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
`;

const LearningPath = styled.div`
  position: relative;
  
  // Connecting line
  &::before {
    content: '';
    position: absolute;
    left: 60px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, 
      ${({ theme }) => theme.colors.red3} 0%, 
      ${({ theme }) => theme.colors.red4} 50%, 
      ${({ theme }) => theme.colors.red5} 100%);
    z-index: 1;
    
    @media (max-width: 768px) {
      left: 30px;
    }
  }
`;

const LearningStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 4rem;
  position: relative;
  z-index: 2;
  
  &:nth-child(even) {
    flex-direction: row-reverse;
    
    @media (max-width: ${breakpoints.md}) {
      flex-direction: row;
    }
  }
  
  @media (max-width: ${breakpoints.xs}) {
    gap: 0.75rem;
    margin-bottom: 2rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    gap: 1rem;
    margin-bottom: 2.25rem;
  }
  
  @media (max-width: ${breakpoints.md}) {
    gap: 1rem;
    margin-bottom: 2.5rem;
  }
  
  @media (min-width: ${breakpoints.xl}) {
    gap: 3rem;
    margin-bottom: 5rem;
  }
`;

const StepIcon = styled.div`
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 20px 40px rgba(125, 0, 0, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    padding: 4px;
    background: linear-gradient(45deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: exclude;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
  }
  
  @media (max-width: ${breakpoints.xs}) {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  @media (max-width: ${breakpoints.md}) {
    width: 80px;
    height: 80px;
    font-size: 1.75rem;
  }
  
  @media (min-width: ${breakpoints.xl}) {
    width: 140px;
    height: 140px;
    font-size: 3rem;
  }
`;

const StepContent = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2.5rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50px;
    width: 0;
    height: 0;
    border: 15px solid transparent;
  }
  
  // Arrow pointing left (for normal steps)
  &::before {
    left: -30px;
    border-right-color: ${({ theme }) => theme.colors.dark5};
  }
  
  // Arrow pointing right (for reversed steps)
  ${LearningStep}:nth-child(even) & {
    &::before {
      left: auto;
      right: -30px;
      border-left-color: ${({ theme }) => theme.colors.dark5};
      border-right-color: transparent;
    }
  }
  
  @media (max-width: ${breakpoints.xs}) {
    padding: 1rem;
    
    &::before {
      left: -10px !important;
      right: auto !important;
      border-right-color: ${({ theme }) => theme.colors.dark5} !important;
      border-left-color: transparent !important;
      border-width: 10px;
    }
  }
  
  @media (max-width: ${breakpoints.md}) {
    padding: 1.5rem;
    
    &::before {
      left: -15px !important;
      right: auto !important;
      border-right-color: ${({ theme }) => theme.colors.dark5} !important;
      border-left-color: transparent !important;
    }
  }
  
  @media (min-width: ${breakpoints.xl}) {
    padding: 3rem;
  }
`;

const StepTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  
  @media (max-width: ${breakpoints.xs}) {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    font-size: 1.4rem;
    margin-bottom: 0.875rem;
  }
  
  @media (max-width: ${breakpoints.md}) {
    font-size: 1.5rem;
  }
  
  @media (min-width: ${breakpoints.xl}) {
    font-size: 2rem;
    margin-bottom: 1.25rem;
  }
`;

const StepDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.7;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
`;

const StepFeatures = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FeatureTag = styled.a`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}20, ${({ theme }) => theme.colors.red4}20);
  border: 1px solid ${({ theme }) => theme.colors.red3}40;
  color: ${({ theme }) => theme.colors.red4};
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-block;
  
  &:hover {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}40, ${({ theme }) => theme.colors.red4}40);
    border-color: ${({ theme }) => theme.colors.red3};
    transform: translateY(-1px);
    color: ${({ theme }) => theme.colors.red5};
  }
`;

// Data Dashboard Science Section - Replaces Science-Based Cards
const DataDashboardSection = styled.section`
  padding: 6rem 0;
  background: ${({ theme }) => theme.colors.dark1};
  position: relative;
`;

const DashboardGrid = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  align-items: center;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const MainDashboard = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.dark3}, ${({ theme }) => theme.colors.dark4});
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  }
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};
`;

const DashboardTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  &::before {
    content: '⚡';
    font-size: 1.2rem;
  }
`;

const LiveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.success};
  font-size: 0.9rem;
  font-weight: 500;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: ${({ theme }) => theme.colors.success};
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: ${({ theme }) => theme.colors.dark2};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.red3};
    transform: translateY(-2px);
  }
`;

const MetricValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.success};

  
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const MetricLabelDash = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const MetricTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${({ theme }) => theme.colors.success};
  font-size: 0.8rem;
  font-weight: 600;
  
  &::before {
    content: '↗';
    font-size: 1rem;
  }
`;

const ChartArea = styled.div`
  height: 200px;
  background: ${({ theme }) => theme.colors.dark2};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(0deg, 
      ${({ theme }) => theme.colors.red3}20 0%,
      ${({ theme }) => theme.colors.red4}10 50%,
      transparent 100%);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 10%;
    width: 80%;
    height: 3px;
    background: linear-gradient(90deg, 
      transparent 0%,
      ${({ theme }) => theme.colors.red3} 20%,
      ${({ theme }) => theme.colors.red4} 40%,
      ${({ theme }) => theme.colors.red5} 60%,
      ${({ theme }) => theme.colors.red4} 80%,
      transparent 100%);
    border-radius: 2px;
  }
`;

const ChartPlaceholder = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
  text-align: center;
  z-index: 2;
  position: relative;
  
  i {
    display: block;
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.red3};
  }
`;

const StatsPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.dark3}, ${({ theme }) => theme.colors.dark4});
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  text-align: center;
  transition: all 0.4s ease;
  
  &:hover {
    transform: scale(1.02);
    border-color: ${({ theme }) => theme.colors.red3};
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  font-size: 1.5rem;
`;

const StatTitle = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const StatDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
`;

const VideoModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const VideoModalBackdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
`;

const VideoModalContent = styled.div`
  position: relative;
  width: 90vw;
  max-width: 1000px;
  height: 56.25vw;
  max-height: 562px;
  background: ${({ theme }) => theme.colors.dark3};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  cursor: default;
  z-index: 1001;

  @media (max-width: ${breakpoints.xs}) {
    width: 98vw;
    height: 55vw;
    max-height: 300px;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    width: 95vw;
    height: 53.4vw;
    max-height: 400px;
  }
  
  @media (max-width: ${breakpoints.md}) {
    width: 92vw;
    height: 51.75vw;
  }
`;

const VideoModalClose = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  z-index: 1002;
  padding: 0.5rem;
  transition: color 0.2s ease;
  min-height: 44px;
  min-width: 44px;

  &:hover {
    color: ${({ theme }) => theme.colors.red4};
  }

  @media (max-width: ${breakpoints.xs}) {
    top: -60px;
    right: -10px;
    font-size: 1.25rem;
    padding: 0.75rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    top: -50px;
    right: -10px;
    font-size: 1.5rem;
  }
`;

const VideoPlayer = styled.div`
  width: 100%;
  height: 100%;
  
  iframe {
    border: none;
  }
`;

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentMetric, setCurrentMetric] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const metrics = [
    { label: 'Channel Growth', value: '+127%', trend: 'up' },
    { label: 'Engagement Rate', value: '8.4%', trend: 'up' },
    { label: 'Video Performance', value: '94/100', trend: 'up' },
    { label: 'SEO Score', value: 'A+', trend: 'up' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % metrics.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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

  const features = [
    {
      icon: 'bx bx-line-chart',
      title: 'Deep Analytics',
      description: 'Understand your channel performance with comprehensive analytics that reveal what\'s working and what isn\'t.',
      features: ['Video performance tracking', 'Engagement analysis', 'Audience insights', 'Growth patterns']
    },
    {
      icon: 'bx bx-search-alt',
      title: 'SEO Optimization',
      description: 'Discover the keywords and strategies that will help your content get discovered by the right audience.',
      features: ['Keyword research', 'Tag optimization', 'Title analysis', 'Competitor insights']
    },
    {
      icon: 'bx bx-trophy',
      title: 'Success Patterns',
      description: 'Learn from viral videos and successful channels to replicate winning strategies in your own content.',
      features: ['Viral video analysis', 'Trend identification', 'Content gaps', 'Opportunity discovery']
    },

  ];

  return (
    <Container>
      {/* React 19 Native Metadata Support */}
      <DocumentMeta
        title="YouTool.io - Free YouTube Tools for Creators"
        description="Professional-grade YouTube tools to help you analyze, optimize, and grow your channel. Video analytics, SEO tools, thumbnail testing, and more."
        keywords="YouTube tools, YouTube analytics, video SEO, thumbnail tester, channel analyzer, YouTube growth, free YouTube tools, video optimization"
        canonical="https://youtool.io/"
        ogTitle="YouTool.io - Free YouTube Tools for Creators"
        ogDescription="Professional-grade YouTube tools to help you analyze, optimize, and grow your channel."
        ogImage="https://youtool.io/og-image.jpg"
        twitterTitle="YouTool.io - Free YouTube Tools for Creators"
        twitterDescription="Professional-grade YouTube tools to help you analyze, optimize, and grow your channel."
        twitterImage="https://youtool.io/twitter-image.jpg"
      />
      {/* Hero Section */}
      <HeroSection>
        <HeroBackground />
        <ContentWrapper>
          <HeroContent>
            <Logo>
              <LogoImage
                src="/images/logo.png"
                alt="YouTool Logo"
              />
            </Logo>

            <HeroTitle>
          <Highlight>Accelerate Your YouTube Growth.</Highlight>
            </HeroTitle>

            <HeroSubtitle>
                Professional-grade analytics and optimization tools that help you understand your audience, 
            improve your content, and grow your channel faster.
            </HeroSubtitle>

            <HeroButtons>
              <Button
                variant="primary"
                size="lg"
                icon="bx bx-wrench"
                onClick={() => navigate('/tools')}
              >
                View Tools
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon="bx bx-play"
                onClick={() => setShowVideoModal(true)}
              >
                See How It Works
              </Button>
            </HeroButtons>

            <HeroStats>
              <HeroStat>
                <StatNumber>15+</StatNumber>
                <StatLabel>Analytics Tools</StatLabel>
              </HeroStat>
              <HeroStat>
                <StatNumber>50K+</StatNumber>
                <StatLabel>Videos Analyzed</StatLabel>
              </HeroStat>
                            <HeroStat>
                <StatNumber>1K+</StatNumber>
                <StatLabel>Creators Helped</StatLabel>
              </HeroStat>
            </HeroStats>
          </HeroContent>

          <HeroVisual>
            <AnalyticsPreview>
              <PreviewHeader>
                <PreviewIcon>
                  <i className="bx bx-chart"></i>
                </PreviewIcon>
                <PreviewTitle>Example Channel Analytics</PreviewTitle>
              </PreviewHeader>
              
              {metrics.map((metric, index) => (
                <MetricRow key={index} style={{ opacity: index === currentMetric ? 1 : 0.6 }}>
                  <MetricLabel>{metric.label}</MetricLabel>
                  <MetricValue>{metric.value}</MetricValue>
                </MetricRow>
              ))}
            </AnalyticsPreview>
          </HeroVisual>
        </ContentWrapper>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection>
        <SectionHeader>
          <SectionBadge>Why Creators Choose YouTool</SectionBadge>
          <SectionTitle>Everything You Need to Succeed on YouTube</SectionTitle>
          <SectionSubtitle>
              Get deep insights into your YouTube performance with professional-grade analytics tools. 
          </SectionSubtitle>
        </SectionHeader>

        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>
                <i className={feature.icon}></i>
              </FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <FeatureList>
                {feature.features.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </FeatureList>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeaturesSection>


      {/* Interactive Learning Path Section - Replaces Educational Section */}
      <LearningPathSection>
        <SectionHeader>
          <SectionBadge>Interactive Learning Path</SectionBadge>
          <SectionTitle>Master YouTube Analytics in 3 Steps</SectionTitle>
          <SectionSubtitle>
            Learn and utilize our tools to transform your channel from guesswork to data-driven growth.
            Each step builds on the previous, creating a comprehensive optimization strategy.
          </SectionSubtitle>
        </SectionHeader>

        <PathContainer>
          <LearningPath>
            <LearningStep>
              <StepIcon>
                <i className="bx bx-search-alt"></i>
              </StepIcon>
              <StepContent>
                <StepTitle>Analyze & Understand</StepTitle>
                <StepDescription>
                  Deep-dive into your current performance to identify what's working, what isn't, 
                  and where your biggest opportunities lie. 
                </StepDescription>
                <StepFeatures>
                  <FeatureTag href="/tools/channel-analyzer">Channel Analyzer</FeatureTag>
                  <FeatureTag href="/tools/video-analyzer">Video Analyzer</FeatureTag>
                  <FeatureTag href="/tools/keyword-analyzer">Keyword Analyzer</FeatureTag>
                  <FeatureTag href="/tools/outlier-finder">Outlier Finder</FeatureTag>
                  <FeatureTag href="/tools/comment-downloader">Comment Downloader</FeatureTag>
                </StepFeatures>
              </StepContent>
            </LearningStep>

            <LearningStep>
              <StepIcon>
                <i className="bx bx-target-lock"></i>
              </StepIcon>
              <StepContent>
                <StepTitle>Optimize & Execute</StepTitle>
                <StepDescription>
                  Implement data-driven improvements to your content strategy. 
                </StepDescription>
                <StepFeatures>
                  <FeatureTag href="/tools/channel-consultant">Channel Consultant</FeatureTag>
                  <FeatureTag href="/tools/tag-generator">Tag Generator</FeatureTag>
                  <FeatureTag href="/tools/thumbnail-tester">Thumbnail Tester</FeatureTag>
                </StepFeatures>
              </StepContent>
            </LearningStep>

            <LearningStep>
              <StepIcon>
                <i className="bx bx-trending-up"></i>
              </StepIcon>
              <StepContent>
                <StepTitle>Scale & Accelerate</StepTitle>
                <StepDescription>
                  Upgrade your workflow using YouTool, by utilizing new tools to help develope your channel and brand. 
                </StepDescription>
                <StepFeatures>
                  <FeatureTag href="/tools/qr-code-generator">QR Code Generator</FeatureTag>
                  <FeatureTag href="/tools/thumbnail-downloader">Thumbnail Downloader</FeatureTag>
                  <FeatureTag href="/tools/subscribe-link-generator">Subscribe Link Generator</FeatureTag>
                  <FeatureTag href="/tools/color-picker-from-image">Color Picker</FeatureTag>
                </StepFeatures>
              </StepContent>
            </LearningStep>
          </LearningPath>
        </PathContainer>
      </LearningPathSection>

      {/* CTA Section */}
      <CTASection>
        <CTAContent>
          <CTATitle>Ready to Grow Your Channel?</CTATitle>
          <CTASubtitle>
            Join thousands of successful creators who use YouTool to understand their performance, 
            optimize their content, and achieve their YouTube goals. Start analyzing your channel today.
          </CTASubtitle>
          <CTAButton onClick={() => navigate('/tools')}>
            <i className="bx bxs-wrench"></i>
            Use Our Tools
          </CTAButton>
        </CTAContent>
      </CTASection>

      {/* Video Modal */}
      {showVideoModal && (
        <VideoModal onClick={() => setShowVideoModal(false)}>
          <VideoModalBackdrop />
          <VideoModalContent onClick={(e) => e.stopPropagation()}>
            <VideoModalClose onClick={() => setShowVideoModal(false)}>
              <i className="bx bx-x"></i>
            </VideoModalClose>
            <VideoPlayer>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/m02ZZL-EWg0?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&iv_load_policy=3"
                title="YouTool Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </VideoPlayer>
          </VideoModalContent>
        </VideoModal>
      )}
    </Container>
  );
};