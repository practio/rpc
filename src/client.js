import amqplib from 'amqplib';
import { PassThrough } from 'stream';

import { createCallQueueName, newCorrelationId, newPromiseAndExecutor, parseContent, stringifyContent } from './util.js';

export async function createRpcClient({ url }) {
  const connection = await amqplib.connect(url);
  const channel = await connection.createChannel();

  const executors = {};
  const streams = {};

  const { queue: replyToQueue } = await channel.assertQueue(null, { exclusive: true });

  channel.consume(replyToQueue, consumeReplyToQueue, { noAck: true });

  return { call, dispose };

  async function consumeReplyToQueue(message) {
    const { content, properties } = message;
    const { type, value, done } = parseContent(content);
    const { correlationId } = properties;

    if (type === 'object') {
      const executor = executors[correlationId];
    
      if (executor) {
        executor.resolve(value);

        delete executors[correlationId];
      }
    } else if (type === 'stream') {
      const executor = executors[correlationId];
    
      if (executor) {
        streams[correlationId] = new PassThrough({ objectMode: true });
        executor.resolve(streams[correlationId]);
        delete executors[correlationId];
      }
    
      if (value) {
        streams[correlationId].write(value);
      } else if (done) {
        streams[correlationId].end();
      }
    }
  }

  async function call(name, params, namespace) {
    const queue = createCallQueueName(namespace);
    const message = stringifyContent({ name, params });
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