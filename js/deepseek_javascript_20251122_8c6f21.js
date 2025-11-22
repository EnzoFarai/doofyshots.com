// JavaScript for nav highlighting
document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        document.querySelectorAll('.nav a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // If it's the contact link, scroll to footer
        if(this.getAttribute('href') === '#contact') {
            e.preventDefault();
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Smooth scroll for contact link
document.querySelector('a[href="#contact"]').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
});

// Modal functionality
const modal = document.getElementById('booking-modal');
const mainBookNowBtn = document.getElementById('main-book-now');
const modalBookNowBtns = document.querySelectorAll('.book-now-modal-btn');
const closeModal = document.querySelector('.close-modal');
const bookingForm = document.getElementById('booking-form');
const sessionTypeSelect = document.getElementById('session-type');
const dateTypeSelect = document.getElementById('date-type');
const singleDateGroup = document.getElementById('single-date-group');
const periodDateGroup = document.getElementById('period-date-group');
const sessionDateInput = document.getElementById('session-date');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const startTimeInput = document.getElementById('start-time');

// Set minimum dates and times
function setMinDates() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Set minimum dates to today
    sessionDateInput.min = today;
    startDateInput.min = today;
    endDateInput.min = today;
    
    // For time, we only validate if the selected date is today
    // Otherwise, any time is valid for future dates
    const selectedDate = sessionDateInput.value || startDateInput.value;
    if (selectedDate === today) {
        const currentTime = now.toTimeString().slice(0,5);
        startTimeInput.min = currentTime;
    } else {
        startTimeInput.removeAttribute('min');
    }
}

// Initialize date restrictions
setMinDates();

// Update time validation when dates change
sessionDateInput.addEventListener('change', setMinDates);
startDateInput.addEventListener('change', setMinDates);

// Modal open/close functions
function openModal(sessionType = '') {
    if (sessionType) {
        sessionTypeSelect.value = sessionType;
    }
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Reset and set min dates when opening modal
    setMinDates();
}

function closeModalFunc() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    bookingForm.reset();
    setMinDates();
}

// Event listeners for modal
mainBookNowBtn.addEventListener('click', function(e) {
    e.preventDefault();
    openModal();
});

modalBookNowBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const sessionType = this.getAttribute('data-session');
        openModal(sessionType);
    });
});

closeModal.addEventListener('click', closeModalFunc);

window.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModalFunc();
    }
});

// Date type toggle - FIXED
dateTypeSelect.addEventListener('change', function() {
    if (this.value === 'single') {
        singleDateGroup.classList.remove('hidden');
        periodDateGroup.classList.add('hidden');
        
        // Make single date required, period dates not required
        sessionDateInput.required = true;
        startDateInput.required = false;
        endDateInput.required = false;
    } else {
        singleDateGroup.classList.add('hidden');
        periodDateGroup.classList.remove('hidden');
        
        // Make period dates required, single date not required
        sessionDateInput.required = false;
        startDateInput.required = true;
        endDateInput.required = true;
    }
});

// Initialize date type on page load
document.addEventListener('DOMContentLoaded', function() {
    dateTypeSelect.dispatchEvent(new Event('change'));
});

// Form submission
bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate end date is after start date for period bookings
    if (dateTypeSelect.value === 'period') {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        
        if (endDate <= startDate) {
            alert('End date must be after start date');
            return;
        }
    }
    
    // Get form values
    const formData = {
        name: document.getElementById('client-name').value,
        email: document.getElementById('client-email').value,
        phone: document.getElementById('client-phone').value,
        location: document.getElementById('client-location').value,
        sessionType: sessionTypeSelect.value,
        dateType: dateTypeSelect.value,
        date: dateTypeSelect.value === 'single' ? sessionDateInput.value : `${startDateInput.value} to ${endDateInput.value}`,
        time: startTimeInput.value,
        people: document.getElementById('number-people').value,
        comments: document.getElementById('comments').value
    };
    
    // Format WhatsApp message
    const message = `Hello, Doofy Shots! I would like to book a session. Here are my details:

*CLIENT DETAILS*
*Name:* ${formData.name}
*Email:* ${formData.email}
*Phone:* ${formData.phone}
*Location:* ${formData.location}

*SESSION INFORMATION*
*Type of Session:* ${formData.sessionType}
*Date:* ${formData.date}
*Starting Time:* ${formData.time}
*Number of People:* ${formData.people || 'Not specified'}
*Comments/Special Wishes:* ${formData.comments || 'None'}

Looking forward to hearing from you!`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/27692167121?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Close modal
    closeModalFunc();
});

// Fix for dropdowns on mobile - prevent long press requirement
document.querySelectorAll('select').forEach(select => {
    select.addEventListener('touchstart', function(e) {
        e.stopPropagation();
    }, { passive: true });
    
    select.addEventListener('mousedown', function(e) {
        e.stopPropagation();
    });
});

// 3D Carousel Script - Exact copy from working example
// Global variables
var radius = 240; // how big of the radius
var autoRotate = true; // auto rotate or not
var rotateSpeed = -60; // unit: seconds/360 degrees
var imgWidth = 120; // width of images (unit: px)
var imgHeight = 170; // height of images (unit: px)

// Animation start after 1000 milliseconds
setTimeout(init, 1000);

var odrag = document.getElementById('drag-container');
var ospin = document.getElementById('spin-container');
var aImg = ospin.getElementsByTagName('img');
var aVid = ospin.getElementsByTagName('video');
var aEle = [...aImg, ...aVid]; // combine 2 arrays

// Size of images
ospin.style.width = imgWidth + "px";
ospin.style.height = imgHeight + "px";

// Size of ground - depend on radius
var ground = document.getElementById('ground');
ground.style.width = radius * 3 + "px";
ground.style.height = radius * 3 + "px";

function init(delayTime) {
    for (var i = 0; i < aEle.length; i++) {
        aEle[i].style.transform = "rotateY(" + (i * (360 / aEle.length)) + "deg) translateZ(" + radius + "px)";
        aEle[i].style.transition = "transform 1s";
        aEle[i].style.transitionDelay = delayTime || (aEle.length - i) / 4 + "s";
    }
}

function applyTranform(obj) {
    // Constrain the angle of camera (between 0 and 180)
    if(tY > 180) tY = 180;
    if(tY < 0) tY = 0;

    // Apply the angle
    obj.style.transform = "rotateX(" + (-tY) + "deg) rotateY(" + (tX) + "deg)";
}

function playSpin(yes) {
    ospin.style.animationPlayState = (yes?'running':'paused');
}

var sX, sY, nX, nY, desX = 0,
    desY = 0,
    tX = 0,
    tY = 10;

// auto spin
if (autoRotate) {
    var animationName = (rotateSpeed > 0 ? 'spin' : 'spinRevert');
    ospin.style.animation = `${animationName} ${Math.abs(rotateSpeed)}s infinite linear`;
}

// setup events
document.onpointerdown = function (e) {
    clearInterval(odrag.timer);
    e = e || window.event;
    var sX = e.clientX,
        sY = e.clientY;

    this.onpointermove = function (e) {
        e = e || window.event;
        var nX = e.clientX,
            nY = e.clientY;
        desX = nX - sX;
        desY = nY - sY;
        tX += desX * 0.1;
        tY += desY * 0.1;
        applyTranform(odrag);
        sX = nX;
        sY = nY;
    };

    this.onpointerup = function (e) {
        odrag.timer = setInterval(function () {
            desX *= 0.95;
            desY *= 0.95;
            tX += desX * 0.1;
            tY += desY * 0.1;
            applyTranform(odrag);
            playSpin(false);
            if (Math.abs(desX) < 0.5 && Math.abs(desY) < 0.5) {
                clearInterval(odrag.timer);
                playSpin(true);
            }
        }, 17);
        this.onpointermove = this.onpointerup = null;
    };

    return false;
};

document.onmousewheel = function(e) {
    e = e || window.event;
    var d = e.wheelDelta / 20 || -e.detail;
    radius += d;
    init(1);
};