import React, { useState, useEffect } from 'react';
import { ScheduledPost, PlatformId, PostStatus, SocialAccount, BrandCluster } from '../types';
import { PLATFORM_INFO, PlatformBadge, BrandBadge } from './SocialIcons';
import { INITIAL_BRANDS } from '../data/mockData';
import {
  Calendar as CalendarIcon,
  LayoutGrid,
  Clock,
  Trash2,
  Send,
  Plus,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  Kanban,
  CheckCircle2,
  Sparkles,
  Layers,
  Sliders,
} from 'lucide-react';

interface CalendarViewProps {
  posts: ScheduledPost[];
  accounts: SocialAccount[];
  brands?: BrandCluster[];
  activeBrandId?: string | 'all';
  onSelectBrand?: (id: string | 'all') => void;
  activeChannelId?: string | 'all';
  onSelectChannel?: (id: string | 'all') => void;
  onOpenCreate: () => void;
  onDeletePost: (id: string) => void;
  onPublishNow: (id: string) => void;
  onEditPost?: (post: ScheduledPost) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  posts,
  accounts,
  brands = INITIAL_BRANDS,
  activeBrandId = 'all',
  onSelectBrand,
  activeChannelId = 'all',
  onSelectChannel,
  onOpenCreate,
  onDeletePost,
  onPublishNow,
  onEditPost,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'calendar' | 'pipeline'>('pipeline');
  const [selectedBrand, setSelectedBrand] = useState<string | 'all'>(activeBrandId);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | 'all'>('all');
  const [selectedChannel, setSelectedChannel] = useState<string | 'all'>(activeChannelId);
  const [selectedStatus, setSelectedStatus] = useState<PostStatus | 'all'>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 9, 1));
  const [previewPost, setPreviewPost] = useState<ScheduledPost | null>(null);

  // Sync with activeBrandId prop if it changes
  useEffect(() => {
    if (activeBrandId) {
      setSelectedBrand(activeBrandId);
    }
  }, [activeBrandId]);

  // Format date to Vietnamese string e.g. "09:30, Thứ Sáu 02/10/2026"
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes} · ${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    // Brand cluster filter
    if (selectedBrand !== 'all') {
      const matchBrandId = post.brandId === selectedBrand;
      const matchAccountBrand = post.targetAccountIds?.some((accId) => {
        const acc = accounts.find((a) => a.id === accId);
        return acc?.brandId === selectedBrand;
      });
      if (!matchBrandId && !matchAccountBrand) {
        return false;
      }
    }

    if (selectedPlatform !== 'all' && !post.platforms.includes(selectedPlatform)) {
      return false;
    }
    if (selectedChannel !== 'all') {
      if (post.targetAccountIds && post.targetAccountIds.length > 0) {
        if (!post.targetAccountIds.includes(selectedChannel)) return false;
      }
    }
    if (selectedStatus !== 'all' && post.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  // Calculate days for the calendar view
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = (date.getDay() + 6) % 7; // Monday = 0

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const calendarDays = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  // Channels to show in pipeline view
  const pipelineChannels = accounts.filter((acc) => {
    if (selectedBrand !== 'all' && acc.brandId !== selectedBrand) return false;
    if (selectedPlatform !== 'all' && acc.platform !== selectedPlatform) return false;
    if (selectedChannel !== 'all' && acc.id !== selectedChannel) return false;
    return true;
  });

  const handleSelectBrandFilter = (brandId: string | 'all') => {
    setSelectedBrand(brandId);
    if (onSelectBrand) onSelectBrand(brandId);
  };

  return (
    <div className="space-y-5">
      {/* Consolidated High-Efficiency Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        {/* Row 1: Brand Cluster Pills + View Mode + Add button */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0 mr-1">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Cụm:</span>
            </span>

            <button
              type="button"
              onClick={() => handleSelectBrandFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1 ${
                selectedBrand === 'all'
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Tất cả ({posts.length})</span>
            </button>

            {brands.map((b) => {
              const isSelected = selectedBrand === b.id;
              const brandPostCount = posts.filter(
                (p) =>
                  p.brandId === b.id ||
                  p.targetAccountIds?.some(
                    (accId) => accounts.find((a) => a.id === accId)?.brandId === b.id
                  )
              ).length;

              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectBrandFilter(b.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border ${
                    isSelected
                      ? `${b.badgeColor} border-transparent shadow-xs`
                      : `${b.bgLight} border-transparent hover:border-current/30`
                  }`}
                >
                  <span className="font-bold">{b.logo}</span>
                  <span>{b.name}</span>
                  <span className="text-[10px] opacity-80 font-mono">({brandPostCount})</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/60">
              <button
                onClick={() => setViewMode('pipeline')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors ${
                  viewMode === 'pipeline'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Hàng đợi Kênh"
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Hàng đợi</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-md text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Dạng thẻ lưới"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-1 rounded-md text-xs transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Dạng lịch tháng"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm bài</span>
            </button>
          </div>
        </div>

        {/* Row 2: Platform Filter + Channel dropdown + Status filter */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] text-slate-500 mr-1 flex items-center gap-1 font-medium">
              <Filter className="w-3 h-3" /> Nền tảng:
            </span>
            <button
              onClick={() => setSelectedPlatform('all')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                selectedPlatform === 'all'
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({posts.length})
            </button>
            {(['facebook', 'instagram', 'tiktok', 'youtube'] as PlatformId[]).map((plat) => {
              const info = PLATFORM_INFO[plat];
              const Icon = info.icon;
              const count = posts.filter((p) => p.platforms.includes(plat)).length;
              const isSelected = selectedPlatform === plat;
              return (
                <button
                  key={plat}
                  onClick={() => setSelectedPlatform(plat)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                    isSelected
                      ? `${info.accentBg} ${info.brandColor} border ${info.borderColor} font-bold shadow-2xs`
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{info.tagLabel}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedChannel}
              onChange={(e) => {
                setSelectedChannel(e.target.value);
                if (onSelectChannel) onSelectChannel(e.target.value);
              }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 font-medium max-w-[150px] truncate"
            >
              <option value="all">Mọi kênh ({accounts.length})</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 font-medium"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="scheduled">Đã lên lịch</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: CHANNEL PIPELINE QUEUE (HÀNG ĐỢI PHÁT SÓNG THEO KÊNH) */}
      {viewMode === 'pipeline' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Hàng đợi phát sóng nội dung chi tiết theo từng cụm thương hiệu & kênh liên kết:</span>
            </span>
            <span className="text-[11px] font-mono">
              Hiển thị {pipelineChannels.length} cột kênh
            </span>
          </div>

          {/* Grouped by Brand Clusters */}
          {brands
            .filter((b) => selectedBrand === 'all' || b.id === selectedBrand)
            .map((b) => {
              const brandChannels = pipelineChannels.filter((c) => c.brandId === b.id);
              if (brandChannels.length === 0) return null;

              return (
                <div key={b.id} className="space-y-3 p-4 bg-slate-50/60 rounded-2xl border border-slate-200/80">
                  {/* Brand Cluster Section Title */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${b.badgeColor}`}>
                        {b.logo}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                        {b.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ({brandChannels.length} kênh: {b.platforms.map((p) => PLATFORM_INFO[p].tagLabel).join(', ')})
                      </span>
                    </div>

                    <button
                      onClick={onOpenCreate}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Lên lịch bài cho {b.name}</span>
                    </button>
                  </div>

                  {/* Channel Columns for this Brand */}
                  <div className="flex gap-4 overflow-x-auto pb-2 pt-1 items-start">
                    {brandChannels.map((channel) => {
                      const info = PLATFORM_INFO[channel.platform];
                      const Icon = info.icon;

                      // Posts scheduled for this specific channel
                      const channelPosts = posts.filter((p) => {
                        if (p.targetAccountIds && p.targetAccountIds.length > 0) {
                          return p.targetAccountIds.includes(channel.id);
                        }
                        return p.platforms.includes(channel.platform);
                      });

                      const scheduledForChannel = channelPosts.filter((p) => p.status === 'scheduled');

                      return (
                        <div
                          key={channel.id}
                          className="w-80 shrink-0 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col max-h-[750px] overflow-hidden text-left"
                        >
                          {/* Channel Column Header */}
                          <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative shrink-0">
                                <img
                                  src={channel.avatar}
                                  alt={channel.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                                />
                                <div
                                  className={`absolute -bottom-1 -right-1 p-0.5 rounded-md bg-white shadow-2xs ${info.brandColor}`}
                                >
                                  <Icon className="w-3 h-3" />
                                </div>
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {channel.name}
                                </div>
                                <div className="text-[10px] text-slate-600 font-mono truncate">
                                  {channel.handle} · {channel.followers.toLocaleString()} sub
                                </div>
                              </div>
                            </div>

                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                              {scheduledForChannel.length} chờ
                            </span>
                          </div>

                          {/* Channel Best Hour Hint */}
                          <div className="px-3.5 py-1.5 bg-amber-50/50 border-b border-amber-100/60 flex items-center justify-between text-[11px] text-amber-900 font-mono">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              Giờ vàng: {channel.bestPostingHour || '19:30'}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              {channel.connected ? '● Hoạt động' : '○ Tạm ngắt'}
                            </span>
                          </div>

                          {/* Column Body: Scheduled Posts List */}
                          <div className="p-3 flex-1 overflow-y-auto space-y-3 bg-slate-50/30">
                            {channelPosts.length === 0 ? (
                              <div className="py-8 text-center text-slate-600 text-xs">
                                <p>Chưa có lịch đăng cho kênh này.</p>
                                <button
                                  onClick={onOpenCreate}
                                  className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                                >
                                  + Lên lịch bài ngay
                                </button>
                              </div>
                            ) : (
                              channelPosts.map((post) => {
                                const isScheduled = post.status === 'scheduled';

                                // Channel-specific schedule time if available
                                const specificSetting = post.channelSettings?.[channel.id];
                                const displayDate = specificSetting?.scheduledDate || post.scheduledDate;
                                const displayContent = specificSetting?.content || post.content;

                                return (
                                  <div
                                    key={post.id}
                                    className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-all space-y-2 group"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span
                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                          isScheduled
                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        }`}
                                      >
                                        {isScheduled ? '⏰ Sắp phát sóng' : '✓ Đã xuất bản'}
                                      </span>

                                      <div className="text-[11px] font-mono font-medium text-slate-600">
                                        {new Date(displayDate).toLocaleTimeString('vi-VN', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </div>
                                    </div>

                                    {/* Media thumbnail if any */}
                                    {post.media && post.media.length > 0 && (
                                      <div className="aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-100">
                                        <img
                                          src={post.media[0].url}
                                          alt="Thumbnail"
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                      </div>
                                    )}

                                    {/* Caption */}
                                    <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                                      {displayContent}
                                    </p>

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                      <span className="text-slate-600 font-mono">
                                        📅 {new Date(displayDate).toLocaleDateString('vi-VN', {
                                          day: '2-digit',
                                          month: '2-digit',
                                        })}
                                      </span>

                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => setPreviewPost(post)}
                                          className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                          title="Chi tiết bài"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        {isScheduled && (
                                          <button
                                            onClick={() => onPublishNow(post.id)}
                                            className="px-2 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white rounded transition-colors"
                                          >
                                            Đăng ngay
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Column Footer: Quick add post to this channel */}
                          <div className="p-2.5 border-t border-slate-100 bg-white">
                            <button
                              onClick={onOpenCreate}
                              className="w-full py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-dashed border-slate-200 transition-colors flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Thêm bài cho kênh này</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* VIEW MODE 2: GRID CARDS VIEW */}
      {viewMode === 'grid' && (
        <>
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Không tìm thấy bài viết nào
              </h3>
              <p className="text-xs text-slate-600 mt-1 mb-4">
                Thử chọn "Mọi kênh liên kết" hoặc lên lịch cho bài viết mới.
              </p>
              <button
                onClick={onOpenCreate}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                + Tạo bài viết mới
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredPosts.map((post) => {
                const isScheduled = post.status === 'scheduled';
                const isPublished = post.status === 'published';
                const hasMedia = post.media && post.media.length > 0;

                const targetedAccounts =
                  post.targetAccountIds && post.targetAccountIds.length > 0
                    ? accounts.filter((a) => post.targetAccountIds!.includes(a.id))
                    : accounts.filter((a) => post.platforms.includes(a.platform));

                const postBrand =
                  brands.find((b) => b.id === post.brandId) ||
                  brands.find((b) => targetedAccounts.some((a) => a.brandId === b.id));

                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group text-left"
                  >
                    <div>
                      {hasMedia && (
                        <div className="aspect-video bg-slate-950 relative overflow-hidden">
                          <img
                            src={post.media[0].url}
                            alt="Post Thumbnail"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                            {post.platforms.map((plat) => (
                              <PlatformBadge key={plat} platform={plat} size="sm" />
                            ))}
                          </div>
                          {postBrand && (
                            <div className="absolute bottom-2.5 left-2.5">
                              <BrandBadge brand={postBrand} size="xs" showPlatforms />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-4 pb-2">
                        {!hasMedia && (
                          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                            <div className="flex items-center gap-1.5">
                              {postBrand && <BrandBadge brand={postBrand} size="xs" />}
                              {post.platforms.map((plat) => (
                                <PlatformBadge key={plat} platform={plat} size="sm" />
                              ))}
                            </div>
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                isScheduled
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : isPublished
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {isScheduled ? 'Đã lên lịch' : isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2 font-mono">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-semibold text-slate-700">
                            {isScheduled ? 'Sẽ đăng: ' : 'Thời gian: '}
                          </span>
                          <span>{formatDateTime(post.scheduledDate)}</span>
                        </div>

                        {targetedAccounts.length > 0 && (
                          <div className="flex items-center gap-1 mb-2.5 flex-wrap">
                            <span className="text-[10px] text-slate-600">Đăng tới:</span>
                            {targetedAccounts.slice(0, 3).map((acc) => (
                              <span
                                key={acc.id}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/80 text-[10px] text-slate-700 font-medium truncate max-w-[130px]"
                                title={`${acc.name} (${acc.handle})`}
                              >
                                <img
                                  src={acc.avatar}
                                  alt={acc.name}
                                  className="w-3 h-3 rounded-full object-cover"
                                />
                                <span className="truncate">{acc.name}</span>
                              </span>
                            ))}
                            {targetedAccounts.length > 3 && (
                              <span className="text-[10px] text-slate-600 font-mono">
                                +{targetedAccounts.length - 3} kênh
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-slate-800 line-clamp-3 leading-relaxed whitespace-pre-line">
                          {post.content}
                        </p>

                        {isPublished && post.likes !== undefined && (
                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                            <span>👍 {post.likes.toLocaleString()}</span>
                            <span>💬 {post.comments?.toLocaleString() || 0}</span>
                            <span>🔁 {post.shares?.toLocaleString() || 0}</span>
                            <span>👁️ {post.views?.toLocaleString() || 0}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPreviewPost(post)}
                          className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeletePost(post.id)}
                          className="p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {isScheduled && (
                        <button
                          onClick={() => onPublishNow(post.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 rounded-md transition-all shadow-2xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Đăng ngay</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* VIEW MODE 3: MONTHLY CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Tháng 10, 2026
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                  )
                }
                className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(2026, 9, 1))}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                Hôm nay
              </button>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                  )
                }
                className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-200 text-center text-xs font-bold text-slate-600 py-2.5 bg-slate-50">
            <div>T2 (Hai)</div>
            <div>T3 (Ba)</div>
            <div>T4 (Tư)</div>
            <div>T5 (Năm)</div>
            <div>T6 (Sáu)</div>
            <div className="text-blue-600">T7 (Bảy)</div>
            <div className="text-red-500">CN (Chủ Nhật)</div>
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-white">
            {calendarDays.map((dayItem, idx) => {
              const dayPosts = filteredPosts.filter((p) => {
                const pDate = new Date(p.scheduledDate);
                return (
                  pDate.getFullYear() === dayItem.date.getFullYear() &&
                  pDate.getMonth() === dayItem.date.getMonth() &&
                  pDate.getDate() === dayItem.date.getDate()
                );
              });

              const isToday =
                dayItem.isCurrentMonth &&
                dayItem.date.getDate() === 1 &&
                dayItem.date.getMonth() === 9;

              return (
                <div
                  key={idx}
                  className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors ${
                    dayItem.isCurrentMonth ? 'bg-white hover:bg-slate-50/50' : 'bg-slate-50/40 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-semibold ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center'
                          : dayItem.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-600'
                      }`}
                    >
                      {dayItem.dayNumber}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 rounded-full">
                        {dayPosts.length} bài
                      </span>
                    )}
                  </div>

                  <div className="mt-1 space-y-1 overflow-hidden">
                    {dayPosts.map((dp) => (
                      <div
                        key={dp.id}
                        onClick={() => setPreviewPost(dp)}
                        className="cursor-pointer p-1 rounded bg-slate-100 hover:bg-blue-50 border border-slate-200/80 text-[10px] truncate flex items-center gap-1 transition-colors"
                        title={dp.content}
                      >
                        <div className="flex -space-x-1 shrink-0">
                          {dp.platforms.slice(0, 2).map((p) => {
                            const Icon = PLATFORM_INFO[p].icon;
                            return (
                              <div
                                key={p}
                                className={`w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center ${PLATFORM_INFO[p].brandColor}`}
                              >
                                <Icon className="w-2.5 h-2.5" />
                              </div>
                            );
                          })}
                        </div>
                        <span className="truncate text-slate-700 font-medium">
                          {dp.content}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-1" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Post Detail Inspection Modal */}
      {previewPost && (() => {
        const modalBrand =
          brands.find((b) => b.id === previewPost.brandId) ||
          brands.find((b) =>
            previewPost.targetAccountIds?.some((accId) => accounts.find((a) => a.id === accId)?.brandId === b.id)
          );

        return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900">Chi tiết bài viết</span>
                {modalBrand && <BrandBadge brand={modalBrand} size="xs" showPlatforms />}
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                    previewPost.status === 'scheduled'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {previewPost.status === 'scheduled' ? 'Đã lên lịch' : 'Đã xuất bản'}
                </span>
              </div>
              <button
                onClick={() => setPreviewPost(null)}
                className="p-1 rounded-md text-slate-600 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Nền tảng:</span>
                <div className="flex items-center gap-1.5">
                  {previewPost.platforms.map((plat) => (
                    <PlatformBadge key={plat} platform={plat} showName />
                  ))}
                </div>
              </div>

              {previewPost.targetAccountIds && previewPost.targetAccountIds.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-600">Kênh đăng tải:</span>
                  {accounts
                    .filter((a) => previewPost.targetAccountIds!.includes(a.id))
                    .map((acc) => (
                      <span
                        key={acc.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium text-slate-800"
                      >
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-3.5 h-3.5 rounded-full object-cover"
                        />
                        <span>{acc.name}</span>
                      </span>
                    ))}
                </div>
              )}
            </div>

            <div className="text-xs text-slate-600 flex items-center gap-1.5 font-mono">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Thời gian đăng: {formatDateTime(previewPost.scheduledDate)}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
              {previewPost.content}
            </div>

            {previewPost.media && previewPost.media.length > 0 && (
              <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900">
                <img
                  src={previewPost.media[0].url}
                  alt="Post preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  onDeletePost(previewPost.id);
                  setPreviewPost(null);
                }}
                className="text-xs text-red-600 hover:text-red-700 font-semibold"
              >
                Xóa bài này
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewPost(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Đóng
                </button>
                {previewPost.status === 'scheduled' && (
                  <button
                    onClick={() => {
                      onPublishNow(previewPost.id);
                      setPreviewPost(null);
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs"
                  >
                    Đăng ngay lập tức
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
};
