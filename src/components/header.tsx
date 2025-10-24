"use client";

import { Search, Menu, HelpCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { useAuth } from '../components/AuthManager'; 
import { useRouter } from 'next/navigation';

export function Header() {
    const { currentUser, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <header className="border-b border-[#2c3e50] bg-[#1f2937]">
            <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-4">
                {/* Logo - Agora é um Link para a página inicial */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white rounded-sm" />
                    </div>
                    <span className="text-xl font-bold text-white">Poolmarket</span>
                    <span className="text-lg">🇺🇸</span>
                </Link>

                {/* Search Bar - Não alterado */}
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search polymarket"
                        className="pl-10 bg-[#2c3e50] border-[#3d5266] text-white placeholder:text-gray-500"
                    />
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-600 bg-[#1f2937] px-1.5 font-mono text-xs text-gray-400">
                        /
                    </kbd>
                </div>

                {/* Right Side - FUNCIONALIDADE DE AUTENTICAÇÃO */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-[#2c3e50]">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        How it works
                    </Button>

                    {currentUser ? (
                        <>
                            {/* Botão de Dashboard */}
                            <Link href="/dashboard" passHref>
                                <Button variant="ghost" className="text-white hover:bg-[#2c3e50]">
                                    <User className="h-4 w-4 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                            {/* Botão de Logout */}
                            <Button 
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white" 
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Botão Log In - Aponta para /login */}
                            <Link href="/login" passHref>
                                <Button variant="ghost" className="text-white hover:bg-[#2c3e50]">
                                    Log In
                                </Button>
                            </Link>
                            {/* Botão Sign Up - Aponta para /login, mantendo o estilo original */}
                            <Link href="/login" passHref>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Sign Up
                                </Button>
                            </Link>
                        </>
                    )}
                    
                    <Button variant="ghost" size="icon" className="text-white hover:bg-[#2c3e50]">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}