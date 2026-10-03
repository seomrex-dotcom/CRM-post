import React from 'react';
import { ScheduledPost, SocialAccount, PlatformId, BrandCluster } from '../types';
import { PLATFORM_INFO, PlatformBadge, BrandBadge } from './SocialIcons';
import { INITIAL_BRANDS } from '../data/mockData';
import {
  Calendar,
  Send,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  Share2,
  Eye,
  Sparkles,
  Link as LinkIcon,
  Layers,
  X,
  Sliders,
  ChevronRight,
} from 'lucide-react';

interface DashboardOverviewProps {
  posts: ScheduledPost[];
  accounts: SocialAccount[];
  brands?: BrandCluster[];
  activeBrandId?: string | 'all';
  onSelectBrand?: (id: string | 'all') => void;
  activeChannelId: string | 'all';
  onSelectChannel: (id: string | 'all') => void;
  onOpenCreate: () => void;
  onSelectTab: (tab: string) => void;
  onPublishNow: (id: string) => void;
  onOpenConnectChannel: () => void;
  onOpenManageBrands?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  posts,
  accounts,
  brands = INITIAL_BRANDS,
  activeBrandId = 'all',
  onSelectBrand,
  activeChannelId,
  onSelectChannel,
  onOpenCreate,
  onSelectTab,
  onPublishNow,
  onOpenConnectChannel,
  onOpenManageBrands,
}) => {
  const activeAccount = accounts.find((a) => a.id === activeChannelId);
  const activeBrand = brands.find((b) => b.id === activeBrandId);

  // Filter posts if a specific channel or brand is active
  const filteredPosts = posts.filter((p) => {
    if (activeBrandId !== 'all') {
      const matchBrand =
        p.brandId === activeBrandId ||
        p.targetAccountIds?.some(
          (accId) => accounts.find((a) => a.id === accId)?.brandId === activeBrandId
        );
      if (!matchBrand) return false;
    }

    if (activeChannelId !== 'all') {
      if (p.targetAccountIds && p.targetAccountIds.length > 0) {
        return p.targetAccountIds.includes(activeChannelId);
      }
      return activeAccount ? p.platforms.includes(activeAccount.platform) : true;
    }

    return true;
  });

  const scheduledPosts = filteredPosts.filter((p) => p.status === 'scheduled');
  const publishedPosts = filteredPosts.filter((p) => p.status === 'published');

  // Total followers calculation
  const totalFollowers =
    activeAccount
      ? activeAccount.followers
      : accounts.reduce((acc, a) => acc + (a.connected ? a.followers : 0), 0);

  const formatTimeAgo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes} · ${day}/${month}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 text-left">
      {/* Active Channel Filter Notice if specific channel is selected */}
      {activeAccount && (
        <div className="p-2.5 bg-blue-50/90 border border-blue-200 rounded-xl flex items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <img
              src={activeAccount.avatar}
              alt={activeAccount.name}
              className="w-5 h-5 rounded-full object-cover border border-blue-300"
            />
            <span className="text-slate-800">
              Đang lọc theo kênh: <strong className="text-blue-900 font-bold">{activeAccount.name}</strong> ({activeAccount.handle})
            </span>
          </div>
          <button
            onClick={() => onSelectChannel('all')}
            className="flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 px-2 py-0.5 hover:bg-blue-100 rounded transition-colors text-[11px]"
          >
            <span>Tất cả kênh</span>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Sleek Compact Action Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 rounded-xl p-3.5 sm:p-4 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold tracking-tight truncate">
                {activeAccount
                  ? `Kênh: ${activeAccount.name}`
                  : activeBrand
                  ? `Cụm Thương hiệu: ${activeBrand.name}`
                  : 'Trung tâm Quản lý & Lên lịch Đa kênh'}
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white shrink-0">
                {scheduledPosts.length} bài chờ phát sóng
              </span>
            </div>
            <p className="text-[11px] text-blue-100 truncate mt-0.5">
              Tự động hóa đăng bài chuẩn giờ vàng trên Facebook, Instagram, TikTok & YouTube
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={onOpenConnectChannel}
            className="px-2.5 py-1.5 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/25 rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thêm</span> kênh
          </button>
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 active:bg-blue-100 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Tạo bài mới</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (Compact 4-grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Scheduled */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Bài đã lên lịch</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {scheduledPosts.length}
            </div>
            <div className="text-[10px] text-emerald-600 flex items-center gap-1 mt-0.5 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              <span>Sẵn sàng phát sóng</span>
            </div>
          </div>
        </div>

        {/* Card 2: Published */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Đã xuất bản tháng</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {publishedPosts.length + (activeAccount ? 6 : 18)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
              +12 bài so với tháng trước
            </div>
          </div>
        </div>

        {/* Card 3: Total Audience */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">
              {activeAccount ? 'Người theo dõi Kênh' : 'Tổng Lượng Theo dõi'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {totalFollowers.toLocaleString()}
            </div>
            <div className="text-[10px] text-blue-600 flex items-center gap-1 mt-0.5 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              <span>+6.2% trong 30 ngày</span>
            </div>
          </div>
        </div>

        {/* Card 4: Avg Engagement */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Tương tác TB</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              5.4%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
              Chuẩn ngành: 2.1% - 3.5%
            </div>
          </div>
        </div>
      </div>

      {/* Brand Clusters Breakdown & Quick Scheduling Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-blue-50 text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                Cụm Thương hiệu & Ma trận Kênh (Brand Clusters)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mrex: Fanpage & TikTok · Zen: 4 nền tảng · TechLife: FB, TikTok & YouTube
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenManageBrands && (
              <button
                type="button"
                onClick={onOpenManageBrands}
                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors"
              >
                <Sliders className="w-3 h-3 text-slate-500" />
                <span>Quản lý</span>
              </button>
            )}
            {activeBrandId !== 'all' && (
              <button
                type="button"
                onClick={() => onSelectBrand && onSelectBrand('all')}
                className="text-[11px] text-blue-600 font-semibold hover:underline"
              >
                Xem tất cả
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {brands.map((b) => {
            const brandAccounts = accounts.filter((a) => a.brandId === b.id);
            const brandPosts = posts.filter(
              (p) =>
                p.brandId === b.id ||
                p.targetAccountIds?.some((id) => brandAccounts.some((a) => a.id === id))
            );
            const brandScheduled = brandPosts.filter((p) => p.status === 'scheduled');
            const totalFollowersInBrand = brandAccounts.reduce(
              (acc, curr) => acc + (curr.followers || 0),
              0
            );
            const isActive = activeBrandId === b.id;

            return (
              <div
                key={b.id}
                className={`rounded-xl border p-3 transition-all flex flex-col justify-between text-left space-y-2.5 ${
                  isActive
                    ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-400 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-white shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${b.badgeColor}`}
                      >
                        {b.logo}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                          {b.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 truncate block">
                          {brandAccounts.length} kênh kích hoạt
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {brandScheduled.length} bài chờ
                    </span>
                  </div>

                  {/* Platforms mini pills */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      {b.platforms.map((plat) => {
                        const info = PLATFORM_INFO[plat];
                        const Icon = info.icon;
                        return (
                          <span
                            key={plat}
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border ${info.accentBg} ${info.brandColor} ${info.borderColor}`}
                            title={info.tagLabel}
                          >
                            <Icon className="w-2.5 h-2.5" />
                            <span>{info.tagLabel}</span>
                          </span>
                        );
                      })}
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {(totalFollowersInBrand / 1000).toFixed(0)}k sub
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectBrand) onSelectBrand(b.id);
                      onSelectTab('create');
                    }}
                    className="flex-1 py-1.5 px-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-2xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Lên lịch {b.name}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectBrand) {
                        onSelectBrand(isActive ? 'all' : b.id);
                      }
                      onSelectTab('calendar');
                    }}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      isActive
                        ? 'border-blue-300 bg-blue-100 text-blue-800 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                    title={`Xem lịch phát sóng của ${b.name}`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Scheduled Queue (8 cols) & Connected Accounts Status (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Next Up Queue */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Bài viết sắp đăng (Next Up Queue)
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('calendar')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Xem tất cả ({scheduledPosts.length}) →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {scheduledPosts.slice(0, 4).map((post) => (
              <div
                key={post.id}
                className="p-3 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  {post.media && post.media.length > 0 ? (
                    <div className="w-16 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                      <img
                        src={post.media[0].url}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-14 rounded-lg bg-slate-100 text-slate-600 shrink-0 flex items-center justify-center text-[10px] font-medium border border-slate-200">
                      Văn bản
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        {post.platforms.map((p) => (
                          <PlatformBadge key={p} platform={p} size="sm" />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-600 font-mono">
                        ⏰ {formatTimeAgo(post.scheduledDate)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onPublishNow(post.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-lg transition-all shadow-2xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>Đăng ngay</span>
                  </button>
                </div>
              </div>
            ))}

            {scheduledPosts.length === 0 && (
              <div className="p-8 text-center text-slate-600 text-xs">
                Chưa có bài viết nào trong hàng đợi. Nhấp "Tạo bài viết mới" để lên lịch!
              </div>
            )}
          </div>
        </div>

        {/* Right: Channels Panel with Switch & Add CTA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Các Kênh Liên Kết ({accounts.length})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTab('settings')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                  title="Cài đặt và quản lý chi tiết kênh"
                >
                  Quản lý
                </button>
                <button
                  type="button"
                  onClick={onOpenConnectChannel}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm kênh</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {accounts.map((acc) => {
                const info = PLATFORM_INFO[acc.platform];
                const Icon = info.icon;
                const isCurrentActive = activeChannelId === acc.id;

                return (
                  <div
                    key={acc.id}
                    onClick={() => onSelectChannel(acc.id)}
                    className={`cursor-pointer p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isCurrentActive
                        ? 'border-blue-400 bg-blue-50/70 ring-1 ring-blue-300'
                        : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {acc.name}
                        </div>
                        <div className="text-[10px] text-slate-600 font-mono truncate">
                          {acc.handle} · {acc.followers.toLocaleString()} sub
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className={info.brandColor}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          acc.connected ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title={acc.connected ? 'Đang hoạt động' : 'Đã ngắt'}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => onSelectTab('settings')}
              className="w-full text-center text-xs font-semibold text-slate-600 hover:text-slate-900 pt-2 block border-t border-slate-100"
            >
              Quản lý toàn bộ kênh & Phân quyền →
            </button>
          </div>

          {/* Golden Time Recommendation */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Gợi ý Đăng bài Đa kênh</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Bạn có thể lên lịch phát sóng đồng thời bài viết lên nhiều Fanpage và Kênh cùng lúc để nhân đôi phạm vi tiếp cận thương hiệu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
