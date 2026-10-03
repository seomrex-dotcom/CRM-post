/**
 * Policy Scanner & Keyword Moderation Utility
 * Phân tích và phát hiện từ khóa vi phạm tiêu chuẩn cộng đồng và chính sách quảng cáo
 * của Facebook Fanpage, TikTok, Instagram và YouTube.
 */

export type ViolationSeverity = 'high' | 'medium' | 'low';

export type PlatformTarget = 'all' | 'facebook' | 'tiktok' | 'instagram' | 'youtube';

export interface KeywordRule {
  keyword: string;
  category: 'medical' | 'financial' | 'counterfeit' | 'redirect' | 'sensitive';
  platforms: PlatformTarget[];
  severity: ViolationSeverity;
  reason: string;
  replacement: string;
}

export interface ViolationMatch {
  id: string;
  keyword: string;
  foundText: string;
  startIndex: number;
  endIndex: number;
  category: string;
  categoryName: string;
  severity: ViolationSeverity;
  affectedPlatforms: string[];
  reason: string;
  replacement: string;
}

export interface PolicyScanResult {
  hasViolations: boolean;
  violations: ViolationMatch[];
  highCount: number;
  mediumCount: number;
  lowCount: number;
  safetyScore: number; // 0 - 100
  summary: string;
}

// Master list of Vietnamese prohibited / restricted keywords across social platforms
export const POLICY_RULES: KeywordRule[] = [
  // 1. Cam kết y tế / thần thánh hóa sản phẩm (Facebook & TikTok Ads / Community)
  {
    keyword: 'chữa khỏi 100%',
    category: 'medical',
    platforms: ['facebook', 'tiktok', 'instagram'],
    severity: 'high',
    reason: 'Facebook & TikTok cấm tuyệt đối cam kết kết quả y tế 100%, dễ bị xóa bài hoặc cấm quảng cáo vĩnh viễn.',
    replacement: 'hỗ trợ cải thiện rõ rệt',
  },
  {
    keyword: 'trị dứt điểm',
    category: 'medical',
    platforms: ['facebook', 'tiktok'],
    severity: 'high',
    reason: 'Từ ngữ cam kết dứt điểm vi phạm chính sách nội dung y tế và thực phẩm chức năng.',
    replacement: 'giải pháp chăm sóc chuyên sâu',
  },
  {
    keyword: 'cam kết khỏi bệnh',
    category: 'medical',
    platforms: ['facebook', 'tiktok', 'instagram', 'youtube'],
    severity: 'high',
    reason: 'Vi phạm nghiêm trọng quy chuẩn cộng đồng về tuyên bố y khoa chưa được kiểm chứng.',
    replacement: 'hỗ trợ quá trình phục hồi',
  },
  {
    keyword: 'thần dược',
    category: 'medical',
    platforms: ['facebook', 'tiktok'],
    severity: 'high',
    reason: 'Từ ngữ phóng đại, thần thánh hóa sản phẩm bị hệ thống kiểm duyệt Meta & TikTok gắn cờ cảnh báo.',
    replacement: 'bí quyết dưỡng chất quý',
  },
  {
    keyword: 'giảm cân cấp tốc',
    category: 'medical',
    platforms: ['facebook', 'tiktok', 'instagram'],
    severity: 'high',
    reason: 'Chính sách bảo vệ sức khỏe của TikTok & Instagram cấm nội dung ép cân, giảm cân tiêu cực.',
    replacement: 'lộ trình giữ dáng an toàn',
  },
  {
    keyword: 'giảm 10kg',
    category: 'medical',
    platforms: ['facebook', 'instagram', 'tiktok'],
    severity: 'medium',
    reason: 'Tuyên bố số đo cụ thể không có căn cứ lâm sàng dễ bị bóp reach.',
    replacement: 'cải thiện vóc dáng thon gọn',
  },
  {
    keyword: 'tuyệt đối không tái phát',
    category: 'medical',
    platforms: ['facebook', 'tiktok'],
    severity: 'high',
    reason: 'Cam kết tuyệt đối trong điều trị là hành vi bị cấm trong quảng cáo trực tuyến.',
    replacement: 'duy trì hiệu quả bền vững',
  },
  {
    keyword: 'trắng da cấp tốc',
    category: 'medical',
    platforms: ['facebook', 'tiktok', 'instagram'],
    severity: 'medium',
    reason: 'Thuộc danh mục cảnh báo hóa chất lột tẩy gây hại cho da.',
    replacement: 'dưỡng da sáng khỏe tự nhiên',
  },
  {
    keyword: 'bác sĩ khuyên dùng',
    category: 'medical',
    platforms: ['facebook', 'tiktok'],
    severity: 'medium',
    reason: 'Sử dụng hình ảnh bác sĩ / y tế mà không có giấy phép chứng nhận dễ bị AI quét quét bản quyền y tế.',
    replacement: 'được nhiều chuyên gia tin cậy',
  },

  // 2. Tài chính ảo / Lừa đảo / Kiếm tiền phi thực tế
  {
    keyword: 'làm giàu không khó',
    category: 'financial',
    platforms: ['facebook', 'tiktok', 'youtube'],
    severity: 'high',
    reason: 'Bị hệ thống chống lừa đảo phân loại là mô hình đa cấp, kiếm tiền ảo.',
    replacement: 'chiến lược gia tăng thu nhập bền vững',
  },
  {
    keyword: 'cam kết lợi nhuận',
    category: 'financial',
    platforms: ['facebook', 'tiktok', 'youtube'],
    severity: 'high',
    reason: 'Facebook & YouTube cấm cam kết tỷ suất lợi nhuận tài chính không có giấy phép ngân hàng.',
    replacement: 'tiềm năng sinh lời hấp dẫn',
  },
  {
    keyword: 'đầu tư bao lời',
    category: 'financial',
    platforms: ['facebook', 'tiktok', 'youtube'],
    severity: 'high',
    reason: 'Từ khóa lừa đảo tài chính (Financial scam), nguy cơ khóa tài khoản ngay.',
    replacement: 'cơ hội đầu tư giàu tiềm năng',
  },
  {
    keyword: 'kiếm tiền online không cần vốn',
    category: 'financial',
    platforms: ['tiktok', 'facebook'],
    severity: 'medium',
    reason: 'Dễ bị thuật toán TikTok đánh dấu là spam nội dung kiếm tiền giả mạo.',
    replacement: 'cách khởi nghiệp từ kỹ năng cá nhân',
  },
  {
    keyword: 'vay tiền nóng',
    category: 'financial',
    platforms: ['facebook', 'tiktok'],
    severity: 'high',
    reason: 'Dịch vụ tín dụng đen bị cấm tuyệt đối trên tất cả mạng xã hội.',
    replacement: 'giải pháp tài chính linh hoạt',
  },
  {
    keyword: 'bao nợ xấu',
    category: 'financial',
    platforms: ['facebook', 'tiktok'],
    severity: 'high',
    reason: 'Quảng cáo nợ xấu vi phạm pháp luật và tiêu chuẩn cộng đồng.',
    replacement: 'hỗ trợ thẩm định hồ sơ',
  },
  {
    keyword: 'rút tiền mặt thẻ tín dụng',
    category: 'financial',
    platforms: ['facebook'],
    severity: 'high',
    reason: 'Dịch vụ đáo hạn / rút tiền mặt bị Meta cấm hoàn toàn.',
    replacement: 'quản lý chi tiêu thẻ thông minh',
  },

  // 3. Bản quyền / Hàng giả / Nhái nhãn hiệu
  {
    keyword: 'hàng fake',
    category: 'counterfeit',
    platforms: ['facebook', 'tiktok', 'instagram', 'youtube'],
    severity: 'high',
    reason: 'Vi phạm bản quyền thương hiệu, đối tác bản quyền quét sẽ gỡ bài hoặc phạt gậy.',
    replacement: 'sản phẩm thiết kế xu hướng',
  },
  {
    keyword: 'replica',
    category: 'counterfeit',
    platforms: ['facebook', 'tiktok', 'instagram'],
    severity: 'high',
    reason: 'Từ khóa sao chép thương hiệu bị bot Meta và TikTok tự động chặn.',
    replacement: 'phiên bản lấy cảm hứng',
  },
  {
    keyword: 'hàng rep 1:1',
    category: 'counterfeit',
    platforms: ['facebook', 'tiktok', 'instagram'],
    severity: 'high',
    reason: 'Vi phạm sở hữu trí tuệ, dễ bị khóa giỏ hàng TikTok Shop hoặc Fanpage.',
    replacement: 'chất lượng gia công sắc nét',
  },
  {
    keyword: 'tuồn auth',
    category: 'counterfeit',
    platforms: ['facebook', 'tiktok'],
    severity: 'medium',
    reason: 'Từ ngữ hàng tuồn không rõ nguồn gốc, dễ bị quét vi phạm hàng hóa.',
    replacement: 'sản phẩm nhập khẩu chính hãng',
  },
  {
    keyword: 'super fake',
    category: 'counterfeit',
    platforms: ['facebook', 'tiktok', 'instagram'],
    severity: 'high',
    reason: 'Trực tiếp thừa nhận kinh doanh hàng giả nhái.',
    replacement: 'dòng sản phẩm chất lượng cao',
  },

  // 4. Điều hướng ngoài nền tảng (Đặc biệt nghiêm ngặt trên TikTok)
  {
    keyword: 'inbox zalo',
    category: 'redirect',
    platforms: ['tiktok', 'youtube'],
    severity: 'high',
    reason: 'TikTok quét rất gắt việc điều hướng người dùng sang Zalo, video sẽ bị bóp reach 0 view hoặc tắt tính năng bình luận.',
    replacement: 'nhắn tin trực tiếp qua trang',
  },
  {
    keyword: 'add zalo',
    category: 'redirect',
    platforms: ['tiktok'],
    severity: 'high',
    reason: 'TikTok phạt nặng hành vi lôi kéo người dùng rời khỏi ứng dụng.',
    replacement: 'kết nối qua tin nhắn riêng',
  },
  {
    keyword: 'qua zalo',
    category: 'redirect',
    platforms: ['tiktok'],
    severity: 'high',
    reason: 'Từ khóa dẫn luồng ngoại sàn bị TikTok cấm trong caption và bình luận.',
    replacement: 'liên hệ ở phần tin nhắn',
  },
  {
    keyword: 'qua phở bò',
    category: 'redirect',
    platforms: ['tiktok'],
    severity: 'medium',
    reason: 'Từ lóng né kiểm duyệt (phở bò = Facebook) vẫn bị AI TikTok phát hiện điều hướng.',
    replacement: 'theo dõi thêm trên các kênh chính thức',
  },
  {
    keyword: 'chuyển khoản cọc',
    category: 'redirect',
    platforms: ['tiktok', 'facebook'],
    severity: 'medium',
    reason: 'Dễ bị đánh dấu lừa đảo thanh toán ngoài hệ thống thương mại điện tử.',
    replacement: 'đặt hàng bảo đảm qua giỏ hàng',
  },

  // 5. Nội dung nhạy cảm / Kích động / Bạo lực
  {
    keyword: 'đánh ghen',
    category: 'sensitive',
    platforms: ['facebook', 'tiktok', 'youtube'],
    severity: 'high',
    reason: 'Vi phạm chính sách bạo lực và quấy rối đời tư.',
    replacement: 'mâu thuẫn tình cảm',
  },
  {
    keyword: 'lộ clip',
    category: 'sensitive',
    platforms: ['facebook', 'tiktok', 'youtube', 'instagram'],
    severity: 'high',
    reason: 'Gợi ý nội dung 18+ / xâm phạm quyền riêng tư, bài viết sẽ bị xóa ngay.',
    replacement: 'khoảnh khắc hậu trường đặc biệt',
  },
  {
    keyword: 'khiêu dâm',
    category: 'sensitive',
    platforms: ['facebook', 'tiktok', 'youtube', 'instagram'],
    severity: 'high',
    reason: 'Vi phạm chính sách nội dung người lớn.',
    replacement: 'nội dung tế nhị',
  },
];

const CATEGORY_NAMES: Record<string, string> = {
  medical: 'Y tế & Cam kết thái quá',
  financial: 'Tài chính & Kiếm tiền ảo',
  counterfeit: 'Hàng giả & Nhái thương hiệu',
  redirect: 'Điều hướng ngoài nền tảng',
  sensitive: 'Nhạy cảm & Tiêu cực',
};

/**
 * Quét nội dung văn bản để tìm từ khóa vi phạm
 */
export function scanContentPolicy(
  text: string,
  selectedPlatforms: string[] = ['facebook', 'tiktok']
): PolicyScanResult {
  if (!text || text.trim() === '') {
    return {
      hasViolations: false,
      violations: [],
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      safetyScore: 100,
      summary: 'Nội dung chưa có văn bản để quét.',
    };
  }

  const lowerText = text.toLowerCase();
  const violations: ViolationMatch[] = [];

  for (const rule of POLICY_RULES) {
    // Check if rule applies to currently selected platforms
    const appliesToPlatform =
      rule.platforms.includes('all') ||
      rule.platforms.some((p) => selectedPlatforms.includes(p));

    if (!appliesToPlatform) continue;

    const lowerKeyword = rule.keyword.toLowerCase();
    let searchStart = 0;

    while (searchStart < lowerText.length) {
      const foundPos = lowerText.indexOf(lowerKeyword, searchStart);
      if (foundPos === -1) break;

      const foundEnd = foundPos + lowerKeyword.length;
      const originalSnippet = text.slice(foundPos, foundEnd);

      violations.push({
        id: `v-${foundPos}-${rule.keyword}`,
        keyword: rule.keyword,
        foundText: originalSnippet,
        startIndex: foundPos,
        endIndex: foundEnd,
        category: rule.category,
        categoryName: CATEGORY_NAMES[rule.category] || 'Chính sách nội dung',
        severity: rule.severity,
        affectedPlatforms: rule.platforms.map((p) => p.toUpperCase()),
        reason: rule.reason,
        replacement: rule.replacement,
      });

      searchStart = foundEnd;
    }
  }

  const highCount = violations.filter((v) => v.severity === 'high').length;
  const mediumCount = violations.filter((v) => v.severity === 'medium').length;
  const lowCount = violations.filter((v) => v.severity === 'low').length;

  // Tính điểm an toàn 0-100
  let safetyScore = 100 - highCount * 30 - mediumCount * 15 - lowCount * 5;
  if (safetyScore < 0) safetyScore = 0;

  let summary = 'Nội dung an toàn, không phát hiện từ khóa vi phạm chính sách.';
  if (highCount > 0) {
    summary = `Cảnh báo cao: Phát hiện ${highCount} từ khóa có nguy cơ bị khóa tài khoản hoặc xóa bài đăng!`;
  } else if (mediumCount > 0) {
    summary = `Lưu ý: Có ${mediumCount} từ khóa có thể bị giảm tương tác (shadowban) hoặc từ chối quảng cáo.`;
  }

  return {
    hasViolations: violations.length > 0,
    violations,
    highCount,
    mediumCount,
    lowCount,
    safetyScore,
    summary,
  };
}

/**
 * Tự động thay thế từ khóa vi phạm bằng từ ngữ an toàn
 */
export function fixAllViolations(text: string, violations: ViolationMatch[]): string {
  if (!text || violations.length === 0) return text;

  let fixed = text;
  // Sắp xếp từ dài nhất đến ngắn nhất để tránh đè chéo
  const sorted = [...violations].sort((a, b) => b.keyword.length - a.keyword.length);

  for (const v of sorted) {
    const regex = new RegExp(v.keyword, 'gi');
    fixed = fixed.replace(regex, v.replacement);
  }

  return fixed;
}
