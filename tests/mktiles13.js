const gvt=require('geojson-vt'),vtpbf=require('vt-pbf'),fs=require('fs');
const LNG=-73.9857,LAT=40.7484,mLat=1/111320,mLng=1/(111320*Math.cos(LAT*Math.PI/180));
const P=(x,y)=>[LNG+x*mLng,LAT-y*mLat]; // y south
const fc=f=>({type:'FeatureCollection',features:f});
const roads=[],bld=[],water=[];
const R=4500;
for(let y=-R;y<=R;y+=80)roads.push({type:'Feature',properties:{class:'minor'},geometry:{type:'LineString',coordinates:[P(-R,y),P(R,y)]}});
for(let x=-R;x<=R;x+=250)roads.push({type:'Feature',properties:{class:'primary'},geometry:{type:'LineString',coordinates:[P(x,-R),P(x,R)]}});
for(const y of [-800,0,800])roads.push({type:'Feature',properties:{class:'primary',brunnel:'bridge'},geometry:{type:'LineString',coordinates:[P(545,y),P(705,y)]}});
roads.push({type:'Feature',properties:{class:'rail'},geometry:{type:'LineString',coordinates:[P(-R,-R),P(R,R)]}});
for(let y=-R;y<R;y+=80)for(let x=-R;x<R;x+=250){const a=x+12,b=x+238,c=y+9,d=y+71;
  bld.push({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[P(a,c),P(b,c),P(b,d),P(a,d),P(a,c)]]}});}
water.push({type:'Feature',properties:{class:'river'},geometry:{type:'Polygon',coordinates:[[P(560,-R),P(690,-R),P(690,R),P(560,R),P(560,-R)]]}});
const idx={transportation:gvt(fc(roads),{maxZoom:14,indexMaxZoom:14}),building:gvt(fc(bld),{maxZoom:14,indexMaxZoom:14}),water:gvt(fc(water),{maxZoom:14,indexMaxZoom:14})};
fs.mkdirSync('tiles',{recursive:true});let c=0;
const n=16384,tx0=Math.floor((LNG+180)/360*n);const s=Math.sin(LAT*Math.PI/180),ty0=Math.floor((0.5-Math.log((1+s)/(1-s))/(4*Math.PI))*n);
const Z=13,n2=8192,tx1=Math.floor((LNG+180)/360*n2),ty1=Math.floor((0.5-Math.log((1+s)/(1-s))/(4*Math.PI))*n2);for(let x=tx1-2;x<=tx1+2;x++)for(let y=ty1-2;y<=ty1+2;y++){const L={};for(const k in idx){const t=idx[k].getTile(Z,x,y);if(t)L[k]=t;}
  if(Object.keys(L).length){fs.writeFileSync(`tiles/13_${x}_${y}.pbf`,vtpbf.fromGeojsonVt(L,{version:2}));c++;}}
console.log('tiles',c);
