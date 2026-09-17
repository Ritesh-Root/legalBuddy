/** Reader context makes explanations useful without implying jurisdictional expertise. */
import type { ReactElement } from 'react';
import { contextSchema, explanationLanguages, type ReaderContext } from '../../domain/types';

/** All fields are labeled and the unspecified-jurisdiction option is explicit. */
export function ContextFields({
  value,
  onChange,
}: {
  value: ReaderContext;
  onChange: (value: ReaderContext) => void;
}): ReactElement {
  return (
    <div className="context-fields">
      <label>
        I’m reading this as
        <select
          name="reader-role"
          value={value.role}
          onChange={(event) =>
            onChange({ ...value, role: contextSchema.shape.role.parse(event.target.value) })
          }
        >
          {contextSchema.shape.role.options.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
      </label>
      <label>
        Jurisdiction <span className="optional">optional</span>
        <input
          name="jurisdiction"
          maxLength={100}
          placeholder="e.g. India, Maharashtra"
          value={value.jurisdiction}
          onChange={(event) => onChange({ ...value, jurisdiction: event.target.value })}
        />
      </label>
      <label>
        Explain in
        <select
          name="explanation-language"
          value={value.language}
          onChange={(event) =>
            onChange({
              ...value,
              language: contextSchema.shape.language.parse(event.target.value),
            })
          }
        >
          {explanationLanguages.map((language) => (
            <option key={language}>{language}</option>
          ))}
        </select>
        <span className="field-hint">Quotations stay in the document’s original wording.</span>
      </label>
      <label className="concern-field">
        What matters most to you? <span className="optional">optional</span>
        <input
          name="reader-concern"
          maxLength={400}
          placeholder="e.g. Payment timing, leaving the agreement…"
          value={value.concern}
          onChange={(event) => onChange({ ...value, concern: event.target.value })}
        />
      </label>
    </div>
  );
}
