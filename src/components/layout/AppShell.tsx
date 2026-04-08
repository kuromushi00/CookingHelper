'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNav } from './BottomNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="max-w-lg mx-auto pb-20">
        {children}
      </div>
      <BottomNav />
    </AuthGuard>
  );
}
