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
    describe('End to End Test', async function () {
        let test_url = "http://127.0.0.1:3000"
        let mint_key = ""
        it('Submit form to /request_eth', async function () {
            const data = {
                "email" : "test@gmail.com",
                "request_eth_address": "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
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