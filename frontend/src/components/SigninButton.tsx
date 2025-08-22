'use client';
import { authClient } from "@/utils/auth-client"

export default function SigninButton() {
  const signin = async () => {
    try {
        await authClient.signIn.social({
            provider: 'google',
            
            callbackURL: "/sendhome"
        });
    } catch (error) {
        console.error("Sign in failed:", error);
    }
  }

  return (
    <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out flex items-center justify-center space-x-2 hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={signin}
    >
    <p className="font-medium text-gray-700">Sign in with Google</p>
</button>
  )
}