import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth";
import { deleteIdInBrowserMemory, getIdInBrowserMemory, getSession, saveIdInBrowserMemory } from "@/lib/cookie";
import { getErrorMessage, toastError } from "@/lib/error";
import { zodResolver } from "@hookform/resolvers/zod";
import { isRedirectError } from "next/dist/client/components/redirect";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Suspense } from "react";

const formSchema = z.object({
  username: z.string({ message: "A renseigner" }).min(2),
  password: z.string({ message: "A renseigner" }),
  keepIdInMemory: z.boolean(),
});

export default async function Login() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();

  useEffect(() => {
    getSession().then(({ session }) => {
      if (session?.id) router.push("/caisse");
    });
  }, [router]);

  const error = useSearchParams().get("error");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", password: "", keepIdInMemory: false },
  });

  const { formState, setError } = form;

  useEffect(() => {
    if (error) setError("root", { message: error });
  }, [error, setError]);

  useEffect(() => {
    getIdInBrowserMemory().then((data) => {
      const { value } = data || {};

      if (value) {
        form.setValue("username", value);
        form.setValue("keepIdInMemory", true);
      }
    });
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (values.keepIdInMemory) await saveIdInBrowserMemory(values.username);
      else await deleteIdInBrowserMemory();

      const { error } = await login(values);
      if (error) {
        setError("root", { message: getErrorMessage(error).message });
        toastError(error);
      }
    } catch (e) {
      if (!isRedirectError(e)) {
        const message = e instanceof Error ? e.message : "Une erreur est survenue";
        toast.error(message);
        setError("root", { message });
      }
    }
  };

  return (
    <Form {...form}>
      <form className={"space-y-8"} onSubmit={form.handleSubmit(onSubmit)}>
        <div className={"flex flex-col gap-y-10 lg:grid lg:grid-cols-2 lg:gap-x-12"}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className={"lg:col-span-1"}>
                <FormLabel>Identifiant</FormLabel>
                <FormControl>
                  <Input {...field} type={"text"} className={"bg-white"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className={"lg:col-span-1"}>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input {...field} type={"password"} className={"bg-white"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="keepIdInMemory"
          render={({ field }) => {
            return (
              <Label className={"flex items-center"}>
                <Checkbox className={"mr-4"} checked={field.value} onCheckedChange={field.onChange}></Checkbox>Mémoriser mon identifiant
              </Label>
            );
          }}
        />

        <Button className={"mt-4 w-full"} type={"submit"} disabled={formState.isSubmitting}>
          Se connecter
        </Button>
      </form>

      <FormMessage className={"max-w-sm pt-6 text-center"}>{formState.errors.root?.message}</FormMessage>
    </Form>
  );
}

