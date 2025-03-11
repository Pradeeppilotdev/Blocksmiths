const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/verify-pan', async (req, res) => {
  try {
    const { panNumber } = req.body;
    
    // Basic PAN format validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid PAN format' });
    }

    // Using a free PAN verification API (example using rapidapi)
    const options = {
      method: 'POST',
      url: 'https://pan-card-verification1.p.rapidapi.com/v3/tasks/sync/verify_with_source/ind_pan',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': process.env.RAPID_API_KEY,
        'X-RapidAPI-Host': 'pan-card-verification1.p.rapidapi.com'
      },
      data: {
        task_id: 'UUID_' + Date.now(),
        group_id: 'UUID_' + Date.now(),
        data: {
          id_number: panNumber
        }
      }
    };

    const response = await axios.request(options);
    
    if (response.data.status === 'completed') {
      res.json({
        success: true,
        data: response.data.result
      });
    } else {
      res.json({
        success: false,
        message: 'PAN verification failed'
      });
    }

  } catch (error) {
    console.error('PAN verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying PAN'
    });
  }
});

module.exports = router; 