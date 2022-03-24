import { createRpcServer } from '@practio/rpc/server';
import { v4 } from 'uuid';

main();

async function main () {
  const events = new Array(100).fill(undefined).map(createRandomEvent);
  
  await createRpcServer({
    namespace: 'server',
    procedures: {
      findEvent,
      getEventIds
    },
    url: 'amqp://localhost'
  });

  async function findEvent({ eventId }) {
    return events.find(event => event.id === eventId);
  }

  async function getEventIds() {
    return events.map(({ id }) => id);
  }
}

function createRandomEvent() {
  return {
    id: v4(),
    ts: new Date()
  }
}
