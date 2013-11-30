/**
 * @author Bc. Michal Kocián
 */
$(document).ready(function() {

    // Check for Product and Region selects
    if ($('#region').length == 1 && $('#product').length == 1) {

        // Init select values
        init_selects();
    }

    $("form#customer").on("submit", function(event) {

        // Input/select list
        var items = ["name", "supplementary_name", "public_id", "dic", "contract_no", "email", "street", "city", "postal_code", "country", "contact_name", "phone", "info", "region", "period_from", "product"];

        var data = {};

        // Collect data
        items.forEach(function(entry) {

            if ($.inArray(entry, ["country", "region", "product"]) > -1) {

                data[entry] = $('#' + entry + ' option:selected').attr('value');
            } else {

                data[entry] = $('#' + entry).val();
            }
        });

        // Add a customer
        silesnet.customers.addCustomer(data);

        return '\index.html';
    });

});
