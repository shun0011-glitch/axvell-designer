// Sample the same cubic paths used by the visible boundaries and export clips.
const cowlRingCache=new Map();
function cowlRings(path){
 if(cowlRingCache.has(path))return cowlRingCache.get(path);
 const tokens=(path||'').match(/[MLCQZ]|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g)||[];
 const rings=[];let ring=[],i=0,current={x:0,y:0},start=null;
 const point=()=>({x:Number(tokens[i++]),y:Number(tokens[i++])});
 while(i<tokens.length){
  const command=tokens[i++];
  if(command==='M'){if(ring.length)rings.push(ring);ring=[];current=point();start=current;ring.push(current)}
  else if(command==='L'){current=point();ring.push(current)}
  else if(command==='C'){
   const p=current,c1=point(),c2=point(),q=point();
   const length=Math.hypot(c1.x-p.x,c1.y-p.y)+Math.hypot(c2.x-c1.x,c2.y-c1.y)+Math.hypot(q.x-c2.x,q.y-c2.y);
   const steps=Math.max(3,Math.ceil(length/3));
   for(let j=1;j<=steps;j++){const t=j/steps,u=1-t;ring.push({x:u*u*u*p.x+3*u*u*t*c1.x+3*u*t*t*c2.x+t*t*t*q.x,y:u*u*u*p.y+3*u*u*t*c1.y+3*u*t*t*c2.y+t*t*t*q.y})}
   current=q;
  }else if(command==='Q'){
   const p=current,c=point(),q=point(),steps=Math.max(3,Math.ceil((Math.hypot(c.x-p.x,c.y-p.y)+Math.hypot(q.x-c.x,q.y-c.y))/3));
   for(let j=1;j<=steps;j++){const t=j/steps,u=1-t;ring.push({x:u*u*p.x+2*u*t*c.x+t*t*q.x,y:u*u*p.y+2*u*t*c.y+t*t*q.y})}current=q;
  }else if(command==='Z'){if(ring.length){rings.push(ring);ring=[]}current=start||current}
  else throw new Error('Unsupported cowl path command');
 }
 if(ring.length)rings.push(ring);if(cowlRingCache.size>150)cowlRingCache.clear();cowlRingCache.set(path,rings);return rings;
}
function cowlSignature(value){let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16)}
function isPreviousCowlPreset(panel,body,view){
 const versions=[COWL_PREVIOUS_SIGNATURES,COWL_PREVIOUS_SIGNATURES_V2,COWL_PREVIOUS_SIGNATURES_V3];
 return versions.some(version=>{const previous=version[body]?.[view]?.[panel.id];return Boolean(previous&&cowlSignature(JSON.stringify(panel.points))===previous.points&&(!panel.surfacePath||cowlSignature(panel.surfacePath)===previous.path))});
}
