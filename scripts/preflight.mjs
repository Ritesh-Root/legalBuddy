/** Verify the public-submission size, branch, file hygiene, and documentation gates. */
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const tracked = git('ls-files').split('\n').filter(Boolean);
if (!tracked.length)
  throw new Error('No tracked project files. Stage the submission before preflight.');
const checks = [];
const verify = (name, passed) => {
  checks.push({ name, passed });
  process.stdout.write(`${passed ? 'PASS' : 'FAIL'} ${name}\n`);
};
const totalBytes = tracked.reduce((sum, file) => sum + statSync(file).size, 0);
verify(
  `Tracked repository files under 10 MB (${totalBytes.toLocaleString()} bytes)`,
  totalBytes < 10_000_000,
);
verify(
  'Exactly one local branch',
  git('branch', '--format=%(refname:short)').split('\n').filter(Boolean).length === 1,
);
verify(
  'Generated assets and credentials are not tracked',
  !tracked.some(
    (file) =>
      /^(node_modules|dist|coverage|artifacts|\.vercel|test-results|playwright-report)\//u.test(
        file,
      ) ||
      (/^\.env/u.test(file) && file !== '.env.example'),
  ),
);
const secretPattern =
  /(?:AIza[0-9A-Za-z_-]{35}|AQ\.[A-Za-z0-9_-]{30,}|vcp_[A-Za-z0-9]{25,}|gh[pousr]_[A-Za-z0-9]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/u;
verify(
  'No known credential signatures in tracked files',
  tracked.every((file) => !secretPattern.test(readFileSync(file, 'utf8'))),
);
const readme = readFileSync('README.md', 'utf8');
verify(
  'Required README sections are present',
  [
    'Chosen Vertical',
    'Approach and Logic',
    'How the Solution Works',
    'Assumptions Made',
    'Problem Statement Alignment',
    'Security',
    'Testing',
    'Accessibility',
  ].every((heading) => readme.includes(`## ${heading}`)),
);
verify(
  'Sample citations, source limits, and no-store API policy are documented',
  readme.includes('sample') &&
    readme.includes('40,000') &&
    readFileSync('SECURITY.md', 'utf8').includes('no-store'),
);
if (checks.some((check) => !check.passed)) process.exitCode = 1;
