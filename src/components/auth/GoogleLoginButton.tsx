'use client';

import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { signIn } from 'next-auth/react';

interface GoogleLoginButtonProps {
  disabled?: boolean;
}

export function GoogleLoginButton({ disabled = false }: GoogleLoginButtonProps) {
  return (
    <button
      onClick={() => signIn("google", { redirectTo: "/" })}
      disabled={disabled}
      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
    >
      <FcGoogle className="w-5 h-5 mr-3" />
      Continuar con Google
    </button>
  );
}
