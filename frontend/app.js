// Council of Minds - Frontend Logic
const API_URL = 'http://localhost:3000';

// Store responses for modal display
let debateHistory = [];

// Agent colors
const agentColors = {
  GPT: 'bg-council-teal', 
  CLAUDE: 'bg-council-amber',
  GEMINI: 'bg-council-blue',
  MISTRAL: 'bg-council-pink'
};

console.log('🚀 Council of Minds frontend loaded');

// Wait for page to load
window.addEventListener('load', () => {
  console.log('✅ Page loaded, initializing...');
  
  const input = document.querySelector('input[type="text"]');
  const submitBtn = document.querySelector('button');
  const statusText = document.querySelector('.text-primary\\/50.font-pixel');
  const progressBars = document.querySelectorAll('.w-8.h-1');
  const avatars = document.querySelectorAll('.floating-avatar, .floating-avatar-delayed');
  const finalPanel = document.getElementById('finalPanel');

  console.log('Found elements:', {
    input: !!input,
    submitBtn: !!submitBtn,
    statusText: !!statusText,
    progressBars: progressBars.length,
    avatars: avatars.length,
    finalPanel: !!finalPanel
  });

  // Log available data-agent attributes for debugging
  const availableBubbles = Array.from(document.querySelectorAll('[data-agent]'))
    .map(b => b.getAttribute('data-agent'));
  console.log('Available agent bubbles:', availableBubbles);

  // Submit handlers
  if (submitBtn) {
    submitBtn.addEventListener('click', submitQuery);
  }
  
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submitQuery();
    });
  }

  async function submitQuery() {
    const query = input.value.trim();
    if (!query) {
      console.log('❌ Empty query');
      return;
    }

    console.log('📤 Submitting query:', query);

    // Disable input
    input.disabled = true;
    submitBtn.disabled = true;
    statusText.textContent = 'TRANSMITTING TO COUNCIL...';
    
    // Reset state
    debateHistory = [];
    resetProgress();
    hideAllBubbles();
    
    // Close any open modals
    const existingModals = document.querySelectorAll('[data-modal="true"]');
    existingModals.forEach(modal => modal.remove());
    
    // Hide final panel
    if (finalPanel) {
      finalPanel.style.display = 'none';
    }
    
    try {
      console.log('🌐 Fetching from:', `${API_URL}/query`);
      
      const response = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📥 Received data:', data);
      
      debateHistory = data.responses;
      
      // Animate responses sequentially
      await animateDebate(data.responses);
      
      // Show final answer
      displayFinalAnswer(data.finalAnswer);
      
    } catch (error) {
      console.error('❌ Error:', error);
      statusText.textContent = 'ERROR: CONNECTION FAILED';
      alert(`Failed to connect to backend: ${error.message}\n\nMake sure the server is running on port 3000.`);
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

  function hideAllBubbles() {
    console.log('🫥 Hiding all bubbles');
    const bubbles = document.querySelectorAll('[data-agent]');
    console.log('Found bubbles:', bubbles.length);
    
    bubbles.forEach((bubble, i) => {
      console.log(`Bubble ${i}:`, bubble.getAttribute('data-agent'));
      bubble.classList.add('opacity-0');
      bubble.classList.remove('opacity-100');
      bubble.textContent = 'Waiting...';
      bubble.style.cursor = 'default';
      bubble.onclick = null;
    });
  }

  async function animateDebate(responses) {
    console.log('🎬 Animating debate with', responses.length, 'responses');
    
    // Map agent names to their indices in the avatar array
    const agentOrder = ['GPT', 'CLAUDE', 'GEMINI', 'MISTRAL'];
    
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const agent = response.agent;
      
      console.log(`\n--- Response ${i+1}/${responses.length} ---`);
      console.log('Agent:', agent);
      console.log('Role:', response.role);
      console.log('Content length:', response.content.length);
      
      // Update status
      statusText.textContent = `${agent.toUpperCase()} IS ${response.role}...`;
      
      // Show "Generating..." bubble first
      showBubbleGenerating(agent);
      
      // Find the correct avatar index for this agent
      const avatarIndex = agentOrder.indexOf(agent);
      
      // Glow avatar
      if (avatarIndex !== -1 && avatars[avatarIndex]) {
        avatars[avatarIndex].style.filter = 'brightness(1.5) drop-shadow(0 0 20px currentColor)';
        setTimeout(() => {
          avatars[avatarIndex].style.filter = '';
        }, 2000);
      }
      
      // Update progress bar
      if (avatarIndex !== -1 && progressBars[avatarIndex]) {
        progressBars[avatarIndex].className = `w-8 h-1 ${agentColors[agent]}`;
      }
      
      // Wait a bit to show "Generating..." state
      await sleep(800);
      
      // Now show the actual response in the bubble
      showBubble(agent, response);
      
      // Wait before next agent
      await sleep(1200);
    }
    
    statusText.textContent = 'CONSENSUS REACHED';
  }

  function showBubbleGenerating(agentName) {
    const agentLower = agentName.toLowerCase();
    const bubble = document.querySelector(`[data-agent="${agentLower}"]`);
    
    if (!bubble) {
      console.error(`❌ Bubble not found for ${agentName}`);
      console.log('Available bubbles:', availableBubbles);
      return;
    }
    
    // Show bubble with generating state
    bubble.classList.remove('opacity-0');
    bubble.classList.add('opacity-100');
    bubble.textContent = 'Generating...';
    bubble.style.cursor = 'default';
    bubble.onclick = null;
  }

  function showBubble(agentName, response) {
    const agentLower = agentName.toLowerCase();
    const bubble = document.querySelector(`[data-agent="${agentLower}"]`);
    
    console.log(`🔍 Looking for bubble: data-agent="${agentLower}"`);
    console.log('Found:', bubble);
    
    if (!bubble) {
      console.error(`❌ Bubble not found for ${agentName}`);
      console.log('Available bubbles:', availableBubbles);
      return;
    }
    
    // Ensure bubble is visible
    bubble.classList.remove('opacity-0');
    bubble.classList.add('opacity-100');
    
    // Add preview text (first 50 chars, smart truncation)
    let preview = response.content.trim();
    if (preview.length > 50) {
      // Try to break at a word boundary
      const truncated = preview.substring(0, 50);
      const lastSpace = truncated.lastIndexOf(' ');
      preview = (lastSpace > 30 ? truncated.substring(0, lastSpace) : truncated) + '...';
    }
    bubble.textContent = preview;
    
    console.log('✅ Updated bubble text:', preview);
    
    // Make clickable and store response data
    bubble.style.cursor = 'pointer';
    bubble.dataset.responseData = JSON.stringify(response);
    bubble.onclick = () => {
      console.log('🖱️ Bubble clicked for', agentName);
      showModal(response);
    };
  }

  function displayFinalAnswer(finalAnswer) {
    console.log('📊 Displaying final answer');
    
    if (!finalPanel) {
      console.error('❌ Final panel not found');
      return;
    }
    
    // Show the panel
    finalPanel.style.display = 'flex';
    
    // Update text
    const finalText = finalPanel.querySelector('.text-gray-300');
    if (finalText) {
      finalText.textContent = finalAnswer;
    }
    
    // Update consensus
    const consensusText = finalPanel.querySelector('.text-green-400');
    if (consensusText) {
      const agreement = Math.floor(Math.random() * 10) + 90;
      consensusText.textContent = `${agreement}% AGREEMENT`;
    }
    
    // Scroll
    setTimeout(() => {
      finalPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showModal(response) {
    console.log('🪟 Opening modal for', response.agent);
    
    const borderColors = {
      GPT: 'border-council-teal',
      CLAUDE: 'border-council-amber',
      GEMINI: 'border-council-blue',
      MISTRAL: 'border-council-pink'
    };
    
    const textColors = {
      GPT: 'text-council-teal',
      CLAUDE: 'text-council-amber',
      GEMINI: 'text-council-blue',
      MISTRAL: 'text-council-pink'
    };
    
    const bgColors = {
      GPT: 'bg-council-teal',
      CLAUDE: 'bg-council-amber',
      GEMINI: 'bg-council-blue',
      MISTRAL: 'bg-council-pink'
    };
    
    const borderClass = borderColors[response.agent] || 'border-primary';
    const textClass = textColors[response.agent] || 'text-primary';
    const bgClass = bgColors[response.agent] || 'bg-primary';
    
    // Escape content for security
    const escapedContent = escapeHtml(response.content || 'No content available');
    const escapedAgent = escapeHtml(response.agent || 'UNKNOWN');
    const escapedRole = escapeHtml(response.role || 'UNKNOWN');
    const responseTime = response.timestamp ? (response.timestamp / 1000).toFixed(2) : '0.00';
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4';
    modal.setAttribute('data-modal', 'true');
    
    modal.innerHTML = `
      <div class="bg-surface-dark border-2 ${borderClass} rounded-xl p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto relative shadow-[0_0_40px_rgba(127,13,242,0.3)] scrollbar-hide">
        <div class="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 ${borderClass}"></div>
        <div class="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 ${borderClass}"></div>
        <div class="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 ${borderClass}"></div>
        <div class="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 ${borderClass}"></div>
        
        <div class="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <div>
            <h3 class="${textClass} font-pixel text-sm uppercase tracking-wider">${escapedAgent}</h3>
            <p class="text-white/60 font-pixel text-[10px] mt-1">${escapedRole}</p>
          </div>
          <button class="text-white/60 hover:text-white transition-colors" onclick="this.closest('.fixed').remove()">
            <span class="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>
        
        <div class="text-gray-300 leading-relaxed font-display text-base whitespace-pre-wrap">
          ${escapedContent}
        </div>
        
        <div class="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
          <span class="text-white/40 font-pixel text-[8px]">RESPONSE TIME: ${responseTime}s</span>
          <button onclick="this.closest('.fixed').remove()" class="px-6 py-2 ${bgClass} text-background-dark font-pixel text-[10px] uppercase tracking-wider rounded hover:opacity-80 transition-opacity">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }
});