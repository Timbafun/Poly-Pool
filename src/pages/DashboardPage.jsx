import React from 'react';
import { useAuth } from '../components/AuthManager';

// A PLACA MÁGICA: Esta linha garante que o componente rode APENAS no navegador
"use client";

const styles = {
    container: { maxWidth: '800px', margin: '50px auto', padding: '20px', backgroundColor: '#e9f7ef', border: '1px solid #28a745', borderRadius: '8px', fontFamily: 'Arial, sans-serif' },
    header: { color: '#007bff' },
    infoBox: { backgroundColor: '#ffffff', padding: '15px', border: '1px solid #dee2e6', marginBottom: '20px', borderRadius: '6px' },
    balanceBox: { backgroundColor: '#d4edda', padding: '20px', border: '1px solid #c3e6cb', borderRadius: '6px', marginBottom: '20px', textAlign: 'center' },
    balanceText: { fontSize: '2.5em', margin: '5px 0', color: '#155724' },
    button: { padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};

function DashboardPage() {
    const { currentUser, userData, logout } = useAuth();

    if (!currentUser || !userData) {
        return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>Carregando dados do usuário...</div>;
    }

    const saldoFormatado = userData.saldo !== undefined 
        ? parseFloat(userData.saldo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : 'R$ 0,00';

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Dashboard PoolPoly</h1>
            <p>Bem-vindo(a), **{userData.nome_completo || 'Usuário'}**!</p>

            <div style={styles.balanceBox}>
                <h3>Seu Saldo Atual</h3>
                <p style={styles.balanceText}>{saldoFormatado}</p>
            </div>

            <div style={styles.infoBox}>
                <h3>Detalhes da Conta</h3>
                <p><strong>E-mail:</strong> {currentUser.email}</p>
                <p><strong>CPF:</strong> {userData.cpf || 'Não informado'}</p>
                <p><strong>Telefone:</strong> {userData.telefone || 'Não informado'}</p>
                <p><strong>Status:</strong> Ativa</p>
            </div>

            <button onClick={logout} style={styles.button}>
                Sair da Conta (Logout)
            </button>
        </div>
    );
}

export default DashboardPage;