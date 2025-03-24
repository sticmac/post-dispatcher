const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware to parse form data in URL Encoded and JSON formats
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// List of target URLs to dispatch the data to, read from JSON file
const targetUrls = JSON.parse(fs.readFileSync('targetUrls.json', 'utf8'));

// POST route to receive data and dispatch it
app.post('/', async (req, res) => {
  const formData = req.body;
  console.log('Received form data:', formData);

  const results = await Promise.allSettled(
    targetUrls.map(url => axios.post(url, formData))
  );

  // Separate successful responses and errors
  const successful = results.filter(result => result.status === 'fulfilled').map(result => result.value.data);
  const errors = results.filter(result => result.status === 'rejected');

  if (errors.length > 0) {
    console.error("Errors:")
    for (const e of errors) {
      console.error(` - ${JSON.stringify(e)}`)
    }
  }

  res.json({
    status: 'ok',
    message: 'Dispatch complete',
    successfulResponses: successful,
    errorsCount: errors.length,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);

  console.log("Distributing POST requests to:")
  for (const url of targetUrls)
  {
    console.log(` - ${url}`)
  }
});

