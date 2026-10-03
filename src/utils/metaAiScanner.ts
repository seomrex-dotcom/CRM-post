/**
 * Meta AI Advertising & Community Standards Policy Engine
 * Chuyên sâu về thuật toán kiểm duyệt nội dung & chính sách quảng cáo của Facebook & Instagram (Meta)
 */
import { GoogleGenAI } from '@google/genai';

export interface MetaAiViolation {
  id: string;
  keyword: string;
  foundText: string;
  startIndex: number;
  endIndex: number;
  category: 'personal_attributes' | 'before_after' | 'engagement_bait' | 'unrealistic_claims' | 'meta_brand';
  categoryLabel: string;
  severity: 'critical' | 'high' | 'medium';
  metaPolicyClause: string;
  impactOnAd: string;
  impactOnReach: string;
  suggestedFix: string;
}

export interface MetaAiScanResult {
  isCompliant: boolean;
  score: number; // 0 - 100
  adApprovalProbability: number; // % khả năng được duyệt chạy Ads (0 - 100%)
  organicReachStatus: 'optimal' | 'throttled' | 'severely_suppressed'; // Phân phối tự nhiên
  violations: MetaAiViolation[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  metaSummary: string;
}

export interface MetaAiRule {
  keyword: string;
  category: 'personal_attributes' | 'before_after' | 'engagement_bait' | 'unrealistic_claims' | 'meta_brand';
  severity: 'critical' | 'high' | 'medium';
  metaPolicyClause: string;
  impactOnAd: string;
  impactOnReach: string;
  replacement: string;
}

export const META_AI_RULES: MetaAiRule[] = [
  // 1. Thuộc tính cá nhân (Personal Attributes - Điều khoản 4.3 của Meta)
  {
    keyword: 'bạn có bị béo',
    category: 'personal_attributes',
    severity: 'critical',
    metaPolicyClause: 'Chính sách Meta mục 4.3: Cấm nội dung khẳng định hoặc ám chỉ thuộc tính cá nhân tiêu cực của người xem.',
    impactOnAd: 'Từ chối phê duyệt chiến dịch quảng cáo ngay lập tức.',
    impactOnReach: 'Bị bóp reach hiển thị trên Bảng tin Facebook & Instagram.',
    replacement: 'phương pháp cải thiện vóc dáng',
  },
  {
    keyword: 'bạn bị mụn',
    category: 'personal_attributes',
    severity: 'critical',
    metaPolicyClause: 'Meta cấm nhắm trực tiếp vào khuyết điểm da liễu hay ngoại hình của người dùng.',
    impactOnAd: 'Từ chối duyệt Ads, điểm chất lượng quảng cáo Below Average.',
    impactOnReach: 'Giảm 50% lượt hiển thị tự nhiên.',
    replacement: 'chăm sóc làn da tươi tắn',
  },
  {
    keyword: 'bạn đang nợ',
    category: 'personal_attributes',
    severity: 'critical',
    metaPolicyClause: 'Meta cấm ám chỉ tình trạng nợ nần, phá sản hoặc tình hình tài chính tiêu cực.',
    impactOnAd: 'Vô hiệu hóa tài khoản quảng cáo (Ad Account Restriction).',
    impactOnReach: 'Gắn cờ nội dung nhạy cảm.',
    replacement: 'giải pháp tối ưu hóa dòng tiền',
  },
  {
    keyword: 'bạn bị trầm cảm',
    category: 'personal_attributes',
    severity: 'critical',
    metaPolicyClause: 'Cấm nhắm vào tình trạng bệnh lý hoặc sức khỏe tâm thần.',
    impactOnAd: 'Từ chối duyệt chiến dịch quảng cáo.',
    impactOnReach: 'Hạn chế phân phối.',
    replacement: 'nâng cao năng lượng tích cực mỗi ngày',
  },

  // 2. Before & After (Trước và sau)
  {
    keyword: 'trước và sau',
    category: 'before_after',
    severity: 'critical',
    metaPolicyClause: 'Chính sách Meta cấm hình ảnh và câu từ so sánh trước sau phi thực tế (Before/After claims).',
    impactOnAd: 'Từ chối quảng cáo, có thể dẫn đến khóa BM/Fanpage nếu tái phạm.',
    impactOnReach: 'Giảm đề xuất trên Instagram Explore và Facebook Feeds.',
    replacement: 'sự chuyển biến tích cực từng ngày',
  },
  {
    keyword: 'before after',
    category: 'before_after',
    severity: 'critical',
    metaPolicyClause: 'Từ khóa Before-After bị bot Meta AI quét tự động và gắn cờ vi phạm.',
    impactOnAd: 'Từ chối duyệt quảng cáo.',
    impactOnReach: 'Bị hạn chế tương tác tự nhiên.',
    replacement: 'hành trình thay đổi thực tế',
  },
  {
    keyword: 'sau 3 ngày',
    category: 'before_after',
    severity: 'high',
    metaPolicyClause: 'Hứa hẹn kết quả tức thì trong thời gian siêu ngắn bị xếp vào gian lận thương mại.',
    impactOnAd: 'Điểm chất lượng kém (Low Quality Ad), tăng giá CPM gấp đôi.',
    impactOnReach: 'Bị giảm ưu tiên trên newsfeed.',
    replacement: 'cảm nhận sự khác biệt theo từng giai đoạn',
  },

  // 3. Bẫy tương tác (Engagement Bait) - Giảm reach cực nặng
  {
    keyword: 'thả tim để nhận',
    category: 'engagement_bait',
    severity: 'high',
    metaPolicyClause: 'Chính sách Câu tương tác giả mạo: Meta chủ động phạt các bài viết ép người xem Like/Share để nhận quà.',
    impactOnAd: 'Không tối ưu được giá thầu, điểm tương tác bị đánh tụt.',
    impactOnReach: 'Giảm 75% phân phối Organic Reach trên Facebook & Instagram.',
    replacement: 'hãy để lại cảm nhận của bạn',
  },
  {
    keyword: 'comment để nhận quà',
    category: 'engagement_bait',
    severity: 'high',
    metaPolicyClause: 'Meta AI phát hiện bẫy bình luận (Comment Baiting).',
    impactOnAd: 'Tăng chi phí phân phối (High CPM penalty).',
    impactOnReach: 'Thuật toán Facebook chủ động ẩn bài viết khỏi bảng tin bạn bè.',
    replacement: 'kết nối cùng cộng đồng',
  },
  {
    keyword: 'chia sẻ ngay kẻo lỡ',
    category: 'engagement_bait',
    severity: 'medium',
    metaPolicyClause: 'Share-baiting: Kêu gọi chia sẻ giật gân.',
    impactOnAd: 'Đánh giá chất lượng nội dung dưới mức trung bình.',
    impactOnReach: 'Giảm phân phối đề xuất.',
    replacement: 'lưu lại thông tin hữu ích này',
  },
  {
    keyword: 'bình luận chấm',
    category: 'engagement_bait',
    severity: 'high',
    metaPolicyClause: 'Bẫy tương tác chấm (".") để nhận báo giá.',
    impactOnAd: 'Quảng cáo bị đánh giá trải nghiệm người dùng kém.',
    impactOnReach: 'Hệ thống hạ bậc xếp hạng bài viết.',
    replacement: 'nhắn tin trực tiếp để nhận tư vấn',
  },

  // 4. Cam kết phi thực tế & Tuyệt đối hóa (Unrealistic Claims)
  {
    keyword: 'cam kết 100%',
    category: 'unrealistic_claims',
    severity: 'critical',
    metaPolicyClause: 'Meta Ad Policy mục 4.8: Cấm tuyệt đối tuyên bố cam kết kết quả hoàn hảo 100%.',
    impactOnAd: 'Hủy phê duyệt quảng cáo (Disapproved).',
    impactOnReach: 'Bị gắn nhãn tuyên bố sai lệch (Misleading claims).',
    replacement: 'cam kết nỗ lực đồng hành cùng bạn',
  },
  {
    keyword: 'trị dứt điểm',
    category: 'unrealistic_claims',
    severity: 'critical',
    metaPolicyClause: 'Cam kết y tế/làm đẹp dứt điểm không được Meta cấp phép nếu không có giấy phép y tế quốc gia.',
    impactOnAd: 'Từ chối hiển thị vĩnh viễn.',
    impactOnReach: 'Nguy cơ hạn chế tính năng trang Fanpage.',
    replacement: 'hỗ trợ cải thiện rõ nét',
  },
  {
    keyword: 'chữa khỏi 100%',
    category: 'unrealistic_claims',
    severity: 'critical',
    metaPolicyClause: 'Vi phạm nghiêm trọng về tính trung thực y tế trong quảng cáo Meta.',
    impactOnAd: 'Khóa tài khoản quảng cáo.',
    impactOnReach: 'Ngăn chặn hiển thị.',
    replacement: 'giải pháp chăm sóc tích cực',
  },
  {
    keyword: 'làm giàu không khó',
    category: 'unrealistic_claims',
    severity: 'critical',
    metaPolicyClause: 'Chính sách Meta cấm các chương trình cơ hội làm giàu / kiếm tiền ảo.',
    impactOnAd: 'Từ chối quảng cáo do rủi ro tài chính.',
    impactOnReach: 'Chặn hiển thị trên Facebook/Instagram.',
    replacement: 'tích lũy kiến thức gia tăng giá trị',
  },
  {
    keyword: 'đầu tư bao lời',
    category: 'unrealistic_claims',
    severity: 'critical',
    metaPolicyClause: 'Meta cấm hứa hẹn tỷ suất hoàn vốn không có bảo chứng tài chính.',
    impactOnAd: 'Khóa quảng cáo ngay tức khắc.',
    impactOnReach: 'Cảnh báo lừa đảo tài chính.',
    replacement: 'kế hoạch đầu tư bài bản',
  },

  // 5. Thương hiệu & Bản quyền Meta (Meta Brand Guidelines)
  {
    keyword: 'tài khoản facebook tích xanh',
    category: 'meta_brand',
    severity: 'critical',
    metaPolicyClause: 'Meta cấm kinh doanh, mua bán huy hiệu tích xanh hoặc dịch vụ Meta trái phép.',
    impactOnAd: 'Xóa bài và khóa trang Fanpage.',
    impactOnReach: 'Đánh gậy vi phạm sở hữu trí tuệ Meta.',
    replacement: 'xây dựng thương hiệu uy tín chính thống',
  },
  {
    keyword: 'hack fb',
    category: 'meta_brand',
    severity: 'critical',
    metaPolicyClause: 'Xúi giục xâm nhập tài khoản mạng xã hội bất hợp pháp.',
    impactOnAd: 'Khóa tài khoản vĩnh viễn.',
    impactOnReach: 'Xóa bài ngay.',
    replacement: 'bảo mật tài khoản nâng cao',
  },
];

const META_CATEGORY_NAMES: Record<string, string> = {
  personal_attributes: 'Thuộc tính Cá nhân (Meta Clause 4.3)',
  before_after: 'So sánh Trước & Sau (Before/After)',
  engagement_bait: 'Bẫy tương tác (Engagement Bait)',
  unrealistic_claims: 'Cam kết phi thực tế (Unrealistic Claims)',
  meta_brand: 'Bản quyền Thương hiệu Meta',
};

/**
 * Quét nội dung bài viết theo tiêu chuẩn kiểm duyệt của Meta AI
 */
export function scanMetaAiPolicy(text: string): MetaAiScanResult {
  if (!text || text.trim() === '') {
    return {
      isCompliant: true,
      score: 100,
      adApprovalProbability: 100,
      organicReachStatus: 'optimal',
      violations: [],
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      metaSummary: 'Chưa có nội dung để Meta AI quét.',
    };
  }

  const lowerText = text.toLowerCase();
  const violations: MetaAiViolation[] = [];

  for (const rule of META_AI_RULES) {
    const lowerKeyword = rule.keyword.toLowerCase();
    let searchStart = 0;

    while (searchStart < lowerText.length) {
      const foundPos = lowerText.indexOf(lowerKeyword, searchStart);
      if (foundPos === -1) break;

      const foundEnd = foundPos + lowerKeyword.length;
      const originalSnippet = text.slice(foundPos, foundEnd);

      violations.push({
        id: `meta-v-${foundPos}-${rule.keyword}`,
        keyword: rule.keyword,
        foundText: originalSnippet,
        startIndex: foundPos,
        endIndex: foundEnd,
        category: rule.category,
        categoryLabel: META_CATEGORY_NAMES[rule.category] || 'Chính sách Meta',
        severity: rule.severity,
        metaPolicyClause: rule.metaPolicyClause,
        impactOnAd: rule.impactOnAd,
        impactOnReach: rule.impactOnReach,
        suggestedFix: rule.replacement,
      });

      searchStart = foundEnd;
    }
  }

  const criticalCount = violations.filter((v) => v.severity === 'critical').length;
  const highCount = violations.filter((v) => v.severity === 'high').length;
  const mediumCount = violations.filter((v) => v.severity === 'medium').length;

  // Tính điểm chất lượng Meta (0-100)
  let score = 100 - criticalCount * 35 - highCount * 20 - mediumCount * 8;
  if (score < 0) score = 0;

  // Xác suất duyệt chạy Ads của Meta
  let adApprovalProbability = 100 - criticalCount * 45 - highCount * 25 - mediumCount * 10;
  if (adApprovalProbability < 5) adApprovalProbability = 5;

  let organicReachStatus: 'optimal' | 'throttled' | 'severely_suppressed' = 'optimal';
  if (criticalCount > 0) {
    organicReachStatus = 'severely_suppressed';
  } else if (highCount > 0) {
    organicReachStatus = 'throttled';
  }

  let metaSummary = 'Nội dung đạt chuẩn Meta AI: Đủ điều kiện duyệt quảng cáo ngay & tối ưu phân phối Bảng tin.';
  if (criticalCount > 0) {
    metaSummary = `Meta AI cảnh báo đỏ: Phát hiện ${criticalCount} lỗi vi phạm chính sách nghiêm trọng! Nguy cơ từ chối Ads hoặc khóa Fanpage.`;
  } else if (highCount > 0) {
    metaSummary = `Lưu ý từ Meta AI: Có ${highCount} từ ngữ có thể bị phạt bẫy tương tác hoặc tăng chi phí CPM quảng cáo.`;
  }

  return {
    isCompliant: violations.length === 0,
    score,
    adApprovalProbability,
    organicReachStatus,
    violations,
    criticalCount,
    highCount,
    mediumCount,
    metaSummary,
  };
}

/**
 * Tự động sửa toàn bộ từ khóa theo chuẩn Meta AI
 */
export function fixMetaAiViolations(text: string, violations: MetaAiViolation[]): string {
  if (!text || violations.length === 0) return text;

  let fixed = text;
  const sorted = [...violations].sort((a, b) => b.keyword.length - a.keyword.length);

  for (const v of sorted) {
    const regex = new RegExp(v.keyword, 'gi');
    fixed = fixed.replace(regex, v.suggestedFix);
  }

  return fixed;
}

/**
 * Phân tích chuyên sâu bằng Meta AI (Gemini Flash đóng vai trò Meta Ad Policy Reviewer)
 */
export async function runMetaAiDeepAudit(content: string) {
  const localScan = scanMetaAiPolicy(content);

  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY);

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Bạn đóng vai trò là hệ thống Meta AI Content & Ad Review (Facebook & Instagram Advertising Standards).
Nhiệm vụ của bạn là kiểm duyệt khắt khe nội dung bài đăng/quảng cáo sau:
"""
${content}
"""

Tiêu chuẩn kiểm duyệt của Meta:
1. Thuộc tính cá nhân (Personal Attributes): Cấm hỏi hoặc ám chỉ khuyết điểm ngoại hình, bệnh tật, tài chính của người xem.
2. Trước/Sau (Before & After): Cấm cam kết phóng đại thời gian ngắn.
3. Bẫy tương tác (Engagement Bait): Cấm câu like/share/comment giả tạo.
4. Cam kết 100%: Cấm tuyệt đối.

Trả về duy nhất định dạng JSON:
{
  "metaQualityScore": number (0 đến 100),
  "adApprovalProbability": number (0 đến 100%),
  "reachProjection": "Tối ưu phân phối" hoặc "Bị bóp reach 50%" hoặc "Bị chặn quảng cáo",
  "auditSummary": "Nhận xét của Meta AI bằng tiếng Việt ngắn gọn, chuyên nghiệp",
  "metaAiRewrittenCopy": "Phiên bản viết lại tối ưu 100% chuẩn Meta Ads, hấp dẫn, giữ nguyên thông điệp nhưng duyệt ngay lần đầu",
  "tips": ["1 mẹo giúp giảm CPM hoặc tăng reach trên Facebook/Instagram"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return {
          metaQualityScore: parsed.metaQualityScore ?? localScan.score,
          adApprovalProbability: parsed.adApprovalProbability ?? localScan.adApprovalProbability,
          reachProjection: parsed.reachProjection ?? (localScan.isCompliant ? 'Tối ưu phân phối (Optimal)' : 'Bị hạn chế phân phối'),
          auditSummary: parsed.auditSummary || localScan.metaSummary,
          metaAiRewrittenCopy: parsed.metaAiRewrittenCopy || fixMetaAiViolations(content, localScan.violations),
          tips: parsed.tips || ['Nên sử dụng câu chuyện thương hiệu thay vì từ ngữ cam kết tuyệt đối.'],
        };
      }
    } catch (e) {
      console.warn('Meta AI Gemini call failed, using local Meta engine:', e);
    }
  }

  // Fallback engine
  const fixedText = fixMetaAiViolations(content, localScan.violations);
  return {
    metaQualityScore: localScan.score,
    adApprovalProbability: localScan.adApprovalProbability,
    reachProjection: localScan.isCompliant ? 'Tối ưu phân phối (Optimal)' : 'Bị hạn chế phân phối (Throttled)',
    auditSummary: localScan.metaSummary,
    metaAiRewrittenCopy: `${fixedText}\n\n👉 Nhắn tin ngay cho chúng mình để được hỗ trợ tận tâm nhất nhé!`,
    tips: [
      'Chính sách Meta đánh giá cao nội dung mang lại giá trị trải nghiệm thực tế thay vì kêu gọi thả tim/chia sẻ ép buộc.',
      'Tránh hỏi trực tiếp các câu "Bạn có bị..." để đảm bảo tuân thủ điều khoản Thuộc tính Cá nhân của Meta.',
    ],
  };
}
