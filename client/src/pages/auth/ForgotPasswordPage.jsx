import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";

import AuthLayout from "./AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useForgotPasswordMutation } from "../../features/auth/authApiSlice";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (formData) => {
    try {
      await forgotPassword(formData).unwrap();
      setSent(true);
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent password reset instructions">
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          If an account exists with that email, a reset link is on its way. It expires in 15 minutes.
        </p>
        <Link to="/login">
          <Button variant="secondary" className="mt-6 w-full">
            Back to sign in
          </Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email to reset it">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          id="email"
          label="Email address"
          type="email"
          placeholder="you@emerson.edu"
          error={errors.email?.message}
          {...register("email")}
        />
        <Button type="submit" isLoading={isLoading} className="w-full">
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Remembered your password?{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
