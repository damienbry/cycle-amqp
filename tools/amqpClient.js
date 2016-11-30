'use strict';

const amqp = require('amqplib');

const connect = () => {
  return amqp.connect('amqp://localhost:5672');
};

module.exports = {
  publish: (q, msg) => {
    
    connect().then(conn => {
      return conn.createChannel().then(channel => {
        return channel.assertQueue(q, {durable: true}).then(ok => {
          channel.sendToQueue(q, new Buffer(JSON.stringify(msg)));
        });
      });
    }).catch(console.warn);
  },
  subscribe: (q, callback) => {
    connect().then(conn => {
      return conn.createChannel().then(channel => {
        return channel.assertQueue(q, {durable: true}).then(ok => {
          return channel.consume(q, msg => {
            if (msg !== null) {
              channel.ack(msg);
              callback && callback(JSON.parse(msg.content.toString()));
              conn.close();
            }
          });
        });
      });
    }).catch(console.warn);
  }
};
