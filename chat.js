// ИИ-чат бот для lesson1
class ChatBot {
    constructor() {
        this.isOpen = false;
        this.conversation = [];
        this.init();
    }

    init() {
        this.createChatWidget();
        
        // Обработчики событий
        document.getElementById('chat-toggle').addEventListener('click', () => this.toggleChat());
        document.getElementById('chat-close').addEventListener('click', () => this.closeChat());
        document.getElementById('chat-send').addEventListener('click', () => this.sendMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    createChatWidget() {
        const chatHTML = `
            <div class="chat-widget">
                <div class="chat-container" id="chat-container">
                    <div class="chat-header">
                        <h3>💬ИИ Помощник</h3>
                        <button class="chat-close" id="chat-close">×</button>
                    </div>
                    <div class="chat-messages" id="chat-messages">
                        <div class="chat-message bot">
                            Привет я ИИ помощник,чем могу помочь? 😊
                        </div>
                    </div>
                    <div class="chat-input-container">
                        <input 
                            type="text" 
                            class="chat-input" 
                            id="chat-input" 
                            placeholder="Введите сообщение..."
                        >
                        <button class="chat-send" id="chat-send">Отправить</button>
                    </div>
                </div>
                <button class="chat-button" id="chat-toggle">💬</button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const container = document.getElementById('chat-container');
        const button = document.getElementById('chat-toggle');
        
        if (this.isOpen) {
            container.classList.add('active');
            button.classList.add('active');
            document.getElementById('chat-input').focus();
        } else {
            container.classList.remove('active');
            button.classList.remove('active');
        }
    }

    closeChat() {
        this.isOpen = false;
        document.getElementById('chat-container').classList.remove('active');
        document.getElementById('chat-toggle').classList.remove('active');
    }

    addMessage(content, isUser = false) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
        messageDiv.textContent = content;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Добавляем в историю разговора
        this.conversation.push({
            role: isUser ? 'user' : 'assistant',
            content: content
        });
    }

    showLoading() {
        const messagesContainer = document.getElementById('chat-messages');
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'chat-loading';
        loadingDiv.className = 'chat-loading';
        loadingDiv.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideLoading() {
        const loading = document.getElementById('chat-loading');
        if (loading) {
            loading.remove();
        }
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Очищаем input
        input.value = '';
        
        // Отключаем кнопку отправки
        const sendButton = document.getElementById('chat-send');
        sendButton.disabled = true;

        // Добавляем сообщение пользователя
        this.addMessage(message, true);

        // Показываем индикатор загрузки
        this.showLoading();

        try {
            // Отправляем запрос на сервер
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversation: this.conversation
                })
            });

            const data = await response.json();
            
            // Убираем индикатор загрузки
            this.hideLoading();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при отправке сообщения');
            }

            // Добавляем ответ бота
            this.addMessage(data.response, false);

        } catch (error) {
            this.hideLoading();
            this.addMessage('Извините, произошла ошибка: ' + error.message, false);
            console.error('Ошибка чата:', error);
        } finally {
            // Включаем кнопку отправки обратно
            sendButton.disabled = false;
            input.focus();
        }
    }
}

// Инициализируем чат при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
});

