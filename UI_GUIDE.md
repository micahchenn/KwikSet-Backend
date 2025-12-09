# Web UI Guide

## 🎉 Your Web Interface is Ready!

A beautiful, modern web UI has been created for your Kwikset backend!

## 🌐 Access the UI

**Open your browser and go to:**
```
http://localhost:3000
```

## 📱 Features

### 1. **Devices Tab**
- View all your connected Kwikset devices
- See device details (ID, type, manufacturer)
- Lock and unlock devices with one click
- Refresh device list

### 2. **Create Access Code Tab** ⭐
This is the main feature - automatically create access codes when customers pay:

**Fill out the form:**
- **Payment ID**: Unique identifier for the payment
- **Customer Name**: Customer's full name
- **Customer Email**: Where to send the access code
- **Customer Phone**: (Optional) For SMS notifications
- **Select Device**: Choose which Kwikset lock to program
- **Check-in Date & Time**: When the code becomes active
- **Check-out Date & Time**: When the code expires

**Click "Create Access Code & Send to Customer"**

The system will:
1. ✅ Generate a unique PIN code (4-8 digits)
2. ✅ Program it on the selected Kwikset lock
3. ✅ Send it to the customer via email
4. ✅ Send it via SMS (if phone provided and Twilio configured)
5. ✅ Show you the generated code

### 3. **Access Codes Tab**
- View all created access codes
- See PIN codes, status (Active/Pending/Expired)
- View check-in/check-out times

## 🎨 UI Features

- **Modern Design**: Beautiful gradient background, clean cards
- **Responsive**: Works on desktop, tablet, and mobile
- **Real-time Updates**: See results immediately
- **Color-coded Status**: Easy to see code status at a glance
- **User-friendly**: Simple forms with helpful placeholders

## 🚀 Quick Start

1. **Open the UI**: Go to `http://localhost:3000` in your browser
2. **View Devices**: Click "Devices" tab to see your locks
3. **Create Access Code**: 
   - Click "Create Access Code" tab
   - Fill out the form with customer and booking details
   - Click the button
   - The customer receives their code automatically!

## 💡 Tips

- **Default Times**: Check-in defaults to 1 hour from now, check-out to 2 days
- **Device Selection**: Devices load automatically when you open the form
- **Notifications**: Email/SMS status is shown after creating a code
- **Demo Mode**: If you don't have a Seam API key, it runs in demo mode (perfect for testing!)

## 🔧 Troubleshooting

**UI not loading?**
- Make sure the server is running (`npm start`)
- Check that port 3000 is not in use
- Try refreshing the page

**Devices not showing?**
- Check your Seam API key in `.env` file
- In demo mode, you'll see 2 demo devices
- Click "Refresh Devices" button

**Can't create access codes?**
- Verify device ID is correct
- Ensure check-out is after check-in
- Check server console for error messages

## 📸 What You'll See

The UI has three main sections:

1. **Header**: Beautiful title with gradient
2. **Tabs**: Easy navigation between features
3. **Cards**: Clean, organized information display
4. **Forms**: Simple, intuitive input fields
5. **Results**: Clear success/error messages

## 🎯 Example Workflow

1. Customer books and pays → You receive payment notification
2. Open the UI → Go to "Create Access Code" tab
3. Enter customer details → Name, email, phone
4. Select device → Choose the lock
5. Set dates → Check-in and check-out times
6. Click button → Code is created and sent automatically!
7. Customer receives code → Via email and/or SMS
8. Customer uses code → Enters PIN on keypad during their stay

Enjoy your new web interface! 🎉



