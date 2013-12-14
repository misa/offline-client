/**
 * @author Bc. Michal Kocián
 */
$(document).ready(function() {

    // Init lists / selects / database
    init_data();

    $("form#customer").on("submit", function(event) {

        // Prevent form submit
        event.preventDefault();

        // Input/select list
        var items = ["name", "supplementary_name", "public_id", "dic", "contract_no", "email", "street", "city", "postal_code", "country", "contact_name", "phone", "info", "region", "period_from", "product"];

        var data = {};

        // Collect data
        items.forEach(function(entry) {

            if ($.inArray(entry, ["period_from"]) > -1) {

                data[entry] = $('#period_from').val();
            } else if ($.inArray(entry, ["country", "region", "product"]) > -1) {

                data[entry] = $('#' + entry + ' option:selected').attr('value');
            } else {

                data[entry] = $('#' + entry).val();
            }
        });

        // Customer key, if exists
        var key = $('[data-customer-key]').attr('data-customer-key');

        // Add a customer
        silesnet.customers.addCustomer(data, key);
    });

    $('.btn-customer-delete').on('click', function(event) {
        silesnet.customers.delCustomer($('[data-customer-key]').attr('data-customer-key'));

        // Prevent default action
        event.preventDefault();
    });

    $('.btn-customer-edit').on('click', function(event) {
        // Save customer key to session storage
        sessionStorage.setItem('keyCustomer', $('[data-customer-key]').attr('data-customer-key'));
    });

    /**
     * Passing customer id to next page
     */
    $(document).on('click', '.customer-list tr', function(event) {

        // Save customer key to session storage
        sessionStorage.setItem('keyCustomer', $(this).find('a[data-customer-key]').attr('data-customer-key'));
    });
});
