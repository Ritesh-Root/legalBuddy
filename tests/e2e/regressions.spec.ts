/** Protect retention, PDF extraction, and cancellation beyond the main happy paths. */
import { test, expect } from '@playwright/test';
import { SAMPLE_ANALYSIS, SAMPLE_DOCUMENT, SAMPLE_REVISED } from '../../src/domain/sample';
import { textPdfFixture } from './pdf-fixture';

test('navigation preserves pasted input, an unsubmitted revision, and an answered question', async ({
  page,
}) => {
  await page.route('**/api/assist', (route) =>
    route.fulfill({
      json: {
        result: { ...SAMPLE_ANALYSIS, answer: 'The document sets a 60-day final payment window.' },
      },
    }),
  );
  await page.goto('/');
  await page.getByLabel('Paste your document', { exact: true }).fill(SAMPLE_DOCUMENT);
  await page.getByRole('button', { name: 'Ask a question', exact: true }).click();
  await page.getByRole('button', { name: 'Document review', exact: true }).click();
  await expect(page.getByLabel('Paste your document', { exact: true })).toHaveValue(
    SAMPLE_DOCUMENT,
  );
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Make it clear' }).click();
  await expect(page.getByRole('heading', { name: 'Read between the lines.' })).toBeVisible();
  await page.getByRole('button', { name: 'Compare versions', exact: true }).click();
  await page.getByLabel('Add the revised version').fill(SAMPLE_REVISED);
  await page.getByRole('button', { name: 'Document review', exact: true }).click();
  await page.getByRole('button', { name: 'Compare versions', exact: true }).click();
  await expect(page.getByLabel('Add the revised version')).toHaveValue(SAMPLE_REVISED);
  await page.getByRole('button', { name: 'Ask a question', exact: true }).click();
  await page.getByLabel('Your question', { exact: true }).fill('When is payment due?');
  await page.getByRole('button', { name: 'Ask about this document' }).click();
  await expect(page.locator('.answer-card')).toContainText('60-day');
  await expect(
    page.getByRole('heading', { name: 'What the document cannot answer' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Document review', exact: true }).click();
  await page.getByRole('button', { name: 'Ask a question', exact: true }).click();
  await expect(page.locator('.answer-card')).toContainText('60-day');
});

test('PDF extraction runs locally and rejects unreadable PDFs without an API call', async ({
  page,
}) => {
  let assistanceCalls = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/api/assist')) assistanceCalls += 1;
  });
  await page.goto('/');
  const text =
    'Design agreement. The client will pay the designer within 15 days of delivery. Both parties keep project information confidential.';
  await page.getByLabel('Upload legal document').setInputFiles({
    name: 'agreement.pdf',
    mimeType: 'application/pdf',
    buffer: textPdfFixture(text),
  });
  // The first upload loads PDF.js and its worker before extraction can start.
  await expect(page.getByLabel('Paste your document', { exact: true })).toHaveValue(text, {
    timeout: 20_000,
  });
  await expect(page.getByRole('button', { name: 'Upload a file', exact: true })).toBeEnabled();
  expect(assistanceCalls).toBe(0);
  await page.getByLabel('Upload legal document').setInputFiles({
    name: 'unreadable.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('not a PDF'),
  });
  await expect(page.getByRole('alert')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByLabel('Paste your document', { exact: true })).toHaveValue(text);
});

test('clearing a pending review aborts it and does not resurrect the old document', async ({
  page,
}) => {
  let release: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/assist', async (route) => {
    await pending;
    await route.fulfill({ json: { result: SAMPLE_ANALYSIS } });
  });
  await page.goto('/');
  await page.getByLabel('Paste your document', { exact: true }).fill(SAMPLE_DOCUMENT);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Make it clear' }).click();
  await expect(page.getByText('Reading clauses and checking source quotations.')).toBeVisible();
  await page.getByRole('button', { name: 'New document', exact: true }).click();
  release?.();
  await expect(page.getByLabel('Paste your document', { exact: true })).toHaveValue('');
  await expect(page.getByRole('heading', { name: 'Read between the lines.' })).not.toBeVisible();
});
