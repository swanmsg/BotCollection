async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API Error ${res.status}: ${err}`);
  }
  return res.json();
}

// Dashboard
export const getDashboard = () => fetchAPI<any>('/api/dashboard');

// Robots
export const getRobots = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchAPI<any[]>(`/api/robots${qs}`);
};
export const getRobot = (id: string) => fetchAPI<any>(`/api/robots/${id}`);
export const createRobot = (data: any) =>
  fetchAPI<any>('/api/robots', { method: 'POST', body: JSON.stringify(data) });
export const deleteRobot = (id: string) =>
  fetchAPI<void>(`/api/robots/${id}`, { method: 'DELETE' });

// Sensors
export const getSensors = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchAPI<any[]>(`/api/sensors${qs}`);
};
export const createSensor = (data: any) =>
  fetchAPI<any>('/api/sensors', { method: 'POST', body: JSON.stringify(data) });
export const deleteSensor = (id: string) =>
  fetchAPI<void>(`/api/sensors/${id}`, { method: 'DELETE' });

// Sensor Data
export const ingestData = (records: any[]) =>
  fetchAPI<any[]>('/api/data', {
    method: 'POST',
    body: JSON.stringify({ records }),
  });
export const queryData = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchAPI<any[]>(`/api/data${qs}`);
};
export const getDataStats = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchAPI<any>(`/api/data/stats${qs}`);
};
export const getQualityReport = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchAPI<any>(`/api/data/quality-report${qs}`);
};

// Tasks
export const getTasks = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchAPI<any[]>(`/api/tasks${qs}`);
};
export const createTask = (data: any) =>
  fetchAPI<any>('/api/tasks', { method: 'POST', body: JSON.stringify(data) });
export const startTask = (id: string) =>
  fetchAPI<any>(`/api/tasks/${id}/start`, { method: 'POST' });
export const stopTask = (id: string) =>
  fetchAPI<any>(`/api/tasks/${id}/stop`, { method: 'POST' });
export const annotateTask = (id: string) =>
  fetchAPI<any>(`/api/tasks/${id}/annotate`, { method: 'POST' });
export const preprocessTask = (id: string, steps?: any[]) =>
  fetchAPI<any>(`/api/tasks/${id}/preprocess`, {
    method: 'POST',
    body: JSON.stringify(steps || []),
  });

// Datasets
export const getDatasets = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchAPI<any[]>(`/api/datasets${qs}`);
};
export const getDataset = (id: string) => fetchAPI<any>(`/api/datasets/${id}`);
export const createDataset = (data: any) =>
  fetchAPI<any>('/api/datasets', { method: 'POST', body: JSON.stringify(data) });
export const exportDataset = (id: string, format: string = 'jsonl') =>
  fetchAPI<any>(`/api/datasets/${id}/export?format=${format}`, { method: 'POST' });
