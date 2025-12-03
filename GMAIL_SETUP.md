# Gmail Email Setup

## Quick Setup for micahchen.tsr@gmail.com

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com
2. Click **Security**
3. Enable **2-Step Verification** (if not already enabled)

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Or: Google Account → Security → 2-Step Verification → App passwords
3. Select **Mail** as the app
4. Select **Other (Custom name)** as device
5. Enter name: "Kwikset Backend"
6. Click **Generate**
7. Copy the 16-character password (no spaces)

### Step 3: Configure in Backend

**Option A: Via Web UI (Recommended)**
1. Go to: `http://localhost:3000/email-config`
2. Enter:
   - **SMTP Host**: `smtp.gmail.com`
   - **SMTP Port**: `587`
   - **SMTP Username**: `micahchen.tsr@gmail.com`
   - **SMTP Password**: [Paste your 16-character App Password]
3. Click **Save Email Configuration**
4. Test with **Send Test Email**

**Option B: Via .env File**
1. Open `.env` file
2. Update:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=micahchen.tsr@gmail.com
   SMTP_PASS=your_16_character_app_password
   ```
3. Restart server

### Step 4: Test
1. Use the test email feature in `/email-config`
2. Or make a test purchase in `/crappie-house`
3. Check your inbox (and spam folder)

## Important Notes

- **DO NOT** use your regular Gmail password
- **DO NOT** share your App Password
- App Passwords are 16 characters (no spaces)
- If you change your Google password, you'll need a new App Password
- The Google API key provided is stored but Gmail SMTP uses App Passwords

## Troubleshooting

**"Invalid login" error:**
- Make sure you're using an App Password, not your regular password
- Verify 2-Step Verification is enabled
- Check that the App Password was copied correctly (no spaces)

**"Connection timeout":**
- Check your firewall/antivirus
- Try port 465 with SSL instead of 587 with TLS
- Verify internet connection

**Emails going to spam:**
- This is normal for automated emails
- Consider using a service like SendGrid or Mailgun for production

