// "use client";

// import Card from "~/components/custom/card";
// import { H1, H2, P } from "~/components/ui/typography";
// import Image from "next/image";
// import { Button } from "~/components/ui/button";
// import Link from "next/link";
// import { getSession, signIn } from "next-auth/react";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";
// import { useForm } from "@tanstack/react-form";

// import { FormTextField } from "~/components/custom/form/form/form-text-field";
// import { z } from "~/lib/zod-russian";
// import { useSetUser } from "~/app/_lib/user-context";
// import { api } from "~/trpc/react";

// export function RegisterCard() {
//   const setUser = useSetUser();

//   const { mutateAsync: register } = api.auth.register.useMutation();

//   const form = useForm({
//     defaultValues: {
//       groupId: null,
//       teacherId: null,
//       role: 1,
//       name: "",
//       email: "",
//       password: "",
//       confirmPassword: "",
//     },
//     onSubmit: async (data) => {
//       try {
//         if (!data.value.password || !data.value.confirmPassword)
//           throw new Error("пароли не совпадают");

//         const { name, email, password } = data.value;

//         await register({ name, email, password });

//         const res = await signIn("credentials", {
//           email,
//           password,
//           redirect: false,
//         });

//         if (res?.error) {
//           console.error(res.error);
//           throw new Error(res.error);
//         }
//         const session = await getSession();

//         if (session?.user) {
//           setUser(session.user);
//         }

//         toast.success("Регистрация прошла успешно");
//         form.reset();

//         navigation.push("/");
//       } catch (e: any) {
//         toast.error("Ошибка регистрации: " + e.message);
//       }
//     },
//   });

//   const navigation = useRouter();

//   return (
//     <Card className="w-[500px] max-w-full p-6">
//       <form
//         className="grid gap-9"
//         onSubmit={(e) => {
//           e.preventDefault();
//           form.handleSubmit();
//         }}
//       >
//         <div className="flex flex-wrap justify-between gap-4">
//           <H2>Прорыв</H2>
//         </div>

//         <div className="grid gap-4">
//           <div className="grid gap-2 md:text-center">
//             <H1 className="text-[24px] max-md:text-[20px]">
//               Регистрация на платформе
//             </H1>
//           </div>
//           <div className="grid gap-3">
//             <form.Field
//               name="name"
//               validators={{
//                 onChange: z.string().min(1),
//               }}
//             >
//               {(field) => (
//                 <FormTextField
//                   field={field}
//                   label="Имя"
//                   inputProps={{ placeholder: "Ваше имя" }}
//                 />
//               )}
//             </form.Field>

//             <form.Field
//               name="email"
//               validators={{
//                 onChange: z.string().email(),
//               }}
//             >
//               {(field) => (
//                 <FormTextField
//                   field={field}
//                   label="Email"
//                   inputProps={{ placeholder: "Ваш email" }}
//                 />
//               )}
//             </form.Field>

//             <form.Field
//               name="password"
//               validators={{
//                 onChange: z.string().min(8),
//               }}
//             >
//               {(field) => (
//                 <FormTextField
//                   field={field}
//                   label="Пароль"
//                   inputProps={{
//                     placeholder: "Ваш пароль",
//                     type: "password",
//                   }}
//                 />
//               )}
//             </form.Field>

//             <form.Field
//               name="confirmPassword"
//               validators={{
//                 onChange: z.string().min(8),
//               }}
//             >
//               {(field) => (
//                 <FormTextField
//                   field={field}
//                   label="Повторите пароль"
//                   inputProps={{
//                     placeholder: "Ваш пароль",
//                     type: "password",
//                   }}
//                 />
//               )}
//             </form.Field>
//             <form.Subscribe
//               selector={(form) => [
//                 form.isPristine,
//                 form.isSubmitting,
//                 form.canSubmit,
//               ]}
//             >
//               {([isPristine, isSubmitting, canSubmit]) => (
//                 <Button
//                   disabled={isPristine || isSubmitting || !canSubmit}
//                   type="submit"
//                   size={"lg"}
//                 >
//                   Зарегистрироваться
//                 </Button>
//               )}
//             </form.Subscribe>

//             <P className="mt-3 text-sm leading-6 md:text-center">
//               Если у Вас уже есть учетная запись -{" "}
//               <Link href={"/auth/signin"} className="text-primary">
//                 нажмите здесь, чтобы войти
//               </Link>
//             </P>
//           </div>
//         </div>
//       </form>
//     </Card>
//   );
// }
