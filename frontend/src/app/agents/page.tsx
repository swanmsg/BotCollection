'use client';

const agents = [
  {
    name: 'DataQualityAgent',
    description: 'Evaluate sensor data quality, detect anomalies and missing data',
    capabilities: ['Outlier detection', 'Missing value detection', 'NaN/Inf detection', 'Timestamp validation', 'Batch quality scoring'],
    icon: 'Q',
  },
  {
    name: 'AutoAnnotationAgent',
    description: 'Automatically generate semantic annotations for sensor data (supports Unitree G1, AgiBot G1, AgiBot X2, robot arms, dexterous hands)',
    capabilities: ['Force/tactile pattern recognition', 'Motion state detection', 'Pressure level classification', 'Joint action primitives', 'Image metadata annotation', 'Temperature monitoring', 'Proximity detection', 'EMG muscle activation'],
    icon: 'A',
  },
  {
    name: 'DataPreprocessingAgent',
    description: 'Execute sensor data preprocessing pipelines',
    capabilities: ['Outlier removal', 'Data normalization', 'Sliding window smoothing', 'Downsampling', 'Missing value filling', 'Denoising'],
    icon: 'P',
  },
];

export default function AgentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">AgentScope Agents</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {agents.map((agent) => (
          <div key={agent.name} className="card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                {agent.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{agent.name}</h3>
                <p className="text-xs text-gray-500">AgentScope Agent</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase">Capabilities</h4>
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.map((cap) => (
                  <span key={cap} className="badge-blue">{cap}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Architecture</h2>
        <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm overflow-x-auto">
          <pre className="text-gray-700">
{`+-------------------------------------------+
|              Next.js Frontend              |
|   Dashboard | Robots | Sensors | Data      |
+-------------------------------------------+
                    |
                    v
+-------------------------------------------+
|             FastAPI Backend                |
|   REST API + WebSocket Streaming           |
+-------------------------------------------+
         |              |              |
         v              v              v
+----------+  +-----------+  +-------------+
| Quality  |  |  Auto     |  | Preprocess  |
| Agent    |  | Annotate  |  | Agent       |
|          |  | Agent     |  |             |
+----------+  +-----------+  +-------------+
         |              |              |
         v              v              v
+-------------------------------------------+
|           PostgreSQL Database              |
|  robots | sensors | sensor_data | datasets |
|  tasks  | annotations | pipelines          |
+-------------------------------------------+`}
          </pre>
        </div>
      </div>
    </div>
  );
}
