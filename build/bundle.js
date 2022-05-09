var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function r(t){return"function"==typeof t}function c(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function s(t,e,n,o){return t[1]&&o?function(t,e){for(const n in e)t[n]=e[n];return t}(n.ctx.slice(),t[1](o(e))):n.ctx}function i(t,e){t.appendChild(e)}function a(t,e,n){t.insertBefore(e,n||null)}function l(t){t.parentNode.removeChild(t)}function u(t){return document.createElement(t)}function f(t){return document.createTextNode(t)}function d(){return f(" ")}function $(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}let m;function p(t){m=t}const g=[],h=[],x=[],y=[],b=Promise.resolve();let v=!1;function w(t){x.push(t)}let _=!1;const C=new Set;function E(){if(!_){_=!0;do{for(let t=0;t<g.length;t+=1){const e=g[t];p(e),k(e.$$)}for(p(null),g.length=0;h.length;)h.pop()();for(let t=0;t<x.length;t+=1){const e=x[t];C.has(e)||(C.add(e),e())}x.length=0}while(g.length);for(;y.length;)y.pop()();v=!1,_=!1,C.clear()}}function k(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(w)}}const S=new Set;function j(t,e){t&&t.i&&(S.delete(t),t.i(e))}function M(t,e,n,o){if(t&&t.o){if(S.has(t))return;S.add(t),undefined.c.push((()=>{S.delete(t),o&&(n&&t.d(1),o())})),t.o(e)}}function T(t){t&&t.c()}function A(t,n,c,s){const{fragment:i,on_mount:a,on_destroy:l,after_update:u}=t.$$;i&&i.m(n,c),s||w((()=>{const n=a.map(e).filter(r);l?l.push(...n):o(n),t.$$.on_mount=[]})),u.forEach(w)}function z(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function q(t,e){-1===t.$$.dirty[0]&&(g.push(t),v||(v=!0,b.then(E)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function I(e,r,c,s,i,a,u,f=[-1]){const d=m;p(e);const $=e.$$={fragment:null,ctx:null,props:a,update:t,not_equal:i,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(r.context||(d?d.$$.context:[])),callbacks:n(),dirty:f,skip_bound:!1,root:r.target||d.$$.root};u&&u($.root);let g=!1;if($.ctx=c?c(e,r.props||{},((t,n,...o)=>{const r=o.length?o[0]:n;return $.ctx&&i($.ctx[t],$.ctx[t]=r)&&(!$.skip_bound&&$.bound[t]&&$.bound[t](r),g&&q(e,t)),n})):[],$.update(),g=!0,o($.before_update),$.fragment=!!s&&s($.ctx),r.target){if(r.hydrate){const t=function(t){return Array.from(t.childNodes)}(r.target);$.fragment&&$.fragment.l(t),t.forEach(l)}else $.fragment&&$.fragment.c();r.intro&&j(e.$$.fragment),A(e,r.target,r.anchor,r.customElement),E()}p(d)}class L{$destroy(){z(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const N=[];const O=function(e,n=t){let o;const r=new Set;function s(t){if(c(e,t)&&(e=t,o)){const t=!N.length;for(const t of r)t[1](),N.push(t,e);if(t){for(let t=0;t<N.length;t+=2)N[t][0](N[t+1]);N.length=0}}}return{set:s,update:function(t){s(t(e))},subscribe:function(c,i=t){const a=[c,i];return r.add(a),1===r.size&&(o=n(s)||t),c(e),()=>{r.delete(a),0===r.size&&(o(),o=null)}}}}({});function V(t){let e;return{c(){e=u("i"),$(e,"class","fas fa-play")},m(t,n){a(t,e,n)},d(t){t&&l(e)}}}function W(t){let e;return{c(){e=u("i"),$(e,"class","fas fa-stop")},m(t,n){a(t,e,n)},d(t){t&&l(e)}}}function G(t){let e,n,o,r,c,f,m,p,g,h;const x=t[6].default,y=function(t,e,n,o){if(t){const r=s(t,e,n,o);return t[0](r)}}(x,t,t[5],null);function b(t,e){return t[0][t[1].textContent]?W:V}let v=b(t),w=v(t);return{c(){e=u("div"),n=u("div"),o=u("span"),y&&y.c(),r=d(),c=u("span"),w.c(),f=d(),m=u("div"),$(c,"class","icon is-pulled-right button is-rounded svelte-mirw19"),$(n,"class","box"),$(e,"class","centered svelte-mirw19"),$(m,"class","block")},m(s,l){var u,d,$,x;a(s,e,l),i(e,n),i(n,o),y&&y.m(o,null),t[7](o),i(n,r),i(n,c),w.m(c,null),a(s,f,l),a(s,m,l),p=!0,g||(u=c,d="click",$=t[2],u.addEventListener(d,$,x),h=()=>u.removeEventListener(d,$,x),g=!0)},p(t,[e]){y&&y.p&&(!p||32&e)&&function(t,e,n,o,r,c){if(r){const i=s(e,n,o,c);t.p(i,r)}}(y,x,t,t[5],p?function(t,e,n,o){if(t[2]&&o){const r=t[2](o(n));if(void 0===e.dirty)return r;if("object"==typeof r){const t=[],n=Math.max(e.dirty.length,r.length);for(let o=0;o<n;o+=1)t[o]=e.dirty[o]|r[o];return t}return e.dirty|r}return e.dirty}(x,t[5],e,null):function(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let t=0;t<n;t++)e[t]=-1;return e}return-1}(t[5]),null),v!==(v=b(t))&&(w.d(1),w=v(t),w&&(w.c(),w.m(c,null)))},i(t){p||(j(y,t),p=!0)},o(t){M(y,t),p=!1},d(n){n&&l(e),y&&y.d(n),t[7](null),w.d(),n&&l(f),n&&l(m),g=!1,h()}}}function K(t,e,n){let o,{$$slots:r={},$$scope:c}=e,{start:s=""}=e,{stop:i=null}=e;O.subscribe((t=>n(0,o=t)));let a="name";return t.$$set=t=>{"start"in t&&n(3,s=t.start),"stop"in t&&n(4,i=t.stop),"$$scope"in t&&n(5,c=t.$$scope)},[o,a,()=>{i&&O.update((t=>{let e=t;return e[a.textContent]=null==e[a.textContent]||!e[a.textContent],e}));let t=null!=i?o[a.textContent]?s:i:s;window.opener.postMessage(`TheMenu['${a.textContent}'] = ${o[a.textContent]};`,"*");let e=document.createElement("script");e.innerText=`(() => {\n            let exec = (code, variables) =>  {\n                let varCode = '';\n                if(typeof variables == 'object') {\n                    variables = Object.entries(variables);\n                    variables.forEach(variable => {\n                        varCode += 'let ' + variable[0] + ' = "' + variable[1] + '";';\n                    });\n                }\n                code = varCode + '(' + code + ')();';\n                window.opener.postMessage('(function() {' + code.toString() + '})();', '*');\n            }; \n            (${t.toString()})();\n        })();`,document.body.appendChild(e),e.remove()},s,i,c,r,function(t){h[t?"unshift":"push"]((()=>{a=t,n(1,a)}))}]}class P extends L{constructor(t){super(),I(this,t,K,G,c,{start:3,stop:4})}}function R(t){let e;return{c(){e=f("Text en afbeeldingen aanpassen")},m(t,n){a(t,e,n)},d(t){t&&l(e)}}}function U(t){let e;return{c(){e=f("Titel van pagina aanpassen")},m(t,n){a(t,e,n)},d(t){t&&l(e)}}}function B(t){let e;return{c(){e=f("Rekenmachine")},m(t,n){a(t,e,n)},d(t){t&&l(e)}}}function F(t){let e;return{c(){e=f("Raket spel")},m(t,n){a(t,e,n)},d(t){t&&l(e)}}}function H(t){let e;return{c(){e=f("Magister fout melding")},m(t,n){a(t,e,n)},d(t){t&&l(e)}}}function D(t){let e;return{c(){e=f("Cloudwise fout melding")},m(t,n){a(t,e,n)},d(t){t&&l(e)}}}function J(t){let e;return{c(){e=f("Pas cijfers aan")},m(t,n){a(t,e,n)},d(t){t&&l(e)}}}function Q(t){let e;return{c(){e=f("Maak muis onzichtbaar")},m(t,n){a(t,e,n)},d(t){t&&l(e)}}}function X(t){let e;return{c(){e=f("Thanos snap")},m(t,n){a(t,e,n)},d(t){t&&l(e)}}}function Y(t){let e,n,o,r,c,s,f,m,p,g,h,x,y,b,v,w,_,C,E,k,S,q,I,L,N;return s=new P({props:{start:"function() {\n        exec(function () {\n            document.body.contentEditable = true;\n            document.designMode = 'on';\n        });\n    }",stop:"function () {\n        exec(function () {\n            document.body.contentEditable = false;\n            document.designMode = 'off';\n        });\n    }",$$slots:{default:[R]},$$scope:{ctx:t}}}),m=new P({props:{start:"function () {\n        let text = prompt('Voer de titel in');\n        if (text != '')\n            exec(\n                function () {\n                    document.title = text;\n                },\n                { text }\n            );\n    }",$$slots:{default:[U]},$$scope:{ctx:t}}}),g=new P({props:{start:"function () {\n        let _z, _o, _t;\n        function calc() {\n            _o = prompt(_t, _z);\n            _o = _o.replaceAll('x', '*').replaceAll(':', '/');\n            if (\n                _o != '' &&\n                _o != null &&\n                _o.toUpperCase() == _o.toLowerCase()\n            ) {\n                _z = Math.round(Function('return ' + _o)() * 100) / 100;\n            }\n        }\n        _t = 'Voer in wat uitgerekend moet worden';\n        _z = '';\n        calc();\n        while (_o != '' && _o != null && _o.toUpperCase() == _o.toLowerCase())\n            calc();\n    }",$$slots:{default:[B]},$$scope:{ctx:t}}}),x=new P({props:{start:"function () {\n        exec(function () {\n            var s = document.createElement('script');\n            s.type = 'text/javascript';\n            document.body.appendChild(s);\n            s.src = '//hi.kickassapp.com/kickass.js';\n            void 0;\n        });\n    }",stop:"function () {\n        exec(function () {\n            KICKASSGAME.destroy();\n        });\n    }",$$slots:{default:[F]},$$scope:{ctx:t}}}),b=new P({props:{start:"function () {\n        let text = prompt('Voer de fout(code) in.');\n        if (text != '')\n            exec(\n                function () {\n                    win.close();\n                    document.location =\n                        'https://isw.magister.net/error.html?statusCode=' +\n                        text;\n                },\n                { text }\n            );\n    }",$$slots:{default:[H]},$$scope:{ctx:t}}}),w=new P({props:{start:"function () {\n        let text = prompt('Voer de fout(code) in.');\n        if (text != '')\n            exec(\n                function () {\n                    win.close();\n                    document.location =\n                        'https://cloudwise-sso.appspot.com/notify?code=' + text;\n                },\n                { text }\n            );\n    }",$$slots:{default:[D]},$$scope:{ctx:t}}}),C=new P({props:{start:"function () {\n        let number;\n        (function get() {\n            number = prompt('Cijfer');\n            if (number == '') get();\n        })();\n        exec(\n            function () {\n                if (\n                    location.toString() ===\n                    'https://isw.magister.net/magister/#/cijfers'\n                ) {\n                    document\n                        .querySelectorAll(\n                            '#cijfers-laatst-behaalde-resultaten-container > section > div > div.wide-widget > div > div > table > tbody > tr.ng-scope > td:nth-child(4)'\n                        )\n                        .forEach((element) => (element.innerText = number));\n                    document\n                        .querySelectorAll('.moetinhalen')\n                        .forEach((element) => (element.innerText = 'Inh'));\n                } else if (\n                    location.toString() ===\n                    'https://isw.magister.net/magister/#/cijfers/cijferoverzicht'\n                ) {\n                    document\n                        .querySelectorAll('.grade')\n                        .forEach((element) => (element.innerText = number));\n                    document\n                        .querySelectorAll('.grade.empty')\n                        .forEach((element) => (element.innerHTML = '&nbsp;'));\n                    document\n                        .querySelectorAll('.grade.bijzonderecolumn')\n                        .forEach((element) => (element.innerText = 'Inh'));\n                } else alert('Ga naar magister cijfers!');\n            },\n            { number }\n        );\n    }",$$slots:{default:[J]},$$scope:{ctx:t}}}),k=new P({props:{start:"function () {\n        exec(function () {\n            let style = document.createElement('style');\n            style.innerText = '*  {cursor: none !important; }';\n            style.className = 'nocursor';\n            document.head.appendChild(style);\n        });\n    }",stop:"function () {\n        exec(function () {\n            document\n                .querySelectorAll('.nocursor')\n                .forEach((element) => element.remove());\n        });\n    }",$$slots:{default:[Q]},$$scope:{ctx:t}}}),q=new P({props:{start:"function () {\n        exec(function () {\n            let style = document.createElement('style');\n            style.innerText = '*  {display: none}';\n            style.className = 'thanossnap';\n            document.head.appendChild(style);\n        });\n    }",stop:"function () {\n        exec(function () {\n            document\n                .querySelectorAll('.thanossnap')\n                .forEach((element) => element.remove());\n        });\n    }",$$slots:{default:[X]},$$scope:{ctx:t}}}),{c(){e=u("div"),n=u("h1"),n.textContent=`Welkom ${localStorage.getItem("name")}.`,o=d(),r=u("div"),c=d(),T(s.$$.fragment),f=d(),T(m.$$.fragment),p=d(),T(g.$$.fragment),h=d(),T(x.$$.fragment),y=d(),T(b.$$.fragment),v=d(),T(w.$$.fragment),_=d(),T(C.$$.fragment),E=d(),T(k.$$.fragment),S=d(),T(q.$$.fragment),I=d(),L=u("div"),$(n,"class","subtitle is-1"),$(e,"class","centered svelte-16hc6gb"),$(r,"class","block"),$(L,"class","block")},m(t,l){a(t,e,l),i(e,n),a(t,o,l),a(t,r,l),a(t,c,l),A(s,t,l),a(t,f,l),A(m,t,l),a(t,p,l),A(g,t,l),a(t,h,l),A(x,t,l),a(t,y,l),A(b,t,l),a(t,v,l),A(w,t,l),a(t,_,l),A(C,t,l),a(t,E,l),A(k,t,l),a(t,S,l),A(q,t,l),a(t,I,l),a(t,L,l),N=!0},p(t,[e]){const n={};1&e&&(n.$$scope={dirty:e,ctx:t}),s.$set(n);const o={};1&e&&(o.$$scope={dirty:e,ctx:t}),m.$set(o);const r={};1&e&&(r.$$scope={dirty:e,ctx:t}),g.$set(r);const c={};1&e&&(c.$$scope={dirty:e,ctx:t}),x.$set(c);const i={};1&e&&(i.$$scope={dirty:e,ctx:t}),b.$set(i);const a={};1&e&&(a.$$scope={dirty:e,ctx:t}),w.$set(a);const l={};1&e&&(l.$$scope={dirty:e,ctx:t}),C.$set(l);const u={};1&e&&(u.$$scope={dirty:e,ctx:t}),k.$set(u);const f={};1&e&&(f.$$scope={dirty:e,ctx:t}),q.$set(f)},i(t){N||(j(s.$$.fragment,t),j(m.$$.fragment,t),j(g.$$.fragment,t),j(x.$$.fragment,t),j(b.$$.fragment,t),j(w.$$.fragment,t),j(C.$$.fragment,t),j(k.$$.fragment,t),j(q.$$.fragment,t),N=!0)},o(t){M(s.$$.fragment,t),M(m.$$.fragment,t),M(g.$$.fragment,t),M(x.$$.fragment,t),M(b.$$.fragment,t),M(w.$$.fragment,t),M(C.$$.fragment,t),M(k.$$.fragment,t),M(q.$$.fragment,t),N=!1},d(t){t&&l(e),t&&l(o),t&&l(r),t&&l(c),z(s,t),t&&l(f),z(m,t),t&&l(p),z(g,t),t&&l(h),z(x,t),t&&l(y),z(b,t),t&&l(v),z(w,t),t&&l(_),z(C,t),t&&l(E),z(k,t),t&&l(S),z(q,t),t&&l(I),t&&l(L)}}}function Z(t){if(window.opener.postMessage("window.addEventListener('focus', () => win.close()); if(typeof TheMenu == 'undefined') var TheMenu = {}; win.postMessage({ type: 'states', states: TheMenu }, '*')","*"),window.addEventListener("message",(t=>{"states"==t.data.type&&"{}"!=t.data.states&&O.set(t.data.states)})),"undefined"==localStorage.getItem("name")||"null"==localStorage.getItem("name")||null==localStorage.getItem("name")){let t;function e(){t=prompt("Wat is je naam?"),""==t&&e()}e(),localStorage.setItem("name",t)}return[]}const tt=new class extends L{constructor(t){super(),I(this,t,Z,Y,c,{})}}({target:document.body});return"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js"),tt}();
//# sourceMappingURL=bundle.js.map
