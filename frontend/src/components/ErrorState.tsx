interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="glass p-8 text-center">
      <p className="text-danger font-mono text-sm mb-2">Error</p>
      <p className="text-text-secondary text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="glass glass-hover px-4 py-2 text-sm text-primary hover:text-primary-bright transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
