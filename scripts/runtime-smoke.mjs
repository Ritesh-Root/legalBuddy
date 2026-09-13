/** Import emitted API modules in plain Node to catch deployment-only ESM resolution failures. */
import assert from 'node:assert/strict';
import health from '../artifacts/runtime/api/health.js';
import assist from '../artifacts/runtime/api/assist.js';

const response = await health.fetch(new Request('https://margin.example/api/health'));
assert.equal(response.status, 200);
assert.equal((await response.json()).status, 'ok');
const unsupported = await assist.fetch(new Request('https://margin.example/api/assist'));
assert.equal(unsupported.status, 405);
assert.equal(unsupported.headers.get('Allow'), 'POST');
process.stdout.write('PASS compiled Node API entrypoints and method validation\n');
