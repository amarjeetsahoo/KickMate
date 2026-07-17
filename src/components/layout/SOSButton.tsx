interface SOSButtonProps {
  onClick: () => void;
}

export function SOSButton({ onClick }: SOSButtonProps) {
  return (
    <button
      id="sos-floating-button"
      className="sos-fab"
      onClick={onClick}
      aria-label="Emergency SOS - tap for immediate help"
      title="Emergency Help"
    >
      <span aria-hidden="true">🆘</span>
    </button>
  );
}
