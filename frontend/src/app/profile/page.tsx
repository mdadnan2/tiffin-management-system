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
import { Save, IndianRupee, User as UserIcon, Mail, Phone, Settings, Coffee, Soup, Moon, Sparkles, Crown, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { PriceSetting, User } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [prices, setPrices] = useState<PriceSetting>({ breakfast: 0, lunch: 0, dinner: 0, custom: 0 });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const token = auth.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setAuthToken(token);
    const userData = auth.getUser();
    setUser(userData);
    setName(userData?.name || '');
    setMobile(userData?.mobile || '');
    loadPrices();
  }, [router]);

  const loadPrices = async () => {
    try {
      const { data } = await api.price.get();
      setPrices({
        breakfast: parseFloat(data.breakfast) || 0,
        lunch: parseFloat(data.lunch) || 0,
        dinner: parseFloat(data.dinner) || 0,
        custom: parseFloat(data.custom) || 0,
      });
    } catch (err: any) {
      if (err.response?.status === 404) {
        setPrices({ breakfast: 0, lunch: 0, dinner: 0, custom: 0 });
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    if (mobile && !/^[0-9]{10}$/.test(mobile)) {
      toast.error('Mobile number must be 10 digits');
      return;
    }
    
    setProfileLoading(true);
    try {
      await api.users.updateProfile({ name: name.trim(), mobile: mobile.trim() });
      const updatedUser = { ...user!, name: name.trim(), mobile: mobile.trim() };
      auth.setAuth(auth.getToken()!, auth.getRefreshToken()!, updatedUser);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePriceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      breakfast: parseFloat(String(prices.breakfast)) || 0,
      lunch: parseFloat(String(prices.lunch)) || 0,
      dinner: parseFloat(String(prices.dinner)) || 0,
      custom: parseFloat(String(prices.custom)) || 0,
    };
    
    if (data.breakfast < 0 || data.lunch < 0 || data.dinner < 0 || data.custom < 0) {
      toast.error('Prices cannot be negative');
      return;
    }
    
    if (data.breakfast > 10000 || data.lunch > 10000 || data.dinner > 10000 || data.custom > 10000) {
      toast.error('Price cannot exceed ₹10,000');
      return;
    }
    
    setLoading(true);
    try {
      await api.price.update(data);
      toast.success('Prices updated successfully!');
      loadPrices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update prices');
    } finally {
      setLoading(false);
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
            className="space-y-8 max-w-4xl mx-auto"
          >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary shadow-2xl flex items-center justify-center">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Profile & Settings</h1>
              <p className="text-muted-foreground text-lg mt-1">Manage your account and preferences</p>
            </div>
          </div>

          <Card className="border-2 shadow-xl bg-gradient-to-br from-card to-accent/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${user?.role === 'ADMIN' ? 'from-yellow-400 to-orange-500' : 'from-blue-400 to-indigo-500'} flex items-center justify-center shadow-lg`}>
                    {user?.role === 'ADMIN' ? 
                      <Crown className="h-6 w-6 text-white" /> : 
                      <UserCircle className="h-6 w-6 text-white" />
                    }
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Personal Information</CardTitle>
                    <CardDescription>Update your profile details</CardDescription>
                  </div>
                </div>
                <Badge variant={user?.role === 'ADMIN' ? 'default' : 'secondary'} className="text-sm px-4 py-1.5 font-semibold">
                  {user?.role === 'ADMIN' ? '👑 ' : ''}{user?.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-primary" />
                      Full Name
                    </label>
                    <Input type="text" value={name} onChange={(e) => setName(e.target.value)} className="h-12 text-base" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Email Address
                    </label>
                    <Input type="email" value={user?.email || ''} disabled className="bg-muted h-12 text-base" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      Mobile Number
                    </label>
                    <Input 
                      type="tel" 
                      placeholder="Enter 10-digit mobile number" 
                      value={mobile} 
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                      className="h-12 text-base"
                      maxLength={10}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={profileLoading} className="w-full h-12 text-base gap-2 shadow-lg hover:shadow-xl transition-all">
                  <Save className="h-5 w-5" />
                  {profileLoading ? 'Updating Profile...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <IndianRupee className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Meal Pricing</CardTitle>
                  <CardDescription>Set your default meal prices</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePriceUpdate} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                        <Coffee className="h-4 w-4 text-white" />
                      </div>
                      Breakfast Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                      <Input 
                        type="number" 
                        min="0"
                        max="10000"
                        step="0.01" 
                        value={prices.breakfast} 
                        onChange={(e) => setPrices({ ...prices, breakfast: parseFloat(e.target.value) || 0 })} 
                        className="h-12 text-base pl-8 border-2"
                        required 
                      />
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <Soup className="h-4 w-4 text-white" />
                      </div>
                      Lunch Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                      <Input 
                        type="number" 
                        min="0"
                        max="10000"
                        step="0.01" 
                        value={prices.lunch} 
                        onChange={(e) => setPrices({ ...prices, lunch: parseFloat(e.target.value) || 0 })} 
                        className="h-12 text-base pl-8 border-2"
                        required 
                      />
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        <Moon className="h-4 w-4 text-white" />
                      </div>
                      Dinner Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                      <Input 
                        type="number" 
                        min="0"
                        max="10000"
                        step="0.01" 
                        value={prices.dinner} 
                        onChange={(e) => setPrices({ ...prices, dinner: parseFloat(e.target.value) || 0 })} 
                        className="h-12 text-base pl-8 border-2"
                        required 
                      />
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      Custom Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                      <Input 
                        type="number" 
                        min="0"
                        max="10000"
                        step="0.01" 
                        value={prices.custom} 
                        onChange={(e) => setPrices({ ...prices, custom: parseFloat(e.target.value) || 0 })} 
                        className="h-12 text-base pl-8 border-2"
                        required 
                      />
                    </div>
                  </motion.div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 text-base gap-2 shadow-lg hover:shadow-xl transition-all">
                  <Save className="h-5 w-5" />
                  {loading ? 'Updating Prices...' : 'Update Meal Prices'}
                </Button>
              </form>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </main>
    </>
  );
}
