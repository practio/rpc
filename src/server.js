import amqplib from 'amqplib';

import { createCallQueueName, parseContent, stringifyContent } from './util.js';

export async function createRpcServer({ url, namespace, procedures }) {
  const connection = await amqplib.connect(url);
  const channel = await connection.createChannel();

  const { queue: callQueue } = await channel.assertQueue(createCallQueueName(namespace), { durable: false });

  channel.consume(callQueue, consumeCallQueue);

  return { dispose };

  async function consumeCallQueue(message) {
    const { content, properties } = message;
    const { correlationId, replyTo } = properties;
    const { name, params } = parseContent(content);
    
    const procedure = procedures[name];

    if (!procedure) {
      throw new Error('Invalid Procedure');
    }

    const result = await procedure(params);

    if (isAsyncIterator(result)) {
      channel.ack(message);

      for await (const value of result) {
        channel.sendToQueue(replyTo, stringifyContent({ type: 'stream', value }), { correlationId });
      }

      channel.sendToQueue(replyTo, stringifyContent({ type: 'stream', value: undefined, done: true }), { correlationId });
    } else {
      channel.ack(message);
      channel.sendToQueue(replyTo, stringifyContent({ type: 'object', value: result }), { correlationId });
    }
  }

  async function dispose() {
    await channel.close();
    await connection.close();
  }
}

function isAsyncIterator(value) {
  if (!value) {
    return false;
  }

  return typeof value[Symbol.asyncIterator] === 'function'
}