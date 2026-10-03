import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  CheckCircle,
  Clock,
  Plus,
  ChevronDown,
  Layers,
  Check,
  Link as LinkIcon,
  Sliders,
} from 'lucide-react';
import { SocialAccount, BrandCluster } from '../types';
import { PLATFORM_INFO, BrandBadge } from './SocialIcons';
import { INITIAL_BRANDS } from '../data/mockData';

interface HeaderProps {
  currentTab: string;
  onOpenMobileMenu: () => void;
  onOpenCreatePost: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  unreadCount?: number;
  accounts: SocialAccount[];
  brands?: BrandCluster[];
  activeBrandId?: string | 'all';
  onSelectBrand?: (brandId: string | 'all') => void;
  activeChannelId: string | 'all';
  onSelectChannel: (channelId: string | 'all') => void;
  onOpenConnectChannel: () => void;
  onOpenManageBrands?: () => void;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Tổng quan Hoạt động',
    subtitle: 'Theo dõi hiệu suất đa kênh và các bài viết sắp đăng',
  },
  create: {
    title: 'Tạo & Lên lịch Bài viết',
    subtitle: 'Soạn thảo nội dung và phân phối tự động lên nhiều nền tảng',
  },
  calendar: {
    title: 'Lịch trình Nội dung',
    subtitle: 'Quản lý toàn bộ danh sách bài viết đã lên lịch và đã đăng',
  },
  analytics: {
    title: 'Phân tích Hiệu suất',
    subtitle: 'Báo cáo tăng trưởng người theo dõi và mức độ tương tác',
  },
  settings: {
    title: 'Cài đặt Hệ thống',
    subtitle: 'Quản lý tài khoản mạng xã hội và thông số đăng bài',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  onOpenCreatePost,
  searchQuery,
  onSearchChange,
  unreadCount = 2,
  accounts,
  brands = INITIAL_BRANDS,
  activeBrandId = 'all',
  onSelectBrand,
  activeChannelId,
  onSelectChannel,
  onOpenConnectChannel,
  onOpenManageBrands,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);

  const currentInfo = TAB_TITLES[currentTab] || {
    title: 'Bảng điều khiển',
    subtitle: 'Quản lý bài viết đa kênh',
  };

  const activeAccount = accounts.find((a) => a.id === activeChannelId);
  const activeBrandObj = brands.find((b) => b.id === activeBrandId);

  const notifications = [
    {
      id: 1,
      text: 'Bài viết "5 Mẹo Tối Ưu Năng Suất" sẽ đăng sau 30 phút trên Facebook & Instagram',
      time: '10 phút trước',
      type: 'upcoming',
    },
    {
      id: 2,
      text: 'Đã xuất bản thành công video "AI Tools 2026" lên 4 nền tảng',
      time: '2 giờ trước',
      type: 'published',
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-3 sm:px-5 flex items-center justify-between gap-3">
      {/* Left side: Hamburger + Page Title */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Mở menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
            {currentInfo.title}
          </h1>
          <p className="hidden md:block text-[11px] text-slate-500 leading-tight">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Center / Right side: Channel Switcher + Search + Quick Post + Notifications + User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Channel & Brand Switcher Dropdown (Thay đổi các kênh khác & cụm thương hiệu) */}
        <div className="relative">
          <button
            onClick={() => setShowChannelDropdown(!showChannelDropdown)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors"
            title="Thay đổi cụm thương hiệu hoặc kênh quản lý"
          >
            {activeAccount ? (
              <>
                <img
                  src={activeAccount.avatar}
                  alt={activeAccount.name}
                  className="w-5 h-5 rounded-full object-cover border border-slate-300"
                />
                <span className="hidden sm:inline max-w-[130px] truncate">
                  {activeAccount.name}
                </span>
              </>
            ) : activeBrandId !== 'all' ? (
              (() => {
                const b = brands.find((br) => br.id === activeBrandId);
                return (
                  <>
                    <span className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${b?.badgeColor || 'bg-slate-900 text-white'}`}>
                      {b?.logo || 'CR'}
                    </span>
                    <span className="hidden sm:inline max-w-[130px] truncate font-bold">
                      {b?.name || 'Cụm'}
                    </span>
                  </>
                );
              })()
            ) : (
              <>
                <Layers className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Tất cả cụm ({accounts.length} kênh)</span>
              </>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Channel & Brand dropdown menu */}
          {showChannelDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowChannelDropdown(false)}
              />
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 text-left space-y-1">
                {/* 1. Brand Clusters Section */}
                <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Cụm Thương hiệu (Brand Clusters)</span>
                  {onOpenManageBrands && (
                    <button
                      onClick={() => {
                        setShowChannelDropdown(false);
                        onOpenManageBrands();
                      }}
                      className="text-indigo-600 hover:text-indigo-800 lowercase font-medium flex items-center gap-0.5 text-[10px]"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Quản lý</span>
                    </button>
                  )}
                </div>

                {/* Option: All Brands & Channels */}
                <button
                  onClick={() => {
                    onSelectChannel('all');
                    if (onSelectBrand) onSelectBrand('all');
                    setShowChannelDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                    activeChannelId === 'all' && activeBrandId === 'all'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <span>Tất cả các Cụm ({accounts.length} kênh)</span>
                  </div>
                  {activeChannelId === 'all' && activeBrandId === 'all' && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>

                {/* Individual Brands */}
                <div className="space-y-0.5">
                  {brands.map((b) => {
                    const brandAccs = accounts.filter((a) => a.brandId === b.id);
                    const isSelected = activeBrandId === b.id && activeChannelId === 'all';

                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          if (onSelectBrand) onSelectBrand(b.id);
                          onSelectChannel('all');
                          setShowChannelDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                          isSelected
                            ? `${b.bgLight} font-bold shadow-2xs`
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 ${b.badgeColor}`}
                          >
                            {b.logo}
                          </span>
                          <div className="min-w-0 text-left">
                            <div className="truncate font-semibold">{b.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">
                              {b.platforms.map((p) => PLATFORM_INFO[p].tagLabel).join(', ')} ({brandAccs.length} kênh)
                            </div>
                          </div>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>

                <div className="h-px bg-slate-100 my-1" />

                {/* 2. Specific Channels List */}
                <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Các Kênh Đơn Lẻ ({accounts.length})
                </div>

                <div className="max-h-52 overflow-y-auto space-y-0.5">
                  {accounts.map((acc) => {
                    const info = PLATFORM_INFO[acc.platform];
                    const Icon = info.icon;
                    const isSelected = activeChannelId === acc.id;

                    return (
                      <button
                        key={acc.id}
                        onClick={() => {
                          onSelectChannel(acc.id);
                          setShowChannelDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={acc.avatar}
                            alt={acc.name}
                            className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0 text-left">
                            <div className="truncate font-medium">{acc.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              {acc.handle}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <div className={info.brandColor}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="h-px bg-slate-100 my-1" />

                {/* Action buttons */}
                <div className="pt-0.5 space-y-1">
                  {onOpenManageBrands && (
                    <button
                      onClick={() => {
                        setShowChannelDropdown(false);
                        onOpenManageBrands();
                      }}
                      className="w-full flex items-center gap-2 p-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Quản lý & Thêm Cụm Thương hiệu</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowChannelDropdown(false);
                      onOpenConnectChannel();
                    }}
                    className="w-full flex items-center gap-2 p-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Liên kết kênh / trang mới...</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search bar */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm bài viết, kênh..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Quick Create Button (if not on create tab) */}
        {currentTab !== 'create' && (
          <button
            onClick={onOpenCreatePost}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo bài</span>
          </button>
        )}

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Thông báo"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 p-3 text-left">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">
                    Thông báo mới
                  </span>
                  <span className="text-[11px] text-blue-600 font-medium cursor-pointer hover:underline">
                    Đánh dấu đã đọc
                  </span>
                </div>
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100/70 transition-colors text-xs flex gap-2.5 items-start"
                    >
                      {n.type === 'upcoming' ? (
                        <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-slate-700 leading-snug">{n.text}</p>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User avatar and identity */}
        <div className="flex items-center gap-2 pl-1">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center text-xs shadow-2xs">
              HL
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-tight">
              Trần Hoàng Lan
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">
              Marketing Lead
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
