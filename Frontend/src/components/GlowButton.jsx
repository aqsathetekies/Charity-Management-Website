import './GlowButton.css';

export default function GlowButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`glow-btn glow-btn--${variant} ${fullWidth ? 'glow-btn--full' : ''} ${loading ? 'glow-btn--loading' : ''}`}
    >
      {loading ? (
        <span className="glow-btn__spinner" />
      ) : (
        <>
          {icon && <span className="glow-btn__icon">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
