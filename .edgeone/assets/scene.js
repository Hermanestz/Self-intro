import * as THREE from './assets/three.module.js';
export function startScene({reducedMotion=false}={}){
const container=document.getElementById('architecture');const canvas=document.getElementById('scene');const ascii=document.getElementById('ascii-scene');const aCtx=ascii.getContext('2d');const sample=document.createElement('canvas');const sCtx=sample.getContext('2d',{willReadFrequently:true});
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(-17,17,10,-10,.1,150);camera.position.set(24,18,26);camera.lookAt(0,1,0);
scene.add(new THREE.HemisphereLight(0xcbdcf1,0x172129,2.2));const key=new THREE.DirectionalLight(0xe5edfa,4);key.position.set(-8,24,12);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-25,right:25,top:25,bottom:-25,near:1,far:70});key.shadow.bias=-.001;scene.add(key);const fill=new THREE.DirectionalLight(0x6097ff,2);fill.position.set(10,4,-16);scene.add(fill);
const root=new THREE.Group();scene.add(root);root.rotation.y=-.25;
const mat={concrete:new THREE.MeshStandardMaterial({color:0x87939c,roughness:.85,metalness:.1}),light:new THREE.MeshStandardMaterial({color:0xbac3c7,roughness:.7}),dark:new THREE.MeshStandardMaterial({color:0x263440,roughness:.55,metalness:.65}),glass:new THREE.MeshStandardMaterial({color:0x1e3d54,metalness:.9,roughness:.24}),blue:new THREE.MeshStandardMaterial({color:0x3973ef,emissive:0x1263ff,emissiveIntensity:2}),signal:new THREE.MeshStandardMaterial({color:0xb8f554,emissive:0x94ef32,emissiveIntensity:.75,roughness:.2}),white:new THREE.MeshStandardMaterial({color:0xd5dce0,roughness:.65})};
const unit=new THREE.BoxGeometry(1,1,1);function box(w,h,d,x,y,z,m=mat.concrete,parent=root){const o=new THREE.Mesh(unit,m);o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
// A continuous elevated research campus, modeled as actual 3D geometry.
box(24,.55,9,0,-1.7,0,mat.dark);box(24.3,.12,9.3,0,-2.02,0,mat.concrete);
const modules=[];
function pavilion(x,z,w,d,h){const g=new THREE.Group();g.position.set(x,0,z);root.add(g);modules.push(g);box(w,.25,d,0,.35,0,mat.light,g);box(w,.35,d,0,h,0,mat.light,g);box(w,.13,d+.15,0,h+.24,0,mat.dark,g);box(w-.4,h-.5,d-.45,0,h/2+.2,0,mat.glass,g);for(let q=-w/2+.15;q<=w/2;q+=.48){box(.11,h-.2,.19,q,h/2+.1,d/2,mat.light,g);box(.11,h-.2,.19,q,h/2+.1,-d/2,mat.concrete,g);}for(let q=-d/2+.18;q<=d/2;q+=.55){box(.16,h-.2,.08,w/2,h/2+.1,q,mat.light,g);box(.16,h-.2,.08,-w/2,h/2+.1,q,mat.concrete,g);}box(w*.55,.035,.045,0,.52,d/2+.1,mat.blue,g);for(let q=-1;q<=1;q++)box(.25,2.3,.25,q*w*.32,-.8,0,mat.dark,g);return g;}
pavilion(-7,0,5,5,3.5);pavilion(1,-1.9,6,3.3,5.4);pavilion(8,1.2,4.4,4.5,3.4);
// Upper cantilever / roof terraces.
box(15,.48,1.7,.5,3.65,1.55,mat.light);box(15,.08,.07,.5,3.95,2.4,mat.blue);box(15,.08,.07,.5,4.65,2.4,mat.dark);
for(let x=-6.7;x<8;x+=.55)box(.055,.72,.055,x,4.3,2.4,mat.dark);
box(11,.32,2.1,-.9,.25,3.9,mat.concrete);box(11,.09,.12,-.9,.48,4.85,mat.blue);
for(let x=-5.8;x<=4.2;x+=1.05){box(.14,2.1,.14,x,-.65,3.4,mat.dark);box(.1,.6,.1,x,.7,4.85,mat.light);}box(11,.06,.06,-.9,1,4.85,mat.light);
// Monumental side wall and a series of stairs.
box(.4,6.7,4.5,-10.7,1.1,-.1,mat.concrete);box(.12,6.7,.12,-10.44,1.1,2.16,mat.blue);
for(let i=0;i<16;i++){box(3.7,.22,.34,-6.9,-1.45+i*.115,4.7-i*.3,mat.light);}
for(let i=0;i<12;i++){box(1.65,.2,.35,5.8,.45+i*.27,2.1-i*.29,mat.concrete);}
// Roof equipment and delicate technical details.
for(let i=0;i<5;i++){box(.8,.32,1.8,-.9+i*.92,5.85,-1.9,mat.dark);for(let j=0;j<6;j++)box(.82,.035,.035,-.9+i*.92,6.03,-2.65+j*.26,mat.light);}
for(let x=-9;x<10;x+=2.4){box(.035,2.3,.035,x,-.15,-4.1,mat.light);box(.5,.045,.13,x,.99,-4.1,mat.white);}
// Glowing signal moves along the bridge.
const signal=box(.46,.46,.46,-6,4.25,1.6,mat.signal);const signalLight=new THREE.PointLight(0xa4ee5c,7,4);signal.add(signalLight);
const edgeGeo=new THREE.EdgesGeometry(new THREE.BoxGeometry(24.5,.6,9.5));const edges=new THREE.LineSegments(edgeGeo,new THREE.LineBasicMaterial({color:0x5f7487,transparent:true,opacity:.45}));edges.position.y=-1.7;root.add(edges);
let mode='solid',w=0,h=0,progress=0,active=true,drag=false,lastX=0,dragAngle=0,mouseX=0,mouseY=0,lastTime=0;const target=new THREE.Vector3();
function resize(){const r=container.getBoundingClientRect();w=r.width;h=r.height;if(!w||!h)return;renderer.setSize(w,h,false);const aspect=w/h;const half=aspect<1.3?15:10.8;camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();ascii.width=Math.round(w);ascii.height=Math.round(h);sample.width=Math.min(170,Math.floor(w/6));sample.height=Math.floor(sample.width/aspect*.55);}
new ResizeObserver(resize).observe(container);resize();new IntersectionObserver(e=>{active=e[0].isIntersecting;}).observe(container);
container.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;container.setPointerCapture(e.pointerId);});container.addEventListener('pointerup',()=>drag=false);container.addEventListener('pointercancel',()=>drag=false);container.addEventListener('pointermove',e=>{if(drag){dragAngle+=(e.clientX-lastX)*.006;lastX=e.clientX;}else{const r=container.getBoundingClientRect();mouseX=(e.clientX-r.left)/r.width-.5;mouseY=(e.clientY-r.top)/r.height-.5;}});container.addEventListener('pointerleave',()=>{mouseX=0;mouseY=0;});
function updateScroll(){const track=document.querySelector('.hero-track');const span=Math.max(1,track.offsetHeight-innerHeight);progress=reducedMotion?0:Math.max(0,Math.min(1,scrollY/span));const fade=Math.max(0,Math.min(1,(progress-.38)/.32));document.querySelector('.hero h1').style.opacity=1-fade;document.querySelector('.hero-copy').style.opacity=1-fade;document.querySelector('.hero-copy').style.pointerEvents=fade>.8?'none':'auto';document.querySelector('.hero-transition').style.opacity=fade;document.querySelector('.hero-transition').style.transform=`translateY(${(1-fade)*40}px)`;document.querySelector('.scene-caption').style.opacity=1-fade;}
window.addEventListener('scroll',updateScroll,{passive:true});updateScroll();
function renderASCII(){sCtx.clearRect(0,0,sample.width,sample.height);sCtx.drawImage(canvas,0,0,sample.width,sample.height);const data=sCtx.getImageData(0,0,sample.width,sample.height).data;const cw=w/sample.width,ch=h/sample.height;const chars=' .:-=+*#%@';aCtx.clearRect(0,0,w,h);aCtx.font=`${Math.max(7,ch*.92)}px monospace`;aCtx.textBaseline='top';for(let y=0;y<sample.height;y++)for(let x=0;x<sample.width;x++){const i=(y*sample.width+x)*4;if(data[i+3]<30)continue;const l=(data[i]*.3+data[i+1]*.59+data[i+2]*.11)/255;const idx=Math.min(9,Math.floor(l*13));if(!idx)continue;aCtx.fillStyle=data[i+2]>data[i]*1.3?'#6398e9':'#b9cbd7';aCtx.fillText(chars[idx],x*cw,y*ch);}}
function frame(t){requestAnimationFrame(frame);if(!active||document.hidden||t-lastTime<33)return;lastTime=t;const time=reducedMotion?0:t*.0002;const orbit=mode==='plan'?0:.25+progress*.28;root.rotation.y=THREE.MathUtils.lerp(root.rotation.y,-.32+dragAngle+(reducedMotion?0:mouseX*.12),.06);root.position.x=THREE.MathUtils.lerp(root.position.x,progress*5.3,.055);root.position.y=THREE.MathUtils.lerp(root.position.y,-progress*1.5,.055);
if(mode==='plan')target.set(0,39,.01);else target.set(24+Math.sin(orbit)*5,18+progress*5+(reducedMotion?0:mouseY),26-progress*9);camera.position.lerp(target,reducedMotion?1:.055);camera.lookAt(0,1.5,0);
modules.forEach((g,i)=>{g.position.y=THREE.MathUtils.lerp(g.position.y,progress*Math.sin(i+1)*1.3,.04);});signal.position.x=-6+(Math.sin(time)+1)*6.5;signal.rotation.y=time*2;signal.rotation.z=time;renderer.render(scene,camera);if(mode==='ascii')renderASCII();}
requestAnimationFrame(frame);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();document.getElementById('scene-fallback').hidden=false;ascii.hidden=true;});
return{setMode(m){mode=m;ascii.hidden=m!=='ascii';canvas.style.opacity=m==='ascii'?'0':'1';document.getElementById('scene-caption-state').textContent={solid:'001 — EXTERIOR',ascii:'002 — SIGNAL VIEW',plan:'003 — FLOOR PLAN'}[m];}};
}
