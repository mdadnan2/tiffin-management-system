'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { MealType } from '@/types';

export default function BulkOperations({ onSuccess }: { onSuccess: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const [operation, setOperation] = useState<'update' | 'cancel'>('update');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [mealType, setMealType] = useState<MealType | 'ALL'>('ALL');
  const [count, setCount] = useState(1);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    const confirmed = confirm(
      operation === 'update'
        ? `Update all ${mealType === 'ALL' ? 'meals' : mealType} from ${startDate} to ${endDate}?`
        : `Cancel all ${mealType === 'ALL' ? 'meals' : mealType} from ${startDate} to ${endDate}?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      if (operation === 'update') {
        const payload: any = { startDate, endDate };
        if (mealType !== 'ALL') payload.mealType = mealType;
        if (count) payload.count = count;
        if (note) payload.note = note;
        const { data } = await api.meals.bulkUpdate(payload);
        toast.success(`${data.updated} meals updated successfully!`);
      } else {
        const payload: any = { startDate, endDate };
        if (mealType !== 'ALL') payload.mealType = mealType;
        const { data } = await api.meals.bulkCancel(payload);
        toast.success(`${data.cancelled} meals cancelled successfully!`);
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 shadow-xl bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-900 dark:to-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            {operation === 'update' ? <Edit className="h-5 w-5 text-white" /> : <Trash2 className="h-5 w-5 text-white" />}
          </div>
          Bulk Operations
        </CardTitle>
        <CardDescription>Update or cancel multiple meals at once</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={operation === 'update' ? 'default' : 'outline'}
              onClick={() => setOperation('update')}
              className={operation !== 'update' ? 'bg-gray-300 dark:bg-gray-800' : ''}
            >
              <Edit className="h-4 w-4 mr-2" />
              Update
            </Button>
            <Button
              type="button"
              variant={operation === 'cancel' ? 'destructive' : 'outline'}
              onClick={() => setOperation('cancel')}
              className={operation !== 'cancel' ? 'bg-gray-300 dark:bg-gray-800' : ''}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

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
            <label className="text-sm font-semibold">Meal Type (Optional)</label>
            <select
              className="flex h-12 w-full rounded-md border-2 border-input bg-background px-4 py-2 text-base"
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType | 'ALL')}
            >
              <option value="ALL">All Types</option>
              <option value="BREAKFAST">☕ Breakfast</option>
              <option value="LUNCH">🍲 Lunch</option>
              <option value="DINNER">🌙 Dinner</option>
              <option value="CUSTOM">✨ Custom</option>
            </select>
          </div>

          {operation === 'update' && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">New Count (Optional)</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">New Note (Optional)</label>
                  <Input
                    type="text"
                    placeholder="Update note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="h-12"
                    maxLength={200}
                  />
                </div>
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base gap-2"
            variant={operation === 'cancel' ? 'destructive' : 'default'}
          >
            {operation === 'update' ? <Edit className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
            {loading ? 'Processing...' : operation === 'update' ? 'Update Meals' : 'Cancel Meals'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
