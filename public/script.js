const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const submitBtn = form.querySelector('button');

// Maintain the conversation state to send back to the API
let conversationHistory = [];

// Initial greeting to inform the user about the chatbot's purpose
const greetingMsg = appendMessage('model', 'Hello! I am the Houseplant Monitor Chatbot. Please enter the name of your houseplant to receive recommendations for breeding, planting, and growth monitoring.');
greetingMsg.classList.add('greeting');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // 1. UI: Add user message and clear input
  appendMessage('user', userMessage);
  input.value = '';

  // 2. UI: Show thinking state and disable input
  const botMessageElement = appendMessage('model', 'Houseplant Monitor is thinking...');
  input.disabled = true;
  submitBtn.disabled = true;

  // Prepare the history for this request (including current message)
  const requestHistory = [...conversationHistory, { role: 'user', text: userMessage }];

  try {
    // 3. Send the conversation to the backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation: requestHistory })
    });

    const data = await response.json();

    if (response.ok && data.result) {
      // 4. Success: Update UI and persist history
      botMessageElement.innerHTML = marked.parse(data.result);
      conversationHistory.push({ role: 'user', text: userMessage });
      conversationHistory.push({ role: 'model', text: data.result });
    } else {
      botMessageElement.textContent = "Error: " + (data.message || "No response received.");
    }
  } catch (error) {
    botMessageElement.textContent = "Failed to get response from server.";
    console.error("Fetch error:", error);
  } finally {
    // Re-enable UI
    input.disabled = false;
    submitBtn.disabled = false;
    input.focus();
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
