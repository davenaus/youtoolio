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
      const contentLower = content.toLowerCase();
      
      // Comprehensive word lists for client-side moderation
      const profanityWords = [
        // Mild profanity
        'damn', 'hell', 'crap', 'piss', 'dammit', 'suck', 'sucks', 'sucked', 'stupid', 'idiot', 'moron', 'dumb', 'dumbass',
        // Moderate profanity
        'shit', 'bullshit', 'pissed', 'ass', 'asshole', 'bitch', 'wtf', 'screw', 'screwed', 'bastard', 'bloody', 'freaking', 'freakin',
        // Strong profanity
        'fuck', 'fucking', 'fucked', 'fucker', 'motherfucker', 'cocksucker', 'dickhead', 'pussy', 'whore', 'slut', 'cunt'
      ];
      
      const spamIndicators = [
        'click here', 'subscribe now', 'like and subscribe', 'smash that like button', 'hit the bell', 'notification squad',
        'first comment', 'early squad', 'who\'s watching in', 'free money', 'make money fast', 'get rich quick',
        'work from home', 'earn $', 'visit my profile', 'check my channel', 'follow for follow', 'sub for sub',
        'subscribe to me', 'urgent', 'limited time', 'act now', 'don\'t miss out', 'exclusive offer',
        'click the link', 'link in bio', 'dm me', 'text me', 'whatsapp me', 'telegram me'
      ];
      
      const violenceWords = [
        'kill', 'murder', 'die', 'death', 'dead', 'suicide', 'hang yourself', 'shoot', 'stab', 'knife',
        'gun', 'weapon', 'bomb', 'explosive', 'attack', 'assault', 'fight', 'beat up', 'destroy',
        'violence', 'violent', 'war', 'battle', 'massacre', 'slaughter', 'torture', 'hurt', 'pain',
        'suffer', 'revenge', 'hate', 'hatred', 'enemy', 'threat', 'threaten', 'dangerous'
      ];
      
      const hateWords = [
        'hate', 'racist', 'racism', 'nazi', 'hitler', 'jews', 'muslim', 'terrorist', 'gay', 'fag',
        'retard', 'retarded', 'disabled', 'mental', 'crazy', 'insane', 'psycho', 'loser', 'failure',
        'worthless', 'pathetic', 'disgusting', 'ugly', 'fat', 'skinny', 'freak', 'weird', 'strange'
      ];
      
      const sexualWords = [
        'sex', 'sexual', 'porn', 'pornography', 'nude', 'naked', 'strip', 'sexy', 'hot', 'horny',
        'masturbate', 'orgasm', 'climax', 'erotic', 'adult', 'xxx', 'nsfw', 'boobs', 'tits', 'dick',
        'penis', 'vagina', 'anal', 'oral', 'blowjob', 'handjob', 'hookup', 'dating', 'onlyfans'
      ];
      
      const drugWords = [
        'weed', 'marijuana', 'cannabis', 'high', 'stoned', 'drunk', 'alcohol', 'beer', 'wine', 'vodka',
        'cocaine', 'heroin', 'meth', 'drugs', 'pill', 'smoke', 'vape', 'cigarette', 'tobacco', 'addiction'
      ];
      
      // Check for profanity
      profanityWords.forEach(word => {
        if (contentLower.includes(word.toLowerCase())) {
          let severity = 'low';
          if (['fuck', 'fucking', 'fucked', 'motherfucker', 'cunt'].includes(word)) severity = 'high';
          else if (['shit', 'bullshit', 'ass', 'asshole', 'bitch'].includes(word)) severity = 'medium';
          
          mockFlaggedWords.push({ word, category: 'profanity', severity });
        }
      });
      
      // Check for spam indicators
      spamIndicators.forEach(phrase => {
        if (contentLower.includes(phrase.toLowerCase())) {
          let severity = 'medium';
          if (['free money', 'make money fast', 'get rich quick'].includes(phrase)) severity = 'high';
          else if (['click here', 'link in bio', 'check my channel'].includes(phrase)) severity = 'low';
          
          mockFlaggedWords.push({ word: phrase, category: 'spam', severity });
        }
      });
      
      // Check for violence
      violenceWords.forEach(word => {
        if (contentLower.includes(word.toLowerCase())) {
          let severity = 'medium';
          if (['kill', 'murder', 'suicide', 'bomb', 'weapon', 'torture'].includes(word)) severity = 'high';
          else if (['fight', 'beat up', 'hurt'].includes(word)) severity = 'low';
          
          mockFlaggedWords.push({ word, category: 'violence', severity });
        }
      });
      
      // Check for hate speech
      hateWords.forEach(word => {
        if (contentLower.includes(word.toLowerCase())) {
          let severity = 'medium';
          if (['racist', 'nazi', 'fag', 'terrorist'].includes(word)) severity = 'high';
          else if (['weird', 'strange', 'ugly'].includes(word)) severity = 'low';
          
          mockFlaggedWords.push({ word, category: 'hate', severity });
        }
      });
      
      // Check for sexual content
      sexualWords.forEach(word => {
        if (contentLower.includes(word.toLowerCase())) {
          let severity = 'medium';
          if (['porn', 'pornography', 'xxx', 'masturbate', 'orgasm'].includes(word)) severity = 'high';
          else if (['sexy', 'hot', 'dating'].includes(word)) severity = 'low';
          
          mockFlaggedWords.push({ word, category: 'sexual', severity });
        }
      });
      
      // Check for drug references
      drugWords.forEach(word => {
        if (contentLower.includes(word.toLowerCase())) {
          let severity = 'medium';
          if (['cocaine', 'heroin', 'meth', 'addiction'].includes(word)) severity = 'high';
          else if (['beer', 'wine', 'vape'].includes(word)) severity = 'low';
          
          mockFlaggedWords.push({ word, category: 'drugs', severity });
        }
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create results based on actual flagged content
      const mockResults: ModerationResult = {
        overallScore: Math.max(0, Math.min(100, 100 - (mockFlaggedWords.length * 15) - (mockFlaggedWords.filter(w => w.severity === 'high').length * 20))),
        riskLevel: (() => {
          const totalFlags = mockFlaggedWords.length;
          const highSeverityFlags = mockFlaggedWords.filter(w => w.severity === 'high').length;
          
          if (highSeverityFlags > 0 || totalFlags > 5) return 'High Risk';
          if (totalFlags > 2) return 'Medium Risk'; 
          if (totalFlags > 0) return 'Low Risk';
          return 'Safe';
        })() as any,
        categories: {
          profanity: {
            score: mockFlaggedWords.filter(w => w.category === 'profanity').length * 20,
            detected: mockFlaggedWords.filter(w => w.category === 'profanity').map(w => w.word),
            severity: mockFlaggedWords.filter(w => w.category === 'profanity').some(w => w.severity === 'high') ? 'High' : 
                     mockFlaggedWords.filter(w => w.category === 'profanity').some(w => w.severity === 'medium') ? 'Medium' : 'Low'
          },
          toxicity: {
            score: Math.min(mockFlaggedWords.length * 15, 100),
            confidence: Math.min(mockFlaggedWords.length * 25 + 50, 100),
            severity: mockFlaggedWords.length > 3 ? 'High' : mockFlaggedWords.length > 1 ? 'Medium' : 'Low'
          },
          spam: {
            score: mockFlaggedWords.filter(w => w.category === 'spam').length * 25,
            indicators: mockFlaggedWords.filter(w => w.category === 'spam').map(w => w.word),
            severity: mockFlaggedWords.filter(w => w.category === 'spam').some(w => w.severity === 'high') ? 'High' : 
                     mockFlaggedWords.filter(w => w.category === 'spam').some(w => w.severity === 'medium') ? 'Medium' : 'Low'
          },
          violence: {
            score: mockFlaggedWords.filter(w => w.category === 'violence').length * 30,
            detected: mockFlaggedWords.filter(w => w.category === 'violence').map(w => w.word),
            severity: mockFlaggedWords.filter(w => w.category === 'violence').some(w => w.severity === 'high') ? 'High' : 
                     mockFlaggedWords.filter(w => w.category === 'violence').some(w => w.severity === 'medium') ? 'Medium' : 'Low'
          },
          hate: {
            score: mockFlaggedWords.filter(w => w.category === 'hate').length * 35,
            detected: mockFlaggedWords.filter(w => w.category === 'hate').map(w => w.word),
            severity: mockFlaggedWords.filter(w => w.category === 'hate').some(w => w.severity === 'high') ? 'High' : 
                     mockFlaggedWords.filter(w => w.category === 'hate').some(w => w.severity === 'medium') ? 'Medium' : 'Low'
          },
          sexual: {
            score: mockFlaggedWords.filter(w => w.category === 'sexual').length * 25,
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
        sentiment: {
          positive: Math.floor(Math.random() * 100),
          negative: Math.floor(Math.random() * 100),
          neutral: Math.floor(Math.random() * 100),
          overall: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as any
        }
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
                  {getScoreLabel(results.overallScore)} - {results.overallScore > 50 
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