import { createRpcClient } from '@practio/rpc/client';

main();

async function main () {
  const rpcClient = await createRpcClient({
    namespace: 'client',
    url: 'amqp://localhost'
  });

  const eventIds = await rpcClient.call('getEventIds', null, 'server');

  for (const eventId of eventIds) {
    const event = await rpcClient.call('findEvent', { eventId }, 'server');

    console.info(eventId, event);
  }

  await rpcClient.dispose();
}