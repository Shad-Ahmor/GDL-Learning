const API_BASE_URL = 'http://localhost:1422/api';

export const api = {
  // Students
  getStudents: async () => {
    const res = await fetch(`${API_BASE_URL}/students`);
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },
  
  // Finance / Fees
  getTransactions: async () => {
    const res = await fetch(`${API_BASE_URL}/finance/transactions`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },
  
  addStudent: async (data) => {
    return api.post('/students', data);
  },

  deleteStudent: async (id) => {
    const res = await fetch(`${API_BASE_URL}/students/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete student');
    return res.json();
  },

  // HR / Employees
  getEmployees: async () => {
    const res = await fetch(`${API_BASE_URL}/hr/employees`);
    if (!res.ok) throw new Error('Failed to fetch employees');
    return res.json();
  },
  
  addEmployee: async (data) => {
    return api.post('/hr/employees', data);
  },

  // Generic catch-all for simple requests in the future
  get: async (endpoint) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return res.json();
  },
  
  post: async (endpoint, data) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to post ${endpoint}`);
    return res.json();
  }
};
