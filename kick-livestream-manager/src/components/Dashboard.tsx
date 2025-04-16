import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getChannelInfo, getStreamInfo, getChannelStats } from '../services/api';
import { Channel, Stream } from '../types';

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [stream, setStream] = useState<Stream | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !user) return;
      
      try {
        setLoading(true);
        const channelData = await getChannelInfo(token);
        setChannel(channelData);
        
        try {
          const streamData = await getStreamInfo(token, channelData.id);
          setStream(streamData);
        } catch (err) {
          // A stream pode não estar ativa, então não mostramos erro
          console.log('Stream não está ativa ou ocorreu um erro ao buscar informações da stream');
        }
        
        try {
          const statsData = await getChannelStats(token, channelData.id, 'day');
          setStats(statsData);
        } catch (err) {
          console.error('Erro ao buscar estatísticas:', err);
        }
      } catch (err) {
        console.error(err);
        setError('Falha ao carregar dados do canal');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, user]);

  if (loading) {
    return <div className="card">Carregando informações do canal...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      
      {channel && (
        <div className="card">
          <h2>Informações do Canal</h2>
          <div className="flex justify-between items-center">
            <div>
              <p><strong>Nome do Canal:</strong> {channel.name}</p>
              <p><strong>Slug:</strong> {channel.slug}</p>
              <p><strong>Status:</strong> {channel.is_banned ? 'Banido' : 'Ativo'}</p>
              <p><strong>VOD Habilitado:</strong> {channel.vod_enabled ? 'Sim' : 'Não'}</p>
              <p><strong>Assinaturas Habilitadas:</strong> {channel.subscription_enabled ? 'Sim' : 'Não'}</p>
            </div>
            {user?.profile_pic && (
              <div>
                <img 
                  src={user.profile_pic} 
                  alt={`${user.username} avatar`} 
                  style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      {stream && stream.is_live ? (
        <div className="card">
          <h2>Stream Atual</h2>
          <div className="alert alert-success">Sua stream está ONLINE!</div>
          <p><strong>Título:</strong> {stream.session_title}</p>
          <p><strong>Categoria:</strong> {stream.category_name}</p>
          <p><strong>Idioma:</strong> {stream.language}</p>
          <p><strong>Visualizadores:</strong> {stream.viewer_count}</p>
          <p><strong>Início:</strong> {new Date(stream.start_time).toLocaleString()}</p>
          <p><strong>Conteúdo Adulto:</strong> {stream.is_mature ? 'Sim' : 'Não'}</p>
        </div>
      ) : (
        <div className="card">
          <h2>Status da Stream</h2>
          <div className="alert" style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', borderColor: '#ff0000' }}>
            Sua stream está OFFLINE
          </div>
          <p>Configure sua próxima transmissão na página de Configurações da Live</p>
        </div>
      )}
      
      {stats && (
        <div className="card">
          <h2>Estatísticas Resumidas (24h)</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Visualizações</h3>
              <div className="stat-value">{stats.views || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Novos Seguidores</h3>
              <div className="stat-value">{stats.new_followers || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Novas Assinaturas</h3>
              <div className="stat-value">{stats.new_subscribers || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Chat Msgs</h3>
              <div className="stat-value">{stats.chat_messages || 0}</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="card">
        <h2>Links Rápidos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          <a href={`https://kick.com/${channel?.slug}`} target="_blank" rel="noopener noreferrer" className="btn">
            Ver Canal
          </a>
          <a href="https://kick.com/dashboard" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            Dashboard Oficial
          </a>
          <a href="https://docs.kick.com/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            Documentação API
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;