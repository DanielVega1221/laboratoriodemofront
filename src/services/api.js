const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error en la solicitud' }));
    throw new Error(error.error || 'Error en la solicitud');
  }
  return response.json();
};

// Auth
export const login = async (username, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return handleResponse(response);
};

// Patients
export const getPatients = async (search = '') => {
  const url = search ? `${API_URL}/patients?search=${search}` : `${API_URL}/patients`;
  const response = await fetch(url, { headers: getHeaders() });
  return handleResponse(response);
};

export const getPatient = async (id) => {
  const response = await fetch(`${API_URL}/patients/${id}`, { headers: getHeaders() });
  return handleResponse(response);
};

export const createPatient = async (data) => {
  const response = await fetch(`${API_URL}/patients`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const updatePatient = async (id, data) => {
  const response = await fetch(`${API_URL}/patients/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

// Orders
export const getOrders = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_URL}/orders?${query}` : `${API_URL}/orders`;
  const response = await fetch(url, { headers: getHeaders() });
  return handleResponse(response);
};

export const getOrder = async (id) => {
  const response = await fetch(`${API_URL}/orders/${id}`, { headers: getHeaders() });
  return handleResponse(response);
};

export const createOrder = async (data) => {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const updateOrder = async (id, data) => {
  const response = await fetch(`${API_URL}/orders/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const createProtocol = async (data) => {
  const response = await fetch(`${API_URL}/protocols`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)port const getProtocols = async () => {
  });  const response = await fetch(`${API_URL}/protocols`, { headers: getHeaders() });
  return handleResponse(response);
};

export const updateProtocol = async (id, data) => {l = async (data) => {
  const response = await fetch(`${API_URL}/protocols/${id}`, {(`${API_URL}/protocols`, {
    method: 'PUT',ethod: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)  body: JSON.stringify(data)
  });  });
  return handleResponse(response);
};

export const deleteProtocol = async (id) => {l = async (id, data) => {
  const response = await fetch(`${API_URL}/protocols/${id}`, {(`${API_URL}/protocols/${id}`, {
    method: 'DELETE',ethod: 'PUT',
    headers: getHeaders()
  });  body: JSON.stringify(data)
  return handleResponse(response);  });
};

// Results
export const createResult = async (data) => {ol = async (id) => {
  const response = await fetch(`${API_URL}/results`, {st response = await fetch(`${API_URL}/protocols/${id}`, {
    method: 'POST',
    headers: getHeaders(),  headers: getHeaders()
    body: JSON.stringify(data)  });
  });andleResponse(response);
  return handleResponse(response);
};

export const getResults = async (params = {}) => {= async (data) => {
  const query = new URLSearchParams(params).toString();(`${API_URL}/results`, {
  const url = query ? `${API_URL}/results?${query}` : `${API_URL}/results`;ethod: 'POST',
  const response = await fetch(url, { headers: getHeaders() });
  return handleResponse(response);  body: JSON.stringify(data)
};  });

// Reports
export const generateReport = async (orderId) => {
  const response = await fetch(`${API_URL}/reports/generate`, {
    method: 'POST',s(params).toString();
    headers: getHeaders(),const url = query ? `${API_URL}/results?${query}` : `${API_URL}/results`;
    body: JSON.stringify({ orderId })  const response = await fetch(url, { headers: getHeaders() });
  });andleResponse(response);
  return handleResponse(response);
};
  return handleResponse(response);
};
