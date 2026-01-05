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
      console.log('Sending login request for email:', email);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Login response status:', response.status, response.statusText);
      
      // Parse response JSON
      const result = await response.json().catch(err => {
        console.error('Failed to parse response JSON:', err);
        return { success: false, message: 'Invalid server response' };
      });
      
      console.log('Login response data:', result);
      
      // Check if response is ok
      if (!response.ok) {
        const errorMessage = result.message || `HTTP error! status: ${response.status}`;
        
        // Check if it's an email not found error
        if (errorMessage.toLowerCase().includes('email') || 
            errorMessage.toLowerCase().includes('invalid') ||
            response.status === 401 || response.status === 404) {
          messageDiv.className = 'form-message error';
          messageDiv.textContent = errorMessage.includes('Invalid') 
            ? errorMessage 
            : 'Email not found or password incorrect. Please check your credentials or sign up for a new account.';
          messageDiv.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In →';
          return;
        }
        
        messageDiv.className = 'form-message error';
        messageDiv.textContent = errorMessage;
        messageDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In →';
        return;
      }
      
      if (result.success && result.data) {
        // Validate required fields
        if (!result.data.token) {
          console.error('Login response missing token:', result);
          messageDiv.className = 'form-message error';
          messageDiv.textContent = 'Login failed. Token not received from server.';
          messageDiv.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In →';
          return;
        }
        
        if (!result.data.user) {
          console.error('Login response missing user:', result);
          messageDiv.className = 'form-message error';
          messageDiv.textContent = 'Login failed. User data not received from server.';
          messageDiv.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In →';
          return;
        }
        
        // Store token and user info
        setAuthToken(result.data.token);
        setCurrentUser(result.data.user);
        
        console.log('Login successful, stored token and user:', {
          token: result.data.token ? 'present' : 'missing',
          user: result.data.user,
          role: result.data.user.role,
          userId: result.data.user.id || result.data.user._id
        });
        
        // Verify storage
        const storedToken = getAuthToken();
        const storedUser = getCurrentUser();
        console.log('Verification - Stored token:', storedToken ? 'present' : 'missing');
        console.log('Verification - Stored user:', storedUser);
        
        // Show success message
        messageDiv.className = 'form-message success';
        messageDiv.textContent = 'Login successful! Redirecting...';
        messageDiv.style.display = 'block';
        
        // Redirect based on role
        setTimeout(() => {
          const userRole = result.data.user?.role || getCurrentUser()?.role;
          console.log('Redirecting - Role:', userRole);
          console.log('Current location:', window.location.href);
          console.log('Current pathname:', window.location.pathname);
          
          const currentPath = window.location.pathname;
          const isInPagesFolder = currentPath.includes('/pages/');
          
          if (userRole === 'admin') {
            const redirectPath = isInPagesFolder ? 'events.html' : 'pages/events.html';
            console.log('Redirecting admin to:', redirectPath);
            window.location.href = redirectPath;
          } else {
            const redirectPath = isInPagesFolder ? 'student-dashboard.html' : 'pages/student-dashboard.html';
            console.log('Redirecting student to:', redirectPath);
            window.location.href = redirectPath;
          }
        }, 1000);
      } else {
        console.error('Login response missing success flag or data:', result);
        messageDiv.className = 'form-message error';
        messageDiv.textContent = result.message || 'Login failed. Invalid response from server.';
        messageDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In →';
      }
    } catch (error) {
      console.error('Login error:', error);
      messageDiv.className = 'form-message error';
      
      // Check if error message contains email-related errors
      const errorMsg = error.message || '';
      if (errorMsg.toLowerCase().includes('email') && 
          (errorMsg.toLowerCase().includes('not found') || 
           errorMsg.toLowerCase().includes('does not exist') ||
           errorMsg.toLowerCase().includes('invalid'))) {
        messageDiv.textContent = 'Email not found. Please check your email address or sign up for a new account.';
      } else {
        messageDiv.textContent = 'Failed to connect to server. Please check your internet connection and try again.';
      }
      
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
    
    // Get form elements - use IDs for reliable access
    const nameInput = document.getElementById('registrationName');
    const emailInput = document.getElementById('registrationEmail');
    const passwordInput = document.getElementById('registrationPassword');
    const governorateSelect = document.querySelector('select[name="governorate"]');
    const termsCheckbox = document.getElementById('acceptTerms');
    
    // Fallback to querySelector if IDs don't exist
    const nameInputFallback = nameInput || document.querySelector('input[type="text"]');
    const emailInputFallback = emailInput || document.querySelector('input[type="email"]');
    
    const formData = {
      name: (nameInputFallback ? nameInputFallback.value.trim() : ''),
      email: (emailInputFallback ? emailInputFallback.value.trim() : ''),
      password: (passwordInput ? passwordInput.value : ''),
      governorate: (governorateSelect ? governorateSelect.value : '')
    };
    
    console.log('Form data collected:', {
      name: formData.name ? 'present' : 'missing',
      email: formData.email ? 'present' : 'missing',
      password: formData.password ? 'present' : 'missing',
      governorate: formData.governorate ? 'present' : 'missing'
    });
    
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
      console.log('Sending registration request:', { email: formData.email, name: formData.name });
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      console.log('Registration response status:', response.status, response.statusText);
      
      // Parse response JSON
      const result = await response.json().catch(err => {
        console.error('Failed to parse response JSON:', err);
        return { success: false, message: 'Invalid server response' };
      });
      
      console.log('Registration response data:', result);
      
      // Check if response is ok
      if (!response.ok) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = result.message || `Registration failed (${response.status}). Please try again.`;
        messageDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        return;
      }
      
      if (result.success && result.data) {
        // Validate required fields
        if (!result.data.token) {
          console.error('Registration response missing token:', result);
          messageDiv.className = 'form-message error';
          messageDiv.textContent = 'Registration failed. Token not received from server.';
          messageDiv.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          return;
        }
        
        if (!result.data.user) {
          console.error('Registration response missing user:', result);
          messageDiv.className = 'form-message error';
          messageDiv.textContent = 'Registration failed. User data not received from server.';
          messageDiv.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          return;
        }
        
        // Store token and user info
        setAuthToken(result.data.token);
        setCurrentUser(result.data.user);
        
        console.log('Registration successful, stored token and user:', {
          token: result.data.token ? 'present' : 'missing',
          user: result.data.user,
          userId: result.data.user.id || result.data.user._id
        });
        
        // Verify storage
        const storedToken = getAuthToken();
        const storedUser = getCurrentUser();
        console.log('Verification - Stored token:', storedToken ? 'present' : 'missing');
        console.log('Verification - Stored user:', storedUser);
        
        messageDiv.className = 'form-message success';
        messageDiv.textContent = 'Account created successfully! Redirecting...';
        messageDiv.style.display = 'block';
        
        // Redirect to dashboard - use absolute path to ensure it works
        setTimeout(() => {
          console.log('Redirecting to student-dashboard.html');
          const currentPath = window.location.pathname;
          const isInPagesFolder = currentPath.includes('/pages/');
          const redirectPath = isInPagesFolder ? 'student-dashboard.html' : 'pages/student-dashboard.html';
          console.log('Redirect path:', redirectPath);
          window.location.href = redirectPath;
        }, 1000);
      } else {
        console.error('Registration response missing success flag or data:', result);
        messageDiv.className = 'form-message error';
        messageDiv.textContent = result.message || 'Registration failed. Invalid response from server.';
        messageDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    } catch (error) {
      console.error('Registration error:', error);
      messageDiv.className = 'form-message error';
      messageDiv.textContent = 'Failed to connect to server. Please check your internet connection and try again.';
      messageDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

