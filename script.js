const TARGET_NUMBER = "918157039987"; // Target WhatsApp number

    let bookingDetails = {};

// Function to get booked slots from localStorage (kept for historical data)
function getBookedSlots() {
    try {
        const booked = JSON.parse(localStorage.getItem('bookedSlots')) || {};
        return booked;
    } catch (e) {
        console.error("Could not parse booked slots from localStorage", e);
        return {};
    }
}

// Function to save a booked slot to localStorage (kept for historical data)
function saveBookedSlot(service, date, time) {
    const booked = getBookedSlots();
    if (!booked[service]) {
        booked[service] = {};
    }
    if (!booked[service][date]) {
        booked[service][date] = [];
    }
    booked[service][date].push(time);
    localStorage.setItem('bookedSlots', JSON.stringify(booked));
}

// Function to get the appropriate timing range based on session type
function getTimingRange(sessionType) {
    if (sessionType === 'Online') {
        return '8 am to 9 pm';
    } else if (sessionType === 'Offline') {
        return '9 am to 5 pm';
    }
    return 'Not Specified';
}

// Function to build the WhatsApp message - UPDATED 'Time' line
function buildMessage({ name, email, service, date, time, phone, sessionType, comments }) {
  return [
    `New Booking Alert! 🚨`,
    `--------------------------`,
    `Hello! We have a new session booking request:`,
    `Service: ${service}`,
    `Date: ${date}`,
    `Requested Time: ${time}`, 
    `Session Type: ${sessionType}`,
    `Client Name: ${name}`,
    `Contact: ${phone}`,
    `Email: ${email}`,
    `Notes:`,
    `May be the session be changed as per the expert's availability.`,
    `--------------------------`,
    comments
  ].join("\n");
}

function isMobile() {
    // Improved mobile detection logic for broader compatibility
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|BlackBerry/i.test(navigator.userAgent);
}

// Function to open WhatsApp - Handles redirect for mobile and web
function openWhatsApp(number, text) {
  const encoded = encodeURIComponent(text);
  // Using wa.me for mobile is better for direct app launch
  const base = isMobile()
    ? `https://wa.me/${number}?text=${encoded}` 
    : `https://web.whatsapp.com/send?phone=${number}&text=${encoded}`;
  window.location.href = base; 
}

// Mobile menu functionality
document.getElementById('menu-button').addEventListener('click', () => {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
});

// Set service dropdown when a service card button is clicked
const serviceButtons = document.querySelectorAll('.service-book-btn');
serviceButtons.forEach(button => {
    button.addEventListener('click', () => {
        const serviceName = button.getAttribute('data-service');
        const serviceSelect = document.getElementById('service');
        for (let i = 0; i < serviceSelect.options.length; i++) {
            if (serviceSelect.options[i].text.includes(serviceName)) {
                serviceSelect.value = serviceSelect.options[i].value;
                break;
            }
        }
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
});

// **Availability Feature functions and event listener REMOVED**

// **Availability Feature elements now point to null and are not used, preventing errors**
const checkAvailabilityBtn = null;
const serviceSelectElement = document.getElementById('service');
const availabilityMessage = null;
const availableSlotsContainer = null;
const availableSlots = null;


// Form submission handling
const form = document.getElementById('booking-form');
const bookingContainer = document.getElementById('booking-container');
const successMessage = document.getElementById('booking-success-message');
const whatsappShareBtn = document.getElementById('whatsapp-share-btn');

form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value.trim();
    const selectedDateInput = document.getElementById('date');
    const date = selectedDateInput ? selectedDateInput.value.trim() : new Date().toISOString().slice(0, 10);
    
    // **NEW: Get requested time from the dedicated input**
    const requestedTimeInput = document.getElementById('requested-time');
    const requestedTime = requestedTimeInput ? requestedTimeInput.value.trim() : null;

    // **Old logic for selectedTimeElement removed**
    // const selectedTimeElement = document.querySelector('.slot-button.bg-indigo-600'); 
    // const time = selectedTimeElement ? selectedTimeElement.textContent.trim() : null;

    const sessionType = document.querySelector('input[name="session-type"]:checked') ? document.querySelector('input[name="session-type"]:checked').value : '';
    const comments = document.getElementById("message").value.trim();

    // **Validation updated to check for requestedTime instead of a slot selection**
    if (!name || !email || !service || !requestedTime || !sessionType) {
        alert("Please fill out all required fields, including your requested date and time.");
        return;
    }
    
    // **Augment the time to include the relevant timing range for clarity in the message**
    const timingRange = getTimingRange(sessionType);
    const finalTime = `${requestedTime} (Request within ${timingRange} for ${sessionType} sessions)`;


    // Save the booked slot (using the augmented time)
    saveBookedSlot(service, date, finalTime);

    // Store booking details in a global variable
    bookingDetails = { name, email, phone, service, date, time: finalTime, sessionType, comments };
    
    // Hide the form and show the success message
    form.classList.add('hidden');
    successMessage.classList.remove('hidden');
    bookingContainer.scrollIntoView({ behavior: 'smooth' });
});

// WhatsApp share button listener
whatsappShareBtn.addEventListener('click', () => {
    const text = buildMessage(bookingDetails);
    openWhatsApp(TARGET_NUMBER, text);
});
