'use client';

import { useState } from 'react';

const X2_SPECS = {
  joints: 12,
  dofs: 12,
  height: '65cm',
  weight: '35kg',
  max_speed: '3m/s',
  battery: '48V/20Ah',
  payload: '10kg',
  terrain: 'outdoor_rough',
  sensors: [
    { name: 'Livox Avia LiDAR', type: 'lidar', location: 'head', specs: '200K pts/s, 450K pts/frame, 360x59 FoV' },
    { name: 'Stereo Camera x2', type: 'camera', location: 'head (stereo pair)', specs: '1280x800, 60fps, global shutter' },
    { name: 'RGB Camera x1', type: 'camera', location: 'head', specs: '1920x1080, 30fps' },
    { name: 'Force Torque Sensor x12', type: 'force_torque', location: 'each leg joint', specs: '6-axis, 1KHz' },
    { name: 'IMU x2', type: 'imu', location: 'torso + head', specs: '9-axis, 1KHz, vibration filtered' },
    { name: 'Joint Encoders x12', type: 'joint_encoder', location: 'all leg joints', specs: 'Absolute encoder + motor encoder, 1KHz' },
    { name: 'Foot Force Sensor x4', type: 'pressure', location: 'paw pads', specs: '3-axis force, 1KHz' },
    { name: 'Ultrasonic Sensor x4', type: 'proximity', location: 'body sides', specs: '2cm-4m range, 10Hz' },
    { name: 'GNSS/IMU Fusion', type: 'imu', location: 'torso', specs: 'RTK GPS + INS, 10Hz' },
    { name: 'Temperature Sensor x6', type: 'temperature', location: 'motor joints', specs: 'NTC 100K, 1Hz' },
  ],
  dataStreams: [
    'Joint positions (12 DoF)',
    'Joint velocities (12 DoF)',
    'Joint torques (12 DoF)',
    'Motor currents (12ch)',
    'IMU orientation (quaternion) x2',
    'IMU angular velocity x2',
    'IMU linear acceleration x2',
    'Foot force (3-axis) x4',
    'LiDAR point cloud',
    'Stereo depth map',
    'RGB camera frames',
    'Ultrasonic distance x4',
    'Motor temperature x6',
    'GNSS position (lat/lon/alt)',
    'Battery voltage / current',
  ],
  sdk: {
    name: 'AgiBot Legged SDK',
    protocol: 'UDP + CAN bus',
    frequency: '1KHz (joint control)',
    api: 'Python / C++ / ROS2',
    locomotion: 'Reinforcement Learning gait controller',
  },
};

export default function AgiBotX2Page() {
  const [activeTab, setActiveTab] = useState<'specs' | 'sensors' | 'streams' | 'sdk'>('specs');

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
          X2
        </div>
        <div>
          <h1 className="text-2xl font-bold">AgiBot X2</h1>
          <p className="text-sm text-gray-500">Quadruped Robot - Sensor Configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Joints', value: X2_SPECS.joints },
          { label: 'DoFs', value: X2_SPECS.dofs },
          { label: 'Height', value: X2_SPECS.height },
          { label: 'Weight', value: X2_SPECS.weight },
          { label: 'Max Speed', value: X2_SPECS.max_speed },
          { label: 'Battery', value: X2_SPECS.battery },
          { label: 'Payload', value: X2_SPECS.payload },
          { label: 'Sensors', value: X2_SPECS.sensors.length },
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
              activeTab === tab ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'specs' ? 'Specifications' : tab === 'sensors' ? 'Sensors' : tab === 'streams' ? 'Data Streams' : 'SDK'}
          </button>
        ))}
      </div>

      {activeTab === 'specs' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">AgiBot X2 Specifications</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Mechanical</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Type</dt><dd className="font-medium">Quadruped</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Height</dt><dd className="font-medium">65 cm</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Weight</dt><dd className="font-medium">35 kg</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Degrees of Freedom</dt><dd className="font-medium">12 (3 per leg)</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Max Walking Speed</dt><dd className="font-medium">3 m/s</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Payload</dt><dd className="font-medium">10 kg</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Terrain</dt><dd className="font-medium">Outdoor rough terrain</dd></div>
              </dl>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Computing</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Main Processor</dt><dd className="font-medium">Qualcomm Snapdragon</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Edge MCU</dt><dd className="font-medium">STM32H7 x2</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Gait Controller</dt><dd className="font-medium">RL-based MPC</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">SLAM</dt><dd className="font-medium">LiDAR-inertial odometry</dd></div>
              </dl>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Power</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Battery</dt><dd className="font-medium">48V / 20Ah LiPo</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Capacity</dt><dd className="font-medium">960 Wh</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Runtime</dt><dd className="font-medium">~3 hours</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Connectivity</dt><dd className="font-medium">WiFi 6, 4G LTE, BT 5.2</dd></div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sensors' && (
        <div className="space-y-4">
          {X2_SPECS.sensors.map((sensor, i) => (
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
            {X2_SPECS.dataStreams.map((stream, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">{stream}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sdk' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">AgiBot Legged SDK</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">SDK Name</dt><dd className="font-medium">{X2_SPECS.sdk.name}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Protocol</dt><dd className="font-medium">{X2_SPECS.sdk.protocol}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Control Frequency</dt><dd className="font-medium">{X2_SPECS.sdk.frequency}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">API Languages</dt><dd className="font-medium">{X2_SPECS.sdk.api}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Locomotion</dt><dd className="font-medium">{X2_SPECS.sdk.locomotion}</dd></div>
              </dl>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2">Quick Start</h3>
              <pre className="text-xs text-gray-700 overflow-x-auto">
{`# Install AgiBot Legged SDK
pip install agibot-legged-sdk

# Connect to X2
from agibot_legged import AgiBotX2
bot = AgiBotX2(ip="192.168.1.101")

# Read joint states
state = bot.get_joint_states()
print(state.position, state.velocity)

# Stream sensor data
for data in bot.stream_sensors():
    process(data)

# RL gait control
bot.set_gait("trot", speed=1.5)`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
