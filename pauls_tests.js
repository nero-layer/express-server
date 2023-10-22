import { assert } from 'chai';  // Using Assert style
import { expect } from 'chai';  // Using Expect style
import { should } from 'chai';  // Using Should style

import { ethers } from "ethers";
import {validate_faucet_request} from "./pauls_functions.js"
import {check_address_balance} from "./pauls_functions.js"
import {create_faucet_transaction} from "./pauls_functions.js"


import sqlite from 'better-sqlite3';

describe('Test Paul\'s Functions', async function () {
  const db = new sqlite("./dev.db");
  describe('validate_faucet_request', async function () {
    it('should take in a valid email', async function () {
        let result = ""
        try {
            result = await validate_faucet_request(
                db,
                {
                    "email" : "test@gmail.com",
                    "request_eth_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    "signed_data": "TODO"
                }
            )
            assert.equal(result.status_code == "success", true)
        } catch (error) {
            assert.equal(false, true, `validate_faucet_request errored out\n${error}`)
        }
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
        let old_balance = await check_address_balance(
            "http://127.0.0.1:8545/",
            "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            18
        )
        let result = ""
        try {
            result = await create_faucet_transaction(
                db,
                {
                    "email" : "test@gmail.com",
                    "request_eth_address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                    "signed_data": "TODO"
                }
            )
        } catch (error) {
            assert.equal(false, true, `check_address_balance errored out\n${error}`)
        }
        let new_balance = await check_address_balance(
            "http://127.0.0.1:8545/",
            "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            18
        )    
        let difference = new_balance - old_balance
        console.log(result)
        console.log(difference)
    })
  });
  
  // Describe another test case
  describe('#filter()', function () {
    // Test case 4: It should return an array with filtered values
    it('should return an array with filtered values', function () {
      assert.deepEqual([1, 2, 3, 4, 5].filter(n => n % 2 === 0), [2, 4]);
    });
  });
});