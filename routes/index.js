var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Process Orders App', links:[{link:'/listorderitems', title:'Ship / Cancel order items'},{link:'/listshippeditems', title:'Return order items'}] });
});


router.get('/listorderitems', function(req, res, next) {

  var ibmdb = require('ibm_db');
  var config = require('./config');

  ibmdb.open(config.db, function (err,conn) {
		if (err) console.log(err);
		conn.query("SELECT ORDERS.STOREENT_ID AS STOREENT_ID, ORDERS.ORDERS_ID AS ORDERS_ID, ORDERS.STATUS AS ORDERS_STATUS, ORDERITEMS.ORDERITEMS_ID AS ORDERITEMS_ID, ORDERITEMS.QUANTITY AS QUANTITY, ORDERITEMS.STATUS AS ORDERITEMS_STATUS, CATENTRY.PARTNUMBER AS SKU_PARTNUMBER, PC.PARTNUMBER AS PARENT_PARTNUMBER, SUM(XOIS.QUANTITY) as SHIPPED_QUANTITY FROM ORDERS JOIN ORDERITEMS on orders.ORDERS_ID = orderitems.ORDERS_ID JOIN CATENTRY ON CATENTRY.CATENTRY_ID = ORDERITEMS.CATENTRY_ID JOIN CATENTREL ON CATENTRY.CATENTRY_ID = CATENTREL.CATENTRY_ID_CHILD JOIN CATENTRY PC ON PC.CATENTRY_ID = CATENTREL.CATENTRY_ID_PARENT LEFT JOIN XORDERITEMS XOIS on XOIS.ORDERITEMS_ID = ORDERITEMS.ORDERITEMS_ID and XOIS.STATUS = 'S' WHERE orders.FIELD3=1 AND orders.STATUS IN ('M', 'SP') AND TIMEPLACED > (current date - 7 DAYS) GROUP BY ORDERS.STOREENT_ID,ORDERS.ORDERS_ID,ORDERS.STATUS,ORDERITEMS.ORDERITEMS_ID,ORDERITEMS.QUANTITY,ORDERITEMS.STATUS,CATENTRY.PARTNUMBER,PC.PARTNUMBER ORDER BY ORDERS_ID DESC WITH UR", function (err, data) {
    		if (err) console.log(err);
   			 else{

				conn.query("SELECT  XOIR.ORDERITEMS_ID AS ORDERITEMS_ID, SUM(XOIR.QUANTITY) AS CANCELLED_QUANTITY  FROM XORDERITEMS XOIR JOIN ORDERS ON XOIR.ORDERS_ID = ORDERS.ORDERS_ID WHERE ORDERS.FIELD3=1 AND ORDERS.STATUS IN ('XX', 'SP') AND TIMEPLACED > (CURRENT DATE - 7 DAYS) and XOIR.STATUS = 'X' GROUP BY XOIR.ORDERITEMS_ID WITH UR;", function (err, cancelData) {
					if (err) console.log(err);
					else{
						var orderid = "";
						var flag = "light";

						for (var i = data.length - 1; i >= 0; i--) {
   			 				
   			 				data[i].CANCELLED_QUANTITY = 0;
   			 				for (var j = cancelData.length - 1; j >= 0; j--) {
   			 					if(cancelData[j].ORDERITEMS_ID == data[i].ORDERITEMS_ID){
   			 						data[i].CANCELLED_QUANTITY = cancelData[j].CANCELLED_QUANTITY;
   			 					}
   			 				}

   			 				if(data[i].SHIPPED_QUANTITY == null){
   			 					data[i].SHIPPED_QUANTITY = 0;
   			 				}

   			 				if(orderid != data[i].ORDERS_ID){
   			 					if(flag=="light"){
   			 						flag="dark";
   			 					}else{
   			 						flag = "light";
   			 					}
   			 				}

   			 				orderid = data[i].ORDERS_ID;
   			 				data[i].ROW_COLOR=flag;

   			 			}
   			 			res.render('listorderitems', { orderitems: data });
					}
				});
   			 } 

			conn.close(function () {
   			//	console.log('closed the connection');
    		});
		});

	});
  
  //res.render('index', { data: 'Express' });
});



router.get('/listshippeditems', function(req, res, next) {

  var ibmdb = require('ibm_db');
  var config = require('./config');


  ibmdb.open(config.db, function (err,conn) {
		if (err) console.log(err);
		conn.query("SELECT ORDERS.STOREENT_ID AS STOREENT_ID, ORDERS.ORDERS_ID AS ORDERS_ID, ORDERS.STATUS AS ORDERS_STATUS, ORDERITEMS.ORDERITEMS_ID AS ORDERITEMS_ID, ORDERITEMS.QUANTITY AS QUANTITY, ORDERITEMS.STATUS AS ORDERITEMS_STATUS, CATENTRY.PARTNUMBER AS SKU_PARTNUMBER, PC.PARTNUMBER AS PARENT_PARTNUMBER, SUM(XOIS.QUANTITY) as SHIPPED_QUANTITY FROM ORDERS JOIN ORDERITEMS on orders.ORDERS_ID = orderitems.ORDERS_ID JOIN CATENTRY ON CATENTRY.CATENTRY_ID = ORDERITEMS.CATENTRY_ID JOIN CATENTREL ON CATENTRY.CATENTRY_ID = CATENTREL.CATENTRY_ID_CHILD JOIN CATENTRY PC ON PC.CATENTRY_ID = CATENTREL.CATENTRY_ID_PARENT JOIN XORDERITEMS XOIS on XOIS.ORDERITEMS_ID = ORDERITEMS.ORDERITEMS_ID and XOIS.STATUS = 'S' WHERE orders.FIELD3=1 AND orders.STATUS IN ('S', 'SP') AND TIMEPLACED > (current date - 7 DAYS) GROUP BY ORDERS.STOREENT_ID,ORDERS.ORDERS_ID,ORDERS.STATUS,ORDERITEMS.ORDERITEMS_ID,ORDERITEMS.QUANTITY,ORDERITEMS.STATUS,CATENTRY.PARTNUMBER,PC.PARTNUMBER ORDER BY ORDERS_ID DESC WITH UR", function (err, shipData) {
    		if (err) console.log(err);
   			 else{

   				conn.query("SELECT  XOIR.ORDERITEMS_ID AS ORDERITEMS_ID, SUM(XOIR.QUANTITY) AS RETURNED_QUANTITY  FROM XORDERITEMS XOIR JOIN ORDERS ON XOIR.ORDERS_ID = ORDERS.ORDERS_ID WHERE ORDERS.FIELD3=1 AND ORDERS.STATUS IN ('S', 'SP') AND TIMEPLACED > (CURRENT DATE - 7 DAYS) and XOIR.STATUS = 'U' GROUP BY XOIR.ORDERITEMS_ID WITH UR;", function (err, returnData) {
    				if (err) console.log(err);
   			 		else{

   			 			var orderid = "";
						var flag = "light";

   			 			for (var i = shipData.length - 1; i >= 0; i--) {
   			 				//console.log(shipData[i].ORDERITEMS_ID);
							shipData[i].RETURNED_QUANTITY = 0;
   			 				for (var j = returnData.length - 1; j >= 0; j--) {
   			 					if(returnData[j].ORDERITEMS_ID == shipData[i].ORDERITEMS_ID){
   			 						shipData[i].RETURNED_QUANTITY = returnData[j].RETURNED_QUANTITY;
   			 					}
   			 				}

							if(orderid != shipData[i].ORDERS_ID){
			 					if(flag=="light"){
			 						flag="dark";
			 					}else{
			 						flag = "light";
			 					}
				 			}	

			 				orderid = shipData[i].ORDERS_ID;
			 				shipData[i].ROW_COLOR=flag;
   			 			}

   			 			

   			 			//console.log(shipData);

   			 			 res.render('listshippeditems', { shipData: shipData });
   			 		}
   			 	});	 

   			 } 

			conn.close(function () {
   				
    		});
		});

	});
  
});

router.post('/shiporders', function(req,res,next){
	
	var body = req.body;

	var selectedItems = JSON.parse(body.selectedItems);

	var csvContent = '';

	var config = require('./config');

	csvContent = csvContent+"ORDERS_ID,ORDERITEMS_ID,PARTNUMBER,ITEM_STATUS,ORDER_STATUS,QUANTITY,DATESHIPPED,DATERETURNED,SHIPPINGCOSTS,TRACKINGNUMBER,CARRIER,RETURN_FEE,RETURN_REASON_CODE,STORE_ID"+"\n";

	for (var i = selectedItems.length - 1; i >= 0; i--) {
		var selectedItem = JSON.parse(selectedItems[i]);
		
		csvContent = csvContent + selectedItem.ordersid.trim();
		csvContent = csvContent + ',';

		csvContent = csvContent + selectedItem.orderitemsid.trim();
		csvContent = csvContent + ',';
		
		csvContent = csvContent + selectedItem.skupartnum.trim();
		csvContent = csvContent + ',';
		
		//csvContent = csvContent + 'S';
		csvContent = csvContent + selectedItem.orderitemsstatus.trim();
		csvContent = csvContent + ',';
		
		csvContent = csvContent + selectedItem.ordersstatus.trim();
		csvContent = csvContent + ',';
		
		csvContent = csvContent + selectedItem.quantity.trim();
		csvContent = csvContent + ',';


		var dateFormat = require('dateformat');
		var now = new Date();
		csvContent = csvContent + dateFormat(now, "yyyy-mm-dd HH:MM:ss");
		csvContent = csvContent + ',';

		csvContent = csvContent + '';
		csvContent = csvContent + ',';

		
		csvContent = csvContent + '7.95';
		csvContent = csvContent + ',';
		
		csvContent = csvContent + 'AUTO';
		csvContent = csvContent + selectedItem.ordersid.trim();
		csvContent = csvContent + ',';
		
		csvContent = csvContent + 'UPS';
		csvContent = csvContent + ',';
		
		csvContent = csvContent + '';
		csvContent = csvContent + ',';

		csvContent = csvContent + '';
		csvContent = csvContent + ',';

		csvContent = csvContent + selectedItem.storeid.trim();

		csvContent = csvContent + "\n";
	}

	var fs = require('fs');
	var filename = "FULFILLMENT_DELTA_" + (new Date().getTime()) + ".csv";
	var filepath = config.filepath;

	// write to a new file named 2pac.txt
	fs.writeFile(filepath+filename, csvContent, (err) => {  
	    // throws an error, you could also catch it here
	    if (err) throw err;
	});
	
	
	var Client = require('ssh2').Client;
	var conn = new Client();
	conn.on('ready', function() {
		conn.sftp(function(err, sftp) {
			if (err) throw err;

	        var readStream = fs.createReadStream( filepath+filename );
	        var writeStream = sftp.createWriteStream( config.tgpath +filename );

	        writeStream.on('close',function () {
	            console.log( "- file transferred succesfully" );
	        });

	        writeStream.on('end', function () {
	            console.log( "sftp connection closed" );
	            conn.end();
	        });

	        // initiate transfer of file
	        readStream.pipe( writeStream );

		});
	}).connect({
		host: config.tghost,
		port: 22,
		username: config.tguser,
		password: config.tgpassword
		},function(err, result){
			if (err) {
				console.log('eeror with sftp');
			}
		});
	

   	res.setHeader('Content-Type', 'application/JSON')
	res.end('{"filepath" : "/shipmentfiles/'+filename+'"}');
	});

router.post('/returnItems', function(req,res,next){
	
	var body = req.body;

	var selectedItems = JSON.parse(body.selectedItems);

	var csvContent = '';

	var config = require('./config');

	csvContent = csvContent+"ORDERS_ID,ORDERITEMS_ID,PARTNUMBER,ITEM_STATUS,ORDER_STATUS,QUANTITY,DATESHIPPED,DATERETURNED,SHIPPINGCOSTS,TRACKINGNUMBER,CARRIER,RETURN_FEE,RETURN_REASON_CODE,STORE_ID"+"\n";

	for (var i = selectedItems.length - 1; i >= 0; i--) {
		var selectedItem = JSON.parse(selectedItems[i]);
		
		csvContent = csvContent + selectedItem.ordersid.trim();
		csvContent = csvContent + ',';

		csvContent = csvContent + selectedItem.orderitemsid.trim();
		csvContent = csvContent + ',';
		
		csvContent = csvContent + selectedItem.skupartnum.trim();
		csvContent = csvContent + ',';
		
		csvContent = csvContent + 'U';
		csvContent = csvContent + ',';
		
		csvContent = csvContent + selectedItem.ordersstatus.trim();
		csvContent = csvContent + ',';
		
		csvContent = csvContent + selectedItem.quantity.trim();
		csvContent = csvContent + ',';


		csvContent = csvContent + '';
		csvContent = csvContent + ',';

		var dateFormat = require('dateformat');
		var now = new Date();
		csvContent = csvContent + dateFormat(now, "yyyy-mm-dd HH:MM:ss");
		csvContent = csvContent + ',';
		
		csvContent = csvContent + '';
		csvContent = csvContent + ',';
		
		csvContent = csvContent + '';
		csvContent = csvContent + ',';
		
		csvContent = csvContent + '';
		csvContent = csvContent + ',';
		
		csvContent = csvContent + '6.95';
		csvContent = csvContent + ',';

		csvContent = csvContent + '02';
		csvContent = csvContent + ',';

		csvContent = csvContent + selectedItem.storeid.trim();

		csvContent = csvContent + "\n";
	}

	var fs = require('fs');
	var filename = "FULFILLMENT_DELTA_" + (new Date().getTime()) + ".csv";
	var filepath = config.filepath ;

	// write to a new file named 2pac.txt
	fs.writeFile(filepath+filename, csvContent, (err) => {  
	    // throws an error, you could also catch it here
	    if (err) throw err;
	});
	
		
	var Client = require('ssh2').Client;
	var conn = new Client();
	conn.on('ready', function() {
		conn.sftp(function(err, sftp) {
			if (err) throw err;

	        var readStream = fs.createReadStream( filepath+filename );
	        var writeStream = sftp.createWriteStream( config.tgpath+filename );

	        writeStream.on('close',function () {
	            console.log( "- file transferred succesfully" );
	        });

	        writeStream.on('end', function () {
	            console.log( "sftp connection closed" );
	            conn.end();
	        });

	        // initiate transfer of file
	        readStream.pipe( writeStream );

		});
	}).connect({
		host: 'ftp.tradeglobal.com',
		port: 22,
		username: 'ws_pvh',
		password: 'gazyeGI3'
		});
	

   	res.setHeader('Content-Type', 'application/JSON')
	res.end('{"filepath" : "/shipmentfiles/'+filename+'"}');
	});

module.exports = router;
