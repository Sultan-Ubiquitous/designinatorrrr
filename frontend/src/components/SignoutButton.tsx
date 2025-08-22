'use client';
import { authClient } from "@/utils/auth-client";
import { useRouter } from "next/navigation"

export default function SignoutButton() {
    const router = useRouter();
    const signOut = async() => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push('/signin')
                },
            },
        });
    };
    return (
    <button className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-colors"
    onClick={signOut}
    >
        <p>Sign Out</p>
    </button>
  );
};