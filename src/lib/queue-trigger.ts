import { Telemetry } from './telemetry';
import { TextAnalytics, TranslatorText, TextToSpeech} from 'cognitive-tools';

import {Queue, Blob } from 'azure-storage-as-promised';

export class QueueTrigger {

    configuration: Object;

    container: string;

    telemetry:Telemetry;
    telemetryWorks: boolean = false;

    textAnalytics: TextAnalytics;
    textAnalyticsWorks: boolean = false;

    translatorText: TranslatorText;
    translatorTextWorks: boolean = false;

    textToSpeech: TextToSpeech;
    textToSpeechWorks: boolean = false;

    storageBlob: Blob;
    storageBlobWorks: boolean = false;

    storageQueue: Queue;
    storageQueueWorks: boolean = false;

    /**
     * Configuration Object = { 
     *   appInsightsInstrumentionKey: key, 
     *   textAnalyticsKey: key,
     *   textAnalyticsEndpoint: URI,
     *   translatorKey: key,
     *   translatorEndpoint: URI,
     *   environment: 'production' or 'test' - only 'production' messages are send to AppInsights
     * }
     * Only production environment messages are sent to appInsights.
     * @param configuration 
     */
    constructor(configuration: Object) {

      if(configuration && 
        configuration["container"] &&
        
        configuration["appInsights_InstrumentionKey"] && 
        configuration["appInsights_Role"] && 
        configuration["textAnalyticsKey"] && 
        configuration["textAnalyticsEndpoint"] && 
        configuration["translatorKey"] && 
        configuration["translatorEndpoint"] &&

        configuration["ttsHost"] &&
        configuration["ttsKey"] &&
        configuration["ttsAccessTokenHost"] && 

        configuration["storageConnectionString"] &&
        configuration["environment"] 
        ){
          this.configuration = configuration;
          this.container = configuration["container"];

          // Telemetry
          this.telemetry= new Telemetry(configuration);
          if (this.telemetry) {
            this.telemetryWorks = true;
          }

          // Text Analytics
          this.textAnalytics = new TextAnalytics({
            key: configuration["textAnalyticsKey"], 
            endpoint: configuration["textAnalyticsEndpoint"]
          });
          if(this.textAnalytics){
            this.textAnalyticsWorks = true;
          }

          // TranslatorText
          this.translatorText = new TranslatorText({ 
            key: configuration["translatorKey"],
            endpoint: configuration["translatorEndpoint"]
          });
          if (this.translatorText) {
            this.translatorTextWorks = true;
          }

          // TextToSpeech
          this.textToSpeech = new TextToSpeech({
            ttsHost: configuration["ttsHost"],
            ttsKey: configuration["ttsKey"],
            ttsAccessTokenHost: configuration["ttsAccessTokenHost"]
          });
          if(this.textToSpeech) {
            this.textToSpeechWorks = true;
          }

          // storageBlob
          this.storageBlob = new Blob(configuration["storageConnectionString"]);
          if (this.storageBlob){
            this.storageBlobWorks = true;
          }

          // storageQueue
          this.storageQueue = new Queue(configuration["storageConnectionString"]);
          if (this.storageQueue) {
            this.storageQueueWorks = true; 
          }

        } else {
          throw Error("azure-function-middleware::QueueTrigger - configuration is not valid");
        }
    }
    /**
     * Returns first document, returns first language detected in first document.
     * @param queueItem - from Azure Function Trigger 
     * @returns object
     */
    public async detectText(queueItem) {

      try {

        if(!this.telemetryWorks) return;

        const fnName = "azure-function-middleware::QueueTrigger::detectText";

        await this.telemetry.send({
          message: fnName,
          properties: {
            success: "started"
          },
          queueItem
        },true);      


        if(!queueItem || 
          !queueItem.text || 
          !queueItem.fileName ||
          !queueItem.user ||
          !queueItem.languages ||
          !Array.isArray(queueItem.languages) || 
          queueItem.languages.length ===0){
          await this.telemetry.send({
            message: fnName,
            properties: {
              success: "initialization failed",
              error: "one or more params are empty"
            }
          },true);
          return;
        }

        if(!this.textAnalyticsWorks){
          await this.telemetry.send({
            message: fnName,
            properties: {
              success: "initialization failed",
              error: "dependencies don't work"
            }
          },true);  
          return;        
        }

        const results = await this.textAnalytics.detect(queueItem.text);
  
/*
Example JSON

{documents:[
    {language:"en", id:"1", text:"I had the best day of my life."}
]}
*/

        if(results &&
          results.documents &&
          results.documents.length>0 &&
          results.documents[0].detectedLanguages &&
          results.documents[0].detectedLanguages.length>0 &&
          results.documents[0].detectedLanguages[0].iso6391Name
          )
        {
          queueItem.languageDetected = results.documents[0].detectedLanguages[0].iso6391Name;

          await this.telemetry.send({
            message: fnName,
            properties: {
              success: "completed",
              functionOutput: queueItem
            }
          },true);
  
          return queueItem;

        } else {

          await this.telemetry.send({
            message: fnName,
            properties: {
              success: "reading dependency results failed",
              error: "chain to dependency value failed"
            }
          },true);      
          
          throw Error("chain to dependency value failed");
        }

      } catch (err) {
        await this.telemetry.send({
          message: "azure-function-middleware::QueueTrigger::detectText",
          properties: {
            success: false,
            error: err
          }
        },true);
  
        throw err;
      }
    }
    /**
     * 
     * @param queueItem - from Azure Function Trigger 
     */
    public async convertToLanguage(queueItem):Promise<any>{

      try {

          if(!this.telemetryWorks) return;

          const fnName = "azure-function-middleware::QueueTrigger::convertToLanguage";
  
          await this.telemetry.send({
            message: fnName,
            properties: {
              success: "started"
            },
            queueItem
          },true);      


          if(!queueItem ||
            !queueItem.text || 
            !queueItem.user ||
            !queueItem.fileName ||
            !queueItem.languageDetected ||
            !queueItem.languages ||
            !Array.isArray(queueItem.languages) || 
            queueItem.languages.length ===0 ){
            await this.telemetry.send({
              message: fnName,
              properties: {
                success: "initialization failed",
                error: "one or more params are empty"
              }
            },true);
          }

          if(!this.translatorTextWorks ||
            !this.storageQueueWorks){
            await this.telemetry.send({
              message: fnName,
              properties: {
                success: "initialization failed",
                error: "dependencies don't work"
              }
            },true);  
            return;        
          }
          
          const results = await this.translatorText.translate( queueItem["text"], queueItem.languages);

          if(!results ||
            !Array.isArray(results) ||
            !results[0].translations ||
            !(results[0].translations.length >0) ) {
              throw Error("chain to dependency value failed");
          }

          const queueName = "text-to-speech";

          let messages: any = [];

          let functionOutput = {
            queue: queueName,

            
          };

          for(const item of results[0].translations){

            const message = {
              text: queueItem.text,
              user: queueItem.user,
              fileName: queueItem.fileName,
              languageDetected: queueItem.languageDetected,
              toLanguage: item.to,
              toText: item.text
            }

            queueItem.translation = item;
            let options = {};

            messages.push(message);

            const addMessageResult = await this.storageQueue.addMessage(queueName, JSON.stringify(message), options); 

            console.log(addMessageResult);

            await this.telemetry.send({
              message: fnName,
              properties: {
                success: "add item to queue",
                functionOutput: message
              }
            },true);

          }

          functionOutput["messages"] = messages;

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
          message: "azure-function-middleware::QueueTrigger::convertToLanguage",
          properties: {
            success: false,
            error: err
          }
        },true);
  
        throw err;
      
    } 
  }

  public async convertToSpeech(queueItem) {
  
    try {

      if(!this.telemetryWorks) return;

      const fnName = "azure-function-middleware::QueueTrigger::convertToSpeech";

      if (this.telemetryWorks ){
        await this.telemetry.send({
          message: fnName,
          properties: {
            success: "started"
          },
          queueItem
        },true); 

      } 

      if(!queueItem ||
          !queueItem.text ||
          !queueItem.fileName ||
          !queueItem.audioFileName ||
          !queueItem.user || 
          !queueItem.languageDetected ||
          !queueItem.toLanguage ||
          !queueItem.toText
        ){
        await this.telemetry.send({
          message: fnName,
          properties: {
            success: "initialization failed",
            error: "one or more params are empty"
          }
        },true);
      }

      if(!this.storageBlobWorks ||
          !this.container){
        await this.telemetry.send({
          message: fnName,
          properties: {
            success: "initialization failed",
            error: "dependencies don't work"
          }
        },true);  
        return;        
      }        

      // TBD: get these values from somewhere
      const directoryName = queueItem.user;

      const blobName = directoryName? directoryName + "/" + queueItem.audioFileName : queueItem.audioFileName;

      const text = queueItem.text;
      queueItem["blobName"] = blobName;

      const transformConfig = {
        audioFileNameAndPath: blobName
      };

      // create writableStreamToBlob
      const writableStream = this.storageBlob.getWriteStreamToBlob(this.container, blobName, { blockIdPrefix: 'block' });

      // write text to writableStreamToBlob
      const transformResults = await this.textToSpeech.transform(transformConfig, text, writableStream);

      const properties:any = await this.storageBlob.getBlobProperties(this.container, blobName);

      queueItem.convertToSpeechResults = {
        transformResults: transformResults,
        blobProperties: properties
      };

      await this.telemetry.send({
        message: fnName,
        properties: {
          success: "completed",
          functionOutput: queueItem
        }
      },true);

      return queueItem;

    } catch (err) {
      await this.telemetry.send({
        message: "azure-function-middleware::QueueTrigger::convertToSpeech",
        properties: {
          success: false,
          error: err
        }
      },true);

      throw err;
    }
  }   


}

