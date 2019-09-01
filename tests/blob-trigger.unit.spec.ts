require('dotenv').config();
import { BlobTrigger } from "../src/index";
import { promises as fsPromises } from 'fs'; 
import * as path from 'path';

describe('BlobTrigger', () => {

    it('should process blob', async (done) => {

        try {
            jest.setTimeout(99000);
            const appInsightsKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;
            const appInsightsRole = process.env.APPINSIGHTS_ROLE
            const environment = process.env.ENVIRONMENT;

            const configuration = {
                appInsights_InstrumentionKey: appInsightsKey,
                appInsights_Role: appInsightsRole,
                environment: environment
            };

            const blobTriggerProcessing = new BlobTrigger(configuration);
 
            const stringBindings = await fsPromises.readFile(path.join(__dirname,'../data/context.bindingdata.json'),'utf-8');
            const bindings = JSON.parse(stringBindings);
            const blob = undefined; 

            const newOutgoingMessage = await blobTriggerProcessing.readBlobFileText(bindings, blob);

            expect(newOutgoingMessage).toEqual(bindings);

            done();

        } catch (err) {
            done(err)
        }
    });
});