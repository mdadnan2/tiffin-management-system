"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuthToken } from '@/lib/api';
import { auth } from '@/lib/auth';
import { UserWithStats, UserSummary } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, DollarSign, UtensilsCrossed, ArrowLeft, Coffee, Soup, Moon, Sparkles, Crown, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.getUser();
    const token = auth.getToken();
    
    if (!user || !token) {
      router.push('/login');
      return;
    }

    if (user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    setAuthToken(token);
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const response = await api.admin.getAllUsers();
      setUsers(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSummary = async (userId: string) => {
    try {
      const response = await api.admin.getUserSummary(userId);
      setSelectedUser(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch user summary');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const getMealIcon = (type: string) => {
    switch(type) {
      case 'BREAKFAST': return <Coffee className="h-5 w-5" />;
      case 'LUNCH': return <Soup className="h-5 w-5" />;
      case 'DINNER': return <Moon className="h-5 w-5" />;
      case 'CUSTOM': return <Sparkles className="h-5 w-5" />;
      default: return <UtensilsCrossed className="h-5 w-5" />;
    }
  };

  const getMealColor = (type: string) => {
    switch(type) {
      case 'BREAKFAST': return 'from-orange-500 to-amber-500';
      case 'LUNCH': return 'from-green-500 to-emerald-500';
      case 'DINNER': return 'from-blue-500 to-indigo-500';
      case 'CUSTOM': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="container mx-auto p-6 max-w-7xl">
          <Button variant="ghost" onClick={() => setSelectedUser(null)} className="mb-6 gap-2 hover:gap-3 transition-all">
            <ArrowLeft className="h-4 w-4" /> Back to Users
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="mb-8 border-2 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                      {selectedUser.user.role === 'ADMIN' ? 
                        <Crown className="h-8 w-8 text-white" /> : 
                        <UserCircle className="h-8 w-8 text-white" />
                      }
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {selectedUser.user.name}
                      </CardTitle>
                      <CardDescription className="text-base mt-1">{selectedUser.user.email}</CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={selectedUser.user.role === 'ADMIN' ? 'default' : 'secondary'} 
                    className="text-sm px-4 py-1.5 font-semibold"
                  >
                    {selectedUser.user.role === 'ADMIN' ? '👑 ' : ''}  {selectedUser.user.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Joined on</span>
                  <span className="font-semibold text-foreground">
                    {new Date(selectedUser.user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-400">Total Meals</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                      <UtensilsCrossed className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">{selectedUser.totalMeals}</div>
                    <p className="text-xs text-muted-foreground mt-1">meals consumed</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-400">Total Amount</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-green-600 dark:text-green-400">₹{selectedUser.totalAmount.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">total spent</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-400">Avg per Meal</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      ₹{selectedUser.totalMeals > 0 ? (selectedUser.totalAmount / selectedUser.totalMeals).toFixed(2) : '0.00'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">average cost</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Meals by Type</CardTitle>
                <CardDescription>Breakdown of meal consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(selectedUser.byType).map(([type, count], index) => (
                    <motion.div 
                      key={type}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border-2 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-r from-card to-accent/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${getMealColor(type)} flex items-center justify-center shadow-md`}>
                          {getMealIcon(type)}
                        </div>
                        <div>
                          <p className="font-bold text-lg">{type}</p>
                          <p className="text-xs text-muted-foreground">meal type</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          {count}
                        </div>
                        <p className="text-xs text-muted-foreground">meals</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto p-6 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary shadow-2xl flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Admin Dashboard</h1>
              <p className="text-muted-foreground text-lg">Manage users and view statistics</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-400">Total Users</CardTitle>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-purple-600 dark:text-purple-400">{users.length}</div>
                  <p className="text-xs text-muted-foreground mt-2">registered users</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-400">Total Meals</CardTitle>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                    <UtensilsCrossed className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-orange-600 dark:text-orange-400">
                    {users.reduce((sum, u) => sum + u.mealCount, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">meals served</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
              <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-400">Total Revenue</CardTitle>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-green-600 dark:text-green-400">
                    ₹{users.reduce((sum, u) => sum + u.totalAmount, 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">total earnings</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Card className="border-2 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">All Users</CardTitle>
              <CardDescription className="text-base">Click on a user to view detailed statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 8 }}
                    className="flex items-center justify-between p-5 border-2 rounded-xl hover:shadow-xl cursor-pointer transition-all duration-300 bg-gradient-to-r from-card to-accent/5 hover:border-primary/50"
                    onClick={() => fetchUserSummary(user.id)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${user.role === 'ADMIN' ? 'from-yellow-400 to-orange-500' : 'from-blue-400 to-indigo-500'} flex items-center justify-center shadow-lg`}>
                        {user.role === 'ADMIN' ? 
                          <Crown className="h-7 w-7 text-white" /> : 
                          <UserCircle className="h-7 w-7 text-white" />
                        }
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold text-lg">{user.name}</p>
                          <Badge 
                            variant={user.role === 'ADMIN' ? 'default' : 'secondary'} 
                            className="text-xs px-3 py-1 font-semibold"
                          >
                            {user.role === 'ADMIN' ? '👑 ' : ''}{user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-8">
                      <div className="text-center px-4 py-2 rounded-lg bg-orange-100 dark:bg-orange-950/30">
                        <p className="text-xs text-muted-foreground mb-1">Meals</p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{user.mealCount}</p>
                      </div>
                      <div className="text-center px-4 py-2 rounded-lg bg-green-100 dark:bg-green-950/30">
                        <p className="text-xs text-muted-foreground mb-1">Amount</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{user.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
