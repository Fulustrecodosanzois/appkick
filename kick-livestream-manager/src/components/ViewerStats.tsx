import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getChannelInfo, getChannelStats } from '../services/api';
import { Channel } from '../types';

const ViewerStats: React.FC = () => {
  const { token } = useAuth();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [timeRange, setTimeRange] = useState<string>('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const channelData = await getChannelInfo(token);
        setChannel(channelData);
        
        await fetchStats(channelData.id, timeRange);
      } catch (err) {
        console.error(err);
        setError('Falha ao carregar dados do canal');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);

  const fetchStats = async (channelId: string, range: string) => {
    if (!token) return;
    
    try {
      setLoading(true);
      const statsData = await getChannelStats(token, channelId, range);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      setError('Falha ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (range: string) => {
    setTimeRange(range);
    if (channel) {
      fetchStats(channel.id, range);
    }
  };

  if (loading) {
    return <div className="card">Carregando estatísticas...</div>;
  }

  return (
    <div>
      <h1>Estatísticas da Transmissão</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Dados do Canal</h2>
          <div>
            <button
              className={`btn ${timeRange === 'day' ? '' : 'btn-secondary'}`}
              onClick={() => handleRangeChange('day')}
              style={{ marginRight: '10px' }}
            >
              Hoje
            </button>
            <button
              className={`btn ${timeRange === 'week' ? '' : 'btn-secondary'}`}
              onClick={() => handleRangeChange('week')}
              style={{ marginRight: '10px' }}
            >
              7 dias
            </button>
            <button
              className={`btn ${timeRange === 'month' ? '' : 'btn-secondary'}`}
              onClick={() => handleRangeChange('month')}
            >
              30 dias
            </button>
          </div>
        </div>
        
        {stats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total de Visualizações</h3>
              <div className="stat-value">{stats.views || 0}</div>
              <p>Total de visualizações únicas</p>
            </div>
            <div className="stat-card">
              <h3>Visualizadores Máximos</h3>
              <div className="stat-value">{stats.peak_viewers || 0}</div>
              <p>Pico de espectadores simultâneos</p>
            </div>
            <div className="stat-card">
              <h3>Média de Espectadores</h3>
              <div className="stat-value">{stats.average_viewers || 0}</div>
              <p>Média de espectadores por stream</p>
            </div>
            <div className="stat-card">
              <h3>Novos Seguidores</h3>
              <div className="stat-value">{stats.new_followers || 0}</div>
              <p>Seguidores ganhos no período</p>
            </div>
            <div className="stat-card">
              <h3>Novas Assinaturas</h3>
              <div className="stat-value">{stats.new_subscribers || 0}</div>
              <p>Assinantes ganhos no período</p>
            </div>
            <div className="stat-card">
              <h3>Mensagens no Chat</h3>
              <div className="stat-value">{stats.chat_messages || 0}</div>
              <p>Total de mensagens enviadas</p>
            </div>
            <div className="stat-card">
              <h3>Horas Transmitidas</h3>
              <div className="stat-value">{stats.hours_streamed || 0}</div>
              <p>Total de horas ao vivo</p>
            </div>
            <div className="stat-card">
              <h3>Clipes Criados</h3>
              <div className="stat-value">{stats.clips_created || 0}</div>
              <p>Clipes feitos pelos espectadores</p>
            </div>
          </div>
        ) : (
          <p>Nenhuma estatística disponível para o período selecionado.</p>
        )}
      </div>
      
      {stats && stats.viewer_demographics && (
        <div className="card">
          <h2>Demografia dos Espectadores</h2>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <h3>Distribuição por Idade</h3>
              <table>
                <thead>
                  <tr>
                    <th>Faixa Etária</th>
                    <th>Porcentagem</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>13-17</td>
                    <td>{stats.viewer_demographics.age['13-17'] || 0}%</td>
                  </tr>
                  <tr>
                    <td>18-24</td>
                    <td>{stats.viewer_demographics.age['18-24'] || 0}%</td>
                  </tr>
                  <tr>
                    <td>25-34</td>
                    <td>{stats.viewer_demographics.age['25-34'] || 0}%</td>
                  </tr>
                  <tr>
                    <td>35-44</td>
                    <td>{stats.viewer_demographics.age['35-44'] || 0}%</td>
                  </tr>
                  <tr>
                    <td>45+</td>
                    <td>{stats.viewer_demographics.age['45+'] || 0}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ flex: 1 }}>
              <h3>Distribuição por Gênero</h3>
              <table>
                <thead>
                  <tr>
                    <th>Gênero</th>
                    <th>Porcentagem</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Masculino</td>
                    <td>{stats.viewer_demographics.gender.male || 0}%</td>
                  </tr>
                  <tr>
                    <td>Feminino</td>
                    <td>{stats.viewer_demographics.gender.female || 0}%</td>
                  </tr>
                  <tr>
                    <td>Outros</td>
                    <td>{stats.viewer_demographics.gender.other || 0}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {stats && stats.top_countries && (
        <div className="card">
          <h2>Principais Países</h2>
          <table>
            <thead>
              <tr>
                <th>País</th>
                <th>Espectadores</th>
                <th>Porcentagem</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.top_countries).map(([country, data]: [string, any]) => (
                <tr key={country}>
                  <td>{country}</td>
                  <td>{data.viewers}</td>
                  <td>{data.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewerStats;