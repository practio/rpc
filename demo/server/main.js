import { createRpcServer } from '@practio/rpc/server';
import { MongoClient, ObjectId } from 'mongodb';

main();

async function main () {
  const client = await MongoClient.connect('mongodb://localhost');
  const db = client.db('practio-github');
  const events = db.collection('events');
  
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

    return events.findOne({ _id: new ObjectId(eventId) });
  }

  async function getEventIds() {
    console.info('getEventIds()');

    return events.find({}).map(event => event._id).toArray();
  }

  async function getEvents() {
    console.info('getEvents()');

    return events.find({}).toArray();
  }

  async function getEventsAsStream() {
    console.info('getEventsAsStream()');

    return events.find({});
  }
}
