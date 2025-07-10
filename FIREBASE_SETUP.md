# Firebase Setup Guide

To get the photo upload functionality working, you need to set up Firebase properly. Follow these steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firebase Storage:
   - Go to "Storage" in the left sidebar
   - Click "Get Started"
   - Choose a location for your storage bucket
   - Start in test mode with these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;  // Warning: This is for testing only
    }
  }
}
```

4. Get your Firebase configuration:

   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"
   - Scroll down to "Your apps"
   - Click the web icon (</>)
   - Register your app with a nickname
   - Copy the firebaseConfig object

5. Update your `config/firebase.ts` file with your configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id",
};
```

6. Security Considerations:
   - The test rules above allow anyone to read and write to your storage
   - For production, implement proper authentication and secure rules
   - Consider implementing user authentication
   - Update storage rules to restrict access based on user authentication

Example of secure storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{photoId} {
      allow read: if true;  // Public read access
      allow write: if request.auth != null;  // Only authenticated users can upload
    }
  }
}
```

After completing these steps, the photo upload functionality should work correctly. If you're still experiencing issues, check:

1. Your Firebase project is on the Blaze (pay-as-you-go) plan
2. The storage bucket is properly initialized
3. Your app has internet permission
4. The Firebase configuration values are correct
