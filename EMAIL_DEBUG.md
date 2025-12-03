# Email Debugging Guide

## Problem: Emails Not Sending

The email system is currently running in **DEMO MODE**, which means emails are only logged to the console, not actually sent.

## Quick Fix

### Option 1: Configure via Web UI (Easiest)

1. **Open**: `http://localhost:3000/email-config`
2. **Enter Gmail Settings**:
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - SMTP Username: `micahchen.tsr@gmail.com`
   - SMTP Password: **[Your Gmail App Password - see below]**
3. **Click**: "Save Email Configuration"
4. **Test**: Use "Send Test Email" button

### Option 2: Configure via .env File

1. **Get Gmail App Password** (see instructions below)
2. **Edit** `.env` file:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=micahchen.tsr@gmail.com
   SMTP_PASS=your_16_character_app_password_here
   ```
3. **Restart server**: Stop and start `npm start`

## Get Gmail App Password

**IMPORTANT**: You cannot use your regular Gmail password. You need an App Password.

### Steps:

1. **Enable 2-Step Verification** (if not already):
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords
   - Select **Mail** as the app
   - Select **Other (Custom name)** as device
   - Enter name: "Kwikset Backend"
   - Click **Generate**
   - **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

3. **Use the App Password**:
   - Remove spaces: `abcdefghijklmnop`
   - Paste into email config or .env file

## Test Email Configuration

### Method 1: Via Web UI
1. Go to: `http://localhost:3000/email-config`
2. Scroll to "Test Email" section
3. Enter your email address
4. Click "Send Test Email"

### Method 2: Via API
```powershell
# Check email status
Invoke-RestMethod -Uri http://localhost:3000/api/debug/email-status

# Send test email
$body = @{
    email = "your-email@example.com"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/debug/test-email -Method POST -Body $body -ContentType "application/json"
```

## Common Issues

### "Invalid login" Error
- ❌ You're using your regular Gmail password
- ✅ Use an App Password instead
- ✅ Make sure 2-Step Verification is enabled

### "Connection timeout"
- Check firewall/antivirus settings
- Try port 465 with SSL (change SMTP_PORT to 465 and secure: true)

### "Email sent" but not received
- Check spam/junk folder
- Verify email address is correct
- Gmail may delay automated emails

### Still in Demo Mode
- Make sure you saved the configuration
- Restart the server after updating .env
- Check that SMTP_PASS is set (not empty)

## Verify It's Working

After configuring, check the server console. You should see:
```
📧 Email configuration updated
```

Instead of:
```
📧 Email not configured - will simulate email sending in demo mode
```

When sending an email, you should see:
```
Access code email sent: <message-id>
```

Instead of:
```
📧 DEMO MODE: Would send email to...
```

## Need Help?

1. Check server console for error messages
2. Use `/api/debug/email-status` to see current configuration
3. Use `/api/debug/test-email` to test with detailed error messages

