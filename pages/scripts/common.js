// File: scripts/common.js
// Shared JavaScript utilities used across all pages

const API_URL = 'https://eventx-0bke.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
  updateCopyrightYear();
  setActiveNavLink();
  enableSmoothScroll();
  secureExternalLinks();
  initProfileDropdown();
  toggleRegistrationLink();
  toggleSignInLinks();
});

/* Update copyright year automatically */
function updateCopyrightYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll('.copyright-year').forEach(el => {
    el.textContent = year;
  });
}

/* Highlight active navigation link */
function setActiveNavLink() {
  const currentPage = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.navLink').forEach(link => {
    const linkPage = link.getAttribute('href');
    link.classList.toggle('active', linkPage === currentPage);
  });
}

/* Smooth scrolling for anchor links */
function enableSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* Add security attributes to external links */
function secureExternalLinks() {
  const host = location.hostname;

  document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (!link.href.includes(host)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  });
}

/* Profile Dropdown Functions */
function getAuthToken() {
  return localStorage.getItem('authToken');
}

function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

function clearAuth() {
  // Only clear authentication data, NOT calculator events
  // Calculator events are stored per user and should persist across sign outs
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
}

// Helper function to get correct path based on current location
function getCorrectPath(relativePath) {
  // If relativePath already starts with 'pages/', return it as-is
  if (relativePath.startsWith('pages/')) {
    return relativePath;
  }
  
  const currentPath = window.location.pathname;
  
  // Check if current page is in pages folder by looking for '/pages/' in pathname
  const isInPagesFolder = currentPath.includes('/pages/');
  
  // If we're in pages folder, use relative path
  // If we're at root, prepend 'pages/'
  const finalPath = isInPagesFolder ? relativePath : `pages/${relativePath}`;
  
  return finalPath;
}

function signOut() {
  console.log('signOut() called');
  
  // Only clear authentication - preserve calculator data per user
  // Calculator data is stored as calculatorEvents_${userId} and will persist
  clearAuth();
  
  // Simple and direct: check if current pathname contains '/pages/'
  // If it does, we're in pages folder -> use 'login.html'
  // If it doesn't, we're at root -> use 'pages/login.html'
  const currentPath = window.location.pathname;
  const isInPagesFolder = currentPath.includes('/pages/');
  const loginPath = isInPagesFolder ? 'login.html' : 'pages/login.html';
  
  console.log('Sign out - Current path:', currentPath);
  console.log('Sign out - Is in pages folder:', isInPagesFolder);
  console.log('Sign out - Redirecting to:', loginPath);
  
  // Redirect
  window.location.href = loginPath;
}

// Make signOut globally accessible
// This must be the final definition to override any other signOut functions
window.signOut = signOut;

// Re-define after a short delay to ensure it overrides auth.js if it loads after
setTimeout(() => {
  window.signOut = signOut;
}, 0);

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/* Update Profile Icon */
function updateProfileIconElement(profileIcon, userData) {
  if (!profileIcon) return;
  
  // Clear existing content
  profileIcon.textContent = '';
  profileIcon.classList.remove('has-image');
  
  // Remove existing image if any
  const existingImg = profileIcon.querySelector('img');
  if (existingImg) {
    existingImg.remove();
  }
  
  // If user has profile picture, show image
  if (userData && userData.profilePicture) {
    const img = document.createElement('img');
    img.src = userData.profilePicture;
    img.alt = 'Profile Picture';
    profileIcon.appendChild(img);
    profileIcon.classList.add('has-image');
  } else {
    // Show initials
    profileIcon.textContent = getInitials(userData?.name || 'U');
  }
}

/* Initialize Profile Dropdown */
async function initProfileDropdown() {
  const user = getCurrentUser();
  const profileContainer = document.getElementById('profileContainer');
  
  if (!profileContainer) {
    console.warn('Profile container not found');
    return;
  }
  
  if (!user) {
    profileContainer.setAttribute('data-hidden', 'true');
    return;
  }
  
  // Show profile
  profileContainer.setAttribute('data-hidden', 'false');
  
  const profileIcon = profileContainer.querySelector('.profile-icon');
  const profileDropdown = profileContainer.querySelector('.profile-dropdown');
  const profileBtn = profileContainer.querySelector('[data-action="profile"]');
  const signOutBtn = profileContainer.querySelector('[data-action="switch"]');
  
  console.log('Profile dropdown elements:', {
    profileIcon: !!profileIcon,
    profileDropdown: !!profileDropdown,
    profileBtn: !!profileBtn,
    signOutBtn: !!signOutBtn
  });
  
  // Fetch full user data to get profile picture
  try {
    const token = getAuthToken();
    if (token) {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const fullUserData = result.data;
          updateProfileIconElement(profileIcon, fullUserData);
        } else {
          // Fallback to initials if API fails
          updateProfileIconElement(profileIcon, user);
        }
      } else {
        // Fallback to initials if API fails
        updateProfileIconElement(profileIcon, user);
      }
    } else {
      // Fallback to initials if no token
      updateProfileIconElement(profileIcon, user);
    }
  } catch (error) {
    console.error('Error fetching user data for profile icon:', error);
    // Fallback to initials on error
    updateProfileIconElement(profileIcon, user);
  }
  
  // Create global function to update profile icon (called from profile page)
  window.updateProfileIcon = async function() {
    const token = getAuthToken();
    if (!token || !profileIcon) return;
    
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          updateProfileIconElement(profileIcon, result.data);
        }
      }
    } catch (error) {
      console.error('Error updating profile icon:', error);
    }
  };
  
  // Toggle dropdown
  if (profileIcon && profileDropdown) {
    profileIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('show');
    });
    
    // Use event delegation on the dropdown for all button clicks
    profileDropdown.addEventListener('click', (e) => {
      const target = e.target;
      
      // Check if clicked element or its parent is a button with data-action
      const button = target.closest('[data-action]');
      if (!button) return;
      
      const action = button.getAttribute('data-action');
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Dropdown button clicked, action:', action);
      
      if (action === 'switch') {
        // Sign out
        console.log('Sign out triggered from dropdown');
        profileDropdown.classList.remove('show');
        signOut();
      } else if (action === 'profile') {
        // Go to profile
        const profilePath = getCorrectPath('profile.html');
        window.location.href = profilePath;
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!profileContainer.contains(e.target)) {
        profileDropdown.classList.remove('show');
      }
    });
  }
  
  // Also add direct handlers as backup
  if (profileBtn) {
    profileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const profilePath = getCorrectPath('profile.html');
      window.location.href = profilePath;
    });
  }
  
  // Direct sign out handler
  if (signOutBtn) {
    signOutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Sign out button clicked (direct handler)');
      signOut();
    });
    
    signOutBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Sign out button clicked (onclick)');
      signOut();
      return false;
    };
    
    console.log('Sign out button found and handlers attached');
  } else {
    console.error('Sign out button not found!');
  }
}

/* Toggle Registration Link - Hide when logged in */
function toggleRegistrationLink() {
  const user = getCurrentUser();
  const registrationNavItem = document.getElementById('navRegister');
  
  if (!registrationNavItem) return;
  
  // Find the parent <li> element
  const registrationNavItemParent = registrationNavItem.closest('.navItem');
  
  if (!registrationNavItemParent) return;
  
  if (user) {
    // Hide registration link when logged in
    registrationNavItemParent.style.display = 'none';
  } else {
    // Show registration link when not logged in
    registrationNavItemParent.style.display = '';
  }
}

/* Toggle Sign In Links - Hide when logged in */
function toggleSignInLinks() {
  const user = getCurrentUser();
  const token = getAuthToken();
  const isAuthenticated = user && token;
  
  // Hide hero section Sign In button
  const heroSignInLink = document.getElementById('heroSignInLink');
  if (heroSignInLink) {
    if (isAuthenticated) {
      heroSignInLink.style.display = 'none';
    } else {
      heroSignInLink.style.display = '';
    }
  }
  
  // Hide sidebar Sign In link
  const sidebarSignInItem = document.getElementById('sidebarSignInItem');
  if (sidebarSignInItem) {
    if (isAuthenticated) {
      sidebarSignInItem.style.display = 'none';
    } else {
      sidebarSignInItem.style.display = '';
    }
  }
}
