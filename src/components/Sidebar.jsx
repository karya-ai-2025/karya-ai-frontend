'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Home,
  Sparkles,
  MessageCircle,
  Users,
  Handshake,
  Store,
  BookOpen,
  Target,
  TrendingUp,
  Package,
  MessageSquare,
  Palette,
  Layers,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navigationItems = [
  { id: 'home', label: 'Home', icon: Home, href: '/business-dashboard' },
  { id: 'my-projects', label: 'My Projects', icon: Package, href: '/business-dashboard' },
  { id: 'karya-ai', label: 'Karya AI', icon: Sparkles, href: '/business-dashboard/karya-ai' },
  { id: 'messages', label: 'Messages', icon: MessageCircle, href: '/business-dashboard/messages' },
];

const teamSection = [
  { id: 'my-experts', label: 'My Experts', icon: Users, href: '/business-dashboard/experts' },
  { id: 'intros', label: 'Intros', icon: Handshake, href: '/business-dashboard/intros' },
  { id: 'marketplace', label: 'Marketplace', icon: Store, href: '/business-dashboard/marketplace' },
];

const knowledgeSection = [
  { id: 'library', label: 'Library', icon: BookOpen, href: '/business-dashboard/library' },
  { id: 'icps', label: 'ICPs', icon: Target, href: '/business-dashboard/icps' },
  { id: 'marketing-plan', label: 'Marketing Plan', icon: TrendingUp, href: '/business-dashboard/marketing-plan' },
  { id: 'products', label: 'Products', icon: Package, href: '/business-dashboard/products' },
  { id: 'saved-convos', label: 'Saved AI Convos', icon: MessageSquare, href: '/business-dashboard/saved-convos' },
];

const additionalSection = [
  { id: 'brand-core', label: 'Brand Core', icon: Palette, href: '/business-dashboard/brand-core' },
  { id: 'stack', label: 'Stack', icon: Layers, href: '/business-dashboard/stack' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

const NavItem = ({ item, section = 'main', isActive, onClick, sidebarCollapsed }) => {
  const Icon = item.icon;

  return (
    <button
      onClick={() => onClick(item.id, item.href)}
      className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } ${sidebarCollapsed ? 'justify-center' : ''}`}
    >
      <Icon className={`shrink-0 ${sidebarCollapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
      {!sidebarCollapsed && <span>{item.label}</span>}
    </button>
  );
};

const SectionHeader = ({ title, sidebarCollapsed }) => {
  if (sidebarCollapsed) return null;
  return (
    <div className="px-3 py-1">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        {title}
      </p>
    </div>
  );
};

export default function Sidebar({ sidebarCollapsed, setSidebarCollapsed, activeItem, setActiveItem }) {
  const router = useRouter();

  const handleItemClick = (itemId, href) => {
    setActiveItem(itemId);
    if (href) {
      router.push(href);
    }
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <Image src="/karya-ai-logo.png" alt="Karya AI" width={32} height={32} className="rounded-lg object-contain" />
            <h1 className="text-base font-bold text-gray-900">Karya AI</h1>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-0.5">
          {navigationItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeItem === item.id}
              onClick={handleItemClick}
              sidebarCollapsed={sidebarCollapsed}
            />
          ))}
        </div>

        {/* Team Section */}
        <div className="pt-3">
          <SectionHeader title="Team" sidebarCollapsed={sidebarCollapsed} />
          <div className="space-y-0.5">
            {teamSection.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                section="team"
                isActive={activeItem === item.id}
                onClick={handleItemClick}
                sidebarCollapsed={sidebarCollapsed}
              />
            ))}
          </div>
        </div>

        {/* Knowledge Section */}
        <div className="pt-3">
          <SectionHeader title="Knowledge" sidebarCollapsed={sidebarCollapsed} />
          <div className="space-y-0.5">
            {knowledgeSection.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                section="knowledge"
                isActive={activeItem === item.id}
                onClick={handleItemClick}
                sidebarCollapsed={sidebarCollapsed}
              />
            ))}
          </div>
        </div>

        {/* Additional Section */}
        <div className="pt-3">
          <div className="space-y-0.5">
            {additionalSection.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                section="additional"
                isActive={activeItem === item.id}
                onClick={handleItemClick}
                sidebarCollapsed={sidebarCollapsed}
              />
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}