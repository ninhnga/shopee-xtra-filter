// Shopee XTRA Filter iPhone v2
// Intended for iOS Shortcuts: "Run JavaScript on Web Page" in Safari.
// Filters visible/loaded Shopee Affiliate product cards by XTRA >= 2% and video count 0..2.
(async () => {
  const MIN_XTRA = 2;
  const MAX_VIDEO = 2;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const norm = s => (s || '').replace(/\s+/g, ' ').trim();
  const text = el => norm(el?.innerText || el?.textContent || '');
  const abs = u => { try { return new URL(u, location.href).href; } catch { return ''; } };

  // Remove prior overlay
  document.getElementById('__shopee_xtra_v2')?.remove();
  const overlay = document.createElement('div');
  overlay.id = '__shopee_xtra_v2';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#f6f6f6;color:#222;font-family:-apple-system,BlinkMacSystemFont,Arial,sans-serif;overflow:auto;';
  overlay.innerHTML = `<div style="position:sticky;top:0;background:#ee4d2d;color:#fff;padding:14px 16px;font-weight:700;font-size:18px">Shopee XTRA Filter v2 <button id="sxclose" style="float:right;border:0;border-radius:8px;padding:7px 10px">Đóng</button></div><div id="sxbody" style="padding:14px;max-width:760px;margin:auto"><div id="sxstatus">Đang quét trang...</div></div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#sxclose').onclick = () => overlay.remove();
  const status = overlay.querySelector('#sxstatus');

  // Auto-scroll to force lazy-loaded product cards to appear. Stop after 18s or 8 passes.
  const startY = scrollY;
  for (let i=0;i<8;i++) {
    window.scrollTo({top: document.documentElement.scrollHeight, behavior:'instant'});
    await sleep(900);
    window.scrollTo({top: Math.max(0, document.documentElement.scrollHeight - innerHeight*2), behavior:'instant'});
    await sleep(500);
    status.textContent = `Đang tải/đọc sản phẩm... ${i+1}/8`;
  }
  window.scrollTo({top:startY, behavior:'instant'});

  // Candidate cards: prefer repeated containers around product links/images.
  const anchors = [...document.querySelectorAll('a[href]')];
  const productAnchors = anchors.filter(a => {
    const u = abs(a.getAttribute('href'));
    return /shopee\.vn\//i.test(u) && !/affiliate\.shopee\.vn/i.test(u) && !/(cart|checkout|login|help|search|category)/i.test(u);
  });

  const seen = new Set(); const candidates=[];
  for (const a of productAnchors) {
    let card=a;
    for(let k=0;k<7 && card.parentElement;k++){
      const t=text(card);
      const imgs=card.querySelectorAll?.('img')?.length||0;
      if (t.length>=30 && t.length<=1800 && (imgs||/XTRA|hoa hồng|video/i.test(t))) break;
      card=card.parentElement;
    }
    const key = abs(a.href);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    candidates.push({a,card,url:key,txt:text(card)});
  }

  function parseXtra(t){
    const patterns=[
      /hoa\s*hồng\s*xtra[^0-9]{0,30}(\d+(?:[.,]\d+)?)\s*%/i,
      /xtra[^0-9]{0,30}(\d+(?:[.,]\d+)?)\s*%/i,
      /(\d+(?:[.,]\d+)?)\s*%[^a-z%]{0,10}hoa\s*hồng\s*xtra/i
    ];
    for(const p of patterns){const m=t.match(p);if(m)return parseFloat(m[1].replace(',','.'));}
    return null;
  }
  function parseVideo(t){
    const pats=[
      /(?:video\s*về\s*sản\s*phẩm|video\s*sản\s*phẩm|videos?)[^0-9]{0,40}(\d+)\s*(?:video|videos)?/i,
      /(\d+)\s*video/i,
      /video[^0-9]{0,15}(\d+)/i
    ];
    for(const p of pats){const m=t.match(p);if(m)return parseInt(m[1],10);}
    return null;
  }
  function title(card,a){
    const og=card.querySelector?.('img[alt]')?.getAttribute('alt');
    const aria=a.getAttribute('aria-label');
    return norm(og||aria||text(card)).slice(0,180);
  }
  function image(card){
    const im=card.querySelector?.('img[src],img[data-src]');
    return im ? abs(im.getAttribute('src')||im.getAttribute('data-src')) : '';
  }

  const rows=[]; let unknown=0;
  for(const c of candidates){
    const t=c.txt; const x=parseXtra(t); const v=parseVideo(t);
    if(x===null || v===null){unknown++; continue;}
    if(x>=MIN_XTRA && v>=0 && v<=MAX_VIDEO){ rows.push({url:c.url,xtra:x,video:v,title:title(c.card,c.a),img:image(c.card)}); }
  }

  status.textContent = `Đã quét ${candidates.length} ứng viên • Đạt ${rows.length} • Không đọc đủ dữ liệu ${unknown}`;
  const body=overlay.querySelector('#sxbody');
  const head=document.createElement('div'); head.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin:10px 0';
  head.innerHTML=`<button id="sxcopy" style="background:#ee4d2d;color:#fff;border:0;border-radius:10px;padding:11px 14px;font-weight:700">📋 Copy tất cả link đạt</button><button id="sxrescan" style="border:0;border-radius:10px;padding:11px 14px">🔄 Quét lại</button>`;
  body.appendChild(head);
  const list=document.createElement('div'); body.appendChild(list);
  if(!rows.length){
    list.innerHTML='<div style="background:#fff;border-radius:12px;padding:14px;line-height:1.5">Không tìm thấy sản phẩm đủ dữ liệu trên trang hiện tại. Nếu bạn đang ở <b>ứng dụng Shopee</b>, hãy mở <b>website Shopee Affiliate bằng Safari</b>; JavaScript/Shortcut không thể đọc DOM bên trong app Shopee.</div>';
  }
  rows.forEach((r,i)=>{
    const d=document.createElement('div'); d.style.cssText='background:#fff;border-radius:12px;padding:10px;margin:9px 0;display:grid;grid-template-columns:78px 1fr;gap:10px';
    d.innerHTML=`${r.img?`<img src="${r.img}" style="width:78px;height:78px;object-fit:cover;border-radius:9px;background:#eee">`:'<div style="width:78px;height:78px;background:#eee;border-radius:9px"></div>'}<div><div style="font-weight:700;line-height:1.3">${(r.title||'Sản phẩm').replace(/[<>]/g,'')}</div><div style="margin-top:5px"><b style="color:#16805b">XTRA ${r.xtra}%</b> · 🎬 ${r.video} video</div><button data-copy="${encodeURIComponent(r.url)}" style="margin-top:7px;border:0;border-radius:8px;padding:8px 10px">Copy link</button></div>`;
    d.querySelector('[data-copy]').onclick=async e=>{await navigator.clipboard?.writeText(decodeURIComponent(e.currentTarget.dataset.copy));e.currentTarget.textContent='Đã copy ✓';};
    list.appendChild(d);
  });
  body.querySelector('#sxcopy').onclick=async()=>{await navigator.clipboard?.writeText(rows.map(r=>r.url).join('\n'));status.textContent=`Đã copy ${rows.length} link đạt.`;};
  body.querySelector('#sxrescan').onclick=()=>location.reload();
})();
