/** Browser-level request counts prove private reuse and reset without changing the user journey. */
import { test, expect, type Page } from '@playwright/test';
import { SAMPLE_ANALYSIS, SAMPLE_DOCUMENT } from '../../src/domain/sample';

async function review(page: Page): Promise<void> {
  await page.getByLabel('Paste your document', { exact: true }).fill(SAMPLE_DOCUMENT);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Make it clear', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Read between the lines.' })).toBeVisible();
  await page.getByRole('button', { name: 'Ask a question', exact: true }).click();
}

test('three identical questions need one request and New document clears reuse', async ({
  page,
}) => {
  let requests = 0;
  await page.route('**/api/health', (route) =>
    route.fulfill({ json: { status: 'ok', aiConfigured: true } }),
  );
  await page.route('**/api/assist', (route) => {
    requests += 1;
    return route.fulfill({
      json: { result: { ...SAMPLE_ANALYSIS, answer: 'The balance is due within 60 days.' } },
    });
  });
  await page.goto('/');
  await review(page);
  await page.getByLabel('Your question', { exact: true }).fill('When is the final payment due?');
  for (let index = 0; index < 3; index++) {
    await page.getByRole('button', { name: 'Ask about this document', exact: true }).click();
    await expect(page.locator('.answer-card')).toContainText('within 60 days');
    await expect(
      page.getByRole('button', { name: 'Ask about this document', exact: true }),
    ).toBeEnabled();
  }
  expect(requests).toBe(2); // One review plus one question; repeated questions use that workspace's result.
  await page.getByRole('button', { name: 'New document', exact: true }).click();
  await review(page);
  await page.getByLabel('Your question', { exact: true }).fill('When is the final payment due?');
  await page.getByRole('button', { name: 'Ask about this document', exact: true }).click();
  await expect(page.locator('.answer-card')).toContainText('within 60 days');
  expect(requests).toBe(4);
});
