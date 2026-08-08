/* Crazy Clean Main Interactive Application Script */

// --- Global App State ---
const state = {
  cart: [],
  audioEnabled: true,
  scents: {
    jasmine: { name: 'ياسمين دمشقي اصيل', color: '#38bdf8', icon: 'fa-flower' },
    ocean: { name: 'نسيم المحيط الفائق', color: '#00a8e8', icon: 'fa-water' },
    lemon: { name: 'انتعاش الليمون السوري', color: '#facc15', icon: 'fa-lemon' },
    lavender: { name: 'لافندر الاسترخاء العالي', color: '#a855f7', icon: 'fa-spa' }
  },
  currentScrubProgress: 0
};

// --- Web Audio Synthesizer ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playPopSound() {
  if (!state.audioEnabled) return;
  try {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (e) {}
}

function playSpraySound() {
  if (!state.audioEnabled) return;
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const bufferSize = audioCtx.sampleRate * 0.1;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noise.start();
  } catch(e) {}
}

// --- Mobile Navigation Menu ---
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavMenu = document.getElementById('mobileNavMenu');
  if (!mobileMenuBtn || !mobileNavMenu) return;
  
  mobileMenuBtn.addEventListener('click', () => {
    playPopSound();
    mobileNavMenu.classList.toggle('hidden');
    const icon = mobileMenuBtn.querySelector('i');
    if (mobileNavMenu.classList.contains('hidden')) {
      icon.className = 'fas fa-bars text-xl';
    } else {
      icon.className = 'fas fa-xmark text-xl';
    }
  });
  
  const mobileLinks = mobileNavMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNavMenu.classList.add('hidden');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) icon.className = 'fas fa-bars text-xl';
    });
  });
}

// --- Soap Bubble Canvas Background Physics ---
function initBubbleCanvas() {
  const canvas = document.getElementById('bubbleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
  
  const bubbles = [];
  const bubbleCount = Math.min(Math.floor(width / 35), 45);
  
  class Bubble {
    constructor() {
      this.reset();
      this.y = Math.random() * height;
    }
    
    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 100;
      this.radius = Math.random() * 18 + 6;
      this.speed = Math.random() * 1.2 + 0.4;
      this.wobbleSpeed = Math.random() * 0.03 + 0.01;
      this.wobble = Math.random() * Math.PI * 2;
      this.opacity = Math.random() * 0.5 + 0.25;
      this.hue = Math.random() > 0.4 ? 195 : 155;
    }
    
    update(mouseX, mouseY) {
      this.y -= this.speed;
      this.wobble += this.wobbleSpeed;
      this.x += Math.sin(this.wobble) * 0.6;
      
      if (mouseX && mouseY) {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          const force = (80 - dist) / 80;
          this.x += (dx / dist) * force * 5;
          this.y += (dy / dist) * force * 5;
        }
      }
      
      if (this.y < -this.radius * 2) {
        this.reset();
      }
    }
    
    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      
      const grad = ctx.createRadialGradient(
        this.x - this.radius * 0.3,
        this.y - this.radius * 0.3,
        this.radius * 0.1,
        this.x,
        this.y,
        this.radius
      );
      
      grad.addColorStop(0, `hsla(${this.hue}, 100%, 90%, ${this.opacity})`);
      grad.addColorStop(0.4, `hsla(${this.hue}, 85%, 60%, ${this.opacity * 0.6})`);
      grad.addColorStop(0.8, `hsla(${this.hue + 20}, 90%, 50%, ${this.opacity * 0.3})`);
      grad.addColorStop(1, `hsla(210, 100%, 50%, 0)`);
      
      ctx.fillStyle = grad;
      ctx.fill();
      
      ctx.strokeStyle = `hsla(${this.hue}, 90%, 75%, ${this.opacity * 0.8})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(
        this.x - this.radius * 0.35,
        this.y - this.radius * 0.35,
        this.radius * 0.25,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.9})`;
      ctx.fill();
      
      ctx.restore();
    }
  }
  
  for (let i = 0; i < bubbleCount; i++) {
    bubbles.push(new Bubble());
  }
  
  let mouseX = null;
  let mouseY = null;
  
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  window.addEventListener('click', (e) => {
    for (let b of bubbles) {
      const dx = b.x - e.clientX;
      const dy = b.y - e.clientY;
      if (Math.sqrt(dx * dx + dy * dy) < b.radius + 15) {
        playPopSound();
        b.reset();
        break;
      }
    }
  });
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let b of bubbles) {
      b.update(mouseX, mouseY);
      b.draw();
    }
    requestAnimationFrame(animate);
  }
  
  animate();
}

// --- Interactive Stain Scrubbing Simulator Canvas ---
function initStainScrubber() {
  const container = document.getElementById('scrubberContainer');
  const canvas = document.getElementById('scrubCanvas');
  if (!canvas || !container) return;
  
  const ctx = canvas.getContext('2d');
  let isScrubbing = false;
  
  function resizeCanvas() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    drawStainLayer();
  }
  
  function drawStainLayer() {
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.globalCompositeOperation = 'source-over';
    
    ctx.fillStyle = '#1e1b18';
    ctx.fillRect(0, 0, w, h);
    
    const dirtGradients = [
      { x: w * 0.3, y: h * 0.4, r: 120, col: 'rgba(40, 25, 10, 0.92)' },
      { x: w * 0.7, y: h * 0.3, r: 140, col: 'rgba(15, 12, 10, 0.95)' },
      { x: w * 0.5, y: h * 0.75, r: 110, col: 'rgba(60, 30, 15, 0.88)' },
      { x: w * 0.2, y: h * 0.8, r: 90, col: 'rgba(25, 35, 15, 0.9)' },
      { x: w * 0.85, y: h * 0.7, r: 100, col: 'rgba(50, 20, 10, 0.9)' }
    ];
    
    for (let d of dirtGradients) {
      const g = ctx.createRadialGradient(d.x, d.y, 10, d.x, d.y, d.r);
      g.addColorStop(0, d.col);
      g.addColorStop(0.6, d.col.replace('0.92', '0.6').replace('0.95', '0.7').replace('0.88', '0.5'));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.font = 'bold 22px Cairo, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.textAlign = 'center';
    ctx.fillText('🧽 امسح هنا بمستحضر كرازي كلين لإزالة أصعب البقع فوراً!', w / 2, h / 2 - 10);
    
    ctx.font = '15px Tajawal, sans-serif';
    ctx.fillStyle = 'rgba(255, 200, 80, 0.95)';
    ctx.fillText('اسحب الفأرة أو إصبعك للتنظيف السحري ✨', w / 2, h / 2 + 25);
    
    calculateCleanPercentage();
  }
  
  function scrubAt(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    
    const brushRadius = 38;
    const grad = ctx.createRadialGradient(x, y, 5, x, y, brushRadius);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0.8)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
    ctx.fill();
    
    playSpraySound();
    calculateCleanPercentage();
  }
  
  function calculateCleanPercentage() {
    try {
      const w = canvas.width;
      const h = canvas.height;
      const imgData = ctx.getImageData(0, 0, w, h).data;
      let erasedCount = 0;
      const sampleStep = 16;
      let totalSamples = 0;
      
      for (let i = 3; i < imgData.length; i += 4 * sampleStep) {
        totalSamples++;
        if (imgData[i] < 100) {
          erasedCount++;
        }
      }
      
      const pct = Math.min(100, Math.round((erasedCount / totalSamples) * 100));
      state.currentScrubProgress = pct;
      
      const pctElement = document.getElementById('scrubProgressText');
      const badgeElement = document.getElementById('scrubGradeBadge');
      
      if (pctElement) pctElement.innerText = `${pct}%`;
      if (badgeElement) {
        if (pct < 30) {
          badgeElement.innerText = 'جاري الرش والتنظيف... 🧼';
          badgeElement.className = 'px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40';
        } else if (pct < 80) {
          badgeElement.innerText = 'قوة تفكيك الدهون تعمل الآن! ⚡';
          badgeElement.className = 'px-4 py-1.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
        } else {
          badgeElement.innerText = 'نظافة فائقة كريستالية 100% 🌟';
          badgeElement.className = 'px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 glow-green';
        }
      }
    } catch (e) {}
  }
  
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }
  
  canvas.addEventListener('mousedown', (e) => {
    isScrubbing = true;
    const coords = getCanvasCoords(e);
    scrubAt(coords.x, coords.y);
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (!isScrubbing) return;
    const coords = getCanvasCoords(e);
    scrubAt(coords.x, coords.y);
  });
  
  window.addEventListener('mouseup', () => (isScrubbing = false));
  
  canvas.addEventListener('touchstart', (e) => {
    isScrubbing = true;
    const coords = getCanvasCoords(e);
    scrubAt(coords.x, coords.y);
  }, { passive: true });
  
  canvas.addEventListener('touchmove', (e) => {
    if (!isScrubbing) return;
    const coords = getCanvasCoords(e);
    scrubAt(coords.x, coords.y);
  }, { passive: true });
  
  window.addEventListener('touchend', () => (isScrubbing = false));
  
  const resetBtn = document.getElementById('resetScrubBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      playPopSound();
      drawStainLayer();
    });
  }
  
  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 200);
}

// --- Interactive Dosage & Syrian Pounds Savings Calculator ---
function initDosageCalculator() {
  const loadSlider = document.getElementById('loadSizeRange');
  const loadValText = document.getElementById('loadSizeValue');
  const stainLevelSelect = document.getElementById('stainLevelSelect');
  const waterHardnessSelect = document.getElementById('waterHardnessSelect');
  
  const mlResult = document.getElementById('calcMlResult');
  const washesResult = document.getElementById('calcWashesResult');
  const costWashResult = document.getElementById('calcCostWashResult');
  const monthlySavingsResult = document.getElementById('calcMonthlySavingsResult');
  
  if (!loadSlider) return;
  
  function calculate() {
    const loadKg = parseFloat(loadSlider.value);
    const stainMult = parseFloat(stainLevelSelect.value || 1.0);
    const waterMult = parseFloat(waterHardnessSelect.value || 1.0);
    
    const baseDosage = (loadKg / 5) * 35;
    const calculatedMl = Math.round(baseDosage * stainMult * waterMult);
    
    const totalWashes = Math.floor(3000 / calculatedMl);
    const costPerWashSYP = Math.round(45000 / totalWashes);
    const traditionalCostPerWash = 2200;
    const washDiffSYP = Math.max(0, traditionalCostPerWash - costPerWashSYP);
    const monthlySavingsSYP = washDiffSYP * 20;
    
    if (loadValText) loadValText.innerText = `${loadKg} كغ (غسيل)`;
    if (mlResult) mlResult.innerText = `${calculatedMl} مل`;
    if (washesResult) washesResult.innerText = `${totalWashes} غسلة`;
    if (costWashResult) costWashResult.innerText = `${costPerWashSYP.toLocaleString('ar-SY')} ل.س`;
    if (monthlySavingsResult) monthlySavingsResult.innerText = `${monthlySavingsSYP.toLocaleString('ar-SY')} ل.س`;
  }
  
  loadSlider.addEventListener('input', calculate);
  if (stainLevelSelect) stainLevelSelect.addEventListener('change', calculate);
  if (waterHardnessSelect) waterHardnessSelect.addEventListener('change', calculate);
  
  calculate();
}

// --- Fragrance & Scent Selector Interactivity ---
function initScentSelector() {
  const scentBtns = document.querySelectorAll('.scent-btn');
  const scentBanner = document.getElementById('scentBannerText');
  const heroLightGlow = document.getElementById('heroLightGlow');
  
  scentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const scentKey = btn.getAttribute('data-scent');
      const scentInfo = state.scents[scentKey];
      if (!scentInfo) return;
      
      playPopSound();
      
      scentBtns.forEach(b => {
        b.classList.remove('ring-4', 'ring-cyan-400', 'bg-cyan-500/30', 'scale-105');
        b.classList.add('bg-white/10');
      });
      
      btn.classList.add('ring-4', 'ring-cyan-400', 'bg-cyan-500/30', 'scale-105');
      btn.classList.remove('bg-white/10');
      
      if (scentBanner) {
        scentBanner.innerHTML = `<i class="fas ${scentInfo.icon} text-yellow-400 ml-2"></i> عطر مختار: <span style="color: ${scentInfo.color}; font-weight: 800;">${scentInfo.name}</span> - انتعاش يتدفق طوال اليوم!`;
      }
      
      if (heroLightGlow) {
        heroLightGlow.style.background = `radial-gradient(circle, ${scentInfo.color}44 0%, rgba(3,4,94,0) 70%)`;
      }
    });
  });
}

// --- Live Offer Countdown Timer ---
function initOfferTimer() {
  const daysEl = document.getElementById('offerDays');
  const hoursEl = document.getElementById('offerHours');
  const minutesEl = document.getElementById('offerMinutes');
  const secondsEl = document.getElementById('offerSeconds');
  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;
  
  // 6 Days + 14 Hours + 42 Minutes + 18 Seconds countdown
  let totalSeconds = 6 * 24 * 3600 + 14 * 3600 + 42 * 60 + 18;
  
  setInterval(() => {
    if (totalSeconds <= 0) {
      totalSeconds = 6 * 24 * 3600; // Reset to 6 days
    } else {
      totalSeconds--;
    }
    
    const d = Math.floor(totalSeconds / (24 * 3600));
    const h = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    daysEl.innerText = String(d).padStart(2, '0');
    hoursEl.innerText = String(h).padStart(2, '0');
    minutesEl.innerText = String(m).padStart(2, '0');
    secondsEl.innerText = String(s).padStart(2, '0');
  }, 1000);
  
  // Add Family Bundle button listener
  const addBundleBtn = document.getElementById('addFamilyBundleBtn');
  if (addBundleBtn) {
    addBundleBtn.addEventListener('click', () => {
      playPopSound();
      // Add all 4 products as bundle
      const bundleItem = {
        name: 'باقة كرازي كلين العائلية الشاملة (4 منتجات + خصم 25%)',
        price: 85000,
        image: 'images/laundry.png',
        qty: 1
      };
      
      const existing = state.cart.find(i => i.name === bundleItem.name);
      if (existing) {
        existing.qty++;
      } else {
        state.cart.push(bundleItem);
      }
      
      // Trigger cart drawer open
      const cartDrawer = document.getElementById('cartDrawer');
      const cartOverlay = document.getElementById('cartOverlay');
      if (cartDrawer) cartDrawer.classList.remove('translate-x-full');
      if (cartOverlay) cartOverlay.classList.remove('hidden');
      
      // Update UI
      const cartToggleBtn = document.querySelector('.cart-toggle-btn');
      if (cartToggleBtn) cartToggleBtn.click();
    });
  }
}

// --- FAQ Accordion Interactivity ---
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-header');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');
    if (!btn || !content) return;
    
    btn.addEventListener('click', () => {
      playPopSound();
      const isOpen = !content.classList.contains('hidden');
      
      // Close all
      document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
      document.querySelectorAll('.faq-icon').forEach(i => i.className = 'fas fa-chevron-down faq-icon text-cyan-400 transition-transform');
      
      if (!isOpen) {
        content.classList.remove('hidden');
        if (icon) icon.className = 'fas fa-chevron-up faq-icon text-cyan-400 transition-transform';
      }
    });
  });
}

// --- WhatsApp Order Cart System ---
function initCartSystem() {
  const cartToggleBtns = document.querySelectorAll('.cart-toggle-btn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartCountBadges = document.querySelectorAll('.cart-count-badge');
  const cartTotalSYP = document.getElementById('cartTotalSYP');
  const sendWhatsappBtn = document.getElementById('sendWhatsappBtn');
  
  function toggleCart() {
    if (!cartDrawer) return;
    playPopSound();
    cartDrawer.classList.toggle('translate-x-full');
    if (cartOverlay) cartOverlay.classList.toggle('hidden');
  }
  
  cartToggleBtns.forEach(b => b.addEventListener('click', toggleCart));
  if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
  if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);
  
  const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      playPopSound();
      
      const name = btn.getAttribute('data-name');
      const price = parseInt(btn.getAttribute('data-price') || '45000');
      const image = btn.getAttribute('data-image');
      
      const existing = state.cart.find(item => item.name === name);
      if (existing) {
        existing.qty++;
      } else {
        state.cart.push({ name, price, image, qty: 1 });
      }
      
      updateCartUI();
      
      btn.innerHTML = `<i class="fas fa-check ml-1"></i> تم الإضافة!`;
      btn.classList.add('bg-emerald-500');
      setTimeout(() => {
        btn.innerHTML = `<i class="fas fa-cart-plus ml-1"></i> إضافة للسلّة`;
        btn.classList.remove('bg-emerald-500');
      }, 1500);
    });
  });
  
  function updateCartUI() {
    const totalItems = state.cart.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = state.cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    
    cartCountBadges.forEach(b => {
      b.innerText = totalItems;
      b.classList.toggle('hidden', totalItems === 0);
    });
    
    if (cartTotalSYP) {
      cartTotalSYP.innerText = `${totalPrice.toLocaleString('ar-SY')} ل.س`;
    }
    
    if (!cartItemsContainer) return;
    
    if (state.cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="text-center py-12 text-gray-400">
          <i class="fas fa-shopping-basket text-5xl mb-3 text-cyan-500/40"></i>
          <p class="font-bold">سلّة طلباتك فارغة حالياً</p>
          <p class="text-xs text-gray-500 mt-1">اختر منتجات كرازي كلين لتجربة النظافة الفائقة</p>
        </div>
      `;
      return;
    }
    
    cartItemsContainer.innerHTML = state.cart.map((item, index) => `
      <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
        <img src="${item.image}" alt="${item.name}" class="w-14 h-14 object-cover rounded-lg border border-cyan-500/30">
        <div class="flex-1 mr-3">
          <h4 class="font-bold text-sm text-white">${item.name}</h4>
          <p class="text-xs text-cyan-400 font-semibold">${item.price.toLocaleString('ar-SY')} ل.س</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="changeQty(${index}, -1)" class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm">-</button>
          <span class="text-sm font-bold w-4 text-center">${item.qty}</span>
          <button onclick="changeQty(${index}, 1)" class="w-7 h-7 rounded-lg bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-300 font-bold text-sm">+</button>
        </div>
      </div>
    `).join('');
  }
  
  window.changeQty = function(index, delta) {
    playPopSound();
    state.cart[index].qty += delta;
    if (state.cart[index].qty <= 0) {
      state.cart.splice(index, 1);
    }
    updateCartUI();
  };
  
  if (sendWhatsappBtn) {
    sendWhatsappBtn.addEventListener('click', () => {
      if (state.cart.length === 0) {
        alert('الرجاء إضافة منتجات إلى السلّة أولاً!');
        return;
      }
      
      const customerName = document.getElementById('custNameInput')?.value || 'عميل كرازي كلين';
      const customerCity = document.getElementById('custCitySelect')?.value || 'دمشق';
      const customerPhone = document.getElementById('custPhoneInput')?.value || 'غير محدد';
      const notes = document.getElementById('custNotesInput')?.value || 'لا يوجد';
      
      let message = `*طلب جديد من موقع كرازي كلين (Crazy Clean)* 🧼✨\n\n`;
      message += `👤 *الاسم:* ${customerName}\n`;
      message += `📍 *المحافظة:* ${customerCity}\n`;
      message += `📞 *رقم الهاتف:* ${customerPhone}\n\n`;
      message += `📦 *المنتجات المطلوبة:*\n`;
      
      let grandTotal = 0;
      state.cart.forEach((item, i) => {
        const itemTotal = item.price * item.qty;
        grandTotal += itemTotal;
        message += `${i + 1}. ${item.name} × ${item.qty} = ${itemTotal.toLocaleString('ar-SY')} ل.س\n`;
      });
      
      message += `\n💰 *الإجمالي التقريبي:* ${grandTotal.toLocaleString('ar-SY')} ل.س\n`;
      message += `📝 *ملاحظات إضافية:* ${notes}\n\n`;
      message += `أرجو تأكيد الطلب وتزويدي بتفاصيل الشحن والموزع في ${customerCity}. شكرًا لك!`;
      
      const encodedMsg = encodeURIComponent(message);
      const waUrl = `https://wa.me/963900000000?text=${encodedMsg}`;
      window.open(waUrl, '_blank');
    });
  }
}

// --- Sound Mute Toggle ---
function initSoundToggle() {
  const soundBtn = document.getElementById('soundToggleBtn');
  if (!soundBtn) return;
  
  soundBtn.addEventListener('click', () => {
    state.audioEnabled = !state.audioEnabled;
    const icon = soundBtn.querySelector('i');
    if (state.audioEnabled) {
      icon.className = 'fas fa-volume-up text-cyan-400';
      playPopSound();
    } else {
      icon.className = 'fas fa-volume-mute text-gray-400';
    }
  });
}

// --- Initialize All Modules on DOM Load ---
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initBubbleCanvas();
  initStainScrubber();
  initDosageCalculator();
  initScentSelector();
  initOfferTimer();
  initFaqAccordion();
  initCartSystem();
  initSoundToggle();
});
