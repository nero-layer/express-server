import express from 'express';
import bodyParser from 'body-parser';

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import rateLimit from 'express-rate-limit';

// es6 equivalent for the __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.get('/tx_hash/:code', limiter, (req, res) => {
  const code = req.params.code;
  // process tx_hash
  
  const tx_hash = 'demo hash';
  res.json({
    tx_hash,
  });
});

app.post('/request_eth', limiter, (req, res) => {
  const email = req.body.email;
  const publicKey = req.body.public_key;
  const signedData = req.body.signed_data;
  // process request

  // Validate email format
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email) {
    return res.status(400).json({ error: 'Email empty' });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate public key format (assuming it is a hexadecimal string)
  const publicKeyRegex = /^[0-9a-fA-F]+$/;
  if (!publicKeyRegex.test(publicKey) || publicKey.length !== 64) {
    return res.status(400).json({ error: 'Invalid public key format' });
  }

  // Validate signed data format
  if (typeof signedData !== 'string') {
    return res.status(400).json({ error: 'Signed data must be a string' });
  }  
  
  res.json({ 
    status: 'valid'
  });
});

app.get('/mint_key/:key', limiter, (req, res) => {
  const key = req.params.key;
  // process mintKey
   if (typeof key !== 'string') {
    return res.status(400).json({ 
      error: 'Invalid parameters',
    });
  }

  const mintKey = 'demo mintKey';
  
  res.json({
    mint_key: mintKey,
  });
});

// GET / endpoint
app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).send('Internal Server Error');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
