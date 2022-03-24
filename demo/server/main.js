import { createRpcServer } from '@practio/rpc/server';
import { v4 } from 'uuid';

main();

async function main () {
  const events = new Array(5).fill(undefined).map(createRandomEvent);
  
  await createRpcServer({
    namespace: 'server',
    procedures: {
      findEvent,
      getEventIds,
      getEvents,
      getEventsAsStream
    },
    url: 'amqp://localhost'
  });

  async function findEvent({ eventId }) {
    console.info('findEvent()', { eventId });

    return events.find(event => event.id === eventId);
  }

  async function getEventIds() {
    console.info('getEventIds()');

    return events.map(({ id }) => id);
  }

  async function getEvents() {
    console.info('getEvents()');

    return events;
  }

  async function getEventsAsStream() {
    console.info('getEventsAsStream()');

    return sleepyAsyncIterator(events);
  }
}

function createRandomEvent() {
  return {
    id: v4(),
    ts: new Date()
  }
}

async function* sleepyAsyncIterator(iterator) {
  for (let item of iterator) {
    await sleep(1)

    yield item;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
