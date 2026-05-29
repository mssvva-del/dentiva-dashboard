import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy px-4">
      <div className="mb-8 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-teal" aria-hidden />
        <span className="font-display text-2xl font-semibold tracking-tight text-white">
          {APP_NAME}
        </span>
      </div>
      {children}
    </main>
  );
}
