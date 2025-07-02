// src/pages/Tools/components/CommentPicker/CommentPicker.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdSense } from '../../../../components/AdSense/AdSense';
import * as S from './styles';

import confetti from 'canvas-confetti';

interface Comment {
  id: string;
  name: string;
  comment: string;
  timestamp: string;
  avatar: string;
  likeCount: number;
  publishedAt: string;
}

interface FilterOptions {
  minLikes: number;
  dateRange: {
    start: string;
    end: string;
  };
  keyword: string;
  excludeChannelOwner: boolean;
  maxCommentLength: number;
}

export const CommentPicker: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [winner, setWinner] = useState<Comment | null>(null);
  const [animatingName, setAnimatingName] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [totalComments, setTotalComments] = useState(0);
  const [videoData, setVideoData] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [previousWinners, setPreviousWinners] = useState<Comment[]>([]);
  const [isMultiPick, setIsMultiPick] = useState(false);
  const [numberOfWinners, setNumberOfWinners] = useState(1);
  const [multipleWinners, setMultipleWinners] = useState<Comment[]>([]);

  const [filters, setFilters] = useState<FilterOptions>({
    minLikes: 0,
    dateRange: {
      start: '',
      end: ''
    },
    keyword: '',
    excludeChannelOwner: false,
    maxCommentLength: 0
  });

  const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

  useEffect(() => {
    if (videoId) {
      const videoUrl = `https://youtube.com/watch?v=${videoId}`;
      setUrl(videoUrl);
      handleSubmit(undefined, videoId);
    }
  }, [videoId]);

  const extractVideoId = (url: string): string | null => {
    if (url.match(/^[A-Za-z0-9_-]{11}$/)) {
      return url;
    }

    const patterns = [
      /v=([^&]+)/,
      /youtu\.be\/([^?]+)/,
      /embed\/([^?]+)/,
      /shorts\/([^?]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const formatTimestamp = (timestamp: string): string => {
    const commentDate = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - commentDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  };

  const fetchVideoData = async (videoId: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet,statistics&id=${videoId}&key=${API_KEY}`
      );
      const data = await response.json();
      if (data.items?.[0]) {
        setVideoData(data.items[0]);
      }
    } catch (error) {
      console.error('Error fetching video data:', error);
    }
  };

  const fetchComments = async (videoId: string): Promise<Comment[]> => {
    const API_ENDPOINT = 'https://www.googleapis.com/youtube/v3/commentThreads';
    let allComments: Comment[] = [];
    let nextPageToken = '';
    const MAX_PAGES = 10;
    let totalPages = 0;

    try {
      do {
        const response = await fetch(
          `${API_ENDPOINT}?part=snippet&videoId=${videoId}&maxResults=100&key=${API_KEY}${
            nextPageToken ? '&pageToken=' + nextPageToken : ''
          }&order=relevance`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }

        const data = await response.json();
        
        if (!data.items || data.items.length === 0) break;

        const comments = data.items.map((item: any) => ({
          id: item.id,
          name: item.snippet.topLevelComment.snippet.authorDisplayName,
          comment: item.snippet.topLevelComment.snippet.textDisplay,
          timestamp: formatTimestamp(item.snippet.topLevelComment.snippet.publishedAt),
          publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
          avatar: item.snippet.topLevelComment.snippet.authorProfileImageUrl || '/api/placeholder/64/64',
          likeCount: item.snippet.topLevelComment.snippet.likeCount || 0
        }));

        allComments = [...allComments, ...comments];
        nextPageToken = data.nextPageToken;
        totalPages++;

        if (!nextPageToken || totalPages >= MAX_PAGES) break;

      } while (nextPageToken);

      return allComments;

    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  };

  const applyFilters = (comments: Comment[]): Comment[] => {
    let filtered = [...comments];

    // Filter by minimum likes
    if (filters.minLikes > 0) {
      filtered = filtered.filter(comment => comment.likeCount >= filters.minLikes);
    }

    // Filter by keyword
    if (filters.keyword) {
      filtered = filtered.filter(comment => 
        comment.comment.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        comment.name.toLowerCase().includes(filters.keyword.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(comment => {
        const commentDate = new Date(comment.publishedAt);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        
        if (startDate && commentDate < startDate) return false;
        if (endDate && commentDate > endDate) return false;
        return true;
      });
    }

    // Filter by comment length
    if (filters.maxCommentLength > 0) {
      filtered = filtered.filter(comment => comment.comment.length <= filters.maxCommentLength);
    }

    // Exclude channel owner
    if (filters.excludeChannelOwner && videoData) {
      filtered = filtered.filter(comment => comment.name !== videoData.snippet.channelTitle);
    }

    // Exclude previous winners
    if (previousWinners.length > 0) {
      filtered = filtered.filter(comment => 
        !previousWinners.some(winner => winner.id === comment.id)
      );
    }

    return filtered;
  };

  const fireConfetti = (colors: string[] = ['#ff0000', '#ff4444', '#ff6666']) => {
    const duration = 3000;
    const end = Date.now() + duration;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors
    });

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const animateSelection = async (comments: Comment[], pickMultiple: boolean = false): Promise<void> => {
    setShowResults(false);
    setShowAnimation(true);
    
    const duration = 4000;
    const startInterval = 50;
    const endInterval = 300;
    const startTime = Date.now();
    const totalNames = Math.min(comments.length, 100);
    const usedIndices = new Set();

    // Select winner(s) ahead of time
    const winners: Comment[] = [];
    const availableComments = [...comments];
    
    for (let i = 0; i < (pickMultiple ? numberOfWinners : 1); i++) {
      if (availableComments.length === 0) break;
      const randomIndex = Math.floor(Math.random() * availableComments.length);
      winners.push(availableComments[randomIndex]);
      availableComments.splice(randomIndex, 1);
    }

    return new Promise<void>((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 1) {
          const currentInterval = startInterval + (endInterval - startInterval) * progress;
          let randomIndex;
          
          do {
            randomIndex = Math.floor(Math.random() * totalNames);
          } while (usedIndices.has(randomIndex));

          usedIndices.add(randomIndex);
          if (usedIndices.size === totalNames) {
            usedIndices.clear();
          }

          setAnimatingName(comments[randomIndex].name);
          setTimeout(() => requestAnimationFrame(animate), currentInterval);
        } else {
          setAnimatingName('');
          setShowAnimation(false);
          
          if (pickMultiple) {
            setMultipleWinners(winners);
            setPreviousWinners(prev => [...prev, ...winners]);
          } else {
            setWinner(winners[0]);
            setPreviousWinners(prev => [...prev, winners[0]]);
          }
          
          setShowResults(true);
          fireConfetti();
          resolve();
        }
      };
      animate();
    });
  };

  const handleSearch = () => {
    const extractedId = extractVideoId(url);
    if (extractedId) {
      navigate(`/tools/comment-picker/${extractedId}`);
    } else {
      alert('Please enter a valid YouTube URL');
    }
  };

  const handleSubmit = async (e?: React.FormEvent, directVideoId?: string) => {
    if (e) e.preventDefault();
    
    const videoId = directVideoId || extractVideoId(url);
    
    if (!videoId) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    // Reset states
    setWinner(null);
    setMultipleWinners([]);
    setShowResults(false);
    setShowAnimation(false);
    setAnimatingName('');
    setPreviousWinners([]);
    
    // Start loading
    setIsLoading(true);
    
    try {
      await fetchVideoData(videoId);
      const fetchedComments = await fetchComments(videoId);
      
      if (fetchedComments.length === 0) {
        throw new Error('No comments found');
      }

      setComments(fetchedComments);
      setTotalComments(fetchedComments.length);
      
      const filtered = applyFilters(fetchedComments);
      setFilteredComments(filtered);
      
      setIsLoading(false);
      
      // Start animation
      await animateSelection(filtered, isMultiPick);
      
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to load comments');
      setIsLoading(false);
    }
  };

  const handleReroll = async () => {
    const filtered = applyFilters(comments);
    setFilteredComments(filtered);
    
    if (filtered.length === 0) {
      alert('No eligible comments remaining with current filters');
      return;
    }
    
    await animateSelection(filtered, isMultiPick);
  };

  const resetAll = () => {
    setUrl('');
    setComments([]);
    setFilteredComments([]);
    setWinner(null);
    setMultipleWinners([]);
    setShowResults(false);
    setShowAnimation(false);
    setAnimatingName('');
    setTotalComments(0);
    setVideoData(null);
    setPreviousWinners([]);
  };

  const exportWinners = () => {
    const winners = isMultiPick ? multipleWinners : (winner ? [winner] : []);
    const data = winners.map(w => ({
      name: w.name,
      comment: w.comment,
      timestamp: w.timestamp,
      likes: w.likeCount
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comment_winners.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <S.Title>Comment Picker</S.Title>
          <S.Subtitle>
            Randomly select winners from YouTube video comments with advanced filtering
          </S.Subtitle>
        </S.Header>

        <S.SearchContainer>
          <form onSubmit={handleSubmit}>
            <S.SearchBar>
              <S.SearchInput
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter YouTube video URL or video ID"
                disabled={isLoading}
              />
              <S.SearchButton type="button" onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <i className='bx bx-loader-alt bx-spin'></i>
                ) : (
                  <i className='bx bx-gift'></i>
                )}
              </S.SearchButton>
            </S.SearchBar>
          </form>

          <S.ToggleContainer>
            <S.ToggleButton 
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'active' : ''}
            >
              <i className="bx bx-filter"></i>
              Advanced Filters
            </S.ToggleButton>
            <S.ToggleButton 
              onClick={() => setIsMultiPick(!isMultiPick)}
              className={isMultiPick ? 'active' : ''}
            >
              <i className="bx bx-group"></i>
              Multiple Winners
            </S.ToggleButton>
          </S.ToggleContainer>
        </S.SearchContainer>

        {showFilters && (
          <S.FiltersContainer>
            <S.FilterGrid>
              <S.FilterGroup>
                <S.FilterLabel>Minimum Likes</S.FilterLabel>
                <S.FilterInput
                  type="number"
                  value={filters.minLikes}
                  onChange={(e) => setFilters({...filters, minLikes: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </S.FilterGroup>

              <S.FilterGroup>
                <S.FilterLabel>Keyword Filter</S.FilterLabel>
                <S.FilterInput
                  type="text"
                  value={filters.keyword}
                  onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                  placeholder="Filter by keyword..."
                />
              </S.FilterGroup>

              <S.FilterGroup>
                <S.FilterLabel>Max Comment Length</S.FilterLabel>
                <S.FilterInput
                  type="number"
                  value={filters.maxCommentLength}
                  onChange={(e) => setFilters({...filters, maxCommentLength: parseInt(e.target.value) || 0})}
                  placeholder="0 (no limit)"
                />
              </S.FilterGroup>

              {isMultiPick && (
                <S.FilterGroup>
                  <S.FilterLabel>Number of Winners</S.FilterLabel>
                  <S.FilterSelect
                    value={numberOfWinners}
                    onChange={(e) => setNumberOfWinners(parseInt(e.target.value))}
                  >
                    <option value={1}>1 Winner</option>
                    <option value={2}>2 Winners</option>
                    <option value={3}>3 Winners</option>
                    <option value={5}>5 Winners</option>
                    <option value={10}>10 Winners</option>
                  </S.FilterSelect>
                </S.FilterGroup>
              )}

              <S.FilterGroup>
                <S.FilterLabel>Date Range (Start)</S.FilterLabel>
                <S.FilterInput
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters({...filters, dateRange: {...filters.dateRange, start: e.target.value}})}
                />
              </S.FilterGroup>

              <S.FilterGroup>
                <S.FilterLabel>Date Range (End)</S.FilterLabel>
                <S.FilterInput
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters({...filters, dateRange: {...filters.dateRange, end: e.target.value}})}
                />
              </S.FilterGroup>
            </S.FilterGrid>

            <S.CheckboxGroup>
              <S.Checkbox
                type="checkbox"
                id="excludeChannelOwner"
                checked={filters.excludeChannelOwner}
                onChange={(e) => setFilters({...filters, excludeChannelOwner: e.target.checked})}
              />
              <S.CheckboxLabel htmlFor="excludeChannelOwner">
                Exclude channel owner from selection
              </S.CheckboxLabel>
            </S.CheckboxGroup>
          </S.FiltersContainer>
        )}

        {isLoading && (
          <S.LoadingContainer>
            <i className='bx bx-loader-alt bx-spin'></i>
            <p>Loading comments...</p>
          </S.LoadingContainer>
        )}

        {showAnimation && animatingName && (
          <S.SelectingAnimation>
            <S.AnimationText>{animatingName}</S.AnimationText>
            <S.AnimationSubtext>
              {isMultiPick ? `Selecting ${numberOfWinners} winners...` : 'Selecting winner...'}
            </S.AnimationSubtext>
          </S.SelectingAnimation>
        )}

        {videoData && totalComments > 0 && !isLoading && !showAnimation && (
          <S.VideoInfo>
            <S.ThumbnailContainer>
              <S.Thumbnail
                src={videoData.snippet.thumbnails.maxres?.url || videoData.snippet.thumbnails.high.url}
                alt={videoData.snippet.title}
              />
            </S.ThumbnailContainer>
            
            <S.VideoDetails>
              <S.VideoTitle>{videoData.snippet.title}</S.VideoTitle>
              <S.VideoMeta>
                <S.MetaItem>
                  <i className="bx bx-user"></i>
                  {videoData.snippet.channelTitle}
                </S.MetaItem>
                <S.MetaItem>
                  <i className="bx bx-comment"></i>
                  {totalComments} total comments
                </S.MetaItem>
                <S.MetaItem>
                  <i className="bx bx-filter-alt"></i>
                  {filteredComments.length} eligible comments
                </S.MetaItem>
              </S.VideoMeta>
            </S.VideoDetails>
          </S.VideoInfo>
        )}

        {showResults && (
          <S.ResultsContainer>
            {isMultiPick && multipleWinners.length > 0 ? (
              <S.MultipleWinnersSection>
                <S.SectionTitle>
                  <i className="bx bx-trophy"></i>
                  🎉 Winners Selected!
                </S.SectionTitle>
                <S.WinnersGrid>
                  {multipleWinners.map((winner, index) => (
                    <S.WinnerCard key={winner.id}>
                      <S.WinnerRank>#{index + 1}</S.WinnerRank>
                      <S.WinnerHeader>
                        <S.WinnerAvatar src={winner.avatar} alt="Winner avatar" />
                        <S.WinnerInfo>
                          <S.WinnerName>{winner.name}</S.WinnerName>
                          <S.WinnerTimestamp>{winner.timestamp}</S.WinnerTimestamp>
                          <S.WinnerLikes>
                            <i className="bx bx-like"></i>
                            {winner.likeCount} likes
                          </S.WinnerLikes>
                        </S.WinnerInfo>
                      </S.WinnerHeader>
                      <S.WinnerComment>{winner.comment}</S.WinnerComment>
                    </S.WinnerCard>
                  ))}
                </S.WinnersGrid>
              </S.MultipleWinnersSection>
            ) : winner ? (
              <S.SingleWinnerSection>
                <S.Winner>
                  <S.WinnerHeader>
                    <S.WinnerAvatar src={winner.avatar} alt="Winner avatar" />
                    <S.WinnerInfo>
                      <S.WinnerLabel>🎉 Winner!</S.WinnerLabel>
                      <S.WinnerName>{winner.name}</S.WinnerName>
                      <S.WinnerTimestamp>{winner.timestamp}</S.WinnerTimestamp>
                      <S.WinnerLikes>
                        <i className="bx bx-like"></i>
                        {winner.likeCount} likes
                      </S.WinnerLikes>
                    </S.WinnerInfo>
                  </S.WinnerHeader>
                  <S.WinnerComment>{winner.comment}</S.WinnerComment>
                </S.Winner>
              </S.SingleWinnerSection>
            ) : null}

            <S.ActionButtons>
              <S.ActionButton onClick={handleReroll}>
                <i className='bx bx-refresh'></i>
                Pick {isMultiPick ? 'New Winners' : 'New Winner'}
              </S.ActionButton>
              <S.ActionButton onClick={exportWinners}>
                <i className='bx bx-download'></i>
                Export Winners
              </S.ActionButton>
              <S.ActionButton onClick={resetAll}>
                <i className='bx bx-reset'></i>
                Start Over
              </S.ActionButton>
            </S.ActionButtons>

            {previousWinners.length > 1 && (
              <S.PreviousWinnersSection>
                <S.SectionTitle>
                  <i className="bx bx-history"></i>
                  Previous Winners ({previousWinners.length})
                </S.SectionTitle>
                <S.PreviousWinnersList>
                  {previousWinners.slice(-5).map((prevWinner, index) => (
                    <S.PreviousWinnerItem key={prevWinner.id}>
                      <S.PreviousWinnerAvatar src={prevWinner.avatar} alt="Previous winner" />
                      <S.PreviousWinnerName>{prevWinner.name}</S.PreviousWinnerName>
                    </S.PreviousWinnerItem>
                  ))}
                </S.PreviousWinnersList>
              </S.PreviousWinnersSection>
            )}

            {/* Bottom Ad for smaller screens */}
            <S.BottomAdContainer>
              <AdSense 
                slot={process.env.REACT_APP_ADSENSE_SLOT_BOTTOM || ''}
                format="horizontal"
              />
            </S.BottomAdContainer>
          </S.ResultsContainer>
        )}
      </S.MainContainer>
    </S.PageWrapper>
  );
};

export default CommentPicker;