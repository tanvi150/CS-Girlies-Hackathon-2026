document.addEventListener('DOMContentLoaded', () => {
  let isSubmitting = false;
  let currentFortune = null;
  
  const moodInput = document.getElementById('moodInput');
  const crackBtn = document.getElementById('crackBtn');
  const resultDiv = document.getElementById('fortuneResult');
  const jarEntries = document.getElementById('jarEntries');
  const clearJarBtn = document.getElementById('clearJarBtn');
  const dailyContent = document.getElementById('dailyContent');
  const cookieContainer = document.getElementById('cookieContainer');
  const cookieWrapper = document.getElementById('cookieWrapper');
  const fortunePaper = document.getElementById('fortunePaper');
  const paperText = document.getElementById('paperText');
  const paperNumber = document.getElementById('paperNumber');
  const paperChallenge = document.getElementById('paperChallenge');
  const crackOverlay = document.getElementById('crackOverlay');
  
  // Tab navigation
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
      if (tab.dataset.tab === 'jar') loadFortuneJar();
      if (tab.dataset.tab === 'daily') checkDailyFortune();
    });
  });
  
  loadFortuneJar();
  checkDailyFortune();
  
  // Character counter
  function addCharCounter(input, maxLength) {
    const counter = document.createElement('div');
    counter.className = 'char-counter';
    counter.textContent = '0 / ' + maxLength;
    input.parentNode.insertBefore(counter, input.nextSibling);
    
    input.addEventListener('input', () => {
      const count = input.value.length;
      counter.textContent = count + ' / ' + maxLength;
      if (count >= maxLength) {
        counter.classList.add('limit-reached');
      } else {
        counter.classList.remove('limit-reached');
      }
      checkInputs();
    });
  }
  
  addCharCounter(moodInput, 200);
  
  // Check if input has text
  function checkInputs() {
    const mood = moodInput.value.trim();
    crackBtn.disabled = !mood;
  }
  
  moodInput.addEventListener('input', checkInputs);
  
  // Enter key support
  moodInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && moodInput.value.trim()) {
      crackBtn.click();
    }
  });
  
  // Suggestion chips
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      moodInput.value = chip.dataset.value;
      checkInputs();
      // Auto-focus on input after selection
      moodInput.focus();
    });
  });
  
  // Crack the cookie
  crackBtn.addEventListener('click', async () => {
    if (isSubmitting) return;
    
    const mood = moodInput.value.trim();
    if (!mood) return;
    
    isSubmitting = true;
    crackBtn.disabled = true;
    crackBtn.classList.add('loading');
    crackBtn.textContent = 'Cracking...';
    
    cookieContainer.style.display = 'block';
    resultDiv.style.display = 'none';
    fortunePaper.classList.remove('revealed');
    
    cookieWrapper.classList.remove('cracked');
    crackOverlay.classList.remove('active');
    crackOverlay.innerHTML = '';
    
    const cookie3D = document.getElementById('cookie3D');
    cookie3D.classList.add('shake');
    
    try {
      const response = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: mood })
      });
      
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      currentFortune = data;
      
      setTimeout(() => {
        cookie3D.classList.remove('shake');
        crackCookie(data);
      }, 700);
      
    } catch (error) {
      console.error('Error:', error);
      const data = generateLocalFortune(mood);
      currentFortune = data;
      setTimeout(() => {
        cookie3D.classList.remove('shake');
        crackCookie(data);
      }, 700);
    }
  });
  
  function crackCookie(data) {
    createCrackLines();
    crackOverlay.classList.add('active');
    
    setTimeout(() => {
      cookieWrapper.classList.add('cracked');
    }, 300);
    
    createParticles();
    
    setTimeout(() => {
      paperText.textContent = data.fortune;
      paperNumber.textContent = 'Lucky Number: ' + data.luckyNumber;
      paperChallenge.textContent = 'Challenge: ' + data.challenge;
      fortunePaper.classList.add('revealed');
      
      setTimeout(() => {
        displayFortune(data);
      }, 800);
      
    }, 800);
    
    isSubmitting = false;
    crackBtn.classList.remove('loading');
    crackBtn.textContent = 'Crack Another Cookie';
    crackBtn.disabled = false;
  }
  
  function createCrackLines() {
    const overlay = crackOverlay;
    overlay.innerHTML = '';
    
    const numLines = 10;
    
    for (let i = 0; i < numLines; i++) {
      const line = document.createElement('div');
      line.className = 'crack-line';
      
      const x = 30 + Math.random() * 180;
      const y = 30 + Math.random() * 140;
      const angle = Math.random() * 360;
      const length = 15 + Math.random() * 35;
      const thickness = 1 + Math.random() * 2;
      
      line.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${length}px;
        height: ${thickness}px;
        background: rgba(101, 67, 33, ${0.4 + Math.random() * 0.4});
        transform: rotate(${angle}deg);
        transform-origin: center;
        border-radius: 1px;
        opacity: ${0.6 + Math.random() * 0.4};
      `;
      
      overlay.appendChild(line);
      
      if (Math.random() > 0.6) {
        const branch = document.createElement('div');
        branch.className = 'crack-line';
        const branchAngle = angle + (Math.random() - 0.5) * 60;
        const branchLength = 8 + Math.random() * 15;
        branch.style.cssText = `
          position: absolute;
          left: ${x + Math.cos(angle * Math.PI / 180) * length * 0.6}px;
          top: ${y + Math.sin(angle * Math.PI / 180) * length * 0.6}px;
          width: ${branchLength}px;
          height: ${thickness * 0.7}px;
          background: rgba(101, 67, 33, ${0.3 + Math.random() * 0.3});
          transform: rotate(${branchAngle}deg);
          transform-origin: center;
          border-radius: 1px;
          opacity: ${0.4 + Math.random() * 0.3};
        `;
        overlay.appendChild(branch);
      }
    }
  }
  
  function createParticles() {
    const container = document.createElement('div');
    container.className = 'particle-container';
    document.body.appendChild(container);
    
    const cookieRect = document.getElementById('cookie3D').getBoundingClientRect();
    const cx = cookieRect.left + cookieRect.width / 2;
    const cy = cookieRect.top + cookieRect.height / 2;
    
    const colors = ['#d4a857', '#c49a6c', '#f5d6a8', '#b8943f', '#e8c97a', '#8b5a2b'];
    
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = 3 + Math.random() * 8;
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 200;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 30;
      
      const isCrumb = Math.random() > 0.5;
      
      particle.style.cssText = `
        left: ${cx + (Math.random() - 0.5) * 30}px;
        top: ${cy + (Math.random() - 0.5) * 30}px;
        width: ${size}px;
        height: ${isCrumb ? size * 0.6 : size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${isCrumb ? '2px' : '50%'};
        --tx: ${tx}px;
        --ty: ${ty}px;
        animation-duration: ${0.8 + Math.random() * 0.8}s;
        box-shadow: 0 0 4px rgba(139, 90, 43, 0.2);
        transform: rotate(${Math.random() * 360}deg);
      `;
      container.appendChild(particle);
    }
    
    setTimeout(() => container.remove(), 2000);
  }
  
  function displayFortune(data) {
    const favorites = JSON.parse(localStorage.getItem('fortuneFavorites') || '[]');
    const fortuneId = data.cookieId || data.id || Date.now();
    const isFavorited = favorites.some(f => f.id === fortuneId);
    
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
      <div class="fortune-result">
        <div class="fortune-text">${data.fortune}</div>
        
        <div class="fortune-details">
          <div class="detail-item">
            <div class="label">Lucky Number</div>
            <div class="value">${data.luckyNumber}</div>
          </div>
          <div class="detail-item">
            <div class="label">Your Feeling</div>
            <div class="value mood-value">"${data.mood}"</div>
          </div>
          <div class="detail-item">
            <div class="label">Category</div>
            <div class="value mood-value">${data.category || 'General'}</div>
          </div>
        </div>
        
        <div class="challenge-box">
          <div class="label">Today's Tiny Challenge</div>
          <div class="challenge-text">${data.challenge}</div>
        </div>
        
        <div class="action-buttons">
          <button class="btn-secondary" onclick="resetFortune()">New Fortune</button>
          <button class="btn-secondary" id="saveBtn">Save to Jar</button>
          <button class="btn-secondary ${isFavorited ? 'favorite' : ''}" id="favoriteBtn">
            ${isFavorited ? 'Favorited' : 'Favorite'}
          </button>
          <button class="btn-secondary" onclick="shareFortune()">Share</button>
        </div>
      </div>
    `;
    
    currentFortune = { ...data, id: fortuneId };
    
    document.getElementById('saveBtn').addEventListener('click', () => {
      saveToJar(currentFortune);
      document.getElementById('saveBtn').textContent = 'Saved!';
      document.getElementById('saveBtn').disabled = true;
      setTimeout(() => {
        document.getElementById('saveBtn').textContent = 'Save to Jar';
        document.getElementById('saveBtn').disabled = false;
      }, 2000);
    });
    
    document.getElementById('favoriteBtn').addEventListener('click', () => {
      toggleFavorite(currentFortune);
    });
    
    setTimeout(() => {
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }
  
  window.resetFortune = function() {
    location.reload();
  };
  
  function generateLocalFortune(mood) {
    const fortunes = [
      "A fresh opportunity is closer than you think.",
      "The people who matter most are watching you grow.",
      "Rest is not laziness. It is preparation.",
      "Your laughter is contagious. Use it more often.",
      "Small savings today become big freedom tomorrow.",
      "The best time to start was yesterday. The next best time is now.",
      "Your unique perspective is your greatest asset.",
      "Every expert was once a beginner who never gave up.",
      "Success is not about being the best. It is about being better than you were yesterday.",
      "The courage to begin is the most important step."
    ];
    
    const challenges = [
      "Do something today that you have been putting off.",
      "Compliment someone genuinely today.",
      "Take 5 minutes to meditate or practice deep breathing.",
      "Write down three things you are grateful for.",
      "Reach out to a friend you have not talked to in a while.",
      "Take a different route today, literally or metaphorically.",
      "Try something new, even if it is small.",
      "Give yourself permission to say no to something.",
      "Step outside for 5 minutes of fresh air.",
      "Help someone without expecting anything in return."
    ];
    
    return {
      fortune: fortunes[Math.floor(Math.random() * fortunes.length)],
      luckyNumber: Math.floor(Math.random() * 99) + 1,
      challenge: challenges[Math.floor(Math.random() * challenges.length)],
      mood: mood,
      category: 'General',
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
  }
  
  function saveToJar(data) {
    let jar = JSON.parse(localStorage.getItem('fortuneJar') || '[]');
    const id = data.cookieId || data.id;
    if (!jar.some(f => (f.cookieId === id || f.id === id))) {
      jar.unshift(data);
      localStorage.setItem('fortuneJar', JSON.stringify(jar));
      loadFortuneJar();
    }
  }
  
  function loadFortuneJar() {
    const jar = JSON.parse(localStorage.getItem('fortuneJar') || '[]');
    const favorites = JSON.parse(localStorage.getItem('fortuneFavorites') || '[]');
    
    if (jar.length === 0) {
      jarEntries.innerHTML = `
        <p style="color: var(--text-secondary); font-style: italic; text-align: center; padding: 2rem;">
          No fortunes yet. Crack your first cookie.
        </p>
      `;
      return;
    }
    
    jarEntries.innerHTML = jar.map((entry, index) => {
      const date = new Date(entry.timestamp);
      const entryId = entry.cookieId || entry.id;
      const isFav = favorites.some(f => (f.cookieId === entryId || f.id === entryId));
      return `
        <div class="jar-entry" data-id="${entryId}">
          <div class="entry-content">
            <div class="entry-text">${entry.fortune}</div>
            <div class="entry-meta">
              <span>${date.toLocaleDateString()}</span>
              <span>|</span>
              <span>${entry.category || 'General'}</span>
              <span>|</span>
              <span>Lucky #${entry.luckyNumber}</span>
            </div>
            <div class="entry-challenge">Challenge: ${entry.challenge}</div>
          </div>
          <div class="entry-actions">
            <button onclick="toggleFavoriteById(${entryId})" class="fav-btn">${isFav ? '★' : '☆'}</button>
            <button onclick="deleteFortune(${entryId})" class="delete-btn">✕</button>
            <span class="entry-number">#${index + 1}</span>
          </div>
        </div>
      `;
    }).join('');
  }
  
  if (clearJarBtn) {
    clearJarBtn.addEventListener('click', () => {
      if (confirm('Clear all fortunes from your jar?')) {
        localStorage.removeItem('fortuneJar');
        loadFortuneJar();
      }
    });
  }
  
  function toggleFavorite(data) {
    let favorites = JSON.parse(localStorage.getItem('fortuneFavorites') || '[]');
    const id = data.cookieId || data.id;
    const index = favorites.findIndex(f => (f.cookieId === id || f.id === id));
    
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(data);
    }
    
    localStorage.setItem('fortuneFavorites', JSON.stringify(favorites));
    
    const btn = document.getElementById('favoriteBtn');
    if (btn) {
      if (index > -1) {
        btn.textContent = 'Favorite';
        btn.classList.remove('favorite');
      } else {
        btn.textContent = 'Favorited';
        btn.classList.add('favorite');
      }
    }
    
    loadFortuneJar();
  }
  
  window.toggleFavoriteById = function(id) {
    const jar = JSON.parse(localStorage.getItem('fortuneJar') || '[]');
    const entry = jar.find(f => (f.cookieId === id || f.id === id));
    if (entry) toggleFavorite(entry);
  };
  
  window.deleteFortune = function(id) {
    let jar = JSON.parse(localStorage.getItem('fortuneJar') || '[]');
    jar = jar.filter(f => (f.cookieId !== id && f.id !== id));
    localStorage.setItem('fortuneJar', JSON.stringify(jar));
    
    let favorites = JSON.parse(localStorage.getItem('fortuneFavorites') || '[]');
    favorites = favorites.filter(f => (f.cookieId !== id && f.id !== id));
    localStorage.setItem('fortuneFavorites', JSON.stringify(favorites));
    
    loadFortuneJar();
  };
  
  window.shareFortune = function() {
    if (!currentFortune) return;
    const text = 'My Fortune Cookie:\n\n"' + currentFortune.fortune + '"\n\nLucky Number: ' + currentFortune.luckyNumber + '\nChallenge: ' + currentFortune.challenge;
    
    if (navigator.share) {
      navigator.share({ title: 'My Fortune Cookie', text: text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert('Fortune copied to clipboard.');
      }).catch(() => {
        prompt('Copy your fortune:', text);
      });
    }
  };
  
  function checkDailyFortune() {
    const today = new Date().toDateString();
    const savedDaily = localStorage.getItem('dailyFortune');
    
    if (savedDaily) {
      const data = JSON.parse(savedDaily);
      if (data.date === today) {
        displayDailyFortune(data.fortune);
        return;
      }
    }
    
    if (dailyContent) {
      dailyContent.innerHTML = `
        <button class="btn-crack" id="dailyBtn">Get Today's Fortune</button>
      `;
      
      document.getElementById('dailyBtn').addEventListener('click', async () => {
        try {
          const response = await fetch('/api/fortune', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              mood: 'Hopeful for today' 
            })
          });
          const fortune = await response.json();
          
          localStorage.setItem('dailyFortune', JSON.stringify({
            date: today,
            fortune: fortune
          }));
          displayDailyFortune(fortune);
        } catch {
          const fortune = {
            fortune: "Today is a gift. Unwrap it with curiosity and wonder.",
            luckyNumber: 42,
            challenge: "Do something that makes you smile today."
          };
          localStorage.setItem('dailyFortune', JSON.stringify({ date: today, fortune }));
          displayDailyFortune(fortune);
        }
      });
    }
  }
  
  function displayDailyFortune(fortune) {
    if (!dailyContent) return;
    dailyContent.innerHTML = `
      <div class="daily-date">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      <div class="fortune-text">${fortune.fortune}</div>
      <div class="fortune-details" style="grid-template-columns: 1fr 1fr; margin-top: 1rem;">
        <div class="detail-item">
          <div class="label">Lucky Number</div>
          <div class="value">${fortune.luckyNumber}</div>
        </div>
        <div class="detail-item">
          <div class="label">Today's Challenge</div>
          <div class="value" style="font-size: 0.9rem;">${fortune.challenge}</div>
        </div>
      </div>
      <button class="btn-secondary" style="margin-top: 1rem; width: 100%;" onclick="saveToJar(dailyFortune)">
        Save to Jar
      </button>
    `;
    window.dailyFortune = fortune;
  }
});