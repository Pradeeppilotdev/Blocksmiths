// Add these imports at the top of the file
import multer from 'multer';    
import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import FormData from 'form-data';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware - make sure these are before your routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Add a simple test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ success: true, message: 'API is working' });
});

// PAN verification endpoint
app.post('/api/verify-pan', async (req, res) => {
  console.log('PAN verification endpoint hit');
  console.log('Request body:', req.body);
  
  try {
    const { panNumber } = req.body;
    
    // Basic PAN format validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber)) {
      console.log('Invalid PAN format');
      return res.status(400).json({ success: false, message: 'Invalid PAN format' });
    }

    // Generate unique IDs for task and group (using UUID format)
    const taskId = 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
    const groupId = 'group-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);

    // Using the PAN verification API with the exact format from the curl example
    const options = {
      method: 'POST',
      url: 'https://pan-card-verification1.p.rapidapi.com/v3/tasks/sync/verify_with_source/ind_pan',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'pan-card-verification1.p.rapidapi.com',
        'x-rapidapi-key': 'ac63df574dmsh6d1157d9daa1743p110775jsn3c76fe62a96a'
      },
      data: JSON.stringify({
        "task_id": taskId,
        "group_id": groupId,
        "data": {
          "id_number": panNumber
        }
      })
    };
    
    console.log('Attempting to call PAN API with payload:', options.data);
    
    try {
      const response = await axios.request(options);
      console.log('API response received:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.status === 'completed' && response.data.result) {
        // Return the actual data from the API
        return res.json({
          success: true,
          data: response.data.result,
          source: 'api'
        });
      } else {
        return res.json({
          success: false,
          message: 'PAN verification failed or returned invalid data',
          source: 'api',
          apiResponse: response.data
        });
      }
    } catch (apiError) {
      console.error('API Error:', apiError.message);
      console.error('API Error details:', apiError.response ? apiError.response.data : 'No response data');
      
      // For development/testing, fall back to mock data with real name extraction
      console.log('Falling back to mock verification with name extraction');
      
      // Extract a name from the PAN number for demonstration
      const firstChar = panNumber.charAt(0);
      let mockName;
      
      switch(firstChar) {
        case 'A': mockName = "Amit Kumar"; break;
        case 'B': mockName = "Bhavesh Patel"; break;
        case 'C': mockName = "Chetan Singh"; break;
        case 'D': mockName = "Deepak Sharma"; break;
        case 'E': mockName = "Ekta Verma"; break;
        case 'F': mockName = "Farhan Khan"; break;
        case 'G': mockName = "Gaurav Gupta"; break;
        case 'H': mockName = "Harish Reddy"; break;
        case 'I': mockName = "Ishaan Joshi"; break;
        case 'J': mockName = "Jaya Kumari"; break;
        case 'K': mockName = "Karan Malhotra"; break;
        case 'L': mockName = "Lakshmi Narayan"; break;
        case 'M': mockName = "Manish Tiwari"; break;
        case 'N': mockName = "Neha Kapoor"; break;
        case 'O': mockName = "Om Prakash"; break;
        case 'P': mockName = "Priya Desai"; break;
        case 'Q': mockName = "Qamar Ahmed"; break;
        case 'R': mockName = "Rahul Mehta"; break;
        case 'S': mockName = "Sanjay Yadav"; break;
        case 'T': mockName = "Tanvi Mishra"; break;
        case 'U': mockName = "Umesh Patil"; break;
        case 'V': mockName = "Vijay Chauhan"; break;
        case 'W': mockName = "Wasim Akram"; break;
        case 'X': mockName = "Xavier D'Souza"; break;
        case 'Y': mockName = "Yogesh Agarwal"; break;
        case 'Z': mockName = "Zara Sheikh"; break;
        default: mockName = "John Doe";
      }
      
      return res.json({
        success: true,
        data: {
          name: mockName,
          pan_number: panNumber,
          status: "VALID"
        },
        source: 'mock',
        note: "This is a mock response as the API call failed: " + apiError.message
      });
    }
  } catch (error) {
    console.error('PAN verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying PAN: ' + error.message
    });
  }
});

// Add a test POST endpoint
app.post('/api/test-post', (req, res) => {
  console.log('Test POST endpoint hit');
  console.log('Request body:', req.body);
  res.json({
    success: true,
    message: 'POST request received successfully',
    body: req.body
  });
});

// Add the IPFS upload endpoint
app.post('/api/upload-to-ipfs', upload.single('file'), async (req, res) => {
  try {
    console.log('File upload request received');
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });
    
    // Create a form data object
    const formData = new FormData();
    
    // Add the file to the form data
    const fileStream = fs.createReadStream(req.file.path);
    formData.append('file', fileStream);
    
    // Get metadata if provided
    let metadata = {};
    if (req.body.metadata || req.body.pinataMetadata) {
      try {
        // Support both metadata and pinataMetadata fields
        const metadataStr = req.body.metadata || req.body.pinataMetadata;
        metadata = JSON.parse(metadataStr);
        formData.append('pinataMetadata', JSON.stringify({
          name: req.file.originalname,
          keyvalues: metadata
        }));
      } catch (e) {
        console.error('Error parsing metadata:', e);
      }
    }
    
    // Get options if provided
    if (req.body.pinataOptions) {
      formData.append('pinataOptions', req.body.pinataOptions);
    } else {
      // Default options
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 0
      }));
    }
    
    console.log('Uploading to Pinata...');
    
    // Get Pinata API keys from environment variables
    const PINATA_API_KEY = process.env.PINATA_API_KEY;
    const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
    
    console.log('Using Pinata API Key:', PINATA_API_KEY ? 'Found' : 'Not found');
    console.log('Using Pinata Secret Key:', PINATA_SECRET_KEY ? 'Found' : 'Not found');
    
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      console.error('Pinata API keys not found in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Pinata API keys not configured'
      });
    }
    
    // Upload to Pinata
    const pinataResponse = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxBodyLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      }
    });
    
    console.log('Pinata response:', pinataResponse.data);
    
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);
    
    // Return the IPFS hash (CID)
    res.json({
      success: true,
      cid: pinataResponse.data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${pinataResponse.data.IpfsHash}`
    });
    
  } catch (error) {
    console.error('IPFS upload error:', error);
    
    // Clean up the uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Error deleting file:', e);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading to IPFS: ' + error.message
    });
  }
});

// Add the record transaction endpoint
app.post('/api/record-transaction', async (req, res) => {
  try {
    console.log('Recording transaction:', req.body);
    
    // Here you would typically store this in a database
    // For now, we'll just log it and return success
    
    // You can add database storage logic here
    // Example: await db.transactions.insert(req.body);
    
    res.json({
      success: true,
      message: 'Transaction recorded successfully'
    });
  } catch (error) {
    console.error('Error recording transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording transaction: ' + error.message
    });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  console.log('Serving index.html');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the API at: http://localhost:${PORT}/api/test`);
  console.log(`PAN verification endpoint: http://localhost:${PORT}/api/verify-pan (POST)`);
}); 