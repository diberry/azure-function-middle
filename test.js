const fnMiddleWare = require('azure-function-middleware');

const queueTrigger = new fnMiddleWare.QueueTrigger();

// send in queue message, get back queue message for out param
const result = queueTrigger.detectText(myQueueItem);

console.log(result);

