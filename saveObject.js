var request = require("request");
var fs = require('fs');
var objectStore = require('./services/objectStore.js');
var logger = require('./logger');
const configs = require('./my_configuration');
const configuration = configs.configs;
const Json2csvParser = require('json2csv').Parser;

var auth = {
    tenancyId: configuration.tenancyId,
    userId: configuration.userId,
    keyFingerprint: configuration.keyFingerprint,
    RESTversion: configuration.RESTversion,
    region: configuration.region
};
auth.privateKey = fs.readFileSync(configuration.privateKeyFile, 'ascii');
auth.passphrase = configuration.passphrase
// set up parameters object
//
var parameters = {
    compartmentId: configuration.compartmentId
};
var callback = function (data) {
    logger.log('debug', `call to OCI REST API complete`)
    logger.log('debug', JSON.stringify(data))
    console.log(JSON.stringify(data))
};

const rp = require("request-promise-native");

async function getShippingsData(period) {
    var options = {
        method: 'GET',
        uri: `http://129.213.11.15/soaring/logistics/shipping/period/${period}`,
        headers:
        {
            'cache-control': 'no-cache'
        }, json: true // Automatically parses the JSON string in the response};
    }
    try {
        let response = await rp(options);
        return response
    } catch (error) {
        console.log("Error: ", error);
    }
}//getShippingsData

async function runShippingExtractionJob(objectName, input) {
    var period = input.period || 'day'
    logger.log('info', `runShippingExtractionJob for ${JSON.stringify(input)} for period ${period}`)
    auth.RESTversion = '/20160918';
    //
    // Upload file to objectStore
    //

    // set up the parameter object
    parameters = {
        namespaceName: configuration.namespaceName,
        bucketName: configuration.bucketName
    };


    try {
        logger.log('info', `Go get shippings from Logistics MS`)
        var shippings = await getShippingsData(period)

        // see https://www.npmjs.com/package/json2csv   

        logger.log('info', `The shippings were received from Logistics MS - total number of shippings: ${shippings.length}`)

        const fields = ['_id', '_source.orderIdentifier', '_source.nameAddressee', '_source.destination.country'
            , '_source.shippingMethod', '_source.destination.city', '_source.destination.coordinates.lat', '_source.destination.coordinates.lon'
            , '_source.shippingStatus', '_source.shippingCosts', '_source.submissionDate'
            , '_source.items.productIdentifier', '_source.items.itemCount'];
        const json2csvParser = new Json2csvParser({ fields, unwind: '_source.items' });
        const csv = json2csvParser.parse(shippings);
        logger.log('info', `Parsing to CSV is complete, size of CSV document: ${csv.length}`)
        //console.log(csv);
        // fs.writeFile("shippings.csv", csv, function (err) {
        //     if (err) {
        //         return console.log(err);
        //     }

        //     console.log("The file was saved locally!");
        // });
        parameters.body = csv
        parameters.objectName = `shippings${(new Date()).toISOString().substring(0, 10)}.csv`
        //parameters['content-type']='application/csv'
        logger.log('info', `Saving to Object Storage as ${parameters.objectName}`)
        objectStore.obj.put(auth, parameters, callback);
        logger.log('info', `The shippings report was saved to OCI ObjectStorage in bucket ${parameters.bucketName} under the name ${parameters.objectName}`)
        return `The shippings report was saved to OCI ObjectStorage in bucket ${parameters.bucketName} under the name ${parameters.objectName}`

    } catch (err) {
        logger.log('error', `Something went wrong ${JSON, stringify(err)}`)
        console.error(err);
    }

    return;

}// runShippingExtractionJob

module.exports = {
    runShippingExtractionJob: runShippingExtractionJob
}

// test call
runShippingExtractionJob("shippings-20190316.csv", { period: 'day', content: "My extra very very special Content", moreContent: "Something completely different", value: 34 })
