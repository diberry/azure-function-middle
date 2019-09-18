require('dotenv').config();
import { BlobTrigger } from "../src/index";
import { promises as fsPromises } from 'fs'; 
import * as path from 'path';
const Buffer = require('buffer').Buffer;

describe('BlobTrigger', () => {

    it('should not process blob - constructor error', async (done) => {

        try {
            jest.setTimeout(99000);

            const blobTriggerProcessing = new BlobTrigger({});
 
            if (blobTriggerProcessing) {
                console.log(blobTriggerProcessing);
            }

            done("Constructor didn't fail when it should have");


        } catch (err) {
            done();
        }
    });
    it('should process blob', async (done) => {
        try {
            jest.setTimeout(99000);

            const appInsightsKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;
            const appInsightsRole = process.env.APPINSIGHTS_ROLE;
            //const environment = process.env.ENVIRONMENT;

            const configuration = {
                appInsights_InstrumentionKey: appInsightsKey,
                appInsights_Role: appInsightsRole,
                environment: 'production'
            };            

            const blobString = "This is a short string";

            const blobTriggerProcessing = new BlobTrigger(configuration);
 
            const stringBindings = await fsPromises.readFile(path.join(__dirname,'../data/context.bindingdata.BlogTrigger.2.json'),'utf-8');
            const bindings = JSON.parse(stringBindings);
            const blob = Buffer.from(blobString, "utf-8");

            const result = await blobTriggerProcessing.readTextBlob(bindings, blob);

            if(result){
                expect(result).not.toBe(undefined);
                expect(result["languages"]).not.toBe(undefined);
                expect(result["user"]).not.toBe(undefined);
                expect(result["fileName"]).not.toEqual(stringBindings["name"]);
                expect(result["text"]).toEqual(blobString);
            }
            else {
                throw("result was empty");
            }
            done();

        } catch (err) {
            done(err);
        }
    });
});