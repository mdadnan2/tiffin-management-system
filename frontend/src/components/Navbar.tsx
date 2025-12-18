"use client"
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogOut, LayoutDashboard, UtensilsCrossed, User, Shield, Calendar, CalendarRange, Settings, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { User as UserType } from '@/types';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(auth.getUser());
  }, []);

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between w-full">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Tiffin
            </span>
          </div>
        </div>
      </nav>
    );
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      auth.clearAuth();
      router.push('/login');
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Tiffin
            </span>
          </Link>
          
          <div className="flex items-center gap-1 overflow-x-auto">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/meals">
            <Button variant="ghost" size="sm" className="gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Meals
            </Button>
          </Link>
          <Link href="/meals/bulk">
            <Button variant="ghost" size="sm" className="gap-2">
              <CalendarRange className="h-4 w-4" />
              Bulk
            </Button>
          </Link>
          <Link href="/meals/calendar">
            <Button variant="ghost" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </Button>
          </Link>
          <Link href="/analytics">
            <Button variant="ghost" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </Button>
          </Link>
          {user?.role === 'ADMIN' && (
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
            
            <div className="h-8 w-px bg-border mx-2" />
            
            <span className="text-sm text-muted-foreground whitespace-nowrap">{user?.name}</span>
            <ThemeToggle />
            <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-2 flex-shrink-0">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
