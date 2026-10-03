import React, { useState, useRef } from 'react';
import {
  PlatformId,
  PostMedia,
  ScheduledPost,
  SocialAccount,
  ChannelSpecificSetting,
  BrandCluster,
} from '../types';
import { PLATFORM_INFO, PlatformBadge, BrandBadge, MetaAiIcon } from './SocialIcons';
import { PostLivePreview } from './PostLivePreview';
import { BestTimeToPostAdvisor } from './BestTimeToPostAdvisor';
import { ContentPolicyWarning } from './ContentPolicyWarning';
import { scanContentPolicy, fixAllViolations } from '../utils/policyScanner';
import { HASHTAG_SUGGESTIONS, SAMPLE_PRESET_IMAGES, CHANNEL_GROUPS, INITIAL_BRANDS } from '../data/mockData';
import {
  UploadCloud,
  Clock,
  Send,
  Calendar,
  Sparkles,
  X,
  Check,
  Film,
  Hash,
  AlertCircle,
  FolderOpen,
  Plus,
  CheckSquare,
  Square,
  Users,
  Sliders,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Flame,
  Globe,
  Tag,
  Layers,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Info,
  ExternalLink,
} from 'lucide-react';

interface CreatePostViewProps {
  accounts: SocialAccount[];
  brands?: BrandCluster[];
  activeBrandId?: string | 'all';
  onSavePost: (newPost: Omit<ScheduledPost, 'id' | 'createdAt'>, isPublishNow?: boolean) => void;
  onCancel?: () => void;
  onOpenConnectChannel?: () => void;
  onOpenManageBrands?: () => void;
  initialPost?: ScheduledPost | null;
}

export const CreatePostView: React.FC<CreatePostViewProps> = ({
  accounts,
  brands = INITIAL_BRANDS,
  activeBrandId = 'all',
  onSavePost,
  onCancel,
  onOpenConnectChannel,
  onOpenManageBrands,
  initialPost,
}) => {
  // Master caption
  const [content, setContent] = useState(initialPost?.content || '');

  // Brand cluster state ('brand-mrex' by default or activeBrandId)
  const [selectedBrandId, setSelectedBrandId] = useState<string | 'all'>(() => {
    if (initialPost?.brandId) return initialPost.brandId;
    if (activeBrandId && activeBrandId !== 'all') return activeBrandId;
    return 'brand-mrex'; // Default to Mrex as requested by user
  });

  const activeBrandObj = brands.find((b) => b.id === selectedBrandId);

  // Selected platforms (if brand is Mrex, only ['facebook', 'tiktok'] by default)
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(() => {
    if (initialPost?.platforms) return initialPost.platforms;
    if (activeBrandObj) return activeBrandObj.platforms;
    return ['facebook', 'tiktok'];
  });

  // Selected accounts (channels) - initially select accounts of active brand
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(() => {
    if (initialPost?.targetAccountIds && initialPost.targetAccountIds.length > 0) {
      return initialPost.targetAccountIds;
    }
    const initialBrandId = initialPost?.brandId || (activeBrandId !== 'all' ? activeBrandId : 'brand-mrex');
    const brandAccounts = accounts.filter(
      (a) => a.connected && (initialBrandId === 'all' || a.brandId === initialBrandId)
    );
    if (brandAccounts.length > 0) {
      return brandAccounts.map((a) => a.id);
    }
    return accounts.filter((a) => a.connected).map((a) => a.id);
  });

  const [mediaList, setMediaList] = useState<PostMedia[]>(initialPost?.media || []);

  // Post Format: Feed Post, Reel/Short, or Story
  const [postFormat, setPostFormat] = useState<'feed' | 'reel' | 'short' | 'story'>(
    initialPost?.postFormat || 'feed'
  );

  // Global default schedule time
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [globalScheduledDate, setGlobalScheduledDate] = useState(
    initialPost?.scheduledDate ? initialPost.scheduledDate.slice(0, 16) : getDefaultDate()
  );

  // Advanced Mode: Per-channel detailed scheduling & per-channel caption
  const [enablePerChannelSchedule, setEnablePerChannelSchedule] = useState(false);
  const [enablePerChannelCaption, setEnablePerChannelCaption] = useState(false);
  const [showDetailedChannels, setShowDetailedChannels] = useState(false);

  // Channel-specific settings state (keyed by accountId)
  const [channelSettings, setChannelSettings] = useState<Record<string, ChannelSpecificSetting>>(() => {
    if (initialPost?.channelSettings) return initialPost.channelSettings;
    const initial: Record<string, ChannelSpecificSetting> = {};
    accounts.forEach((acc) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const [h, m] = (acc.bestPostingHour || '19:30').split(':');
      tomorrow.setHours(Number(h) || 19, Number(m) || 30, 0, 0);

      initial[acc.id] = {
        content: '',
        scheduledDate: tomorrow.toISOString().slice(0, 16),
        postFormat: 'feed',
        firstComment: '#techlife #marketing #vietnam',
        allowDuet: true,
        allowComments: true,
        videoTitle: '',
        videoVisibility: 'public',
        ctaButton: 'Tìm hiểu thêm',
      };
    });
    return initial;
  });

  // Active channel tab in detailed customizer
  const [activeCustomizingChannelId, setActiveCustomizingChannelId] = useState<string | null>(null);

  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle platform selection
  const handleTogglePlatform = (id: PlatformId) => {
    if (selectedBrandId !== 'all' && activeBrandObj) {
      if (!activeBrandObj.platforms.includes(id)) {
        setFormError(
          `Nền tảng ${PLATFORM_INFO[id].tagLabel} không thuộc cấu hình của ${activeBrandObj.name} (chỉ gồm: ${activeBrandObj.platforms.map((p) => PLATFORM_INFO[p].tagLabel).join(', ')}). Hãy chọn cụm khác hoặc chọn "Tất cả cụm" để đăng đa nền tảng.`
        );
        return;
      }
    }

    setSelectedPlatforms((prev) => {
      let nextPlatforms: PlatformId[];
      if (prev.includes(id)) {
        if (prev.length === 1) {
          setFormError('Vui lòng chọn ít nhất 1 nền tảng để đăng bài.');
          return prev;
        }
        setFormError(null);
        nextPlatforms = prev.filter((p) => p !== id);
        setSelectedAccountIds((accs) =>
          accs.filter((accId) => {
            const acc = accounts.find((a) => a.id === accId);
            return acc ? acc.platform !== id : true;
          })
        );
      } else {
        setFormError(null);
        nextPlatforms = [...prev, id];
        const newPlatformAccounts = accounts
          .filter((a) => a.platform === id && a.connected && (selectedBrandId === 'all' || a.brandId === selectedBrandId))
          .map((a) => a.id);
        setSelectedAccountIds((accs) => Array.from(new Set([...accs, ...newPlatformAccounts])));
      }
      return nextPlatforms;
    });
  };

  // Switch Brand Cluster
  const handleSelectBrand = (brandId: string | 'all') => {
    setSelectedBrandId(brandId);
    setFormError(null);

    if (brandId === 'all') {
      const allConnected = accounts.filter((a) => a.connected).map((a) => a.id);
      setSelectedAccountIds(allConnected);
      setSelectedPlatforms(['facebook', 'instagram', 'tiktok', 'youtube']);
      return;
    }

    const brand = brands.find((b) => b.id === brandId);
    if (brand) {
      setSelectedPlatforms([...brand.platforms]);
      const brandAccounts = accounts.filter((a) => a.brandId === brandId && a.connected);
      setSelectedAccountIds(brandAccounts.map((a) => a.id));
    }
  };

  // Toggle individual account
  const handleToggleAccount = (accountId: string) => {
    setSelectedAccountIds((prev) => {
      if (prev.includes(accountId)) {
        return prev.filter((id) => id !== accountId);
      } else {
        return [...prev, accountId];
      }
    });
  };

  // Quick brand accounts selector
  const handleSelectBrandAccounts = (brandId: string) => {
    const brandAccs = accounts.filter((a) => a.brandId === brandId && a.connected).map((a) => a.id);
    setSelectedAccountIds((prev) => Array.from(new Set([...prev, ...brandAccs])));
  };

  // Group quick selector
  const handleSelectGroup = (groupName: string) => {
    if (groupName === 'all') {
      const allConnected = accounts.filter((a) => a.connected).map((a) => a.id);
      setSelectedAccountIds(allConnected);
      setSelectedPlatforms(['facebook', 'instagram', 'tiktok', 'youtube']);
      return;
    }

    const groupAccounts = accounts.filter((a) => a.group === groupName && a.connected);
    const groupAccIds = groupAccounts.map((a) => a.id);
    const groupPlatforms = Array.from(new Set(groupAccounts.map((a) => a.platform)));

    setSelectedAccountIds(groupAccIds);
    setSelectedPlatforms(groupPlatforms);
  };

  // Update specific channel setting
  const updateChannelSetting = (accountId: string, updates: Partial<ChannelSpecificSetting>) => {
    setChannelSettings((prev) => ({
      ...prev,
      [accountId]: {
        ...(prev[accountId] || {}),
        ...updates,
      },
    }));
  };

  // Min character restriction
  const minCharLimit = Math.min(
    ...selectedPlatforms.map((p) => PLATFORM_INFO[p].maxChars)
  );
  const charsRemaining = minCharLimit - content.length;

  // Real-time Content Policy & Prohibited Keyword Scanner
  const policyScanResult = scanContentPolicy(content, selectedPlatforms);

  const handleReplaceKeyword = (oldWord: string, newWord: string) => {
    const regex = new RegExp(oldWord, 'gi');
    setContent((prev) => prev.replace(regex, newWord));
  };

  const handleReplaceAllPolicyViolations = () => {
    setContent((prev) => fixAllViolations(prev, policyScanResult.violations));
  };

  // File upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMediaList((prev) => [
            ...prev,
            {
              url: event.target!.result as string,
              type: isVideo ? 'video' : 'image',
              name: file.name,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMediaList((prev) => [
            ...prev,
            {
              url: event.target!.result as string,
              type: isVideo ? 'video' : 'image',
              name: file.name,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSelectPreset = (url: string, name: string) => {
    setMediaList((prev) => [
      ...prev,
      {
        url,
        type: 'image',
        name,
      },
    ]);
    setShowPresetsModal(false);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddHashtag = (tag: string) => {
    if (!content.includes(tag)) {
      setContent((prev) => (prev ? `${prev} ${tag}` : tag));
    }
  };

  const handleSetQuickTime = (type: 'hour' | 'tomorrow_morning' | 'tonight_prime') => {
    const now = new Date();
    if (type === 'hour') {
      now.setHours(now.getHours() + 1);
    } else if (type === 'tomorrow_morning') {
      now.setDate(now.getDate() + 1);
      now.setHours(9, 0, 0, 0);
    } else if (type === 'tonight_prime') {
      now.setHours(20, 0, 0, 0);
    }
    setGlobalScheduledDate(now.toISOString().slice(0, 16));
  };

  const handleApplyPerChannelTimes = (timeMap: Record<string, string>) => {
    setChannelSettings((prev) => {
      const next = { ...prev };
      Object.entries(timeMap).forEach(([accId, timeIso]) => {
        next[accId] = {
          ...(next[accId] || {}),
          scheduledDate: timeIso,
        };
      });
      return next;
    });
    setEnablePerChannelSchedule(true);
  };

  const handleAiEnhance = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const templates = [
        `✨ Bùng nổ tương tác với nội dung đột phá tuần này!\n\n${content ? content + '\n\n' : ''}📌 Đừng quên theo dõi và lưu lại bài viết để áp dụng ngay khi cần nhé.\n\n#trending #marketingtips #omnisocial`,
        `🚀 Bí quyết bứt phá hiệu suất công việc bạn không thể bỏ qua:\n\n${content ? content + '\n\n' : 'Áp dụng ngay hôm nay để thấy sự khác biệt rõ rệt trong quy trình sáng tạo nội dung.\n\n'}💬 Bạn thấy mẹo này thế nào? Chia sẻ quan điểm dưới phần bình luận nhé!`,
      ];
      const randomTpl = templates[Math.floor(Math.random() * templates.length)];
      setContent(randomTpl);
      setAiGenerating(false);
    }, 600);
  };

  const handleSubmit = (actionType: 'now' | 'schedule' | 'draft') => {
    if (selectedPlatforms.length === 0) {
      setFormError('Vui lòng chọn ít nhất một nền tảng xã hội.');
      return;
    }

    if (selectedAccountIds.length === 0) {
      setFormError('Vui lòng chọn ít nhất 1 kênh/trang cụ thể để phát sóng nội dung.');
      return;
    }

    if (!content.trim() && mediaList.length === 0) {
      setFormError('Vui lòng nhập nội dung bài viết hoặc tải lên hình ảnh/video.');
      return;
    }

    if (actionType !== 'draft' && policyScanResult.highCount > 0) {
      setFormError(
        `⚠️ Cảnh báo vi phạm nghiêm trọng: Bài viết có chứa ${policyScanResult.highCount} từ khóa có nguy cơ cao bị khóa tài khoản hoặc gỡ bài (ví dụ: "${policyScanResult.violations[0]?.foundText}"). Vui lòng bấm "Sửa nhanh tất cả" hoặc "AI Viết lại an toàn" trước khi phát sóng.`
      );
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    const isPublishNow = actionType === 'now';
    const status = isPublishNow ? 'published' : actionType === 'draft' ? 'draft' : 'scheduled';
    const postDate = isPublishNow
      ? new Date().toISOString()
      : new Date(globalScheduledDate).toISOString();

    setTimeout(() => {
      onSavePost(
        {
          content,
          platforms: selectedPlatforms,
          media: mediaList,
          scheduledDate: postDate,
          status,
          targetAccountIds: selectedAccountIds,
          brandId: selectedBrandId === 'all' ? undefined : selectedBrandId,
          tags: ['Nội dung mới'],
          postFormat,
          channelSettings,
        },
        isPublishNow
      );
      setIsSubmitting(false);
    }, 400);
  };

  const activeSelectedAccounts = accounts.filter((a) => selectedAccountIds.includes(a.id));

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Composer (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Phân chia Cụm Thương hiệu & Kênh Đăng tải (Compact & Fast) */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-indigo-50 text-indigo-700">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>1. Cụm Thương hiệu & Nền tảng Đăng bài</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 block leading-tight">
                    Mrex (FB+TikTok) · Zen (4 kênh) · TechLife (3 kênh)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {onOpenManageBrands && (
                  <button
                    type="button"
                    onClick={onOpenManageBrands}
                    className="text-[11px] text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1 transition-colors px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-md"
                    title="Cấu hình cụm thương hiệu"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Cụm</span>
                  </button>
                )}
                {onOpenConnectChannel && (
                  <button
                    type="button"
                    onClick={onOpenConnectChannel}
                    className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 transition-colors px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-md"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Kênh</span>
                  </button>
                )}
              </div>
            </div>

            {/* A. Brand Cluster Segmented Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {brands.map((brand) => {
                const isSelected = selectedBrandId === brand.id;
                const brandAccounts = accounts.filter((a) => a.brandId === brand.id);

                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => handleSelectBrand(brand.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all shrink-0 ${
                      isSelected
                        ? `${brand.badgeColor} border-transparent shadow-xs ring-1 ring-current`
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-bold">{brand.logo}</span>
                    <span>{brand.name}</span>
                    <span className="text-[10px] opacity-85 font-mono">
                      ({brand.code === 'mrex' ? 'FB + TikTok' : brand.code === 'zen' ? '4 kênh' : `${brandAccounts.length} kênh`})
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handleSelectBrand('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all shrink-0 ${
                  selectedBrandId === 'all'
                    ? 'bg-slate-900 text-white border-transparent shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>Tất cả cụm ({accounts.length})</span>
              </button>
            </div>

            {/* B. Allowed Platform Toggles (Compact row) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['facebook', 'instagram', 'tiktok', 'youtube'] as PlatformId[]).map((plat) => {
                const info = PLATFORM_INFO[plat];
                const Icon = info.icon;
                const isSelected = selectedPlatforms.includes(plat);
                const isAllowedByBrand =
                  !activeBrandObj || activeBrandObj.platforms.includes(plat);
                const platformAccounts = accounts.filter(
                  (a) => a.platform === plat && (selectedBrandId === 'all' || a.brandId === selectedBrandId)
                );

                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => handleTogglePlatform(plat)}
                    className={`px-2.5 py-2 rounded-lg border flex items-center justify-between gap-1.5 transition-all text-left ${
                      isSelected
                        ? `${info.borderColor} ${info.accentBg} shadow-2xs ring-1 ${info.brandColor} font-bold`
                        : !isAllowedByBrand
                        ? 'border-dashed border-slate-200 bg-slate-50/50 text-slate-400 opacity-60 hover:opacity-90'
                        : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected ? `${info.brandColor} bg-white shadow-2xs` : 'text-slate-500 bg-slate-200/60'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 truncate">
                        <div className="text-xs truncate">{info.tagLabel}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {isAllowedByBrand ? `${platformAccounts.length} kênh` : 'Khóa'}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                      ) : !isAllowedByBrand ? (
                        <Lock className="w-3 h-3 text-slate-400" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* C. Selected Channels Inline Bar + Expand Toggle */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kênh đang chọn ({activeSelectedAccounts.length} kênh):</span>
                </span>

                <button
                  type="button"
                  onClick={() => setShowDetailedChannels(!showDetailedChannels)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>{showDetailedChannels ? 'Thu gọn danh sách' : 'Tùy chỉnh chi tiết từng kênh'}</span>
                  {showDetailedChannels ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Inline Pills for Selected Accounts */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeSelectedAccounts.map((acc) => {
                  const info = PLATFORM_INFO[acc.platform];
                  const Icon = info.icon;

                  return (
                    <span
                      key={acc.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/80"
                    >
                      <Icon className={`w-3 h-3 ${info.brandColor}`} />
                      <span className="truncate max-w-[130px]">{acc.name}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleAccount(acc.id)}
                        className="text-slate-400 hover:text-slate-600 ml-0.5"
                        title="Bỏ chọn kênh này"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}

                {activeSelectedAccounts.length === 0 && (
                  <span className="text-xs text-amber-700 italic">
                    Chưa chọn kênh nào. Vui lòng tick chọn ít nhất 1 kênh để đăng bài.
                  </span>
                )}
              </div>

              {/* Collapsible Detailed Checkboxes */}
              {showDetailedChannels && (
                <div className="pt-2 space-y-2 max-h-56 overflow-y-auto border-t border-slate-100 mt-2">
                  {(selectedBrandId === 'all'
                    ? brands
                    : brands.filter((b) => b.id === selectedBrandId)
                  ).map((b) => {
                    const brandAccs = accounts.filter(
                      (a) => a.brandId === b.id && selectedPlatforms.includes(a.platform)
                    );
                    if (brandAccs.length === 0) return null;

                    const allBrandAccsSelected = brandAccs.every((a) =>
                      selectedAccountIds.includes(a.id)
                    );

                    return (
                      <div
                        key={b.id}
                        className="p-2 rounded-lg border border-slate-200/80 bg-slate-50/50 space-y-1.5"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200/50 text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${b.badgeColor}`}>
                              {b.logo}
                            </span>
                            <span>{b.name}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              if (allBrandAccsSelected) {
                                setSelectedAccountIds((prev) =>
                                  prev.filter((id) => !brandAccs.some((a) => a.id === id))
                                );
                              } else {
                                handleSelectBrandAccounts(b.id);
                              }
                            }}
                            className="text-[11px] font-semibold text-blue-600 hover:underline"
                          >
                            {allBrandAccsSelected ? 'Bỏ chọn cụm' : 'Chọn tất cả'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {brandAccs.map((acc) => {
                            const isChecked = selectedAccountIds.includes(acc.id);
                            const info = PLATFORM_INFO[acc.platform];
                            const Icon = info.icon;

                            return (
                              <div
                                key={acc.id}
                                onClick={() => handleToggleAccount(acc.id)}
                                className={`cursor-pointer p-1.5 rounded-md border flex items-center justify-between gap-2 text-xs transition-all ${
                                  isChecked
                                    ? 'bg-blue-50/80 border-blue-400 font-semibold text-slate-900'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <img
                                    src={acc.avatar}
                                    alt={acc.name}
                                    className="w-5 h-5 rounded-full object-cover shrink-0"
                                  />
                                  <span className="truncate">{acc.name}</span>
                                  <Icon className={`w-3 h-3 shrink-0 ${info.brandColor}`} />
                                </div>

                                {isChecked ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 2. Nội dung Caption & Meta AI Policy Assistant */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>2. Nội dung bài viết (Caption chính)</span>
                  <span className="text-red-500">*</span>
                </label>

                {content.trim() && (
                  policyScanResult.hasViolations ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 shadow-2xs animate-pulse">
                      <ShieldAlert className="w-3 h-3 text-rose-600" />
                      <span>{policyScanResult.violations.length} từ vi phạm ({policyScanResult.safetyScore}/100)</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Chuẩn chính sách (100/100)</span>
                    </span>
                  )
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleAiEnhance}
                  disabled={aiGenerating}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 rounded-lg shadow-2xs transition-all hover:scale-[1.02]"
                  title="Tự động tối ưu caption và gợi ý hashtag viral"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${aiGenerating ? 'animate-spin' : ''}`} />
                  <span>{aiGenerating ? 'Đang viết...' : 'Tối ưu bằng AI'}</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Bạn đang nghĩ gì? Viết nội dung bài viết, tiêu đề hấp dẫn hoặc mô tả chi tiết tại đây..."
                rows={5}
                className={`w-full p-3.5 text-sm bg-slate-50/60 hover:bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border transition-all resize-y leading-relaxed focus:outline-hidden ${
                  policyScanResult.highCount > 0
                    ? 'border-rose-300 ring-2 ring-rose-100 focus:border-rose-500'
                    : policyScanResult.mediumCount > 0
                    ? 'border-amber-300 ring-2 ring-amber-100 focus:border-amber-500'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
              />
            </div>

            {/* Character counter & Quick hashtags */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-slate-400" /> Gợi ý:
                </span>
                {HASHTAG_SUGGESTIONS.slice(0, 5).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddHashtag(tag)}
                    className="px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div
                className={`text-[11px] font-mono tabular-nums ${
                  charsRemaining < 0
                    ? 'text-rose-600 font-bold'
                    : charsRemaining < 100
                    ? 'text-amber-600 font-semibold'
                    : 'text-slate-500'
                }`}
              >
                {content.length} / {minCharLimit} ký tự
              </div>
            </div>

            {/* AI Policy & Meta AI Prohibited Keyword Warning Card */}
            <ContentPolicyWarning
              content={content}
              scanResult={policyScanResult}
              selectedPlatforms={selectedPlatforms}
              onReplaceKeyword={handleReplaceKeyword}
              onReplaceAll={handleReplaceAllPolicyViolations}
              onSetContent={setContent}
              onInsertSample={(text) => setContent(text)}
            />
          </div>

          {/* 3. Media Upload (Compact & Sleek) */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Hình ảnh & Video đính kèm
              </label>
              <button
                type="button"
                onClick={() => setShowPresetsModal(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Chọn từ thư viện mẫu</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              multiple
              className="hidden"
            />

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center mb-1.5 transition-colors">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Kéo thả file vào đây hoặc <span className="text-blue-600 underline">Chọn từ thiết bị</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Hỗ trợ PNG, JPG, WEBP, MP4 video (tối đa 50MB)
              </p>
            </div>

            {mediaList.length > 0 && (
              <div className="pt-1">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {mediaList.map((item, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-lg border border-slate-200 overflow-hidden bg-slate-900 aspect-square"
                    >
                      <img
                        src={item.url}
                        alt={`Media preview ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {item.type === 'video' && (
                        <div className="absolute bottom-1 left-1 p-0.5 px-1 bg-black/70 rounded text-white text-[9px] flex items-center gap-1 font-mono">
                          <Film className="w-3 h-3" /> Video
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMedia(idx);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-90 hover:opacity-100 shadow-md transition-opacity"
                        title="Xoá file này"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. TÙY CHỌN LÊN LỊCH CHI TIẾT THEO TỪNG KÊNH (Detailed Scheduling) */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>4. Thời gian lên lịch & Tùy biến chi tiết từng kênh</span>
              </label>

              {/* Toggles */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enablePerChannelSchedule}
                    onChange={(e) => setEnablePerChannelSchedule(e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded"
                  />
                  <span>Giờ vàng riêng từng kênh</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enablePerChannelCaption}
                    onChange={(e) => setEnablePerChannelCaption(e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded"
                  />
                  <span>Caption riêng từng kênh</span>
                </label>
              </div>
            </div>

            {/* Best Time to Post Recommendation Advisor */}
            <BestTimeToPostAdvisor
              selectedAccounts={activeSelectedAccounts}
              selectedPlatforms={selectedPlatforms}
              currentScheduledDate={globalScheduledDate}
              onApplyTime={(dateIso) => setGlobalScheduledDate(dateIso)}
              onApplyPerChannelTimes={handleApplyPerChannelTimes}
              enablePerChannelSchedule={enablePerChannelSchedule}
            />

            {/* Standard Global Time Picker (if not per-channel) */}
            {!enablePerChannelSchedule ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <input
                    type="datetime-local"
                    value={globalScheduledDate}
                    onChange={(e) => setGlobalScheduledDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
                  <button
                    type="button"
                    onClick={() => handleSetQuickTime('hour')}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    Sau 1 giờ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetQuickTime('tomorrow_morning')}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    Sáng mai 9:00
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetQuickTime('tonight_prime')}
                    className="px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                  >
                    Tối nay 20:00 (Giờ vàng)
                  </button>
                </div>
              </div>
            ) : (
              /* Per-channel schedule matrix */
              <div className="space-y-2.5 bg-blue-50/40 p-3.5 rounded-xl border border-blue-100">
                <div className="text-xs font-semibold text-blue-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Lên lịch theo giờ vàng tối ưu riêng cho từng kênh:</span>
                  </span>
                  <span className="text-[11px] text-blue-700 font-normal">
                    Thuật toán tự đề xuất giờ tương tác cao nhất
                  </span>
                </div>

                <div className="space-y-2">
                  {activeSelectedAccounts.map((acc) => {
                    const info = PLATFORM_INFO[acc.platform];
                    const Icon = info.icon;
                    const setting = channelSettings[acc.id] || {};

                    return (
                      <div
                        key={acc.id}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={acc.avatar}
                            alt={acc.name}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                          <div className="truncate">
                            <span className="font-bold text-slate-900">{acc.name}</span>
                            <span className="text-slate-600 text-[10px] ml-1 font-mono">
                              ({acc.handle})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-amber-700 font-medium bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            🔥 Giờ vàng: {acc.bestPostingHour || '19:30'}
                          </span>
                          <input
                            type="datetime-local"
                            value={setting.scheduledDate || globalScheduledDate}
                            onChange={(e) =>
                              updateChannelSetting(acc.id, { scheduledDate: e.target.value })
                            }
                            className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded font-mono text-slate-800"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Per-channel Custom Caption and Options Tab */}
            {enablePerChannelCaption && activeSelectedAccounts.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-800">
                  Tùy chỉnh nội dung riêng cho từng kênh:
                </div>

                {/* Account selector tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {activeSelectedAccounts.map((acc) => {
                    const isTabActive =
                      (activeCustomizingChannelId || activeSelectedAccounts[0].id) === acc.id;
                    const info = PLATFORM_INFO[acc.platform];
                    const Icon = info.icon;

                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setActiveCustomizingChannelId(acc.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                          isTabActive
                            ? 'bg-slate-900 text-white font-bold shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{acc.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Channel-specific customization inputs */}
                {(() => {
                  const targetAcc =
                    accounts.find(
                      (a) =>
                        a.id ===
                        (activeCustomizingChannelId || activeSelectedAccounts[0]?.id)
                    ) || activeSelectedAccounts[0];

                  if (!targetAcc) return null;

                  const setting = channelSettings[targetAcc.id] || {};

                  return (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                      <div>
                        <span className="font-semibold text-slate-800 block mb-1">
                          Nội dung caption riêng cho {targetAcc.name}:
                        </span>
                        <textarea
                          rows={3}
                          value={setting.content ?? content}
                          onChange={(e) =>
                            updateChannelSetting(targetAcc.id, { content: e.target.value })
                          }
                          placeholder={`Nhập caption tối ưu riêng cho ${targetAcc.name}...`}
                          className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>

                      {/* Platform-specific options */}
                      {targetAcc.platform === 'tiktok' && (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={setting.allowDuet ?? true}
                              onChange={(e) =>
                                updateChannelSetting(targetAcc.id, { allowDuet: e.target.checked })
                              }
                              className="w-3.5 h-3.5 text-blue-600 rounded"
                            />
                            <span>Cho phép Duet & Stitch</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={setting.allowComments ?? true}
                              onChange={(e) =>
                                updateChannelSetting(targetAcc.id, {
                                  allowComments: e.target.checked,
                                })
                              }
                              className="w-3.5 h-3.5 text-blue-600 rounded"
                            />
                            <span>Cho phép khán giả bình luận</span>
                          </label>
                        </div>
                      )}

                      {targetAcc.platform === 'instagram' && (
                        <div>
                          <span className="font-semibold text-slate-800 block mb-1">
                            Bình luận đầu tiên (First Comment - để chèn hashtag phụ):
                          </span>
                          <input
                            type="text"
                            value={setting.firstComment || ''}
                            onChange={(e) =>
                              updateChannelSetting(targetAcc.id, { firstComment: e.target.value })
                            }
                            placeholder="#lifestyle #setup #creator #techvn"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                          />
                        </div>
                      )}

                      {targetAcc.platform === 'youtube' && (
                        <div className="space-y-2">
                          <div>
                            <span className="font-semibold text-slate-800 block mb-1">
                              Tiêu đề Video YouTube:
                            </span>
                            <input
                              type="text"
                              value={setting.videoTitle || ''}
                              onChange={(e) =>
                                updateChannelSetting(targetAcc.id, { videoTitle: e.target.value })
                              }
                              placeholder="Tiêu đề video chuẩn SEO..."
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                            />
                          </div>
                        </div>
                      )}

                      {targetAcc.platform === 'facebook' && (
                        <div>
                          <span className="font-semibold text-slate-800 block mb-1">
                            Nút kêu gọi hành động (Call To Action Button):
                          </span>
                          <select
                            value={setting.ctaButton || 'Tìm hiểu thêm'}
                            onChange={(e) =>
                              updateChannelSetting(targetAcc.id, { ctaButton: e.target.value })
                            }
                            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                          >
                            <option value="Tìm hiểu thêm">Tìm hiểu thêm</option>
                            <option value="Gửi tin nhắn">Gửi tin nhắn</option>
                            <option value="Mua ngay">Mua ngay</option>
                            <option value="Đăng ký ngay">Đăng ký ngay</option>
                            <option value="Gọi ngay">Gọi ngay</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* 5. Nút Thao tác Hành Động (Sticky Bottom Action Bar) */}
          <div className="sticky bottom-3 z-20 p-3 bg-white/95 backdrop-blur-md rounded-xl border border-slate-300 shadow-md flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Lưu nháp
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Huỷ
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmit('schedule')}
                disabled={isSubmitting || activeSelectedAccounts.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all disabled:opacity-50"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Lên lịch ({activeSelectedAccounts.length} kênh)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmit('now')}
                disabled={isSubmitting || activeSelectedAccounts.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs hover:shadow-sm transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? 'Đang đăng...'
                    : `Đăng ngay (${activeSelectedAccounts.length} kênh)`}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Form: Live Preview & Schedule Summary (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          <PostLivePreview
            content={content}
            media={mediaList}
            selectedPlatforms={selectedPlatforms}
            accounts={accounts}
            targetAccountIds={selectedAccountIds}
            channelSettings={channelSettings}
            scheduledDate={globalScheduledDate}
            postFormat={postFormat}
          />

          {/* Detailed Schedule Summary Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Bảng tóm tắt Lịch phát sóng</span>
              </span>
              <span className="text-[11px] font-mono text-blue-600 font-bold">
                {activeSelectedAccounts.length} kênh được chọn
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {activeSelectedAccounts.map((acc) => {
                const info = PLATFORM_INFO[acc.platform];
                const Icon = info.icon;
                const setting = channelSettings[acc.id];
                const scheduledTime =
                  enablePerChannelSchedule && setting?.scheduledDate
                    ? setting.scheduledDate
                    : globalScheduledDate;

                return (
                  <div
                    key={acc.id}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 truncate">
                        <span className="font-semibold text-slate-800">{acc.name}</span>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono font-medium text-slate-600 shrink-0">
                      ⏰ {new Date(scheduledTime).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Preset Media Library Modal */}
      {showPresetsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Thư viện Hình ảnh Mẫu (Preset Media)
              </h3>
              <button
                onClick={() => setShowPresetsModal(false)}
                className="p-1 rounded-md text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Chọn ảnh có sẵn chất lượng cao để đính kèm nhanh vào bài đăng:
            </p>

            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {SAMPLE_PRESET_IMAGES.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.url, preset.name)}
                  className="group cursor-pointer rounded-xl border border-slate-200 overflow-hidden hover:border-blue-500 hover:shadow-xs transition-all text-left bg-slate-50"
                >
                  <div className="aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-2">
                    <div className="text-xs font-semibold text-slate-800 truncate">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-600">{preset.category}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPresetsModal(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
