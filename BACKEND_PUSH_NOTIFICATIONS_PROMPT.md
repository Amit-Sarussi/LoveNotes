# Backend Implementation: Push Notifications for Chat System

## Overview
Implement push notification functionality for the Love Notes chat system. When a user sends a chat message, the other user should receive a push notification on their device, even if they're already in the app or on the chat screen.

## Requirements

### 1. New Endpoint: POST /api/push-token
Register and store Expo push tokens for users.

**Request Body:**
```json
{
  "user": "amit" | "ori",
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Response:**
- 200 OK on success
- 400 Bad Request if user or pushToken is missing or invalid
- 500 Internal Server Error on failure

**Implementation Details:**
- Store the push token associated with the user (amit or ori)
- Each user should only have ONE active push token (update if already exists)
- Store in your preferred storage method (database, file, in-memory, etc.)
- Push tokens should persist between server restarts if possible

### 2. Update Existing Endpoint: POST /api/chat
Modify the existing chat message endpoint to send push notifications.

**Current Behavior:**
- Accepts message, sender, and optional replyId
- Stores the message in your chat storage

**New Behavior:**
- After successfully storing the message, send a push notification to the OTHER user
- If sender is "amit", send notification to "ori"'s device
- If sender is "ori", send notification to "amit"'s device
- Only send notification if the recipient has a registered push token
- Notification should be sent AFTER the message is saved, but don't fail the request if notification fails

### 3. Push Notification Implementation

**Using Expo Push Notification Service:**

Install the Expo server SDK (if not already installed):
```bash
npm install expo-server-sdk
# or
pip install exponent-server-sdk
```

**Notification Format:**
```javascript
{
  to: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]', // recipient's token
  sound: 'default',
  title: 'Love Notes',
  body: '<sender_name> sent you a message', // e.g., "עמית sent you a message" or "אורי sent you a message"
  data: {
    type: 'chat',
    sender: 'amit' | 'ori',
    messageId: '<message_id>',
  },
  channelId: 'chat-messages', // For Android
  priority: 'high',
  badge: 1,
}
```

**Display Names:**
- amit → "עמית"
- ori → "אורי"

**Node.js Example:**
```javascript
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function sendPushNotification(recipientToken, senderName, messageData) {
  if (!Expo.isExpoPushToken(recipientToken)) {
    console.error(`Invalid push token: ${recipientToken}`);
    return;
  }

  const messages = [{
    to: recipientToken,
    sound: 'default',
    title: 'Love Notes',
    body: `${senderName} sent you a message`,
    data: {
      type: 'chat',
      sender: messageData.sender,
      messageId: messageData.id,
    },
    channelId: 'chat-messages',
    priority: 'high',
    badge: 1,
  }];

  try {
    const ticketChunk = await expo.sendPushNotificationsAsync(messages);
    console.log('Push notification sent:', ticketChunk);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}
```

**Python Example:**
```python
from exponent_server_sdk import (
    DeviceNotRegisteredError,
    PushClient,
    PushMessage,
    PushServerError,
    PushTicketError,
)

def send_push_notification(recipient_token, sender_name, message_data):
    try:
        response = PushClient().publish(
            PushMessage(
                to=recipient_token,
                title="Love Notes",
                body=f"{sender_name} sent you a message",
                data={
                    "type": "chat",
                    "sender": message_data["sender"],
                    "messageId": message_data["id"],
                },
                sound="default",
                channel_id="chat-messages",
                priority="high",
                badge=1,
            )
        )
        print(f"Push notification sent: {response}")
    except PushServerError as exc:
        print(f"Push server error: {exc}")
    except DeviceNotRegisteredError:
        print(f"Device not registered, removing token: {recipient_token}")
        # Remove the invalid token from storage
    except Exception as exc:
        print(f"Error sending push notification: {exc}")
```

### 4. Error Handling

**Push Token Registration Errors:**
- Handle invalid push token format
- Handle duplicate registrations (update existing token)
- Log errors but don't fail the registration endpoint

**Push Notification Sending Errors:**
- If notification fails, log the error but still return success for the chat message
- Handle "DeviceNotRegistered" errors by removing invalid tokens from storage
- Handle rate limiting from Expo's service
- Don't block the chat message response waiting for notification delivery

### 5. Storage Schema

**Suggested Storage Structure:**
```javascript
// In-memory example (use your preferred storage)
const pushTokens = {
  amit: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  ori: 'ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyyyy]'
};
```

**Database Schema (if using database):**
```sql
CREATE TABLE push_tokens (
  user VARCHAR(10) PRIMARY KEY,
  push_token VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 6. Testing

**Test the flow:**
1. Frontend registers push token for user "amit"
2. User "ori" sends a chat message
3. Backend stores the message and sends push notification to "amit"'s device
4. "amit" receives notification even when app is open/in background/closed

**Test cases:**
- ✅ Notification sent when recipient has registered token
- ✅ No error when recipient has no registered token
- ✅ Chat message still succeeds if notification fails
- ✅ Token updates when user registers again with new token
- ✅ Invalid push tokens are handled gracefully

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/push-token | Register user's push notification token |
| POST | /api/chat | Send chat message + trigger push notification |

## Notes

- The frontend is already implemented and will call these endpoints
- Push notifications will be sent every time a message is posted, regardless of the recipient's app state
- Both users can receive notifications even if they're currently viewing the chat screen
- The Expo push notification service is free for moderate usage
- Test with actual devices, as push notifications don't work reliably on simulators

## Frontend Changes Already Completed

✅ Push notification utility created (`utils/pushNotifications.ts`)  
✅ API function to register push token (`utils/api.ts`)  
✅ Notification handler configured globally (`app/_layout.tsx`)  
✅ Chat screen registers push token on mount (`app/chat.tsx`)  
✅ Android notification channels configured  
✅ Expo project ID configured in `app.config.js`

## Questions or Issues?

If you encounter any issues or need clarification, refer to:
- [Expo Push Notifications Documentation](https://docs.expo.dev/push-notifications/overview/)
- [Expo Server SDK Documentation](https://github.com/expo/expo-server-sdk-node)
