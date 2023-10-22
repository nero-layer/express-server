import { ethers } from "ethers";
import 'dotenv/config'

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
        // TODO explain how long until they can request again
        return {
            "status_code" : "error",
            "body" : "Previous request was less than 24 Horus ago"
        }
    } else {
        // TODO send validation email
        create_faucet_transaction(db_cursor, request_obj)
        return {
            "status_code" : "success",
            "body" : `Check your email ${request_obj.email}, for email from`
        }
    }
}

// This should be called every 30 seconds
export async function check_validation_email(){}

export async function create_faucet_transaction(db_cursor, request_obj){
    // Check balance of hot wallet
    let hot_wallet_balance = await check_address_balance(process.env.RPC_URL, process.env.HOT_WALLET_ADDRESS);
    console.log("process.env.RPC_URL")
    console.log(process.env.RPC_URL)
    console.log("process.env.HOT_WALLET_ADDRESS")
    console.log(process.env.HOT_WALLET_ADDRESS)
    console.log(hot_wallet_balance)
    if(hot_wallet_balance > 1){
        let provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
        const wallet = new ethers.Wallet(process.env.HOT_WALLET_PRIVATE_KEY, provider);
        const amountToSend = ethers.utils.parseEther('0.1'); 

        const tx = {
            to: request_obj.request_eth_address,
            value: amountToSend,
            gasLimit: 21000, // Adjust gas limit as needed
            gasPrice: ethers.utils.parseUnits('100', 'gwei'), // Adjust gas price as needed
        };
        console.log("TX TIME")
        try {
            const txResponse = await wallet.sendTransaction(tx);
            console.log("TX SENT")
            console.log('Transaction hash:', txResponse.hash);
            // TODO insert into database
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
