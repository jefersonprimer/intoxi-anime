export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-[#1e73be]/20 border-t-[#1e73be]"
        role="status"
        aria-label="Carregando"
      />
    </div>
  );
}
