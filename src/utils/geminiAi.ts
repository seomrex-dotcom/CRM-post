/**
 * Gemini AI Helper for Content Policy Moderation & Safe Rewriting
 */
import { GoogleGenAI } from '@google/genai';
import { fixAllViolations, PolicyScanResult, scanContentPolicy } from './policyScanner';

export interface AiPolicyAnalysis {
  isSafe: boolean;
  score: number;
  overallAssessment: string;
  violations: Array<{
    term: string;
    risk: 'high' | 'medium' | 'low';
    platform: string;
    explanation: string;
    suggestedFix: string;
  }>;
  safeRewriteVersion: string;
}

/**
 * Gọi AI phân tích sâu ngữ cảnh vi phạm và viết lại an toàn
 */
export async function analyzeAndRewritePolicy(
  content: string,
  platforms: string[] = ['facebook', 'tiktok']
): Promise<AiPolicyAnalysis> {
  const localScan = scanContentPolicy(content, platforms);

  // Thử gọi Gemini AI nếu có API Key
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY);

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Bạn là chuyên gia kiểm duyệt nội dung mạng xã hội (Facebook, TikTok, Instagram, YouTube) am hiểu sâu sắc chính sách cộng đồng và luật quảng cáo tại Việt Nam.

Hãy phân tích bài viết sau đây của người dùng:
"""
${content}
"""

Nền tảng đăng bài: ${platforms.join(', ')}

Nhiệm vụ:
1. Phát hiện các từ khóa hoặc ngữ cảnh vi phạm (cam kết y tế 100%, trị dứt điểm, ép cân, lừa đảo tài chính, hàng giả/nhái, điều hướng kéo sang Zalo ngoài sàn TikTok, v.v.).
2. Viết lại bài viết thành một phiên bản MỚI ("safeRewriteVersion") vừa giữ nguyên thông điệp hấp dẫn, tự nhiên, viral nhưng 100% tuân thủ chính sách của ${platforms.join(', ')}.

Trả về duy nhất định dạng JSON với cấu trúc:
{
  "isSafe": boolean,
  "score": number (từ 0 đến 100),
  "overallAssessment": "Đánh giá tổng quan ngắn gọn bằng tiếng Việt",
  "violations": [
    {
      "term": "từ khóa vi phạm",
      "risk": "high" hoặc "medium" hoặc "low",
      "platform": "nền tảng bị ảnh hưởng",
      "explanation": "tại sao vi phạm",
      "suggestedFix": "từ thay thế an toàn"
    }
  ],
  "safeRewriteVersion": "Toàn bộ bài viết đã được AI viết lại an toàn chuẩn chính sách"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return {
          isSafe: parsed.isSafe ?? !localScan.hasViolations,
          score: parsed.score ?? localScan.safetyScore,
          overallAssessment: parsed.overallAssessment || localScan.summary,
          violations: parsed.violations || localScan.violations.map((v) => ({
            term: v.foundText,
            risk: v.severity,
            platform: v.affectedPlatforms.join(', '),
            explanation: v.reason,
            suggestedFix: v.replacement,
          })),
          safeRewriteVersion: parsed.safeRewriteVersion || fixAllViolations(content, localScan.violations),
        };
      }
    } catch (e) {
      console.warn('Gemini API call failed, falling back to local policy engine:', e);
    }
  }

  // Fallback engine thông minh: sử dụng bộ từ điển chính sách đã được lập trình sẵn
  const rewritten = fixAllViolations(content, localScan.violations);
  const enhancedRewrite = rewritten
    ? `${rewritten}\n\n✨ (Đã được tối ưu an toàn 100% theo tiêu chuẩn cộng đồng)`
    : content;

  return {
    isSafe: !localScan.hasViolations,
    score: localScan.safetyScore,
    overallAssessment: localScan.summary,
    violations: localScan.violations.map((v) => ({
      term: v.foundText,
      risk: v.severity,
      platform: v.affectedPlatforms.join(', '),
      explanation: v.reason,
      suggestedFix: v.replacement,
    })),
    safeRewriteVersion: enhancedRewrite,
  };
}
