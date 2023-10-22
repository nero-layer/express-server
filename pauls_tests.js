import { assert } from 'chai';  // Using Assert style
import { expect } from 'chai';  // Using Expect style
import { should } from 'chai';  // Using Should style

import { ethers } from "ethers";
import {validate_faucet_request} from "./pauls_functions.js"
import {check_address_balance} from "./pauls_functions.js"
import {create_faucet_transaction} from "./pauls_functions.js"

import sinon from 'sinon';

import sqlite from 'better-sqlite3';

const db_cursor = new sqlite.Database(':memory:');

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

    // Import the function to test

    // Mock the database cursor
    beforeEach((done) => {
        // Create the required tables in memory database
        db_cursor.exec(`
        CREATE TABLE IF NOT EXISTS faucet_requests_t (
            request_eth_address TEXT,
            transaction_sent INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS transactions_in_progress_t (
            faucet_request_id INTEGER,
            hot_wallet_address TEXT,
            to_wallet_address TEXT,
            tx_hash TEXT,
            gas_price TEXT
        );
        `, done);
    });

    afterEach((done) => {
        // Clear the tables after each test
        db_cursor.exec(`
            DELETE FROM faucet_requests_t;
            DELETE FROM transactions_in_progress_t;
        `, done);
    });

    it('should update faucet_requests_t and insert into transactions_in_progress_t when hot_wallet_balance is greater than 1', async () => {
        // Stub the check_address_balance function
        const check_address_balanceStub = sinon.stub().resolves(2);
        const originalCheckBalance = global.check_address_balance;
        global.check_address_balance = check_address_balanceStub;

        // Stub the ethers.Wallet.sendTransaction method
        const walletStub = sinon.stub();
        walletStub.sendTransaction = sinon.stub().resolves({ hash: '0xabcdef' });
        const ethersStub = {
        providers: { JsonRpcProvider: sinon.stub().returns({}) },
        Wallet: sinon.stub().returns(walletStub),
        utils: { parseEther: sinon.stub().returns(0.1), parseUnits: sinon.stub().returns('100000000') }
        };
        const originalEthers = global.ethers;
        global.ethers = ethersStub;

        // Set the process.env values
        process.env.RPC_URL = 'https://example.com';
        process.env.HOT_WALLET_ADDRESS = '0x123456789';
        process.env.HOT_WALLET_PRIVATE_KEY = 'abcdef';

        // Define the request object
        const requestObj = {
            request_eth_address: '0x987654321'
        };

        // Call the function
        await create_faucet_transaction(db_cursor, requestObj);

        // Verify that the functions were called with the correct values
        check_address_balanceStub.calledOnce.should.be.true;
        check_address_balanceStub.calledWith(process.env.RPC_URL, process.env.HOT_WALLET_ADDRESS).should.be.true;
        ethersStub.providers.JsonRpcProvider.calledWith(process.env.RPC_URL).should.be.true;
        ethersStub.Wallet.calledWith(process.env.HOT_WALLET_PRIVATE_KEY, {}).should.be.true;
        ethersStub.utils.parseEther.calledWith('0.1').should.be.true;
        walletStub.sendTransaction.calledOnce.should.be.true;

        // Verify that the database tables were updated correctly
        db_cursor.get('SELECT transaction_sent FROM faucet_requests_t WHERE request_eth_address = ?', [requestObj.request_eth_address], (_, row) => {
        row.transaction_sent.should.equal(1);
        });
        db_cursor.get('SELECT * FROM transactions_in_progress_t WHERE faucet_request_id = ?', [faucet_request_id], (_, row) => {
        row.hot_wallet_address.should.equal(process.env.HOT_WALLET_ADDRESS);
        row.to_wallet_address.should.equal(requestObj.request_eth_address);
        row.tx_hash.should.equal('0xabcdef');
        row.gas_price.should.equal('100000000');
        });

        // Restore the original values
        global.check_address_balance = originalCheckBalance;
        global.ethers = originalEthers;
    });

    it('should not update any database tables when hot_wallet_balance is less than or equal to 1', async () => {
        // Stub the check_address_balance function
        const check_address_balanceStub = sinon.stub().resolves(1);
        const originalCheckBalance = global.check_address_balance;
        global.check_address_balance = check_address_balanceStub;

        // Define the request object
        const requestObj = {
        request_eth_address: '0x987654321'
        };

        // Call the function
        const result = await create_faucet_transaction(db_cursor, requestObj);

        // Verify that the function returns false
        result.should.be.false;

        // Verify that the functions were called with the correct values
        check_address_balanceStub.calledOnce.should.be.true;
        check_address_balanceStub.calledWith(process.env.RPC_URL, process.env.HOT_WALLET_ADDRESS).should.be.true;

        // Verify that the database tables were not updated
        db_cursor.get('SELECT transaction_sent FROM faucet_requests_t WHERE request_eth_address = ?', [requestObj.request_eth_address], (_, row) => {
        should.not.exist(row);
        });
        db_cursor.get('SELECT * FROM transactions_in_progress_t', (_, row) => {
        should.not.exist(row);
        });

        // Restore the original values
        global.check_address_balance = originalCheckBalance;
    });

    // Add more test cases as needed
  });


  
  // Describe another test case
  describe('#filter()', function () {
    // Test case 4: It should return an array with filtered values
    it('should return an array with filtered values', function () {
      assert.deepEqual([1, 2, 3, 4, 5].filter(n => n % 2 === 0), [2, 4]);
    });
  });
});