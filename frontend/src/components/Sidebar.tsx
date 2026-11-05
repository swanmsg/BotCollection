'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

interface NavItem {
  href?: string;
  label: string;
  icon: string;
  children?: { href: string; label: string; icon: string }[];
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  {
    label: 'Robots',
    icon: '🤖',
    children: [
      { href: '/robots', label: 'All Robots', icon: '📋' },
      { href: '/g1', label: 'Unitree G1', icon: '🦿' },
      { href: '/agibot-g1', label: 'AgiBot G1', icon: '🦾' },
      { href: '/agibot-x2', label: 'AgiBot X2', icon: '🐕' },
    ],
  },
  { href: '/sensors', label: 'Sensors', icon: '📡' },
  { href: '/data', label: 'Data', icon: '📈' },
  { href: '/tasks', label: 'Tasks', icon: '⚙️' },
  { href: '/datasets', label: 'Datasets', icon: '📦' },
  { href: '/agents', label: 'Agents', icon: '🧠' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Robots: true,
  });

  const isActive = (href: string) => pathname === href;
  const isChildActive = (item: NavItem) =>
    item.children?.some((c) => pathname === c.href);

  return (
    <aside className="w-64 bg-dark-900 text-white flex flex-col">
      <div className="p-5 border-b border-gray-700">
        <h1 className="text-xl font-bold tracking-tight">BotCollection</h1>
        <p className="text-xs text-gray-400 mt-1">具身智能数据采集平台</p>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          if (item.children) {
            const open = expanded[item.label] ?? isChildActive(item);
            return (
              <div key={item.label}>
                <button
                  className={clsx(
                    'flex items-center gap-3 px-5 py-2.5 text-sm font-medium w-full transition-colors',
                    isChildActive(item)
                      ? 'bg-primary-600/20 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                  onClick={() => setExpanded((e) => ({ ...e, [item.label]: !open }))}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  <svg
                    className={clsx('w-4 h-4 transition-transform', open && 'rotate-90')}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {open && (
                  <div className="ml-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={clsx(
                          'flex items-center gap-3 px-5 py-2 text-sm transition-colors',
                          isActive(child.href)
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        )}
                      >
                        <span className="text-base">{child.icon}</span>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={clsx(
                'flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors',
                isActive(item.href!)
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-5 border-t border-gray-700 text-xs text-gray-500">
        AgentScope Powered
      </div>
    </aside>
  );
}
