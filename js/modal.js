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
        this.dateRangeError = null;
        
        this.init();
    }
    
    init() {
        // Load modal HTML
        this.loadModalHTML().then(() => {
            this.setupModalElements();
            this.setupEventListeners();
            this.setMinDates();
            // Ensure both date groups are hidden on startup
            this.hideAllDateGroups();
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
        this.dateRangeError = document.getElementById('date-range-error');
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
                this.validateDateRange();
            });
        }
        if (this.endDateInput) {
            this.endDateInput.addEventListener('change', () => {
                this.validateDateRange();
                this.autoAdjustDateType();
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModalFunc();
            }
        });
    }
    
    // Hide all date groups
    hideAllDateGroups() {
        if (this.singleDateGroup) {
            this.singleDateGroup.classList.add('hidden');
        }
        if (this.periodDateGroup) {
            this.periodDateGroup.classList.add('hidden');
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
        const selectedDate = this.getSelectedDate();
        if (selectedDate === today && this.startTimeInput) {
            const currentTime = now.toTimeString().slice(0,5);
            this.startTimeInput.min = currentTime;
        } else if (this.startTimeInput) {
            this.startTimeInput.removeAttribute('min');
        }
    }
    
    // Get the currently selected date based on date type
    getSelectedDate() {
        if (this.dateTypeSelect.value === 'single' && this.sessionDateInput) {
            return this.sessionDateInput.value;
        } else if (this.dateTypeSelect.value === 'period' && this.startDateInput) {
            return this.startDateInput.value;
        }
        return '';
    }
    
    // Handle date type change
    handleDateTypeChange() {
        const dateType = this.dateTypeSelect.value;
        
        // Hide both groups first
        this.hideAllDateGroups();
        
        // Clear any existing errors
        this.hideDateRangeError();
        
        if (dateType === 'single') {
            this.singleDateGroup.classList.remove('hidden');
            
            // Make single date required, period dates not required
            this.sessionDateInput.required = true;
            this.startDateInput.required = false;
            this.endDateInput.required = false;
            
            // Clear period dates
            this.startDateInput.value = '';
            this.endDateInput.value = '';
            
        } else if (dateType === 'period') {
            this.periodDateGroup.classList.remove('hidden');
            
            // Make period dates required, single date not required
            this.sessionDateInput.required = false;
            this.startDateInput.required = true;
            this.endDateInput.required = true;
            
            // Clear single date
            this.sessionDateInput.value = '';
            
            // Validate date range if both dates are set
            this.validateDateRange();
        }
        
        // Update min dates for the newly selected date type
        this.setMinDates();
    }
    
    // Validate date range for period bookings
    validateDateRange() {
        if (this.dateTypeSelect.value !== 'period') return true;
        
        const startDate = this.startDateInput.value;
        const endDate = this.endDateInput.value;
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (end < start) {
                this.showDateRangeError('End date must be after start date');
                return false;
            } else {
                this.hideDateRangeError();
                return true;
            }
        }
        
        this.hideDateRangeError();
        return true;
    }
    
    // Auto-adjust date type if start and end dates are the same
    autoAdjustDateType() {
        if (this.dateTypeSelect.value !== 'period') return;
        
        const startDate = this.startDateInput.value;
        const endDate = this.endDateInput.value;
        
        if (startDate && endDate && startDate === endDate) {
            // Same date selected - auto switch to single day
            this.dateTypeSelect.value = 'single';
            this.sessionDateInput.value = startDate;
            this.startDateInput.value = '';
            this.endDateInput.value = '';
            this.handleDateTypeChange();
        }
    }
    
    // Show date range error
    showDateRangeError(message) {
        if (this.dateRangeError) {
            this.dateRangeError.textContent = message;
            this.dateRangeError.classList.remove('hidden');
            this.dateRangeError.classList.add('show');
        }
    }
    
    // Hide date range error
    hideDateRangeError() {
        if (this.dateRangeError) {
            this.dateRangeError.classList.add('hidden');
            this.dateRangeError.classList.remove('show');
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
            
            // Reset form and set defaults
            this.resetForm();
            this.setMinDates();
        }
    }
    
    // Reset form to initial state
    resetForm() {
        if (this.bookingForm) {
            this.bookingForm.reset();
        }
        
        // Reset date type to unselected
        if (this.dateTypeSelect) {
            this.dateTypeSelect.value = '';
        }
        
        // Hide all date groups
        this.hideAllDateGroups();
        
        // Clear any errors
        this.hideDateRangeError();
        
        // Reset required fields
        if (this.sessionDateInput) this.sessionDateInput.required = false;
        if (this.startDateInput) this.startDateInput.required = false;
        if (this.endDateInput) this.endDateInput.required = false;
    }
    
    // Close modal
    closeModalFunc() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.resetForm();
        }
    }
    
    // Handle form submission
    handleFormSubmit(e) {
        e.preventDefault();
        
        // Validate date type is selected
        if (!this.dateTypeSelect.value) {
            alert('Please select a date type');
            return;
        }
        
        // Validate date range for period bookings
        if (this.dateTypeSelect.value === 'period') {
            if (!this.validateDateRange()) {
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
            date: this.getFormattedDate(),
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
    
    // Get formatted date based on date type
    getFormattedDate() {
        if (this.dateTypeSelect.value === 'single') {
            return this.formatDate(this.sessionDateInput.value);
        } else if (this.dateTypeSelect.value === 'period') {
            const startDate = this.formatDate(this.startDateInput.value);
            const endDate = this.formatDate(this.endDateInput.value);
            return `${startDate} to ${endDate}`;
        }
        return '';
    }
    
    // Format date from YYYY-MM-DD to readable format
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Initialize modal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new BookingModal();
});
