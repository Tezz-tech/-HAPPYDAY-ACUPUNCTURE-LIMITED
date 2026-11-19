const TONES = {
  awaiting_payment: ['Awaiting payment', 'gold'],
  payment_submitted: ['Payment sent, check it', 'alert'],
  confirmed: ['Confirmed', 'green'],
  completed: ['Completed', 'quiet'],
  cancelled: ['Cancelled', 'quiet'],
  no_show: ['No-show', 'alert'],
  expired: ['Expired', 'quiet'],
};

/**
 * A booking status as a coloured chip. The same wording and colours are used on every admin screen.
 * @param {{ status: string }} props
 */
export function StatusChip({ status }) {
  const [label, tone] = TONES[status] ?? [status.replace('_', ' '), 'quiet'];
  return <span className={`adm-chip adm-chip-${tone}`}>{label}</span>;
}
