import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg))] bg-pattern">
      <div className="w-full max-w-md">
        <SignUp />
      </div>
    </div>
  );
}
