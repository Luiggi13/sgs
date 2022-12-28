import { RabbitMQMessage } from "src/schwarz-values/schwarz-values.service";

export class ValueEvent {
  rmq: {
    content: string;
    model_name: string;
    action: string;
  };
  elastic: {
    content: string;
    model_name: string;
    action: string;
  };
  response: {
    response: any;
    headers: RabbitMQMessage
  }

  constructor(event: {
    rmq: {
      content: string;
      model_name: string;
      action: string;
    },
    elastic: {
      content: string;
      model_name: string;
      action: string;
    },
    response: {
      response: any;
      headers: RabbitMQMessage
    }
  }) {
    this.rmq = event.rmq;
    this.elastic = event.elastic;
    this.response = event.response;
  }
}