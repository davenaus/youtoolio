// src/pages/Tools/components/ModerationChecker/ModerationChecker.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdSense } from '../../../../components/AdSense/AdSense';
import * as S from './styles';

interface ModerationResult {
  overallScore: number;
  riskLevel: 'Safe' | 'Low Risk' | 'Medium Risk' | 'High Risk';
  categories: {
    profanity: { score: number; detected: string[]; severity: string };
    toxicity: { score: number; confidence: number; severity: string };
    spam: { score: number; indicators: string[]; severity: string };
    violence: { score: number; detected: string[]; severity: string };
    hate: { score: number; detected: string[]; severity: string };
    sexual: { score: number; detected: string[]; severity: string };
  };
  suggestions: string[];
  cleanedText: string;
  flaggedWords: { word: string; category: string; severity: string }[];
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
    overall: 'positive' | 'negative' | 'neutral';
  };
}

export const ModerationChecker: React.FC = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'title' | 'description' | 'comment' | 'general'>('title');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ModerationResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<{ content: string; type: string; timestamp: number }[]>([]);

  // Load analysis history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('moderation_history');
    if (history) {
      setAnalysisHistory(JSON.parse(history));
    }
  }, []);

  const saveToHistory = (content: string, type: string) => {
    const newHistory = [
      { content, type, timestamp: Date.now() },
      ...analysisHistory.filter(h => h.content !== content)
    ].slice(0, 5);
    setAnalysisHistory(newHistory);
    localStorage.setItem('moderation_history', JSON.stringify(newHistory));
  };

  // Helper function to check for whole words only
  const containsWholeWord = (text: string, word: string): boolean => {
    // Create a regex pattern that matches the word with word boundaries
    // \b ensures we match whole words only, not substrings
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    return regex.test(text);
  };

  // Helper function to find all instances of a word (for counting/highlighting)
  const findWholeWordMatches = (text: string, word: string): string[] => {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[0]); // Push the actual matched text (preserves case)
    }
    return matches;
  };

  const analyzeContent = async () => {
    if (!content.trim()) {
      alert('Please enter some content to analyze');
      return;
    }

    setIsAnalyzing(true);
    setShowResults(false);

    try {
      // Generate flagged words based on actual content analysis
      const mockFlaggedWords: { word: string; category: string; severity: string }[] = [];
      
      // More reasonable word lists for client-side moderation
      const profanityWords = [
        // Only actual profanity, not mild words
        'shit', 'bullshit', 'asshole', 'bitch', 'wtf', 'bastard',
        // Strong profanity
        'fuck', 'fucking', 'fucked', 'fucker', 'motherfucker', 'cocksucker', 'dickhead', 'whore', 'slut', 'cunt'
      ];
      
      const spamIndicators = [
        'click here now', 'subscribe now', 'like and subscribe', 'smash that like button', 'hit the bell', 'notification squad',
        'first comment', 'early squad', 'free money', 'make money fast', 'get rich quick',
        'work from home', 'visit my profile', 'check my channel', 'follow for follow', 'sub for sub',
        'subscribe to me', 'click the link', 'link in bio'
      ];
      
      const violenceWords = [
        // Only serious violence, not casual words
        'kill him', 'kill her', 'kill you', 'murder', 'suicide', 'hang yourself', 'shoot you', 'stab you',
        'bomb', 'explosive', 'massacre', 'slaughter', 'torture', 'assassinate'
      ];
      
      const hateWords = [
        // Only actual hate speech, not descriptive words
        'racist', 'racism', 'nazi', 'hitler', 'terrorist', 'fag', 'faggot',
        'retard', 'retarded', 'worthless', 'pathetic', 'disgusting'
      ];
      
      const sexualWords = [
        // Only explicit sexual content
        'porn', 'pornography', 'nude', 'naked', 'masturbate', 'orgasm', 'climax', 'erotic',
        'xxx', 'nsfw', 'boobs', 'tits', 'penis', 'vagina', 'anal sex', 'oral sex', 'blowjob', 'handjob', 'onlyfans'
      ];
      
      const drugWords = [
        // Only actual drug references
        'cocaine', 'heroin', 'meth', 'methamphetamine', 'crack cocaine', 'ecstasy', 'lsd', 'ketamine'
      ];
      
      // Check for profanity using whole word matching
      profanityWords.forEach(word => {
        if (containsWholeWord(content, word)) {
          let severity = 'medium';
          if (['fuck', 'fucking', 'fucked', 'motherfucker', 'cunt'].includes(word.toLowerCase())) severity = 'high';
          else if (['shit', 'bullshit', 'asshole', 'bitch'].includes(word.toLowerCase())) severity = 'medium';
          
          // Find the actual matches to preserve original case
          const matches = findWholeWordMatches(content, word);
          matches.forEach(match => {
            mockFlaggedWords.push({ word: match, category: 'profanity', severity });
          });
        }
      });
      
      // Check for spam indicators
      spamIndicators.forEach(phrase => {
        if (containsWholeWord(content, phrase)) {
          let severity = 'medium';
          if (['free money', 'make money fast', 'get rich quick'].includes(phrase.toLowerCase())) severity = 'high';
          else if (['click here now', 'link in bio', 'check my channel'].includes(phrase.toLowerCase())) severity = 'low';
          
          const matches = findWholeWordMatches(content, phrase);
          matches.forEach(match => {
            mockFlaggedWords.push({ word: match, category: 'spam', severity });
          });
        }
      });
      
      // Check for violence
      violenceWords.forEach(word => {
        if (containsWholeWord(content, word)) {
          let severity = 'high'; // Most violence words should be high severity
          if (['bomb', 'explosive', 'massacre', 'torture', 'assassinate'].includes(word.toLowerCase())) severity = 'high';
          else if (['kill him', 'kill her', 'murder', 'suicide'].includes(word.toLowerCase())) severity = 'high';
          
          const matches = findWholeWordMatches(content, word);
          matches.forEach(match => {
            mockFlaggedWords.push({ word: match, category: 'violence', severity });
          });
        }
      });
      
      // Check for hate speech
      hateWords.forEach(word => {
        if (containsWholeWord(content, word)) {
          let severity = 'high'; // Hate speech should be high severity
          if (['racist', 'nazi', 'fag', 'faggot', 'terrorist'].includes(word.toLowerCase())) severity = 'high';
          else if (['retarded', 'worthless', 'pathetic'].includes(word.toLowerCase())) severity = 'medium';
          
          const matches = findWholeWordMatches(content, word);
          matches.forEach(match => {
            mockFlaggedWords.push({ word: match, category: 'hate', severity });
          });
        }
      });
      
      // Check for sexual content
      sexualWords.forEach(word => {
        if (containsWholeWord(content, word)) {
          let severity = 'high'; // Most sexual content should be high severity
          if (['porn', 'pornography', 'xxx', 'masturbate', 'orgasm'].includes(word.toLowerCase())) severity = 'high';
          else if (['nude', 'naked', 'erotic'].includes(word.toLowerCase())) severity = 'medium';
          
          const matches = findWholeWordMatches(content, word);
          matches.forEach(match => {
            mockFlaggedWords.push({ word: match, category: 'sexual', severity });
          });
        }
      });
      
      // Check for drug references
      drugWords.forEach(word => {
        if (containsWholeWord(content, word)) {
          let severity = 'high'; // Hard drugs should be high severity
          if (['cocaine', 'heroin', 'meth', 'methamphetamine', 'crack cocaine'].includes(word.toLowerCase())) severity = 'high';
          else severity = 'medium';
          
          const matches = findWholeWordMatches(content, word);
          matches.forEach(match => {
            mockFlaggedWords.push({ word: match, category: 'drugs', severity });
          });
        }
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create results based on actual flagged content with more reasonable scoring
      const mockResults: ModerationResult = {
        overallScore: Math.max(0, Math.min(100, 100 - (mockFlaggedWords.length * 8) - (mockFlaggedWords.filter(w => w.severity === 'high').length * 12))),
        riskLevel: (() => {
          const totalFlags = mockFlaggedWords.length;
          const highSeverityFlags = mockFlaggedWords.filter(w => w.severity === 'high').length;
          
          if (highSeverityFlags > 2 || totalFlags > 8) return 'High Risk';
          if (highSeverityFlags > 0 || totalFlags > 4) return 'Medium Risk'; 
          if (totalFlags > 1) return 'Low Risk';
          return 'Safe';
        })() as any,
        categories: {
          profanity: {
            score: Math.min(mockFlaggedWords.filter(w => w.category === 'profanity').length * 15, 100),
            detected: mockFlaggedWords.filter(w => w.category === 'profanity').map(w => w.word),
            severity: mockFlaggedWords.filter(w => w.category === 'profanity').some(w => w.severity === 'high') ? 'High' : 
                     mockFlaggedWords.filter(w => w.category === 'profanity').some(w => w.severity === 'medium') ? 'Medium' : 'Low'
          },
          toxicity: {
            score: Math.min(mockFlaggedWords.length * 10, 100),
            confidence: Math.min(mockFlaggedWords.length * 20 + 60, 100),
            severity: mockFlaggedWords.length > 5 ? 'High' : mockFlaggedWords.length > 2 ? 'Medium' : 'Low'
          },
          spam: {
            score: Math.min(mockFlaggedWords.filter(w => w.category === 'spam').length * 20, 100),
            indicators: mockFlaggedWords.filter(w => w.category === 'spam').map(w => w.word),
            severity: mockFlaggedWords.filter(w => w.category === 'spam').some(w => w.severity === 'high') ? 'High' : 
                     mockFlaggedWords.filter(w => w.category === 'spam').some(w => w.severity === 'medium') ? 'Medium' : 'Low'
          },
          violence: {
            score: Math.min(mockFlaggedWords.filter(w => w.category === 'violence').length * 25, 100),
            detected: mockFlaggedWords.filter(w => w.category === 'violence').map(w => w.word),
            severity: mockFlaggedWords.filter(w => w.category === 'violence').some(w => w.severity === 'high') ? 'High' : 
                     mockFlaggedWords.filter(w => w.category === 'violence').some(w => w.severity === 'medium') ? 'Medium' : 'Low'
          },
          hate: {
            score: Math.min(mockFlaggedWords.filter(w => w.category === 'hate').length * 30, 100),
            detected: mockFlaggedWords.filter(w => w.category === 'hate').map(w => w.word),
            severity: mockFlaggedWords.filter(w => w.category === 'hate').some(w => w.severity === 'high') ? 'High' : 
                     mockFlaggedWords.filter(w => w.category === 'hate').some(w => w.severity === 'medium') ? 'Medium' : 'Low'
          },
          sexual: {
            score: Math.min(mockFlaggedWords.filter(w => w.category === 'sexual').length * 20, 100),
            detected: mockFlaggedWords.filter(w => w.category === 'sexual').map(w => w.word),
            severity: mockFlaggedWords.filter(w => w.category === 'sexual').some(w => w.severity === 'high') ? 'High' : 
                     mockFlaggedWords.filter(w => w.category === 'sexual').some(w => w.severity === 'medium') ? 'Medium' : 'Low'
          }
        },
        suggestions: [
          mockFlaggedWords.length > 0 ? 'Consider replacing flagged words with more family-friendly alternatives' : 'Content appears clean and appropriate',
          mockFlaggedWords.filter(w => w.category === 'spam').length > 0 ? 'Reduce promotional language to avoid spam detection' : 'Good balance of promotional content',
          mockFlaggedWords.filter(w => w.category === 'violence' || w.category === 'hate').length > 0 ? 'Consider softer language to ensure broad audience appeal' : 'Language is appropriate for general audiences',
          contentType === 'title' && content.length > 100 ? 'Consider shortening title for better readability' : 'Title length is appropriate',
          mockFlaggedWords.filter(w => w.severity === 'high').length > 0 ? 'High-severity flags detected - review content before publishing' : 'Content meets general safety guidelines'
        ].filter(Boolean),
        cleanedText: content,
        flaggedWords: mockFlaggedWords,
        sentiment: (() => {
          // Simple sentiment analysis based on content
          const text = content.toLowerCase();
          
          // Positive indicators
          const positiveWords = ['good', 'great', 'love', 'happy', 'excited', 'proud', 'beautiful', 'wonderful', 'amazing', 'awesome', 'congratulations', 'celebrate', 'ready'];
          const positiveCount = positiveWords.filter(word => containsWholeWord(text, word)).length;
          
          // Negative indicators  
          const negativeWords = ['bad', 'hate', 'angry', 'sad', 'terrible', 'awful', 'horrible', 'disgusting', 'annoying', 'frustrated'];
          const negativeCount = negativeWords.filter(word => containsWholeWord(text, word)).length;
          
          // Neutral/casual indicators
          const neutralWords = ['okay', 'fine', 'normal', 'regular', 'standard', 'typical'];
          const neutralCount = neutralWords.filter(word => containsWholeWord(text, word)).length;
          
          // If no flagged words, assume neutral-positive content
          const hasProfanity = mockFlaggedWords.some(w => w.category === 'profanity');
          const hasViolence = mockFlaggedWords.some(w => w.category === 'violence');
          const hasHate = mockFlaggedWords.some(w => w.category === 'hate');
          
          let positive, negative, neutral;
          
          if (hasProfanity || hasViolence || hasHate) {
            // Content with flags tends to be more negative
            positive = Math.max(10, 40 + positiveCount * 8 - mockFlaggedWords.length * 5);
            negative = Math.min(80, 30 + negativeCount * 10 + mockFlaggedWords.length * 8);
            neutral = 100 - positive - negative;
          } else {
            // Clean content tends to be more positive/neutral
            positive = Math.max(30, 60 + positiveCount * 10);
            negative = Math.max(5, 15 + negativeCount * 8);
            neutral = 100 - positive - negative;
          }
          
          // Ensure values are reasonable
          positive = Math.max(0, Math.min(85, positive));
          negative = Math.max(0, Math.min(70, negative));
          neutral = Math.max(0, 100 - positive - negative);
          
          // Determine overall sentiment based on highest percentage
          let overall: 'positive' | 'negative' | 'neutral';
          if (positive >= negative && positive >= neutral) {
            overall = 'positive';
          } else if (negative >= positive && negative >= neutral) {
            overall = 'negative';
          } else {
            overall = 'neutral';
          }
          
          return {
            positive,
            negative,
            neutral,
            overall
          };
        })()
      };

      saveToHistory(content, contentType);
      setResults(mockResults);
      setShowResults(true);
    } catch (error) {
      console.error('Error analyzing content:', error);
      alert('Failed to analyze content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Safe': return '#4caf50';
      case 'Low Risk': return '#8bc34a';
      case 'Medium Risk': return '#ff9800';
      case 'High Risk': return '#f44336';
      default: return '#607d8b';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      default: return '#607d8b';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#4caf50';
      case 'negative': return '#f44336';
      case 'neutral': return '#ff9800';
      default: return '#607d8b';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'title': return 'bx bx-text';
      case 'description': return 'bx bx-detail';
      case 'comment': return 'bx bx-comment';
      case 'general': return 'bx bx-file-blank';
      default: return 'bx bx-text';
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreLabel = (score: number): string => {
    if (score < 25) return 'Excellent';
    if (score < 50) return 'Good';
    if (score < 75) return 'Moderate';
    return 'Needs Attention';
  };

  return (
    <S.PageWrapper>
      {/* Left Sidebar Ad */}
      <S.AdSidebar position="left">
        <AdSense 
          slot={process.env.REACT_APP_ADSENSE_SLOT_SIDEBAR || ''}
          format="vertical"
        />
      </S.AdSidebar>

      {/* Right Sidebar Ad */}
      <S.AdSidebar position="right">
        <AdSense 
          slot={process.env.REACT_APP_ADSENSE_SLOT_SIDEBAR || ''}
          format="vertical"
        />
      </S.AdSidebar>

      <S.MainContainer>
        <S.Header>
          <S.BackButton onClick={() => navigate('/tools')}>
            <i className="bx bx-arrow-back"></i>
            Back to Tools
          </S.BackButton>
          <S.Title>Content Moderation Checker</S.Title>
          <S.Subtitle>
            Analyze your content for potential policy violations, toxicity, and audience safety
          </S.Subtitle>
        </S.Header>

        <S.AnalysisContainer>
          <S.InputSection>
            <S.SectionTitle>
              <i className="bx bx-shield-check"></i>
              Analyze Your Content
            </S.SectionTitle>
            
            <S.ContentTypeSelector>
              <S.TypeLabel>Content Type:</S.TypeLabel>
              <S.TypeOptions>
                <S.TypeOption
                  active={contentType === 'title'}
                  onClick={() => setContentType('title')}
                >
                  <i className="bx bx-text"></i>
                  Video Title
                </S.TypeOption>
                <S.TypeOption
                  active={contentType === 'description'}
                  onClick={() => setContentType('description')}
                >
                  <i className="bx bx-detail"></i>
                  Description
                </S.TypeOption>
                <S.TypeOption
                  active={contentType === 'comment'}
                  onClick={() => setContentType('comment')}
                >
                  <i className="bx bx-comment"></i>
                  Comment
                </S.TypeOption>
                <S.TypeOption
                  active={contentType === 'general'}
                  onClick={() => setContentType('general')}
                >
                  <i className="bx bx-file-blank"></i>
                  General Text
                </S.TypeOption>
              </S.TypeOptions>
            </S.ContentTypeSelector>

            <S.TextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Enter your ${contentType === 'general' ? 'text' : contentType} content here...`}
              rows={contentType === 'description' ? 8 : contentType === 'title' ? 3 : 5}
            />
            
            <S.CharacterCount>
              <span>{content.length} characters</span>
              {contentType === 'title' && content.length > 100 && (
                <S.Warning>Titles are typically under 100 characters</S.Warning>
              )}
              {contentType === 'description' && content.length > 5000 && (
                <S.Warning>Descriptions are typically under 5000 characters</S.Warning>
              )}
            </S.CharacterCount>

            <S.AnalyzeButton onClick={analyzeContent} disabled={isAnalyzing || !content.trim()}>
              {isAnalyzing ? (
                <>
                  <i className="bx bx-loader-alt bx-spin"></i>
                  Analyzing Content...
                </>
              ) : (
                <>
                  <i className="bx bx-shield-check"></i>
                  Check Content Safety
                </>
              )}
            </S.AnalyzeButton>
          </S.InputSection>

          {analysisHistory.length > 0 && (
            <S.HistorySection>
              <S.HistoryLabel>Recent analyses:</S.HistoryLabel>
              <S.HistoryList>
                {analysisHistory.map((item, index) => (
                  <S.HistoryItem key={index} onClick={() => setContent(item.content)}>
                    <i className={getContentTypeIcon(item.type)}></i>
                    <S.HistoryContent>
                      <S.HistoryText>{item.content.substring(0, 50)}...</S.HistoryText>
                      <S.HistoryMeta>
                        {item.type} • {formatTimestamp(item.timestamp)}
                      </S.HistoryMeta>
                    </S.HistoryContent>
                  </S.HistoryItem>
                ))}
              </S.HistoryList>
            </S.HistorySection>
          )}
        </S.AnalysisContainer>

        {isAnalyzing && (
          <S.LoadingContainer>
            <S.LoadingAnimation>
              <i className="bx bx-loader-alt bx-spin"></i>
            </S.LoadingAnimation>
            <S.LoadingText>Analyzing content safety...</S.LoadingText>
            <S.LoadingSteps>
              <S.LoadingStep>Scanning for inappropriate content</S.LoadingStep>
              <S.LoadingStep>Checking toxicity levels</S.LoadingStep>
              <S.LoadingStep>Analyzing sentiment</S.LoadingStep>
              <S.LoadingStep>Generating safety recommendations</S.LoadingStep>
            </S.LoadingSteps>
          </S.LoadingContainer>
        )}

        {showResults && results && (
          <S.ResultsContainer>
            <S.ResultsHeader>
              <S.ResultsTitle>Safety Analysis Results</S.ResultsTitle>
              <S.NewAnalysisButton onClick={() => { setShowResults(false); setContent(''); }}>
                <i className="bx bx-plus"></i>
                New Analysis
              </S.NewAnalysisButton>
            </S.ResultsHeader>

            {/* Overall Safety Score */}
            <S.OverallScore>
              <S.ScoreCircle riskLevel={results.riskLevel}>
                <S.ScoreValue>{results.overallScore}</S.ScoreValue>
                <S.ScoreLabel>Safety Score</S.ScoreLabel>
              </S.ScoreCircle>
              <S.ScoreDetails>
                <S.RiskLevel color={getRiskColor(results.riskLevel)}>
                  <i className="bx bx-shield"></i>
                  Risk Level: {results.riskLevel}
                </S.RiskLevel>
                <S.ScoreDescription>
                  {results.overallScore > 50 
                    ? "Your content appears safe for most audiences" 
                    : "Consider reviewing your content for potential issues"}
                </S.ScoreDescription>
              </S.ScoreDetails>
            </S.OverallScore>

            {/* Category Breakdown */}
            <S.CategoriesGrid>
              <S.CategoryCard>
                <S.CategoryHeader>
                  <i className="bx bx-message-alt-x"></i>
                  <div>
                    <S.CategoryName>Profanity</S.CategoryName>
                    <S.CategoryScore severity={results.categories.profanity.severity}>
                      {results.categories.profanity.score}/100
                    </S.CategoryScore>
                  </div>
                </S.CategoryHeader>
                {results.categories.profanity.detected.length > 0 && (
                  <S.DetectedItems>
                    <S.DetectedLabel>Detected:</S.DetectedLabel>
                    <S.DetectedList>
                      {results.categories.profanity.detected.map((word, index) => (
                        <S.DetectedWord key={index}>"{word}"</S.DetectedWord>
                      ))}
                    </S.DetectedList>
                  </S.DetectedItems>
                )}
              </S.CategoryCard>

              <S.CategoryCard>
                <S.CategoryHeader>
                  <i className="bx bx-angry"></i>
                  <div>
                    <S.CategoryName>Toxicity</S.CategoryName>
                    <S.CategoryScore severity={results.categories.toxicity.severity}>
                      {results.categories.toxicity.score}/100
                    </S.CategoryScore>
                  </div>
                </S.CategoryHeader>
                <S.ConfidenceLevel>
                  Confidence: {results.categories.toxicity.confidence}%
                </S.ConfidenceLevel>
              </S.CategoryCard>

              <S.CategoryCard>
                <S.CategoryHeader>
                  <i className="bx bx-spam"></i>
                  <div>
                    <S.CategoryName>Spam</S.CategoryName>
                    <S.CategoryScore severity={results.categories.spam.severity}>
                      {results.categories.spam.score}/100
                    </S.CategoryScore>
                  </div>
                </S.CategoryHeader>
                {results.categories.spam.indicators.length > 0 && (
                  <S.DetectedItems>
                    <S.DetectedLabel>Indicators:</S.DetectedLabel>
                    <S.IndicatorsList>
                      {results.categories.spam.indicators.map((indicator, index) => (
                        <S.Indicator key={index}>"{indicator}"</S.Indicator>
                      ))}
                    </S.IndicatorsList>
                  </S.DetectedItems>
                )}
              </S.CategoryCard>

              <S.CategoryCard>
                <S.CategoryHeader>
                  <i className="bx bx-error-circle"></i>
                  <div>
                    <S.CategoryName>Violence</S.CategoryName>
                    <S.CategoryScore severity={results.categories.violence.severity}>
                      {results.categories.violence.score}/100
                    </S.CategoryScore>
                  </div>
                </S.CategoryHeader>
                {results.categories.violence.detected.length > 0 && (
                  <S.DetectedItems>
                    <S.DetectedLabel>Detected:</S.DetectedLabel>
                    <S.DetectedList>
                      {results.categories.violence.detected.map((word, index) => (
                        <S.DetectedWord key={index}>"{word}"</S.DetectedWord>
                      ))}
                    </S.DetectedList>
                  </S.DetectedItems>
                )}
              </S.CategoryCard>

              <S.CategoryCard>
                <S.CategoryHeader>
                  <i className="bx bx-heart"></i>
                  <div>
                    <S.CategoryName>Hate Speech</S.CategoryName>
                    <S.CategoryScore severity={results.categories.hate.severity}>
                      {results.categories.hate.score}/100
                    </S.CategoryScore>
                  </div>
                </S.CategoryHeader>
                {results.categories.hate.detected.length > 0 && (
                  <S.DetectedItems>
                    <S.DetectedLabel>Detected:</S.DetectedLabel>
                    <S.DetectedList>
                      {results.categories.hate.detected.map((word, index) => (
                        <S.DetectedWord key={index}>"{word}"</S.DetectedWord>
                      ))}
                    </S.DetectedList>
                  </S.DetectedItems>
                )}
              </S.CategoryCard>

              <S.CategoryCard>
                <S.CategoryHeader>
                  <i className="bx bx-user-x"></i>
                  <div>
                    <S.CategoryName>Sexual Content</S.CategoryName>
                    <S.CategoryScore severity={results.categories.sexual.severity}>
                      {results.categories.sexual.score}/100
                    </S.CategoryScore>
                  </div>
                </S.CategoryHeader>
                {results.categories.sexual.detected.length > 0 && (
                  <S.DetectedItems>
                    <S.DetectedLabel>Detected:</S.DetectedLabel>
                    <S.DetectedList>
                      {results.categories.sexual.detected.map((word, index) => (
                        <S.DetectedWord key={index}>"{word}"</S.DetectedWord>
                      ))}
                    </S.DetectedList>
                  </S.DetectedItems>
                )}
              </S.CategoryCard>
            </S.CategoriesGrid>

            {/* Sentiment Analysis */}
            <S.SentimentSection>
              <S.SectionTitle>
                <i className="bx bx-happy"></i>
                Sentiment Analysis
              </S.SectionTitle>
              
              <S.SentimentGrid>
                <S.SentimentCard sentiment="positive">
                  <S.SentimentValue>{results.sentiment.positive}%</S.SentimentValue>
                  <S.SentimentLabel>Positive</S.SentimentLabel>
                </S.SentimentCard>
                <S.SentimentCard sentiment="neutral">
                  <S.SentimentValue>{results.sentiment.neutral}%</S.SentimentValue>
                  <S.SentimentLabel>Neutral</S.SentimentLabel>
                </S.SentimentCard>
                <S.SentimentCard sentiment="negative">
                  <S.SentimentValue>{results.sentiment.negative}%</S.SentimentValue>
                  <S.SentimentLabel>Negative</S.SentimentLabel>
                </S.SentimentCard>
              </S.SentimentGrid>
              
              <S.OverallSentiment color={getSentimentColor(results.sentiment.overall)}>
                Overall Sentiment: {results.sentiment.overall}
              </S.OverallSentiment>
            </S.SentimentSection>

            {/* Suggestions */}
            <S.SuggestionsSection>
              <S.SectionTitle>
                <i className="bx bx-lightbulb"></i>
                Improvement Suggestions
              </S.SectionTitle>
              
              <S.SuggestionsList>
                {results.suggestions.map((suggestion, index) => (
                  <S.Suggestion key={index}>
                    <i className="bx bx-check-circle"></i>
                    {suggestion}
                  </S.Suggestion>
                ))}
              </S.SuggestionsList>
            </S.SuggestionsSection>

            {/* Flagged Words */}
            {results.flaggedWords.length > 0 && (
              <S.FlaggedWordsSection>
                <S.SectionTitle>
                  <i className="bx bx-flag"></i>
                  Flagged Content ({results.flaggedWords.length})
                </S.SectionTitle>
                
                <S.FlaggedWordsList>
                  {results.flaggedWords.map((item, index) => (
                    <S.FlaggedWord key={index} severity={item.severity}>
                      <S.WordText>"{item.word}"</S.WordText>
                      <S.WordDetails>
                        <S.WordCategory>{item.category}</S.WordCategory>
                        <S.WordSeverity severity={item.severity}>
                          {item.severity} risk
                        </S.WordSeverity>
                      </S.WordDetails>
                    </S.FlaggedWord>
                  ))}
                </S.FlaggedWordsList>
              </S.FlaggedWordsSection>
            )}
          </S.ResultsContainer>
        )}

        {/* Bottom Ad */}
        <S.BottomAdContainer>
          <AdSense 
            slot={process.env.REACT_APP_ADSENSE_SLOT_BOTTOM || ''}
            format="horizontal"
          />
        </S.BottomAdContainer>
      </S.MainContainer>
    </S.PageWrapper>
  );
};

export default ModerationChecker;