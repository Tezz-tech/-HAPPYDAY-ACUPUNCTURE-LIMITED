/**
 * Section label built from an acupoint code and its pinyin name (docs/02 §5.2), e.g. "ST36 · Zúsānlǐ".
 * @param {{ code: string, pinyin?: string, className?: string }} props
 */
export function AcupointLabel({ code, pinyin, className = '' }) {
  return (
    <span className={`label ${className}`.trim()}>
      <span className="label-code">{code}</span>
      {pinyin ? (
        <>
          <span className="label-point" aria-hidden="true" />
          <span className="label-pinyin">{pinyin}</span>
        </>
      ) : null}
    </span>
  );
}
