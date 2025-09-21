// Analytics calculation engine for Video Analyzer Ask tab - COMPLETE VERSION

import moment from 'moment';
import { AnalyticsQuestion } from './analyticsQuestions';

export interface AnalyticsResult {
  questionId: string;
  question: string;
  answer: string;
  value: any; // Allow any type for complex analytics results
  details: string[];
  insights: string[];
  charts?: {
    type: 'bar' | 'line' | 'pie' | 'timeline';
    data: any[];
    labels: string[];
  };
}

export interface VideoData {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelId: string;
    tags?: string[];
    categoryId: string;
  };
  statistics: {
    viewCount: string;
    likeCount?: string;
    commentCount?: string;
  };
  contentDetails: {
    duration: string;
  };
}

export interface ChannelData {
  snippet: {
    title: string;
    publishedAt: string;
  };
  statistics: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
  };
}

export interface ChannelVideo {
  id: string;
  title: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration?: number;
  isShort?: boolean;
}

export class AnalyticsCalculator {
  private videoData: VideoData;
  private channelData: ChannelData;
  private channelVideos: ChannelVideo[];

  constructor(videoData: VideoData, channelData: ChannelData, channelVideos: ChannelVideo[]) {
    this.videoData = videoData;
    this.channelData = channelData;
    this.channelVideos = channelVideos;
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  private categorizeByDuration(videos: ChannelVideo[]): { shorts: ChannelVideo[], longForm: ChannelVideo[] } {
    const shorts: ChannelVideo[] = [];
    const longForm: ChannelVideo[] = [];
    
    videos.forEach(video => {
      if (video.duration && video.duration <= 60) {
        video.isShort = true;
        shorts.push(video);
      } else {
        video.isShort = false;
        longForm.push(video);
      }
    });
    
    return { shorts, longForm };
  }

  private getRecentVideos(days: number): ChannelVideo[] {
    const cutoffDate = moment().subtract(days, 'days');
    return this.channelVideos.filter(video => 
      moment(video.publishedAt).isAfter(cutoffDate)
    );
  }

  // ============================================================================
  // POSTING FREQUENCY & CONSISTENCY CALCULATIONS
  // ============================================================================

  private calculatePostingFrequency(videoType: 'long-form' | 'shorts' | 'both'): AnalyticsResult {
    const { shorts, longForm } = this.categorizeByDuration(this.channelVideos);
    let targetVideos = videoType === 'shorts' ? shorts : videoType === 'long-form' ? longForm : this.channelVideos;
    
    if (targetVideos.length === 0) {
      return {
        questionId: 'posting-frequency-avg',
        question: `On average, how often does this channel post ${videoType === 'both' ? 'videos' : videoType}?`,
        answer: 'No data available',
        value: null,
        details: [`No ${videoType} videos found in the analyzed data.`],
        insights: ['Try analyzing a channel with more upload history.']
      };
    }

    const channelAge = moment().diff(moment(this.channelData.snippet.publishedAt), 'days');
    const postsPerWeek = (targetVideos.length / Math.max(channelAge / 7, 1));
    const postsPerMonth = postsPerWeek * 4.33;
    
    let frequency = '';
    let details = [];
    
    if (postsPerWeek >= 7) {
      frequency = `${postsPerWeek.toFixed(1)} videos per week (multiple daily)`;
    } else if (postsPerWeek >= 1) {
      frequency = `${postsPerWeek.toFixed(1)} videos per week`;
    } else if (postsPerMonth >= 1) {
      frequency = `${postsPerMonth.toFixed(1)} videos per month`;
    } else {
      const postsPerYear = postsPerMonth * 12;
      frequency = `${postsPerYear.toFixed(1)} videos per year`;
    }

    details.push(`Total ${videoType} videos: ${targetVideos.length}`);
    details.push(`Channel age: ${Math.floor(channelAge / 365)} years, ${Math.floor((channelAge % 365) / 30)} months`);
    details.push(`Average time between uploads: ${Math.round(channelAge / targetVideos.length)} days`);

    const insights = [];
    if (postsPerWeek > 3) {
      insights.push('High posting frequency - great for algorithm favor and audience retention');
    } else if (postsPerWeek > 1) {
      insights.push('Consistent posting schedule - good for building audience expectations');
    } else if (postsPerMonth < 1) {
      insights.push('Infrequent posting - consider increasing upload frequency for better growth');
    }

    return {
      questionId: 'posting-frequency-avg',
      question: `On average, how often does this channel post ${videoType === 'both' ? 'videos' : videoType}?`,
      answer: frequency,
      value: postsPerWeek,
      details,
      insights
    };
  }

  private calculatePostingDayPattern(): AnalyticsResult {
    const dayMap: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 
      'Thursday': 0, 'Friday': 0, 'Saturday': 0
    };

    this.channelVideos.forEach(video => {
      const dayOfWeek = moment(video.publishedAt).format('dddd');
      dayMap[dayOfWeek]++;
    });

    const sortedDays = Object.entries(dayMap)
      .sort(([,a], [,b]) => b - a)
      .filter(([,count]) => count > 0);

    const topDay = sortedDays[0];
    const totalVideos = this.channelVideos.length;
    
    const details = sortedDays.map(([day, count]) => 
      `${day}: ${count} videos (${((count / totalVideos) * 100).toFixed(1)}%)`
    );

    const insights = [];
    if (topDay[1] / totalVideos > 0.3) {
      insights.push(`Strong preference for ${topDay[0]} uploads - consider maintaining this pattern`);
    }
    if (sortedDays.length <= 3) {
      insights.push('Limited posting days - spreading across more days could improve reach');
    }

    return {
      questionId: 'posting-day-pattern',
      question: 'What day(s) of the week does the channel post most frequently?',
      answer: `${topDay[0]} (${((topDay[1] / totalVideos) * 100).toFixed(1)}% of uploads)`,
      value: topDay[0],
      details,
      insights,
      charts: {
        type: 'bar',
        data: sortedDays.map(([,count]) => count),
        labels: sortedDays.map(([day]) => day)
      }
    };
  }

  private calculatePostingTimePattern(): AnalyticsResult {
    const hourMap: { [key: number]: number } = {};
    
    this.channelVideos.forEach(video => {
      const hour = moment(video.publishedAt).hour();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });

    const sortedHours = Object.entries(hourMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    const topHour = sortedHours[0];
    const totalVideos = this.channelVideos.length;
    
    const formatHour = (hour: string) => {
      const h = parseInt(hour);
      return `${h === 0 ? 12 : h > 12 ? h - 12 : h}${h >= 12 ? 'PM' : 'AM'}`;
    };

    const details = sortedHours.map(([hour, count]) => 
      `${formatHour(hour)}: ${count} videos (${((count / totalVideos) * 100).toFixed(1)}%)`
    );

    const insights = [];
    const topHourInt = parseInt(topHour[0]);
    if (topHourInt >= 9 && topHourInt <= 17) {
      insights.push('Posting during business hours - good for immediate engagement');
    } else if (topHourInt >= 18 && topHourInt <= 22) {
      insights.push('Evening posting - optimal for after-work/school viewing');
    }

    return {
      questionId: 'posting-time-pattern',
      question: 'What time of day are most videos published?',
      answer: `${formatHour(topHour[0])} UTC (${((topHour[1] / totalVideos) * 100).toFixed(1)}% of uploads)`,
      value: topHour[0],
      details,
      insights
    };
  }

  private calculateUploadGaps(): AnalyticsResult {
    if (this.channelVideos.length < 2) {
      return {
        questionId: 'upload-gaps',
        question: 'What is the longest gap between uploads, and the shortest?',
        answer: 'Insufficient data',
        value: null,
        details: ['Need at least 2 videos to calculate gaps.'],
        insights: []
      };
    }

    const sortedVideos = [...this.channelVideos].sort((a, b) => 
      moment(a.publishedAt).unix() - moment(b.publishedAt).unix()
    );

    const gaps = [];
    for (let i = 1; i < sortedVideos.length; i++) {
      const gap = moment(sortedVideos[i].publishedAt).diff(moment(sortedVideos[i-1].publishedAt), 'days');
      gaps.push(gap);
    }

    const longestGap = Math.max(...gaps);
    const shortestGap = Math.min(...gaps);
    const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;

    const details = [
      `Total upload gaps analyzed: ${gaps.length}`,
      `Average gap: ${averageGap.toFixed(1)} days`,
      `Most consistent period: ${shortestGap} days`,
      `Longest break: ${longestGap} days`
    ];

    const insights = [];
    if (longestGap > 90) {
      insights.push('Long breaks detected - consistency is key for audience retention');
    }
    if (shortestGap < 1) {
      insights.push('Very frequent posting detected - ensure quality over quantity');
    }
    if (averageGap < 7) {
      insights.push('Consistent posting schedule - great for algorithm performance');
    }

    return {
      questionId: 'upload-gaps',
      question: 'What is the longest gap between uploads, and the shortest?',
      answer: `Longest: ${longestGap} days, Shortest: ${shortestGap} days`,
      value: { longest: longestGap, shortest: shortestGap },
      details,
      insights
    };
  }

  private calculateFrequencyTrend(): AnalyticsResult {
    if (this.channelVideos.length < 10) {
      return {
        questionId: 'frequency-trend',
        question: 'Has their posting frequency increased, decreased, or stayed consistent over time?',
        answer: 'Insufficient data for trend analysis',
        value: null,
        details: ['Need at least 10 videos to analyze trends.'],
        insights: []
      };
    }

    const sortedVideos = [...this.channelVideos].sort((a, b) => 
      moment(a.publishedAt).unix() - moment(b.publishedAt).unix()
    );

    const midpoint = Math.floor(sortedVideos.length / 2);
    const earlierHalf = sortedVideos.slice(0, midpoint);
    const laterHalf = sortedVideos.slice(midpoint);

    const earlierTimespan = moment(earlierHalf[earlierHalf.length-1].publishedAt)
      .diff(moment(earlierHalf[0].publishedAt), 'days');
    const laterTimespan = moment(laterHalf[laterHalf.length-1].publishedAt)
      .diff(moment(laterHalf[0].publishedAt), 'days');

    const earlierFreq = earlierHalf.length / Math.max(earlierTimespan / 7, 1);
    const laterFreq = laterHalf.length / Math.max(laterTimespan / 7, 1);

    const change = ((laterFreq - earlierFreq) / earlierFreq) * 100;
    
    let trend = 'stayed consistent';
    if (Math.abs(change) < 10) {
      trend = 'stayed consistent';
    } else if (change > 0) {
      trend = 'increased';
    } else {
      trend = 'decreased';
    }

    const details = [
      `Earlier period frequency: ${earlierFreq.toFixed(1)} videos/week`,
      `Recent period frequency: ${laterFreq.toFixed(1)} videos/week`,
      `Change: ${change > 0 ? '+' : ''}${change.toFixed(1)}%`
    ];

    const insights = [];
    if (Math.abs(change) > 25) {
      insights.push(`Significant ${change > 0 ? 'increase' : 'decrease'} in posting frequency`);
    }
    if (change > 0) {
      insights.push('Increased posting frequency can boost audience engagement');
    } else if (change < -20) {
      insights.push('Decreased posting may affect audience retention');
    }

    return {
      questionId: 'frequency-trend',
      question: 'Has their posting frequency increased, decreased, or stayed consistent over time?',
      answer: `Posting frequency has ${trend} (${change > 0 ? '+' : ''}${change.toFixed(1)}%)`,
      value: change,
      details,
      insights
    };
  }

  private calculateYearlyUploads(): AnalyticsResult {
    if (this.channelVideos.length === 0) {
      return {
        questionId: 'yearly-uploads',
        question: 'What is the average number of uploads per year, and how has that trended?',
        answer: 'No upload data available',
        value: null,
        details: [],
        insights: []
      };
    }

    const yearlyData: { [year: string]: number } = {};
    
    this.channelVideos.forEach(video => {
      const year = moment(video.publishedAt).year().toString();
      yearlyData[year] = (yearlyData[year] || 0) + 1;
    });

    const years = Object.keys(yearlyData).sort();
    const uploadsPerYear = Object.values(yearlyData);
    const averagePerYear = uploadsPerYear.reduce((sum, count) => sum + count, 0) / years.length;

    // Calculate trend
    const recentYears = years.slice(-3);
    const earlierYears = years.slice(0, -3);
    
    let trend = 'stable';
    if (recentYears.length >= 2 && earlierYears.length >= 2) {
      const recentAvg = recentYears.reduce((sum, year) => sum + yearlyData[year], 0) / recentYears.length;
      const earlierAvg = earlierYears.reduce((sum, year) => sum + yearlyData[year], 0) / earlierYears.length;
      
      const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
      if (change > 15) trend = 'increasing';
      else if (change < -15) trend = 'decreasing';
    }

    const details = years.map(year => `${year}: ${yearlyData[year]} uploads`);
    details.push(`Average per year: ${averagePerYear.toFixed(1)}`);

    const insights = [];
    if (trend === 'increasing') {
      insights.push('Upload frequency trending upward - good for channel growth');
    } else if (trend === 'decreasing') {
      insights.push('Upload frequency declining - consider content strategy review');
    }

    return {
      questionId: 'yearly-uploads',
      question: 'What is the average number of uploads per year, and how has that trended?',
      answer: `${averagePerYear.toFixed(1)} uploads/year, trending ${trend}`,
      value: averagePerYear,
      details,
      insights,
      charts: {
        type: 'bar',
        data: uploadsPerYear,
        labels: years
      }
    };
  }

  private calculateConsecutiveStreak(): AnalyticsResult {
    if (this.channelVideos.length < 5) {
      return {
        questionId: 'consecutive-streak',
        question: 'What is the average streak length of consecutive weeks/months with uploads?',
        answer: 'Insufficient data',
        value: null,
        details: ['Need at least 5 videos to analyze streaks.'],
        insights: []
      };
    }

    const sortedVideos = [...this.channelVideos].sort((a, b) => 
      moment(a.publishedAt).unix() - moment(b.publishedAt).unix()
    );

    // Group videos by week
    const weeklyUploads: { [key: string]: number } = {};
    sortedVideos.forEach(video => {
      const weekKey = moment(video.publishedAt).format('YYYY-WW');
      weeklyUploads[weekKey] = (weeklyUploads[weekKey] || 0) + 1;
    });

    const weeks = Object.keys(weeklyUploads).sort();
    const streaks: number[] = [];
    let currentStreak = 0;

    for (let i = 0; i < weeks.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const currentWeek = moment(weeks[i], 'YYYY-WW');
        const previousWeek = moment(weeks[i-1], 'YYYY-WW');
        const weeksDiff = currentWeek.diff(previousWeek, 'weeks');

        if (weeksDiff === 1) {
          currentStreak++;
        } else {
          if (currentStreak > 0) streaks.push(currentStreak);
          currentStreak = 1;
        }
      }
    }
    if (currentStreak > 0) streaks.push(currentStreak);

    const averageStreak = streaks.reduce((sum, streak) => sum + streak, 0) / streaks.length;
    const longestStreak = Math.max(...streaks);

    const details = [
      `Total streaks identified: ${streaks.length}`,
      `Longest streak: ${longestStreak} consecutive weeks`,
      `Average streak: ${averageStreak.toFixed(1)} weeks`,
      `Weeks with uploads: ${weeks.length}`
    ];

    const insights = [];
    if (averageStreak > 10) {
      insights.push('Strong consistency - long upload streaks help algorithm performance');
    } else if (averageStreak < 3) {
      insights.push('Short upload streaks - focus on maintaining consistent schedule');
    }

    return {
      questionId: 'consecutive-streak',
      question: 'What is the average streak length of consecutive weeks/months with uploads?',
      answer: `Average streak: ${averageStreak.toFixed(1)} weeks, longest: ${longestStreak} weeks`,
      value: averageStreak,
      details,
      insights
    };
  }

  private calculateHiatuses(): AnalyticsResult {
    if (this.channelVideos.length < 5) {
      return {
        questionId: 'hiatuses-analysis',
        question: 'Has the channel ever had notable hiatuses (gaps of more than 3 months)?',
        answer: 'Insufficient data',
        value: null,
        details: ['Need at least 5 videos to analyze hiatuses.'],
        insights: []
      };
    }

    const sortedVideos = [...this.channelVideos].sort((a, b) => 
      moment(a.publishedAt).unix() - moment(b.publishedAt).unix()
    );

    const hiatuses: Array<{start: string, end: string, duration: number}> = [];
    const HIATUS_THRESHOLD = 90; // 3 months

    for (let i = 1; i < sortedVideos.length; i++) {
      const gap = moment(sortedVideos[i].publishedAt).diff(moment(sortedVideos[i-1].publishedAt), 'days');
      if (gap > HIATUS_THRESHOLD) {
        hiatuses.push({
          start: moment(sortedVideos[i-1].publishedAt).format('YYYY-MM-DD'),
          end: moment(sortedVideos[i].publishedAt).format('YYYY-MM-DD'),
          duration: gap
        });
      }
    }

    const details = hiatuses.length > 0 
      ? hiatuses.map(h => `${h.start} to ${h.end}: ${h.duration} days`)
      : ['No significant hiatuses detected (gaps over 90 days)'];

    const insights = [];
    if (hiatuses.length === 0) {
      insights.push('No major breaks - consistent upload schedule maintained');
    } else {
      insights.push(`${hiatuses.length} significant break(s) detected - consistency is key for growth`);
      const longestHiatus = Math.max(...hiatuses.map(h => h.duration));
      insights.push(`Longest break: ${longestHiatus} days`);
    }

    return {
      questionId: 'hiatuses-analysis',
      question: 'Has the channel ever had notable hiatuses (gaps of more than 3 months)?',
      answer: hiatuses.length > 0 
        ? `${hiatuses.length} significant hiatuses detected`
        : 'No significant hiatuses detected',
      value: hiatuses.length,
      details,
      insights
    };
  }

  private calculateRecentUploadPercentage(): AnalyticsResult {
    const recentVideos = this.getRecentVideos(365); // Last 12 months
    const percentage = (recentVideos.length / this.channelVideos.length) * 100;

    const details = [
      `Total videos: ${this.channelVideos.length}`,
      `Videos in last 12 months: ${recentVideos.length}`,
      `Older videos: ${this.channelVideos.length - recentVideos.length}`
    ];

    const insights = [];
    if (percentage > 70) {
      insights.push('Highly active channel - most content is recent');
    } else if (percentage > 30) {
      insights.push('Balanced mix of recent and catalog content');
    } else {
      insights.push('Large back catalog - consider promoting older content');
    }

    return {
      questionId: 'recent-upload-percentage',
      question: 'What percentage of total uploads were made in the last 12 months?',
      answer: `${percentage.toFixed(1)}% of uploads are from the last 12 months`,
      value: percentage,
      details,
      insights
    };
  }

  // SHORTS-SPECIFIC POSTING FREQUENCY METHODS
  private calculateShortsFrequencyTrend(): AnalyticsResult {
    const { shorts } = this.categorizeByDuration(this.channelVideos);
    
    if (shorts.length < 10) {
      return {
        questionId: 'shorts-frequency-trend',
        question: 'Has the frequency of Shorts uploads increased, decreased, or stayed consistent?',
        answer: 'Insufficient Shorts data',
        value: null,
        details: ['Need at least 10 Shorts to analyze trends.'],
        insights: []
      };
    }

    const sortedShorts = shorts.sort((a, b) => 
      moment(a.publishedAt).unix() - moment(b.publishedAt).unix()
    );

    const midpoint = Math.floor(sortedShorts.length / 2);
    const earlierHalf = sortedShorts.slice(0, midpoint);
    const laterHalf = sortedShorts.slice(midpoint);

    const earlierTimespan = moment(earlierHalf[earlierHalf.length-1].publishedAt)
      .diff(moment(earlierHalf[0].publishedAt), 'days');
    const laterTimespan = moment(laterHalf[laterHalf.length-1].publishedAt)
      .diff(moment(laterHalf[0].publishedAt), 'days');

    const earlierFreq = earlierHalf.length / Math.max(earlierTimespan / 7, 1);
    const laterFreq = laterHalf.length / Math.max(laterTimespan / 7, 1);

    const change = ((laterFreq - earlierFreq) / earlierFreq) * 100;
    
    let trend = 'stayed consistent';
    if (Math.abs(change) < 10) {
      trend = 'stayed consistent';
    } else if (change > 0) {
      trend = 'increased';
    } else {
      trend = 'decreased';
    }

    const details = [
      `Earlier Shorts frequency: ${earlierFreq.toFixed(1)} per week`,
      `Recent Shorts frequency: ${laterFreq.toFixed(1)} per week`,
      `Change: ${change > 0 ? '+' : ''}${change.toFixed(1)}%`
    ];

    const insights = [];
    if (change > 50) {
      insights.push('Major increase in Shorts production - good for discovery');
    } else if (change < -30) {
      insights.push('Decreased Shorts frequency - they drive significant discovery');
    }

    return {
      questionId: 'shorts-frequency-trend',
      question: 'Has the frequency of Shorts uploads increased, decreased, or stayed consistent?',
      answer: `Shorts frequency has ${trend} (${change > 0 ? '+' : ''}${change.toFixed(1)}%)`,
      value: change,
      details,
      insights
    };
  }

  private calculateShortsPostingPattern(): AnalyticsResult {
    const { shorts } = this.categorizeByDuration(this.channelVideos);
    
    if (shorts.length === 0) {
      return {
        questionId: 'shorts-posting-pattern',
        question: 'Do Shorts uploads cluster on certain days of the week or times of day?',
        answer: 'No Shorts found',
        value: null,
        details: [],
        insights: []
      };
    }

    // Day analysis
    const dayMap: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 
      'Thursday': 0, 'Friday': 0, 'Saturday': 0
    };

    // Hour analysis
    const hourMap: { [key: number]: number } = {};

    shorts.forEach(video => {
      const dayOfWeek = moment(video.publishedAt).format('dddd');
      dayMap[dayOfWeek]++;
      
      const hour = moment(video.publishedAt).hour();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });

    const topDay = Object.entries(dayMap).sort(([,a], [,b]) => b - a)[0];
    const topHour = Object.entries(hourMap).sort(([,a], [,b]) => b - a)[0];

    const formatHour = (hour: string) => {
      const h = parseInt(hour);
      return `${h === 0 ? 12 : h > 12 ? h - 12 : h}${h >= 12 ? 'PM' : 'AM'}`;
    };

    const details = [
      `Most common day: ${topDay[0]} (${topDay[1]} Shorts)`,
      `Most common time: ${formatHour(topHour[0])} (${topHour[1]} Shorts)`,
      `Total Shorts analyzed: ${shorts.length}`
    ];

    const insights = [];
    if (topDay[1] / shorts.length > 0.3) {
      insights.push(`Strong ${topDay[0]} preference for Shorts posting`);
    }

    return {
      questionId: 'shorts-posting-pattern',
      question: 'Do Shorts uploads cluster on certain days of the week or times of day?',
      answer: `Most posted on ${topDay[0]} at ${formatHour(topHour[0])}`,
      value: { day: topDay[0], hour: topHour[0] },
      details,
      insights
    };
  }

  private calculateShortsUploadGaps(): AnalyticsResult {
    const { shorts } = this.categorizeByDuration(this.channelVideos);
    
    if (shorts.length < 2) {
      return {
        questionId: 'shorts-upload-gaps',
        question: 'What is the longest gap between Shorts uploads, and the shortest?',
        answer: 'Insufficient Shorts data',
        value: null,
        details: ['Need at least 2 Shorts to calculate gaps.'],
        insights: []
      };
    }

    const sortedShorts = shorts.sort((a, b) => 
      moment(a.publishedAt).unix() - moment(b.publishedAt).unix()
    );

    const gaps = [];
    for (let i = 1; i < sortedShorts.length; i++) {
      const gap = moment(sortedShorts[i].publishedAt).diff(moment(sortedShorts[i-1].publishedAt), 'days');
      gaps.push(gap);
    }

    const longestGap = Math.max(...gaps);
    const shortestGap = Math.min(...gaps);
    const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;

    const details = [
      `Shorts gaps analyzed: ${gaps.length}`,
      `Average gap: ${averageGap.toFixed(1)} days`,
      `Shortest gap: ${shortestGap} days`,
      `Longest gap: ${longestGap} days`
    ];

    const insights = [];
    if (averageGap < 3) {
      insights.push('Very frequent Shorts posting - great for algorithm boost');
    } else if (averageGap > 14) {
      insights.push('Infrequent Shorts posting - more consistency could help discovery');
    }

    return {
      questionId: 'shorts-upload-gaps',
      question: 'What is the longest gap between Shorts uploads, and the shortest?',
      answer: `Longest: ${longestGap} days, Shortest: ${shortestGap} days`,
      value: { longest: longestGap, shortest: shortestGap },
      details,
      insights
    };
  }

  // ============================================================================
  // VIDEO LENGTH & CONTENT MIX CALCULATIONS
  // ============================================================================

  private calculateAverageVideoLength(videoType: 'long-form' | 'shorts'): AnalyticsResult {
    const { shorts, longForm } = this.categorizeByDuration(this.channelVideos);
    const targetVideos = videoType === 'shorts' ? shorts : longForm;

    if (targetVideos.length === 0) {
      return {
        questionId: 'average-video-length',
        question: `What is the average video length for ${videoType}?`,
        answer: 'No data available',
        value: null,
        details: [`No ${videoType} videos found.`],
        insights: []
      };
    }

    const totalDuration = targetVideos.reduce((sum, video) => sum + (video.duration || 0), 0);
    const averageDuration = totalDuration / targetVideos.length;
    
    const details = [
      `Total ${videoType} videos: ${targetVideos.length}`,
      `Shortest: ${this.formatDuration(Math.min(...targetVideos.map(v => v.duration || 0)))}`,
      `Longest: ${this.formatDuration(Math.max(...targetVideos.map(v => v.duration || 0)))}`
    ];

    const insights = [];
    if (videoType === 'long-form') {
      if (averageDuration > 600) {
        insights.push('Long-form content ideal for deep engagement and ad revenue');
      } else if (averageDuration < 180) {
        insights.push('Short videos good for retention but may limit monetization');
      }
    } else {
      if (averageDuration > 45) {
        insights.push('Longer Shorts may have lower completion rates');
      } else if (averageDuration < 15) {
        insights.push('Very short content - ensure strong hook in first seconds');
      }
    }

    return {
      questionId: 'average-video-length',
      question: `What is the average video length for ${videoType}?`,
      answer: this.formatDuration(averageDuration),
      value: averageDuration,
      details,
      insights
    };
  }

  private calculateLengthTrend(): AnalyticsResult {
    const { longForm } = this.categorizeByDuration(this.channelVideos);
    
    if (longForm.length < 10) {
      return {
        questionId: 'length-trend',
        question: 'How has the average video length changed over time?',
        answer: 'Insufficient data for trend analysis',
        value: null,
        details: ['Need at least 10 long-form videos to analyze trends.'],
        insights: []
      };
    }

    const sortedVideos = longForm.sort((a, b) => 
      moment(a.publishedAt).unix() - moment(b.publishedAt).unix()
    );

    const midpoint = Math.floor(sortedVideos.length / 2);
    const earlierHalf = sortedVideos.slice(0, midpoint);
    const laterHalf = sortedVideos.slice(midpoint);

    const earlierAvgLength = earlierHalf.reduce((sum, v) => sum + (v.duration || 0), 0) / earlierHalf.length;
    const laterAvgLength = laterHalf.reduce((sum, v) => sum + (v.duration || 0), 0) / laterHalf.length;

    const change = ((laterAvgLength - earlierAvgLength) / earlierAvgLength) * 100;

    const details = [
      `Earlier average: ${this.formatDuration(earlierAvgLength)}`,
      `Recent average: ${this.formatDuration(laterAvgLength)}`,
      `Change: ${change > 0 ? '+' : ''}${change.toFixed(1)}%`
    ];

    const insights = [];
    if (Math.abs(change) > 20) {
      insights.push(`Significant ${change > 0 ? 'increase' : 'decrease'} in video length`);
    }
    if (laterAvgLength > 600) {
      insights.push('Longer videos are better for ad revenue and watch time');
    }

    return {
      questionId: 'length-trend',
      question: 'How has the average video length changed over time?',
      answer: `${change > 0 ? 'Increased' : 'Decreased'} by ${Math.abs(change).toFixed(1)}%`,
      value: change,
      details,
      insights
    };
  }

  private calculateLengthExtremes(): AnalyticsResult {
    const { longForm } = this.categorizeByDuration(this.channelVideos);
    
    if (longForm.length === 0) {
      return {
        questionId: 'length-extremes',
        question: 'What\'s the longest and shortest video uploaded?',
        answer: 'No long-form videos found',
        value: null,
        details: [],
        insights: []
      };
    }

    const durations = longForm.map(v => v.duration || 0).filter(d => d > 0);
    const longest = Math.max(...durations);
    const shortest = Math.min(...durations);

    const longestVideo = longForm.find(v => v.duration === longest);
    const shortestVideo = longForm.find(v => v.duration === shortest);

    const details = [
      `Longest: "${longestVideo?.title}" - ${this.formatDuration(longest)}`,
      `Shortest: "${shortestVideo?.title}" - ${this.formatDuration(shortest)}`,
      `Range: ${this.formatDuration(longest - shortest)} difference`
    ];

    const insights = [];
    if (longest > 3600) {
      insights.push('Very long content - ensure strong retention throughout');
    }
    if (shortest < 180) {
      insights.push('Very short content - maximize impact in limited time');
    }

    return {
      questionId: 'length-extremes',
      question: 'What\'s the longest and shortest video uploaded?',
      answer: `Longest: ${this.formatDuration(longest)}, Shortest: ${this.formatDuration(shortest)}`,
      value: { longest, shortest },
      details,
      insights
    };
  }

  private calculateLengthPerformance(): AnalyticsResult {
    const { longForm } = this.categorizeByDuration(this.channelVideos);
    
    if (longForm.length < 10) {
      return {
        questionId: 'length-performance',
        question: 'Do certain lengths perform better in terms of views or engagement?',
        answer: 'Insufficient data',
        value: null,
        details: ['Need at least 10 long-form videos for analysis.'],
        insights: []
      };
    }

    // Create duration buckets
    interface BucketData {
      videos: ChannelVideo[];
      totalViews: number;
      totalLikes: number;
    }

    const buckets: { [key: string]: BucketData } = {
      'under_5min': { videos: [], totalViews: 0, totalLikes: 0 },
      '5_15min': { videos: [], totalViews: 0, totalLikes: 0 },
      '15_30min': { videos: [], totalViews: 0, totalLikes: 0 },
      'over_30min': { videos: [], totalViews: 0, totalLikes: 0 }
    };

    longForm.forEach(video => {
      const duration = video.duration || 0;
      let bucket: keyof typeof buckets;
      
      if (duration < 300) bucket = 'under_5min';
      else if (duration < 900) bucket = '5_15min';
      else if (duration < 1800) bucket = '15_30min';
      else bucket = 'over_30min';

      buckets[bucket].videos.push(video);
      buckets[bucket].totalViews += video.viewCount;
      buckets[bucket].totalLikes += video.likeCount;
    });

    const bucketLabels = ['Under 5 min', '5-15 min', '15-30 min', 'Over 30 min'];
    const bucketKeys = Object.keys(buckets) as Array<keyof typeof buckets>;
    
    const results = bucketKeys.map((key, index) => {
      const bucket = buckets[key];
      const avgViews = bucket.videos.length > 0 ? bucket.totalViews / bucket.videos.length : 0;
      const avgLikes = bucket.videos.length > 0 ? bucket.totalLikes / bucket.videos.length : 0;
      return {
        label: bucketLabels[index],
        count: bucket.videos.length,
        avgViews,
        avgLikes
      };
    }).filter(r => r.count > 0);

    const bestPerforming = results.reduce((best, current) => 
      current.avgViews > best.avgViews ? current : best
    );

    const details = results.map(r => 
      `${r.label}: ${r.count} videos, ${Math.round(r.avgViews).toLocaleString()} avg views`
    );

    const insights = [];
    insights.push(`Best performing length: ${bestPerforming.label}`);
    
    return {
      questionId: 'length-performance',
      question: 'Do certain lengths perform better in terms of views or engagement?',
      answer: `${bestPerforming.label} performs best with ${Math.round(bestPerforming.avgViews).toLocaleString()} avg views`,
      value: bestPerforming,
      details,
      insights,
      charts: {
        type: 'bar',
        data: results.map(r => r.avgViews),
        labels: results.map(r => r.label)
      }
    };
  }

  private calculateLengthDistribution(videoType: 'long-form' | 'shorts'): AnalyticsResult {
    const { shorts, longForm } = this.categorizeByDuration(this.channelVideos);
    const targetVideos = videoType === 'shorts' ? shorts : longForm;

    if (targetVideos.length === 0) {
      return {
        questionId: videoType === 'shorts' ? 'shorts-length-distribution' : 'length-distribution',
        question: `What is the distribution of ${videoType} lengths?`,
        answer: 'No data available',
        value: null,
        details: [],
        insights: []
      };
    }

    let buckets: { [key: string]: number } = {};
    let bucketLabels: string[] = [];

    if (videoType === 'shorts') {
      buckets = { 'under_20s': 0, '20_40s': 0, '40_60s': 0 };
      bucketLabels = ['Under 20s', '20-40s', '40-60s'];
      
      targetVideos.forEach(video => {
        const duration = video.duration || 0;
        if (duration < 20) buckets['under_20s']++;
        else if (duration < 40) buckets['20_40s']++;
        else buckets['40_60s']++;
      });
    } else {
      buckets = { 'under_5min': 0, '5_15min': 0, '15_30min': 0, 'over_30min': 0 };
      bucketLabels = ['Under 5 min', '5-15 min', '15-30 min', 'Over 30 min'];
      
      targetVideos.forEach(video => {
        const duration = video.duration || 0;
        if (duration < 300) buckets['under_5min']++;
        else if (duration < 900) buckets['5_15min']++;
        else if (duration < 1800) buckets['15_30min']++;
        else buckets['over_30min']++;
      });
    }

    const total = targetVideos.length;
    const details = Object.keys(buckets).map((key, index) => {
      const count = buckets[key];
      const percentage = (count / total) * 100;
      return `${bucketLabels[index]}: ${count} videos (${percentage.toFixed(1)}%)`;
    });

    const insights = [];
    const bucketValues = Object.values(buckets);
    const maxIndex = bucketValues.indexOf(Math.max(...bucketValues));
    insights.push(`Most common length: ${bucketLabels[maxIndex]}`);

    return {
      questionId: videoType === 'shorts' ? 'shorts-length-distribution' : 'length-distribution',
      question: `What is the distribution of ${videoType} lengths?`,
      answer: `Most videos are ${bucketLabels[maxIndex]}`,
      value: buckets,
      details,
      insights,
      charts: {
        type: 'pie',
        data: bucketValues,
        labels: bucketLabels
      }
    };
  }

  private calculateLengthBucketsPreference(): AnalyticsResult {
    const { longForm } = this.categorizeByDuration(this.channelVideos);
    
    if (longForm.length === 0) {
      return {
        questionId: 'length-buckets-preference',
        question: 'Does the channel tend to favor certain length "buckets" (8–12 minutes)?',
        answer: 'No long-form videos found',
        value: null,
        details: [],
        insights: []
      };
    }

    // Define specific buckets that are common on YouTube
    const buckets = {
      '8_12min': 0,  // Sweet spot for monetization
      '10_20min': 0, // Popular range
      '5_10min': 0,  // Shorter content
      '20_plus': 0   // Long-form content
    };

    longForm.forEach(video => {
      const duration = video.duration || 0;
      const minutes = duration / 60;
      
      if (minutes >= 8 && minutes < 12) buckets['8_12min']++;
      else if (minutes >= 10 && minutes < 20) buckets['10_20min']++;
      else if (minutes >= 5 && minutes < 10) buckets['5_10min']++;
      else if (minutes >= 20) buckets['20_plus']++;
    });

    const total = longForm.length;
    const bucketData = Object.entries(buckets).map(([key, count]) => ({
      bucket: key,
      count,
      percentage: (count / total) * 100
    })).sort((a, b) => b.count - a.count);

    const favored = bucketData[0];
    
    const bucketLabels: { [key: string]: string } = {
      '8_12min': '8-12 minutes',
      '10_20min': '10-20 minutes', 
      '5_10min': '5-10 minutes',
      '20_plus': '20+ minutes'
    };

    const details = bucketData.map(d => 
      `${bucketLabels[d.bucket]}: ${d.count} videos (${d.percentage.toFixed(1)}%)`
    );

    const insights = [];
    if (favored.percentage > 40) {
      insights.push(`Strong preference for ${bucketLabels[favored.bucket]} range`);
    }
    if (buckets['8_12min'] > 0) {
      insights.push('8-12 minute videos are optimal for YouTube monetization');
    }

    return {
      questionId: 'length-buckets-preference',
      question: 'Does the channel tend to favor certain length "buckets" (8–12 minutes)?',
      answer: `Favors ${bucketLabels[favored.bucket]} (${favored.percentage.toFixed(1)}% of videos)`,
      value: favored,
      details,
      insights
    };
  }

  private calculateShortsLengthBuckets(): AnalyticsResult {
    const { shorts } = this.categorizeByDuration(this.channelVideos);
    
    if (shorts.length === 0) {
      return {
        questionId: 'shorts-length-buckets',
        question: 'Does the channel tend to favor certain length "buckets" for Shorts?',
        answer: 'No Shorts found',
        value: null,
        details: [],
        insights: []
      };
    }

    const buckets = {
      'under_15s': 0,
      '15_30s': 0,
      '30_45s': 0,
      '45_60s': 0
    };

    shorts.forEach(video => {
      const duration = video.duration || 0;
      if (duration < 15) buckets['under_15s']++;
      else if (duration < 30) buckets['15_30s']++;
      else if (duration < 45) buckets['30_45s']++;
      else buckets['45_60s']++;
    });

    const total = shorts.length;
    const bucketData = Object.entries(buckets).map(([key, count]) => ({
      bucket: key,
      count,
      percentage: (count / total) * 100
    })).sort((a, b) => b.count - a.count);

    const favored = bucketData[0];
    
    const bucketLabels: { [key: string]: string } = {
      'under_15s': 'Under 15 seconds',
      '15_30s': '15-30 seconds',
      '30_45s': '30-45 seconds',
      '45_60s': '45-60 seconds'
    };

    const details = bucketData.map(d => 
      `${bucketLabels[d.bucket]}: ${d.count} Shorts (${d.percentage.toFixed(1)}%)`
    );

    const insights = [];
    if (favored.percentage > 50) {
      insights.push(`Strong preference for ${bucketLabels[favored.bucket]} Shorts`);
    }
    if (buckets['under_15s'] > buckets['45_60s']) {
      insights.push('Shorter Shorts tend to have better completion rates');
    }

    return {
      questionId: 'shorts-length-buckets',
      question: 'Does the channel tend to favor certain length "buckets" for Shorts?',
      answer: `Favors ${bucketLabels[favored.bucket]} (${favored.percentage.toFixed(1)}% of Shorts)`,
      value: favored,
      details,
      insights
    };
  }

  private calculateTopVideosLength(): AnalyticsResult {
    const { longForm } = this.categorizeByDuration(this.channelVideos);
    
    if (longForm.length < 10) {
      return {
        questionId: 'top-videos-length',
        question: 'How do the top 10 most-viewed videos compare in length to channel average?',
        answer: 'Insufficient data',
        value: null,
        details: ['Need at least 10 long-form videos for analysis.'],
        insights: []
      };
    }

    const sortedByViews = [...longForm].sort((a, b) => b.viewCount - a.viewCount);
    const top10 = sortedByViews.slice(0, 10);
    
    const top10AvgLength = top10.reduce((sum, v) => sum + (v.duration || 0), 0) / top10.length;
    const channelAvgLength = longForm.reduce((sum, v) => sum + (v.duration || 0), 0) / longForm.length;
    
    const difference = ((top10AvgLength - channelAvgLength) / channelAvgLength) * 100;

    const details = [
      `Top 10 average length: ${this.formatDuration(top10AvgLength)}`,
      `Channel average length: ${this.formatDuration(channelAvgLength)}`,
      `Difference: ${difference > 0 ? '+' : ''}${difference.toFixed(1)}%`
    ];

    const insights = [];
    if (Math.abs(difference) > 20) {
      insights.push(`Top videos are significantly ${difference > 0 ? 'longer' : 'shorter'} than average`);
    }
    if (difference > 0) {
      insights.push('Longer content tends to perform better on this channel');
    } else {
      insights.push('Shorter content performs better - audience prefers concise videos');
    }

    return {
      questionId: 'top-videos-length',
      question: 'How do the top 10 most-viewed videos compare in length to channel average?',
      answer: `Top videos are ${Math.abs(difference).toFixed(1)}% ${difference > 0 ? 'longer' : 'shorter'} than average`,
      value: difference,
      details,
      insights
    };
  }

  private calculateShortsVsLongformViews(): AnalyticsResult {
    const { shorts, longForm } = this.categorizeByDuration(this.channelVideos);
    
    if (shorts.length === 0 || longForm.length === 0) {
      return {
        questionId: 'shorts-vs-longform-views',
        question: 'How do Shorts compare in average view count vs. long-form uploads?',
        answer: 'Need both Shorts and long-form videos',
        value: null,
        details: ['Analysis requires both content types.'],
        insights: []
      };
    }

    const shortsAvgViews = shorts.reduce((sum, v) => sum + v.viewCount, 0) / shorts.length;
    const longFormAvgViews = longForm.reduce((sum, v) => sum + v.viewCount, 0) / longForm.length;
    
    const ratio = shortsAvgViews / longFormAvgViews;
    const percentageDiff = ((shortsAvgViews - longFormAvgViews) / longFormAvgViews) * 100;

    const details = [
      `Shorts average: ${Math.round(shortsAvgViews).toLocaleString()} views`,
      `Long-form average: ${Math.round(longFormAvgViews).toLocaleString()} views`,
      `Shorts count: ${shorts.length}`,
      `Long-form count: ${longForm.length}`
    ];

    const insights = [];
    if (ratio > 1.5) {
      insights.push('Shorts significantly outperform long-form content');
    } else if (ratio < 0.7) {
      insights.push('Long-form content performs better than Shorts');
    } else {
      insights.push('Similar performance between Shorts and long-form content');
    }

    return {
      questionId: 'shorts-vs-longform-views',
      question: 'How do Shorts compare in average view count vs. long-form uploads?',
      answer: `Shorts get ${percentageDiff > 0 ? `${percentageDiff.toFixed(1)}% more` : `${Math.abs(percentageDiff).toFixed(1)}% fewer`} views on average`,
      value: ratio,
      details,
      insights
    };
  }

  private calculateRecurringThemesPerformance(): AnalyticsResult {
    // This is a simplified version - in practice, you'd use NLP or manual tagging
    const { longForm } = this.categorizeByDuration(this.channelVideos);
    
    if (longForm.length < 20) {
      return {
        questionId: 'recurring-themes-performance',
        question: 'Are there recurring themes, formats, or series that get higher-than-average views?',
        answer: 'Insufficient data for theme analysis',
        value: null,
        details: ['Need at least 20 long-form videos for theme analysis.'],
        insights: ['Consider manually tagging videos with themes for better analysis.']
      };
    }

    // Simple keyword analysis from titles
    const channelAvgViews = longForm.reduce((sum, v) => sum + v.viewCount, 0) / longForm.length;
    
    // Look for common words in high-performing videos
    const highPerformers = longForm.filter(v => v.viewCount > channelAvgViews * 1.2);
    const allTitles = longForm.map(v => v.title.toLowerCase());
    const highPerformerTitles = highPerformers.map(v => v.title.toLowerCase());

    // Simple word frequency analysis
    const getWords = (titles: string[]) => {
      return titles.join(' ')
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3) // Filter out short words
        .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'were', 'been', 'their'].includes(word));
    };

    const allWords = getWords(allTitles);
    const highPerformerWords = getWords(highPerformerTitles);

    const wordCounts: { [key: string]: { total: number, highPerf: number } } = {};
    
    allWords.forEach(word => {
      if (!wordCounts[word]) wordCounts[word] = { total: 0, highPerf: 0 };
      wordCounts[word].total++;
    });

    highPerformerWords.forEach(word => {
      if (wordCounts[word]) wordCounts[word].highPerf++;
    });

    // Find words that appear frequently in high performers
    const themes = Object.entries(wordCounts)
      .filter(([word, counts]) => counts.total >= 3 && counts.highPerf >= 2)
      .map(([word, counts]) => ({
        theme: word,
        totalAppearances: counts.total,
        highPerfAppearances: counts.highPerf,
        successRate: (counts.highPerf / counts.total) * 100
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);

    const details = themes.length > 0 
      ? themes.map(t => `"${t.theme}": ${t.successRate.toFixed(1)}% success rate (${t.highPerfAppearances}/${t.totalAppearances})`)
      : ['No clear recurring themes detected in high-performing content'];

    const insights = [];
    if (themes.length > 0) {
      insights.push(`Top performing theme: "${themes[0].theme}" with ${themes[0].successRate.toFixed(1)}% success rate`);
    } else {
      insights.push('Consider developing consistent series or themes for better performance');
    }

    return {
      questionId: 'recurring-themes-performance',
      question: 'Are there recurring themes, formats, or series that get higher-than-average views?',
      answer: themes.length > 0 
        ? `"${themes[0].theme}" appears in ${themes[0].successRate.toFixed(1)}% of high performers`
        : 'No clear recurring themes detected',
      value: themes,
      details,
      insights
    };
  }

  private calculateCollabPerformance(): AnalyticsResult {
    // Simple analysis based on common collaboration indicators in titles
    const { longForm } = this.categorizeByDuration(this.channelVideos);
    
    if (longForm.length < 10) {
      return {
        questionId: 'collab-performance',
        question: 'Do collab videos perform differently compared to solo ones?',
        answer: 'Insufficient data',
        value: null,
        details: ['Need at least 10 long-form videos for analysis.'],
        insights: []
      };
    }

    // Look for collaboration indicators in titles
    const collabKeywords = ['with', 'ft.', 'feat.', 'featuring', 'guest', 'collab', 'vs', '&', ' and ', ' x '];
    
    const collabVideos = longForm.filter(video => 
      collabKeywords.some(keyword => 
        video.title.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    const soloVideos = longForm.filter(video => 
      !collabKeywords.some(keyword => 
        video.title.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    if (collabVideos.length === 0) {
      return {
        questionId: 'collab-performance',
        question: 'Do collab videos perform differently compared to solo ones?',
        answer: 'No collaboration videos detected',
        value: null,
        details: ['No videos with collaboration indicators found in titles.'],
        insights: ['Consider collaborations to expand reach and audience.']
      };
    }

    const collabAvgViews = collabVideos.reduce((sum, v) => sum + v.viewCount, 0) / collabVideos.length;
    const soloAvgViews = soloVideos.reduce((sum, v) => sum + v.viewCount, 0) / soloVideos.length;
    
    const performanceDiff = ((collabAvgViews - soloAvgViews) / soloAvgViews) * 100;

    const details = [
      `Collaboration videos: ${collabVideos.length}`,
      `Solo videos: ${soloVideos.length}`,
      `Collab average views: ${Math.round(collabAvgViews).toLocaleString()}`,
      `Solo average views: ${Math.round(soloAvgViews).toLocaleString()}`
    ];

    const insights = [];
    if (performanceDiff > 20) {
      insights.push('Collaborations significantly boost viewership - consider more partnerships');
    } else if (performanceDiff < -20) {
      insights.push('Solo content outperforms collaborations - focus on solo videos');
    } else {
      insights.push('Similar performance between collaboration and solo content');
    }

    return {
      questionId: 'collab-performance',
      question: 'Do collab videos perform differently compared to solo ones?',
      answer: `Collabs get ${performanceDiff > 0 ? `${performanceDiff.toFixed(1)}% more` : `${Math.abs(performanceDiff).toFixed(1)}% fewer`} views on average`,
      value: performanceDiff,
      details,
      insights
    };
  }

  private calculateShortsPercentage(): AnalyticsResult {
    const { shorts, longForm } = this.categorizeByDuration(this.channelVideos);
    const totalVideos = this.channelVideos.length;
    
    if (totalVideos === 0) {
      return {
        questionId: 'shorts-percentage',
        question: 'What percentage of total uploads are Shorts vs. long-form?',
        answer: 'No videos found',
        value: null,
        details: [],
        insights: []
      };
    }

    const shortsPercentage = (shorts.length / totalVideos) * 100;
    const longFormPercentage = (longForm.length / totalVideos) * 100;

    const details = [
      `Total videos: ${totalVideos}`,
      `Shorts: ${shorts.length} (${shortsPercentage.toFixed(1)}%)`,
      `Long-form: ${longForm.length} (${longFormPercentage.toFixed(1)}%)`
    ];

    const insights = [];
    if (shortsPercentage > 60) {
      insights.push('Shorts-heavy strategy - great for discovery and reach');
    } else if (shortsPercentage > 30) {
      insights.push('Balanced content mix between Shorts and long-form');
    } else if (shortsPercentage < 10) {
      insights.push('Low Shorts adoption - consider adding more for discovery');
    }

    return {
      questionId: 'shorts-percentage',
      question: 'What percentage of total uploads are Shorts vs. long-form?',
      answer: `${shortsPercentage.toFixed(1)}% Shorts, ${longFormPercentage.toFixed(1)}% long-form`,
      value: { shorts: shortsPercentage, longForm: longFormPercentage },
      details,
      insights
    };
  }

  private calculateShortsThemesPerformance(): AnalyticsResult {
    const { shorts } = this.categorizeByDuration(this.channelVideos);
    
    if (shorts.length < 10) {
      return {
        questionId: 'shorts-themes-performance',
        question: 'Do certain themes, trends, or formats in Shorts outperform others?',
        answer: 'Insufficient Shorts data',
        value: null,
        details: ['Need at least 10 Shorts for theme analysis.'],
        insights: []
      };
    }

    const shortsAvgViews = shorts.reduce((sum, v) => sum + v.viewCount, 0) / shorts.length;
    const highPerformers = shorts.filter(v => v.viewCount > shortsAvgViews * 1.2);

    // Simple keyword analysis for Shorts
    const getWords = (titles: string[]) => {
      return titles.join(' ')
        .replace(/[^\w\s#]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2)
        .filter(word => !['the', 'and', 'for', 'you', 'this', 'that'].includes(word.toLowerCase()));
    };

    const allWords = getWords(shorts.map(v => v.title.toLowerCase()));
    const highPerfWords = getWords(highPerformers.map(v => v.title.toLowerCase()));

    const wordCounts: { [key: string]: { total: number, highPerf: number } } = {};
    
    allWords.forEach(word => {
      if (!wordCounts[word]) wordCounts[word] = { total: 0, highPerf: 0 };
      wordCounts[word].total++;
    });

    highPerfWords.forEach(word => {
      if (wordCounts[word]) wordCounts[word].highPerf++;
    });

    const themes = Object.entries(wordCounts)
      .filter(([word, counts]) => counts.total >= 2 && counts.highPerf >= 1)
      .map(([word, counts]) => ({
        theme: word,
        totalAppearances: counts.total,
        highPerfAppearances: counts.highPerf,
        successRate: (counts.highPerf / counts.total) * 100
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);

    const details = themes.length > 0 
      ? themes.map(t => `"${t.theme}": ${t.successRate.toFixed(1)}% success rate`)
      : ['No clear themes detected in high-performing Shorts'];

    const insights = [];
    if (themes.length > 0) {
      insights.push(`Top Shorts theme: "${themes[0].theme}"`);
    }

    return {
      questionId: 'shorts-themes-performance',
      question: 'Do certain themes, trends, or formats in Shorts outperform others?',
      answer: themes.length > 0 
        ? `"${themes[0].theme}" theme shows ${themes[0].successRate.toFixed(1)}% success rate`
        : 'No clear themes identified',
      value: themes,
      details,
      insights
    };
  }

  // ============================================================================
  // VIEWERSHIP & PERFORMANCE METRICS CALCULATIONS
  // ============================================================================

  private calculateAverageViews(videoType: 'long-form' | 'shorts' | 'both', recent: boolean = false): AnalyticsResult {
    let targetVideos = this.channelVideos;
    
    if (videoType !== 'both') {
      const { shorts, longForm } = this.categorizeByDuration(this.channelVideos);
      targetVideos = videoType === 'shorts' ? shorts : longForm;
    }

    if (recent) {
      targetVideos = this.getRecentVideos(180); // Last 6 months
      if (videoType !== 'both') {
        const { shorts, longForm } = this.categorizeByDuration(targetVideos);
        targetVideos = videoType === 'shorts' ? shorts : longForm;
      }
    }

    if (targetVideos.length === 0) {
      return {
        questionId: 'average-views',
        question: `What is the average number of views per ${videoType} video${recent ? ' in the past 6 months' : ''}?`,
        answer: 'No data available',
        value: null,
        details: [`No ${videoType} videos found${recent ? ' in the specified timeframe' : ''}.`],
        insights: []
      };
    }

    const totalViews = targetVideos.reduce((sum, video) => sum + video.viewCount, 0);
    const averageViews = totalViews / targetVideos.length;
    
    const sortedViews = targetVideos.map(v => v.viewCount).sort((a, b) => b - a);
    const medianViews = sortedViews[Math.floor(sortedViews.length / 2)];
    
    const details = [
      `Videos analyzed: ${targetVideos.length}`,
      `Total views: ${totalViews.toLocaleString()}`,
      `Median views: ${medianViews.toLocaleString()}`,
      `Top performing: ${sortedViews[0].toLocaleString()} views`,
      `Lowest performing: ${sortedViews[sortedViews.length - 1].toLocaleString()} views`
    ];

    const insights = [];
    if (averageViews > medianViews * 1.5) {
      insights.push('Some viral hits are skewing average upward - median gives better picture');
    }
    if (averageViews > 100000) {
      insights.push('Strong viewership performance - content resonates well with audience');
    } else if (averageViews < 1000) {
      insights.push('Lower view counts - focus on SEO, thumbnails, and audience engagement');
    }

    return {
      questionId: recent ? 'average-views-recent' : 'average-views',
      question: `What is the average number of views per ${videoType} video${recent ? ' in the past 6 months' : ''}?`,
      answer: `${Math.round(averageViews).toLocaleString()} views`,
      value: averageViews,
      details,
      insights
    };
  }

  private calculateMedianViews(videoType: 'long-form' | 'shorts'): AnalyticsResult {
    const { shorts, longForm } = this.categorizeByDuration(this.channelVideos);
    const targetVideos = videoType === 'shorts' ? shorts : longForm;

    if (targetVideos.length === 0) {
      return {
        questionId: 'median-views',
        question: `What is the median view count for ${videoType}?`,
        answer: 'No data available',
        value: null,
        details: [],
        insights: []
      };
    }

    const sortedViews = targetVideos.map(v => v.viewCount).sort((a, b) => a - b);
    const medianViews = sortedViews[Math.floor(sortedViews.length / 2)];
    const averageViews = sortedViews.reduce((sum, views) => sum + views, 0) / sortedViews.length;

    const details = [
      `Videos analyzed: ${targetVideos.length}`,
      `Average views: ${Math.round(averageViews).toLocaleString()}`,
      `25th percentile: ${sortedViews[Math.floor(sortedViews.length * 0.25)].toLocaleString()}`,
      `75th percentile: ${sortedViews[Math.floor(sortedViews.length * 0.75)].toLocaleString()}`
    ];

    const insights = [];
    if (averageViews > medianViews * 1.5) {
      insights.push('Average skewed by viral hits - median gives better typical performance');
    }
    if (medianViews < 1000) {
      insights.push('Many videos struggle to gain traction - focus on discoverability');
    }

    return {
      questionId: videoType === 'shorts' ? 'shorts-median-views' : 'median-views',
      question: `What is the median view count for ${videoType}?`,
      answer: `${medianViews.toLocaleString()} views`,
      value: medianViews,
      details,
      insights
    };
  }

  private calculateViewMilestones(videoType: 'long-form' | 'shorts', milestones: number[] = [1000, 10000, 100000]): AnalyticsResult {
    const { shorts, longForm } = this.categorizeByDuration(this.channelVideos);
    const targetVideos = videoType === 'shorts' ? shorts : longForm;

    if (targetVideos.length === 0) {
      return {
        questionId: 'milestone-percentage',
        question: `What percentage of ${videoType} videos reach view milestones?`,
        answer: 'No data available',
        value: null,
        details: [`No ${videoType} videos found.`],
        insights: []
      };
    }

    const results = milestones.map(milestone => {
      const count = targetVideos.filter(video => video.viewCount >= milestone).length;
      const percentage = (count / targetVideos.length) * 100;
      return { milestone, count, percentage };
    });

    const details = results.map(r => 
      `${r.milestone.toLocaleString()}+ views: ${r.count} videos (${r.percentage.toFixed(1)}%)`
    );

    const insights = [];
    const highestMilestone = results.find(r => r.percentage > 50);
    if (highestMilestone) {
      insights.push(`Strong performance - over half of videos exceed ${highestMilestone.milestone.toLocaleString()} views`);
    }
    
    const lowestSuccess = results.find(r => r.percentage < 20);
    if (lowestSuccess && lowestSuccess.milestone === 1000) {
      insights.push('Many videos struggle to gain traction - review SEO and promotion strategy');
    }

    return {
      questionId: 'milestone-percentage',
      question: `What percentage of ${videoType} videos reach view milestones?`,
      answer: `${results[0].percentage.toFixed(1)}% reach ${results[0].milestone.toLocaleString()}+ views`,
      value: results[0].percentage,
      details,
      insights,
      charts: {
        type: 'bar',
        data: results.map(r => r.percentage),
        labels: results.map(r => `${r.milestone.toLocaleString()}+`)
      }
    };
  }

  private calculateNewerVsOlderTraction(): AnalyticsResult {
    if (this.channelVideos.length < 20) {
      return {
        questionId: 'newer-vs-older-traction',
        question: 'Do newer uploads gain traction faster than older ones did at time of release?',
        answer: 'Insufficient data',
        value: null,
        details: ['Need at least 20 videos for comparison.'],
        insights: []
      };
    }

    const sortedVideos = [...this.channelVideos].sort((a, b) => 
      moment(a.publishedAt).unix() - moment(b.publishedAt).unix()
    );

    const midpoint = Math.floor(sortedVideos.length / 2);
    const olderVideos = sortedVideos.slice(0, midpoint);
    const newerVideos = sortedVideos.slice(midpoint);

    // Calculate views per day since upload
    const calculateVelocity = (videos: ChannelVideo[]) => {
      return videos.map(video => {
        const daysSinceUpload = moment().diff(moment(video.publishedAt), 'days') || 1;
        return video.viewCount / daysSinceUpload;
      });
    };

    const olderVelocities = calculateVelocity(olderVideos);
    const newerVelocities = calculateVelocity(newerVideos);

    const olderAvgVelocity = olderVelocities.reduce((sum, v) => sum + v, 0) / olderVelocities.length;
    const newerAvgVelocity = newerVelocities.reduce((sum, v) => sum + v, 0) / newerVelocities.length;

    const improvement = ((newerAvgVelocity - olderAvgVelocity) / olderAvgVelocity) * 100;

    const details = [
      `Older videos average velocity: ${olderAvgVelocity.toFixed(1)} views/day`,
      `Newer videos average velocity: ${newerAvgVelocity.toFixed(1)} views/day`,
      `Change: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`
    ];

    const insights = [];
    if (improvement > 25) {
      insights.push('Channel growth is accelerating - newer content gains traction faster');
    } else if (improvement < -25) {
      insights.push('Newer content struggling compared to past - review content strategy');
    } else {
      insights.push('Consistent traction across time periods');
    }

    return {
      questionId: 'newer-vs-older-traction',
      question: 'Do newer uploads gain traction faster than older ones did at time of release?',
      answer: `Newer videos ${improvement > 0 ? 'gain' : 'lose'} ${Math.abs(improvement).toFixed(1)}% more traction`,
      value: improvement,
      details,
      insights
    };
  }

  private calculateViewsByYear(): AnalyticsResult {
    if (this.channelVideos.length === 0) {
      return {
        questionId: 'views-by-year',
        question: 'What is the average view count by year of upload?',
        answer: 'No data available',
        value: null,
        details: [],
        insights: []
      };
    }

    const yearlyData: { [year: string]: { totalViews: number, videoCount: number } } = {};
    
    this.channelVideos.forEach(video => {
      const year = moment(video.publishedAt).year().toString();
      if (!yearlyData[year]) {
        yearlyData[year] = { totalViews: 0, videoCount: 0 };
      }
      yearlyData[year].totalViews += video.viewCount;
      yearlyData[year].videoCount += 1;
    });

    const years = Object.keys(yearlyData).sort();
    const avgViewsByYear = years.map(year => {
      const data = yearlyData[year];
      return { year, avgViews: data.totalViews / data.videoCount, videoCount: data.videoCount };
    });

    const details = avgViewsByYear.map(data => 
      `${data.year}: ${Math.round(data.avgViews).toLocaleString()} avg views (${data.videoCount} videos)`
    );

    const insights = [];
    if (avgViewsByYear.length > 2) {
      const recent = avgViewsByYear[avgViewsByYear.length - 1];
      const earlier = avgViewsByYear[0];
      const growth = ((recent.avgViews - earlier.avgViews) / earlier.avgViews) * 100;
      
      if (growth > 50) {
        insights.push('Strong growth in average views over time');
      } else if (growth < -30) {
        insights.push('Declining average views - may need content strategy refresh');
      }
    }

    const bestYear = avgViewsByYear.reduce((best, current) => 
      current.avgViews > best.avgViews ? current : best
    );

    return {
      questionId: 'views-by-year',
      question: 'What is the average view count by year of upload?',
      answer: `Best year: ${bestYear.year} with ${Math.round(bestYear.avgViews).toLocaleString()} avg views`,
      value: avgViewsByYear,
      details,
      insights,
      charts: {
        type: 'line',
        data: avgViewsByYear.map(d => d.avgViews),
        labels: years
      }
    };
  }

  private calculateTopVideosViewPercentage(): AnalyticsResult {
    if (this.channelVideos.length < 10) {
      return {
        questionId: 'top-videos-view-percentage',
        question: 'What percentage of total channel views come from the top 10 videos?',
        answer: 'Insufficient data',
        value: null,
        details: ['Need at least 10 videos for analysis.'],
        insights: []
      };
    }

    const totalViews = this.channelVideos.reduce((sum, v) => sum + v.viewCount, 0);
    const sortedByViews = [...this.channelVideos].sort((a, b) => b.viewCount - a.viewCount);
    const top10Views = sortedByViews.slice(0, 10).reduce((sum, v) => sum + v.viewCount, 0);
    
    const percentage = (top10Views / totalViews) * 100;

    const details = [
      `Total channel views: ${totalViews.toLocaleString()}`,
      `Top 10 videos views: ${top10Views.toLocaleString()}`,
      `Remaining ${this.channelVideos.length - 10} videos: ${(totalViews - top10Views).toLocaleString()}`
    ];

    const insights = [];
    if (percentage > 70) {
      insights.push('Heavy reliance on viral hits - diversify content for stability');
    } else if (percentage > 50) {
      insights.push('Top videos drive significant traffic - analyze their success factors');
    } else if (percentage < 30) {
      insights.push('Well-distributed views - consistent performance across content');
    }

    return {
      questionId: 'top-videos-view-percentage',
      question: 'What percentage of total channel views come from the top 10 videos?',
      answer: `${percentage.toFixed(1)}% of total views`,
      value: percentage,
      details,
      insights
    };
  }

  private calculateViewDistributionSkew(): AnalyticsResult {
    if (this.channelVideos.length < 10) {
      return {
        questionId: 'view-distribution-skew',
        question: 'How skewed is the view distribution? Does the channel rely on viral hits?',
        answer: 'Insufficient data',
        value: null,
        details: ['Need at least 10 videos for analysis.'],
        insights: []
      };
    }

    const viewCounts = this.channelVideos.map(v => v.viewCount).sort((a, b) => b - a);
    const totalViews = viewCounts.reduce((sum, views) => sum + views, 0);
    const averageViews = totalViews / viewCounts.length;
    const medianViews = viewCounts[Math.floor(viewCounts.length / 2)];
    
    // Calculate what percentage of views come from top 20% of videos
    const top20Percent = Math.ceil(viewCounts.length * 0.2);
    const top20Views = viewCounts.slice(0, top20Percent).reduce((sum, views) => sum + views, 0);
    const top20Percentage = (top20Views / totalViews) * 100;

    // Calculate coefficient of variation (standard deviation / mean)
    const variance = viewCounts.reduce((sum, views) => sum + Math.pow(views - averageViews, 2), 0) / viewCounts.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = standardDeviation / averageViews;

    const details = [
      `Top 20% of videos account for ${top20Percentage.toFixed(1)}% of total views`,
      `Average views: ${Math.round(averageViews).toLocaleString()}`,
      `Median views: ${medianViews.toLocaleString()}`,
      `Coefficient of variation: ${coefficientOfVariation.toFixed(2)}`
    ];

    const insights = [];
    let skewLevel = 'moderate';
    
    if (top20Percentage > 80) {
      skewLevel = 'heavily';
      insights.push('Extremely viral-dependent - diversify content strategy');
    } else if (top20Percentage > 60) {
      skewLevel = 'significantly';
      insights.push('High reliance on viral content - some risk in strategy');
    } else if (top20Percentage < 40) {
      skewLevel = 'minimally';
      insights.push('Well-balanced performance - consistent audience engagement');
    }

    if (coefficientOfVariation > 2) {
      insights.push('High variability in performance - unpredictable viral success');
    }

    return {
      questionId: 'view-distribution-skew',
      question: 'How skewed is the view distribution? Does the channel rely on viral hits?',
      answer: `Distribution is ${skewLevel} skewed - top 20% get ${top20Percentage.toFixed(1)}% of views`,
      value: { skewLevel, top20Percentage, coefficientOfVariation },
      details,
      insights
    };
  }

  private calculateViewsPerDayRate(): AnalyticsResult {
    if (this.channelVideos.length === 0) {
      return {
        questionId: 'views-per-day-rate',
        question: 'What is the average views per day since upload for videos?',
        answer: 'No data available',
        value: null,
        details: [],
        insights: []
      };
    }

    const velocities = this.channelVideos.map(video => {
      const daysSinceUpload = moment().diff(moment(video.publishedAt), 'days') || 1;
      return {
        video,
        velocity: video.viewCount / daysSinceUpload,
        daysSinceUpload
      };
    });

    const averageVelocity = velocities.reduce((sum, v) => sum + v.velocity, 0) / velocities.length;
    const sortedVelocities = velocities.sort((a, b) => b.velocity - a.velocity);

    const details = [
      `Average velocity: ${averageVelocity.toFixed(1)} views per day`,
      `Fastest: "${sortedVelocities[0].video.title}" - ${sortedVelocities[0].velocity.toFixed(1)} views/day`,
      `Slowest: "${sortedVelocities[sortedVelocities.length-1].video.title}" - ${sortedVelocities[sortedVelocities.length-1].velocity.toFixed(1)} views/day`
    ];

    const insights = [];
    if (averageVelocity > 1000) {
      insights.push('Strong daily view velocity - content gains traction quickly');
    } else if (averageVelocity > 100) {
      insights.push('Moderate daily velocity - steady audience engagement');
    } else {
      insights.push('Low daily velocity - focus on improving discoverability');
    }

    return {
      questionId: 'views-per-day-rate',
      question: 'What is the average views per day since upload for videos?',
      answer: `${averageVelocity.toFixed(1)} views per day on average`,
      value: averageVelocity,
      details,
      insights
    };
  }

  private calculateViewVelocityComparison(): AnalyticsResult {
    if (this.channelVideos.length < 10) {
      return {
        questionId: 'view-velocity-comparison',
        question: 'How does view velocity of recent uploads compare to older ones?',
        answer: 'Insufficient data',
        value: null,
        details: ['Need at least 10 videos for comparison.'],
        insights: []
      };
    }

    const recentVideos = this.getRecentVideos(180); // Last 6 months
    const olderVideos = this.channelVideos.filter(v => !recentVideos.includes(v));

    if (recentVideos.length === 0 || olderVideos.length === 0) {
      return {
        questionId: 'view-velocity-comparison',
        question: 'How does view velocity of recent uploads compare to older ones?',
        answer: 'Insufficient data for comparison',
        value: null,
        details: ['Need both recent and older videos for comparison.'],
        insights: []
      };
    }

    const calculateVelocity = (videos: ChannelVideo[]) => {
      return videos.map(video => {
        const daysSinceUpload = moment().diff(moment(video.publishedAt), 'days') || 1;
        return video.viewCount / daysSinceUpload;
      });
    };

    const recentVelocities = calculateVelocity(recentVideos);
    const olderVelocities = calculateVelocity(olderVideos);

    const recentAvg = recentVelocities.reduce((sum, v) => sum + v, 0) / recentVelocities.length;
    const olderAvg = olderVelocities.reduce((sum, v) => sum + v, 0) / olderVelocities.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    const details = [
      `Recent videos (${recentVideos.length}): ${recentAvg.toFixed(1)} views/day`,
      `Older videos (${olderVideos.length}): ${olderAvg.toFixed(1)} views/day`,
      `Change: ${change > 0 ? '+' : ''}${change.toFixed(1)}%`
    ];

    const insights = [];
    if (change > 25) {
      insights.push('Recent videos gaining traction faster - channel growth accelerating');
    } else if (change < -25) {
      insights.push('Recent content struggling - review strategy or algorithm changes');
    } else {
      insights.push('Consistent velocity between time periods');
    }

    return {
      questionId: 'view-velocity-comparison',
      question: 'How does view velocity of recent uploads compare to older ones?',
      answer: `Recent videos ${change > 0 ? 'gain' : 'lose'} ${Math.abs(change).toFixed(1)}% more velocity`,
      value: change,
      details,
      insights
    };
  }

  private calculateOldVsNewViews(): AnalyticsResult {
    if (this.channelVideos.length < 10) {
      return {
        questionId: 'old-vs-new-views',
        question: 'What percentage of views come from older videos vs. new uploads?',
        answer: 'Insufficient data',
        value: null,
        details: ['Need at least 10 videos for analysis.'],
        insights: []
      };
    }

    const recentVideos = this.getRecentVideos(365); // Last 12 months
    const olderVideos = this.channelVideos.filter(v => !recentVideos.includes(v));

    const recentViews = recentVideos.reduce((sum, v) => sum + v.viewCount, 0);
    const olderViews = olderVideos.reduce((sum, v) => sum + v.viewCount, 0);
    const totalViews = recentViews + olderViews;

    const recentPercentage = (recentViews / totalViews) * 100;
    const olderPercentage = (olderViews / totalViews) * 100;

    const details = [
      `Recent videos (${recentVideos.length}): ${recentViews.toLocaleString()} views (${recentPercentage.toFixed(1)}%)`,
      `Older videos (${olderVideos.length}): ${olderViews.toLocaleString()} views (${olderPercentage.toFixed(1)}%)`,
      `Total views: ${totalViews.toLocaleString()}`
    ];

    const insights = [];
    if (recentPercentage > 70) {
      insights.push('Heavy reliance on recent content - strong current momentum');
    } else if (recentPercentage > 40) {
      insights.push('Balanced mix of recent and catalog content performance');
    } else {
      insights.push('Strong catalog performance - older videos have lasting appeal');
    }

    return {
      questionId: 'old-vs-new-views',
      question: 'What percentage of views come from older videos vs. new uploads?',
      answer: `${recentPercentage.toFixed(1)}% from recent, ${olderPercentage.toFixed(1)}% from catalog`,
      value: { recent: recentPercentage, older: olderPercentage },
      details,
      insights
    };
  }

  private calculateShortsTopPerformers(): AnalyticsResult {
    const { shorts } = this.categorizeByDuration(this.channelVideos);
    
    if (shorts.length < 10) {
      return {
        questionId: 'shorts-top-performers',
        question: 'How do the top 10 most-viewed Shorts compare to the average Short?',
        answer: 'Insufficient Shorts data',
        value: null,
        details: ['Need at least 10 Shorts for analysis.'],
        insights: []
      };
    }

    const sortedShorts = shorts.sort((a, b) => b.viewCount - a.viewCount);
    const top10 = sortedShorts.slice(0, 10);
    
    const top10AvgViews = top10.reduce((sum, v) => sum + v.viewCount, 0) / top10.length;
    const allShortsAvgViews = shorts.reduce((sum, v) => sum + v.viewCount, 0) / shorts.length;
    
    const multiplier = top10AvgViews / allShortsAvgViews;

    const details = [
      `Top 10 Shorts average: ${Math.round(top10AvgViews).toLocaleString()} views`,
      `All Shorts average: ${Math.round(allShortsAvgViews).toLocaleString()} views`,
      `Top 10 performance: ${multiplier.toFixed(1)}x better than average`
    ];

    const insights = [];
    if (multiplier > 5) {
      insights.push('Top Shorts significantly outperform average - analyze success factors');
    } else if (multiplier > 2) {
      insights.push('Moderate performance gap - some Shorts break through algorithm');
    } else {
      insights.push('Consistent Shorts performance - even distribution of views');
    }

    return {
      questionId: 'shorts-top-performers',
      question: 'How do the top 10 most-viewed Shorts compare to the average Short?',
      answer: `Top 10 get ${multiplier.toFixed(1)}x more views than average`,
      value: multiplier,
      details,
      insights
    };
  }

  private calculateShortsVelocity(): AnalyticsResult {
    const { shorts } = this.categorizeByDuration(this.channelVideos);
    
    if (shorts.length === 0) {
      return {
        questionId: 'shorts-velocity',
        question: 'What is the average views per day since upload for Shorts?',
        answer: 'No Shorts found',
        value: null,
        details: [],
        insights: []
      };
    }

    const velocities = shorts.map(video => {
      const daysSinceUpload = moment().diff(moment(video.publishedAt), 'days') || 1;
      return {
        video,
        velocity: video.viewCount / daysSinceUpload
      };
    });

    const averageVelocity = velocities.reduce((sum, v) => sum + v.velocity, 0) / velocities.length;
    const sortedVelocities = velocities.sort((a, b) => b.velocity - a.velocity);

    const details = [
      `Shorts analyzed: ${shorts.length}`,
      `Average velocity: ${averageVelocity.toFixed(1)} views per day`,
      `Fastest Short: ${sortedVelocities[0].velocity.toFixed(1)} views/day`,
      `Slowest Short: ${sortedVelocities[sortedVelocities.length-1].velocity.toFixed(1)} views/day`
    ];

    const insights = [];
    if (averageVelocity > 5000) {
      insights.push('Excellent Shorts velocity - algorithm is favoring content');
    } else if (averageVelocity > 1000) {
      insights.push('Good Shorts velocity - content gaining steady traction');
    } else {
      insights.push('Low Shorts velocity - optimize for better discovery');
    }

    return {
      questionId: 'shorts-velocity',
      question: 'What is the average views per day since upload for Shorts?',
      answer: `${averageVelocity.toFixed(1)} views per day on average`,
      value: averageVelocity,
      details,
      insights
    };
  }

  private calculateShortsVelocityComparison(): AnalyticsResult {
    const { shorts } = this.categorizeByDuration(this.channelVideos);
    
    if (shorts.length < 10) {
      return {
        questionId: 'shorts-velocity-comparison',
        question: 'How does the view velocity of recent Shorts compare to earlier ones?',
        answer: 'Insufficient Shorts data',
        value: null,
        details: ['Need at least 10 Shorts for comparison.'],
        insights: []
      };
    }

    const sortedShorts = shorts.sort((a, b) => 
      moment(a.publishedAt).unix() - moment(b.publishedAt).unix()
    );

    const midpoint = Math.floor(sortedShorts.length / 2);
    const earlierShorts = sortedShorts.slice(0, midpoint);
    const recentShorts = sortedShorts.slice(midpoint);

    const calculateVelocity = (videos: ChannelVideo[]) => {
      return videos.map(video => {
        const daysSinceUpload = moment().diff(moment(video.publishedAt), 'days') || 1;
        return video.viewCount / daysSinceUpload;
      });
    };

    const earlierVelocities = calculateVelocity(earlierShorts);
    const recentVelocities = calculateVelocity(recentShorts);

    const earlierAvg = earlierVelocities.reduce((sum, v) => sum + v, 0) / earlierVelocities.length;
    const recentAvg = recentVelocities.reduce((sum, v) => sum + v, 0) / recentVelocities.length;

    const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;

    const details = [
      `Earlier Shorts (${earlierShorts.length}): ${earlierAvg.toFixed(1)} views/day`,
      `Recent Shorts (${recentShorts.length}): ${recentAvg.toFixed(1)} views/day`,
      `Change: ${change > 0 ? '+' : ''}${change.toFixed(1)}%`
    ];

    const insights = [];
    if (change > 50) {
      insights.push('Recent Shorts performing much better - algorithm optimization improving');
    } else if (change < -30) {
      insights.push('Recent Shorts underperforming - may need strategy adjustment');
    } else {
      insights.push('Consistent Shorts velocity over time');
    }

    return {
      questionId: 'shorts-velocity-comparison',
      question: 'How does the view velocity of recent Shorts compare to earlier ones?',
      answer: `Recent Shorts ${change > 0 ? 'gain' : 'lose'} ${Math.abs(change).toFixed(1)}% more velocity`,
      value: change,
      details,
      insights
    };
  }

  private calculateShortsViewsContribution(): AnalyticsResult {
    const { shorts } = this.categorizeByDuration(this.channelVideos);
    
    if (shorts.length === 0) {
      return {
        questionId: 'shorts-total-views-contribution',
        question: 'What percentage of the channel\'s total views come from Shorts?',
        answer: 'No Shorts found',
        value: null,
        details: [],
        insights: []
      };
    }

    const shortsViews = shorts.reduce((sum, v) => sum + v.viewCount, 0);
    const totalViews = this.channelVideos.reduce((sum, v) => sum + v.viewCount, 0);
    const percentage = (shortsViews / totalViews) * 100;

    const { longForm } = this.categorizeByDuration(this.channelVideos);
    const longFormViews = longForm.reduce((sum, v) => sum + v.viewCount, 0);

    const details = [
      `Shorts views: ${shortsViews.toLocaleString()} (${percentage.toFixed(1)}%)`,
      `Long-form views: ${longFormViews.toLocaleString()} (${((longFormViews/totalViews)*100).toFixed(1)}%)`,
      `Total channel views: ${totalViews.toLocaleString()}`,
      `Shorts count: ${shorts.length} videos`
    ];

    const insights = [];
    if (percentage > 60) {
      insights.push('Shorts dominate channel views - heavily discovery-driven');
    } else if (percentage > 30) {
      insights.push('Significant Shorts contribution - good discovery balance');
    } else if (percentage < 10) {
      insights.push('Low Shorts contribution - opportunity for growth');
    }

    const shortsPercentageOfVideos = (shorts.length / this.channelVideos.length) * 100;
    if (percentage > shortsPercentageOfVideos * 1.5) {
      insights.push('Shorts punch above their weight in terms of views');
    }

    return {
      questionId: 'shorts-total-views-contribution',
      question: 'What percentage of the channel\'s total views come from Shorts?',
      answer: `${percentage.toFixed(1)}% of total views come from Shorts`,
      value: percentage,
      details,
      insights
    };
  }

  // ============================================================================
  // AUDIENCE ENGAGEMENT CALCULATIONS
  // ============================================================================

  private calculateAverageLikes(): AnalyticsResult {
    const validVideos = this.channelVideos.filter(v => v.likeCount >= 0);
    
    if (validVideos.length === 0) {
      return {
        questionId: 'average-likes',
        question: 'What is the average number of likes per video?',
        answer: 'No like data available',
        value: null,
        details: [],
        insights: []
      };
    }

    const totalLikes = validVideos.reduce((sum, v) => sum + v.likeCount, 0);
    const averageLikes = totalLikes / validVideos.length;
    const sortedLikes = validVideos.map(v => v.likeCount).sort((a, b) => b - a);
    const medianLikes = sortedLikes[Math.floor(sortedLikes.length / 2)];

    const details = [
      `Videos with like data: ${validVideos.length}`,
      `Total likes: ${totalLikes.toLocaleString()}`,
      `Median likes: ${medianLikes.toLocaleString()}`,
      `Most liked: ${sortedLikes[0].toLocaleString()}`
    ];

    const insights = [];
    if (averageLikes > 1000) {
      insights.push('Strong like engagement - audience appreciates content');
    } else if (averageLikes < 50) {
      insights.push('Low like engagement - consider more engaging calls-to-action');
    }

    return {
      questionId: 'average-likes',
      question: 'What is the average number of likes per video?',
      answer: `${Math.round(averageLikes).toLocaleString()} likes on average`,
      value: averageLikes,
      details,
      insights
    };
  }

  private calculateEngagementRatio(videoType: 'long-form' | 'shorts', metricType: 'likes' | 'comments'): AnalyticsResult {
    const { shorts, longForm } = this.categorizeByDuration(this.channelVideos);
    const targetVideos = videoType === 'shorts' ? shorts : longForm;

    if (targetVideos.length === 0) {
      return {
        questionId: `${metricType}-to-view-ratio`,
        question: `What is the average ${metricType}-to-view ratio for ${videoType}?`,
        answer: 'No data available',
        value: null,
        details: [`No ${videoType} videos found.`],
        insights: []
      };
    }

    const validVideos = targetVideos.filter(video => 
      video.viewCount > 0 && (metricType === 'likes' ? video.likeCount >= 0 : video.commentCount >= 0)
    );

    if (validVideos.length === 0) {
      return {
        questionId: `${metricType}-to-view-ratio`,
        question: `What is the average ${metricType}-to-view ratio for ${videoType}?`,
        answer: 'No engagement data available',
        value: null,
        details: ['Engagement metrics not available for analyzed videos.'],
        insights: []
      };
    }

    const ratios = validVideos.map(video => {
      const engagement = metricType === 'likes' ? video.likeCount : video.commentCount;
      return engagement / video.viewCount;
    });

    const averageRatio = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
    const percentageRatio = averageRatio * 100;

    const totalEngagement = validVideos.reduce((sum, video) => 
      sum + (metricType === 'likes' ? video.likeCount : video.commentCount), 0
    );
    const totalViews = validVideos.reduce((sum, video) => sum + video.viewCount, 0);

    const details = [
      `Videos analyzed: ${validVideos.length}`,
      `Total ${metricType}: ${totalEngagement.toLocaleString()}`,
      `Total views: ${totalViews.toLocaleString()}`,
      `Average ${metricType} per video: ${Math.round(totalEngagement / validVideos.length).toLocaleString()}`
    ];

    const insights = [];
    if (metricType === 'likes') {
      if (percentageRatio > 4) {
        insights.push('Excellent like ratio - content strongly resonates with audience');
      } else if (percentageRatio > 2) {
        insights.push('Good engagement - audience appreciates the content');
      } else if (percentageRatio < 1) {
        insights.push('Low like ratio - consider improving content quality or audience targeting');
      }
    } else {
      if (percentageRatio > 0.5) {
        insights.push('High comment engagement - content sparks discussion');
      } else if (percentageRatio < 0.1) {
        insights.push('Low comment engagement - try ending with questions or discussion prompts');
      }
    }

    // Benchmark against YouTube averages
    const benchmark = metricType === 'likes' ? 4 : 0.25; // Industry averages
    if (percentageRatio > benchmark) {
      insights.push(`Above YouTube average (${benchmark}%) - great performance!`);
    } else {
      insights.push(`Below YouTube average (${benchmark}%) - room for improvement`);
    }

    return {
      questionId: `${metricType}-to-view-ratio`,
      question: `What is the average ${metricType}-to-view ratio for ${videoType}?`,
      answer: `${percentageRatio.toFixed(2)}%`,
      value: percentageRatio,
      details,
      insights
    };
  }

  private calculateEngagementOutliers(): AnalyticsResult {
    const validVideos = this.channelVideos.filter(v => 
      v.viewCount > 0 && v.likeCount >= 0
    );

    if (validVideos.length < 5) {
      return {
        questionId: 'engagement-outliers',
        question: 'Which videos are outliers with especially high or low like/view ratios?',
        answer: 'Insufficient data',
        value: null,
        details: ['Need at least 5 videos with engagement data for outlier analysis.'],
        insights: []
      };
    }

    const ratios = validVideos.map(video => ({
      video,
      ratio: video.likeCount / video.viewCount
    }));

    const averageRatio = ratios.reduce((sum, r) => sum + r.ratio, 0) / ratios.length;
    const stdDev = Math.sqrt(
      ratios.reduce((sum, r) => sum + Math.pow(r.ratio - averageRatio, 2), 0) / ratios.length
    );

    const threshold = 1.5 * stdDev;
    const highOutliers = ratios.filter(r => r.ratio > averageRatio + threshold);
    const lowOutliers = ratios.filter(r => r.ratio < averageRatio - threshold);

    const details = [
      `Average like ratio: ${(averageRatio * 100).toFixed(2)}%`,
      `High engagement outliers: ${highOutliers.length}`,
      `Low engagement outliers: ${lowOutliers.length}`
    ];

    if (highOutliers.length > 0) {
      const best = highOutliers.sort((a, b) => b.ratio - a.ratio)[0];
      details.push(`Best: "${best.video.title}" - ${(best.ratio * 100).toFixed(2)}%`);
    }

    if (lowOutliers.length > 0) {
      const worst = lowOutliers.sort((a, b) => a.ratio - b.ratio)[0];
      details.push(`Lowest: "${worst.video.title}" - ${(worst.ratio * 100).toFixed(2)}%`);
    }

    const insights = [];
    if (highOutliers.length > 0) {
      insights.push('Some videos have exceptional engagement - analyze what made them special');
    }
    if (lowOutliers.length > 0) {
      insights.push('Some videos underperformed in engagement - review content or timing');
    }

    return {
      questionId: 'engagement-outliers',
      question: 'Which videos are outliers with especially high or low like/view ratios?',
      answer: `${highOutliers.length} high outliers, ${lowOutliers.length} low outliers`,
      value: { high: highOutliers.length, low: lowOutliers.length },
      details,
      insights
    };
  }

  private calculateAverageComments(): AnalyticsResult {
    const validVideos = this.channelVideos.filter(v => v.commentCount >= 0);
    
    if (validVideos.length === 0) {
      return {
        questionId: 'comment-analysis',
        question: 'How many comments does an average video receive?',
        answer: 'No comment data available',
        value: null,
        details: [],
        insights: []
      };
    }

    const totalComments = validVideos.reduce((sum, v) => sum + v.commentCount, 0);
    const averageComments = totalComments / validVideos.length;
    const sortedComments = validVideos.map(v => v.commentCount).sort((a, b) => b - a);
    const medianComments = sortedComments[Math.floor(sortedComments.length / 2)];

    const details = [
      `Videos with comment data: ${validVideos.length}`,
      `Total comments: ${totalComments.toLocaleString()}`,
      `Median comments: ${medianComments.toLocaleString()}`,
      `Most commented: ${sortedComments[0].toLocaleString()}`
    ];

    const insights = [];
    if (averageComments > 100) {
      insights.push('Strong community engagement - audience actively participates');
    } else if (averageComments < 10) {
      insights.push('Low comment engagement - try ending videos with questions');
    }

    return {
      questionId: 'comment-analysis',
      question: 'How many comments does an average video receive?',
      answer: `${Math.round(averageComments).toLocaleString()} comments on average`,
      value: averageComments,
      details,
      insights
    };
  }

  private calculateCommentTrend(): AnalyticsResult {
    const validVideos = this.channelVideos.filter(v => v.commentCount >= 0);
    
    if (validVideos.length < 10) {
      return {
        questionId: 'comment-trend',
        question: 'How has comment engagement trended over time?',
        answer: 'Insufficient data',
        value: null,
        details: ['Need at least 10 videos with comment data for trend analysis.'],
        insights: []
      };
    }

    const sortedVideos = validVideos.sort((a, b) => 
      moment(a.publishedAt).unix() - moment(b.publishedAt).unix()
    );

    const midpoint = Math.floor(sortedVideos.length / 2);
    const earlierHalf = sortedVideos.slice(0, midpoint);
    const laterHalf = sortedVideos.slice(midpoint);

    const earlierAvgComments = earlierHalf.reduce((sum, v) => sum + v.commentCount, 0) / earlierHalf.length;
    const laterAvgComments = laterHalf.reduce((sum, v) => sum + v.commentCount, 0) / laterHalf.length;

    const change = ((laterAvgComments - earlierAvgComments) / earlierAvgComments) * 100;

    const details = [
      `Earlier period average: ${earlierAvgComments.toFixed(1)} comments`,
      `Recent period average: ${laterAvgComments.toFixed(1)} comments`,
      `Change: ${change > 0 ? '+' : ''}${change.toFixed(1)}%`
    ];

    const insights = [];
    if (Math.abs(change) > 25) {
      insights.push(`Significant ${change > 0 ? 'increase' : 'decrease'} in comment engagement`);
    }
    if (change > 0) {
      insights.push('Growing community engagement - audience becoming more active');
    } else if (change < -20) {
      insights.push('Declining comment engagement - consider more discussion-focused content');
    }

    return {
      questionId: 'comment-trend',
      question: 'How has comment engagement trended over time?',
      answer: `Comment engagement has ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}%`,
      value: change,
      details,
      insights
    };
  }

  private calculateHighestEngagementVideos(): AnalyticsResult {
    const validVideos = this.channelVideos.filter(v => 
      v.viewCount > 0 && v.likeCount >= 0 && v.commentCount >= 0
    );

    if (validVideos.length < 5) {
      return {
        questionId: 'highest-engagement-videos',
        question: 'Which videos have the highest engagement relative to their view count?',
        answer: 'Insufficient engagement data',
        value: null,
        details: ['Need at least 5 videos with complete engagement data.'],
        insights: []
      };
    }

    const engagementScores = validVideos.map(video => {
      const engagementRate = (video.likeCount + video.commentCount) / video.viewCount;
      return {
        video,
        engagementRate,
        totalEngagement: video.likeCount + video.commentCount
      };
    });

    const sortedByEngagement = engagementScores.sort((a, b) => b.engagementRate - a.engagementRate);
    const top5 = sortedByEngagement.slice(0, 5);

    const details = top5.map((item, index) => 
      `${index + 1}. "${item.video.title}" - ${(item.engagementRate * 100).toFixed(2)}% engagement rate`
    );

    const averageEngagementRate = engagementScores.reduce((sum, item) => sum + item.engagementRate, 0) / engagementScores.length;
    
    const insights = [];
    insights.push(`Channel average engagement rate: ${(averageEngagementRate * 100).toFixed(2)}%`);
    if (top5[0].engagementRate > averageEngagementRate * 2) {
      insights.push('Top video has exceptional engagement - analyze its success factors');
    }

    return {
      questionId: 'highest-engagement-videos',
      question: 'Which videos have the highest engagement relative to their view count?',
      answer: `"${top5[0].video.title}" leads with ${(top5[0].engagementRate * 100).toFixed(2)}% engagement`,
      value: top5,
      details,
      insights
    };
  }

  private calculateDisabledCommentsPercentage(): AnalyticsResult {
    // Note: This is difficult to detect from standard YouTube API data
    // This implementation assumes that videos with 0 comments despite having views might have disabled comments
    const videosWithViews = this.channelVideos.filter(v => v.viewCount > 100);
    
    if (videosWithViews.length === 0) {
      return {
        questionId: 'disabled-comments-percentage',
        question: 'What percentage of videos have disabled comments or hidden likes?',
        answer: 'Cannot determine from available data',
        value: null,
        details: ['Comment disable status requires additional API calls or manual review.'],
        insights: ['Consider manually reviewing videos for moderation practices.']
      };
    }

    // Estimate based on videos with suspiciously low comment counts relative to views
    const suspiciouslyLowComments = videosWithViews.filter(v => {
      const expectedComments = v.viewCount * 0.001; // Very conservative estimate
      return v.commentCount < expectedComments * 0.1; // Less than 10% of expected
    });

    const estimatedDisabledPercentage = (suspiciouslyLowComments.length / videosWithViews.length) * 100;

    const details = [
      `Videos analyzed: ${videosWithViews.length}`,
      `Suspected disabled comments: ${suspiciouslyLowComments.length}`,
      `Estimated percentage: ${estimatedDisabledPercentage.toFixed(1)}%`,
      'Note: This is an estimate based on comment patterns'
    ];

    const insights = [];
    if (estimatedDisabledPercentage > 30) {
      insights.push('High suspected comment moderation - may limit community building');
    } else if (estimatedDisabledPercentage < 10) {
      insights.push('Open comment policy - encourages community engagement');
    }
    insights.push('Manual review recommended for accurate moderation analysis');

    return {
      questionId: 'disabled-comments-percentage',
      question: 'What percentage of videos have disabled comments or hidden likes?',
      answer: `Estimated ${estimatedDisabledPercentage.toFixed(1)}% may have restricted comments`,
      value: estimatedDisabledPercentage,
      details,
      insights
    };
  }

  private calculateShortsVsLongformEngagement(): AnalyticsResult {
    const { shorts, longForm } = this.categorizeByDuration(this.channelVideos);
    
    if (shorts.length === 0 || longForm.length === 0) {
      return {
        questionId: 'shorts-vs-longform-engagement',
        question: 'How do Shorts compare in engagement to long-form uploads?',
        answer: 'Need both Shorts and long-form videos',
        value: null,
        details: ['Analysis requires both content types.'],
        insights: []
      };
    }

    const shortsValidVideos = shorts.filter(v => v.viewCount > 0 && v.likeCount >= 0);
    const longFormValidVideos = longForm.filter(v => v.viewCount > 0 && v.likeCount >= 0);

    if (shortsValidVideos.length === 0 || longFormValidVideos.length === 0) {
      return {
        questionId: 'shorts-vs-longform-engagement',
        question: 'How do Shorts compare in engagement to long-form uploads?',
        answer: 'Insufficient engagement data',
        value: null,
        details: ['Need engagement data for both content types.'],
        insights: []
      };
    }

    const shortsEngagementRate = shortsValidVideos.reduce((sum, v) => 
      sum + (v.likeCount / v.viewCount), 0) / shortsValidVideos.length;
    const longFormEngagementRate = longFormValidVideos.reduce((sum, v) => 
      sum + (v.likeCount / v.viewCount), 0) / longFormValidVideos.length;

    const shortsCommentRate = shortsValidVideos.reduce((sum, v) => 
      sum + (v.commentCount / v.viewCount), 0) / shortsValidVideos.length;
    const longFormCommentRate = longFormValidVideos.reduce((sum, v) => 
      sum + (v.commentCount / v.viewCount), 0) / longFormValidVideos.length;

    const likeRatioDiff = ((shortsEngagementRate - longFormEngagementRate) / longFormEngagementRate) * 100;
    const commentRatioDiff = ((shortsCommentRate - longFormCommentRate) / longFormCommentRate) * 100;

    const details = [
      `Shorts like rate: ${(shortsEngagementRate * 100).toFixed(2)}%`,
      `Long-form like rate: ${(longFormEngagementRate * 100).toFixed(2)}%`,
      `Shorts comment rate: ${(shortsCommentRate * 100).toFixed(3)}%`,
      `Long-form comment rate: ${(longFormCommentRate * 100).toFixed(3)}%`
    ];

    const insights = [];
    if (likeRatioDiff > 20) {
      insights.push('Shorts get significantly more likes per view');
    } else if (likeRatioDiff < -20) {
      insights.push('Long-form content gets more likes per view');
    }

    if (commentRatioDiff < -30) {
      insights.push('Long-form content generates more discussion per view');
    }

    return {
      questionId: 'shorts-vs-longform-engagement',
      question: 'How do Shorts compare in engagement to long-form uploads?',
      answer: `Shorts get ${likeRatioDiff > 0 ? `${likeRatioDiff.toFixed(1)}% more` : `${Math.abs(likeRatioDiff).toFixed(1)}% fewer`} likes per view`,
      value: { likeRatioDiff, commentRatioDiff },
      details,
      insights
    };
  }

  private calculateShortsEngagementOutliers(): AnalyticsResult {
    const { shorts } = this.categorizeByDuration(this.channelVideos);
    const validShorts = shorts.filter(v => v.viewCount > 0 && v.likeCount >= 0);

    if (validShorts.length < 5) {
      return {
        questionId: 'shorts-engagement-outliers',
        question: 'Which Shorts are outliers with unusually high or low engagement ratios?',
        answer: 'Insufficient Shorts data',
        value: null,
        details: ['Need at least 5 Shorts with engagement data for outlier analysis.'],
        insights: []
      };
    }

    const ratios = validShorts.map(video => ({
      video,
      ratio: video.likeCount / video.viewCount
    }));

    const averageRatio = ratios.reduce((sum, r) => sum + r.ratio, 0) / ratios.length;
    const stdDev = Math.sqrt(
      ratios.reduce((sum, r) => sum + Math.pow(r.ratio - averageRatio, 2), 0) / ratios.length
    );

    const threshold = 1.5 * stdDev;
    const highOutliers = ratios.filter(r => r.ratio > averageRatio + threshold);
    const lowOutliers = ratios.filter(r => r.ratio < averageRatio - threshold);

    const details = [
      `Average Shorts like ratio: ${(averageRatio * 100).toFixed(2)}%`,
      `High engagement outliers: ${highOutliers.length}`,
      `Low engagement outliers: ${lowOutliers.length}`
    ];

    if (highOutliers.length > 0) {
      const best = highOutliers.sort((a, b) => b.ratio - a.ratio)[0];
      details.push(`Best Short: "${best.video.title}" - ${(best.ratio * 100).toFixed(2)}%`);
    }

    const insights = [];
    if (highOutliers.length > 0) {
      insights.push('Some Shorts have exceptional engagement - analyze their content style');
    }
    if (lowOutliers.length > 0) {
      insights.push('Some Shorts underperformed - review thumbnail and hook effectiveness');
    }

    return {
      questionId: 'shorts-engagement-outliers',
      question: 'Which Shorts are outliers with unusually high or low engagement ratios?',
      answer: `${highOutliers.length} high outliers, ${lowOutliers.length} low outliers`,
      value: { high: highOutliers.length, low: lowOutliers.length },
      details,
      insights
    };
  }

  private calculateShortsVsLongformEngagementType(): AnalyticsResult {
    const { shorts, longForm } = this.categorizeByDuration(this.channelVideos);
    
    if (shorts.length === 0 || longForm.length === 0) {
      return {
        questionId: 'shorts-vs-longform-engagement-type',
        question: 'Do Shorts generate proportionally more likes but fewer comments vs long-form?',
        answer: 'Need both content types',
        value: null,
        details: ['Analysis requires both Shorts and long-form videos.'],
        insights: []
      };
    }

    const shortsValidVideos = shorts.filter(v => v.viewCount > 0);
    const longFormValidVideos = longForm.filter(v => v.viewCount > 0);

    // Calculate like and comment rates
    const shortsLikeRate = shortsValidVideos.reduce((sum, v) => 
      sum + (v.likeCount / v.viewCount), 0) / shortsValidVideos.length;
    const shortsCommentRate = shortsValidVideos.reduce((sum, v) => 
      sum + (v.commentCount / v.viewCount), 0) / shortsValidVideos.length;

    const longFormLikeRate = longFormValidVideos.reduce((sum, v) => 
      sum + (v.likeCount / v.viewCount), 0) / longFormValidVideos.length;
    const longFormCommentRate = longFormValidVideos.reduce((sum, v) => 
      sum + (v.commentCount / v.viewCount), 0) / longFormValidVideos.length;

    // Calculate ratios
    const likeRatio = shortsLikeRate / longFormLikeRate;
    const commentRatio = shortsCommentRate / longFormCommentRate;

    const details = [
      `Shorts: ${(shortsLikeRate * 100).toFixed(2)}% like rate, ${(shortsCommentRate * 100).toFixed(3)}% comment rate`,
      `Long-form: ${(longFormLikeRate * 100).toFixed(2)}% like rate, ${(longFormCommentRate * 100).toFixed(3)}% comment rate`,
      `Like ratio (Shorts/Long-form): ${likeRatio.toFixed(2)}x`,
      `Comment ratio (Shorts/Long-form): ${commentRatio.toFixed(2)}x`
    ];

    const insights = [];
    if (likeRatio > 1.2 && commentRatio < 0.8) {
      insights.push('Yes - Shorts get more likes but fewer comments per view');
    } else if (likeRatio < 0.8 && commentRatio > 1.2) {
      insights.push('No - Long-form content gets more engagement overall');
    } else {
      insights.push('Similar engagement patterns between content types');
    }

    if (commentRatio < 0.5) {
      insights.push('Shorts format limits discussion compared to long-form');
    }

    return {
      questionId: 'shorts-vs-longform-engagement-type',
      question: 'Do Shorts generate proportionally more likes but fewer comments vs long-form?',
      answer: `Shorts get ${likeRatio.toFixed(1)}x likes and ${commentRatio.toFixed(1)}x comments per view`,
      value: { likeRatio, commentRatio },
      details,
      insights
    };
  }

  private calculateShortsDisabledComments(): AnalyticsResult {
    const { shorts } = this.categorizeByDuration(this.channelVideos);
    
    if (shorts.length === 0) {
      return {
        questionId: 'shorts-disabled-comments',
        question: 'What percentage of Shorts have comments disabled?',
        answer: 'No Shorts found',
        value: null,
        details: [],
        insights: []
      };
    }

    // Estimate based on Shorts with suspiciously low comment counts
    const shortsWithViews = shorts.filter(v => v.viewCount > 50);
    const suspiciouslyLowComments = shortsWithViews.filter(v => {
      const expectedComments = v.viewCount * 0.0005; // Very conservative for Shorts
      return v.commentCount < expectedComments * 0.1;
    });

    const estimatedDisabledPercentage = shortsWithViews.length > 0 
      ? (suspiciouslyLowComments.length / shortsWithViews.length) * 100 
      : 0;

    const details = [
      `Shorts analyzed: ${shortsWithViews.length}`,
      `Suspected disabled comments: ${suspiciouslyLowComments.length}`,
      `Estimated percentage: ${estimatedDisabledPercentage.toFixed(1)}%`,
      'Note: This is an estimate based on comment patterns'
    ];

    const insights = [];
    if (estimatedDisabledPercentage > 40) {
      insights.push('High suspected comment restriction on Shorts');
    } else if (estimatedDisabledPercentage < 15) {
      insights.push('Most Shorts appear to allow comments');
    }
    insights.push('Shorts typically have lower comment rates than long-form content');

    return {
      questionId: 'shorts-disabled-comments',
      question: 'What percentage of Shorts have comments disabled?',
      answer: `Estimated ${estimatedDisabledPercentage.toFixed(1)}% may have restricted comments`,
      value: estimatedDisabledPercentage,
      details,
      insights
    };
  }

  // ============================================================================
  // CHANNEL GROWTH & MOMENTUM CALCULATIONS
  // ============================================================================

  private calculateSubscriberGrowthMonthly(): AnalyticsResult {
    // Note: This requires historical subscriber data which isn't available in standard API response
    // This is a placeholder implementation
    const currentSubscribers = parseInt(this.channelData.statistics.subscriberCount) || 0;
    const channelAge = moment().diff(moment(this.channelData.snippet.publishedAt), 'months') || 1;
    
    const estimatedMonthlyGrowth = currentSubscribers / channelAge;

    const details = [
      `Current subscribers: ${currentSubscribers.toLocaleString()}`,
      `Channel age: ${channelAge} months`,
      `Estimated average growth: ${Math.round(estimatedMonthlyGrowth).toLocaleString()} per month`,
      'Note: Actual growth tracking requires historical data'
    ];

    const insights = [];
    if (estimatedMonthlyGrowth > 10000) {
      insights.push('High estimated growth rate - strong channel momentum');
    } else if (estimatedMonthlyGrowth > 1000) {
      insights.push('Moderate growth rate - steady audience building');
    } else {
      insights.push('Lower growth rate - focus on discoverability and engagement');
    }
    insights.push('Enable YouTube Analytics API for accurate growth tracking');

    return {
      questionId: 'subscriber-growth-monthly',
      question: 'How many subscribers does the channel gain per month on average?',
      answer: `Estimated ${Math.round(estimatedMonthlyGrowth).toLocaleString()} subscribers per month`,
      value: estimatedMonthlyGrowth,
      details,
      insights
    };
  }

  private calculateGrowthAccelerationTrend(): AnalyticsResult {
    // This would require historical subscriber data
    // Placeholder implementation based on video performance trends
    
    if (this.channelVideos.length < 20) {
      return {
        questionId: 'growth-acceleration-trend',
        question: 'Is subscriber growth accelerating, slowing down, or steady?',
        answer: 'Insufficient data for trend analysis',
        value: null,
        details: ['Historical subscriber data required for accurate growth trend analysis.'],
        insights: ['Enable YouTube Analytics API for detailed growth tracking.']
      };
    }

    // Use video performance as a proxy for growth trends
    const sortedVideos = [...this.channelVideos].sort((a, b) => 
      moment(a.publishedAt).unix() - moment(b.publishedAt).unix()
    );

    const recentVideos = sortedVideos.slice(-Math.floor(sortedVideos.length * 0.3));
    const olderVideos = sortedVideos.slice(0, Math.floor(sortedVideos.length * 0.3));

    const recentAvgViews = recentVideos.reduce((sum, v) => sum + v.viewCount, 0) / recentVideos.length;
    const olderAvgViews = olderVideos.reduce((sum, v) => sum + v.viewCount, 0) / olderVideos.length;

    const viewsChange = ((recentAvgViews - olderAvgViews) / olderAvgViews) * 100;

    let trend = 'steady';
    if (viewsChange > 25) trend = 'accelerating';
    else if (viewsChange < -25) trend = 'slowing down';

    const details = [
      `Recent videos avg views: ${Math.round(recentAvgViews).toLocaleString()}`,
      `Older videos avg views: ${Math.round(olderAvgViews).toLocaleString()}`,
      `Performance trend: ${viewsChange > 0 ? '+' : ''}${viewsChange.toFixed(1)}%`,
      'Note: Based on video performance as growth proxy'
    ];

    const insights = [];
    if (trend === 'accelerating') {
      insights.push('Video performance trending upward - likely indicates growing subscriber base');
    } else if (trend === 'slowing down') {
      insights.push('Video performance declining - may indicate slowing growth');
    } else {
      insights.push('Consistent video performance - steady growth pattern');
    }

    return {
      questionId: 'growth-acceleration-trend',
      question: 'Is subscriber growth accelerating, slowing down, or steady?',
      answer: `Growth appears to be ${trend} (based on video performance trends)`,
      value: trend,
      details,
      insights
    };
  }

  private calculateShortsSubscriberContribution(): AnalyticsResult {
    // This would require attribution data from YouTube Analytics
    // Placeholder implementation based on Shorts performance
    
    const { shorts, longForm } = this.categorizeByDuration(this.channelVideos);
    
    if (shorts.length === 0) {
      return {
        questionId: 'shorts-subscriber-contribution',
        question: 'What percentage of new subscribers come from Shorts vs. long-form videos?',
        answer: 'No Shorts found',
        value: null,
        details: [],
        insights: []
      };
    }

    // Estimate based on view distribution and discovery potential
    const shortsViews = shorts.reduce((sum, v) => sum + v.viewCount, 0);
    const longFormViews = longForm.reduce((sum, v) => sum + v.viewCount, 0);
    const totalViews = shortsViews + longFormViews;

    // Shorts typically have higher discovery but lower conversion rates
    const shortsDiscoveryMultiplier = 1.5; // Shorts get more discovery
    const shortsConversionMultiplier = 0.7; // But lower subscriber conversion

    const adjustedShortsContribution = (shortsViews * shortsDiscoveryMultiplier * shortsConversionMultiplier);
    const adjustedLongFormContribution = longFormViews;
    const adjustedTotal = adjustedShortsContribution + adjustedLongFormContribution;

    const estimatedShortsPercentage = (adjustedShortsContribution / adjustedTotal) * 100;
    const estimatedLongFormPercentage = 100 - estimatedShortsPercentage;

    const details = [
      `Estimated Shorts contribution: ${estimatedShortsPercentage.toFixed(1)}%`,
      `Estimated long-form contribution: ${estimatedLongFormPercentage.toFixed(1)}%`,
      `Based on: View distribution and typical conversion patterns`,
      'Note: Actual attribution requires YouTube Analytics API'
    ];

    const insights = [];
    if (estimatedShortsPercentage > 60) {
      insights.push('Shorts likely driving majority of subscriber discovery');
    } else if (estimatedShortsPercentage > 30) {
      insights.push('Balanced subscriber acquisition from both content types');
    } else {
      insights.push('Long-form content likely primary subscriber driver');
    }

    return {
      questionId: 'shorts-subscriber-contribution',
      question: 'What percentage of new subscribers come from Shorts vs. long-form videos?',
      answer: `Estimated ${estimatedShortsPercentage.toFixed(1)}% from Shorts, ${estimatedLongFormPercentage.toFixed(1)}% from long-form`,
      value: { shorts: estimatedShortsPercentage, longForm: estimatedLongFormPercentage },
      details,
      insights
    };
  }

  private calculateShortsSubscriberSpikes(): AnalyticsResult {
    // This requires historical subscriber data with timestamps
    // Placeholder implementation based on Shorts view spikes
    
    const { shorts } = this.categorizeByDuration(this.channelVideos);
    
    if (shorts.length < 5) {
      return {
        questionId: 'shorts-subscriber-spikes',
        question: 'Do Shorts tend to drive spikes in subscriber growth more than regular videos?',
        answer: 'Insufficient Shorts data',
        value: null,
        details: ['Need at least 5 Shorts for spike analysis.'],
        insights: []
      };
    }

    // Identify Shorts with unusually high view counts (potential viral hits)
    const shortsAvgViews = shorts.reduce((sum, v) => sum + v.viewCount, 0) / shorts.length;
    const viralThreshold = shortsAvgViews * 3; // 3x average as viral threshold
    const viralShorts = shorts.filter(v => v.viewCount > viralThreshold);

    const { longForm } = this.categorizeByDuration(this.channelVideos);
    const longFormAvgViews = longForm.length > 0 
      ? longForm.reduce((sum, v) => sum + v.viewCount, 0) / longForm.length 
      : 0;
    const viralLongForm = longForm.filter(v => v.viewCount > longFormAvgViews * 3);

    const details = [
      `Viral Shorts (3x+ avg views): ${viralShorts.length}`,
      `Viral long-form videos: ${viralLongForm.length}`,
      `Shorts viral rate: ${((viralShorts.length / shorts.length) * 100).toFixed(1)}%`,
      `Long-form viral rate: ${longForm.length > 0 ? ((viralLongForm.length / longForm.length) * 100).toFixed(1) : '0'}%`
    ];

    const insights = [];
    const shortsViralRate = viralShorts.length / shorts.length;
    const longFormViralRate = longForm.length > 0 ? viralLongForm.length / longForm.length : 0;

    if (shortsViralRate > longFormViralRate * 1.5) {
      insights.push('Shorts have higher viral potential - likely drive more growth spikes');
    } else if (longFormViralRate > shortsViralRate) {
      insights.push('Long-form content creates more viral moments');
    } else {
      insights.push('Similar viral potential between content types');
    }

    if (viralShorts.length > 0) {
      const topShort = viralShorts.sort((a, b) => b.viewCount - a.viewCount)[0];
      insights.push(`Top viral Short: "${topShort.title}" with ${topShort.viewCount.toLocaleString()} views`);
    }

    return {
      questionId: 'shorts-subscriber-spikes',
      question: 'Do Shorts tend to drive spikes in subscriber growth more than regular videos?',
      answer: `Shorts have ${(shortsViralRate * 100).toFixed(1)}% viral rate vs ${(longFormViralRate * 100).toFixed(1)}% for long-form`,
      value: { shortsViralRate, longFormViralRate },
      details,
      insights
    };
  }

  private calculateShortsPostingFrequencyImpact(): AnalyticsResult {
    const { shorts, longForm } = this.categorizeByDuration(this.channelVideos);
    
    if (shorts.length === 0) {
      return {
        questionId: 'shorts-posting-frequency-impact',
        question: 'Has Shorts adoption led to increased overall posting frequency?',
        answer: 'No Shorts found',
        value: null,
        details: [],
        insights: []
      };
    }

    // Compare posting frequency before and after Shorts adoption
    const sortedVideos = [...this.channelVideos].sort((a, b) => 
      moment(a.publishedAt).unix() - moment(b.publishedAt).unix()
    );

    const firstShortDate = moment(shorts.sort((a, b) => 
      moment(a.publishedAt).unix() - moment(b.publishedAt).unix()
    )[0].publishedAt);

    const videosBeforeShorts = sortedVideos.filter(v => 
      moment(v.publishedAt).isBefore(firstShortDate)
    );
    const videosAfterShorts = sortedVideos.filter(v => 
      moment(v.publishedAt).isAfter(firstShortDate)
    );

    if (videosBeforeShorts.length < 5 || videosAfterShorts.length < 5) {
      return {
        questionId: 'shorts-posting-frequency-impact',
        question: 'Has Shorts adoption led to increased overall posting frequency?',
        answer: 'Insufficient data for comparison',
        value: null,
        details: ['Need sufficient videos both before and after Shorts adoption.'],
        insights: []
      };
    }

    const beforeDuration = moment(videosBeforeShorts[videosBeforeShorts.length - 1].publishedAt)
      .diff(moment(videosBeforeShorts[0].publishedAt), 'days');
    const afterDuration = moment(videosAfterShorts[videosAfterShorts.length - 1].publishedAt)
      .diff(moment(videosAfterShorts[0].publishedAt), 'days');

    const beforeFrequency = videosBeforeShorts.length / Math.max(beforeDuration / 7, 1);
    const afterFrequency = videosAfterShorts.length / Math.max(afterDuration / 7, 1);

    const frequencyChange = ((afterFrequency - beforeFrequency) / beforeFrequency) * 100;

    const details = [
      `Before Shorts: ${beforeFrequency.toFixed(1)} uploads per week`,
      `After Shorts: ${afterFrequency.toFixed(1)} uploads per week`,
      `Change: ${frequencyChange > 0 ? '+' : ''}${frequencyChange.toFixed(1)}%`,
      `Shorts in recent period: ${videosAfterShorts.filter(v => v.isShort).length}`
    ];

    const insights = [];
    if (frequencyChange > 50) {
      insights.push('Shorts adoption significantly increased posting frequency');
    } else if (frequencyChange > 20) {
      insights.push('Moderate increase in posting frequency with Shorts');
    } else if (frequencyChange < -20) {
      insights.push('Posting frequency decreased despite Shorts adoption');
    } else {
      insights.push('Posting frequency remained relatively stable');
    }

    return {
      questionId: 'shorts-posting-frequency-impact',
      question: 'Has Shorts adoption led to increased overall posting frequency?',
      answer: `Posting frequency ${frequencyChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(frequencyChange).toFixed(1)}%`,
      value: frequencyChange,
      details,
      insights
    };
  }

  // ============================================================================
  // MAIN CALCULATION METHOD
  // ============================================================================

  public calculateAnswer(question: AnalyticsQuestion): AnalyticsResult {
    try {
      switch (question.id) {
        // Posting Frequency & Consistency
        case 'posting-frequency-avg':
          return this.calculatePostingFrequency('long-form');
        case 'shorts-frequency':
          return this.calculatePostingFrequency('shorts');
        case 'posting-day-pattern':
          return this.calculatePostingDayPattern();
        case 'posting-time-pattern':
          return this.calculatePostingTimePattern();
        case 'upload-gaps':
          return this.calculateUploadGaps();
        case 'frequency-trend':
          return this.calculateFrequencyTrend();
        case 'yearly-uploads':
          return this.calculateYearlyUploads();
        case 'consecutive-streak':
          return this.calculateConsecutiveStreak();
        case 'hiatuses-analysis':
          return this.calculateHiatuses();
        case 'recent-upload-percentage':
          return this.calculateRecentUploadPercentage();
        case 'shorts-frequency-trend':
          return this.calculateShortsFrequencyTrend();
        case 'shorts-posting-pattern':
          return this.calculateShortsPostingPattern();
        case 'shorts-upload-gaps':
          return this.calculateShortsUploadGaps();

        // Video Length & Content Mix
        case 'average-video-length':
          return this.calculateAverageVideoLength('long-form');
        case 'shorts-length-avg':
          return this.calculateAverageVideoLength('shorts');
        case 'length-trend':
          return this.calculateLengthTrend();
        case 'length-extremes':
          return this.calculateLengthExtremes();
        case 'length-performance':
          return this.calculateLengthPerformance();
        case 'length-distribution':
          return this.calculateLengthDistribution('long-form');
        case 'shorts-length-distribution':
          return this.calculateLengthDistribution('shorts');
        case 'length-buckets-preference':
          return this.calculateLengthBucketsPreference();
        case 'shorts-length-buckets':
          return this.calculateShortsLengthBuckets();
        case 'top-videos-length':
          return this.calculateTopVideosLength();
        case 'shorts-vs-longform-views':
          return this.calculateShortsVsLongformViews();
        case 'recurring-themes-performance':
          return this.calculateRecurringThemesPerformance();
        case 'collab-performance':
          return this.calculateCollabPerformance();
        case 'shorts-percentage':
          return this.calculateShortsPercentage();
        case 'shorts-themes-performance':
          return this.calculateShortsThemesPerformance();

        // Viewership & Performance Metrics
        case 'average-views':
          return this.calculateAverageViews('long-form');
        case 'average-views-recent':
          return this.calculateAverageViews('long-form', true);
        case 'shorts-views-avg':
          return this.calculateAverageViews('shorts');
        case 'shorts-views-recent':
          return this.calculateAverageViews('shorts', true);
        case 'median-views':
          return this.calculateMedianViews('long-form');
        case 'shorts-median-views':
          return this.calculateMedianViews('shorts');
        case 'milestone-percentage':
          return this.calculateViewMilestones('long-form');
        case 'shorts-milestones':
          return this.calculateViewMilestones('shorts', [1000, 10000, 100000]);
        case 'newer-vs-older-traction':
          return this.calculateNewerVsOlderTraction();
        case 'views-by-year':
          return this.calculateViewsByYear();
        case 'top-videos-view-percentage':
          return this.calculateTopVideosViewPercentage();
        case 'view-distribution-skew':
          return this.calculateViewDistributionSkew();
        case 'views-per-day-rate':
          return this.calculateViewsPerDayRate();
        case 'view-velocity-comparison':
          return this.calculateViewVelocityComparison();
        case 'old-vs-new-views':
          return this.calculateOldVsNewViews();
        case 'shorts-top-performers':
          return this.calculateShortsTopPerformers();
        case 'shorts-velocity':
          return this.calculateShortsVelocity();
        case 'shorts-velocity-comparison':
          return this.calculateShortsVelocityComparison();
        case 'shorts-total-views-contribution':
          return this.calculateShortsViewsContribution();

        // Audience Engagement
        case 'average-likes':
          return this.calculateAverageLikes();
        case 'like-to-view-ratio':
          return this.calculateEngagementRatio('long-form', 'likes');
        case 'shorts-engagement-ratio':
          return this.calculateEngagementRatio('shorts', 'likes');
        case 'engagement-outliers':
          return this.calculateEngagementOutliers();
        case 'comment-analysis':
          return this.calculateAverageComments();
        case 'comment-trend':
          return this.calculateCommentTrend();
        case 'comment-to-view-ratio':
          return this.calculateEngagementRatio('long-form', 'comments');
        case 'shorts-comment-ratio':
          return this.calculateEngagementRatio('shorts', 'comments');
        case 'highest-engagement-videos':
          return this.calculateHighestEngagementVideos();
        case 'disabled-comments-percentage':
          return this.calculateDisabledCommentsPercentage();
        case 'shorts-vs-longform-engagement':
          return this.calculateShortsVsLongformEngagement();
        case 'shorts-engagement-outliers':
          return this.calculateShortsEngagementOutliers();
        case 'shorts-vs-longform-engagement-type':
          return this.calculateShortsVsLongformEngagementType();
        case 'shorts-disabled-comments':
          return this.calculateShortsDisabledComments();

        // Channel Growth & Momentum
        case 'subscriber-growth-monthly':
          return this.calculateSubscriberGrowthMonthly();
        case 'growth-acceleration-trend':
          return this.calculateGrowthAccelerationTrend();
        case 'shorts-subscriber-contribution':
          return this.calculateShortsSubscriberContribution();
        case 'shorts-subscriber-spikes':
          return this.calculateShortsSubscriberSpikes();
        case 'shorts-posting-frequency-impact':
          return this.calculateShortsPostingFrequencyImpact();

        default:
          return {
            questionId: question.id,
            question: question.question,
            answer: 'Calculation not yet implemented',
            value: null,
            details: ['This specific calculation is still being developed.'],
            insights: ['More analytics features coming soon!']
          };
      }
    } catch (error) {
      console.error('Error calculating analytics:', error);
      return {
        questionId: question.id,
        question: question.question,
        answer: 'Error calculating result',
        value: null,
        details: ['An error occurred while processing this calculation.'],
        insights: ['Please try again or contact support if the issue persists.']
      };
    }
  }
}