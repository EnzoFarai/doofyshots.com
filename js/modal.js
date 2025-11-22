// Modal functionality - Separate file for reusability
class BookingModal {
    constructor() {
        this.modal = null;
        this.bookingForm = null;
        this.sessionTypeSelect = null;
        this.dateTypeSelect = null;
        this.singleDateGroup = null;
        this.periodDateGroup = null;
        this.sessionDateInput = null;
        this.startDateInput = null;
        this.endDateInput = null;
        this.startTimeInput = null;
        
        this.init();
    }
    
    init() {
        // Load modal HTML
        this.loadModalHTML().then(() => {
            this.setupModalElements();
            this.setupEventListeners();
            this.setMinDates();
        });
    }
    
    async loadModalHTML() {
        try {
            const response = await fetch('modal.html');
            const modalHTML = await response.text();
            document.getElementById('modal-container').innerHTML = modalHTML;
        } catch (error) {
            console.error('Error loading modal HTML:', error);
        }
    }
    
    setupModalElements() {
        this.modal = document.getElementById('booking-modal');
        this.bookingForm = document.getElementById('booking-form');
        this.sessionTypeSelect = document.getElementById('session-type');
        this.dateTypeSelect = document.getElementById('date-type');
        this.singleDateGroup = document.getElementById('single-date-group');
        this.periodDateGroup = document.getElementById('period-date-group');
        this.sessionDateInput = document.getElementById('session-date');
        this.startDateInput = document.getElementById('start-date');
        this.endDateInput = document.getElementById('end-date');
        this.startTimeInput = document.getElementById('start-time');
    }
    
    setupEventListeners() {
        // Main Book Now button
        const mainBookNowBtn = document.getElementById('main-book-now');
        if (mainBookNowBtn) {
            mainBookNowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal();
            });
        }
        
        // Card Book Now buttons
        const modalBookNowBtns = document.querySelectorAll('.book-now-modal-btn');
        modalBookNowBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const sessionType = btn.getAttribute('data-session');
                this.openModal(sessionType);
            });
        });
        
        // Close modal
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeModalFunc();
            });
        }
        
        // Date type toggle
        if (this.dateTypeSelect) {
            this.dateTypeSelect.addEventListener('change', () => {
                this.handleDateTypeChange();
            });
        }
        
        // Form submission
        if (this.bookingForm) {
            this.bookingForm.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
            });
        }
        
        // Date change listeners
        if (this.sessionDateInput) {
            this.sessionDateInput.addEventListener('change', () => {
                this.setMinDates();
            });
        }
        if (this.startDateInput) {
            this.startDateInput.addEventListener('change', () => {
                this.setMinDates();
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModalFunc();
            }
        });
        
        // Initialize date type
        if (this.dateTypeSelect) {
            this.dateTypeSelect.dispatchEvent(new Event('change'));
        }
    }
    
    // Set minimum dates and times
    setMinDates() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // Set minimum dates to today
        if (this.sessionDateInput) this.sessionDateInput.min = today;
        if (this.startDateInput) this.startDateInput.min = today;
        if (this.endDateInput) this.endDateInput.min = today;
        
        // For time, we only validate if the selected date is today
        // Otherwise, any time is valid for future dates
        const selectedDate = this.sessionDateInput?.value || this.startDateInput?.value;
        if (selectedDate === today && this.startTimeInput) {
            const currentTime = now.toTimeString().slice(0,5);
            this.startTimeInput.min = currentTime;
        } else if (this.startTimeInput) {
            this.startTimeInput.removeAttribute('min');
        }
    }
    
    // Handle date type change
    handleDateTypeChange() {
        if (this.dateTypeSelect.value === 'single') {
            this.singleDateGroup.classList.remove('hidden');
            this.periodDateGroup.classList.add('hidden');
            
            // Make single date required, period dates not required
            this.sessionDateInput.required = true;
            this.startDateInput.required = false;
            this.endDateInput.required = false;
        } else {
            this.singleDateGroup.classList.add('hidden');
            this.periodDateGroup.classList.remove('hidden');
            
            // Make period dates required, single date not required
            this.sessionDateInput.required = false;
            this.startDateInput.required = true;
            this.endDateInput.required = true;
        }
    }
    
    // Open modal
    openModal(sessionType = '') {
        if (sessionType && this.sessionTypeSelect) {
            this.sessionTypeSelect.value = sessionType;
        }
        if (this.modal) {
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            this.setMinDates();
        }
    }
    
    // Close modal
    closeModalFunc() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            if (this.bookingForm) {
                this.bookingForm.reset();
            }
            this.setMinDates();
        }
    }
    
    // Handle form submission
    handleFormSubmit(e) {
        e.preventDefault();
        
        // Validate end date is after start date for period bookings
        if (this.dateTypeSelect.value === 'period') {
            const startDate = new Date(this.startDateInput.value);
            const endDate = new Date(this.endDateInput.value);
            
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
            sessionType: this.sessionTypeSelect.value,
            dateType: this.dateTypeSelect.value,
            date: this.dateTypeSelect.value === 'single' ? this.sessionDateInput.value : `${this.startDateInput.value} to ${this.endDateInput.value}`,
            time: this.startTimeInput.value,
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
        this.closeModalFunc();
    }
}

// Initialize modal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new BookingModal();
});