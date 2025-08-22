
'use client';

import type { ReactNode } from 'react';
import { Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Logo } from '../logo';
import { SheetClose, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

function MobileSidebarHeader() {
  const { setOpenMobile } = useSidebar();
  return (
    <SheetHeader className="p-4 flex flex-row items-center justify-between">
      <div className="flex items-center gap-2">
        <Logo className="w-8 h-8 text-primary" />
        <h2 className="text-xl font-headline font-bold">WellAware AI</h2>
      </div>
      <SheetClose asChild>
        <Button variant="ghost" size="icon" onClick={() => setOpenMobile(false)}>
          <X />
          <span className="sr-only">Close</span>
        </Button>
      </SheetClose>
    </SheetHeader>
  );
}


export function AppLayout({ children }: { children: ReactNode }) {
  const { isMobile } = useSidebar();
  return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          <Sidebar>
              {isMobile && <MobileSidebarHeader />}
              {!isMobile && (
                  <SidebarHeader>
                      <div className="flex items-center gap-2">
                      <Logo className="w-8 h-8 text-primary" />
                      <h2 className="text-xl font-headline font-bold">WellAware AI</h2>
                      </div>
                  </SidebarHeader>
              )}
            <SidebarContent>
              <SidebarNav />
            </SidebarContent>
          </Sidebar>
          <div className="flex flex-col w-full">
              <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background/80 backdrop-blur-sm px-4">
                  <div className="md:hidden">
                      <SidebarTrigger />
                  </div>
                  <h1 className="flex-1 text-xl font-semibold font-headline text-center md:text-left">WellAware AI</h1>
              </header>
              <SidebarInset>
                  <div className="flex-1">
                    {children}
                  </div>
              </SidebarInset>
          </div>
        </div>
        <footer className="py-4 px-6 border-t text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} WellAware AI. All Rights Reserved.
        </footer>
      </div>
  );
}
