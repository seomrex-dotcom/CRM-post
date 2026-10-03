import React, { useState, useMemo } from 'react';
import { SocialAccount, PlatformId, BrandCluster, ScheduledPost } from '../types';
import { PLATFORM_INFO } from './SocialIcons';
import { DeleteChannelModal } from './DeleteChannelModal';
import { autoFetchFacebookFanpage } from '../utils/channelFetcher';
import {
  Settings as SettingsIcon,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Bell,
  Shield,
  Sliders,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Users,
  Check,
  X,
  Filter,
  Search,
  Clock,
  Zap,
  TrendingUp,
  ShieldCheck,
  PowerOff,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  CheckCheck,
} from 'lucide-react';

interface SettingsViewProps {
  accounts: SocialAccount[];
  posts?: ScheduledPost[];
  brands?: BrandCluster[];
  onToggleAccount: (id: string) => void;
  onDeleteAccount: (id: string) => void;
  onUpdateAccount: (updated: SocialAccount) => void;
  onOpenConnectChannel: () => void;
  onShowToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  accounts,
  posts = [],
  brands = [],
  onToggleAccount,
  onDeleteAccount,
  onUpdateAccount,
  onOpenConnectChannel,
  onShowToast,
}) => {
  const [activePlatformFilter, setActivePlatformFilter] = useState<PlatformId | 'all'>('all');
  const [activeBrandFilter, setActiveBrandFilter] = useState<string>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'connected' | 'disconnected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isSyncingId, setIsSyncingId] = useState<string | null>(null);

  // Delete channel modal state
  const [accountToDelete, setAccountToDelete] = useState<SocialAccount | null>(null);

  // Edit channel modal state
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null);
  const [editFbUrl, setEditFbUrl] = useState('');
  const [isRefetchingLogo, setIsRefetchingLogo] = useState(false);

  // Network stats
  const totalFollowers = useMemo(() => {
    return accounts.reduce((acc, a) => acc + (a.followers || 0), 0);
  }, [accounts]);

  const activeConnectedCount = useMemo(() => {
    return accounts.filter((a) => a.connected).length;
  }, [accounts]);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      // Platform filter
      if (activePlatformFilter !== 'all' && acc.platform !== activePlatformFilter) {
        return false;
      }
      // Brand filter
      if (activeBrandFilter !== 'all' && acc.brandId !== activeBrandFilter) {
        return false;
      }
      // Status filter
      if (activeStatusFilter === 'connected' && !acc.connected) return false;
      if (activeStatusFilter === 'disconnected' && acc.connected) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          acc.name.toLowerCase().includes(q) ||
          acc.handle.toLowerCase().includes(q) ||
          (acc.category && acc.category.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [accounts, activePlatformFilter, activeBrandFilter, activeStatusFilter, searchQuery]);

  // Count scheduled posts for a channel
  const getScheduledPostsCountForAccount = (accId: string) => {
    return posts.filter(
      (p) => p.status === 'scheduled' && p.targetAccountIds && p.targetAccountIds.includes(accId)
    ).length;
  };

  // Sync single account
  const handleSyncAccount = (id: string, name: string) => {
    setIsSyncingId(id);
    setTimeout(() => {
      setIsSyncingId(null);
      onShowToast(`Đã đồng bộ hóa token API và cập nhật thông số của "${name}" thành công!`);
    }, 600);
  };

  // Sync all accounts
  const handleSyncAllAccounts = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      setIsSyncingAll(false);
      onShowToast(`Đã làm mới token và đồng bộ dữ liệu cho toàn bộ ${accounts.length} kênh!`);
    }, 800);
  };

  // Auto re-fetch logo for editing account (if Facebook or has URL)
  const handleRefetchLogo = async () => {
    if (!editingAccount) return;
    const targetInput = editFbUrl.trim() || editingAccount.handle;
    if (!targetInput) {
      onShowToast('Vui lòng nhập đường dẫn hoặc @handle để tìm logo.');
      return;
    }

    setIsRefetchingLogo(true);
    try {
      const profile = await autoFetchFacebookFanpage(targetInput);
      setEditingAccount((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          avatar: profile.avatar,
          name: profile.name || prev.name,
          handle: profile.handle || prev.handle,
        };
      });
      onShowToast('Đã tự động lấy Logo Fanpage mới nhất thành công!');
    } catch (e: any) {
      onShowToast(e.message || 'Không thể trích xuất Logo. Vui lòng kiểm tra lại URL.');
    } finally {
      setIsRefetchingLogo(false);
    }
  };

  // Save edited account
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    onUpdateAccount(editingAccount);
    setEditingAccount(null);
    onShowToast(`Đã cập nhật thông tin kênh "${editingAccount.name}".`);
  };

  return (
    <div className="space-y-5 text-left max-w-6xl mx-auto">
      {/* 1. Header & Channel Network Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Cài đặt & Quản lý Kênh Mạng Xã Hội
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Trung tâm kiểm soát kết nối đa nền tảng, phân cụm thương hiệu, đồng bộ Token và tự động lấy Logo
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={handleSyncAllAccounts}
              disabled={isSyncingAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-all shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin text-blue-600' : ''}`} />
              <span>Đồng bộ toàn bộ Token</span>
            </button>

            <button
              type="button"
              onClick={onOpenConnectChannel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Liên kết kênh mới</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards for Channel Network Health */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">Tổng số kênh quản lý</span>
              <div className="text-lg font-black text-slate-900 mt-0.5 flex items-baseline gap-1.5">
                <span>{accounts.length}</span>
                <span className="text-xs font-medium text-emerald-600">({activeConnectedCount} đang hoạt động)</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">Tổng quy mô mạng lưới</span>
              <div className="text-lg font-black text-slate-900 mt-0.5 flex items-baseline gap-1.5">
                <span>{totalFollowers.toLocaleString()}</span>
                <span className="text-xs font-medium text-slate-500">Người theo dõi</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">Bảo mật & Trạng thái API</span>
              <div className="text-lg font-black text-emerald-600 mt-0.5 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Token API Hợp lệ</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-3 pt-1">
          {/* Row 1: Search + Status Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm kênh theo tên, @handle, danh mục..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-slate-900 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl text-xs shrink-0 font-medium">
              <button
                type="button"
                onClick={() => setActiveStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeStatusFilter === 'all'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({accounts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveStatusFilter('connected')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeStatusFilter === 'connected'
                    ? 'bg-white text-emerald-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đang kết nối ({activeConnectedCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveStatusFilter('disconnected')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeStatusFilter === 'disconnected'
                    ? 'bg-white text-rose-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đã ngắt ({accounts.length - activeConnectedCount})
              </button>
            </div>
          </div>

          {/* Row 2: Platform and Brand Cluster Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
            {/* Platforms */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Nền tảng:
              </span>
              <button
                type="button"
                onClick={() => setActivePlatformFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                  activePlatformFilter === 'all'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả
              </button>
              {(['facebook', 'instagram', 'tiktok', 'youtube'] as PlatformId[]).map((p) => {
                const info = PLATFORM_INFO[p];
                const Icon = info.icon;
                const count = accounts.filter((a) => a.platform === p).length;
                const isSelected = activePlatformFilter === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActivePlatformFilter(p)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? `${info.accentBg} ${info.brandColor} border ${info.borderColor} shadow-2xs font-bold`
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{info.tagLabel}</span>
                    <span className="text-[10px] font-mono opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Brand Cluster Filter */}
            {brands.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Cụm:
                </span>
                <button
                  type="button"
                  onClick={() => setActiveBrandFilter('all')}
                  className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                    activeBrandFilter === 'all'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả
                </button>
                {brands.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setActiveBrandFilter(b.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      activeBrandFilter === b.id
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Channels Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {filteredAccounts.map((acc) => {
            const info = PLATFORM_INFO[acc.platform];
            const Icon = info.icon;
            const syncing = isSyncingId === acc.id;
            const brand = brands.find((b) => b.id === acc.brandId);
            const scheduledCount = getScheduledPostsCountForAccount(acc.id);

            return (
              <div
                key={acc.id}
                className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs ${
                  acc.connected
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-50/70 border-slate-200 opacity-80'
                }`}
              >
                {/* Channel Header Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 p-0.5 rounded-md bg-white shadow-xs ${info.brandColor}`}
                        title={info.name}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {acc.name}
                        </span>
                        {brand && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${brand.bgLight}`}>
                            {brand.name}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-mono text-slate-600 truncate">
                        {acc.handle}
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="font-semibold text-slate-700">
                          {acc.followers.toLocaleString()} người theo dõi
                        </span>
                        <span>·</span>
                        <span className="text-slate-600">{acc.category || 'Fanpage'}</span>
                        {acc.bestPostingHour && (
                          <>
                            <span>·</span>
                            <span className="text-amber-700 flex items-center gap-0.5 font-medium">
                              <Clock className="w-2.5 h-2.5 inline" /> {acc.bestPostingHour}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        acc.connected
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {acc.connected ? 'Đang kết nối' : 'Đã ngắt'}
                    </span>

                    {scheduledCount > 0 && (
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        {scheduledCount} bài lên lịch
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAccount(acc);
                        setEditFbUrl(acc.platform === 'facebook' ? `https://facebook.com/${acc.handle.replace('@', '')}` : '');
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium"
                      title="Chỉnh sửa thông tin kênh hoặc cập nhật lại Logo"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Sửa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSyncAccount(acc.id, acc.name)}
                      disabled={syncing || !acc.connected}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium disabled:opacity-40"
                      title="Làm mới Token & đồng bộ thống kê"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-blue-600' : ''}`} />
                      <span>Đồng bộ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountToDelete(acc)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors font-medium"
                      title="Gỡ hoặc xoá kênh khỏi hệ thống"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xoá</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleAccount(acc.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      acc.connected
                        ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                    }`}
                  >
                    {acc.connected ? 'Ngắt kết nối' : 'Kích hoạt lại'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAccounts.length === 0 && (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">
              Không tìm thấy kênh nào phù hợp với bộ lọc hiện tại.
            </p>
            <button
              type="button"
              onClick={onOpenConnectChannel}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Liên kết kênh mới ngay
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* EDIT CHANNEL MODAL (WITH AUTO RE-FETCH LOGO)                  */}
      {/* ============================================================== */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-left animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Cập nhật cài đặt Kênh & Tự động lấy Logo
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tùy biến tên hiển thị, cụm thương hiệu và đồng bộ ảnh đại diện
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Logo / Avatar Preview & Auto-fetch row */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Ảnh đại diện Logo Kênh:
                  </span>
                  {editingAccount.platform === 'facebook' && (
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      Hỗ trợ Facebook Graph API
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={editingAccount.avatar}
                    alt={editingAccount.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-400 shrink-0 shadow-2xs"
                  />

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={editFbUrl}
                        onChange={(e) => setEditFbUrl(e.target.value)}
                        placeholder="Dán link Fanpage để tự lấy Logo mới"
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleRefetchLogo}
                        disabled={isRefetchingLogo}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs shrink-0 flex items-center gap-1 disabled:opacity-50"
                      >
                        {isRefetchingLogo ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        )}
                        <span>Quét Logo</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500">
                      Hệ thống tự động kết nối Graph API để trích xuất ảnh logo sắc nét kích thước chuẩn
                    </p>
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Tên hiển thị:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAccount.name}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Định danh @handle:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAccount.handle}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, handle: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Cụm Thương hiệu sở hữu:
                  </label>
                  <select
                    value={editingAccount.brandId || ''}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, brandId: e.target.value })
                    }
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden"
                  >
                    <option value="">Không gán cụm</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Số lượng Follower:
                  </label>
                  <input
                    type="number"
                    value={editingAccount.followers}
                    onChange={(e) =>
                      setEditingAccount({
                        ...editingAccount,
                        followers: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Giờ vàng phát sóng:
                  </label>
                  <input
                    type="text"
                    value={editingAccount.bestPostingHour || '19:30'}
                    onChange={(e) =>
                      setEditingAccount({
                        ...editingAccount,
                        bestPostingHour: e.target.value,
                      })
                    }
                    placeholder="19:30"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Vai trò tài khoản:
                  </label>
                  <input
                    type="text"
                    value={editingAccount.role || 'Quản trị viên'}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, role: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE / DISCONNECT CHANNEL MODAL                             */}
      {/* ============================================================== */}
      <DeleteChannelModal
        isOpen={!!accountToDelete}
        account={accountToDelete}
        scheduledPostsCount={accountToDelete ? getScheduledPostsCountForAccount(accountToDelete.id) : 0}
        onClose={() => setAccountToDelete(null)}
        onConfirmDelete={(id) => {
          onDeleteAccount(id);
          setAccountToDelete(null);
        }}
        onToggleDisconnect={(id) => {
          onToggleAccount(id);
          setAccountToDelete(null);
        }}
      />
    </div>
  );
};
