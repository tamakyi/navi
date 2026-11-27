
(function(){
  'use strict';
  var q = document.getElementById('q');
  if(!q) return;
  var info = document.getElementById('info');
  var eng = document.getElementById('engine');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.group'));
  var cats = Array.prototype.slice.call(document.querySelectorAll('.cat'));
  var links = Array.prototype.slice.call(document.querySelectorAll('.sideLink'));
  var shown = [];

  function engineName(){
    return (eng && eng.options.length) ? eng.options[eng.selectedIndex].text : '';
  }
  function apply(){
    var v = q.value.trim().toLowerCase();
    if(!v){
      cards.forEach(function(c){ c.hidden = false; });
      groups.forEach(function(g){ g.hidden = false; });
      cats.forEach(function(s, i){ s.hidden = false; if(links[i]){ links[i].hidden = false; links[i].classList.remove('off'); } });
      info.hidden = true; shown = [];
      return;
    }
    shown = [];
    cards.forEach(function(c){
      var hit = (c.getAttribute('data-s') || '').indexOf(v) >= 0;
      c.hidden = !hit;
      if(hit) shown.push(c);
    });
    groups.forEach(function(g){ g.hidden = !g.querySelector('.card:not([hidden])'); });
    cats.forEach(function(s, i){
      var hid = !s.querySelector('.card:not([hidden])');
      s.hidden = hid;
      if(links[i]){ links[i].hidden = false; links[i].classList.toggle('off', hid); }
    });
    info.hidden = false;
    if(shown.length){
      info.innerHTML = '找到 <b>' + shown.length + '</b> 个结果 · 回车打开第一个';
    }else{
      var n = engineName();
      info.innerHTML = n ? ('站内没有匹配 · 回车用 ' + n + ' 搜索') : '站内没有匹配';
    }
  }

  q.addEventListener('input', apply);
  q.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){
      e.preventDefault();
      var text = q.value.trim();
      if(!text) return;
      if(shown.length){
        window.open(shown[0].getAttribute('href'), '_blank', 'noopener');
      }else if(eng && eng.value){
        window.open(eng.value + encodeURIComponent(text), '_blank', 'noopener');
      }
    }
    if(e.key === 'Escape'){ q.value = ''; apply(); q.blur(); }
  });
  if(eng) eng.addEventListener('change', function(){ if(q.value.trim()) apply(); });

  document.addEventListener('keydown', function(e){
    var tag = document.activeElement ? document.activeElement.tagName : '';
    if(e.key === '/' && document.activeElement !== q && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT'){
      e.preventDefault(); q.focus();
    }
  });

  var ticking = false;
  function spy(){
    if(q.value.trim()){ ticking = false; return; }
    var best = 0;
    for(var i = 0; i < cats.length; i++){
      if(!cats[i].hidden && cats[i].getBoundingClientRect().top <= 140) best = i;
    }
    for(var j = 0; j < links.length; j++){
      links[j].classList.toggle('on', j === best);
    }
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if(!ticking){ ticking = true; requestAnimationFrame(spy); }
  }, { passive:true });
  spy();

  var icons = document.querySelectorAll('.ico img');
  Array.prototype.forEach.call(icons, function(img){
    var card = img.closest ? img.closest('.card') : null;
    var href = card ? card.getAttribute('href') : '';
    var host = '';
    try{ host = new URL(href, window.location.href).hostname; }catch(e){ host = ''; }
    var chain = [];
    if(host){
      chain.push('https://' + host + '/favicon.ico');
      chain.push('https://favicon.im/' + host + '?larger=true');
      chain.push('https://api.iowen.cn/favicon/' + host + '.png');
    }
    var stage = 0, timer = null;
    function loaded(){ return !!(img.complete && img.naturalWidth); }
    function stop(){ if(timer){ clearTimeout(timer); timer = null; } }
    function advance(){
      stop();
      if(stage >= chain.length){ img.remove(); return; }
      var u = chain[stage++];
      if(img.src === u) return advance();
      img.src = u;
      timer = setTimeout(function(){ if(!loaded()) advance(); }, 5000);
    }
    img.addEventListener('load', stop);
    img.addEventListener('error', advance);
    if(loaded()) return;
    timer = setTimeout(function(){ if(!loaded()) advance(); }, 5000);
  });

  var cv = document.getElementById('petals');
  if(cv && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var ctx = cv.getContext('2d');
    var w = 0, h = 0, dpr = 1, petals = [];
    function make(init){
      return {
        x: Math.random() * w,
        y: init ? Math.random() * h : -30,
        r: 3 + Math.random() * 4,
        s: .3 + Math.random() * .85,
        a: Math.random() * 6.28,
        va: (Math.random() - .5) * .022,
        ph: Math.random() * 6.28,
        o: .22 + Math.random() * .42
      };
    }
    function initPetals(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = window.innerWidth < 720 ? 12 : 22;
      petals = [];
      for(var i = 0; i < n; i++) petals.push(make(true));
    }
    initPetals();
    window.addEventListener('resize', initPetals);
    var last = 0;
    function frame(t){
      requestAnimationFrame(frame);
      if(document.hidden) return;
      if(t - last < 32) return;
      last = t;
      ctx.clearRect(0, 0, w, h);
      for(var i = 0; i < petals.length; i++){
        var p = petals[i];
        p.y += p.s;
        p.x += Math.sin(p.ph + p.y * .012) * .35;
        p.a += p.va;
        p.ph += .012;
        if(p.y > h + 24){ petals[i] = make(false); continue; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * 1.7, p.r, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,153,193,' + p.o + ')';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(p.r * .5, -p.r * .15, p.r * .7, p.r * .42, .5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + (p.o * .55) + ')';
        ctx.fill();
        ctx.restore();
      }
    }
    requestAnimationFrame(frame);
  }
})();
