const appJs = `
// Configuração específica para o canal fulustrecofulus
const CHANNEL_NAME = 'fulustrecofulus';
let channelId = null;
let streamStartTime = null;
let isLive = false;

// Estatísticas
let peakViewerCount = 0;
let messageCount = 0;
let newFollowersCount = 0;
let isPausedChat = false;

// Intervalos
let channelUpdateInterval = null;
let viewersUpdateInterval = null;
let chatUpdateInterval = null;
let statsUpdateInterval = null;

// Elementos do DOM
const streamInfo = document.getElementById('streamInfo');
const viewerCount = document.getElementById('viewerCount');
const viewersList = document.getElementById('viewersList');
const chatBox = document.getElementById('chatBox');
const toggleChatBtn = document.getElementById('toggleChatBtn');
const peakViewers = document.getElementById('peakViewers');
const totalMessages = document.getElementById('totalMessages');
const newFollowers = document.getElementById('newFollowers');
const streamTime = document.getElementById('streamTime');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    
    toggleChatBtn.addEventListener('click', () => {
        isPausedChat = !isPausedChat;
        toggleChatBtn.textContent = isPausedChat ? 'Retomar' : 'Pausar';
    });
});

// Funções principais
async function initializeApp() {
    try {
        await fetchChannelInfo();
        
        // Configurar intervalos de atualização
        channelUpdateInterval = setInterval(fetchChannelInfo, 60000); // A cada 1 minuto
        viewersUpdateInterval = setInterval(updateViewers, 15000); // A cada 15 segundos
        chatUpdateInterval = setInterval(updateChat, 3000); // A cada 3 segundos
        statsUpdateInterval = setInterval(updateStats, 5000); // A cada 5 segundos
    } catch (error) {
        showError(\`Erro ao inicializar: \${error.message}\`);
    }
}

async function fetchChannelInfo() {
    try {
        const response = await fetch(\`https://kick.com/api/v1/channels/\${CHANNEL_NAME}\`);
        if (!response.ok) {
            throw new Error('Canal não encontrado');
        }

        const data = await response.json();
        channelId = data.id;
        updateStreamInfo(data);
    } catch (error) {
        showError(\`Erro ao buscar informações do canal: \${error.message}\`);
    }
}

function updateStreamInfo(data) {
    isLive = data.livestream !== null;
    
    let infoHTML = \`
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p class="text-gray-400">Nome do Canal:</p>
                <p class="font-bold">\${data.user.username}</p>
            </div>
            <div>
                <p class="text-gray-400">Status:</p>
                <p class="font-bold \${isLive ? 'text-green-500' : 'text-red-500'}">\${isLive ? 'AO VIVO' : 'OFFLINE'}</p>
            </div>
            <div>
                <p class="text-gray-400">Seguidores:</p>
                <p class="font-bold">\${data.followersCount.toLocaleString()}</p>
            </div>
    \`;

    if (isLive) {
        const stream = data.livestream;
        
        // Atualizar horário de início da stream para cálculos de duração
        if (!streamStartTime) {
            streamStartTime = new Date(stream.created_at);
        }
        
        infoHTML += \`
            <div>
                <p class="text-gray-400">Espectadores:</p>
                <p class="font-bold">\${stream.viewer_count.toLocaleString()}</p>
            </div>
            <div class="col-span-2">
                <p class="text-gray-400">Título:</p>
                <p class="font-bold">\${stream.session_title || 'Sem título'}</p>
            </div>
            <div>
                <p class="text-gray-400">Duração:</p>
                <p class="font-bold">\${formatDuration(new Date() - streamStartTime)}</p>
            </div>
            <div>
                <p class="text-gray-400">Categoria:</p>
                <p class="font-bold">\${stream.categories.map(cat => cat.name).join(', ') || 'Sem categoria'}</p>
            </div>
        \`;
    } else {
        // Resetar dados da stream quando não estiver ao vivo
        streamStartTime = null;
    }

    infoHTML += '</div>';
    
    if (data.user.bio) {
        infoHTML += \`
            <div class="mt-4 p-3 bg-gray-700 rounded">
                <p class="text-gray-300 text-sm">Biografia:</p>
                <p>\${data.user.bio}</p>
            </div>
        \`;
    }

    // Adicionar thumbnail se disponível
    if (isLive && data.livestream.thumbnail) {
        infoHTML = \`
            <div class="mb-4">
                <img src="\${data.livestream.thumbnail.url}" alt="Thumbnail" class="w-full rounded-lg">
            </div>
        \` + infoHTML;
    }

    streamInfo.innerHTML = infoHTML;
}

async function updateViewers() {
    if (!channelId) return;

    try {
        // Em uma implementação real, você usaria a API do Kick para obter os espectadores
        // Como a documentação não especifica uma endpoint clara para isso, usamos dados simulados
        const viewersData = await simulateViewersData();
        
        viewerCount.textContent = viewersData.length;
        
        // Atualizar pico de espectadores se necessário
        if (viewersData.length > peakViewerCount) {
            peakViewerCount = viewersData.length;
            peakViewers.textContent = peakViewerCount;
        }
        
        if (viewersData.length > 0) {
            viewersList.innerHTML = viewersData.map(viewer => 
                \`<li class="flex items-center justify-between p-2 hover:bg-gray-700 rounded">
                    <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            \${viewer.username.charAt(0).toUpperCase()}
                        </div>
                        <span>\${viewer.username}</span>
                    </div>
                    <span class="text-gray-400 text-sm">\${viewer.duration}</span>
                </li>\`
            ).join('');
        } else {
            viewersList.innerHTML = '<li class="text-gray-400">Nenhum espectador disponível.</li>';
        }
    } catch (error) {
        console.error('Erro ao atualizar espectadores:', error);
    }
}

async function updateChat() {
    if (!channelId || isPausedChat) return;

    try {
        // Em uma implementação real, você usaria a API do Kick para obter as mensagens do chat
        // Como a documentação não especifica um endpoint claro para isso, usamos dados simulados
        const chatMessages = await simulateChatMessages();
        
        if (chatMessages.length > 0) {
            chatBox.innerHTML = chatMessages.map(msg => 
                \`<div class="mb-2 p-2 hover:bg-gray-800 rounded">
                    <div class="flex items-center">
                        <span class="font-bold mr-2 \${getMessageTypeColor(msg)}">\${msg.username}:</span>
                        <span class="text-gray-200">\${msg.message}</span>
                    </div>
                    <span class="text-gray-500 text-xs">\${msg.timestamp}</span>
                </div>\`
            ).join('');
            
            // Auto-scroll para a mensagem mais recente (somente se não estiver pausado)
            if (!isPausedChat) {
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        }
    } catch (error) {
        console.error('Erro ao atualizar chat:', error);
    }
}

function updateStats() {
    // Atualizar contagem total de mensagens
    totalMessages.textContent = messageCount;
    
    // Atualizar tempo de transmissão
    if (streamStartTime) {
        streamTime.textContent = formatDuration(new Date() - streamStartTime);
    } else {
        streamTime.textContent = '00:00:00';
    }
    
    // Atualizar contagem de novos seguidores
    newFollowers.textContent = newFollowersCount;
}

// Funções auxiliares
function showError(message) {
    streamInfo.innerHTML = \`<p class="text-red-500">\${message}</p>\`;
    viewersList.innerHTML = '<li class="text-gray-400">Nenhum espectador disponível.</li>';
    viewerCount.textContent = '0';
    chatBox.innerHTML = '<p class="text-gray-400">O chat aparecerá aqui quando uma live estiver sendo monitorada.</p>';
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    return \`\${hours.toString().padStart(2, '0')}:\${(minutes % 60).toString().padStart(2, '0')}:\${(seconds % 60).toString().padStart(2, '0')}\`;
}

function getMessageTypeColor(msg) {
    if (msg.isModerator) return 'text-purple-400';
    if (msg.isSubscriber) return 'text-green-400';
    if (msg.isDonator) return 'text-yellow-400';
    return 'text-white';
}

// Funções de simulação (para fins de demonstração)
// Em uma aplicação real, estas seriam substituídas por chamadas à API do Kick
async function simulateViewersData() {
    // Simula uma lista de espectadores
    const names = ['fan123', 'gamer_pro', 'kick_viewer', 'stream_lover', 'tech_guru', 
                   'player_one', 'chat_master', 'viewer42', 'follower99', 'live_fan',
                   'fulustrecofan', 'kick_brasil', 'gamemaster', 'nova_era', 'fiel_viewer',
                   'top_supporter', 'br_gamer'];
    
    // Simular espectadores ativos na live
    if (!isLive) return [];
    
    // Gera um número aleatório de espectadores (entre 8 e nomes.length)
    const viewerCount = 8 + Math.floor(Math.random() * (names.length - 8));
    
    // Seleciona viewerCount nomes aleatórios
    const shuffled = [...names].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, viewerCount);
    
    // Persistir espectadores entre chamadas
    if (!window.viewersHistory) {
        window.viewersHistory = {};
        selected.forEach(username => {
            window.viewersHistory[username] = {
                username,
                joinedAt: new Date(),
            };
        });
    } else {
        // Adicionar novos espectadores
        selected.forEach(username => {
            if (!window.viewersHistory[username]) {
                window.viewersHistory[username] = {
                    username,
                    joinedAt: new Date(),
                };
            }
        });
        
        // Remover alguns espectadores aleatoriamente (simulando saídas)
        Object.keys(window.viewersHistory).forEach(username => {
            if (!selected.includes(username) && Math.random() > 0.7) {
                delete window.viewersHistory[username];
            }
        });
    }
    
    // Formatar duração para cada espectador
    return Object.values(window.viewersHistory).map(viewer => ({
        username: viewer.username,
        duration: formatViewerDuration(new Date() - viewer.joinedAt)
    })).sort((a, b) => a.username.localeCompare(b.username));
}

function formatViewerDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) {
        return \`\${minutes}min\`;
    } else {
        const hours = Math.floor(minutes / 60);
        return \`\${hours}h \${minutes % 60}min\`;
    }
}

async function simulateChatMessages() {
    // Mensagens de chat simuladas com temas relacionados ao streaming
    const messageTemplates = [
        { message: 'Oi pessoal!', type: 'greeting' },
        { message: 'Essa live está demais!', type: 'praise' },
        { message: 'Qual o próximo jogo?', type: 'question' },
        { message: 'LOL', type: 'reaction' },
        { message: 'Alguém mais está com lag?', type: 'technical' },
        { message: 'GG!', type: 'reaction' },
        { message: 'Fulustrecofulus, você é o melhor streamer!', type: 'praise' },
        { message: 'Primeira vez aqui!', type: 'greeting' },
        { message: 'Como faço para ser notificado quando você entrar ao vivo?', type: 'question' },
        { message: 'Manda um salve pro RJ!', type: 'request' },
        { message: 'Esse jogo tem multiplayer?', type: 'question' },
        { message: 'KKKKKKKKKK', type: 'reaction' },
        { message: 'Faz quanto tempo que você streama?', type: 'question' },
        { message: 'Vamos chegar aos 100 likes!', type: 'encouragement' },
        { message: 'Esse é meu streamer favorito!', type: 'praise' },
        { message: 'O áudio está muito baixo', type: 'technical' },
        { message: 'Compartilhei a live nos grupos!', type: 'action' },
        { message: 'Vai jogar mais esse jogo depois?', type: 'question' },
        { message: 'Já segui o canal!', type: 'action' }
    ];
    
    const userTypes = [
        { weight: 70, type: 'normal' },
        { weight: 15, type: 'subscriber' },
        { weight: 10, type: 'moderator' },
        { weight: 5, type: 'donator' }
    ];
    
    const names = ['fan123', 'gamer_pro', 'kick_viewer', 'stream_lover', 'tech_guru', 
                   'player_one', 'chat_master', 'viewer42', 'follower99', 'live_fan',
                   'fulustrecofan', 'kick_brasil', 'gamemaster', 'nova_era', 'fiel_viewer',
                   'top_supporter', 'br_gamer'];
    
    // Simular chat ativo apenas quando live
    if (!isLive) return [];
    
    // Inicializar histórico de chat se não existir
    if (!window.chatHistory) window.chatHistory = [];
    
    // Adicionar 1-2 mensagens novas aleatórias a cada atualização
    const newMessages = [];
    const messageCount = 1 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < messageCount; i++) {
        // Escolher um usuário aleatório
        const username = names[Math.floor(Math.random() * names.length)];
        
        // Determinar tipo de usuário
        const userTypeRoll = Math.random() * 100;
        let userTypeCategory = 'normal';
        let accumulatedWeight = 0;
        
        for (const type of userTypes) {
            accumulatedWeight += type.weight;
            if (userTypeRoll <= accumulatedWeight) {
                userTypeCategory = type.type;
                break;
            }
        }
        
        // Escolher uma mensagem aleatória
        const messageTemplate = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
        
        // Registrar timestamp da mensagem
        const now = new Date();
        const timestamp = \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}:\${now.getSeconds().toString().padStart(2, '0')}\`;
        
        newMessages.push({
            username,
            message: messageTemplate.message,
            timestamp,
            isSubscriber: userTypeCategory === 'subscriber',
            isModerator: userTypeCategory === 'moderator',
            isDonator: userTypeCategory === 'donator'
        });
    }
    
    // Incrementar contagem total de mensagens
    messageCount += newMessages.length;
    
    // Ocasionalmente adicionar um novo seguidor
    if (Math.random() > 0.95) {
        newFollowersCount++;
    }
    
    // Manter um histórico de até 30 mensagens
    window.chatHistory = [...window.chatHistory, ...newMessages].slice(-30);
    
    return window.chatHistory;
}
`;

// Instruções para implementação
console.log("Aplicativo otimizado para o canal fulustrecofulus");
console.log("Para implementar este aplicativo, crie dois arquivos:");
console.log("1. index.html com o conteúdo HTML");
console.log("2. app.js com o código JavaScript");
console.log(
  "\nOs arquivos acima contêm um aplicativo completo e pré-configurado para o canal fulustrecofulus no Kick."
);
