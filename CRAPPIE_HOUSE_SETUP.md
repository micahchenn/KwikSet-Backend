# Crappie House Day Pass System

## ✅ Complete System Created!

A full checkout system for Crappie House day passes has been created with all the features you requested.

## 🌐 Access Points

### Frontend (Customer-Facing)
- **Checkout Page**: `http://localhost:3000/crappie-house`
  - Beautiful UI matching Hi-Line Resort design
  - Date picker for selecting multiple days
  - Adult/children management
  - Mock Square payment interface
  - Real-time order summary

### Backend (Admin)
- **Email Configuration**: `http://localhost:3000/email-config`
  - Configure SMTP settings
  - Test email functionality
  - View current configuration

- **Admin Dashboard**: `http://localhost:3000/` (existing)
  - View devices
  - Manage access codes
  - View purchases

## 🎯 Key Features

### ✅ Multi-Day Purchases
- Select multiple dates using the date picker
- Each day generates separate access codes
- Codes are valid from purchase time to end of day (11:59 PM)

### ✅ Multi-Person Support
- **Adults**: Each adult gets their own unique 6-digit access code
- **Children**: Tracked but share codes with adults (no additional charge)
- Each adult requires:
  - Full Name
  - Email address
  - Phone number

### ✅ Payment Processing
- Mock Square payment interface
- Test card: `1111 1111 1111 1111`
- Test CVV: `111`
- Test ZIP: Any 5 digits
- Payment is processed and stored in database

### ✅ Access Code Generation
- 6-digit PIN codes (Kwikset requirement)
- Codes start at purchase time (or start of day, whichever is later)
- Codes expire at end of day (11:59:59 PM)
- Each adult gets unique codes for each selected day

### ✅ Email Notifications
- Access codes sent automatically via email
- Custom email template for Crappie House
- Clear warning: "Codes cannot be shared"
- Includes date, time, and instructions

### ✅ Database Storage
- All purchases stored
- All access codes tracked
- Purchase history available
- Can retrieve codes by purchase ID

## 📋 How It Works

### Customer Flow:
1. Customer visits `/crappie-house`
2. Selects dates they want to fish
3. Adds adult information (name, email, phone)
4. Adds number of children (if any)
5. Enters payment information (mock Square)
6. Reviews order summary
7. Completes purchase
8. Receives access codes via email

### System Flow:
1. Payment processed (mock)
2. Purchase saved to database
3. For each adult, for each day:
   - Generate unique 6-digit PIN
   - Create access code on Kwikset lock via Seam
   - Send email with code
4. Show success modal with all codes
5. Codes active from purchase time to end of day

## 🔧 Configuration

### Set Up Email (Required for Production)

1. Go to `http://localhost:3000/email-config`
2. Enter SMTP settings:
   - **SMTP Host**: `smtp.gmail.com` (for Gmail)
   - **SMTP Port**: `587`
   - **SMTP User**: Your email address
   - **SMTP Password**: Your email password or App Password
3. Click "Save Email Configuration"
4. Test with "Send Test Email"

**For Gmail:**
- Use an [App Password](https://support.google.com/accounts/answer/185833)
- Enable "Less secure app access" or use 2FA with App Password

### Set Up Crappie House Device

1. Connect your Kwikset lock to Seam (see `SETUP_REAL_LOCK.md`)
2. Get the device ID from the Devices tab
3. Add to `.env` file:
   ```
   CRAPPIE_HOUSE_DEVICE_ID=your_device_id_here
   ```
4. Restart server

## 📊 API Endpoints

### Checkout
```
POST /api/crappie-house/checkout
Body: {
  selectedDates: ["2025-12-03", "2025-12-04"],
  adults: [
    { name: "John Doe", email: "john@example.com", phone: "+1234567890" },
    { name: "Jane Doe", email: "jane@example.com", phone: "+1234567891" }
  ],
  children: 2,
  paymentInfo: {
    cardNumber: "1111 1111 1111 1111",
    expiry: "12/25",
    cvv: "111",
    zip: "12345"
  }
}
```

### Get Purchases
```
GET /api/crappie-house/purchases
```

### Get Purchase Details
```
GET /api/crappie-house/purchase/:purchaseId
```

## 🎨 Design Features

- Matches Hi-Line Resort color scheme:
  - Primary Orange: `#FF6B35`
  - Primary Red: `#DC3545`
  - Dark Blue: `#1E3A5F`
  - Light Blue: `#4A90E2`
- Responsive design
- Clear warnings about code sharing
- Professional payment form
- Success modal with all codes

## ⚠️ Important Notes

1. **Code Sharing**: 
   - UI clearly states: "Each adult must have their own unique access code. Codes cannot be shared."
   - Email also includes this warning

2. **Code Timing**:
   - Codes start at purchase time (or start of day if purchased before)
   - Codes expire at 11:59:59 PM on the selected date
   - NOT 24 hours from purchase

3. **Children**:
   - Children don't get separate codes
   - They share with adults
   - No additional charge for children

4. **Payment**:
   - Currently mocked (no real Square integration)
   - Test card: `1111 1111 1111 1111`
   - All payments are "approved" for testing

## 🚀 Next Steps

1. **Set up email configuration** via `/email-config`
2. **Connect your Kwikset lock** to Seam
3. **Set device ID** in `.env` file
4. **Test the checkout flow** with the mock payment
5. **Integrate real Square** (when ready) by replacing the mock payment in `src/routes/crappieHouseRoutes.js`

## 📝 Example Purchase

**Scenario**: Family of 4 (2 adults, 2 children) buying 2 days

- **Dates**: Dec 3, 2025 and Dec 4, 2025
- **Adults**: 
  - John Doe (john@example.com, +1234567890)
  - Jane Doe (jane@example.com, +1234567891)
- **Children**: 2
- **Total**: $60 (2 days × $15 × 4 people)

**Result**:
- John gets 2 codes (one for each day)
- Jane gets 2 codes (one for each day)
- Children share codes with adults
- All codes sent via email
- Codes active from purchase time to 11:59 PM each day

## 🎉 Ready to Use!

The system is fully functional and ready for testing. Just:
1. Start the server: `npm start`
2. Visit: `http://localhost:3000/crappie-house`
3. Configure email: `http://localhost:3000/email-config`
4. Start selling day passes!

