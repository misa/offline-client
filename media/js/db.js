/**
 * @author Bc. Michal Kocián
 */
var silesnet = {};
silesnet.indexedDB = {};

silesnet.indexedDB.db = null;
/**
 * Open/init Silesnet indexDB database
 */
silesnet.indexedDB.open = function() {

    var version = 1;
    var dbName = "silesnet";

    // Open database
    var request = indexedDB.open(dbName, version);

    // We can only create Object stores in a versionchange transaction
    request.onupgradeneeded = function(e) {

        var db = e.target.result;

        // A versionchange transaction is started automatically
        e.target.transaction.onerror = silesnet.indexedDB.onerror;

        // Delete object store Regions if exists
        if (db.objectStoreNames.contains("regions")) {
            db.deleteObjectStore("regions");
        }

        // Delete object store Products if exists
        if (db.objectStoreNames.contains("products")) {
            db.deleteObjectStore("products");
        }

        // Delete object store Customers if exists
        if (db.objectStoreNames.contains("customers")) {
            db.deleteObjectStore("customers");
        }

        // Create new object store Regions
        var storeRegions = db.createObjectStore("regions",
                {keyPath: "key"});

        // Create new object store Regions
        var storeProducts = db.createObjectStore("products",
                {keyPath: "key"});

        // Create new object store Customers
        var storeCustomers = db.createObjectStore("customers",
                {keyPath: "key"});
    };

    request.onsuccess = function(e) {

        // Set opened database pointer
        silesnet.indexedDB.db = e.target.result;

        // Check Regions for new data
        if (regions.checkTimestam()) {

            regions.loadData();
        }

        // Check Products for new data
        if (products.checkTimestam()) {
            products.loadData();
        }

        // Init regions
        regions.getAllRegions();

        // Init products
        products.getAllProducts();
    };

    request.onerror = function(e) {
        console.log("Database loading error");
    };
};

/**
 * Init select boxes - regions and products
 */
function init_selects() {

    // Open indexDB database
    silesnet.indexedDB.open();
}

/**
 * Regions object
 */
var regions = {
    /**
     * Check timestamp date
     *
     * @returns boolean True timestamp outdated, False timestamp OK
     */
    checkTimestam: function() {

        // Compare saved timestamp
        if (localStorage.timeRegions == null || (parseInt(localStorage.timeRegions) + 86400 * 1000) < (new Date().getTime())) {

            // Timestamp outdated
            return true;
        }

        // Timestamp OK
        return false;
    },
    /**
     * Load "regions.json"
     */
    loadData: function() {

        // Load JSON data
        $.getJSON("/data/regions.json", function() {
        })
                .done(function(data) {

                    $.each(data.regions, function(i, item) {

                        regions.addRegion(item.id, item.name);
                    });

                    // Save new Regions timestamp
                    localStorage.timeRegions = new Date().getTime();
                })
                .fail(function() {
                    console.log("Region json load error");
                });
    },
    addRegion: function(region_id, region_name) {

        // Init Regions
        var db = silesnet.indexedDB.db;
        var trans = db.transaction(["regions"], "readwrite");
        var store = trans.objectStore("regions");

        // Put values into database
        var request = store.put({
            "key": region_id,
            "name": region_name
        });

        request.onsuccess = function(e) {
        };

        request.onerror = function(e) {
            console.log('Error - save Region');
        };
    },
    getAllRegions: function() {

        // Init database
        var db = silesnet.indexedDB.db;
        var trans = db.transaction(["regions"], "readwrite");
        var store = trans.objectStore("regions");

        // Get everything in the store;
        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = store.openCursor(keyRange);

        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;

            if (result == null)
                return;

            var selectRegion = document.getElementById('region');
            var selectOption = document.createElement("option");
            selectOption.setAttribute('id', result.value.key);
            selectOption.appendChild(document.createTextNode(result.value.name));

            selectRegion.appendChild(selectOption);

            result.continue();
        };

        cursorRequest.onerror = silesnet.indexedDB.onerror;
    }
};

/**
 * Regions object
 */
var products = {
    /**
     * Check timestamp date
     *
     * @returns boolean True timestamp outdated, False timestamp OK
     */
    checkTimestam: function() {

        // Compare saved timestamp
        if (localStorage.timeProducts == null || (parseInt(localStorage.timeProducts) + 86400 * 1000) < (new Date().getTime())) {

            // Timestamp outdated
            return true;
        }

        // Timestamp OK
        return false;
    },
    /**
     * Load "products.json"
     */
    loadData: function() {

        // Load JSON data
        $.getJSON("/data/products.json", function() {
        })
                .done(function(data) {

                    $.each(data.products, function(i, item) {
                        // Add product to indexedDB
                        products.addProduct(item.id, item.name, item.download, item.upload, item.price);
                    });

                    // Save new Products timestamp
                    localStorage.timeProducts = new Date().getTime();
                })
                .fail(function() {
                    console.log("Product json load error");
                });
    },
    addProduct: function(product_id, product_name, product_download, product_upload, product_price) {

        // Init database
        var db = silesnet.indexedDB.db;
        var trans = db.transaction(["products"], "readwrite");
        var store = trans.objectStore("products");

        // Put values into database
        var request = store.put({
            "key": product_id,
            "name": product_name,
            "download": product_download,
            "upload": product_upload,
            "price": product_price
        });

        request.onsuccess = function(e) {
        };

        request.onerror = function(e) {
            console.log('Error - save Product');
        };
    },
    getAllProducts: function() {

        var db = silesnet.indexedDB.db;
        var trans = db.transaction(["products"], "readwrite");
        var store = trans.objectStore("products");

        // Get everything in the store;
        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = store.openCursor(keyRange);

        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;

            if (result == null)
                return;

            // Append Options to Select
            var selectProduct = document.getElementById('product');
            var selectOption = document.createElement("option");
            selectOption.setAttribute('id', result.value.key);
            selectOption.appendChild(document.createTextNode(result.value.name + ' (' + result.value.download + ' / ' + result.value.upload + ') ' + result.value.price + ' Kč'));

            selectProduct.appendChild(selectOption);

            result.continue();
        };

        cursorRequest.onerror = silesnet.indexedDB.onerror;
    }
};
