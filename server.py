"""
Flask сервер для обслуживания lesson2.html и ИИ-чат бота
"""
try:
    from flask import Flask, request, jsonify, send_from_directory
except Exception:
    import sys
    import subprocess
    try:
        print('Flask не найден — устанавливаю Flask...')
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'Flask==2.3.2'])
        from flask import Flask, request, jsonify, send_from_directory
    except Exception as e:
        raise ImportError(
            "Flask не найден и автоматическая установка не удалась. \n"
            "Установите Flask вручную: python -m pip install Flask"
        ) from e

import os

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("OpenAI не установлен. Используйте: pip install openai")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=BASE_DIR, static_url_path='')


@app.route('/')
def index():
    """Главная страница - lesson2.html"""
    return send_from_directory(BASE_DIR, 'lesson2.html')


@app.route('/api/chat', methods=['POST'])
def chat():
    """
    ИИ-чат бот endpoint. Принимает JSON {message: "текст сообщения", conversation: [история сообщений]}
    """
    if not OPENAI_AVAILABLE:
        return jsonify({
            'response': 'OpenAI библиотека не установлена. Установите: pip install openai'
        }), 200
    
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    
    if not message:
        return jsonify({'error': 'Сообщение не может быть пустым'}), 400
    
    api_key = os.getenv('OPENAI_API_KEY', '')
    
    if not api_key:
        return jsonify({
            'response': 'Привет! Я ИИ-чат бот. Для работы мне нужен API ключ OpenAI. '
                'Установите переменную окружения OPENAI_API_KEY. '
                    'Я могу помочь с вопросами и ответить на твои вопросы!'
        }), 200
    
    try:
        client = openai.OpenAI(api_key=api_key)
        conversation = data.get('conversation', [])
        system_message = {
            "role": "system",
            "content": "Ты дружелюбный помощник. Отвечай кратко и по делу на русском языке. Будь полезным и вежливым."
        }
        messages = [system_message]
        for msg in conversation[-10:]:
            if msg.get('role') and msg.get('content'):
                messages.append({
                    "role": msg['role'],
                    "content": msg['content']
                })
        messages.append({
            "role": "user",
            "content": message
        })
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        ai_response = response.choices[0].message.content.strip()
        return jsonify({'response': ai_response}), 200
    except Exception as e:
        print('ОШИБКА В CHAT:', e)
        return jsonify({'error': f'Ошибка при обработке запроса: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)