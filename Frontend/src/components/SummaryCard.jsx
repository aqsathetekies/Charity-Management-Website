import './SummaryCard.css';

export default function SummaryCard({ icon, label, value, prefix = '', delay = 0 }) {
  return (
    <div className="summary-card animate-slide-up" style={{ animationDelay: `${delay}s` }}>
      <div className="summary-card__icon">{icon}</div>
      <div className="summary-card__info">
        <span className="summary-card__value">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</span>
        <span className="summary-card__label">{label}</span>
      </div>
      <div className="summary-card__glow" />
    </div>
  );
}
