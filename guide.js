const guidePanel = document.querySelector('#guide-panel');
const guideLaunch = document.querySelector('#guide-launch');
const guideMessages = document.querySelector('#guide-messages');
const guideInput = document.querySelector('#guide-input');
const guideHistory = [];
let guidePending = false;

function toggleGuide(open) {
  guidePanel.classList.toggle('open', open);
  guidePanel.setAttribute('aria-hidden', String(!open));
  guideLaunch.setAttribute('aria-expanded', String(open));
  if (open) guideInput.focus();
}

guideLaunch.addEventListener('click', () => toggleGuide(!guidePanel.classList.contains('open')));
document.querySelector('#guide-close').addEventListener('click', () => toggleGuide(false));

const suggestedLinks = [
  { label: 'Learnova', href: 'https://aether-ai.humblemast8.chatgpt.site/learnova.html' },
  { label: 'Innocad', href: 'https://aetherlabs.humblemast8.chatgpt.site/innocad.html' },
  { label: 'AetherSoft', href: 'https://aethersoft.humblemast8.chatgpt.site/' },
];

function addGuideMessage(text, who, showLinks = false) {
  const node = document.createElement('div');
  node.className = `guide-message ${who}`;
  node.textContent = text;
  if (showLinks) {
    const row = document.createElement('div');
    row.className = 'guide-links';
    suggestedLinks.forEach((link) => {
      const anchor = document.createElement('a');
      anchor.href = link.href;
      anchor.textContent = link.label;
      row.append(anchor);
    });
    node.append(row);
  }
  guideMessages.append(node);
  guideMessages.scrollTop = guideMessages.scrollHeight;
  return node;
}

async function askGuide(value) {
  const question = value.trim();
  if (!question || guidePending) return;
  guidePending = true;
  const send = document.querySelector('#guide-form button[type="submit"]');
  send.disabled = true;
  addGuideMessage(question, 'user');
  guideHistory.push({ role: 'user', content: question });
  const waiting = addGuideMessage('Let me look that up…', 'assistant');
  let assistantNode = null;
  let answer = '';
  try {
    const response = await fetch('https://aether-ai.humblemast8.chatgpt.site/api/chat/guide', {
      method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: guideHistory }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'I could not connect just now. Try again shortly.');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const handleLine = (line) => {
      if (!line.startsWith('data:')) return;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') return;
      try {
        const event = JSON.parse(payload);
        const text = (event.candidates?.[0]?.content?.parts || []).map((part) => part.text || '').join('');
        if (!text) return;
        answer += text;
        if (!assistantNode) {
          waiting.remove();
          assistantNode = document.createElement('div');
          assistantNode.className = 'guide-message assistant';
          guideMessages.append(assistantNode);
        }
        assistantNode.textContent = answer;
        guideMessages.scrollTop = guideMessages.scrollHeight;
      } catch { /* Ignore incomplete SSE data lines. */ }
    };
    while (true) {
      const { value: chunk, done } = await reader.read();
      buffer += decoder.decode(chunk || new Uint8Array(), { stream: !done });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';
      lines.forEach(handleLine);
      if (done) break;
    }
    if (buffer) handleLine(buffer);
    if (!answer) throw new Error('I did not receive an answer. Please try again.');
    guideHistory.push({ role: 'assistant', content: answer });
    if (/Learnova|Innocad|AetherSoft|AetherLabs|AetherAI/i.test(answer)) {
      const row = document.createElement('div'); row.className = 'guide-links';
      suggestedLinks.forEach((link) => {
        const anchor = document.createElement('a'); anchor.href = link.href; anchor.textContent = link.label; row.append(anchor);
      });
      assistantNode.append(row);
    }
  } catch (error) {
    if (assistantNode) {
      assistantNode.textContent = `${answer}${answer ? '\n\n' : ''}${error.message || 'The response was interrupted.'}`;
      assistantNode.classList.add('chat-error');
    } else {
      waiting.textContent = error.message || 'I could not connect just now. Try again shortly.';
      waiting.classList.add('chat-error');
    }
    guideHistory.pop();
  } finally {
    guidePending = false;
    send.disabled = false;
  }
}

document.querySelector('#guide-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const question = guideInput.value;
  guideInput.value = '';
  askGuide(question);
});
guideMessages.querySelectorAll('[data-guide]').forEach((button) => button.addEventListener('click', () => askGuide(button.dataset.guide)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && guidePanel.classList.contains('open')) toggleGuide(false);
});
