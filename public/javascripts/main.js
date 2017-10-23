$(function () {
	$('input[name=button]').click(function(){
		var obj = []
		$("[id^='quantity_']").each(function(){
			var $select = $(this);

			var $tr = $select.parents('tr');

			var id = $select.attr('id');
			id = id.split("_");
			id = id[1];		

			var xquantityselect = $tr.children("#xquantity").children("#xquantity_"+id);

			if ($select.val() > 0 || xquantityselect.val()>0) {
								
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
					
					var selectedq = $select[0].value;
					var originalq = $originalq[i].innerText;
					var shippedq = $shippedq[i].innerText;
					var cancelledq = $cancelledq[i].innerText;
					var xquantity = $xquantities[i].value;
						
					selectedq = isNaN (parseInt(selectedq)) ? 0 : parseInt(selectedq);
					originalq = isNaN (parseInt(originalq)) ? 0 : parseInt(originalq);
					shippedq =  isNaN (parseInt(shippedq))  ? 0 : parseInt(shippedq);

					xquantity =  isNaN (parseInt(xquantity))  ? 0 : parseInt(xquantity);
					cancelledq =  isNaN (parseInt(cancelledq))  ? 0 : parseInt(cancelledq);


					if ((selectedq+shippedq) < originalq ){
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

				if($select.val() > 0){

					/*item = {"storeid":$tr.children('#storeid').text(), 
						"ordersid":$tr.children('#ordersid').text(),
						"ordersstatus":ostatus,
						"orderitemsid":$tr.children('#orderitemsid').text(),
						"orderitemsstatus":"S",
						"skupartnum":$tr.children('#skupartnum').text(),
						"parentpartnum":$tr.children('#parentpartnum').text(),
						"quantity":$select.val()}*/

					item = prepareItem($tr, ostatus, 'S', $select);
			        obj.push(JSON.stringify(item));

			        if($tr.children('#dropship')[0].children[0].checked){
					
						/*
						item = {"storeid":$tr.children('#storeid').text(), 
							"ordersid":$tr.children('#ordersid').text(),
							"ordersstatus":ostatus,
							"orderitemsid":$tr.children('#orderitemsid').text(),
							"orderitemsstatus":"D",
							"skupartnum":$tr.children('#skupartnum').text(),
							"parentpartnum":$tr.children('#parentpartnum').text(),
							"quantity":$select.val()}
						*/
			      		
			      		item = prepareItem($tr, ostatus, 'D', $select);
			      		obj.push(JSON.stringify(item));
					}
				}

				if(xquantityselect.val()>0){
					/*
					item = {"storeid":$tr.children('#storeid').text(), 
						"ordersid":$tr.children('#ordersid').text(),
						"ordersstatus":ostatus,
						"orderitemsid":$tr.children('#orderitemsid').text(),
						"orderitemsstatus":"X",
						"skupartnum":$tr.children('#skupartnum').text(),
						"parentpartnum":$tr.children('#parentpartnum').text(),
						"quantity":xquantityselect.val()}*/
					item = prepareItem($tr, ostatus, 'X', xquantityselect);
			        obj.push(JSON.stringify(item));
				}
				
			}
		});

		
		var selectedItems = {"selectedItems":JSON.stringify(obj)};

		$.post( "/shiporders", selectedItems, function(data){
			postsuccesshandler(data,'button')
		});

	});

	$('input[name=returnItems]').click(function(){
		var obj = []
		$('select').each(function(){
			var $select = $(this);
			if ($select.val() > 0) {
				var $tr = $select.parents('tr');

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

		$.post( "/returnItems", selectedItems, function(data){
			postsuccesshandler(data,'returnItems')
		});

	});

	$( "[id^='xquantity_']" ).change(function(){
		adjustqty('xquantity','quantity', $(this))
	});


	$( "[id^='quantity_']" ).change(function(){
		adjustqty('quantity','xquantity', $(this))
	});

	function adjustqty(changed, impacted, select){
		var originalq, shippedq, cancelledq, quantityselect;
		var $tr = select.parents('tr');
		var id = select.attr('id');
		id = id.split("_");
		id = id[1];		
		var quantityselect = $tr.children("#"+impacted).children("#"+impacted+"_"+id);
		var quantityselectVal = quantityselect.val();

		originalq = $tr.children( "#originalq_"+id );		
		shippedq = $tr.children("#shippedq_"+id );
		cancelledq = $tr.children("#cancelledq_"+id );

		var newval = originalq.text() - shippedq.text() - cancelledq.text() - select.val();
		var quantityselectlen =  quantityselect.children().length;
		var loopCount = select.val();
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

	};

	function postsuccesshandler(data,name){
		var responseJSON = JSON.parse(data);
		$("#successmessage").html('CSV file transferred to FTP server. Click <a href="'+responseJSON.filepath+'"> here </a> to download. Click <a href="javascript:window.location.reload()">here</a> to refresh');
		$('input[name='+name+']').hide();
	}

	function prepareItem(tr, ostatus, oiStatus, select){
		item = {"storeid":tr.children('#storeid').text(), 
						"ordersid":tr.children('#ordersid').text(),
						"ordersstatus":ostatus,
						"orderitemsid":tr.children('#orderitemsid').text(),
						"orderitemsstatus":oiStatus,
						"skupartnum":tr.children('#skupartnum').text(),
						"parentpartnum":tr.children('#parentpartnum').text(),
						"quantity":select.val()}
		return item;

	}

});