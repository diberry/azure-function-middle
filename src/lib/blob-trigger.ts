import { Telemetry } from './telemetry';
const StringDecoder = require('string_decoder').StringDecoder;

export class BlobTrigger {

  configuration: Object;
  
  telemetry:Telemetry;

  telemetryWorks: boolean = false;


  /**
   * Configuration Object = { 
   * appInsightsInstrumentionKey: key, 
   * environment: 'production' or 'test' - only 'production' messages are send to AppInsights
   * }
   * Only production environment messages are sent to appInsights.
   * @param configuration 
   */
  constructor(configuration: Object) {

    if(configuration &&
      configuration["appInsights_InstrumentionKey"] && 
      configuration["appInsights_Role"] && 
      configuration["environment"]
    ){
        this.configuration = configuration;
        this.telemetry= new Telemetry(configuration);
        this.telemetryWorks = true;
    } else {
      throw Error("azure-function-middleware::BlobTrigger - configuration is not valid");
    }
  }
  /**
   * 
   * @param inputBindings - from Azure Function Trigger
   * @param myBlob - from Azure Function Trigger
   */
  public async readTextBlob(inputBindings: Object, myBlob: any) {

    try {

      if(!this.telemetryWorks) return;

      const fnName = "azure-function-middleware::BlobTrigger::readTextBlob";

      if (this.telemetryWorks){
        await this.telemetry.send({
          message: fnName,
          properties: {
            success: "started"
          }
        },true);      
      }

      if(!inputBindings && !myBlob) {
        await this.telemetry.send({
          message: fnName,
          properties: {
            success: "initialization failed",
            error: "one or more params are empty"
          }
        },true);
      }

      // text from blob
      const decoder = new StringDecoder('utf8');
      const myText = decoder.write(myBlob);

      /* get user account request info */
      const functionOutput = {
        languages: ['de','it'],
        user: 'diberry',
        text: myText,
        fileName: inputBindings["name"]
      };

      await this.telemetry.send({
        message: fnName,
        properties: {
          success: "completed",
          functionOutput: functionOutput
        }
      },true);

      return functionOutput;

    } catch (err) {

      await this.telemetry.send({
        message: "azure-function-middleware::BlobTrigger::readTextBlob",
        properties: {
          success: "error",
          error: err
        }
      },true);

      throw err;
    }
  }
}
