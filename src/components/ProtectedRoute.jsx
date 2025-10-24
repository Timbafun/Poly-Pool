import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthManager';

function ProtectedRoute({ element: Element, ...rest }) {
    const { currentUser, isLoading } = useAuth();
    
    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>Carregando autenticação...</div>;
    }

    if (currentUser) {
        return <Element {...rest} />;
    }

    return <Navigate to="/cadastro" replace />; 
}

export default ProtectedRoute;