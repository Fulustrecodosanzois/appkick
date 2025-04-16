import { BanUser, CategoryData, Channel, ChatMessage, Clip, Stream, Subscription, User } from '../types';

const API_URL = 'https://api.kick.com/v1';

// Função para lidar com respostas da API
const handleResponse = async (response: Response) => {
  if (response.ok) {
    return await response.json();
  }
  
  const error = await response.json();
  throw new Error(error.message || 'Ocorreu um erro na solicitação');
};

// Função para adicionar cabeçalhos de autenticação
const authHeader = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

// Autenticação
export const authenticate = async (clientId: string, clientSecret: string, code: string): Promise<string> => {
  const response = await fetch(`${API_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: window.location.origin
    })
  });

  const data = await handleResponse(response);
  return data.access_token;
};

export const refreshToken = async (token: string): Promise<string> => {
  const response = await fetch(`${API_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      grant_type: 'refresh_token'
    })
  });

  const data = await handleResponse(response);
  return data.access_token;
};

// Recuperar informações do usuário
export const getUserInfo = async (token: string): Promise<User> => {
  const response = await fetch(`${API_URL}/user`, {
    headers: authHeader(token)
  });

  return handleResponse(response);
};

// Recuperar informações do canal
export const getChannelInfo = async (token: string): Promise<Channel> => {
  const response = await fetch(`${API_URL}/channels/me`, {
    headers: authHeader(token)
  });

  return handleResponse(response);
};

// Gerenciamento de Stream
export const getStreamInfo = async (token: string, channelId: string): Promise<Stream> => {
  const response = await fetch(`${API_URL}/channels/${channelId}/stream`, {
    headers: authHeader(token)
  });

  return handleResponse(response);
};

export const updateStreamInfo = async (
  token: string, 
  channelId: string, 
  title: string, 
  categoryId: string, 
  isMature: boolean,
  language: string
): Promise<Stream> => {
  const response = await fetch(`${API_URL}/channels/${channelId}/stream`, {
    method: 'PUT',
    headers: authHeader(token),
    body: JSON.stringify({
      title,
      category_id: categoryId,
      is_mature: isMature,
      language
    })
  });

  return handleResponse(response);
};

// Buscar categorias
export const getCategories = async (token: string, query?: string): Promise<CategoryData[]> => {
  const url = query 
    ? `${API_URL}/categories?search=${encodeURIComponent(query)}` 
    : `${API_URL}/categories`;
  
  const response = await fetch(url, {
    headers: authHeader(token)
  });

  return handleResponse(response);
};

// Gerenciamento de chat
export const getChatMessages = async (token: string, channelId: string): Promise<ChatMessage[]> => {
  const response = await fetch(`${API_URL}/channels/${channelId}/chat`, {
    headers: authHeader(token)
  });

  return handleResponse(response);
};

export const sendChatMessage = async (token: string, channelId: string, message: string): Promise<ChatMessage> => {
  const response = await fetch(`${API_URL}/channels/${channelId}/chat`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ message })
  });

  return handleResponse(response);
};

export const deleteChatMessage = async (token: string, channelId: string, messageId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/channels/${channelId}/chat/${messageId}`, {
    method: 'DELETE',
    headers: authHeader(token)
  });

  return handleResponse(response);
};

export const banUser = async (token: string, channelId: string, banData: BanUser): Promise<void> => {
  const response = await fetch(`${API_URL}/channels/${channelId}/bans`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(banData)
  });

  return handleResponse(response);
};

export const unbanUser = async (token: string, channelId: string, userId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/channels/${channelId}/bans/${userId}`, {
    method: 'DELETE',
    headers: authHeader(token)
  });

  return handleResponse(response);
};

// Gerenciamento de clipes
export const getClips = async (token: string, channelId: string): Promise<Clip[]> => {
  const response = await fetch(`${API_URL}/channels/${channelId}/clips`, {
    headers: authHeader(token)
  });

  return handleResponse(response);
};

export const createClip = async (token: string, channelId: string, title: string): Promise<Clip> => {
  const response = await fetch(`${API_URL}/channels/${channelId}/clips`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ title })
  });

  return handleResponse(response);
};

export const deleteClip = async (token: string, clipId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/clips/${clipId}`, {
    method: 'DELETE',
    headers: authHeader(token)
  });

  return handleResponse(response);
};

// Assinaturas
export const getSubscribers = async (token: string, channelId: string): Promise<Subscription[]> => {
  const response = await fetch(`${API_URL}/channels/${channelId}/subscriptions`, {
    headers: authHeader(token)
  });

  return handleResponse(response);
};

// Estatísticas
export const getChannelStats = async (token: string, channelId: string, timeRange: string): Promise<any> => {
  const response = await fetch(`${API_URL}/channels/${channelId}/stats?range=${timeRange}`, {
    headers: authHeader(token)
  });

  return handleResponse(response);
};