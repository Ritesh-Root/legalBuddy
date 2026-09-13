/** Guided sample questions are fixed, disclosed examples rather than generated responses. */
import { SAMPLE_ANALYSIS } from '../../domain/sample';
import type { Analysis } from '../../domain/types';

/** Curated prompts demonstrate grounded answers before a reader uploads real text. */
export const SAMPLE_QUESTIONS = [
  'When do I get paid?',
  'Can I show this in my portfolio?',
  'What happens if the client cancels?',
];

/** Sample responses reference only the fictional sample and expose their limitations. */
export function sampleAnswer(question: string): Analysis {
  const common = {
    ...SAMPLE_ANALYSIS,
    title: 'Your question, grounded in the document',
    obligations: [],
  };
  if (question === SAMPLE_QUESTIONS[1])
    return {
      ...common,
      answer:
        'The agreement says you need the client’s written consent before displaying the work in a portfolio. It does not set a process or deadline for obtaining that consent. Ask whether portfolio use can be agreed in writing upfront.',
      findings: [
        {
          title: 'Portfolio use requires written consent',
          attention: 'review',
          explanation: 'The restriction expressly covers displaying this work in a portfolio.',
          quote:
            "The Designer may not display the work in a portfolio without the Client's written consent.",
          source: 'original',
          question: 'Can permission for portfolio display be included in the agreement?',
        },
      ],
    };
  if (question === SAMPLE_QUESTIONS[2])
    return {
      ...common,
      answer:
        'The client can terminate by written notice. The wording pays you only for deliverables the client has accepted. It does not explain payment for work in progress or give you an equivalent exit right. The text alone cannot determine what rights local law may provide.',
      findings: SAMPLE_ANALYSIS.findings.filter((finding) => finding.title.includes('exit right')),
    };
  return {
    ...common,
    answer:
      'The ₹60,000 fee is split into a 50% payment before work begins and a 50% balance payable within 60 days of final delivery. The final payment also depends on client “satisfaction,” which is undefined. The exact calendar due date cannot be calculated without the final delivery date.',
    findings: SAMPLE_ANALYSIS.findings.filter((finding) => finding.title.includes('Final payment')),
  };
}
