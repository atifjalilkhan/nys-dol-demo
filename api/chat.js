const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const NGROK_URL = process.env.NGROK_URL || 'https://credibly-pliable-cofounder.ngrok-free.dev';
    const { endpoint, ...body } = req.body;
    const url = endpoint === 'session'
      ? `${NGROK_URL}/api/chatbot/session/new`
      : `${NGROK_URL}/api/chatbot/message`;

    console.log('Calling:', url);
    console.log('Body:', JSON.stringify(body));

    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      timeout: 55000
    });

    console.log('Response received:', response.status);
    res.json(response.data);
  } catch (e) {
    console.error('Error type:', e.code);
    console.error('Error message:', e.message);
    if (e.code === 'ECONNABORTED') {
      res.status(504).json({ error: 'Claude AI is taking too long. Please try again.' });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
};
