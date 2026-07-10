const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.detail ?? `Server returned status ${response.status}`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return response.json();
}

export function checkBackendHealth() {
  return apiRequest('/api/health');
}

export function submitAnswers(businessType, answers) {
  return apiRequest('/api/submit-answers', {
    method: 'POST',
    body: JSON.stringify({
      business_type: businessType,
      answers,
    }),
  });
}
