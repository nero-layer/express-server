import sqlite from 'better-sqlite3';

async function get_list_all_tables(db_cursor){
    const query = "SELECT name FROM sqlite_master WHERE type='table';";
    const tables = db_cursor.prepare(query).all();
    const tableNames = tables.map(table => table.name);
    return tableNames
}

async function main(){
    const db = new sqlite("./dev.db");
    await db.exec(`
        CREATE TABLE IF NOT EXISTS faucet_requests_t (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email  TEXT,
            request_eth_address TEXT,
            valid_request BOOLEAN,
            user_validation_token TEXT,
            transaction_sent BOOLEAN,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS transactions_in_progress_t (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            faucet_request_id INTEGER,
            hot_wallet_address TEXT,
            to_wallet_address TEXT,
            tx_hash TEXT,
            gas_price INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (faucet_request_id) REFERENCES faucet_requests_t(id)
        );
        
        CREATE TABLE IF NOT EXISTS transactions_confirmed_t (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            faucet_request_id INTEGER,
            hot_wallet_address TEXT,
            to_wallet_address TEXT,
            tx_hash TEXT,
            gas_price INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            -- Additional Metadata
            block_num INTEGER,
            FOREIGN KEY (faucet_request_id) REFERENCES faucet_requests_t(id)
        )
    `)
    let list_sql_tables = await get_list_all_tables(db)
    console.log(list_sql_tables)
    db.close();
}

main()