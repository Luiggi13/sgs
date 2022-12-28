import { RabbitMQMessage } from 'src/schwarz-values/schwarz-values.service';

export const RMQHEADER: RabbitMQMessage = {
  exchange_name: undefined,
  message: undefined,
  method: undefined,
  date: new Date(),
  payload: undefined,
  queue_name: undefined,
  routingKey: undefined,
  status_code: undefined,
};
