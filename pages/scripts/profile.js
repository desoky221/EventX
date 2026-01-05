// Profile Script - Handles profile editing and updates
const API_URL = 'http://localhost:3000/api';
const AUTH_API_URL = `${API_URL}/auth`;

// Get auth token
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Get current user
function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

// Set current user
function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

// Get auth headers
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Check authentication
function checkAuth() {
  const token = getAuthToken();
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Format date for input field (YYYY-MM-DD)
function formatDateForInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Load user profile data
async function loadProfile() {
  if (!checkAuth()) return;

  try {
    const response = await fetch(`${AUTH_API_URL}/me`, {
      headers: getAuthHeaders()
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        const user = result.data;
        
        // Populate form fields
        document.getElementById('profileName').value = user.name || '';
        document.getElementById('profileEmail').value = user.email || '';
        document.getElementById('profileBirthday').value = formatDateForInput(user.birthday);
        document.getElementById('profileGender').value = user.gender || '';
        document.getElementById('profilePhone').value = user.phoneNumber || '';
        
        // Set profile picture
        const profilePicturePreview = document.getElementById('profilePicturePreview');
        if (user.profilePicture) {
          profilePicturePreview.src = user.profilePicture;
          profilePicturePreview.style.display = 'block';
        } else {
          // Show initials or default
          profilePicturePreview.style.display = 'none';
        }
      }
    } else if (response.status === 401) {
      // Token expired
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

// Handle profile picture upload
function setupProfilePictureUpload() {
  const profilePictureInput = document.getElementById('profilePictureInput');
  const profilePicturePreview = document.getElementById('profilePicturePreview');
  
  profilePictureInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      // Preview image
      const reader = new FileReader();
      reader.onload = function(e) {
        profilePicturePreview.src = e.target.result;
        profilePicturePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });
}

// Convert image to base64 for storage
function imageToBase64(file, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    callback(e.target.result);
  };
  reader.onerror = function(error) {
    console.error('Error reading file:', error);
    callback(null);
  };
  reader.readAsDataURL(file);
}

// Handle form submission
function setupFormSubmission() {
  const profileForm = document.getElementById('profileForm');
  const profileMessage = document.getElementById('profileMessage');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const profilePictureInput = document.getElementById('profilePictureInput');
  
  profileForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const originalText = saveProfileBtn.innerHTML;
    saveProfileBtn.disabled = true;
    saveProfileBtn.innerHTML = 'Saving...';
    profileMessage.style.display = 'none';
    
    try {
      const formData = {
        name: document.getElementById('profileName').value.trim(),
        birthday: document.getElementById('profileBirthday').value || null,
        gender: document.getElementById('profileGender').value || null,
        phoneNumber: document.getElementById('profilePhone').value.trim() || null
      };
      
      // Handle profile picture if changed
      if (profilePictureInput.files.length > 0) {
        const file = profilePictureInput.files[0];
        imageToBase64(file, function(base64String) {
          if (base64String) {
            formData.profilePicture = base64String;
            updateProfile(formData, profileMessage, saveProfileBtn, originalText);
          } else {
            showMessage(profileMessage, 'Error reading profile picture', 'error');
            saveProfileBtn.disabled = false;
            saveProfileBtn.innerHTML = originalText;
          }
        });
      } else {
        // No new picture, just update other fields
        updateProfile(formData, profileMessage, saveProfileBtn, originalText);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showMessage(profileMessage, 'An error occurred. Please try again.', 'error');
      saveProfileBtn.disabled = false;
      saveProfileBtn.innerHTML = originalText;
    }
  });
}

// Update profile via API
async function updateProfile(formData, messageDiv, submitBtn, originalText) {
  try {
    const response = await fetch(`${AUTH_API_URL}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update local storage with new user data
      const updatedUser = result.data;
      setCurrentUser({
        id: updatedUser._id || updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      });
      
      // Update profile icon in navigation
      if (window.updateProfileIcon) {
        await window.updateProfileIcon();
      }
      
      showMessage(messageDiv, 'Profile updated successfully!', 'success');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    } else {
      showMessage(messageDiv, result.message || 'Failed to update profile', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    showMessage(messageDiv, 'Failed to connect to server. Please try again.', 'error');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// Show message
function showMessage(messageDiv, message, type) {
  messageDiv.textContent = message;
  messageDiv.className = `form-message ${type}`;
  messageDiv.style.display = 'block';
  
  // Scroll to message
  messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Initialize profile page
window.addEventListener('DOMContentLoaded', function() {
  loadProfile();
  setupProfilePictureUpload();
  setupFormSubmission();
});

