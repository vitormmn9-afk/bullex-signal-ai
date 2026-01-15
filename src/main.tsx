import { createRoot } from "react-dom/client";
import "./index.css";

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <h1 style={{ fontSize: '3em', marginBottom: '20px' }}>
          🎉 Bullex AI Signal - FUNCIONANDO!
        </h1>
        <p style={{ fontSize: '1.5em', marginBottom: '30px' }}>
          Deploy na Vercel realizado com sucesso!
        </p>
        <p style={{ opacity: 0.8 }}>
          Agora vou carregar o app completo...
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
