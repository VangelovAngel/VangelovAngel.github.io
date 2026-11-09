/* ---------- star chart (Erasmus+) ---------- */
(function(){
  const NS="http://www.w3.org/2000/svg", W=640, H=420, pad=36;
  const lon0=16.5, lon1=26.5, lat0=40.8, lat1=53.2;
  const X=lon=>pad+(lon-lon0)/(lon1-lon0)*(W-2*pad);
  const Y=lat=>pad+(lat1-lat)/(lat1-lat0)*(H-2*pad);
  const el=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p.appendChild(e);return e};
  const g=document.getElementById("graticule");
  for(let lon=17;lon<=25;lon+=2){el("line",{x1:X(lon),y1:pad-10,x2:X(lon),y2:H-pad+10,class:"grid"},g);
    el("text",{x:X(lon)+4,y:H-12,class:"glabel lon"},g).textContent=lon+"°E";}
  for(let lat=42;lat<=52;lat+=2){el("line",{x1:pad-10,y1:Y(lat),x2:W-pad+10,y2:Y(lat),class:"grid"},g);
    el("text",{x:8,y:Y(lat)-4,class:"glabel"},g).textContent=lat+"°N";}
  const P={
    bansko:{lon:23.49,lat:41.84,name:"Bansko",sub:"COMET · Surf Smart",dx:-16,dy:20,end:1},
    poland:{lon:19.4,lat:52.1,name:"Poland",sub:"Art Meets AI 2.0",dx:16,dy:4},
    kosice:{lon:21.26,lat:48.72,name:"Košice",sub:"Hope on Four Paws",dx:-16,dy:4,end:1}
  };
  const order=["bansko","poland","bansko","kosice"];
  const pg=document.getElementById("paths");
  const d=order.map((k,i)=>(i?"L":"M")+X(P[k].lon).toFixed(1)+" "+Y(P[k].lat).toFixed(1)).join(" ");
  el("path",{d,class:"path"},pg);
  const pts=document.getElementById("points");
  Object.values(P).forEach(p=>{
    const x=X(p.lon),y=Y(p.lat);
    el("circle",{cx:x,cy:y,r:13,class:"halo"},pts);
    el("circle",{cx:x,cy:y,r:3.6,class:"pt"},pts);
    el("text",{x:x+p.dx,y:y+p.dy,class:"plabel","text-anchor":p.end?"end":"start"},pts).textContent=p.name;
    el("text",{x:x+p.dx,y:y+p.dy+(innerWidth<=600?24:17),class:"psub","text-anchor":p.end?"end":"start"},pts).textContent=p.sub;
  });
})();

/* ---------- night sky ---------- */
(function(){
  const c=document.getElementById("sky"),x=c.getContext("2d");
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w,h,dpr,stars=[],shoot=null,mx=0,my=0,tx=0,ty=0,last=0,nextShoot=3000;
  function size(){
    dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;
    c.width=w*dpr;c.height=h*dpr;x.setTransform(dpr,0,0,dpr,0,0);
    const n=Math.round(w*h/2600);
    stars=Array.from({length:n},()=>{const z=Math.random();return{
      x:Math.random()*w,y:Math.random()*h,z,
      r:z<.92?Math.random()*.9+.25:Math.random()*1.3+1,
      a:Math.random()*.6+.3,tw:Math.random()*Math.PI*2,sp:Math.random()*1.6+.4,
      tint:Math.random()<.12?(Math.random()<.5?"242,217,166":"190,205,255"):"238,240,250"}});
  }
  function draw(t){
    const dt=t-last;last=t;
    tx+=(mx-tx)*.04;ty+=(my-ty)*.04;
    const sy=scrollY;
    x.clearRect(0,0,w,h);
    for(const s of stars){
      const px=s.x+tx*s.z*14, py=((s.y-sy*s.z*.08)%h+h)%h+ty*s.z*14;
      const a=still?s.a:s.a*(.65+.35*Math.sin(t*.001*s.sp+s.tw));
      x.fillStyle=`rgba(${s.tint},${a})`;
      x.beginPath();x.arc(px,py,s.r,0,6.283);x.fill();
      if(s.r>1.4){x.fillStyle=`rgba(${s.tint},${a*.12})`;x.beginPath();x.arc(px,py,s.r*3.2,0,6.283);x.fill();}
    }
    if(!still){
      nextShoot-=dt;
      if(!shoot&&nextShoot<0){shoot={x:Math.random()*w*.7+w*.2,y:Math.random()*h*.35,l:0,life:1};nextShoot=6000+Math.random()*7000;}
      if(shoot){
        shoot.l+=dt*.9;shoot.life-=dt/900;
        const ang=Math.PI*.8,hx=shoot.x+Math.cos(ang)*shoot.l,hy=shoot.y+Math.sin(ang)*shoot.l;
        const tl=Math.min(shoot.l,140),gx=hx-Math.cos(ang)*tl,gy=hy-Math.sin(ang)*tl;
        const gr=x.createLinearGradient(hx,hy,gx,gy);
        gr.addColorStop(0,`rgba(255,255,255,${Math.max(shoot.life,0)})`);gr.addColorStop(1,"rgba(255,255,255,0)");
        x.strokeStyle=gr;x.lineWidth=1.3;x.beginPath();x.moveTo(hx,hy);x.lineTo(gx,gy);x.stroke();
        if(shoot.life<=0)shoot=null;
      }
      requestAnimationFrame(draw);
    }
  }
  addEventListener("resize",()=>{size();if(still)draw(0)});
  addEventListener("pointermove",e=>{mx=e.clientX/w-.5;my=e.clientY/h-.5},{passive:true});
  if(still)addEventListener("scroll",()=>draw(0),{passive:true});
  size();requestAnimationFrame(draw);
})();

/* ---------- split name into letters for the intro animation ---------- */
(function(){
  let i=0;
  document.querySelectorAll("h1 .w").forEach(w=>{
    const t=w.textContent;w.textContent="";
    [...t].forEach(c=>{const s=document.createElement("span");s.className="ch";s.textContent=c;s.style.setProperty("--i",i++);w.appendChild(s);});
  });
})();

/* ---------- copy email ---------- */
document.getElementById("copy").addEventListener("click",async e=>{
  const b=e.currentTarget;
  try{await navigator.clipboard.writeText("vangelovangel5@gmail.com");b.textContent="Copied ✓";}
  catch{b.textContent="Select it above";}
  setTimeout(()=>b.textContent="Copy",2000);
});

/* ---------- active nav link ---------- */
(function(){
  const links=[...document.querySelectorAll(".nav a")];
  const ids=links.map(a=>a.getAttribute("href").slice(1));
  const secs=ids.map(id=>document.getElementById(id));
  function update(){
    let cur=ids[0];
    secs.forEach((s,i)=>{if(s&&s.getBoundingClientRect().top<innerHeight*.4)cur=ids[i]});
    if(innerHeight+scrollY>=document.body.scrollHeight-4)cur=ids[ids.length-1];
    links.forEach(a=>{const on=a.getAttribute("href")==="#"+cur;a.classList.toggle("on",on);
      if(on&&a.scrollIntoView&&a.parentElement.parentElement.scrollWidth>a.parentElement.parentElement.clientWidth){
        const ul=a.parentElement.parentElement;ul.scrollLeft=a.offsetLeft-ul.clientWidth/2+a.clientWidth/2;}});
  }
  addEventListener("scroll",update,{passive:true});update();
})();
