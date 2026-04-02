/**
 * SPORTAIV Demo - AI Logic with Gemini 1.5 Flash
 * IMPORTANT: Replace YOUR_GEMINI_API_KEY_HERE with your actual API key before demo.
 */
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

// Hệ thống dữ liệu cứng (System Prompt) cho AI
const SYSTEM_PROMPT = `
Bạn là trợ lý AI thông minh của hệ sinh thái SPORTAIV (Hợp nhất Thân - Tâm - Trí).
Quy tắc trả lời: Ngắn gọn, thân thiện, lịch sự, luôn xưng "em" và gọi người dùng là "anh/chị". Nếu không biết, hãy nói sẽ ghi nhận để bên tư vấn viên liên hệ lại.

Dữ liệu hệ sinh thái:
1. Mầm non KCL (Tâm): 
- Mức học phí: 12.000.000 VNĐ/tháng.
- Phương pháp: Giáo dục cá nhân hóa.
- Điểm nhấn: Có hệ thống AI Happiness Report (báo cáo mức độ hạnh phúc của bé mỗi ngày tự động gửi cho phụ huynh). 
- Trang web phụ huynh: parent.kcl.edu.vn

2. Tiếng Anh Monster (Trí):
- Lộ trình: Cam kết đầu ra chứng chỉ Quốc tế (IELTS, Cambridge).
- Điểm nhấn: Có cô giáo trợ giảng ảo 24/7 giúp chấm bài nói, sửa bài cực dễ thương. Kho bài tập luôn sinh động, nhiều màu sắc.
- Lớp học: Dùng tablet, môi trường kỷ luật.
- Trải nghiệm App Học Tập: https://eduma.thimpress.com/demo-online-learning/

3. Nến thơm Custom & Tinh dầu (Thân):
- Dịch vụ: Thiết kế nến thơm, tem nhãn theo yêu cầu và cảm xúc khách hàng.
- Điểm nhấn: Dùng Scent Finder AI để gợi ý mùi hương dựa trên cảm trạng người mua/người nhận.
- Cửa hàng đồ: shop.kcl.vn

Nếu khách hỏi tư vấn (Ví dụ: "Tư vấn nến cho người căng thẳng", "Học phí mầm non bao nhiêu?"), hãy dựa vào thông tin trên để trả lời thật khéo léo và hiện đại.
`;

// Giao diện HTML của Chatbox
const chatboxHTML = `
<style>
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8,0,1,1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0,0,0.2,1);
  }
}
.animate-bounce-slow {
  animation: bounce-slow 2s infinite;
}
.typing-dots span {
    animation: typing 1.4s infinite ease-in-out both;
}
.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }
@keyframes typing {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
}
</style>

<!-- Fixed Chat Button -->
<button id="ai-chat-btn" class="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-50 group border border-white/20">
    <div class="relative w-full h-full flex items-center justify-center animate-bounce-slow">
        <span class="text-3xl">🤖</span>
        <div class="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-600"></div>
    </div>
</button>

<!-- Chat Window -->
<div id="ai-chat-window" class="fixed bottom-24 right-6 w-80 md:w-96 rounded-2xl shadow-2xl z-50 flex flex-col hidden overflow-hidden transition-all transform origin-bottom-right" style="height: 500px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.6);">
    <!-- Header -->
    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center shrink-0">
        <div class="flex items-center gap-3">
            <span class="text-2xl">🤖</span>
            <div>
                <h3 class="font-bold">SPORTAIV Assistant</h3>
                <p class="text-xs text-indigo-100 flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-400 inline-block"></span> Powered by AI</p>
            </div>
        </div>
        <button id="ai-chat-close" class="text-indigo-100 hover:text-white">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
    </div>

    <!-- Messages Area -->
    <div id="ai-chat-messages" class="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
        <!-- Initial Message -->
        <div class="flex gap-2">
            <span class="text-xl shrink-0 mt-1">🤖</span>
            <div class="bg-white/80 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-800 border border-gray-100">
                Chào anh/chị! Em là trợ lý AI của SPORTAIV. Em có thể giúp gì cho anh/chị về mảng Mầm non (KCL), Tiếng Anh (Monster) hay Nến thơm Custom ạ?
            </div>
        </div>
    </div>

    <!-- Input Area -->
    <div class="p-3 bg-white/50 border-t border-gray-100 shrink-0">
        <form id="ai-chat-form" class="flex gap-2">
            <input type="text" id="ai-chat-input" class="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400" placeholder="Hỏi trợ lý AI...">
            <button type="submit" class="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors shrink-0">
                <svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
        </form>
    </div>
</div>
`;

// Lịch sử hội thoại để duy trì ngữ cảnh
let currentChatHistory = [];

function initChatbox() {
    const container = document.getElementById('ai-chatbox-container');
    if (!container) return;
    
    container.innerHTML = chatboxHTML;

    const chatBtn = document.getElementById('ai-chat-btn');
    const chatWindow = document.getElementById('ai-chat-window');
    const chatClose = document.getElementById('ai-chat-close');
    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-input');
    const chatMessages = document.getElementById('ai-chat-messages');

    // Toggle Chat Window
    chatBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        if(!chatWindow.classList.contains('hidden')) {
            chatInput.focus();
        }
    });

    chatClose.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
    });

    // Handle Submit
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userInput = chatInput.value.trim();
        if (!userInput) return;

        // Display User Message
        addMessageToUI(userInput, 'user');
        chatInput.value = '';

        // Check if API key is replaced
        if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            addMessageToUI('🚧 Để dùng được tính năng này, anh Thành cần thay mã API Key thật vào file ai-logic.js trước nhé!', 'ai');
            return;
        }

        // Show Loading Indicator
        const typingId = showTypingIndicator();

        // Call Gemini API
        try {
            const aiResponse = await callGeminiAPI(userInput);
            document.getElementById(typingId)?.remove();
            addMessageToUI(aiResponse, 'ai');
        } catch (error) {
            console.error('Gemini API Error:', error);
            document.getElementById(typingId)?.remove();
            addMessageToUI('Xin lỗi, hệ thống AI đang gặp chút sự cố kết nối. Anh/chị thông cảm thử lại sau nhé!', 'ai');
        }
    });

    function addMessageToUI(content, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = sender === 'user' ? 'flex justify-end' : 'flex gap-2';

        if (sender === 'user') {
            msgDiv.innerHTML = `
                <div class="bg-purple-600 p-3 rounded-2xl rounded-tr-none shadow-sm text-sm text-white max-w-[85%] break-words">
                    ${escapeHTML(content)}
                </div>
            `;
        } else {
            // Render markdown like bold
            let formattedContent = escapeHTML(content).replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
            msgDiv.innerHTML = `
                <span class="text-xl shrink-0 mt-1">🤖</span>
                <div class="bg-white/80 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-800 border border-gray-100 max-w-[85%] break-words">
                    ${formattedContent}
                </div>
            `;
        }

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.id = id;
        msgDiv.className = 'flex gap-2';
        msgDiv.innerHTML = `
            <span class="text-xl shrink-0 mt-1">🤖</span>
            <div class="bg-white/80 p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center h-10 w-16">
                <div class="typing-dots flex gap-1 items-center justify-center w-full">
                    <span class="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    <span class="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    <span class="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
}

async function callGeminiAPI(userInput) {
    // Lưu lịch sử
    currentChatHistory.push({
        "role": "user",
        "parts": [{ "text": userInput }]
    });

    // Tạo payload với system prompt ở dạng message khởi đầu (Gemini v1beta trick nếu chưa dùng systemInstruction)
    // Để đơn giản và an toàn với free API trên frontend, gửi System Prompt dưới dạng context ở role user trước.
    
    let messagesPayload = [
        {
            "role": "user",
            "parts": [{ "text": "ĐÂY LÀ CHỈ THỊ HỆ THỐNG: " + SYSTEM_PROMPT + "\n\nXin hãy xác nhận bạn đã hiểu. Chào tôi ngắn gọn." }]
        },
        {
            "role": "model",
            "parts": [{ "text": "Dạ vâng, em đã rõ. Em là trợ lý hệ sinh thái SPORTAIV, sẵn sàng hỗ trợ anh/chị!" }]
        },
        ...currentChatHistory
    ];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: messagesPayload,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
            }
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi từ Gemini:", errorData);
        throw new Error('API Request Failed');
    }

    const data = await response.json();
    let aiText = "Xin lỗi, em không hiểu ý anh/chị lắm.";
    
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts.length > 0) {
        aiText = data.candidates[0].content.parts[0].text;
        
        // Lưu lịch sử bot return để có context nối tiếp
        currentChatHistory.push({
            "role": "model",
            "parts": [{ "text": aiText }]
        });
    }

    return aiText;
}

// Khởi tạo Chatbox khi DOM tải xong
document.addEventListener('DOMContentLoaded', initChatbox);
