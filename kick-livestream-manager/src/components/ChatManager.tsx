import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getChannelInfo, getChatMessages, sendChatMessage, deleteChatMessage, banUser, unbanUser } from '../services/api';
import { Channel, ChatMessage } from '../types';

const ChatManager: React.FC = () => {
  const { token } = useAuth();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);
  const [userToBan, setUserToBan] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState<string | null>('3600'); // 1 hora por padrão
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const channelData = await getChannelInfo(token);
        setChannel(channelData);
        
        // Buscar mensagens iniciais
        await fetchChatMessages(channelData.id);
      } catch (err) {
        console.error(err);
        setError('Falha ao carregar dados do canal');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
    
    return () => {
      // Limpar intervalo quando o componente for desmontado
      if (chatInterval.current) {
        clearInterval(chatInterval.current);
      }
    };
  }, [token]);

  useEffect(() => {
    // Configurar intervalo para atualizar mensagens do chat quando o canal estiver carregado
    if (channel && token) {
      fetchChatMessages(channel.id);
      
      chatInterval.current = setInterval(() => {
        fetchChatMessages(channel.id);
      }, 5000); // Atualizar a cada 5 segundos
      
      return () => {
        if (chatInterval.current) {
          clearInterval(chatInterval.current);
        }
      };
    }
  }, [channel, token]);

  useEffect(() => {
    // Scroll para a última mensagem quando novas mensagens chegarem
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChatMessages = async (channelId: string) => {
    if (!token) return;
    
    try {
      const chatMessages = await getChatMessages(token, channelId);
      setMessages(chatMessages);
    } catch (err) {
      console.error('Erro ao buscar mensagens do chat:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !channel || !newMessage.trim()) return;
    
    try {
      await sendChatMessage(token, channel.id, newMessage);
      setNewMessage('');
      
      // Buscar mensagens novamente após enviar
      await fetchChatMessages(channel.id);
    } catch (err) {
      console.error(err);
      setError('Falha ao enviar mensagem');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!token || !channel) return;
    
    try {
      await deleteChatMessage(token, channel.id, messageId);
      setSuccess('Mensagem deletada com sucesso');
      
      // Atualizar lista de mensagens
      const updatedMessages = messages.filter(msg => msg.id !== messageId);
      setMessages(updatedMessages);
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('Falha ao deletar mensagem');
      
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  const handleBanUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !channel || !userToBan || !banReason) return;
    
    try {
      await banUser(token, channel.id, {
        user_id: userToBan,
        reason: banReason,
        duration: banDuration === 'permanent' ? null : parseInt(banDuration || '3600')
      });
      
      setBannedUsers([...bannedUsers, userToBan]);
      setUserToBan('');
      setBanReason('');
      setSuccess(`Usuário banido com sucesso por ${banDuration === 'permanent' ? 'permanentemente' : `${parseInt(banDuration || '3600') / 3600} hora(s)`}`);
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('Falha ao banir usuário. Verifique o ID do usuário.');
      
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!token || !channel) return;
    
    try {
      await unbanUser(token, channel.id, userId);
      
      const updatedBannedUsers = bannedUsers.filter(id => id !== userId);
      setBannedUsers(updatedBannedUsers);
      setSuccess('Usuário desbanido com sucesso');
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('Falha ao desbanir usuário');
      
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  if (loading) {
    return <div className="card">Carregando gerenciador de chat...</div>;
  }

  return (
    <div>
      <h1>Gerenciador de Chat</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="flex" style={{ gap: '20px' }}>
        <div style={{ flex: 2 }}>
          <div className="card">
            <h2>Chat ao Vivo</h2>
            <div 
              style={{ 
                height: '400px', 
                overflowY: 'auto',
                backgroundColor: '#0a0a0a',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '15px'
              }}
            >
              {messages.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#777' }}>Não há mensagens no chat</p>
              ) : (
                messages.map((message) => (
                  <div 
                    key={message.id} 
                    style={{ 
                      marginBottom: '10px',
                      padding: '5px',
                      borderRadius: '4px',
                      backgroundColor: '#1a1a1a'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{message.username}:</strong>
                      <div>
                        <button 
                          onClick={() => handleDeleteMessage(message.id)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: '#ff4444', 
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Deletar
                        </button>
                        <button 
                          onClick={() => {
                            setUserToBan(message.user_id);
                            setBanReason('Violação das regras do chat');
                          }}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: '#ff4444', 
                            cursor: 'pointer',
                            fontSize: '12px',
                            marginLeft: '10px'
                          }}
                        >
                          Banir
                        </button>
                      </div>
                    </div>
                    <div>{message.content}</div>
                    <small style={{ color: '#777' }}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </small>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite uma mensagem como streamer..."
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn">Enviar</button>
            </form>
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <div className="card">
            <h2>Banir Usuário</h2>
            <form onSubmit={handleBanUser}>
              <div className="form-group">
                <label htmlFor="userId">ID do Usuário</label>
                <input
                  type="text"
                  id="userId"
                  value={userToBan}
                  onChange={(e) => setUserToBan(e.target.value)}
                  placeholder="Digite o ID do usuário"
                  required
                />
                <small>Você pode obter o ID do usuário clicando em "Banir" na mensagem</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="banReason">Motivo</label>
                <input
                  type="text"
                  id="banReason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Motivo do banimento"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="banDuration">Duração</label>
                <select
                  id="banDuration"
                  value={banDuration || 'permanent'}
                  onChange={(e) => setBanDuration(e.target.value === 'permanent' ? null : e.target.value)}
                >
                  <option value="300">5 minutos</option>
                  <option value="600">10 minutos</option>
                  <option value="1800">30 minutos</option>
                  <option value="3600">1 hora</option>
                  <option value="86400">1 dia</option>
                  <option value="604800">1 semana</option>
                  <option value="permanent">Permanente</option>
                </select>
              </div>
              
              <button type="submit" className="btn">Banir Usuário</button>
            </form>
          </div>
          
          {bannedUsers.length > 0 && (
            <div className="card">
              <h2>Usuários Banidos Recentemente</h2>
              <ul>
                {bannedUsers.map((userId) => (
                  <li key={userId} style={{ marginBottom: '10px' }}>
                    ID: {userId}
                    <button
                      onClick={() => handleUnbanUser(userId)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#00cc00', 
                        cursor: 'pointer',
                        marginLeft: '10px'
                      }}
                    >
                      Desbanir
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatManager;