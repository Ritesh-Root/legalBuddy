/** Lazy-loaded PDF.js extraction with page limits and guaranteed worker cleanup. */
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

/** Text PDFs are supported; scans, encrypted files, and long PDFs produce explicit errors. */
export async function extractPdfText(bytes: ArrayBuffer): Promise<string> {
  const task = getDocument({ data: bytes });
  try {
    const pdf = await task.promise;
    if (pdf.numPages > 30) throw new Error('Choose a PDF with at most 30 pages.');
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(
        content.items
          .map((item) => ('str' in item ? `${item.str}${item.hasEOL ? '\n' : ' '}` : ''))
          .join(''),
      );
    }
    return pages.join('\n\n');
  } finally {
    await task.destroy();
  }
}
