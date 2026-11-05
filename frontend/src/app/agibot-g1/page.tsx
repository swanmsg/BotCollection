'use client';

import { useState } from 'react';

const G1_SPECS = {
  joints: 40,
  dofs: 40,
  height: '165cm',
  weight: '62kg',
  max_speed: '3.5m/s',
  battery: '72V/30Ah',
  arm_reach: '70cm',
  payload: '5kg per arm',
  sensors: [
    { name: 'Livox Mid-360 LiDAR', type: 'lidar', location: 'head', specs: '360 FoV, 200K pts/s, 40m range' },
    { name: 'Intel RealSense D455', type: 'camera', location: 'head (stereo)', specs: 'RGB-D, 1920x1080, 90fps' },
    { name: 'Force Torque Sensor x6', type: 'force_torque', location: 'wrists + ankles + hips', specs: '6-axis, 1KHz' },
    { name: 'IMU x4', type: 'imu', location: 'torso/head/feet', specs: '9-axis, 1KHz' },
    { name: 'Joint Encoders x40', type: 'joint_encoder', location: 'all joints', specs: 'Absolute encoder, 1KHz' },
    { name: 'Tactile Fingertip Sensor x10', type: 'tactile', location: 'fingers', specs: 'Taxel array, 500Hz' },
    { name: 'Foot Pressure Insole x2', type: 'pressure', location: 'soles', specs: '64 taxels, 500Hz' },
    { name: 'Mic Array x4', type: 'audio', location: 'head', specs: '4-channel beamforming, 16kHz' },
  ],
  dataStreams: [
    'Joint positions (40 DoF)',
    'Joint velocities (40 DoF)',
    'Joint torques (40 DoF)',
    'IMU orientation (quaternion) x4',
    'IMU angular velocity x4',
    'IMU linear acceleration x4',
    'Wrist force/torque (6-axis) x2',
    'Ankle force/torque (6-axis) x2',
    'Hip force/torque (6-axis) x2',
    'Fingertip tactile (10x 24-taxel)',
    'Foot pressure (2x 64-taxel)',
    'LiDAR point cloud (200K pts/s)',
    'Stereo RGB-D frames (dual camera)',
    'Audio mic array (4-channel)',
  ],
  sdk: {
    name: 'AgiBot SDK',
    protocol: 'UDP + ROS2',
    frequency: '1000Hz (joint control)',
    api: 'Python / C++',
  },
};

export default function AgiBotG1Page() {
  const [activeTab, setActiveTab] = useState<'specs' | 'sensors' | 'streams' | 'sdk'>('specs');

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
          A1
        </div>
        <div>
          <h1 className="text-2xl font-bold">AgiBot G1</h1>
          <p className="text-sm text-gray-500">Full-size Humanoid Robot - Sensor Configuration</p>
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
          { label: 'Arm Reach', value: G1_SPECS.arm_reach },
          { label: 'Payload', value: G1_SPECS.payload },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <div className="text-xs text-gray-500 uppercase">{item.label}</div>
            <div className="text-lg font-bold mt-1">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {(['specs', 'sensors', 'streams', 'sdk'] as const).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === tab ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'specs' ? 'Specifications' : tab === 'sensors' ? 'Sensors' : tab === 'streams' ? 'Data Streams' : 'SDK'}
          </button>
        ))}
      </div>

      {activeTab === 'specs' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">AgiBot G1 Specifications</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Mechanical</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Height</dt><dd className="font-medium">165 cm</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Weight</dt><dd className="font-medium">62 kg</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Degrees of Freedom</dt><dd className="font-medium">40</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Joint Count</dt><dd className="font-medium">40</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Max Walking Speed</dt><dd className="font-medium">3.5 m/s</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Arm Reach</dt><dd className="font-medium">70 cm</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Payload per Arm</dt><dd className="font-medium">5 kg</dd></div>
              </dl>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Computing</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Main Processor</dt><dd className="font-medium">Intel i9-13900H</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">GPU</dt><dd className="font-medium">NVIDIA RTX 4060</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">AI Accelerator</dt><dd className="font-medium">NPU 45 TOPS</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Edge MCU</dt><dd className="font-medium">STM32H7 x3</dd></div>
              </dl>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Power</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Battery</dt><dd className="font-medium">72V / 30Ah LiPo</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Capacity</dt><dd className="font-medium">2160 Wh</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Runtime</dt><dd className="font-medium">~2.5 hours</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Charging</dt><dd className="font-medium">Fast charge 2h</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Connectivity</dt><dd className="font-medium">WiFi 6E, 5G, BT 5.3</dd></div>
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
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium">{stream}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sdk' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">AgiBot SDK Integration</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">SDK Name</dt><dd className="font-medium">{G1_SPECS.sdk.name}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Protocol</dt><dd className="font-medium">{G1_SPECS.sdk.protocol}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Control Frequency</dt><dd className="font-medium">{G1_SPECS.sdk.frequency}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">API Languages</dt><dd className="font-medium">{G1_SPECS.sdk.api}</dd></div>
              </dl>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2">Quick Start</h3>
              <pre className="text-xs text-gray-700 overflow-x-auto">
{`# Install AgiBot SDK
pip install agibot-sdk

# Connect to G1
from agibot import AgiBot
bot = AgiBot(ip="192.168.1.100")

# Read joint states
state = bot.get_joint_states()
print(state.position, state.velocity)

# Stream sensor data
for data in bot.stream_sensors():
    process(data)`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
