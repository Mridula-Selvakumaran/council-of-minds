// Council of Minds - Frontend Logic
const API_URL = 'http://localhost:3000';

// DOM Elements
const input = document.querySelector('input[type="text"]');
const submitBtn = document.querySelector('button');
const statusText = document.querySelector('.text-primary\\/50.font-pixel');
const progressBars = document.querySelectorAll('.w-8.h-1');
const avatars = document.querySelectorAll('.floating-avatar, .floating-avatar-delayed');
const speechBubbles = document.querySelectorAll('.opacity-0, .opacity-100');
const finalPanel = document.querySelector('.w-full.bg-surface-dark.border-2');

// Agent status messages
const agentMessages = {
  GPT: "Synthesizing context...",
  CLAUDE: "Analyzing ethical nuance...",
  GEMINI: "Processing live data streams...",
  GROK: "Shifty logic detected. Recalibrating..."
};

// Agent colors for progress bars
const agentColors = {
  GPT: 'bg-council-teal',
  CLAUDE: 'bg-council-amber',
  GEMINI: 'bg-council-blue',
  GROK: 'bg-council-pink'
};

// Store responses for modal display
let debateHistory = [];

// Submit query
submitBtn.addEventListener('click', () => submitQuery());
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitQuery();
});

async function submitQuery() {
  const query = input.value.trim();
  if (!query) return;

  // Disable input
  input.disabled = true;
  submitBtn.disabled = true;
  statusText.textContent = 'TRANSMITTING TO COUNCIL...';
  
  // Reset state
  debateHistory = [];
  resetProgress();
  
  try {
    const response = await fetch(`${API_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!response.ok) throw new Error('Network error');
    
    const data = await response.json();
    debateHistory = data.responses;
    
    // Animate responses sequentially
    await animateDebate(data.responses);
    
    // Show final answer
    displayFinalAnswer(data.finalAnswer);
    
  } catch (error) {
    console.error('Error:', error);
    statusText.textContent = 'ERROR: CONNECTION FAILED';
  } finally {
    input.disabled = false;
    submitBtn.disabled = false;
    input.value = '';
  }
}

function resetProgress() {
  progressBars.forEach(bar => {
    bar.className = 'w-8 h-1 bg-white/10';
  });
}

async function animateDebate(responses) {
  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];
    const agent = response.agent;
    
    // Update status
    statusText.textContent = `${agent.toUpperCase()} IS ${response.role}...`;
    
    // Show speech bubble
    updateSpeechBubble(i, agent);
    
    // Glow avatar
    glowAvatar(i);
    
    // Update progress bar
    updateProgressBar(i, agent);
    
    // Wait to simulate real-time
    await sleep(1500);
  }
  
  statusText.textContent = 'CONSENSUS REACHED';
}

function updateSpeechBubble(index, agent) {
  const bubble = speechBubbles[index];
  if (bubble) {
    bubble.classList.remove('opacity-0');
    bubble.classList.add('opacity-100');
    bubble.textContent = agentMessages[agent];
  }
}

function glowAvatar(index) {
  const avatar = avatars[index];
  if (avatar) {
    avatar.style.filter = 'brightness(1.5) drop-shadow(0 0 20px currentColor)';
    setTimeout(() => {
      avatar.style.filter = '';
    }, 1500);
  }
}

function updateProgressBar(index, agent) {
  if (progressBars[index]) {
    progressBars[index].className = `w-8 h-1 ${agentColors[agent]} animate-pulse`;
  }
}

function displayFinalAnswer(finalAnswer) {
  // Find the final panel text area
  finalPanel.style.display = 'block';
  const finalText = finalPanel.querySelector('.text-gray-300');
  if (finalText) {
    finalText.textContent = finalAnswer;
  }
  
  // Update consensus indicator
  const consensusText = finalPanel.querySelector('.text-green-400');
  if (consensusText) {
    const agreement = Math.floor(Math.random() * 10) + 90; // 90-100%
    consensusText.textContent = `${agreement}% AGREEMENT`;
  }
  
  // Scroll to final answer
  finalPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Make avatars clickable to show individual responses
avatars.forEach((avatar, index) => {
  avatar.addEventListener('click', () => {
    if (debateHistory[index]) {
      showModal(debateHistory[index]);
    }
  });
});

function showModal(response) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-surface-dark border-2 border-primary rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-primary font-pixel text-sm uppercase">${response.agent} - ${response.role}</h3>
        <button class="text-white/60 hover:text-white" onclick="this.closest('.fixed').remove()">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="text-gray-300 leading-relaxed whitespace-pre-wrap">${response.content}</div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

console.log('🚀 Council of Minds frontend loaded');
console.log('Backend URL:', API_URL);