import { assert } from 'chai';  // Using Assert style
import { expect } from 'chai';  // Using Expect style
import { should } from 'chai';  // Using Should style

import { ethers } from "ethers";
import {validate_faucet_request} from "./pauls_functions.js"
import {check_address_balance} from "./pauls_functions.js"
import {create_faucet_transaction} from "./pauls_functions.js"

import sinon from 'sinon';

import sqlite from 'better-sqlite3';

import axios from 'axios';

describe('Test Paul\'s Functions', async function () {
  const db_cursor = new sqlite("./dev.db");
  describe('validate_faucet_request', async function () {
    it('should take in a valid email', async function () {
        let result = ""
        try {
            result = await validate_faucet_request(
                db_cursor,
                {
                    "email" : "test@gmail.com",
                    "request_eth_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    "signed_data": "TODO"
                }
            )
            assert.equal(result.status_code == "success", true)
        } catch (error) {
            console.log(error)
            assert.equal(false, true, `validate_faucet_request errored out\n${error}`)
        }
        // console.log(result)
        assert.equal(result.status_code == "success", true)
    })
  });
  describe('check_address_balance', async function () {
    it('Check the balance of npx hardhat node account 0', async function () {
        let result = ""
        try {
            result = await check_address_balance(
                "http://127.0.0.1:8545/",
                "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                18
            )
        } catch (error) {
            assert.equal(false, true, `check_address_balance errored out\n${error}`)
        }
        assert.equal(result > 1, true, "Looks like that account, 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, has nothing")  
    })
  });
  describe('create_faucet_transaction', async function () {
    it('Check the balance of npx hardhat node account 0', async function () {
        let test_eth_address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
        let old_balance = await check_address_balance(
            "http://127.0.0.1:8545/",
            test_eth_address,
            18
        )
        let result = ""
        try {
            result = await create_faucet_transaction(
                db_cursor,
                {
                    "email" : "test@gmail.com",
                    "request_eth_address": test_eth_address,
                    "signed_data": "TODO"
                }
            )
        } catch (error) {
            console.log(error)
            assert.equal(false, true, `check_address_balance errored out\n${error}`)
        }
        // console.log(result)
        let new_balance = await check_address_balance(
            "http://127.0.0.1:8545/",
            test_eth_address,
            18
        )    
        let difference = new_balance - old_balance
        // console.log(result)
        // console.log(difference)
        })
    })
    describe('End to End Test', async function () {
        let test_url = "http://127.0.0.1:3000"
        let mint_key = ""
        it('Submit form to /request_eth', async function () {
            const data = {
                "email" : "test@gmail.com",
                "request_eth_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                "signed_data": "TODO"
            }
            const headers =  {
                headers: {
                    'Content-Type': 'application/json'
                }
              }
            // console.log(test_url + "/request_eth")
            const response = await axios.post(test_url + "/request_eth", data, headers);
            // console.log(response)
        })
        it('Get link from email /mint_key', async function () {
            // Insert into the database
            mint_key =  "56236642689da070ca8bf0f1c70a8bebe5c938cadf0e0aad5619e0b1f905ab8c"
            const insertStmt = db_cursor.prepare(`
                INSERT INTO 
                faucet_requests_t 
                (request_eth_address, email, user_validation_token)
                VALUES (?, ?, ?);`);
            await insertStmt.run("0x71bE63f3384f5fb98995898A86B02Fb2426c5788", "Testing Email", mint_key);
            let validate_insert = await db_cursor.prepare(`
                SELECT 
                    * 
                FROM
                    faucet_requests_t
                WHERE
                    user_validation_token = ?
            `).all(mint_key);
            console.log("validate_insert")
            console.log(validate_insert)
            assert.equal(validate_insert.length >= 1, true, "Could not validate insert")
            const response = await axios.get(test_url + "/mint_key/" + mint_key);
            console.log(response.data)
        })
        it('Get Transaction has from /mint_key', async function () {
            console.log("Placeholder")
        })

   });
});