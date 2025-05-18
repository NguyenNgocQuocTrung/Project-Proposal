import axios from 'axios';

// Create a configured axios instance
const apiClient = axios.create({
  // Spring Boot API base URL with v1 endpoint
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // KHÔNG gửi token cho API login hoặc register
    if (
      !config.url.endsWith('/auth/login') &&
      !config.url.endsWith('/auth/register')
    ) {
      const authData = localStorage.getItem('hotelAuth');
      if (authData) {
        try {
          // Lưu ý: bạn lưu là token, không phải accessToken
          const { token } = JSON.parse(authData);
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        } catch (e) {
          console.error('Error parsing auth data:', e);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors and transforming data
apiClient.interceptors.response.use(
  (response) => {
    // Check if response has the Spring Boot format
    if (response.data && typeof response.data.code !== 'undefined' && typeof response.data.message !== 'undefined') {
      const data = response.data.result;

      // Xử lý đặc biệt cho API booking detail
      if ( response.config.url.includes('/detail')) {
        return { ...response, data: data };
      }

      // Xử lý cho các API khác
      if (data && data.listResult) {
        return { ...response, data: data.listResult };
      } else {
        return { ...response, data };
      }
    }

    // If not in the expected format, return as is
    return response;
  },
  (error) => {
    const { response } = error;

    if (response && response.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('hotelAuth');
      window.location.href = '/login';
    }

    // Handle other errors
    console.error('API Error:', response?.data || error.message);
    return Promise.reject(error);
  }
);

// API endpoints organized by resource
export const api = {
  // Auth endpoints
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    logout: () => apiClient.post('/auth/logout'),
    register: (userData) => apiClient.post('/auth/register', userData),
  },

  // Rooms endpoints
  rooms: {
    getAll: () => apiClient.get('/room'),
    getById: (id) => apiClient.get(`/rooms/${id}`),
    create: (roomData) => apiClient.post('/room', roomData),
    update: (id, roomData) => apiClient.put(`/room`, roomData),
    delete: (id) => apiClient.delete(`/rooms/${id}`),
    updateStatus: (id, status) => apiClient.patch(`/rooms/${id}/status`, { status }),
    getAvailable: (checkInDate, checkOutDate) => apiClient.get(`/room/available?checkinDate=${checkInDate}&checkoutDate=${checkOutDate}`),
  },

  // Bookings endpoints
  bookings: {
    getAll: () => apiClient.get('/booking'),
    getById: (id) => apiClient.get(`/booking/${id}/detail`),
    create: (bookingData) => apiClient.post('/booking', bookingData),
    update: (id, bookingData) => apiClient.put(`/bookings/${id}`, bookingData),
    delete: (id) => apiClient.delete(`/bookings/${id}`),
    checkout: (id) => apiClient.post(`/bookings/${id}/checkout`),
    cancel: (id) => apiClient.post(`/bookings/${id}/cancel`),
  },

  // Services endpoints
  services: {
    getAll: () => apiClient.get('/services'),
    getById: (id) => apiClient.get(`/services/${id}`),
    create: (serviceData) => apiClient.post('/services', serviceData),
    update: (id, serviceData) => apiClient.put(`/services/${id}`, serviceData),
    delete: (id) => apiClient.delete(`/services/${id}`),
  },

  // Invoices endpoints
  invoices: {
    getAll: () => apiClient.get('/invoices'),
    getById: (id) => apiClient.get(`/invoices/${id}`),
    create: (invoiceData) => apiClient.post('/invoices', invoiceData),
    update: (id, invoiceData) => apiClient.put(`/invoices/${id}`, invoiceData),
    markAsPaid: (id) => apiClient.patch(`/invoices/${id}/pay`),
  },

  // Feedback endpoints
  feedback: {
    getAll: () => apiClient.get('/feedback'),
    getById: (id) => apiClient.get(`/feedback/${id}`),
    create: (feedbackData) => apiClient.post('/feedback', feedbackData),
    respond: (id, response) => apiClient.post(`/feedback/${id}/respond`, { response }),
  },
};

export default api;