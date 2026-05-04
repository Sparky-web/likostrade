"use client";

import { useForm } from "@tanstack/react-form";
import { typo, typoRaw } from "lib";
import { zodRussian } from "lib/src/zodRussian";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { toast } from "sonner";

import { useSetUser } from "../hooks/useSetUser";
import { Button } from "../ui/button";
import type { FormField } from "./Form";
import { FormFields } from "./Form/FormFields";
import { SimpleCard } from "./SimpleCard";
import { Text } from "./Text";
import { VStack } from "./VStack";

const formFields: FormField[] = [
  {
    name: "email",
    label: typo(`Email`),
    type: "text",
    validator: zodRussian.string().email(),
  },
  {
    name: "password",
    label: typo(`Пароль`),
    type: "text",
    validator: zodRussian.string().min(8),
    inputProps: {
      type: "password",
    },
  },
];

interface SignInCardProps {
  disableSignUp?: boolean;
  redirectTo?: string;
}

export function SignInCard({ disableSignUp, redirectTo }: SignInCardProps) {
  const setUser = useSetUser();
  const navigation = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value: { email, password } }) => {
      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          console.error(result.error);
          throw new Error(result.error);
        }

        const session = await getSession();
        if (session?.user) {
          setUser(session.user);
        }

        navigation.push(redirectTo ?? "/");

        toast.success(typo(`Вход выполнен`));
      } catch {
        toast.error(typo(`Неверный логин или пароль`));
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <SimpleCard title={typo("Вход")} className="w-lg max-w-full" size="lg">
      <form onSubmit={handleSubmit}>
        <VStack gap="xl">
          <VStack gap="md">
            <FormFields fields={formFields} form={form} />
          </VStack>
          <form.Subscribe selector={({ isSubmitting, canSubmit }) => ({ canSubmit, isSubmitting })}>
            {({ canSubmit, isSubmitting }) => (
              <Button className="w-full" size={"lg"} type="submit" isLoading={isSubmitting} disabled={!canSubmit}>
                {typo("Войти")}
              </Button>
            )}
          </form.Subscribe>
          {!disableSignUp && (
            <Text variant="small">
              {typoRaw("Если у вас нет аккаунта - {link}", {
                link: (
                  <Link href={"/auth/signup"} className="text-primary">
                    {typo("нажмите здесь, чтобы зарегистрироваться")}
                  </Link>
                ),
              })}
            </Text>
          )}
        </VStack>
      </form>
    </SimpleCard>
  );
}
