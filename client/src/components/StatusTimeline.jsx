/* © 2026 Eden Jewelry. All rights reserved. */
import { STATUS_STEPS, capitalize, formatDate } from '../utils/format.js';

// requested -> confirmed -> shipped -> delivered (or cancelled)
export default function StatusTimeline({ order }) {
  if (order.status === 'cancelled') {
    return <p className="status-cancelled">This order was cancelled.</p>;
  }
  const reached = STATUS_STEPS.indexOf(order.status);
  const dateOf = (step) => order.history?.find((h) => h.status === step)?.at;

  return (
    <ol className="timeline" aria-label={`Order status: ${order.status}`}>
      {STATUS_STEPS.map((step, i) => (
        <li key={step} className={`timeline-step ${i <= reached ? 'is-done' : ''} ${i === reached ? 'is-current' : ''}`}>
          <span className="timeline-dot" aria-hidden="true" />
          <span className="timeline-label">{capitalize(step)}</span>
          {dateOf(step) && <span className="timeline-date">{formatDate(dateOf(step))}</span>}
        </li>
      ))}
    </ol>
  );
}
