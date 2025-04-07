const API_BASE_URL = 'http://localhost:8000';

export const checkBackendHealth = async () => {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.ok;
};

export const fetchModels = async () => {
  const res = await fetch(`${API_BASE_URL}/api/models`);
  if (!res.ok) throw new Error('Failed to fetch models');
  return res.json();
};

export const generateResponse = async (model, prompt) => {
  const res = await fetch(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt }),
  });
  if (!res.ok) throw new Error('Failed to generate response');
  return res.json();
};
