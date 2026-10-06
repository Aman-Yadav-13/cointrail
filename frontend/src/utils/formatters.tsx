import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Car,
  Zap,
  Film,
  HeartPulse,
  Plane,
  GraduationCap,
  Tag,
  Coins,
  Coffee,
  Home,
  Gift,
  Briefcase,
  Smartphone,
  MoreHorizontal,
  CreditCard,
  Wallet,
  PiggyBank,
  Banknote,
  Receipt,
  ShoppingCart,
  Fuel,
  Bus,
  Bike,
  Train,
  Tv,
  Gamepad2,
  Music,
  Dumbbell,
  Stethoscope,
  Pill,
  Wifi,
  Phone,
  Droplet,
  Flame,
  Shield,
  Laptop,
  Book,
  Camera,
  Shirt,
  Sparkles,
  Baby,
  Dog,
  Wrench,
  Hammer,
  Palette,
  Compass,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Utensils,
  ShoppingBag,
  Car,
  Zap,
  Film,
  HeartPulse,
  Plane,
  GraduationCap,
  Tag,
  Coins,
  Coffee,
  Home,
  Gift,
  Briefcase,
  Smartphone,
  MoreHorizontal,
  CreditCard,
  Wallet,
  PiggyBank,
  Banknote,
  Receipt,
  ShoppingCart,
  Fuel,
  Bus,
  Bike,
  Train,
  Tv,
  Gamepad2,
  Music,
  Dumbbell,
  Stethoscope,
  Pill,
  Wifi,
  Phone,
  Droplet,
  Flame,
  Shield,
  Laptop,
  Book,
  Camera,
  Shirt,
  Sparkles,
  Baby,
  Dog,
  Wrench,
  Hammer,
  Palette,
  Compass,
};

export function renderCategoryIcon(iconName: string, props: LucideProps = {}) {
  const IconComponent = ICON_MAP[iconName] || Tag;
  return <IconComponent {...props} />;
}

export function formatCurrency(amount: number | null | undefined, symbol: string = '₹'): string {
  if (amount == null || isNaN(amount)) return `${symbol}0.00`;
  return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Formats a Date object to YYYY-MM-DD using local calendar year, month, and day */
export function formatDateToLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

