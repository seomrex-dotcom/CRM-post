export type PlatformId = 'facebook' | 'instagram' | 'tiktok' | 'youtube';

export type PostStatus = 'scheduled' | 'published' | 'draft';

export interface BrandCluster {
  id: string; // e.g. 'brand-mrex', 'brand-zen', 'brand-techlife'
  name: string; // 'Mrex', 'Zen', 'TechLife'
  code: string;
  description?: string;
  color: string; // Hex e.g. '#6366F1'
  bgLight: string; // e.g. 'bg-indigo-50 border-indigo-200 text-indigo-700'
  badgeColor: string;
  logo: string;
  platforms: PlatformId[]; // e.g. Mrex: ['facebook', 'tiktok']; Zen: ['facebook', 'instagram', 'youtube', 'tiktok']
}

export interface SocialAccount {
  id: string;
  platform: PlatformId;
  name: string;
  handle: string;
  avatar: string;
  followers: number;
  connected: boolean;
  category?: string;
  role?: string;
  lastSynced?: string;
  group?: string; // Nhóm kênh phụ
  brandId?: string; // Cụm thương hiệu sở hữu: 'brand-mrex', 'brand-zen', 'brand-techlife'
  tokenExpiryDays?: number;
  healthStatus?: 'healthy' | 'expiring' | 'error';
  bestPostingHour?: string;
  autoPublishEnabled?: boolean;
}

export interface PostMedia {
  url: string;
  type: 'image' | 'video';
  name?: string;
}

export interface ChannelSpecificSetting {
  content?: string;
  scheduledDate?: string;
  postFormat?: 'feed' | 'reel' | 'short' | 'story';
  firstComment?: string;
  allowDuet?: boolean;
  allowComments?: boolean;
  videoTitle?: string;
  videoVisibility?: 'public' | 'unlisted' | 'private';
  ctaButton?: string;
}

export interface ScheduledPost {
  id: string;
  content: string;
  platforms: PlatformId[];
  media: PostMedia[];
  scheduledDate: string; // Default ISO string e.g. "2026-10-02T10:00:00"
  status: PostStatus;
  createdAt: string;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  targetAccountIds?: string[];
  brandId?: string; // Gắn với cụm thương hiệu Mrex, Zen, v.v.
  tags?: string[];
  postFormat?: 'feed' | 'reel' | 'short' | 'story';
  // Per-channel deep customizations
  channelSettings?: Record<string, ChannelSpecificSetting>;
}

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  maxChars: number;
  supportedMedia: ('image' | 'video')[];
  defaultHandle: string;
}
