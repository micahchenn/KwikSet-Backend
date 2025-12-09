# Setting Up Your Real Kwikset Lock

## 🔐 Step-by-Step Guide to Connect Your Kwikset Lock

### Prerequisites
- ✅ Kwikset lock (Halo, Halo Touch, or SmartCode series)
- ✅ Seam account (free to sign up)
- ✅ Seam API key
- ✅ Kwikset App installed on your phone

---

## Step 1: Create a Seam Account

1. Go to [Seam Console](https://console.seam.co)
2. Sign up for a free account
3. Create a new workspace (or use the default one)
4. Navigate to **API Keys** in the sidebar
5. Copy your **API Key** (it starts with `seam_test_` or `seam_live_`)

---

## Step 2: Add Your API Key to the Backend

1. Open your `.env` file in the project root
2. Replace the placeholder with your real API key:

```env
SEAM_API_KEY=seam_test_your_actual_api_key_here
```

3. Save the file
4. Restart your server (if it's running)

---

## Step 3: Prepare Your Kwikset Lock

### For Kwikset Halo and Halo Touch Locks:

1. **Install the Kwikset App** on your phone
   - iOS: [App Store](https://apps.apple.com/app/kwikset-app/id1459500000)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=com.kwikset.mobile)

2. **Create a Kwikset Account** (if you don't have one)
   - Open the Kwikset App
   - Sign up or log in

3. **Add Your Lock to the Kwikset App**
   - Follow the in-app instructions to pair your lock
   - Make sure the lock is connected to Wi-Fi
   - Test that you can lock/unlock from the app

4. **⚠️ IMPORTANT: Disable 2-Step Verification**
   - In the Kwikset App, tap the menu (☰) in the top left
   - Go to **Account Settings**
   - Find **2-Step Verification** or **MFA**
   - **Disable it** (you can re-enable it later after connecting to Seam)

### For Kwikset SmartCode Series:

1. **Set up your Smart Hub** (if using Zigbee/Z-Wave)
   - Follow Kwikset's instructions to connect your lock to a hub
   - Common hubs: SmartThings, Hubitat, etc.

2. **Install the Kwikset App** and add your lock

3. **Disable 2-Step Verification** (same as above)

---

## Step 4: Connect Your Lock to Seam

You have two options:

### Option A: Using Seam Connect Webview (Recommended)

This is the easiest way - Seam provides a web interface to connect your account.

1. **Get a Connect Webview Token** (we'll add this to the UI)

   Or use this quick script to get a Connect Webview URL:

   ```bash
   # Create a temporary script to get connect URL
   ```

2. **Open the Connect URL** in your browser
   - You'll see a Seam login page
   - Click "Connect Kwikset"
   - Log in with your **Kwikset App credentials** (the same ones you use in the Kwikset app)
   - Authorize Seam to access your devices

3. **Your lock will appear** in your Seam workspace!

### Option B: Using Seam CLI (Advanced)

If you have Seam CLI installed:

```bash
seam connect webviews create --accepted-providers kwikset
```

This will give you a URL to open and connect your account.

---

## Step 5: Get Your Device ID

Once your lock is connected to Seam:

1. **Using the Web UI:**
   - Open `http://localhost:3000`
   - Go to the **Devices** tab
   - Your real lock should appear with its device ID

2. **Using the API:**
   ```bash
   curl http://localhost:3000/api/devices
   ```

3. **Using Seam Console:**
   - Go to [Seam Console](https://console.seam.co)
   - Click **Devices** in the sidebar
   - Find your Kwikset lock
   - Copy the **Device ID**

---

## Step 6: Test Your Lock

1. **Test in the Web UI:**
   - Go to `http://localhost:3000`
   - Click **Devices** tab
   - Find your lock
   - Click **Lock** or **Unlock** buttons
   - Your physical lock should respond!

2. **Test Access Code Creation:**
   - Go to **Create Access Code** tab
   - Select your device from the dropdown
   - Fill in test customer info
   - Set check-in to a few minutes from now
   - Click "Create Access Code"
   - The code should be programmed on your lock!

---

## Step 7: Verify the Access Code Works

1. Wait for the check-in time to arrive (or set it to now + 15 minutes)
2. Go to your physical lock
3. Enter the PIN code that was generated
4. The lock should unlock! 🔓

---

## Troubleshooting

### "No devices found"
- ✅ Check your Seam API key is correct in `.env`
- ✅ Make sure you've connected your Kwikset account to Seam
- ✅ Verify 2-Step Verification is disabled in Kwikset app
- ✅ Try refreshing the devices list

### "Device not responding"
- ✅ Check your lock is online (Wi-Fi connected)
- ✅ Test the lock in the Kwikset app first
- ✅ Make sure the lock battery is charged
- ✅ Verify the device ID is correct

### "Can't create access code"
- ✅ Ensure check-in time is at least 15 minutes in the future
- ✅ Check that check-out is after check-in
- ✅ Verify the device ID exists in Seam
- ✅ Check server console for error messages

### "Lock won't connect to Seam"
- ✅ Make sure 2-Step Verification is **disabled** in Kwikset app
- ✅ Use the exact same credentials you use in the Kwikset app
- ✅ Try disconnecting and reconnecting your Kwikset account in Seam

---

## Quick Reference

**Your Device ID Format:**
```
device_abc123xyz789
```

**Where to find it:**
- Web UI: Devices tab
- API: `GET /api/devices`
- Seam Console: Devices page

**Test Command:**
```bash
# List your devices
curl http://localhost:3000/api/devices

# Lock your device
curl -X POST http://localhost:3000/api/devices/YOUR_DEVICE_ID/lock

# Unlock your device
curl -X POST http://localhost:3000/api/devices/YOUR_DEVICE_ID/unlock
```

---

## Next Steps

Once your lock is connected:

1. ✅ Test creating access codes via the UI
2. ✅ Set up email/SMS notifications (configure SMTP/Twilio in `.env`)
3. ✅ Integrate with your payment system (webhooks)
4. ✅ Start creating codes for real customers!

---

## Need Help?

- **Seam Documentation**: https://docs.seam.co
- **Kwikset Setup Guide**: https://docs.seam.co/latest/device-and-system-integration-guides/kwikset-locks
- **Seam Support**: Available in the Seam Console

Good luck! 🚀



