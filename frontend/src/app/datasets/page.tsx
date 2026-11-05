'use client';

import { useEffect, useState } from 'react';
import { getDatasets, createDataset, exportDataset } from '@/lib/api';

const ROBOT_TYPES = ['robot_arm', 'humanoid', 'unitree_g1', 'agibot_g1', 'agibot_x2', 'dexterous_hand', 'electronic_skin'];
const SENSOR_TYPES = ['force_torque', 'imu', 'tactile', 'pressure', 'camera', 'joint_encoder'];

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', tags: '', robot_types: [] as string[], sensor_types: [] as string[],
  });

  const load = () => getDatasets().then(setDatasets).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDataset({
      ...form,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
    });
    setShowForm(false);
    setForm({ name: '', description: '', tags: '', robot_types: [], sensor_types: [] });
    load();
  };

  const handleExport = async (id: string, format: string) => {
    try {
      const result = await exportDataset(id, format);
      alert(`Exported! File: ${result.file_path}\nSamples: ${result.total_samples}\nSize: ${(result.size_bytes / 1024).toFixed(1)} KB`);
      load();
    } catch (e: any) {
      alert(`Export failed: ${e.message}`);
    }
  };

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Datasets</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Dataset'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Name *</label>
              <input className="input-field mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Dexterous Hand Manipulation v1" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea className="input-field mt-1" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Tags (comma separated)</label>
              <input className="input-field mt-1" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="manipulation, force, tactile" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Robot Types</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ROBOT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`text-xs px-2 py-1 rounded border ${form.robot_types.includes(t) ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600'}`}
                    onClick={() => setForm({ ...form, robot_types: toggleArrayItem(form.robot_types, t) })}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Sensor Types</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {SENSOR_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`text-xs px-2 py-1 rounded border ${form.sensor_types.includes(t) ? 'bg-green-100 border-green-300 text-green-700' : 'border-gray-300 text-gray-600'}`}
                    onClick={() => setForm({ ...form, sensor_types: toggleArrayItem(form.sensor_types, t) })}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary mt-4">Create Dataset</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {datasets.map((ds) => (
          <div key={ds.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{ds.name}</h3>
                <span className={ds.status === 'ready' ? 'badge-green' : ds.status === 'processing' ? 'badge-yellow' : 'badge-gray'}>
                  {ds.status}
                </span>
              </div>
              <span className="text-xs text-gray-400">v{ds.version}</span>
            </div>
            {ds.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{ds.description}</p>}
            <div className="flex flex-wrap gap-1 mt-2">
              {(ds.tags || []).map((tag: string) => (
                <span key={tag} className="badge-gray">{tag}</span>
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {(ds.total_samples || 0).toLocaleString()} samples · {(ds.size_bytes / 1024).toFixed(1)} KB
            </div>
            <div className="flex gap-2 mt-3">
              <button className="btn-primary text-xs py-1" onClick={() => handleExport(ds.id, 'jsonl')}>Export JSONL</button>
              <button className="btn-secondary text-xs py-1" onClick={() => handleExport(ds.id, 'csv')}>Export CSV</button>
            </div>
          </div>
        ))}
        {datasets.length === 0 && (
          <p className="text-gray-400 col-span-full text-center py-10">No datasets yet.</p>
        )}
      </div>
    </div>
  );
}
