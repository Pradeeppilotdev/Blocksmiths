require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

// API proxy endpoint for EmailJS
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // EmailJS API request
    const response = await axios.post(
      'https://api.emailjs.com/api/v1.0/email/send',
      {
        service_id: 'service_xazqc32',
        template_id: 'template_5zc6xye',
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: email,
          otp: otp,
          to_name: email.split('@')[0],
          from_name: 'Blocksmiths',
          message: `Your OTP is: ${otp}`
        }
      }
    );
    
    // Store OTP in Firebase
    await admin.database().ref(`otps/${email.replace(/\./g, ',')}`).set({
      otp: otp,
      createdAt: admin.database.ServerValue.TIMESTAMP,
      used: false
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ 
      error: 'Failed to send OTP',
      message: error.message || 'Unknown error'
    });
  }
});

// Verify OTP endpoint
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Get OTP from Firebase
    const otpRef = await admin.database().ref(`otps/${email.replace(/\./g, ',')}`).once('value');
    const otpData = otpRef.val();

    if (!otpData || otpData.otp !== parseInt(otp)) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (otpData.used) {
      return res.status(400).json({ error: 'OTP already used' });
    }

    // Check if OTP is expired (10 minutes validity)
    const now = Date.now();
    if (now - otpData.createdAt > 10 * 60 * 1000) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Mark OTP as used
    await admin.database().ref(`otps/${email.replace(/\./g, ',')}`).update({ used: true });

    // Create a custom token for this user
    const customToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Store verification in Firebase
    await admin.database().ref('otpUsers/' + customToken).set({
      email: email,
      verifiedAt: new Date().toISOString(),
      method: 'otp',
      loginTime: admin.database.ServerValue.TIMESTAMP
    });

    // Return success with token
    return res.status(200).json({ 
      success: true, 
      token: customToken,
      email: email
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ 
      error: 'Failed to verify OTP',
      message: error.message || 'Unknown error'
    });
  }
});

// API endpoint to serve configuration to client
app.get('/api/config', (req, res) => {
  // Only send necessary configuration to the client
  const clientConfig = {
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID
    },
    infura: {
      sepoliaRpcUrl: process.env.INFURA_SEPOLIA_RPC_URL
    }
  };
  
  res.json(clientConfig);
});

// Serve the home.html file as the default page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});