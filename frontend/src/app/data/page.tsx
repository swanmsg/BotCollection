'use client';

import { useEffect, useState } from 'react';
import { queryData, getDataStats, getQualityReport, getSensors, getRobots } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DataPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [quality, setQuality] = useState<any>(null);
  const [sensors, setSensors] = useState<any[]>([]);
  const [robots, setRobots] = useState<any[]>([]);
  const [filters, setFilters] = useState({ sensor_id: '', robot_id: '', page_size: '50' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getSensors(), getRobots()]).then(([s, r]) => {
      setSensors(s);
      setRobots(r);
    });
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.sensor_id) params.sensor_id = filters.sensor_id;
      if (filters.robot_id) params.robot_id = filters.robot_id;
      params.page_size = filters.page_size;

      const [data, s, q] = await Promise.all([
        queryData(params),
        getDataStats(params.sensor_id ? { sensor_id: params.sensor_id } : undefined),
        getQualityReport(params.sensor_id ? { sensor_id: params.sensor_id } : undefined),
      ]);
      setRecords(data);
      setStats(s);
      setQuality(q);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const chartData = records.slice(0, 100).map((r, i) => {
    const val = r.data_value;
    let y = 0;
    if (typeof val === 'number') y = val;
    else if (val && typeof val === 'object') {
      const keys = Object.keys(val);
      if (keys.length > 0 && typeof val[keys[0]] === 'number') y = val[keys[0]];
    }
    return { index: i, value: y, quality: r.quality_score };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sensor Data</h1>

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs font-medium text-gray-600">Sensor</label>
            <select className="input-field mt-1" value={filters.sensor_id} onChange={(e) => setFilters({ ...filters, sensor_id: e.target.value })}>
              <option value="">All sensors</option>
              {sensors.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.sensor_type})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Robot</label>
            <select className="input-field mt-1" value={filters.robot_id} onChange={(e) => setFilters({ ...filters, robot_id: e.target.value })}>
              <option value="">All robots</option>
              {robots.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Limit</label>
            <select className="input-field mt-1" value={filters.page_size} onChange={(e) => setFilters({ ...filters, page_size: e.target.value })}>
              {[50, 100, 200, 500].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={loadData} disabled={loading}>
            {loading ? 'Loading...' : 'Query'}
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="text-xs text-gray-500">Total Records</div>
            <div className="text-xl font-bold">{(stats.total_records || 0).toLocaleString()}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-gray-500">Avg Quality</div>
            <div className="text-xl font-bold">{(stats.avg_quality || 0).toFixed(3)}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-gray-500">First Record</div>
            <div className="text-sm font-medium">{stats.first_record ? new Date(stats.first_record).toLocaleDateString() : '-'}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-gray-500">Last Record</div>
            <div className="text-sm font-medium">{stats.last_record ? new Date(stats.last_record).toLocaleDateString() : '-'}</div>
          </div>
        </div>
      )}

      {quality && (
        <div className="card p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Quality Report</h3>
          <div className="flex gap-6 text-sm">
            <span>Low quality count: <strong>{quality.low_quality_count}</strong></span>
            <span>Min quality: <strong>{quality.min_quality?.toFixed(3)}</strong></span>
            <span>Max quality: <strong>{quality.max_quality?.toFixed(3)}</strong></span>
            {quality.quality_flags && Object.keys(quality.quality_flags).length > 0 && (
              <span>Flags: {Object.entries(quality.quality_flags).map(([k, v]) => `${k}(${v})`).join(', ')}</span>
            )}
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Data Preview (First Channel)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="index" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Records ({records.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 font-medium">Timestamp</th>
                <th className="pb-2 font-medium">Sensor ID</th>
                <th className="pb-2 font-medium">Quality</th>
                <th className="pb-2 font-medium">Data Value</th>
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 50).map((r, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2">{new Date(r.timestamp).toLocaleString()}</td>
                  <td className="py-2 font-mono text-xs">{r.sensor_id?.slice(0, 8)}...</td>
                  <td className="py-2">
                    <span className={r.quality_score >= 0.8 ? 'badge-green' : r.quality_score >= 0.5 ? 'badge-yellow' : 'badge-red'}>
                      {r.quality_score?.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2 text-xs font-mono max-w-xs truncate">{JSON.stringify(r.data_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
