import React from 'react';
import {
  LayoutDashboard,
  PenSquare,
  Calendar,
  BarChart3,
  Settings,
  Share2,
  X,
  PlusCircle,
  Plus,
  Layers,
  Sliders,
} from 'lucide-react';
import { SocialAccount, BrandCluster } from '../types';
import { PLATFORM_INFO } from './SocialIcons';
import { INITIAL_BRANDS } from '../data/mockData';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  accounts: SocialAccount[];
  brands?: BrandCluster[];
  activeBrandId?: string | 'all';
  onSelectBrand?: (id: string | 'all') => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  scheduledCount: number;
  activeChannelId: string | 'all';
  onSelectChannel: (id: string | 'all') => void;
  onOpenConnectChannel: () => void;
  onOpenManageBrands?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  accounts,
  brands = INITIAL_BRANDS,
  activeBrandId = 'all',
  onSelectBrand,
  mobileOpen,
  onCloseMobile,
  scheduledCount,
  activeChannelId,
  onSelectChannel,
  onOpenConnectChannel,
  onOpenManageBrands,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'create',
      label: 'Tạo bài viết',
      icon: PenSquare,
      badge: null,
    },
    {
      id: 'calendar',
      label: 'Lịch trình',
      icon: Calendar,
      badge: scheduledCount > 0 ? `${scheduledCount}` : null,
    },
    {
      id: 'analytics',
      label: 'Phân tích',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Cài đặt & Kênh',
      icon: Settings,
      badge: `${accounts.length}`,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                OmniSocial
              </span>
              <span className="text-[11px] font-medium text-slate-600 leading-tight">
                Quản lý Đa Kênh
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary CTA */}
        <div className="p-4">
          <button
            onClick={() => {
              onSelectTab('create');
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs hover:shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo bài mới</span>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Điều hướng chính
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-600' : 'text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono tabular-nums ${
                      isActive
                        ? 'bg-blue-200/80 text-blue-800 font-semibold'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Connected platforms section */}
          <div className="pt-4 px-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Cụm Kênh ({accounts.length})
              </span>
              <div className="flex items-center gap-1.5">
                {onOpenManageBrands && (
                  <button
                    onClick={() => {
                      onOpenManageBrands();
                      onCloseMobile();
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    title="Quản lý Cụm Thương hiệu"
                  >
                    Cụm
                  </button>
                )}
                <button
                  onClick={() => {
                    onOpenConnectChannel();
                    onCloseMobile();
                  }}
                  className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  title="Liên kết thêm kênh mới"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Kênh</span>
                </button>
              </div>
            </div>

            {/* Quick All Channels Filter */}
            <button
              onClick={() => {
                onSelectChannel('all');
                if (onSelectBrand) onSelectBrand('all');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between p-2 mb-2 rounded-lg text-xs transition-colors ${
                activeChannelId === 'all' && activeBrandId === 'all'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Tất cả các cụm & kênh</span>
              </div>
              <span className="text-[10px] font-mono opacity-80">({accounts.length})</span>
            </button>

            {/* Grouped by Brand Clusters */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {brands.map((b) => {
                const brandAccounts = accounts.filter((a) => a.brandId === b.id);
                if (brandAccounts.length === 0) return null;
                const isBrandActive = activeBrandId === b.id;

                return (
                  <div key={b.id} className="space-y-1">
                    {/* Brand header */}
                    <button
                      onClick={() => {
                        if (onSelectBrand) onSelectBrand(b.id);
                        onSelectChannel('all');
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                        isBrandActive
                          ? `${b.bgLight} shadow-2xs`
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      title={`Lọc cụm ${b.name}`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`w-4 h-4 rounded-sm text-[9px] font-bold flex items-center justify-center shrink-0 ${b.badgeColor}`}>
                          {b.logo}
                        </span>
                        <span className="truncate">{b.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-normal shrink-0">
                        {brandAccounts.length} kênh
                      </span>
                    </button>

                    {/* Channels inside this brand */}
                    <div className="pl-2 space-y-1">
                      {brandAccounts.map((acc) => {
                        const info = PLATFORM_INFO[acc.platform];
                        const Icon = info.icon;
                        const isSelected = activeChannelId === acc.id;

                        return (
                          <div
                            key={acc.id}
                            onClick={() => {
                              onSelectChannel(acc.id);
                              if (onSelectBrand) onSelectBrand(b.id);
                              onCloseMobile();
                            }}
                            className={`cursor-pointer flex items-center justify-between p-1.5 rounded-lg border text-xs transition-all ${
                              isSelected
                                ? 'bg-blue-50/80 border-blue-300 shadow-2xs text-blue-950 font-medium'
                                : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <img
                                src={acc.avatar}
                                alt={acc.name}
                                className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200"
                              />
                              <div className="truncate min-w-0 text-left">
                                <div className="font-semibold text-slate-800 truncate text-[11px] leading-tight">
                                  {acc.name}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate leading-tight">
                                  {acc.handle}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-1">
                              <div className={info.brandColor} title={info.tagLabel}>
                                <Icon className="w-3 h-3" />
                              </div>
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  acc.connected ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer: Quick user profile */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-semibold flex items-center justify-center text-sm shadow-2xs">
                HL
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-semibold text-slate-900 truncate">
                Hoàng Lan (Lead)
              </p>
              <p className="text-[11px] text-slate-600 truncate">
                {accounts.length} Kênh liên kết
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
