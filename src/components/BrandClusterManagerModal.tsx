import React, { useState } from 'react';
import { BrandCluster, SocialAccount, PlatformId } from '../types';
import { PLATFORM_INFO } from './SocialIcons';
import {
  X,
  Plus,
  Layers,
  Sparkles,
  Check,
  Trash2,
  Edit2,
  FolderPlus,
  CheckSquare,
  Square,
  Shield,
} from 'lucide-react';

interface BrandClusterManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: BrandCluster[];
  accounts: SocialAccount[];
  activeBrandId: string | 'all';
  onSelectBrand: (brandId: string | 'all') => void;
  onAddBrand: (brand: Omit<BrandCluster, 'id'>) => void;
  onUpdateBrand: (brand: BrandCluster) => void;
  onDeleteBrand: (brandId: string) => void;
}

export const BrandClusterManagerModal: React.FC<BrandClusterManagerModalProps> = ({
  isOpen,
  onClose,
  brands,
  accounts,
  activeBrandId,
  onSelectBrand,
  onAddBrand,
  onUpdateBrand,
  onDeleteBrand,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandCluster | null>(null);

  // New Brand Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#4F46E5');
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleChannelSelect = (channelId: string) => {
    setSelectedChannelIds((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId]
    );
  };

  const handleCreateBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên thương hiệu.');
      return;
    }
    if (selectedChannelIds.length === 0) {
      setError('Vui lòng chọn ít nhất 1 kênh thuộc cụm thương hiệu này.');
      return;
    }

    // Determine platforms included in this brand
    const brandAccounts = accounts.filter((a) => selectedChannelIds.includes(a.id));
    const platforms = Array.from(new Set(brandAccounts.map((a) => a.platform)));

    const logoLetters = name
      .trim()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    onAddBrand({
      name: name.trim(),
      code: name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: description.trim() || `Cụm thương hiệu ${name.trim()}`,
      color,
      bgLight: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      badgeColor: 'bg-indigo-600 text-white',
      logo: logoLetters || 'BR',
      platforms,
    });

    // Reset
    setName('');
    setDescription('');
    setSelectedChannelIds([]);
    setIsCreating(false);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 text-left animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Quản lý Cụm Thương Hiệu & Không Gian Kênh
              </h3>
              <p className="text-xs text-slate-500">
                Phân chia độc lập các kênh cho từng thương hiệu (ví dụ: Mrex chỉ có Fanpage & TikTok; Zen có Fanpage, Instagram, YouTube, TikTok)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Brand List View */}
        {!isCreating && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Các cụm thương hiệu hiện có ({brands.length}):
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(true);
                  setError(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm cụm thương hiệu</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-80 overflow-y-auto pr-1">
              {brands.map((brand) => {
                const brandChannels = accounts.filter((a) => a.brandId === brand.id);
                const isSelected = activeBrandId === brand.id;

                return (
                  <div
                    key={brand.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-400/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            style={{ backgroundColor: brand.color }}
                            className="w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0"
                          >
                            {brand.logo}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {brand.name}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {brandChannels.length} kênh truyền thông
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            Đang kích hoạt
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {brand.description}
                      </p>

                      {/* Channels inside this brand */}
                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">
                          Kênh trực thuộc:
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {brandChannels.map((ch) => {
                            const info = PLATFORM_INFO[ch.platform];
                            const Icon = info.icon;
                            return (
                              <span
                                key={ch.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[11px] text-slate-800 font-medium"
                                title={`${ch.name} (${ch.handle})`}
                              >
                                <span className={info.brandColor}>
                                  <Icon className="w-3 h-3" />
                                </span>
                                <span className="truncate max-w-[100px]">{ch.name}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-3 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectBrand(brand.id);
                          onClose();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Đang chọn thương hiệu này' : 'Chuyển sang thương hiệu này'}
                      </button>

                      {brands.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteBrand(brand.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Xóa cụm này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create Brand Cluster Form */}
        {isCreating && (
          <form onSubmit={handleCreateBrandSubmit} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Tạo Cụm Thương Hiệu Mới
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Quay lại danh sách
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tên Thương Hiệu (Ví dụ: Mrex, Zen, Lifestyle):
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Mrex"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Màu đại diện thương hiệu:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-9 h-8 p-0.5 rounded border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Mô tả cụm thương hiệu:
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Cụm kênh chuyên mảng công nghệ số và lập trình của Mrex"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden"
              />
            </div>

            {/* Select existing channels to assign to this brand */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Chọn các Kênh thuộc Cụm thương hiệu này:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                {accounts.map((acc) => {
                  const isChecked = selectedChannelIds.includes(acc.id);
                  const info = PLATFORM_INFO[acc.platform];
                  const Icon = info.icon;

                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleToggleChannelSelect(acc.id)}
                      className={`cursor-pointer p-2 rounded-lg border flex items-center justify-between gap-2 transition-all ${
                        isChecked
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        <div className="truncate text-left min-w-0">
                          <div className="text-xs truncate">{acc.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {acc.handle}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={info.brandColor}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
              >
                Tạo Cụm Thương Hiệu Ngay
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
