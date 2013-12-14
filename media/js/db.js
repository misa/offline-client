/**
 * @author Bc. Michal Kocián
 */
var silesnet = {};

silesnet.config = {
    db_version : 1,
    db_name : "silesnet",
    url_regions : "../data/regions.json",
    url_products : "../data/products.json",
    url_send_customer : "todo",
    time_cache_regions : 86400,
    time_cache_products : 86400
};

silesnet.indexedDB = {};

silesnet.indexedDB.db = null;
/**
 * Open/init Silesnet indexDB database
 */
silesnet.indexedDB.open = function() {

    // Open database
    var request = indexedDB.open(silesnet.config.db_name, silesnet.config.db_version);

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
        if ($('#region').length == 1) {
            regions.getAllRegions();
        }

        // Init products
        if ($('#product').length == 1) {
            products.getAllProducts();
        }

        // Init customers list
        if ($('.customer-list').length == 1) {
            silesnet.customers.getAllCustomers();
        }

        // Init customer edit
        if ($('.customer-edit').length == 1) {

            if (sessionStorage.getItem('keyCustomer') != null) {
                // Set customer ID to 'data' attribute
                $('#name').attr('data-customer-key', sessionStorage.getItem('keyCustomer'));

                // Init saved customer values
                silesnet.customers.initCustomerForm(sessionStorage.getItem('keyCustomer'));
            } else {
                var d = new Date;
                var dformat = [d.getFullYear(), silesnet.tools.strpad(d.getMonth()+1, 2, '0'), silesnet.tools.strpad(d.getDate(), 2, '0')].join('-');

                // Set default date
                $('#period_from').val(dformat);
            }
        }

        // Init customer detail
        if ($('.customer-detail').length == 1) {
            silesnet.customers.getDetailCustomer(sessionStorage.getItem('keyCustomer'));

            // Set customer ID to 'data' attribute
            $('#name').attr('data-customer-key', sessionStorage.getItem('keyCustomer'));
        }

        // Clean up temporary variable
        sessionStorage.removeItem('keyCustomer');
    };

    request.onerror = function(e) {
        console.log("Database loading error");
    };
};

/**
 * Init select boxes - regions and products
 */
function init_data() {

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
        if (localStorage.timeRegions == null || (parseInt(localStorage.timeRegions) + silesnet.config.time_cache_regions * 1000) < (new Date().getTime())) {

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
        $.getJSON(silesnet.config.url_regions, function() {
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
            selectOption.setAttribute('value', result.value.key);
            selectOption.appendChild(document.createTextNode(result.value.name));

            selectRegion.appendChild(selectOption);

            result.continue();

            $('#region option[value=' + silesnet.region_id +']').prop('selected', true);
        };

        cursorRequest.onerror = silesnet.indexedDB.onerror;
    },
    getRegion: function (id) {

        // Init database
        var db = silesnet.indexedDB.db;
        var trans = db.transaction(["regions"], "readwrite");
        var store = trans.objectStore("regions");

        // Get customer details
        var requestCust = store.get(parseInt(id));

        requestCust.onsuccess = function(e) {
            var result = e.target.result;

            $('#region').html(result.name);
        };
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
        if (localStorage.timeProducts == null || (parseInt(localStorage.timeProducts) + silesnet.config.time_cache_products * 1000) < (new Date().getTime())) {

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
        $.getJSON(silesnet.config.url_products, function() {
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
            selectOption.setAttribute('value', result.value.key);
            selectOption.appendChild(document.createTextNode(result.value.name + ' (' + result.value.download + ' / ' + result.value.upload + ') ' + result.value.price + ' Kč'));

            selectProduct.appendChild(selectOption);

            result.continue();

            $('#product option[value=' + silesnet.product_id +']').prop('selected', true);
        };

        cursorRequest.onerror = silesnet.indexedDB.onerror;
    }
    ,
    getProduct: function (id) {

        // Init database
        var db = silesnet.indexedDB.db;
        var trans = db.transaction(["products"], "readwrite");
        var store = trans.objectStore("products");

        // Get customer details
        var request = store.get(parseInt(id));

        request.onsuccess = function(e) {
            var result = e.target.result;

            $('#product').html(result.name + ' (' + result.download + ' / ' + result.upload + ') ' + result.price + ' Kč');
        };
    }
};

/**
 * Customers object
 */
silesnet.customers = {
    /**
     * Save a new customer to database
     */
    addCustomer : function(data, key) {

        // Init database
        var db = silesnet.indexedDB.db;
        var trans = db.transaction(["customers"], "readwrite");
        var store = trans.objectStore("customers");

        // Put values into database
        var request = store.put({
            "key": (new Date()).getTime(),
            "name": data.name,
            "supplementary_name": data.supplementary_name,
            "public_id": data.public_id,
            "dic": data.dic,
            "contract_no": data.contract_no,
            "email": data.email,
            "street": data.street,
            "city": data.city,
            "postal_code": data.postal_code,
            "country": data.country,
            "contact_name": data.contact_name,
            "phone": data.phone,
            "info": data.info,
            "region": data.region,
            "period_from": data.period_from,
            "product": data.product
        });

        request.onsuccess = function(e) {

            // If there is an old customer record, delete it
            if (key != null) {
                silesnet.customers.delCustomer(key);
            } else {
                window.location = "../index.html";
            }
        };

        request.onerror = function(e) {
            console.log('Error - save Customer');
        };
    },
    getAllCustomers: function() {

        // Init database
        var db = silesnet.indexedDB.db;
        var trans = db.transaction(["customers"], "readwrite");
        var store = trans.objectStore("customers");

        // Get everything in the store;
        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = store.openCursor(keyRange);

        var i = 1;

        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;

            if (result == null)
                return;

            // Append row to table
            $('.customer-list').append("<tr><td class='number'>" + i++ + "</td><td class='name'><a href='./customer/detail.html' data-customer-key='" + result.value.key + "'>" + result.value.name + "</a></td></tr>");

            result.continue();
        };

        cursorRequest.onerror = silesnet.indexedDB.onerror;
    },
    getDetailCustomer: function(key) {

        // Init database
        var db = silesnet.indexedDB.db;
        var trans = db.transaction(["customers"], "readwrite");
        var store = trans.objectStore("customers");

        if (key == null) {
            window.location = "../index.html";
            return;
        }

        // Get customer details
        var requestCust = store.get(parseInt(key));

        requestCust.onsuccess = function(e) {

            var result = e.target.result;

            // Set values on page
            $('#name').html(result.name);
            $('#supplementary_name').html(result.supplementary_name);
            $('#public_id').html(result.public_id);
            $('#dic').html(result.dic);
            $('#contract_no').html(result.contract_no);
            $('#email').html(result.email);
            $('#street').html(result.street);
            $('#city').html(result.city);
            $('#postal_code').html(result.postal_code);
            switch (parseInt(result.country))
            {
                case 1:
                    $('#country').html('Czech republic');
                    break;
                case 2:
                    $('#country').html('Poland');
                    break;
                default:
                    $('#country').html('Czech republic');
            }
            $('#contact_name').html(result.contact_name);
            $('#phone').html(result.phone);
            $('#info').html(result.info);
            $('#period_from').html(result.period_from);
            regions.getRegion(result.region);
            products.getProduct(result.product);
        };

        requestCust.onerror = silesnet.indexedDB.onerror;
    },
    sendCustomer: function(key) {

        // Init database
        var db = silesnet.indexedDB.db;
        var trans = db.transaction(["customers"], "readwrite");
        var store = trans.objectStore("customers");

        if (key == null) {
            window.location = "../index.html";
            return;
        }

        // Get customer details
        var requestCust = store.get(parseInt(key));

        requestCust.onsuccess = function(e) {

            var result = e.target.result;

            var data = {};
            var customer = {};

            // Set values on page
            customer.key = key;
            customer.name = result.name;
            customer.supplementary_name = result.supplementary_name;
            customer.public_id = result.public_id;
            customer.dic = result.dic;
            customer.contract_no = result.contract_no;
            customer.email = result.email;
            customer.street = result.street;
            customer.city = result.city;
            customer.postal_code = parseInt(result.postal_code);
            customer.country = parseInt(result.country);
            customer.contact_name = result.contact_name;
            customer.phone = result.phone;
            customer.info = result.info;
            customer.period_from = result.period_from;
            customer.region = parseInt(result.region);
            customer.product = parseInt(result.product);

            data.customers = [customer];

            // Send customer data to server
            $.ajax({
                type: "POST",
                url: silesnet.config.url_send_customer,
                data: data,
                success: function(data) {

                    // Delete customer from IndexedDb
                    silesnet.customers.delCustomer(data.key);
                },
                dataType: "json"
            }).fail(function() {
                alert("Can not send data!");
            });
        };

        requestCust.onerror = silesnet.indexedDB.onerror;
    },
    initCustomerForm: function(key) {

        // Init database
        var db = silesnet.indexedDB.db;
        var trans = db.transaction(["customers"], "readwrite");
        var store = trans.objectStore("customers");

        // Get customer details
        var requestCust = store.get(parseInt(key));

        requestCust.onsuccess = function(e) {

            var result = e.target.result;

            // Set values on page
            $('#name').val(result.name);
            $('#supplementary_name').val(result.supplementary_name);
            $('#public_id').val(result.public_id);
            $('#dic').val(result.dic);
            $('#contract_no').val(result.contract_no);
            $('#email').val(result.email);
            $('#street').val(result.street);
            $('#city').val(result.city);
            $('#postal_code').val(result.postal_code);
            $('#country option[value=' + result.country +']').prop('selected', true);
            $('#contact_name').val(result.contact_name);
            $('#phone').val(result.phone);
            $('#info').val(result.info);

            $('#period_from').val(result.period_from);
            silesnet.region_id = result.region;
            silesnet.product_id = result.product;
        };

        requestCust.onerror = silesnet.indexedDB.onerror;
    },
    delCustomer: function(key) {

        // Init database
        var db = silesnet.indexedDB.db;
        var trans = db.transaction(["customers"], "readwrite");
        var store = trans.objectStore("customers");

        // Delete customer
        var request = store.delete(parseInt(key));

        request.onsuccess = function(e) {
            window.location = "../index.html";
        };
    }
};

// String pad
silesnet.tools = {};
silesnet.tools.strpad = function(inputString, chars, padSting) {
    result = padSting + inputString;
    remFromLeft = result.length - chars;
    return result.substr(remFromLeft);
};
