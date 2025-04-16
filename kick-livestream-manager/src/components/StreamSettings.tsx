import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getChannelInfo, getStreamInfo, updateStreamInfo, getCategories } from '../services/api';
import { CategoryData, Channel, Stream } from '../types';

const StreamSettings: React.FC = () => {
  const { token } = useAuth();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [stream, setStream] = useState<Stream | null>(null);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isMature, setIsMature] = useState(false);
  const [language, setLanguage] = useState('pt');
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const languages = [
    { code: 'pt', name: 'Português' },
    { code: 'en', name: 'Inglês' },
    { code: 'es', name: 'Espanhol' },
    { code: 'fr', name: 'Francês' },
    { code: 'de', name: 'Alemão' },
    { code: 'it', name: 'Italiano' },
    { code: 'ja', name: 'Japonês' },
    { code: 'ko', name: 'Coreano' },
    { code: 'ru', name: 'Russo' },
    { code: 'zh', name: 'Chinês' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const channelData = await getChannelInfo(token);
        setChannel(channelData);
        
        try {
          const streamData = await getStreamInfo(token, channelData.id);
          setStream(streamData);
          setTitle(streamData.session_title);
          setCategoryId(streamData.category_id);
          setIsMature(streamData.is_mature);
          setLanguage(streamData.language);
        } catch (err) {
          // A stream pode não estar ativa
          console.log('Stream não está ativa ou ocorreu um erro ao buscar informações da stream');
        }
        
        // Buscar categorias populares inicialmente
        const categoriesData = await getCategories(token);
        setCategories(categoriesData);
      } catch (err) {
        console.error(err);
        setError('Falha ao carregar dados do canal');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);

  const handleSearchCategories = async () => {
    if (!token) return;
    
    try {
      const categoriesData = await getCategories(token, searchQuery);
      setCategories(categoriesData);
    } catch (err) {
      console.error(err);
      setError('Falha ao buscar categorias');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !channel) return;
    
    try {
      setUpdating(true);
      setError('');
      setSuccess('');
      
      await updateStreamInfo(
        token,
        channel.id,
        title,
        categoryId,
        isMature,
        language
      );
      
      setSuccess('Configurações da stream atualizadas com sucesso!');
      
      // Atualizar dados da stream
      if (channel) {
        try {
          const streamData = await getStreamInfo(token, channel.id);
          setStream(streamData);
        } catch (err) {
          // A stream pode não estar ativa
        }
      }
    } catch (err) {
      console.error(err);
      setError('Falha ao atualizar configurações da stream');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="card">Carregando configurações da stream...</div>;
  }

  return (
    <div>
      <h1>Configurações da Live</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="card">
        <h2>Status</h2>
        {stream && stream.is_live ? (
          <div className="alert alert-success">Sua stream está ONLINE!</div>
        ) : (
          <div className="alert" style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', borderColor: '#ff0000' }}>
            Sua stream está OFFLINE
          </div>
        )}
        <p>As alterações feitas aqui serão aplicadas à sua próxima transmissão ou à atual se estiver online.</p>
      </div>
      
      <div className="card">
        <h2>Editar Configurações</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título da Stream</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da sua stream"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Categoria</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar categorias..."
                style={{ flex: 1 }}
              />
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleSearchCategories}
              >
                Buscar
              </button>
            </div>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.viewers} espectadores)
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="language">Idioma</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isMature}
                onChange={(e) => setIsMature(e.target.checked)}
                style={{ width: 'auto', marginRight: '10px' }}
              />
              Conteúdo para adultos (18+)
            </label>
          </div>
          
          <button 
            type="submit" 
            className="btn"
            disabled={updating}
          >
            {updating ? 'Atualizando...' : 'Salvar Configurações'}
          </button>
        </form>
      </div>
      
      {channel && (
        <div className="card">
          <h2>Informações da Stream</h2>
          <p>Use estas informações em seu software de transmissão (OBS, Streamlabs, etc.):</p>
          
          <div className="form-group">
            <label>URL do Servidor RTMP</label>
            <input
              type="text"
              value="rtmp://ingest.kick.com/live"
              readOnly
            />
          </div>
          
          <div className="form-group">
            <label>Chave da Stream</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="password"
                value="Sua chave de stream está disponível no dashboard oficial do Kick"
                readOnly
                style={{ flex: 1 }}
              />
              <a 
                href="https://kick.com/dashboard/stream/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Ver Chave
              </a>
            </div>
            <small>Por questões de segurança, a chave de stream só pode ser acessada no dashboard oficial do Kick.</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamSettings;