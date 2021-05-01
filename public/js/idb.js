// creates variable to hold database connection
let db;

// creates a connection to an IndexedDB database called 'budget_wise' and sets it to version 1 
const request = indexedDB.open('budget_wise', 1);

// an event that runs when database version changes
request.onupgradeneeded = function(event) {
    // saves a reference to the database
    const db = event.target.result;

    // creates an object store (like a table) and calls it 'new_funds_transaction.' This table is then given an autoincremeting primary key
    db.createObjectStore('new_funds_transaction', { autoIncrement: true });
};

// runs after connection to database is finalized
request.onsuccess = function(event) {
    // when object store is created from the 'onupgradeneeded' event, this saves a reference to the global db variable
    db = event.target.result;

    // checks if app has come online and if so, runs uploadTransaction function that will send data to api
    if (navigator.onLine) {
        uploadTransaction();
    }
};

// runs if connection to database fails
request.onerror = function(event) {
    // error is logged
    console.log(event.target.errorCode);
};

// function runs when trying to submit a transaction, but there is no network connection
function saveRecord(record) {
    // opens a transaction with database to read and write 
    const transaction = db.transaction(['new_funds_transaction'], 'readwrite');

    // access the object store for 'new_funds_transaction'
    const transactionObjectStore = transaction.objectStore('new_funds_transaction');

    // add record to store with add method
    transactionObjectStore.add(record);
};

function uploadTransaction() {
    // opens a transaction with database to read and write 
    const transaction = db.transaction(['new_funds_transaction'], 'readwrite');

    // access the object store for 'new_funds_transaction'
    const transactionObjectStore = transaction.objectStore('new_funds_transaction');

    // get all records from object store
    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function() {
        // if data is stored, send it to api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*', 'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                // opens a transaction with database to read and write 
                const transaction = db.transaction(['new_funds_transaction'], 'readwrite');

                // access the object store for 'new_funds_transaction'
                const transactionObjectStore = transaction.objectStore('new_funds_transaction');

                // clears all records
                transactionObjectStore.clear();

                alert('All transactions have been submitted');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', uploadTransaction);