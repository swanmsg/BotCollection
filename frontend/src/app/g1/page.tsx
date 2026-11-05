'use client';

import { useState } from 'react';

const G1_SPECS = {
  joints: 23,
  dofs: 43,
  height: '127cm',
  weight: '35kg',
  max_speed: '2m/s',
  battery: '9000mAh',
  sensors: [
    { name: 'Intel RealSense D435i', type: 'camera', location: 'head', specs: 'RGB-D, 1280x720, 90fps' },
    { name: 'Force Torque Sensor x2', type: 'force_torque', location: 'ankles', specs: '6-axis, 200Hz' },
    { name: 'IMU x3', type: 'imu', location: 'torso/head/feet', specs: '9-axis, 400Hz' },
    { name: 'Joint Encoders x23', type: 'joint_encoder', location: 'all joints', specs: 'Position + velocity, 500Hz' },
    { name: 'Foot Pressure Array x2', type: 'pressure', location: 'soles', specs: '32 taxels, 200Hz' },
  ],
  dataStreams: [
    'Joint positions (23 DoF)',
    'Joint velocities (23 DoF)',
    'Joint torques (23 DoF)',
    'IMU orientation (quaternion)',
    'IMU angular velocity',
    'IMU linear acceleration',
    'Foot pressure distribution',
    'Depth camera point cloud',
    'RGB camera frames',
  ],
};

export default function G1Page() {
  const [activeTab, setActiveTab] = useState<'specs' | 'sensors' | 'streams'>('specs');

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
          G1
        </div>
        <div>
          <h1 className="text-2xl font-bold">Unitree G1</h1>
          <p className="text-sm text-gray-500">Humanoid Robot - Sensor Configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Joints', value: G1_SPECS.joints },
          { label: 'DoFs', value: G1_SPECS.dofs },
          { label: 'Height', value: G1_SPECS.height },
          { label: 'Weight', value: G1_SPECS.weight },
          { label: 'Max Speed', value: G1_SPECS.max_speed },
          { label: 'Battery', value: G1_SPECS.battery },
          { label: 'Sensors', value: G1_SPECS.sensors.length },
          { label: 'Data Streams', value: G1_SPECS.dataStreams.length },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <div className="text-xs text-gray-500 uppercase">{item.label}</div>
            <div className="text-lg font-bold mt-1">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {(['specs', 'sensors', 'streams'] as const).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'specs' ? 'Specifications' : tab === 'sensors' ? 'Sensors' : 'Data Streams'}
          </button>
        ))}
      </div>

      {activeTab === 'specs' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Unitree G1 Specifications</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Mechanical</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Height</dt><dd className="font-medium">127 cm</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Weight</dt><dd className="font-medium">35 kg</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Degrees of Freedom</dt><dd className="font-medium">43</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Joint Count</dt><dd className="font-medium">23</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Max Walking Speed</dt><dd className="font-medium">2 m/s</dd></div>
              </dl>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Computing</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Main Processor</dt><dd className="font-medium">AMD Ryzen</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">GPU</dt><dd className="font-medium">NVIDIA Jetson</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Battery</dt><dd className="font-medium">9000mAh LiPo</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Runtime</dt><dd className="font-medium">~2 hours</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Connectivity</dt><dd className="font-medium">WiFi 6, Bluetooth 5.2</dd></div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sensors' && (
        <div className="space-y-4">
          {G1_SPECS.sensors.map((sensor, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{sensor.name}</h3>
                  <span className="badge-blue mt-1">{sensor.type}</span>
                </div>
                <span className="badge-gray">{sensor.location}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{sensor.specs}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'streams' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Available Data Streams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {G1_SPECS.dataStreams.map((stream, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">{stream}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Integration Notes</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>- Connect via Unitree SDK2 over UDP at 500Hz for joint data</li>
              <li>- Depth camera streams via ROS2 topics or direct USB</li>
              <li>- IMU data available at 400Hz via internal bus</li>
              <li>- Foot pressure sensors polled at 200Hz via ADC</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
