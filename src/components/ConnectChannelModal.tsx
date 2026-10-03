import React, { useState } from 'react';
import { PlatformId, SocialAccount, BrandCluster } from '../types';
import { PLATFORM_INFO } from './SocialIcons';
import { BATCH_DISCOVERABLE_CHANNELS, CHANNEL_GROUPS } from '../data/mockData';
import {
  autoFetchFacebookFanpage,
  autoFetchAnyChannel,
  FetchedChannelProfile,
} from '../utils/channelFetcher';
import {
  X,
  Plus,
  ShieldCheck,
  Check,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  RefreshCw,
  Layers,
  Search,
  CheckSquare,
  Square,
  Clock,
  ArrowRight,
  Globe,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Zap,
  HelpCircle,
  BadgeCheck,
} from 'lucide-react';

interface ConnectChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (newAccount: Omit<SocialAccount, 'id'>) => void;
  onBatchAddAccounts?: (newAccounts: Array<Omit<SocialAccount, 'id'>>) => void;
  existingAccounts: SocialAccount[];
  brands?: BrandCluster[];
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
];

const QUICK_FANPAGE_SAMPLES = [
  { label: 'TechLife Review', url: 'https://facebook.com/techlife.vietnam' },
  { label: 'Mrex Media Agency', url: 'https://facebook.com/mrex.agency' },
  { label: 'Zen Wellness Living', url: 'https://facebook.com/zen.living' },
];

export const ConnectChannelModal: React.FC<ConnectChannelModalProps> = ({
  isOpen,
  onClose,
  onAddAccount,
  onBatchAddAccounts,
  existingAccounts,
  brands = [],
}) => {
  const [modalMode, setModalMode] = useState<'facebook_auto' | 'batch' | 'manual'>('facebook_auto');

  // Batch import selection
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>(
    BATCH_DISCOVERABLE_CHANNELS.map((b) => b.suggestedId)
  );

  // Auto-Fetch Fanpage State
  const [fbUrlInput, setFbUrlInput] = useState('');
  const [isFetchingLogo, setIsFetchingLogo] = useState(false);
  const [fetchedProfile, setFetchedProfile] = useState<FetchedChannelProfile | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string>(brands[0]?.id || 'brand-techlife');

  // Manual connect state
  const [platform, setPlatform] = useState<PlatformId>('facebook');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [category, setCategory] = useState('Doanh nghiệp / Fanpage');
  const [group, setGroup] = useState('Hệ sinh thái TechLife');
  const [followers, setFollowers] = useState<number>(24500);
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [bestHour, setBestHour] = useState('19:30');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlatformInfo = PLATFORM_INFO[platform];
  const CurrentIcon = currentPlatformInfo.icon;

  // Toggle batch item
  const handleToggleBatch = (id: string) => {
    setSelectedBatchIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Select all batch
  const handleSelectAllBatch = () => {
    if (selectedBatchIds.length === BATCH_DISCOVERABLE_CHANNELS.length) {
      setSelectedBatchIds([]);
    } else {
      setSelectedBatchIds(BATCH_DISCOVERABLE_CHANNELS.map((b) => b.suggestedId));
    }
  };

  // Submit batch import
  const handleBatchImport = () => {
    if (selectedBatchIds.length === 0) {
      setError('Vui lòng chọn ít nhất 1 kênh để nhập hàng loạt.');
      return;
    }

    setIsAuthorizing(true);
    setTimeout(() => {
      const itemsToImport = BATCH_DISCOVERABLE_CHANNELS.filter((b) =>
        selectedBatchIds.includes(b.suggestedId)
      ).map((item) => ({
        platform: item.platform,
        name: item.name,
        handle: item.handle,
        avatar: item.avatar,
        followers: item.followers,
        connected: true,
        category: item.category,
        role: item.role,
        lastSynced: 'Vừa liên kết',
        group: item.group,
        brandId: item.brandId || selectedBrandId,
        tokenExpiryDays: 60,
        healthStatus: 'healthy' as const,
        bestPostingHour: item.bestPostingHour || '20:00',
        autoPublishEnabled: true,
      }));

      if (onBatchAddAccounts) {
        onBatchAddAccounts(itemsToImport);
      } else {
        itemsToImport.forEach((acc) => onAddAccount(acc));
      }

      setIsAuthorizing(false);
      onClose();
    }, 600);
  };

  // Handle auto-fetch Facebook Page Logo
  const handleFetchFanpageLogo = async (overrideUrl?: string) => {
    const targetUrl = overrideUrl || fbUrlInput;
    if (!targetUrl.trim()) {
      setFetchError('Vui lòng nhập đường dẫn Fanpage hoặc định danh Facebook.');
      return;
    }

    setIsFetchingLogo(true);
    setFetchError(null);

    try {
      const profile = await autoFetchFacebookFanpage(targetUrl);
      setFetchedProfile(profile);
      setName(profile.name);
      setHandle(profile.handle);
      setAvatar(profile.avatar);
      setFollowers(profile.followers);
      setCategory(profile.category);
    } catch (err: any) {
      setFetchError(err.message || 'Không thể lấy thông tin Fanpage. Vui lòng kiểm tra lại URL.');
    } finally {
      setIsFetchingLogo(false);
    }
  };

  // Save the auto-fetched Facebook Fanpage
  const handleSaveFetchedFanpage = () => {
    if (!fetchedProfile) return;

    setIsAuthorizing(true);
    setTimeout(() => {
      onAddAccount({
        platform: 'facebook',
        name: fetchedProfile.name,
        handle: fetchedProfile.handle,
        avatar: fetchedProfile.avatar,
        followers: fetchedProfile.followers,
        connected: true,
        category: fetchedProfile.category,
        group: brands.find((b) => b.id === selectedBrandId)?.name || 'Hệ sinh thái TechLife',
        brandId: selectedBrandId,
        role: 'Quản trị viên (Admin)',
        lastSynced: 'Vừa liên kết',
        tokenExpiryDays: 60,
        healthStatus: 'healthy',
        bestPostingHour: bestHour || '19:30',
        autoPublishEnabled: true,
      });

      setIsAuthorizing(false);
      onClose();
    }, 500);
  };

  // Submit manual
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên kênh hoặc Fanpage.');
      return;
    }
    if (!handle.trim()) {
      setError('Vui lòng nhập định danh / username kênh.');
      return;
    }

    setError(null);
    setIsAuthorizing(true);

    setTimeout(() => {
      onAddAccount({
        platform,
        name: name.trim(),
        handle: handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`,
        avatar,
        followers: Number(followers) || 0,
        connected: true,
        category,
        group: brands.find((b) => b.id === selectedBrandId)?.name || group,
        brandId: selectedBrandId,
        role: 'Quản trị viên',
        lastSynced: 'Vừa xong',
        tokenExpiryDays: 60,
        healthStatus: 'healthy',
        bestPostingHour: bestHour,
        autoPublishEnabled: true,
      });
      setIsAuthorizing(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-left animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header with Title and Mode Switcher */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs border border-blue-100">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Trung tâm Liên kết Kênh Truyền Thông
              </h3>
              <p className="text-[11px] text-slate-500">
                Kết nối Fanpage Facebook, Kênh Creator và tự động đồng bộ Logo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: 3 Methods */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold gap-1">
          <button
            type="button"
            onClick={() => {
              setModalMode('facebook_auto');
              setError(null);
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              modalMode === 'facebook_auto'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Tự lấy Logo Fanpage</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setModalMode('batch');
              setError(null);
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              modalMode === 'batch'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Quét Hàng Loạt</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setModalMode('manual');
              setError(null);
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              modalMode === 'manual'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Thêm Thủ Công</span>
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 1: TỰ ĐỘNG LẤY LOGO & THÔNG TIN FANPAGE FACEBOOK         */}
        {/* ============================================================== */}
        {modalMode === 'facebook_auto' && (
          <div className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border border-blue-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Dán đường dẫn Facebook Fanpage hoặc ID Trang:</span>
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                  Graph API v20.0
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={fbUrlInput}
                  onChange={(e) => setFbUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleFetchFanpageLogo();
                    }
                  }}
                  placeholder="https://facebook.com/techlife.vietnam hoặc @mrex.agency"
                  className="flex-1 px-3 py-2 text-xs bg-white border border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl text-slate-900 focus:outline-hidden font-medium"
                />

                <button
                  type="button"
                  onClick={() => handleFetchFanpageLogo()}
                  disabled={isFetchingLogo || !fbUrlInput.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {isFetchingLogo ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang quét...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>Lấy Logo & Dữ liệu</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Preset Samples */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[11px] text-slate-500 font-medium">Thử mẫu nhanh:</span>
                {QUICK_FANPAGE_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFbUrlInput(sample.url);
                      handleFetchFanpageLogo(sample.url);
                    }}
                    className="px-2 py-0.5 text-[11px] font-medium text-blue-700 bg-white hover:bg-blue-100 border border-blue-200 rounded-md transition-colors shadow-2xs"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {fetchError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {fetchError}
              </div>
            )}

            {/* Fetched Profile Preview Card */}
            {fetchedProfile && (
              <div className="p-4 rounded-2xl bg-white border border-emerald-300 ring-2 ring-emerald-500/10 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                    <span>Đã nhận diện thành công Fanpage & trích xuất Logo!</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Sẵn sàng liên kết
                  </span>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={fetchedProfile.avatar}
                      alt={fetchedProfile.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-xs"
                    />
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-md bg-[#1877F2] text-white shadow-xs">
                      <PLATFORM_INFO.facebook.icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {fetchedProfile.name}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-600">
                      {fetchedProfile.handle} · {fetchedProfile.followers.toLocaleString()} người theo dõi
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium">
                        {fetchedProfile.category}
                      </span>
                      <span>· Token bảo mật 60 ngày</span>
                    </div>
                  </div>
                </div>

                {/* Additional Settings for this Channel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Gán vào Cụm Thương hiệu:
                    </label>
                    <select
                      value={selectedBrandId}
                      onChange={(e) => setSelectedBrandId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden"
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" /> Giờ vàng đăng bài:
                    </label>
                    <input
                      type="text"
                      value={bestHour}
                      onChange={(e) => setBestHour(e.target.value)}
                      placeholder="19:30"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Confirm Add Button */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleSaveFetchedFanpage}
                    disabled={isAuthorizing}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-all disabled:opacity-50"
                  >
                    {isAuthorizing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu kênh...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Xác nhận Liên kết Fanpage này</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 2: BATCH DISCOVERY & IMPORT                             */}
        {/* ============================================================== */}
        {modalMode === 'batch' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium">
                Tìm thấy <strong>{BATCH_DISCOVERABLE_CHANNELS.length} trang/kênh</strong> từ tài khoản Meta & Google của bạn:
              </span>
              <button
                type="button"
                onClick={handleSelectAllBatch}
                className="text-blue-600 font-bold hover:underline"
              >
                {selectedBatchIds.length === BATCH_DISCOVERABLE_CHANNELS.length
                  ? 'Bỏ chọn tất cả'
                  : 'Chọn tất cả'}
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {BATCH_DISCOVERABLE_CHANNELS.map((item) => {
                const info = PLATFORM_INFO[item.platform];
                const Icon = info.icon;
                const isSelected = selectedBatchIds.includes(item.suggestedId);

                return (
                  <div
                    key={item.suggestedId}
                    onClick={() => handleToggleBatch(item.suggestedId)}
                    className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50/60 ring-1 ring-blue-300'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 p-0.5 rounded-md bg-white shadow-2xs ${info.brandColor}`}
                        >
                          <Icon className="w-3 h-3" />
                        </div>
                      </div>

                      <div className="min-w-0 text-left">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono truncate">
                          {item.handle} · {item.followers.toLocaleString()} người theo dõi
                        </div>
                        <div className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1.5">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                            {item.group}
                          </span>
                          <span>· Giờ vàng: {item.bestPostingHour}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-md border border-slate-300 bg-white" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleBatchImport}
                disabled={isAuthorizing || selectedBatchIds.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all disabled:opacity-50"
              >
                {isAuthorizing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang liên kết {selectedBatchIds.length} kênh...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Liên kết {selectedBatchIds.length} kênh đã chọn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 3: MANUAL DETAILED ADDITION                             */}
        {/* ============================================================== */}
        {modalMode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-3.5">
            {/* 1. Platform picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Nền tảng muốn kết nối
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['facebook', 'instagram', 'tiktok', 'youtube'] as PlatformId[]).map((p) => {
                  const info = PLATFORM_INFO[p];
                  const Icon = info.icon;
                  const isSelected = platform === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setPlatform(p);
                        if (p === 'facebook') setCategory('Doanh nghiệp / Fanpage');
                        if (p === 'instagram') setCategory('Tài khoản Nhà sáng tạo');
                        if (p === 'tiktok') setCategory('TikTok Creator Hub');
                        if (p === 'youtube') setCategory('Kênh Video YouTube');
                      }}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        isSelected
                          ? `${info.borderColor} ${info.accentBg} ${info.brandColor} ring-1 font-bold shadow-2xs`
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px]">{info.tagLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Chi tiết kênh */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-xs font-medium text-slate-700 block mb-1">
                  Tên hiển thị Kênh/Trang:
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: TechLife Review Studio"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <span className="text-xs font-medium text-slate-700 block mb-1">
                  Định danh / Handle:
                </span>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="Ví dụ: @techlife_review"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg text-slate-900 font-mono focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-xs font-medium text-slate-700 block mb-1">
                  Cụm Thương hiệu:
                </span>
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg text-slate-900 focus:outline-hidden"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-700 block mb-1">
                  Số lượng follower:
                </span>
                <input
                  type="number"
                  value={followers}
                  onChange={(e) => setFollowers(Number(e.target.value))}
                  placeholder="15000"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg text-slate-900 font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <span className="text-xs font-medium text-slate-700 block mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" /> Giờ vàng đăng:
                </span>
                <input
                  type="text"
                  value={bestHour}
                  onChange={(e) => setBestHour(e.target.value)}
                  placeholder="19:30"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg text-slate-900 font-mono focus:outline-hidden"
                />
              </div>
            </div>

            {/* 3. Avatar */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Chọn ảnh đại diện kênh
              </span>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all shrink-0 ${
                      avatar === url
                        ? 'border-blue-600 ring-2 ring-blue-100 scale-105'
                        : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Preset avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isAuthorizing}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all disabled:opacity-50"
              >
                {isAuthorizing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang kết nối...</span>
                  </>
                ) : (
                  <>
                    <CurrentIcon className="w-3.5 h-3.5" />
                    <span>Xác thực & Thêm Kênh</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
