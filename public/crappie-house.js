const API_BASE = 'http://localhost:3000/api';

// State
let selectedDates = [];
let adults = [];
let childrenCount = 0;
let adultCounter = 1;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set minimum date to today (in local timezone)
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
    document.getElementById('date-picker').setAttribute('min', todayStr);
    
    // Add first adult
    addAdult();
    
    // Update summary
    updateSummary();
});

// Date Management - Individual date selection
function addDate() {
    const dateInput = document.getElementById('date-picker');
    const date = dateInput.value; // This is in YYYY-MM-DD format
    
    if (!date) {
        alert('Please select a date first');
        return;
    }
    
    // Store the date string as-is (YYYY-MM-DD) - no conversion
    // This ensures we keep the exact date the user selected
    
    // Check if date is in the past (parse as local date to avoid timezone issues)
    const dateParts = date.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[2]);
    const selectedDate = new Date(year, month, day, 0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        alert('Cannot select past dates. Please select today or a future date.');
        return;
    }
    
    // Check if date is already selected
    if (selectedDates.includes(date)) {
        alert('This date is already selected');
        return;
    }
    
    // Add the date string as-is (YYYY-MM-DD format)
    selectedDates.push(date);
    selectedDates.sort();
    
    // Clear input
    dateInput.value = '';
    
    renderSelectedDates();
    updateSummary();
}

function removeDate(date) {
    selectedDates = selectedDates.filter(d => d !== date);
    renderSelectedDates();
    updateSummary();
}

function renderSelectedDates() {
    const container = document.getElementById('selected-dates');
    container.innerHTML = '';
    
    if (selectedDates.length === 0) {
        return;
    }
    
    const info = document.createElement('div');
    info.style.cssText = 'padding: 10px; background: #e7f3ff; border-radius: 6px; margin-bottom: 10px;';
    info.innerHTML = `<strong>Selected ${selectedDates.length} day(s):</strong>`;
    container.appendChild(info);
    
    selectedDates.forEach(date => {
        const badge = document.createElement('div');
        badge.className = 'date-badge';
        // Format date for display - parse as local date to avoid timezone shift
        const dateParts = date.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1;
        const day = parseInt(dateParts[2]);
        const displayDate = new Date(year, month, day);
        const formatted = displayDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        badge.innerHTML = `
            ${formatted}
            <span class="remove" onclick="removeDate('${date}')" style="cursor: pointer; margin-left: 8px; font-weight: bold; font-size: 18px;">×</span>
        `;
        container.appendChild(badge);
    });
}

// Helper function to convert Date to YYYY-MM-DD string
function datePartsToYMD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
    // Parse date string (YYYY-MM-DD) without timezone conversion
    // dateString should be in format: "2025-12-02"
    if (!dateString || typeof dateString !== 'string') {
        return 'Invalid date';
    }
    
    const dateParts = dateString.split('-');
    if (dateParts.length !== 3) {
        return dateString; // Return as-is if can't parse
    }
    
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[2], 10);
    
    // Create date in local timezone to avoid day shift
    // Using Date constructor with year, month, day creates date in local timezone
    const date = new Date(year, month, day);
    
    // Verify the date is correct (should match input)
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
        // If there's a mismatch, return a simple formatted version
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayOfWeek = date.getDay();
        return `${dayNames[dayOfWeek]}, ${monthNames[month]} ${day}, ${year}`;
    }
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

// Adult Management
function addAdult() {
    const adult = {
        id: `adult_${adultCounter++}`,
        name: '',
        email: '',
        phone: '',
    };
    
    adults.push(adult);
    renderAdults();
    updateSummary();
}

function removeAdult(id) {
    adults = adults.filter(a => a.id !== id);
    renderAdults();
    updateSummary();
}

function updateAdult(id, field, value) {
    const adult = adults.find(a => a.id === id);
    if (adult) {
        adult[field] = value;
    }
    // Force summary update
    setTimeout(() => updateSummary(), 0);
}

function renderAdults() {
    const container = document.getElementById('adults-container');
    container.innerHTML = '';
    
    adults.forEach((adult, index) => {
        const entry = document.createElement('div');
        entry.className = 'person-entry';
        entry.innerHTML = `
            <h3>Adult ${index + 1} ${adults.length > 1 ? `<button type="button" onclick="removeAdult('${adult.id}')" style="float: right; background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Remove</button>` : ''}</h3>
            <div class="form-row">
                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" value="${adult.name}" 
                           onchange="updateAdult('${adult.id}', 'name', this.value)" 
                           placeholder="John Doe" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" value="${adult.email}" 
                           onchange="updateAdult('${adult.id}', 'email', this.value)" 
                           placeholder="john@example.com" required>
                </div>
                <div class="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" value="${adult.phone}" 
                           onchange="updateAdult('${adult.id}', 'phone', this.value)" 
                           placeholder="+1234567890" required>
                </div>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">
                ⚠️ This adult will receive their own unique access code via email/phone
            </p>
        `;
        container.appendChild(entry);
    });
}

// Children Management
function updateChildren() {
    childrenCount = parseInt(document.getElementById('children-count').value) || 0;
    updateSummary();
}

// Payment Card Formatting
function formatCardNumber(input) {
    let value = input.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    input.value = formattedValue;
}

function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
}

// Order Summary
function updateSummary() {
    const days = selectedDates.length;
    const totalAdults = adults.length;
    const totalChildren = childrenCount;
    const pricePerDay = 15;
    
    // Calculate costs
    const adultCost = days * pricePerDay * totalAdults;
    const childrenCost = days * pricePerDay * totalChildren;
    const totalCost = adultCost + childrenCost;
    
    // Update the summary - check if elements exist first
    const summaryEl = document.getElementById('order-summary');
    if (!summaryEl) return;
    
    // Always update the summary with a clean rebuild to ensure accuracy
    let breakdownHtml = `
        <div class="summary-row">
            <span>Days:</span>
            <span id="summary-days">${days}</span>
        </div>
        <div class="summary-row">
            <span>Adults:</span>
            <span id="summary-adults">${totalAdults}</span>
            <span style="margin-left: auto;">$${adultCost.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Children:</span>
            <span id="summary-children">${totalChildren}</span>
            ${totalChildren > 0 ? `<span style="margin-left: auto;">$${childrenCost.toFixed(2)}</span>` : ''}
        </div>
        <div class="summary-row total">
            <span>Total:</span>
            <span id="summary-total">$${totalCost.toFixed(2)}</span>
        </div>
    `;
    
    summaryEl.innerHTML = breakdownHtml;
}

// Form Submission
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate dates
    if (selectedDates.length === 0) {
        alert('Please select at least one date');
        return;
    }
    
    if (adults.length === 0) {
        alert('Please add at least one adult');
        return;
    }
    
    // Validate all adults have required info
    for (const adult of adults) {
        if (!adult.name || !adult.email || !adult.phone) {
            alert(`Please fill in all information for ${adult.name || 'Adult ' + (adults.indexOf(adult) + 1)}`);
            return;
        }
    }
    
    // Get payment info
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvv = document.getElementById('card-cvv').value;
    const cardZip = document.getElementById('card-zip').value;
    
    if (!cardNumber || !cardExpiry || !cardCvv || !cardZip) {
        alert('Please fill in all payment information');
        return;
    }
    
    // Disable submit button
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    try {
        // Prepare data
        const checkoutData = {
            selectedDates,
            adults: adults.map(a => ({
                name: a.name,
                email: a.email,
                phone: a.phone,
            })),
            children: childrenCount,
            paymentInfo: {
                cardNumber,
                expiry: cardExpiry,
                cvv: cardCvv,
                zip: cardZip,
            },
        };
        
        // Send to backend
        const response = await fetch(`${API_BASE}/crappie-house/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkoutData),
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success modal
            showSuccessModal(data);
        } else {
            alert('Error: ' + (data.error || 'Failed to process payment'));
            submitBtn.disabled = false;
            submitBtn.textContent = 'Complete Purchase';
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Error processing payment: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Purchase';
    }
});

// Success Modal
function showSuccessModal(data) {
    const modal = document.getElementById('success-modal');
    const content = document.getElementById('success-content');
    
    let html = `
        <p style="margin-bottom: 20px;">Your purchase was successful! Access codes have been sent to each adult.</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>Purchase ID:</strong> ${data.purchase.id}</p>
            <p><strong>Total Amount:</strong> $${data.purchase.totalAmount.toFixed(2)}</p>
            <p><strong>Dates:</strong> ${data.purchase.selectedDates.map(d => formatDate(d)).join(', ')}</p>
        </div>
        <h3 style="margin-top: 25px; margin-bottom: 15px;">Access Codes:</h3>
    `;
    
    // Group codes by adult and date
    const codesByAdult = {};
    data.accessCodes.forEach(code => {
        if (!codesByAdult[code.customerName]) {
            codesByAdult[code.customerName] = [];
        }
        codesByAdult[code.customerName].push(code);
    });
    
    Object.keys(codesByAdult).forEach(name => {
        html += `
            <div style="background: #fff; border: 2px solid #4CAF50; border-radius: 6px; padding: 15px; margin: 10px 0;">
                <h4 style="color: #1E3A5F; margin-bottom: 10px;">${name}</h4>
        `;
        
        codesByAdult[name].forEach(code => {
            const startDate = new Date(code.startsAt);
            const endDate = new Date(code.endsAt);
            // Use the date from code if available, otherwise extract from startDate
            const codeDate = code.date || (startDate.getFullYear() + '-' + 
                String(startDate.getMonth() + 1).padStart(2, '0') + '-' + 
                String(startDate.getDate()).padStart(2, '0'));
            html += `
                <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${formatDate(codeDate)}</p>
                    <div style="text-align: center; margin: 10px 0;">
                        <div style="font-size: 28px; font-weight: bold; color: #FF6B35; letter-spacing: 5px;">${code.pinCode}</div>
                    </div>
                    <p style="font-size: 12px; color: #666; margin: 5px 0;">
                        Active: ${startDate.toLocaleString()} - ${endDate.toLocaleString()}
                    </p>
                </div>
            `;
        });
        
        html += `</div>`;
    });
    
    html += `
        <p style="margin-top: 20px; padding: 15px; background: #FFF3CD; border-radius: 6px; color: #856404;">
            <strong>⚠️ Remember:</strong> Each adult must use their own unique access code. Codes cannot be shared.
        </p>
        <p style="margin-top: 15px; color: #666;">
            Access codes have been sent to the email addresses and phone numbers provided.
        </p>
    `;
    
    content.innerHTML = html;
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('success-modal').style.display = 'none';
    // Reset form
    selectedDates = [];
    adults = [];
    childrenCount = 0;
    adultCounter = 1;
    document.getElementById('checkout-form').reset();
    document.getElementById('children-count').value = 0;
    document.getElementById('date-picker').value = '';
    addAdult();
    renderSelectedDates();
    renderAdults();
    updateSummary();
    
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Complete Purchase';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('success-modal');
    if (event.target === modal) {
        closeModal();
    }
}

