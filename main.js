(function () {
  'use strict';

  var html = document.documentElement;
  var forced = html.classList.contains('force-motion');
  var reduced = !forced && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Navigation ---------- */
  (function nav() {
    var burger = $('.burger');
    var panel = $('#mpanel');
    if (!burger || !panel) return;
    function setOpen(open) {
      panel.hidden = !open;
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    burger.addEventListener('click', function () { setOpen(panel.hidden); });
    $$('a', panel).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 960) setOpen(false); });

    // highlight the link for the section in view
    var links = $$('.navlinks a');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && map[en.target.id]) {
            links.forEach(function (l) { l.classList.remove('active'); });
            map[en.target.id].classList.add('active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
    }

    // reading progress
    var bar = $('.progress i');
    var ticking = false;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ---------- Hero console (typing, counter, leads) ---------- */
  (function consoleDemo() {
    var typed = $('#typed'), count = $('#count'), status = $('#status');
    var leads = $$('.c-leads li');
    if (!typed || !count || !status) return;
    var prompt = 'Qualify new DMs and book a call for hot leads.';
    if (reduced) {
      typed.textContent = prompt;
      count.textContent = '128';
      status.textContent = 'Task complete';
      leads.forEach(function (l) { l.classList.add('on'); });
      return;
    }
    var hero = $('.hero');
    var visible = true;
    if ('IntersectionObserver' in window && hero) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(hero);
    }
    var tick = 0, L = 150;
    setInterval(function () {
      if (!visible || document.hidden) return;
      tick = (tick + 1) % L;
      var t = tick;
      typed.textContent = prompt.slice(0, Math.min(prompt.length, Math.floor(t * 0.9)));
      var prog = Math.max(0, Math.min(1, (t - 55) / 40));
      count.textContent = String(Math.round(prog * 128));
      status.textContent = t < 50 ? 'Reading task' : t < 130 ? 'Agent running' : 'Task complete';
      var at = [62, 74, 86];
      leads.forEach(function (l, i) { l.classList.toggle('on', t >= at[i]); });
    }, 110);
  })();

  /* ---------- Hero network canvas ---------- */
  (function network() {
    var c = $('#net');
    var hero = $('.hero');
    if (!c || !hero || reduced) return;
    var ctx = c.getContext('2d');
    var w = 0, h = 0, dpr = 1, nodes = [], raf = null, visible = true;
    var mouse = { x: -9999, y: -9999, on: false };

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = c.getBoundingClientRect();
      w = r.width; h = r.height;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(72, Math.max(24, w / 22)));
      nodes = [];
      for (var i = 0; i < n; i++) {
        nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.6 + 0.8 });
      }
    }

    function frame() {
      if (!visible || document.hidden) { raf = null; return; }
      ctx.clearRect(0, 0, w, h);
      var maxD = Math.min(150, Math.max(90, w / 8));
      var i, j, a, b, dx, dy, d, al;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < -10) a.x = w + 10; else if (a.x > w + 10) a.x = -10;
        if (a.y < -10) a.y = h + 10; else if (a.y > h + 10) a.y = -10;
        if (mouse.on) {
          dx = mouse.x - a.x; dy = mouse.y - a.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < 190) { a.x += dx * 0.0035; a.y += dy * 0.0035; }
        }
      }
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxD) {
            al = (1 - d / maxD) * 0.22;
            ctx.strokeStyle = 'rgba(13,229,158,' + al.toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        if (mouse.on) {
          dx = mouse.x - a.x; dy = mouse.y - a.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < 190) {
            al = (1 - d / 190) * 0.55;
            ctx.strokeStyle = 'rgba(13,229,158,' + al.toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(160,255,222,0.75)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }

    size();
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 200); });
    hero.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = e.pointerType !== 'touch';
    });
    hero.addEventListener('pointerleave', function () { mouse.on = false; });
    document.addEventListener('visibilitychange', start);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; start(); }).observe(hero);
    }
    start();
  })();

  /* ---------- Estimate calculator ---------- */
  (function calculator() {
    var leads = $('#leads'), mins = $('#mins'), share = $('#share');
    if (!leads || !mins || !share) return;
    var oL = $('#o-leads'), oM = $('#o-mins'), oS = $('#o-share'), hrs = $('#hours'), days = $('#days');
    function fill(el) {
      var p = (el.value - el.min) / (el.max - el.min) * 100;
      el.style.setProperty('--fill', p + '%');
    }
    function calc() {
      var l = Number(leads.value), m = Number(mins.value), s = Number(share.value) / 100;
      var hours = l * 52 / 12 * m / 60 * s;
      oL.textContent = l; oM.textContent = m + ' min'; oS.textContent = Math.round(s * 100) + '%';
      hrs.textContent = String(Math.round(hours));
      days.textContent = 'About ' + (Math.round(hours / 8 * 10) / 10) + ' working days a month, counted as 8-hour days.';
      [leads, mins, share].forEach(fill);
    }
    [leads, mins, share].forEach(function (el) { el.addEventListener('input', calc); });
    calc();
  })();

  /* ---------- Pointer effects (mouse only) ---------- */
  if (finePointer) {
    $$('.ind').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    if (!reduced) {
      $$('.work').forEach(function (el) {
        el.addEventListener('pointermove', function (e) {
          var r = el.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          el.style.setProperty('--ry', (px * 6).toFixed(2) + 'deg');
          el.style.setProperty('--rx', (-py * 6).toFixed(2) + 'deg');
        });
        el.addEventListener('pointerleave', function () {
          el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg');
        });
      });
    }
  }

  /* ---------- GSAP-powered motion ---------- */
  if (!window.gsap || !window.ScrollTrigger) {
    html.classList.remove('anim');
    return;
  }
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  // magnetic buttons
  if (finePointer && !reduced) {
    $$('.mag').forEach(function (el) {
      var qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      var qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * 0.25);
        qy((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener('pointerleave', function () { qx(0); qy(0); });
    });
  }

  if (!reduced) {
    // reveal on scroll
    ScrollTrigger.batch('.rv', {
      start: 'top 90%',
      once: true,
      onEnter: function (els) {
        gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, overwrite: true });
      }
    });

    // count-up numbers
    $$('[data-count]').forEach(function (el) {
      var target = Number(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: function () {
          gsap.to(o, { v: target, duration: 1.6, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v) + suffix; } });
        }
      });
      el.textContent = '0' + suffix;
    });

    // process line fills as you scroll
    var steps = $('#steps');
    if (steps) {
      var stepEls = $$('.step', steps);
      ScrollTrigger.create({
        trigger: steps, start: 'top 80%', end: 'bottom 65%', scrub: true,
        onUpdate: function (self) {
          steps.style.setProperty('--p', self.progress.toFixed(3));
          stepEls.forEach(function (s, i) { s.classList.toggle('on', self.progress >= i / stepEls.length - 0.001); });
        }
      });
    }
  } else {
    $$('.step').forEach(function (s) { s.classList.add('on'); });
  }

  ScrollTrigger.config({ ignoreMobileResize: true });
  var mm = gsap.matchMedia();

  // stacked service cards shrink slightly as the next one covers them
  mm.add(reduced ? '(max-width: 0px)' : '(min-width: 0px)', function () {
    var cards = $$('.stack .card');
    cards.forEach(function (card, i) {
      var next = cards[i + 1];
      if (!next) return;
      gsap.to(card, {
        scale: 0.94, ease: 'none',
        scrollTrigger: { trigger: next, start: 'top 82%', end: 'top 22%', scrub: true }
      });
    });
  });

  // the pinned "follow one lead" story
  function journey(mobile) { return function () {
    var section = $('.journey');
    var panels = $$('.panel');
    var stepEls = $$('.j-steps li');
    var meter = $('.j-meter i');
    var n = panels.length;
    if (!section || !n) return;

    html.classList.add('js-pin');
    if (mobile) html.classList.add('js-pin-m');
    var now = $('.j-now');

    gsap.set(panels, { yPercent: -50, autoAlpha: 0, y: 50, scale: 0.96 });
    gsap.set(panels[0], { autoAlpha: 1, y: 0, scale: 1 });
    panels.forEach(function (p) { gsap.set($$('[data-r]', p), { autoAlpha: 0, y: 16 }); });

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: function () { return '+=' + Math.round(window.innerHeight * n * (mobile ? 0.8 : 0.95)); },
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function () {
          var active = Math.min(n - 1, Math.max(0, Math.floor(tl.time() + 0.25)));
          stepEls.forEach(function (li, i) { li.classList.toggle('on', i === active); });
          if (now && stepEls[active]) now.textContent = stepEls[active].childNodes[1].textContent;
          if (meter) meter.style.transform = 'scaleX(' + tl.progress().toFixed(3) + ')';
        }
      }
    });

    panels.forEach(function (p, i) {
      var items = $$('[data-r]', p);
      tl.to(items, { autoAlpha: 1, y: 0, duration: 0.18, stagger: 0.1, ease: 'power2.out' }, i === 0 ? 0.05 : i - 0.1);
      if (i < n - 1) {
        tl.to(p, { autoAlpha: 0, y: -40, scale: 0.96, duration: 0.25 }, i + 0.75);
        tl.to(panels[i + 1], { autoAlpha: 1, y: 0, scale: 1, duration: 0.25 }, i + 0.8);
      }
    });
    tl.fromTo('.score .val', { strokeDashoffset: 157 }, { strokeDashoffset: 22, duration: 0.3, ease: 'power2.out' }, 1.25);
    tl.set({}, {}, n);

    return function () {
      html.classList.remove('js-pin', 'js-pin-m');
      gsap.set(panels, { clearProps: 'all' });
      panels.forEach(function (p) { gsap.set($$('[data-r]', p), { clearProps: 'all' }); });
      stepEls.forEach(function (li, i) { li.classList.toggle('on', i === 0); });
    };
  }; }
  mm.add(reduced ? '(max-width: 0px)' : '(min-width: 961px)', journey(false));
  mm.add(reduced ? '(max-width: 0px)' : '(max-width: 960px)', journey(true));

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
