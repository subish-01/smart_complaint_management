/**
 * SCMS Help Assistant - Guides citizens through the Smart City Complaint Management System
 */
(function () {
  const WELCOME_MSG = "Hello! I'm your SCMS Help Assistant. I can help you with:\n\n• How to report a complaint\n• How to check complaint status\n• Navigation tips for the website\n\nWhat would you like to know? Feel free to ask!";

  // Removed static RESPONSES object as per user request for dynamic AI

  function addMessage(text, isUser, isTyping = false) {
    const container = document.getElementById("chatbotMessages");
    const msg = document.createElement("div");
    msg.className = "chatbot-msg " + (isUser ? "chatbot-msg-user" : "chatbot-msg-bot");
    if (isTyping) msg.classList.add("chatbot-typing");

    const content = document.createElement("div");
    content.className = "chatbot-msg-content";

    // Simple markdown parsing for bolding
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content.innerHTML = formattedText.replace(/\n/g, '<br>');

    msg.appendChild(content);
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    return msg;
  }

  async function sendUserMessage(text) {
    if (!text.trim()) return;

    // 1. Add User Message
    addMessage(text, true);
    document.getElementById("chatbotInput").value = "";

    // 2. Show Typing Indicator
    const typingMsg = addMessage("Thinking...", false, true);

    try {
      // 3. Call AI API
      // Check if chatbotAPI is available
      if (window.chatbotAPI) {
        const reply = await window.chatbotAPI.generateResponse(text);
        // 4. Remove Typing Indicator and Add AI Response
        typingMsg.remove();
        addMessage(reply, false);
      } else {
        throw new Error("Chatbot API not initialized");
      }
    } catch (error) {
      typingMsg.remove();
      console.error(error);
      addMessage("Sorry, I'm having trouble connecting to the AI helper right now.", false);
    }
  }

  function init() {
    const panel = document.getElementById("chatbotPanel");
    const toggle = document.getElementById("chatbotToggle");
    const closeBtn = document.getElementById("chatbotClose");
    const input = document.getElementById("chatbotInput");
    const sendBtn = document.getElementById("chatbotSend");
    const messages = document.getElementById("chatbotMessages");

    toggle.addEventListener("click", () => {
      panel.classList.toggle("chatbot-panel-open");
      if (panel.classList.contains("chatbot-panel-open") && messages.children.length === 0) {
        addMessage(WELCOME_MSG, false);
      }
    });

    closeBtn.addEventListener("click", () => panel.classList.remove("chatbot-panel-open"));
    sendBtn.addEventListener("click", () => sendUserMessage(input.value));
    input.addEventListener("keypress", (e) => { if (e.key === "Enter") sendUserMessage(input.value); });
    document.querySelectorAll(".chatbot-quick-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const msg = btn.getAttribute("data-msg");
        if (msg) sendUserMessage(msg);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();