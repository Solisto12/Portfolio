/**
 * theme.js — always boots light mode, dynamic accent from headshot
 */
'use strict';

(function ThemeModule() {

  const FALLBACK = {
    primary:'#C8693A', secondary:'#E8955A', accent:'#D4784A',
    gradientStart:'#C8693A', gradientMid:'#E8A070', gradientEnd:'#8B4A2E',
  };

  function applyPalette(p) {
    const c = p || FALLBACK;
    const r = document.documentElement;
    r.style.setProperty('--primary',        c.primary);
    r.style.setProperty('--secondary',      c.secondary);
    r.style.setProperty('--accent',         c.accent);
    r.style.setProperty('--gradient-start', c.gradientStart);
    r.style.setProperty('--gradient-mid',   c.gradientMid);
    r.style.setProperty('--gradient-end',   c.gradientEnd);
    r.style.setProperty('--sidebar-accent', c.accent);
    r.style.setProperty('--color-accent',      c.accent);
    r.style.setProperty('--color-accent-dim',  c.primary + '20');
    r.style.setProperty('--color-accent-glow', c.primary + '40');
    r.style.setProperty('--color-accent-2',    c.gradientEnd);
  }

  function rgbToHsl(r,g,b) {
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    let h=0,s=0,l=(max+min)/2;
    if(max!==min){const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
      switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}}
    return [Math.round(h*360),Math.round(s*100),Math.round(l*100)];
  }

  function hslToHex(h,s,l){
    s/=100;l/=100;const a=s*Math.min(l,1-l);
    const f=n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(Math.min(k-3,9-k,1),-1))).toString(16).padStart(2,'0');};
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  function extractPalette(imgEl) {
    return new Promise(resolve => {
      if (!imgEl||!imgEl.complete||imgEl.naturalWidth===0){resolve(null);return;}
      const canvas=document.createElement('canvas'); canvas.width=80;canvas.height=80;
      const ctx=canvas.getContext('2d');
      try {
        ctx.drawImage(imgEl,0,0,80,80);
        const data=ctx.getImageData(0,0,80,80).data;
        const bins=new Array(72).fill(0);
        for(let i=0;i<data.length;i+=4){
          if(data[i+3]<180)continue;
          const[h,s,l]=rgbToHsl(data[i],data[i+1],data[i+2]);
          if(l<8||l>92||s<15)continue;
          bins[Math.floor(h/5)]+=s*(l>25&&l<75?1.5:1);
        }
        let maxVal=0,maxIdx=0;
        for(let i=0;i<bins.length;i++){if(bins[i]>maxVal){maxVal=bins[i];maxIdx=i;}}
        if(maxVal<25){resolve(null);return;}
        const h=maxIdx*5+2,s=20,l=30;
        resolve({
          primary:hslToHex(h,s,l),secondary:hslToHex(h,s-5,l+12),accent:hslToHex(h,s+5,l+6),
          gradientStart:hslToHex(h,s,l),gradientMid:hslToHex(h,s-8,l+18),gradientEnd:hslToHex(h,s-10,l-20),
        });
      } catch { resolve(null); }
    });
  }

  const THEME_KEY = 'portfolio-theme';

  function applyTheme(theme) {
    document.body.classList.toggle('theme-dark',  theme==='dark');
    document.body.classList.toggle('theme-light', theme==='light');
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
    const btn = document.getElementById('themeToggle');
    if (btn) btn.setAttribute('aria-checked', theme==='dark'?'true':'false');
    // Update iOS status bar color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0A0A0F' : '#F0F0EC';
  }

  function toggleTheme() {
    applyTheme(document.body.classList.contains('theme-dark') ? 'light' : 'dark');
  }

  // Always boot light
  applyPalette(null);
  applyTheme('light');

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', toggleTheme);

    const img = document.getElementById('heroPhoto');
    if (!img) return;
    const run = async () => { applyPalette(await extractPalette(img)); };
    if (img.complete && img.naturalWidth > 0) run();
    else img.addEventListener('load', run);
  });

  window.ThemeModule = { applyPalette, toggleTheme };

})();
