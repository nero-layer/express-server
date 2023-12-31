import express from 'express';
import bodyParser from 'body-parser';
import hbs from 'express-hbs'

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import rateLimit from 'express-rate-limit';

import { validate as validateRecaptcha } from './recaptcha.js';
import { validate_faucet_request, create_faucet_transaction, check_address_balance, validate_user_validation_token } from './pauls_functions.js';

import { getCursor } from './migrate.js';
const db = getCursor();

// es6 equivalent for the __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('hbs', hbs.express4({
  layoutsDir: __dirname + '/views/layouts',
  extname: '.hbs',
  // defaultLayout: 'main'
}));
app.set('view engine', 'hbs');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

const recaptchaRequired = (req, res, next) => {
  const recaptcha_token = req.body.recaptcha_token;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
  // Your code for recaptchaRequired middleware goes here
  validateRecaptcha(recaptcha_token, ip)
  .then(status => {
    if (!status) {
      next('failed to validate recaptcha');
    }
    next();
  });
};

app.get('/main', (req, res) => {
  return res.render('main');
});

app.get('/tx_hash/:code', limiter, (req, res) => {
  const code = req.params.code;
  // process tx_hash
  
  const tx_hash = 'demo hash';
  res.json({
    tx_hash,
  });
});

//app.post('/request_eth', limiter, recaptchaRequired, (req, res) => {
app.post('/request_eth', (req, res) => {
  const email = req.body.email;
  const requestEthAddress = req.body.request_eth_address;
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
  // const requestEthAddressRegex = /^[0-9a-fA-F]+$/;
  // console.log(requestEthAddress.length)
  // if (!requestEthAddressRegex.test(requestEthAddress) && requestEthAddress.length == 42) {
  //   return res.status(400).json({ error: 'Invalid public key format' });
  // }

  // Validate signed data format
  // if (typeof signedData !== 'string') {
  //   return res.status(400).json({ error: 'Signed data must be a string' });
  // }  

  const payload = {
    email,
    request_eth_address: requestEthAddress,
    signed_data: signedData,
  };
  validate_faucet_request(db, payload)
  .then(resp => {
    if (resp.status_code !== 'success') {
      return res.json({
        status: resp.body,
      });
    }
    return res.json(resp);
    // Generate Key
    // Send an email.
    // res.json(resp)
    // res.sendFile(path.join(__dirname, 'check_email.html'));
    // res.json({
    //   status: 'success',
    // });
  })
  .catch(err => {
    console.error(`api: /request_eth post failed`, err);
    
    res.json({ 
      status: 'failed',
    });
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

  validate_user_validation_token(db, req.params.key)
  .then(resp => {
        const tx_hash = resp.body;
        if (resp.status_code !== 'success') {
          return Promise.reject(resp.status_code);
        }
        res.sendFile(path.join(__dirname, 'email_confirmed.html' + `?token=${tx_hash}`));
          // res.json({
          //   token: token,
          // });
  })
  .catch(err => {
        console.error(`failed to validate_user_validation_token`, err);
        res.json({
          status: 'failed',
        });
      });
  });

// GET / endpoint
app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/check_email/:email', (req, res) => {
  const email = req.params.email;
  return res.render('email', {
    email : email
  });
});

app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).send('Internal Server Error');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
