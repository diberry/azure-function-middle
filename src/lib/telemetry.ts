const appInsights = require('applicationinsights');
import sleep from 'await-sleep';

export class Telemetry {

  private appInsights_InstrumentionKey: string;
  private appInsights_Role: string;
  private appInsights_Flush_Timeout: string;
  private appInsights_created: boolean;
  private environment: string;
  
  private client: any;

  /**
   * @param configuration 
   */
  constructor(configuration) {
    
    this.appInsights_InstrumentionKey = configuration["appInsights_InstrumentionKey"];
    this.appInsights_Role = configuration["appInsights_Role"];
    this.appInsights_Flush_Timeout = (process.env.APPINSIGHTS_FLUSH_TIMEOUT || 5000).toString();
    this.environment = configuration["environment"];

    if(this.appInsights_InstrumentionKey){
      appInsights.setup(this.appInsights_InstrumentionKey)
      .setAutoCollectConsole(true, true);
      appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = (this.appInsights_Role || '');
      //appInsights.
      appInsights.start();
      this.client = appInsights.defaultClient;
      this.appInsights_created = true;
    };

  }
  /**
   * 
   * @param telemetryObject - example: {message: "trace message"}
   */
  public async send(telemetryObject: Object, flush: boolean=false) {
      if(this.environment==='production' && this.appInsights_created ){
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