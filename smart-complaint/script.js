// ==================== GLOBAL VARIABLES ====================
const form = document.getElementById("complaintForm");
const message = document.getElementById("message");
const tableBody = document.querySelector("#complaintTable tbody");
const publicTableBody = document.querySelector("#publicTable tbody");
const adminTableBody = document.querySelector("#adminTable tbody");
const notification = document.getElementById("notification");
const modal = document.getElementById("complaintModal");
const closeModal = document.querySelector(".close");

let complaints = [];
let currentComplaintId = null;
let uploadedFiles = [];
let charts = {};

// Admin credentials (in production, this should be server-side)
const ADMIN_PASSWORD = "admin123";

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", async () => {
  // Wait for API to be available
  if (typeof complaintsAPI === 'undefined') {
    console.error('API not loaded! Make sure api.js is loaded before script.js');
    alert('Error: API not loaded. Please refresh the page.');
    return;
  }
  
  await loadComplaints();
  initializeEventListeners();
  initializeCharts();
  await updateStats();
  populateCategoryFilter();
  await checkAdminLogin();
});

// ==================== EVENT LISTENERS ====================
function initializeEventListeners() {
  // Form submission
  form.addEventListener("submit", handleFormSubmit);

  // Geolocation button
  document.getElementById("getLocationBtn").addEventListener("click", getCurrentLocation);

  // File upload preview
  document.getElementById("photo").addEventListener("change", handleFileUpload);

  // Filters
  document.getElementById("statusFilter").addEventListener("change", filterComplaints);
  document.getElementById("categoryFilter").addEventListener("change", filterComplaints);
  document.getElementById("searchInput").addEventListener("input", filterComplaints);

  // Admin filters
  document.getElementById("adminStatusFilter").addEventListener("change", filterAdminComplaints);
  document.getElementById("adminUrgencyFilter").addEventListener("change", filterAdminComplaints);

  // Admin buttons
  document.getElementById("adminLoginBtn").addEventListener("click", toggleAdminLogin);
  document.getElementById("prioritizeBtn").addEventListener("click", autoPrioritize);

  // Modal close
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Auto-categorization on description change
  document.getElementById("description").addEventListener("input", (e) => {
    if (e.target.value.length > 20) {
      suggestCategory(e.target.value);
    }
  });
}

// ==================== FORM HANDLING ====================
async function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const category = document.getElementById("category").value;
  const location = document.getElementById("location").value.trim();
  const description = document.getElementById("description").value.trim();
  const notifyEmail = document.getElementById("notifyEmail").checked;
  const notifySMS = document.getElementById("notifySMS").checked;

  // Validation
  if (!validateForm(name, email, phone, category, location, description)) {
    return;
  }

  // Get coordinates if available
  let coordinates = null;
  const locationStatus = document.getElementById("locationStatus").textContent;
  if (locationStatus.includes("Coordinates:")) {
    const match = locationStatus.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (match) {
      coordinates = {
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[2])
      };
    }
  }

  // AI Analysis (client-side categorization, server will also analyze)
  const aiCategory = await categorizeComplaint(description, category);

  // Prepare complaint data
  const complaintData = {
    name,
    email,
    phone,
    category: aiCategory || category,
    location,
    description,
    coordinates,
    notifyEmail,
    notifySMS
  };

  try {
    // Submit to API
    const fileInput = document.getElementById("photo");
    const result = await complaintsAPI.createComplaint(complaintData, fileInput);
    
    if (result.success) {
      const complaint = result.data;
      showNotification("✅ Complaint submitted successfully! Tracking ID: " + complaint.id);
      
      // Reload data
      await loadComplaints();
      updatePublicDashboard();
      updateStats();
      updateCharts();
      
  form.reset();
      uploadedFiles = [];
      document.getElementById("previewContainer").innerHTML = "";
      document.getElementById("locationStatus").innerHTML = "";

      // Mock notification
      if (notifyEmail) {
        simulateEmailNotification(complaint);
      }
      if (notifySMS) {
        simulateSMSNotification(complaint);
      }
    }
  } catch (error) {
    console.error("Error submitting complaint:", error);
    showMessage("Error submitting complaint: " + error.message, "error");
  }
}

function validateForm(name, email, phone, category, location, description) {
  if (!name || name.length < 2) {
    showMessage("Please enter a valid name", "error");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage("Please enter a valid email address", "error");
    return false;
  }

  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phone || !phoneRegex.test(phone) || phone.length < 10) {
    showMessage("Please enter a valid phone number", "error");
    return false;
  }

  if (!category) {
    showMessage("Please select a complaint category", "error");
    return false;
  }

  if (!location || location.length < 3) {
    showMessage("Please enter a valid location", "error");
    return false;
  }

  if (!description || description.length < 10) {
    showMessage("Please provide a detailed description (at least 10 characters)", "error");
    return false;
  }

  return true;
}

// ==================== GEOLOCATION ====================
function getCurrentLocation() {
  const btn = document.getElementById("getLocationBtn");
  const status = document.getElementById("locationStatus");
  
  if (!navigator.geolocation) {
    showMessage("Geolocation is not supported by your browser", "error");
    return;
  }

  btn.disabled = true;
  btn.textContent = "📍 Getting location...";
  status.innerHTML = "Getting your location...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      
      // Reverse geocoding (in production, use a proper API)
      reverseGeocode(latitude, longitude)
        .then(address => {
          document.getElementById("location").value = address;
          status.innerHTML = `✅ Location found: ${address}`;
          btn.disabled = false;
          btn.textContent = "📍 Use Current Location";
        })
        .catch(() => {
          document.getElementById("location").value = `${latitude}, ${longitude}`;
          status.innerHTML = `📍 Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          btn.disabled = false;
          btn.textContent = "📍 Use Current Location";
        });
    },
    (error) => {
      let errorMsg = "Unable to retrieve your location. ";
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMsg += "Please allow location access.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg += "Location information unavailable.";
          break;
        case error.TIMEOUT:
          errorMsg += "Location request timed out.";
          break;
        default:
          errorMsg += "An unknown error occurred.";
      }
      status.innerHTML = errorMsg;
      showMessage(errorMsg, "error");
      btn.disabled = false;
      btn.textContent = "📍 Use Current Location";
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

async function reverseGeocode(lat, lng) {
  // Mock reverse geocoding - in production, use Google Maps API or similar
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Area near ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }, 500);
  });
}

// ==================== FILE UPLOAD ====================
function handleFileUpload(e) {
  const files = Array.from(e.target.files);
  const previewContainer = document.getElementById("previewContainer");
  
  files.forEach(file => {
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const previewItem = document.createElement("div");
        previewItem.className = "preview-item";
        
        if (file.type.startsWith("image/")) {
          previewItem.innerHTML = `
            <img src="${e.target.result}" alt="Preview" />
            <button type="button" onclick="removeFile('${file.name}')">×</button>
          `;
        } else {
          previewItem.innerHTML = `
            <video src="${e.target.result}" controls></video>
            <button type="button" onclick="removeFile('${file.name}')">×</button>
          `;
        }
        
        previewContainer.appendChild(previewItem);
        uploadedFiles.push({
          name: file.name,
          type: file.type,
          data: e.target.result
        });
      };
      
      reader.readAsDataURL(file);
    }
  });
}

function removeFile(fileName) {
  uploadedFiles = uploadedFiles.filter(f => f.name !== fileName);
  const previewItems = document.querySelectorAll(".preview-item");
  previewItems.forEach(item => {
    if (item.textContent.includes(fileName)) {
      item.remove();
    }
  });
  updatePreviewContainer();
}

function updatePreviewContainer() {
  const container = document.getElementById("previewContainer");
  container.innerHTML = "";
  uploadedFiles.forEach(file => {
    const previewItem = document.createElement("div");
    previewItem.className = "preview-item";
    
    if (file.type.startsWith("image/")) {
      previewItem.innerHTML = `
        <img src="${file.data}" alt="Preview" />
        <button type="button" onclick="removeFile('${file.name}')">×</button>
      `;
    } else {
      previewItem.innerHTML = `
        <video src="${file.data}" controls></video>
        <button type="button" onclick="removeFile('${file.name}')">×</button>
      `;
    }
    
    container.appendChild(previewItem);
  });
}

// ==================== AI CATEGORIZATION ====================
async function categorizeComplaint(description, selectedCategory) {
  // AI-based categorization using keyword matching
  const desc = description.toLowerCase();
  
  const categoryKeywords = {
    "Garbage": ["garbage", "trash", "waste", "dump", "rubbish", "litter", "garbage collection", "bin"],
    "Street Light": ["light", "lamp", "streetlight", "dark", "bulb", "illumination", "street lamp"],
    "Water Leakage": ["water", "leak", "flood", "drain", "pipe", "sewer", "overflow", "leakage"],
    "Road Damage": ["road", "pothole", "crack", "damage", "asphalt", "pavement", "path", "street"],
    "Drainage": ["drain", "drainage", "block", "clog", "sewer", "overflow"],
    "Parks": ["park", "playground", "garden", "grass", "bench", "tree"],
    "Noise": ["noise", "loud", "sound", "disturbance", "annoying"],
    "Traffic": ["traffic", "parking", "vehicle", "car", "signal", "congestion"],
  };

  let maxScore = 0;
  let detectedCategory = selectedCategory;

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (desc.includes(keyword) ? 1 : 0);
    }, 0);

    if (score > maxScore) {
      maxScore = score;
      detectedCategory = category;
    }
  }

  // If AI detects different category, suggest it
  if (detectedCategory !== selectedCategory && maxScore > 0) {
    const categorySelect = document.getElementById("category");
    categorySelect.value = detectedCategory;
    showMessage(`ℹ️ AI detected category: ${detectedCategory}`, "info");
  }

  return detectedCategory;
}

function suggestCategory(description) {
  categorizeComplaint(description, document.getElementById("category").value);
}

function detectUrgency(description) {
  const desc = description.toLowerCase();
  
  const highUrgencyKeywords = ["emergency", "urgent", "immediate", "critical", "dangerous", "accident", "fire", "flooding", "collapse"];
  const mediumUrgencyKeywords = ["soon", "important", "problem", "issue", "need", "required"];
  
  const hasHighUrgency = highUrgencyKeywords.some(keyword => desc.includes(keyword));
  const hasMediumUrgency = mediumUrgencyKeywords.some(keyword => desc.includes(keyword));
  
  if (hasHighUrgency) return "High";
  if (hasMediumUrgency) return "Medium";
  return "Low";
}

function calculatePriorityScore(urgency, category, location) {
  let score = 0;
  
  // Urgency weight
  switch(urgency) {
    case "High": score += 50; break;
    case "Medium": score += 30; break;
    case "Low": score += 10; break;
  }
  
  // Category weight (critical categories)
  const criticalCategories = ["Water Leakage", "Road Damage", "Garbage"];
  if (criticalCategories.includes(category)) score += 20;
  
  // Location frequency (areas with more complaints get higher priority)
  const locationComplaints = complaints.filter(c => c.location.toLowerCase().includes(location.toLowerCase()));
  score += Math.min(locationComplaints.length * 2, 20);
  
  return Math.min(score, 100);
}

// ==================== DISPLAY COMPLAINTS ====================
function displayComplaints() {
  const statusFilter = document.getElementById("statusFilter").value;
  const categoryFilter = document.getElementById("categoryFilter").value;
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();

  let filtered = complaints.filter(c => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    const matchesSearch = !searchTerm || 
      c.id.toString().includes(searchTerm) ||
      c.name.toLowerCase().includes(searchTerm) ||
      c.category.toLowerCase().includes(searchTerm) ||
      c.location.toLowerCase().includes(searchTerm) ||
      c.description.toLowerCase().includes(searchTerm);
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  tableBody.innerHTML = "";

  if (filtered.length === 0) {
    document.getElementById("emptyState").style.display = "block";
    document.getElementById("complaintTable").style.display = "none";
    return;
  }

  document.getElementById("emptyState").style.display = "none";
  document.getElementById("complaintTable").style.display = "table";

  filtered.forEach((c) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.id}</td>
      <td>${formatDate(c.date)}</td>
      <td>${c.category}</td>
      <td>${c.location}</td>
      <td><span class="status-badge status-${c.status.toLowerCase().replace(" ", "-")}">${c.status}</span></td>
      <td><span class="urgency-badge urgency-${c.urgency.toLowerCase()}">${c.urgency}</span></td>
      <td>
        <button class="btn-secondary" onclick="viewComplaintDetails(${c.id})">View</button>
        ${c.status === "Resolved" ? `<button class="btn-secondary" onclick="showFeedbackForm(${c.id})">Feedback</button>` : ""}
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function updatePublicDashboard() {
  publicTableBody.innerHTML = "";
  
  const sortedComplaints = [...complaints].sort((a, b) => b.timestamp - a.timestamp);
  
  sortedComplaints.forEach((c) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.id}</td>
      <td>${c.category}</td>
      <td>${c.location}</td>
      <td><span class="status-badge status-${c.status.toLowerCase().replace(" ", "-")}">${c.status}</span></td>
      <td><span class="urgency-badge urgency-${c.urgency.toLowerCase()}">${c.urgency}</span></td>
      <td>${formatDate(c.date)}</td>
      <td><button class="btn-secondary" onclick="viewComplaintDetails(${c.id})">View</button></td>
    `;
    publicTableBody.appendChild(row);
  });
}

function filterComplaints() {
  displayComplaints();
}

function populateCategoryFilter() {
  const filter = document.getElementById("categoryFilter");
  const categories = [...new Set(complaints.map(c => c.category))];
  
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });
}

// ==================== ADMIN DASHBOARD ====================
async function checkAdminLogin() {
  const token = getAuthToken();
  if (token) {
    try {
      const result = await authAPI.verifyToken();
      if (result.success && result.user.role === "admin") {
        showAdminPanel();
        document.getElementById("adminLoginBtn").textContent = "Admin Logout";
      } else {
        setAuthToken(null);
      }
    } catch (error) {
      setAuthToken(null);
    }
  }
}

async function toggleAdminLogin() {
  const token = getAuthToken();
  
  if (token) {
    // Logout
    authAPI.logout();
    document.getElementById("adminPanel").style.display = "none";
    document.getElementById("adminLoginBtn").textContent = "Admin Login";
    showNotification("Admin logged out");
  } else {
    // Login
    const username = prompt("Enter admin username:");
    if (!username) return;
    
    const password = prompt("Enter admin password:");
    if (!password) return;
    
    try {
      const result = await authAPI.adminLogin(username, password);
      if (result.success) {
        showAdminPanel();
        document.getElementById("adminLoginBtn").textContent = "Admin Logout";
        showNotification("Admin logged in successfully");
        await filterAdminComplaints();
      }
    } catch (error) {
      showNotification("Login failed: " + error.message, "error");
    }
  }
}

function showAdminPanel() {
  const panel = document.getElementById("adminPanel");
  panel.style.display = "block";
  filterAdminComplaints();
}

async function filterAdminComplaints() {
  try {
    const statusFilter = document.getElementById("adminStatusFilter").value;
    const urgencyFilter = document.getElementById("adminUrgencyFilter").value;

    const filters = {};
    if (statusFilter !== "all") filters.status = statusFilter;
    if (urgencyFilter !== "all") filters.urgency = urgencyFilter;

    const result = await adminAPI.getComplaints(filters);
    
    if (!result.success) {
      throw new Error(result.message || "Failed to fetch complaints");
    }

    const filtered = result.data;
    adminTableBody.innerHTML = "";

    filtered.forEach((c) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${c.id}</td>
        <td>${c.category}</td>
        <td>${c.location}</td>
        <td><span class="status-badge status-${c.status.toLowerCase().replace(" ", "-")}">${c.status}</span></td>
        <td><span class="urgency-badge urgency-${c.urgency.toLowerCase()}">${c.urgency}</span></td>
        <td><strong>${c.priorityScore || 0}</strong></td>
        <td>
          <select onchange="updateComplaintStatus('${c.id}', this.value)">
            <option value="Pending" ${c.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="In Progress" ${c.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option value="Resolved" ${c.status === "Resolved" ? "selected" : ""}>Resolved</option>
            <option value="Closed" ${c.status === "Closed" ? "selected" : ""}>Closed</option>
          </select>
          <button class="btn-secondary" onclick="viewComplaintDetails('${c.id}')">Details</button>
        </td>
        `;
      adminTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching admin complaints:", error);
    showNotification("Error loading complaints: " + error.message, "error");
  }
}

async function updateComplaintStatus(id, newStatus) {
  try {
    const result = await adminAPI.updateComplaintStatus(id, newStatus);
    
    if (result.success) {
      showNotification(`Status updated for complaint #${id}`);
      
      // Reload data
      await loadComplaints();
      updatePublicDashboard();
      await updateStats();
      updateCharts();
      await filterAdminComplaints();
      
      // Simulate notification
      const complaint = result.data;
      if (complaint.notifyEmail) {
        simulateEmailNotification(complaint);
      }
      if (complaint.notifySMS) {
        simulateSMSNotification(complaint);
      }
    }
  } catch (error) {
    console.error("Error updating status:", error);
    showNotification("Error updating status: " + error.message, "error");
  }
}

async function autoPrioritize() {
  try {
    const result = await adminAPI.prioritizeComplaints();
    
    if (result.success) {
      showNotification(`All complaints prioritized successfully (${result.count} complaints)`);
      await filterAdminComplaints();
    }
  } catch (error) {
    console.error("Error prioritizing complaints:", error);
    showNotification("Error prioritizing complaints: " + error.message, "error");
  }
}

// ==================== STATS & ANALYTICS ====================
async function updateStats() {
  try {
    const result = await analyticsAPI.getStats();
    
    if (result.success) {
      const stats = result.data;
      document.getElementById("totalComplaints").textContent = stats.total;
      document.getElementById("pendingComplaints").textContent = stats.pending;
      document.getElementById("resolvedComplaints").textContent = stats.resolvedTotal;
      document.getElementById("resolutionRate").textContent = stats.resolutionRate.toFixed(1) + "%";
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Fallback to local calculation if API fails
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === "Pending").length;
    const resolved = complaints.filter(c => c.status === "Resolved" || c.status === "Closed").length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    document.getElementById("totalComplaints").textContent = total;
    document.getElementById("pendingComplaints").textContent = pending;
    document.getElementById("resolvedComplaints").textContent = resolved;
    document.getElementById("resolutionRate").textContent = resolutionRate + "%";
  }
}

function initializeCharts() {
  if (typeof Chart === "undefined") {
    console.warn("Chart.js not loaded");
    return;
  }

  // Category Chart
  const categoryCtx = document.getElementById("categoryChart");
  if (categoryCtx) {
    charts.category = new Chart(categoryCtx, {
      type: "doughnut",
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
            "#9966FF", "#FF9F40", "#FF6384", "#C9CBCF"
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }

  // Status Chart
  const statusCtx = document.getElementById("statusChart");
  if (statusCtx) {
    charts.status = new Chart(statusCtx, {
      type: "pie",
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            "#FFCE56", "#36A2EB", "#4BC0C0", "#E7E9ED"
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }

  // Timeline Chart
  const timelineCtx = document.getElementById("timelineChart");
  if (timelineCtx) {
    charts.timeline = new Chart(timelineCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [{
          label: "Complaints",
          data: [],
          borderColor: "#36A2EB",
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  updateCharts();
}

async function updateCharts() {
  if (typeof Chart === "undefined") return;

  // Category Chart
  try {
    const categoryResult = await analyticsAPI.getByCategory();
    if (charts.category && categoryResult.success) {
      charts.category.data.labels = categoryResult.data.map(item => item.category);
      charts.category.data.datasets[0].data = categoryResult.data.map(item => item.count);
      charts.category.update();
    }
  } catch (error) {
    console.error("Error loading category chart:", error);
  }

  // Status Chart
  try {
    const statusResult = await analyticsAPI.getByStatus();
    if (charts.status && statusResult.success) {
      charts.status.data.labels = statusResult.data.map(item => item.status);
      charts.status.data.datasets[0].data = statusResult.data.map(item => item.count);
      charts.status.update();
    }
  } catch (error) {
    console.error("Error loading status chart:", error);
  }

  // Timeline Chart
  try {
    const timelineResult = await analyticsAPI.getTimeline(7);
    if (charts.timeline && timelineResult.success) {
      charts.timeline.data.labels = timelineResult.data.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      });
      charts.timeline.data.datasets[0].data = timelineResult.data.map(item => item.count);
      charts.timeline.update();
    }
  } catch (error) {
    console.error("Error loading timeline chart:", error);
  }

  // Top Locations
  await updateTopLocations();
  await updateTrendInsights();
}

async function updateTopLocations() {
  try {
    const result = await analyticsAPI.getTopLocations(5);
    const container = document.getElementById("topLocations");
    if (container && result.success) {
      container.innerHTML = result.data.map(item => `
        <div style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
          <strong>${item.location}</strong>: ${item.count} complaint${item.count > 1 ? "s" : ""}
        </div>
      `).join("");
    }
  } catch (error) {
    console.error("Error loading top locations:", error);
  }
}

async function updateTrendInsights() {
  try {
    const result = await analyticsAPI.getTrends();
    const container = document.getElementById("trendInsights");
    if (container && result.success) {
      const insights = [];
      const trends = result.data;
      
      if (trends.mostCommonCategory) {
        insights.push(`Most common issue: ${trends.mostCommonCategory.category} (${trends.mostCommonCategory.count} complaints)`);
      }
      
      insights.push(`Resolution rate: ${trends.resolutionRate}%`);
      
      if (trends.averageResolutionTime > 0) {
        insights.push(`Average resolution time: ${trends.averageResolutionTime} days`);
      }
      
      container.innerHTML = insights.map(insight => `<p>${insight}</p>`).join("");
    }
  } catch (error) {
    console.error("Error loading trend insights:", error);
  }
}

// ==================== COMPLAINT DETAILS MODAL ====================
async function viewComplaintDetails(id) {
  try {
    const result = await complaintsAPI.getComplaintById(id);
    if (!result.success) {
      showNotification("Complaint not found", "error");
      return;
    }
    
    const complaint = result.data;

  const modalBody = document.getElementById("modalBody");
  modalBody.innerHTML = `
    <h2>Complaint Details #${complaint.id}</h2>
    <div style="display: grid; gap: 15px; margin-top: 20px;">
      <div><strong>Name:</strong> ${complaint.name}</div>
      <div><strong>Email:</strong> ${complaint.email}</div>
      <div><strong>Phone:</strong> ${complaint.phone}</div>
      <div><strong>Category:</strong> ${complaint.category}</div>
      <div><strong>Location:</strong> ${complaint.location}</div>
      <div><strong>Status:</strong> <span class="status-badge status-${complaint.status.toLowerCase().replace(" ", "-")}">${complaint.status}</span></div>
      <div><strong>Urgency:</strong> <span class="urgency-badge urgency-${complaint.urgency.toLowerCase()}">${complaint.urgency}</span></div>
      <div><strong>Priority Score:</strong> ${complaint.priorityScore}</div>
      <div><strong>Submitted:</strong> ${formatDate(complaint.date)}</div>
      ${complaint.resolvedDate ? `<div><strong>Resolved:</strong> ${formatDate(complaint.resolvedDate)}</div>` : ""}
      <div><strong>Description:</strong> ${complaint.description}</div>
      ${complaint.images && complaint.images.length > 0 ? `
        <div><strong>Images:</strong>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
            ${complaint.images.map(img => `
              ${img.mimetype && img.mimetype.startsWith("image/") ? 
                `<img src="http://localhost:5000${img.path}" style="max-width: 200px; border-radius: 5px;" alt="${img.filename}" />` :
                `<video src="http://localhost:5000${img.path}" controls style="max-width: 200px;"></video>`
              }
            `).join("")}
          </div>
        </div>
      ` : ""}
      <div><strong>Status Updates:</strong>
        <div style="margin-top: 10px;">
          ${complaint.updates.map(update => `
            <div style="padding: 10px; background: #f5f5f5; margin-bottom: 5px; border-radius: 5px;">
              <strong>${update.status}</strong> - ${update.message}<br>
              <small>${formatDate(update.date)}</small>
            </div>
          `).join("")}
        </div>
      </div>
      ${complaint.feedback ? `
        <div><strong>Feedback:</strong>
          <div style="margin-top: 10px;">
            <div>Rating: ${"★".repeat(complaint.feedback.rating)}${"☆".repeat(5 - complaint.feedback.rating)}</div>
            <div>Comment: ${complaint.feedback.comment || "N/A"}</div>
          </div>
        </div>
      ` : ""}
    </div>
  `;
    modal.style.display = "block";
  } catch (error) {
    console.error("Error loading complaint details:", error);
    showNotification("Error loading complaint details: " + error.message, "error");
  }
}

// ==================== FEEDBACK SYSTEM ====================
function showFeedbackForm(id) {
  currentComplaintId = id;
  const complaint = complaints.find(c => c.id === id);
  if (!complaint || complaint.status !== "Resolved") return;

  const section = document.getElementById("feedback");
  section.style.display = "block";
  
  const feedbackForm = document.getElementById("feedbackForm");
  feedbackForm.innerHTML = `
    <h3>Rate your experience - Complaint #${id}</h3>
    <form id="feedbackFormSubmit" onsubmit="submitFeedback(event)">
      <div class="form-group">
        <label>Rating</label>
        <div class="rating-stars">
          ${[1, 2, 3, 4, 5].map(i => `
            <span class="star" data-rating="${i}" onclick="setRating(${i})">☆</span>
          `).join("")}
        </div>
        <input type="hidden" id="rating" value="0" required>
      </div>
      <div class="form-group">
        <label for="feedbackComment">Comment (optional)</label>
        <textarea id="feedbackComment" rows="4" placeholder="Tell us about your experience..."></textarea>
      </div>
      <button type="submit" class="btn-primary">Submit Feedback</button>
    </form>
  `;
  
  scrollToSection("feedback");
}

function setRating(rating) {
  document.getElementById("rating").value = rating;
  const stars = document.querySelectorAll(".star");
  stars.forEach((star, index) => {
    if (index < rating) {
      star.textContent = "★";
      star.classList.add("active");
    } else {
      star.textContent = "☆";
      star.classList.remove("active");
    }
  });
}

async function submitFeedback(e) {
  e.preventDefault();
  
  const rating = parseInt(document.getElementById("rating").value);
  const comment = document.getElementById("feedbackComment").value.trim();

  try {
    const result = await complaintsAPI.submitFeedback(currentComplaintId, rating, comment);
    
    if (result.success) {
      showNotification("Thank you for your feedback!");
      document.getElementById("feedback").style.display = "none";
      await loadComplaints();
    }
  } catch (error) {
    console.error("Error submitting feedback:", error);
    showNotification("Error submitting feedback: " + error.message, "error");
  }
}

// ==================== NOTIFICATIONS ====================
function showNotification(message, type = "success") {
  notification.textContent = message;
  notification.className = `notification show ${type}`;
  notification.style.background = type === "error" ? "#dc3545" : "#28a745";
  
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

function showMessage(msg, type = "success") {
  message.textContent = msg;
  message.className = `form-message ${type}`;
  message.style.color = type === "error" ? "#dc3545" : "#28a745";
  
  setTimeout(() => {
    message.textContent = "";
  }, 5000);
}

function simulateEmailNotification(complaint) {
  console.log(`📧 Email sent to ${complaint.email}: Complaint #${complaint.id} status updated to ${complaint.status}`);
}

function simulateSMSNotification(complaint) {
  console.log(`📱 SMS sent to ${complaint.phone}: Complaint #${complaint.id} status: ${complaint.status}`);
}

// ==================== UTILITIES ====================
function generateUniqueId() {
  return Math.floor(Math.random() * 1000000);
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "start" });
}

// ==================== API DATA LOADING ====================
async function loadComplaints() {
  try {
    // Check if API is available
    if (typeof complaintsAPI === 'undefined') {
      console.error('complaintsAPI is not defined');
      showNotification("API not loaded. Please refresh the page.", "error");
      return;
    }
    
    const result = await complaintsAPI.getAllComplaints({});
    if (result.success) {
      complaints = result.data;
      displayComplaints();
      updatePublicDashboard();
      populateCategoryFilter();
    } else {
      throw new Error(result.message || 'Failed to load complaints');
    }
  } catch (error) {
    console.error("Error loading complaints:", error);
    console.error("Error details:", error.message, error.stack);
    
    // Show user-friendly error
    const errorMsg = error.message.includes('Failed to fetch') || error.message.includes('NetworkError')
      ? "Cannot connect to backend server. Make sure backend is running on port 5000."
      : "Error loading complaints: " + error.message;
    
    showNotification(errorMsg, "error");
    // Fallback to empty array
    complaints = [];
    displayComplaints();
  }
}