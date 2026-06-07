import type { Metadata } from "next";

import { Container, SignInCard, VStack } from "~/components";
import { websiteConstants } from "~/consts";

export const metadata: Metadata = {
  title: websiteConstants.SIGN_IN_METADATA_TITLE,
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Container>
      <VStack className="py-section" align="center" justify="center">
        <SignInCard disableSignUp redirectTo="/admin" />
      </VStack>
    </Container>
  );
}
