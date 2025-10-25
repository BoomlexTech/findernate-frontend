# Stream.io Video Call Backend Setup

## Overview
The video call integration requires a backend endpoint to generate Stream.io tokens securely. The API secret should NEVER be exposed in the frontend.

## Required Backend Endpoint

### POST `/api/v1/stream/token`

**Purpose:** Generate a Stream.io user token for video calls

**Authentication:** Requires user JWT token in Authorization header

**Request:**
```http
POST /api/v1/stream/token
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "user_id_123",
    "expiresAt": "2024-12-31T23:59:59Z"
  },
  "message": "Token generated successfully"
}
```

## Backend Implementation

### Node.js / Express Example

#### 1. Install Stream.io Node SDK

```bash
npm install @stream-io/node-sdk
```

#### 2. Environment Variables

Add to your `.env` file:
```env
STREAM_API_KEY=mmhfdzb5evj2
STREAM_API_SECRET=your_stream_api_secret_here
```

#### 3. Create Stream Client

```javascript
// streamClient.js
const { StreamClient } = require('@stream-io/node-sdk');

const streamClient = new StreamClient(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

module.exports = streamClient;
```

#### 4. Create Token Endpoint

```javascript
// routes/stream.js
const express = require('express');
const router = express.Router();
const streamClient = require('../streamClient');
const authMiddleware = require('../middleware/auth'); // Your auth middleware

// POST /api/v1/stream/token
router.post('/token', authMiddleware, async (req, res) => {
  try {
    // Get authenticated user ID from your auth middleware
    const userId = req.user._id.toString(); // Adjust based on your user model

    // Generate Stream.io token for this user
    const token = streamClient.createToken(userId);

    // Optional: Set token expiration (default is 1 hour)
    const expiresAt = new Date(Date.now() + 3600000).toISOString();

    res.json({
      success: true,
      data: {
        token,
        userId,
        expiresAt
      },
      message: 'Token generated successfully'
    });
  } catch (error) {
    console.error('Error generating Stream token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate video call token'
    });
  }
});

module.exports = router;
```

#### 5. Register Route

```javascript
// app.js or server.js
const streamRoutes = require('./routes/stream');

app.use('/api/v1/stream', streamRoutes);
```

## Testing

### Test Token Generation

```bash
curl -X POST http://localhost:8000/api/v1/stream/token \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "userId": "123456",
    "expiresAt": "2024-01-01T12:00:00Z"
  },
  "message": "Token generated successfully"
}
```

## Security Considerations

1. **Never expose API secret:** The Stream API secret must remain on the server
2. **Authenticate users:** Always verify user authentication before generating tokens
3. **Token expiration:** Tokens should expire after a reasonable time (1 hour default)
4. **Rate limiting:** Consider rate limiting the token endpoint to prevent abuse
5. **HTTPS only:** Use HTTPS in production to encrypt token transmission

## Troubleshooting

### Error: "Invalid API credentials"
- Verify `STREAM_API_KEY` and `STREAM_API_SECRET` in your `.env` file
- Check that you're using the correct credentials from Stream.io dashboard

### Error: "User not authenticated"
- Ensure the Authorization header is present and valid
- Check your auth middleware is working correctly

### Error: "Token generation failed"
- Check Stream.io service status
- Verify your Stream.io account is active and not rate-limited
- Check backend logs for detailed error messages

## Stream.io Dashboard Setup

1. Go to https://getstream.io/
2. Sign up or log in
3. Create a new app or use existing one
4. Get your API Key and API Secret from the dashboard
5. Configure your app settings:
   - Enable video calling
   - Set webhook URLs if needed
   - Configure call settings (recording, transcription, etc.)

## Additional Resources

- [Stream.io Video Docs](https://getstream.io/video/docs/)
- [Node SDK Documentation](https://getstream.io/video/docs/node/)
- [Authentication Guide](https://getstream.io/video/docs/api/authentication/)
