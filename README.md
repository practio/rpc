# @practio/rpc

Remote Procedure Call (RPC) over AMQP.

## Install

```bash
$ npm install @practio/rpc
```

## Usage

### Client

```js
import { createRpcClient } from '@practio/rpc/client';

main();

async function main () {
  const rpcClient = await createRpcClient({
    url: 'amqp://localhost'
  });

  const eventIds = await rpcClient.call('getEventIds', null, 'server');

  for (const eventId of eventIds) {
    const event = await rpcClient.call('findEvent', { eventId }, 'server');

    console.info(eventId, event);
  }

  await rpcClient.dispose();
}
```

### Server

```js
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
```
