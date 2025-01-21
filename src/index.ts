import { Hono } from 'hono';
import { vValidator } from '@hono/valibot-validator';
import { validPhoneNumber } from './vali-schema.ts';
import { object } from 'valibot';

const app = new Hono();

app.get('/health', (c) => c.json({ health: 'OK' }));

app.post(
  '/validate',
  vValidator(
    'json',
    object({
      phoneNumber: validPhoneNumber(),
    }),
  ),
  (c) => {
    const data = c.req.valid('json');

    return c.json({
      phoneNumber: data.phoneNumber,
    });
  },
);

export default app;
