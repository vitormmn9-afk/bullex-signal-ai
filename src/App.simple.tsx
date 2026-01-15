import { useState } from "react";

const AppSimple = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1e',
      color: 'white',
      padding: '50px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#00ff88', fontSize: '3em' }}>✅ Bullex AI - FUNCIONANDO!</h1>
      <p style={{ fontSize: '1.5em', marginTop: '20px' }}>
        O servidor está rodando corretamente.
      </p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          background: '#00ff88',
          color: '#0a0f1e',
          border: 'none',
          padding: '15px 30px',
          fontSize: '1.2em',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '30px'
        }}
      >
        Cliques: {count}
      </button>
      <p style={{ marginTop: '30px', opacity: 0.7 }}>
        Se você está vendo esta página, o React está funcionando.<br/>
        Agora vou carregar o app completo...
      </p>
    </div>
  );
};

export default AppSimple;
