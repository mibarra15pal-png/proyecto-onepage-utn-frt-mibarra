/* =====================================================
   ADAPTOGENIA · script.js
   - Canvas: simulación micelio
   - Validación de formulario
   - Animaciones de scroll (IntersectionObserver)
   ===================================================== */

/* -------- 1. CANVAS: Simulación de crecimiento de micelio -------- */
(function() {
  const canvas = document.getElementById('canvasGrowth');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  let angleParam = 0.4;
  let animFrameId;

  const slider = document.getElementById('angleSlider');
  if (slider) {
    slider.addEventListener('input', function() {
      angleParam = parseFloat(this.value);
    });
  }

  // Genera ramas de micelio recursivamente
  function drawBranch(x, y, angle, depth, len) {
    if (depth === 0 || len < 1.5) return;
    const endX = x + Math.cos(angle) * len;
    const endY = y + Math.sin(angle) * len;

    // Color varía con la profundidad
    const alpha = Math.min(0.9, depth / 8 + 0.3);
    const green  = Math.floor(120 + depth * 8);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = `rgba(60, ${green}, 70, ${alpha})`;
    ctx.lineWidth   = Math.max(0.4, depth * 0.4);
    ctx.lineCap = 'round';
    ctx.stroke();

    const branchAngle = angleParam * (0.7 + Math.random() * 0.6);
    const nextLen     = len * (0.62 + Math.random() * 0.1);

    drawBranch(endX, endY, angle - branchAngle, depth - 1, nextLen);
    drawBranch(endX, endY, angle + branchAngle, depth - 1, nextLen);
    if (depth > 3 && Math.random() > 0.5) {
      drawBranch(endX, endY, angle + (branchAngle * 0.4), depth - 2, nextLen * 0.7);
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);

    // Fondo con gradiente
    const bgGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W/2);
    bgGrad.addColorStop(0, '#1a2e1e');
    bgGrad.addColorStop(1, '#0e1a10');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Brillo central
    const glowGrad = ctx.createRadialGradient(W/2, H, 0, W/2, H, H);
    glowGrad.addColorStop(0, 'rgba(122,173,110,.08)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, H);

    // Raíces desde abajo
    const numRoots = 5;
    for (let i = 0; i < numRoots; i++) {
      const startX = (W / (numRoots + 1)) * (i + 1) + (Math.random() - 0.5) * 20;
      const startY = H - 10;
      const initAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
      const initLen   = 55 + Math.random() * 20;
      drawBranch(startX, startY, initAngle, 8, initLen);
    }

    // Partículas de esporas
    ctx.fillStyle = 'rgba(122,173,110,.6)';
    for (let i = 0; i < 18; i++) {
      const px = Math.random() * W;
      const py = Math.random() * H;
      const r  = Math.random() * 1.5 + 0.3;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Re-renderiza cuando cambia el slider (no loop continuo para ahorrar CPU)
  function animateOnce() {
    render();
  }

  // Render inicial
  animateOnce();

  // Animar al cambiar slider
  if (slider) {
    slider.addEventListener('input', animateOnce);
  }

  // Animar suavemente en loop (poco a poco cambia el ángulo)
  let tick = 0;
  function loop() {
    tick++;
    if (tick % 40 === 0) { // cada ~40 frames
      animateOnce();
    }
    animFrameId = requestAnimationFrame(loop);
  }
  loop();
})();


/* -------- 2. VALIDACIÓN DE FORMULARIO -------- */
(function() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();

    // Bootstrap validation
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // Marcar campos como válidos
    form.classList.add('was-validated');
    const inputs = form.querySelectorAll('.adap-input, .form-check-input');
    inputs.forEach(function(el) {
      if (el.checkValidity()) {
        el.classList.add('is-valid');
        el.classList.remove('is-invalid');
      } else {
        el.classList.add('is-invalid');
        el.classList.remove('is-valid');
      }
    });

    // Si todo OK, mostrar mensaje de éxito
    const successMsg = document.getElementById('formSuccess');
    if (successMsg) {
      successMsg.style.display = 'flex';
      successMsg.style.animationName = 'fadeInUp';
    }

    // Reset
    setTimeout(function() {
      form.reset();
      form.classList.remove('was-validated');
      inputs.forEach(function(el) {
        el.classList.remove('is-valid', 'is-invalid');
      });
      if (successMsg) {
        setTimeout(function() { successMsg.style.display = 'none'; }, 3000);
      }
    }, 3200);
  });

  // Validación en tiempo real
  const campos = form.querySelectorAll('.adap-input');
  campos.forEach(function(campo) {
    campo.addEventListener('blur', function() {
      if (this.value.trim() !== '' || this.required) {
        if (this.checkValidity()) {
          this.classList.add('is-valid');
          this.classList.remove('is-invalid');
        } else {
          this.classList.add('is-invalid');
          this.classList.remove('is-valid');
        }
      }
    });
    campo.addEventListener('input', function() {
      if (this.classList.contains('is-invalid') && this.checkValidity()) {
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
      }
    });
  });
})();


/* -------- 3. SCROLL ANIMATIONS (IntersectionObserver) -------- */
(function() {
  const targets = document.querySelectorAll('[data-animate]');
  if (!targets.length) return;

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const delay = entry.target.style.animationDelay || '0s';
        const ms = parseFloat(delay) * 1000;
        setTimeout(function() {
          entry.target.classList.add('is-visible');
        }, ms);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(function(t) { observer.observe(t); });
})();


/* -------- 4. NAVBAR: sombra al hacer scroll -------- */
(function() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 30) {
      nav.style.boxShadow = '0 4px 30px rgba(0,0,0,.45)';
    } else {
      nav.style.boxShadow = '0 2px 20px rgba(0,0,0,.3)';
    }
  }, { passive: true });
})();


/* -------- 5. SMOOTH SCROLL para links de navegación -------- */
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });

        // Cerrar menú mobile de Bootstrap si está abierto
        const navCollapse = document.getElementById('navMenu');
        if (navCollapse && navCollapse.classList.contains('show')) {
          const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      }
    });
  });
})();
