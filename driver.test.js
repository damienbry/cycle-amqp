'use strict';

const driver = require('./driver');
const xs = require('xstream').default;
const assert = require('assert');
const tools = require('./tools');
const Cycle = require('@cycle/xstream-run').default;

const INPUT_QUEUE = "qa-input-queue";
const OUTPUT_QUEUE = "qa-output-queue";

const connectionSettings = {
  inputQueue: INPUT_QUEUE,
  outputQueue: OUTPUT_QUEUE
};

const testObject = {testKey: 'testValue'};

describe('amqp driver', () => {

  context = tools.context.initialize();
  
  afterEach(done => {
    tools.context.clean(context);
    setTimeout(() => done(), 50);
  });

  it('[source] should feed the stream when a message arrives', (done) => {
    const amqp = driver.makeAMQPDriver(connectionSettings);

    const sources = amqp(xs.never());
    const listener = {
      next: i => {
        assert.deepStrictEqual(i, testObject);
        done();
      }
    };
    context.subscription = sources.subscribe(listener);

    tools.amqpClient.publish(INPUT_QUEUE, testObject);
  });

  it('[sink] should publish a message to a queue', (done) => {
    const amqp = driver.makeAMQPDriver(connectionSettings);

    const sources = amqp(xs.of(testObject));
    context.subscription = sources.subscribe({});

    tools.amqpClient.subscribe(OUTPUT_QUEUE, msg => {
      assert.deepStrictEqual(msg, testObject);
      done();
    });
  });

  it('[both] should cycle', (done) => {
    const amqp = driver.makeAMQPDriver(connectionSettings);

    const main = (sources) => {
      return {
        amqp: sources.amqp.map(a => {
          return a;
        })
      }
    };

    const {sources, run} = Cycle(main, {amqp});
    context.dispose = run();

    tools.amqpClient.publish(INPUT_QUEUE, testObject);

    tools.amqpClient.subscribe(OUTPUT_QUEUE, msg => {
      assert.deepStrictEqual(msg, testObject);
      done();
    });
  });
});
