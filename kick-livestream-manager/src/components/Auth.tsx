import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authenticate, getUserInfo } from '../services/api';

const Auth: React.FC = () => {
  const { login } = useAuth();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar se há um código de autenticação na URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    const storedClientId = localStorage.getItem('@KickManager:clientId');
    const storedClientSecret = localStorage.getItem('@KickManager:clientSecret');
    
    if (code && storedClientId && storedClientSecret) {
      handleOAuthCallback(code, storedClientId, storedClientSecret);
    }
  }, []);

  const handleOAuthCallback = async (code: string, clientId: string, clientSecret: string) => {
    try {
      setLoading(true);
      const token = await authenticate(clientId, clientSecret, code);
      const user = await getUserInfo(token);
      login(token, user);
    } catch (err) {
      console.error(err);
      setError('Falha na autenticação. Verifique suas credenciais e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = () => {
    if (!clientId || !clientSecret) {
      setError('Cliente ID e Cliente Secret são obrigatórios');
      return;
    }

    localStorage.setItem('@KickManager:clientId', clientId);
    localStorage.setItem('@KickManager:clientSecret', clientSecret);

    // Redirecionar para a página de autorização do Kick
    const redirectUri = encodeURIComponent(window.location.origin);
    window.location.href = `https://kick.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=channel:read channel:write chat:read chat:write`;
  };

  return (
    <div className="card">
      <h2>Login com Kick</h2>
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="clientId">Cliente ID</label>
        <input
          type="text"
          id="clientId"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="Digite o Cliente ID da sua aplicação Kick"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="clientSecret">Cliente Secret</label>
        <input
          type="password"
          id="clientSecret"
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
          placeholder="Digite o Cliente Secret da sua aplicação Kick"
        />
      </div>
      
      <button 
        className="btn" 
        onClick={handleAuthorize}
        disabled={loading}
      >
        {loading ? 'Carregando...' : 'Autorizar'}
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <p>Para obter suas credenciais:</p>
        <ol>
          <li>Acesse o <a href="https://kick.com/developer" target="_blank" rel="noopener noreferrer">Portal do Desenvolvedor Kick</a></li>
          <li>Crie uma nova aplicação</li>
          <li>Configure a URL de redirecionamento para: {window.location.origin}</li>
          <li>Copie o Cliente ID e Cliente Secret</li>
        </ol>
      </div>
    </div>
  );
};

export default Auth;