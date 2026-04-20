import Header from "./Header";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-hive-dark">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto">{children}</main>
      <footer className="py-4 text-center text-xs text-gray-600 border-t border-hive-border">
        No ads. No investors. No agenda. · HivePhoto
      </footer>
    </div>
  );
}
