'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { setAuthToken } from '@/lib/api';
import Navbar from '@/components/Navbar';
import BulkMealForm from '@/components/BulkMealForm';
import { motion } from 'framer-motion';
import { CalendarRange } from 'lucide-react';

export default function BulkSchedulePage() {
  const router = useRouter();

  useEffect(() => {
    const token = auth.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setAuthToken(token);
  }, [router]);

  const handleSuccess = () => {
    router.push('/meals');
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary shadow-2xl flex items-center justify-center">
                <CalendarRange className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Bulk Scheduling
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Schedule meals for multiple days with smart filters
                </p>
              </div>
            </div>

            <BulkMealForm onSuccess={handleSuccess} />
          </motion.div>
        </div>
      </main>
    </>
  );
}
