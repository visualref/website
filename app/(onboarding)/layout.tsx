export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The onboarding page provides its own split-screen shell.
  return <>{children}</>;
}
