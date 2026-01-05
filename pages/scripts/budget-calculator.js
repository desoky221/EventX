(() => {
  "use strict";

  const API_URL = 'http://localhost:3000/api/events';
  const DISTANCE_TO_CAPITAL_KM = {
    Cairo: 0,
    Giza: 20,
    Alexandria: 220,
    "Port Said": 200,
    Suez: 140,
    Ismailia: 120,
    Sharqia: 80,
    Dakahlia: 150,
    Gharbia: 120,
    "Kafr El Sheikh": 200,
    Beheira: 180,
    Minya: 250,
    Assiut: 375,
    Sohag: 460,
    Qena: 600,
    Luxor: 670,
    Aswan: 880,
  };

  let enrolledEvents = [];
  let allAvailableEvents = [];

  function toInt(n, def = 0) {
    const x = Number(n);
    return Number.isFinite(x) ? Math.trunc(x) : def;
  }

  function money2(n) {
    return `$${Number(n).toFixed(2)}`;
  }

  function moneyIntSuffix(n) {
    return `${Math.round(Number(n))}$`;
  }

  // price = 5 + 0.01 * distance
  function transportPrice(fromGov) {
    const key = String(fromGov || "").trim();
    const km = DISTANCE_TO_CAPITAL_KM[key] ?? 0;
    return Math.round(5 + 0.01 * km); // integer
  }

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
  function getCalculatorStorageKey() {
    const userId = getCurrentUserId();
    return userId ? `calculatorEvents_${userId}` : 'calculatorEvents';
  }

  // Load enrolled events from localStorage (per user)
  function loadEnrolledEvents() {
    const storageKey = getCalculatorStorageKey();
    const storedEvents = localStorage.getItem(storageKey);
    if (storedEvents) {
      try {
        enrolledEvents = JSON.parse(storedEvents);
      } catch (e) {
        enrolledEvents = [];
      }
    } else {
      enrolledEvents = [];
    }
    renderEnrolledEvents();
    updateTicketsTotal();
  }

  // Render enrolled events list
  function renderEnrolledEvents() {
    const eventsList = document.querySelector("#enrolledEventsList");
    if (!eventsList) return;

    eventsList.innerHTML = '';

    if (enrolledEvents.length === 0) {
      eventsList.innerHTML = '<p style="color: #666; font-style: italic;">No events enrolled yet. Enroll in events to see them here.</p>';
      return;
    }

    enrolledEvents.forEach((event, index) => {
      const eventDiv = document.createElement('div');
      eventDiv.style.cssText = 'padding: 10px; margin: 5px 0; background: #f5f5f5; border-radius: 5px; display: flex; justify-content: space-between; align-items: center;';
      
      const eventInfo = document.createElement('div');
      eventInfo.innerHTML = `
        <strong>${escapeHtml(event.title)}</strong><br>
        <small style="color: #666;">Price: ${money2(event.price)}</small>
      `;
      
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = 'Remove';
      removeBtn.className = 'actionBtn';
      removeBtn.style.cssText = 'padding: 5px 10px; font-size: 12px;';
      removeBtn.onclick = () => removeEvent(index);
      
      eventDiv.appendChild(eventInfo);
      eventDiv.appendChild(removeBtn);
      eventsList.appendChild(eventDiv);
    });
  }

  // Remove event from list
  function removeEvent(index) {
    enrolledEvents.splice(index, 1);
    const storageKey = getCalculatorStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(enrolledEvents));
    renderEnrolledEvents();
    updateTicketsTotal();
    updateTotal();
  }

  // Update tickets total (sum of all enrolled events)
  function updateTicketsTotal() {
    const ticketsTotalField = document.querySelector("#ticketsTotalField");
    if (!ticketsTotalField) return;

    const total = enrolledEvents.reduce((sum, event) => sum + (event.price || 0), 0);
    ticketsTotalField.value = `Total: ${money2(total)}`;
  }

  // Fetch all available events for "Add More Events"
  async function fetchAllEvents() {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      if (result.success && result.data) {
        allAvailableEvents = result.data;
        showAddEventsModal();
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      // If API fails, just redirect to events page
      window.location.href = 'events.html';
    }
  }

  // Show modal to add more events
  function showAddEventsModal() {
    // Simple approach: redirect to events page
    // User can enroll there and will be redirected back
    window.location.href = 'events.html';
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  window.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#budgetForm");
    if (!form) return;

    const ticketsTotalField = document.querySelector("#ticketsTotalField");
    const useYes = document.querySelector("#useTransportYes");
    const useNo = document.querySelector("#useTransportNo");
    const fromGov = document.querySelector("#fromGovernorate");
    const transportCost = document.querySelector("#transportCost");
    const foodCost = document.querySelector("#foodCost");
    const accommodationTotal = document.querySelector("#accommodationTotal");
    const grandTotalField = document.querySelector("#grandTotalField");
    const grandTotalSpan = document.querySelector("#grandTotal");
    const resultsBox = document.querySelector("#budgetResults");
    const addMoreEventsBtn = document.querySelector("#addMoreEventsBtn");

    // Clear old calculator data if user changed (check for old format)
    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      // If old format exists and user is logged in, clear it
      const oldEvents = localStorage.getItem('calculatorEvents');
      if (oldEvents) {
        try {
          const oldEventsData = JSON.parse(oldEvents);
          // If old data exists and doesn't match current user, clear it
          localStorage.removeItem('calculatorEvents');
        } catch (e) {
          localStorage.removeItem('calculatorEvents');
        }
      }
    }

    // Load enrolled events on page load (per user)
    loadEnrolledEvents();

    // Add more events button
    if (addMoreEventsBtn) {
      addMoreEventsBtn.addEventListener('click', fetchAllEvents);
    }

    function updateInline() {
      updateTicketsTotal();

      const accom = Math.max(0, Number(foodCost?.value || 0));
      if (accommodationTotal) accommodationTotal.textContent = money2(accom);

      const useTransport = !!useYes?.checked;
      if (fromGov) fromGov.disabled = !useTransport;

      let tCost = 0;
      if (useTransport) tCost = transportPrice(fromGov?.value);

      // show like: 20$
      if (transportCost) transportCost.value = moneyIntSuffix(tCost);
      
      updateTotal();
    }

    function updateTotal() {
      const ticketsTotal = enrolledEvents.reduce((sum, event) => sum + (event.price || 0), 0);
      const accom = Math.max(0, Number(foodCost?.value || 0));
      const useTransport = !!useYes?.checked;
      const tCost = useTransport ? transportPrice(fromGov?.value) : 0;
      const total = ticketsTotal + accom + tCost;

      if (grandTotalField) grandTotalField.value = money2(total);
      if (grandTotalSpan) grandTotalSpan.textContent = money2(total);
    }

    function calculateTotal(e) {
      e.preventDefault();
      updateTotal();
      if (resultsBox) resultsBox.hidden = false;
    }

    // events
    foodCost?.addEventListener("change", updateInline);
    useYes?.addEventListener("change", updateInline);
    useNo?.addEventListener("change", updateInline);
    fromGov?.addEventListener("change", updateInline);

    form.addEventListener("submit", calculateTotal);
    form.addEventListener("reset", () => {
      setTimeout(() => {
        if (resultsBox) resultsBox.hidden = true;
        if (grandTotalField) grandTotalField.value = "$0.00";
        updateInline();
      }, 0);
    });

    // initial
    updateInline();
  });
})();
