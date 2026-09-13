/** Fictional, human-authored contract and explicitly labeled walkthrough results. */
import type { Analysis, ReaderContext } from './types';

/** Short sample that makes every quoted observation independently inspectable. */
export const SAMPLE_DOCUMENT = `FREELANCE DESIGN AGREEMENT
Between Studio North (Client) and Alex Morgan (Designer)
Fictional sample · 12 September 2026

1. SCOPE OF WORK
The Designer will deliver a brand identity package consisting of a logo, color palette, and a five-page brand guide. The fee includes two rounds of revisions. Additional revisions require a separate written agreement.

2. PAYMENT
The total project fee is INR 60,000. The Client will pay 50% before work begins. The remaining 50% is payable within 60 days of final delivery. Payment is subject to the Client's satisfaction with the deliverables.

3. OWNERSHIP
All intellectual property rights in the deliverables transfer to the Client upon creation, regardless of whether payment has been received. The Designer may not display the work in a portfolio without the Client's written consent.

4. TERMINATION
The Client may terminate this agreement at any time with written notice. On termination, the Designer will be paid only for deliverables accepted by the Client. No equivalent termination right is specified for the Designer.

5. LIABILITY
The Designer shall indemnify the Client against all losses arising from the project, including indirect losses. No monetary limit on the Designer's liability is stated in this agreement.

6. CONFIDENTIALITY
Both parties must keep non-public project information confidential for two years after the project ends. Disclosure required by law is permitted.

7. TIMELINE AND DISPUTES
Final delivery is due 30 days after receipt of the initial payment and all required materials. The parties will first attempt to resolve disputes through discussion. This agreement does not specify governing law or a dispute forum.`;

/** A revised fictional document for the comparison walkthrough. */
export const SAMPLE_REVISED = SAMPLE_DOCUMENT.replace(
  "within 60 days of final delivery. Payment is subject to the Client's satisfaction with the deliverables.",
  'within 15 days of final delivery. Payment is due on delivery of the agreed scope.',
)
  .replace(
    'upon creation, regardless of whether payment has been received.',
    'only after the full project fee has been received.',
  )
  .replace(
    'The Client may terminate this agreement at any time with written notice.',
    'Either party may terminate this agreement with 14 days of written notice.',
  );

/** Context is fixed in the sample so it is never misrepresented as personalized output. */
export const SAMPLE_CONTEXT: ReaderContext = {
  role: 'Freelancer',
  jurisdiction: 'India · state not specified',
  concern: 'Getting paid and protecting ownership of my work.',
};

/** Curated findings use exact quotations from the fictional sample. */
export const SAMPLE_ANALYSIS: Analysis = {
  title: 'Freelance design agreement',
  summary:
    'A ₹60,000 branding project between a designer and Studio North. The scope is defined, but payment, ownership, and liability deserve a closer look before you sign.',
  answer: '',
  findings: [
    {
      title: 'You could hand over ownership before being paid',
      attention: 'priority',
      explanation:
        'The wording transfers ownership as soon as the work is created. The unpaid balance does not delay that transfer. Ask a lawyer how payment and ownership could be linked in this agreement.',
      quote:
        'All intellectual property rights in the deliverables transfer to the Client upon creation, regardless of whether payment has been received.',
      source: 'original',
      question: 'Could ownership transfer only after the full fee is received?',
    },
    {
      title: 'Final payment depends on an undefined condition',
      attention: 'priority',
      explanation:
        'The balance has a 60-day payment window, and “satisfaction” has no stated test or acceptance deadline. It is unclear how a disagreement about satisfaction would affect payment.',
      quote: "Payment is subject to the Client's satisfaction with the deliverables.",
      source: 'original',
      question: 'Can we define objective acceptance criteria and a deadline for feedback?',
    },
    {
      title: 'The liability wording has no stated cap',
      attention: 'review',
      explanation:
        'The clause includes indirect losses and gives no monetary ceiling. This flags wording to discuss; it does not establish whether the clause would be enforceable.',
      quote: "No monetary limit on the Designer's liability is stated in this agreement.",
      source: 'original',
      question:
        'What categories of loss and liability limit would be appropriate for this project?',
    },
    {
      title: 'Only the client has an express exit right',
      attention: 'review',
      explanation:
        'The client can end the agreement on written notice. Payment is limited to accepted deliverables, leaving work in progress uncertain.',
      quote:
        'On termination, the Designer will be paid only for deliverables accepted by the Client.',
      source: 'original',
      question:
        'How will completed work and work in progress be paid if either party ends the project?',
    },
    {
      title: 'The revision boundary is clearly described',
      attention: 'info',
      explanation:
        'Two rounds are included. Additional rounds need a separate written agreement, giving the parties a way to document changes to scope.',
      quote:
        'The fee includes two rounds of revisions. Additional revisions require a separate written agreement.',
      source: 'original',
      question: 'What counts as one round of revisions, and how will additional fees be agreed?',
    },
  ],
  obligations: [
    {
      task: 'Pay the initial ₹30,000 before work starts',
      owner: 'Client',
      timing: 'Before work begins',
      quote: 'The Client will pay 50% before work begins.',
      source: 'original',
    },
    {
      task: 'Deliver the agreed brand identity package',
      owner: 'Designer',
      timing: '30 days after payment and materials arrive',
      quote:
        'Final delivery is due 30 days after receipt of the initial payment and all required materials.',
      source: 'original',
    },
    {
      task: 'Keep non-public project information confidential',
      owner: 'Both parties',
      timing: 'For two years after the project ends',
      quote:
        'Both parties must keep non-public project information confidential for two years after the project ends.',
      source: 'original',
    },
  ],
  nextSteps: [
    'Ask for written acceptance criteria and a payment deadline.',
    'Discuss linking ownership transfer to receipt of the full fee.',
    'Bring both versions and any project emails to a qualified lawyer.',
  ],
  missingInformation: [
    'Governing law, state, and dispute forum are not specified.',
    'No process is provided for assessing client satisfaction.',
    'This review cannot determine enforceability or account for agreements outside this text.',
  ],
};

/** Comparison observes changed wording without declaring either version legally safe. */
export const SAMPLE_COMPARISON: Analysis = {
  title: 'Three wording changes to understand',
  summary:
    'The revision changes payment timing, ownership transfer, and termination notice. Liability and payment for work in progress still deserve discussion.',
  answer: '',
  findings: [
    {
      title: 'Payment window changes from 60 to 15 days',
      attention: 'info',
      explanation:
        'The revised wording removes the satisfaction condition and shortens the final payment window. Confirm that the agreed scope is precise.',
      quote:
        'The remaining 50% is payable within 15 days of final delivery. Payment is due on delivery of the agreed scope.',
      source: 'revised',
      question:
        'Does the scope give both parties a clear way to determine when delivery is complete?',
    },
    {
      title: 'Ownership now waits for full payment',
      attention: 'info',
      explanation:
        'The original transferred ownership on creation. The revision makes receipt of the full fee the trigger.',
      quote:
        'All intellectual property rights in the deliverables transfer to the Client only after the full project fee has been received.',
      source: 'revised',
      question: 'Should any permitted use before full payment be defined?',
    },
    {
      title: 'Both parties receive an exit right',
      attention: 'review',
      explanation:
        'The revision introduces 14 days of notice for either party, but the accepted-deliverables payment wording is unchanged. The later sentence about no equivalent right is also unchanged and now conflicts with this new wording.',
      quote: 'Either party may terminate this agreement with 14 days of written notice.',
      source: 'revised',
      question:
        'Can the inconsistent sentence be removed and payment for work in progress clarified?',
    },
  ],
  obligations: SAMPLE_ANALYSIS.obligations,
  nextSteps: [
    'Reconcile the contradictory termination sentences in the revision.',
    'Discuss the unchanged liability clause.',
    'Save both versions and verify each negotiated change with a lawyer.',
  ],
  missingInformation: SAMPLE_ANALYSIS.missingInformation,
};
