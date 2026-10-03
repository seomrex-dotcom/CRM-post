import React, { useState } from 'react';
import { PlatformId, PostMedia, SocialAccount, ChannelSpecificSetting } from '../types';
import { PLATFORM_INFO, MetaAiIcon } from './SocialIcons';
import { scanContentPolicy } from '../utils/policyScanner';
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Heart,
  Bookmark,
  Send,
  Music,
  ThumbsDown,
  Globe,
  MoreHorizontal,
  Smartphone,
  Monitor,
  Sparkles,
  ExternalLink,
  Play,
  Volume2,
  CheckCircle2,
  Eye,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

interface PostLivePreviewProps {
  content: string;
  media: PostMedia[];
  selectedPlatforms: PlatformId[];
  accounts?: SocialAccount[];
  targetAccountIds?: string[];
  channelSettings?: Record<string, ChannelSpecificSetting>;
  scheduledDate?: string;
  postFormat?: 'feed' | 'reel' | 'short' | 'story';
}

export const PostLivePreview: React.FC<PostLivePreviewProps> = ({
  content,
  media,
  selectedPlatforms,
  accounts = [],
  targetAccountIds = [],
  channelSettings = {},
  scheduledDate,
  postFormat = 'feed',
}) => {
  const activePlatforms =
    selectedPlatforms.length > 0 ? selectedPlatforms : (['facebook'] as PlatformId[]);
  const [activePlatformTab, setActivePlatformTab] = useState<PlatformId>(activePlatforms[0]);
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isExpanded, setIsExpanded] = useState(false);

  // Synchronize current platform tab
  const currentPreviewPlatform: PlatformId = activePlatforms.includes(activePlatformTab)
    ? activePlatformTab
    : activePlatforms[0];

  // Find target accounts for the active preview platform
  const platformAccounts = accounts.filter(
    (a) => a.platform === currentPreviewPlatform && (targetAccountIds.length === 0 || targetAccountIds.includes(a.id))
  );

  const [selectedChannelIdForPreview, setSelectedChannelIdForPreview] = useState<string | null>(null);

  // Active channel to showcase in the preview
  const currentAccount: SocialAccount =
    platformAccounts.find((a) => a.id === selectedChannelIdForPreview) ||
    platformAccounts[0] || {
      id: 'default',
      platform: currentPreviewPlatform,
      name: PLATFORM_INFO[currentPreviewPlatform].name,
      handle: `@${currentPreviewPlatform}_official`,
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      followers: 125000,
      connected: true,
    };

  const channelSetting = currentAccount ? channelSettings[currentAccount.id] : undefined;

  // Caption to display (custom channel caption if present, otherwise master caption)
  const rawCaption = (channelSetting?.content?.trim() || content.trim()) ||
    'Nội dung bài viết mẫu sẽ hiển thị trực tiếp tại đây khi bạn nhập văn bản...';

  // Real-time policy scan for current preview platform
  const previewPolicyScan = scanContentPolicy(rawCaption, [currentPreviewPlatform]);

  // Helper to format hashtags & mentions with platform styling
  const renderFormattedText = (text: string, platformId: PlatformId) => {
    const words = text.split(/(\s+)/);
    const linkColor =
      platformId === 'facebook'
        ? 'text-[#1877F2] font-medium hover:underline'
        : platformId === 'instagram'
        ? 'text-[#00376B] font-semibold hover:underline'
        : platformId === 'tiktok'
        ? 'text-cyan-300 font-semibold'
        : 'text-blue-600 hover:underline';

    return words.map((word, index) => {
      if (word.startsWith('#') || word.startsWith('@')) {
        return (
          <span key={index} className={linkColor}>
            {word}
          </span>
        );
      }
      if (word.startsWith('http://') || word.startsWith('https://')) {
        return (
          <span key={index} className="text-blue-500 underline break-all">
            {word}
          </span>
        );
      }
      return word;
    });
  };

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full shadow-xs">
      {/* Top Header: Platform Tabs + Device Switcher + Live Indicator */}
      <div className="p-3 bg-white border-b border-slate-200 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Platform tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {activePlatforms.map((plat) => {
              const info = PLATFORM_INFO[plat];
              const Icon = info.icon;
              const isTabActive = currentPreviewPlatform === plat;
              return (
                <button
                  key={plat}
                  type="button"
                  onClick={() => {
                    setActivePlatformTab(plat);
                    setSelectedChannelIdForPreview(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    isTabActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={`Xem trước trên ${info.name}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{info.tagLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Device & Sync Indicator */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live typing pulse */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Thời gian thực</span>
            </div>

            {/* Device switcher */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-md">
              <button
                type="button"
                onClick={() => setDeviceMode('mobile')}
                className={`p-1 rounded text-xs transition-colors ${
                  deviceMode === 'mobile'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Giao diện di động (Mobile)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('desktop')}
                className={`p-1 rounded text-xs transition-colors ${
                  deviceMode === 'desktop'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Giao diện máy tính (Desktop)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Channel Switcher inside Preview if multiple channels for this platform */}
        {platformAccounts.length > 1 && (
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
            <span className="text-[10px] text-slate-500 font-semibold shrink-0">
              Đang xem kênh:
            </span>
            {platformAccounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => setSelectedChannelIdForPreview(acc.id)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all shrink-0 ${
                  currentAccount.id === acc.id
                    ? 'bg-blue-100 text-blue-800 border border-blue-200 font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <img
                  src={acc.avatar}
                  alt={acc.name}
                  className="w-3.5 h-3.5 rounded-full object-cover"
                />
                <span className="truncate max-w-[120px]">{acc.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Real-time Platform Policy Warning Banner */}
        {previewPolicyScan.hasViolations ? (
          <div className="px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg text-red-900 text-[11px] font-medium flex items-center justify-between gap-1.5 animate-pulse">
            <div className="flex items-center gap-1.5 truncate">
              {currentPreviewPlatform === 'facebook' || currentPreviewPlatform === 'instagram' ? (
                <MetaAiIcon className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
              )}
              <span className="truncate">
                {currentPreviewPlatform === 'facebook' || currentPreviewPlatform === 'instagram' ? 'Meta AI Cảnh báo: ' : 'Cảnh báo: '}
                Phát hiện {previewPolicyScan.violations.length} từ khóa rủi ro trên {PLATFORM_INFO[currentPreviewPlatform].tagLabel}
              </span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-200 text-red-900 shrink-0">
              {previewPolicyScan.safetyScore}/100
            </span>
          </div>
        ) : content.trim() ? (
          <div className="px-2.5 py-1 bg-emerald-50/80 border border-emerald-200/80 rounded-lg text-emerald-900 text-[10px] font-semibold flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 truncate">
              {currentPreviewPlatform === 'facebook' || currentPreviewPlatform === 'instagram' ? (
                <MetaAiIcon className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
              <span className="truncate">
                {currentPreviewPlatform === 'facebook' || currentPreviewPlatform === 'instagram'
                  ? 'Meta AI: Chuẩn chính sách Meta Ads & Bảng tin (100/100)'
                  : `Nội dung đạt chuẩn kiểm duyệt của ${PLATFORM_INFO[currentPreviewPlatform].tagLabel} (100/100)`}
              </span>
            </div>
            {(currentPreviewPlatform === 'facebook' || currentPreviewPlatform === 'instagram') && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-950 shrink-0">
                Sẵn sàng chạy Ads
              </span>
            )}
          </div>
        ) : null}
      </div>

      {/* Preview Viewport Canvas */}
      <div className="p-4 sm:p-6 flex-1 flex items-center justify-center overflow-y-auto bg-slate-100/70 min-h-[460px]">
        <div
          className={`w-full transition-all duration-300 ${
            deviceMode === 'mobile' ? 'max-w-[340px]' : 'max-w-md'
          }`}
        >
          {/* ============================================================ */}
          {/* 1. FACEBOOK LIVE PREVIEW                                     */}
          {/* ============================================================ */}
          {currentPreviewPlatform === 'facebook' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-left">
              {/* Header */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentAccount.avatar}
                    alt={currentAccount.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900">
                        {currentAccount.name}
                      </span>
                      <span className="text-[#1877F2] font-bold text-xs" title="Đã xác minh">
                        ✓
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span>Vừa xong</span>
                      <span>·</span>
                      <Globe className="w-3 h-3" />
                    </div>
                  </div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
              </div>

              {/* Caption */}
              <div className="px-3.5 pb-3 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                {renderFormattedText(rawCaption, 'facebook')}
              </div>

              {/* Media gallery */}
              {media.length > 0 ? (
                <div className="bg-slate-950 overflow-hidden relative">
                  {media.length === 1 ? (
                    <img
                      src={media[0].url}
                      alt="Facebook Post Media"
                      className="w-full aspect-video object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : media.length === 2 ? (
                    <div className="grid grid-cols-2 gap-0.5">
                      <img
                        src={media[0].url}
                        alt="Media 1"
                        className="w-full aspect-square object-cover"
                      />
                      <img
                        src={media[1].url}
                        alt="Media 2"
                        className="w-full aspect-square object-cover"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-0.5">
                      <img
                        src={media[0].url}
                        alt="Media 1"
                        className="w-full aspect-[4/5] object-cover"
                      />
                      <div className="grid grid-rows-2 gap-0.5">
                        <img
                          src={media[1].url}
                          alt="Media 2"
                          className="w-full aspect-[4/2.5] object-cover"
                        />
                        <div className="relative">
                          <img
                            src={media[2].url}
                            alt="Media 3"
                            className="w-full aspect-[4/2.5] object-cover"
                          />
                          {media.length > 3 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-base font-bold">
                              +{media.length - 2}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA Banner if configured */}
                  {channelSetting?.ctaButton && (
                    <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono">
                          {currentAccount.handle}
                        </div>
                        <div className="font-bold text-slate-900 truncate">
                          Khám phá chi tiết tại bài viết
                        </div>
                      </div>
                      <button
                        type="button"
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded text-xs transition-colors shrink-0"
                      >
                        {channelSetting.ctaButton}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-100 border-y border-slate-200 aspect-video flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                  <span className="text-xs font-medium">Chưa có hình ảnh/video</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Bài viết sẽ hiển thị ở định dạng trạng thái văn bản thuần túy
                  </span>
                </div>
              )}

              {/* Engagement Bar */}
              <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px]">
                    👍
                  </span>
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px]">
                    ❤️
                  </span>
                  <span>1.4K</span>
                </div>
                <div>128 bình luận · 64 chia sẻ</div>
              </div>

              {/* Action buttons */}
              <div className="px-2 py-1.5 flex items-center justify-around text-xs text-slate-600 font-semibold">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100">
                  <ThumbsUp className="w-4 h-4 text-blue-600" />
                  <span>Thích</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100">
                  <MessageCircle className="w-4 h-4" />
                  <span>Bình luận</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100">
                  <Share2 className="w-4 h-4" />
                  <span>Chia sẻ</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. INSTAGRAM LIVE PREVIEW                                    */}
          {/* ============================================================ */}
          {currentPreviewPlatform === 'instagram' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-left">
              {/* Header */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                    <img
                      src={currentAccount.avatar}
                      alt={currentAccount.name}
                      className="w-full h-full rounded-full object-cover border border-white"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>{currentAccount.handle.replace('@', '')}</span>
                      <span className="text-[#0095F6] text-[10px]">●</span>
                    </div>
                    <div className="text-[10px] text-slate-400">TP. Hồ Chí Minh, Việt Nam</div>
                  </div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-slate-500 cursor-pointer" />
              </div>

              {/* Square / Vertical Media */}
              <div className="bg-slate-950 aspect-square relative overflow-hidden flex items-center justify-center">
                {media.length > 0 ? (
                  <img
                    src={media[0].url}
                    alt="Instagram Post Media"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-slate-400 text-xs text-center p-4">
                    Instagram yêu cầu ảnh/video vuông (1:1) hoặc dọc (4:5)
                  </div>
                )}
                {media.length > 1 && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-mono">
                    1/{media.length}
                  </div>
                )}
              </div>

              {/* Action bar */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-900">
                    <Heart className="w-5 h-5 hover:text-red-500 cursor-pointer transition-colors" />
                    <MessageCircle className="w-5 h-5 cursor-pointer" />
                    <Send className="w-5 h-5 cursor-pointer" />
                  </div>
                  <Bookmark className="w-5 h-5 text-slate-900 cursor-pointer" />
                </div>

                <div className="text-xs font-bold text-slate-900">
                  {currentAccount.followers ? Math.floor(currentAccount.followers / 50).toLocaleString() : '1,840'} lượt thích
                </div>

                {/* Caption */}
                <div className="text-xs text-slate-800 leading-relaxed">
                  <span className="font-bold mr-1.5 text-slate-900">
                    {currentAccount.handle.replace('@', '')}
                  </span>
                  <span className="whitespace-pre-line">
                    {renderFormattedText(rawCaption, 'instagram')}
                  </span>
                </div>

                {/* First comment preview if set */}
                {channelSetting?.firstComment && (
                  <div className="pt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-900 mr-1.5">
                      {currentAccount.handle.replace('@', '')}
                    </span>
                    <span className="text-blue-600 font-mono text-[11px]">
                      {channelSetting.firstComment}
                    </span>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  Vừa xong
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. TIKTOK LIVE PREVIEW                                       */}
          {/* ============================================================ */}
          {currentPreviewPlatform === 'tiktok' && (
            <div className="bg-black text-white rounded-3xl shadow-2xl overflow-hidden relative aspect-[9/16] max-w-[290px] mx-auto flex flex-col justify-between p-3.5 border-2 border-slate-800">
              {/* Media Backdrop */}
              {media.length > 0 ? (
                <img
                  src={media[0].url}
                  alt="TikTok Media"
                  className="absolute inset-0 w-full h-full object-cover opacity-90"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black flex items-center justify-center text-slate-400 text-xs text-center p-4">
                  Video/Ảnh bìa dọc 9:16 TikTok
                </div>
              )}

              {/* Scrim */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />

              {/* Top tabs */}
              <div className="relative z-10 flex items-center justify-center gap-4 text-xs font-semibold pt-1">
                <span className="text-white/60">Đang theo dõi</span>
                <span className="text-white border-b-2 border-white pb-0.5 font-bold">
                  Dành cho bạn
                </span>
              </div>

              {/* Right Floating Actions */}
              <div className="relative z-10 self-end flex flex-col items-center gap-4 pb-10 text-white">
                <div className="relative">
                  <img
                    src={currentAccount.avatar}
                    alt={currentAccount.name}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                    +
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white">
                    <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                  </div>
                  <span className="text-[10px] font-bold mt-1">28.4K</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white">
                    <MessageCircle className="w-5 h-5 fill-white text-white" />
                  </div>
                  <span className="text-[10px] font-bold mt-1">942</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white">
                    <Bookmark className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-bold mt-1">1.8K</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white">
                    <Share2 className="w-5 h-5 fill-white text-white" />
                  </div>
                  <span className="text-[10px] font-bold mt-1">1.1K</span>
                </div>

                {/* Spinning vinyl */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 border-2 border-slate-700 flex items-center justify-center animate-spin">
                  <Music className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Bottom Caption & Audio */}
              <div className="relative z-10 text-left space-y-1.5">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{currentAccount.handle}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 text-black" />
                </div>

                <p className="text-xs text-white/95 line-clamp-3 leading-snug font-normal">
                  {renderFormattedText(rawCaption, 'tiktok')}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-mono">
                  <Music className="w-3 h-3 text-cyan-300" />
                  <span className="truncate">
                    Âm thanh gốc - {currentAccount.name} Official
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. YOUTUBE LIVE PREVIEW                                      */}
          {/* ============================================================ */}
          {currentPreviewPlatform === 'youtube' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-left">
              {/* Media Thumbnail */}
              <div className="bg-slate-950 aspect-video relative overflow-hidden flex items-center justify-center">
                {media.length > 0 ? (
                  <img
                    src={media[0].url}
                    alt="YouTube Video Thumbnail"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-slate-400 text-xs text-center p-4">
                    Thumbnail video YouTube chuẩn 16:9
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] font-semibold">
                  08:45
                </div>
              </div>

              {/* Video Title & Channel Info */}
              <div className="p-3.5 space-y-3">
                <div className="flex gap-3 items-start">
                  <img
                    src={currentAccount.avatar}
                    alt={currentAccount.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                      {channelSetting?.videoTitle?.trim() ||
                        rawCaption.split('\n')[0] ||
                        'Tiêu đề Video YouTube mới nhất 2026'}
                    </h4>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                      <span>{currentAccount.name}</span>
                      <span>·</span>
                      <span>42K lượt xem</span>
                      <span>·</span>
                      <span>Vừa tải lên</span>
                    </div>
                  </div>
                </div>

                {/* Description Preview */}
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 whitespace-pre-line line-clamp-2 leading-relaxed">
                  {renderFormattedText(rawCaption, 'youtube')}
                </div>

                {/* YouTube Action Pill Row */}
                <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1">
                  <div className="flex items-center rounded-full bg-slate-100 overflow-hidden font-semibold">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-200">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>4.8K</span>
                    </button>
                    <div className="w-px h-4 bg-slate-300" />
                    <button className="px-2.5 py-1.5 hover:bg-slate-200">
                      <ThumbsDown className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>

                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 font-semibold">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Chia sẻ</span>
                  </button>

                  <button className="px-3 py-1.5 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 ml-auto shrink-0">
                    Đăng ký
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
