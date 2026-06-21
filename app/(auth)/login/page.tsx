import Page from '@/frontend/auth/login/page';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F4F9]" />}>
      <Page />
    </Suspense>
  );
}
