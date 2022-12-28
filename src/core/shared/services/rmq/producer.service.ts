import { Injectable } from '@nestjs/common';
import amqplib from 'amqplib/callback_api';
import tracesConfig from 'src/config/traces-config';

@Injectable()
export class RMQProducerService {
  send_message(
    message: string,
    queue_name: string,
    action: string,
    key = null,
    ) {
      if (tracesConfig().rmq_active === false) return;
    let value_name = '';

    if (key) value_name = `${queue_name}_${action}_${key}`;
    else value_name = `${queue_name}_${action}`;
    amqplib.connect('amqp://localhost', (err, connection) => {
      if (err) {
        throw err;
      }
      connection.createChannel((errChannel, channel) => {
        if (errChannel) throw errChannel;

        channel.assertExchange(queue_name, 'topic', {
          durable: true,
          type: 'direct',
          auto_delete: false,
        });

        channel.assertQueue(value_name, {
          durable: true,
        });

        channel.bindQueue(value_name, queue_name, key);
        channel.publish(queue_name, key, Buffer.from(message));
      });

      setTimeout(function () {
        connection.close();
      }, 500);
    });
  }
}
