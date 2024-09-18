import{r as w,W as d,C,T as k,u as m,S as M,a as y}from"./index-7ad4039a.js";const P=f=>{const S=d.gameplay.pixiStage.effectsContainer,l=d.gameplay.pixiStage.currentApp,e=new C;S.addChild(e);const a=k.from("./game/tex/cherryBlossoms.png");e.x=l.screen.width/2,e.y=l.screen.height/2,e.pivot.x=e.width/2,e.pivot.y=e.height/2,e.scale.x=1,e.scale.y=1;const o=[];function p(h){const c=m().width||y.width,g=m().height||y.height,r=new M(a);let s=.25;r.scale.x=.15*s,r.scale.y=.15*s,r.anchor.set(.5),r.x=Math.random()*c-.5*c,r.y=0-.5*g,r.dropSpeed=Math.random()*5,r.acc=Math.random(),e.addChild(r),o.push(r);let i=0;for(const t of o){i++;const n=Math.random();t.dropSpeed=t.acc*.01+t.dropSpeed,t.y+=h*f*t.dropSpeed*.3+.7,i%2===0?(t.x+=h*n*.5,t.rotation+=h*n*.03):(t.x-=h*n*.5,t.rotation-=h*n*.03)}o.length>=200&&(o.unshift(),e.removeChild(e.children[0]))}return d.gameplay.pixiStage.registerAnimation({setStartState:()=>{},setEndState:()=>{},tickerFunc:p},"cherryBlossoms-Ticker"),{container:e,tickerKey:"cherryBlossoms-Ticker"}};w("cherryBlossoms",()=>P(3));const T=(f,u)=>{var c;const l=d.gameplay.pixiStage.effectsContainer,e=d.gameplay.pixiStage.currentApp,a=new C;l.addChild(a);const o=k.from("./game/tex/raindrop.png");a.x=e.screen.width/2,a.y=e.screen.height/2,a.pivot.x=a.width/2,a.pivot.y=a.height/2,a.scale.x=1,a.scale.y=1;const p=[];function h(g){const r=m().width||y.width,s=m().height||y.height;for(let i=0;i<u;i++){const t=new M(o);let n=Math.random();n<=.5&&(n=.5),t.scale.x=.48*n,t.scale.y=.48*n,t.anchor.set(.5),t.x=Math.random()*r-.5*r,t.y=0-.5*s,t.dropSpeed=Math.random()*2,t.acc=Math.random(),t.alpha=Math.random(),t.alpha>=.5&&(t.alpha=.5),t.alpha<=.2&&(t.alpha=.2),a.addChild(t),p.push(t)}for(const i of p)i.dropSpeed=i.acc*.01+i.dropSpeed,i.y+=g*f*i.dropSpeed*1.1+3;p.length>=2500&&(p.unshift(),a.removeChild(a.children[0]))}return(c=d.gameplay.pixiStage)==null||c.registerAnimation({setStartState:()=>{},setEndState:()=>{},tickerFunc:h},"rain-Ticker"),{container:a,tickerKey:"rain-Ticker"}};w("rain",()=>T(6,10));const b=f=>{var h;const S=d.gameplay.pixiStage.effectsContainer,l=d.gameplay.pixiStage.currentApp,e=new C;S.addChild(e);const a=k.from("./game/tex/snowFlake_min.png");e.x=l.screen.width/2,e.y=l.screen.height/2,e.pivot.x=e.width/2,e.pivot.y=e.height/2,e.scale.x=1,e.scale.y=1;const o=[];function p(c){const g=m().width||y.width,r=m().height||y.height,s=new M(a);let i=Math.random();i<=.5&&(i=.5),s.scale.x=.144*i,s.scale.y=.144*i,s.anchor.set(.5),s.x=Math.random()*g-.5*g,s.y=0-.5*r,s.dropSpeed=Math.random()*2,s.acc=Math.random(),e.addChild(s),o.push(s);let t=0;for(const n of o){t++;const x=Math.random();n.dropSpeed=n.acc*.01+n.dropSpeed,n.y+=c*f*n.dropSpeed*.3+.7,t%2===0?(n.x+=c*x*.5,n.rotation+=c*x*.03):(n.x-=c*x*.5,n.rotation-=c*x*.03)}o.length>=500&&(o.unshift(),e.removeChild(e.children[0]))}return(h=d.gameplay.pixiStage)==null||h.registerAnimation({setStartState:()=>{},setEndState:()=>{},tickerFunc:p},"snow-Ticker"),{container:e,tickerKey:"snow-Ticker"}};w("snow",()=>b(3));
