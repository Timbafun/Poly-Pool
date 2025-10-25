"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthManager';
import { useRouter } from 'next/navigation';

function LoginPage() {
    const { register, currentUser, login, isLoading } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [error, setError] = useState('');

    // **CORREÇÃO CRÍTICA**: Redirecionamento dentro do useEffect.
    // Isso garante que router.push() só seja chamado no lado do cliente (browser),
    // após a montagem do componente, evitando o erro de SSR.
    useEffect(() => {
        if (!isLoading && currentUser) {
            router.push('/dashboard');
        }
    }, [currentUser, isLoading, router]);

    if (isLoading) {
        return <div className="text-center p-12 text-lg text-[var(--primary-foreground)]">Carregando...</div>;
    }
    
    // Retorna null enquanto espera o useEffect redirecionar
    if (currentUser) {
        return null;
    }

    const formatarCpf = (value) => value.replace(/\D/g, '').slice(0, 11);
    const formatarTelefone = (value) => value.replace(/\D/g, '').slice(0, 11);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isLoginMode) {
                await login(email, password);
                // O redirecionamento após o login será tratado automaticamente pelo useEffect
            } else {
                if (password.length < 6) {
                    setError('A senha deve ter no mínimo 6 caracteres.');
                    return;
                }
                if (password !== confirmPassword) {
                    setError('A senha e a confirmação de senha não coincidem.');
                    return;
                }
                
                await register(email, password, nome, cpf, telefone);
                // O redirecionamento após o registro será tratado automaticamente pelo useEffect
            }
        } catch (err) {
            console.error("Erro no Firebase Auth:", err); 
            let errorMessage = 'Ocorreu um erro. Verifique seus dados.';
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                errorMessage = 'E-mail ou senha inválidos.';
            } else if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'Este e-mail já está cadastrado. Tente fazer login.';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'O formato do e-mail é inválido.';
            } else if (err.code === 'auth/too-many-requests') {
                 errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
            }

            setError(errorMessage);
        }
    };
    
    return (
        <div className="max-w-sm mx-auto my-20 p-6 rounded-xl shadow-2xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)]">
            <h2 className="text-center text-2xl font-bold mb-6 text-[var(--primary-foreground)]">
                {isLoginMode ? 'Acessar Conta' : 'Criar Nova Conta'}
            </h2>
            
            {error && <p className="bg-[var(--destructive)] text-[var(--destructive-foreground)] p-3 rounded mb-4 text-sm text-center font-medium">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {!isLoginMode && (
                    <>
                        <input 
                            type="text" 
                            placeholder="Nome Completo" 
                            value={nome} 
                            onChange={(e) => setNome(e.target.value)} 
                            className="w-full p-3 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:ring-[var(--ring)] focus:border-[var(--ring)] outline-none transition-colors"
                            required 
                        />
                        <input 
                            type="text" 
                            placeholder="CPF (somente números)" 
                            value={cpf} 
                            onChange={(e) => setCpf(formatarCpf(e.target.value))} 
                            maxLength="11" 
                            className="w-full p-3 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:ring-[var(--ring)] focus:border-[var(--ring)] outline-none transition-colors"
                            required 
                        />
                        <input 
                            type="tel" 
                            placeholder="Telefone (DDD + Número)" 
                            value={telefone} 
                            onChange={(e) => setTelefone(formatarTelefone(e.target.value))} 
                            maxLength="11" 
                            className="w-full p-3 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:ring-[var(--ring)] focus:border-[var(--ring)] outline-none transition-colors"
                            required 
                        />
                    </>
                )}
                
                <input 
                    type="email" 
                    placeholder="E-mail" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full p-3 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:ring-[var(--ring)] focus:border-[var(--ring)] outline-none transition-colors"
                    required 
                />
                
                <input 
                    type="password" 
                    placeholder="Senha (mín. 6 caracteres)" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full p-3 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:ring-[var(--ring)] focus:border-[var(--ring)] outline-none transition-colors"
                    required 
                />

                {!isLoginMode && (
                    <input 
                        type="password" 
                        placeholder="Confirmação de Senha" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        className="w-full p-3 rounded-md bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] focus:ring-[var(--ring)] focus:border-[var(--ring)] outline-none transition-colors"
                        required 
                    />
                )}
                
                <button type="submit" 
                        disabled={isLoading}
                        className="w-full p-3 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoginMode ? 'Entrar' : 'Cadastrar e Entrar'}
                </button>
            </form>

            <button 
                onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
                className="w-full mt-4 text-[var(--foreground)] hover:text-[var(--primary)] text-sm bg-transparent border-none cursor-pointer p-2 underline transition-colors"
            >
                {isLoginMode ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Faça Login'}
            </button>
        </div>
    );
}

export default LoginPage;