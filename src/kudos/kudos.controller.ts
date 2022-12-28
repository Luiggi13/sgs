import {
  Post,
  Body,
  Controller,
  Get,
  Param,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { KudosService } from './kudos.service';
import { Kudos } from './kudos.schema';
import { KudosNotFound } from 'src/exceptions';
import { FilterDate, SingleKudosTraceLog } from 'src/core/shared/interfaces';
import { isValidDateHelper } from './helpers/dates.helper';
import { RMQHEADER } from 'src/core/shared/services/rmq/rmq.data';
import { hasDuplicateNameInValuesArray, isEmptyObject, stringArrayToStringPhrase } from 'src/core/shared';
import {
  sendElasticDocument,
} from 'src/core/shared/services/elastic/elastic.service';
import { RMQProducerService } from 'src/core/shared/services/rmq/producer.service';
import { ENDPOINTS_TYPE, ENDPOINTS_ACTIONS, ENDPOINTS_URL } from 'src/core/shared/enums';
import { SchwarzValues } from 'src/schwarz-values/schwarz-values.schema';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ValueEvent } from 'src/core/shared/events/create-event';

@ApiTags('Kudos')
@Controller(ENDPOINTS_TYPE.KUDOS)
export class KudosController {
  constructor(
    private readonly kudosService: KudosService,
    private rmq: RMQProducerService,
    private eventEmitter: EventEmitter2,
  ) { }

  @Get()
  async findAll(@Res() response) {
    try {
      const results = await this.kudosService.findAll();
      return response.status(HttpStatus.OK).send(results);
    } catch (error) {
      error.date = new Date();
      error.url = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.KUDOS.toLocaleLowerCase()}`;
      this.eventEmitter.emit(
        'kudos.error',
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

  @Get('id/:id')
  async findOne(@Res() response, @Param('id') id: string) {
    try {
      const result = await this.kudosService.findOne(id);
      const headers = RMQHEADER;
      headers.payload = JSON.stringify(response.req.body);
      headers.method = response.req.method;
      headers.exchange_name = ENDPOINTS_TYPE.KUDOS;
      headers.queue_name = ENDPOINTS_TYPE.KUDOS;
      headers.routingKey = ENDPOINTS_TYPE.KUDOS;
      if (result && result['message']) {
        headers.message = JSON.stringify(result);
        headers.status_code = HttpStatus.OK;
        return response.status(HttpStatus.OK).send(result);
      }

      if (result && result['error_message']) {
        headers.message = JSON.stringify(result);
        headers.status_code = HttpStatus.NOT_FOUND;
        headers.message = JSON.stringify(result['error_message']);
        headers['date'] = new Date();
        headers['url'] = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.KUDOS.toLocaleLowerCase()}/${id}`;
        this.eventEmitter.emit(
          'kudos.error',
          new ValueEvent({
            rmq: {
              content: JSON.stringify(headers),
              model_name: ENDPOINTS_TYPE.KUDOS,
              action: ENDPOINTS_TYPE.ERROR,
            },
            elastic: {
              content: JSON.stringify(headers),
              model_name: ENDPOINTS_TYPE.KUDOS,
              action: ENDPOINTS_TYPE.ERROR,
            },
            response: {
              response: response,
              headers: RMQHEADER
            }
          }),
        );
        return response.status(HttpStatus.NOT_FOUND).send(result);
      }
      headers.message = JSON.stringify(result);
      headers.status_code = HttpStatus.NOT_FOUND;
      headers.message = JSON.stringify(`Kudos with id ${id} doesn't exist`);
      headers['date'] = new Date();
      headers['url'] = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.KUDOS.toLocaleLowerCase()}/${id}`;
      const notKudosFound = new KudosNotFound(`Kudos with id ${id} doesn't exist`, 404);
      this.eventEmitter.emit(
        'kudos.error',
        new ValueEvent({
          rmq: {
            content: JSON.stringify(notKudosFound),
            model_name: ENDPOINTS_TYPE.KUDOS,
            action: ENDPOINTS_TYPE.ERROR,
          },
          elastic: {
            content: JSON.stringify(notKudosFound),
            model_name: ENDPOINTS_TYPE.KUDOS,
            action: ENDPOINTS_TYPE.ERROR,
          },
          response: {
            response: response,
            headers: RMQHEADER
          }
        }),
      );
      return response.status(HttpStatus.NOT_FOUND).send(notKudosFound);
    } catch (error) {
      error.date = new Date();
      error.url = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.KUDOS.toLocaleLowerCase()}`;
      this.eventEmitter.emit(
        'kudos.error',
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

  @Get('filter/date')
  async findByDate(@Res() response, @Body() filters: FilterDate) {
    const headers = RMQHEADER;
    headers.exchange_name = ENDPOINTS_TYPE.KUDOS;
    headers.method = response.req.method;
    headers.payload = JSON.stringify(response.req.body);
    headers.queue_name = ENDPOINTS_TYPE.KUDOS;
    headers.routingKey = ENDPOINTS_TYPE.KUDOS;
    const res = isValidDateHelper(filters);
    if (res.errors) {
      headers.message = JSON.stringify(res.errors);
      headers.status_code = res.reponses.status_code;
      headers['date'] = new Date();
      headers['url'] = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.KUDOS.toLocaleLowerCase()}/filter/date`;
      this.eventEmitter.emit(
        'kudos.error',
        new ValueEvent({
          rmq: {
            content: JSON.stringify(res.reponses),
            model_name: ENDPOINTS_TYPE.KUDOS,
            action: ENDPOINTS_TYPE.ERROR,
          },
          elastic: {
            content: JSON.stringify(res.reponses),
            model_name: ENDPOINTS_TYPE.KUDOS,
            action: ENDPOINTS_TYPE.ERROR,
          },
          response: {
            response: response,
            headers: RMQHEADER
          }
        }),
      );
      return response.status(res.reponses.status_code).send(res.reponses);
    }

    const result = await this.kudosService.filterByDate(filters);
    if (result) {
      headers.message = JSON.stringify(result);
      headers.status_code = HttpStatus.OK;
      headers['date'] = new Date();
      headers['url'] = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.KUDOS.toLocaleLowerCase()}/filter/date`;
      this.eventEmitter.emit(
        'kudos.filter.created',
        new ValueEvent({
          rmq: {
            content: JSON.stringify(result),
            model_name: ENDPOINTS_TYPE.KUDOS,
            action: ENDPOINTS_TYPE.FILTER,
          },
          elastic: {
            content: JSON.stringify(result),
            model_name: ENDPOINTS_TYPE.KUDOS,
            action: ENDPOINTS_TYPE.FILTER,
          },
          response: {
            response: response,
            headers: RMQHEADER
          }
        }),
      );
      return response.status(HttpStatus.OK).send(result);
    }
  }

  @Get('giver/:giver')
  async findByGiver(@Param('giver') giverEmail: string, @Res() response) {
    try {
      const result = await this.kudosService.findByGiver(giverEmail.toLowerCase());
      return response.status(HttpStatus.OK).send(result);
    } catch (error) {
      error['date'] = new Date();
      error['url'] = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.KUDOS.toLocaleLowerCase()}/giver/${giverEmail}`;
      this.eventEmitter.emit(
        'kudos.error',
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

  @Get('receiver/:receiver')
  async findByReceiver(@Param('receiver') receiver: string, @Res() response) {
    try {
      const result = await this.kudosService.findByReceiver(receiver.toLowerCase());
      return response.status(HttpStatus.OK).send(result);
    } catch (error) {
      error['date'] = new Date();
      error['url'] = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.KUDOS.toLocaleLowerCase()}/receiver/${receiver}`;
      this.eventEmitter.emit(
        'kudos.error',
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

  @Get('filter/')
  @ApiQuery({ name: 'giver', required: false })
  @ApiQuery({ name: 'receiver', required: false })
  @ApiQuery({ name: 'kudos', required: false })
  @ApiQuery({ name: 'message', required: false })
  @ApiQuery({ name: 'media', required: false })
  @ApiQuery({ name: 'superKudos', required: false })
  @ApiQuery({
    name: 'sorting',
    required: false,
    enum: ['lastWeek', 'lastMonth', 'lastYear'],
  })
  async filterKudos(
    @Query('giver') giver: string,
    @Query('receiver') receiver: string,
    @Query('kudos') kudos: number,
    @Query('message') message: string,
    @Query('media') media: string,
    @Query('superKudos') superKudos: boolean,
    @Query('sorting') sorting: string,
    @Query('createdAt') createdAt: Date | null,
    @Query('updatedAt') updatedAt: Date | null,
    @Query('core_values') core_values: SchwarzValues[],
  ) {
    const filtersObj = {
      giver,
      receiver,
      kudos,
      message,
      media,
      superKudos,
      createdAt,
      updatedAt,
      core_values,
    };

    Object.keys(filtersObj).forEach(
      (x) => filtersObj[x] === undefined && delete filtersObj[x],
    );
    const result = await this.kudosService.filterKudos(filtersObj, sorting);
    return result;
  }

  @Post()
  @ApiBody({ type: Kudos })
  async addKudos(@Body() kudos: Kudos, @Res() response) {
    if (isEmptyObject(kudos)) {
      const message = { message: "Body can't be empty" };
      return response.status(HttpStatus.NOT_ACCEPTABLE).send(message);
    }
    if (hasDuplicateNameInValuesArray(kudos.core_values)) {
      const message = { message: "Core values in a Kudos must be unique" };
      return response.status(HttpStatus.CONFLICT).send(message);
    }
    const existValueInDB = await this.kudosService.checkValuesExistInDatabase(kudos.core_values);
    if (existValueInDB.length ) {
      const message = { message: `Core values ${stringArrayToStringPhrase(existValueInDB)} doesn't exist in Kudos Database` };
      return response.status(HttpStatus.CONFLICT).send(message);
    }
    try {
      kudos.giver= kudos.giver.toLocaleLowerCase()
      kudos.receiver= kudos.receiver.toLocaleLowerCase()
      const result = await this.kudosService.create(kudos);
      const headers = RMQHEADER;
      headers.exchange_name = ENDPOINTS_TYPE.KUDOS;
      headers.method = response.req.method;
      headers.payload = JSON.stringify(response.req.body);
      headers.queue_name = `${ENDPOINTS_TYPE.KUDOS}_${ENDPOINTS_ACTIONS.POST}_${ENDPOINTS_TYPE.KUDOS}`;
      headers.routingKey = `${ENDPOINTS_TYPE.KUDOS}`;
      headers.message = JSON.stringify(response.result);
      headers.status_code = HttpStatus.OK;
      headers['date'] = new Date();
      headers['url'] = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.KUDOS.toLocaleLowerCase()}`;
      const documentValue: SingleKudosTraceLog = {
        url: `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.KUDOS.toLocaleLowerCase()}`,
        id: result['_id'],
        giver: result['giver'],
        receiver: result['receiver'],
        kudos: result['kudos'],
        message: result['message'],
        media: result['media'] || null,
        superKudos: result['superKudos'],
        core_values: result['core_values'] || [],
        createdAt: result['createdAt'] || new Date(),
        updatedAt: result['updatedAt'] || new Date(),
        date: new Date()
      };
      this.eventEmitter.emit(
        'kudos.created',
        new ValueEvent({
          rmq: {
            content: JSON.stringify(documentValue),
            model_name: ENDPOINTS_TYPE.VALUES,
            action: ENDPOINTS_ACTIONS.POST,
          },
          elastic: {
            content: JSON.stringify(documentValue),
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
      error['date'] = new Date();
      error['url'] = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.KUDOS.toLocaleLowerCase()}`;
      this.eventEmitter.emit(
        'kudos.error',
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

  @OnEvent('kudos.*')
  async handleCreatedEventKudos(payload: ValueEvent) {
      await this.rmq.send_message(
        JSON.stringify(payload.response.headers),
        ENDPOINTS_TYPE.KUDOS,
        payload.response.headers.method,
        ENDPOINTS_TYPE.KUDOS,
      );
    await sendElasticDocument(payload.elastic.content, payload.elastic.model_name, payload.elastic.action);
  }
}
