interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-rose-300 dark:border-rose-500/40 bg-red-50 dark:bg-red-500/15 px-4 py-3 text-red-700 dark:text-red-300"
    >
      <p>{message}</p>
    </div>
  );
}
