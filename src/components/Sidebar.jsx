'use client';

import React, { useState } from 'react';
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
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  PlusCircle,
  ClipboardList,
  Lock,
} from 'lucide-react';

const navigationItems = [
  { id: 'home', label: 'Home', icon: Home, href: '/business-dashboard' },
  { id: 'karya-ai', label: 'Karya AI', icon: Sparkles, comingSoon: true },
  { id: 'messages', label: 'Messages', icon: MessageCircle, href: '/business-dashboard/messages' },
];

const teamSection = [
  { id: 'my-projects',     label: 'My Projects',      icon: FolderKanban,   href: '/business-dashboard/my-projects' },
  { id: 'my-experts',      label: 'My Experts',       icon: Users,          href: '/business-dashboard/experts' },
  { id: 'submit-project',  label: 'Submit Project',   icon: PlusCircle,     href: '/business-dashboard/submit-project', locked: true },
  { id: 'my-submissions',  label: 'My Submissions',   icon: ClipboardList,  href: '/business-dashboard/my-submissions', locked: true },
  { id: 'intros',          label: 'Intros',           icon: Handshake,      href: '/business-dashboard/intros', locked: true },
  { id: 'marketplace',     label: 'Marketplace',      icon: Store,          href: '/project-marketplace' },
];

// Not available yet — shown but not reachable.
const knowledgeSection = [
  { id: 'library', label: 'Library', icon: BookOpen, href: '/business-dashboard/library' , locked: true },
  { id: 'icps', label: 'ICPs', icon: Target, href: '/business-dashboard/icps' , locked: true },
  { id: 'marketing-plan', label: 'Marketing Plan', icon: TrendingUp, href: '/business-dashboard/marketing-plan' , locked: true },
  { id: 'products', label: 'Products', icon: Package, href: '/business-dashboard/products' , locked: true },
  { id: 'saved-convos', label: 'Saved AI Convos', icon: MessageSquare, href: '/business-dashboard/saved-convos' , locked: true },
];

const additionalSection = [
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

const NavItem = ({ item, section = 'main', isActive, onClick, sidebarCollapsed }) => {
  const Icon = item.icon;
  const locked = !!item.locked;

  return (
    <button
      onClick={() => { if (!locked) onClick(item.id, item.href); }}
      disabled={locked}
      aria-disabled={locked}
      title={
        sidebarCollapsed
          ? `${item.label}${locked ? ' — coming soon' : ''}`
          : locked ? 'Coming soon' : ''
      }
      className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        locked
          ? 'text-gray-300 cursor-not-allowed'
          : isActive
          ? 'bg-blue-50 text-blue-700 cursor-pointer'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer'
      } ${sidebarCollapsed ? 'justify-center' : ''}`}
    >
      <Icon className={`shrink-0 ${sidebarCollapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
      {!sidebarCollapsed && (
        <>
          <span>{item.label}</span>
          {locked && <Lock className="ml-auto h-3 w-3 shrink-0 text-gray-300" />}
        </>
      )}
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
  // The AI agent is not live yet. Clicking Karya AI says so in place, matching
  // the homepage's wording, rather than routing to a page that isn't ready.
  const [showAgentNotice, setShowAgentNotice] = useState(false);

  const handleItemClick = (itemId, href) => {
    if (itemId === 'karya-ai') {
      setShowAgentNotice(true);
      return;
    }
    setShowAgentNotice(false);
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
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image src="/karya-ai-logo.png" alt="Karya AI" width={32} height={32} className="rounded-lg object-contain" />
            <h1 className="text-base font-bold text-gray-900">Karya AI</h1>
          </button>
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
            <React.Fragment key={item.id}>
              <NavItem
                item={item}
                isActive={activeItem === item.id}
                onClick={handleItemClick}
                sidebarCollapsed={sidebarCollapsed}
              />
              {/* Same message the homepage shows when the agent is invoked. */}
              {item.comingSoon && showAgentNotice && !sidebarCollapsed && (
                <div className="mx-1 mt-1 mb-1 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                  <p className="text-[12px] font-semibold leading-snug text-blue-700">
                    The AI agent is coming soon — stay tuned!
                  </p>
                </div>
              )}
            </React.Fragment>
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