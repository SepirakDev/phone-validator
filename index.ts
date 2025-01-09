import pino from 'pino';
import * as v from "valibot";
import {isValiError} from "valibot";
import {randomUUIDv7} from "bun";
import {validatePhoneSchema} from "./schema.ts";
import {serializeError} from "serialize-error";
import {PhoneNumberFormat, PhoneNumberUtil} from 'google-libphonenumber';

const logger = pino(process.env.PRETTY_LOGS === 'true' ? {
  transport: {
    target: 'pino-pretty'
  }
} : {});

const phoneNumberUtil = PhoneNumberUtil.getInstance();

const server = Bun.serve({
  port: process.env.PORT || '3000',
  hostname: process.env.HOSTNAME || '0.0.0.0',
  async fetch(req, server) {
    logger.info({
      req: {
        headers: req.headers,
        ip: server.requestIP(req),
        url: req.url
      }, msg: 'Handling request'
    });
    const url = new URL(req.url);
    if (url.pathname === '/health') {
      return Response.json({'health': 'OK'})
    }

    const accept = req.headers.get('Accept');
    if (accept !== null && (!accept.includes('application/json') && !accept.includes('*/*'))) {
      return Response.json({
        error: 'Invalid Accept header (expected '
      }, {status: 400});
    }

    if (req.headers.get('Content-Type') !== 'application/json') {
      return Response.json({
        error: 'Invalid Content-Type'
      }, {status: 400})
    }

    if (req.method !== 'POST') {
      return Response.json({
        error: 'Route not found'
      }, {status: 404})
    }


    let json: any;
    try {
      json = await req.json();
    } catch (error) {
      return Response.json({
        error: 'Invalid json body'
      }, {status: 400})
    }

    const {phoneNumber} = v.parse(validatePhoneSchema, json);


    try {
      const parsedNumber = phoneNumberUtil.parse(phoneNumber, 'us');
      const isValid = phoneNumberUtil.isValidNumber(parsedNumber);

      return Response.json({
        isValid,
        parsed: isValid ? phoneNumberUtil.format(parsedNumber, PhoneNumberFormat.E164) : undefined,
        reason: !isValid ? 'Invalid phone number': undefined
      })
    } catch (error: any) {
      return Response.json({
        isValid: false,
        reason: 'message' in error ? error.message : 'Invalid phone number'
      });
    }
  },
  error(error) {
    if (isValiError(error)) {
      return Response.json({message: error.message, errors: error.issues}, {status: 400});
    }
    const requestId = randomUUIDv7();
    logger.error({err: serializeError(error), requestId});
    return Response.json({error: 'An unexpected error occurred', requestId}, {status: 500});
  }
});

logger.info(`Service listening on %s:%s`, server.hostname, server.port);
