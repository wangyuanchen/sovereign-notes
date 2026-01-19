import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">
            SOVEREIGN <span className="text-sky-400">NOTES</span>
          </h1>
          <p className="text-zinc-400 text-sm">登录到你的加密笔记</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-zinc-900 border border-zinc-800",
            }
          }}
        />
      </div>
    </div>
  );
}
