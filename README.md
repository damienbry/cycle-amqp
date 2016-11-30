# cycle-amqp
Brings amqp power to your Cycle.js app :metal:

### Easy pony :horse_racing:

This code launches a cycle app with an amqp client that consumes a queue and publish in another queue.
It needs an amqp server launched (RabbitMQ, ZeroMQ, or anything), check the package.json scripts if you want a simple example using docker & RabbitMQ.

```javascript
const makeAMQPDriver = require('cycle-amqp');
const {run} = require('@cycle/xstream-run');

const drivers = {
  amqp: makeAMQPDriver({
    inputQueue: 'queue-input',
    outputQueue: 'queue-output' 
  }
}

// your app
const main = (sources) => {
  // sinks
  return {
    amqp: sources.amqp
  }
}

run(main, drivers);
```

### Installation

```bash
npm install cycle-amqp
```

Uses ES6 features. Node environment only.

### Node, browser ?

This was built and tested for node, not tested in the browser but it should work. Keep me in touch if it's working or not !

### Tests

The input and output of the driver have unit tests. 
Don't mind the tooling, I moved it directly from the project I'm working on. Since it's only tests and readable, I kept it.

### Roadmap

[] Support other stream libs than xstream (use an adapter !)
[] Any suggestions ?

### Contribution

Feel free to send me a pull request on anything (code, tests, doc, RC). I'll be glad to review that.

### About the author :muscle:

> Build & Learn everyday

Full stack engineer concerned about building awesome stuff to improve people's life.

### Meet me on:

[twitter.com/Orbmancer](twitter.com/Orbmancer)
[damien-bry.com](damien-bry.com)

