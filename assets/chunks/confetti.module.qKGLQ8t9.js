var R={};(function _(M,T,B,I){var k=!!(M.Worker&&M.Blob&&M.Promise&&M.OffscreenCanvas&&M.OffscreenCanvasRenderingContext2D&&M.HTMLCanvasElement&&M.HTMLCanvasElement.prototype.transferControlToOffscreen&&M.URL&&M.URL.createObjectURL),A=typeof Path2D=="function"&&typeof DOMMatrix=="function",V=function(){if(!M.OffscreenCanvas)return!1;var e=new OffscreenCanvas(1,1),r=e.getContext("2d");r.fillRect(0,0,1,1);var a=e.transferToImageBitmap();try{r.createPattern(a,"no-repeat")}catch{return!1}return!0}();function L(){}function P(e){var r=T.exports.Promise,a=r!==void 0?r:M.Promise;return typeof a=="function"?new a(e):(e(L,L),null)}var x=function(e,r){return{transform:function(a){if(e)return a;if(r.has(a))return r.get(a);var t=new OffscreenCanvas(a.width,a.height),o=t.getContext("2d");return o.drawImage(a,0,0),r.set(a,t),t},clear:function(){r.clear()}}}(V,new Map),F=function(){var e=Math.floor(16.666666666666668),r,a,t={},o=0;return typeof requestAnimationFrame=="function"&&typeof cancelAnimationFrame=="function"?(r=function(i){var l=Math.random();return t[l]=requestAnimationFrame(function n(s){o===s||o+e-1<s?(o=s,delete t[l],i()):t[l]=requestAnimationFrame(n)}),l},a=function(i){t[i]&&cancelAnimationFrame(t[i])}):(r=function(i){return setTimeout(i,e)},a=function(i){return clearTimeout(i)}),{frame:r,cancel:a}}(),Z=function(){var e,r,a={};function t(o){function i(l,n){o.postMessage({options:l||{},callback:n})}o.init=function(n){var s=n.transferControlToOffscreen();o.postMessage({canvas:s},[s])},o.fire=function(n,s,h){if(r)return i(n,null),r;var d=Math.random().toString(36).slice(2);return r=P(function(u){function f(m){m.data.callback===d&&(delete a[d],o.removeEventListener("message",f),r=null,x.clear(),h(),u())}o.addEventListener("message",f),i(n,d),a[d]=f.bind(null,{data:{callback:d}})}),r},o.reset=function(){o.postMessage({reset:!0});for(var n in a)a[n](),delete a[n]}}return function(){if(e)return e;if(!B&&k){var o=["var CONFETTI, SIZE = {}, module = {};","("+_.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI && CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join(`
`);try{e=new Worker(URL.createObjectURL(new Blob([o])))}catch(i){return typeof console!==void 0&&typeof console.warn=="function"&&console.warn("🎊 Could not load worker",i),null}t(e)}return e}}(),q={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function H(e,r){return r?r(e):e}function G(e){return e!=null}function v(e,r,a){return H(e&&G(e[r])?e[r]:q[r],a)}function J(e){return e<0?0:Math.floor(e)}function K(e,r){return Math.floor(Math.random()*(r-e))+e}function E(e){return parseInt(e,16)}function Q(e){return e.map($)}function $(e){var r=String(e).replace(/[^0-9a-f]/gi,"");return r.length<6&&(r=r[0]+r[0]+r[1]+r[1]+r[2]+r[2]),{r:E(r.substring(0,2)),g:E(r.substring(2,4)),b:E(r.substring(4,6))}}function X(e){var r=v(e,"origin",Object);return r.x=v(r,"x",Number),r.y=v(r,"y",Number),r}function Y(e){e.width=document.documentElement.clientWidth,e.height=document.documentElement.clientHeight}function rr(e){var r=e.getBoundingClientRect();e.width=r.width,e.height=r.height}function er(e){var r=document.createElement("canvas");return r.style.position="fixed",r.style.top="0px",r.style.left="0px",r.style.pointerEvents="none",r.style.zIndex=e,r}function ar(e,r,a,t,o,i,l,n,s){e.save(),e.translate(r,a),e.rotate(i),e.scale(t,o),e.arc(0,0,1,l,n,s),e.restore()}function nr(e){var r=e.angle*(Math.PI/180),a=e.spread*(Math.PI/180);return{x:e.x,y:e.y,wobble:Math.random()*10,wobbleSpeed:Math.min(.11,Math.random()*.1+.05),velocity:e.startVelocity*.5+Math.random()*e.startVelocity,angle2D:-r+(.5*a-Math.random()*a),tiltAngle:(Math.random()*(.75-.25)+.25)*Math.PI,color:e.color,shape:e.shape,tick:0,totalTicks:e.ticks,decay:e.decay,drift:e.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:e.gravity*3,ovalScalar:.6,scalar:e.scalar,flat:e.flat}}function tr(e,r){r.x+=Math.cos(r.angle2D)*r.velocity+r.drift,r.y+=Math.sin(r.angle2D)*r.velocity+r.gravity,r.velocity*=r.decay,r.flat?(r.wobble=0,r.wobbleX=r.x+10*r.scalar,r.wobbleY=r.y+10*r.scalar,r.tiltSin=0,r.tiltCos=0,r.random=1):(r.wobble+=r.wobbleSpeed,r.wobbleX=r.x+10*r.scalar*Math.cos(r.wobble),r.wobbleY=r.y+10*r.scalar*Math.sin(r.wobble),r.tiltAngle+=.1,r.tiltSin=Math.sin(r.tiltAngle),r.tiltCos=Math.cos(r.tiltAngle),r.random=Math.random()+2);var a=r.tick++/r.totalTicks,t=r.x+r.random*r.tiltCos,o=r.y+r.random*r.tiltSin,i=r.wobbleX+r.random*r.tiltCos,l=r.wobbleY+r.random*r.tiltSin;if(e.fillStyle="rgba("+r.color.r+", "+r.color.g+", "+r.color.b+", "+(1-a)+")",e.beginPath(),A&&r.shape.type==="path"&&typeof r.shape.path=="string"&&Array.isArray(r.shape.matrix))e.fill(ir(r.shape.path,r.shape.matrix,r.x,r.y,Math.abs(i-t)*.1,Math.abs(l-o)*.1,Math.PI/10*r.wobble));else if(r.shape.type==="bitmap"){var n=Math.PI/10*r.wobble,s=Math.abs(i-t)*.1,h=Math.abs(l-o)*.1,d=r.shape.bitmap.width*r.scalar,u=r.shape.bitmap.height*r.scalar,f=new DOMMatrix([Math.cos(n)*s,Math.sin(n)*s,-Math.sin(n)*h,Math.cos(n)*h,r.x,r.y]);f.multiplySelf(new DOMMatrix(r.shape.matrix));var m=e.createPattern(x.transform(r.shape.bitmap),"no-repeat");m.setTransform(f),e.globalAlpha=1-a,e.fillStyle=m,e.fillRect(r.x-d/2,r.y-u/2,d,u),e.globalAlpha=1}else if(r.shape==="circle")e.ellipse?e.ellipse(r.x,r.y,Math.abs(i-t)*r.ovalScalar,Math.abs(l-o)*r.ovalScalar,Math.PI/10*r.wobble,0,2*Math.PI):ar(e,r.x,r.y,Math.abs(i-t)*r.ovalScalar,Math.abs(l-o)*r.ovalScalar,Math.PI/10*r.wobble,0,2*Math.PI);else if(r.shape==="star")for(var c=Math.PI/2*3,g=4*r.scalar,p=8*r.scalar,y=r.x,w=r.y,C=5,b=Math.PI/C;C--;)y=r.x+Math.cos(c)*p,w=r.y+Math.sin(c)*p,e.lineTo(y,w),c+=b,y=r.x+Math.cos(c)*g,w=r.y+Math.sin(c)*g,e.lineTo(y,w),c+=b;else e.moveTo(Math.floor(r.x),Math.floor(r.y)),e.lineTo(Math.floor(r.wobbleX),Math.floor(o)),e.lineTo(Math.floor(i),Math.floor(l)),e.lineTo(Math.floor(t),Math.floor(r.wobbleY));return e.closePath(),e.fill(),r.tick<r.totalTicks}function or(e,r,a,t,o){var i=r.slice(),l=e.getContext("2d"),n,s,h=P(function(d){function u(){n=s=null,l.clearRect(0,0,t.width,t.height),x.clear(),o(),d()}function f(){B&&!(t.width===I.width&&t.height===I.height)&&(t.width=e.width=I.width,t.height=e.height=I.height),!t.width&&!t.height&&(a(e),t.width=e.width,t.height=e.height),l.clearRect(0,0,t.width,t.height),i=i.filter(function(m){return tr(l,m)}),i.length?n=F.frame(f):u()}n=F.frame(f),s=u});return{addFettis:function(d){return i=i.concat(d),h},canvas:e,promise:h,reset:function(){n&&F.cancel(n),s&&s()}}}function N(e,r){var a=!e,t=!!v(r||{},"resize"),o=!1,i=v(r,"disableForReducedMotion",Boolean),l=k&&!!v(r||{},"useWorker"),n=l?Z():null,s=a?Y:rr,h=e&&n?!!e.__confetti_initialized:!1,d=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion)").matches,u;function f(c,g,p){for(var y=v(c,"particleCount",J),w=v(c,"angle",Number),C=v(c,"spread",Number),b=v(c,"startVelocity",Number),cr=v(c,"decay",Number),hr=v(c,"gravity",Number),ur=v(c,"drift",Number),j=v(c,"colors",Q),dr=v(c,"ticks",Number),D=v(c,"shapes"),fr=v(c,"scalar"),vr=!!v(c,"flat"),U=X(c),z=y,O=[],mr=e.width*U.x,gr=e.height*U.y;z--;)O.push(nr({x:mr,y:gr,angle:w,spread:C,startVelocity:b,color:j[z%j.length],shape:D[K(0,D.length)],ticks:dr,decay:cr,gravity:hr,drift:ur,scalar:fr,flat:vr}));return u?u.addFettis(O):(u=or(e,O,s,g,p),u.promise)}function m(c){var g=i||v(c,"disableForReducedMotion",Boolean),p=v(c,"zIndex",Number);if(g&&d)return P(function(b){b()});a&&u?e=u.canvas:a&&!e&&(e=er(p),document.body.appendChild(e)),t&&!h&&s(e);var y={width:e.width,height:e.height};n&&!h&&n.init(e),h=!0,n&&(e.__confetti_initialized=!0);function w(){if(n){var b={getBoundingClientRect:function(){if(!a)return e.getBoundingClientRect()}};s(b),n.postMessage({resize:{width:b.width,height:b.height}});return}y.width=y.height=null}function C(){u=null,t&&(o=!1,M.removeEventListener("resize",w)),a&&e&&(document.body.contains(e)&&document.body.removeChild(e),e=null,h=!1)}return t&&!o&&(o=!0,M.addEventListener("resize",w,!1)),n?n.fire(c,y,C):f(c,y,C)}return m.reset=function(){n&&n.reset(),u&&u.reset()},m}var S;function W(){return S||(S=N(null,{useWorker:!0,resize:!0})),S}function ir(e,r,a,t,o,i,l){var n=new Path2D(e),s=new Path2D;s.addPath(n,new DOMMatrix(r));var h=new Path2D;return h.addPath(s,new DOMMatrix([Math.cos(l)*o,Math.sin(l)*o,-Math.sin(l)*i,Math.cos(l)*i,a,t])),h}function lr(e){if(!A)throw new Error("path confetti are not supported in this browser");var r,a;typeof e=="string"?r=e:(r=e.path,a=e.matrix);var t=new Path2D(r),o=document.createElement("canvas"),i=o.getContext("2d");if(!a){for(var l=1e3,n=l,s=l,h=0,d=0,u,f,m=0;m<l;m+=2)for(var c=0;c<l;c+=2)i.isPointInPath(t,m,c,"nonzero")&&(n=Math.min(n,m),s=Math.min(s,c),h=Math.max(h,m),d=Math.max(d,c));u=h-n,f=d-s;var g=10,p=Math.min(g/u,g/f);a=[p,0,0,p,-Math.round(u/2+n)*p,-Math.round(f/2+s)*p]}return{type:"path",path:r,matrix:a}}function sr(e){var r,a=1,t="#000000",o='"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';typeof e=="string"?r=e:(r=e.text,a="scalar"in e?e.scalar:a,o="fontFamily"in e?e.fontFamily:o,t="color"in e?e.color:t);var i=10*a,l=""+i+"px "+o,n=new OffscreenCanvas(i,i),s=n.getContext("2d");s.font=l;var h=s.measureText(r),d=Math.ceil(h.actualBoundingBoxRight+h.actualBoundingBoxLeft),u=Math.ceil(h.actualBoundingBoxAscent+h.actualBoundingBoxDescent),f=2,m=h.actualBoundingBoxLeft+f,c=h.actualBoundingBoxAscent+f;d+=f+f,u+=f+f,n=new OffscreenCanvas(d,u),s=n.getContext("2d"),s.font=l,s.fillStyle=t,s.fillText(r,m,c);var g=1/a;return{type:"bitmap",bitmap:n.transferToImageBitmap(),matrix:[g,0,0,g,-d*g/2,-u*g/2]}}T.exports=function(){return W().apply(this,arguments)},T.exports.reset=function(){W().reset()},T.exports.create=N,T.exports.shapeFromPath=lr,T.exports.shapeFromText=sr})(function(){return typeof window<"u"?window:typeof self<"u"?self:this||{}}(),R,!1);const Mr=R.exports;R.exports.create;export{Mr as default};
