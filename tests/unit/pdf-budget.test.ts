/** Stop oversized PDFs before processing remaining pages and always release the worker. */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { extractPdfText } from '../../src/features/documents/pdf-reader';

const mocks = vi.hoisted(() => ({ getPage: vi.fn(), destroy: vi.fn(), pages: 3 }));
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {},
  getDocument: () => ({
    promise: Promise.resolve({ numPages: mocks.pages, getPage: mocks.getPage }),
    destroy: mocks.destroy,
  }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.pages = 3;
  mocks.destroy.mockResolvedValue(undefined);
});

describe('PDF extraction budget', () => {
  it('stops on the first page that exceeds the total text budget', async () => {
    mocks.getPage.mockResolvedValue({
      getTextContent: () =>
        Promise.resolve({
          items: [{ str: 'x'.repeat(40_001), hasEOL: false }],
        }),
    });
    await expect(extractPdfText(new ArrayBuffer(0))).rejects.toThrow('40,000');
    expect(mocks.getPage).toHaveBeenCalledTimes(1);
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });
  it('keeps readable text and line boundaries while releasing the worker', async () => {
    mocks.pages = 1;
    mocks.getPage.mockResolvedValue({
      getTextContent: () =>
        Promise.resolve({
          items: [
            { str: 'Payment', hasEOL: true },
            { str: 'within 15 days.', hasEOL: false },
            { type: 'marked-content' },
          ],
        }),
    });
    expect(await extractPdfText(new ArrayBuffer(0))).toBe('Payment\nwithin 15 days. ');
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });
  it('rejects more than thirty pages without extracting any content', async () => {
    mocks.pages = 31;
    await expect(extractPdfText(new ArrayBuffer(0))).rejects.toThrow('30 pages');
    expect(mocks.getPage).not.toHaveBeenCalled();
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });
});
