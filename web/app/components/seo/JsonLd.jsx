/**
 * Structured data. type="application/ld+json" is not executed, so it does not need a CSP hash.
 * @param {{ data: object }} props
 */
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      // The data is built from /content and static strings only, never from visitor input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
