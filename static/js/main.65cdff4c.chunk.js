(this["webpackJsonproot-reach-calculator"]=this["webpackJsonproot-reach-calculator"]||[]).push([[0],{64:function(e,t,a){},65:function(e,t,a){},74:function(e,t,a){"use strict";a.r(t);var n=a(0),c=a.n(n),r=a(48),s=a.n(r),i=(a(64),a(11)),u=(a(65),a(100)),o=a(101),h=a(87),d=a(95),l=a(98),j=a(2),f=function(e){var t=e.requiredReach,a=e.handlePlayerCountButtonPress;return Object(j.jsxs)(h.a,{justifyContent:"center",children:[Object(j.jsx)("h4",{children:"Players"}),Object(j.jsxs)(d.a,{exclusive:!0,value:t,onChange:a,children:[Object(j.jsx)(l.a,{value:17,children:"2"}),Object(j.jsx)(l.a,{value:18,children:"3"}),Object(j.jsx)(l.a,{value:21,children:"4"}),Object(j.jsx)(l.a,{value:25,children:"5"}),Object(j.jsx)(l.a,{value:28,children:"6"})]})]})},b=a(43),m=a(97),g=a.p+"static/media/eyrie.4739ea8f.png",v=a.p+"static/media/corvid.d2562a48.png",x=a.p+"static/media/alliance.e806127f.png",O=a.p+"static/media/cult.4c81f45b.png",p=a.p+"static/media/duchy.fd1c72c5.png",y=a.p+"static/media/riverfolk.d7d55d70.png",C=a.p+"static/media/marquise.0fdde8b2.png",I=a.p+"static/media/vagabond.c1faa343.png",S=a.p+"static/media/vagabond2.89ede692.png",k="IS_PICKED",w="IS_BANNED",q="IS_AVAILABLE",P="IS_NOT_AVAILABLE",A=a(99),B=a(93),F=a(96),R=a(53),E=a.n(R),L=a(54),_=a.n(L),N=function(e){var t={position:"absolute",zIndex:"1",width:"85%",height:"85%"};switch(e.status){case k:return Object(j.jsx)(E.a,{color:"success",sx:t});case w:return Object(j.jsx)(_.a,{color:"error",sx:t});default:return Object(j.jsx)(j.Fragment,{})}},T=function(e){var t=e.faction,a=e.handleFactionClick,n=t.status===P?"4em":"7em",c=t.status===P?"0.5em":"1em",r=t.status===P?"small":"large",s=t.status===P?"50%":"100%",i=function(e){return e.status===k?"#4da251":e.status===w?"#b66969":void 0}(t);return Object(j.jsx)(A.a,{onClick:function(){return a(t.name)},value:t.reach,sx:{width:n,height:n,opacity:s},disabled:t.status===P,"data-cy":t.name,children:Object(j.jsxs)(B.a,{badgeContent:Object(j.jsx)(F.a,{sx:{width:"2em",height:"2em",fontSize:r,backgroundColor:i},children:t.reach}),sx:{"& .MuiBadge-badge":{top:c,right:c},width:"100%",height:"100%",alignItems:"center",justifyContent:"center"},children:[Object(j.jsx)(N,{status:t.status}),Object(j.jsx)(F.a,{sx:{width:"90%",height:"90%"},imgProps:{sx:{objectFit:"contain"}},src:t.image})]})})},D=function(e){var t=e.playerCount,a=e.setReach,c=e.requiredReach,r=n.useState({marquise:{name:"marquise",image:C,reach:10,status:q},eyrie:{name:"eyrie",image:g,reach:7,status:q},alliance:{name:"alliance",image:x,reach:3,status:q},vagabond1:{name:"vagabond1",image:I,reach:5,status:P},riverfolk:{name:"riverfolk",image:y,reach:5,status:P},cult:{name:"cult",image:O,reach:2,status:P},corvid:{name:"corvid",image:v,reach:3,status:q},duchy:{name:"duchy",image:p,reach:8,status:q},vagabond2:{name:"vagabond2",image:S,reach:2,status:P}}),s=Object(i.a)(r,2),u=s[0],o=s[1];n.useEffect((function(){var e=h(u);o(e)}),[c]);var h=function(e){var a=Object(b.a)({},e),n=Object.values(a).filter((function(e){return e.status===k}));if(n.length>=t){for(var r in a)a[r].status!==k&&a[r].status!==w&&(a[r].status=P);return a}var s=Object.values(a).filter((function(e){return!(e.status===k||e.status===w)})).sort((function(e,t){return e.reach>t.reach?-1:e.reach<t.reach?1:0})),i=t-n.length,u=Object.values(a).filter((function(e){return e.status===k})).map((function(e){return e.reach})).reduce((function(e,t){return e+t}),0),o=function(e){if(a[e].status===k||a[e].status===w)return"continue";if("vagabond2"===a[e].name&&a.vagabond1.status!==k)return a[e].status=P,"continue";for(var t=s.filter((function(t){return t.name!==e})),n=a[e].reach,r=0;r<i-1;r++)t[r]&&(n+=t[r].reach);a[e].status=u+n<c?P:q};for(var h in a)o(h);return a},d=function(e){var t=Object(b.a)({},u);switch(u[e].status){case q:t[e].status=k;break;case k:t[e].status=w;break;case w:t[e].status=q}t=h(t),o(t)};return n.useEffect((function(){var e=Object.values(u).filter((function(e){return e.status===k})).map((function(e){return e.reach})).reduce((function(e,t){return e+t}),0);a(e)}),[a,u]),Object(j.jsx)(m.a,{container:!0,columns:{xs:3},rowSpacing:6,children:Object.values(u).map((function(e,t){return Object(j.jsx)(m.a,{item:!0,xs:1,sx:{display:"flex",justifyContent:"center",alignItems:"center",height:"9em"},children:Object(j.jsx)(T,{handleFactionClick:d,faction:e})},t)}))})},z=function(e){var t=e.reach,a=e.requiredReach;return Object(j.jsxs)("h3",{"data-cy":"reach-indicator",children:[t,"/",a,"+"]})};var J=function(){var e=n.useState(0),t=Object(i.a)(e,2),a=t[0],c=t[1],r=n.useState(21),s=Object(i.a)(r,2),d=s[0],l=s[1],b=n.useState(4),m=Object(i.a)(b,2),g=m[0],v=m[1];return Object(j.jsxs)(u.a,{maxWidth:"sm",className:"App",sx:{minWidth:"320px",height:"100%"},children:[Object(j.jsx)(o.a,{}),Object(j.jsxs)(h.a,{container:!0,sx:{height:"100%"},justifyContent:"space-around",alignItems:"center",children:[Object(j.jsx)(z,{reach:a,requiredReach:d}),Object(j.jsx)(D,{playerCount:g,setReach:c,reach:a,requiredReach:d}),Object(j.jsx)(f,{requiredReach:d,handlePlayerCountButtonPress:function(e,t){null!=t&&(l(t),v(e.target.innerText))}})]})]})},M=function(e){e&&e instanceof Function&&a.e(3).then(a.bind(null,102)).then((function(t){var a=t.getCLS,n=t.getFID,c=t.getFCP,r=t.getLCP,s=t.getTTFB;a(e),n(e),c(e),r(e),s(e)}))};s.a.render(Object(j.jsx)(c.a.StrictMode,{children:Object(j.jsx)(J,{})}),document.getElementById("root")),M()}},[[74,1,2]]]);
//# sourceMappingURL=main.65cdff4c.chunk.js.map