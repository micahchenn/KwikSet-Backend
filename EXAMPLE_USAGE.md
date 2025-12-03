# Example Usage

## Quick Start Example

### 1. Install Dependencies

```bash
npm install
```

**Note**: If `@seamapi/javascript` doesn't work, try:
- `npm install seamapi` 
- Or check the [Seam JavaScript SDK documentation](https://github.com/seamapi/seam-node) for the correct package name

### 2. Set Up Environment Variables

Create a `.env` file:

```env
SEAM_API_KEY=seam_test_...
PORT=3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3. Start the Server

```bash
npm start
```

### 4. Get Your Device ID

```bash
curl http://localhost:3000/api/devices
```

### 5. Create an Access Code After Payment

#### Option A: Manual API Call

```bash
curl -X POST http://localhost:3000/api/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "pay_123",
    "customerEmail": "customer@example.com",
    "customerName": "John Doe",
    "customerPhone": "+1234567890",
    "deviceId": "device_abc123",
    "checkIn": "2024-12-20T15:00:00Z",
    "checkOut": "2024-12-22T11:00:00Z",
    "status": "paid"
  }'
```

#### Option B: JavaScript/Node.js

```javascript
const response = await fetch('http://localhost:3000/api/payments/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    paymentId: 'pay_123',
    customerEmail: 'customer@example.com',
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    deviceId: 'device_abc123',
    checkIn: '2024-12-20T15:00:00Z',
    checkOut: '2024-12-22T11:00:00Z',
    status: 'paid'
  })
});

const result = await response.json();
console.log('Access code created:', result.data.accessCode.pinCode);
```

#### Option C: Python

```python
import requests

response = requests.post('http://localhost:3000/api/payments/process', json={
    'paymentId': 'pay_123',
    'customerEmail': 'customer@example.com',
    'customerName': 'John Doe',
    'customerPhone': '+1234567890',
    'deviceId': 'device_abc123',
    'checkIn': '2024-12-20T15:00:00Z',
    'checkOut': '2024-12-22T11:00:00Z',
    'status': 'paid'
})

result = response.json()
print(f"Access code: {result['data']['accessCode']['pinCode']}")
```

## Stripe Integration Example

### 1. Set Up Stripe Webhook

In your Stripe Dashboard:
- Go to Developers → Webhooks
- Add endpoint: `https://your-domain.com/api/stripe/webhook`
- Select events: `payment_intent.succeeded` or `checkout.session.completed`

### 2. Include Metadata in Stripe Payment

When creating a payment in Stripe, include metadata:

```javascript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000, // $100.00
  currency: 'usd',
  metadata: {
    device_id: 'device_abc123',
    check_in: '2024-12-20T15:00:00Z',
    check_out: '2024-12-22T11:00:00Z',
    customer_name: 'John Doe'
  }
});
```

When the payment succeeds, the webhook will automatically:
1. Create an access code
2. Send it to the customer via email/SMS

## Testing Without Real Payment

You can test the system by calling the `/api/payments/process` endpoint directly with a mock payment:

```bash
curl -X POST http://localhost:3000/api/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "test_payment_001",
    "customerEmail": "test@example.com",
    "customerName": "Test Customer",
    "deviceId": "your_device_id_here",
    "checkIn": "2024-12-20T15:00:00Z",
    "checkOut": "2024-12-22T11:00:00Z",
    "status": "paid"
  }'
```

## Response Format

Successful response:

```json
{
  "success": true,
  "message": "Access code created and sent to customer",
  "data": {
    "paymentId": "pay_123",
    "accessCode": {
      "accessCodeId": "access_code_abc123",
      "pinCode": "123456",
      "codeName": "John Doe",
      "checkIn": "2024-12-20T15:00:00.000Z",
      "checkOut": "2024-12-22T11:00:00.000Z"
    },
    "notifications": {
      "email": {
        "success": true,
        "messageId": "...",
        "method": "email"
      },
      "sms": {
        "success": true,
        "messageSid": "...",
        "method": "sms"
      }
    },
    "createdAt": "2024-12-19T10:00:00.000Z"
  }
}
```

