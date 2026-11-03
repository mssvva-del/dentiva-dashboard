import { SignUp } from "@clerk/nextjs";
import { MetaPixelEvent, RememberSource } from "@/components/analytics/meta-pixel";

export default function SignUpPage() {
  return (
    <>
      {/* Arriving from an ad, the URL carries fbclid; the pixel turns it into the
          click cookie that ties the trial below back to that ad. */}
      <MetaPixelEvent event="PageView" />
      <RememberSource />
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/login"
        forceRedirectUrl="/"
      />
    </>
  );
}
