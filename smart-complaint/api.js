// ==================== API CONFIGURATION ====================
const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

// Set auth token in localStorage
function setAuthToken(token) {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

// Get headers with authentication
function getHeaders(includeAuth = true, isFormData = false) {
  const headers = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

// Handle API response
async function handleResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
}

// ==================== AUTH API ====================
const authAPI = {
  async adminLogin(username, password) {
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ username, password })
    });
    
    const data = await handleResponse(response);
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async verifyToken() {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: getHeaders(true)
    });
    
    try {
      return await handleResponse(response);
    } catch (error) {
      setAuthToken(null);
      throw error;
    }
  },

  logout() {
    setAuthToken(null);
  }
};

// ==================== COMPLAINTS API ====================
const complaintsAPI = {
  async createComplaint(complaintData, fileInput = null) {
    const formData = new FormData();
    
    // Add complaint data
    Object.keys(complaintData).forEach(key => {
      if (key !== 'images' && key !== 'coordinates' && key !== 'files') {
        formData.append(key, complaintData[key]);
      }
    });
    
    // Add coordinates as JSON
    if (complaintData.coordinates) {
      formData.append('coordinates', JSON.stringify(complaintData.coordinates));
    }
    
    // Add files from input element
    if (fileInput && fileInput.files) {
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('files', fileInput.files[i]);
      }
    }

    const headers = getHeaders(false, true);
    const response = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: headers,
      body: formData
    });
    
    return await handleResponse(response);
  },

  async getAllComplaints(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const url = `${API_BASE_URL}/complaints?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(false)
    });
    
    return await handleResponse(response);
  },

  async getComplaintById(id) {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      method: 'GET',
      headers: getHeaders(false)
    });
    
    return await handleResponse(response);
  },

  async getUserComplaints(email) {
    const response = await fetch(`${API_BASE_URL}/complaints/user/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: getHeaders(false)
    });
    
    return await handleResponse(response);
  },

  async submitFeedback(complaintId, rating, comment) {
    const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}/feedback`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ rating, comment })
    });
    
    return await handleResponse(response);
  }
};

// ==================== ADMIN API ====================
const adminAPI = {
  async getComplaints(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const url = `${API_BASE_URL}/admin/complaints?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(true)
    });
    
    return await handleResponse(response);
  },

  async updateComplaintStatus(complaintId, status) {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}/status`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ status })
    });
    
    return await handleResponse(response);
  },

  async prioritizeComplaints() {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/prioritize`, {
      method: 'POST',
      headers: getHeaders(true)
    });
    
    return await handleResponse(response);
  },

  async assignComplaint(complaintId, assignedTo) {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}/assign`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ assignedTo })
    });
    
    return await handleResponse(response);
  },

  async deleteComplaint(complaintId) {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    
    return await handleResponse(response);
  }
};

// ==================== ANALYTICS API ====================
const analyticsAPI = {
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/analytics/stats`, {
      method: 'GET',
      headers: getHeaders(false)
    });
    
    return await handleResponse(response);
  },

  async getByCategory() {
    const response = await fetch(`${API_BASE_URL}/analytics/by-category`, {
      method: 'GET',
      headers: getHeaders(false)
    });
    
    return await handleResponse(response);
  },

  async getByStatus() {
    const response = await fetch(`${API_BASE_URL}/analytics/by-status`, {
      method: 'GET',
      headers: getHeaders(false)
    });
    
    return await handleResponse(response);
  },

  async getTimeline(days = 7) {
    const response = await fetch(`${API_BASE_URL}/analytics/timeline?days=${days}`, {
      method: 'GET',
      headers: getHeaders(false)
    });
    
    return await handleResponse(response);
  },

  async getTopLocations(limit = 5) {
    const response = await fetch(`${API_BASE_URL}/analytics/top-locations?limit=${limit}`, {
      method: 'GET',
      headers: getHeaders(false)
    });
    
    return await handleResponse(response);
  },

  async getTrends() {
    const response = await fetch(`${API_BASE_URL}/analytics/trends`, {
      method: 'GET',
      headers: getHeaders(false)
    });
    
    return await handleResponse(response);
  }
};

// Make API objects globally available (attach to window)
window.authAPI = authAPI;
window.complaintsAPI = complaintsAPI;
window.adminAPI = adminAPI;
window.analyticsAPI = analyticsAPI;
window.getAuthToken = getAuthToken;
window.setAuthToken = setAuthToken;