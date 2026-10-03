/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScheduledPost, SocialAccount, PlatformId, BrandCluster } from './types';
import { INITIAL_POSTS, INITIAL_ACCOUNTS, INITIAL_BRANDS } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { CreatePostView } from './components/CreatePostView';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { ConnectChannelModal } from './components/ConnectChannelModal';
import { ManageBrandModal } from './components/ManageBrandModal';
import { Toast } from './components/Toast';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active channel switcher state ('all' or specific account id)
  const [activeChannelId, setActiveChannelId] = useState<string | 'all'>('all');

  // Active brand cluster filter state ('all' or specific brand id e.g. 'brand-mrex' | 'brand-zen')
  const [activeBrandId, setActiveBrandId] = useState<string | 'all'>('all');

  // Modal to connect a new channel / account
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Modal to manage brand clusters
  const [isManageBrandsOpen, setIsManageBrandsOpen] = useState(false);

  // Initialize brand clusters from localStorage or defaults
  const [brands, setBrands] = useState<BrandCluster[]>(() => {
    try {
      const saved = localStorage.getItem('omnisocial_brands');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_BRANDS;
  });

  // Initialize posts from localStorage or defaults
  const [posts, setPosts] = useState<ScheduledPost[]>(() => {
    try {
      const saved = localStorage.getItem('omnisocial_posts');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_POSTS;
  });

  // Initialize accounts from localStorage or defaults
  const [accounts, setAccounts] = useState<SocialAccount[]>(() => {
    try {
      const saved = localStorage.getItem('omnisocial_accounts');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_ACCOUNTS;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('omnisocial_brands', JSON.stringify(brands));
    } catch (e) {
      console.error(e);
    }
  }, [brands]);

  useEffect(() => {
    try {
      localStorage.setItem('omnisocial_posts', JSON.stringify(posts));
    } catch (e) {
      console.error(e);
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem('omnisocial_accounts', JSON.stringify(accounts));
    } catch (e) {
      console.error(e);
    }
  }, [accounts]);

  // Brand Cluster Management: Save / Add / Update
  const handleSaveBrand = (brandData: BrandCluster) => {
    setBrands((prev) => {
      const existsIndex = prev.findIndex((b) => b.id === brandData.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = brandData;
        return updated;
      }
      return [...prev, brandData];
    });
    setToastMessage(`Đã cập nhật cụm thương hiệu "${brandData.name}" thành công!`);
  };

  // Brand Cluster Management: Delete
  const handleDeleteBrand = (brandId: string) => {
    const targetBrand = brands.find((b) => b.id === brandId);
    setBrands((prev) => prev.filter((b) => b.id !== brandId));
    if (activeBrandId === brandId) {
      setActiveBrandId('all');
    }
    setToastMessage(`Đã xóa cụm thương hiệu "${targetBrand?.name || ''}".`);
  };

  // Create or Schedule Post Handler
  const handleSavePost = (
    newPostData: Omit<ScheduledPost, 'id' | 'createdAt'>,
    isPublishNow = false
  ) => {
    const newId = `post-${Date.now()}`;
    const newPost: ScheduledPost = {
      ...newPostData,
      id: newId,
      createdAt: new Date().toISOString(),
      ...(isPublishNow
        ? {
            likes: Math.floor(Math.random() * 200) + 50,
            comments: Math.floor(Math.random() * 20) + 5,
            shares: Math.floor(Math.random() * 15) + 2,
            views: Math.floor(Math.random() * 1200) + 300,
          }
        : {}),
    };

    setPosts((prev) => [newPost, ...prev]);

    if (isPublishNow) {
      const targetCount = newPost.targetAccountIds?.length || newPost.platforms.length;
      setToastMessage(
        `Đã xuất bản bài viết thành công lên ${targetCount} kênh truyền thông!`
      );
      setCurrentTab('calendar');
    } else if (newPost.status === 'draft') {
      setToastMessage('Đã lưu bản nháp bài viết thành công.');
      setCurrentTab('calendar');
    } else {
      setToastMessage(
        `Đã lên lịch phát sóng bài viết vào ${new Date(
          newPost.scheduledDate
        ).toLocaleString('vi-VN')}!`
      );
      setCurrentTab('calendar');
    }
  };

  // Delete Post Handler
  const handleDeletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setToastMessage('Đã xóa bài viết khỏi lịch trình.');
  };

  // Publish Scheduled Post Immediately
  const handlePublishNow = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'published',
              scheduledDate: new Date().toISOString(),
              likes: Math.floor(Math.random() * 300) + 80,
              comments: Math.floor(Math.random() * 30) + 10,
              shares: Math.floor(Math.random() * 20) + 5,
              views: Math.floor(Math.random() * 2000) + 500,
            }
          : p
      )
    );
    setToastMessage('Đã xuất bản bài viết ngay lập tức lên các kênh đã chọn!');
  };

  // Channel Management: Add Account / Link Channel
  const handleAddAccount = (newAccountData: Omit<SocialAccount, 'id'>) => {
    const newAccount: SocialAccount = {
      ...newAccountData,
      id: `acc-${Date.now()}`,
    };
    setAccounts((prev) => [...prev, newAccount]);
    setActiveChannelId(newAccount.id);
    setToastMessage(
      `Đã liên kết kênh "${newAccount.name}" (${newAccount.handle}) thành công!`
    );
  };

  // Channel Management: Batch Add Accounts
  const handleBatchAddAccounts = (newAccountsData: Array<Omit<SocialAccount, 'id'>>) => {
    const newAccounts: SocialAccount[] = newAccountsData.map((data, idx) => ({
      ...data,
      id: `acc-${Date.now()}-${idx}`,
    }));
    setAccounts((prev) => [...prev, ...newAccounts]);
    setToastMessage(`Đã liên kết hàng loạt ${newAccounts.length} kênh thành công!`);
  };

  // Channel Management: Delete Account
  const handleDeleteAccount = (id: string) => {
    const target = accounts.find((a) => a.id === id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    if (activeChannelId === id) {
      setActiveChannelId('all');
    }
    setToastMessage(`Đã hủy liên kết kênh "${target?.name || ''}".`);
  };

  // Channel Management: Update Account
  const handleUpdateAccount = (updated: SocialAccount) => {
    setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  // Toggle account connection
  const handleToggleAccount = (id: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          const nextState = !acc.connected;
          setToastMessage(
            nextState
              ? `Đã kích hoạt kết nối với ${acc.name}.`
              : `Đã tạm ngắt kết nối với ${acc.name}.`
          );
          return { ...acc, connected: nextState };
        }
        return acc;
      })
    );
  };

  // Filter posts by search query if any
  const displayedPosts = searchQuery.trim()
    ? posts.filter(
        (p) =>
          p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : posts;

  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* 1. Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        accounts={accounts}
        brands={brands}
        activeBrandId={activeBrandId}
        onSelectBrand={setActiveBrandId}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        scheduledCount={scheduledCount}
        activeChannelId={activeChannelId}
        onSelectChannel={setActiveChannelId}
        onOpenConnectChannel={() => setIsConnectModalOpen(true)}
        onOpenManageBrands={() => setIsManageBrandsOpen(true)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCreatePost={() => setCurrentTab('create')}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          accounts={accounts}
          brands={brands}
          activeBrandId={activeBrandId}
          onSelectBrand={setActiveBrandId}
          activeChannelId={activeChannelId}
          onSelectChannel={setActiveChannelId}
          onOpenConnectChannel={() => setIsConnectModalOpen(true)}
          onOpenManageBrands={() => setIsManageBrandsOpen(true)}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {/* Dashboard Tab */}
          {currentTab === 'dashboard' && (
            <DashboardOverview
              posts={displayedPosts}
              accounts={accounts}
              brands={brands}
              activeBrandId={activeBrandId}
              onSelectBrand={setActiveBrandId}
              activeChannelId={activeChannelId}
              onSelectChannel={setActiveChannelId}
              onOpenCreate={() => setCurrentTab('create')}
              onSelectTab={setCurrentTab}
              onPublishNow={handlePublishNow}
              onOpenConnectChannel={() => setIsConnectModalOpen(true)}
              onOpenManageBrands={() => setIsManageBrandsOpen(true)}
            />
          )}

          {/* Create Post Tab */}
          {currentTab === 'create' && (
            <CreatePostView
              accounts={accounts}
              brands={brands}
              activeBrandId={activeBrandId}
              onSavePost={handleSavePost}
              onCancel={() => setCurrentTab('dashboard')}
              onOpenConnectChannel={() => setIsConnectModalOpen(true)}
              onOpenManageBrands={() => setIsManageBrandsOpen(true)}
            />
          )}

          {/* Calendar / Scheduled Posts Tab */}
          {currentTab === 'calendar' && (
            <CalendarView
              posts={displayedPosts}
              accounts={accounts}
              brands={brands}
              activeBrandId={activeBrandId}
              onSelectBrand={setActiveBrandId}
              activeChannelId={activeChannelId}
              onSelectChannel={setActiveChannelId}
              onOpenCreate={() => setCurrentTab('create')}
              onDeletePost={handleDeletePost}
              onPublishNow={handlePublishNow}
            />
          )}

          {/* Analytics Tab */}
          {currentTab === 'analytics' && (
            <AnalyticsView accounts={accounts} posts={displayedPosts} />
          )}

          {/* Settings Tab */}
          {currentTab === 'settings' && (
            <SettingsView
              accounts={accounts}
              posts={posts}
              brands={brands}
              onToggleAccount={handleToggleAccount}
              onDeleteAccount={handleDeleteAccount}
              onUpdateAccount={handleUpdateAccount}
              onOpenConnectChannel={() => setIsConnectModalOpen(true)}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}
        </main>
      </div>

      {/* Modal: Connect New Channel / Account */}
      <ConnectChannelModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onAddAccount={handleAddAccount}
        onBatchAddAccounts={handleBatchAddAccounts}
        existingAccounts={accounts}
        brands={brands}
      />

      {/* Modal: Manage Brand Clusters */}
      <ManageBrandModal
        isOpen={isManageBrandsOpen}
        onClose={() => setIsManageBrandsOpen(false)}
        brands={brands}
        accounts={accounts}
        onSaveBrand={handleSaveBrand}
        onDeleteBrand={handleDeleteBrand}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
