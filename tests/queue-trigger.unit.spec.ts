require('dotenv').config();
import { QueueTrigger } from "../src/index";

describe('QueueTrigger', () => {

    it('should process queue message', (done) => {

        try {
            jest.setTimeout(99000);
            const queueTriggerProcessing = new QueueTrigger();
            const incomingMessageFromQueue={};

            const newOutgoingMessage = queueTriggerProcessing.detectText(incomingMessageFromQueue);

            expect(newOutgoingMessage).toEqual(incomingMessageFromQueue);

            done();

        } catch (err) {
            done(err)
        }
    });
});