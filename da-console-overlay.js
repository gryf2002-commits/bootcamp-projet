/* SunMates — Console DA (overlay in-app, ADMIN ONLY).
   Charger DANS index.html (après le loader). N'apparaît que pour un admin.
   Édite la VRAIE app en live (même document) : presets, palette/mode, icônes,
   tailles, polices, effets, typo, composants, badges, logos, scènes, emojis,
   dégradés accent/sunset, + clic-recolor ciblé. Bouton flottant ✦ DA. */
(function(){
  "use strict";
  // Client Supabase : window.db si exposé (preview), sinon on en crée un (clé anon PUBLIQUE ;
  // la session admin connectée est réutilisée via le storage) → la console marche partout.
  var _SB_URL='https://ihiwuharxkmkzaxixhae.supabase.co',_SB_KEY='sb_publishable_-Q0evGrgq76Fp-YWLNA1Qg_jsOXEIcn';
  function _db(){try{if(window.db&&window.db.from)return window.db;if(window.supabase&&window.supabase.createClient)return window.supabase.createClient(_SB_URL,_SB_KEY);}catch(e){}return null;}
  function isAdmin(){try{if(typeof window.isAdmin==='function'&&window.isAdmin!==arguments.callee)return !!window.isAdmin();}catch(e){}
    try{return !!(window.myProfile&&window.myProfile.is_admin);}catch(e){return false;}}
  function hx(h){h=String(h||'').replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];var n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255];}
  function hex(a){return '#'+a.map(function(v){v=Math.max(0,Math.min(255,Math.round(v)));return (v<16?'0':'')+v.toString(16);}).join('');}
  function mix(a,b,t){var A=hx(a),B=hx(b);return hex([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t]);}

  var PAGES={jour:['#fbeee9','#1d2230',''],nuit:['#171026','#f3ecf6','theme-dusk'],
    hiver:['#EAF3FB','#1E3A52','theme-winter'],'hiver-nuit':['#0E2036','#EAF6FF','theme-winter theme-dusk'],
    tropiques:['#F7F9EC','#1C3D2E','theme-tropic'],'tropiques-nuit':['#06231B','#DFFAEF','theme-tropic theme-dusk']};
  var MK=['jour','nuit','hiver','hiver-nuit','tropiques','tropiques-nuit'];
  var LAB={jour:'Jour',nuit:'Nuit',hiver:'Hiver','hiver-nuit':'Hiv·nuit',tropiques:'Tropiq.','tropiques-nuit':'Trop·nuit'};
  var WIN=['#3E8FD4','#245F9E'],TRO=['#13A079','#0A7355'];
  function modesFrom(a,b){var M={};MK.forEach(function(k){var pg=PAGES[k][0],ink=PAGES[k][1],cls=PAGES[k][2],j1=a,j2=b;
    if(k==='nuit'){j1=mix(a,'#000',.06);j2=mix(b,'#000',.10);}
    else if(k==='hiver'){j1=mix(WIN[0],a,.2);j2=mix(WIN[1],b,.2);}
    else if(k==='hiver-nuit'){j1=mix(WIN[0],a,.2);j2=mix('#143E66',b,.18);}
    else if(k==='tropiques'){j1=mix(TRO[0],a,.2);j2=mix(TRO[1],b,.2);}
    else if(k==='tropiques-nuit'){j1=mix(TRO[0],a,.2);j2=mix('#063F2E',b,.18);}
    M[k]={label:LAB[k],page:pg,ink:ink,j1:j1,j2:j2,angle:160,class:cls};});return M;}
  var PRESETS={'🌅 Radiant Horizon':['#FF8A3D','#FF3A2D','Fraunces','Manrope','squircle'],
    '☀️ Sunset':['#FF9A4D','#FF5A6E','Fraunces','Manrope','squircle'],
    '🌌 Néon nuit':['#18E0C8','#6A5CFF','Poppins','Manrope','squircle'],
    '🌸 Pastel':['#FFC2D6','#B5A8FF','Quicksand','Quicksand','rounded'],
    '🌴 Lagon':['#2BD4A8','#0E9E8C','Baloo 2','Nunito','squircle'],
    '🍊 Agrumes':['#FFC53D','#FF7A1F','Baloo 2','Nunito','squircle'],
    '✨ Cosmique':['#B15CFF','#5B2BD6','Fraunces','Poppins','squircle'],
    '⚪ Lite / Neutre':['#E0563E','#E0563E','Manrope','Manrope','rounded'],
    // — presets ré-importés depuis l'ancienne console complète (builtins de da-console.html), base mode « jour » —
    '💎 Joaillerie':['#E85CA8','#7A2FD0','Fraunces','Manrope','squircle'],
    '⚪ Minimal mono':['#9AA3AE','#5B636E','Manrope','Manrope','rounded'],
    '📖 Duotone éditorial':['#6E7BE0','#34406E','Playfair Display','Manrope','rounded'],
    '🌅 Aurore pêche':['#FFB36B','#FF6F91','Fraunces','Manrope','squircle'],
    '🪸 Corail récif':['#FF7A59','#FF3D77','Fraunces','Manrope','squircle'],
    '🍇 Cassis nuit':['#A65CFF','#5B2BD6','Fraunces','Poppins','squircle'],
    '🌊 Bleu cobalt':['#4D8DF0','#2747C9','Poppins','Manrope','squircle'],
    '🌿 Menthe fraîche':['#46D6A6','#1E9E78','Baloo 2','Nunito','squircle'],
    '🔥 Braise ardente':['#FF8A3D','#E0322A','Fraunces','Manrope','squircle'],
    '🌷 Rose poudré':['#FFADC7','#FF7FA8','Quicksand','Quicksand','rounded'],
    '⚫ Encre & or':['#F0C36B','#B8862F','Fraunces','Manrope','squircle'],
    '🍋 Citron givré':['#FFD84D','#F2A20C','Baloo 2','Nunito','squircle'],
    '🌫️ Brume nordique':['#8FA8C9','#5A6E8C','Manrope','Manrope','rounded']};
  function build(n){var p=PRESETS[n];var lite=(n.indexOf('Lite')>=0);
    var M=modesFrom(p[0],p[1]);
    if(lite){Object.keys(M).forEach(function(k){M[k].page='#F4F5F7';M[k].ink='#16181D';M[k].j1='#E0563E';M[k].j2='#E0563E';});}
    return {preset:n,modes:M,
    icon:{style:'fill',colorMode:lite?'mono':'natural',mono:lite?'#E0563E':'#FFF6E9'},fonts:{heading:p[2],body:p[3]},
    effects:{shape:p[4],polish:!lite,mirror:false,shadow:!lite,radius:22,sheen:60},sizes:{tile:74,iconTile:38},
    badges:{exploration:['#FF8A3D','#FF5A4D'],social:['#9B7BFF','#6638D6'],securite:['#34C98F','#0E9E6B'],accomplissement:['#FFD15C','#E0901E']},
    logos:{},scenes:{accent:p[0],confetti:true},typo:{titleColor:'',bodyColor:'',metaColor:''},
    comp:{btnText:'#ffffff',chipText:'#ffffff'},emoji:{off:false},grads:{},iconColors:{},glyph:{},rewards:[],appIcon:{c1:p[0],c2:p[1],glyph:'sun'},imgBank:{},a11y:{fontScale:100},globalTexts:{},overrides:{}};}
  // NORMALISE un état DA (chargé de localStorage / re-importé / publié-pour-tous / écrit par le
  // loader via saveDraft) pour GARANTIR la présence de TOUTES les clés attendues. Sans ça, un état
  // partiel (ex. sans `overrides`) faisait planter injectExtra (Object.keys(undefined)) ET popEdit
  // (T.overrides[key] sur undefined) → « rien ne marche plus dans le popup ». Défensif et idempotent.
  function _normT(o){var base=build((o&&o.preset&&PRESETS[o.preset])?o.preset:'🌅 Radiant Horizon');
    if(!o||typeof o!=='object')return base;var T2={};
    // on part du squelette complet, puis on écrase avec ce qui existe dans l'état chargé
    Object.keys(base).forEach(function(k){T2[k]=base[k];});
    Object.keys(o).forEach(function(k){if(o[k]!=null)T2[k]=o[k];});
    // garde-fous fins sur les conteneurs critiques
    if(!T2.overrides||typeof T2.overrides!=='object')T2.overrides={};
    if(!T2.modes||typeof T2.modes!=='object')T2.modes=base.modes;
    // tout mode manquant → on le dérive du squelette (popEdit/setMode/build_panel supposent les 6)
    MK.forEach(function(k){if(!T2.modes[k]||typeof T2.modes[k]!=='object')T2.modes[k]=base.modes[k];});
    ['icon','fonts','effects','sizes','badges','logos','scenes','typo','comp','emoji','iconColors','a11y','globalTexts'].forEach(function(k){
      if(!T2[k]||typeof T2[k]!=='object')T2[k]=base[k];});
    if(!Array.isArray(T2.rewards))T2.rewards=[];
    return T2;}
  // On RECHARGE le dernier état (preset choisi + retouches) depuis localStorage → fini le retour à zéro.
  var T=(function(){try{var d=localStorage.getItem('sm_da_live');if(d){var o=JSON.parse(d);if(o&&typeof o==='object')return _normT(o);}}catch(e){}return build('🌅 Radiant Horizon');})(),curMode='jour',editMode=false,open=false;

  var SEL='.thumb,.cic,.jo-ic,.qm-ic,.sc-ic,.smgem,.hex,.tile,.cat-tile,.pcard,.gcard,.ghead,.lb-row,.coupon,.tcard,.btn-primary,.btn-accent,.btn-ghost,.btn-danger,.su-call,.su-sos,.sos-logo,.iconbtn,.chip,.brand .mark,.feature,.vchip,.mark-pro,.avail-badge,.rate-top,.t-name,.t-meta,.section-head,h1,h2,h3';
  var SCREENS=[['accueil','Accueil'],['lieux','Lieux'],['jeux','Jeux'],['connexions','Mates'],['securite','Sécu'],['profil','Profil']];

  function injectExtra(){var d=document,st=d.getElementById('sm-da-extra');if(!st){st=d.createElement('style');st.id='sm-da-extra';d.head.appendChild(st);}
    var css='';MK.forEach(function(k){var m=T.modes[k],cls=(m.class||'').trim();
      var pre='body'+(cls?'.'+cls.split(/\s+/).join('.'):':not(.theme-dusk):not(.theme-winter):not(.theme-tropic)');
      var ag='linear-gradient(135deg,'+m.j1+','+mix(m.j1,m.j2,.5)+','+m.j2+')';
      css+=pre+'{--accent-grad:'+ag+' !important;--sunset-grad:'+ag+' !important;}\n';
      // pins carte génériques → couleur du mode (les pins « toi »/.me et « quête »/.quest gardent leur sémantique)
      css+=pre+' .epin:not(.me):not(.quest){--epin:'+m.j2+' !important;}\n';});
    // badges familles (si .hex variantes présentes)
    var B=T.badges;function bg(a){return 'linear-gradient(160deg,'+a[0]+','+a[1]+')';}
    css+='.hex{background:'+bg(B.exploration)+'}\n.hex.grad-violet{background:'+bg(B.social)+'}\n.hex.grad-teal{background:'+bg(B.securite)+'}\n.hex.grad-gold{background:'+bg(B.accomplissement)+'}\n';
    // overrides ciblés (clic)
    if(!T.overrides||typeof T.overrides!=='object')T.overrides={};
    Object.keys(T.overrides).forEach(function(key){var o=T.overrides[key],pa=key.split('||'),mk=pa[0],sel=pa[1];
      var cls=(T.modes[mk]&&T.modes[mk].class||'').trim();var pre='html body'+(cls?'.'+cls.split(/\s+/).join('.'):'')+' ';
      var d='';
      if(o.bg){var bd=mix(o.bg,'#000',0.18);d+='background:linear-gradient(160deg,'+o.bg+','+bd+') !important;--ic1:'+o.bg+' !important;--ic2:'+bd+' !important;';} // UNE couleur → fond visible sur tout (tuile, bouton, texte-conteneur)
      else if(o.j1)d+='--ic1:'+o.j1+' !important;--ic2:'+(o.j2||o.j1)+' !important;background-image:linear-gradient(160deg,'+o.j1+','+(o.j2||o.j1)+') !important;';
      if(o.scale)d+='transform:scale('+o.scale+');'; // taille par élément (clic) — fond + emoji ensemble, pas de désync
      if(o.textColor)d+='color:'+o.textColor+' !important;';
      if(d)css+=pre+sel+'{'+d+'}\n';});
    st.textContent=css;}

  function apply(){try{if(window.SMDA&&window.SMDA.apply)window.SMDA.apply(T);}catch(e){}
    try{localStorage.setItem('sm_da_live',JSON.stringify(T));}catch(e){}injectExtra();}
  // ---- historique léger (annuler) des retouches clic ----
  var _undo=[];
  function _snap(){try{_undo.push(JSON.stringify(T.overrides||{}));if(_undo.length>40)_undo.shift();}catch(e){}}
  function _undoLast(){if(!_undo.length)return false;try{T.overrides=JSON.parse(_undo.pop())||{};}catch(e){T.overrides=T.overrides||{};}
    try{injectExtra();}catch(e){}try{apply();}catch(e){}return true;}
  function setMode(k){curMode=k;var b=document.body;b.classList.remove('theme-dusk','theme-winter','theme-tropic');
    var cls=(T.modes[k].class||'').trim();if(cls)cls.split(/\s+/).forEach(function(c){b.classList.add(c);});apply();build_panel();}
  function setScreen(s){try{if(window.goToTab)window.goToTab(s);}catch(e){}}

  // ---- clic-recolor ----
  function selFor(el){var known=SEL.split(',').map(function(s){return s.trim();}),cur=el;
    for(var d=0;d<7&&cur;d++){for(var i=0;i<known.length;i++){try{if(cur.matches&&cur.matches(known[i])){
      var cl=(cur.className||'').toString().trim().split(/\s+/).slice(0,2).join('.');return cl?'.'+cl:known[i];}}catch(e){}}cur=cur.parentElement;}
    // REPLI : aucun élément connu → on prend la 1re classe exploitable d'un ancêtre proche, pour que
    // TOUT soit recolorable (bouton déconnexion, logo, boutons notifs, grandes tuiles/arrières…).
    cur=el;for(var d2=0;d2<7&&cur;d2++){var cc=(cur.className||'');if(cc&&cc.toString){
      var first=cc.toString().trim().split(/\s+/).filter(function(s){return s&&!/^(sm-da|smda)/.test(s);})[0];
      if(first)return '.'+first;}cur=cur.parentElement;}
    return null;}
  document.addEventListener('click',function(ev){if(!editMode)return;if(ev.target.closest&&ev.target.closest('#smdaPanel,#smdaBtn,.smda-pop'))return;
    var sel=selFor(ev.target);if(!sel)return;ev.preventDefault();ev.stopPropagation();try{popEdit(sel,ev,ev.target);}catch(e){console.warn('[SMDA popEdit]',e);}},true);
  function popEdit(sel,ev,el){closePop();if(!T.overrides||typeof T.overrides!=='object')T.overrides={};
    _snap(); // photo de l'état avant édition → bouton « Annuler »
    var key=curMode+'||'+sel,ov=T.overrides[key]||{},m=(T.modes&&T.modes[curMode])||{j1:'#FF8A3D',j2:'#FF5A4D'};
    _markSel(el); // surligne l'élément en cours d'édition
    // élément porteur d'emoji (l'élément cliqué ou un ancêtre proche), sinon l'élément cliqué (pour AJOUTER)
    var host=el,h=el;for(var i=0;i<6&&h;i++){if(h.textContent){_EMO.lastIndex=0;if(_EMO.test(h.textContent)){host=h;break;}}h=h.parentElement;}
    var curEmo='';if(host){_EMO.lastIndex=0;var mm=(host.textContent||'').match(_EMO);curEmo=mm?mm[0]:'';}
    // texte actuel (1er nœud significatif), emoji retiré, pour pré-remplir le champ Texte
    var _tn=_firstTextNode(host),curTxt=_tn?(_tn.nodeValue||'').replace(_EMO,'').replace(/\s+/g,' ').trim():'';
    var curTxtA=curTxt.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    // PALETTE DU PRESET (couleurs dans le thème, pas du hasard) : les joyaux de tous les modes
    var pal=[];Object.keys(T.modes).forEach(function(k){[T.modes[k].j1,T.modes[k].j2].forEach(function(c){if(c&&pal.indexOf(c)<0)pal.push(c);});});
    var swh=pal.slice(0,6).map(function(c){return "<button class=dasw data-c='"+c+"' title='"+c+"' style='width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.25);background:"+c+";cursor:pointer'></button>";}).join('');
    var p=document.createElement('div');p.className='smda-pop';p.id='smdaPop';
    p.style.cssText='position:fixed;z-index:2147483647;left:'+Math.min(ev.clientX,innerWidth-262)+'px;top:'+Math.max(8,Math.min(ev.clientY,innerHeight-280))+'px;background:#1d1830;color:#f3ecf6;border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:12px;width:248px;font:13px Manrope,sans-serif;box-shadow:0 16px 40px -10px #000;touch-action:none';
    p.innerHTML="<b id=dphdr style='display:block;font-size:12px;word-break:break-all;cursor:move;padding-bottom:5px;border-bottom:1px solid rgba(255,255,255,.15);margin-bottom:6px'>⠿ "+sel+" <span style='color:#a99fbe;font-weight:400'>(glisse-moi)</span></b>"
      +"<div style='margin:9px 0 5px;font-size:11px;color:#a99fbe'>Couleur de fond</div>"
      +"<div style='display:flex;align-items:center;gap:7px;flex-wrap:wrap'><input type=color id=dbg value='"+(ov.bg||m.j1)+"' style='width:48px;height:34px;border-radius:9px;cursor:pointer'>"+swh+"<button id=dbgRm style='padding:6px 9px;margin-left:auto' title='Retirer le fond'>✕</button></div>"
      +"<div style='display:flex;align-items:center;gap:8px;margin:10px 0 0'><span style='flex:1'>Couleur du texte</span><input type=color id=dtc value='"+(ov.textColor||'#161b29')+"' style='width:48px;height:34px;border-radius:9px;cursor:pointer'><button id=dtcRm style='padding:6px 9px' title='Retirer'>✕</button></div>"
      +"<div style='margin:9px 0 4px;font-size:11px;color:#a99fbe'>Emoji "+(curEmo?'(actuel '+curEmo+')':'(aucun — en ajouter)')+"</div>"
      +"<div style='display:flex;gap:6px;align-items:center'><input type=text id=demo value='"+curEmo+"' placeholder='colle/écris un emoji' style='flex:1;font-size:18px;text-align:center;background:#0d0a14;color:#fff;border:1px solid #333;border-radius:6px;padding:5px'><button id=demoOk style='padding:7px 10px'>Poser</button><button id=demoRm style='padding:7px 9px' title='Retirer emoji'>✕</button></div>"
      +"<div style='margin:9px 0 4px;font-size:11px;color:#a99fbe'>Texte de CET élément</div>"
      +"<div style='display:flex;gap:6px;align-items:center'><input type=text id=dtxt value=\""+curTxtA+"\" placeholder='écris le texte…' style='flex:1;font-size:13px;background:#0d0a14;color:#fff;border:1px solid #333;border-radius:6px;padding:6px'><button id=dtxtOk style='padding:7px 10px'>OK</button></div>"
      +"<div style='margin:9px 0 4px;font-size:11px;color:#a99fbe'>Taille de CET élément (fond + emoji ensemble)</div><input type=range id=dsz min=50 max=170 value='"+Math.round((ov.scale||1)*100)+"' style='width:100%'>"
      +"<div style='display:flex;gap:6px;margin-top:10px'><button id=dallmodes style='flex:1;padding:7px' title='Reproduire ces retouches sur tous les modes (jour, nuit, hiver…)'>↪ Tous les modes</button><button id=dundo style='flex:1;padding:7px' title='Annuler la dernière retouche'>↶ Annuler</button></div>"
      +"<div style='display:flex;gap:6px;margin-top:6px'><button id=dok style='flex:1;padding:7px'>Fermer</button><button id=drm style='flex:1;padding:7px'>Tout retirer</button></div>";
    document.body.appendChild(p);
    function Q(s){return p.querySelector(s);}
    function ov_(){return (T.overrides[key]=T.overrides[key]||{});}
    function refresh(){try{injectExtra();}catch(e){}try{apply();}catch(e){}}
    function sv(){var v=Q('#dbg');if(!v)return;ov_().bg=v.value;delete T.overrides[key].j1;delete T.overrides[key].j2;refresh();}
    var _dbg=Q('#dbg');if(_dbg)_dbg.oninput=sv;
    var _dbgRm=Q('#dbgRm');if(_dbgRm)_dbgRm.onclick=function(){var o=T.overrides[key];if(o){delete o.bg;delete o.j1;delete o.j2;}refresh();};
    Array.prototype.forEach.call(p.querySelectorAll('.dasw'),function(b){b.onclick=function(){var c=b.getAttribute('data-c');if(_dbg)_dbg.value=c;sv();};});
    var _demoOk=Q('#demoOk');if(_demoOk)_demoOk.onclick=function(){var e=Q('#demo');if(e&&e.value.trim()&&host)_setEmoji(host,e.value.trim());};
    var _demoRm=Q('#demoRm');if(_demoRm)_demoRm.onclick=function(){if(host)_setEmoji(host,'');var e=Q('#demo');if(e)e.value='';};
    var _dtxtOk=Q('#dtxtOk');if(_dtxtOk)_dtxtOk.onclick=function(){var t=Q('#dtxt');if(host&&t)_setText(host,t.value);};
    var _dsz=Q('#dsz');if(_dsz)_dsz.oninput=function(){ov_().scale=(+_dsz.value)/100;refresh();};
    var _dtc=Q('#dtc');if(_dtc)_dtc.oninput=function(){ov_().textColor=_dtc.value;refresh();};
    var _dtcRm=Q('#dtcRm');if(_dtcRm)_dtcRm.onclick=function(){if(T.overrides[key])delete T.overrides[key].textColor;refresh();};
    (function(){var hdr=Q('#dphdr');if(!hdr)return;var dx=0,dy=0,dn=false;
      hdr.addEventListener('pointerdown',function(e){dn=true;var r=p.getBoundingClientRect();dx=e.clientX-r.left;dy=e.clientY-r.top;try{hdr.setPointerCapture(e.pointerId);}catch(x){}});
      hdr.addEventListener('pointermove',function(e){if(!dn)return;p.style.left=Math.max(2,Math.min(innerWidth-60,e.clientX-dx))+'px';p.style.top=Math.max(2,Math.min(innerHeight-40,e.clientY-dy))+'px';});
      hdr.addEventListener('pointerup',function(){dn=false;});})();
    // Reproduire les retouches de CET élément (couleur/texte/taille) sur TOUS les modes → cohérence en 1 clic
    var _dall=Q('#dallmodes');if(_dall)_dall.onclick=function(){var src=T.overrides[key];if(!src){_dall.textContent='Rien à copier';setTimeout(function(){_dall.textContent='↪ Tous les modes';},1100);return;}
      MK.forEach(function(k){if(k===curMode)return;var tgt=k+'||'+sel;T.overrides[tgt]=Object.assign({},T.overrides[tgt]||{},JSON.parse(JSON.stringify(src)));});
      refresh();_dall.textContent='Copié sur tous ✓';setTimeout(function(){_dall.textContent='↪ Tous les modes';},1300);};
    var _dundo=Q('#dundo');if(_dundo)_dundo.onclick=function(){if(_undoLast())closePop();};
    var _dok=Q('#dok');if(_dok)_dok.onclick=closePop;var _drm=Q('#drm');if(_drm)_drm.onclick=function(){delete T.overrides[key];refresh();closePop();};}
  function closePop(){var e=document.getElementById('smdaPop');if(e)e.remove();_clearSel();}
  // ---- surbrillance de l'élément en cours d'édition (feature : on voit ce qu'on retouche) ----
  var _selEl=null;
  function _markCss(){if(document.getElementById('sm-da-mark'))return;var s=document.createElement('style');s.id='sm-da-mark';
    s.textContent='.sm-da-sel{outline:2px dashed #18E0C8 !important;outline-offset:2px !important;border-radius:6px;}\n'
      +'.sm-da-flash{animation:smdaFlash .5s ease}@keyframes smdaFlash{0%{box-shadow:0 0 0 0 rgba(24,224,200,.6)}100%{box-shadow:0 0 0 14px rgba(24,224,200,0)}}';
    document.head.appendChild(s);}
  function _markSel(el){_markCss();_clearSel();if(el&&el.classList){try{el.classList.add('sm-da-sel');_selEl=el;}catch(e){}}}
  function _clearSel(){if(_selEl&&_selEl.classList){try{_selEl.classList.remove('sm-da-sel');}catch(e){}}_selEl=null;}

  // ---- UI (launcher + panel) ----
  function el(h){var d=document.createElement('div');d.innerHTML=h;return d.firstElementChild;}
  function build_panel(){var P=document.getElementById('smdaBody');if(!P)return;var m=T.modes[curMode];P.innerHTML='';
    function H(t){var e=document.createElement('div');e.textContent=t;e.style.cssText='margin:10px 0 4px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#a99fbe';return e;}
    function cr(lbl,get,set){var r=el("<div style='display:flex;align-items:center;gap:8px;margin:5px 0;font-size:13px'><label style='flex:1;color:#a99fbe'>"+lbl+"</label><input type=color value='"+get()+"'><input type=text value='"+get()+"' style='width:70px;background:#0d0a14;color:#fff;border:1px solid #333;border-radius:6px;padding:3px'></div>");
      var c=r.querySelector('input[type=color]'),x=r.querySelector('input[type=text]');function u(v){c.value=v;x.value=v;set(v);apply();}
      c.oninput=function(){u(c.value);};x.onchange=function(){if(/^#?[0-9a-f]{6}$/i.test(x.value))u(x.value[0]==='#'?x.value:'#'+x.value);};return r;}
    function sg(lbl,opts,get,set){var r=el("<div style='display:flex;align-items:center;gap:8px;margin:5px 0;font-size:13px'><label style='flex:1;color:#a99fbe'>"+lbl+"</label><span></span></div>");
      var sp=r.querySelector('span');opts.forEach(function(o){var b=document.createElement('button');b.textContent=o[1];
        b.style.cssText='border:1px solid #333;background:'+(get()===o[0]?'#FF7A4D':'transparent')+';color:'+(get()===o[0]?'#221':'#fff')+';padding:4px 8px;font-size:11px;cursor:pointer';
        b.onclick=function(){set(o[0]);apply();build_panel();};sp.appendChild(b);});return r;}
    function tg(lbl,get,set){var r=el("<div style='display:flex;align-items:center;gap:8px;margin:5px 0;font-size:13px'><label style='flex:1;color:#a99fbe'>"+lbl+"</label><input type=checkbox "+(get()?'checked':'')+"></div>");
      r.querySelector('input').onchange=function(e){set(e.target.checked);apply();build_panel();};return r;}
    function rg(lbl,get,set,mn,mx){var r=el("<div style='display:flex;align-items:center;gap:8px;margin:5px 0;font-size:13px'><label style='flex:1;color:#a99fbe'>"+lbl+"</label><input type=range min="+mn+" max="+mx+" value='"+get()+"' style='flex:1'><b style='width:28px;text-align:right'>"+get()+"</b></div>");
      var i=r.querySelector('input'),b=r.querySelector('b');i.oninput=function(){b.textContent=i.value;set(+i.value);apply();};return r;}
    function se(lbl,opts,get,set){var r=el("<div style='display:flex;align-items:center;gap:8px;margin:5px 0;font-size:13px'><label style='flex:1;color:#a99fbe'>"+lbl+"</label><select style='background:#0d0a14;color:#fff;border:1px solid #333;border-radius:6px;padding:3px'>"+opts.map(function(o){return "<option"+(get()===o?' selected':'')+">"+o+"</option>";}).join('')+"</select></div>");
      r.querySelector('select').onchange=function(e){set(e.target.value);apply();};return r;}
    // modes
    var mb=document.createElement('div');mb.style.cssText='display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px';
    MK.forEach(function(k){var b=document.createElement('button');b.textContent=LAB[k];
      b.style.cssText='border:1px solid #333;border-radius:999px;padding:4px 8px;font-size:11px;cursor:pointer;background:'+(k===curMode?'#FF7A4D':'transparent')+';color:'+(k===curMode?'#221':'#fff');
      b.onclick=function(){setMode(k);};mb.appendChild(b);});P.appendChild(mb);
    // screens
    var sb=document.createElement('div');sb.style.cssText='display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px';
    SCREENS.forEach(function(s){var b=document.createElement('button');b.textContent=s[1];
      b.style.cssText='border:1px solid #333;border-radius:999px;padding:4px 8px;font-size:11px;cursor:pointer;background:transparent;color:#fff';
      b.onclick=function(){setScreen(s[0]);};sb.appendChild(b);});P.appendChild(sb);
    // edit toggle
    var et=document.createElement('button');et.textContent=(editMode?'✏️ Édition ON (clique un élément)':'✏️ Éditer au clic');
    et.style.cssText='width:100%;border:1px solid #333;border-radius:9px;padding:7px;cursor:pointer;margin-bottom:6px;background:'+(editMode?'#18E0C8':'transparent')+';color:'+(editMode?'#073':'#fff');
    et.onclick=function(){editMode=!editMode;build_panel();};P.appendChild(et);
    var to=document.createElement('button');to.textContent=_txtOnly?'🅰 Texte seul : ON (recharge pour annuler)':'🅰 Texte seul (sans emoji)';
    to.style.cssText='width:100%;border:1px solid #333;border-radius:9px;padding:7px;cursor:pointer;margin-bottom:6px;background:'+(_txtOnly?'#FFD15C':'transparent')+';color:'+(_txtOnly?'#221':'#fff');
    to.onclick=function(){var n=!_txtOnly;setTextOnly(n);if(n)build_panel();};P.appendChild(to);
    P.appendChild(H('Presets'));var pb=document.createElement('div');pb.style.cssText='display:flex;flex-wrap:wrap;gap:4px';
    Object.keys(PRESETS).forEach(function(n){var b=document.createElement('button');b.textContent=n;
      b.style.cssText='border:1px solid #333;border-radius:999px;padding:4px 8px;font-size:11px;cursor:pointer;background:'+(n===T.preset?'#FF7A4D':'transparent')+';color:'+(n===T.preset?'#221':'#fff');
      b.onclick=function(){var ov=T.overrides||{};T=build(n);T.overrides=ov;setMode(curMode);};pb.appendChild(b);});P.appendChild(pb);
    P.appendChild(H('Palette · '+LAB[curMode]));
    P.appendChild(cr('Joyau 1',function(){return m.j1},function(v){m.j1=v;}));
    P.appendChild(cr('Joyau 2',function(){return m.j2},function(v){m.j2=v;}));
    P.appendChild(cr('Fond page',function(){return m.page},function(v){m.page=v;}));
    P.appendChild(cr('Encre',function(){return m.ink},function(v){m.ink=v;}));
    P.appendChild(rg('Angle dégradé',function(){return m.angle==null?160:m.angle},function(v){m.angle=v;},0,360));
    P.appendChild(H('Icônes'));
    P.appendChild(sg('Style',[['fill','Plein'],['line','Trait'],['duo','Duo'],['native','Natif']],function(){return T.icon.style},function(v){T.icon.style=v;}));
    P.appendChild(sg('Couleur',[['natural','Nat.'],['mono','Unie']],function(){return T.icon.colorMode},function(v){T.icon.colorMode=v;}));
    if(T.icon.colorMode==='mono')P.appendChild(cr('Couleur unie',function(){return T.icon.mono},function(v){T.icon.mono=v;}));
    P.appendChild(sg('Forme',[['squircle','Squir.'],['circle','Cercle'],['rounded','Arr.']],function(){return T.effects.shape},function(v){T.effects.shape=v;}));
    P.appendChild(rg('Taille tuile',function(){return T.sizes.tile},function(v){T.sizes.tile=v;},48,110));
    P.appendChild(rg('Taille emblème',function(){return T.sizes.iconTile},function(v){T.sizes.iconTile=v;},20,60));
    P.appendChild(H('Polices'));var FF=['Fraunces','Manrope','Poppins','Nunito','Quicksand','Baloo 2','Playfair Display'];
    P.appendChild(se('Titres',FF,function(){return T.fonts.heading},function(v){T.fonts.heading=v;}));
    P.appendChild(se('Interface',FF,function(){return T.fonts.body},function(v){T.fonts.body=v;}));
    P.appendChild(H('Texte (contraste)'));
    P.appendChild(cr('Titres',function(){return T.typo.titleColor||m.ink},function(v){T.typo.titleColor=v;}));
    P.appendChild(cr('Corps',function(){return T.typo.bodyColor||m.ink},function(v){T.typo.bodyColor=v;}));
    P.appendChild(cr('Méta',function(){return T.typo.metaColor||'#8a6f5e'},function(v){T.typo.metaColor=v;}));
    P.appendChild(H('Composants'));
    P.appendChild(cr('Texte bouton',function(){return T.comp.btnText},function(v){T.comp.btnText=v;}));
    P.appendChild(cr('Texte chip',function(){return T.comp.chipText},function(v){T.comp.chipText=v;}));
    P.appendChild(H('Badges'));
    [['exploration','Explo'],['social','Social'],['securite','Sécu'],['accomplissement','Accompl.']].forEach(function(f){
      P.appendChild(cr(f[1]+' clair',function(){return T.badges[f[0]][0]},function(v){T.badges[f[0]][0]=v;}));
      P.appendChild(cr(f[1]+' foncé',function(){return T.badges[f[0]][1]},function(v){T.badges[f[0]][1]=v;}));});
    P.appendChild(H('Logo du mode'));
    P.appendChild(cr('Logo '+LAB[curMode],function(){return T.logos[curMode]||m.ink},function(v){T.logos[curMode]=v;}));
    P.appendChild(H('Effets & scènes'));
    P.appendChild(rg('Arrondi (radius)',function(){return T.effects.radius==null?22:T.effects.radius},function(v){T.effects.radius=v;},0,40));
    P.appendChild(rg('Reflet (sheen)',function(){return T.effects.sheen==null?60:T.effects.sheen},function(v){T.effects.sheen=v;},0,100));
    P.appendChild(tg('Gloss',function(){return T.effects.polish},function(v){T.effects.polish=v;}));
    P.appendChild(tg('Miroir',function(){return T.effects.mirror},function(v){T.effects.mirror=v;}));
    P.appendChild(tg('Ombre',function(){return T.effects.shadow},function(v){T.effects.shadow=v;}));
    P.appendChild(cr('Accent scène',function(){return T.scenes.accent},function(v){T.scenes.accent=v;}));
    P.appendChild(H('Emojis'));
    P.appendChild(tg('Emblèmes SVG (sinon natif)',function(){return !T.emoji.off},function(v){T.emoji.off=!v;}));
    function det(t,fill){var dd=document.createElement('details');dd.style.margin='4px 0';
      var s=document.createElement('summary');s.textContent=t;s.style.cssText='cursor:pointer;font-size:12px;color:#a99fbe;margin:6px 0';dd.appendChild(s);
      var bd=document.createElement('div');fill(bd);dd.appendChild(bd);return dd;}
    function toC(bg){return (function(){try{return (0.2126*0+0)>1;}catch(e){return false;}})()?'#000':'#000';}
    var ICATS=['quest','games','medal','coupon','rank','shop','coffee','eco','near','rating','popular','trip','users','crown','phone','signal','alert','aid','chat','search'];
    P.appendChild(H('Couleurs d\u2019ic\u00f4nes (par cat\u00e9gorie)'));
    P.appendChild(det('Ouvrir la palette d\u2019embl\u00e8mes',function(b){
      ICATS.forEach(function(c){b.appendChild(cr(c,function(){return T.iconColors[c]||m.j2},function(v){T.iconColors[c]=v;T.icon.colorMode='themed';}));});}));
    P.appendChild(det('R\u00e9compenses',function(b){
      (T.rewards||[]).forEach(function(rw,i){var r=el("<div style='border:1px solid #333;border-radius:8px;padding:6px;margin:4px 0'></div>");
        var nm=el("<input type=text value='"+(rw.name||'')+"' placeholder='Nom' style='width:100%;background:#0d0a14;color:#fff;border:1px solid #333;border-radius:6px;padding:4px;margin-bottom:4px'>");nm.onchange=function(){rw.name=nm.value;};
        var xp=el("<input type=number value='"+(rw.xp||0)+"' style='width:70px;background:#0d0a14;color:#fff;border:1px solid #333;border-radius:6px;padding:4px'>");xp.onchange=function(){rw.xp=+xp.value;};
        var del=el("<button style='float:right;border:1px solid #333;background:transparent;color:#f88;border-radius:6px;cursor:pointer'>\u00d7</button>");del.onclick=function(){T.rewards.splice(i,1);build_panel();};
        r.appendChild(nm);r.appendChild(xp);r.appendChild(del);b.appendChild(r);});
      var add=el("<button style='border:1px solid #333;background:transparent;color:#fff;border-radius:8px;padding:5px;cursor:pointer'>+ Ajouter</button>");
      add.onclick=function(){T.rewards.push({name:'Nouvelle',xp:50,state:'unlocked'});build_panel();};b.appendChild(add);}));
    P.appendChild(det('Ic\u00f4ne app / PWA',function(b){
      b.appendChild(cr('D\u00e9grad\u00e9 haut',function(){return T.appIcon.c1},function(v){T.appIcon.c1=v;}));
      b.appendChild(cr('D\u00e9grad\u00e9 bas',function(){return T.appIcon.c2},function(v){T.appIcon.c2=v;}));
      b.appendChild(se('Glyphe',['sun','moon','near','crown','heart','star'],function(){return T.appIcon.glyph},function(v){T.appIcon.glyph=v;}));}));
    P.appendChild(det('Banque d\u2019images (lieux)',function(b){
      ['caf\u00e9','co-living','nature','eau','nuit','culture','route','ville'].forEach(function(k){
        var r=el("<div style='display:flex;align-items:center;gap:8px;margin:4px 0;font-size:12px'><label style='flex:1;color:#a99fbe'>"+k+"</label><input type=text value='"+((T.imgBank&&T.imgBank[k])||'')+"' placeholder='URL ou mots-cl\u00e9s' style='width:130px;background:#0d0a14;color:#fff;border:1px solid #333;border-radius:6px;padding:4px'></div>");
        r.querySelector('input').onchange=function(e){T.imgBank=T.imgBank||{};T.imgBank[k]=e.target.value;};b.appendChild(r);});}));
    P.appendChild(det('Textes globaux',function(b){
      [['app.tagline','Slogan'],['home.greeting','Salutation {prenom}'],['home.quick','Acc\u00e8s rapides'],['cta.continue','CTA continuer']].forEach(function(t){
        var r=el("<div style='margin:4px 0'><div style='font-size:11px;color:#a99fbe'>"+t[1]+"</div><input type=text value='"+((T.globalTexts&&T.globalTexts[t[0]])||'')+"' style='width:100%;background:#0d0a14;color:#fff;border:1px solid #333;border-radius:6px;padding:4px'></div>");
        r.querySelector('input').onchange=function(e){T.globalTexts=T.globalTexts||{};T.globalTexts[t[0]]=e.target.value;};b.appendChild(r);});}));
    P.appendChild(H('Accessibilit\u00e9'));
    P.appendChild(rg('Taille police %',function(){return (T.a11y&&T.a11y.fontScale)||100},function(v){T.a11y=T.a11y||{};T.a11y.fontScale=v;},80,140));
    var acb=document.createElement('button');acb.textContent='\u2728 Auto-contraste texte';
    acb.style.cssText='width:100%;margin-top:6px;border:1px solid #333;background:transparent;color:#fff;border-radius:9px;padding:7px;cursor:pointer';
    acb.onclick=function(){var p=T.modes[curMode];var L=lum(p.page);var c=L>0.45?'#1a1410':'#ffffff';T.typo.titleColor=c;T.typo.bodyColor=c;T.typo.metaColor=L>0.45?'#6b5a48':'#cbbfe0';apply();build_panel();};
    P.appendChild(acb);
    var ex=document.createElement('button');ex.textContent='Copier le JSON';
    ex.style.cssText='width:100%;margin-top:12px;border:0;border-radius:9px;padding:9px;font-weight:800;cursor:pointer;background:#FF7A4D;color:#221';
    ex.onclick=function(){try{navigator.clipboard.writeText(JSON.stringify(T,null,1));}catch(e){}ex.textContent='Copié ✓';setTimeout(function(){ex.textContent='Copier le JSON';},1200);};
    P.appendChild(ex);
    // PUBLIER POUR TOUS : upsert la DA dans Supabase da_tokens → tous les utilisateurs la reçoivent au prochain chargement.
    var pub=document.createElement('button');pub.textContent='🌍 Publier pour TOUS';
    pub.style.cssText='width:100%;margin-top:8px;border:0;border-radius:9px;padding:10px;font-weight:800;cursor:pointer;background:#1f9d6b;color:#fff';
    pub.onclick=function(){if(!confirm('Publier cette DA pour TOUS les utilisateurs ?'))return;pub.textContent='Publication…';
      var DB=_db();
      try{if(DB&&DB.from){DB.from('da_tokens').upsert({id:1,tokens:Object.assign({},T,{publishedLive:true}),updated_at:new Date().toISOString()}).then(function(r){
        pub.textContent=(r&&r.error)?('Erreur : '+(r.error.message||'?')):'Publié pour tous ✓';setTimeout(function(){pub.textContent='🌍 Publier pour TOUS';},2600);});}
      else{pub.textContent='Base indisponible';alert('Client Supabase indisponible — connecte-toi en admin et vérifie que la migration da_tokens est lancée.');setTimeout(function(){pub.textContent='🌍 Publier pour TOUS';},2600);}}catch(e){pub.textContent='Erreur';}};
    P.appendChild(pub);
    var hh=document.createElement('div');hh.style.cssText='font-size:11px;color:#a99fbe;margin-top:8px';
    hh.textContent='Aperçu = la vraie app en live (ta vue). « Publier pour TOUS » écrit la DA en base (admin) → tout le monde la reçoit au prochain chargement.';P.appendChild(hh);}

  // ---- Mode TEXTE SEUL (sans emoji) : retire les emojis du texte + masque les pastilles d'icônes ----
  var _txtOnly=false,_txtObs=null;
  var _EMO=/[←-⇿⌀-➿⤀-⥿⬀-⯿️‍\u{1F000}-\u{1FAFF}]/gu;
  var _EMO1=new RegExp(_EMO.source,'u'); // version non-globale → remplace seulement le 1er emoji
  // remplace (ou ajoute) l'emoji d'un élément, en direct dans le DOM
  function _setEmoji(host,emo){if(!host)return;var w=document.createTreeWalker(host,NodeFilter.SHOW_TEXT,null),n;
    while(n=w.nextNode()){_EMO.lastIndex=0;if(_EMO.test(n.nodeValue)){n.nodeValue=n.nodeValue.replace(_EMO1,emo);return;}}
    var f=host.firstChild;if(f&&f.nodeType===3)f.nodeValue=emo+' '+f.nodeValue;else host.insertBefore(document.createTextNode(emo+' '),host.firstChild||null);}
  // 1er nœud texte « significatif » (non vide, hors emoji seul) d'un élément → pour lire/éditer le libellé
  function _firstTextNode(host){if(!host)return null;var w=document.createTreeWalker(host,NodeFilter.SHOW_TEXT,null),n;
    while(n=w.nextNode()){var v=(n.nodeValue||'').replace(_EMO,'').replace(/\s/g,'');if(v)return n;}return null;}
  // remplace le texte VISIBLE de l'élément (1er nœud texte significatif) sans toucher aux enfants/emoji
  function _setText(host,txt){var n=_firstTextNode(host);if(n){_EMO.lastIndex=0;var emo=(n.nodeValue||'').match(_EMO1);
      n.nodeValue=(emo?emo[0]+' ':'')+txt;return true;}
    if(host){var f=host.firstChild;if(f&&f.nodeType===3)f.nodeValue=txt;else host.insertBefore(document.createTextNode(txt),host.firstChild||null);return true;}return false;}
  function _txtCss(){if(document.getElementById('sm-da-textonly'))return;var s=document.createElement('style');s.id='sm-da-textonly';
    s.textContent='body.sm-text-only [data-smicon],body.sm-text-only .cic,body.sm-text-only .jo-ic,body.sm-text-only .qm-ic,body.sm-text-only .sc-ic,body.sm-text-only .smgem{display:none!important}'
      +'body.sm-text-only .tile,body.sm-text-only .cat-tile,body.sm-text-only .gp-tile{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:4px}';
    document.head.appendChild(s);}
  function _strip(t){if(!t||t.nodeType!==3)return;var p=t.parentNode;if(p&&p.closest&&p.closest('#smdaPanel,#smdaBtn,#smdaPop'))return;
    var v=t.nodeValue;if(!v)return;_EMO.lastIndex=0;if(!_EMO.test(v))return;
    var stripped=v.replace(_EMO,'').replace(/[ \t]{2,}/g,' ');
    // emoji SEUL (icône sans texte) → on le GARDE : sinon l'élément perd tout son sens (nav, SOS, statut…)
    if(!stripped.replace(/\s/g,''))return;
    t.nodeValue=stripped;}
  function _stripAll(root){try{var w=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT,null);var n;while(n=w.nextNode())_strip(n);}catch(e){}}
  function setTextOnly(on){_txtOnly=on;_txtCss();document.body.classList.toggle('sm-text-only',on);
    if(on){_stripAll(document.body);
      try{_txtObs=new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==='characterData')_strip(m.target);
        (m.addedNodes||[]).forEach(function(nd){if(nd.nodeType===3)_strip(nd);else if(nd.nodeType===1)_stripAll(nd);});});});
        _txtObs.observe(document.body,{childList:true,subtree:true,characterData:true});}catch(e){}
    }else{if(_txtObs){try{_txtObs.disconnect();}catch(e){}_txtObs=null;}try{location.reload();}catch(e){}}}

  function mountUI(){if(document.getElementById('smdaBtn'))return;
    // Style tactile du panneau (gros inputs/boutons sur téléphone)
    var ps=document.getElementById('sm-da-ui');if(!ps){ps=document.createElement('style');ps.id='sm-da-ui';document.head.appendChild(ps);
      ps.textContent='#smdaPanel input[type=color]{width:38px;height:32px;min-width:38px;padding:0;border:1px solid #333;border-radius:6px;background:#0d0a14}'
        +'#smdaPanel input[type=text],#smdaPanel input[type=number]{font-size:14px;padding:7px;min-width:64px}'
        +'#smdaPanel select{font-size:14px;padding:6px}#smdaPanel button{min-height:36px}'
        +'#smdaPanel input[type=range]{height:28px}#smdaPanel label{font-size:13px}';}
    var btn=el("<button id=smdaBtn title='Console DA — glisse pour déplacer, tape pour ouvrir'>✦ DA</button>");
    // Par défaut AU-DESSUS de la barre de nav (ne couvre plus l'onglet Profil). Déplaçable.
    btn.style.cssText='position:fixed;z-index:2147483646;right:14px;bottom:calc(86px + env(safe-area-inset-bottom,0px));background:#FF7A4D;color:#221;border:0;border-radius:999px;padding:12px 16px;font:800 14px Manrope,sans-serif;cursor:grab;box-shadow:0 10px 30px -8px #000;touch-action:none;user-select:none;-webkit-user-select:none';
    try{var sp=JSON.parse(localStorage.getItem('sm_da_btn_pos')||'null');if(sp){btn.style.left=sp.x+'px';btn.style.top=sp.y+'px';btn.style.right='auto';btn.style.bottom='auto';}}catch(e){}
    // Drag + tap : bouge >6px = glissé (repositionne + mémorise) ; sinon = tap (ouvre/ferme)
    var dx=0,dy=0,sx=0,sy=0,moved=false,down=false;
    btn.addEventListener('pointerdown',function(e){down=true;moved=false;var r=btn.getBoundingClientRect();dx=e.clientX-r.left;dy=e.clientY-r.top;sx=e.clientX;sy=e.clientY;try{btn.setPointerCapture(e.pointerId);}catch(x){}});
    btn.addEventListener('pointermove',function(e){if(!down)return;if(Math.abs(e.clientX-sx)>6||Math.abs(e.clientY-sy)>6)moved=true;if(moved){var x=Math.max(4,Math.min(innerWidth-58,e.clientX-dx)),y=Math.max(4,Math.min(innerHeight-58,e.clientY-dy));btn.style.left=x+'px';btn.style.top=y+'px';btn.style.right='auto';btn.style.bottom='auto';}});
    btn.addEventListener('pointerup',function(e){if(!down)return;down=false;if(moved){try{localStorage.setItem('sm_da_btn_pos',JSON.stringify({x:parseInt(btn.style.left,10),y:parseInt(btn.style.top,10)}));}catch(x){}}else{open=!open;document.getElementById('smdaPanel').style.transform=open?'translateX(0)':'translateX(110%)';}});
    document.body.appendChild(btn);
    var pan=el("<div id=smdaPanel></div>");
    // Mobile : largeur quasi pleine, hauteur dynamique (dvh), padding bas safe-area, scroll fluide.
    pan.style.cssText='position:fixed;z-index:2147483646;top:0;right:0;width:min(340px,94vw);max-width:100vw;height:100vh;height:100dvh;background:#15121c;border-left:1px solid rgba(255,255,255,.12);box-shadow:-20px 0 60px -20px #000;transform:translateX(110%);transition:transform .25s;overflow:auto;-webkit-overflow-scrolling:touch;padding:14px;padding-bottom:calc(30px + env(safe-area-inset-bottom,0px));font-family:Manrope,sans-serif;color:#f3ecf6';
    pan.innerHTML="<div style='display:flex;justify-content:space-between;align-items:center;position:sticky;top:-14px;background:#15121c;padding:8px 0;margin:-4px 0 4px;z-index:1'><b>Console DA</b><button id=smdaClose style='background:none;border:0;color:#fff;font-size:28px;line-height:1;cursor:pointer;padding:0 8px'>×</button></div><div id=smdaBody></div>";
    document.body.appendChild(pan);
    pan.querySelector('#smdaClose').onclick=function(){open=false;pan.style.transform='translateX(110%)';};
    build_panel();}

  // En PUBLIC (index.html), seul un VRAI admin a la console. Le bypass ?daforce ne marche QUE
  // sur preview.html (bac à essai) → impossible de l'invoquer sur la prod.
  function start(){var force=/[?&]daforce/.test(location.search)&&/preview\.html/i.test(location.pathname);
    if(!isAdmin()&&!force)return false;mountUI();apply();return true;}
  // attendre que l'app + l'admin soient prêts
  var tries=0;var iv=setInterval(function(){tries++;if(start()||tries>60)clearInterval(iv);},700);
})();
