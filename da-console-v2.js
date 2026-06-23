(function(){
  "use strict";
  function hx(h){h=String(h||'').replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n=parseInt(h,16);return [(n>>16)&255,(n>>8)&255,n&255];}
  function hex(a){return '#'+a.map(function(v){v=Math.max(0,Math.min(255,Math.round(v)));
    return (v<16?'0':'')+v.toString(16);}).join('');}
  function mix(a,b,t){var A=hx(a),B=hx(b);return hex([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t]);}

  var PAGES={jour:['#FFF4E6','#1d2230',''],nuit:['#190E2E','#f3ecf6','theme-dusk'],
    hiver:['#EAF3FB','#1E3A52','theme-winter'],'hiver-nuit':['#0E2036','#EAF6FF','theme-winter theme-dusk'],
    tropiques:['#F7F9EC','#1C3D2E','theme-tropic'],'tropiques-nuit':['#06231B','#DFFAEF','theme-tropic theme-dusk']};
  var MODEKEYS=['jour','nuit','hiver','hiver-nuit','tropiques','tropiques-nuit'];
  var LABEL={jour:'Jour',nuit:'Nuit',hiver:'Hiver','hiver-nuit':'Hiver·nuit',tropiques:'Tropiques','tropiques-nuit':'Trop.·nuit'};
  var WIN=['#3E8FD4','#245F9E'],TRO=['#13A079','#0A7355'];
  function modesFrom(a,b){var M={};MODEKEYS.forEach(function(k){
    var pg=PAGES[k][0],ink=PAGES[k][1],cls=PAGES[k][2],j1=a,j2=b;
    if(k==='nuit'){j1=mix(a,'#000',.06);j2=mix(b,'#000',.10);}
    else if(k==='hiver'){j1=mix(WIN[0],a,.2);j2=mix(WIN[1],b,.2);}
    else if(k==='hiver-nuit'){j1=mix(WIN[0],a,.2);j2=mix('#143E66',b,.18);}
    else if(k==='tropiques'){j1=mix(TRO[0],a,.2);j2=mix(TRO[1],b,.2);}
    else if(k==='tropiques-nuit'){j1=mix(TRO[0],a,.2);j2=mix('#063F2E',b,.18);}
    M[k]={label:LABEL[k],page:pg,ink:ink,j1:j1,j2:j2,angle:160,class:cls};});return M;}

  var PRESETS={
    '☀️ Sunset':{a:'#FF9A4D',b:'#FF5A6E',heading:'Fraunces',body:'Manrope',shape:'squircle'},
    '🌌 Néon nuit':{a:'#18E0C8',b:'#6A5CFF',heading:'Poppins',body:'Manrope',shape:'squircle'},
    '🌸 Pastel':{a:'#FFC2D6',b:'#B5A8FF',heading:'Quicksand',body:'Quicksand',shape:'rounded'},
    '🌴 Lagon':{a:'#2BD4A8',b:'#0E9E8C',heading:'Baloo 2',body:'Nunito',shape:'squircle'},
    '🍊 Agrumes':{a:'#FFC53D',b:'#FF7A1F',heading:'Baloo 2',body:'Nunito',shape:'squircle'},
    '✨ Cosmique':{a:'#B15CFF',b:'#5B2BD6',heading:'Fraunces',body:'Poppins',shape:'squircle'}
  };
  function buildPreset(name){var p=PRESETS[name];return {preset:name,modes:modesFrom(p.a,p.b),
    icon:{style:'fill',colorMode:'natural',mono:'#FFF6E9'},fonts:{heading:p.heading,body:p.body},
    effects:{shape:p.shape,polish:true,shadow:true},sizes:{tile:74,iconTile:38},
    scenes:{accent:p.a},emoji:{off:false},overrides:{}};}
  var T=buildPreset('☀️ Sunset'),curMode='jour',curScreen='accueil',editMode=false;

  var SCREENS=[['accueil','Accueil'],['lieux','Lieux'],['jeux','Jeux'],['connexions','Mates'],['securite','Sécurité'],['profil','Profil']];
  var EDIT_SEL='.thumb,.cic,.jo-ic,.qm-ic,.sc-ic,.smgem,.hex,.tile,.cat-tile,.pcard,.gcard,.ghead,.lb-row,.coupon,.tcard,.sm-badge,.btn-primary,.chip,.brand .mark,.feature';

  function appWin(){var f=document.getElementById('app');try{return f&&f.contentWindow;}catch(e){return null;}}
  function appDoc(){var w=appWin();try{return w&&w.document;}catch(e){return null;}}
  function reachable(){var d=appDoc();return !!(d&&d.body);}
  function isAdminApp(){var w=appWin();if(!w)return null;
    try{if(typeof w.isAdmin==='function')return !!w.isAdmin();}catch(e){}
    try{if(w.myProfile)return !!w.myProfile.is_admin;}catch(e){}
    return null;}
  var _locked=false;
  function lock(){_locked=true;
    var P=document.getElementById('panelBody');if(P)P.innerHTML="<div class=warn><b>Accès réservé admin.</b><br>Cette console DA ne s'utilise qu'avec un compte administrateur, via l'onglet Admin de l'app. Connecte-toi en admin puis recharge.</div>";
    ['deviceBar','screenBar','modeBar'].forEach(function(id){var e=document.getElementById(id);if(e)e.style.opacity=.4;});
    var ex=document.getElementById('btnExport');if(ex)ex.disabled=true;}

  function status(t,warn){var s=document.getElementById('status');s.innerHTML=(warn?'<div class=warn>':'')+t+(warn?'</div>':'');}

  function applyDA(){if(_locked)return;var w=appWin();if(!w){status('Iframe inaccessible (origine différente). Sers la console depuis sunmatesapp.com.',1);return;}
    try{w.SM_DA_TOKENS=T;}catch(e){}
    try{w.localStorage.setItem('sm_da_live',JSON.stringify(T));}catch(e){}
    try{if(w.SMDA&&w.SMDA.apply)w.SMDA.apply(T);else{status('App pas prête (SMDA absent) — recharge.',1);return;}}catch(e){status('Accès iframe bloqué (cross-origin). Servir même origine.',1);return;}
    applyOverrides();applyMode();status('DA appliquée ✓ ('+LABEL[curMode]+')');}

  function applyMode(){var d=appDoc();if(!d)return;var b=d.body;
    b.classList.remove('theme-dusk','theme-winter','theme-tropic');
    var cls=(T.modes[curMode].class||'').trim();if(cls)cls.split(/\s+/).forEach(function(c){b.classList.add(c);});}

  function applyOverrides(){var d=appDoc();if(!d)return;var st=d.getElementById('sm-da-ovr');
    if(!st){st=d.createElement('style');st.id='sm-da-ovr';d.head.appendChild(st);}
    var css='';Object.keys(T.overrides).forEach(function(key){var o=T.overrides[key];
      var parts=key.split('||'),mk=parts[0],sel=parts[1];var bcls=(T.modes[mk]&&T.modes[mk].class||'').trim();
      var pre='body'+(bcls?'.'+bcls.split(/\s+/).join('.'):'')+' ';
      var g='linear-gradient(160deg,'+o.j1+','+o.j2+')';
      css+=pre+sel+'{--ic1:'+o.j1+' !important;--ic2:'+o.j2+' !important;background-image:'+g+' !important;}\n';});
    st.textContent=css;}

  function setScreen(s){curScreen=s;var w=appWin();try{if(w&&w.goToTab)w.goToTab(s);}catch(e){}bars();}
  function setDevice(d){var f=document.getElementById('app');f.className=(d==='mobile'?'mob':'desk');}
  var device='desk';

  // ---- clic-recolor sur la vraie app ----
  function selFor(el){if(!el)return null;
    var known=EDIT_SEL.split(',').map(function(s){return s.trim();});
    var cur=el;for(var d=0;d<6&&cur;d++){
      for(var i=0;i<known.length;i++){try{if(cur.matches&&cur.matches(known[i])){
        var cl=(cur.className||'').toString().trim().split(/\s+/).slice(0,2).join('.');
        return cl?'.'+cl:known[i];}}catch(e){}}
      cur=cur.parentElement;}
    return null;}
  function installPicker(){var d=appDoc();if(!d)return;if(d.__smPick)return;d.__smPick=1;
    d.addEventListener('click',function(ev){if(!editMode||_locked)return;
      var sel=selFor(ev.target);if(!sel)return;ev.preventDefault();ev.stopPropagation();
      openEdit(sel,ev);},true);}
  function openEdit(sel,ev){closePop();var key=curMode+'||'+sel,ov=T.overrides[key]||{},m=T.modes[curMode];
    var p=document.createElement('div');p.className='pop';p.id='pop';
    p.style.left=Math.min((ev.clientX||200),window.innerWidth-232)+'px';p.style.top=Math.min((ev.clientY||200),window.innerHeight-180)+'px';
    p.innerHTML="<h4>"+sel+"</h4><div class=row><label>Joyau 1</label><input type=color id=ej1 value='"+(ov.j1||m.j1)+"'></div>"
      +"<div class=row><label>Joyau 2</label><input type=color id=ej2 value='"+(ov.j2||m.j2)+"'></div>"
      +"<div class=row><button id=eok style='flex:1'>OK</button><button id=erm style='flex:1'>Retirer</button></div>";
    document.getElementById('popHost').appendChild(p);
    function save(){T.overrides[key]={j1:p.querySelector('#ej1').value,j2:p.querySelector('#ej2').value};applyOverrides();}
    p.querySelector('#ej1').oninput=save;p.querySelector('#ej2').oninput=save;
    p.querySelector('#eok').onclick=closePop;p.querySelector('#erm').onclick=function(){delete T.overrides[key];applyOverrides();closePop();};}
  function closePop(){var e=document.getElementById('pop');if(e)e.remove();}
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closePop();});

  function bars(){
    var db=document.getElementById('deviceBar');db.innerHTML='';
    [['desk','🖥 Desktop'],['mobile','📱 Mobile']].forEach(function(d){var b=document.createElement('button');b.textContent=d[1];
      if((device)===d[0])b.className='on';b.onclick=function(){device=d[0];setDevice(d[0]);bars();};db.appendChild(b);});
    var eb=document.createElement('button');eb.textContent='✏️ Éditer au clic';eb.className='edit'+(editMode?' on':'');
    eb.onclick=function(){editMode=!editMode;installPicker();bars();};db.appendChild(eb);
    var sb=document.getElementById('screenBar');sb.innerHTML='';
    SCREENS.forEach(function(n){var b=document.createElement('button');b.textContent=n[1];if(n[0]===curScreen)b.className='on';
      b.onclick=function(){setScreen(n[0]);};sb.appendChild(b);});
    var mb=document.getElementById('modeBar');mb.innerHTML='';
    MODEKEYS.forEach(function(k){var b=document.createElement('button');b.textContent=LABEL[k];if(k===curMode)b.className='on';
      b.onclick=function(){curMode=k;applyDA();bars();panel();};mb.appendChild(b);});}

  function seg(lbl,opts,get,set){var r=document.createElement('div');r.className='row';
    r.innerHTML="<label>"+lbl+"</label><span class=seg></span>";var sp=r.querySelector('.seg');
    opts.forEach(function(o){var b=document.createElement('button');b.textContent=o[1];if(get()===o[0])b.className='on';
      b.onclick=function(){set(o[0]);applyDA();panel();};sp.appendChild(b);});return r;}
  function colorRow(lbl,get,set){var r=document.createElement('div');r.className='row';
    r.innerHTML="<label>"+lbl+"</label><input type=color value='"+get()+"'><input type=text value='"+get()+"' style='width:74px'>";
    var c=r.querySelector('input[type=color]'),x=r.querySelector('input[type=text]');
    function up(v){c.value=v;x.value=v;set(v);applyDA();}
    c.oninput=function(){up(c.value);};x.onchange=function(){if(/^#?[0-9a-f]{6}$/i.test(x.value))up(x.value[0]==='#'?x.value:'#'+x.value);};return r;}
  function rng(lbl,get,set,mn,mx){var r=document.createElement('div');r.className='row';
    r.innerHTML="<label>"+lbl+"</label><input type=range min="+mn+" max="+mx+" value='"+get()+"'><span style='width:30px;text-align:right;font-size:.72rem'>"+get()+"</span>";
    var i=r.querySelector('input'),s=r.querySelector('span');i.oninput=function(){s.textContent=i.value;set(+i.value);applyDA();};return r;}
  function tog(lbl,get,set){var r=document.createElement('div');r.className='row';
    r.innerHTML="<label>"+lbl+"</label><input type=checkbox "+(get()?'checked':'')+">";
    r.querySelector('input').onchange=function(e){set(e.target.checked);applyDA();panel();};return r;}
  function selRow(lbl,opts,get,set){var r=document.createElement('div');r.className='row';
    r.innerHTML="<label>"+lbl+"</label><select>"+opts.map(function(o){return "<option"+(get()===o?' selected':'')+">"+o+"</option>";}).join('')+"</select>";
    r.querySelector('select').onchange=function(e){set(e.target.value);applyDA();};return r;}
  function h3(t){var e=document.createElement('h3');e.textContent=t;return e;}

  function panel(){var P=document.getElementById('panelBody');P.innerHTML='';var m=T.modes[curMode];
    if(!reachable()){var w=document.createElement('div');w.className='warn';
      w.innerHTML="Aperçu non accessible : la console doit être servie depuis <b>sunmatesapp.com</b> (même origine que l'app) et tu dois être connecté. En local/cross-origin, le navigateur bloque l'accès à l'iframe.";P.appendChild(w);}
    P.appendChild(h3('Presets'));var pb=document.createElement('div');pb.className='bar';pb.style.justifyContent='flex-start';
    Object.keys(PRESETS).forEach(function(n){var b=document.createElement('button');b.textContent=n;if(n===T.preset)b.className='on';
      b.onclick=function(){var ov=T.overrides;T=buildPreset(n);T.overrides=ov;applyDA();bars();panel();};pb.appendChild(b);});P.appendChild(pb);
    P.appendChild(h3('Palette · '+LABEL[curMode]));
    P.appendChild(colorRow('Joyau 1',function(){return m.j1},function(v){m.j1=v;}));
    P.appendChild(colorRow('Joyau 2',function(){return m.j2},function(v){m.j2=v;}));
    P.appendChild(colorRow('Fond page',function(){return m.page},function(v){m.page=v;}));
    P.appendChild(colorRow('Encre',function(){return m.ink},function(v){m.ink=v;}));
    P.appendChild(h3('Icônes'));
    P.appendChild(seg('Style',[['fill','Plein'],['line','Trait'],['duo','Duo'],['native','Natif']],function(){return T.icon.style},function(v){T.icon.style=v;}));
    P.appendChild(seg('Couleur',[['natural','Naturelle'],['mono','Unie']],function(){return T.icon.colorMode},function(v){T.icon.colorMode=v;}));
    if(T.icon.colorMode==='mono')P.appendChild(colorRow('Couleur unie',function(){return T.icon.mono},function(v){T.icon.mono=v;}));
    P.appendChild(seg('Forme',[['squircle','Squircle'],['circle','Cercle'],['rounded','Arrondi']],function(){return T.effects.shape},function(v){T.effects.shape=v;}));
    P.appendChild(rng('Taille tuile',function(){return T.sizes.tile},function(v){T.sizes.tile=v;},48,110));
    P.appendChild(rng('Taille emblème',function(){return T.sizes.iconTile},function(v){T.sizes.iconTile=v;},20,60));
    P.appendChild(h3('Polices'));var FF=['Fraunces','Manrope','Poppins','Nunito','Quicksand','Baloo 2','Playfair Display'];
    P.appendChild(selRow('Titres',FF,function(){return T.fonts.heading},function(v){T.fonts.heading=v;}));
    P.appendChild(selRow('Interface',FF,function(){return T.fonts.body},function(v){T.fonts.body=v;}));
    P.appendChild(h3('Effets'));
    P.appendChild(tog('Gloss',function(){return T.effects.polish},function(v){T.effects.polish=v;}));
    P.appendChild(tog('Ombre',function(){return T.effects.shadow},function(v){T.effects.shadow=v;}));
    P.appendChild(colorRow('Accent scène',function(){return T.scenes.accent},function(v){T.scenes.accent=v;}));
    P.appendChild(h3('Emojis'));
    P.appendChild(tog('Emblèmes SVG (sinon natif)',function(){return !T.emoji.off},function(v){T.emoji.off=!v;}));
    var hh=document.createElement('div');hh.className='hint';hh.textContent='Aperçu = la VRAIE app (iframe). Active « Éditer au clic » puis clique un élément dedans pour le recolorer.';P.appendChild(hh);}

  document.getElementById('btnExport').onclick=function(){var out=JSON.stringify(T,null,1);
    try{navigator.clipboard.writeText(out);}catch(e){}
    try{if(window.opener)window.opener.postMessage({type:'sm-da-tokens',tokens:T},'*');}catch(e){}
    status('JSON copié'+(window.opener?' + envoyé à l\'admin':'')+' ✓');};
  document.getElementById('btnReset').onclick=function(){T.overrides={};applyOverrides();status('Overrides effacés.');};

  function onAppReady(){var ad=isAdminApp();
    if(ad===false){lock();status('Accès réservé admin.',1);return;}
    installPicker();applyDA();panel();
    if(ad===null)status('Profil admin non confirmé — vérifie que tu es connecté en admin (la publication reste protégée serveur).',1);}
  var f=document.getElementById('app');
  f.addEventListener('load',function(){setTimeout(onAppReady,600);});
  var tries=0;var iv=setInterval(function(){tries++;if(reachable()&&appWin().SMDA){clearInterval(iv);onAppReady();}if(tries>40)clearInterval(iv);},500);
  bars();panel();
})();
