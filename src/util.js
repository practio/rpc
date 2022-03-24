export function newCorrelationId() {
  return Math.random().toString() +
    Math.random().toString() +
    Math.random().toString();
}

export function stringifyContent(content) {
  return Buffer.from(JSON.stringify(content))
}

export function parseContent(content) {
  return JSON.parse(content.toString());
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