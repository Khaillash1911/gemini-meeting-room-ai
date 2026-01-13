"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        setError("");
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, data.email, data.password);
            } else {
                await createUserWithEmailAndPassword(auth, data.email, data.password);
            }
            router.push("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl overflow-hidden p-8 border border-gray-700">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            {...register("email", { required: "Email is required" })}
                            type="email"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="you@example.com"
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 chars" } })}
                            type="password"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="hover:text-white transition-colors underline decoration-gray-600 underline-offset-4"
                    >
                        {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <Link href="/" className="text-gray-500 hover:text-gray-300 text-xs">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
