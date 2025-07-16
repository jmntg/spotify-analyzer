import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  gradient = false 
}) => {
  return (
    <div className={`${gradient ? 'stat-card' : 'card'} transform hover:scale-105 transition-transform duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-sm font-medium ${gradient ? 'text-white/80' : 'text-gray-500'}`}>
            {title}
          </h3>
          <p className={`text-2xl font-bold ${gradient ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs ${gradient ? 'text-white/70' : 'text-gray-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={`${gradient ? 'text-white/80' : 'text-gray-400'}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};