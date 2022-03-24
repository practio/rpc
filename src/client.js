import amqplib from 'amqplib';

import { createCallQueueName, newCorrelationId, newPromiseAndExecutor, parseMessageContent, stringifyMessageContent } from './util.js';

export async function createRpcClient({ url }) {
  const connection = await amqplib.connect(url);
  const channel = await connection.createChannel();

  const executors = {};

  const { queue: replyToQueue } = await channel.assertQueue(null, { exclusive: true });

  channel.consume(replyToQueue, consumeReplyToQueue, { noAck: true });

  return { call, dispose };

  async function consumeReplyToQueue (message) {
    const content = parseMessageContent(message.content);

    const executor = executors[message.properties.correlationId];

    if (!executor) {
      throw new Error('Invalid Executor')
    }

    executor.resolve(content);
    
    delete executors[message.properties.correlationId];
  }

  async function call(name, params, namespace) {
    const queue = createCallQueueName(namespace);
    const message = stringifyMessageContent({ name, params });
    const correlationId = newCorrelationId();
    
    const options = {
      correlationId,
      replyTo: replyToQueue
    };

    channel.sendToQueue(queue, message, options);

    const { executor, promise } = newPromiseAndExecutor();

    executors[correlationId] = executor;

    return promise;
  }

  async function dispose() {
    await channel.close();
    await connection.close();
  }
}