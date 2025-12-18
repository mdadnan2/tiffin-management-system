'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function MonthlyDashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      const month = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      const { data: result } = await api.dashboard.monthly({ month });
      setData(result);
    } catch (err: any) {
      toast.error('Failed to load monthly dashboard');
    } finally {
      setLoading(false);
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <Card className="border-2 shadow-xl bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-900 dark:to-gray-900">
        <CardContent className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 shadow-xl bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-900 dark:to-gray-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Monthly Dashboard
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold min-w-[180px] text-center">{monthName}</span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-blue-100 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-all hover:scale-105 cursor-pointer">
            <p className="text-sm text-muted-foreground mb-1">Total Meals</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{data?.totalMeals || 0}</p>
          </div>
          <div className="p-4 rounded-lg bg-green-100 dark:bg-green-950/30 border-2 border-green-300 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/40 transition-all hover:scale-105 cursor-pointer">
            <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">₹{data?.totalAmount?.toFixed(2) || 0}</p>
          </div>
          <div className="p-4 rounded-lg bg-purple-100 dark:bg-purple-950/30 border-2 border-purple-300 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-all hover:scale-105 cursor-pointer">
            <p className="text-sm text-muted-foreground mb-1">Days with Meals</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{data?.daysWithMeals || 0}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">By Meal Type</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {data?.byType && Object.entries(data.byType).map(([type, count]: [string, any]) => (
              <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-gray-300 dark:bg-gray-800 hover:bg-gray-400 dark:hover:bg-gray-700 transition-all hover:scale-105 cursor-pointer">
                <span className="font-medium">{type}</span>
                <Badge variant="secondary">{count} meals • ₹{data.amountByType[type]?.toFixed(2) || 0}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Week by Week</h3>
          <div className="space-y-2">
            {data?.byWeek && Object.entries(data.byWeek).map(([week, stats]: [string, any]) => (
              <div key={week} className="flex items-center justify-between p-3 rounded-lg bg-gray-300 dark:bg-gray-800 hover:bg-gray-400 dark:hover:bg-gray-700 transition-all hover:scale-105 cursor-pointer">
                <span className="font-medium">Week {week}</span>
                <div className="flex gap-4">
                  <Badge variant="secondary">{stats.meals} meals</Badge>
                  <Badge variant="secondary">₹{stats.amount.toFixed(2)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
