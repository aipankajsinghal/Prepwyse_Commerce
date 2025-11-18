import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg))] bg-pattern">
      <div className="w-full max-w-md">
        <SignIn />
      </div>
    </div>
  );
}
