'use client';

import { useEffect, useState } from 'react';
import { getSensors, getRobots, createSensor, deleteSensor } from '@/lib/api';

const SENSOR_TYPES = ['force_torque', 'imu', 'proximity', 'tactile', 'camera', 'lidar', 'joint_encoder', 'pressure', 'temperature', 'emg', 'gripper_force', 'wrist_camera'];
const DATA_FORMATS = ['scalar', 'vector', 'matrix', 'point_cloud', 'image', 'audio'];

export default function SensorsPage() {
  const [sensors, setSensors] = useState<any[]>([]);
  const [robots, setRobots] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    robot_id: '', name: '', sensor_type: 'force_torque', data_format: 'vector',
    sampling_rate_hz: '', unit: '',
  });

  const load = async () => {
    const [s, r] = await Promise.all([getSensors(), getRobots()]);
    setSensors(s);
    setRobots(r);
    if (r.length > 0 && !form.robot_id) setForm((f) => ({ ...f, robot_id: r[0].id }));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSensor({
      ...form,
      sampling_rate_hz: form.sampling_rate_hz ? parseFloat(form.sampling_rate_hz as string) : null,
    });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this sensor?')) {
      await deleteSensor(id);
      load();
    }
  };

  const getRobotName = (id: string) => robots.find((r) => r.id === id)?.name || id.slice(0, 8);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sensors</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Sensor'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Robot *</label>
              <select
                className="input-field mt-1"
                value={form.robot_id}
                onChange={(e) => setForm({ ...form, robot_id: e.target.value })}
              >
                {robots.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Name *</label>
              <input className="input-field mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Sensor Type *</label>
              <select className="input-field mt-1" value={form.sensor_type} onChange={(e) => setForm({ ...form, sensor_type: e.target.value })}>
                {SENSOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Data Format *</label>
              <select className="input-field mt-1" value={form.data_format} onChange={(e) => setForm({ ...form, data_format: e.target.value })}>
                {DATA_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Sampling Rate (Hz)</label>
              <input className="input-field mt-1" type="number" value={form.sampling_rate_hz} onChange={(e) => setForm({ ...form, sampling_rate_hz: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Unit</label>
              <input className="input-field mt-1" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="N, m/s^2, Pa..." />
            </div>
          </div>
          <button type="submit" className="btn-primary mt-4">Create Sensor</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((sensor) => (
          <div key={sensor.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{sensor.name}</h3>
                <span className="badge-green mt-1">{sensor.sensor_type}</span>
              </div>
              <span className={sensor.status === 'active' ? 'badge-green' : 'badge-gray'}>{sensor.status}</span>
            </div>
            <div className="text-sm text-gray-500 mt-2 space-y-1">
              <p>Robot: {getRobotName(sensor.robot_id)}</p>
              <p>Format: {sensor.data_format}</p>
              {sensor.sampling_rate_hz && <p>Rate: {sensor.sampling_rate_hz} Hz</p>}
              {sensor.unit && <p>Unit: {sensor.unit}</p>}
            </div>
            <div className="mt-3">
              <button className="text-xs text-red-500 hover:text-red-700" onClick={() => handleDelete(sensor.id)}>Delete</button>
            </div>
          </div>
        ))}
        {sensors.length === 0 && (
          <p className="text-gray-400 col-span-full text-center py-10">No sensors registered yet.</p>
        )}
      </div>
    </div>
  );
}
