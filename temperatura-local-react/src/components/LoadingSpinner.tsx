export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12" role="status">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-300 border-t-pink-500" />
      <span className="sr-only">Carregando...</span>
    </div>
  );
}
