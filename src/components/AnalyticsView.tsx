import React, { useState } from 'react';
import { SocialAccount, ScheduledPost, PlatformId } from '../types';
import { PLATFORM_INFO, PlatformBadge } from './SocialIcons';
import {
  TrendingUp,
  BarChart2,
  Users,
  Eye,
  Heart,
  Share2,
  Calendar,
  ArrowUpRight,
  Sparkles,
  Flame,
  Zap,
  Info,
  Clock,
  Check,
} from 'lucide-react';

interface AnalyticsViewProps {
  accounts: SocialAccount[];
  posts: ScheduledPost[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ accounts, posts }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [activeChartPlatform, setActiveChartPlatform] = useState<'all' | 'facebook' | 'instagram' | 'tiktok'>('all');
  const [hoveredCell, setHoveredCell] = useState<{
    day: string;
    dayLabel: string;
    hour: string;
    val: number;
    pct: number;
    tip: string;
  } | null>(null);

  const published = posts.filter((p) => p.status === 'published');

  // Platform performance breakdown
  const platformStats = [
    {
      platform: 'facebook' as PlatformId,
      reach: '420,500',
      engagement: '6.2%',
      growth: '+12.4%',
      postsCount: 24,
      color: '#1877F2',
    },
    {
      platform: 'instagram' as PlatformId,
      reach: '310,200',
      engagement: '7.8%',
      growth: '+18.1%',
      postsCount: 31,
      color: '#E1306C',
    },
    {
      platform: 'tiktok' as PlatformId,
      reach: '890,000',
      engagement: '9.4%',
      growth: '+28.5%',
      postsCount: 42,
      color: '#000000',
    },
    {
      platform: 'youtube' as PlatformId,
      reach: '540,100',
      engagement: '4.9%',
      growth: '+8.3%',
      postsCount: 16,
      color: '#FF0000',
    },
  ];

  // Best time heatmap simulation
  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const dayFullNames: Record<string, string> = {
    T2: 'Thứ Hai',
    T3: 'Thứ Ba',
    T4: 'Thứ Tư',
    T5: 'Thứ Năm',
    T6: 'Thứ Sáu',
    T7: 'Thứ Bảy',
    CN: 'Chủ Nhật',
  };
  const hoursOfDay = ['09:00', '12:00', '15:00', '18:00', '20:00', '22:00'];

  // Heatmap intensity (0 to 3)
  const heatmapData = [
    [1, 2, 1, 2, 3, 2], // Mon
    [1, 2, 1, 2, 3, 1], // Tue
    [2, 3, 2, 3, 3, 2], // Wed
    [2, 2, 2, 3, 3, 2], // Thu
    [2, 3, 2, 3, 3, 3], // Fri
    [3, 3, 3, 3, 3, 3], // Sat (Golden)
    [3, 3, 2, 3, 3, 2], // Sun
  ];

  // Weekly data with precise numbers and growth
  const weeklyTrends = [
    {
      label: 'Tuần 1',
      dateRange: '01/09 - 07/09',
      fb: 65,
      ig: 78,
      tt: 92,
      total: 235,
      growth: '+10.4%',
    },
    {
      label: 'Tuần 2',
      dateRange: '08/09 - 14/09',
      fb: 75,
      ig: 85,
      tt: 110,
      total: 270,
      growth: '+14.8%',
    },
    {
      label: 'Tuần 3',
      dateRange: '15/09 - 21/09',
      fb: 90,
      ig: 98,
      tt: 135,
      total: 323,
      growth: '+19.6%',
    },
    {
      label: 'Tuần 4',
      dateRange: '22/09 - 28/09',
      fb: 105,
      ig: 120,
      tt: 160,
      total: 385,
      growth: '+24.5%',
    },
  ];

  const maxVal = 180; // Scale top for chart


  return (
    <div className="space-y-4 text-left">
      {/* Top Header Controls */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Báo cáo Tăng trưởng & Mức độ Tương tác
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu tổng hợp từ các API chính thức của Facebook, Instagram, TikTok và YouTube
          </p>
        </div>

        {/* Time range switcher */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md transition-all ${
                timeRange === range
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range === '7d' ? '7 ngày qua' : range === '30d' ? '30 ngày qua' : 'Quý này (90 ngày)'}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Multi-Platform Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {platformStats.map((item) => {
          const info = PLATFORM_INFO[item.platform];
          const Icon = info.icon;
          return (
            <div
              key={item.platform}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${info.accentBg} ${info.brandColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">{info.tagLabel}</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> {item.growth}
                </span>
              </div>

              <div className="space-y-0.5">
                <div className="text-xs text-slate-500">Lượt tiếp cận (Reach)</div>
                <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                  {item.reach}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Tương tác: <strong className="text-slate-900 font-semibold">{item.engagement}</strong></span>
                <span>{item.postsCount} bài đăng</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Comparative Chart + Best Time Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Engagement Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Xu hướng Tiếp cận Đa nền tảng (30 ngày)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +24.5%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Lượt xem và lượt hiển thị tăng trưởng đồng đều trên toàn bộ các kênh
              </p>
            </div>

            {/* Platform legend filter buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveChartPlatform('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeChartPlatform === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setActiveChartPlatform('facebook')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeChartPlatform === 'facebook'
                    ? 'bg-blue-600 text-white shadow-2xs ring-1 ring-blue-500'
                    : 'bg-blue-50/80 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Facebook</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartPlatform('instagram')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeChartPlatform === 'instagram'
                    ? 'bg-gradient-to-r from-fuchsia-600 to-rose-600 text-white shadow-2xs'
                    : 'bg-pink-50 text-rose-700 hover:bg-pink-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                <span>Instagram</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartPlatform('tiktok')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeChartPlatform === 'tiktok'
                    ? 'bg-slate-900 text-white shadow-2xs ring-1 ring-slate-800'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-900" />
                <span>TikTok</span>
              </button>
            </div>
          </div>

          {/* KPI Summary strip */}
          <div className="grid grid-cols-3 gap-2.5 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Tổng lượt tiếp cận:</span>
              <span className="text-sm font-bold text-slate-900 font-mono">1,213,000</span>
              <span className="text-[10px] text-emerald-600 font-medium ml-1">+24.5%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Trung bình tuần:</span>
              <span className="text-sm font-bold text-slate-900 font-mono">303,250</span>
              <span className="text-[10px] text-slate-400 font-normal ml-1">views</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Kênh dẫn đầu:</span>
              <span className="text-sm font-bold text-indigo-700 flex items-center gap-1 truncate">
                <span className="w-2 h-2 rounded-full bg-slate-900" /> TikTok (41.5%)
              </span>
            </div>
          </div>

          {/* Premium Chart Canvas with Y-axis Gridlines & Hover Tooltips */}
          <div className="relative pt-6 pb-2">
            {/* Background Grid lines */}
            <div className="absolute inset-0 top-6 bottom-10 flex flex-col justify-between pointer-events-none">
              {[150, 100, 50, 0].map((level) => (
                <div key={level} className="flex items-center gap-2 w-full">
                  <span className="text-[10px] font-mono text-slate-400 w-7 text-right shrink-0">
                    {level}k
                  </span>
                  <div className="w-full border-b border-dashed border-slate-200/80" />
                </div>
              ))}
            </div>

            {/* Bars Column Container */}
            <div className="relative z-10 pl-9 pr-2 h-52 flex items-end justify-between gap-2 sm:gap-4">
              {weeklyTrends.map((week, idx) => {
                const isHovered = hoveredWeek === idx;
                const isAnyHovered = hoveredWeek !== null;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredWeek(idx)}
                    onMouseLeave={() => setHoveredWeek(null)}
                    className={`flex-1 flex flex-col items-center justify-end h-full transition-all cursor-pointer rounded-xl p-1.5 ${
                      isHovered
                        ? 'bg-slate-100/80 ring-1 ring-slate-300 shadow-2xs'
                        : isAnyHovered
                        ? 'opacity-60'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Floating Info Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-12 z-30 bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-xl text-[11px] font-medium flex items-center gap-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                        <span className="font-bold text-amber-300">{week.label}:</span>
                        <span>{week.total}K lượt xem</span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1 py-0.2 rounded">
                          {week.growth}
                        </span>
                      </div>
                    )}

                    {/* Bars Group */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-40 pb-1">
                      {/* Facebook bar */}
                      <div
                        style={{ height: `${(week.fb / maxVal) * 100}%` }}
                        className={`w-3 sm:w-4.5 rounded-t-md transition-all duration-300 bg-gradient-to-t from-blue-700 via-blue-600 to-sky-400 shadow-xs shadow-blue-500/20 ${
                          activeChartPlatform !== 'all' && activeChartPlatform !== 'facebook'
                            ? 'opacity-20'
                            : 'opacity-100 hover:brightness-110'
                        }`}
                        title={`Facebook: ${week.fb}K views`}
                      />

                      {/* Instagram bar */}
                      <div
                        style={{ height: `${(week.ig / maxVal) * 100}%` }}
                        className={`w-3 sm:w-4.5 rounded-t-md transition-all duration-300 bg-gradient-to-t from-rose-600 via-pink-500 to-amber-300 shadow-xs shadow-pink-500/20 ${
                          activeChartPlatform !== 'all' && activeChartPlatform !== 'instagram'
                            ? 'opacity-20'
                            : 'opacity-100 hover:brightness-110'
                        }`}
                        title={`Instagram: ${week.ig}K views`}
                      />

                      {/* TikTok bar */}
                      <div
                        style={{ height: `${(week.tt / maxVal) * 100}%` }}
                        className={`w-3 sm:w-4.5 rounded-t-md transition-all duration-300 bg-gradient-to-t from-slate-950 via-slate-800 to-cyan-800 shadow-xs shadow-slate-900/30 ${
                          activeChartPlatform !== 'all' && activeChartPlatform !== 'tiktok'
                            ? 'opacity-20'
                            : 'opacity-100 hover:brightness-110'
                        }`}
                        title={`TikTok: ${week.tt}K views`}
                      />
                    </div>

                    {/* X-axis Label & Growth Pill */}
                    <div className="text-center pt-2 border-t border-slate-100 w-full">
                      <div className="text-xs font-bold text-slate-800">{week.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
                        {week.dateRange}
                      </div>
                      <div className="text-[10px] font-bold text-emerald-600 font-mono mt-0.5">
                        {week.growth}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Best Time to Post Heatmap (5 cols) */}
        <div className="lg:col-span-5 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Bản đồ nhiệt: Giờ vàng tương tác
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Thời điểm khán giả hoạt động trực tuyến nhiều nhất
              </p>
            </div>

            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border border-amber-200 flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span>AI Thuật toán</span>
            </span>
          </div>

          {/* Active Hover Detail Notification Banner */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs transition-all flex items-center justify-between gap-2 min-h-[46px]">
            {hoveredCell ? (
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                    hoveredCell.val === 3
                      ? 'bg-blue-600 text-white'
                      : hoveredCell.val === 2
                      ? 'bg-blue-300 text-blue-950 font-bold'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {hoveredCell.val === 3 ? <Flame className="w-3.5 h-3.5 text-amber-300" /> : <Clock className="w-3.5 h-3.5" />}
                </div>
                <div className="min-w-0 truncate">
                  <div className="font-bold text-slate-900">
                    {hoveredCell.dayLabel} lúc {hoveredCell.hour} ·{' '}
                    <span className={hoveredCell.val === 3 ? 'text-blue-700' : 'text-slate-700'}>
                      {hoveredCell.val === 3 ? 'Giờ vàng cực đại (96% online)' : `${hoveredCell.pct}% online`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{hoveredCell.tip}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Rê chuột vào các ô bên dưới để xem tỷ lệ khán giả online & đề xuất đăng bài</span>
              </div>
            )}
          </div>

          {/* Heatmap Grid Matrix */}
          <div className="space-y-1.5 pt-1">
            {/* Hour labels header */}
            <div className="grid grid-cols-7 text-center text-[10px] font-mono font-medium text-slate-500">
              <div />
              {hoursOfDay.map((h) => (
                <div key={h} className={h === '20:00' ? 'font-bold text-blue-700 flex items-center justify-center gap-0.5' : ''}>
                  {h}
                  {h === '20:00' && <Flame className="w-2.5 h-2.5 text-amber-500 inline" />}
                </div>
              ))}
            </div>

            {/* Days rows */}
            {daysOfWeek.map((day, dayIdx) => (
              <div key={day} className="grid grid-cols-7 items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 text-center font-mono py-1 rounded bg-slate-50 border border-slate-100">
                  {day}
                </span>

                {heatmapData[dayIdx].map((val, hIdx) => {
                  const hour = hoursOfDay[hIdx];
                  const dayName = dayFullNames[day] || day;
                  const isGolden = val === 3;
                  const pct = isGolden ? 96 : val === 2 ? 78 : 45;
                  const tip = isGolden
                    ? 'Khuyên đăng: Video ngắn / Reels / TikTok Shop'
                    : val === 2
                    ? 'Khuyên đăng: Bài viết chia sẻ / Hình ảnh / Carousel'
                    : 'Lượng truy cập thông thường';

                  return (
                    <div
                      key={hIdx}
                      onMouseEnter={() =>
                        setHoveredCell({
                          day,
                          dayLabel: dayName,
                          hour,
                          val,
                          pct,
                          tip,
                        })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`h-7.5 rounded-lg flex items-center justify-center text-xs font-mono transition-all duration-200 cursor-pointer relative group ${
                        val === 3
                          ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-600 text-white font-bold shadow-xs shadow-blue-500/25 ring-1 ring-blue-500/30 hover:scale-110 hover:z-20 hover:shadow-md'
                          : val === 2
                          ? 'bg-blue-300 text-blue-950 font-semibold border border-blue-400/40 hover:bg-blue-400 hover:scale-105 hover:z-10'
                          : val === 1
                          ? 'bg-blue-100/90 text-blue-800 border border-blue-200/50 hover:bg-blue-200 hover:scale-105 hover:z-10'
                          : 'bg-slate-100 text-slate-400 border border-slate-200/50 hover:bg-slate-200'
                      }`}
                      title={`${dayName} lúc ${hour}: Mức độ tương tác ${val}/3 (${pct}%)`}
                    >
                      {isGolden ? (
                        <Flame className="w-3.5 h-3.5 text-amber-300 drop-shadow-sm animate-pulse" />
                      ) : (
                        <span className="text-[10px] opacity-70">{pct}%</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend & AI Insight */}
          <div className="pt-2.5 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="text-[11px] text-slate-500">Thang đo tương tác:</span>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
                  <span className="text-[10px] text-slate-500">Ít</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
                  <span className="text-[10px] text-slate-500">Khá</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-blue-300" />
                  <span className="text-[10px] text-slate-500">Cao</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[9px] shadow-xs">
                    <Flame className="w-2.5 h-2.5 text-amber-300" />
                  </span>
                  <span className="text-[10px] font-bold text-blue-700">Giờ vàng</span>
                </div>
              </div>
            </div>

            {/* Smart Advice Pill */}
            <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Khuyên dùng:</strong> 20:00 - 21:30 các ngày <strong>Thứ 6, Thứ 7 & Chủ Nhật</strong> đạt lượt tiếp cận gấp <strong>2.8 lần</strong> ngày thường.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
