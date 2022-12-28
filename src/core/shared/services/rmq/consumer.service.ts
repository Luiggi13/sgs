import { Injectable, OnModuleInit } from '@nestjs/common';
import amqplib from 'amqplib/callback_api';
import tracesConfig from 'src/config/traces-config';
@Injectable()
export class RMQConsumerService implements OnModuleInit {
  // We need to move this consumer to other instance of nestjs.
  queue = 'to-consume';
  onModuleInit() {
    if (tracesConfig().consumer_active === false) return;
    // This makes sure the queue is declared before attempting to consume from it
    else this.initRabbit();
  }

  initRabbit(): void {
    amqplib.connect('amqp://localhost', (err, connection) => {
      if (err) {
        throw err;
      }
      this.checkChannelRMQ({ connection });
    });
  }

  checkChannelRMQ({ connection }: { connection: any }): void {
    connection.createChannel((errChannel, channel) => {
      if (errChannel) throw errChannel;

      channel.assertQueue(this.queue, {
        durable: true,
      });
      this.consumeQueue({ channel });
    });
  }

  consumeQueue({ channel }: { channel: any }) {
    channel.consume(
      this.queue,
      function (msg) {
        const secs = msg.content.toString().split('.').length - 1;
        // includes script to consume
        setTimeout(function () {
          // when the message is consumed do something...
        }, secs * 30);
      },
      {
        // avoid to delete the message from rmq
        noAck: true,
      },
    );
  }
}
