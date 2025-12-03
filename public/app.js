const API_BASE = 'http://localhost:3000/api';

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Activate button
    event.target.classList.add('active');
    
    // Load data if needed
    if (tabName === 'devices') {
        loadDevices();
    } else if (tabName === 'codes') {
        // Could load saved codes here if you implement storage
    }
}

// Load devices
async function loadDevices() {
    const devicesList = document.getElementById('devices-list');
    devicesList.innerHTML = '<div class="loading">Loading devices...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/devices`);
        const data = await response.json();
        
        if (data.success && data.devices.length > 0) {
            devicesList.innerHTML = data.devices.map(device => `
                <div class="device-card">
                    <h3>${device.name || 'Unnamed Device'}</h3>
                    <p><strong>ID:</strong> ${device.device_id}</p>
                    <p><strong>Type:</strong> ${device.device_type || 'N/A'}</p>
                    <p><strong>Manufacturer:</strong> ${device.properties?.manufacturer || 'N/A'}</p>
                    <div class="device-actions">
                        <button class="btn btn-secondary" onclick="lockDevice('${device.device_id}')">🔒 Lock</button>
                        <button class="btn btn-secondary" onclick="unlockDevice('${device.device_id}')">🔓 Unlock</button>
                    </div>
                </div>
            `).join('');
            
            // Update device select in payment form
            updateDeviceSelect(data.devices);
        } else {
            devicesList.innerHTML = '<div class="loading">No devices found. Make sure your Seam API is configured.</div>';
        }
    } catch (error) {
        devicesList.innerHTML = `<div class="loading" style="color: red;">Error loading devices: ${error.message}</div>`;
        console.error('Error loading devices:', error);
    }
}

// Update device select dropdown
function updateDeviceSelect(devices) {
    const select = document.getElementById('device-select');
    select.innerHTML = '<option value="">Select a device...</option>';
    
    devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.device_id;
        option.textContent = `${device.name || 'Unnamed'} (${device.device_id})`;
        select.appendChild(option);
    });
}

// Process payment and create access code
async function processPayment(event) {
    event.preventDefault();
    
    const resultBox = document.getElementById('payment-result');
    resultBox.className = 'result-box';
    resultBox.innerHTML = '<div class="loading">Processing payment and creating access code...</div>';
    resultBox.style.display = 'block';
    
    // Get form data
    const formData = {
        paymentId: document.getElementById('payment-id').value,
        customerName: document.getElementById('customer-name').value,
        customerEmail: document.getElementById('customer-email').value,
        customerPhone: document.getElementById('customer-phone').value,
        deviceId: document.getElementById('device-select').value,
        checkIn: new Date(document.getElementById('check-in').value).toISOString(),
        checkOut: new Date(document.getElementById('check-out').value).toISOString(),
        status: 'paid'
    };
    
    try {
        const response = await fetch(`${API_BASE}/payments/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            const accessCode = data.data.accessCode;
            const notifications = data.data.notifications;
            
            resultBox.className = 'result-box success';
            resultBox.innerHTML = `
                <h3>✅ Success! Access Code Created</h3>
                <div class="code-display">
                    <p>Access Code PIN:</p>
                    <div class="pin-code">${accessCode.pinCode}</div>
                    <p><strong>Code Name:</strong> ${accessCode.codeName}</p>
                    <p><strong>Active:</strong> ${new Date(accessCode.checkIn).toLocaleString()} - ${new Date(accessCode.checkOut).toLocaleString()}</p>
                </div>
                <div style="margin-top: 15px;">
                    <h4>Notifications Sent:</h4>
                    <p>📧 Email: ${notifications.email?.success ? '✅ Sent' : '❌ Failed'}</p>
                    <p>📱 SMS: ${notifications.sms?.success ? '✅ Sent' : notifications.sms ? '❌ Failed' : '⏭️ Not configured'}</p>
                </div>
                <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
                    The customer has been notified with their access code. The code will be active during the check-in/check-out period.
                </p>
            `;
            
            // Clear form
            event.target.reset();
            
            // Show in access codes tab
            showAccessCode(accessCode);
        } else {
            resultBox.className = 'result-box error';
            resultBox.innerHTML = `
                <h3>❌ Error</h3>
                <p>${data.error || 'Failed to create access code'}</p>
            `;
        }
    } catch (error) {
        resultBox.className = 'result-box error';
        resultBox.innerHTML = `
            <h3>❌ Error</h3>
            <p>${error.message}</p>
        `;
        console.error('Error processing payment:', error);
    }
}

// Show access code in codes tab
function showAccessCode(accessCode) {
    const codesList = document.getElementById('codes-list');
    const now = new Date();
    const checkIn = new Date(accessCode.checkIn);
    const checkOut = new Date(accessCode.checkOut);
    
    let status = 'pending';
    let statusText = 'Pending';
    if (now < checkIn) {
        status = 'pending';
        statusText = 'Pending';
    } else if (now >= checkIn && now <= checkOut) {
        status = 'active';
        statusText = 'Active';
    } else {
        status = 'expired';
        statusText = 'Expired';
    }
    
    const codeCard = document.createElement('div');
    codeCard.className = 'access-code-card';
    codeCard.innerHTML = `
        <h3>${accessCode.codeName} <span class="status-badge status-${status}">${statusText}</span></h3>
        <div class="pin">PIN: ${accessCode.pinCode}</div>
        <div class="meta"><strong>Device ID:</strong> ${accessCode.deviceId || 'N/A'}</div>
        <div class="meta"><strong>Check-in:</strong> ${checkIn.toLocaleString()}</div>
        <div class="meta"><strong>Check-out:</strong> ${checkOut.toLocaleString()}</div>
    `;
    
    codesList.insertBefore(codeCard, codesList.firstChild);
}

// Lock device
async function lockDevice(deviceId) {
    try {
        const response = await fetch(`${API_BASE}/devices/${deviceId}/lock`, {
            method: 'POST'
        });
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Device locked successfully!');
        } else {
            alert('❌ Error: ' + (data.error || 'Failed to lock device'));
        }
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
}

// Unlock device
async function unlockDevice(deviceId) {
    try {
        const response = await fetch(`${API_BASE}/devices/${deviceId}/unlock`, {
            method: 'POST'
        });
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Device unlocked successfully!');
        } else {
            alert('❌ Error: ' + (data.error || 'Failed to unlock device'));
        }
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
}

// Create Connect Webview to connect Kwikset account
let currentWebviewId = null;

async function createConnectWebview() {
    const statusBox = document.getElementById('connect-status');
    const connectBtn = document.getElementById('connect-btn');
    const container = document.getElementById('connect-webview-container');
    
    statusBox.style.display = 'block';
    statusBox.className = 'result-box';
    statusBox.innerHTML = '<div class="loading">Creating connection link...</div>';
    connectBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE}/connect/create-webview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentWebviewId = data.connectWebview.connect_webview_id;
            const url = data.url;
            
            statusBox.className = 'result-box success';
            statusBox.innerHTML = `
                <h3>✅ Connection Link Created!</h3>
                <p>Click the button below to open the Seam Connect page and log in with your Kwikset credentials.</p>
            `;
            
            // Show the connect URL
            const connectUrl = document.getElementById('connect-url');
            connectUrl.href = url;
            container.style.display = 'block';
            
            connectBtn.textContent = '🔄 Create New Connection';
        } else {
            statusBox.className = 'result-box error';
            statusBox.innerHTML = `
                <h3>❌ Error</h3>
                <p>${data.error || 'Failed to create connection link'}</p>
                <p style="margin-top: 10px; font-size: 0.9em;">
                    Make sure you have set your <code>SEAM_API_KEY</code> in the <code>.env</code> file.
                </p>
            `;
            connectBtn.disabled = false;
        }
    } catch (error) {
        statusBox.className = 'result-box error';
        statusBox.innerHTML = `
            <h3>❌ Error</h3>
            <p>${error.message}</p>
        `;
        connectBtn.disabled = false;
        console.error('Error creating connect webview:', error);
    }
}

// Check connection status
async function checkConnection() {
    if (!currentWebviewId) {
        alert('Please create a connection link first!');
        return;
    }
    
    const statusBox = document.getElementById('connect-status');
    statusBox.style.display = 'block';
    statusBox.className = 'result-box';
    statusBox.innerHTML = '<div class="loading">Checking connection status...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/connect/webview/${currentWebviewId}`);
        const data = await response.json();
        
        if (data.success) {
            const webview = data.connectWebview;
            
            if (webview.status === 'authorized' || webview.status === 'completed') {
                statusBox.className = 'result-box success';
                statusBox.innerHTML = `
                    <h3>✅ Successfully Connected!</h3>
                    <p>Your Kwikset account has been connected to Seam.</p>
                    <p style="margin-top: 15px;">
                        <strong>Next steps:</strong><br>
                        1. Go to the "Devices" tab<br>
                        2. Click "Refresh Devices"<br>
                        3. Your lock should now appear!
                    </p>
                `;
                
                // Auto-refresh devices after a short delay
                setTimeout(() => {
                    showTab('devices');
                    loadDevices();
                }, 2000);
            } else if (webview.status === 'pending') {
                statusBox.className = 'result-box';
                statusBox.style.background = '#fff3cd';
                statusBox.style.borderColor = '#ffc107';
                statusBox.innerHTML = `
                    <h3>⏳ Still Pending</h3>
                    <p>Please complete the connection process:</p>
                    <ol>
                        <li>Make sure you've opened the Seam Connect page</li>
                        <li>Logged in with your Kwikset credentials</li>
                        <li>Authorized Seam to access your devices</li>
                    </ol>
                    <p style="margin-top: 10px;">
                        <a href="${webview.url}" target="_blank" class="btn btn-primary">Open Connect Page Again</a>
                    </p>
                `;
            } else {
                statusBox.className = 'result-box error';
                statusBox.innerHTML = `
                    <h3>❌ Connection Failed</h3>
                    <p>Status: ${webview.status}</p>
                    <p>Please try creating a new connection link.</p>
                `;
            }
        } else {
            statusBox.className = 'result-box error';
            statusBox.innerHTML = `
                <h3>❌ Error</h3>
                <p>${data.error || 'Failed to check connection status'}</p>
            `;
        }
    } catch (error) {
        statusBox.className = 'result-box error';
        statusBox.innerHTML = `
            <h3>❌ Error</h3>
            <p>${error.message}</p>
        `;
        console.error('Error checking connection:', error);
    }
}

// Set default check-in/check-out times
window.addEventListener('DOMContentLoaded', () => {
    // Set default check-in to 1 hour from now
    const checkIn = new Date();
    checkIn.setHours(checkIn.getHours() + 1);
    document.getElementById('check-in').value = checkIn.toISOString().slice(0, 16);
    
    // Set default check-out to 2 days from now
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 2);
    document.getElementById('check-out').value = checkOut.toISOString().slice(0, 16);
    
    // Load devices on page load
    loadDevices();
});

