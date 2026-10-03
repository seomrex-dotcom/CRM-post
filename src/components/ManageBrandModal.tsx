import React, { useState } from 'react';
import { BrandCluster, PlatformId, SocialAccount } from '../types';
import { PLATFORM_INFO } from './SocialIcons';
import { X, Layers, Check, Plus, Trash2, Edit3, ShieldAlert } from 'lucide-react';

interface ManageBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: BrandCluster[];
  accounts: SocialAccount[];
  onSaveBrand: (brand: BrandCluster) => void;
  onDeleteBrand?: (brandId: string) => void;
}

const PRESET_COLORS = [
  {
    name: 'Tím Indigo (Mrex)',
    color: '#4F46E5',
    bgLight: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    badgeColor: 'bg-indigo-600 text-white',
  },
  {
    name: 'Xanh Ngọc Emerald (Zen)',
    color: '#059669',
    bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    badgeColor: 'bg-emerald-600 text-white',
  },
  {
    name: 'Xanh Dương Blue (TechLife)',
    color: '#2563EB',
    bgLight: 'bg-blue-50 border-blue-200 text-blue-700',
    badgeColor: 'bg-blue-600 text-white',
  },
  {
    name: 'Hồng Rose',
    color: '#E11D48',
    bgLight: 'bg-rose-50 border-rose-200 text-rose-700',
    badgeColor: 'bg-rose-600 text-white',
  },
  {
    name: 'Tím Purple',
    color: '#9333EA',
    bgLight: 'bg-purple-50 border-purple-200 text-purple-700',
    badgeColor: 'bg-purple-600 text-white',
  },
  {
    name: 'Hổ phách Amber',
    color: '#D97706',
    bgLight: 'bg-amber-50 border-amber-200 text-amber-700',
    badgeColor: 'bg-amber-600 text-white',
  },
];

export const ManageBrandModal: React.FC<ManageBrandModalProps> = ({
  isOpen,
  onClose,
  brands,
  accounts,
  onSaveBrand,
  onDeleteBrand,
}) => {
  const [editingBrand, setEditingBrand] = useState<BrandCluster | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);

  // Form states
  const [brandName, setBrandName] = useState('');
  const [brandCode, setBrandCode] = useState('');
  const [brandDesc, setBrandDesc] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(['facebook', 'tiktok']);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setEditingBrand(null);
    setBrandName('');
    setBrandCode('');
    setBrandDesc('');
    setSelectedPlatforms(['facebook', 'tiktok']);
    setSelectedColorIdx(3);
    setFormError(null);
  };

  const handleStartEdit = (b: BrandCluster) => {
    setEditingBrand(b);
    setIsCreatingNew(false);
    setBrandName(b.name);
    setBrandCode(b.code);
    setBrandDesc(b.description || '');
    setSelectedPlatforms([...b.platforms]);
    const foundIdx = PRESET_COLORS.findIndex((c) => c.color.toLowerCase() === b.color.toLowerCase());
    setSelectedColorIdx(foundIdx >= 0 ? foundIdx : 0);
    setFormError(null);
  };

  const handleTogglePlatform = (p: PlatformId) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(p)) {
        if (prev.length <= 1) {
          setFormError('Mỗi cụm thương hiệu cần có ít nhất 1 nền tảng!');
          return prev;
        }
        setFormError(null);
        return prev.filter((item) => item !== p);
      } else {
        setFormError(null);
        return [...prev, p];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      setFormError('Vui lòng nhập tên cụm thương hiệu!');
      return;
    }
    if (selectedPlatforms.length === 0) {
      setFormError('Vui lòng chọn ít nhất 1 nền tảng cho thương hiệu!');
      return;
    }

    const colorConfig = PRESET_COLORS[selectedColorIdx];
    const logoLetters = brandName
      .trim()
      .split(' ')
      .slice(-2)
      .map((w) => w[0]?.toUpperCase())
      .join('')
      .slice(0, 2) || 'BR';

    const brandPayload: BrandCluster = {
      id: editingBrand ? editingBrand.id : `brand-${Date.now()}`,
      name: brandName.trim(),
      code: brandCode.trim() || brandName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      description: brandDesc.trim(),
      color: colorConfig.color,
      bgLight: colorConfig.bgLight,
      badgeColor: colorConfig.badgeColor,
      logo: logoLetters,
      platforms: selectedPlatforms,
    };

    onSaveBrand(brandPayload);
    setIsCreatingNew(false);
    setEditingBrand(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 text-left">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Phân chia & Quản lý Cụm Thương hiệu (Brand Clusters)
              </h2>
              <p className="text-xs text-slate-600">
                Tách biệt các nhóm kênh của từng thương hiệu (ví dụ Mrex chỉ gồm Fanpage + TikTok; Zen gồm 4 kênh)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* List of Current Brand Clusters */}
          {!isCreatingNew && !editingBrand && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Danh sách Cụm Thương hiệu Hiện Có ({brands.length})
                </span>
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm cụm thương hiệu mới</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {brands.map((brand) => {
                  const brandAccounts = accounts.filter((a) => a.brandId === brand.id);

                  return (
                    <div
                      key={brand.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm shadow-xs ${brand.badgeColor}`}
                          >
                            {brand.logo}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{brand.name}</h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${brand.bgLight}`}
                              >
                                Mã: {brand.code}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">{brand.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(brand)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-medium inline-flex items-center gap-1"
                            title="Chỉnh sửa cấu hình cụm này"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>
                          {brands.length > 1 && onDeleteBrand && (
                            deletingBrandId === brand.id ? (
                              <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg animate-in fade-in duration-150">
                                <span className="text-[10px] text-rose-700 font-bold">Xóa?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteBrand(brand.id);
                                    setDeletingBrandId(null);
                                  }}
                                  className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors"
                                >
                                  Xóa
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingBrandId(null)}
                                  className="px-1 py-0.5 text-[10px] text-slate-500 hover:text-slate-800 rounded"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeletingBrandId(brand.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Xóa cụm"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {/* Platforms configured for this brand */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-semibold text-slate-600">
                            Nền tảng được phép:
                          </span>
                          {brand.platforms.map((plat) => {
                            const pinfo = PLATFORM_INFO[plat];
                            const PIcon = pinfo.icon;
                            return (
                              <span
                                key={plat}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${pinfo.badgeBg}`}
                              >
                                <PIcon className="w-3 h-3" />
                                <span>{pinfo.tagLabel}</span>
                              </span>
                            );
                          })}
                        </div>

                        <div className="text-[11px] text-slate-600 font-mono">
                          {brandAccounts.length} kênh đã gán
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Create / Edit */}
          {(isCreatingNew || editingBrand) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingBrand ? `Chỉnh sửa Cụm: ${editingBrand.name}` : 'Tạo Cụm Thương hiệu Mới'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingBrand(null);
                  }}
                  className="text-xs text-slate-600 hover:text-slate-800"
                >
                  ← Quay lại danh sách
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Tên Cụm Thương hiệu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="ví dụ: Thương hiệu Mrex, Thương hiệu Zen"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Mã định danh (Code)
                  </label>
                  <input
                    type="text"
                    value={brandCode}
                    onChange={(e) => setBrandCode(e.target.value)}
                    placeholder="ví dụ: mrex, zen, vibe"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Mô tả / Định vị thương hiệu
                </label>
                <input
                  type="text"
                  value={brandDesc}
                  onChange={(e) => setBrandDesc(e.target.value)}
                  placeholder="ví dụ: Thương hiệu Công nghệ & Sáng tạo Số (chỉ gồm Fanpage & TikTok)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Nền tảng được phép cho Cụm */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>
                    Nền tảng mạng xã hội thuộc cụm này <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-600">
                    (Ví dụ Mrex chỉ tick Facebook + TikTok)
                  </span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['facebook', 'instagram', 'tiktok', 'youtube'] as PlatformId[]).map((p) => {
                    const info = PLATFORM_INFO[p];
                    const Icon = info.icon;
                    const isChecked = selectedPlatforms.includes(p);

                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleTogglePlatform(p)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                          isChecked
                            ? `${info.borderColor} ${info.accentBg} ring-1 ${info.brandColor} shadow-2xs`
                            : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isChecked ? info.brandColor : 'text-slate-600'}`} />
                        <span className="text-xs font-bold">{info.tagLabel}</span>
                        <span className="text-[10px] text-slate-600">
                          {isChecked ? '✓ Đang kích hoạt' : '+ Bấm để thêm'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Màu sắc nhận diện */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800">
                  Màu sắc & Nhãn nhận diện cụm
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_COLORS.map((c, idx) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColorIdx(idx)}
                      className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                        selectedColorIdx === idx
                          ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full shadow-xs"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-[10px] text-slate-600 truncate max-w-full">
                        {c.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingBrand(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingBrand ? 'Lưu thay đổi' : 'Tạo cụm thương hiệu'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
