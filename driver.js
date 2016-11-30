'use strict';

const xs = require('xstream').default;
const amqp = require('amqplib');
const assert = require('assert');

// Polyfill for non-node apps
if (!assert) {
  assert = (condition, err) => {
    if (!condition) {
      throw new Error(err)
    }
  };
}

function makeAMQPDriver(mySettings) {
  let settings = mySettings;
  if (!settings.host) {
    settings.host = 'localhost';
  }

  const connection = amqp.connect('amqp://'+settings.host);
  let activeConnection = null;

  assert(settings.inputQueue, 'you must pass inputQueue in parameters to amqpDriver');
  assert(settings.outputQueue, 'you must pass outputQueue in parameters to amqpDriver');

  return (sink$) => {
    // Sink
    connection.then(conn => {
      if (!activeConnection) {
        activeConnection = conn;
      }
      return conn;
    })
    .then(conn => conn.createChannel())
    .then(ch => {
      const q = settings.outputQueue;

      return ch.assertQueue(q, {durable: true}).then(ok => {
        sink$.addListener({
          next: msg => {
            
            ch.sendToQueue(q, new Buffer(JSON.stringify(msg)))
          },
          error: console.error,
          complete: () => {}
        });
      });
    }).catch(console.warn);

    // Source
    return xs.create({
        start: listener => {
          const q = settings.inputQueue;
          
          connection.then(conn => {
            if (!activeConnection) {
              activeConnection = conn;
            }
            return conn;
          })
          .then(conn => conn.createChannel())
          .then(ch => {
            return ch.assertQueue(q, {durable: true}).then(ok => {
              return ch.consume(q, msg => {
                if (msg !== null) {
                  listener.next(JSON.parse(msg.content.toString()));
                  ch.ack(msg);
                }
              });
            });
          }).catch(listener.error);
        },
        stop: () => {
          activeConnection && activeConnection.close.bind(activeConnection);
        }
      });
  };
};

module.exports = {
  makeAMQPDriver
};
