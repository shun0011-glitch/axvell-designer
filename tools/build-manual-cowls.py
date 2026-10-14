"""Build body-only masks from manually traced SVG paths, with explicit hardware cutouts.
Requires numpy, scipy, opencv-python-headless, shapely and Pillow.
"""
from pathlib import Path
import re,json
import cv2,numpy as np
from shapely.geometry import Polygon,GeometryCollection,LineString
from shapely.ops import unary_union
from shapely import make_valid,points as geometry_points,distance
ROOT=Path(__file__).resolve().parent.parent
paths=json.loads((ROOT/'tools/manual-cowl-paths.json').read_text())
reference=json.loads((ROOT/'tools/ai-reference-front-a.json').read_text())
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
 n=len(pts);tangents=[]
 for i,p in enumerate(pts):
  a=p-pts[(i-1)%n];b=pts[(i+1)%n]-p;cos=np.dot(a,b)/(np.linalg.norm(a)*np.linalg.norm(b)+1e-9);angle=np.arccos(np.clip(cos,-1,1));t=(pts[(i+1)%n]-pts[(i-1)%n])/6
  if angle>np.deg2rad(48):t*=0
  length=np.linalg.norm(t);limit=min(np.linalg.norm(a),np.linalg.norm(b))*.35
  if length>limit:t*=limit/length
  tangents.append(t)
 # Round gradual turns while staying within 2.25 px of the supplied contour.
 # Actual panel corners retain their sharp joins. Work before color alignment.
 boundary=LineString(coords)
 for _ in range(10):
  adjusted=False
  for i,p in enumerate(pts):
   j=(i+1)%n;q=pts[j];c1=p+tangents[i];c2=q-tangents[j]
   t=np.linspace(0,1,25)[:,None];u=1-t
   samples=u*u*u*p+3*u*u*t*c1+3*u*t*t*c2+t*t*t*q
   if np.max(distance(geometry_points(samples),boundary))>2.25:
    tangents[i]*=.65;tangents[j]*=.65;adjusted=True
  if not adjusted:break
 fmt=lambda p:f'{p[0]:.2f},{p[1]:.2f}'
 d='M'+fmt(transform([pts[0]])[0])
 for i,p in enumerate(pts):
  j=(i+1)%n;c1,c2,q=transform([p+tangents[i],pts[j]-tangents[j],pts[j]])
  d+=' C'+fmt(c1)+' '+fmt(c2)+' '+fmt(q)
 return d+' Z'
def vector(geometry,transform):
 return ' '.join(curve(poly.exterior.coords,transform)+' '+' '.join(curve(hole.coords,transform) for hole in poly.interiors) for poly in polygonal(geometry) if poly.area>35)
def signature(value):
 h=2166136261
 for ch in value:h=((h^ord(ch))*16777619)&0xffffffff
 return hex(h)[2:]
# Keep earlier stock signatures so saved stock shapes upgrade, while edits survive.
sigs={}
for body,views in old.items():
 sigs[body]={}
 for view,panels in views.items():
  sigs[body][view]={p['id']:{'path':signature(p['surfacePath']),'points':signature(json.dumps(p['points'],separators=(',',':')))} for p in panels}
# JS stringifies integral floats without .0; calculate signatures through the helper exported JSON.
if (ROOT/'tools/cowl-signatures-v2.json').exists():sigs=json.loads((ROOT/'tools/cowl-signatures-v2.json').read_text())
presets={body:{} for body in ['green','white','black']};masks={body:{} for body in presets}
exclusions=json.loads((ROOT/'tools/manual-cowl-exclusions.json').read_text())
openings=json.loads((ROOT/'tools/manual-cowl-openings.json').read_text())
for view,parts in paths.items():
 excluded=unary_union([make_valid(Polygon(rings(path)[0][0])).buffer(2.5) for path in exclusions[view]])
 # Air channels share their exact painted edges. Only small hardware gets a buffer.
 excluded=unary_union([excluded,*[make_valid(Polygon(rings(path)[0][0])) for path in openings[view]]])
 geometries={};anchors={};claimed=GeometryCollection()
 # The main painted panel owns its photographic exterior, including the area
 # beside the air channel that older upper-cowl guides overlapped.
 if view==reference['view']:
  parts={pid:' '.join([part['exterior'],*part['holes']]) for pid,part in reference['parts'].items()}
  excluded=GeometryCollection()
 order=[pid for pid in ['tail','seat','tank','nose','side','upper','middle','under','fender'] if pid in parts]
 for pid in order:
  path=parts[pid]
  parsed,allanchors=rings(path);surface=make_valid(Polygon(parsed[0]))
  for hole in parsed[1:]:surface=surface.difference(make_valid(Polygon(hole)))
  surface=make_valid(surface).difference(excluded).difference(claimed)
  geometries[pid]=surface;anchors[pid]=allanchors;claimed=unary_union([claimed,surface])
 # These are continuous physical panels, not separate print pieces.
 for target,retired in [('tail','seat'),('under','middle')]:
  if retired in geometries:
   geometries[target]=unary_union([geometries[target],geometries.pop(retired)])
 output_order=['tail','tank','nose','upper','side','under','fender']
 source=cv2.imread(str(ROOT/'assets'/f'{names[view]}-green.webp'))
 for body in presets:
  if body=='green':transform=lambda points:np.array(points,float)
  else:transform,_=align(source,cv2.imread(str(ROOT/'assets'/f'{names[view]}-{body}.webp')))
  entries=[]
  for pid in output_order:
   g=geometries[pid]
   name=reference['parts'][pid]['name']
   exterior=max(polygonal(g),key=lambda piece:piece.area).exterior.coords
   points=transform(cv2.approxPolyDP(np.array(exterior[:-1],np.float32).reshape(-1,1,2),5,True).reshape(-1,2))
   entries.append({'id':pid,'name':name,'points':[{'x':float(x),'y':float(y)} for x,y in points],'surfacePath':vector(g,transform)})
  presets[body][view]=entries
  # The display mask has only real outer edges and openings, so independently
  # fitted partition seams cannot punch tiny gaps into a continuous design.
  masks[body][view]=vector(unary_union(list(geometries.values())),transform)
(ROOT/'cowl-presets.js').write_text('// User Illustrator reference for frontA; seven continuous physical cowls per view.\nconst COWL_PRESET_VERSION=5;\nconst COWL_MASKS='+json.dumps(masks,separators=(',',':'))+';\nconst COWL_PANEL_PRESETS='+json.dumps(presets,separators=(',',':'))+';\nconst COWL_PREVIOUS_SIGNATURES='+(ROOT/'tools/cowl-signatures-v1.json').read_text()+';\nconst COWL_PREVIOUS_SIGNATURES_V2='+json.dumps(sigs,separators=(',',':'))+';\nconst COWL_PREVIOUS_SIGNATURES_V3='+(ROOT/'tools/cowl-signatures-v3.json').read_text()+';\nconst COWL_PREVIOUS_SIGNATURES_V4='+(ROOT/'tools/cowl-signatures-v4.json').read_text()+';\nfunction fairingMask(view=state.view,body=state.body){return COWL_MASKS[body]?.[view]||FAIRING_MASKS[view]||""}\n')
print('Built',sum(len(parts) for views in presets.values() for parts in views.values()),'manually traced regions')
