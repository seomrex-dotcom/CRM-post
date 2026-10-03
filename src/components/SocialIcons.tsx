import React from 'react';
import { PlatformId, BrandCluster } from '../types';

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.33 6.33 0 0 0 6.33-6.32V8.87a8.28 8.28 0 0 0 4.84 1.56V7a4.83 4.83 0 0 1-.92-.31z" />
  </svg>
);

export const YouTubeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const MetaAiIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8.8" stroke="url(#metaAiGrad)" strokeWidth="2.8" />
    <defs>
      <linearGradient id="metaAiGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0064e0" />
        <stop offset="0.5" stopColor="#a033ff" />
        <stop offset="1" stopColor="#00c6ff" />
      </linearGradient>
    </defs>
  </svg>
);

export const MetaLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.96 4.02c-1.9 0-3.5 1.05-4.96 2.76-1.46-1.71-3.06-2.76-4.96-2.76C3.12 4.02 0 7.37 0 12.01c0 4.63 3.12 7.97 7.04 7.97 2.37 0 4.06-1.12 5.09-2.28 1.03 1.16 2.72 2.28 5.09 2.28 3.92 0 7.04-3.34 7.04-7.97 0-4.64-3.12-7.99-7.04-7.99zm-9.92 13.9c-2.78 0-4.96-2.42-4.96-5.91s2.18-5.91 4.96-5.91c1.86 0 3.29 1.18 4.3 2.91-1.28 2.68-2.67 5.76-4.3 8.91zm9.92 0c-1.63-3.15-3.02-6.23-4.3-8.91 1.01-1.73 2.44-2.91 4.3-2.91 2.78 0 4.96 2.42 4.96 5.91s-2.18 5.91-4.96 5.91z" />
  </svg>
);

export const PLATFORM_INFO: Record<
  PlatformId,
  {
    name: string;
    icon: React.FC<{ className?: string }>;
    brandColor: string;
    brandHex: string;
    accentBg: string;
    borderColor: string;
    maxChars: number;
    badgeBg: string;
    badgeText: string;
    tagLabel: string;
  }
> = {
  facebook: {
    name: 'Facebook Fanpage',
    icon: FacebookIcon,
    brandColor: 'text-[#1877F2]',
    brandHex: '#1877F2',
    accentBg: 'bg-[#1877F2]/10',
    borderColor: 'border-[#1877F2]',
    maxChars: 5000,
    badgeBg: 'bg-blue-50 text-[#1877F2] border-blue-200',
    badgeText: 'text-[#1877F2]',
    tagLabel: 'Facebook',
  },
  instagram: {
    name: 'Instagram',
    icon: InstagramIcon,
    brandColor: 'text-[#E1306C]',
    brandHex: '#E1306C',
    accentBg: 'bg-pink-50',
    borderColor: 'border-[#E1306C]',
    maxChars: 2200,
    badgeBg: 'bg-pink-50 text-[#E1306C] border-pink-200',
    badgeText: 'text-[#E1306C]',
    tagLabel: 'Instagram',
  },
  tiktok: {
    name: 'TikTok',
    icon: TikTokIcon,
    brandColor: 'text-slate-900',
    brandHex: '#000000',
    accentBg: 'bg-slate-100',
    borderColor: 'border-slate-800',
    maxChars: 2200,
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    badgeText: 'text-slate-900',
    tagLabel: 'TikTok',
  },
  youtube: {
    name: 'YouTube',
    icon: YouTubeIcon,
    brandColor: 'text-[#FF0000]',
    brandHex: '#FF0000',
    accentBg: 'bg-red-50',
    borderColor: 'border-[#FF0000]',
    maxChars: 5000,
    badgeBg: 'bg-red-50 text-[#FF0000] border-red-200',
    badgeText: 'text-[#FF0000]',
    tagLabel: 'YouTube',
  },
};

export const PlatformBadge: React.FC<{ platform: PlatformId; showName?: boolean; size?: 'sm' | 'md' }> = ({
  platform,
  showName = false,
  size = 'md',
}) => {
  const info = PLATFORM_INFO[platform];
  const Icon = info.icon;
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium transition-all ${info.badgeBg}`}
      title={info.name}
    >
      <Icon className={iconSize} />
      {showName && <span>{info.tagLabel}</span>}
    </div>
  );
};

export const BrandBadge: React.FC<{
  brand: BrandCluster;
  showPlatforms?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}> = ({ brand, showPlatforms = false, size = 'sm', className = '' }) => {
  const isSm = size === 'sm';
  const isXs = size === 'xs';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border font-semibold transition-all ${
        isXs
          ? 'px-1.5 py-0.5 text-[10px]'
          : isSm
          ? 'px-2 py-0.5 text-xs'
          : 'px-2.5 py-1 text-xs'
      } ${brand.bgLight} ${className}`}
      title={`${brand.name} (${brand.platforms.map((p) => PLATFORM_INFO[p].tagLabel).join(', ')})`}
    >
      <span
        className={`rounded-sm font-bold flex items-center justify-center shrink-0 ${
          isXs ? 'w-3.5 h-3.5 text-[9px]' : 'w-4 h-4 text-[10px]'
        } ${brand.badgeColor}`}
      >
        {brand.logo}
      </span>
      <span className="truncate">{brand.name}</span>

      {showPlatforms && (
        <span className="flex items-center gap-1 pl-1 border-l border-current/20 opacity-90">
          {brand.platforms.map((p) => {
            const PIcon = PLATFORM_INFO[p].icon;
            return <PIcon key={p} className={isXs ? 'w-2.5 h-2.5' : 'w-3 h-3'} />;
          })}
        </span>
      )}
    </div>
  );
};

