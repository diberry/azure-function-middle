
export class QueueTrigger {

    constructor() {
    }
    public detectText(queueMessage) {
      try {

      // TBD - add processing

        return queueMessage;
      } catch (err) {
        throw err;
      }
    }
  }
  