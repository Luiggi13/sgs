import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { ENDPOINTS_TYPE, ENDPOINTS_ACTIONS } from 'src/core/shared/enums';
import { ENDPOINTS_URL } from 'src/core/shared/enums/url.enum';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ValueEvent } from 'src/core/shared/events/create-event';
import { Response } from 'express';
import { SchwarzValues } from './schwarz-values.schema';
import { SchwarzValuesService } from './schwarz-values.service';
import { sendElasticDocument } from 'src/core/shared/services/elastic/elastic.service';
import { SingleValueTraceLog } from 'src/core/shared/interfaces';
import { isHexColor, RMQHEADER } from 'src/core/shared';
import { RMQProducerService } from 'src/core/shared/services/rmq/producer.service';

@ApiTags('Schwarz Values')
@Controller('values')
export class SchwarzValuesController {
  constructor(
    private valuesService: SchwarzValuesService,
    private eventEmitter: EventEmitter2,
    private rmq: RMQProducerService
  ) { }

  @Get()
  async findAll(@Res() response): Promise<SchwarzValues> {
    try {
      const results = await this.valuesService.findAll();
      return response.status(HttpStatus.OK).send(results);
    } catch (error) {
      error.date = new Date();
      error.url = `${ENDPOINTS_URL.BASE_URL}/values`;
      return response.status(HttpStatus.BAD_REQUEST).send(error);
    }
  }

  @Get('dropdown')
  async findAllDropdown(@Res() response: Response) {
    try {
      const results = await this.valuesService.findAllDropdown();
      return response.status(HttpStatus.OK).send(results);
    } catch (error) {
      error.date = new Date();
      error.url = `${ENDPOINTS_URL.BASE_URL}/values/dropdown`;
      return response.status(HttpStatus.BAD_REQUEST).send(error);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response) {
    try {
      const result = await this.valuesService.findOne(id);
      return response.status(HttpStatus.OK).send(result);
    } catch (error) {
      error.date = new Date();
      error.url = `${ENDPOINTS_URL.BASE_URL}/values/${id}`;
      return response.status(HttpStatus.BAD_REQUEST).send(error);
    }
  }

  @Post()
  @ApiBody({ type: SchwarzValues })
  async addValue(@Body() value: SchwarzValues, @Res() response) {
    try {
      const isValueDuplicated = await this.valuesService.isInDatabase({ value: value.name });
      if (isValueDuplicated) return response.status(HttpStatus.CONFLICT).send({
        "status_code": 409,
        "isDuplicated": true,
        "message": "A record with the name WORD already exists".replace('WORD',value.name.toUpperCase())
      });
      if (!isHexColor(value.color)) return response.status(HttpStatus.OK).send({ message: 'The value for color is not a hexadecimal color' });
      const result = await this.valuesService.addValue(value);
      const headers = RMQHEADER;
      headers.exchange_name = ENDPOINTS_TYPE.KUDOS;
      headers.method = response.req.method;
      headers.payload = JSON.stringify(response.req.body);
      headers.queue_name = `${ENDPOINTS_TYPE.KUDOS}_${ENDPOINTS_ACTIONS.POST}_${ENDPOINTS_TYPE.VALUES}`;
      headers.routingKey = `${ENDPOINTS_TYPE.VALUES}`;
      headers.message = JSON.stringify(response.result);
      headers.status_code = HttpStatus.OK;
      headers['date'] = new Date();
      headers['url'] = `${ENDPOINTS_URL.BASE_URL}/${ENDPOINTS_TYPE.VALUES.toLocaleLowerCase()}`;
      const documentValue: SingleValueTraceLog = {
        url: `${ENDPOINTS_URL.BASE_URL}/values`,
        name: result['name'],
        description: result['description'],
        icon: result['icon'],
        id: result['_id'],
        date: new Date(),
      };
      this.eventEmitter.emit(
        'value.created',
        new ValueEvent({
          rmq: {
            content: JSON.stringify(documentValue),
            model_name: ENDPOINTS_TYPE.VALUES,
            action: ENDPOINTS_ACTIONS.POST,
          },
          elastic: {
            content: JSON.stringify(documentValue),
            model_name: ENDPOINTS_TYPE.VALUES,
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
      error.url = `${ENDPOINTS_URL.BASE_URL}/values`;
      return response.status(HttpStatus.BAD_REQUEST).send(error);
    }
  }

  @Delete('delete/:id')
  async deleteOne(@Res() response, @Param('id') id: string) {
    try {
      const result = await this.valuesService.deleteValue(id);
      const headers = RMQHEADER;
      headers.exchange_name = ENDPOINTS_TYPE.KUDOS;
      headers.method = response.req.method;
      headers.payload = JSON.stringify(response.req.body);
      headers.queue_name = `${ENDPOINTS_TYPE.KUDOS}_${ENDPOINTS_ACTIONS.DELETE}_${ENDPOINTS_TYPE.VALUES}`;
      headers.routingKey = `${ENDPOINTS_TYPE.VALUES}`;
      headers.message = JSON.stringify(response.result);
      headers.status_code = HttpStatus.OK;
      headers['date'] = new Date();
      headers['url'] = `${ENDPOINTS_URL.BASE_URL}/values/${ENDPOINTS_ACTIONS.DELETE.toLocaleLowerCase()}/${id}`;
      const documentValue: SingleValueTraceLog = {
        url: `${ENDPOINTS_URL.BASE_URL}/values/${ENDPOINTS_ACTIONS.DELETE.toLocaleLowerCase()}/${id}`,
        name: result['name'],
        description: result['description'],
        icon: result['icon'],
        id: result['_id'],
        date: new Date(),
      };
      this.eventEmitter.emit(
        'value.deleted',
        new ValueEvent({
          rmq: {
            content: JSON.stringify(documentValue),
            model_name: ENDPOINTS_TYPE.VALUES,
            action: ENDPOINTS_ACTIONS.DELETE,
          },
          elastic: {
            content: JSON.stringify(documentValue),
            model_name: ENDPOINTS_TYPE.VALUES,
            action: ENDPOINTS_ACTIONS.DELETE,
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
      error.url = `${ENDPOINTS_URL.BASE_URL}/delete/${id}`;
      return response.status(HttpStatus.BAD_REQUEST).send(error);
    }
  }

  @OnEvent('value.*')
  async handleCreatedEvent(payload: ValueEvent) {
    await this.rmq.send_message(
      JSON.stringify(payload.response.headers),
      ENDPOINTS_TYPE.KUDOS,
      payload.response.headers.method,
      ENDPOINTS_TYPE.VALUES,
    );
    await sendElasticDocument(payload.elastic.content, payload.elastic.model_name, payload.elastic.action);
  }
}
