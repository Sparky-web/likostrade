import { Container, SignInCard, VStack } from "~/components";

export default function LoginPage() {
  return (
    <Container>
      <VStack className="py-section" align="center" justify="center">
        <SignInCard disableSignUp redirectTo="/admin" />
      </VStack>
    </Container>
  );
}
