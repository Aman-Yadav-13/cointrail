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
