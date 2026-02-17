'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ArrowLeftRight,
  Server,
  ScrollText,
  Shield,
  ChevronLeft,
} from 'lucide-react'

interface AdminSidebarProps {
  adminName: string
  adminRole: string
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Kullanıcılar', icon: Users },
  { href: '/admin/portfolios', label: 'Portföyler', icon: Briefcase },
  { href: '/admin/transactions', label: 'İşlemler', icon: ArrowLeftRight },
  { href: '/admin/system', label: 'Sistem Sağlığı', icon: Server },
  { href: '/admin/audit', label: 'Audit Log', icon: ScrollText },
]

export default function AdminSidebar({ adminName, adminRole }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-red-400" />
          <span className="font-bold text-lg">Admin Panel</span>
        </div>
        <p className="text-xs text-gray-400 truncate">{adminName}</p>
        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-red-500/20 text-red-300 rounded-full">
          {adminRole}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer — ana siteye dön */}
      <div className="p-4 border-t border-gray-700">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Ana Siteye Dön
        </Link>
      </div>
    </aside>
  )
}
