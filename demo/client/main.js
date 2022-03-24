import { createRpcClient } from '@practio/rpc/client';

main();

async function main () {
  const rpcClient = await createRpcClient({
    url: 'amqp://localhost'
  });

  const eventIds = await rpcClient.call('getEventIds', null, 'server');

  for (const eventId of eventIds) {
    const event = await rpcClient.call('findEvent', { eventId }, 'server');

    console.info(event._id);
  }

  const events = await rpcClient.call('getEvents', null, 'server');

  for (const event of events) {
    console.info(event._id);
  }

  const eventsAsStream = await rpcClient.call('getEventsAsStream', null, 'server');

  for await (const event of eventsAsStream) {
    console.info(event._id);
  }

  await rpcClient.dispose();
}