import React, { useState } from 'react';
import { SocialAccount } from '../types';
import { PLATFORM_INFO } from './SocialIcons';
import {
  Trash2,
  AlertTriangle,
  X,
  ShieldAlert,
  PowerOff,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface DeleteChannelModalProps {
  isOpen: boolean;
  account: SocialAccount | null;
  scheduledPostsCount?: number;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
  onToggleDisconnect?: (id: string) => void;
}

export const DeleteChannelModal: React.FC<DeleteChannelModalProps> = ({
  isOpen,
  account,
  scheduledPostsCount = 0,
  onClose,
  onConfirmDelete,
  onToggleDisconnect,
}) => {
  const [deleteMode, setDeleteMode] = useState<'permanent' | 'disconnect'>('permanent');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !account) return null;

  const info = PLATFORM_INFO[account.platform];
  const Icon = info.icon;

  const handleAction = () => {
    setIsDeleting(true);
    setTimeout(() => {
      if (deleteMode === 'disconnect' && onToggleDisconnect) {
        onToggleDisconnect(account.id);
      } else {
        onConfirmDelete(account.id);
      }
      setIsDeleting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-left space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/60">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Xác nhận xoá / Hủy liên kết Kênh
              </h3>
              <p className="text-[11px] text-slate-500">
                Hành động quản trị trên kênh mạng xã hội đã kết nối
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channel Preview Card */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={account.avatar}
              alt={account.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
            />
            <div
              className={`absolute -bottom-1 -right-1 p-0.5 rounded-md bg-white shadow-xs ${info.brandColor}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-slate-900 truncate">
                {account.name}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${info.badgeBg}`}>
                {info.tagLabel}
              </span>
            </div>
            <div className="text-xs font-mono text-slate-500 truncate mt-0.5">
              {account.handle} · {account.followers.toLocaleString()} người theo dõi
            </div>
            {account.group && (
              <div className="text-[10px] text-slate-500 mt-0.5">
                Nhóm: <span className="font-semibold text-slate-700">{account.group}</span>
              </div>
            )}
          </div>
        </div>

        {/* Warning notification */}
        <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-xs text-rose-950 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Lưu ý quan trọng trước khi gỡ kênh:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-900/90 pl-1">
            <li>
              Hệ thống sẽ <strong>ngắt kết nối Token truy cập API</strong> của kênh này.
            </li>
            {scheduledPostsCount > 0 ? (
              <li>
                Hiện có <strong className="text-rose-700">{scheduledPostsCount} bài viết</strong> đang lên lịch phát sóng cho kênh này sẽ không thể tự động xuất bản.
              </li>
            ) : (
              <li>Kênh không có bài viết nào đang trong hàng đợi lên lịch.</li>
            )}
            <li>Báo cáo hiệu quả & phân tích tương tác trong quá khứ vẫn được lưu giữ.</li>
          </ul>
        </div>

        {/* Action Choice: Disconnect vs Permanent Delete */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Chọn phương án xử lý:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDeleteMode('permanent')}
              className={`p-3 rounded-xl border text-left transition-all ${
                deleteMode === 'permanent'
                  ? 'border-rose-400 bg-rose-50/60 ring-1 ring-rose-300'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-0.5">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xoá vĩnh viễn</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Gỡ hoàn toàn kênh khỏi danh sách quản lý OmniSocial.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setDeleteMode('disconnect')}
              className={`p-3 rounded-xl border text-left transition-all ${
                deleteMode === 'disconnect'
                  ? 'border-blue-400 bg-blue-50/60 ring-1 ring-blue-300'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 mb-0.5">
                <PowerOff className="w-3.5 h-3.5" />
                <span>Tạm ngắt kết nối</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Giữ kênh trong danh sách nhưng tạm dừng xuất bản bài tự động.
              </p>
            </button>
          </div>
        </div>

        {/* Modal footer buttons */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleAction}
            disabled={isDeleting}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all ${
              deleteMode === 'permanent'
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            } disabled:opacity-50`}
          >
            {isDeleting ? (
              <span>Đang xử lý...</span>
            ) : deleteMode === 'permanent' ? (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác nhận xoá kênh</span>
              </>
            ) : (
              <>
                <PowerOff className="w-3.5 h-3.5" />
                <span>Tạm ngắt kết nối</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
