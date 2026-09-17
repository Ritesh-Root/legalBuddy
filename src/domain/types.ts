/** Shared request and result contracts for document-grounded legal assistance. */
import { z } from 'zod';

// Interpret schemas without eval so browser validation respects the strict CSP.
z.config({ jitless: true });

/** Bound processing costs and protect the reading experience. */
export const MAX_DOCUMENT_CHARACTERS = 40_000;
/** Local file size limit before parsing or sending any content. */
export const MAX_FILE_BYTES = 2 * 1024 * 1024;
const shortText = z.string().trim().min(1).max(800);
const evidence = {
  quote: z
    .string()
    .trim()
    .min(8)
    .max(1_200)
    .describe(
      'One verbatim contiguous excerpt from the labeled source. Never combine versions, add Original/Revised prefixes, or insert commentary or ellipses.',
    ),
  source: z.enum(['original', 'revised']),
};

/** Explanations may be localized; source quotations stay in the document’s language. */
export const explanationLanguages = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Bengali',
  'Marathi',
  'Kannada',
  'Malayalam',
  'Gujarati',
  'Punjabi',
] as const;

/** User-provided context remains data, never system instructions. */
export const contextSchema = z
  .object({
    role: z.enum(['Freelancer', 'Tenant', 'Employee', 'Small business', 'Other']),
    jurisdiction: z.string().trim().max(100),
    concern: z.string().trim().max(400),
    language: z.enum(explanationLanguages).default('English'),
  })
  .strict();

/** Every externally supplied field is bounded and unknown keys are rejected. */
export const requestSchema = z
  .object({
    action: z.enum(['review', 'compare', 'ask']),
    document: z.string().trim().min(80).max(MAX_DOCUMENT_CHARACTERS),
    revised: z.string().trim().max(MAX_DOCUMENT_CHARACTERS),
    question: z.string().trim().max(600),
    context: contextSchema,
    consent: z.literal(true),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.action === 'compare' && value.revised.length < 80) {
      context.addIssue({
        code: 'custom',
        path: ['revised'],
        message: 'Add at least 80 characters of the revised document.',
      });
    }
    if (value.action === 'ask' && value.question.length < 8) {
      context.addIssue({
        code: 'custom',
        path: ['question'],
        message: 'Ask a question with at least 8 characters.',
      });
    }
  });

/** Structured model output is verified again against the submitted documents. */
export const analysisSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    summary: z.string().trim().min(1).max(1_800),
    answer: z.string().trim().max(2_000),
    findings: z
      .array(
        z
          .object({
            title: z.string().trim().min(1).max(100),
            attention: z.enum(['priority', 'review', 'info']),
            explanation: shortText,
            question: shortText,
            ...evidence,
          })
          .strict(),
      )
      .max(10),
    obligations: z
      .array(
        z
          .object({
            task: shortText,
            owner: z.string().max(100),
            timing: z.string().max(160),
            ...evidence,
          })
          .strict(),
      )
      .max(10),
    nextSteps: z.array(shortText).min(1).max(6),
    missingInformation: z.array(shortText).max(6),
  })
  .strict();

/** Parsed input used by the AI service. */
export type AssistanceRequest = z.infer<typeof requestSchema>;
/** Reader context determines the focus of explanations. */
export type ReaderContext = z.infer<typeof contextSchema>;
/** A schema-checked explanation with source references. */
export type Analysis = z.infer<typeof analysisSchema>;
/** A single evidence-backed observation. */
export type Finding = Analysis['findings'][number];
/** Workspace actions share one document and reader context. */
export type WorkspaceTab = 'review' | 'compare' | 'ask' | 'brief';
