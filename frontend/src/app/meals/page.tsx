'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuthToken } from '@/lib/api';
import { auth } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Plus, Trash2, Calendar, Coffee, Soup, Moon, Sparkles, UtensilsCrossed, Edit2, Check, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { Meal, MealType } from '@/types';

const mealIcons = {
  BREAKFAST: Coffee,
  LUNCH: Soup,
  DINNER: Moon,
  CUSTOM: Sparkles,
};

export default function MealsPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const [meals, setMeals] = useState<Meal[]>([]);
  const [date, setDate] = useState(today);
  const [mealType, setMealType] = useState<MealType>('BREAKFAST');
  const [count, setCount] = useState(1);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [editingMeal, setEditingMeal] = useState<{id: string, count: number, note: string} | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, mealId: string, mealType: string} | null>(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterType, setFilterType] = useState<MealType | 'ALL'>('ALL');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkStartDate, setBulkStartDate] = useState(today);
  const [bulkEndDate, setBulkEndDate] = useState(today);
  const [showScheduled, setShowScheduled] = useState(false);
  const [scheduledMeals, setScheduledMeals] = useState<Meal[]>([]);

  useEffect(() => {
    const token = auth.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setAuthToken(token);
    loadMeals();
    loadScheduledMeals();
  }, [router]);

  const setQuickFilter = (filter: 'today' | 'week' | 'month' | 'all') => {
    const today = new Date();
    const start = new Date();
    
    switch(filter) {
      case 'today':
        setFilterStartDate(today.toISOString().split('T')[0]);
        setFilterEndDate(today.toISOString().split('T')[0]);
        break;
      case 'week':
        start.setDate(today.getDate() - 7);
        setFilterStartDate(start.toISOString().split('T')[0]);
        setFilterEndDate(today.toISOString().split('T')[0]);
        break;
      case 'month':
        start.setMonth(today.getMonth() - 1);
        setFilterStartDate(start.toISOString().split('T')[0]);
        setFilterEndDate(today.toISOString().split('T')[0]);
        break;
      case 'all':
        setFilterStartDate('');
        setFilterEndDate('');
        break;
    }
  };

  const loadMeals = async () => {
    try {
      setPageLoading(true);
      const params: any = {};
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterType !== 'ALL') params.mealType = filterType;
      const { data } = await api.meals.list(params);
      setMeals(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load meals');
    } finally {
      setPageLoading(false);
    }
  };

  const loadScheduledMeals = async () => {
    try {
      const { data } = await api.meals.list();
      setScheduledMeals(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load scheduled meals');
    }
  };

  const availableTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'CUSTOM'];

  const generateDateRange = (start: string, end: string): string[] => {
    const dates: string[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }
    return dates;
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (count < 1) {
      toast.error('Count must be at least 1');
      return;
    }

    if (bulkMode) {
      if (!bulkStartDate || !bulkEndDate) {
        toast.error('Please select both start and end dates');
        return;
      }
      if (new Date(bulkStartDate) > new Date(bulkEndDate)) {
        toast.error('Start date must be before end date');
        return;
      }

      const dates = generateDateRange(bulkStartDate, bulkEndDate);
      const confirmed = confirm(
        `Schedule ${mealType} for ${dates.length} days (${new Date(bulkStartDate).toLocaleDateString('en-IN')} to ${new Date(bulkEndDate).toLocaleDateString('en-IN')})?`
      );
      if (!confirmed) return;

      setLoading(true);
      try {
        const { data } = await api.meals.createBulk({ dates, mealType, count, note });
        toast.success(`${data.created} meals scheduled successfully!`);
        setCount(1);
        setNote('');
        setBulkStartDate('');
        setBulkEndDate('');
        await loadMeals();
        await loadScheduledMeals();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to schedule meals');
      } finally {
        setLoading(false);
      }
    } else {
      const existingMeal = meals.find(m => {
        const mealDate = new Date(m.date).toISOString().split('T')[0];
        return mealDate === date && m.mealType === mealType && m.status === 'ACTIVE';
      });

      if (existingMeal) {
        const confirmed = confirm(
          `You already have ${mealType} (Count: ${existingMeal.count}) for ${new Date(date).toLocaleDateString('en-IN')}. Do you want to increase the count by ${count}?`
        );
        if (!confirmed) return;
      }

      setLoading(true);
      try {
        const newCount = existingMeal ? existingMeal.count + count : count;
        await api.meals.create({ date, mealType, count: newCount, note });
        toast.success(existingMeal ? 'Meal count updated!' : 'Meal added successfully!');
        setCount(1);
        setNote('');
        await loadMeals();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to add meal');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateMeal = async (id: string, newCount: number, newNote: string) => {
    if (newCount < 1) {
      toast.error('Count must be at least 1');
      return;
    }
    try {
      await api.meals.update(id, { count: newCount, note: newNote });
      toast.success('Meal updated successfully!');
      loadMeals();
      setEditingMeal(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update meal');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.meals.delete(id);
      toast.success('Meal cancelled successfully!');
      loadMeals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel meal');
    }
  };

  useEffect(() => {
    if (filterStartDate || filterEndDate || filterType !== 'ALL') {
      loadMeals();
    }
  }, [filterStartDate, filterEndDate, filterType]);

  const filteredMeals = meals;

  if (pageLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">Loading meals...</p>
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
              <UtensilsCrossed className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">My Meals</h1>
              <p className="text-muted-foreground text-lg mt-1">Manage your daily meal orders</p>
            </div>
          </div>

          <Card className="border-2 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    Scheduled Meals
                  </CardTitle>
                  <CardDescription>Upcoming meals from today onwards</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduled(!showScheduled)}
                >
                  {showScheduled ? 'Hide' : 'Show'} ({scheduledMeals.length})
                </Button>
              </div>
            </CardHeader>
            {showScheduled && (
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {scheduledMeals.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No scheduled meals</p>
                  ) : (
                    (() => {
                      const today = new Date().toISOString().split('T')[0];
                      const grouped = scheduledMeals.reduce((acc, meal) => {
                        const key = meal.mealType;
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(meal);
                        return acc;
                      }, {} as Record<string, Meal[]>);

                      return Object.entries(grouped)
                        .filter(([_, mealsInGroup]) => mealsInGroup.some(m => m.date >= today))
                        .map(([mealType, mealsInGroup]) => {
                        mealsInGroup.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        const startDate = new Date(mealsInGroup[0].date);
                        const endDate = new Date(mealsInGroup[mealsInGroup.length - 1].date);
                        const Icon = mealIcons[mealType as keyof typeof mealIcons];
                        const upcomingMeals = mealsInGroup.filter(m => m.date >= today && m.status === 'ACTIVE');
                        
                        return (
                          <div
                            key={mealType}
                            className="p-4 rounded-lg border-2 bg-card space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${getMealColor(mealType)} flex items-center justify-center`}>
                                  <Icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <p className="font-bold text-lg">{mealType}</p>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    {mealsInGroup.length > 1 && ` - ${endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="text-sm">{mealsInGroup.length} days</Badge>
                                {upcomingMeals.length > 0 && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={async () => {
                                      const confirmed = confirm(`Delete all upcoming ${mealType} meals (${upcomingMeals.length} days)?`);
                                      if (!confirmed) return;
                                      try {
                                        await Promise.all(upcomingMeals.map(m => api.meals.delete(m.id)));
                                        toast.success(`${upcomingMeals.length} upcoming meals deleted`);
                                        await loadMeals();
                                        await loadScheduledMeals();
                                      } catch (err: any) {
                                        toast.error('Failed to delete meals');
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" /> Delete Upcoming
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-7 gap-2">
                              {mealsInGroup.map((meal) => {
                                const mealDate = new Date(meal.date).toISOString().split('T')[0];
                                const isPast = mealDate < today;
                                const isToday = mealDate === today;
                                const isCancelled = meal.status === 'CANCELLED';
                                
                                return (
                                  <div
                                    key={meal.id}
                                    className={`relative p-2 rounded-lg border-2 text-center transition-all ${
                                      isPast && !isCancelled
                                        ? 'bg-green-100 dark:bg-green-950/30 border-green-500'
                                        : isCancelled
                                        ? 'bg-red-100 dark:bg-red-950/30 border-red-500'
                                        : isToday
                                        ? 'bg-blue-100 dark:bg-blue-950/30 border-blue-500'
                                        : 'bg-gray-100 dark:bg-gray-800 border-gray-300'
                                    }`}
                                  >
                                    <p className="text-xs font-semibold">
                                      {new Date(meal.date).getDate()}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {new Date(meal.date).toLocaleDateString('en-IN', { month: 'short' })}
                                    </p>
                                    <div className="mt-1">
                                      {isPast && !isCancelled ? (
                                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto" />
                                      ) : isCancelled ? (
                                        <X className="h-5 w-5 text-red-600 dark:text-red-400 mx-auto" />
                                      ) : (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 p-0 hover:bg-red-200 dark:hover:bg-red-900"
                                          onClick={async () => {
                                            try {
                                              await api.meals.delete(meal.id);
                                              toast.success('Meal cancelled');
                                              await loadMeals();
                                              await loadScheduledMeals();
                                            } catch (err: any) {
                                              toast.error('Failed to cancel meal');
                                            }
                                          }}
                                          title="Cancel this meal"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          <Card className="border-2 shadow-xl bg-gradient-to-br from-card to-accent/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    Add New Meal
                  </CardTitle>
                  <CardDescription>Schedule your meals for any date</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={!bulkMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBulkMode(false)}
                  >
                    Single Day
                  </Button>
                  <Button
                    type="button"
                    variant={bulkMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBulkMode(true)}
                  >
                    Multiple Days
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMeal} className="space-y-6">
                {bulkMode ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={bulkStartDate}
                        onChange={(e) => setBulkStartDate(e.target.value)}
                        min={today}
                        className="h-12 text-base"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={bulkEndDate}
                        onChange={(e) => setBulkEndDate(e.target.value)}
                        min={today}
                        className="h-12 text-base"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Select Date
                    </label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-12 text-base"
                      required
                    />
                  </div>
                )}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Select Meal Type</label>
                    <select
                      className="flex h-12 w-full rounded-md border-2 border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value as MealType)}
                    >
                      {availableTypes.map(type => (
                        <option key={type} value={type}>
                          {type === 'BREAKFAST' ? '☕ Breakfast' : type === 'LUNCH' ? '🍲 Lunch' : type === 'DINNER' ? '🌙 Dinner' : '✨ Custom'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Meal Count</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="h-12 text-base"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Note (Optional)</label>
                  <Input
                    type="text"
                    placeholder="Add any special instructions..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="h-12 text-base"
                    maxLength={200}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 text-base gap-2 shadow-lg hover:shadow-xl transition-all">
                  <Plus className="h-5 w-5" />
                  {loading ? (bulkMode ? 'Scheduling Meals...' : 'Adding Meal...') : (bulkMode ? 'Schedule Meals' : 'Add Meal')}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-2xl">Your Meal Orders</CardTitle>
                  <CardDescription>View and manage all your meals</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setQuickFilter('today')}>Today</Button>
                  <Button variant="outline" size="sm" onClick={() => setQuickFilter('week')}>This Week</Button>
                  <Button variant="outline" size="sm" onClick={() => setQuickFilter('month')}>This Month</Button>
                  <Button variant="outline" size="sm" onClick={() => setQuickFilter('all')}>All</Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Meal Type</label>
                  <select
                    className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as MealType | 'ALL')}
                  >
                    <option value="ALL">All Types</option>
                    <option value="BREAKFAST">Breakfast</option>
                    <option value="LUNCH">Lunch</option>
                    <option value="DINNER">Dinner</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
              </div>
              {(filterStartDate || filterEndDate || filterType !== 'ALL') && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="gap-2">
                    {filteredMeals.length} meals found
                    <X className="h-3 w-3 cursor-pointer" onClick={() => {
                      setFilterStartDate('');
                      setFilterEndDate('');
                      setFilterType('ALL');
                    }} />
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredMeals.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                      <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium text-muted-foreground">No meals yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Add your first meal to get started!</p>
                  </div>
                ) : (
                  filteredMeals.map((meal, index) => {
                    const Icon = mealIcons[meal.mealType as keyof typeof mealIcons];
                    const isEditing = editingMeal?.id === meal.id;
                    return (
                      <motion.div
                        key={meal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-xl border-2 bg-gradient-to-r from-card to-accent/5 hover:shadow-xl transition-all duration-300 gap-4"
                      >
                        <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                          <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${getMealColor(meal.mealType)} flex items-center justify-center shadow-lg flex-shrink-0`}>
                            <Icon className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-lg">{meal.mealType}</p>
                              {!isEditing && (
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-6 w-6" 
                                  onClick={() => setEditingMeal({id: meal.id, count: meal.count, note: meal.note || ''})}
                                  title="Edit meal"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(meal.date).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                            {isEditing ? (
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-semibold min-w-[40px]">Count:</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    className="w-20 h-8 text-center"
                                    value={editingMeal.count}
                                    onChange={(e) => setEditingMeal({...editingMeal, count: Number(e.target.value)})}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-semibold min-w-[40px]">Note:</label>
                                  <Input
                                    type="text"
                                    placeholder="Add note..."
                                    className="h-8 text-xs flex-1"
                                    value={editingMeal.note}
                                    onChange={(e) => setEditingMeal({...editingMeal, note: e.target.value})}
                                    maxLength={200}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleUpdateMeal(meal.id, editingMeal.count, editingMeal.note)} className="h-7">
                                    <Check className="h-3 w-3 mr-1" /> Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingMeal(null)} className="h-7">
                                    <X className="h-3 w-3 mr-1" /> Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : meal.note ? (
                              <p className="text-xs text-muted-foreground mt-1 italic" title={meal.note}>
                                📝 {meal.note}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                No note
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                          {!isEditing && (
                            <div className="text-center px-4 py-2 rounded-lg bg-orange-100 dark:bg-orange-950/30">
                              <p className="text-xs text-muted-foreground mb-1">Count</p>
                              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{meal.count}</p>
                            </div>
                          )}
                          <div className="text-center px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                            <p className="text-xs text-muted-foreground mb-1">Price</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{meal.priceAtTime}</p>
                          </div>
                          <div className="text-center px-4 py-2 rounded-lg bg-green-100 dark:bg-green-950/30">
                            <p className="text-xs text-muted-foreground mb-1">Total</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{(meal.count * meal.priceAtTime).toFixed(2)}</p>
                          </div>
                          <Badge 
                            variant={meal.status === 'ACTIVE' ? 'default' : 'secondary'}
                            className="px-3 py-1 text-xs font-semibold"
                          >
                            {meal.status}
                          </Badge>
                          {meal.status === 'ACTIVE' && (
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => setDeleteConfirm({isOpen: true, mealId: meal.id, mealType: meal.mealType})}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </main>
      
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm.mealId)}
          title="Cancel Meal?"
          description={`Are you sure you want to cancel this ${deleteConfirm.mealType} meal? This action cannot be undone.`}
          confirmText="Yes, Cancel Meal"
          cancelText="No, Keep It"
          variant="danger"
        />
      )}
    </>
  );
}
