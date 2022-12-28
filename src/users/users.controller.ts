import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { ENDPOINTS_URL, ENDPOINTS_ACTIONS, ENDPOINTS_TYPE } from 'src/core/shared/enums';
import { sendElasticDocument } from 'src/core/shared/services/elastic/elastic.service';
import { SingleUserTraceLog } from 'src/core/shared/interfaces';
import { User } from './user.schema';
import { UsersService } from './users.service';
import { RMQProducerService } from 'src/core/shared/services/rmq/producer.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ValueEvent } from 'src/core/shared/events/create-event';
import { RMQHEADER } from 'src/core/shared';

@ApiTags('User')
@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private rmq: RMQProducerService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Get()
  async findAll(@Res() response) {
    try {
      const results = await this.usersService.findAll();
      return response.status(HttpStatus.OK).send(results);
    } catch (error) {
      error.date = new Date();
      error.url = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.USER.toLocaleLowerCase()}`;
      this.eventEmitter.emit(
        'error.created',
        new ValueEvent({
          rmq: {
            content: JSON.stringify(error),
            model_name: ENDPOINTS_TYPE.KUDOS,
            action: ENDPOINTS_TYPE.ERROR,
          },
          elastic: {
            content: JSON.stringify(error),
            model_name: ENDPOINTS_TYPE.KUDOS,
            action: ENDPOINTS_TYPE.ERROR,
          },
          response: {
            response: response,
            headers: RMQHEADER
          }
        }),
      );
      return response.status(HttpStatus.BAD_REQUEST).send(error);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response) {
    try {
      const result = await this.usersService.findOne(id);
      return response.status(HttpStatus.OK).send(result);
    } catch (error) {
      error.date = new Date();
      error.url = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.USER.toLocaleLowerCase()}/${id}`;
      this.eventEmitter.emit(
        'error.created',
        new ValueEvent({
          rmq: {
            content: JSON.stringify(error),
            model_name: ENDPOINTS_TYPE.KUDOS,
            action: ENDPOINTS_TYPE.ERROR,
          },
          elastic: {
            content: JSON.stringify(error),
            model_name: ENDPOINTS_TYPE.KUDOS,
            action: ENDPOINTS_TYPE.ERROR,
          },
          response: {
            response: response,
            headers: RMQHEADER
          }
        }),
      );
      return response.status(HttpStatus.BAD_REQUEST).send(error);
    }
  }

  @Post()
  @ApiBody({ type: User })
  async addValue(@Body() value: User, @Res() response) {
    try {
      value.mail = value.mail.toLocaleLowerCase();
      const result = await this.usersService.addUser(value);
      const headers = RMQHEADER;
      headers.exchange_name = ENDPOINTS_TYPE.USER;
      headers.method = response.req.method;
      headers.payload = JSON.stringify(response.req.body);
      headers.queue_name = `${ENDPOINTS_TYPE.KUDOS}_${ENDPOINTS_ACTIONS.POST}_${ENDPOINTS_TYPE.USER}`;
      headers.routingKey = `${ENDPOINTS_TYPE.USER}`;
      headers.message = JSON.stringify(response.result);
      headers.status_code = HttpStatus.OK;
      headers['date'] = new Date();
      headers['url'] = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.USER.toLocaleLowerCase()}`;
      const documentUser: SingleUserTraceLog = {
        url: `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.USER.toLocaleLowerCase()}`,
        name: result['name'],
        username: result['username'],
        mail: result['mail'],
        id: result['_id'],
        date: new Date(),
      };
      this.eventEmitter.emit(
        'user.created',
        new ValueEvent({
          rmq: {
            content: JSON.stringify(documentUser),
            model_name: ENDPOINTS_TYPE.KUDOS,
            action: ENDPOINTS_ACTIONS.POST,
          },
          elastic: {
            content: JSON.stringify(documentUser),
            model_name: ENDPOINTS_TYPE.KUDOS,
            action: ENDPOINTS_ACTIONS.POST,
          },
          response: {
            response: response,
            headers: headers
          }
        }),
      );
      return response.status(HttpStatus.OK).send(result);
      
    } catch (error) {
      error.date = new Date();
      error.url = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.USER.toLocaleLowerCase()}`;
      this.eventEmitter.emit(
        'error.created',
        new ValueEvent({
          rmq: {
            content: JSON.stringify(error),
            model_name: ENDPOINTS_TYPE.KUDOS,
            action: ENDPOINTS_TYPE.ERROR,
          },
          elastic: {
            content: JSON.stringify(error),
            model_name: ENDPOINTS_TYPE.KUDOS,
            action: ENDPOINTS_TYPE.ERROR,
          },
          response: {
            response: response,
            headers: RMQHEADER
          }
        }),
      );
      return response.status(HttpStatus.BAD_REQUEST).send(error);
    }
  }

  @Put(':id')
  async updateOne(@Body() userUpdated: User, @Param('id') id: string, @Res() response) {
    try {
      const result = await this.usersService.updateUser(id, userUpdated);
      const headers = RMQHEADER;
      headers.exchange_name = ENDPOINTS_TYPE.USER;
      headers.method = response.req.method;
      headers.payload = JSON.stringify(response.req.body);
      headers.queue_name = `${ENDPOINTS_TYPE.KUDOS}_${ENDPOINTS_ACTIONS.PUT}_${ENDPOINTS_TYPE.USER}`;
      headers.routingKey = `${ENDPOINTS_TYPE.USER}`;
      headers.message = JSON.stringify(response.result);
      headers.status_code = HttpStatus.OK;
      headers['date'] = new Date();
      headers['url'] = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.USER.toLocaleLowerCase()}/${id}`;
      const documentUser: SingleUserTraceLog = {
        url: `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.USER.toLocaleLowerCase()}/${id}`,
        name: result['name'],
        username: result['username'],
        mail: result['mail'],
        id: result['_id'],
        date: new Date(),
      };
      this.eventEmitter.emit(
        'user.updated',
        new ValueEvent({
          rmq: {
            content: JSON.stringify(documentUser),
            model_name: ENDPOINTS_TYPE.USER,
            action: ENDPOINTS_ACTIONS.PUT,
          },
          elastic: {
            content: JSON.stringify(documentUser),
            model_name: ENDPOINTS_TYPE.USER,
            action: ENDPOINTS_ACTIONS.PUT,
          },
          response: {
            response: response,
            headers: headers
          }
        }),
      );
      return response.status(HttpStatus.OK).send(result);
    } catch (error) {
      error.date = new Date();
      error.url = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.USER.toLocaleLowerCase()}/${id}`;
      this.eventEmitter.emit(
        'user.error',
        new ValueEvent({
          rmq: {
            content: JSON.stringify(error),
            model_name: ENDPOINTS_TYPE.KUDOS,
            action: ENDPOINTS_TYPE.ERROR,
          },
          elastic: {
            content: JSON.stringify(error),
            model_name: ENDPOINTS_TYPE.KUDOS,
            action: ENDPOINTS_TYPE.ERROR,
          },
          response: {
            response: response,
            headers: RMQHEADER
          }
        }),
      );
      return response.status(HttpStatus.BAD_REQUEST).send(error);
    }
  }
  @OnEvent('user.*')
  async handleCreatedEventUser(payload: ValueEvent) {
      if(payload.rmq.action !== ENDPOINTS_TYPE.ERROR) await this.rmq.send_message(
        JSON.stringify(payload.response.headers),
        ENDPOINTS_TYPE.KUDOS,
        payload.response.headers.method,
        ENDPOINTS_TYPE.USER,
      );
    await sendElasticDocument(payload.elastic.content, payload.elastic.model_name, payload.elastic.action);
  }
}
