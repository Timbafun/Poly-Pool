"use client";

import React, { useState } from 'react';
import { useAuth } from '../components/AuthManager';
import { useRouter } from 'next/router';

const styles = {
    container: { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif' },
    input: { display: 'block', width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' },
    button: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.3s', fontWeight: 'bold' },
    error: { color: '#dc3545', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', padding: '10px', borderRadius: '4px', textAlign: 'center', marginBottom: '15px' },
    linkButton: { width: '100%', padding: '10px 0', backgroundColor: 'transparent', color: '#007bff', border: 'none', cursor: 'pointer', marginTop: '10px', textDecoration: 'underline' }
};

function CadastroPage() {
    const { register, currentUser, login, isLoading } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(false);
    const [error, setError] = useState('');

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>Carregando...</div>;
    }
    
    if (currentUser) {
        router.push('/dashboard');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isLoginMode) {
                await login(email, password);
                router.push('/dashboard');
            } else {
                if (password.length < 6) {
                    setError('A senha deve ter no mínimo 6 caracteres.');
                    return;
                }
                
                await register(email, password, nome, cpf, telefone);
                router.push('/dashboard');
            }
        } catch (err) {
            let errorMessage = 'Ocorreu um erro. Verifique seus dados.';
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                errorMessage = 'Email ou senha inválidos.';
            } else if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'Este email já está cadastrado. Tente fazer login.';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'O formato do email é inválido.';
            }

            setError(errorMessage);
        }
    };
    
    const formatarCpf = (value) => value.replace(/\D/g, '').slice(0, 11);
    const formatarTelefone = (value) => value.replace(/\D/g, '').slice(0, 11);

    return (
        <div style={styles.container}>
            <h2 style={{ textAlign: 'center', color: '#007bff', marginBottom: '20px' }}>
                {isLoginMode ? 'Acessar PoolPoly' : 'Cadastre-se no PoolPoly'}
            </h2>
            
            {error && <p style={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="E-mail" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    style={styles.input} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Senha (mín. 6 caracteres)" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    style={styles.input} 
                    required 
                />
                
                {!isLoginMode && (
                    <>
                        <input 
                            type="text" 
                            placeholder="Nome Completo" 
                            value={nome} 
                            onChange={(e) => setNome(e.target.value)} 
                            style={styles.input} 
                            required 
                        />
                        <input 
                            type="text" 
                            placeholder="CPF (somente números)" 
                            value={cpf} 
                            onChange={(e) => setCpf(formatarCpf(e.target.value))} 
                            maxLength="11" 
                            style={styles.input} 
                            required 
                        />
                        <input 
                            type="tel" 
                            placeholder="Telefone (DDD + Número)" 
                            value={telefone} 
                            onChange={(e) => setTelefone(formatarTelefone(e.target.value))} 
                            maxLength="11" 
                            style={styles.input} 
                            required 
                        />
                    </>
                )}
                
                <button type="submit" style={styles.button}>
                    {isLoginMode ? 'Entrar' : 'Cadastrar e Entrar'}
                </button>
            </form>

            <button 
                onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
                style={styles.linkButton}
            >
                {isLoginMode ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Faça Login'}
            </button>
        </div>
    );
}

export default CadastroPage;