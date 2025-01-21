const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 300 }); // Cache data for 5 minutes (300 seconds)

app.use(express.json()); // Middleware to parse JSON request bodies

// Default GET route for testing
app.get('/', (req, res) => {
  res.send('Proxy server is running!');
});

// Proxy API Endpoint
app.post('/api/1', async (req, res) => {
  const { UniqueNumber } = req.body;

  if (!UniqueNumber) {
    return res.status(400).json({ error: 'UniqueNumber is required' });
  }

  const cacheKey = UniqueNumber; // Use UniqueNumber as the cache key

  // Check if the response for this UniqueNumber is cached
  if (cache.has(cacheKey)) {
    console.log(`Cache hit for UniqueNumber: ${UniqueNumber}`);
    return res.json(cache.get(cacheKey)); // Return the cached response
  }

  console.log(`Cache miss for UniqueNumber: ${UniqueNumber}`);

  try {
    // Call the original Smartify API
    const response = await axios.post(
      'http://smartifyindia.co.in:8080/api/GetOutputDetailbyUniqueNumber',
      { UniqueNumber }
    );

    // Cache the response data
    cache.set(cacheKey, response.data);

    // Send the data back to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error calling Smartify API:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from the Smartify API' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Proxy server running on http://localhost:3000');
});
