import amqplib from 'amqplib';

import { createCallQueueName, parseMessageContent, stringifyMessageContent } from './util.js';

export async function createRpcServer({ url, namespace, procedures }) {
  const connection = await amqplib.connect(url);
  const channel = await connection.createChannel();

  const { queue: callQueue } = await channel.assertQueue(createCallQueueName(namespace), { durable: false });

  channel.consume(callQueue, consumeCallQueue);

  return { dispose };

  async function consumeCallQueue(message) {
    const { name, params } = parseMessageContent(message.content);

    const procedure = procedures[name];

    if (!procedure) {
      throw new Error('Invalid Procedure');
    }

    const result = await procedure(params);

    channel.ack(message);

    channel.sendToQueue(message.properties.replyTo, stringifyMessageContent(result), {
      correlationId: message.properties.correlationId
    });
  }

  async function dispose() {
    await channel.close();
    await connection.close();
  }
}
