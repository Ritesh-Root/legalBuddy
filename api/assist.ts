/** Vercel's Web Standard function uses the same handler as the local server. */
import { handleRequest } from '../server/handler.js';
export default { fetch: handleRequest };
