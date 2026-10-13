"""Build body-only masks from manually traced SVG paths, with explicit hardware cutouts.
Requires numpy, scipy, opencv-python-headless, shapely and Pillow.
"""
from pathlib import Path
import re,json
import cv2,numpy as np
from shapely.geometry import Polygon,GeometryCollection
from shapely.ops import unary_union
from shapely import make_valid
ROOT=Path(__file__).resolve().parent.parent
paths=json.loads((ROOT/'tools/manual-cowl-paths.json').read_text())
old=json.loads(re.search(r'const COWL_PANEL_PRESETS=(.*);\n',(ROOT/'cowl-presets.js').read_text()).group(1))
names={'sideA':'side-a','sideB':'side-b','frontA':'front-a','frontB':'front-b'}
# Use structural feature registration only; surface membership is defined by the paths.
code=(ROOT/'tools/smooth-cowls.py').read_text();prefix=code[:code.index('presets={')];ns={'__file__':str(ROOT/'tools/smooth-cowls.py')};exec(prefix,ns);align=ns['align']
def rings(path):
 tok=re.findall(r'[MLCQZ]|-?\d+(?:\.\d+)?',path);i=0;out=[];ring=[];p=None;anchors=[]
 point=lambda:None
 def read():
  nonlocal i
  a=np.array([float(tok[i]),float(tok[i+1])]);i+=2;return a
 while i<len(tok):
  cmd=tok[i];i+=1
  if cmd=='M':
   if ring:out.append(ring)
   p=read();ring=[p];anchors.append(p)
  elif cmd=='L':p=read();ring.append(p);anchors.append(p)
  elif cmd in ['C','Q']:
   start=p;c1=read();c2=read() if cmd=='C' else None;q=read();anchors.append(q)
   length=np.linalg.norm(c1-start)+np.linalg.norm(q-c1) if c2 is None else np.linalg.norm(c1-start)+np.linalg.norm(c2-c1)+np.linalg.norm(q-c2)
   for t in np.linspace(0,1,max(4,int(length/.7)))[1:]:
    u=1-t;ring.append(u*u*start+2*u*t*c1+t*t*q if c2 is None else u*u*u*start+3*u*u*t*c1+3*u*t*t*c2+t*t*t*q)
   p=q
  elif cmd=='Z':
   if ring:out.append(ring);ring=[]
  else:raise ValueError(cmd)
 if ring:out.append(ring)
 return out,anchors

def polygonal(g):
 if g.is_empty:return []
 if g.geom_type=='Polygon':return [g]
 if hasattr(g,'geoms'):return [p for child in g.geoms for p in polygonal(child)]
 return []
def curve(coords,transform):
 pts=cv2.approxPolyDP(np.array(coords[:-1],np.float32).reshape(-1,1,2),.65,True).reshape(-1,2)
 pts=transform(pts);n=len(pts);tangents=[]
 for i,p in enumerate(pts):
  a=p-pts[(i-1)%n];b=pts[(i+1)%n]-p;cos=np.dot(a,b)/(np.linalg.norm(a)*np.linalg.norm(b)+1e-9);angle=np.arccos(np.clip(cos,-1,1));t=(pts[(i+1)%n]-pts[(i-1)%n])/6
  if angle>np.deg2rad(48):t*=0
  length=np.linalg.norm(t);limit=min(np.linalg.norm(a),np.linalg.norm(b))*.35
  if length>limit:t*=limit/length
  tangents.append(t)
 fmt=lambda p:f'{p[0]:.2f},{p[1]:.2f}'
 d='M'+fmt(pts[0])
 for i,p in enumerate(pts):
  j=(i+1)%n;d+=' C'+fmt(p+tangents[i])+' '+fmt(pts[j]-tangents[j])+' '+fmt(pts[j])
 return d+' Z'
def vector(geometry,transform):
 return ' '.join(curve(poly.exterior.coords,transform)+' '+' '.join(curve(hole.coords,transform) for hole in poly.interiors) for poly in polygonal(geometry) if poly.area>35)
def signature(value):
 h=2166136261
 for ch in value:h=((h^ord(ch))*16777619)&0xffffffff
 return hex(h)[2:]
# Keep both earlier stock signatures so saved stock shapes upgrade, while edits survive.
sigs={}
for body,views in old.items():
 sigs[body]={}
 for view,panels in views.items():
  sigs[body][view]={p['id']:{'path':signature(p['surfacePath']),'points':signature(json.dumps(p['points'],separators=(',',':')))} for p in panels}
# JS stringifies integral floats without .0; calculate signatures through the helper exported JSON.
if (ROOT/'tools/cowl-signatures-v2.json').exists():sigs=json.loads((ROOT/'tools/cowl-signatures-v2.json').read_text())
presets={body:{} for body in ['green','white','black']};masks={body:{} for body in presets}
exclusions=json.loads((ROOT/'tools/manual-cowl-exclusions.json').read_text())
for view,parts in paths.items():
 excluded=unary_union([make_valid(Polygon(rings(path)[0][0])).buffer(2.5) for path in exclusions[view]])
 geometries={};anchors={};claimed=GeometryCollection()
 for pid,path in parts.items():
  parsed,allanchors=rings(path);surface=make_valid(Polygon(parsed[0]))
  for hole in parsed[1:]:surface=surface.difference(make_valid(Polygon(hole)))
  surface=make_valid(surface).difference(excluded).difference(claimed)
  geometries[pid]=surface;anchors[pid]=allanchors;claimed=unary_union([claimed,surface])
 source=cv2.imread(str(ROOT/'assets'/f'{names[view]}-green.webp'))
 for body in presets:
  if body=='green':transform=lambda points:np.array(points,float)
  else:transform,_=align(source,cv2.imread(str(ROOT/'assets'/f'{names[view]}-{body}.webp')))
  entries=[]
  for pid,g in geometries.items():
   name=next(p['name'] for p in old['green'][view] if p['id']==pid)
   mainrings,_=rings(paths[view][pid].split(' Z')[0]+' Z');points=transform(cv2.approxPolyDP(np.array(mainrings[0],np.float32).reshape(-1,1,2),5,True).reshape(-1,2))
   entries.append({'id':pid,'name':name,'points':[{'x':float(x),'y':float(y)} for x,y in points],'surfacePath':vector(g,transform)})
  presets[body][view]=entries;masks[body][view]=' '.join(p['surfacePath'] for p in entries)
(ROOT/'cowl-presets.js').write_text('// Manual fairing exteriors and explicit hardware/opening cutouts.\nconst COWL_PRESET_VERSION=3;\nconst COWL_MASKS='+json.dumps(masks,separators=(',',':'))+';\nconst COWL_PANEL_PRESETS='+json.dumps(presets,separators=(',',':'))+';\nconst COWL_PREVIOUS_SIGNATURES='+(ROOT/'tools/cowl-signatures-v1.json').read_text()+';\nconst COWL_PREVIOUS_SIGNATURES_V2='+json.dumps(sigs,separators=(',',':'))+';\nfunction fairingMask(view=state.view,body=state.body){return COWL_MASKS[body]?.[view]||FAIRING_MASKS[view]||""}\n')
print('Built',sum(len(parts) for views in presets.values() for parts in views.values()),'manually traced regions')
