import axios from 'axios';

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle errors globally
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// For this frontend-only application, we'll simulate API calls
// In a real app, these would make actual API requests

// Helper to simulate async API calls
const simulateApiCall = (data, delay = 500, shouldFail = false) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('API call failed'));
      } else {
        resolve(data);
      }
    }, delay);
  });
};

// API service object
export const api = {
  // Auth endpoints
  auth: {
    login: (username, password) => {
      // In a real app, this would call the API
      return simulateApiCall({ 
        user: { id: 1, name: 'John Doe', username },
        token: 'mock-token-123456'
      });
    },
    logout: () => {
      // Clear local storage token
      localStorage.removeItem('token');
      return simulateApiCall({});
    },
    getCurrentUser: () => {
      return simulateApiCall({ id: 1, name: 'John Doe', username: 'admin' });
    }
  },
  
  // Rooms endpoints
  rooms: {
    getAll: () => {
      return simulateApiCall([]);
    },
    getById: (id) => {
      return simulateApiCall({ id });
    },
    create: (data) => {
      return simulateApiCall({ id: Date.now(), ...data });
    },
    update: (id, data) => {
      return simulateApiCall({ id, ...data });
    },
    delete: (id) => {
      return simulateApiCall({ success: true });
    }
  },
  
  // Bookings endpoints
  bookings: {
    getAll: () => {
      return simulateApiCall([]);
    },
    getById: (id) => {
      return simulateApiCall({ id });
    },
    create: (data) => {
      return simulateApiCall({ id: Date.now(), ...data });
    },
    update: (id, data) => {
      return simulateApiCall({ id, ...data });
    },
    delete: (id) => {
      return simulateApiCall({ success: true });
    },
    cancel: (id) => {
      return simulateApiCall({ id, isCancelled: true });
    },
    checkout: (id) => {
      return simulateApiCall({ id, isCheckedOut: true });
    }
  },
  
  // Services endpoints
  services: {
    getAll: () => {
      return simulateApiCall([]);
    },
    getById: (id) => {
      return simulateApiCall({ id });
    },
    create: (data) => {
      return simulateApiCall({ id: Date.now(), ...data });
    },
    update: (id, data) => {
      return simulateApiCall({ id, ...data });
    },
    delete: (id) => {
      return simulateApiCall({ success: true });
    }
  },
  
  // Invoices endpoints
  invoices: {
    getAll: () => {
      return simulateApiCall([]);
    },
    getById: (id) => {
      return simulateApiCall({ id });
    },
    create: (data) => {
      return simulateApiCall({ id: Date.now(), ...data });
    },
    update: (id, data) => {
      return simulateApiCall({ id, ...data });
    },
    delete: (id) => {
      return simulateApiCall({ success: true });
    },
    markAsPaid: (id) => {
      return simulateApiCall({ id, status: 'paid' });
    }
  },
  
  // Feedback endpoints
  feedbacks: {
    getAll: () => {
      return simulateApiCall([]);
    },
    getById: (id) => {
      return simulateApiCall({ id });
    },
    create: (data) => {
      return simulateApiCall({ id: Date.now(), ...data });
    },
    update: (id, data) => {
      return simulateApiCall({ id, ...data });
    },
    delete: (id) => {
      return simulateApiCall({ success: true });
    },
    updateStatus: (id, status) => {
      return simulateApiCall({ id, status });
    }
  }
};

export default api;
