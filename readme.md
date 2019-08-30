# Middleware for Azure Function triggers

These classes are used in the Azure function triggers. Pass in the entire incoming parameter to the function. You receive the entire outputParam back.

## Usage for Blob Trigger to Queue output

```
const fnMiddleWare = require('azure-function-middleware');

// azure function for blob trigger
module.exports = async function (context, myBlob) {

    const blobTrigger = new fnMiddleWare.BlobTrigger();

    // send in blob, get back queue message for out param
    context.bindings.outputQueueItem = blobTrigger.readBlobFileText(context.bindingData.myBlob);

    context.done();

}
```

## Usage for Queue Trigger to Queue output

```
const fnMiddleWare = require('azure-function-middleware');

// azure function for blob trigger
module.exports = async function (context, myQueueItem) {

    const queueTrigger = new fnMiddleWare.QueueTrigger();

    // send in queue message, get back queue message for out param
    context.bindings.outputQueueItem = queueTrigger.detectText(myQueueItem);

    context.done();

}
```