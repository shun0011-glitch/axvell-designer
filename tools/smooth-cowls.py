"""Rebuild smooth body masks from approved photographs and hand-traced part guides.
Dependencies: numpy, scipy, opencv-python-headless, Pillow.
"""
from pathlib import Path
import json,re
import cv2,numpy as np
from scipy import ndimage
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parent.parent
GUIDES=json.loads((ROOT/'tools/cowl-traces.json').read_text())
old=json.loads(re.search(r'const COWL_PANEL_PRESETS=(.*);\n',(ROOT/'cowl-presets.js').read_text()).group(1))
VIEWS={'sideA':'side-a','sideB':'side-b','frontA':'front-a','frontB':'front-b'}
PAINT={'tail','seat','tank','nose','upper','side','fender'}
W,H=1448,1086

def polygon(points):
 m=np.zeros((H,W),np.uint8);cv2.fillPoly(m,[np.int32(points)],255);return m

def align(source,target):
 sift=cv2.SIFT_create(nfeatures=5000)
 k1,d1=sift.detectAndCompute(cv2.cvtColor(source,cv2.COLOR_BGR2GRAY),None);k2,d2=sift.detectAndCompute(cv2.cvtColor(target,cv2.COLOR_BGR2GRAY),None)
 matches=[m for m,n in cv2.BFMatcher().knnMatch(d1,d2,k=2) if m.distance<.67*n.distance]
 matches=[m for m in matches if 120<k1[m.queryIdx].pt[0]<1360 and 120<k1[m.queryIdx].pt[1]<920 and np.linalg.norm(np.array(k1[m.queryIdx].pt)-k2[m.trainIdx].pt)<45]
 a=np.float32([k1[m.queryIdx].pt for m in matches]);b=np.float32([k2[m.trainIdx].pt for m in matches]);mat,inside=cv2.estimateAffinePartial2D(a,b,method=cv2.RANSAC,ransacReprojThreshold=3,maxIters=5000)
 if mat is None:raise RuntimeError('No registration')
 a=a[inside.ravel()>0];b=b[inside.ravel()>0];residual=b-cv2.transform(a[None],mat)[0]
 def transform(points):
  points=np.asarray(points,np.float32);out=cv2.transform(points[None],mat)[0]
  for i,p in enumerate(points):
   distance=np.linalg.norm(a-p,axis=1);order=np.argsort(distance)[:16];weight=np.exp(-(distance[order]/120)**2)
   if weight.sum()>.1:out[i]+=np.sum(residual[order]*weight[:,None],axis=0)/weight.sum()
  return np.round(out.astype(float),2)
 return transform,len(a)

def curves(mask,transform=lambda points:np.array(points,float)):
 # Smooth the signed surface boundary before vectorization. Keep deliberate holes.
 signed=ndimage.distance_transform_edt(mask>0)-ndimage.distance_transform_edt(mask==0)
 filtered=ndimage.gaussian_filter(signed,1.25)>0
 contours,hierarchy=cv2.findContours(filtered.astype(np.uint8)*255,cv2.RETR_TREE,cv2.CHAIN_APPROX_NONE)
 pieces=[];sampled=[]
 for contour in contours:
  if abs(cv2.contourArea(contour))<95:continue
  points=cv2.approxPolyDP(contour,1.25,True).reshape(-1,2)
  if len(points)<3:continue
  points=transform(points.tolist());n=len(points);controls=[]
  for i,p in enumerate(points):
   prev=points[(i-1)%n];nxt=points[(i+1)%n];a=p-prev;b=nxt-p
   angle=np.arccos(np.clip(np.dot(a,b)/(np.linalg.norm(a)*np.linalg.norm(b)+1e-8),-1,1))
   tangent=(nxt-prev)/6
   # Real seams and corners stay sharp; gradual body curves use cubic tangents.
   if angle>np.deg2rad(48):tangent*=0
   limit=min(np.linalg.norm(a),np.linalg.norm(b))*.35
   length=np.linalg.norm(tangent)
   if length>limit:tangent*=limit/length
   controls.append(tangent)
  fmt=lambda p:f'{p[0]:.2f},{p[1]:.2f}'
  d='M'+fmt(points[0]);samples=[]
  for i,p in enumerate(points):
   j=(i+1)%n;q=points[j];c1=p+controls[i];c2=q-controls[j]
   d+=' C'+fmt(c1)+' '+fmt(c2)+' '+fmt(q)
   for t in np.linspace(0,1,max(3,int(np.linalg.norm(q-p)/2)+1))[:-1]:
    samples.append(((1-t)**3*p+3*(1-t)**2*t*c1+3*(1-t)*t*t*c2+t**3*q).tolist())
  pieces.append(d+' Z');sampled.append(samples)
 return ' '.join(pieces),sampled

presets={c:{} for c in ['green','white','black']};masks={c:{} for c in presets};review=Image.new('RGB',(W*3,H*4));stats={}
for row,(view,guide) in enumerate(GUIDES.items()):
 source=cv2.imread(str(ROOT/'assets'/f'{VIEWS[view]}-green.webp'))
 hsv=cv2.cvtColor(source,cv2.COLOR_BGR2HSV);chroma=cv2.inRange(hsv,np.array([29,42,32]),np.array([95,255,255]))
 supports={pid:polygon(points) for pid,points in guide.items()}
 paint_support=np.maximum.reduce([supports[pid] for pid in PAINT]);allowed=cv2.dilate(paint_support,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(37,37)))
 paint=cv2.bitwise_and(chroma,allowed);paint=cv2.morphologyEx(paint,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(3,3)))
 count,labels,areas,_=cv2.connectedComponentsWithStats(paint)
 cleaned=np.zeros_like(paint)
 for i in range(1,count):
  region=labels==i
  if areas[i,cv2.CC_STAT_AREA]>180 and np.count_nonzero(region&(paint_support>0))>80:cleaned[region]=255
 holes=ndimage.binary_fill_holes(cleaned>0)&(cleaned==0);hl,n=ndimage.label(holes);sizes=np.bincount(hl.ravel())
 # Specular highlights are paint. Keep lamps, indicator housings, grille and bolt access holes.
 for i in range(1,n+1):
  if sizes[i]<1150:cleaned[hl==i]=255
 caps={'sideA':None,'sideB':(665,239,34,8),'frontA':(780,187,34,9),'frontB':(665,179,36,10)}
 if caps[view]:
  x,y,rx,ry=caps[view];cv2.ellipse(cleaned,(x,y),(rx,ry),0,0,360,0,-1)
 # Ownership comes from the guides. The exterior comes from the whole painted region,
 # including valid paint extending beyond the older guide polygons.
 paint_ids=[pid for pid in guide if pid in PAINT]
 distances=np.array([ndimage.distance_transform_edt(supports[pid]==0) for pid in paint_ids]);owner=np.argmin(distances,axis=0)
 parts={pid:np.where((owner==i)&(cleaned>0),255,0).astype(np.uint8) for i,pid in enumerate(paint_ids)}
 occupied=cleaned.copy()
 for pid in ['middle','under']:
  m=supports[pid].copy();m[occupied>0]=0;parts[pid]=m;occupied=np.maximum(occupied,m)
 for col,body in enumerate(['green','white','black']):
  target=cv2.imread(str(ROOT/'assets'/f'{VIEWS[view]}-{body}.webp'))
  if body=='green':transform=lambda p:np.array(p,float);matches=0
  else:transform,matches=align(source,target)
  masks[body][view],outer=curves(occupied,transform)
  items=[];preview=Image.fromarray(cv2.cvtColor(target,cv2.COLOR_BGR2RGB));draw=ImageDraw.Draw(preview)
  for pid in guide:
   original=next(p for p in old['green'][view] if p['id']==pid)
   d,samples=curves(parts[pid],transform)
   points=transform(guide[pid]);items.append({'id':pid,'name':original['name'],'points':[{'x':float(x),'y':float(y)} for x,y in points],'surfacePath':d})
   for ring in samples:draw.line([tuple(p) for p in ring]+[tuple(ring[0])],fill=(0,170,255),width=2)
  presets[body][view]=items;masks[body][view]=' '.join(p['surfacePath'] for p in items);draw.text((25,25),f'{body} / {view}',fill='red');review.paste(preview,(col*W,row*H));stats[f'{body}:{view}']={'matched_features':matches,'parts':len(items),'cubic_segments':sum(i['surfacePath'].count(' C') for i in items)}
# Cubic paths are sampled at runtime for bounds and selection.
(ROOT/'cowl-presets.js').write_text('// Smooth cubic boundaries fitted to the approved photographs.\nconst COWL_PRESET_VERSION=2;\nconst COWL_MASKS='+json.dumps(masks,separators=(',',':'))+';\nconst COWL_PANEL_PRESETS='+json.dumps(presets,separators=(',',':'))+';\nconst COWL_PREVIOUS_SIGNATURES='+(ROOT/'tools/cowl-signatures-v1.json').read_text()+';\nfunction fairingMask(view=state.view,body=state.body){return COWL_MASKS[body]?.[view]||FAIRING_MASKS[view]||""}\n')
review.resize((2172,2172)).save('/tmp/smooth-cowl-review.jpg');print(json.dumps(stats))
