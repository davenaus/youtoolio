// src/pages/Tools/components/ChannelConsultant/ChannelConsultant.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdSense } from '../../../../components/AdSense/AdSense';
import * as S from './styles';

interface ChannelData {
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: {
        url: string;
      };
      medium?: {
        url: string;
      };
      high?: {
        url: string;
      };
    };
  };
  statistics: {
    subscriberCount: string;
  };
  topicDetails?: {
    topicCategories?: string[];
  };
}

export const ChannelConsultant: React.FC = () => {
  const navigate = useNavigate();
  const [channelUrl, setChannelUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [instructions, setInstructions] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const getChannelId = async (url: string): Promise<string> => {
    // Check if it's a direct channel ID
    if (/^UC[\w-]{22}$/.test(url)) {
      return url;
    }

    const patterns = {
      channelId: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/([^\/\s]+)/,
      user: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/user\/([^\/\s]+)/,
      handle: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([^\/\s]+)/,
      customUrl: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c\/|)([^\/\s]+)/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const match = url.match(pattern);
      if (match) {
        if (type === 'channelId') return match[1];
        
        const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
        if (!API_KEY) {
          throw new Error('YouTube API key not configured');
        }

        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=id&${type === 'user' ? 'forUsername' : 'forHandle'}=${match[1]}&key=${API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch channel data');
        }

        const data = await response.json();
        if (data.items?.[0]) {
          return data.items[0].id;
        }
      }
    }
    throw new Error('Invalid YouTube URL format');
  };

  const getChannelData = async (channelId: string): Promise<ChannelData> => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?` +
      `part=snippet,statistics,topicDetails&id=${channelId}&key=${API_KEY}`
    );
    const data = await response.json();
    if (!data.items?.[0]) throw new Error('Channel not found');
    return data.items[0];
  };

  const generateInstructions = (channelData: ChannelData): string => {
    const channelName = channelData.snippet.title;
    const channelDescription = channelData.snippet.description;
    const channelCategory = channelData.topicDetails?.topicCategories?.[0]?.split('/').pop() || 'Unknown';

    return `These are instructions for how you are to act throughout our conversation. Your first message should be:

"Hello ${channelName}. I see you're a channel in the ${channelCategory} category. Could you tell me your channel niche / main topic discussed?"

After the user responds with their channel niche, say:

"Thank you for sharing that information. I'm here to assist you with various aspects of your YouTube channel. Here are the available modes:

SEO MODE
IDEATION MODE
SCRIPT MODE
TRENDJACK MODE

Which mode would you like to use?"

You will name this conversation "YouTube Bot for ${channelName}"

Channel Name: ${channelName}
Channel Category: ${channelCategory}
Channel Description: ${channelDescription}

The bot is designed to assist with ideation, SEO, thumbnails, tags, titles, descriptions, and hashtags for the user's YouTube channel. It operates in four modes: SEO mode, Ideation mode, Script mode, and Trendjack mode.

Modes of Operation 

SEO Mode: Activated when the user types "SEO MODE". Initial Prompt:
"SEO MODE ACTIVATED. Based on your channel niche, please provide a specific video topic or transcript to proceed."

The bot prompts the user for a video transcript and generates assets based on it. Titles: Generates 5 title options, each no longer than 40 characters, with clear meaning and capitalized words to encourage clicks. Do not use any colons. No colons are to be used in the titles. (do not include number of characters in your response) Description: Follows a template that includes a short video description (2-3 short sentences) using prominent keywords. (formatting is very important here) Carriage return and then a links section under that starting like this, "🔗 Links:", then another carriage return, then the timestamps starting like this, "👇 Timestamps:" Then a call to action to subscribe, and then 3 hashtags related to the video content. Tags: Creates 15-20 tags separated by commas for easy copying and pasting. Tags play a minimal role in video ranking; they're not the key to skyrocketing views. Tags help with common misspellings and keywords, but their impact is small compared to other factors. Using irrelevant tags can harm your channel by misleading viewers and the algorithm. Relevant tags should accurately reflect the video's content. In SEO mode, after generating the titles, the bot should proceed to create the description, tags, and then generate a thumbnail in that order. Thumbnails: At the end of the response, ask the user to prompt Y or N to start the render process for a thumbnail. YOU will generate a detailed description of the thumbnail and ask the user if they approve of the idea at the end. Create thumbnails with only a 16x9 aspect ratio and 2 to 3 prominent subjects. (Add these things to the thumbnails: Bright Colors: Use a vibrant and contrasting color palette. Three Main Subject Components: Person: Feature a person or people with expressive faces. Situation or Item: Highlight the main situation or item that is central to the video's content. Text: Include large, bold text that is easy to read. Expressive Face: Ensure the person or people have exaggerated facial expressions to convey strong emotions. Large Bold Text: Use text that is prominent and stands out against the background for easy readability. Clear Focus: Ensure that the main subjects of your thumbnail (person, situation/item, and text) are the focal points and easily distinguishable. Contrast: Use contrasting colors and elements to make the text and main subjects stand out from the background. Simplicity: Keep the design simple and uncluttered so that the main elements are easily identifiable. Quality: Use high-resolution images and graphics to ensure your thumbnail looks professional and clear on all devices. Dramatic Sticker Effects: Emphasizing the main subject with pronounced sticker effects to make it stand out prominently against the background. Vibrant Background with High Contrast: Choosing dynamic, contrasting backgrounds to ensure the thumbnail pops and grabs attention. Intriguing Elements: Incorporating elements like arrows to spark curiosity and hint at the video's content. Sense of Urgency or Challenge: Crafting titles that create excitement and urgency, making the content feel unmissable.) 

Ideation Mode: This mode is activated when the user selects "Ideation." 
Initial Prompt:
"IDEATION MODE ACTIVATED. Based on your channel niche, I'll generate some video ideas for you. Would you like to focus on any particular aspect or sub-topic within your niche?"
The bot will ask for the channel's niche and, based on the user's response, generate 10 specific video ideas, giving just the video's title. The user can ask for more options or a more detailed explanation of the ideas listed.

Script Mode: This mode is activated when the user types "SCRIPT MODE" 
Initial Prompt:
"SCRIPT MODE ACTIVATED. Considering your channel's focus, what specific topic would you like me to create a script for?"
Functionality:
Ask the user for the topic input.
Deliver the script in paragraph form without action lines, approximately 5,000 words.

Trendjack Mode:
Initial Prompt:
"TRENDJACK MODE ACTIVATED. Given your channel's focus, I'll search for upcoming events or trends that could be relevant. Would you like me to focus on any particular aspect of your niche?"

This mode should ask for the channel's niche and then, if available, search the web for upcoming events or dates correlating with the channel Niche. This could be things like an upcoming product launch for video production, a new update to piece of software, or even a holiday like Christmas. Be simple and direct with your response. Give a bold title of the event, and then a small 2-3 sentence paragraph about the event. Provide 5-6 events. Make sure to provide the date or date range of the events, and aim to only pull things that are coming up within the next 2 months. Prioritize launches and software updates. You need to confirm any events you pull by searching the web before providing them. 

SEO Guidelines Keywords: Use the main keyword at the beginning of the title and description, and incorporate secondary keywords throughout. Capitalization: Capitalize the first letter of each word in titles. Value Proposition: Clearly state the value proposition in descriptions. Use Numbers and Emotion in Titles: Boost CTR with numbers and emotionally charged words. Avoid Clickbait: Ensure titles accurately represent video content to avoid negative impacts on performance. Bot Interaction The bot should be straightforward and provide only the requested information. Button labels are "Ideation Mode", "Script Mode", "Trendjack Mode", and "SEO Mode". Initial responses should start with "(Chosen mode) ACTIVATED". Make the title of the chat the mode name, then a 3-word synopsis of the chat topic.`;
  };

  const handleAnalyze = async () => {
    if (!channelUrl.trim()) {
      alert('Please enter a YouTube channel URL');
      return;
    }

    setIsLoading(true);
    setShowResults(false);
    setCopySuccess(false);

    try {
      const channelId = await getChannelId(channelUrl);
      const data = await getChannelData(channelId);
      const generatedInstructions = generateInstructions(data);
      
      setChannelData(data);
      setInstructions(generatedInstructions);
      setShowResults(true);
    } catch (error) {
      console.error('Error:', error);
      alert(`Error analyzing channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(instructions);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy instructions. Please try again.');
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
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
          <S.Title>Channel Consultant</S.Title>
          <S.Subtitle>
            Generate custom AI bot instructions tailored to any YouTube channel for content optimization
          </S.Subtitle>
        </S.Header>

        <S.SearchContainer>
          <S.SearchBar>
            <S.SearchInput
              type="text"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              placeholder="Enter YouTube channel URL, @handle, or ID to create custom bot"
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <S.SearchButton onClick={handleAnalyze} disabled={isLoading}>
              {isLoading ? (
                <i className='bx bx-loader-alt bx-spin'></i>
              ) : (
                <i className='bx bx-bot'></i>
              )}
            </S.SearchButton>
          </S.SearchBar>
        </S.SearchContainer>

        <S.ResultsContainer className={showResults ? 'visible' : ''}>
          {isLoading ? (
            <S.LoadingContainer>
              <i className='bx bx-loader-alt bx-spin'></i>
              <p>Creating custom bot instructions...</p>
            </S.LoadingContainer>
          ) : channelData ? (
            <S.ResultCard>
              <S.SuccessHeader>
                <i className="bx bx-check-circle"></i>
                <S.SuccessTitle>Custom Bot Created Successfully!</S.SuccessTitle>
              </S.SuccessHeader>
              
              <S.ChannelInfo>
                <S.ChannelLogoContainer>
                  <S.ChannelLogo 
                    src={channelData.snippet.thumbnails.high?.url || 
                         channelData.snippet.thumbnails.medium?.url || 
                         channelData.snippet.thumbnails.default.url} 
                    alt="Channel Profile"
                  />
                </S.ChannelLogoContainer>
                <S.ChannelDetails>
                  <S.ChannelName>{channelData.snippet.title}</S.ChannelName>
                  <S.SubscriberCount>
                    <i className="bx bx-user"></i>
                    {formatNumber(parseInt(channelData.statistics.subscriberCount))} subscribers
                  </S.SubscriberCount>
                </S.ChannelDetails>
              </S.ChannelInfo>

              <S.BotsSection>
                <S.SectionTitle>
                  <i className="bx bx-cog"></i>
                  Available Bot Modes
                </S.SectionTitle>
                
                <S.ModesGrid>
                  <S.ModeCard>
                    <S.ModeIcon className="bx bx-search-alt-2"></S.ModeIcon>
                    <S.ModeTitle>SEO MODE</S.ModeTitle>
                    <S.ModeDescription>Generates optimized titles, descriptions, tags, and thumbnails</S.ModeDescription>
                  </S.ModeCard>
                  
                  <S.ModeCard>
                    <S.ModeIcon className="bx bx-bulb"></S.ModeIcon>
                    <S.ModeTitle>IDEATION MODE</S.ModeTitle>
                    <S.ModeDescription>Creates video ideas based on channel niche and trending topics</S.ModeDescription>
                  </S.ModeCard>
                  
                  <S.ModeCard>
                    <S.ModeIcon className="bx bx-edit-alt"></S.ModeIcon>
                    <S.ModeTitle>SCRIPT MODE</S.ModeTitle>
                    <S.ModeDescription>Writes detailed 5,000-word scripts for specific topics</S.ModeDescription>
                  </S.ModeCard>
                  
                  <S.ModeCard>
                    <S.ModeIcon className="bx bx-trending-up"></S.ModeIcon>
                    <S.ModeTitle>TRENDJACK MODE</S.ModeTitle>
                    <S.ModeDescription>Finds upcoming events and trends relevant to your niche</S.ModeDescription>
                  </S.ModeCard>
                </S.ModesGrid>
              </S.BotsSection>

              <S.ActionsSection>
                <S.InstructionsText>
                  Copy the bot instructions below and paste them into any AI chatbot to get started:
                </S.InstructionsText>

                <S.CopyButton onClick={handleCopy} success={copySuccess}>
                  {copySuccess ? (
                    <>
                      <i className="bx bx-check"></i>
                      Copied Successfully!
                    </>
                  ) : (
                    <>
                      <i className="bx bx-copy"></i>
                      Copy Bot Instructions
                    </>
                  )}
                </S.CopyButton>

                <S.AILinksSection>
                  <S.AILinksTitle>Popular AI Platforms:</S.AILinksTitle>
                  <S.AILinks>
                    <S.AIButton 
                      href="https://chat.openai.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      color="#10a37f"
                    >
                      <i className="bx bx-bot"></i>
                      ChatGPT
                    </S.AIButton>
                    <S.AIButton 
                      href="https://gemini.google.com/chat" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      color="#4285f4"
                    >
                      <i className="bx bx-diamond"></i>
                      Gemini
                    </S.AIButton>
                    <S.AIButton 
                      href="https://claude.ai/new" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      color="#ff6b35"
                    >
                      <i className="bx bx-brain"></i>
                      Claude
                    </S.AIButton>
                  </S.AILinks>
                </S.AILinksSection>
              </S.ActionsSection>

              {/* Bottom Ad for smaller screens */}
              <S.BottomAdContainer>
                <AdSense 
                  slot={process.env.REACT_APP_ADSENSE_SLOT_BOTTOM || ''}
                  format="horizontal"
                />
              </S.BottomAdContainer>
            </S.ResultCard>
          ) : null}
        </S.ResultsContainer>
      </S.MainContainer>
    </S.PageWrapper>
  );
};

export default ChannelConsultant;