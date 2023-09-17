(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const f of i.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&n(f)}).observe(document,{childList:!0,subtree:!0});function e(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(o){if(o.ep)return;o.ep=!0;const i=e(o);fetch(o.href,i)}})();const M=`
attribute vec2 coordinates;
attribute vec4 a_color; // New attribute for color
varying vec4 vColor;
attribute float aShape;
varying float vShape;

void main(void) {
  gl_Position = vec4(coordinates, 0.0, 1.0);
  vColor = a_color;

  gl_PointSize = 8.0;
  vShape = aShape;
}`,C=`
precision mediump float;
varying vec4 vColor;
varying float vShape;

void main(void) {
  vec2 coord = gl_PointCoord - vec2(0.5, 0.5); // Translate to center

  if (vShape < 0.5) {
    // square
  } else if (vShape < 1.5) {
    // circle
    if (length(coord) > 0.5) {
      discard;
    }
  } else {
    // triangle
    if (coord.x + coord.y > 0.5 || coord.x - coord.y < -0.5 || coord.y - coord.x < -0.5) {
      discard;
    }
  }

  gl_FragColor = vColor;
}`;function w(t,a,e){const n=t.createShader(e);if(!n)throw new Error("no shader");if(t.shaderSource(n,a),t.compileShader(n),!t.getShaderParameter(n,t.COMPILE_STATUS))throw console.error(),t.deleteShader(n),new Error("Error compiling shader");return n}const T=()=>{const t=document.createElement("canvas");t.style.position="fixed",t.style.top="0",t.style.left="0",t.style.zIndex="999",t.style.pointerEvents="none",document.body.appendChild(t),window.addEventListener("resize",()=>{n()});const a=l=>{t.style.zIndex=`${l}`};let e=t.getContext("webgl2");if(e||(e=t.getContext("webgl")),!e)throw new Error("WebGL not supported");function n(){e&&(t.width=window.innerWidth,t.height=window.innerHeight,e.viewport(0,0,t.width,t.height))}const o=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,o);const i=w(e,M,e.VERTEX_SHADER),f=w(e,C,e.FRAGMENT_SHADER),c=e.createProgram();if(!c)throw new Error("No shader program");if(e.attachShader(c,i),e.attachShader(c,f),e.linkProgram(c),!e.getProgramParameter(c,e.LINK_STATUS))throw new Error("Error linking shader program");let d=[];const E=(l=0,s=0,u=100,h="cone")=>{console.log(l,s);for(let v=0;v<u;v++){const r=l,_=s;let g=0;h==="cone"?g=Math.random()*.03*(l?-l:Math.random()<.5?1:-1):h==="fountain"&&(g=Math.random()*.02*(Math.random()<.5?1:-1));const P=Math.random()*.08-.01,B=[Math.random(),Math.random(),Math.random(),.5],L=Math.floor(Math.random()*3);d.push({x:r,y:_,vx:g,vy:P,color:B,shape:L,active:!0})}},p=e.getAttribLocation(c,"coordinates");e.enableVertexAttribArray(p),e.useProgram(c),e.vertexAttribPointer(p,2,e.FLOAT,!1,0,0);const S=e.createBuffer(),F=e.createBuffer(),b=e.createBuffer();function R(){if(!e||!c)return;e.bindBuffer(e.ARRAY_BUFFER,S);const l=new Float32Array(d.flatMap(r=>[r.x,r.y]));e.bufferData(e.ARRAY_BUFFER,l,e.DYNAMIC_DRAW),e.vertexAttribPointer(p,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,F);const s=new Float32Array(d.flatMap(r=>r.color));e.bufferData(e.ARRAY_BUFFER,s,e.DYNAMIC_DRAW);const u=e.getAttribLocation(c,"a_color");e.vertexAttribPointer(u,4,e.FLOAT,!1,0,0),e.enableVertexAttribArray(u);const h=new Float32Array(d.map(r=>r.shape));e.bindBuffer(e.ARRAY_BUFFER,b),e.bufferData(e.ARRAY_BUFFER,h,e.STATIC_DRAW);const v=e.getAttribLocation(c,"aShape");e.enableVertexAttribArray(v),e.bindBuffer(e.ARRAY_BUFFER,b),e.vertexAttribPointer(v,1,e.FLOAT,!1,0,0),e.drawArrays(e.POINTS,0,d.length);for(const r of d){if(r.x<-1||r.x>1||r.y<-1){r.active=!1;continue}r.x+=r.vx,r.y+=r.vy,r.vx*=.99,r.vy<0&&(r.vy*=.98),r.vy-=.001}d=d.filter(r=>r.active),requestAnimationFrame(R)}let A=!1;const m=()=>{A||(n(),R(),A=!0)},x=(l=20,s)=>{s&&s.zIndex&&a(s.zIndex),A||m(),((s==null?void 0:s.cannonSpawns)||[[-1,-1],[1,-1]]).forEach(([u,h])=>{E(u,h,25*l,s==null?void 0:s.spread)})};return m(),{animationStarted:A,_blastConfetti:x,_startAnimation:m}};let y=(t,a)=>{};try{const{_blastConfetti:t}=T();y=t}catch(t){console.error("Error initialising confetti: "+t)}const I=(t,a)=>e=>{const n=document.querySelector("canvas");if(!n)return;const o=n.getBoundingClientRect(),i=e.clientX-o.left-n.width/2,f=-(e.clientY-o.top-n.height/2),c=2*(i/n.width),d=2*(f/n.height);y(t,{cannonSpawns:[[c,d]],spread:"fountain",...a})},O=(t=20,a)=>{const e=I(t,{...a});return document.addEventListener("click",e),()=>{document.removeEventListener("click",e)}},Y=y;Y();O();
