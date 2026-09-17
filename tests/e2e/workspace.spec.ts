/** Browser journeys validate source navigation, consent, failure recovery, and accessibility. */
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  SAMPLE_ANALYSIS,
  SAMPLE_COMPARISON,
  SAMPLE_DOCUMENT,
  SAMPLE_REVISED,
} from '../../src/domain/sample';

async function accessible(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.map((violation) => ({
      rule: violation.id,
      nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
    })),
  ).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
}

test('sample journey connects findings, changed clauses, questions and the downloadable brief', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Before you sign');
  await accessible(page);
  await page.getByRole('button', { name: 'Explore the sample', exact: true }).click();
  await expect(page.getByText('Fictional document and curated explanations.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Read between the lines.' })).toBeVisible();
  await page.getByRole('button', { name: 'View in document', exact: true }).first().click();
  await expect(page.locator('.source-selected mark:visible')).toContainText('upon creation');
  await page.getByRole('button', { name: 'Discuss first', exact: true }).click();
  await expect(page.locator('.finding')).toHaveCount(2);
  await accessible(page);
  await page.getByRole('button', { name: 'Compare versions', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Three wording changes to understand' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'View in revised document' }).first().click();
  await expect(page.locator('.source-selected mark:visible')).toContainText('within 15 days');
  await accessible(page);
  await page.getByRole('button', { name: 'Ask a question', exact: true }).click();
  await page.getByRole('button', { name: 'Can I show this in my portfolio?' }).click();
  await expect(page.locator('.answer-card')).toContainText('written consent');
  await accessible(page);
  await page.getByRole('button', { name: 'Your lawyer brief', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your legal conversation brief' })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download brief' }).click();
  expect((await download).suggestedFilename()).toBe('legalbuddy-lawyer-brief.md');
  await accessible(page);
  await page.getByRole('button', { name: 'New document', exact: true }).click();
  await expect(page.getByLabel('Paste your document', { exact: true })).toHaveValue('');
});

test('consented custom review supports revision, Q&A, and escaped model output', async ({
  page,
}) => {
  await page.route('**/api/health', (route) =>
    route.fulfill({ json: { status: 'ok', aiConfigured: true } }),
  );
  await page.route('**/api/assist', async (route) => {
    const body: unknown = route.request().postDataJSON();
    if (typeof body !== 'object' || !body || !('action' in body))
      throw new Error('Missing request action');
    expect('consent' in body && body.consent).toBe(true);
    const result =
      body.action === 'compare'
        ? SAMPLE_COMPARISON
        : body.action === 'ask'
          ? {
              ...SAMPLE_ANALYSIS,
              answer:
                'The quoted clause says payment follows delivery. <script>alert("unsafe")</script>',
            }
          : SAMPLE_ANALYSIS;
    await route.fulfill({ json: { result } });
  });
  await page.goto('/');
  await page.getByLabel('Paste your document', { exact: true }).fill(SAMPLE_DOCUMENT);
  await expect(page.getByRole('button', { name: 'Make it clear' })).toBeDisabled();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Make it clear' }).click();
  await expect(page.getByRole('heading', { name: 'Read between the lines.' })).toBeVisible();
  await page.getByRole('button', { name: 'Compare versions', exact: true }).click();
  await page.getByLabel('Add the revised version').fill(SAMPLE_REVISED);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Compare versions', exact: true }).last().click();
  await expect(
    page.getByRole('heading', { name: 'Three wording changes to understand' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Ask a question', exact: true }).click();
  await page
    .getByLabel('Your question', { exact: true })
    .fill('When is the remaining payment due?');
  await page.getByRole('button', { name: 'Ask about this document' }).click();
  await expect(page.locator('.answer-card')).toContainText('<script>');
  await expect(page.locator('.answer-card script')).toHaveCount(0);
  await accessible(page);
});

test('provider failure preserves input, permits retry, and new document clears the draft', async ({
  page,
}) => {
  await page.route('**/api/assist', (route) =>
    route.fulfill({
      status: 502,
      json: {
        error: {
          code: 'PROVIDER_UNAVAILABLE',
          message: 'The AI provider is unavailable. Please retry.',
        },
      },
    }),
  );
  await page.goto('/');
  await page.getByLabel('Paste your document', { exact: true }).fill(SAMPLE_DOCUMENT);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Make it clear' }).click();
  await expect(page.getByRole('alert')).toContainText('Please retry');
  await expect(page.getByLabel('Paste your document', { exact: true })).toHaveValue(
    SAMPLE_DOCUMENT,
  );
  await expect(page.getByRole('button', { name: 'Make it clear' })).toBeEnabled();
  await accessible(page);
  await page.getByRole('button', { name: 'New document', exact: true }).click();
  await expect(page.getByLabel('Paste your document', { exact: true })).toHaveValue('');
  await expect(page.getByRole('checkbox')).not.toBeChecked();
});

test('text uploads stay local and invalid formats receive an actionable error', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Upload legal document').setInputFiles({
    name: 'agreement.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(SAMPLE_DOCUMENT),
  });
  await expect(page.getByLabel('Paste your document', { exact: true })).toHaveValue(
    SAMPLE_DOCUMENT,
  );
  await page.getByLabel('Upload legal document').setInputFiles({
    name: 'agreement.exe',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from('fake'),
  });
  await expect(page.getByRole('alert')).toContainText('Choose a text-based PDF');
  await accessible(page);
});

test('keyboard navigation exposes the skip link and empty panels explain the next step', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.getByRole('button', { name: 'Your lawyer brief', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Add a document', exact: true })).toBeVisible();
  await accessible(page);
});
