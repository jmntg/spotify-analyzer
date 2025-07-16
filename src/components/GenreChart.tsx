import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { GenreStats } from '@/types/spotify';

interface GenreChartProps {
  data: GenreStats;
  title: string;
}

const COLORS = [
  '#1DB954', '#1ed760', '#1fdf64', '#21e065', '#23e269',
  '#25e46d', '#27e671', '#29e875', '#2bea79', '#2dec7d',
  '#2fee81', '#31f085', '#33f289', '#35f48d', '#37f691',
  '#39f895', '#3bfa99', '#3dfc9d', '#3ffea1', '#41ffa5'
];

export const GenreChart: React.FC<GenreChartProps> = ({ data, title }) => {
  const chartData = Object.entries(data)
    .filter(([_, minutes]) => minutes > 5) // Only show genres with more than 5 minutes
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10) // Top 10 genres
    .map(([genre, minutes]) => ({
      name: genre,
      value: Math.round(minutes),
      percentage: 0 // Will be calculated
    }));

  // Calculate percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  chartData.forEach(item => {
    item.percentage = Math.round((item.value / total) * 100);
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-spotify-green">{`${data.value} minutes`}</p>
          <p className="text-gray-500">{`${data.percentage}% of listening time`}</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-sm text-gray-600 dark:text-gray-300">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};