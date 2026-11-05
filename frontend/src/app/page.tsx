'use client';

import { useEffect, useState } from 'react';
import { getDashboard } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (!stats) return <div className="text-center py-20 text-red-500">Failed to load dashboard</div>;

  const robotTypeData = Object.entries(stats.robots_by_type || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const taskStatusData = Object.entries(stats.tasks_by_status || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const statCards = [
    { label: 'Robots', value: stats.total_robots, color: 'bg-blue-500', icon: '🤖' },
    { label: 'Sensors', value: stats.total_sensors, color: 'bg-green-500', icon: '📡' },
    { label: 'Data Records', value: stats.total_data_records, color: 'bg-purple-500', icon: '📈' },
    { label: 'Tasks', value: stats.total_tasks, color: 'bg-amber-500', icon: '⚙️' },
    { label: 'Datasets', value: stats.total_datasets, color: 'bg-cyan-500', icon: '📦' },
    { label: 'Last 24h', value: stats.recent_24h_records, color: 'bg-pink-500', icon: '🕐' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{card.icon}</span>
              <span className="text-xs text-gray-500 uppercase font-medium">{card.label}</span>
            </div>
            <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Robots by Type</h2>
          {robotTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={robotTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">No robots registered yet</p>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Tasks by Status</h2>
          {taskStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {taskStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">No tasks yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
