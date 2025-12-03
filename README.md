# KwikSet-Backend

Backend API for automatically generating and sending Kwikset lock access codes to customers upon payment confirmation.

## Features

- 🔐 **Automatic Access Code Generation**: Creates unique PIN codes (4-8 digits) for Kwikset locks via Seam API
- 💳 **Payment Integration**: Processes payment webhooks and automatically generates access codes
- 📧 **Multi-Channel Notifications**: Sends access codes via email and/or SMS
- ⏰ **Time-Bound Access**: Codes are automatically active during check-in/check-out periods
- 🎯 **Kwikset-Specific**: Handles Kwikset lock constraints and requirements

## Prerequisites

- Node.js 18+ 
- Seam API account and API key ([Get started with Seam](https://docs.seam.co))
- Kwikset devices connected to Seam
- Payment provider account (Stripe, PayPal, etc.) - optional but recommended
- Email service (SMTP) or SMS service (Twilio) for notifications

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd KwikSet-Backend
```

2. Install dependencies:
```bash
npm install
```

**Note**: If `@seamapi/javascript` package is not found, check the [Seam JavaScript SDK documentation](https://github.com/seamapi/seam-node) for the correct package name. You may need to use `seamapi` or another package name. Update `package.json` and the import in `src/services/seamService.js` accordingly.

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Configure your `.env` file with your credentials:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Seam API Configuration (REQUIRED)
SEAM_API_KEY=your_seam_api_key_here

# Payment Provider Configuration (Optional - for webhooks)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Email Configuration (Required for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password_here

# SMS Configuration (Optional - for SMS notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Default Access Code Settings
DEFAULT_CODE_DURATION_HOURS=24
DEFAULT_CODE_LENGTH=6
```

## Getting Started with Seam

1. **Create a Seam Account**: Sign up at [Seam Console](https://console.seam.co)

2. **Get Your API Key**: Navigate to your workspace settings to get your API key

3. **Connect Kwikset Devices**: 
   - Use Seam Connect Webview to connect your Kwikset account
   - Make sure to disable 2-Step Verification in the Kwikset app before connecting
   - See [Kwikset Setup Instructions](https://docs.seam.co/latest/device-and-system-integration-guides/kwikset-locks) for details

4. **Get Device IDs**: Use the `/api/devices` endpoint to list your connected devices

## Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Health Check
```
GET /health
```

### Devices
```
GET /api/devices                    # List all Kwikset devices
GET /api/devices/:deviceId          # Get device details
POST /api/devices/:deviceId/lock    # Lock device
POST /api/devices/:deviceId/unlock  # Unlock device
```

### Payments
```
POST /api/payments/webhook          # Generic payment webhook
POST /api/payments/process          # Manually process payment and create access code
```

### Stripe (Optional)
```
POST /api/stripe/webhook            # Stripe-specific webhook handler
```

### Access Codes
```
GET /api/access-codes/:accessCodeId # Get access code details
DELETE /api/access-codes/:accessCodeId # Delete access code
POST /api/access-codes/resend       # Resend access code to customer
```

## Usage Examples

### 1. Manual Payment Processing

Send a POST request to `/api/payments/process`:

```json
{
  "paymentId": "payment_123",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "deviceId": "device_abc123",
  "checkIn": "2024-12-20T15:00:00Z",
  "checkOut": "2024-12-22T11:00:00Z",
  "status": "paid"
}
```

This will:
1. Generate a unique PIN code
2. Create the access code on the Kwikset lock via Seam
3. Send the code to the customer via email and/or SMS

### 2. Payment Webhook Integration

Configure your payment provider to send webhooks to `/api/payments/webhook`. The endpoint expects:

```json
{
  "id": "payment_123",
  "customer": {
    "email": "customer@example.com",
    "name": "John Doe",
    "phone": "+1234567890"
  },
  "metadata": {
    "device_id": "device_abc123",
    "check_in": "2024-12-20T15:00:00Z",
    "check_out": "2024-12-22T11:00:00Z"
  },
  "status": "succeeded"
}
```

### 3. Stripe Integration

1. Set up a webhook endpoint in your Stripe dashboard pointing to `https://your-domain.com/api/stripe/webhook`
2. Select events: `payment_intent.succeeded` or `checkout.session.completed`
3. Include metadata in your Stripe payment:
   - `device_id`: Your Seam device ID
   - `check_in`: Check-in date/time (ISO 8601)
   - `check_out`: Check-out date/time (ISO 8601)
   - `customer_name`: Customer name (optional, will use Stripe customer name)

## Kwikset-Specific Constraints

The system automatically handles Kwikset lock constraints:

- **PIN Length**: 4-8 digits (default: 6)
- **Code Name**: 2-14 characters (automatically truncated if longer)
- **Time-Bound Codes**: Requires both `starts_at` and `ends_at`
- **Start Time**: Must be at least 15 minutes in the future (automatically adjusted)

## Email Template

Customers receive a beautifully formatted email with:
- Their unique access code
- Check-in and check-out times
- Instructions for using the code

## SMS Template

If SMS is configured, customers receive:
```
Your access code is: 123456

Active from Dec 20, 2024 3:00 PM to Dec 22, 2024 11:00 AM. Enter this code on the keypad to unlock.
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Security Considerations

- Store your `.env` file securely and never commit it to version control
- Use HTTPS in production
- Verify webhook signatures from payment providers
- Consider implementing rate limiting
- Add authentication/authorization for admin endpoints

## Troubleshooting

### Access codes not being created
- Verify your Seam API key is correct
- Check that the device ID exists and is a Kwikset device
- Ensure check-in time is at least 15 minutes in the future

### Emails not sending
- Verify SMTP credentials are correct
- Check spam folder
- Ensure SMTP port is not blocked by firewall

### SMS not sending
- Verify Twilio credentials
- Check phone number format (E.164 format: +1234567890)
- Ensure Twilio account has sufficient credits

## Resources

- [Seam API Documentation](https://docs.seam.co)
- [Kwikset Locks Guide](https://docs.seam.co/latest/device-and-system-integration-guides/kwikset-locks)
- [Seam Node.js SDK](https://github.com/seamapi/seam-node)

## License

ISC
