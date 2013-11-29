/**
 * @author Bc. Michal Kocián
 */
$(document).ready(function() {

    // Check for Product and Region selects
    if ($('#region').length == 1 && $('#product').length == 1) {

        // Init select values
        init_selects();
    }
});
