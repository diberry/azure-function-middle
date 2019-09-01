let appInsights = require("applicationinsights");
const sleep = require('await-sleep');
const now = (+new Date).toString();

const myFn = async()=>{

    appInsights.setup("").start(); // assuming ikey is in env var
    let client = appInsights.defaultClient;
    
    client.trackEvent({name: now + "my custom event ", properties: {customProperty: "custom property value"}});
    client.trackException({exception: new Error(now + "handled exceptions can be logged with this method")});
    client.trackMetric({name: now + "custom metric", value: 3});
    client.trackTrace({message: now + "trace message"});
    client.trackDependency({target:now + "http://dbname", name:"select customers proc", data:"SELECT * FROM Customers", duration:231, resultCode:0, success: true, dependencyTypeName: "ZSQL"});
    client.trackRequest({name:"GET /customers", url:now + "http://myserver/customers", duration:309, resultCode:200, success:true});
    

    await client.flush();
    console.time('Sleeping');
    await sleep(10000);
    console.timeEnd('Sleeping');
}

myFn().then(()=>{
    console.log("done");
}).catch(err=>{
    console.log(err);
})