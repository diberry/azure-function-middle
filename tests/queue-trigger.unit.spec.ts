require('dotenv').config();
import { QueueTrigger } from "../src/index";

describe('QueueTrigger', () => {

    it('should not process queue - constructor error', async (done) => {

        try {
            jest.setTimeout(99000);

            const queueTriggerProcessing = new QueueTrigger({});
 
            if (queueTriggerProcessing) {
                console.log(queueTriggerProcessing);
            }

            done("Constructor didn't fail when it should have");


        } catch (err) {
            done();
        }
    });  
    it('should detectText', async (done) => {
        try {
            jest.setTimeout(99000);

            const appInsights_InstrumentionKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;
            const appInsights_Role = process.env.APPINSIGHTS_ROLE;
            const textAnalyticsKey = process.env.COG_TEXTANALYTICS_KEY
            const textAnalyticsEndpoint = process.env.COG_TEXTANALYTICS_ENDPOINT
            const translatorKey = process.env.COG_TRANSLATOR_KEY
            const translatorEndpoint = process.env.COG_TRANSLATOR_ENDPOINT
            const storageConnectionString = process.env.STORAGE_CONNECTIONSTRING
            const environment = process.env.ENVIRONMENT;
            const ttsHost = process.env.SPEECHRESOURCETTSHOST;
            const ttsKey = process.env.SPEECHRESOURCETTSKEY;
            const ttsAccessTokenHost = process.env.SPEECHACCESSTOKENHOST;

            const configuration = {
                appInsights_InstrumentionKey,
                appInsights_Role,
                container: "tts-to-speech",
                environment,
                textAnalyticsKey,
                textAnalyticsEndpoint,
                translatorKey,
                translatorEndpoint,
                storageConnectionString,
                ttsHost,
                ttsKey,
                ttsAccessTokenHost
            };            

            const queueItem = {
                text: "This is a short string",
                user: "diberry",
                fileName: "short.txt",
                languages: ['de','it']
            };

            const queueTriggerProcessing = new QueueTrigger(configuration);
 
            const result = await queueTriggerProcessing.detectText(queueItem);

            if(result){
                expect(result.user).toEqual(queueItem.user);
                expect(result.text).toEqual(queueItem.text);
                expect(result.fileName).not.toEqual(undefined);
                expect(result.languages).toEqual(queueItem.languages);
                expect(result.languageDetected).toEqual("en");
            }
            else {
                throw("result was empty");
            }
            done();

        } catch (err) {
            done(err);
        }
    });    
    it('should convertToLanguage', async (done) => {
        try {
            jest.setTimeout(99000);

            const appInsights_InstrumentionKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;
            const appInsights_Role = process.env.APPINSIGHTS_ROLE;
            const textAnalyticsKey = process.env.COG_TEXTANALYTICS_KEY
            const textAnalyticsEndpoint = process.env.COG_TEXTANALYTICS_ENDPOINT
            const translatorKey = process.env.COG_TRANSLATOR_KEY
            const translatorEndpoint = process.env.COG_TRANSLATOR_ENDPOINT
            const storageConnectionString = process.env.STORAGE_CONNECTIONSTRING
            const environment = process.env.ENVIRONMENT;
            const ttsHost = process.env.SPEECHRESOURCETTSHOST;
            const ttsKey = process.env.SPEECHRESOURCETTSKEY;
            const ttsAccessTokenHost = process.env.SPEECHACCESSTOKENHOST;

            const configuration = {
                appInsights_InstrumentionKey,
                appInsights_Role,
                container: "tts-to-speech",
                environment,
                textAnalyticsKey,
                textAnalyticsEndpoint,
                translatorKey,
                translatorEndpoint,
                storageConnectionString,
                ttsHost,
                ttsKey,
                ttsAccessTokenHost
            };            

            const queueItem = {
                languageDetected: "en",
                fileName: "short.txt",
                text: "This is a short string",
                languages: ['de','it'],
                user: "diberry"
            };

            const queueTriggerProcessing = new QueueTrigger(configuration);
 
            const result = await queueTriggerProcessing.convertToLanguage(queueItem);

            if(result){
                expect(result.messages).not.toEqual(undefined);
                expect(result.messages.length).toEqual(2);
                
            }
            else {
                throw("result was empty");
            }
            done();

        } catch (err) {
            done(err);
        }
    });      
    it('should convertToSpeech', async (done) => {
        try {
            jest.setTimeout(99000);

            const appInsights_InstrumentionKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;
            const appInsights_Role = process.env.APPINSIGHTS_ROLE;
            const textAnalyticsKey = process.env.COG_TEXTANALYTICS_KEY
            const textAnalyticsEndpoint = process.env.COG_TEXTANALYTICS_ENDPOINT
            const translatorKey = process.env.COG_TRANSLATOR_KEY
            const translatorEndpoint = process.env.COG_TRANSLATOR_ENDPOINT
            const storageConnectionString = process.env.STORAGE_CONNECTIONSTRING
            const environment = process.env.ENVIRONMENT;

            const ttsHost = process.env.SPEECHACCESSTOKENHOST;
            const ttsKey = process.env.SPEECHRESOURCETTSKEY;
            const ttsAccessTokenHost = process.env.SPEECHACCESSTOKENHOST;

            const container = process.env.CONTAINER;

            const configuration = {
                appInsights_InstrumentionKey,
                appInsights_Role,
                environment,
                textAnalyticsKey,
                textAnalyticsEndpoint,
                translatorKey,
                translatorEndpoint,
                storageConnectionString,
                ttsHost,
                ttsKey,
                ttsAccessTokenHost,
                container
            };            

            const fileName = (+new Date).toString() + '-' + "short.txt";

            const queueItem = {
                languageDetected: "en",
                text: "This is a short string",
                fileName: fileName,
                audioFileName: fileName + ".mp3",
                blobName: "diberry/short.txt.mp3",
                languages: ['de','it'],
                user: "diberry"
            };

            const queueTriggerProcessing = new QueueTrigger(configuration);
 
            const result = await queueTriggerProcessing.convertToSpeech(queueItem);

            if(result){
                expect(result.convertToSpeechResults.blobProperties).not.toEqual(undefined);
                expect(result.convertToSpeechResults.blobProperties.container).toEqual(configuration.container);
                expect(result.convertToSpeechResults.blobProperties.name).toEqual(queueItem.user + "/" + queueItem.audioFileName);
                console.log(configuration.container + "/" + queueItem.audioFileName);
                expect(result.convertToSpeechResults.blobProperties.blobType).toEqual('BlockBlob');
                expect(result.convertToSpeechResults.blobProperties.contentLength).toEqual("56");
            }
            else {
                throw("result was empty");
            }
            done();

        } catch (err) {
            console.log(err);
            done(err);
        }
    }); 
});