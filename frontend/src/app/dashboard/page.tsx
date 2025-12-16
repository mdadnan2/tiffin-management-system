'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuthToken } from '@/lib/api';
import { auth } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { TrendingUp, UtensilsCrossed, IndianRupee, Coffee, Soup, Moon, Sparkles, BarChart3, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import type { Dashboard } from '@/types';


const mealIcons = {
  BREAKFAST: Coffee,
  LUNCH: Soup,
  DINNER: Moon,
  CUSTOM: Sparkles,
};

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = auth.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setAuthToken(token);
    loadDashboard();
  }, [router]);

  const loadDashboard = async () => {
    try {
      const { data } = await api.dashboard.get();
      setDashboard(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <Skeleton className="h-12 w-64" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  const getMealColor = (type: string) => {
    switch(type) {
      case 'BREAKFAST': return 'from-orange-500 to-amber-500';
      case 'LUNCH': return 'from-green-500 to-emerald-500';
      case 'DINNER': return 'from-blue-500 to-indigo-500';
      case 'CUSTOM': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-8"
          >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary shadow-2xl flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">My Dashboard</h1>
              <p className="text-muted-foreground text-lg mt-1">Track your meal consumption and spending</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                    Total Meals
                  </CardTitle>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                    <UtensilsCrossed className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-orange-600 dark:text-orange-400">{dashboard?.totalMeals || 0}</div>
                  <p className="text-xs text-muted-foreground mt-2">meals consumed</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-400">
                    Total Spent
                  </CardTitle>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-green-600 dark:text-green-400">₹{dashboard?.totalAmount.toFixed(2) || 0}</div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    total spending
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    Avg per Meal
                  </CardTitle>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                    <IndianRupee className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                    ₹{dashboard?.totalMeals ? (dashboard.totalAmount / dashboard.totalMeals).toFixed(2) : 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">average cost</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Meals by Type</CardTitle>
                <CardDescription>Your meal consumption breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {dashboard?.byType && Object.entries(dashboard.byType).map(([type, count], index) => {
                    const Icon = mealIcons[type as keyof typeof mealIcons] || Sparkles;
                    return (
                      <motion.div
                        key={type}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-accent/5 cursor-pointer"
                      >
                        <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${getMealColor(type)} flex items-center justify-center shadow-lg`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-muted-foreground mb-1">{type}</p>
                          <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{count}</p>
                          <p className="text-xs text-muted-foreground mt-1">meals</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>


          </motion.div>
        </div>
      </main>
    </>
  );
}
