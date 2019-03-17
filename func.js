const fdk=require('@fnproject/fdk');
const saveObject = require( './saveObject.js' );
var logger = require( './logger' );

fdk.handle(async function(input){
  logger.log('info',`shippings-reporter-func for ${JSON.stringify(input)}`)
  let objectName = 'myData.json';
  if (!input.objectName) {
    input.objectName = objectName;
  }
  let dateRange = 'day';
  if (!input.dateRange) {
    input.dateRange = dateRange;
  }
  var x = await saveObject.runShippingExtractionJob(input.objectName, { dateRange: input.dateRange, filePrefix: "shippings" })

  return {'message': 'Processed Shipping Reporting request for objectName ' + input.objectName+' response '+ x}
})


// invoke with :
// echo -n '{"objectName":"dataNow.json","dateRange":"day", "payload":{"you":"lovely person"}}' | fn invoke soaring shippings-reporter-func
// yes | cp -rf /vagrant/shippings-reporter-func/*  .

//saveObject.runShippingExtractionJob("shippings-20190316.csv", { dateRange: "day", filePrefix: "shippings" })
