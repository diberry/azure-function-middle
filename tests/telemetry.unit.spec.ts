require('dotenv').config();
import { Telemetry } from '../src/lib/telemetry';

describe('BlobTrigger', () => {

    it('should process blob', async (done) => {

        try {
            jest.setTimeout(99000);
            const appInsightsKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;
            const appInsightsRole = process.env.APPINSIGHTS_ROLE
            //const environment = process.env.ENVIRONMENT;

            const configuration = {
                appInsights_InstrumentionKey: appInsightsKey,
                appInsights_Role: appInsightsRole,
                environment: 'production'
            };

            const telemetry = new Telemetry(configuration);
            await telemetry.send({
                "message":"azure-function-middleware.jest.Telemetry", 
                "dateTime": (+new Date).toString(),
                "properties": {"a":"b"}
            }, true);

            done();

        } catch (err) {
            done(err)
        }
    });
});