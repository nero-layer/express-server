## Full Stack Eth Faucet


## npm installs

``` bash 
npm install better-sqlite3
npm install mocha chai --save-dev
npm install ethers@5.6
npm i hbs
npm i express-hbs
npm i express
npm i express-rate-limit
```

## Install and Configure

``` bash
git clone ....
npm install
node migrate.js
npx mocha ./pauls_tests.js
```

## API Design

* GET /
* GET /tx_hash/{tx_hash}
* POST /request_eth
    * Input
        * email : 
        * public_key :
        * signed_data :
    * Output
        * Statuses
            * Error
            * valid
* GET /mint_key/{mint_key}
