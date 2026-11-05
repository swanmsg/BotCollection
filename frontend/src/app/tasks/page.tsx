'use client';

import { useEffect, useState } from 'react';
import { getTasks, createTask, startTask, stopTask, annotateTask, preprocessTask, getRobots, getSensors } from '@/lib/api';

const TASK_TYPES = ['realtime_streaming', 'batch_recording', 'triggered_capture'];

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [robots, setRobots] = useState<any[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', robot_id: '', task_type: 'batch_recording', description: '' });
  const [results, setResults] = useState<Record<string, any>>({});

  const load = async () => {
    const [t, r, s] = await Promise.all([getTasks(), getRobots(), getSensors()]);
    setTasks(t);
    setRobots(r);
    setSensors(s);
    if (r.length > 0 && !form.robot_id) setForm((f) => ({ ...f, robot_id: r[0].id }));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask({ ...form, config: {}, sensor_ids: [] });
    setShowForm(false);
    setForm({ name: '', robot_id: form.robot_id, task_type: 'batch_recording', description: '' });
    load();
  };

  const handleAction = async (taskId: string, action: string) => {
    try {
      let result: any;
      switch (action) {
        case 'start': result = await startTask(taskId); break;
        case 'stop': result = await stopTask(taskId); break;
        case 'annotate': result = await annotateTask(taskId); break;
        case 'preprocess': result = await preprocessTask(taskId); break;
      }
      setResults((prev) => ({ ...prev, [`${taskId}-${action}`]: result }));
      load();
    } catch (e: any) {
      setResults((prev) => ({ ...prev, [`${taskId}-${action}`]: { error: e.message } }));
    }
  };

  const getRobotName = (id: string) => robots.find((r) => r.id === id)?.name || id.slice(0, 8);

  const statusColor = (s: string) => {
    if (s === 'running') return 'badge-green';
    if (s === 'completed') return 'badge-blue';
    if (s === 'failed') return 'badge-red';
    return 'badge-gray';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Collection Tasks</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name *</label>
              <input className="input-field mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Robot *</label>
              <select className="input-field mt-1" value={form.robot_id} onChange={(e) => setForm({ ...form, robot_id: e.target.value })}>
                {robots.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Task Type</label>
              <select className="input-field mt-1" value={form.task_type} onChange={(e) => setForm({ ...form, task_type: e.target.value })}>
                {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <input className="input-field mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary mt-4">Create Task</button>
        </form>
      )}

      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{task.name}</h3>
                <div className="flex gap-2 mt-1">
                  <span className={statusColor(task.status)}>{task.status}</span>
                  <span className="badge-blue">{task.task_type}</span>
                </div>
              </div>
              <div className="text-sm text-gray-500">{getRobotName(task.robot_id)}</div>
            </div>
            {task.description && <p className="text-sm text-gray-400 mt-2">{task.description}</p>}
            <div className="flex gap-2 mt-3 flex-wrap">
              {task.status === 'pending' && (
                <button className="btn-primary text-xs py-1" onClick={() => handleAction(task.id, 'start')}>Start</button>
              )}
              {task.status === 'running' && (
                <button className="btn-secondary text-xs py-1" onClick={() => handleAction(task.id, 'stop')}>Stop</button>
              )}
              <button className="btn-secondary text-xs py-1" onClick={() => handleAction(task.id, 'annotate')}>
                Auto-Annotate
              </button>
              <button className="btn-secondary text-xs py-1" onClick={() => handleAction(task.id, 'preprocess')}>
                Preprocess
              </button>
            </div>
            {Object.entries(results).filter(([k]) => k.startsWith(task.id)).map(([k, v]) => (
              <div key={k} className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
                {v.error ? <span className="text-red-500">{v.error}</span> : <pre>{JSON.stringify(v, null, 2)}</pre>}
              </div>
            ))}
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-gray-400 text-center py-10">No tasks yet. Create one to start collecting data.</p>
        )}
      </div>
    </div>
  );
}
