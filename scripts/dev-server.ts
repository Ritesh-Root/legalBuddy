/** Run the Fetch handler locally so development and integration behavior match Vercel. */
import { serve } from '@hono/node-server';
import { handleRequest } from '../server/handler';
serve({ fetch: handleRequest, port: Number(process.env.PORT ?? 3001), hostname: '127.0.0.1' });
