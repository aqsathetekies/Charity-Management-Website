import './GlassCard.css';

export default function GlassCard({ children, className = '', hover = true, animate = true, delay = 0 }) {
  return (
    <div
      className={`glass-card ${hover ? 'glass-card--hover' : ''} ${animate ? 'animate-slide-up' : ''} ${className}`}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
