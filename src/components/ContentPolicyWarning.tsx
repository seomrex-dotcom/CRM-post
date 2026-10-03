import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  Flame,
  Layers,
  ArrowRight,
  Eye,
  CheckCheck,
  RefreshCw,
  Copy,
  Info,
  BadgeCheck,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { PolicyScanResult, ViolationMatch } from '../utils/policyScanner';
import { analyzeAndRewritePolicy } from '../utils/geminiAi';
import {
  scanMetaAiPolicy,
  fixMetaAiViolations,
  runMetaAiDeepAudit,
  MetaAiScanResult,
  MetaAiViolation,
} from '../utils/metaAiScanner';
import { MetaAiIcon } from './SocialIcons';

interface ContentPolicyWarningProps {
  content: string;
  scanResult: PolicyScanResult;
  selectedPlatforms: string[];
  onReplaceKeyword: (oldWord: string, newWord: string) => void;
  onReplaceAll: () => void;
  onSetContent: (newContent: string) => void;
  onInsertSample?: (sampleText: string) => void;
  initialEngine?: 'meta_ai' | 'multi_platform';
}

const META_AI_TEST_SAMPLES = [
  {
    id: 'sample-personal',
    title: 'Thuộc tính cá nhân',
    clause: 'Meta Ad 4.3',
    subtitle: 'Cấm nhắm trực tiếp vào khuyết điểm cơ thể & nợ nần',
    badge: 'Từ chối Ads',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'Bạn có bị béo bụng và bạn bị mụn lâu năm không chữa được? Hay bạn đang nợ tiền khắp nơi và cảm thấy bạn bị trầm cảm bế tắc? Hãy xem ngay video này!',
  },
  {
    id: 'sample-before-after',
    title: 'Trước & Sau (Before/After)',
    clause: 'Meta Policy 4.6',
    subtitle: 'Cấm so sánh trước sau & hứa hẹn kết quả siêu ngắn',
    badge: 'Cấm chạy Ads',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'Hình ảnh trước và sau 3 ngày da thay đổi hoàn toàn! Cam kết 100% đánh bay vết nám và trị dứt điểm mọi vết thâm chỉ sau 1 liệu trình duy nhất.',
  },
  {
    id: 'sample-bait',
    title: 'Bẫy tương tác',
    clause: 'Engagement Bait',
    subtitle: 'Câu like/share/comment bị bóp 80% Organic Reach',
    badge: 'Bóp 80% Reach',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    text: 'Thả tim để nhận lộc đầu tháng nào cả nhà ơi! Hãy chia sẻ ngay kẻo lỡ và bình luận chấm (".") để shop gửi báo giá ưu đãi độc quyền hôm nay nhé!',
  },
  {
    id: 'sample-financial',
    title: 'Cam kết làm giàu',
    clause: 'Unrealistic Claims',
    subtitle: 'Meta cấm hứa hẹn lợi nhuận phi thực tế',
    badge: 'Khóa tài khoản Ads',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'Làm giàu không khó! Dự án đầu tư bao lời cam kết lợi nhuận 40% mỗi tuần, rút tiền mặt về ví nhanh chóng không rủi ro.',
  },
  {
    id: 'sample-clean',
    title: 'Mẫu sạch chuẩn Meta Ads',
    clause: 'Verified 100/100',
    subtitle: 'Nội dung tích cực, thông điệp truyền cảm hứng chuẩn quy tắc',
    badge: 'Đạt chuẩn 100/100',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    text: 'Hành trình chăm sóc vóc dáng thon gọn và nâng cao năng lượng tích cực mỗi ngày cùng chúng mình. Nhắn tin trực tiếp để nhận tư vấn lộ trình phù hợp nhất bạn nhé!',
  },
];

const MULTI_PLATFORM_SAMPLES = [
  {
    id: 'sample-tiktok-redirect',
    title: 'Điều hướng TikTok sang Zalo',
    clause: 'TikTok Community Policy',
    subtitle: 'TikTok bóp 0 view nếu dẫn link ngoài hoặc phở bò',
    badge: 'Bóp 0 view TikTok',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    text: 'Dạ anh chị nào muốn nhận tài liệu miễn phí thì nhanh tay inbox zalo số 0988xxx hoặc add zalo qua phở bò để em hỗ trợ nhé!',
  },
  {
    id: 'sample-counterfeit',
    title: 'Hàng giả / Nhái thương hiệu',
    clause: 'Intellectual Property',
    subtitle: 'Vi phạm sở hữu trí tuệ trên mọi nền tảng',
    badge: 'Vi phạm bản quyền',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'Áo phông hàng rep 1:1 siêu nét, bao chất lượng chuẩn như auth, hàng fake cao cấp replica chuẩn từng chi tiết giá học sinh.',
  },
];

export const ContentPolicyWarning: React.FC<ContentPolicyWarningProps> = ({
  content,
  scanResult,
  selectedPlatforms,
  onReplaceKeyword,
  onReplaceAll,
  onSetContent,
  onInsertSample,
  initialEngine = 'meta_ai',
}) => {
  const [engineMode, setEngineMode] = useState<'meta_ai' | 'multi_platform'>(initialEngine);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAiRewriting, setIsAiRewriting] = useState(false);
  const [showSamplesDrawer, setShowSamplesDrawer] = useState(false);
  const [showInContextHighlight, setShowInContextHighlight] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [justFixedId, setJustFixedId] = useState<string | null>(null);

  // Run Meta AI Policy Scanner
  const metaAiResult: MetaAiScanResult = useMemo(() => {
    return scanMetaAiPolicy(content);
  }, [content]);

  const isMetaMode = engineMode === 'meta_ai';
  const hasViolations = isMetaMode ? !metaAiResult.isCompliant : scanResult.hasViolations;
  const violationCount = isMetaMode ? metaAiResult.violations.length : scanResult.violations.length;
  const score = isMetaMode ? metaAiResult.score : scanResult.safetyScore;
  const isHighSeverity = isMetaMode ? metaAiResult.criticalCount > 0 : scanResult.highCount > 0;

  // Handle Meta AI Deep Rewrite
  const handleMetaAiRewrite = async () => {
    if (!content.trim()) return;
    setIsAiRewriting(true);
    try {
      if (engineMode === 'meta_ai') {
        const res = await runMetaAiDeepAudit(content);
        if (res.metaAiRewrittenCopy) {
          onSetContent(res.metaAiRewrittenCopy);
        }
      } else {
        const res = await analyzeAndRewritePolicy(content, selectedPlatforms);
        if (res.safeRewriteVersion) {
          onSetContent(res.safeRewriteVersion);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiRewriting(false);
    }
  };

  const handleFixAll = () => {
    if (engineMode === 'meta_ai') {
      const fixed = fixMetaAiViolations(content, metaAiResult.violations);
      onSetContent(fixed);
    } else {
      onReplaceAll();
    }
  };

  const handleSingleFix = (id: string, keyword: string, fix: string) => {
    setJustFixedId(id);
    onReplaceKeyword(keyword, fix);
    setTimeout(() => {
      setJustFixedId(null);
    }, 1500);
  };

  // Filtered lists
  const filteredMetaViolations = useMemo(() => {
    if (activeCategoryFilter === 'all') return metaAiResult.violations;
    return metaAiResult.violations.filter((v) => v.category === activeCategoryFilter);
  }, [metaAiResult.violations, activeCategoryFilter]);

  const filteredMultiViolations = useMemo(() => {
    if (activeCategoryFilter === 'all') return scanResult.violations;
    return scanResult.violations.filter((v) => v.category === activeCategoryFilter);
  }, [scanResult.violations, activeCategoryFilter]);

  // Categories present in violations
  const availableCategories = useMemo(() => {
    if (isMetaMode) {
      const cats = Array.from(new Set(metaAiResult.violations.map((v) => v.category)));
      return cats.map((catKey) => {
        const first = metaAiResult.violations.find((v) => v.category === catKey);
        const count = metaAiResult.violations.filter((v) => v.category === catKey).length;
        return { key: catKey, label: first?.categoryLabel || catKey, count };
      });
    } else {
      const cats = Array.from(new Set(scanResult.violations.map((v) => v.category)));
      return cats.map((catKey) => {
        const first = scanResult.violations.find((v) => v.category === catKey);
        const count = scanResult.violations.filter((v) => v.category === catKey).length;
        return { key: catKey, label: first?.categoryName || catKey, count };
      });
    }
  }, [isMetaMode, metaAiResult.violations, scanResult.violations]);

  // Render text with highlighted keywords for visual preview
  const renderHighlightedContent = () => {
    if (!content.trim()) return null;
    const keywordsToHighlight = isMetaMode
      ? metaAiResult.violations.map((v) => v.keyword)
      : scanResult.violations.map((v) => v.keyword);

    if (keywordsToHighlight.length === 0) {
      return <span className="text-slate-700">{content}</span>;
    }

    // Escape regex
    const escaped = keywordsToHighlight
      .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .sort((a, b) => b.length - a.length);
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');

    const parts = content.split(regex);
    return parts.map((part, index) => {
      const isViolation = keywordsToHighlight.some((k) => k.toLowerCase() === part.toLowerCase());
      if (isViolation) {
        return (
          <mark
            key={index}
            className="bg-rose-100 text-rose-800 font-semibold px-1 py-0.5 rounded border border-rose-300 mx-0.5 transition-all animate-pulse"
            title="Từ khóa vi phạm chính sách"
          >
            {part}
          </mark>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // State when no content entered
  if (!content.trim()) {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/40 p-3 shadow-2xs text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0064e0] via-[#803bec] to-[#00c6ff] flex items-center justify-center text-white shadow-2xs shrink-0">
              <MetaAiIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-800 tracking-tight">Meta AI Policy Inspector</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-blue-100/80 text-blue-800 border border-blue-200">
                  Ads 2026 Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                Tự động rà quét từ khóa cấm, thuộc tính cá nhân, before/after & bẫy tương tác theo chuẩn Meta.
              </p>
            </div>
          </div>

          {onInsertSample && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] text-slate-500 hidden md:inline">Thử nhanh:</span>
              <button
                type="button"
                onClick={() => onInsertSample(META_AI_TEST_SAMPLES[0].text)}
                className="px-2 py-1 text-[11px] font-medium text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg shadow-2xs transition-all hover:scale-[1.02]"
              >
                🔴 Thuộc tính cá nhân
              </button>
              <button
                type="button"
                onClick={() => onInsertSample(META_AI_TEST_SAMPLES[1].text)}
                className="px-2 py-1 text-[11px] font-medium text-amber-700 bg-white hover:bg-amber-50 border border-amber-200 rounded-lg shadow-2xs transition-all hover:scale-[1.02]"
              >
                🟡 Trước & Sau
              </button>
              <button
                type="button"
                onClick={() => setShowSamplesDrawer(!showSamplesDrawer)}
                className="px-2 py-1 text-[11px] font-medium text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                {showSamplesDrawer ? 'Đóng mẫu' : 'Xem thêm mẫu'}
              </button>
            </div>
          )}
        </div>

        {/* Collapsible sample picker */}
        {showSamplesDrawer && onInsertSample && (
          <div className="mt-3 pt-3 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {[...META_AI_TEST_SAMPLES, ...MULTI_PLATFORM_SAMPLES].map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  onInsertSample(sample.text);
                  setShowSamplesDrawer(false);
                }}
                className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all text-left group"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 line-clamp-1">
                    {sample.title}
                  </span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${sample.badgeColor}`}>
                    {sample.badge}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mb-1">{sample.subtitle}</div>
                <div className="text-[11px] text-slate-600 italic line-clamp-2 bg-slate-50 p-1.5 rounded">
                  "{sample.text}"
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border transition-all text-left overflow-hidden shadow-xs ${
        !hasViolations
          ? 'border-emerald-200/90 bg-white ring-1 ring-emerald-500/10'
          : isHighSeverity
          ? 'border-rose-300 bg-white ring-1 ring-rose-500/10'
          : 'border-amber-300 bg-white ring-1 ring-amber-500/10'
      }`}
    >
      {/* Top Ambient Engine Header */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Segmented control for Engine Switch */}
          <div className="flex items-center p-0.5 bg-slate-200/70 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setEngineMode('meta_ai');
                setActiveCategoryFilter('all');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                isMetaMode
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MetaAiIcon className="w-3.5 h-3.5" />
              <span>Meta AI</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-blue-50 text-blue-600 border border-blue-200 font-mono">
                FB · IG
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEngineMode('multi_platform');
                setActiveCategoryFilter('all');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                !isMetaMode
                  ? 'bg-slate-900 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Đa nền tảng</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-slate-700 text-slate-200 font-mono">
                TikTok · YT
              </span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 hidden lg:inline">|</span>
          <span className="text-[11px] text-slate-500 hidden lg:inline">
            {isMetaMode ? 'Tiêu chuẩn phê duyệt Facebook & Instagram Ads' : 'Kiểm duyệt đa kênh tổng hợp'}
          </span>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-1.5">
          {onInsertSample && (
            <button
              type="button"
              onClick={() => setShowSamplesDrawer(!showSamplesDrawer)}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 rounded-lg border border-slate-200/80 transition-colors flex items-center gap-1"
            >
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span>Mẫu thử ({META_AI_TEST_SAMPLES.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowInContextHighlight(!showInContextHighlight)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all flex items-center gap-1 ${
              showInContextHighlight
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200/80'
            }`}
            title="Xem vị trí từ khóa vi phạm trực tiếp trong văn bản"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Soi trong bài</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isExpanded ? 'Thu gọn bảng điều khiển' : 'Mở rộng bảng điều khiển'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Scoreboard & Health Gauges */}
      <div className="p-3.5 sm:p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Health Ring & Main Verdict */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Circular Progress Gauge */}
            <div className="relative w-13 h-13 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`transition-all duration-700 ${
                    score >= 85
                      ? 'text-emerald-500'
                      : score >= 60
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }`}
                  strokeDasharray={`${Math.max(4, score)}, 100`}
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-black tracking-tight leading-none text-slate-800">
                  {score}
                </span>
                <span className="text-[8px] font-bold text-slate-400 leading-none mt-0.5">/100</span>
              </div>
            </div>

            {/* Verdict details */}
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900 tracking-tight">
                  {!hasViolations ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <BadgeCheck className="w-4 h-4 text-emerald-600 inline shrink-0" />
                      <span>Đạt chuẩn 100% Chính sách Meta AI</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-slate-900">
                      <ShieldAlert className={`w-4 h-4 shrink-0 ${isHighSeverity ? 'text-rose-600' : 'text-amber-600'}`} />
                      <span>Phát hiện {violationCount} từ khóa cần khắc phục</span>
                    </span>
                  )}
                </span>

                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    !hasViolations
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isHighSeverity
                      ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {!hasViolations
                    ? 'Xuất sắc · An toàn Ads'
                    : isHighSeverity
                    ? 'Rủi ro cao · Dễ chối Ads'
                    : 'Cần cải thiện Reach'}
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-1">
                {isMetaMode ? metaAiResult.metaSummary : scanResult.summary}
              </p>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end">
            {hasViolations && (
              <>
                <button
                  type="button"
                  onClick={handleFixAll}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-all shadow-2xs hover:scale-[1.01]"
                  title="Thay thế toàn bộ từ khóa bằng từ ngữ an toàn được đề xuất"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Sửa nhanh tất cả ({violationCount})</span>
                </button>

                <button
                  type="button"
                  onClick={handleMetaAiRewrite}
                  disabled={isAiRewriting}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#0064e0] via-[#803bec] to-[#00c6ff] hover:opacity-95 active:scale-[0.98] rounded-xl shadow-xs transition-all disabled:opacity-60"
                  title="Meta AI phân tích và viết lại bài viết giữ nguyên thông điệp, tối ưu 100% duyệt Ads"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAiRewriting ? 'animate-spin' : ''}`} />
                  <span>{isAiRewriting ? 'Meta AI đang viết...' : 'Meta AI Viết lại An toàn'}</span>
                </button>
              </>
            )}

            {!hasViolations && (
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold">
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Sẵn sàng phân phối & chạy Ads</span>
              </div>
            )}
          </div>
        </div>

        {/* 3 Metric Badges for Meta Engine */}
        {isMetaMode && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100">
            <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Duyệt chạy Ads
                </span>
                <span
                  className={`text-xs font-bold ${
                    metaAiResult.adApprovalProbability >= 80
                      ? 'text-emerald-700'
                      : metaAiResult.adApprovalProbability >= 50
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}
                >
                  {metaAiResult.adApprovalProbability}% ({metaAiResult.adApprovalProbability >= 80 ? 'Cao' : 'Nguy cơ từ chối'})
                </span>
              </div>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  metaAiResult.adApprovalProbability >= 80
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Thuật toán Reach
                </span>
                <span
                  className={`text-xs font-bold ${
                    metaAiResult.organicReachStatus === 'optimal'
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {metaAiResult.organicReachStatus === 'optimal'
                    ? 'Tối ưu Bảng tin'
                    : 'Bị bóp reach tương tác'}
                </span>
              </div>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  metaAiResult.organicReachStatus === 'optimal'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Tiêu chuẩn áp dụng
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Meta Ad Policy 2026.4
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <MetaAiIcon className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* Live In-Context Text Highlighter View */}
        {showInContextHighlight && (
          <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-600 font-semibold text-[11px]">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Trực quan hóa vị trí từ vi phạm trong bài viết:</span>
              </span>
              <button
                type="button"
                onClick={() => setShowInContextHighlight(false)}
                className="text-slate-400 hover:text-slate-600 underline text-[10px]"
              >
                Ẩn xem trước
              </button>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 leading-relaxed font-normal whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
              {renderHighlightedContent()}
            </div>
          </div>
        )}

        {/* Presets Drawer */}
        {showSamplesDrawer && onInsertSample && (
          <div className="mt-3 pt-3 border-t border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Chọn mẫu vi phạm điển hình để kiểm tra Meta AI Scanner:</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSamplesDrawer(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {(isMetaMode ? META_AI_TEST_SAMPLES : [...META_AI_TEST_SAMPLES, ...MULTI_PLATFORM_SAMPLES]).map(
                (sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      onInsertSample(sample.text);
                      setShowSamplesDrawer(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-400 transition-all text-left group space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 line-clamp-1">
                        {sample.title}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${sample.badgeColor}`}>
                        {sample.badge}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{sample.subtitle}</div>
                    <div className="text-[11px] text-slate-600 italic line-clamp-2 bg-white p-1 rounded border border-slate-100">
                      "{sample.text}"
                    </div>
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Violations List & Filter Category Tabs */}
      {isExpanded && hasViolations && (
        <div className="px-3.5 pb-3.5 border-t border-slate-200/80 bg-slate-50/50 space-y-3">
          {/* Category Filter Pills */}
          <div className="pt-3 flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all ${
                activeCategoryFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tất cả ({violationCount})
            </button>

            {availableCategories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategoryFilter(cat.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  activeCategoryFilter === cat.key
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className="ml-1 opacity-80 text-[10px] font-mono">({cat.count})</span>
              </button>
            ))}
          </div>

          {/* List of Violation Cards */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {isMetaMode ? (
              filteredMetaViolations.map((v) => {
                const isJustFixed = justFixedId === v.id;
                return (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition-all hover:border-slate-300"
                  >
                    <div className="min-w-0 space-y-1">
                      {/* Flagged phrase & Suggested fix */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-[11px] line-through border ${
                            v.severity === 'critical'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          "{v.foundText}"
                        </span>

                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] border border-emerald-200 flex items-center gap-1 shadow-2xs">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>"{v.suggestedFix}"</span>
                        </span>

                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          {v.categoryLabel}
                        </span>

                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            v.severity === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {v.severity === 'critical' ? 'Rủi ro cao' : 'Lưu ý'}
                        </span>
                      </div>

                      {/* Policy description & impact */}
                      <p className="text-[11px] text-slate-600 font-medium">
                        {v.metaPolicyClause}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="text-rose-600 font-semibold">Tác động: {v.impactOnAd}</span>
                        <span>·</span>
                        <span className="text-amber-700">{v.impactOnReach}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        type="button"
                        onClick={() => handleSingleFix(v.id, v.keyword, v.suggestedFix)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-2xs ${
                          isJustFixed
                            ? 'bg-emerald-600 text-white scale-105'
                            : 'text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                        }`}
                        title="Thay thế từ khóa vi phạm bằng từ an toàn ngay lập tức"
                      >
                        {isJustFixed ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Đã thay!</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>Áp dụng từ này</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              filteredMultiViolations.map((v) => {
                const isJustFixed = justFixedId === v.id;
                return (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition-all hover:border-slate-300"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold px-2 py-0.5 rounded-md text-[11px] line-through bg-rose-50 text-rose-700 border border-rose-200">
                          "{v.foundText}"
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] border border-emerald-200">
                          "{v.replacement}"
                        </span>
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {v.categoryName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{v.reason}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSingleFix(v.id, v.keyword, v.replacement)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 self-end md:self-center ${
                        isJustFixed
                          ? 'bg-emerald-600 text-white'
                          : 'text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      {isJustFixed ? 'Đã thay!' : 'Áp dụng từ này'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
