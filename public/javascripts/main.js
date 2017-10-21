$(function () {
	$('input[name=button]').click(function(){
		var obj = []
		$("[id^='quantity_']").each(function(){
			var $select = $(this);

			var $tr = $select.parents('tr');

			var id = $select.attr('id');
			id = id.split("_");
			id = id[1];		
			//var xquantityselect = $( "#xquantity_"+id );

			var xquantityselect = $tr.children("#xquantity").children("#xquantity_"+id);

			if ($select.val() > 0 || xquantityselect.val()>0) {
				
				
				//console.log($tr.children('#storeid').text());
				
				var $quantities = $('[id^=quantity_' + $tr.children('#ordersid').text() + ']');
				var $originalq = $('[id^=originalq_' + $tr.children('#ordersid').text() + ']');
				var $shippedq = $('[id^=shippedq_' + $tr.children('#ordersid').text() + ']');
				var $xquantities = $('[id^=xquantity_' + $tr.children('#ordersid').text() + ']');
				var $cancelledq = $('[id^=cancelledq_' + $tr.children('#ordersid').text() + ']');


				var i=0
				var ostatus = 'S';
				var isfullycanceled = true;
				
				$quantities.each(function(){
					var $select = $(this);
					//console.log($select[0].value);
					//console.log($originalq[i].innerText);
					
					var selectedq = $select[0].value;
					var originalq = $originalq[i].innerText;
					var shippedq = $shippedq[i].innerText;
					var cancelledq = $cancelledq[i].innerText;
					var xquantity = $xquantities[i].value;

					/*
					selectedq = parseInt (isNaN(selectedq) ? 0 : selectedq) ;
					originalq = parseInt (isNaN(originalq) ? 0 : originalq) ;
					shippedq = parseInt (isNaN(shippedq) ? 0 : shippedq) ;
					*/
						
					selectedq = isNaN (parseInt(selectedq)) ? 0 : parseInt(selectedq);
					originalq = isNaN (parseInt(originalq)) ? 0 : parseInt(originalq);
					shippedq =  isNaN (parseInt(shippedq))  ? 0 : parseInt(shippedq);

					xquantity =  isNaN (parseInt(xquantity))  ? 0 : parseInt(xquantity);
					cancelledq =  isNaN (parseInt(cancelledq))  ? 0 : parseInt(cancelledq);


					if ((selectedq+shippedq) < originalq ){
						//console.log('partial');
						ostatus = 'SP'
					}

					if(((xquantity+cancelledq) == originalq) && isfullycanceled ){
						isfullycanceled = true;
					}else{
						isfullycanceled = false;
					}

					i++;
				});

				if(isfullycanceled){
					ostatus = 'XX';
				}

				//console.log($tr.children('#dropship')[0].children[0].checked)
				if($select.val() > 0){
					item = {"storeid":$tr.children('#storeid').text(), 
						"ordersid":$tr.children('#ordersid').text(),
						"ordersstatus":ostatus,
						"orderitemsid":$tr.children('#orderitemsid').text(),
						"orderitemsstatus":"S",
						"skupartnum":$tr.children('#skupartnum').text(),
						"parentpartnum":$tr.children('#parentpartnum').text(),
						"quantity":$select.val()}
			        obj.push(JSON.stringify(item));

			        if($tr.children('#dropship')[0].children[0].checked){
					
						item = {"storeid":$tr.children('#storeid').text(), 
							"ordersid":$tr.children('#ordersid').text(),
							"ordersstatus":ostatus,
							"orderitemsid":$tr.children('#orderitemsid').text(),
							"orderitemsstatus":"D",
							"skupartnum":$tr.children('#skupartnum').text(),
							"parentpartnum":$tr.children('#parentpartnum').text(),
							"quantity":$select.val()}
			      		
			      		obj.push(JSON.stringify(item));
					}
				}

				if(xquantityselect.val()>0){
					item = {"storeid":$tr.children('#storeid').text(), 
						"ordersid":$tr.children('#ordersid').text(),
						"ordersstatus":ostatus,
						"orderitemsid":$tr.children('#orderitemsid').text(),
						"orderitemsstatus":"X",
						"skupartnum":$tr.children('#skupartnum').text(),
						"parentpartnum":$tr.children('#parentpartnum').text(),
						"quantity":xquantityselect.val()}
			        obj.push(JSON.stringify(item));
				}
				


			}
		});

		
		var selectedItems = {"selectedItems":JSON.stringify(obj)};

		console.log(selectedItems);

		$.post( "/shiporders", selectedItems, function(data){
			var responseJSON = JSON.parse(data);
			$("#successmessage").html('CSV file transferred to FTP server. Click <a href="'+responseJSON.filepath+'"> here </a> to download. Click <a href="javascript:window.location.reload()">here</a> to refresh');
			$('input[name=button]').hide();
		});

	});

	$('input[name=returnItems]').click(function(){
		var obj = []
		$('select').each(function(){
			var $select = $(this);
			if ($select.val() > 0) {
				var $tr = $select.parents('tr');
//				console.log($select.val()+','+$tr.children('#storeid').text());

				item = {"storeid":$tr.children('#storeid').text(), 
					"ordersid":$tr.children('#ordersid').text(),
					"ordersstatus":$tr.children('#ordersstatus').text(),
					"orderitemsid":$tr.children('#orderitemsid').text(),
					"skupartnum":$tr.children('#skupartnum').text(),
					"quantity":$select.val()}
		        
		        obj.push(JSON.stringify(item));

			}
		});

		var selectedItems = {"selectedItems":JSON.stringify(obj)};
		console.log(selectedItems);
		$.post( "/returnItems", selectedItems, function(data){
			var responseJSON = JSON.parse(data);
			$("#successmessage").html('CSV file transferred to FTP server. Click <a href="'+responseJSON.filepath+'"> here </a> to download. Click <a href="javascript:window.location.reload()">here</a> to refresh');
			$('input[name=returnItems]').hide();
		});

	});

	/*
	$('#shipform').submit(function( event ) {
		return true;
	});*/

	$( "[id^='xquantity_']" ).change(function(){
		var $select = $(this);		
		var originalq, shippedq, cancelledq, quantityselect;
		//var id = $select.attr('id');
		//id = id.split("_");
		//id = id[1];		
		//quantityselect = $( "#quantity_"+id );

		var $tr = $select.parents('tr');
		var id = $select.attr('id');
		id = id.split("_");
		id = id[1];		
		var quantityselect = $tr.children("#quantity").children("#quantity_"+id);
		
		var quantityselectVal = quantityselect.val();



		originalq = $( "#originalq_"+id );
		shippedq = $( "#shippedq_"+id );
		cancelledq = $( "#cancelledq_"+id );
		var newval = originalq.text() - shippedq.text() - cancelledq.text() - $select.val();
		var quantityselectlen =  quantityselect.children().length;
		var loopCount = $select.val();
		for (var i = quantityselectlen-1; i>= 1; i--) {
			quantityselect.children()[i].remove();
		}
		for (var i = 1; i<= newval; i++) {
			quantityselect.append($("<option></option>")
                    .attr("value",i)
                    .text(i)); 

			if(i<=quantityselectVal){
				quantityselect.val(i);
			}
		}
	});


	$( "[id^='quantity_']" ).change(function(){
		var $select = $(this);		
		var originalq, shippedq, cancelledq, quantityselect;

		/*
		var id = $select.attr('id');
		id = id.split("_");
		id = id[1];		
		quantityselect = $( "#xquantity_"+id );
		*/

		var $tr = $select.parents('tr');
		var id = $select.attr('id');
		id = id.split("_");
		id = id[1];		
		var quantityselect = $tr.children("#xquantity").children("#xquantity_"+id);


		var quantityselectVal = quantityselect.val();


		originalq = $( "#originalq_"+id );
		shippedq = $( "#shippedq_"+id );
		cancelledq = $( "#cancelledq_"+id );
		var newval = originalq.text() - shippedq.text() - cancelledq.text() - $select.val();
		var quantityselectlen =  quantityselect.children().length;
		var loopCount = $select.val();
		for (var i = quantityselectlen-1; i>= 1; i--) {
			quantityselect.children()[i].remove();
		}
		for (var i = 1; i<= newval; i++) {
			quantityselect.append($("<option></option>")
                    .attr("value",i)
                    .text(i)); 

			if(i<=quantityselectVal){
				quantityselect.val(i);
			}
		}
	});

});