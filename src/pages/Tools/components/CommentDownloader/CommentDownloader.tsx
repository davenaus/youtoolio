// src/pages/Tools/components/CommentDownloader/CommentDownloader.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEO } from '../../../../components/SEO';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';

interface Comment {
  id: string;
  text: string;
  author: string;
  publishedAt: string;
  likeCount: number;
  replies?: Reply[];
}

interface Reply {
  id: string;
  text: string;
  author: string;
  publishedAt: string;
  likeCount: number;
}

interface FilterOptions {
  includeReplies: boolean;
  maxComments: number;
  sortBy: 'relevance' | 'time';
  dateRange: {
    start: string;
    end: string;
  };
  keyword: string;
  minLikes: number;
}

export const CommentDownloader: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [videoData, setVideoData] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [batchUrls, setBatchUrls] = useState('');
  const [showBatch, setShowBatch] = useState(false);
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  // Tool configuration
  const toolConfig = {
    name: 'Comment Downloader',
    description: 'Download all comments from any YouTube video for analysis and insights',
    image: 'https://64.media.tumblr.com/66078549793f9f7a2f8135de9fa7332b/0e01452f9f6dd974-a7/s2048x3072/d1645c95d5bd8165f5fd093296a1372f053a2a21.jpg',
    icon: 'bx bx-download',
    features: [
      'Complete comment export',
      'Multiple formats',
      'Sentiment analysis'
    ]
  };

  const [filters, setFilters] = useState<FilterOptions>({
    includeReplies: true,
    maxComments: 1000,
    sortBy: 'relevance',
    dateRange: {
      start: '',
      end: ''
    },
    keyword: '',
    minLikes: 0
  });

  const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_5;
  const MAX_RESULTS = 100;
  const MAX_PAGES = Math.ceil(filters.maxComments / MAX_RESULTS);

  useEffect(() => {
    if (videoId) {
      const videoUrl = `https://youtube.com/watch?v=${videoId}`;
      setVideoUrl(videoUrl);
      setIsBatchMode(false); // Single video mode
      handleDownload(videoId);
    }
  }, [videoId]);

  const extractVideoId = (url: string): string | false => {
    // Regular video URL pattern
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[7].length === 11) {
      return match[7];
    }

    // Shorts URL pattern
    const shortsRegExp = /^.*(youtube.com\/shorts\/)([^#&?]*).*/;
    const shortsMatch = url.match(shortsRegExp);
    if (shortsMatch && shortsMatch[2]) {
      return shortsMatch[2];
    }

    // Direct video ID
    if (url.match(/^[A-Za-z0-9_-]{11}$/)) {
      return url;
    }

    return false;
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

  const fetchReplies = async (commentId: string): Promise<Reply[]> => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/comments?` +
        `part=snippet&parentId=${commentId}&key=${API_KEY}&maxResults=100`
      );
      const data = await response.json();
      
      return data.items?.map((item: any) => ({
        id: item.id,
        text: item.snippet.textDisplay,
        author: item.snippet.authorDisplayName,
        publishedAt: item.snippet.publishedAt,
        likeCount: item.snippet.likeCount || 0
      })) || [];
    } catch (error) {
      console.error('Error fetching replies:', error);
      return [];
    }
  };

  const filterComments = (comments: Comment[]): Comment[] => {
    let filtered = [...comments];

    // Filter by keyword
    if (filters.keyword) {
      filtered = filtered.filter(comment => 
        comment.text.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        comment.author.toLowerCase().includes(filters.keyword.toLowerCase())
      );
    }

    // Filter by minimum likes
    if (filters.minLikes > 0) {
      filtered = filtered.filter(comment => comment.likeCount >= filters.minLikes);
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

    // Sort comments
    if (filters.sortBy === 'time') {
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else {
      filtered.sort((a, b) => b.likeCount - a.likeCount);
    }

    // Limit results
    return filtered.slice(0, filters.maxComments);
  };

  const handleSearch = () => {
    const extractedId = extractVideoId(videoUrl);
    if (extractedId) {
      setIsBatchMode(false); // Single video mode
      navigate(`/tools/comment-downloader/${extractedId}`);
    } else {
      setStatus('Invalid YouTube URL. Please enter a valid YouTube video URL.');
    }
  };

  const handleDownload = async (id: string) => {
    setIsLoading(true);
    setShowResults(false);
    setStatus('Fetching video data...');
    
    try {
      // Always fetch video data for single video downloads (not batch)
      await fetchVideoData(id);
      
      setStatus('Fetching comments...');
      const newComments: Comment[] = [];

      let nextPageToken = '';
      for (let i = 0; i < MAX_PAGES; i++) {
        const url = `https://www.googleapis.com/youtube/v3/commentThreads?` +
                   `part=snippet,replies&videoId=${id}&key=${API_KEY}&` +
                   `maxResults=${MAX_RESULTS}&pageToken=${nextPageToken}&order=${filters.sortBy}`;
        
        setStatus(`Fetching comments... (Page ${i + 1}/${MAX_PAGES})`);

        const response = await fetch(url);
        const data = await response.json();

        if (response.status !== 200) {
          throw new Error(`API Error (${response.status}): ${data.error?.message || 'Unknown error'}`);
        }

        for (const item of data.items) {
          const comment: Comment = {
            id: item.id,
            text: item.snippet.topLevelComment.snippet.textDisplay,
            author: item.snippet.topLevelComment.snippet.authorDisplayName,
            publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
            likeCount: item.snippet.topLevelComment.snippet.likeCount || 0,
            replies: []
          };

          // Fetch replies if enabled
          if (filters.includeReplies && item.snippet.totalReplyCount > 0) {
            if (item.replies?.comments) {
              comment.replies = item.replies.comments.map((reply: any) => ({
                id: reply.id,
                text: reply.snippet.textDisplay,
                author: reply.snippet.authorDisplayName,
                publishedAt: reply.snippet.publishedAt,
                likeCount: reply.snippet.likeCount || 0
              }));
            } else {
              comment.replies = await fetchReplies(comment.id);
            }
          }

          newComments.push(comment);
        }

        if (!data.nextPageToken || newComments.length >= filters.maxComments) break;
        nextPageToken = data.nextPageToken;
      }

      const filteredComments = filterComments(newComments);
      setComments(filteredComments);
      setStatus(`Fetched ${filteredComments.length} comments successfully.`);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Failed to fetch comments'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchDownload = async () => {
    const urls = batchUrls.split('\n').filter(url => url.trim());
    if (urls.length === 0) return;

    setIsBatchMode(true); // Enable batch mode
    setIsLoading(true);
    setBatchResults([]);
    setComments([]); // Clear previous comments
    setVideoData(null); // Clear video data for batch mode
    setShowResults(false); // Hide results initially
    
    let allComments: Comment[] = [];
    
    for (let i = 0; i < urls.length; i++) {
      const videoId = extractVideoId(urls[i].trim());
      if (videoId) {
        setStatus(`Processing video ${i + 1}/${urls.length}...`);
        try {
          // Use the same download logic but collect all comments
          const newComments: Comment[] = [];
          let nextPageToken = '';
          
          for (let j = 0; j < MAX_PAGES; j++) {
            const url = `https://www.googleapis.com/youtube/v3/commentThreads?` +
                       `part=snippet,replies&videoId=${videoId}&key=${API_KEY}&` +
                       `maxResults=${MAX_RESULTS}&pageToken=${nextPageToken}&order=${filters.sortBy}`;

            const response = await fetch(url);
            const data = await response.json();

            if (response.status !== 200) {
              throw new Error(`API Error (${response.status}): ${data.error?.message || 'Unknown error'}`);
            }

            for (const item of data.items) {
              const comment: Comment = {
                id: item.id,
                text: item.snippet.topLevelComment.snippet.textDisplay,
                author: item.snippet.topLevelComment.snippet.authorDisplayName,
                publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
                likeCount: item.snippet.topLevelComment.snippet.likeCount || 0,
                replies: []
              };

              if (filters.includeReplies && item.snippet.totalReplyCount > 0) {
                if (item.replies?.comments) {
                  comment.replies = item.replies.comments.map((reply: any) => ({
                    id: reply.id,
                    text: reply.snippet.textDisplay,
                    author: reply.snippet.authorDisplayName,
                    publishedAt: reply.snippet.publishedAt,
                    likeCount: reply.snippet.likeCount || 0
                  }));
                } else {
                  comment.replies = await fetchReplies(comment.id);
                }
              }

              newComments.push(comment);
            }

            if (!data.nextPageToken || newComments.length >= filters.maxComments) break;
            nextPageToken = data.nextPageToken;
          }

          const filteredComments = filterComments(newComments);
          allComments = [...allComments, ...filteredComments];
          
          setBatchResults(prev => [...prev, { 
            videoId, 
            status: 'success', 
            comments: filteredComments.length 
          }]);
        } catch (error) {
          setBatchResults(prev => [...prev, { 
            videoId, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }]);
        }
      }
    }
    
    setComments(allComments);
    setStatus(`Batch download complete. Total comments: ${allComments.length}`);
    setShowResults(true);
    setIsLoading(false);
  };

  const downloadComments = (format: 'txt' | 'json' | 'csv' | 'pdf' = 'txt') => {
    let content = '';
    let mimeType = 'text/plain';
    let filename = `youtube_comments.${format}`;

    switch (format) {
      case 'json':
        content = JSON.stringify(comments, null, 2);
        mimeType = 'application/json';
        break;
      case 'csv':
        content = 'Author,Text,Published At,Likes,Type\n';
        comments.forEach(comment => {
          content += `"${comment.author}","${comment.text.replace(/"/g, '""')}","${comment.publishedAt}","${comment.likeCount}","Comment"\n`;
          if (comment.replies) {
            comment.replies.forEach(reply => {
              content += `"${reply.author}","${reply.text.replace(/"/g, '""')}","${reply.publishedAt}","${reply.likeCount}","Reply"\n`;
            });
          }
        });
        mimeType = 'text/csv';
        break;
      default:
        content = comments.map(comment => {
          let text = `Author: ${comment.author}\nPublished: ${new Date(comment.publishedAt).toLocaleString()}\nLikes: ${comment.likeCount}\n\n${comment.text}\n\n`;
          if (comment.replies && comment.replies.length > 0) {
            text += 'Replies:\n';
            comment.replies.forEach(reply => {
              text += `  └ ${reply.author} (${reply.likeCount} likes): ${reply.text}\n`;
            });
            text += '\n';
          }
          text += '---\n\n';
          return text;
        }).join('');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTopComments = () => {
    return [...comments]
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 10);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const seoConfig = toolsSEO['comment-downloader'];
  const schemaData = generateToolSchema('comment-downloader', seoConfig);

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical="https://youtool.io/tools/comment-downloader"
        schemaData={schemaData}
      />
      <S.PageWrapper>
      <S.MainContainer>
        <S.BackButton onClick={() => navigate('/tools')}>
          <i className="bx bx-arrow-back"></i>
          Back to Tools
        </S.BackButton>

        {/* Enhanced Header Section */}
        <S.EnhancedHeader backgroundImage={toolConfig.image}>
          <S.HeaderOverlay />
          <S.HeaderContent>
            <S.ToolIconContainer>
              <i className={toolConfig.icon}></i>
            </S.ToolIconContainer>
            
            <S.HeaderTextContent>
              <S.ToolTitle>{toolConfig.name}</S.ToolTitle>
              <S.ToolDescription>{toolConfig.description}</S.ToolDescription>
              
              <S.FeaturesList>
                {toolConfig.features.map((feature, index) => (
                  <S.FeatureItem key={index}>
                    <i className="bx bx-check-circle"></i>
                    <span>{feature}</span>
                  </S.FeatureItem>
                ))}
              </S.FeaturesList>

              {/* Integrated Search Bar */}
              <S.HeaderSearchContainer>
                <S.HeaderSearchBar>
                  <S.HeaderSearchInput
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Enter YouTube video URL to download comments"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <S.HeaderSearchButton onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? (
                      <i className='bx bx-loader-alt bx-spin'></i>
                    ) : (
                      <i className='bx bx-search'></i>
                    )}
                  </S.HeaderSearchButton>
                </S.HeaderSearchBar>
              </S.HeaderSearchContainer>
            </S.HeaderTextContent>
          </S.HeaderContent>
        </S.EnhancedHeader>

        <S.ToggleContainer>
            <S.ToggleButton 
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'active' : ''}
            >
              <i className="bx bx-filter"></i>
              Advanced Filters
            </S.ToggleButton>
            <S.ToggleButton 
              onClick={() => setShowBatch(!showBatch)}
              className={showBatch ? 'active' : ''}
            >
              <i className="bx bx-list-ul"></i>
              Batch Download
            </S.ToggleButton>
          </S.ToggleContainer>

        {showFilters && (
          <S.FiltersContainer>
            <S.FilterGrid>
              <S.FilterGroup>
                <S.FilterLabel>Maximum Comments</S.FilterLabel>
                <S.FilterSelect
                  value={filters.maxComments}
                  onChange={(e) => setFilters({...filters, maxComments: parseInt(e.target.value)})}
                >
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                  <option value={1000}>1,000</option>
                  <option value={2000}>2,000</option>
                  <option value={5000}>5,000</option>
                </S.FilterSelect>
              </S.FilterGroup>

              <S.FilterGroup>
                <S.FilterLabel>Sort By</S.FilterLabel>
                <S.FilterSelect
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value as 'relevance' | 'time'})}
                >
                  <option value="relevance">Relevance</option>
                  <option value="time">Most Recent</option>
                </S.FilterSelect>
              </S.FilterGroup>

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
                id="includeReplies"
                checked={filters.includeReplies}
                onChange={(e) => setFilters({...filters, includeReplies: e.target.checked})}
              />
              <S.CheckboxLabel htmlFor="includeReplies">
                Include replies to comments
              </S.CheckboxLabel>
            </S.CheckboxGroup>
          </S.FiltersContainer>
        )}

        {showBatch && (
          <S.BatchContainer>
            <S.BatchLabel>Batch Download (one URL per line)</S.BatchLabel>
            <S.BatchTextarea
              value={batchUrls}
              onChange={(e) => setBatchUrls(e.target.value)}
              placeholder="https://youtube.com/watch?v=VIDEO_ID_1&#10;https://youtube.com/watch?v=VIDEO_ID_2&#10;..."
              rows={5}
            />
            <S.BatchButton onClick={handleBatchDownload} disabled={isLoading || !batchUrls.trim()}>
              <i className="bx bx-download"></i>
              Download All
            </S.BatchButton>
          </S.BatchContainer>
        )}

        {status && <S.Status>{status}</S.Status>}

        {/* Educational Content Section */}
        {!showResults && (
          <S.EducationalSection>
            
            <S.EducationalContent>
              <S.SectionSubTitle>How to Use the Comment Downloader</S.SectionSubTitle>
              
              <S.EducationalText>
                Our Comment Downloader extracts all comments from any YouTube video, providing valuable audience 
                insights, feedback analysis, and engagement data. Perfect for content creators, researchers, 
                and marketers seeking to understand audience sentiment and improve content strategy.
              </S.EducationalText>

              <S.StepByStep>
                <S.StepItem>
                  <S.StepNumberCircle>1</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Enter Video URL</S.StepTitle>
                    <S.EducationalText>
                      Paste any YouTube video URL to begin comment extraction. Our system supports all 
                      video formats including regular videos, shorts, and live streams. We efficiently 
                      process videos with thousands of comments.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>2</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Comment Processing</S.StepTitle>
                    <S.EducationalText>
                      Our advanced scraping technology extracts all visible comments, including replies, 
                      timestamps, author information, and engagement metrics. We organize comments by 
                      popularity, recency, and thread structure.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>3</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Download & Analyze</S.StepTitle>
                    <S.EducationalText>
                      Export comments in multiple formats including CSV, JSON, or plain text. Use the 
                      organized data for sentiment analysis, audience research, content improvement, 
                      and competitive intelligence gathering.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
              </S.StepByStep>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Comment Analysis Features</S.SectionSubTitle>
              
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Complete Comment Extraction:</strong> Download all comments including replies and nested conversations</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Author Information:</strong> Capture commenter usernames, profile links, and engagement history</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Timestamp Data:</strong> Get precise comment timing for temporal analysis and engagement patterns</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Like/Dislike Metrics:</strong> Track comment popularity and audience sentiment indicators</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Thread Organization:</strong> Maintain comment hierarchy and conversation structure</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Multiple Export Formats:</strong> Save as CSV, JSON, XML, or plain text for various analysis tools</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Bulk Processing:</strong> Handle multiple videos and large comment volumes efficiently</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Sentiment Indicators:</strong> Basic sentiment analysis and engagement quality assessment</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

          </S.EducationalSection>
        )}

        <S.ResultsContainer className={showResults ? 'visible' : ''}>
          {isLoading ? (
            <S.LoadingContainer>
              <i className='bx bx-loader-alt bx-spin'></i>
              <p>Processing comments...</p>
            </S.LoadingContainer>
          ) : comments.length > 0 ? (
            <>
              {/* Only show video info for single video downloads, not batch */}
              {!isBatchMode && videoData && (
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
                        {comments.length} comments downloaded
                      </S.MetaItem>
                    </S.VideoMeta>
                  </S.VideoDetails>
                </S.VideoInfo>
              )}

              {/* Show batch results if in batch mode */}
              {isBatchMode && batchResults.length > 0 && (
                <S.BatchResultsSection>
                  <S.SectionTitle>
                    <i className="bx bx-list-check"></i>
                    Batch Download Results
                  </S.SectionTitle>
                  <S.BatchResultsList>
                    {batchResults.map((result, index) => (
                      <S.BatchResultItem key={index} success={result.status === 'success'}>
                        <S.BatchResultIcon>
                          {result.status === 'success' ? (
                            <i className="bx bx-check-circle"></i>
                          ) : (
                            <i className="bx bx-error-circle"></i>
                          )}
                        </S.BatchResultIcon>
                        <S.BatchResultDetails>
                          <S.BatchResultVideoId>Video ID: {result.videoId}</S.BatchResultVideoId>
                          {result.status === 'success' ? (
                            <S.BatchResultComments>{result.comments} comments downloaded</S.BatchResultComments>
                          ) : (
                            <S.BatchResultError>Error: {result.error}</S.BatchResultError>
                          )}
                        </S.BatchResultDetails>
                      </S.BatchResultItem>
                    ))}
                  </S.BatchResultsList>
                </S.BatchResultsSection>
              )}

              <S.DownloadSection>
                <S.SectionTitle>
                  <i className="bx bx-download"></i>
                  Download Options
                </S.SectionTitle>
                <S.DownloadGrid>
                  <S.DownloadButton onClick={() => downloadComments('txt')}>
                    <i className="bx bx-file-txt"></i>
                    Download as TXT
                  </S.DownloadButton>
                  <S.DownloadButton onClick={() => downloadComments('json')}>
                    <i className="bx bx-file-json"></i>
                    Download as JSON
                  </S.DownloadButton>
                  <S.DownloadButton onClick={() => downloadComments('csv')}>
                    <i className="bx bx-spreadsheet"></i>
                    Download as CSV
                  </S.DownloadButton>
                </S.DownloadGrid>
              </S.DownloadSection>

              {getTopComments().length > 0 && (
                <S.TopCommentsSection>
                  <S.SectionTitle>
                    <i className="bx bx-trending-up"></i>
                    Top Comments by Likes
                  </S.SectionTitle>
                  <S.CommentsList>
                    {getTopComments().slice(0, 5).map((comment, index) => (
                      <S.CommentItem key={comment.id}>
                        <S.CommentHeader>
                          <S.CommentAuthor>{comment.author}</S.CommentAuthor>
                          <S.CommentLikes>
                            <i className="bx bx-like"></i>
                            {comment.likeCount}
                          </S.CommentLikes>
                        </S.CommentHeader>
                        <S.CommentText>{comment.text}</S.CommentText>
                        <S.CommentDate>
                          {new Date(comment.publishedAt).toLocaleDateString()}
                        </S.CommentDate>
                      </S.CommentItem>
                    ))}
                  </S.CommentsList>
                </S.TopCommentsSection>
              )}

              <S.AILinks>
                <S.AILinkText>Analyze your comments with AI:</S.AILinkText>
                <S.AIButtonGrid>
                  <a href="https://chat.openai.com/" target="_blank" rel="noopener noreferrer">
                    <S.AIButton color="#10a37f">
                      <i className="bx bx-bot"></i>
                      ChatGPT
                    </S.AIButton>
                  </a>
                  <a href="https://gemini.google.com/chat" target="_blank" rel="noopener noreferrer">
                    <S.AIButton color="#4285f4">
                      <i className="bx bx-diamond"></i>
                      Gemini
                    </S.AIButton>
                  </a>
                  <a href="https://claude.ai/new" target="_blank" rel="noopener noreferrer">
                    <S.AIButton color="#cc785c">
                      <i className="bx bx-brain"></i>
                      Claude
                    </S.AIButton>
                  </a>
                </S.AIButtonGrid>
              </S.AILinks>
            </>
          ) : null}
        </S.ResultsContainer>
      </S.MainContainer>
    </S.PageWrapper>
    </>
  );
};

export default CommentDownloader;