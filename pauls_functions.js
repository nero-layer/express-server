import { ethers } from "ethers";
import 'dotenv/config'
import { send_nostr_note } from "./nostr_me.js";
// import { send_email } from './send_email.js'; 

function areKeysInObject(obj, keysToCheck) {
    for (let key of keysToCheck) {
      if (!obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
}

function isValidEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}

function generateRandomToken() {
  const characters = '0123456789abcdef';
  let token = '';

  for (let i = 0; i < 64; i++) {
    const randomCharIndex = Math.floor(Math.random() * characters.length);
    const randomChar = characters.charAt(randomCharIndex);
    token += randomChar;
  }

  return token;
}

export async function check_address_balance(eth_rpc, address, decimal_count){
    let provider = new ethers.providers.JsonRpcProvider(eth_rpc)
    let balance = await provider.getBalance(address);
    return ethers.utils.formatUnits(balance, decimal_count);
}

export async function validate_faucet_request(db_cursor, request_obj){
    let keysToCheck = ["email", "request_eth_address", "signed_data"]
    if (!areKeysInObject(request_obj, keysToCheck)) {
        return {
            "status_code" : "error",
            "body" : "missing keys in json"
        }
    }
    if (!isValidEmail(request_obj.email)) {
        return {
            "status_code" : "error",
            "body" : "invalid email"
        }
    }
    // TODO validate signed_data
    // Check for faucet request in last 24 hours
    let check_already_requested = await db_cursor.prepare(`
        SELECT 
            * 
        FROM
            faucet_requests_t
        WHERE
            request_eth_address = ?
            AND created_at < datetime('now', '-1 day');
    `).all(request_obj.request_eth_address);

    
    if(check_already_requested != 0){
        // TODO explain how long until they can request again in body
        return {
            "status_code" : "error",
            "body" : "Previous request was less than 24 Horus ago"
        }
    } 

    //  generate user_validation_token
    const user_validation_token = generateRandomToken();
    console.log("user_validation_token")
    console.log(user_validation_token)

    // INSERT into faucet_requests_t request_eth_address and email and user_validation_token 
    const insertStmt = db_cursor.prepare(`
    INSERT INTO 
        faucet_requests_t 
        (request_eth_address, email, user_validation_token)
        VALUES (?, ?, ?);`);
    await insertStmt.run(request_obj.request_eth_address, request_obj.email, user_validation_token);
    // await db_cursor.exec(`
    //     INSERT INTO 
    //         faucet_requests_t 
    //     (request_eth_address, email, user_validation_token)
    //     VALUES (?, ?, ?);
    // `, [request_obj.request_eth_address, request_obj.email, request_obj.user_validation_token]);
    send_nostr_note(`Please go to https://faucet.ddaemon.org/mint_key/${user_validation_token} to claim your eth, our account is npub15xlr6r7feh9w74s4936xvmfc3adkcu9lq3fkw974hhqa2r2ka24q3a3hyr`)
    // TODO send_validation_email(email, user_eth_address, user_validation_token)
    // await send_email(request_obj.email, user_validation_token, request_obj.request_eth_address);
    
    return {
        "status_code" : "success",
        "body" : `Check your email ${request_obj.email}, for email from`
    }
}

export async function validate_user_validation_token(db_cursor, user_validation_token){
    // Select where user_validation_token = user_validation_token
        // Make sure to select the eth address as well
    // If valid
        // create_faucet_transaction
    // If already sent out
        // Return tx.hash
    // Else
        // Return Error

    let request_eth_address = await db_cursor.prepare(`
        SELECT 
            request_eth_address,
            transaction_sent
        FROM
            faucet_requests_t
        WHERE
            user_validation_token = ?
            LIMIT 1;
    `).get(user_validation_token);
    console.log("request_eth_address")
    console.log(request_eth_address)

    if (!request_eth_address) {
        return {
            "status_code" : "error",
            "body" : `the validation token does not exist`,
        };
    }
    // TODO 
    // if (transaction_sent) {
    //     const transactionInProgress = await db_cursor.prepare(`
    //         SELECT tx_hash
    //         FROM transactions_in_progress_t
    //         WHERE faucet_request_id = ?;
    //     `).get(faucet_request_id);

    //     if (transactionInProgress) {
    //         return {
    //             "status_code" : "success",
    //             "body" : transactionInProgress.tx_hash,
    //         };
    //     }
    // }
    
    
    const payload = {
        request_eth_address,
    };
    const status = await create_faucet_transaction(db_cursor, payload);
    if (!status) {
        return {
            "status_code" : "no_wallet_balance",
        };
    }
    return {
        "status_code" : "success",
        body: tx_hash,
    };
        
}

export async function create_faucet_transaction(db_cursor, request_obj){
    // Check balance of hot wallet
    let hot_wallet_balance = await check_address_balance(process.env.RPC_URL, process.env.HOT_WALLET_ADDRESS);
    console.log("process.env.RPC_URL")
    console.log(process.env.RPC_URL)
    console.log("process.env.HOT_WALLET_ADDRESS")
    console.log(process.env.HOT_WALLET_ADDRESS)
    console.log(hot_wallet_balance)
    console.log(request_obj)
    console.log(request_obj.request_eth_address)
    if(hot_wallet_balance > 1){
        let provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
        const wallet = new ethers.Wallet(process.env.HOT_WALLET_PRIVATE_KEY, provider);
        const amountToSend = ethers.utils.parseEther('0.1'); 
        const tx = {
            to: request_obj.request_eth_address.request_eth_address,
            value: amountToSend,
            gasLimit: 21000, // Adjust gas limit as needed
            gasPrice: ethers.utils.parseUnits('100', 'gwei'), // Adjust gas price as needed
        };
        try {
            // if(!ethers.utils.isAddress(ethers.utils.getAddress(request_obj.request_eth_address))){
            //     console.log("NOT VALID ADDRESS")
            //     return {
            //         "status_code" : "error",
            //         "body" : "NOT VALID ADDRESS"
            //     }
            // }
            // let txResponse = wallet.sendTransaction({
            //     to: ethers.utils.getAddress(request_obj.request_eth_address),
            //     value: ethers.utils.parseEther('0.1') // Send 0.1 ETH
            //   });
            const txResponse = await wallet.sendTransaction(tx);
            console.log(txResponse.hash)
            // console.log("TX SENT")
            // console.log('Transaction hash:', txResponse);
            // console.log('Transaction hash:', Object.keys(txResponse));
            // update faucet_requests_t transaction_sent = true


            let faucet_requests_t_statement = await db_cursor.prepare(`
                UPDATE faucet_requests_t
                SET transaction_sent = true
                WHERE request_eth_address = ?;
            `)
            let faucet_requests_t = await faucet_requests_t_statement.run(request_obj.request_eth_address.request_eth_address);

            // let insert_transactions_in_progress_t = await db_cursor.prepare(`
            //     INSERT INTO transactions_in_progress_t (faucet_request_id, hot_wallet_address, to_wallet_address, tx_hash, gas_price)
            //     VALUES (?, ?, ?, ?, ?);
            // `)
            // insert_transactions_in_progress_t.run(faucet_request_id, hot_wallet_address, to_wallet_address, txResponse.hash, tx.gasPrice);

            // Todo: Need txResponse.hash to be returned.
        } catch (error) {
            console.error('Error sending transaction:', error);
            // TODO insert error into database
        }
    }
    
    else {
        return false
    } 
}

export async function validate_transaction(){}
