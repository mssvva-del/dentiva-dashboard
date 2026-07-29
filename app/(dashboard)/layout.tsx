import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { OnboardingRedirect } from "@/components/auth/onboarding-redirect";
import { SetupBanner } from "@/components/features/setup-banner";
import { AssistantWidget } from "@/components/features/assistant-widget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Bounce a still-onboarding practice into the setup wizard. */}
      <OnboardingRedirect />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <SetupBanner />
          {children}
        </main>
      </div>
      {/* Floating help — available on every dashboard page. */}
      <AssistantWidget />
    </div>
  );
}
