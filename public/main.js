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
  
  function checkInputs() {
    const mood = moodInput.value.trim();
    crackBtn.disabled = !mood;
  }
  
  moodInput.addEventListener('input', checkInputs);
  
  moodInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && moodInput.value.trim()) {
      crackBtn.click();
    }
  });
  
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      moodInput.value = chip.dataset.value;
      checkInputs();
      moodInput.focus();
    });
  });
  
  // FIXED: Start animation immediately, don't wait for API
  crackBtn.addEventListener('click', async () => {
    if (isSubmitting) return;
    
    const mood = moodInput.value.trim();
    if (!mood) return;
    
    isSubmitting = true;
    crackBtn.disabled = true;
    crackBtn.classList.add('loading');
    crackBtn.textContent = 'Cracking...';
    
    // Show cookie container immediately
    cookieContainer.style.display = 'block';
    resultDiv.style.display = 'none';
    fortunePaper.classList.remove('revealed');
    
    // Reset cookie state
    cookieWrapper.classList.remove('cracked');
    crackOverlay.classList.remove('active');
    crackOverlay.innerHTML = '';
    
    // START ANIMATION IMMEDIATELY - don't wait for API
    const cookie3D = document.getElementById('cookie3D');
    cookie3D.classList.add('shake');
    
    // Start the crack animation right away
    setTimeout(() => {
      cookie3D.classList.remove('shake');
      // Start cracking immediately with placeholder data
      startCrackAnimation();
    }, 400);
    
    // Fetch fortune in the background
    try {
      const response = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: mood })
      });
      
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      currentFortune = data;
      
      // Update the paper with real data when it arrives
      updateFortunePaper(data);
      
    } catch (error) {
      console.error('Error:', error);
      const data = generateLocalFortune(mood);
      currentFortune = data;
      updateFortunePaper(data);
    }
  });
  
  // Start crack animation immediately
  function startCrackAnimation() {
    // Create crack lines
    createCrackLines();
    crackOverlay.classList.add('active');
    
    // Split the cookie
    setTimeout(() => {
      cookieWrapper.classList.add('cracked');
      const container = document.querySelector('.cookie-container');
      if (container) {
        container.classList.add('split-effect');
      }
    }, 200);
    
    // Create particles
    createParticles();
    
    // Show paper with loading state first
    setTimeout(() => {
      paperText.textContent = '✨ Your fortune is coming...';
      paperNumber.textContent = 'Loading...';
      paperChallenge.textContent = 'Please wait...';
      fortunePaper.classList.add('revealed');
    }, 400);
  }
  
  // Update paper with real fortune data
  function updateFortunePaper(data) {
    paperText.textContent = data.fortune;
    paperNumber.textContent = 'Lucky Number: ' + data.luckyNumber;
    paperChallenge.textContent = 'Challenge: ' + data.challenge;
    
    // Show full result
    setTimeout(() => {
      displayFortune(data);
    }, 300);
    
    isSubmitting = false;
    crackBtn.classList.remove('loading');
    crackBtn.textContent = 'Crack Another Cookie';
    crackBtn.disabled = false;
  }
  
  function createCrackLines() {
    const overlay = crackOverlay;
    overlay.innerHTML = '';
    
    const numLines = 8;
    
    for (let i = 0; i < numLines; i++) {
      const line = document.createElement('div');
      line.className = 'crack-line';
      
      const x = 30 + Math.random() * 180;
      const y = 30 + Math.random() * 140;
      const angle = Math.random() * 360;
      const length = 20 + Math.random() * 40;
      const thickness = 2 + Math.random() * 2;
      
      line.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${length}px;
        height: ${thickness}px;
        background: rgba(80, 50, 20, 0.8);
        transform: rotate(${angle}deg);
        transform-origin: center;
        border-radius: 2px;
        opacity: 0.9;
        box-shadow: 0 0 8px rgba(80, 50, 20, 0.2);
        z-index: 10;
      `;
      
      overlay.appendChild(line);
      
      if (Math.random() > 0.6) {
        const branch = document.createElement('div');
        branch.className = 'crack-line';
        const branchAngle = angle + (Math.random() - 0.5) * 60;
        const branchLength = 10 + Math.random() * 20;
        branch.style.cssText = `
          position: absolute;
          left: ${x + Math.cos(angle * Math.PI / 180) * length * 0.5}px;
          top: ${y + Math.sin(angle * Math.PI / 180) * length * 0.5}px;
          width: ${branchLength}px;
          height: ${thickness * 0.6}px;
          background: rgba(80, 50, 20, 0.6);
          transform: rotate(${branchAngle}deg);
          transform-origin: center;
          border-radius: 2px;
          opacity: 0.7;
          z-index: 10;
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
    
    const colors = ['#d4a857', '#c49a6c', '#f5d6a8', '#b8943f', '#e8c97a'];
    
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = 3 + Math.random() * 6;
      const angle = Math.random() * Math.PI * 2;
      const distance = 60 + Math.random() * 150;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 30;
      
      particle.style.cssText = `
        left: ${cx + (Math.random() - 0.5) * 30}px;
        top: ${cy + (Math.random() - 0.5) * 30}px;
        width: ${size}px;
        height: ${size * 0.6}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 2px;
        --tx: ${tx}px;
        --ty: ${ty}px;
        animation-duration: 0.6s;
        box-shadow: 0 0 4px rgba(139, 90, 43, 0.2);
        transform: rotate(${Math.random() * 360}deg);
        z-index: 1000;
      `;
      container.appendChild(particle);
    }
    
    setTimeout(() => container.remove(), 800);
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
    if (!data) {
      console.error('No data provided to save');
      return false;
    }
    
    let jar = JSON.parse(localStorage.getItem('fortuneJar') || '[]');
    const id = data.cookieId || data.id || Date.now();
    
    const exists = jar.some(f => {
      return (f.cookieId === id || f.id === id || f.fortune === data.fortune);
    });
    
    if (!exists) {
      const fortuneToSave = {
        fortune: data.fortune || '',
        luckyNumber: data.luckyNumber || 42,
        challenge: data.challenge || '',
        mood: data.mood || 'Hopeful',
        category: data.category || 'General',
        timestamp: data.timestamp || new Date().toISOString(),
        cookieId: data.cookieId || id,
        id: id,
        _source: data._source || 'manual'
      };
      
      if (!fortuneToSave.fortune || fortuneToSave.fortune === '') {
        console.error('Cannot save fortune with empty text');
        return false;
      }
      
      jar.unshift(fortuneToSave);
      localStorage.setItem('fortuneJar', JSON.stringify(jar));
      loadFortuneJar();
      return true;
    }
    return false;
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
      try {
        const data = JSON.parse(savedDaily);
        if (data.date === today && data.fortune) {
          displayDailyFortune(data.fortune);
          return;
        }
      } catch (e) {
        console.error('Error parsing daily fortune:', e);
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
            challenge: "Do something that makes you smile today.",
            mood: "Hopeful",
            category: "General",
            timestamp: new Date().toISOString(),
            id: Date.now()
          };
          localStorage.setItem('dailyFortune', JSON.stringify({ date: today, fortune }));
          displayDailyFortune(fortune);
        }
      });
    }
  }
  
  function displayDailyFortune(fortune) {
    if (!dailyContent) return;
    
    window.dailyFortuneData = fortune;
    
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
      <button class="btn-secondary" id="dailySaveBtn" style="margin-top: 1rem; width: 100%;">
        Save to Jar
      </button>
    `;
    
    const dailySaveBtn = document.getElementById('dailySaveBtn');
    if (dailySaveBtn) {
      const newBtn = dailySaveBtn.cloneNode(true);
      dailySaveBtn.parentNode.replaceChild(newBtn, dailySaveBtn);
      
      newBtn.addEventListener('click', function() {
        const dataToSave = window.dailyFortuneData || fortune;
        
        if (!dataToSave || !dataToSave.fortune) {
          alert('No fortune to save. Please get a fortune first.');
          return;
        }
        
        const fortuneToSave = {
          fortune: dataToSave.fortune,
          luckyNumber: dataToSave.luckyNumber || 42,
          challenge: dataToSave.challenge || '',
          mood: dataToSave.mood || 'Hopeful',
          category: dataToSave.category || 'General',
          timestamp: dataToSave.timestamp || new Date().toISOString(),
          id: dataToSave.id || Date.now(),
          cookieId: dataToSave.cookieId || dataToSave.id || Date.now(),
          _source: 'daily'
        };
        
        const saved = saveToJar(fortuneToSave);
        
        if (saved) {
          this.textContent = 'Saved to Jar!';
          this.disabled = true;
          this.style.opacity = '0.6';
          this.style.cursor = 'default';
          setTimeout(() => {
            this.textContent = 'Save to Jar';
            this.disabled = false;
            this.style.opacity = '1';
            this.style.cursor = 'pointer';
          }, 2000);
        } else {
          this.textContent = 'Already in Jar!';
          this.disabled = true;
          this.style.opacity = '0.6';
          this.style.cursor = 'default';
          setTimeout(() => {
            this.textContent = 'Save to Jar';
            this.disabled = false;
            this.style.opacity = '1';
            this.style.cursor = 'pointer';
          }, 1500);
        }
      });
    }
  }
});