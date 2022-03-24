export function newCorrelationId() {
  return Math.random().toString() +
    Math.random().toString() +
    Math.random().toString();
}

export function stringifyMessageContent(messageContent) {
  return Buffer.from(JSON.stringify(messageContent))
}

export function parseMessageContent(messageContent) {
  return JSON.parse(messageContent.toString());
}

export function createCallQueueName(namespace) {
  return [namespace, 'call'].join('-');
}

export function newPromiseAndExecutor () {
    let executor

    const promise = new Promise((resolve, reject) => {
        executor = { resolve, reject }
    })

    return {
        executor,
        promise
    }
}