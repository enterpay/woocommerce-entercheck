(function ($) {
	'use strict';

	/**
	 * All of the code for your public-facing JavaScript source
	 * should reside in this file.
	 *
	 * Note: It has been assumed you will write jQuery code here, so the
	 * $ function reference has been prepared for usage within the scope
	 * of this function.
	 *
	 * This enables you to define handlers, for when the DOM is ready:
	 *
	 * $(function() {
	 *
	 * });
	 *
	 * When the window is loaded:
	 *
	 * $( window ).load(function() {
	 *
	 * });
	 *
	 * ...and/or other possibilities.
	 *
	 * Ideally, it is not considered best practise to attach more than a
	 * single DOM-ready or window-load handler for a particular page.
	 * Although scripts in the WordPress core, Plugins and Themes may be
	 * practising this, we should strive to set a better example in our own work.
	 */

	$(document).ready(function () {
		//console.log('ABC');
		$('#billing_company').typeahead({
			source: function (query, result) {
				
				$.ajax({
					url: enterpayjs.ajaxurl,
					data: { action: "call_api", nonce: nonce },
					dataType: "json",
					type: "POST"
				}).done(function (data) {
					console.log("test");
					result($.map(data, function (item) {
						return item;
					}));
				});
			}
		});

		var dataset = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			remote: {
				url: enterpayjs.ajaxurl+'?action=search_company&name=%QUERY',
				wildcard: '%QUERY'
			}
		});

		$('#billing_company').typeahead(null, {
			name: 'company-search',
			display: 'name',
			source: dataset		
		});

		$('#billing_company').bind('typeahead:select', function(ev, suggestion) {
			console.log(suggestion);
			$("#inputBusinessId").val(suggestion.businessId);
			jQuery.ajax({
				type: "post",
				dataType: "json",
				url: enterpayjs.ajaxurl,
				data: { action: "company_detail", bid: suggestion.businessId }
			}).done(function (e) {
				var ids= e.ids;
				ids.forEach(id => {
					if(id.idType == 'VAT') $("#inputVATNumber").val(id.idValue)
				});
				
				var NOP = null;
				var FOP = null;
				var firstStreetAddress = null;
				
				e.addresses.forEach(address => {
					if(address.addressType == "NOP") NOP = address;	
					if(address.addressType == "FOP") FOP = address;
					
					if(!firstStreetAddress && address.street){
						firstStreetAddress = address;
					}
				})

				if(NOP){
					$("#billing_address_1").val(NOP.street);
					$("#billing_city").val(NOP.city);
					$("#billing_postcode").val(NOP.postalCode);
					return true;
				} 

				if(FOP){
					$("#billing_address_1").val(FOP.street);
					$("#billing_city").val(FOP.city);
					$("#billing_postcode").val(FOP.postalCode);
					return true;
				} 

				if(firstStreetAddress){
					$("#billing_address_1").val(firstStreetAddress.street);
					$("#billing_city").val(firstStreetAddress.city);
					$("#billing_postcode").val(firstStreetAddress.postalCode);
					return true;
				} 


			});
		  });
		  
	});

})(jQuery);

