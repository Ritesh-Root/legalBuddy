/** Public readiness indicates configuration, never credentials or model internals. */
import { handleRequest } from '../server/handler.js';
export default { fetch: handleRequest };
