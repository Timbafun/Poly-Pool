import React, { useState } from 'react';
import { useAuth } from '../components/AuthManager';
import { useNavigate, Navigate } from 'react-router-dom';

const styles = {
    container: { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' },
    input: { display: 'block', width: '100%', padding: '10px', marginBottom: '10px' },
    button: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' },
    error: { color: 'red', textAlign: 'center' }
};

function CadastroPage() {
    const { register, currentUser, login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isLoginMode) {
                await login(email, password);
            } else {
                if (password.length < 6) {
                    setError('A senha deve ter no mínimo 6 caracteres.');
                    return;
                }
                await register(email, password, nome, cpf);
            }
            navigate('/dashboard');
        } catch (err) {
            console.error("Erro na autenticação:", err);
            if (isLoginMode) {
                 setError('Credenciais inválidas. Tente novamente.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Este email já está cadastrado. Faça login.');
            } else {
                setError('Erro desconhecido. Verifique seus dados.');
            }
        }
    };
    
    if (currentUser) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div style={styles.container}>
            <h2>{isLoginMode ? 'Login PoolPoly' : 'Cadastre-se no PoolPoly'}</h2>
            
            {error && <p style={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
                <input type="password" placeholder="Senha (mín. 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
                
                {!isLoginMode && (
                    <>
                        <input type="text" placeholder="Nome Completo" value={nome} onChange={(e) => setNome(e.target.value)} style={styles.input} required />
                        <input type="text" placeholder="CPF (apenas números)" value={cpf} onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))} maxLength="11" style={styles.input} required />
                    </>
                )}
                
                <button type="submit" style={styles.button}>
                    {isLoginMode ? 'Entrar' : 'Cadastrar'}
                </button>
            </form>

            <button 
                onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
                style={{ ...styles.button, backgroundColor: 'transparent', color: '#007bff', marginTop: '10px' }}
            >
                {isLoginMode ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Faça Login'}
            </button>
        </div>
    );
}

export default CadastroPage;