'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { MealType } from '@/types';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function BulkMealForm({ onSuccess }: { onSuccess: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [mealType, setMealType] = useState<MealType>('LUNCH');
  const [count, setCount] = useState(1);
  const [note, setNote] = useState('');
  const [skipWeekends, setSkipWeekends] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        startDate,
        endDate,
        mealType,
        count,
        note: note || undefined,
      };

      if (skipWeekends) {
        payload.skipWeekends = true;
      } else if (selectedDays.length > 0) {
        payload.daysOfWeek = selectedDays;
      }

      const { data } = await api.meals.createBulk(payload);
      toast.success(`${data.created} meals scheduled successfully!`);
      setCount(1);
      setNote('');
      setSkipWeekends(false);
      setSelectedDays([]);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to schedule meals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 shadow-xl bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-900 dark:to-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          Bulk Meal Scheduling
        </CardTitle>
        <CardDescription>Schedule meals for multiple days with day filters</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Day Filters</label>
            <div className="flex items-center gap-2 mb-3">
              <Button
                type="button"
                variant={skipWeekends ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSkipWeekends(!skipWeekends);
                  if (!skipWeekends) setSelectedDays([]);
                }}
                className={skipWeekends ? '' : 'bg-gray-300 dark:bg-gray-800 hover:bg-gray-400 dark:hover:bg-gray-700'}
              >
                Skip Weekends
              </Button>
              {skipWeekends && <Badge variant="secondary" className="bg-slate-300 dark:bg-slate-700">Mon-Fri only</Badge>}
            </div>
            {!skipWeekends && (
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant={selectedDays.includes(index) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleDay(index)}
                    className={`h-12 ${!selectedDays.includes(index) ? 'bg-gray-300 dark:bg-gray-800 hover:bg-gray-400 dark:hover:bg-gray-700 border-gray-400 dark:border-gray-700' : ''}`}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            )}
            {selectedDays.length > 0 && !skipWeekends && (
              <Badge variant="secondary" className="bg-slate-300 dark:bg-slate-700">
                Selected: {selectedDays.map(d => dayNames[d]).join(', ')}
              </Badge>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Meal Type</label>
              <select
                className="flex h-12 w-full rounded-md border-2 border-input bg-background px-4 py-2 text-base"
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
              >
                <option value="BREAKFAST">☕ Breakfast</option>
                <option value="LUNCH">🍲 Lunch</option>
                <option value="DINNER">🌙 Dinner</option>
                <option value="CUSTOM">✨ Custom</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Count</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="h-12"
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
              className="h-12"
              maxLength={200}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base gap-2"
          >
            <Plus className="h-5 w-5" />
            {loading ? 'Scheduling...' : 'Schedule Meals'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
