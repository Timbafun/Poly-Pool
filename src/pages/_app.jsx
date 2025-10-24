import { AuthProvider } from '../components/AuthManager'; // Corrigido: '../components'
import '../app/globals.css'; // Corrigido: '../app/globals.css'

function MyApp({ Component, pageProps }) {
  // Envolve todas as páginas do Pages Router (/login e /dashboard) com o AuthProvider.
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;