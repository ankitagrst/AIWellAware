'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MessagesSquare, Sparkles, User, ClipboardList } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/', label: 'Ritual Generator', icon: Sparkles },
  { href: '/plan', label: 'Daily Plan', icon: ClipboardList },
  { href: '/chats', label: 'Chats', icon: MessagesSquare },
  { href: '/profile', label: 'Your Profile', icon: User },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
