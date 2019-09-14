const appInsights = require('applicationinsights');
import sleep from 'await-sleep';

export class Telemetry {

  private appInsights_Flush_Timeout: string;
  private appInsightsWorks: boolean;
  private environment: string;

  private client: any;

  /**
   * @param configuration 
   */
  constructor(configuration) {
    
    if(configuration &&
      configuration["appInsights_InstrumentionKey"] && 
      configuration["appInsights_Role"] && 
      configuration["environment"]
    ){
      this.appInsights_Flush_Timeout = (process.env.APPINSIGHTS_FLUSH_TIMEOUT || 5000).toString();

      appInsights.setup(configuration["appInsights_InstrumentionKey"])
      .setAutoCollectConsole(true, true);
      appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = (configuration["appInsights_Role"] || '');
      appInsights.start();
      this.client = appInsights.defaultClient;
      this.appInsightsWorks = true;
      this.environment = configuration["environment"];
    } else {
      throw Error("azure-function-middleware::Telemetry - configuration is not valid");
    }

  }
/**
 * Any key/value pair in properties will display as separate item in appInsights.
 * @param telemetryObject - example = {
          message: "azure-function-middleware::BlobTrigger::readTextBlob",
          properties: {
            success: false,
            error: "one or more params are empty"
          }
        }
 * @param flush - immediately send to appInsights
 */
  public async send(telemetryObject: Object, flush: boolean=false) {
      if(this.environment==='production' && this.appInsightsWorks ){
        this.client.trackTrace(telemetryObject);

        if(flush){
          this.client.flush();
          console.time('Sleeping');
          await sleep(this.appInsights_Flush_Timeout);
          console.timeEnd('Sleeping');
        }
      }
  }
}