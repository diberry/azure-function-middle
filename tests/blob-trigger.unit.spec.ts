require('dotenv').config();
import { BlobTrigger } from "../src/index";

describe('BlobTrigger', () => {

    it('should process blob', (done) => {

        try {

            const blobTriggerProcessing = new BlobTrigger();
            const incomingBlobLocation='upload/short.txt';
 
            const newOutgoingMessage = blobTriggerProcessing.readBlobFileText(incomingBlobLocation);

            expect(newOutgoingMessage).toEqual(incomingBlobLocation);

            done();

        } catch (err) {
            done(err)
        }
    });
});