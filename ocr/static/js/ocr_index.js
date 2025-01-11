document.addEventListener('alpine:init', () => {
    Alpine.store('chatbot', {
        messages: [],
        newMessage: '',
        isTyping: false,
        image: '',
        getResponse: function() {
            this.isTyping = true;
            let formData = new FormData();
            formData.append('image', document.getElementById('file-input').files[0]);

            fetch('/ocr/get-response/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.getElementsByName('csrfmiddlewaretoken')[0].value,
                }
            })
            .then(response => response.json())
            .then(data => {
                let htmlResponse = `
                <ul>
                    <li><strong>Receipt Number:</strong> ${data.general_information.receipt_number}</li>
                    <li><strong>Date of Receipt:</strong> ${data.general_information.date_of_receipt}</li>
                    <li><strong>Issuer Name:</strong> ${data.general_information.issuer_name}</li>
                    <li><strong>Issuer TIN:</strong> ${data.general_information.issuer_tin}</li>
                    <li><strong>Issuer Address:</strong> ${data.general_information.issuer_address}</li>
                    <li><strong>Goods/Services Description:</strong> ${data.general_information.goods_or_services_description}</li>
                    <li><strong>Total Amount:</strong> ${data.general_information.total_amount}</li>
                    <li><strong>Payment Method:</strong> ${data.general_information.payment_method ? data.general_information.payment_method : 'Not Available'}</li>
                    <li><strong>VAT Amount:</strong> ${data.general_information.vat_amount ? data.general_information.vat_amount : 'Not Available'}</li>
                    <li><strong>VAT Percentage:</strong> ${data.general_information.vat_percentage ? data.general_information.vat_percentage : 'Not Available'}</li>
                    <li><strong>Payee Name:</strong> ${data.general_information.payee_name}</li>
                    <li><strong>Payee TIN:</strong> ${data.general_information.payee_tin ? data.general_information.payee_tin : 'Not Available'}</li>
                    <li><strong>Payee Address:</strong> ${data.general_information.payee_address ? data.general_information.payee_address : 'Not Available'}</li>
                </ul>
                <br><hr><br>
                <h2>Accuracy</h2>
                <ul>
                    <li><strong>Accuracy Score:</strong> ${data.accuracy.accuracy_score}</li>
                    <li><strong>Accuracy Message:</strong> ${data.accuracy.accuracy_message}</li>
                </ul>
                `;
                this.messages.push({ id: this.messages.length, text: htmlResponse, from: 'bot', time: new Date().toLocaleTimeString() });
            })
            .finally(() => {
                this.isTyping = false;
            });
        }
    });
});

function handleImageUpload(event) {
    Alpine.store('chatbot').messages = [];
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            document.getElementById('selected-image').src = imageUrl;
        };
        reader.readAsDataURL(file);
    }
}


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