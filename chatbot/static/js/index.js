document.addEventListener('alpine:init', () => {
    Alpine.store('chatbot', {
        messages: [],
        newMessage: '',
        predefinedMessages: [
            'Who is YAHSHUA?',
            'What is YAHSHUA Books Online?',
            'What is YAHSHUA Payroll?',
            'What is YAHSHUA HRIS?',
            'What is YAHSHUA Tax Online?',
        ],
        isTyping: false,
        getResponse: function() {
            this.isTyping = true;
            let message = this.newMessage;
            this.newMessage = '';
            this.messages.push({ id: this.messages.length, text: message, from: 'user', time: new Date().toLocaleTimeString() });
            fetch('/chatbot/get-response/', {
                method: 'POST',
                body: JSON.stringify(this.messages),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.getElementsByName('csrfmiddlewaretoken')[0].value,
                }
            })
            .then(response => response.json())
            .then(data => {
                const htmlResponse = marked.parse(data.response);
                this.messages.push({ id: this.messages.length, text: htmlResponse, from: 'bot', time: new Date().toLocaleTimeString() });
            })
            .finally(() => {
                this.isTyping = false;
            });
        }
    });
});

function populateMessage(message) {
    Alpine.store('chatbot').newMessage = message;
    Alpine.store('chatbot').getResponse();
}

function scrollToBottom(delay) {
    if (delay) {
        setTimeout(() => {
            const chatContainer = document.getElementById('chatContainer');
            chatContainer.scrollTop = 10000;
        }, delay);
    } else {
        const chatContainer = document.getElementById('chatContainer');
        chatContainer.scrollTop = 10000;
    }
}