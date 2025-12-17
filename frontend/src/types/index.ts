export type Role = 'USER' | 'ADMIN';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'CUSTOM';
export type MealStatus = 'ACTIVE' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  mobile?: string;
  role: Role;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Meal {
  id: string;
  userId: string;
  date: string;
  mealType: MealType;
  count: number;
  priceAtTime: number;
  status: MealStatus;
  isBulkScheduled: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceSetting {
  breakfast: number;
  lunch: number;
  dinner: number;
  custom: number;
}

export interface Dashboard {
  totalMeals: number;
  byType: Record<MealType, number>;
  totalAmount: number;
  amountByType: Record<string, number>;
}

export interface UserWithStats extends User {
  mealCount: number;
  totalAmount: number;
  createdAt: string;
}

export interface UserSummary {
  user: User & { createdAt: string };
  totalMeals: number;
  byType: Record<string, number>;
  totalAmount: number;
}
