// Authentication helper functions
const API_URL = 'https://eventx-0bke.onrender.com/api';

// Store token in localStorage
function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

// Get token from localStorage
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Get current user info
function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

// Set current user info
function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

// Clear auth data
function clearAuth() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
}



// Check if user is authenticated
function isAuthenticated() {
  return !!getAuthToken();
}

// Check if user is admin
function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

// Get auth headers for API requests
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Password toggle functionality
function initPasswordToggle() {
  // Login page password toggle
  const loginPasswordInput = document.getElementById('loginPassword');
  const loginPasswordToggle = document.getElementById('loginPasswordToggle');
  
  if (loginPasswordInput && loginPasswordToggle) {
    loginPasswordToggle.addEventListener('click', function() {
      const type = loginPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      loginPasswordInput.setAttribute('type', type);
      
      // Add class for CSS targeting
      if (type === 'text') {
        loginPasswordInput.classList.add('password-visible');
      } else {
        loginPasswordInput.classList.remove('password-visible');
      }
      
      // Update eye icon
      const eyeIcon = loginPasswordToggle.querySelector('.eye-icon');
      if (type === 'text') {
        eyeIcon.textContent = '🙈'; // Closed eye when visible
      } else {
        eyeIcon.textContent = '👁️'; // Open eye when hidden
      }
    });
  }
  
  // Registration page password toggle
  const registrationPasswordInput = document.getElementById('registrationPassword');
  const registrationPasswordToggle = document.getElementById('registrationPasswordToggle');
  
  if (registrationPasswordInput && registrationPasswordToggle) {
    registrationPasswordToggle.addEventListener('click', function() {
      const type = registrationPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      registrationPasswordInput.setAttribute('type', type);
      
      // Add class for CSS targeting
      if (type === 'text') {
        registrationPasswordInput.classList.add('password-visible');
      } else {
        registrationPasswordInput.classList.remove('password-visible');
      }
      
      // Update eye icon
      const eyeIcon = registrationPasswordToggle.querySelector('.eye-icon');
      if (type === 'text') {
        eyeIcon.textContent = '🙈'; // Closed eye when visible
      } else {
        eyeIcon.textContent = '👁️'; // Open eye when hidden
      }
    });
  }
}

// Initialize password toggle when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPasswordToggle);
} else {
  initPasswordToggle();
}

// Handle login form submission
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const messageDiv = document.getElementById('loginMessage');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';
    messageDiv.style.display = 'none';
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success) {
        // Store token and user info
        setAuthToken(result.data.token);
        setCurrentUser(result.data.user);
        
        // Debug logging
        console.log('Login successful:', result.data.user);
        console.log('User role:', result.data.user.role);
        console.log('Full result:', result);
        
        // Show success message
        messageDiv.className = 'form-message success';
        messageDiv.textContent = 'Login successful! Redirecting...';
        messageDiv.style.display = 'block';
        
        // Redirect based on role (check both result.data.user.role and stored user)
        setTimeout(() => {
          const userRole = result.data.user?.role || getCurrentUser()?.role;
          console.log('Redirecting - Role:', userRole);
          
          if (userRole === 'admin') {
            console.log('Redirecting admin to events.html');
            window.location.href = 'events.html';
          } else {
            console.log('Redirecting student to student-dashboard.html');
            window.location.href = 'student-dashboard.html';
          }
        }, 1000);
      } else {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = result.message || 'Login failed. Please check your credentials.';
        messageDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In →';
      }
    } catch (error) {
      console.error('Login error:', error);
      messageDiv.className = 'form-message error';
      messageDiv.textContent = 'Failed to connect to server. Please try again.';
      messageDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In →';
    }
  });
}

// Handle signup form submission (registration.html)
if (document.getElementById('registrationForm')) {
  document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form elements - use ID for password to handle type toggle (password can be type="text" when visible)
    const nameInput = document.querySelector('input[type="text"]');
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.getElementById('registrationPassword');
    const governorateSelect = document.querySelector('select[name="governorate"]');
    const termsCheckbox = document.getElementById('acceptTerms');
    
    const formData = {
      name: nameInput ? nameInput.value.trim() : '',
      email: emailInput ? emailInput.value.trim() : '',
      password: passwordInput ? passwordInput.value : '',
      governorate: governorateSelect ? governorateSelect.value : ''
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Create message div if it doesn't exist
    let messageDiv = document.getElementById('signupMessage');
    if (!messageDiv) {
      messageDiv = document.createElement('div');
      messageDiv.id = 'signupMessage';
      messageDiv.className = 'form-message';
      e.target.insertBefore(messageDiv, submitBtn);
    }
    messageDiv.style.display = 'none';
    
    // Client-side validation
    if (!formData.name || formData.name.trim() === '') {
      messageDiv.className = 'form-message error';
      messageDiv.textContent = 'Please enter your Full Name.';
      messageDiv.style.display = 'block';
      return;
    }
    
    if (!formData.email || !formData.email.includes('@') || !formData.email.includes('.')) {
      messageDiv.className = 'form-message error';
      messageDiv.textContent = 'Please enter a valid Email Address.';
      messageDiv.style.display = 'block';
      return;
    }
    
    // Validate password
    if (!passwordInput || !formData.password || formData.password.trim() === '') {
      messageDiv.className = 'form-message error';
      messageDiv.textContent = 'Password is required';
      messageDiv.style.display = 'block';
      return;
    }
    
    // Validate password strength using the function from registration.js
    if (typeof validatePasswordStrength === 'function') {
      const passwordError = validatePasswordStrength(formData.password);
      if (passwordError) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = passwordError;
        messageDiv.style.display = 'block';
        return;
      }
    }
    
    if (!formData.governorate || formData.governorate === '') {
      messageDiv.className = 'form-message error';
      messageDiv.textContent = 'Please select your Governorate.';
      messageDiv.style.display = 'block';
      return;
    }
    
    if (!termsCheckbox || !termsCheckbox.checked) {
      messageDiv.className = 'form-message error';
      messageDiv.textContent = 'You must accept the Terms and Privacy Policy.';
      messageDiv.style.display = 'block';
      return;
    }
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Creating account...';
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Store token and user info
        setAuthToken(result.data.token);
        setCurrentUser(result.data.user);
        
        messageDiv.className = 'form-message success';
        messageDiv.textContent = 'Account created successfully! Redirecting...';
        messageDiv.style.display = 'block';
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = 'student-dashboard.html';
        }, 1000);
      } else {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = result.message || 'Registration failed. Please try again.';
        messageDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    } catch (error) {
      console.error('Registration error:', error);
      messageDiv.className = 'form-message error';
      messageDiv.textContent = 'Failed to connect to server. Please try again.';
      messageDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

