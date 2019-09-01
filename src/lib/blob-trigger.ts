import { Telemetry } from './telemetry';

export class BlobTrigger {

  configuration: Object;
  
  telemetry:Telemetry = new Telemetry({
    appInsights_InstrumentionKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
    appInsights_Role: process.env.APPINSIGHTS_ROLE,
    environment: 'production'
  });

  /**
   * Object containing { appInsightsInstrumentionKey: key, environment: 'production'}. Only production environment messages are sent to appInsights.
   * @param configuration 
   */
  constructor(configuration: Object) {
    this.configuration = configuration;
  }
  public async readBlobFileText(inputBindings: Object, myBlob: any) {
    try {

      if(!inputBindings && !myBlob) console.log("empty params");

      console.log("test from console.log");
      await this.telemetry.send({
        message: "azure-function-middleware::blob-trigger::readBlobFileText",
        properties: {inputBindings}
      },true);

      return inputBindings;
    } catch (err) {
      throw err;
    }
  }
}
