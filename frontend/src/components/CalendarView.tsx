'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Coffee, Soup, Moon, Sparkles, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const mealIcons = {
  BREAKFAST: Coffee,
  LUNCH: Soup,
  DINNER: Moon,
  CUSTOM: Sparkles,
};

const getMealColor = (type: string) => {
  switch(type) {
    case 'BREAKFAST': return 'bg-orange-500';
    case 'LUNCH': return 'bg-green-500';
    case 'DINNER': return 'bg-blue-500';
    case 'CUSTOM': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendar();
  }, [currentMonth]);

  const loadCalendar = async () => {
    try {
      setLoading(true);
      const month = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      const { data } = await api.meals.getCalendar({ month });
      setCalendarData(data);
    } catch (err: any) {
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card className="border-2 shadow-xl bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-900 dark:to-gray-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            Meal Calendar
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
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-bold text-sm py-2 text-slate-700 dark:text-slate-400 bg-slate-300 dark:bg-slate-800 rounded-lg">
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square bg-gray-200 dark:bg-gray-800/50 rounded-lg" />;
              }

              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const meals = calendarData[dateStr] || [];
              const today = new Date().toISOString().split('T')[0];
              const isToday = dateStr === today;

              return (
                <div
                  key={day}
                  className={`aspect-square border-2 rounded-lg p-2 ${
                    isToday ? 'border-primary bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30' : 'border-gray-400 dark:border-gray-700 bg-gray-300 dark:bg-gray-800 hover:bg-gray-400 dark:hover:bg-gray-700'
                  } hover:shadow-md transition-all`}
                >
                  <div className="text-sm font-semibold mb-1">{day}</div>
                  <div className="space-y-1">
                    {meals.map((meal, idx) => {
                      const Icon = mealIcons[meal.mealType as keyof typeof mealIcons];
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-1 text-xs ${getMealColor(meal.mealType)} text-white rounded px-1 py-0.5`}
                          title={`${meal.mealType}: ${meal.count}x ₹${meal.priceAtTime}`}
                        >
                          <Icon className="h-3 w-3" />
                          <span>{meal.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
