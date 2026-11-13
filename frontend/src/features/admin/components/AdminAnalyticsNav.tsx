import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Sprout,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AdminAnalyticsNavProps {
  className?: string;
}

const navItems = [
  {
    to: '/dashboard/admin/executive',
    label: 'Overview',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    to: '/dashboard/admin/users',
    label: 'Users & Demographics',
    icon: Users,
  },
  {
    to: '/dashboard/admin/marketplace',
    label: 'Marketplace & Orders',
    icon: ShoppingBag,
  },
  {
    to: '/dashboard/admin/crops',
    label: 'Crop Intelligence',
    icon: Sprout,
  },
  {
    to: '/dashboard/admin/revenue',
    label: 'Revenue & Finance',
    icon: TrendingUp,
  },
];

export const AdminAnalyticsNav: React.FC<AdminAnalyticsNavProps> = ({ className = '' }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-surface border border-border-subtle shadow-2xs scrollbar-none',
        className
      )}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0',
                isActive
                  ? 'bg-brand text-on-brand shadow-xs'
                  : 'text-foreground-secondary hover:text-foreground hover:bg-surface-elevated'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default AdminAnalyticsNav;
