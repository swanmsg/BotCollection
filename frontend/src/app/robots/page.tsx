'use client';

import { useEffect, useState } from 'react';
import { getRobots, createRobot, deleteRobot } from '@/lib/api';

const ROBOT_TYPES = ['robot_arm', 'humanoid', 'unitree_g1', 'agibot_g1', 'agibot_x2', 'dexterous_hand', 'electronic_skin', 'custom'];
const TYPE_LABELS: Record<string, string> = {
  robot_arm: '机械臂',
  humanoid: '人形机器人',
  unitree_g1: 'Unitree G1',
  agibot_g1: 'AgiBot G1',
  agibot_x2: 'AgiBot X2',
  dexterous_hand: '灵巧手',
  electronic_skin: '电子皮肤',
  custom: '自定义',
};

export default function RobotsPage() {
  const [robots, setRobots] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', robot_type: 'robot_arm', manufacturer: '', model: '', description: '' });

  const load = () => getRobots().then(setRobots).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRobot(form);
    setShowForm(false);
    setForm({ name: '', robot_type: 'robot_arm', manufacturer: '', model: '', description: '' });
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this robot?')) {
      await deleteRobot(id);
      load();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Robots</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Robot'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name *</label>
              <input
                className="input-field mt-1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Type *</label>
              <select
                className="input-field mt-1"
                value={form.robot_type}
                onChange={(e) => setForm({ ...form, robot_type: e.target.value })}
              >
                {ROBOT_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Manufacturer</label>
              <input
                className="input-field mt-1"
                value={form.manufacturer}
                onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Model</label>
              <input
                className="input-field mt-1"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="input-field mt-1"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary mt-4">Create Robot</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {robots.map((robot) => (
          <div key={robot.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{robot.name}</h3>
                <span className="badge-blue mt-1">{TYPE_LABELS[robot.robot_type] || robot.robot_type}</span>
              </div>
              <span className={robot.status === 'online' ? 'badge-green' : 'badge-gray'}>
                {robot.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{robot.manufacturer} {robot.model}</p>
            {robot.description && (
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">{robot.description}</p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                className="text-xs text-red-500 hover:text-red-700"
                onClick={() => handleDelete(robot.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {robots.length === 0 && (
          <p className="text-gray-400 col-span-full text-center py-10">No robots registered. Add one to get started.</p>
        )}
      </div>
    </div>
  );
}
