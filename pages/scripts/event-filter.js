window.addEventListener('DOMContentLoaded', function() {    
    
  var filterForm = document.getElementById('filterForm');
  var keywordInput = document.getElementById('keywordInput');
  var categorySelect = document.getElementById('categorySelect');
  var locationInput = document.getElementById('locationInput');
  var dateInput = document.getElementById('dateInput');
  var filterButton = document.getElementById('filterButton');
  var resetButton = document.getElementById('resetButton');
  var tableBody = document.getElementById('tableBody');
  
  const API_URL = 'https://eventx-0bke.onrender.com/api/events';
  const ENROLLMENT_API_URL = 'https://eventx-0bke.onrender.com/api/enrollments';
  
  var allEvents = [];
  var userEnrollments = [];
  var currentUser = null;
  
  // ========== AUTH HELPERS ==========
  function getAuthToken() {
    return localStorage.getItem('authToken');
  }
  
  function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
  }
  
  function getAuthHeaders() {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
  
  // ========== MODAL ELEMENTS ==========
  var addEventButton = document.getElementById('addEventButton');
  var addEventModal = document.getElementById('addEventModal');
  var closeModalBtn = document.getElementById('closeModalBtn');
  var cancelBtn = document.getElementById('cancelBtn');
  var addEventForm = document.getElementById('addEventForm');
  var formMessage = document.getElementById('formMessage');
  var submitEventBtn = document.getElementById('submitEventBtn');
  
  // ========== ROLE-BASED UI ==========
  function setupRoleBasedUI() {
    currentUser = getCurrentUser();
    
    if (currentUser) {
      // Show/hide Add Event button based on role
      if (isAdmin()) {
        if (addEventButton) {
          addEventButton.style.display = 'block';
        }
      } else {
        if (addEventButton) {
          addEventButton.style.display = 'none';
        }
      }
      
      // Load user enrollments if student
      if (!isAdmin()) {
        fetchUserEnrollments();
      }
    } else {
      // Not logged in - hide add event button
      if (addEventButton) {
        addEventButton.style.display = 'none';
      }
    }
  }
  
  // ========== FETCH USER ENROLLMENTS ==========
  async function fetchUserEnrollments() {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const response = await fetch(`${ENROLLMENT_API_URL}/my-enrollments`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          userEnrollments = result.data.map(e => e.event._id || e.event);
          renderEvents(allEvents);
        }
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  }
  
  // ========== ENROLLMENT FUNCTIONS ==========
  async function enrollInEvent(eventId) {
    const token = getAuthToken();
    if (!token) {
      alert('Please login to enroll in events');
      window.location.href = 'login.html';
      return;
    }
    
    try {
      // First, get event details to get the price
      const eventResponse = await fetch(`${API_URL}/${eventId}`);
      const eventResult = await eventResponse.json();
      
      if (!eventResult.success || !eventResult.data) {
        alert('Failed to fetch event details');
        return;
      }
      
      const event = eventResult.data;
      
      // Enroll in the event
      const response = await fetch(`${ENROLLMENT_API_URL}/events/${eventId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Store enrolled event data for calculator
        const enrolledEvent = {
          id: event._id || event.id,
          title: event.title,
          price: event.cost || 0,
          date: event.date,
          category: event.category
        };
        
        // Get current user ID for per-user calculator storage
        function getCurrentUserId() {
          try {
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
              const user = JSON.parse(userStr);
              return user.id || user._id || null;
            }
          } catch (e) {
            return null;
          }
          return null;
        }
        
        // Get storage key for calculator events (per user)
        const userId = getCurrentUserId();
        const storageKey = userId ? `calculatorEvents_${userId}` : 'calculatorEvents';
        
        // Get existing enrolled events from localStorage
        let enrolledEvents = [];
        const storedEvents = localStorage.getItem(storageKey);
        if (storedEvents) {
          try {
            enrolledEvents = JSON.parse(storedEvents);
          } catch (e) {
            enrolledEvents = [];
          }
        }
        
        // Add new event if not already in the list (NO LIMIT - can add unlimited events)
        const exists = enrolledEvents.some(e => e.id === enrolledEvent.id);
        if (!exists) {
          enrolledEvents.push(enrolledEvent);
          localStorage.setItem(storageKey, JSON.stringify(enrolledEvents));
        }
        
        // Redirect to calculator
        window.location.href = 'budget-calculator.html';
      } else {
        alert(result.message || 'Failed to enroll in event');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to enroll in event. Please try again.');
    }
  }
  
  function isEnrolled(eventId) {
    return userEnrollments.some(eId => String(eId) === String(eventId));
  }
  
  // ========== MODAL FUNCTIONS ==========
  function openModal() {
    const token = getAuthToken();
    if (!token || !isAdmin()) {
      alert('Please login as admin to add events');
      window.location.href = 'login.html';
      return;
    }
    if (addEventModal) {
      addEventModal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (addEventModal) {
      addEventModal.classList.remove('show');
      document.body.style.overflow = '';
      if (addEventForm) {
        addEventForm.reset();
      }
      if (formMessage) {
        formMessage.className = 'form-message';
        formMessage.textContent = '';
      }
    }
  }
  
  if (addEventButton) {
    addEventButton.addEventListener('click', openModal);
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }
  
  if (addEventModal) {
    addEventModal.addEventListener('click', function(event) {
      if (event.target === addEventModal) {
        closeModal();
      }
    });
  }
  
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && addEventModal && addEventModal.classList.contains('show')) {
      closeModal();
    }
  });
  
  // ========== ADD EVENT FORM SUBMISSION ==========
  if (addEventForm) {
    addEventForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      
      if (formMessage) {
        formMessage.className = 'form-message';
        formMessage.textContent = '';
      }
      
      if (submitEventBtn) {
        submitEventBtn.disabled = true;
        submitEventBtn.textContent = 'Adding...';
      }
      
      var formData = {
        title: document.getElementById('eventTitleInput').value.trim(),
        description: document.getElementById('eventDescriptionInput').value.trim(),
        date: document.getElementById('eventDateInput').value,
        location: document.getElementById('eventLocationInput').value.trim(),
        category: document.getElementById('eventCategoryInput').value,
        cost: parseFloat(document.getElementById('eventCostInput').value) || 0
      };
      
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          if (formMessage) {
            formMessage.className = 'form-message success';
            formMessage.textContent = 'Event added successfully!';
          }
          
          setTimeout(function() {
            closeModal();
            fetchEvents();
          }, 1500);
        } else {
          if (formMessage) {
            formMessage.className = 'form-message error';
            formMessage.textContent = result.message || 'Failed to add event. Please try again.';
          }
          if (submitEventBtn) {
            submitEventBtn.disabled = false;
            submitEventBtn.textContent = 'Add Event';
          }
        }
      } catch (error) {
        console.error('Error adding event:', error);
        if (formMessage) {
          formMessage.className = 'form-message error';
          formMessage.textContent = 'Failed to connect to server. Please make sure the server is running.';
        }
        if (submitEventBtn) {
          submitEventBtn.disabled = false;
          submitEventBtn.textContent = 'Add Event';
        }
      }
    });
  }
  
  // ========== FETCH AND RENDER EVENTS ==========
  async function fetchEvents() {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      
      if (result.success) {
        allEvents = result.data;
        renderEvents(allEvents);
      } else {
        console.error('Error fetching events:', result.message);
        displayError('Failed to load events. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      displayError('Failed to connect to server. Please make sure the server is running.');
    }
  }
  
  function renderEvents(events) {
    tableBody.innerHTML = '';
    
    if (events.length === 0) {
      var emptyRow = document.createElement('tr');
      emptyRow.innerHTML = '<td colspan="5" style="text-align: center; padding: 20px;">No events found</td>';
      tableBody.appendChild(emptyRow);
      return;
    }
    
    events.forEach(event => {
      var row = document.createElement('tr');
      row.setAttribute('data-category', event.category.toLowerCase());
      
      var eventDate = new Date(event.date);
      var formattedDate = eventDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      var costDisplay = event.cost === 0 || event.cost === null ? 'Free' : '$' + event.cost;
      
      // Create action cell based on role and authentication
      var actionCell = '';
      var currentUser = getCurrentUser();
      
      if (!currentUser) {
        // Not logged in - show disabled button with login prompt
        actionCell = '<td><button type="button" class="enroll-btn" disabled title="Please login to enroll">Login to Enroll</button></td>';
      } else if (isAdmin()) {
        // Admin sees nothing (or could add edit/delete later)
        actionCell = '<td></td>';
      } else {
        // Student sees enroll button
        if (isEnrolled(event._id)) {
          actionCell = '<td><span style="color: green; font-weight: bold;">Enrolled</span></td>';
        } else {
          actionCell = `<td><button type="button" class="enroll-btn" data-event-id="${event._id}">Enroll</button></td>`;
        }
      }
      
      row.innerHTML = `
        <td>${escapeHtml(event.title)}</td>
        <td><time datetime="${event.date}">${formattedDate}</time></td>
        <td>${escapeHtml(event.location)}</td>
        <td>${costDisplay}</td>
        ${actionCell}
      `;
      
      tableBody.appendChild(row);
    });
    
    // Add event listeners to enroll buttons
    var enrollButtons = tableBody.querySelectorAll('.enroll-btn');
    enrollButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        var eventId = this.getAttribute('data-event-id');
        enrollInEvent(eventId);
      });
    });
  }
  
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  function displayError(message) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: red;">${message}</td></tr>`;
  }
  
  function filterEvents() {
    var keyword = keywordInput.value.toLowerCase().trim();
    var category = categorySelect.value.toLowerCase();
    var location = locationInput.value.toLowerCase().trim();
    var selectedDate = dateInput.value;
    
    var filteredEvents = allEvents.filter(event => {
      var matchesKeyword = keyword === '' || 
        event.title.toLowerCase().indexOf(keyword) !== -1 ||
        event.description.toLowerCase().indexOf(keyword) !== -1;
      
      var matchesCategory = category === 'all' || category === '' || 
        event.category.toLowerCase() === category;
      
      var matchesLocation = location === '' || 
        event.location.toLowerCase().indexOf(location) !== -1;
      
      var matchesDate = true;
      if (selectedDate !== '') {
        var eventDate = new Date(event.date);
        var eventDateString = eventDate.toISOString().split('T')[0];
        matchesDate = eventDateString === selectedDate;
      }
      
      return matchesKeyword && matchesCategory && matchesLocation && matchesDate;
    });
    
    renderEvents(filteredEvents);
  }
  
  function resetFilters() {
    keywordInput.value = '';
    categorySelect.value = 'all';
    locationInput.value = '';
    dateInput.value = '';
    
    renderEvents(allEvents);
  }
  
  if (filterButton) {
    filterButton.addEventListener('click', function(event) {
      event.preventDefault();
      filterEvents();
    });
  }
  
  if (resetButton) {
    resetButton.addEventListener('click', function(event) {
      event.preventDefault();
      resetFilters();
    });
  }
  
  // Initialize
  setupRoleBasedUI();
  fetchEvents();
});
