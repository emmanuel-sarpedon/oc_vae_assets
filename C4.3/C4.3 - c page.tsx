import LoginForm from "@/components/LoginForm";
import { Suspense } from "react";

export default async function Login() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
