import { AuthProvider } from './components/AuthManager'; // O AuthManager é agora um TSX
import './app/globals.css'; 

function MyApp({ Component, pageProps }) {
  // O componente <Component> é a sua página (/login, /dashboard)
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;