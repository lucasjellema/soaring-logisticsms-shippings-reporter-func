# Soaring Logistics - Shipping Reporter Function.

This repository contains the Node application sources for an Oracle Functions function that reads data from a REST API, translates the JSON response to a CSV document and writes that document to Oracle Cloud Infrastructure Object Storage

To get going with these sources
 
Clone Repository

Run npm install

## Make Fixes in Node Module HTTP-Signature
Due to a bug in http-signature ([see this article](https://github.com/joyent/node-http-signature/issues/81)) you need to make a few manual fixes in file node_modules\http-signature\lib\signer.js in order to make signing work with a private key file that is protected with a passphrase:

At line 293 I inserted the following:
```assert.optionalString(options.passphrase, 'options.passphrase');```

At line 363 (formerly line 362) I modifed the line to the following to propagate the options object:
```key = sshpk.parsePrivateKey(options.key, 'auto', options);```

## Copy your Private Key file into the project

At one point, you have probably used `openssl genrsa` to generate a private key (protected wuth a passphrase) resulting in a *.pem file. Please copy this file into the project. In the next step, you have to set the relative location of this file in the configuration.js file - property privateKeyFile.


## Configure your environment parameters in confguration.js

File configuration.js contains all environment specific settings for your Cloud Tenancy, Compartment, User, Public Fingerprint and Private Key. Update this file with your own settings.

## Deploy and Run as Function

Optional: Copy all files to the location of the function's definition:

yes | cp -rf /vagrant/shippings-reporter-func/*  .

Deploy the function:

fn deploy --app soaring

Invoke the function:

echo -n '{period:"day", objectName:"shippings-today.csv",name:"Chronos", "payload":{"you":"lovely person"}}' | fn invoke soaring shippings-reporter-func   


## Resources
Crucial resources:

[Fix for http-signature to wok with passphrase](https://github.com/joyent/node-http-signature/issues/81)

[GitHub Repo OCI-Rest-APIs-nodejs by Christopher Beck with foundation for invoking many OCI REST APIs from NodeJS - I have used crucial elements from this example](https://github.com/christopherbeck/OCI-Rest-APIs-nodejs)

[Papertrail Logging Service](https://papertrailapp.com)

[Medium Article: Logging in NodeJS using Papertrail](https://medium.com/@gauravumrani/logging-in-nodejs-using-papertrail-47ed7d888457)

[OCI Object Storage Service Documentation](https://docs.cloud.oracle.com/iaas/Content/Object/Concepts/objectstorageoverview.htm)