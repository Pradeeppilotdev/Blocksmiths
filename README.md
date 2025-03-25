# Blocksmiths

Welcome to Blocksmiths! This project leverages blockchain technology to deliver fast, transparent, and secure payment solutions for government services through **GovChain Pay**. 

## Key Features

- **Secure Transactions:** Payments are powered by blockchain, ensuring safety and transparency.
- **Lightning Fast Processing:** Experience quick processing times for all government services.
- **Complete Transparency:** Track all your transactions seamlessly.

## Demo Links

- **GitHub Repository:** [Blocksmiths](https://github.com/Pradeeppilotdev/Blocksmiths)
- **Live Project:** [GovChain Pay](https://blocksmiths.vercel.app)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Pradeeppilotdev/Blocksmiths.git
   cd Blocksmiths
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables:
   - Create a `.env` file in the root directory based on the example below
   - Get Firebase Admin SDK credentials from the Firebase console (Project Settings > Service accounts > Generate new private key)

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables Setup

This project uses a secure server-side approach for handling sensitive API keys. Set up your `.env` file with:

```
# Email.js keys
EMAILJS_PUBLIC_KEY=your_emailjs_key

# Firebase configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_DATABASE_URL=your_firebase_database_url
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Firebase Admin SDK
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
```

## Security Features

The application uses a Node.js/Express server that acts as a proxy for the EmailJS and Firebase services. This approach provides several security benefits:

1. API keys are never exposed to the client
2. Server-side validation of OTP codes
3. Rate limiting and enhanced security features can be added
4. Firebase Admin SDK for secure database operations

## Technologies Used

- Node.js & Express (backend)
- Firebase Admin SDK (authentication & database)
- Secure API proxy architecture
- HTML/CSS/JS (frontend)
- Blockchain integration
- IPFS
- OTP Authentication

## How It Works

1. The server handles all API requests that require sensitive keys
2. OTP generation and verification is handled securely on the server
3. The client only receives confirmation of success/failure
4. Authentication tokens are stored in localStorage after verification

## Contributing

Feel free to fork the repository and make contributions. Open a pull request if you want to propose changes!

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For more information or collaboration, reach out to the Blocksmiths team through the repository's Issues tab or email us directly.

Start using GovChain Pay today and revolutionize the way you experience government services!

## Environment Variables Setup

This project uses environment variables to manage sensitive API keys and configuration. The setup includes:

1. A `.env` file in the root directory for server-side environment variables 
2. A `public/Email/env-config.js` file that exposes environment variables to client-side code

### For Local Development

1. Make sure to copy the `.env` file to your local environment
2. The `env-config.js` file contains the client-side environment variables

### For Production

For production deployments, you should:

1. Set up environment variables on your hosting platform (Netlify, Vercel, etc.)
2. Generate the `env-config.js` file during build time to avoid exposing sensitive keys in source control

## Security Note

The current implementation is primarily for development purposes. In a full production environment, you should:

1. Never commit the `.env` file to source control (add it to `.gitignore`)
2. Use a build process to populate client-side environment variables from server variables
3. Consider server-side API proxying for better security of API keys
   
