var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=/* @__PURE__ */ new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:f,getOwnPropertySymbols:p,getPrototypeOf:m}=Object,h=globalThis,g=h.trustedTypes,_=g?g.emptyScript:``,v=h.reactiveElementPolyfillSupport,y=(e,t)=>e,b={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},x=(e,t)=>!l(e,t),ee={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:x};Symbol.metadata??=Symbol(`metadata`),h.litPropertyMetadata??=/* @__PURE__ */ new WeakMap;var S=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ee){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ee}static _$Ei(){if(this.hasOwnProperty(y(`elementProperties`)))return;let e=m(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(y(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y(`properties`))){let e=this.properties,t=[...f(e),...p(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=/* @__PURE__ */ new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=/* @__PURE__ */ new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=/* @__PURE__ */ new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=/* @__PURE__ */ new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?b:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?b:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??x)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=/* @__PURE__ */ new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=/* @__PURE__ */ new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=/* @__PURE__ */ new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};S.elementStyles=[],S.shadowRootOptions={mode:`open`},S[y(`elementProperties`)]=/* @__PURE__ */ new Map,S[y(`finalized`)]=/* @__PURE__ */ new Map,v?.({ReactiveElement:S}),(h.reactiveElementVersions??=[]).push(`2.1.2`);var te=globalThis,ne=e=>e,C=te.trustedTypes,re=C?C.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,ie=`$lit$`,ae=`lit$${Math.random().toFixed(9).slice(2)}$`,oe=`?`+ae,w=`<${oe}>`,se=document,ce=()=>se.createComment(``),le=e=>e===null||typeof e!=`object`&&typeof e!=`function`,ue=Array.isArray,de=e=>ue(e)||typeof e?.[Symbol.iterator]==`function`,fe=`[ 	
\f\r]`,pe=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,me=/-->/g,he=/>/g,ge=RegExp(`>|${fe}(?:([^\\s"'>=/]+)(${fe}*=${fe}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),_e=/'/g,ve=/"/g,ye=/^(?:script|style|textarea|title)$/i,be=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),T=be(1),E=be(2),xe=Symbol.for(`lit-noChange`),D=Symbol.for(`lit-nothing`),Se=/* @__PURE__ */ new WeakMap,Ce=se.createTreeWalker(se,129);function we(e,t){if(!ue(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return re===void 0?t:re.createHTML(t)}var Te=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=pe;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===pe?c[1]===`!--`?o=me:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=ge):(ye.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=ge):o=he:o===ge?c[0]===`>`?(o=i??pe,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?ge:c[3]===`"`?ve:_e):o===ve||o===_e?o=ge:o===me||o===he?o=pe:(o=ge,i=void 0);let d=o===ge&&e[t+1].startsWith(`/>`)?` `:``;a+=o===pe?n+w:l>=0?(r.push(s),n.slice(0,l)+ie+n.slice(l)+ae+d):n+ae+(l===-2?t:d)}return[we(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},Ee=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Te(t,n);if(this.el=e.createElement(l,r),Ce.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=Ce.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(ie)){let t=u[o++],n=i.getAttribute(e).split(ae),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?je:r[1]===`?`?Me:r[1]===`@`?Ne:Ae}),i.removeAttribute(e)}else e.startsWith(ae)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(ye.test(i.tagName)){let e=i.textContent.split(ae),t=e.length-1;if(t>0){i.textContent=C?C.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],ce()),Ce.nextNode(),c.push({type:2,index:++a});i.append(e[t],ce())}}}else if(i.nodeType===8){if(i.data===oe)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(ae,e+1))!==-1;)c.push({type:7,index:a}),e+=ae.length-1}}a++}}static createElement(e,t){let n=se.createElement(`template`);return n.innerHTML=e,n}};function De(e,t,n=e,r){if(t===xe)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=le(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=De(e,i._$AS(e,t.values),i,r)),t}var Oe=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??se).importNode(t,!0);Ce.currentNode=r;let i=Ce.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new ke(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Pe(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=Ce.nextNode(),a++)}return Ce.currentNode=se,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},ke=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=D,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=De(this,e,t),le(e)?e===D||e==null||e===``?(this._$AH!==D&&this._$AR(),this._$AH=D):e!==this._$AH&&e!==xe&&this._(e):e._$litType$===void 0?e.nodeType===void 0?de(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==D&&le(this._$AH)?this._$AA.nextSibling.data=e:this.T(se.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=Ee.createElement(we(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new Oe(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=Se.get(e.strings);return t===void 0&&Se.set(e.strings,t=new Ee(e)),t}k(t){ue(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(ce()),this.O(ce()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=ne(e).nextSibling;ne(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Ae=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=D,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(/* @__PURE__ */ new String),this.strings=n):this._$AH=D}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=De(this,e,t,0),a=!le(e)||e!==this._$AH&&e!==xe,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=De(this,r[n+o],t,o),s===xe&&(s=this._$AH[o]),a||=!le(s)||s!==this._$AH[o],s===D?e=D:e!==D&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===D?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},je=class extends Ae{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===D?void 0:e}},Me=class extends Ae{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==D)}},Ne=class extends Ae{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=De(this,e,t,0)??D)===xe)return;let n=this._$AH,r=e===D&&n!==D||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==D&&(n===D||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Pe=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){De(this,e)}},Fe={M:ie,P:ae,A:oe,C:1,L:Te,R:Oe,D:de,V:De,I:ke,H:Ae,N:Me,U:Ne,B:je,F:Pe},Ie=te.litHtmlPolyfillSupport;Ie?.(Ee,ke),(te.litHtmlVersions??=[]).push(`3.3.3`);var Le=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new ke(t.insertBefore(ce(),e),e,void 0,n??{})}return i._$AI(e),i},Re=globalThis,O=class extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Le(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return xe}};O._$litElement$=!0,O.finalized=!0,Re.litElementHydrateSupport?.({LitElement:O});var ze=Re.litElementPolyfillSupport;ze?.({LitElement:O}),(Re.litElementVersions??=[]).push(`4.2.2`);var Be={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Ve=e=>(...t)=>({_$litDirective$:e,values:t}),He=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},Ue=`important`,We=` !`+Ue,k=Ve(class extends He{constructor(e){if(super(e),e.type!==Be.ATTRIBUTE||e.name!==`style`||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{let r=e[n];return r==null?t:t+`${n=n.includes(`-`)?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,`-$&`).toLowerCase()}:${r};`},``)}update(e,[t]){let{style:n}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let e of this.ft)t[e]??(this.ft.delete(e),e.includes(`-`)?n.removeProperty(e):n[e]=null);for(let e in t){let r=t[e];if(r!=null){this.ft.add(e);let t=typeof r==`string`&&r.endsWith(We);e.includes(`-`)||t?n.setProperty(e,t?r.slice(0,-11):r,t?Ue:``):n[e]=r}}return xe}}),Ge=/* @__PURE__ */ new Set([`unavailable`,`unknown`]);function A(e){let t=e.indexOf(`.`);return t===-1?``:e.slice(0,t)}function Ke(e){let t=e.indexOf(`.`);return t===-1?e:e.slice(t+1)}function j(e){return e!==void 0&&!Ge.has(e.state)}function M(e,t){let n=e.states[t]?.attributes.friendly_name;return typeof n==`string`&&n.trim()!==``?n.trim():Ke(t)}function qe(e,t){let n=[],r=/* @__PURE__ */ new Set,i=t=>{if(r.has(t))return;r.add(t);let a=e.states[t];if(!a)return;let o=a.attributes.entity_id;if(Array.isArray(o)&&o.length>0){for(let e of o)typeof e==`string`&&i(e);return}n.push(t)};return i(t),n}var Je=/* @__PURE__ */ new WeakMap;function Ye(e){let t=e.entities??{},n=Je.get(t);if(!n){n=/* @__PURE__ */ new Map;for(let e of Object.values(t)){if(!e.device_id)continue;let t=n.get(e.device_id);t?t.push(e.entity_id):n.set(e.device_id,[e.entity_id])}for(let e of n.values())e.sort();Je.set(t,n)}return n}function Xe(e,t){return e.entities?.[t]?.device_id}function Ze(e,t){let n=Xe(e,t);return n?Ye(e).get(n)??[]:[]}function Qe(e){if(!j(e))return;let t=Number.parseFloat(e.state);return Number.isFinite(t)?t:void 0}function N(e,t,n){e.dispatchEvent(new CustomEvent(t,{detail:n,bubbles:!0,composed:!0}))}function $e(e,t){N(e,`hass-more-info`,{entityId:t})}function P(e,t){N(e,`haptic`,t)}function et(e,t,n){let r=A(t),i=r===`light`||r===`switch`?r:`homeassistant`,a=r===`light`?tt({},n):{};return e.callService(i,`toggle`,a,{entity_id:t})}function tt(e,t={}){return t.transition===void 0?e:{...e,transition:t.transition}}function nt(e,t,n,r){return n<=0?e.callService(`light`,`turn_off`,tt({},r),{entity_id:t}):e.callService(`light`,`turn_on`,tt({brightness_pct:Math.round(n)},r),{entity_id:t})}function rt(e,t,n,r,i){return e.callService(`light`,`turn_on`,tt({hs_color:[Math.round(n),Math.round(r)]},i),{entity_id:t})}function it(e,t,n,r){let i={};return n.rgb?i.rgb_color=n.rgb:n.kelvin!==void 0&&(i.color_temp_kelvin=Math.round(n.kelvin)),n.brightness!==void 0&&(i.brightness_pct=Math.round(n.brightness)),e.callService(`light`,`turn_on`,tt(i,r),{entity_id:t})}function at(e,t,n){return e.callService(`light`,`turn_on`,{effect:n},{entity_id:t})}function ot(e,t,n){return t.length===0?Promise.resolve():e.callService(`select`,`select_option`,{option:n},{entity_id:[...t]})}function st(e,t,n,r){return e.callService(`light`,`turn_on`,tt({color_temp_kelvin:Math.round(n)},r),{entity_id:t})}function ct(e,t,n){return e.callService(`number`,`set_value`,{value:n},{entity_id:t})}function lt(e,t){return e.callService(`button`,`press`,{},{entity_id:t})}var ut=[`toggle`,`details`,`more-info`,`none`],dt=/* @__PURE__ */ new Set([`toggle`,`more-info`,`details`,`navigate`,`url`,`perform-action`,`call-service`,`none`]);function ft(e,t){if(e==null||e===``)return;let n=typeof e==`string`?{action:e}:e;if(typeof n!=`object`||!n)throw Error(`"${t}" must be an action such as "toggle" or { action: navigate }.`);let r=n.action;if(typeof r!=`string`||!dt.has(r))throw Error(`"${t}" has an unknown action "${String(r)}".`);return n}function pt(e){window.history.pushState(null,``,e),window.dispatchEvent(new CustomEvent(`location-changed`,{detail:{replace:!1}}))}function mt(e,t){if(!e)return;let{node:n,hass:r,entityId:i}=t;switch(e.action){case`toggle`:et(r,i);return;case`more-info`:$e(n,i);return;case`details`:t.openDetails?t.openDetails():$e(n,i);return;case`navigate`:e.navigation_path&&pt(e.navigation_path);return;case`url`:e.url_path&&window.open(e.url_path,`_blank`,`noopener`);return;case`perform-action`:case`call-service`:{let[t,n]=(e.perform_action??e.service)?.split(`.`,2)??[];if(!t||!n)return;r.callService(t,n,e.data??e.service_data??{},e.target);return}case`none`:return;default:N(n,`vivid-unknown-action`,e)}}var ht=[255,214,170];function F(e,t,n){return Math.min(Math.max(e,t),n)}function gt(e){return Array.isArray(e)&&e.length===3&&e.every(e=>typeof e==`number`&&Number.isFinite(e))}function _t(e,t){let n=(e%360+360)%360/60,r=F(t,0,100)/100,i=r*(1-Math.abs(n%2-1)),a=1-r,[o,s,c]=n<1?[r,i,0]:n<2?[i,r,0]:n<3?[0,r,i]:n<4?[0,i,r]:n<5?[i,0,r]:[r,0,i];return[Math.round((o+a)*255),Math.round((s+a)*255),Math.round((c+a)*255)]}function vt(e){let t=F(e,1e3,4e4)/100,n=t<=66?255:329.698727446*(t-60)**-.1332047592,r=t<=66?99.4708025861*Math.log(t)-161.1195681661:288.1221695283*(t-60)**-.0755148492,i=t>=66?255:t<=19?0:138.5177312231*Math.log(t-10)-305.0447927307;return[Math.round(F(n,0,255)),Math.round(F(r,0,255)),Math.round(F(i,0,255))]}function yt(e){if(!e)return;let t=e.attributes;if(gt(t.rgb_color))return t.rgb_color;let n=t.hs_color;if(Array.isArray(n)&&typeof n[0]==`number`&&typeof n[1]==`number`)return _t(n[0],n[1]);if(typeof t.color_temp_kelvin==`number`)return vt(t.color_temp_kelvin)}function I(e,t=1){let[n,r,i]=e;return t>=1?`rgb(${n}, ${r}, ${i})`:`rgba(${n}, ${r}, ${i}, ${bt(t)})`}function bt(e){return Math.round(e*100)/100}function xt(e){if(gt(e))return e.every(e=>e>=0&&e<=255)?e.map(Math.round):void 0;if(typeof e!=`string`)return;let t=e.trim().replace(/^#/,``),n=/^[0-9a-f]{3}$/i.test(t)?[...t].map(e=>e+e).join(``):t;if(/^[0-9a-f]{6}$/i.test(n))return[0,2,4].map(e=>Number.parseInt(n.slice(e,e+2),16))}function St([e,t,n]){return`#${[e,t,n].map(e=>e.toString(16).padStart(2,`0`)).join(``)}`}function Ct(e,t){return Math.hypot(e[0]-t[0],e[1]-t[1],e[2]-t[2])}var wt=[`off`,`soft`,`normal`,`strong`],Tt={off:0,soft:50,normal:100,strong:170},Et={number:{min:0,max:200,step:10,mode:`slider`,unit_of_measurement:`%`}};function Dt(e){if(typeof e==`string`&&e in Tt)return Tt[e];if(typeof e==`number`&&Number.isFinite(e)&&e>=0&&e<=200)return e}function Ot(e){let t=Math.max(0,e)/100;return{"--vivid-glow":String(kt(t)),"--vivid-glow-alpha":String(kt(t)),"--vivid-glow-play":t===0?`paused`:`running`}}function kt(e){return Math.round(e*100)/100}function At(e){return String(kt(e/36))}function jt([e,t,n],r){return`rgba(${e}, ${t}, ${n}, calc(${kt(r)} * var(--vivid-glow-alpha, 1)))`}function Mt(e){return`calc(${e}px * var(--vivid-glow, 1) * var(--vivid-glow-size, 1))`}function Nt(e,t,n,r=0){let i=r?` ${Mt(r)}`:``;return`0 0 ${Mt(e)}${i} ${jt(t,n)}`}function Pt(e,t,n,r,i=0){let a=i?` ${Mt(i)}`:``;return`${Mt(e)} 0 ${Mt(t)}${a} ${jt(n,r)}`}function Ft(e,t=100){return F(.5+((F(e,0,100)/100)**1.2-.5)*(Math.max(0,t)/100),0,1)}function It(e){return Math.round(e*10)/10}var Lt=[[255,213,79],[255,179,0],[255,112,67]],Rt=[255,193,7],zt=`#ffffff`,Bt=`rgba(0, 0, 0, 0.72)`;function Vt([e,t,n]){let r=e=>{let t=e/255;return t<=.04045?t/12.92:((t+.055)/1.055)**2.4};return .2126*r(e)+.7152*r(t)+.0722*r(n)}function Ht(e){return Vt(e)>=.6?Bt:zt}function Ut(e,t){return e<t.idle?0:t.max<=t.idle?1:F((e-t.idle)/(t.max-t.idle),0,1)}function Wt(e,t){let[n,r,i]=t.colors??Lt;return e<t.steps[0]?n:e<t.steps[1]?r:i}function Gt(e,t){if(e===void 0||e<t.idle)return{iconColor:`var(--disabled-text-color, rgba(255, 255, 255, 0.4))`};let n=Ut(e,t),r=Wt(e,t);return{background:I(r,.15+.35*n),iconColor:`var(--primary-text-color)`,shadow:Xt([r],n),pulse:`${(2.6-1.8*n).toFixed(2)}s`}}function Kt(e,t,n=100,r=100){let i=e===void 0?[]:Zt(e)?e:[e],a=i[0];if(!t||!a)return{};let o=Ft(n,r);return i.length===1?{background:I(a),iconColor:Ht(a),shadow:Xt(i,o)}:{background:`linear-gradient(120deg, ${i.map((e,t)=>`${I(e)} ${Math.round(t/(i.length-1)*100)}%`).join(`, `)})`,iconColor:Ht(Qt(i)),shadow:Xt(i,o)}}var qt=Vt(Rt),Jt=.24;function Yt(e){return kt(F(Jt*(qt/Math.max(Vt(e),.01))**.75,.16,.7))}function Xt(e,t){let n=e[0];if(!n)return``;let r=F(t,0,1),i=e=>Nt(It(1.5+2.7*r),e,kt((.35+.65*r)*Yt(e))),a=It(3+11*r),o=It(.9*r),s=e=>kt((.1+.9*r)*Yt(e));if(e.length===1)return`${i(n)}, ${Nt(a,n,s(n),o)}`;let c=e[e.length-1]??n,l=It(1+2*r);return[i(Qt(e)),Pt(-l,a,n,s(n),o),Pt(l,a,c,s(c),o)].join(`, `)}function Zt(e){return Array.isArray(e[0])}function Qt(e){return e.reduce((e,[t,n,r])=>[e[0]+t,e[1]+n,e[2]+r],[0,0,0]).map(t=>Math.round(t/Math.max(e.length,1)))}function $t(e){return e?{background:`rgba(var(--rgb-primary-color, 3, 169, 244), 0.2)`,iconColor:`var(--primary-color, #03a9f4)`}:{iconColor:`var(--secondary-text-color)`}}function en(e){return e?{background:I(Rt,.2),iconColor:`var(--amber-color, ${I(Rt)})`,shadow:Xt([Rt],.35)}:{iconColor:`var(--disabled-text-color, rgba(255, 255, 255, 0.4))`}}var tn=Rt,nn=[[2700,Rt],[4e3,[255,222,150]],[5500,[228,238,255]]];function rn(e){return e===void 0||!Number.isFinite(e)?Rt:on(nn,e)}function an(e,t,n=100,r=100){let i=e===void 0?[]:Zt(e)?e:[e];if(!t||i.length===0)return{};let a=Qt(i);return{background:I(a,.24+.16*Ft(n,r)),iconColor:`color-mix(in srgb, ${I(a)} 78%, var(--primary-text-color, #ffffff))`,shadow:Kt(i,!0,n,r).shadow}}function L(e,t){let n=F(t,0,1);return{background:I(e,.24+.16*n),iconColor:`color-mix(in srgb, ${I(e)} 78%, var(--primary-text-color, #ffffff))`,shadow:Xt([e],n)}}function on(e,t){let n=e[0];if(!n)return[0,0,0];if(t<=n[0])return n[1];for(let n=1;n<e.length;n+=1){let r=e[n],i=e[n-1];if(t<=r[0]){let e=(t-i[0])/Math.max(r[0]-i[0],2**-52);return i[1].map((t,n)=>Math.round(t+((r[1][n]??t)-t)*e))}}return e[e.length-1][1]}var R=`https://github.com/Florian-BARRE/vivid-cards`;function z(e,t){customElements.get(e)||customElements.define(e,t)}function sn(e){window.customCards=window.customCards??[],window.customCards.some(t=>t.type===e.type)||window.customCards.push(e)}function cn(e){window.customBadges=window.customBadges??[],window.customBadges.some(t=>t.type===e.type)||window.customBadges.push(e)}var ln={off:`Off`,on:`On`,unavailable:`Unavailable`,power_on:`Turn on`,power_off:`Turn off`,lights_on:`{on}/{total} on`,consumption:`Consumption`,ambilight_on:`Ambilight on — realtime data shown`,ambilight_off:`Ambilight off — WLED ignores realtime data`,live_override_unavailable:`Live override unavailable`,effect:`Effect`,hue:`Color`,saturation:`Saturation`,temperature:`Color temperature`,brightness:`Brightness`,details:`Show details`,close:`Close`,favorites:`Favorite colors`,preset:`Preset`,playlist:`Playlist`,palette:`Palette`,speed:`Speed`,intensity:`Intensity`,nightlight:`Nightlight`,sync_send:`Send sync`,sync_receive:`Receive sync`,device:`Device`,wifi:`Wi-Fi`,uptime:`Uptime`,leds:`LEDs`,current_limit:`Current limit`,memory:`Free memory`,ip:`IP`,firmware:`Firmware`,update_available:`Update {version}`,up_to_date:`Up to date`,restart:`Restart`,restart_confirm:`Tap again to restart`,limiter_off:`off`,days:`{d} d {h} h`,hours:`{h} h {m} min`,minutes:`{m} min`,settings:`Settings`,settings_hint:`Presets, palette, speed`,reverse:`Reverse`,freeze:`Freeze`,static_effect_hint:`Speed and intensity drive the animated effects.`,switches_one:`1 switch on`,switches_other:`{count} switches on`,update:`Update`,update_short:`update {version}`,range_6h:`6 h`,range_24h:`24 h`,range_7d:`7 d`,over_range:`Last {range}`,average:`avg`,peak:`Peak`,total:`Total`,period:`Period`,no_data:`no data`,today:`Today`,now:`now`,dur_now:`< 1 min`,dur_min:`{m} min`,dur_hours:`{h} h`,dur_days:`{d} d`,open_count:`{open}/{total} open`,all_closed:`All closed`,open_for:`open · {d}`,closed_for:`closed · {d}`,others:`{n} others`,closed_plural:`closed`,present:`Present`,clear:`Clear`,present_for:`for {d}`,clear_for:`clear · {d}`,occupied_count:`{on}/{total} occupied`,seen_ago:`seen {d} ago`,hours_ago:`-{h} h`,agg_mean:`mean`,agg_median:`median`,agg_min:`min`,agg_max:`max`,agg_sum:`total`,battery_summary:`{count} devices · {low} low`,battery_summary_ok:`{count} devices`,low_count:`{n} low`,battery_low:`Low`,battery_ok:`OK`,no_entities:`No entity`,openings_title:`Openings`,windows_title:`Windows`,doors_title:`Doors`,presence_title:`Presence`,batteries_title:`Batteries`,illuminance_title:`Illuminance`,climate_title_temperature:`Temperature`,climate_title_humidity:`Humidity`,climate_title_pressure:`Pressure`,climate_title_co2:`Air quality`,air_excellent:`Excellent`,air_good:`Good`,air_moderate:`Moderate`,air_poor:`Poor`,air_toxic:`Toxic`,climate_rising:`rising`,climate_falling:`falling`,climate_shower:`rising fast (shower?)`,climate_pressure_drop:`falling fast: storm or wind likely`,climate_rooms:`{n} rooms`,climate_all_rooms:`All rooms`,light_level_bright:`Bright`,light_level_dim:`Dim`,light_level_dark:`Dark`,power_title:`Power`,lamps_title:`Lamps`,lamp_off:`off`,lamp_on:`on`,lamp_no_draw:`draws nothing`,lamp_no_draw_hint:`On but drawing less than {w}: a bulb out, or the lamp’s own switch off?`,lamp_expand:`Show the lamps`,lamp_collapse:`Hide the lamps`,lamps_warn_one:`1 draws nothing`,lamps_warn:`{n} draw nothing`,energy_today:`Today: {e}`,all_lamps_off:`All off`,amb_offline:`Offline`,amb_overheat:`Overheating`,amb_stalled:`Fan stalled`,amb_nosensor:`No sensor`,amb_pi:`Pi`,amb_pi_off:`Pi off`,amb_pi_on:`Pi on`,amb_cut_confirm:`Cut?`,amb_cut_again:`Tap again to cut the Pi`,amb_shutdown_again:`Tap again to shut the Pi down`,amb_sending:`sending IR…`,amb_ok:`echo back ✓`,amb_fail:`no echo`,amb_sent:`sent`,amb_auto:`Auto`,amb_manual:`Manual`,amb_tab_overview:`Overview`,amb_tab_fan:`Fan`,amb_tab_ir:`HDMI & IR`,amb_tab_maint:`Maint.`,amb_alarm_overheat_t:`Box overheating`,amb_alarm_overheat:`{t} ≥ {max} · fan forced to 100 %`,amb_alarm_stalled_t:`Fan stalled`,amb_alarm_stalled:`100 % asked but under 300 rpm for 30 s`,amb_alarm_nosensor_t:`Climate sensor missing`,amb_alarm_nosensor:`fan at 100 % for safety`,amb_alarm_nosensor_cpu:`the fan follows the Pi CPU meanwhile`,amb_alarm_offline_t:`Box offline`,amb_alarm_offline:`controls disabled until it comes back`,amb_source:`HDMI source`,amb_fan:`Fan`,amb_on_curve:`{t} on the curve → {s} %`,amb_curve_waiting:`Curve waiting for the sensor`,amb_manual_hint:`The fan keeps the chosen speed`,amb_hysteresis:`Hysteresis`,amb_hysteresis_hint:`restarts at {on}, stops below {off}`,amb_overheat_temp:`Overheat threshold`,amb_overheat_hint:`above it: 100 % forced`,amb_stop:`Stop below point 1`,amb_stop_hint:`otherwise stays at {s} %`,amb_manual_speed:`Manual speed`,amb_manual_only:`Auto mode: the curve decides. Pick a speed to switch to Manual.`,amb_drag_hint:`Drag a point, or select it and use − / +`,amb_no_code:`no code yet`,amb_active:`active`,amb_last_received:`Last code received {c}`,amb_last_ok:`last send confirmed by the echo`,amb_last_fail:`last send not confirmed`,amb_learn:`Learn a code`,amb_nec_only:`NEC only`,amb_step1:`Listen`,amb_step2:`Keep the capture`,amb_step3:`Test the replay`,amb_step4:`Save`,amb_step1_hint:`then press the button on the original remote`,amb_step3_hint:`LED in front of the receiver`,amb_target:`Target input`,amb_cancel:`Cancel`,amb_clear:`Erase {n}`,amb_tap_again:`Tap again`,amb_pi_title:`Raspberry Pi`,amb_power:`5 V supply`,amb_power_on:`relay closed · Pi powered`,amb_power_off:`relay open · Pi off`,amb_pulse:`Forced restart`,amb_pulse_hint:`cuts the 5 V for 3 s`,amb_pulse_btn:`Cut 3 s`,amb_fan_tests:`Fan tests`,amb_self_test:`Self-test`,amb_sweep:`Sweep`,amb_stop_tests:`Stop`,amb_pwm:`PWM frequency`,amb_ir_tests:`IR tests`,amb_frames:`{n} frames received`,amb_led_steady:`LED on for 10 s (camera)`,amb_burst:`38 kHz burst`,amb_echo:`Echo test`,amb_send_captured:`Send the captured code`,amb_ir_debug:`Detailed IR logs`,amb_system:`System`,amb_online_since:`Up for`,amb_refresh:`Refresh sensors`,amb_restart:`Restart the Wemos`,amb_rpm:`{n} rpm`,amb_humidity:`Humidity`,amb_pressure:`Pressure`,amb_target_speed:`target {s} %`,amb_cpu_overheat:`CPU overheating`,amb_alarm_cpuoverheat_t:`Pi CPU overheating`,amb_alarm_cpuoverheat:`{t} ≥ {max} · fan forced to 100 %`,amb_curve_box:`Box`,amb_curve_cpu:`Pi CPU`,amb_drives:`drives the fan`,amb_box_curve_hint:`Followed while HyperHDR is not connected`,amb_cpu_curve_hint:`Followed while HyperHDR is connected`,amb_cpu_overheat_temp:`CPU overheat threshold`,amb_cpu_overheat_hint:`Fan at 100 % above it, whatever the curve`,amb_pi_min:`Pi on, no CPU temperature`,amb_pi_min_hint:`Lowest fan speed until HyperHDR sends it`,amb_shutdown_confirm:`Shut down?`,amb_stopping:`Stopping…`,amb_power_clean:`Clean shutdown, then the power is cut`,amb_relay_hard:`Hard cut`,amb_relay_hard_hint:`Cuts the 5 V now, without shutting the Pi down`,amb_pi_reboot:`Restart the Pi`,amb_pi_reboot_hint:`Over SSH, through the HyperHDR integration`,amb_hh_connected:`HyperHDR connected`,amb_hh_away:`HyperHDR not connected`,amb_cpu:`CPU`,amb_ram:`RAM`,amb_cut:`Cut`,amb_reboot_btn:`Restart`,amb_hyperhdr_server:`HyperHDR server`,amb_ps_on:`Pi powered`,amb_ps_off:`Pi off`,amb_ps_starting:`Pi starting`,amb_ps_shutting:`Shutting the Pi down cleanly…`,amb_ps_halting:`Pi halting, then the power is cut…`,amb_ps_timeout:`The Pi did not shut down in time: power cut anyway`,amb_ps_noha:`Home Assistant away: power cut directly`,amb_none:`None`,amb_link_title:`Box and HyperHDR`,amb_link_ok:`The fan follows the Pi CPU`,amb_link_away:`HyperHDR not connected: the box curve drives the fan`,amb_link_waiting:`HyperHDR connected: the box switches to the CPU curve shortly`,amb_link_unseen:`The box does not see HyperHDR`,amb_link_unseen_hint:`HyperHDR is connected, yet the firmware still follows the box curve: it does not read the server’s entities. In the ESPHome YAML, the substitutions must be:`,amb_link_unseen_after:`Then install the firmware again.`,amb_link_see_maint:`the fan stays on the box curve · see Maintenance`,amb_link_legacy:`Firmware without HyperHDR: box curve only, no clean shutdown`,amb_link_none:`No HyperHDR server (HA-HyperHDR integration)`,amb_link_nopoweroff_t:`No clean shutdown`,amb_link_nopoweroff:`The HyperHDR server has no Power off button: set up SSH in the integration’s options, else the Pi is cut without shutting down`,amb_box:`Ambilight box`,amb_online_short:`Online`,amb_entities:`{found}/{total} entities`,hh_capture:`Capture`,hh_effect:`Effect`,hh_color:`Color`,hh_none:`No source`,hh_other:`Other source`,hh_live:`Live`,hh_hdr:`HDR`,hh_smoothing:`Smoothing`,hh_black_border:`Borders`,hh_strips_one:`1 strip on`,hh_strips_other:`{count} strips on`,hh_strips_none:`All strips off`,hh_offline:`Offline`,hh_undervoltage:`Undervoltage`,hh_undervoltage_detected:`Undervoltage detected`,hh_hot:`Running hot`,hh_power_ok:`Power OK`,hh_cpu:`CPU`,hh_ram:`RAM`,hh_fps:`{n} fps`,hh_leds:`{n} LEDs`,hh_tab_overview:`Overview`,hh_tab_colors:`Colors`,hh_tab_processing:`Processing`,hh_tab_system:`System`,hh_source:`Source`,hh_source_auto:`Automatic`,hh_source_forced:`Forced: {source}`,hh_saturation:`Saturation`,hh_gamma:`Gamma`,hh_backlight:`Dark threshold`,hh_color_temp:`Color temperature`,hh_processing:`Image to LEDs`,hh_smoothing_time:`Smoothing time`,hh_smoothing_type:`Smoothing type`,hh_black_border_long:`Black border detection`,hh_black_border_mode:`Black border mode`,hh_tone_mapping:`HDR tone mapping`,hh_auto_tone:`Automatic tone mapping`,hh_continuous:`Continuous output`,hh_anti_flicker:`Anti-flickering filter`,hh_background:`Background effect`,hh_boot:`Boot effect`,hh_capture_switch:`Video capture`,hh_led_output:`LED output`,hh_led_output_off:`LED output off`,hh_show_screen:`Show the screen`,hh_extend:`Extend`,hh_stop:`Stop`,hh_screen_ended:`Stopped by itself: the Pi does not encode it while nobody looks`,hh_grabber:`Grabber`,hh_no_signal:`No signal`,hh_version:`Version`,hh_no_picture:`The picture needs the admin password in the integration`,hh_not_found:`HyperHDR not found: add the HA-HyperHDR integration`,hh_temperature:`Temperature`,hh_memory:`Memory`,hh_effects:`Effects`,hh_connected:`Connected`,hh_signal:`Signal received`,hh_power:`Power supply`,hh_strips:`Strips`,hh_admin_hint:`More settings with the admin password in the integration`,hh_picture:`Captured picture`,hh_crop:`Crop`,hh_image:`Picture settings`,hh_open_more:`More`,cc_range_30d:`30 d`,cc_temperature:`Temperature`,cc_humidity:`Humidity`,cc_pressure:`Pressure`,cc_co2:`CO₂`,cc_comfort:`comfort {range}`,cc_min:`Min`,cc_max:`Max`,cc_min_label:`min {value}`,cc_max_label:`max {value}`,cc_mean:`Average`,cc_over:`over {range}`,cc_outside:`Outside comfort`,cc_below:`below {value}`,cc_above:`above {value}`,cc_both_sides:`{below} below · {above} above`,cc_always_comfortable:`always comfortable`,cc_yesterday_at:`Yesterday {time}`,cc_vs_yesterday:`{diff} today`,cc_per_hour:`{value}/h`,cc_no_history:`No history for this period`,cc_not_found:`Sensor not found`,cc_rooms:`{count} rooms · same scale`,cc_history_of:`{kind} of {name} over {range}`,cc_rooms_label:`{kind} of every room over {range}`,cc_show_room:`Show {name}`,room_on_one:`1 on`,room_on_other:`{count} on`,room_all_off:`everything is off`,room_turn_off:`Turn off everything in {room}`,room_turn_on:`Turn on {room}`,led_expand:`Unfold`,led_collapse:`Fold`,led_screen_colors:`Colors follow the screen · tap to take over`,led_ambilight_mode:`Ambilight`,led_ambilight_start:`Turn Ambilight on: the strips follow the screen`,led_ambilight_stop:`Turn Ambilight off: the strips come back to the card`,led_box:`Ambilight box`,led_hyperhdr:`HyperHDR server`,led_back_server:`Back to the server`,led_tab_leds:`LEDs`,led_tab_manager:`Ambilight Manager`,led_tab_hyperhdr:`HyperHDR`,rail_missing:`Ambilight box not found`,energy_bill:`Bill`,energy_bill_range:`{from} → {to}`,energy_estimated:`estimated · day {day} of {total}`,energy_spent:`spent {v}`,energy_previous:`prev. {v}`,energy_vs_previous:`{d} vs the previous bill ({v})`,energy_pace:`7-day pace`,energy_per_day:`{v}/day`,energy_per_month:`{v}/month`,energy_per_hour:`{v}/h`,energy_last_day:`Last day`,energy_cycle_kwh:`This cycle`,energy_part_energy:`Energy {v}`,energy_part_subscription:`Subscription {v}`,energy_split_pending:`peak / off-peak once hourly data arrives`,energy_peak:`Peak hours`,energy_off_peak:`Off-peak hours`,energy_peak_short:`Peak`,energy_off_peak_short:`Off-peak`,energy_subscription:`Subscription`,energy_no_source:`No energy source: set "energy", or add the grid to the Energy dashboard.`,energy_no_data:`No data yet`,energy_loading:`Loading…`,energy_expand:`Show the details`,energy_collapse:`Fold`,energy_next_if_same:`if the pace holds`,energy_in_progress:`in progress · day {day} of {total}`,energy_bills:`Your bills`,energy_bills_sub:`past and coming, split by part`,energy_projection:`Projection`,energy_current_energy:`Energy of the cycle in progress`,energy_where_title:`Where the money goes`,energy_where_sub:`outer ring money, inner ring kWh`,energy_off_peak_note:`Off-peak hours are {k} of the kWh but {e} of the bill.`,energy_calendar_sub:`price of the day · off-peak / peak bar`,energy_month_total:`Total so far`,energy_day_today:`today`,energy_scale:`Sober day → expensive day`,energy_flow:`Energy flow`,energy_flow_sub:`from the meter to the devices`,energy_home:`Home`,energy_untracked:`Untracked`,energy_tracked:`Tracked`,energy_zoom:`ZOOM ×{z}`,energy_grid:`Grid`,energy_devices:`Devices`,energy_devices_sub:`at the average price, {p}/kWh`,energy_tracked_share:`{p} of your consumption is identified.`,energy_period_day:`Day`,energy_period_week:`Week`,energy_period_month:`Month`,energy_period_year:`Year`,energy_curve:`The last day`,energy_curve_sub:`per hour · off-peak hours in indigo`,energy_curve_waiting:`Hourly data has not arrived yet: Enedis sends it once the hourly collection is on.`,energy_standby:`standby ≈ {w}`,energy_standby_year:`Standby over a year`,energy_cost:`Cost`,energy_left:`{d} left`,energy_next_off_peak:`Next off-peak hours: {range}`,energy_single_price:`Single price`,energy_last_days:`Last {n} days · mean {v}`,energy_vs_mean:`vs the mean`,energy_yesterday:`Yesterday`,energy_kwh_in_off_peak:`{v} in off-peak hours`,energy_off_peak_target:`The mark is {p}: the share of the day in off-peak hours. Above it, consumption leans on off-peak hours.`,energy_consumption:`Consumption`,energy_in_off_peak:`in off-peak hours`,energy_kwh_days:`{k} · {d} d`,energy_previous_day:`Previous day`,energy_next_day:`Next day`,energy_previous_month:`Previous month`,energy_next_month:`Next month`,energy_no_devices:`No device in the Energy dashboard: add plugs or sensors under "Individual devices".`,energy_off_peak_title:`Off-peak hours`,energy_off_peak_sub:`outer ring kWh, inner ring money`,energy_others:`Others`,energy_split_waiting:`The off-peak / peak split needs hourly data, or an invoice with its peak and off-peak kWh.`,energy_tariff:`Tariff`,energy_previous_bill:`Previous bill {v}`,energy_day_of:`D{day}/{total}`},un={en:ln,fr:{off:`Éteint`,on:`Allumé`,unavailable:`Indisponible`,power_on:`Allumer`,power_off:`Éteindre`,lights_on:`{on}/{total} allumées`,consumption:`Consommation`,ambilight_on:`Ambilight activé — flux temps réel affiché`,ambilight_off:`Ambilight désactivé — WLED ignore le flux temps réel`,live_override_unavailable:`Remplacement en direct indisponible`,effect:`Effet`,hue:`Couleur`,saturation:`Saturation`,temperature:`Température de couleur`,brightness:`Luminosité`,details:`Afficher le détail`,close:`Fermer`,favorites:`Couleurs favorites`,preset:`Preset`,playlist:`Playlist`,palette:`Palette`,speed:`Vitesse`,intensity:`Intensité`,nightlight:`Veilleuse`,sync_send:`Envoi synchro`,sync_receive:`Réception synchro`,device:`Appareil`,wifi:`Wi-Fi`,uptime:`Allumé depuis`,leds:`LEDs`,current_limit:`Limite de courant`,memory:`Mémoire libre`,ip:`IP`,firmware:`Firmware`,update_available:`Mise à jour {version}`,up_to_date:`À jour`,restart:`Redémarrer`,restart_confirm:`Appuie encore pour redémarrer`,limiter_off:`désactivée`,days:`{d} j {h} h`,hours:`{h} h {m} min`,minutes:`{m} min`,settings:`Réglages`,settings_hint:`Presets, palette, vitesse`,reverse:`Inversé`,freeze:`Figé`,static_effect_hint:`Vitesse et intensité agissent sur les effets animés.`,switches_one:`1 option active`,switches_other:`{count} options actives`,update:`Mettre à jour`,update_short:`MAJ {version}`,range_6h:`6 h`,range_24h:`24 h`,range_7d:`7 j`,over_range:`Sur {range}`,average:`moy.`,peak:`Pic`,total:`Total`,period:`Période`,no_data:`pas de données`,today:`Aujourd’hui`,now:`maintenant`,dur_now:`< 1 min`,dur_min:`{m} min`,dur_hours:`{h} h`,dur_days:`{d} j`,open_count:`{open}/{total} ouvertes`,all_closed:`Tout fermé`,open_for:`ouvert · {d}`,closed_for:`fermé · {d}`,others:`{n} autres`,closed_plural:`fermés`,present:`Présence`,clear:`Libre`,present_for:`depuis {d}`,clear_for:`libre · {d}`,occupied_count:`{on}/{total} occupées`,seen_ago:`vu il y a {d}`,hours_ago:`-{h} h`,agg_mean:`moyenne`,agg_median:`médiane`,agg_min:`min`,agg_max:`max`,agg_sum:`total`,battery_summary:`{count} appareils · {low} faibles`,battery_summary_ok:`{count} appareils`,low_count:`{n} faibles`,battery_low:`Faible`,battery_ok:`OK`,no_entities:`Aucune entité`,openings_title:`Ouvertures`,windows_title:`Fenêtres`,doors_title:`Portes`,presence_title:`Présence`,batteries_title:`Batteries`,illuminance_title:`Éclairement`,climate_title_temperature:`Température`,climate_title_humidity:`Humidité`,climate_title_pressure:`Pression`,climate_title_co2:`Qualité de l’air`,air_excellent:`Excellent`,air_good:`Bon`,air_moderate:`Moyen`,air_poor:`Mauvais`,air_toxic:`Toxique`,climate_rising:`en hausse`,climate_falling:`en baisse`,climate_shower:`monte vite (douche ?)`,climate_pressure_drop:`chute rapide : orage ou vent probable`,climate_rooms:`{n} pièces`,climate_all_rooms:`Toutes les pièces`,light_level_bright:`Lumineux`,light_level_dim:`Tamisé`,light_level_dark:`Sombre`,power_title:`Puissance`,lamps_title:`Lampes`,lamp_off:`éteinte`,lamp_on:`allumée`,lamp_no_draw:`ne consomme rien`,lamp_no_draw_hint:`Allumée mais consomme moins de {w} : ampoule grillée, ou interrupteur de la lampe coupé ?`,lamp_expand:`Afficher les lampes`,lamp_collapse:`Masquer les lampes`,lamps_warn_one:`1 ne consomme rien`,lamps_warn:`{n} ne consomment rien`,energy_today:`Aujourd’hui : {e}`,all_lamps_off:`Tout éteint`,amb_offline:`Hors ligne`,amb_overheat:`Surchauffe`,amb_stalled:`Ventilateur bloqué`,amb_nosensor:`Sans capteur`,amb_pi:`Pi`,amb_pi_off:`Pi éteint`,amb_pi_on:`Pi allumé`,amb_cut_confirm:`Couper ?`,amb_cut_again:`Touche encore pour couper le Pi`,amb_shutdown_again:`Touche encore pour éteindre le Pi`,amb_sending:`envoi IR…`,amb_ok:`écho reçu ✓`,amb_fail:`pas d’écho`,amb_sent:`envoyé`,amb_auto:`Auto`,amb_manual:`Manuel`,amb_tab_overview:`Aperçu`,amb_tab_fan:`Ventilation`,amb_tab_ir:`HDMI & IR`,amb_tab_maint:`Maint.`,amb_alarm_overheat_t:`Surchauffe du boîtier`,amb_alarm_overheat:`{t} ≥ {max} · ventilateur forcé à 100 %`,amb_alarm_stalled_t:`Ventilateur bloqué`,amb_alarm_stalled:`100 % demandé mais moins de 300 tr/min pendant 30 s`,amb_alarm_nosensor_t:`Capteur climat absent`,amb_alarm_nosensor:`ventilateur à 100 % par sécurité`,amb_alarm_nosensor_cpu:`le ventilateur suit le CPU du Pi en attendant`,amb_alarm_offline_t:`Boîtier hors ligne`,amb_alarm_offline:`commandes désactivées jusqu’à son retour`,amb_source:`Source HDMI`,amb_fan:`Ventilation`,amb_on_curve:`{t} sur la courbe → {s} %`,amb_curve_waiting:`Courbe en attente du capteur`,amb_manual_hint:`Le ventilateur garde la vitesse choisie`,amb_hysteresis:`Hystérésis`,amb_hysteresis_hint:`redémarre à {on}, s’arrête sous {off}`,amb_overheat_temp:`Seuil de surchauffe`,amb_overheat_hint:`au-delà : 100 % forcé`,amb_stop:`Arrêt sous le point 1`,amb_stop_hint:`sinon reste à {s} %`,amb_manual_speed:`Vitesse manuelle`,amb_manual_only:`En Auto, la courbe décide. Choisir une vitesse passe en Manuel.`,amb_drag_hint:`Déplace un point au doigt, ou sélectionne-le et règle avec − / +`,amb_no_code:`pas encore de code`,amb_active:`active`,amb_last_received:`Dernier code reçu {c}`,amb_last_ok:`dernier envoi confirmé par l’écho`,amb_last_fail:`dernier envoi non confirmé`,amb_learn:`Apprendre un code`,amb_nec_only:`NEC uniquement`,amb_step1:`Écouter`,amb_step2:`Valider la capture`,amb_step3:`Tester la relecture`,amb_step4:`Enregistrer`,amb_step1_hint:`puis appuie sur la touche de la télécommande d’origine`,amb_step3_hint:`LED face au récepteur`,amb_target:`Entrée cible`,amb_cancel:`Annuler`,amb_clear:`Effacer {n}`,amb_tap_again:`Confirmer ?`,amb_pi_title:`Raspberry Pi`,amb_power:`Alimentation 5 V`,amb_power_on:`relais fermé · Pi alimenté`,amb_power_off:`relais ouvert · Pi éteint`,amb_pulse:`Redémarrage forcé`,amb_pulse_hint:`coupe le 5 V pendant 3 s`,amb_pulse_btn:`Couper 3 s`,amb_fan_tests:`Tests ventilateur`,amb_self_test:`Auto-test`,amb_sweep:`Balayage`,amb_stop_tests:`Arrêter`,amb_pwm:`Fréquence PWM`,amb_ir_tests:`Tests IR`,amb_frames:`{n} trames reçues`,amb_led_steady:`LED allumée 10 s (caméra)`,amb_burst:`Salve 38 kHz`,amb_echo:`Test d’écho`,amb_send_captured:`Envoyer le code capturé`,amb_ir_debug:`Logs IR détaillés`,amb_system:`Système`,amb_online_since:`En ligne depuis`,amb_refresh:`Rafraîchir les capteurs`,amb_restart:`Redémarrer le Wemos`,amb_rpm:`{n} tr/min`,amb_humidity:`Humidité`,amb_pressure:`Pression`,amb_target_speed:`cible {s} %`,amb_cpu_overheat:`CPU en surchauffe`,amb_alarm_cpuoverheat_t:`Le processeur du Pi surchauffe`,amb_alarm_cpuoverheat:`{t} ≥ {max} · ventilateur forcé à 100 %`,amb_curve_box:`Boîtier`,amb_curve_cpu:`CPU du Pi`,amb_drives:`commande le ventilateur`,amb_box_curve_hint:`Suivie tant que HyperHDR n’est pas connecté`,amb_cpu_curve_hint:`Suivie tant que HyperHDR est connecté`,amb_cpu_overheat_temp:`Seuil de surchauffe du CPU`,amb_cpu_overheat_hint:`Ventilateur à 100 % au-delà, quelle que soit la courbe`,amb_pi_min:`Pi allumé, sans température CPU`,amb_pi_min_hint:`Vitesse minimale tant que HyperHDR ne l’envoie pas`,amb_shutdown_confirm:`Éteindre ?`,amb_stopping:`Arrêt…`,amb_power_clean:`Arrêt propre, puis coupure du courant`,amb_relay_hard:`Coupure directe`,amb_relay_hard_hint:`Coupe le 5 V tout de suite, sans éteindre le Pi`,amb_pi_reboot:`Redémarrer le Pi`,amb_pi_reboot_hint:`En SSH, par l’intégration HyperHDR`,amb_hh_connected:`HyperHDR connecté`,amb_hh_away:`HyperHDR non connecté`,amb_cpu:`CPU`,amb_ram:`RAM`,amb_cut:`Couper`,amb_reboot_btn:`Redémarrer`,amb_hyperhdr_server:`Serveur HyperHDR`,amb_ps_on:`Pi alimenté`,amb_ps_off:`Pi éteint`,amb_ps_starting:`Démarrage du Pi`,amb_ps_shutting:`Arrêt propre du Pi…`,amb_ps_halting:`Le Pi s’arrête, puis le courant est coupé…`,amb_ps_timeout:`Le Pi ne s’est pas éteint à temps : courant coupé quand même`,amb_ps_noha:`Home Assistant absent : courant coupé directement`,amb_none:`Aucune`,amb_link_title:`Boîtier et HyperHDR`,amb_link_ok:`Le ventilateur suit le CPU du Pi`,amb_link_away:`HyperHDR non connecté : la courbe du boîtier commande le ventilateur`,amb_link_waiting:`HyperHDR connecté : le boîtier passe sur la courbe CPU d’ici peu`,amb_link_unseen:`Le boîtier ne voit pas HyperHDR`,amb_link_unseen_hint:`HyperHDR est connecté, mais le firmware suit toujours la courbe du boîtier : il ne lit pas les entités du serveur. Dans le YAML ESPHome, les substitutions doivent être :`,amb_link_unseen_after:`Puis réinstalle le firmware.`,amb_link_see_maint:`le ventilateur reste sur la courbe du boîtier · voir Maintenance`,amb_link_legacy:`Firmware sans HyperHDR : courbe du boîtier seule, pas d’arrêt propre`,amb_link_none:`Aucun serveur HyperHDR (intégration HA-HyperHDR)`,amb_link_nopoweroff_t:`Pas d’arrêt propre`,amb_link_nopoweroff:`Le serveur HyperHDR n’a pas de bouton Éteindre : configure le SSH dans les options de l’intégration, sinon le Pi est coupé sans être éteint`,amb_box:`Boîtier Ambilight`,amb_online_short:`En ligne`,amb_entities:`{found}/{total} entités`,hh_capture:`Capture`,hh_effect:`Effet`,hh_color:`Couleur`,hh_none:`Aucune source`,hh_other:`Autre source`,hh_live:`Direct`,hh_hdr:`HDR`,hh_smoothing:`Lissage`,hh_black_border:`Bandes`,hh_strips_one:`1 bandeau allumé`,hh_strips_other:`{count} bandeaux allumés`,hh_strips_none:`Bandeaux éteints`,hh_offline:`Hors ligne`,hh_undervoltage:`Sous-tension`,hh_undervoltage_detected:`Sous-tension détectée`,hh_hot:`Chauffe`,hh_power_ok:`Alim. OK`,hh_cpu:`CPU`,hh_ram:`RAM`,hh_fps:`{n} fps`,hh_leds:`{n} LED`,hh_tab_overview:`Aperçu`,hh_tab_colors:`Couleurs`,hh_tab_processing:`Traitement`,hh_tab_system:`Système`,hh_source:`Source`,hh_source_auto:`Automatique`,hh_source_forced:`Forcée : {source}`,hh_saturation:`Saturation`,hh_gamma:`Gamma`,hh_backlight:`Seuil sombre`,hh_color_temp:`Température de couleur`,hh_processing:`Image vers LED`,hh_smoothing_time:`Durée du lissage`,hh_smoothing_type:`Type de lissage`,hh_black_border_long:`Détection des bandes noires`,hh_black_border_mode:`Mode des bandes noires`,hh_tone_mapping:`HDR tone mapping`,hh_auto_tone:`Tone mapping automatique`,hh_continuous:`Sortie continue`,hh_anti_flicker:`Filtre anti-scintillement`,hh_background:`Effet de fond`,hh_boot:`Effet au démarrage`,hh_capture_switch:`Capture vidéo`,hh_led_output:`Sortie LED`,hh_led_output_off:`Sortie LED coupée`,hh_show_screen:`Afficher l’écran`,hh_extend:`Prolonger`,hh_stop:`Arrêter`,hh_screen_ended:`Arrêtée d’elle-même : le Pi ne l’encode pas quand personne ne regarde`,hh_grabber:`Grabber`,hh_no_signal:`Pas de signal`,hh_version:`Version`,hh_no_picture:`L’image demande le mot de passe admin dans l’intégration`,hh_not_found:`HyperHDR introuvable : ajoutez l’intégration HA-HyperHDR`,hh_temperature:`Température`,hh_memory:`Mémoire`,hh_effects:`Effets`,hh_connected:`Connecté`,hh_signal:`Signal reçu`,hh_power:`Alimentation`,hh_strips:`Bandeaux`,hh_admin_hint:`Plus de réglages avec le mot de passe admin dans l’intégration`,hh_picture:`Image captée`,hh_crop:`Recadrage`,hh_image:`Réglages de l’image`,hh_open_more:`Plus`,cc_range_30d:`30 j`,cc_temperature:`Température`,cc_humidity:`Humidité`,cc_pressure:`Pression`,cc_co2:`CO₂`,cc_comfort:`confort {range}`,cc_min:`Min`,cc_max:`Max`,cc_min_label:`min {value}`,cc_max_label:`max {value}`,cc_mean:`Moyenne`,cc_over:`sur {range}`,cc_outside:`Hors confort`,cc_below:`sous {value}`,cc_above:`au-dessus de {value}`,cc_both_sides:`{below} sous · {above} au-dessus`,cc_always_comfortable:`toujours dans le confort`,cc_yesterday_at:`Hier à {time}`,cc_vs_yesterday:`{diff} aujourd’hui`,cc_per_hour:`{value}/h`,cc_no_history:`Pas d’historique sur cette période`,cc_not_found:`Capteur introuvable`,cc_rooms:`{count} pièces · même échelle`,cc_history_of:`{kind} de {name} sur {range}`,cc_rooms_label:`{kind} de chaque pièce sur {range}`,cc_show_room:`Afficher {name}`,room_on_one:`1 allumée`,room_on_other:`{count} allumées`,room_all_off:`tout est éteint`,room_turn_off:`Tout éteindre : {room}`,room_turn_on:`Allumer : {room}`,led_expand:`Déplier`,led_collapse:`Replier`,led_screen_colors:`Couleurs suivies de l’écran · toucher pour reprendre la main`,led_ambilight_mode:`Ambilight`,led_ambilight_start:`Activer l’Ambilight : les bandeaux suivent l’écran`,led_ambilight_stop:`Couper l’Ambilight : les bandeaux reviennent à la carte`,led_box:`Boîtier Ambilight`,led_hyperhdr:`Serveur HyperHDR`,led_back_server:`Retour au serveur`,led_tab_leds:`LEDs`,led_tab_manager:`Ambilight Manager`,led_tab_hyperhdr:`HyperHDR`,rail_missing:`Boîtier Ambilight introuvable`,energy_bill:`Facture`,energy_bill_range:`du {from} au {to}`,energy_estimated:`estimée · jour {day} sur {total}`,energy_spent:`déjà {v}`,energy_previous:`préc. {v}`,energy_vs_previous:`{d} par rapport à la facture précédente ({v})`,energy_pace:`Rythme 7 j`,energy_per_day:`{v}/j`,energy_per_month:`{v}/mois`,energy_per_hour:`{v}/h`,energy_last_day:`Dernier jour`,energy_cycle_kwh:`Conso du cycle`,energy_part_energy:`Conso {v}`,energy_part_subscription:`Abonnement {v}`,energy_split_pending:`HP / HC dès les données horaires`,energy_peak:`Heures pleines`,energy_off_peak:`Heures creuses`,energy_peak_short:`HP`,energy_off_peak_short:`HC`,energy_subscription:`Abonnement`,energy_no_source:`Aucune source d’énergie : renseigne « energy », ou ajoute le réseau au tableau Énergie.`,energy_no_data:`Pas encore de données`,energy_loading:`Chargement…`,energy_expand:`Déplier`,energy_collapse:`Replier`,energy_next_if_same:`si le rythme reste le même`,energy_in_progress:`en cours · jour {day} sur {total}`,energy_bills:`Tes factures`,energy_bills_sub:`passées et à venir, coupées par poste`,energy_projection:`Projection`,energy_current_energy:`Conso du cycle en cours`,energy_where_title:`Où part chaque euro`,energy_where_sub:`extérieur en euros, intérieur en kWh`,energy_off_peak_note:`Les heures creuses font {k} des kWh mais seulement {e} de la facture.`,energy_calendar_sub:`prix du jour · barre HC / HP`,energy_month_total:`Total à date`,energy_day_today:`aujourd’hui`,energy_scale:`Jour sobre → jour cher`,energy_flow:`Flux d’énergie`,energy_flow_sub:`du compteur aux appareils`,energy_home:`Maison`,energy_untracked:`Non suivi`,energy_tracked:`Suivi`,energy_zoom:`LOUPE ×{z}`,energy_grid:`Réseau`,energy_devices:`Appareils`,energy_devices_sub:`au prix moyen réel, {p}/kWh`,energy_tracked_share:`{p} de ta consommation est identifiée.`,energy_period_day:`Jour`,energy_period_week:`Semaine`,energy_period_month:`Mois`,energy_period_year:`Année`,energy_curve:`La veille`,energy_curve_sub:`par heure · heures creuses en indigo`,energy_curve_waiting:`Les données horaires ne sont pas encore arrivées : Enedis les envoie une fois la collecte horaire activée.`,energy_standby:`veille ≈ {w}`,energy_standby_year:`Veille sur un an`,energy_cost:`Coût`,energy_left:`encore {d}`,energy_next_off_peak:`Prochaines HC : {range}`,energy_single_price:`Prix unique`,energy_last_days:`{n} derniers jours · moyenne {v}`,energy_vs_mean:`Écart à la moyenne`,energy_yesterday:`Hier`,energy_kwh_in_off_peak:`{v} en heures creuses`,energy_off_peak_target:`Le repère est à {p} : la part de la journée en heures creuses. Au-delà, la conso profite des heures creuses.`,energy_consumption:`Consommation`,energy_in_off_peak:`en heures creuses`,energy_kwh_days:`{k} · {d} j`,energy_previous_day:`Jour précédent`,energy_next_day:`Jour suivant`,energy_previous_month:`Mois précédent`,energy_next_month:`Mois suivant`,energy_no_devices:`Aucun appareil dans le tableau Énergie : ajoute des prises ou capteurs dans « Appareils individuels ».`,energy_off_peak_title:`Heures creuses`,energy_off_peak_sub:`extérieur kWh, intérieur €`,energy_others:`Autres`,energy_split_waiting:`La répartition HP / HC demande les données horaires, ou une facture avec ses kWh HP et HC.`,energy_tariff:`Tarif`,energy_previous_bill:`Facture précédente {v}`,energy_day_of:`J{day}/{total}`}};function dn(e){return e?.selectedLanguage||e?.config?.language||e?.locale?.language||e?.language||`en`}function fn(e){return dn(e).split(`-`)[0]??`en`}function B(e,t,n={}){return(un[fn(e)]??ln)[t].replace(/\{(\w+)\}/g,(e,t)=>t in n?String(n[t]):e)}function pn(e,t){let n=Math.floor(t/60),r=Math.floor(n/60),i=Math.floor(r/24);return i>0?B(e,`days`,{d:i,h:r%24}):r>0?B(e,`hours`,{h:r,m:n%60}):B(e,`minutes`,{m:n})}function mn(e,t){if(t<60)return B(e,`dur_now`);let n=Math.floor(t/60);if(n<60)return B(e,`dur_min`,{m:n});let r=Math.floor(n/60);return r<24?B(e,`dur_hours`,{h:r}):B(e,`dur_days`,{d:Math.floor(r/24)})}function V(e,t,n=0){try{return new Intl.NumberFormat(dn(e),{maximumFractionDigits:n}).format(t)}catch{return t.toFixed(n)}}var H=o`
  /*
   * Badges take their background from --vivid-chip-context, which containers set
   * for their children (a tile sets it to --vivid-layer-2). It is never declared
   * on :host, so it inherits through shadow roots.
   */
  :host {
    --vivid-rgb-text: var(--rgb-primary-text-color, 255, 255, 255);
    /* Three surface levels: the page, what sits on it (tiles, badges), what sits in a tile. */
    --vivid-layer-0: var(--primary-background-color, #111111);
    --vivid-layer-1: var(
      --vivid-surface-color,
      var(--secondary-background-color, var(--card-background-color, #282828))
    );
    --vivid-layer-2: color-mix(in srgb, var(--vivid-layer-0) 70%, var(--vivid-layer-1));
    --vivid-line-color: var(--vivid-layer-1);
    --vivid-muted: var(--secondary-text-color, rgba(255, 255, 255, 0.6));
    /* Set --vivid-card-chip-height on a card to resize every control (compact layout). */
    --vivid-chip-height: var(--vivid-card-chip-height, 36px);
    --vivid-tile-radius: var(--vivid-card-tile-radius, 22px);
    --vivid-focus: var(--primary-color, #03a9f4);
  }
`,U=o`
  .reset {
    appearance: none;
    border: none;
    margin: 0;
    padding: 0;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .reset:focus-visible {
    outline: 2px solid var(--vivid-focus);
    outline-offset: 2px;
  }
`,hn=e=>e??D,gn=220,_n=90,vn=class extends O{static properties={label:{},content:{attribute:!1},open:{type:Boolean,reflect:!0},closeLabel:{attribute:`close-label`},wide:{type:Boolean,reflect:!0}};hideTimer;previousFocus;previousOverflow=``;swipe;constructor(){super(),this.open=!1,this.wide=!1}static styles=[H,U,o`
      :host {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: block;
        pointer-events: none;
        font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, inherit));
        color: var(--primary-text-color);
        -webkit-font-smoothing: antialiased;
      }
      :host([open]) {
        pointer-events: auto;
      }
      /* The top-layer wrapper: it covers the viewport and draws nothing itself. */
      dialog.layer {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        max-width: none;
        max-height: none;
        margin: 0;
        padding: 0;
        border: none;
        background: transparent;
        color: inherit;
        overflow: visible;
      }
      dialog.layer::backdrop {
        background: transparent;
      }
      .backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        opacity: 0;
        transition: opacity ${gn}ms ease;
      }
      :host([open]) .backdrop {
        opacity: 1;
      }
      .sheet {
        position: absolute;
        left: 50%;
        top: 50%;
        box-sizing: border-box;
        width: min(560px, calc(100vw - 32px));
        max-height: min(86vh, 900px);
        display: flex;
        flex-direction: column;
        border-radius: var(--vivid-card-radius, 28px);
        background: var(--vivid-layer-0);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
        opacity: 0;
        transform: translate(-50%, calc(-50% + 24px)) scale(0.98);
        transition:
          opacity ${gn}ms ease,
          transform ${gn}ms ease;
        outline: none;
      }
      :host([open]) .sheet {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
      @media (min-width: 601px) {
        :host([wide]) .sheet {
          width: min(920px, calc(100vw - 32px));
        }
      }
      .handle {
        flex: none;
        display: flex;
        justify-content: center;
        padding: 10px 0 2px;
        touch-action: none;
        cursor: grab;
      }
      .handle span {
        width: 40px;
        height: 4px;
        border-radius: 2px;
        background: rgba(var(--vivid-rgb-text), 0.22);
      }
      .close {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }
      .close:focus-visible {
        width: auto;
        height: auto;
        clip-path: none;
        padding: 6px 10px;
        border-radius: 12px;
        background: var(--vivid-layer-1);
      }
      .body {
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 6px 16px 20px;
      }
      @media (max-width: 600px) {
        .sheet {
          left: 0;
          right: 0;
          top: auto;
          bottom: 0;
          width: 100%;
          max-height: 90vh;
          border-radius: var(--vivid-card-radius, 28px) var(--vivid-card-radius, 28px) 0 0;
          transform: translateY(100%);
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
        :host([open]) .sheet {
          transform: translateY(var(--swipe-offset, 0px));
        }
        .body {
          padding: 4px 12px 16px;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .backdrop,
        .sheet {
          transition: none;
        }
      }
    `];show(){window.clearTimeout(this.hideTimer),this.isConnected||(this.previousFocus=document.activeElement,this.previousOverflow=document.body.style.overflow,document.body.appendChild(this),document.body.style.overflow=`hidden`),this.updateComplete.then(()=>this.raise()),requestAnimationFrame(()=>{this.open=!0,this.updateComplete.then(()=>{this.renderRoot.querySelector(`.sheet`)?.focus({preventScroll:!0})})})}hide(){this.isConnected&&(this.open=!1,window.clearTimeout(this.hideTimer),this.hideTimer=window.setTimeout(()=>this.unmount(),gn))}unmount(){window.clearTimeout(this.hideTimer),this.isConnected&&(this.open=!1,document.body.style.overflow=this.previousOverflow,this.layer()?.close(),this.remove(),this.previousFocus instanceof HTMLElement&&this.previousFocus.isConnected&&this.previousFocus.focus({preventScroll:!0}))}layer(){return this.renderRoot.querySelector(`dialog.layer`)}raise(){let e=this.layer();if(e&&!e.open&&typeof e.showModal==`function`)try{e.showModal()}catch{}}onCancel=e=>{e.preventDefault(),this.requestClose()};requestClose=()=>{N(this,`vivid-dialog-close-request`)};onKeyDown=e=>{e.key===`Escape`&&(e.stopPropagation(),this.requestClose())};setSwipeOffset(e){this.style.setProperty(`--swipe-offset`,`${e}px`)}onHandleDown=e=>{this.swipe={pointerId:e.pointerId,startY:e.clientY,offset:0},e.currentTarget.setPointerCapture(e.pointerId);let t=this.renderRoot.querySelector(`.sheet`);t&&(t.style.transition=`none`)};onHandleMove=e=>{e.pointerId===this.swipe?.pointerId&&(this.swipe.offset=Math.max(0,e.clientY-this.swipe.startY),this.setSwipeOffset(this.swipe.offset))};onHandleUp=e=>{if(e.pointerId!==this.swipe?.pointerId)return;let t=this.swipe.offset>_n;this.swipe=void 0;let n=this.renderRoot.querySelector(`.sheet`);n&&(n.style.transition=``),this.setSwipeOffset(0),t&&this.requestClose()};render(){return T`<dialog class="layer" @cancel=${this.onCancel}>
      <div class="backdrop" @click=${this.requestClose}></div>
      <div
        class="sheet"
        role="dialog"
        aria-modal="true"
        aria-label=${hn(this.label)}
        tabindex="-1"
        @keydown=${this.onKeyDown}
      >
        <div
          class="handle"
          @pointerdown=${this.onHandleDown}
          @pointermove=${this.onHandleMove}
          @pointerup=${this.onHandleUp}
          @pointercancel=${this.onHandleUp}
        >
          <span></span>
        </div>
        <button type="button" class="reset close" @click=${this.requestClose}>
          ${this.closeLabel??`Close`}
        </button>
        <div class="body">${this.content??D}</div>
      </div>
    </dialog>`}};z(`vivid-dialog`,vn);var W=Ve(class extends He{constructor(e){if(super(e),e.type!==Be.ATTRIBUTE||e.name!==`class`||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return` `+Object.keys(e).filter(t=>e[t]).join(` `)+` `}update(e,[t]){if(this.st===void 0){this.st=/* @__PURE__ */ new Set,e.strings!==void 0&&(this.nt=new Set(e.strings.join(` `).split(/\s/).filter(e=>e!==``)));for(let e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}let n=e.element.classList;for(let e of this.st)e in t||(n.remove(e),this.st.delete(e));for(let e in t){let r=!!t[e];r===this.st.has(e)||this.nt?.has(e)||(r?(n.add(e),this.st.add(e)):(n.remove(e),this.st.delete(e)))}return xe}});z(`vivid-chip`,class extends O{static properties={icon:{},label:{},tooltip:{},tone:{attribute:!1},wide:{type:Boolean},readonly:{type:Boolean},disabled:{type:Boolean,reflect:!0},pressed:{type:Boolean}};constructor(){super(),this.wide=!1,this.readonly=!1,this.disabled=!1}static styles=[H,o`
      :host {
        display: inline-flex;
        flex: none;
      }
      .chip {
        appearance: none;
        border: none;
        margin: 0;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: var(--vivid-chip-height);
        min-width: var(--vivid-chip-height);
        padding: 0 12px;
        border-radius: calc(var(--vivid-chip-height) / 2);
        /* The reference size of the halos; nothing above it changes a chip's. */
        --vivid-glow-size: 1;
        background: var(--chip-bg, var(--vivid-chip-context, var(--vivid-layer-1)));
        box-shadow: var(--chip-shadow, none);
        color: var(--primary-text-color);
        font: inherit;
        font-size: 13px;
        font-weight: 500;
        line-height: 1;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
        transition:
          background-color 0.4s ease,
          box-shadow 0.4s ease,
          transform 0.12s ease;
        -webkit-tap-highlight-color: transparent;
      }
      button.chip {
        cursor: pointer;
      }
      button.chip:active {
        transform: scale(0.95);
      }
      button.chip:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      button.chip:disabled {
        cursor: default;
        opacity: 0.45;
        transform: none;
      }
      .chip.icon-only {
        padding: 0;
        width: var(--vivid-chip-height);
      }
      .chip.wide {
        width: 56px;
      }
      .icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        color: var(--chip-icon, var(--primary-text-color));
        transition: color 0.4s ease;
      }
      .chip.pulse .icon {
        animation: vivid-pulse var(--chip-pulse, 2s) ease-in-out infinite;
        animation-play-state: var(--vivid-glow-play, running);
      }
      @keyframes vivid-pulse {
        0%,
        100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.18);
          opacity: 0.75;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .chip,
        .icon {
          transition: none;
        }
        .chip.pulse .icon {
          animation: none;
        }
      }
    `];render(){let e=this.tone??{},t=W({chip:!0,wide:this.wide,"icon-only":!this.label&&!this.wide,pulse:!!e.pulse}),n=k({"--chip-bg":e.background,"--chip-shadow":e.shadow,"--chip-icon":e.iconColor,"--chip-pulse":e.pulse}),r=T`${this.icon?T`<ha-icon class="icon" .icon=${this.icon}></ha-icon>`:D}${this.label?T`<span>${this.label}</span>`:D}`;return this.readonly?T`<span class=${t} style=${n} title=${hn(this.tooltip)}>
        ${r}
      </span>`:T`<button
      type="button"
      class=${t}
      style=${n}
      ?disabled=${this.disabled}
      title=${hn(this.tooltip)}
      aria-label=${hn(this.tooltip??this.label)}
      aria-pressed=${hn(this.pressed===void 0?void 0:String(this.pressed))}
    >
      ${r}
    </button>`}});function yn(e,t){return`${V(e,t,+(t<10))} W`}z(`vivid-light-header`,class extends O{static properties={hass:{attribute:!1},variant:{reflect:!0},icon:{},name:{},subtitle:{},iconColor:{attribute:!1},nameInteractive:{type:Boolean,attribute:`name-interactive`},lightEntity:{attribute:`light-entity`},available:{type:Boolean},isOn:{type:Boolean,attribute:`is-on`},rgb:{attribute:!1},colors:{attribute:!1},brightness:{type:Number},glowBoost:{type:Number,attribute:`glow-boost`},buttonTone:{attribute:!1},hideToggle:{type:Boolean,attribute:`hide-toggle`},badges:{attribute:!1},lightOptions:{attribute:!1},showPower:{type:Boolean,attribute:`show-power`},hasPower:{type:Boolean,attribute:`has-power`},watts:{type:Number},scale:{attribute:!1},powerEntity:{attribute:`power-entity`},showLiveOverride:{type:Boolean,attribute:`show-live-override`},liveOverride:{attribute:!1}};constructor(){super(),this.variant=`row`,this.nameInteractive=!1,this.available=!0,this.isOn=!1,this.showPower=!0,this.hasPower=!1,this.showLiveOverride=!0,this.hideToggle=!1}static styles=[H,U,o`
      :host {
        display: block;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: var(--vivid-chip-height);
      }
      :host([variant='summary']) .row {
        justify-content: center;
      }
      .title {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
        flex: 0 1 auto;
        padding: 4px 2px;
        border-radius: 10px;
      }
      .title ha-icon {
        --mdc-icon-size: 24px;
        display: inline-flex;
        flex: none;
        color: var(--primary-text-color);
      }
      .names {
        display: flex;
        flex-direction: column;
        min-width: 0;
        text-align: left;
      }
      .subtitle {
        font-size: 12px;
        line-height: 1.3;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .name {
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.01em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .line {
        flex: 1 1 24px;
        min-width: 12px;
        height: 6px;
        border-radius: 3px;
        background: var(--vivid-line-color);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
        flex: 0 1 auto;
        min-width: 0;
      }
      :host([variant='summary']) .chips {
        justify-content: center;
      }
      .muted {
        opacity: 0.55;
      }
    `];onNameClick=()=>{N(this,`vivid-name-click`)};onPowerClick=()=>{this.powerEntity&&N(this,`vivid-more-info`,{entityId:this.powerEntity})};onLiveOverrideClick=()=>{let e=this.liveOverride;this.hass&&e&&e.available.length!==0&&(P(this,`light`),ot(this.hass,e.available,e.active?`0`:`1`))};onToggleClick=()=>{if(this.hass){if(P(this,`light`),!this.lightEntity){N(this,`vivid-power-click`);return}et(this.hass,this.lightEntity,this.lightOptions)}};renderBadges(){return(this.badges??[]).map(e=>T`<vivid-chip
          class=${W({muted:!e.available})}
          .icon=${e.icon}
          .label=${e.label}
          .tooltip=${e.label?`${e.name} : ${e.label}`:e.name}
          .tone=${e.label===void 0?$t(e.active):void 0}
          @click=${()=>N(this,`vivid-more-info`,{entityId:e.entityId})}
        ></vivid-chip>`)}renderTitle(){if(this.variant===`summary`)return D;let e=T`<span class="name">${this.name}</span>`,t=T`<ha-icon
        .icon=${this.icon}
        style=${this.iconColor?`color: ${this.iconColor}`:``}
      ></ha-icon
      >${this.subtitle?T`<span class="names">${e}<span class="subtitle">${this.subtitle}</span></span>`:e}`;return T`${this.nameInteractive?T`<button
          type="button"
          class="reset title"
          title=${B(this.hass,`details`)}
          @click=${this.onNameClick}
        >
          ${t}
        </button>`:T`<div class="title">${t}</div>`}
      <div class="line"></div>`}renderPower(){if(!this.showPower||!this.hasPower||!this.scale)return D;let e=this.watts!==void 0,t=e?yn(this.hass,this.watts??0):`— W`,n=`${B(this.hass,`consumption`)} : ${t}`;return T`<vivid-chip
      class=${W({muted:!e})}
      .icon=${`mdi:flash`}
      .label=${t}
      .tooltip=${n}
      .tone=${Gt(this.watts,this.scale)}
      ?readonly=${!this.powerEntity}
      @click=${this.onPowerClick}
    ></vivid-chip>`}renderLiveOverride(){let e=this.liveOverride;if(!this.showLiveOverride||!e)return D;let t=e.available.length>0,n=!e.active;return T`<vivid-chip
      .icon=${`mdi:television-ambient-light`}
      .tooltip=${t?B(this.hass,n?`ambilight_on`:`ambilight_off`):B(this.hass,`live_override_unavailable`)}
      .tone=${en(n&&t)}
      .pressed=${n}
      ?disabled=${!t}
      @click=${this.onLiveOverrideClick}
    ></vivid-chip>`}render(){return T`<div class="row">
      ${this.renderTitle()}
      <div class="chips">
        ${this.renderBadges()} ${this.renderPower()} ${this.renderLiveOverride()}
        ${this.hideToggle?D:T`<vivid-chip
                wide
                .icon=${`mdi:power`}
                .tooltip=${B(this.hass,this.isOn?`power_off`:`power_on`)}
                .tone=${this.buttonTone?this.isOn?this.buttonTone:{}:Kt(this.colors?.length?this.colors:this.rgb,this.isOn,this.brightness??100,this.glowBoost??100)}
                .pressed=${this.isOn}
                ?disabled=${!this.available}
                @click=${this.onToggleClick}
              ></vivid-chip>`}
      </div>
    </div>`}});var bn=/* @__PURE__ */ new Set([`hs`,`rgb`,`rgbw`,`rgbww`,`xy`]);function xn(e){let t=e?.attributes?.supported_color_modes;return Array.isArray(t)?t:[]}function Sn(e){return xn(e).some(e=>bn.has(e))}function Cn(e){return xn(e).includes(`color_temp`)}function wn(e,t){if(e===`none`)return`none`;let n=Sn(t),r=Cn(t);return e===`hue`?n?`hue`:`none`:e===`temperature`?r?`temperature`:`none`:n?`hue`:r?`temperature`:`none`}function Tn(e){let t=e?.attributes??{},n=typeof t.min_color_temp_kelvin==`number`?t.min_color_temp_kelvin:2e3,r=typeof t.max_color_temp_kelvin==`number`?t.max_color_temp_kelvin:6535;return n<r?{min:n,max:r}:{min:2e3,max:6535}}var En=2e3,Dn=`linear-gradient(90deg, #ff0000 0%, #ffff00 16.67%, #00ff00 33.33%, #00ffff 50%, #0000ff 66.67%, #ff00ff 83.33%, #ff0000 100%)`,On=6;z(`vivid-color-bar`,class extends O{static properties={kind:{},value:{type:Number},min:{type:Number},max:{type:Number},disabled:{type:Boolean,reflect:!0},hue:{type:Number},label:{},_preview:{state:!0}};pointerId;pendingTimer;constructor(){super(),this.kind=`hue`,this.min=2e3,this.max=6535,this.disabled=!1,this.hue=0}static styles=[H,o`
      :host {
        display: block;
      }
      .track {
        position: relative;
        height: calc(var(--vivid-chip-height) - 2px);
        border-radius: calc(var(--vivid-chip-height) / 2 - 1px);
        cursor: pointer;
        touch-action: pan-y;
        -webkit-tap-highlight-color: transparent;
      }
      .track:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      :host([disabled]) .track {
        cursor: default;
        background: rgba(var(--vivid-rgb-text), 0.06) !important;
      }
      .thumb {
        position: absolute;
        top: 22%;
        bottom: 22%;
        width: 4px;
        border-radius: 2px;
        background: #fff;
        box-shadow: 0 0 0 1.5px rgba(0, 0, 0, 0.28);
        transform: translateX(-50%);
        pointer-events: none;
      }
    `];get range(){return this.kind===`hue`?[0,360]:this.kind===`saturation`?[0,100]:[this.min,this.max]}get step(){return this.kind===`hue`?10:this.kind===`saturation`?5:Math.max(Math.round((this.max-this.min)/20),50)}gradient(){return this.kind===`hue`?Dn:this.kind===`saturation`?`linear-gradient(90deg, #ffffff 0%, ${I(_t(this.hue,100))} 100%)`:`linear-gradient(90deg, ${Array.from({length:On},(e,t)=>{let n=t/5;return`${I(vt(this.min+(this.max-this.min)*n))} ${Math.round(n*100)}%`}).join(`, `)})`}willUpdate(e){e.has(`value`)&&this.pointerId===void 0&&(this._preview=void 0)}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this.pendingTimer)}valueAt(e){let t=e.currentTarget.getBoundingClientRect(),n=t.width>0?F((e.clientX-t.left)/t.width,0,1):0,[r,i]=this.range;return Math.round(r+(i-r)*n)}commit(e){this._preview=e,window.clearTimeout(this.pendingTimer),this.pendingTimer=window.setTimeout(()=>this._preview=void 0,En),N(this,`value-changed`,{value:e})}onPointerDown=e=>{this.disabled||e.button!==0||(e.stopPropagation(),this.pointerId=e.pointerId,e.currentTarget.setPointerCapture(e.pointerId),this._preview=this.valueAt(e))};onPointerMove=e=>{e.pointerId===this.pointerId&&(this._preview=this.valueAt(e))};onPointerUp=e=>{e.pointerId===this.pointerId&&(this.pointerId=void 0,this.commit(this.valueAt(e)))};onPointerCancel=e=>{e.pointerId===this.pointerId&&(this.pointerId=void 0,this._preview=void 0)};onKeyDown=e=>{if(this.disabled)return;let[t,n]=this.range,r=this._preview??this.value??t,i=e.key===`ArrowRight`||e.key===`ArrowUp`?r+this.step:e.key===`ArrowLeft`||e.key===`ArrowDown`?r-this.step:e.key===`Home`?t:e.key===`End`?n:void 0;i!==void 0&&(e.preventDefault(),e.stopPropagation(),this.commit(F(i,t,n)))};render(){let[e,t]=this.range,n=this._preview??this.value,r=`calc(7px + (100% - 14px) * ${n===void 0||t<=e?0:F((n-e)/(t-e),0,1)})`;return T`<div
      class="track"
      style=${k({background:this.gradient()})}
      role="slider"
      tabindex=${this.disabled?-1:0}
      aria-label=${hn(this.label)}
      aria-valuemin=${e}
      aria-valuemax=${t}
      aria-valuenow=${hn(n)}
      aria-disabled=${String(this.disabled)}
      @pointerdown=${this.onPointerDown}
      @pointermove=${this.onPointerMove}
      @pointerup=${this.onPointerUp}
      @pointercancel=${this.onPointerCancel}
      @keydown=${this.onKeyDown}
    >
      ${n===void 0?``:T`<div class="thumb" style=${k({left:r})}></div>`}
    </div>`}}),z(`vivid-select-chip`,class extends O{static properties={icon:{},value:{},options:{attribute:!1},tooltip:{},placeholder:{},disabled:{type:Boolean,reflect:!0}};constructor(){super(),this.options=[],this.disabled=!1}static styles=[H,o`
      :host {
        display: inline-flex;
        min-width: 0;
      }
      .chip {
        position: relative;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        max-width: 100%;
        height: var(--vivid-chip-height);
        padding: 0 10px 0 12px;
        border-radius: calc(var(--vivid-chip-height) / 2);
        background: var(--vivid-chip-context, var(--vivid-layer-1));
        color: var(--primary-text-color);
        font-size: 13px;
        font-weight: 500;
        -webkit-tap-highlight-color: transparent;
      }
      .chip:focus-within {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        flex: none;
      }
      .chevron {
        --mdc-icon-size: 16px;
        opacity: 0.7;
      }
      .value {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      select {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        /* 16px prevents iOS from zooming into the page when the picker opens. */
        font-size: 16px;
      }
      select:disabled {
        cursor: default;
      }
      :host([disabled]) .chip {
        opacity: 0.45;
      }
    `];onChange=e=>{let t=e.target,n=t.value;t.value=this.value??``,n&&n!==this.value&&N(this,`value-changed`,{value:n})};stop=e=>e.stopPropagation();render(){let e=this.value!==void 0&&this.options.includes(this.value);return T`<label class="chip" @pointerdown=${this.stop} title=${hn(this.tooltip)}>
      ${this.icon?T`<ha-icon .icon=${this.icon}></ha-icon>`:D}
      <span class="value">${this.value??this.placeholder??`—`}</span>
      <ha-icon class="chevron" .icon=${`mdi:chevron-down`}></ha-icon>
      <select
        aria-label=${hn(this.tooltip)}
        ?disabled=${this.disabled}
        @change=${this.onChange}
        @click=${this.stop}
      >
        ${e?D:T`<option value="" selected disabled>—</option>`}
        ${this.options.map(e=>T`<option .value=${e} ?selected=${e===this.value}>${e}</option>`)}
      </select>
    </label>`}});var kn=500,An=100,jn=8,Mn=10,Nn=2e3,Pn=5,Fn=400,In=250,Ln=24;function Rn(e){if(e.length===1){let[t,n,r]=e[0];return`rgba(${t}, ${n}, ${r}, 0.42)`}return`linear-gradient(90deg, ${e.map(([t,n,r],i)=>`rgba(${t}, ${n}, ${r}, 0.42) ${Math.round(i/(e.length-1)*100)}%`).join(`, `)})`}function zn(e,t=1,n=1){if(e<=0)return 0;let r=n>1?Math.round(e/n)*n:Math.round(e);return F(Math.max(r,t,1),1,100)}z(`vivid-light-tile`,class extends O{static properties={hass:{attribute:!1},entityId:{attribute:`entity-id`},icon:{},name:{},showName:{type:Boolean,attribute:`show-name`},showEffects:{type:Boolean,attribute:`show-effects`},showState:{type:Boolean,attribute:`show-state`},colorBar:{attribute:`color-bar`},saturationBar:{type:Boolean,attribute:`saturation-bar`},doubleTap:{type:Boolean,attribute:`double-tap`},favorites:{attribute:!1},badges:{attribute:!1},brightnessMin:{type:Number,attribute:`brightness-min`},brightnessStep:{type:Number,attribute:`brightness-step`},lightOptions:{attribute:!1},animateEffects:{type:Boolean,attribute:`animate-effects`},collapsible:{type:Boolean},collapsed:{type:Boolean},subtitle:{},capture:{attribute:!1},captureLabel:{attribute:`capture-label`},captureDrift:{type:Boolean,attribute:`capture-drift`},_preview:{state:!0}};gesture;pendingTimer;keyTimer;tapTimer;constructor(){super(),this.icon=`mdi:led-strip-variant`,this.showName=!1,this.showEffects=!0,this.showState=!0,this.colorBar=`hue`,this.saturationBar=!1,this.doubleTap=!1,this.favorites=[],this.badges=[],this.brightnessMin=1,this.brightnessStep=1,this.animateEffects=!0,this.collapsible=!1,this.collapsed=!1}static styles=[H,o`
      :host {
        display: block;
      }
      .tile {
        position: relative;
        overflow: hidden;
        isolation: isolate;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
        --vivid-chip-context: var(--vivid-layer-2);
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .fill {
        position: absolute;
        inset: 0 auto 0 0;
        width: var(--fill, 0%);
        background: rgba(var(--tile-rgb, 255, 214, 170), 0.42);
        z-index: -1;
        transition:
          width 0.25s ease,
          background-color 0.4s ease;
        pointer-events: none;
      }
      .tile.sliding .fill {
        transition: background-color 0.4s ease;
      }
      .tile.effect .fill::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          100deg,
          transparent 20%,
          rgba(255, 255, 255, 0.16) 45%,
          rgba(var(--tile-rgb, 255, 214, 170), 0.35) 55%,
          transparent 80%
        );
        background-size: 250% 100%;
        animation: vivid-shimmer 3.2s ease-in-out infinite;
      }
      @keyframes vivid-shimmer {
        0% {
          background-position: 120% 0;
        }
        100% {
          background-position: -120% 0;
        }
      }
      .favorites {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0 2px;
      }
      .swatch {
        appearance: none;
        border: none;
        margin: 0;
        padding: 0;
        width: calc(var(--vivid-chip-height) - 6px);
        height: calc(var(--vivid-chip-height) - 6px);
        border-radius: 50%;
        background: var(--swatch);
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.18);
        cursor: pointer;
        position: relative;
        transition: transform 0.12s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .swatch:active {
        transform: scale(0.9);
      }
      .swatch:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .swatch.current {
        box-shadow:
          0 0 0 2px var(--vivid-layer-1),
          0 0 0 4px var(--primary-text-color);
      }
      .swatch .level {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: 10px;
        font-weight: 700;
        color: var(--level-color);
      }
      .badges {
        display: flex;
        gap: 6px;
        flex: 0 1 auto;
        min-width: 0;
        overflow: hidden;
      }
      .swatch:disabled {
        opacity: 0.45;
        cursor: default;
      }
      .surface {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: calc(var(--vivid-chip-height) + 4px);
        border-radius: 16px;
        cursor: pointer;
        touch-action: pan-y;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      .surface:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .icon {
        flex: none;
        display: grid;
        place-items: center;
        width: calc(var(--vivid-chip-height) + 4px);
        height: calc(var(--vivid-chip-height) + 4px);
        border-radius: 50%;
        background: var(--vivid-layer-2);
        color: var(--vivid-muted);
        transition: color 0.4s ease;
      }
      .tile.on .icon {
        color: var(--primary-text-color);
      }
      .icon ha-icon {
        --mdc-icon-size: 22px;
        display: inline-flex;
      }
      .text {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1;
        line-height: 1.25;
      }
      .name {
        font-size: 14px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .state {
        font-size: 13px;
        color: var(--vivid-muted);
        font-variant-numeric: tabular-nums;
      }
      .tile.on .state {
        color: var(--primary-text-color);
      }
      vivid-select-chip {
        flex: 0 1 auto;
        max-width: 55%;
      }
      .tile.unavailable {
        opacity: 0.55;
      }
      .tile.unavailable .surface {
        cursor: default;
      }
      /* Screen colors (Ambilight): a gradient fill, the color bar behind a veil. */
      .tile.captured .fill {
        background: var(--capture-fill);
      }
      /* The screen's colors drift, like a picture. */
      .tile.captured.drift .fill,
      .tile.captured.drift.on .icon {
        animation: vivid-capture-drift 8s linear infinite;
        animation-play-state: var(--vivid-glow-play, running);
      }
      @keyframes vivid-capture-drift {
        to {
          filter: hue-rotate(360deg);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .tile.captured.drift .fill,
        .tile.captured.drift.on .icon {
          animation: none;
        }
      }
      .bar-wrap {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .bar-wrap.captured > vivid-color-bar {
        opacity: 0.25;
        pointer-events: none;
      }
      .take {
        appearance: none;
        border: none;
        margin: 0;
        background: transparent;
        font: inherit;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        padding: 0 12px;
        border-radius: 20px;
        font-size: 12.5px;
        font-weight: 600;
        line-height: 1.2;
        text-align: center;
        color: #fff;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
      }
      /* Collapsible: a 64 px line; the rest unfolds under it in the same tile. */
      .tile.collapsible {
        padding: 12px;
        gap: 0;
      }
      .tile.collapsible .name {
        font-size: 15px;
        font-weight: 700;
      }
      .tile.collapsible .state {
        font-size: 12.5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tile.collapsible.on .icon {
        color: rgb(var(--tile-rgb, 255, 214, 170));
      }
      .tile.collapsible.collapsed.on .icon {
        box-shadow: 0 0 14px rgba(var(--tile-rgb, 255, 214, 170), 0.5);
      }
      .tile.collapsed .fill {
        background: rgba(var(--tile-rgb, 255, 214, 170), 0.24);
      }
      .tile.collapsed.captured .fill {
        background: var(--capture-fill);
        opacity: 0.6;
      }
      .actions {
        display: flex;
        align-items: center;
        gap: 6px;
        flex: none;
      }
      .more {
        display: grid;
        grid-template-rows: 1fr;
        transition: grid-template-rows 0.28s ease;
      }
      .tile.collapsed .more {
        grid-template-rows: 0fr;
      }
      .more-inner {
        min-height: 0;
        overflow: hidden;
        /* Room for the focus ring and the current favorite's ring. */
        margin: 0 -4px -4px;
      }
      .more-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px 4px 4px;
      }
      .take:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      @media (prefers-reduced-motion: reduce) {
        .more {
          transition: none;
        }
        .fill,
        .icon,
        .swatch {
          transition: none;
        }
        .tile.effect .fill::after {
          animation: none;
          display: none;
        }
      }
    `];shouldUpdate(e){return e.size===1&&e.has(`hass`)&&this.entityId?e.get(`hass`)?.states[this.entityId]!==this.hass?.states[this.entityId]:!0}willUpdate(e){if(e.has(`hass`)&&this.gesture===void 0&&this.keyTimer===void 0){let t=e.get(`hass`);this.entityId&&t?.states[this.entityId]!==this.hass?.states[this.entityId]&&(this._preview=void 0)}}disconnectedCallback(){super.disconnectedCallback(),this.resetGesture(),window.clearTimeout(this.pendingTimer),window.clearTimeout(this.keyTimer),window.clearTimeout(this.tapTimer)}emit(e){P(this,e===`hold`?`medium`:`light`),N(this,`vivid-gesture`,{gesture:e,entityId:this.entityId})}tap(){if(!this.doubleTap){this.emit(`tap`);return}if(this.tapTimer!==void 0){window.clearTimeout(this.tapTimer),this.tapTimer=void 0,this.emit(`double_tap`);return}this.tapTimer=window.setTimeout(()=>{this.tapTimer=void 0,this.emit(`tap`)},In)}get stateObj(){return this.entityId?this.hass?.states[this.entityId]:void 0}get available(){return j(this.stateObj)}currentBrightness(){let e=this.stateObj;if(!e||e.state!==`on`)return 0;let t=e.attributes.brightness;return typeof t==`number`?Math.round(t/255*100):100}percentAt(e){let t=this.renderRoot.querySelector(`.tile`)?.getBoundingClientRect();return!t||t.width===0?0:Math.round(F((e-t.left)/t.width,0,1)*100)}holdPending(){window.clearTimeout(this.pendingTimer),this.pendingTimer=window.setTimeout(()=>this._preview=void 0,Nn)}snap(e){return zn(e,this.brightnessMin,this.brightnessStep)}commitBrightness(e){if(!this.hass||!this.entityId)return;let t=this.snap(e);this._preview=t,this.holdPending(),nt(this.hass,this.entityId,t,this.lightOptions)}resetGesture(){this.gesture?.holdTimer!==void 0&&window.clearTimeout(this.gesture.holdTimer),this.gesture=void 0,this.renderRoot.querySelector(`.tile`)?.classList.remove(`sliding`)}onPointerDown=e=>{if(!this.available||e.button!==0||this.gesture)return;let t={pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,sliding:!1,cancelled:!1,held:!1};t.holdTimer=window.setTimeout(()=>{!this.gesture||this.gesture.sliding||this.gesture.cancelled||(this.gesture.held=!0,this.emit(`hold`))},kn),this.gesture=t;try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}};onPointerMove=e=>{let t=this.gesture;if(!t||e.pointerId!==t.pointerId||t.cancelled||t.held)return;let n=e.clientX-t.startX,r=e.clientY-t.startY;if(!t.sliding){if(Math.abs(r)>Mn&&Math.abs(r)>Math.abs(n)){t.cancelled=!0,window.clearTimeout(t.holdTimer);return}if(Math.abs(n)<jn)return;t.sliding=!0,window.clearTimeout(t.holdTimer),this.renderRoot.querySelector(`.tile`)?.classList.add(`sliding`)}this._preview=this.snap(this.percentAt(e.clientX))};onPointerUp=e=>{let t=this.gesture;if(t&&e.pointerId===t.pointerId){if(this.resetGesture(),t.sliding){P(this,`light`),this.commitBrightness(this.percentAt(e.clientX));return}!t.cancelled&&!t.held&&this.tap()}};onPointerCancel=e=>{e.pointerId===this.gesture?.pointerId&&(this.resetGesture(),this._preview=void 0)};onKeyDown=e=>{if(e.target!==e.currentTarget||!this.available||!this.hass||!this.entityId)return;if(e.key===`Enter`||e.key===` `){e.preventDefault(),this.emit(`tap`);return}let t=this._preview??this.currentBrightness(),n=Math.max(this.brightnessStep,Pn),r=e.key===`ArrowRight`||e.key===`ArrowUp`?t+n:e.key===`ArrowLeft`||e.key===`ArrowDown`?t-n:e.key===`Home`?0:e.key===`End`?100:void 0;r!==void 0&&(e.preventDefault(),this._preview=F(r,0,100),window.clearTimeout(this.keyTimer),this.keyTimer=window.setTimeout(()=>{this.keyTimer=void 0,this._preview!==void 0&&this.commitBrightness(this._preview)},Fn))};onEffectChanged=e=>{this.hass&&this.entityId&&at(this.hass,this.entityId,e.detail.value)};onColorChanged=e=>{if(!this.hass||!this.entityId)return;if(this.colorBar===`temperature`){st(this.hass,this.entityId,e.detail.value,this.lightOptions);return}let t=this.saturationBar?this.currentHs()[1]:An;rt(this.hass,this.entityId,e.detail.value,t,this.lightOptions)};currentHs(){let e=this.stateObj?.attributes?.hs_color;return[Array.isArray(e)&&typeof e[0]==`number`?e[0]:0,Array.isArray(e)&&typeof e[1]==`number`?e[1]:An]}onSaturationChanged=e=>{if(!this.hass||!this.entityId)return;let[t]=this.currentHs();rt(this.hass,this.entityId,t,e.detail.value,this.lightOptions)};renderBadges(){return this.badges.length===0?D:T`<div class="badges" @pointerdown=${e=>e.stopPropagation()}>
      ${this.badges.map(e=>T`<vivid-chip
            .icon=${e.icon}
            .label=${e.label}
            .tooltip=${e.label?`${e.name} : ${e.label}`:e.name}
            .tone=${e.label===void 0?$t(e.active):void 0}
            ?disabled=${!e.available}
            @click=${t=>{t.stopPropagation(),N(this,`vivid-more-info`,{entityId:e.entityId})}}
          ></vivid-chip>`)}
    </div>`}applyFavorite(e){this.hass&&this.entityId&&(P(this,`light`),it(this.hass,this.entityId,e,this.lightOptions))}renderFavorites(e,t){if(this.favorites.length===0)return D;let n=e?yt(this.stateObj):void 0;return T`<div class="favorites" role="group" aria-label=${B(this.hass,`favorites`)}>
      ${this.favorites.map(e=>{let r=e.rgb??vt(e.kelvin??2700),i=e.rgb?`rgb(${e.rgb.join(`, `)})`:`${Math.round(e.kelvin??0)} K`,a=e.brightness===void 0?``:`${Math.round(e.brightness)}`,o=(.299*r[0]+.587*r[1]+.114*r[2])/255;return T`<button
          type="button"
          class=${W({swatch:!0,current:n!==void 0&&Ct(n,r)<Ln})}
          style=${k({"--swatch":I(r),"--level-color":o>.6?`rgba(0, 0, 0, 0.65)`:`#ffffff`})}
          title=${a?`${i} · ${a} %`:i}
          aria-label=${a?`${i} · ${a} %`:i}
          ?disabled=${!t}
          @click=${()=>this.applyFavorite(e)}
        >
          ${a?T`<span class="level">${a}</span>`:D}
        </button>`})}
    </div>`}renderBars(e,t){let n=this.renderColorBar(e,t),r=(this.capture?.length??0)>0;return n===D||!r?n:T`<div class="bar-wrap captured">
      ${n}
      <button
        type="button"
        class="take"
        @click=${()=>{P(this,`light`),N(this,`vivid-take-control`,{entityId:this.entityId})}}
      >
        ${this.captureLabel}
      </button>
    </div>`}renderColorBar(e,t){if(this.colorBar===`none`)return D;let n=this.stateObj?.attributes??{},r;if(this.colorBar===`hue`){let t=n.hs_color;r=e&&Array.isArray(t)&&typeof t[0]==`number`?t[0]:void 0}else e&&n.color_mode===`color_temp`&&(r=n.color_temp_kelvin??void 0);let i=Tn(this.stateObj),a=T`<vivid-color-bar
      .kind=${this.colorBar}
      .value=${r}
      .min=${i.min}
      .max=${i.max}
      .label=${B(this.hass,this.colorBar===`hue`?`hue`:`temperature`)}
      ?disabled=${!t}
      @value-changed=${this.onColorChanged}
    ></vivid-color-bar>`;if(this.colorBar!==`hue`||!this.saturationBar)return a;let[o,s]=this.currentHs();return T`${a}
      <vivid-color-bar
        class="saturation"
        .kind=${`saturation`}
        .hue=${o}
        .value=${e?s:void 0}
        .label=${B(this.hass,`saturation`)}
        ?disabled=${!t}
        @value-changed=${this.onSaturationChanged}
      ></vivid-color-bar>`}render(){let e=this.stateObj;if(!e)return D;let t=e.attributes,n=this.available,r=n&&e.state===`on`,i=this._preview??this.currentBrightness(),a=yt(e),o=Array.isArray(t.effect_list)?t.effect_list:[],s=r||this._preview!==void 0&&this._preview>0,c=n?s?`${i} %`:B(this.hass,`off`):B(this.hass,`unavailable`),l=this.capture?.length?this.capture:void 0,u=k({"--fill":s||l?`${l&&!s?100:i}%`:`0%`,"--tile-rgb":l?l[0].join(`, `):a?a.join(`, `):void 0,"--capture-fill":l?Rn(l):void 0}),d=this.collapsible&&this.collapsed,f=typeof t.effect==`string`&&t.effect?t.effect:void 0,p=[c,d&&this.showEffects&&r?f:void 0,this.subtitle].filter(Boolean).join(` · `),m=t.effect,h=this.animateEffects&&r&&typeof m==`string`&&![`solid`,`none`,`off`,``].includes(m.toLowerCase()),g=T`${this.renderBars(r,n)} ${this.renderFavorites(r,n)}`;return T`<div
      part="tile"
      class=${W({tile:!0,on:s,unavailable:!n,effect:h,captured:l!==void 0,drift:l!==void 0&&this.captureDrift,collapsible:this.collapsible,collapsed:d})}
      style=${u}
    >
      <div class="fill"></div>
      <div
        class="surface"
        role="slider"
        tabindex=${n?0:-1}
        aria-label=${`${this.name??``} ${B(this.hass,`brightness`)}`.trim()}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow=${i}
        aria-valuetext=${c}
        aria-disabled=${String(!n)}
        @pointerdown=${this.onPointerDown}
        @pointermove=${this.onPointerMove}
        @pointerup=${this.onPointerUp}
        @pointercancel=${this.onPointerCancel}
        @keydown=${this.onKeyDown}
        @contextmenu=${e=>e.preventDefault()}
      >
        <div class="icon"><ha-icon .icon=${this.icon}></ha-icon></div>
        <div class="text">
          ${(this.showName||this.collapsible)&&this.name?T`<span class="name">${this.name}</span>`:D}
          ${this.showState?T`<span class="state">${this.collapsible?p:c}</span>`:D}
        </div>
        ${d?D:this.renderBadges()}
        ${!d&&this.showEffects&&o.length>0?T`<vivid-select-chip
                .icon=${`mdi:format-list-bulleted`}
                .value=${t.effect??void 0}
                .options=${o}
                .tooltip=${B(this.hass,`effect`)}
                .placeholder=${B(this.hass,`effect`)}
                ?disabled=${!n}
                @value-changed=${this.onEffectChanged}
              ></vivid-select-chip>`:D}
        ${this.collapsible?T`<div
                class="actions"
                @pointerdown=${e=>e.stopPropagation()}
                @click=${e=>e.stopPropagation()}
              >
                <slot name="actions"></slot>
              </div>`:D}
      </div>
      ${this.collapsible&&(this.colorBar!==`none`||this.favorites.length>0)?T`<div class="more" ?inert=${d} aria-hidden=${d?`true`:`false`}>
              <div class="more-inner"><div class="more-body">${g}</div></div>
            </div>`:this.collapsible?D:g}
    </div>`}});var Bn=`vivid-ambilight-card`,Vn=`salon_salon_ambilight_manager_`,Hn={online:`binary_sensor.node_status`,temperature:`sensor.temperature`,humidity:`sensor.humidity`,pressure:`sensor.pressure`,temperatureBmp:`sensor.temperature_bmp280`,overheat:`binary_sensor.overheat`,rssi:`sensor.wifi_rssi`,uptime:`sensor.uptime`,ip:`sensor.device_ip`,ssid:`sensor.wifi_ssid`,fan:`fan.jonsbo_fan`,fanMode:`select.fan_mode`,fanControl:`sensor.fan_control`,fanTarget:`sensor.fan_target_speed`,rpmRaw:`sensor.jonsbo_fan_rpm_raw`,rpm:`sensor.jonsbo_fan_rpm`,stalled:`binary_sensor.fan_stalled`,fan0:`button.fan_off`,fan25:`button.fan_25`,fan50:`button.fan_50`,fan75:`button.fan_75`,fan100:`button.fan_100`,t1:`number.fan_auto_t1`,s1:`number.fan_auto_s1`,t2:`number.fan_auto_t2`,s2:`number.fan_auto_s2`,t3:`number.fan_auto_t3`,s3:`number.fan_auto_s3`,t4:`number.fan_auto_t4`,s4:`number.fan_auto_s4`,hysteresis:`number.fan_auto_hysteresis`,overheatTemp:`number.fan_auto_overheat_temp`,stopBelowT1:`switch.fan_auto_stop_below_t1`,hdmi1:`button.hdmi_input_1`,hdmi2:`button.hdmi_input_2`,hdmi3:`button.hdmi_input_3`,hdmi4:`button.hdmi_input_4`,hdmi5:`button.hdmi_input_5`,hdmiActive:`sensor.hdmi_active_input`,irVerified:`binary_sensor.ir_last_send_verified`,irStatus:`sensor.ir_status`,irLast:`sensor.ir_last_received`,irCodes:`sensor.ir_stored_codes`,learn1:`button.ir_learn_1_start_capture`,learn2:`button.ir_learn_2_finish_capture`,learn3:`button.ir_learn_3_test_replay`,learn4:`button.ir_learn_4_save_to_target_input`,learnTarget:`select.ir_learn_target_input`,learnCancel:`button.ir_learn_cancel`,learnClear:`button.ir_learn_clear_target_input`,relay:`switch.relay`,relayPulse:`button.test_relay_pulse_3_s_may_cut_the_pi`,refresh:`button.test_sensors_refresh_now`,restart:`button.restart`,testStatus:`sensor.test_status`,irDebug:`switch.ir_debug`,ledSteady:`switch.test_ir_led_steady_on_10_s_camera`,burst:`button.test_ir_38_khz_burst_1_s_camera`,echoTest:`button.test_ir_echo_test_led_receiver`,sendCaptured:`button.test_ir_send_captured_code_standard_tx_no_check`,rxFrames:`sensor.test_ir_rx_frames`,fanSelfTest:`button.test_fan_self_test`,fanSweep:`button.test_fan_sweep`,fanStopTests:`button.test_fan_stop_tests`,pwm:`number.test_fan_pwm_frequency`,piPower:`switch.pi_power`,piStatus:`sensor.pi_status`,fanSource:`sensor.fan_source`,fanControlTemp:`sensor.fan_control_temperature`,cpuOverheat:`binary_sensor.cpu_overheat`,c1:`number.fan_cpu_t1`,cs1:`number.fan_cpu_s1`,c2:`number.fan_cpu_t2`,cs2:`number.fan_cpu_s2`,c3:`number.fan_cpu_t3`,cs3:`number.fan_cpu_s3`,c4:`number.fan_cpu_t4`,cs4:`number.fan_cpu_s4`,cpuOverheatTemp:`number.fan_cpu_overheat_temp`,piMinSpeed:`number.fan_auto_min_speed_pi_on_without_cpu_temp`},Un=[`piPower`,`piStatus`,`fanSource`,`fanControlTemp`,`cpuOverheat`,`c1`,`cs1`,`c2`,`cs2`,`c3`,`cs3`,`c4`,`cs4`,`cpuOverheatTemp`,`piMinSpeed`],Wn=[`line`,`tiles`],Gn=[`both`,`icon`,`name`],Kn=[`temperature`,`box`,`cpu`,`fan`,`humidity`,`pressure`,`rpm`],qn=[`temperature`,`fan`,`humidity`],Jn=`mdi:video-input-hdmi`;function Yn(e,t={}){let n={};for(let[r,i]of Object.entries(Hn)){let[a,o]=i.split(`.`);n[r]=t[r]??`${a}.${e}${o}`}return n}function Xn(e,t){let n=`HDMI ${t+1}`;return typeof e==`string`?{name:e.trim()||n,icon:Jn,hidden:!1}:{name:e?.name?.trim()||n,icon:e?.icon?.trim()||Jn,hidden:e?.hidden===!0}}function Zn(e){return typeof e==`string`&&e.includes(`.`)?e.trim():void 0}function Qn(e,t={}){if(!e||typeof e!=`object`)throw Error(`Invalid configuration`);let n=typeof e.prefix==`string`&&e.prefix.trim()?e.prefix.trim():t.prefix??`salon_salon_ambilight_manager_`,r=Array.from({length:5},(t,n)=>Xn(Array.isArray(e.inputs)?e.inputs[n]:void 0,n)),i={};if(e.entities&&typeof e.entities==`object`)for(let[t,n]of Object.entries(e.entities)){let e=Zn(n);e&&t in Hn&&(i[t]=e)}return{name:typeof e.name==`string`&&e.name.trim()?e.name.trim():void 0,hyperhdr:typeof e.hyperhdr==`string`&&e.hyperhdr.trim()?e.hyperhdr.trim():void 0,entities:Yn(n,i),inputs:r,sendCounterEntity:Zn(e.send_counter_entity),confirmPiOff:e.confirm_pi_off!==!1,layout:Wn.includes(e.layout)?e.layout:`line`,sourceDisplay:Gn.includes(e.source_display)?e.source_display:`both`,info:Array.isArray(e.info)?e.info.filter((e,t,n)=>Kn.includes(e)&&n.indexOf(e)===t):[...qn],showStatus:e.show_status!==!1,showPi:e.show_pi!==!1,glow:Dt(e.glow)??100}}var $n=`esphome`;function er(e,t){return Object.values(e.entities??{}).filter(e=>e.device_id===t).map(e=>e.entity_id)}function tr(e,t){let n=/* @__PURE__ */ new Map,r=Object.values(Hn).map(e=>{let[t,n]=e.split(`.`);return{domain:t,object:n}});for(let i of er(e,t)){let e=A(i),t=Ke(i);for(let i of r){if(i.domain!==e||!t.endsWith(i.object))continue;let r=t.slice(0,t.length-i.object.length);(!r||r.endsWith(`_`))&&n.set(r,(n.get(r)??0)+1)}}let i,a=0;for(let[e,t]of n)t>a&&(i=e,a=t);return i}function nr(e,t){let n=Object.keys(t);Un.every(n=>!e.states[t[n]])&&(n=n.filter(e=>!Un.includes(e)));let r=n.map(e=>t[e]).filter(t=>!e.states[t]);return{found:n.length-r.length,total:n.length,missing:r}}function rr(e,t){return{prefix:t.device?tr(e,t.device):void 0}}function ir(e,t,n){let r=[...e].sort((e,t)=>e.t-t.t),i=r[0],a=r[r.length-1];if(!i||!a)return 0;if(t<i.t)return n?0:i.s;if(t>=a.t)return a.s;for(let e=1;e<r.length;e+=1){let n=r[e],i=r[e-1];if(t<=n.t){let e=n.t-i.t;return e<=0?n.s:i.s+(t-i.t)/e*(n.s-i.s)}}return a.s}var ar=`ha_hyperhdr`,or=`LED instance`,sr=`Capture`;function cr(e){let t={};for(let n of Object.values(e.entities??{})){if(n.platform!==`ha_hyperhdr`||!n.device_id)continue;let e=`${n.entity_id.split(`.`)[0]??``}.${n.translation_key??`main`}`;(t[n.device_id]??={})[e]=n.entity_id}let n=Object.keys(t).filter(e=>t[e]?.[`binary_sensor.connected`]),r={};for(let[i,a]of Object.entries(t)){if(!a[`light.main`])continue;let t=e.devices?.[i]?.via_device_id,o=t&&n.includes(t)?t:n.length===1?n[0]:t;o&&(r[o]??=[]).push(i)}for(let t of Object.values(r))t.sort((t,n)=>lr(e,t).localeCompare(lr(e,n)));return{servers:n.sort(),instances:r,entities:t}}function lr(e,t){let n=e.devices?.[t];return n?.name_by_user||n?.name||`HyperHDR`}function ur(e,t,n){let r=t[n];return r?e.states[r]:void 0}function dr(e,t,n){return Qe(ur(e,t,n))}function fr(e,t,n){let r=ur(e,t,n);return j(r)&&r.state!==`unknown`&&r.state!==``?r.state:void 0}function pr(e,t,n){let r=ur(e,t,n);if(j(r)&&r.state!==`unknown`)return r.state===`on`}function mr(e){return e.connected?e.undervoltage||(e.temperature??0)>=80?`alarm`:(e.temperature??0)>=70?`warn`:`ok`:`offline`}function hr(e,t,n){let r=ur(e,n,`sensor.memory`),i=ur(e,n,`sensor.version`),a=ur(e,n,`sensor.grabber`),o=n[`camera.capture`],s={deviceId:t,name:lr(e,t),connected:pr(e,n,`binary_sensor.connected`)===!0,undervoltage:pr(e,n,`binary_sensor.undervoltage`),cpu:dr(e,n,`sensor.cpu`),temperature:dr(e,n,`sensor.cpu_temperature`),memory:dr(e,n,`sensor.memory`),memoryUsedMb:gr(r?.attributes.used_mb),memoryTotalMb:gr(r?.attributes.total_mb),captureFps:dr(e,n,`sensor.capture_fps`),grabber:fr(e,n,`sensor.grabber`)??(typeof a?.attributes.active==`string`?a.attributes.active:void 0),videoMode:fr(e,n,`sensor.video_mode`),version:fr(e,n,`sensor.version`),architecture:typeof i?.attributes.architecture==`string`?i.attributes.architecture:void 0,camera:o&&j(e.states[o])?o:void 0,entities:n};return{...s,health:mr(s)}}function gr(e){return typeof e==`number`&&Number.isFinite(e)?e:void 0}function _r(e){let t=e.architecture?.toLowerCase()??`arm`;return t.includes(`arm`)||t.includes(`aarch`)?`mdi:raspberry-pi`:`mdi:server`}var vr=[`hdr`,`smoothing`,`black_border`,`video_capture`,`led_output`,`auto_tone_mapping`,`continuous_output`,`anti_flickering`,`background_effect`,`boot_effect`];function yr(e,t,n){let r=fr(e,t,`sensor.visible_source`);return r===`videograbber`||r===`systemgrabber`?`capture`:r===`effect`?`effect`:r===`color`?`color`:r&&r!==`none`?`other`:n===`Solid`?`color`:n&&n!==`Capture`?`effect`:r===`none`?`none`:`capture`}function br(e,t){let n=ur(e,t,`sensor.led_device`),r=fr(e,t,`sensor.led_device`);if(!r)return;let i=n?.attributes.address;return{type:r,address:typeof i==`string`&&i?i:void 0}}function xr(e,t,n){let r=n[`light.main`]??``,i=e.states[r],a=i?.attributes??{},o=typeof a.effect==`string`?a.effect:void 0,s=yr(e,n,o),c=dr(e,n,`number.brightness_gain`),l={};for(let t of vr){let r=n[`switch.${t}`],i=r?e.states[r]:void 0;r&&i&&(l[t]={entity:r,on:i.state===`on`,available:j(i)})}let u=ur(e,n,`sensor.average_color`),d=n[`camera.led_colors`],f=ur(e,n,`sensor.visible_source`);return{deviceId:t,name:lr(e,t),light:r,available:j(i),on:i?.state===`on`,brightness:c??(typeof a.brightness==`number`?Math.round(a.brightness/255*100):void 0),source:s,effect:s===`effect`?o&&o!==`Capture`&&o!==`Solid`?o:typeof f?.attributes.origin==`string`?f.attributes.origin.split(`@`)[0]:void 0:void 0,effects:(a.effect_list??[]).filter(e=>e!==`Capture`&&e!==`Solid`),color:s===`color`&&Array.isArray(a.rgb_color)?a.rgb_color:void 0,average:j(u)?xt(u.attributes.rgb_color)??xt(u.state):void 0,outputFps:dr(e,n,`sensor.output_fps`),ledFps:dr(e,n,`sensor.led_fps`),ledCount:dr(e,n,`sensor.led_count`),device:br(e,n),toggles:l,ledCamera:d&&j(e.states[d])?d:void 0,entities:n}}function Sr(e,t,n,r){let i=n&&t.servers.includes(n)?n:r?Object.keys(t.instances).find(e=>t.instances[e]?.includes(r)):t.servers[0],a=i?t.entities[i]:void 0,o=i&&a?hr(e,i,a):void 0,s=(i?t.instances[i]:void 0)??[],c=r?t.entities[r]?.[`light.main`]?[r]:[]:s,l=s.map(n=>xr(e,n,t.entities[n]??{})),u=r?c.map(n=>l.find(e=>e.deviceId===n)??xr(e,n,t.entities[n]??{})):l;return{hub:o,instances:u,strips:l,watched:[...Object.values(a??{}),...u.flatMap(e=>Object.values(e.entities)),...l.filter(e=>!u.includes(e)).map(e=>e.light)]}}function Cr(e){let t=[[126,87,194],[38,198,218],[102,187,106],[255,167,38],[236,64,122],[92,107,192]],n=0;for(let t of e??``)n=n*31+t.charCodeAt(0)>>>0;return t[n%t.length]}var wr=[255,138,61],Tr=[102,187,106],Er=[255,167,38],Dr=[239,83,80],Or=[79,195,247];function kr(e){let t=Math.max(...e);return t<8?[90,90,90]:e.map(e=>Math.round(e/t*255))}function Ar(e){if(!e.length)return;let t=e=>.2126*e[0]+.7152*e[1]+.0722*e[2],n=[...e].sort((e,n)=>t(n)-t(e)),r=n[0],i=(e,t)=>Math.hypot(e[0]-t[0],e[1]-t[1],e[2]-t[2]),a=n.find(e=>i(kr(e),kr(r))>90)??r;return[kr(r),kr(a)]}function jr(e,t){if(e.source===`color`&&e.color)return e.color;if(e.source===`effect`)return e.average?kr(e.average):Cr(e.effect);let n=t??e.average;return n?kr(n):wr}function Mr(e){return e===`ok`?Tr:e===`warn`?Er:e===`alarm`?Dr:void 0}function Nr(e){if(!j(e))return;let t=e.state.trim();return t&&t!==`unknown`?t:void 0}function Pr(e){if(j(e)&&e.state!==`unknown`)return e.state===`on`}function Fr(e,t,n){let r=e.states[t],i=(e,t)=>{let n=r?.attributes[e];return typeof n==`number`&&Number.isFinite(n)?n:t};return{entityId:t,value:Qe(r),min:i(`min`,n.min),max:i(`max`,n.max),step:i(`step`,n.step)}}function Ir(e){let t=e?.match(/(\d+)/);if(!t)return;let n=Number(t[1])-1;return n>=0&&n<5?n:void 0}function Lr(e){let t=Array.from({length:5},()=>void 0);if(!e)return t;for(let n of e.split(`|`)){let e=n.match(/^\s*(\d+)\s*:\s*(.*?)\s*$/);if(!e)continue;let r=Number(e[1])-1;if(r<0||r>=5)continue;let i=e[2]??``;t[r]=i===``||i===`-`||i===`—`?null:i}return t}var Rr=[[25,[66,165,245]],[30,[102,187,106]],[38,[102,187,106]],[45,[255,193,7]],[50,[255,112,67]],[55,[239,83,80]]];function zr(e,t=55){if(e===void 0)return[255,193,7];let n=t-55;return on(Rr.map(([e,t])=>[e+n,t]),e)}function Br(e,t,n=Date.now()){let r=t.hub,i={connected:r?.entities[`binary_sensor.connected`],cpuTemperature:r?.entities[`sensor.cpu_temperature`],powerOff:r?.entities[`button.poweroff`]},a=r!==void 0&&t.power.clean&&i.powerOff===void 0,o=e=>({state:e,ids:i,noPowerOff:a});if(!r)return o(`none`);if(!t.cpu)return o(`legacy`);if(!r.connected)return o(`away`);if(t.fan.source===`cpu`)return o(`ok`);let s=Date.parse(e.states[i.connected??``]?.last_changed??``),c=Number.isFinite(s)&&n-s>=45e3;return o(r.temperature!==void 0&&c&&t.online?`unseen`:`waiting`)}function Vr(e,t){let n=cr(e),r=t&&n.entities[t]?t:n.servers.length===1?n.servers[0]:void 0,i=r?n.entities[r]:void 0;return r&&i?hr(e,r,i):void 0}function Hr(e){return e.available?e.on?`on`:`off`:`unknown`}function Ur(e,t){let n=t.entities,r=t=>e.states[n[t]],i=e=>Qe(r(e)),a=r(`online`),o=a?a.state===`on`:j(r(`fan`))||j(r(`relay`)),s=i(`temperature`),c=i(`temperatureBmp`),l=s??c,u=r(`fan`),d=r(`fanMode`),f=(d?.attributes.options??[]).filter(e=>typeof e==`string`),p=f.find(e=>/^auto/i.test(e)),m=f.find(e=>/^manual/i.test(e)),h=Nr(d),g=h?/^auto/i.test(h)?`auto`:`manual`:void 0,_=u?.attributes.percentage,v=u?.state===`on`,y=j(u)?v?typeof _==`number`?Math.round(_):void 0:0:void 0,b=Pr(r(`stalled`))===!0,x=Pr(r(`overheat`))===!0,ee=[1,2,3,4].map(t=>({index:t-1,t:Fr(e,n[`t${t}`],{min:15,max:80,step:.5}),s:Fr(e,n[`s${t}`],{min:0,max:100,step:1})})),S=e.states[n.c1]!==void 0,te=[1,2,3,4].map(t=>({index:t-1,t:Fr(e,n[`c${t}`],{min:30,max:90,step:.5}),s:Fr(e,n[`cs${t}`],{min:0,max:100,step:1})})),ne=Pr(r(`cpuOverheat`))===!0,C=Nr(r(`fanSource`))?.toLowerCase(),re=C===`cpu`?`cpu`:C===`box`?`box`:void 0,ie=Vr(e,t.hyperhdr),ae=ie?.connected?ie.temperature:void 0,oe=Lr(Nr(r(`irCodes`))),w=t.inputs.map((t,r)=>{let i=n[`hdmi${r+1}`];return{name:t.name,icon:t.icon,button:i,available:e.states[i]!==void 0&&e.states[i]?.state!==`unavailable`,code:oe[r]}}),se=r(`learnTarget`),ce=(se?.attributes.options??[]).filter(e=>typeof e==`string`),le=r(`relay`),ue=le?Date.parse(le.last_changed):NaN,de={available:j(le),on:le?.state===`on`,changedAt:Number.isFinite(ue)?ue:void 0},fe=[];o?(x&&fe.push(`overheat`),ne&&fe.push(`cpuoverheat`),b&&fe.push(`stalled`),l===void 0&&fe.push(`nosensor`)):fe.push(`offline`);let pe=new Set(Object.values(n));t.sendCounterEntity&&pe.add(t.sendCounterEntity);for(let e of Object.values(ie?.entities??{}))pe.add(e);let me=e.states[n.piPower];return{name:t.name??`Ambilight`,online:o,temperature:s,humidity:i(`humidity`),pressure:i(`pressure`),temperatureBmp:c,controlTemperature:re===`cpu`?i(`fanControlTemp`)??ae??l:l,cpuTemperature:ae,hub:ie,cpu:S?{points:te,overheat:Fr(e,n.cpuOverheatTemp,{min:50,max:95,step:1}),minSpeed:Fr(e,n.piMinSpeed,{min:0,max:100,step:5}),overheating:ne}:void 0,fan:{entityId:n.fan,available:j(u),on:v,percentage:y,mode:g,options:{auto:p,manual:m},target:i(`fanTarget`),control:Nr(r(`fanControl`)),rpm:i(`rpm`)??i(`rpmRaw`),stalled:b,overheat:x,source:re},curve:{points:ee,hysteresis:Fr(e,n.hysteresis,{min:0,max:10,step:.5}),overheat:Fr(e,n.overheatTemp,{min:30,max:90,step:1}),stopBelowT1:Pr(r(`stopBelowT1`))},hdmi:{active:Ir(Nr(r(`hdmiActive`))),verified:Pr(r(`irVerified`)),inputs:w},ir:{status:Nr(r(`irStatus`)),lastReceived:Nr(r(`irLast`)),target:Ir(Nr(se)),targetOptions:ce},relay:de,power:{entityId:me?n.piPower:n.relay,clean:me!==void 0,status:Nr(r(`piStatus`)),stopping:/^(pi )?shutting/i.test(Nr(r(`piStatus`))??``)&&de.on},pi:Hr(de),alarms:fe,diag:{rssi:i(`rssi`),ip:Nr(r(`ip`)),ssid:Nr(r(`ssid`)),uptime:i(`uptime`)},tests:{status:Nr(r(`testStatus`)),rxFrames:i(`rxFrames`),pwm:Fr(e,n.pwm,{min:50,max:1e3,step:1}),irDebug:Pr(r(`irDebug`)),ledSteady:Pr(r(`ledSteady`))},watched:[...pe]}}var Wr=5e3;function Gr(e,t){let n=e.states[t.entities.hdmiActive],r=e.states[t.entities.irVerified],i=t.sendCounterEntity?e.states[t.sendCounterEntity]:void 0;return{active:Ir(Nr(n)),activeChanged:n?.last_changed,verified:Pr(r),verifiedChanged:r?.last_changed,counter:i?.state}}function Kr(e,t,n){let r=e.before;if(r.counter!==void 0&&t.counter!==void 0&&t.counter!==r.counter)return t.verified===!1?`fail`:`ok`;let i=t.verifiedChanged!==r.verifiedChanged,a=t.activeChanged!==r.activeChanged;return i&&t.verified===!1?`fail`:t.active===e.index&&(a||i)&&t.verified!==!1?`ok`:n-e.at<5e3?`pending`:r.active===e.index&&r.verified!==!1&&r.counter===void 0?`sent`:`fail`}function qr(e,t){let n=tr(e,t);return n!==void 0&&e.states[`switch.${n}relay`]!==void 0&&e.states[`fan.${n}jonsbo_fan`]!==void 0}var Jr=/* @__PURE__ */ new WeakMap;function Yr(e,t,n){let r=e.entities;if(!r)return n();let i=Jr.get(r);i||(i=/* @__PURE__ */ new Map,Jr.set(r,i));let a=e.devices,o=`${t}|${a?`d`:`-`}`,s=i.get(o);if(s&&s.devices===a)return s.value;let c=n();return i.set(o,{devices:a,value:c}),c}function Xr(e){return Yr(e,`boxes`,()=>Object.keys(e.devices??{}).filter(t=>qr(e,t)).sort())}function Zr(e){let t=A(e),n=Ke(e),r;for(let e of Object.values(Hn)){let[i,a]=e.split(`.`);if(i!==t||!n.endsWith(a))continue;let o=n.slice(0,n.length-a.length);(!o||o.endsWith(`_`))&&(r===void 0||o.length<r.length)&&(r=o)}return r}function Qr(e,t,n){let r=/* @__PURE__ */ new Set;for(let i of[t,...n]){let t=e.entities?.[i],n=t?.area_id??(t?.device_id?e.devices?.[t.device_id]?.area_id:void 0);n&&r.add(n)}return r}function $r(e,t,n){let r=t.box;if(r===!1)return;if(typeof r==`string`){if(e.devices?.[r])return{device:r};if(r.includes(`.`)){let t=e.entities?.[r]?.device_id;if(t)return{device:t};let n=Zr(r);if(n!==void 0)return{prefix:n}}return{device:r}}if(!t.enabled)return;let i=Xr(e);if(i.length!==1)return;let a=i[0],o=e.devices?.[a]?.area_id;return o!=null&&n.areas.has(o)||n.hyperhdrStrips>0?{device:a}:void 0}function ei(e,t){return{type:`custom:vivid-ambilight-card`,...`device`in e?{device:e.device}:{prefix:e.prefix||`salon_salon_ambilight_manager_`},...t.hyperhdr?{hyperhdr:t.hyperhdr}:{},...t.inputs?{inputs:t.inputs}:{},confirm_pi_off:t.confirmOff,layout:`line`}}function ti(e){if(e)return e.trim().toLowerCase().replace(/^[a-z]+:\/\//,``).replace(/[/?#].*$/,``).replace(/:\d+$/,``)||void 0}function ni(e,t,n){let r=Yr(e,`hyperhdr`,()=>cr(e));if(r.servers.length===0)return{instances:[],byStrip:/* @__PURE__ */ new Map,watched:[]};let i=Sr(e,r,n),a=/* @__PURE__ */ new Map;for(let e of i.strips){let t=ti(e.device?.address);t&&a.set(t,e)}let o=/* @__PURE__ */ new Map,s=new Set(i.watched);for(let n of t){let t=n.wledEntities.ip;if(!t)continue;s.add(t);let r=e.states[t],i=j(r)?ti(r.state):void 0,c=i?a.get(i):void 0;c&&o.set(n.entityId,c)}return{hub:i.hub,instances:i.strips,byStrip:o,watched:[...s]}}function ri(e){return e.available&&e.on&&e.toggles.led_output?.on!==!1}function ii(e,t,n){let r=n&&(!t.hub||t.hub.connected),i=[],a=[],o=[];if(!r)return{active:r,driven:i,overrides:a,colors:o};for(let n of e){let e=n.liveOverride;if(!n.ambilight||!e||!n.available||e.active)continue;let r=t.byStrip.get(n.entityId);(!r||ri(r))&&(i.push(n.entityId),e.available&&a.push(e.entityId),o.push(r?jr(r):n.rgb??wr))}return{active:r,driven:i,overrides:a,colors:o}}var ai=[`overheat`,`cpuoverheat`,`stalled`];function oi(e){if(!e.online)return;let t=ai.find(t=>e.alarms.includes(t));if(t)return t===`cpuoverheat`?{alarm:t,temperature:e.cpuTemperature}:t===`overheat`?{alarm:t,temperature:e.controlTemperature}:{alarm:t}}var si=[[255,120,40],[195,60,255],[0,180,216]];function ci(e,t,n=si){return e?n.length?[...n]:si:t.length?[...t]:[]}function li(e,t,n){let r=ni(e,n.detected,t.ambilight.hyperhdr),i=$r(e,t.ambilight,{areas:Qr(e,t.entity,n.detected.map(e=>e.entityId)),hyperhdrStrips:r.byStrip.size});if(!i)return;let a=ei(i,t.ambilight),o=Qn(a,Yr(e,`box:${JSON.stringify(a)}`,()=>rr(e,a))),s=Ur(e,o),c=o.entities,l=j(e.states[c.fan])||j(e.states[c.relay])||e.states[c.online]!==void 0?s:void 0;return{target:i,rail:a,boxConfig:o,box:l,hyperhdr:r,drive:ii(n.detected,r,l?.relay.on===!0),watched:[.../* @__PURE__ */ new Set([...s.watched,...r.watched])]}}function ui(e,t){return!!(e?.box?.relay.on&&t&&!t.active)}function di(e){return e?.box?.relay.on===!0}function fi(e,t){if(e){if(!e.piOn&&t.piOn)return!1;if(e.screen&&!t.screen&&t.piOn)return!0}}function pi(e,t){if(e){for(let n of t){if(!n.ambilight)continue;let t=e.hyperhdr.byStrip.get(n.entityId)?.ledCamera;if(t)return t}return e.hyperhdr.hub?.camera}}var mi=`vivid-led-group:expanded:`,hi=/* @__PURE__ */ new Map;function gi(){try{return typeof window>`u`?void 0:window.localStorage}catch{return}}function _i(e,t,n=gi()){let r=hi.get(e);if(r!==void 0)return r;try{let t=n?.getItem(mi+e);if(t===`1`||t===`0`){let n=t===`1`;return hi.set(e,n),n}}catch{}return t}function vi(e,t,n=gi()){hi.set(e,t);try{n?.setItem(mi+e,t?`1`:`0`)}catch{}}var yi=32,bi=18,xi=400,Si=1500;function Ci(e,t,n,r=24){let i=[],a=(n,r)=>{let i=(r*t+n)*4;return[e[i]??0,e[i+1]??0,e[i+2]??0]};for(let e=0;e<t;e+=1)i.push(a(e,0));for(let e=1;e<n;e+=1)i.push(a(t-1,e));for(let e=t-2;e>=0;--e)i.push(a(e,n-1));for(let e=n-2;e>0;--e)i.push(a(0,e));let o=[];for(let e=0;e<r;e+=1){let t=Math.floor(e/r*i.length),n=Math.max(t+1,Math.floor((e+1)/r*i.length));o.push(Qt(i.slice(t,n)))}return o}function wi(e){return e.length?`conic-gradient(from -60deg, ${[...e,e[0]].map((t,n)=>`${I(t)} ${(n/e.length*360).toFixed(1)}deg`).join(`, `)})`:`none`}z(`vivid-hyperhdr-screen`,class extends O{static properties={hass:{attribute:!1},camera:{},fallback:{attribute:!1},tags:{attribute:!1},placeholder:{},onDemand:{type:Boolean},timeout:{type:Number},labels:{attribute:!1},colors:{state:!0},live:{state:!0},left:{state:!0}};until;tick;ended=!1;url;observer;visible=!1;hideTimer;sampleTimer;canvas;tainted=!1;constructor(){super(),this.fallback=[],this.tags=[],this.colors=[],this.live=!1,this.onDemand=!1,this.timeout=120,this.labels={show:`Show`,extend:`Extend`,stop:`Stop`,live:`Live`,ended:``}}static styles=[H,o`
      :host {
        display: block;
      }
      .screen {
        position: relative;
        padding: 6px;
        border-radius: 16px;
        background: var(--vivid-layer-2);
      }
      .glow,
      .frame {
        position: absolute;
        border-radius: 16px;
        transition: background 0.6s ease;
      }
      .glow {
        inset: -4px;
        filter: blur(calc(14px * var(--vivid-glow, 1)));
        opacity: calc(0.7 * var(--vivid-glow-alpha, 1));
      }
      .frame {
        inset: 0;
      }
      .pic {
        position: relative;
        display: grid;
        place-items: center;
        aspect-ratio: 16 / 9;
        border-radius: 11px;
        overflow: hidden;
        background: #000;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 12px;
        text-align: center;
        font-size: 12.5px;
        color: rgba(255, 255, 255, 0.7);
      }
      .empty ha-icon {
        --mdc-icon-size: 28px;
        opacity: 0.7;
      }
      .tag {
        position: absolute;
        top: 8px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 8px;
        border-radius: 9px;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        font-size: 11px;
        font-weight: 600;
      }
      .tag.left {
        left: 8px;
      }
      .tag.right {
        right: 8px;
      }
      .ask {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: rgba(0, 0, 0, 0.35);
        color: rgba(255, 255, 255, 0.75);
        font-size: 12px;
      }
      button {
        appearance: none;
        border: none;
        font: inherit;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 34px;
        padding: 0 14px;
        border-radius: 17px;
        background: rgba(var(--vivid-rgb-text), 0.08);
        color: var(--primary-text-color);
        font-size: 13px;
        font-weight: 600;
      }
      button ha-icon {
        --mdc-icon-size: 17px;
        display: inline-flex;
      }
      button.big {
        height: 40px;
        padding: 0 18px;
        background: rgba(167, 139, 250, 0.28);
        color: #d6ccff;
        font-size: 14px;
        box-shadow: 0 0 18px rgba(167, 139, 250, 0.35);
      }
      button.quiet {
        color: var(--secondary-text-color);
      }
      .controls {
        position: relative;
        display: flex;
        gap: 6px;
        margin-top: 8px;
      }
      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--error-color, #ef5350);
        box-shadow: 0 0 6px var(--error-color, #ef5350);
      }
    `];connectedCallback(){super.connectedCallback(),document.addEventListener(`visibilitychange`,this.onVisibility),this.observer=new IntersectionObserver(e=>{this.visible=e.some(e=>e.isIntersecting),this.syncStream()}),this.observer.observe(this)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener(`visibilitychange`,this.onVisibility),this.observer?.disconnect(),this.observer=void 0,this.visible=!1,this.release()}onVisibility=()=>this.syncStream();willUpdate(e){e.has(`camera`)&&(this.url=void 0,this.tainted=!1,this.live&&this.stop(),this.syncStream())}wanted(){return this.onDemand&&this.until===void 0?!1:!!this.camera&&this.visible&&document.visibilityState===`visible`}ask(){this.ended=!1,this.until=Date.now()+this.timeout*1e3,window.clearInterval(this.tick),this.tick=window.setInterval(()=>this.countdown(),1e3),this.countdown(),this.syncStream()}release(){window.clearInterval(this.tick),this.tick=void 0,this.until=void 0,this.left=void 0,this.stop()}countdown(){if(this.until===void 0)return;let e=Math.ceil((this.until-Date.now())/1e3);if(e<=0){this.release(),this.ended=!0;return}this.left=e}syncStream(){if(window.clearTimeout(this.hideTimer),this.wanted()){this.live||this.start();return}this.live&&(this.hideTimer=window.setTimeout(()=>this.stop(),Si))}start(){let e=this.camera,t=e?this.hass?.states[e]?.attributes.access_token:void 0;e&&typeof t==`string`&&(this.url=`/api/camera_proxy_stream/${e}?token=${encodeURIComponent(t)}`,this.live=!0,window.clearInterval(this.sampleTimer),this.sampleTimer=window.setInterval(()=>this.sample(),xi))}stop(){window.clearInterval(this.sampleTimer),this.sampleTimer=void 0,this.url=void 0,this.live=!1}sample(){let e=this.renderRoot.querySelector(`img`);if(!e||!e.naturalWidth||this.tainted)return;this.canvas??=document.createElement(`canvas`);let t=this.canvas;t.width=yi,t.height=bi;let n=t.getContext(`2d`,{willReadFrequently:!0});if(n)try{n.drawImage(e,0,0,yi,bi);let{data:t}=n.getImageData(0,0,yi,bi),r=Ci(t,yi,bi);this.colors=r,N(this,`vivid-screen-colors`,{colors:r,mean:Qt(r)})}catch{this.tainted=!0}}renderAsk(){let e=this.labels;return!this.onDemand||!this.camera?D:this.until===void 0?T`<div class="ask">
        <button type="button" class="big" @click=${()=>this.ask()}>
          <ha-icon icon="mdi:monitor-eye"></ha-icon>${e.show}
        </button>
        ${this.ended&&e.ended?T`<small>${e.ended}</small>`:D}
      </div>`:D}renderControls(){if(!this.onDemand||this.until===void 0)return D;let e=this.labels;return T`<div class="controls">
      <button type="button" @click=${()=>this.ask()}>
        <ha-icon icon="mdi:timer-sand-complete"></ha-icon>${e.extend}
      </button>
      <button type="button" class="quiet" @click=${()=>this.release()}>
        <ha-icon icon="mdi:stop"></ha-icon>${e.stop}
      </button>
    </div>`}onError=()=>{this.stop(),window.setTimeout(()=>this.syncStream(),2e3)};render(){let e=wi(this.live&&this.colors.length?this.colors:this.fallback),[t,n]=this.tags,r=this.onDemand&&this.left!==void 0?`${this.labels.live} · ${Math.floor(this.left/60)}:${String(this.left%60).padStart(2,`0`)}`:t;return T`<div class="screen">
        <div class="glow" style=${k({background:e})}></div>
        <div class="frame" style=${k({background:e})}></div>
        <div class="pic">
          ${this.url?T`<img src=${this.url} alt="" @error=${this.onError} />`:this.onDemand&&this.camera?D:T`<div class="empty">
                    <ha-icon icon="mdi:monitor-screenshot"></ha-icon>${this.placeholder??D}
                  </div>`}
          ${r&&(!this.onDemand||this.live)?T`<span class="tag left"
                  >${this.live?T`<span class="dot"></span>`:D}${r}</span
                >`:D}
          ${n?T`<span class="tag right">${n}</span>`:D} ${this.renderAsk()}
        </div>
      </div>
      ${this.renderControls()}`}});function Ti(e){return Array.from({length:12},(t,n)=>{let r=.75+.25*Math.cos(n/12*Math.PI*2);return e.map(e=>Math.round(e*r))})}var Ei=4e3,Di=32,Oi=18,ki=6,Ai=70,ji=3,Mi=14,Ni=[60,60,72];function Pi(e){if(!e.length)return[];if(Math.max(...e.map(e=>Math.max(...e)))<Mi)return[Ni];let t=[],n=[...e].sort((e,t)=>Math.max(...t)-Math.max(...e));for(let e of n){if(Math.max(...e)<Mi)continue;let n=kr(e);if(t.every(e=>Ct(e,n)>Ai)&&t.push(n),t.length===ji)break}return t}var Fi=class{host;hass;colors;camera;active=!1;visible=!1;timer;busy=!1;observer;canvas;failures=0;constructor(e,t){this.host=e,this.hass=t,e.addController(this)}hostConnected(){typeof IntersectionObserver<`u`?(this.observer=new IntersectionObserver(e=>{this.visible=e.some(e=>e.isIntersecting),this.update()}),this.observer.observe(this.host)):this.visible=!0,document.addEventListener(`visibilitychange`,this.update)}hostDisconnected(){this.observer?.disconnect(),this.observer=void 0,document.removeEventListener(`visibilitychange`,this.update),this.stop()}sync(e,t){e!==this.camera&&(this.camera=e,this.failures=0,this.colors=void 0),this.active=t,t||(this.colors=void 0),this.update()}update=()=>{let e=this.active&&!!this.camera&&this.failures<3&&this.visible&&document.visibilityState===`visible`;e&&this.timer===void 0?(this.sample(),this.timer=window.setInterval(()=>void this.sample(),Ei)):e||this.stop()};stop(){this.timer!==void 0&&window.clearInterval(this.timer),this.timer=void 0}async sample(){let e=this.camera,t=e?this.hass()?.states[e]?.attributes.access_token:void 0;if(e&&typeof t==`string`&&!this.busy){this.busy=!0;try{let n=new Image;n.decoding=`async`,n.src=`/api/camera_proxy/${e}?token=${encodeURIComponent(t)}&t=${Date.now()}`,await n.decode(),this.canvas??=document.createElement(`canvas`);let r=this.canvas;r.width=Di,r.height=Oi;let i=r.getContext(`2d`,{willReadFrequently:!0});if(!i)return;i.drawImage(n,0,0,Di,Oi);let{data:a}=i.getImageData(0,0,Di,Oi),o=Pi(Ci(a,Di,Oi,ki));if(this.failures=0,!this.active||!o.length)return;JSON.stringify(o)!==JSON.stringify(this.colors)&&(this.colors=o,this.host.requestUpdate())}catch{this.failures+=1,this.failures>=3&&this.stop()}finally{this.busy=!1}}}},Ii=8,Li=8,Ri=class extends O{static properties={content:{attribute:!1},label:{},open:{type:Boolean,reflect:!0},_place:{state:!0}};anchor;frame;constructor(){super(),this.open=!1}static styles=[H,o`
      :host {
        position: fixed;
        inset: 0;
        z-index: 999;
        pointer-events: none;
        font-family: var(--ha-font-family-body, inherit);
        color: var(--primary-text-color);
        -webkit-font-smoothing: antialiased;
      }
      dialog.layer {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        max-width: none;
        max-height: none;
        margin: 0;
        padding: 0;
        border: none;
        background: transparent;
        color: inherit;
        overflow: visible;
        pointer-events: none;
      }
      dialog.layer::backdrop {
        background: transparent;
      }
      .panel {
        position: fixed;
        box-sizing: border-box;
        max-height: min(70vh, 560px);
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 8px;
        border-radius: 20px;
        background: var(--vivid-layer-0);
        border: 1px solid rgba(var(--vivid-rgb-text), 0.08);
        box-shadow: var(--vivid-popover-shadow, 0 16px 44px rgba(0, 0, 0, 0.35));
        pointer-events: auto;
        opacity: 0;
        transform: translateY(-6px) scale(0.98);
        transform-origin: top center;
        transition:
          opacity 0.16s ease,
          transform 0.16s ease;
      }
      .panel.above {
        transform-origin: bottom center;
        transform: translateY(6px) scale(0.98);
      }
      :host([open]) .panel {
        opacity: 1;
        transform: none;
      }
      @media (prefers-reduced-motion: reduce) {
        .panel {
          transition: none;
        }
      }
    `];show(e){this.anchor=e,this.isConnected||document.body.appendChild(this),this.place(),this.updateComplete.then(()=>this.raise()),document.addEventListener(`pointerdown`,this.onOutside,!0),document.addEventListener(`keydown`,this.onKey,!0),window.addEventListener(`resize`,this.onMove),document.addEventListener(`scroll`,this.onMove,!0),requestAnimationFrame(()=>this.open=!0)}hide(){this.open=!1,document.removeEventListener(`pointerdown`,this.onOutside,!0),document.removeEventListener(`keydown`,this.onKey,!0),window.removeEventListener(`resize`,this.onMove),document.removeEventListener(`scroll`,this.onMove,!0),window.setTimeout(()=>{this.open||(this.layer()?.close(),this.remove())},180)}layer(){return this.renderRoot.querySelector(`dialog.layer`)}raise(){let e=this.layer();if(e&&!e.open&&typeof e.showModal==`function`)try{e.showModal(),e.style.pointerEvents=`auto`}catch{}}onOutside=e=>{let t=e.composedPath(),n=this.renderRoot.querySelector(`.panel`);n&&t.includes(n)||this.anchor&&t.includes(this.anchor)||N(this,`vivid-popover-close-request`)};onKey=e=>{e.key===`Escape`&&(e.stopPropagation(),N(this,`vivid-popover-close-request`))};onMove=()=>{this.frame===void 0&&(this.frame=requestAnimationFrame(()=>{this.frame=void 0,this.place()}))};place(){let e=this.anchor;if(!e)return;let t=e.getBoundingClientRect(),n=Math.min(360,window.innerWidth-16),r=t.left+t.width/2,i=Math.min(Math.max(r-n/2,Li),window.innerWidth-n-Li),a=this.renderRoot.querySelector(`.panel`)?.getBoundingClientRect().height??240,o=window.innerHeight-t.bottom-Ii-Li,s=o<Math.min(a,240)&&t.top>o;this._place={left:i,width:n,top:s?Math.max(Li,t.top-Ii-a):t.bottom+Ii,above:s}}updated(){let e=this.renderRoot.querySelector(`.panel`);if(this._place?.above&&e){let t=Math.max(Li,(this.anchor?.getBoundingClientRect().top??0)-Ii-e.getBoundingClientRect().height);Math.abs(t-this._place.top)>1&&(this._place={...this._place,top:t})}}render(){let e=this._place;return e?T`<dialog
      class="layer"
      @cancel=${e=>{e.preventDefault(),N(this,`vivid-popover-close-request`)}}
    >
      <div
        class="panel ${e.above?`above`:``}"
        role="dialog"
        aria-label=${this.label??``}
        style=${`top: ${e.top}px; left: ${e.left}px; width: ${e.width}px`}
      >
        ${this.content}
      </div>
    </dialog>`:D}};z(`vivid-popover`,Ri);var zi=[77,182,245],Bi=[255,112,67];z(`vivid-source-row`,class extends O{static properties={items:{attribute:!1},active:{type:Number},phases:{attribute:!1},labels:{attribute:!1},disabled:{type:Boolean},size:{reflect:!0}};constructor(){super(),this.items=[],this.phases={},this.disabled=!1,this.size=`compact`}static styles=[H,U,o`
      :host {
        display: block;
        --source-disc: 34px;
        --source-icon: 18px;
      }
      :host([size='large']) {
        --source-disc: 42px;
        --source-icon: 22px;
      }
      .row {
        display: grid;
        grid-template-columns: repeat(var(--source-count, 5), minmax(0, 1fr));
        gap: 6px;
      }
      .source {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        min-width: 0;
        padding: 7px 2px 7px;
        border-radius: 16px;
        background: var(--vivid-layer-1);
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        transition:
          background 0.3s ease,
          box-shadow 0.3s ease,
          transform 0.12s ease;
      }
      :host([size='large']) .source {
        padding: 10px 2px 8px;
        gap: 4px;
      }
      .source:active {
        transform: scale(0.95);
      }
      .source:disabled {
        opacity: 0.45;
        cursor: default;
        transform: none;
      }
      .disc {
        position: relative;
        display: grid;
        place-items: center;
        --vivid-glow-size: var(--source-glow);
        width: var(--source-disc);
        height: var(--source-disc);
        border-radius: 50%;
        background: var(--disc-bg, rgba(var(--vivid-rgb-text), 0.07));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
        transition:
          background 0.3s ease,
          box-shadow 0.3s ease,
          color 0.3s ease;
      }
      .disc ha-icon {
        --mdc-icon-size: var(--source-icon);
        display: inline-flex;
      }
      .name {
        max-width: 100%;
        margin-top: 2px;
        font-size: 12px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .hint {
        max-width: 100%;
        font-size: 10.5px;
        line-height: 1.2;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .source.active {
        background: rgba(var(--source-rgb), 0.15);
        box-shadow: inset 0 0 0 1.5px rgba(var(--source-rgb), 0.55);
      }
      .source.active .name {
        color: color-mix(in srgb, rgb(var(--source-rgb)) 60%, var(--primary-text-color));
      }
      .source.sending {
        background: rgba(var(--source-rgb), 0.1);
        box-shadow: inset 0 0 0 1.5px rgba(var(--source-rgb), 0.35);
      }
      .source.fail {
        background: rgba(var(--fail-rgb), 0.12);
        box-shadow: inset 0 0 0 1.5px rgba(var(--fail-rgb), 0.7);
        animation: shake 0.42s ease;
      }
      .name.phase {
        color: rgb(var(--source-rgb));
      }
      .name.ok {
        color: var(--success-color, #66bb6a);
      }
      .name.fail {
        color: rgb(var(--fail-rgb));
      }
      /* IR waves leaving the disc while the command is out. */
      .waves::before,
      .waves::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2.5px solid rgba(var(--source-rgb), 0.9);
        animation: wave 1.1s ease-out infinite;
        pointer-events: none;
      }
      .waves::after {
        animation-delay: 0.55s;
      }
      .pop {
        animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes wave {
        from {
          transform: scale(1);
          opacity: 1;
        }
        to {
          transform: scale(1.95);
          opacity: 0;
        }
      }
      @keyframes pop {
        0% {
          transform: scale(0.7);
        }
        60% {
          transform: scale(1.14);
        }
        100% {
          transform: scale(1);
        }
      }
      @keyframes shake {
        0%,
        100% {
          transform: translateX(0);
        }
        25% {
          transform: translateX(-3px);
        }
        50% {
          transform: translateX(3px);
        }
        75% {
          transform: translateX(-2px);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .source,
        .disc {
          transition: none;
        }
        .waves::before,
        .waves::after,
        .pop,
        .source.fail {
          animation: none;
        }
      }
    `];select(e){N(this,`vivid-source-select`,{index:e})}renderItem(e,t){let n=this.phases[t],r=t===this.active&&n!==`fail`,i=r||n===`ok`||n===`remote`,a=n===`fail`?L(Bi,.8):n===`sending`?L(zi,.45):i?L(zi,n===`ok`||n===`remote`?1:.85):void 0,o=n===`ok`||n===`remote`?`mdi:check-bold`:n===`fail`?`mdi:alert`:e.icon,s=this.labels,c=n&&n!==`remote`&&s?T`<span
            class=${W({name:!0,phase:!0,ok:n===`ok`,fail:n===`fail`})}
            >${s[n]}</span
          >`:T`<span class="name">${e.name}</span>`,l=e.hint?T`<span class="hint">${e.hint}</span>`:D;return T`<button
      type="button"
      class=${W({reset:!0,source:!0,active:i&&n!==`sending`,sending:n===`sending`,fail:n===`fail`})}
      aria-pressed=${r?`true`:`false`}
      aria-label=${e.name}
      title=${e.name}
      ?disabled=${this.disabled||!e.available}
      @click=${()=>this.select(t)}
    >
      <span
        class=${W({disc:!0,waves:n===`sending`,pop:n===`ok`||n===`remote`})}
        style=${k({"--disc-bg":a?.background,"--disc-shadow":a?.shadow,"--disc-color":a?.iconColor})}
        ><ha-icon .icon=${o}></ha-icon
      ></span>
      ${c} ${l}
    </button>`}render(){if(!this.items.length)return D;let e=this.size===`large`?42:34;return T`<div
      class="row"
      style=${k({"--source-count":String(this.items.length),"--source-rgb":zi.join(`, `),"--fail-rgb":Bi.join(`, `),"--source-glow":At(e),"--source-ink":I(zi)})}
    >
      ${this.items.map((e,t)=>this.renderItem(e,t))}
    </div>`}});var Vi=/* @__PURE__ */ new Set([`binary_sensor`,`switch`,`input_boolean`,`light`,`fan`]),Hi={door:[`mdi:door-closed`,`mdi:door-open`],garage_door:[`mdi:garage`,`mdi:garage-open`],window:[`mdi:window-closed`,`mdi:window-open`],opening:[`mdi:square-outline`,`mdi:square`],motion:[`mdi:motion-sensor-off`,`mdi:motion-sensor`],occupancy:[`mdi:home-outline`,`mdi:home`],presence:[`mdi:home-outline`,`mdi:home`],moisture:[`mdi:water-off`,`mdi:water`],smoke:[`mdi:smoke-detector`,`mdi:smoke-detector-alert`],light:[`mdi:brightness-5`,`mdi:brightness-7`],battery:[`mdi:battery`,`mdi:battery-outline`],plug:[`mdi:power-plug-off`,`mdi:power-plug`]},Ui={temperature:`mdi:thermometer`,humidity:`mdi:water-percent`,illuminance:`mdi:brightness-5`,battery:`mdi:battery`,power:`mdi:flash`,energy:`mdi:lightning-bolt`,carbon_dioxide:`mdi:molecule-co2`,pressure:`mdi:gauge`,voltage:`mdi:sine-wave`,current:`mdi:current-ac`},Wi={binary_sensor:`mdi:radiobox-blank`,switch:`mdi:toggle-switch-variant`,input_boolean:`mdi:toggle-switch-variant`,light:`mdi:lightbulb`,fan:`mdi:fan`,person:`mdi:account`,sensor:`mdi:eye`};function Gi(e,t,n){let r=Number(n),i=e.states[t]?.attributes.unit_of_measurement;if(n.trim()===``||!Number.isFinite(r))return n;let a=e.entities?.[t]?.display_precision??(Number.isInteger(r)||Math.abs(r)>=100?0:1),o;try{o=new Intl.NumberFormat(dn(e),{maximumFractionDigits:a,minimumFractionDigits:a}).format(r)}catch{o=r.toFixed(a)}return i?i===`%`||i===`°C`||i===`°F`?`${o}${i}`:`${o} ${i}`:o}function Ki(e,t){let n=t.entity,r=e.states[n],i=A(n),a=j(r),o=Vi.has(i),s=o&&r?.state===`on`,c=r?.attributes.device_class,l=r?.attributes.icon,u=t.icon??(typeof l==`string`&&l?l:void 0)??(o&&c?Hi[c]?.[+!!s]:void 0)??(c?Ui[c]:void 0)??Wi[i]??`mdi:information-outline`;return{entityId:n,name:t.name??M(e,n),icon:u,label:o||!r?void 0:a?Gi(e,n,r.state):`—`,active:s,available:a}}var qi=/[\s\-_]+/;function Ji(e){return e===``?e:e.charAt(0).toLocaleUpperCase()+e.slice(1)}function Yi(e){return e.trim().split(qi).filter(Boolean)}function Xi(e,t){return e!==void 0&&t!==void 0&&e.toLocaleLowerCase()===t.toLocaleLowerCase()}function Zi(e){let t=e.map(Yi);if(t.length<2||t.some(e=>e.length===0))return e.map(e=>Ji(e.trim()));let n=Math.min(...t.map(e=>e.length)),r=t[0]??[],i=0;for(;i<n-1&&t.every(e=>Xi(e[i],r[i]));)i+=1;let a=0;for(;i+a<n-1&&t.every(e=>Xi(e[e.length-1-a],r[r.length-1-a]));)a+=1;return i>0&&t.some(e=>/^\d+$/.test(e.slice(i,e.length-a).join(``)))&&--i,t.map(e=>Ji(e.slice(i,e.length-a).join(` `)))}var Qi=[`0`,`1`,`2`],$i={live_override:`liveOverride`,estimated_current:`estimatedCurrent`,info_leds_max_power:`maxCurrent`,info_leds_count:`ledCount`,preset:`preset`,playlist:`playlist`,color_palette:`palette`,segment_color_palette:`palette`,speed:`speed`,segment_speed:`speed`,intensity:`intensity`,segment_intensity:`intensity`,nightlight:`nightlight`,reverse:`reverse`,segment_reverse:`reverse`,freeze:`freeze`,segment_freeze:`freeze`,sync_send:`syncSend`,sync_receive:`syncReceive`,wifi_signal:`wifiSignal`,wifi_rssi:`wifiRssi`,free_heap:`freeHeap`,ip:`ip`,uptime:`uptime`};function ea(e,t){if(A(t)!==`select`)return!1;let n=e.states[t]?.attributes.options;return Array.isArray(n)&&n.length===Qi.length&&n.every((e,t)=>e===Qi[t])}function ta(e,t){let n=A(t);if(n===`update`)return`update`;let r=e.states[t]?.attributes.device_class;if(n===`button`&&r===`restart`)return`restart`;if(n===`sensor`&&(r===`timestamp`||r===`uptime`))return`uptime`}function na(e,t){let n={},r={},i=Ke(t);for(let a of Ze(e,t)){let t=e.entities[a];if(t?.platform!==`wled`){n.liveOverride===void 0&&ea(e,a)&&(n.liveOverride=a);continue}let o=t.translation_key,s=(o?$i[o]:void 0)??ta(e,a);if(!s){n.liveOverride===void 0&&ea(e,a)&&(n.liveOverride=a);continue}let c=(Ke(a).startsWith(`${i}_`)?2:0)+ +!o?.startsWith(`segment_`);(n[s]===void 0||c>(r[s]??0))&&(n[s]=a,r[s]=c)}return n}function ra(e,t){let n=e.states[t],r=j(n);return{entityId:t,available:r,active:r&&(n.state===`1`||n.state===`2`)}}function ia(e,t,n){if(!t.maxCurrent||!n||n<=0)return;let r=Qe(e.states[t.maxCurrent]);if(!(!r||r<=0))return r*n/1e3}function aa(e,t,n=Date.now()){let r=t=>t?Qe(e.states[t]):void 0,i=t=>{let n=t?e.states[t]:void 0;return j(n)?n.state:void 0},a=i(t.uptime),o=a?Date.parse(a):NaN,s=t.update?e.states[t.update]:void 0,c=s?.attributes.installed_version,l=s?.attributes.latest_version;return{signal:r(t.wifiSignal),rssi:r(t.wifiRssi),uptime:Number.isFinite(o)?Math.max(0,Math.round((n-o)/1e3)):void 0,ledCount:r(t.ledCount),maxCurrent:r(t.maxCurrent),freeHeap:r(t.freeHeap),ip:i(t.ip),firmware:typeof c==`string`?c:void 0,latestFirmware:typeof l==`string`?l:void 0,updateAvailable:s?.state===`on`,updateEntity:t.update,restartEntity:t.restart&&e.states[t.restart]!==void 0&&e.states[t.restart]?.state!==`unavailable`?t.restart:void 0}}function oa(e){return e===void 0?`mdi:wifi-strength-off-outline`:e>=75?`mdi:wifi-strength-4`:e>=50?`mdi:wifi-strength-3`:e>=25?`mdi:wifi-strength-2`:`mdi:wifi-strength-1`}function sa(e,t){if(A(t)!==`sensor`)return!1;let n=e.states[t]?.attributes;return n?n.device_class===`power`||n.unit_of_measurement===`W`||n.unit_of_measurement===`kW`:!1}function ca(e,t){if(t)return t.replaceAll(`{object_id}`,Ke(e)).replaceAll(`{entity_id}`,e)}function la(e,t,n){if(!n||n<=0)return;let r=na(e,t).estimatedCurrent;return r?{kind:`current`,entityId:r,voltage:n,origin:`estimated`}:void 0}function ua(e,t,n,r={}){let i=r.mode??`auto`,a=r.voltage??n.voltage;if(i===`none`)return;if(i===`sensor`||i===`auto`&&r.sensor){if(r.sensor&&e.states[r.sensor])return{kind:`power`,entityId:r.sensor,origin:`sensor`};if(i===`sensor`)return}if(i===`voltage`)return la(e,t,a);let o=ca(t,n.sensorPattern);if(o&&e.states[o])return{kind:`power`,entityId:o,origin:`pattern`};let s=Ze(e,t).find(t=>sa(e,t));return s?{kind:`power`,entityId:s,origin:`device`}:la(e,t,a)}function da(e,t){let n=e.states[t.entityId],r=Qe(n);if(r!==void 0)return t.kind===`current`?r*t.voltage/1e3:n?.attributes.unit_of_measurement===`kW`?r*1e3:r}var fa=`vivid-led-group`,pa=[`auto`,`hue`,`temperature`,`none`],ma=[`brightness`,`none`],ha=[`name`,`group`,`custom`],ga=[`default`,`collapsible`],_a=[`auto`,`sensor`,`voltage`,`none`],va={idle:3,max:40,steps:[10,25],colors:Lt};function G(e){throw Error(`${fa}: ${e}`)}function ya(e,t){if(e==null||e===``)return;let n=typeof e==`number`?e:Number(e);return(!Number.isFinite(n)||n<0)&&G(`"${t}" must be a positive number.`),n}function ba(e,t){if(e!=null&&e!==``)return typeof e!=`string`&&G(`"${t}" must be text.`),e.trim()||void 0}function xa(e){let t=ba(e,`power.price_entity`);return t&&![`sensor`,`input_number`].includes(A(t))&&G(`"power.price_entity" must be a sensor or an input_number.`),t}function K(e,t){if(e!=null)return typeof e!=`boolean`&&G(`"${t}" must be true or false.`),e}function Sa(e,t,n){if(e!=null&&e!==``)return(typeof e!=`string`||!n.includes(e))&&G(`"${t}" must be one of: ${n.join(`, `)}.`),e}function Ca(e,t){return e==null?{}:((typeof e!=`object`||Array.isArray(e))&&G(`"${t}" must be an object.`),e)}function wa(e,t){try{return ft(e,t)}catch(e){G(e.message)}}function Ta(e){if(!e)return;let t=e.trim().replace(/^#\/?/,``);if(t!==``)return/^[\w-]+$/.test(t)||G(`"details.hash" may only contain letters, digits, "-" and "_".`),`#${t}`}function Ea(e){let{show_power:t,show_live_override:n,show_effects:r,show_hue:i,details_hash:a,...o}=e,s={...o};return(r!==void 0||i!==void 0)&&(s.tile={...r===void 0?{}:{effects:r},...i===void 0?{}:{color_bar:i?`auto`:`none`},...s.tile}),t!==void 0&&(s.power={enabled:t,...s.power}),n!==void 0&&(s.ambilight={enabled:n,...s.ambilight}),a!==void 0&&(s.details={hash:a,...s.details}),s}function Da(e){let t=ya(e.idle,`power.idle`)??va.idle,n=ya(e.max,`power.max`)??va.max,r=va.steps;if(e.steps!==void 0){let t=e.steps;(!Array.isArray(t)||t.length!==2)&&G(`"power.steps" must be two numbers.`);let n=ya(t[0],`power.steps`),i=ya(t[1],`power.steps`);(n===void 0||i===void 0||n>i)&&G(`"power.steps" must be two ascending numbers, e.g. [10, 25].`),r=[n,i]}let i=Lt;if(e.colors!==void 0){let t=e.colors;(!Array.isArray(t)||t.length!==3)&&G(`"power.colors" must be three colors.`);let n=t.map(e=>Oa(e,`power.colors`).rgb);n.some(e=>!e)&&G(`"power.colors" must be three RGB colors.`),i=n}return{idle:t,max:n,steps:r,colors:i}}function Oa(e,t){if(typeof e==`string`||Array.isArray(e)){let n=xt(e);return n||G(`"${t}" has an invalid color: ${JSON.stringify(e)}.`),{rgb:n}}(typeof e!=`object`||!e)&&G(`"${t}" must be colors such as "#ff8800" or { kelvin: 2700 }.`);let n=e,r=ya(n.brightness,`${t}.brightness`);r!==void 0&&(r<1||r>100)&&G(`"${t}.brightness" must be between 1 and 100.`);let i=ya(n.kelvin,`${t}.kelvin`),a=n.rgb??n.color;if(a!==void 0){let e=xt(a);return e||G(`"${t}" has an invalid color: ${JSON.stringify(a)}.`),{rgb:e,brightness:r}}if(i!==void 0)return{kelvin:i,brightness:r};G(`"${t}" needs "rgb", "color" or "kelvin".`)}function ka(e){return e==null?[]:(Array.isArray(e)||G(`"tile.favorites" must be a list of colors.`),e.slice(0,8).map(e=>Oa(e,`tile.favorites`)))}function Aa(e){return e==null?[]:(Array.isArray(e)||G(`"badges" must be a list of entities.`),e.map(e=>{if(typeof e==`string`&&e.includes(`.`))return{entity:e};if(typeof e==`object`&&e){let t=e,n=ba(t.entity,`badges.entity`);if(n?.includes(`.`))return{entity:n,name:ba(t.name,`badges.name`),icon:ba(t.icon,`badges.icon`)}}G(`each badge must be an entity id or { entity: … }.`)}))}function ja(e){let t=ba(e,`power.currency`);if(t!==void 0)return/^[A-Za-z]{3}$/.test(t)||G(`"power.currency" must be a currency code such as EUR.`),t.toUpperCase()}function Ma(e){return e==null?[]:((!Array.isArray(e)||e.some(e=>typeof e!=`string`))&&G(`"details.order" must be a list of entity ids.`),e)}function Na(e,t){if(e==null||e===``)return 100;let n=Dt(e);return n===void 0&&G(`"${t}" must be a percentage from 0 to 200, or ${wt.join(`, `)}.`),n}function Pa(e,t){let n=ya(e,t);return n===void 0?100:(n>200&&G(`"${t}" must be between 0 and 200.`),n)}function Fa(e,t,n){let r=ya(e,t);return r===void 0?n:((r<1||r>100)&&G(`"${t}" must be between 1 and 100.`),r)}function Ia(e){let t=/* @__PURE__ */ new Map;if(e==null)return t;Array.isArray(e)||G(`"members" must be a list.`);for(let n of e){(typeof n!=`object`||!n)&&G(`each member must be an object.`);let e=n,r=ba(e.entity,`members.entity`);r||G(`each member needs an "entity".`),t.set(r,{entity:r,name:ba(e.name,`members.name`),icon:ba(e.icon,`members.icon`),hidden:K(e.hidden,`members.hidden`),ambilight:K(e.ambilight,`members.ambilight`),power_mode:Sa(e.power_mode,`members.power_mode`,_a),power_sensor:ba(e.power_sensor,`members.power_sensor`),voltage:ya(e.voltage,`members.voltage`),transition:ya(e.transition,`members.transition`)})}return t}function La(e){if(e===!1)return!1;if(e!==!0)return ba(e,`ambilight.box`)}function Ra(e){if(e!=null)return Array.isArray(e)||G(`"ambilight.inputs" must be a list of names or { name, icon }.`),e.map(e=>{if(typeof e==`string`||typeof e==`object`&&e)return e;G(`"ambilight.inputs" must be a list of names or { name, icon }.`)})}function za(e){(typeof e!=`object`||!e)&&G(`invalid configuration.`);let t=Ea(e),n=ba(t.entity,`entity`);n||G(`set "entity" to a light or a light group.`),A(n)!==`light`&&G(`"${n}" is not a light entity.`);let r=Ca(t.tile,`tile`),i=Ca(t.power,`power`),a=Ca(t.ambilight,`ambilight`),o=Ca(t.details,`details`),s=Ca(t.appearance,`appearance`),c=Sa(r.color_bar,`tile.color_bar`,pa)??`auto`,l=K(r.effects,`tile.effects`)??!0;return{type:t.type,entity:n,name:ba(t.name,`name`),icon:ba(t.icon,`icon`),layout:Sa(t.layout,`layout`,ga)??`default`,expanded:K(t.expanded,`expanded`)??!1,tile:{state:Sa(r.state,`tile.state`,ma)??`brightness`,colorBar:c,saturationBar:K(r.saturation_bar,`tile.saturation_bar`)??!1,effects:l,tapAction:wa(r.tap_action,`tile.tap_action`)??{action:`toggle`},holdAction:wa(r.hold_action,`tile.hold_action`),doubleTapAction:wa(r.double_tap_action,`tile.double_tap_action`)??{action:`none`},favorites:ka(r.favorites),brightnessMin:Fa(r.brightness_min,`tile.brightness_min`,1),brightnessStep:Fa(r.brightness_step,`tile.brightness_step`,1),transition:ya(r.transition,`tile.transition`)},appearance:{glow:Na(s.glow,`appearance.glow`),glowBoost:Pa(s.glow_boost,`appearance.glow_boost`),header:K(s.header,`appearance.header`)??!0,compact:K(s.compact,`appearance.compact`)??!1,gradient:K(s.gradient,`appearance.gradient`)??!0,animateEffects:K(s.animate_effects,`appearance.animate_effects`)??!0},badges:Aa(t.badges),power:{enabled:K(i.enabled,`power.enabled`)??!0,sensorPattern:ba(i.sensor_pattern,`power.sensor_pattern`),voltage:ya(i.voltage,`power.voltage`),scale:Da(i),autoMax:i.max===void 0||i.max===null||i.max===``,autoSteps:i.steps===void 0||i.steps===null,price:ya(i.price,`power.price`),priceEntity:xa(i.price_entity),currency:ja(i.currency)},ambilight:{enabled:K(a.enabled,`ambilight.enabled`)??!0,box:La(a.box),hyperhdr:ba(a.hyperhdr,`ambilight.hyperhdr`),inputs:Ra(a.inputs),confirmOff:K(a.confirm_off,`ambilight.confirm_off`)??!0},details:{enabled:K(o.enabled,`details.enabled`),hash:Ta(ba(o.hash,`details.hash`)),sort:Sa(o.sort,`details.sort`,ha)??`name`,summary:K(o.summary,`details.summary`)??!0,effects:K(o.effects,`details.effects`)??l,colorBar:Sa(o.color_bar,`details.color_bar`,pa)??c,saturationBar:K(o.saturation_bar,`details.saturation_bar`)??!0,favorites:K(o.favorites,`details.favorites`)??!0,wledControls:K(o.wled_controls,`details.wled_controls`)??!0,health:K(o.health,`details.health`)??!0,history:K(o.history,`details.history`)??!0,order:Ma(o.order)},members:Ia(t.members)}}function Ba(e,t,n,r){let i=e.states[t],a=i?.attributes.icon,o=j(i),s=o&&i.state===`on`,c=i?.attributes?.brightness,l=s?typeof c==`number`?Math.round(c/255*100):100:0,u=i?.attributes?.effect;return{entityId:t,name:n,icon:r??(typeof a==`string`&&a?a:`mdi:led-strip-variant`),available:o,isOn:s,brightness:l,rgb:s?yt(i):void 0,effectActive:s&&typeof u==`string`&&!Va.has(u.toLowerCase())}}var Va=/* @__PURE__ */ new Set([`solid`,`none`,`off`,``]);function Ha(e,t,n,r){let i=t.power.scale,a=t.power.autoMax?ia(e,n,r):void 0;if(a===void 0)return i;let o=a/i.max;return{...i,max:a,steps:t.power.autoSteps?[i.steps[0]*o,i.steps[1]*o]:i.steps}}function Ua(e,t){if(t.length===0)return e;let n=e=>t.reduce((t,n)=>t+e(n),0);return{idle:n(e=>e.idle),max:n(e=>e.max),steps:[n(e=>e.steps[0]),n(e=>e.steps[1])],colors:e.colors}}function Wa(e,t){let n=e.states[t.entity],r=qe(e,t.entity),i=Array.isArray(n?.attributes.entity_id)&&r.length>0,a=Zi(r.map(t=>M(e,t))),o=/* @__PURE__ */ new Set([t.entity,...r]),s=r.map((n,r)=>{let i=t.members.get(n),s=a[r]??n,c=na(e,n),l={...Ba(e,n,i?.name??s,i?.icon??t.icon),autoName:s,hidden:i?.hidden??!1,wled:e.entities?.[n]?.platform===`wled`,watts:void 0,ambilight:!1,wledEntities:c,scale:Ha(e,t,c,i?.voltage??t.power.voltage)};for(let e of Object.values(c))e&&o.add(e);t.power.enabled&&(l.power=ua(e,n,t.power,{mode:i?.power_mode,sensor:i?.power_sensor,voltage:i?.voltage}),l.power&&(l.watts=da(e,l.power),o.add(l.power.entityId)));let u=c.liveOverride;return u&&(l.liveOverride=ra(e,u),l.ambilight=t.ambilight.enabled&&i?.ambilight!==!1,o.add(u)),l});if(t.details.sort===`name`)s.sort((e,t)=>e.name.localeCompare(t.name));else if(t.details.sort===`custom`){let e=e=>{let n=t.details.order.indexOf(e);return n===-1?t.details.order.length:n};s.sort((t,n)=>e(t.entityId)-e(n.entityId))}let c=s.filter(e=>e.power!==void 0),l=c.filter(e=>e.watts!==void 0),u=l.length?l.reduce((e,t)=>e+(t.watts??0),0):void 0,d=/* @__PURE__ */ new Map;for(let e of s)e.ambilight&&e.liveOverride&&d.set(e.liveOverride.entityId,e.liveOverride);let f=[...d.values()],p=f.length?{available:f.filter(e=>e.available).map(e=>e.entityId),active:f.some(e=>e.active)}:void 0,m=s.filter(e=>!e.hidden),h=(t.details.enabled??i)&&m.length>0,g=Ba(e,t.entity,t.name??M(e,t.entity),t.icon),_=s.filter(e=>e.rgb!==void 0),v=i&&t.appearance.gradient&&_.length>1?_.map(e=>e.rgb):g.rgb?[g.rgb]:[];for(let e of t.badges)o.add(e.entity);let y=t.power.priceEntity;y&&o.add(y);let b=(y?Qe(e.states[y]):void 0)??t.power.price;return{...g,isGroup:i,detected:s,members:m,watts:u,hasPower:c.length>0,hasLiveOverride:s.some(e=>e.liveOverride!==void 0),groupScale:Ua(t.power.scale,c.map(e=>e.scale)),colors:v,badges:t.badges.map(t=>Ki(e,t)),liveOverride:p,detailsEnabled:h,tileColorBar:wn(t.tile.colorBar,n),holdAction:t.tile.holdAction??{action:h?`details`:`more-info`},price:b,watched:[...o]}}function Ga(e,t,n){return!e||e.entities!==t.entities||e.language!==t.language||n.some(n=>e.states[n]!==t.states[n])}var Ka=[102,187,106],qa=[255,193,7],Ja=[239,83,80],Ya=[158,158,158],Xa=[77,182,245];function q(e,t,n=0){try{return new Intl.NumberFormat(dn(e),{minimumFractionDigits:n,maximumFractionDigits:n}).format(t)}catch{return t.toFixed(n)}}function Za(e,t,n=1){return`${q(e,t,n)}\u00a0°C`}function Qa(e){return e.curve.overheat.value??55}function $a(e){return e.fan.source===`cpu`&&e.cpu?e.cpu.overheat.value??80:Qa(e)}function eo(e){if(e.online)return e.alarms.some(e=>e===`overheat`||e===`cpuoverheat`||e===`stalled`)?Ja:e.alarms.includes(`nosensor`)?qa:zr(e.controlTemperature,$a(e))}function to(e){return e.online?e.alarms.some(e=>e===`overheat`||e===`cpuoverheat`||e===`stalled`)?`mdi:fan-alert`:`mdi:fan`:`mdi:lan-disconnect`}var no={off:`amb_pi_off`,on:`amb_pi_on`,unknown:`unavailable`};function ro(e,t){return B(e,no[t])}function io(e){return e===`on`?L(Ka,.8):void 0}var ao=[`offline`,`overheat`,`cpuoverheat`,`stalled`,`nosensor`];function oo(e){return ao.find(t=>e.alarms.includes(t))}var so={offline:`amb_offline`,overheat:`amb_overheat`,cpuoverheat:`amb_cpu_overheat`,stalled:`amb_stalled`,nosensor:`amb_nosensor`};function co(e,t){let n=oo(t);return n===`offline`?{text:B(e,so.offline),tone:`muted`}:n?{text:B(e,so[n]),tone:n===`nosensor`?`warn`:`alarm`}:{text:[t.fan.mode===void 0?void 0:B(e,t.fan.mode===`manual`?`amb_manual`:`amb_auto`),ro(e,t.pi)].filter(Boolean).join(` · `),tone:t.pi===`off`?`muted`:void 0}}function lo(e,t){let n=[];for(let r of ao)if(t.alarms.includes(r)){if(r===`offline`)n.push({alarm:r,color:Ya,icon:`mdi:lan-disconnect`,title:B(e,`amb_alarm_offline_t`),detail:B(e,`amb_alarm_offline`)});else if(r===`overheat`){let i=t.controlTemperature;n.push({alarm:r,color:Ja,icon:`mdi:thermometer-alert`,title:B(e,`amb_alarm_overheat_t`),detail:B(e,`amb_alarm_overheat`,{t:i===void 0?`—`:Za(e,i),max:Za(e,Qa(t),0)})})}else if(r===`cpuoverheat`){let i=t.cpuTemperature;n.push({alarm:r,color:Ja,icon:`mdi:raspberry-pi`,title:B(e,`amb_alarm_cpuoverheat_t`),detail:B(e,`amb_alarm_cpuoverheat`,{t:i===void 0?`—`:Za(e,i),max:Za(e,t.cpu?.overheat.value??80,0)})})}else r===`stalled`?n.push({alarm:r,color:Ja,icon:`mdi:fan-alert`,title:B(e,`amb_alarm_stalled_t`),detail:B(e,`amb_alarm_stalled`)}):n.push({alarm:r,color:qa,icon:`mdi:thermometer-off`,title:B(e,`amb_alarm_nosensor_t`),detail:B(e,t.fan.source===`cpu`?`amb_alarm_nosensor_cpu`:`amb_alarm_nosensor`)})}return n}function uo(e){if(!(!e||e<=0))return Math.round((2.6-Math.min(e,100)/100*2)*100)/100}function fo(e){return{sending:B(e,`amb_sending`),ok:B(e,`amb_ok`),fail:B(e,`amb_fail`),sent:B(e,`amb_sent`)}}function po(e,t){let n=[[/^pi powered/i,`amb_ps_on`],[/^pi off/i,`amb_ps_off`],[/^pi starting/i,`amb_ps_starting`],[/^shutting the pi down/i,`amb_ps_shutting`],[/^pi shutting down/i,`amb_ps_halting`],[/did not shut down/i,`amb_ps_timeout`],[/^home assistant away/i,`amb_ps_noha`]].find(([e])=>e.test(t))?.[1];return n?B(e,n):t}function mo(e){switch(e){case`ok`:return{kind:`ok`,icon:`mdi:link-variant`,rgb:Ka,label:`amb_link_ok`};case`unseen`:return{kind:`warn`,icon:`mdi:link-variant-off`,rgb:qa,label:`amb_link_unseen`};case`waiting`:return{kind:`info`,icon:`mdi:timer-sand`,rgb:Ya,label:`amb_link_waiting`};case`away`:return{kind:`info`,icon:`mdi:link-variant-off`,rgb:Ya,label:`amb_link_away`};case`legacy`:return{kind:`info`,icon:`mdi:chip`,rgb:Ya,label:`amb_link_legacy`};default:return{kind:`info`,icon:`mdi:help-circle-outline`,rgb:Ya,label:`amb_link_none`}}}var ho;function go(){return customElements.get(`ha-form`)?Promise.resolve():(ho??=(async()=>{try{await((await window.loadCardHelpers?.())?.createCardElement({type:`tile`,entity:`sun.sun`})?.constructor)?.getConfigElement?.()}catch{}})(),ho)}z(`vivid-order-picker`,class extends O{static properties={items:{attribute:!1},value:{attribute:!1},label:{},helper:{},max:{type:Number}};constructor(){super(),this.items=[],this.value=[],this.max=0}static styles=[H,U,o`
      :host {
        display: block;
      }
      .label {
        margin-bottom: 6px;
        font-size: 13px;
        font-weight: 500;
      }
      .helper {
        margin-top: 6px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 32px;
        padding: 0 10px 0 8px;
        border-radius: 16px;
        background: rgba(var(--vivid-rgb-text), 0.06);
        color: var(--secondary-text-color);
        font-size: 13px;
        font-weight: 500;
        border: 1px dashed rgba(var(--vivid-rgb-text), 0.18);
      }
      .chip.on {
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.6);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.16);
        color: var(--primary-text-color);
      }
      .chip:disabled {
        opacity: 0.4;
        cursor: default;
      }
      .chip ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
      }
      .num {
        display: grid;
        place-items: center;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        font-size: 11px;
        font-weight: 700;
      }
      .move {
        display: inline-grid;
        place-items: center;
        width: 20px;
        height: 20px;
        margin: 0 -4px;
        border-radius: 50%;
        color: var(--secondary-text-color);
      }
      .move:hover {
        background: rgba(var(--vivid-rgb-text), 0.1);
      }
    `];emit(e){this.value=e,N(this,`value-changed`,{value:e})}toggle(e){let t=this.value;t.includes(e)?this.emit(t.filter(t=>t!==e)):(!this.max||t.length<this.max)&&this.emit([...t,e])}move(e,t,n){n.stopPropagation();let r=[...this.value],i=r.indexOf(e),a=i+t;i<0||a<0||a>=r.length||([r[i],r[a]]=[r[a],r[i]],this.emit(r))}render(){let e=this.value.map(e=>this.items.find(t=>t.value===e)).filter(e=>e!==void 0),t=this.items.filter(e=>!this.value.includes(e.value)),n=this.max>0&&e.length>=this.max;return T`${this.label?T`<div class="label">${this.label}</div>`:D}
      <div class="chips">
        ${e.map((t,n)=>T`<button
              type="button"
              class="reset chip on"
              title=${t.label}
              @click=${()=>this.toggle(t.value)}
            >
              <span class="num">${n+1}</span>
              ${t.icon?T`<ha-icon .icon=${t.icon}></ha-icon>`:D}${t.label}
              ${e.length>1?T`<span
                        class="move"
                        role="button"
                        aria-label="←"
                        @click=${e=>this.move(t.value,-1,e)}
                        ><ha-icon icon="mdi:chevron-left"></ha-icon></span
                      ><span
                        class="move"
                        role="button"
                        aria-label="→"
                        @click=${e=>this.move(t.value,1,e)}
                        ><ha-icon icon="mdi:chevron-right"></ha-icon
                      ></span>`:D}
            </button>`)}
        ${t.map(e=>T`<button
              type="button"
              class="reset chip"
              ?disabled=${n}
              @click=${()=>this.toggle(e.value)}
            >
              ${e.icon?T`<ha-icon .icon=${e.icon}></ha-icon>`:D}${e.label}
            </button>`)}
      </div>
      ${this.helper?T`<div class="helper">${this.helper}</div>`:D}`}});var _o={entity:`Light or group`,badge_entity:`Light, switch or group`,entity_missing:`Pick a light or a light group to start.`,entity_not_found:`Entity not found: {entity}`,group_detected:`Group detected`,single_light:`Single light`,lights_count:`{count} lights`,wled_count:`{count} WLED`,wled:`WLED`,capability_hue:`color`,capability_temperature:`tunable white`,capability_dimmable:`dimmable`,power_found:`Consumption found for {found} / {total}`,power_found_single:`Consumption: {origin}`,power_none_title:`No consumption found.`,power_none_hint:`Set a sensor pattern or a strip voltage, or pick a sensor for each light below.`,power_none_hint_plain:`Set a sensor pattern, or pick a sensor for each light below.`,name:`Name`,icon:`Icon`,toggle_ambilight:`Ambilight`,toggle_ambilight_none:`Ambilight · no WLED`,toggle_power:`Consumption`,toggle_details:`Details`,toggle_color:`Color`,color_auto_hue:`auto · hue`,color_auto_temperature:`auto · temperature`,color_auto_none:`auto · none`,color_hue:`hue`,color_temperature:`temperature`,color_none:`off`,default_power:`Default measurement`,sensor_pattern:`Sensor pattern`,sensor_pattern_helper:`{object_id} becomes the light object id`,voltage:`Strip voltage`,power_order_hint:`Auto tries the chosen sensor, the pattern, a sensor of the device, then WLED current × voltage.`,power_order_hint_plain:`Auto tries the chosen sensor, the pattern, then a sensor of the device.`,favorites_title:`Favorite colors`,favorites_hint:`a tap applies the color`,favorite_add:`Add a color`,favorite_remove:`Remove {color}`,section_appearance:`Appearance`,glow:`Halo strength`,glow_helper:`0\xA0%: no halo · 100\xA0%: default · 200\xA0%: twice as wide`,glow_boost:`Halo follows the brightness`,glow_boost_helper:`0\xA0%: same halo at any brightness · 100\xA0%: default · 200\xA0%: discreet when dimmed, strong at full`,show_header:`Header (name and badges)`,compact:`Compact`,gradient:`Gradient power button (groups)`,animate_effects:`Shimmer while an effect runs`,brightness_min:`Lowest brightness`,brightness_step:`Brightness step`,transition:`Transition`,section_badges:`Badges`,badges_hint:`Shown on the tile and on top of the details.`,badge_add:`Add an entity`,badge_remove:`Remove {name}`,details_favorites:`Favorite colors per light`,details_wled_controls:`WLED presets, palette and speed`,details_health:`Device information`,max_auto_helper:`Empty: WLED current limit × voltage when known`,member_icon:`Icon`,member_transition_helper:`Empty: the tile’s ({value})`,none:`none`,sort_custom:`Custom`,move_up:`Move {name} up`,move_down:`Move {name} down`,details_history:`Consumption history`,price:`Price`,price_helper:`Shows what today cost in the details`,section_power:`Consumption`,favorites_one:`{count} favorite`,favorites_other:`{count} favorites`,badges_one:`{count} badge`,badges_other:`{count} badges`,hidden_one:`{count} hidden`,hidden_other:`{count} hidden`,brightness_title:`Brightness`,transition_helper:`Fade applied to every change (on, off, color)`,members_tap_hint:`Tap a light to set it up.`,summary_no_header:`no header`,summary_no_gradient:`no gradient`,summary_no_shimmer:`no shimmer`,details_content:`Shown in the details`,sort_custom_helper:`Use the arrows in “Detected lights”`,members_title:`Detected lights`,members_hint:`Everything is optional`,offline:`offline`,ambilight_tag:`ambilight`,no_power:`no consumption`,ambilight_member:`Answers the ambilight button`,power_mode:`Measurement`,mode_auto:`Auto`,mode_sensor:`Sensor`,mode_voltage:`Voltage`,mode_none:`None`,power_sensor:`Power sensor`,origin_sensor:`Chosen sensor → {entity}`,origin_pattern:`Pattern → {entity}`,origin_device:`Device sensor → {entity}`,origin_estimated:`WLED current {current} mA × {voltage} V`,origin_unavailable:`{entity} · unavailable`,origin_none:`Nothing found`,origin_disabled:`No measurement`,voltage_missing:`Set a voltage to use the WLED estimated current.`,member_name:`Displayed name`,member_name_helper:`Auto: {name}`,member_visible:`Shown in the details`,advanced:`Advanced`,advanced_summary:`appearance, tile, gestures, details`,advanced_summary_single:`appearance, tile, gestures`,section_tile:`Tile`,color_bar:`Color bar`,color_bar_auto:`Auto`,color_bar_hue:`Hue`,color_bar_temperature:`Temperature`,color_bar_none:`None`,color_bar_same:`Same as the tile`,state_text:`State text`,state_brightness:`Brightness`,state_none:`None`,effects:`Effect picker`,section_gestures:`Gestures`,tap_action:`Tap`,hold_action:`Hold`,double_tap_action:`Double tap`,action_toggle:`Turn on / off`,action_details:`Details`,action_more_info:`Home Assistant dialog`,action_none:`Nothing`,action_custom:`Custom (YAML)`,action_default:`Default ({action})`,section_details:`Details`,details_hash:`Link (hash)`,details_hash_helper:`Any card can open it with navigate → #{hash}`,details_sort:`Order`,sort_name:`By name`,sort_group:`As in the group`,details_summary:`Group badges on top`,details_effects:`Effect picker per light`,section_glow:`Consumption glow`,idle:`Neutral below`,max:`Brightest at`,badge_group:`Group or entity`,badge_group_auto:`Group or entity (empty: every battery)`,badge_action_details_default:`Default (details)`,aggregate:`Value shown`,aggregate_mean:`Mean`,aggregate_median:`Median`,aggregate_min:`Lowest`,aggregate_max:`Highest`,aggregate_sum:`Sum`,warn_after:`Amber after (min)`,alert_after:`Red after (min)`,open_helper:`Minutes open before the color changes`,lux_max:`Gauge full at (lx)`,gauge:`Gauge ring around the icon`,show_light_label:`Show the level (Bright, Dim, Dark)`,show_light_label_helper:`Sensors reporting a word instead of lux; otherwise the icon alone`,icon_color:`Icon on colors`,icon_color_white:`White`,icon_color_auto:`Automatic (dark on light colors)`,comfort:`Comfort range`,comfort_helper:`Low and high, in the sensor unit: [19, 23]. No halo inside it`,comfort_helper_co2:`Low and high in ppm: [400, 1000]. No halo inside it`,aggregate_auto:`Automatic`,climate_aggregate_helper:`Several sensors: automatic shows what asks for action`,climate_range:`Chart span`,climate_range_6h:`6 hours`,climate_range_24h:`24 hours`,climate_range_7d:`7 days`,climate_range_30d:`30 days`,climate_trend:`Trend and alerts`,climate_trend_helper_temperature:`Arrow when it moved over 0.5 °C in the last hour`,climate_trend_helper_humidity:`Arrow when it moved over 5 points in the last hour; pulses when it jumps (shower)`,climate_trend_helper_pressure:`Arrow on the 3-hour trend; alert when it drops fast`,battery_low:`Red below (%)`,battery_warn:`Amber below (%)`,battery_display:`Shown`,battery_display_level:`The lowest level`,battery_display_low_count:`How many are low`,show_duration:`Show the duration`,show_open_count:`Show the count (2/7)`,show_zero_closed:`Also show it when everything is closed (0/7)`,show_zero_clear:`Also show it when nobody is there (0/4)`,icon_active:`Icon when active`,icon_rest:`Icon at rest`,power_idle:`Neutral below (W)`,power_max:`Brightest at (W)`,icon_on:`Icon when on`,icon_off:`Icon when off`,icon_auto:`Empty: {icon}`,icon_auto_struck:`Empty: {icon}, crossed out`,badge_look:`Style`,look_disc:`Disc behind the icon`,look_pill:`Whole badge`,badge_layout:`Details`,layout_list:`List with sliders`,layout_compact:`Compact`,show_count:`Show the count (2/3) or the brightness`,show_zero:`Also show it when everything is off (0/3)`,badge_tap_default:`Default (turn all on / off)`,badge_hold_default:`Default (lights under the badge)`,badge_details_title:`Title of the details`,saturation_bar:`Saturation bar under the colors`,saturation_bar_helper:`Pale to full colors; without it, the colors are always full`,details_saturation_bar:`Saturation bar`,lamp_entity:`Lamps (a group, or one lamp)`,lamp_entities:`Or several lamps`,lamp_layout:`Layout`,lamp_layout_ambiance:`Ambiance: presets and a button per lamp`,lamp_layout_line:`One line: a small button per lamp`,lamps_section:`Lamps`,lamps_hint:`Names, on and off icons, power sensor`,lamp_visible:`Shown on the card`,lamp_sensor_auto:`Empty: {sensor}`,lamp_sensor_none:`Empty: none found on the device`,scenes_section:`Quick presets`,scenes_hint:`Optional: buttons that switch several lamps at once`,scenes_none:`No preset yet.`,scene_add:`Add a preset`,scene_remove:`Remove`,scene_name:`Name`,scene_kind:`Does`,scene_kind_lamps:`Turns these lamps on, the others off`,scene_kind_scene:`Activates a Home Assistant scene`,scene_entity:`Scene`,scene_lamps:`Lamps on in this preset (none: everything off)`,scene_default_name:`Preset {n}`,show_power:`Show the watts`,show_energy:`Energy and cost of the day in the details`,price_entity:`Or a price entity`,price_entity_helper:`A sensor or input_number holding the price of a kWh (variable tariff); it wins over the price`,max_watts:`Brightest halo at`,max_watts_helper:`A lamp drawing this much glows the most`,warn_below:`Flag a lamp on drawing less than`,warn_below_helper:`A bulb out, or the lamp’s own switch off. 0 turns it off`,lamp_show_header:`Header (name, count, consumption)`,lamp_show_count:`Count (3/4 on)`,lamp_show_toggle_all:`Button for the whole group`,lamp_show_names:`Names under the lamps`,lamp_show_status:`Watts and duration under the lamps`,lamp_size:`Button size`,lamp_size_small:`Small`,lamp_size_medium:`Medium`,lamp_size_large:`Large`,lamp_columns:`Lamps per row`,lamp_columns_helper:`Empty: as many as fit`,lamp_icons_only:`icons only`,lamp_gestures_hint:`On a lamp; the title always opens the details`,lamp_expandable:`Expandable lamps (chevron)`,lamp_expanded:`Unfolded at first`,lamp_expanded_helper:`A fold or unfold on the card is remembered on this device`,amb_device:`Ambilight Manager (ESPHome device)`,amb_found:`{found}/{total} entities found`,amb_missing:`missing: {list}`,amb_no_device:`Pick the ESPHome device of the Ambilight Manager. Until then: prefix {prefix}`,amb_yaml_prefix:`Prefix set in YAML: {prefix}`,amb_inputs:`HDMI inputs`,amb_inputs_hint:`names and icons`,amb_input_name:`Input {n} · name`,amb_input_icon:`Input {n} · icon`,amb_options:`Options`,amb_options_hint:`confirmation, send counter, halo`,amb_confirm_pi:`Confirm before cutting the Pi`,amb_counter:`Send counter (optional)`,amb_counter_helper:`A firmware sensor that changes on every confirmed send`,amb_hyperhdr:`HyperHDR server`,amb_hyperhdr_helper:`Optional: else the only one found`,amb_halo:`Halo`,amb_devices:`Devices`,amb_input_n:`Input {n}`,amb_inputs_pick:`Tap an input to name it and pick its icon`,amb_display:`Display`,amb_display_hint:`name, confirmation, halo`,amb_name_ph:`Ambilight`,amb_layout:`Layout`,amb_layout_line:`Line, the input as a menu`,amb_layout_tiles:`Head and a row of input tiles`,amb_source_display:`Input menu`,amb_display_both:`Icon and name`,amb_display_icon:`Icon only`,amb_display_name:`Name only`,amb_show_status:`Line under the name`,amb_show_pi:`Pi button`,amb_info:`Values next to the name`,amb_info_helper:`They wrap when they do not fit. Tap to add or remove; the arrows move`,amb_info_temperature:`Driving temperature`,amb_info_box:`Box`,amb_info_cpu:`Pi CPU`,amb_info_fan:`Fan`,amb_info_humidity:`Humidity`,amb_info_pressure:`Pressure`,amb_info_rpm:`Fan speed (rpm)`,amb_input_hidden:`Hide it from the menu`,amb_display_hint2:`layout, values, name, halo`,hh_mode:`Show`,hh_mode_all:`The hub and every strip`,hh_mode_hub:`The hub only`,hh_mode_strip:`One LED strip`,hh_server:`HyperHDR server`,hh_instance:`LED strip (HyperHDR instance)`,hh_hub_line:`Hub line`,hh_strip_line:`Strip lines`,hh_hub_info:`Second line`,hh_hub_values:`Values on the right`,hh_strip_info:`Second line`,hh_strip_icons:`Component states`,hh_order_helper:`Tap to add or remove; the arrows move an item`,hh_item_input:`Input`,hh_item_video_mode:`Resolution`,hh_item_capture_fps:`Capture fps`,hh_item_temperature:`Temperature`,hh_item_cpu:`CPU`,hh_item_memory:`RAM`,hh_item_version:`Version`,hh_item_strips:`Strips on`,hh_item_source:`Source`,hh_item_device:`LED device`,hh_item_fps:`Output fps`,hh_item_leds:`LED count`,hh_item_brightness:`Brightness`,hh_item_led_output:`LED output`,hh_item_video_capture:`Video capture`,hh_item_hdr:`HDR`,hh_item_smoothing:`Smoothing`,hh_item_black_border:`Black borders`,hh_show_strips:`One line per strip`,hh_show_power:`Power button of the strips`,hh_picture_timeout:`Picture in the details`,hh_picture_helper:`Shown when asked, it stops by itself after this long`,hh_minutes:`{n} min`,hh_found:`{servers} server · {strips} strips found`,hh_none_found:`No HyperHDR found: add the HA-HyperHDR integration first.`,hh_first:`Left empty: the first one found`,hh_options:`Options`,hh_options_hint:`name, picture, halo`,rh_room:`Room`,rh_name:`Title`,rh_lights:`Lights`,rh_lights_helper:`Left empty: the discovered groups`,rh_power:`Power sensor`,rh_entity:`Held power button opens`,rh_entity_helper:`Left empty: the first light`,rh_show_subtitle:`Lights on and consumption under the title`,rh_show_badges:`Badges under the title`,rh_room_helper:`Finds the helpers named "salon-lampes", "salon-présence"… (or light.salon_leds, binary_sensor.salon_presence…)`,rh_discover:`Find the room’s entities`,rh_roles_title:`Found for this room · tap to leave one out`,rh_none_found:`Nothing found for this room: set the lights and the power sensor below.`,rh_badges_yaml:`{count} badges added in YAML (code editor).`,rh_badges_auto:`More badges: list them under badges: in YAML; one on a found entity replaces its badge.`,rh_role_lampes:`Lamps`,rh_role_leds:`LEDs`,rh_role_interrupteurs:`Switches`,rh_role_puissance:`Power`,rh_role_eclairement:`Illuminance`,rh_role_presence:`Presence`,rh_role_fenetres:`Windows`,rh_role_portes:`Doors`,rh_role_temperature:`Temperature`,rh_role_humidite:`Humidity`,rh_role_pression:`Pressure`,rh_role_co2:`CO₂`,layout:`Layout`,layout_default:`Header and tile`,layout_collapsible:`Collapsible line`,expanded:`Unfolded at first`,expanded_helper:`Afterwards the card remembers what you chose on this device`,section_layout:`Layout`,section_box:`Ambilight box`,box:`Ambilight box`,box_auto:`Automatic`,box_off:`No rail`,box_helper:`A rail at the bottom of the card: HDMI input, temperature, fan, on/off`,box_found:`Found: {name}`,box_none:`No Ambilight box found nearby`,box_hyperhdr:`HyperHDR server`,box_confirm_off:`Ask before switching Ambilight off`,box_driven:`{count} strips follow the screen`,energy_name:`Name`,energy_section_tariff:`Tariff`,energy_peak_price:`Price of a kWh in peak hours (taxes included)`,energy_off_peak_price:`Price of a kWh in off-peak hours`,energy_off_peak_hours:`Off-peak hours`,energy_off_peak_hours_helper:`Ranges separated by commas, e.g. 22:00-06:00, 12:30-14:30`,energy_subscription_month:`Subscription per month (taxes included)`,energy_billing_day:`Day a billing cycle starts`,energy_invoices_hint:`Invoices already received go in YAML, under tariff.invoices.`,energy_section_source:`Data source`,energy_stat:`Energy statistic`,energy_stat_helper:`Empty: the grid of the Energy dashboard`,energy_cost_stat:`Cost statistic`,energy_layout:`Layout`,energy_layout_card:`Card`,energy_layout_line:`One line that unfolds`,energy_period:`Period`,energy_months:`Bills shown`,energy_glow:`Halo`,energy_period_day:`Day`,energy_period_week:`Week`,energy_period_month:`Month`,energy_period_year:`Year`,energy_max_devices:`Devices shown`,energy_ring:`Ring`,energy_ring_money:`Where the money goes`,energy_ring_off_peak:`Off-peak share`,energy_cycle:`Bill`,energy_cycle_last:`The last one`,energy_cycle_current:`The one in progress`},vo={en:_o,fr:{entity:`Lumière ou groupe`,badge_entity:`Lumière, prise ou groupe`,entity_missing:`Choisis une lumière ou un groupe de lumières pour commencer.`,entity_not_found:`Entité introuvable : {entity}`,group_detected:`Groupe détecté`,single_light:`Lumière seule`,lights_count:`{count} lumières`,wled_count:`{count} WLED`,wled:`WLED`,capability_hue:`couleur`,capability_temperature:`blanc réglable`,capability_dimmable:`variation seule`,power_found:`Conso trouvée pour {found} / {total}`,power_found_single:`Conso : {origin}`,power_none_title:`Aucune consommation trouvée.`,power_none_hint:`Indique un motif de capteur ou la tension des bandeaux, ou choisis un capteur par lumière ci-dessous.`,power_none_hint_plain:`Indique un motif de capteur, ou choisis un capteur par lumière ci-dessous.`,name:`Nom`,icon:`Icône`,toggle_ambilight:`Ambilight`,toggle_ambilight_none:`Ambilight · aucun WLED`,toggle_power:`Conso`,toggle_details:`Pop-up`,toggle_color:`Couleur`,color_auto_hue:`auto · teinte`,color_auto_temperature:`auto · température`,color_auto_none:`auto · aucune`,color_hue:`teinte`,color_temperature:`température`,color_none:`désactivée`,default_power:`Mesure par défaut`,sensor_pattern:`Motif du capteur`,sensor_pattern_helper:`{object_id} devient l’identifiant de la lumière`,voltage:`Tension des bandeaux`,power_order_hint:`Auto essaie le capteur choisi, le motif, un capteur de l’appareil, puis le courant WLED × tension.`,power_order_hint_plain:`Auto essaie le capteur choisi, le motif, puis un capteur de l’appareil.`,favorites_title:`Couleurs favorites`,favorites_hint:`un tap applique la couleur`,favorite_add:`Ajouter une couleur`,favorite_remove:`Retirer {color}`,section_appearance:`Apparence`,glow:`Intensité du halo`,glow_helper:`0\xA0% : aucun halo · 100\xA0% : par défaut · 200\xA0% : deux fois plus large`,glow_boost:`Halo selon la luminosité`,glow_boost_helper:`0\xA0% : même halo quelle que soit la luminosité · 100\xA0% : par défaut · 200\xA0% : discret tamisé, fort à fond`,show_header:`En-tête (nom et badges)`,compact:`Compact`,gradient:`Dégradé du bouton Power (groupes)`,animate_effects:`Miroitement pendant un effet`,brightness_min:`Luminosité minimale`,brightness_step:`Pas de luminosité`,transition:`Transition`,section_badges:`Badges`,badges_hint:`Affichés sur la tuile et en haut du pop-up.`,badge_add:`Ajouter une entité`,badge_remove:`Retirer {name}`,details_favorites:`Couleurs favorites par lumière`,details_wled_controls:`Presets, palette et vitesse WLED`,details_health:`Infos de l’appareil`,max_auto_helper:`Vide : limite de courant WLED × tension si connue`,member_icon:`Icône`,member_transition_helper:`Vide : celle de la tuile ({value})`,none:`aucune`,sort_custom:`Personnalisé`,move_up:`Monter {name}`,move_down:`Descendre {name}`,details_history:`Historique de conso`,price:`Prix`,price_helper:`Affiche le coût du jour dans le pop-up`,section_power:`Consommation`,favorites_one:`{count} favori`,favorites_other:`{count} favoris`,badges_one:`{count} badge`,badges_other:`{count} badges`,hidden_one:`{count} masquée`,hidden_other:`{count} masquées`,brightness_title:`Luminosité`,transition_helper:`Fondu appliqué à chaque changement (allumage, extinction, couleur)`,members_tap_hint:`Touche une lumière pour la régler.`,summary_no_header:`sans en-tête`,summary_no_gradient:`sans dégradé`,summary_no_shimmer:`sans miroitement`,details_content:`Affiché dans le pop-up`,sort_custom_helper:`Utilise les flèches dans « Lumières détectées »`,members_title:`Lumières détectées`,members_hint:`Tout est facultatif`,offline:`hors ligne`,ambilight_tag:`ambilight`,no_power:`pas de conso`,ambilight_member:`Répond au bouton ambilight`,power_mode:`Mesure`,mode_auto:`Auto`,mode_sensor:`Capteur`,mode_voltage:`Tension`,mode_none:`Aucune`,power_sensor:`Capteur de puissance`,origin_sensor:`Capteur choisi → {entity}`,origin_pattern:`Motif → {entity}`,origin_device:`Capteur de l’appareil → {entity}`,origin_estimated:`Courant WLED {current} mA × {voltage} V`,origin_unavailable:`{entity} · indisponible`,origin_none:`Rien trouvé`,origin_disabled:`Pas de mesure`,voltage_missing:`Indique une tension pour utiliser le courant estimé par WLED.`,member_name:`Nom affiché`,member_name_helper:`Auto : {name}`,member_visible:`Affichée dans le pop-up`,advanced:`Avancé`,advanced_summary:`apparence, tuile, gestes, pop-up`,advanced_summary_single:`apparence, tuile, gestes`,section_tile:`Tuile`,color_bar:`Barre de couleur`,color_bar_auto:`Auto`,color_bar_hue:`Teinte`,color_bar_temperature:`Température`,color_bar_none:`Aucune`,color_bar_same:`Comme la tuile`,state_text:`Texte d’état`,state_brightness:`Luminosité`,state_none:`Aucun`,effects:`Choix de l’effet`,section_gestures:`Gestes`,tap_action:`Tap`,hold_action:`Appui long`,double_tap_action:`Double tap`,action_toggle:`Allumer / éteindre`,action_details:`Pop-up`,action_more_info:`Fiche Home Assistant`,action_none:`Rien`,action_custom:`Personnalisé (YAML)`,action_default:`Par défaut ({action})`,section_details:`Pop-up`,details_hash:`Lien (hash)`,details_hash_helper:`Ouvrable depuis n’importe quelle carte : navigate → #{hash}`,details_sort:`Ordre`,sort_name:`Par nom`,sort_group:`Comme dans le groupe`,details_summary:`Badges du groupe en haut`,details_effects:`Choix de l’effet par lumière`,section_glow:`Lueur de la conso`,idle:`Neutre sous`,max:`Lueur maximale à`,badge_group:`Groupe ou entité`,badge_group_auto:`Groupe ou entité (vide : toutes les batteries)`,badge_action_details_default:`Par défaut (détail)`,aggregate:`Valeur affichée`,aggregate_mean:`Moyenne`,aggregate_median:`Médiane`,aggregate_min:`La plus basse`,aggregate_max:`La plus haute`,aggregate_sum:`Somme`,warn_after:`Ambre après (min)`,alert_after:`Rouge après (min)`,open_helper:`Minutes d’ouverture avant que la couleur change`,lux_max:`Jauge pleine à (lx)`,gauge:`Anneau de jauge autour de l’icône`,show_light_label:`Afficher le niveau (Lumineux, Tamisé, Sombre)`,show_light_label_helper:`Capteurs qui donnent un mot au lieu des lux ; sinon l’icône seule`,icon_color:`Icône sur les couleurs`,icon_color_white:`Blanche`,icon_color_auto:`Automatique (foncée sur les couleurs claires)`,comfort:`Plage de confort`,comfort_helper:`Bas et haut, dans l’unité du capteur : [19, 23]. Pas de halo dedans`,comfort_helper_co2:`Bas et haut en ppm : [400, 1000]. Pas de halo dedans`,aggregate_auto:`Automatique`,climate_aggregate_helper:`Plusieurs capteurs : en automatique, ce qui demande d’agir`,climate_range:`Durée du graphique`,climate_range_6h:`6 heures`,climate_range_24h:`24 heures`,climate_range_7d:`7 jours`,climate_range_30d:`30 jours`,climate_trend:`Tendance et alertes`,climate_trend_helper_temperature:`Flèche quand elle a bougé de plus de 0,5 °C en une heure`,climate_trend_helper_humidity:`Flèche quand elle a bougé de plus de 5 points en une heure ; pulse quand elle bondit (douche)`,climate_trend_helper_pressure:`Flèche sur la tendance à 3 h ; alerte quand elle chute vite`,battery_low:`Rouge sous (%)`,battery_warn:`Ambre sous (%)`,battery_display:`Afficher`,battery_display_level:`Le niveau le plus bas`,battery_display_low_count:`Le nombre de faibles`,show_duration:`Afficher la durée`,show_open_count:`Afficher le compte (2/7)`,show_zero_closed:`L’afficher aussi quand tout est fermé (0/7)`,show_zero_clear:`L’afficher aussi quand personne n’est là (0/4)`,icon_active:`Icône active`,icon_rest:`Icône au repos`,power_idle:`Neutre sous (W)`,power_max:`Lueur maximale à (W)`,icon_on:`Icône allumée`,icon_off:`Icône éteinte`,icon_auto:`Vide : {icon}`,icon_auto_struck:`Vide : {icon} barrée`,badge_look:`Style`,look_disc:`Pastille`,look_pill:`Badge entier`,badge_layout:`Détail`,layout_list:`Liste avec sliders`,layout_compact:`Compact`,show_count:`Afficher le compte (2/3) ou la luminosité`,show_zero:`L’afficher aussi quand tout est éteint (0/3)`,badge_tap_default:`Par défaut (tout allumer / éteindre)`,badge_hold_default:`Par défaut (lumières sous le badge)`,badge_details_title:`Titre du détail`,saturation_bar:`Curseur de saturation sous les couleurs`,saturation_bar_helper:`Du pâle à la couleur pleine ; sans lui, les couleurs sont toujours pleines`,details_saturation_bar:`Curseur de saturation`,lamp_entity:`Lampes (un groupe, ou une lampe)`,lamp_entities:`Ou plusieurs lampes`,lamp_layout:`Disposition`,lamp_layout_ambiance:`Ambiances : préréglages et un bouton par lampe`,lamp_layout_line:`Une ligne : un petit bouton par lampe`,lamps_section:`Lampes`,lamps_hint:`Noms, icônes allumée et éteinte, capteur de puissance`,lamp_visible:`Affichée sur la carte`,lamp_sensor_auto:`Vide : {sensor}`,lamp_sensor_none:`Vide : aucun trouvé sur l’appareil`,scenes_section:`Préréglages rapides`,scenes_hint:`Facultatif : des boutons qui basculent plusieurs lampes d’un coup`,scenes_none:`Aucun préréglage pour l’instant.`,scene_add:`Ajouter un préréglage`,scene_remove:`Supprimer`,scene_name:`Nom`,scene_kind:`Action`,scene_kind_lamps:`Allume ces lampes, éteint les autres`,scene_kind_scene:`Active une scène Home Assistant`,scene_entity:`Scène`,scene_lamps:`Lampes allumées dans ce préréglage (aucune : tout éteindre)`,scene_default_name:`Préréglage {n}`,show_power:`Afficher les watts`,show_energy:`Énergie et coût du jour dans le détail`,price_entity:`Ou une entité de prix`,price_entity_helper:`Un capteur ou input_number donnant le prix du kWh (tarif variable) ; il passe avant le prix`,max_watts:`Halo maximal à`,max_watts_helper:`Une lampe qui consomme autant brille le plus`,warn_below:`Signaler une lampe allumée qui consomme moins de`,warn_below_helper:`Ampoule grillée, ou interrupteur de la lampe coupé. 0 pour désactiver`,lamp_show_header:`En-tête (nom, compteur, consommation)`,lamp_show_count:`Compteur (3/4 allumées)`,lamp_show_toggle_all:`Bouton de tout le groupe`,lamp_show_names:`Noms sous les lampes`,lamp_show_status:`Watts et durée sous les lampes`,lamp_size:`Taille des boutons`,lamp_size_small:`Petite`,lamp_size_medium:`Moyenne`,lamp_size_large:`Grande`,lamp_columns:`Lampes par ligne`,lamp_columns_helper:`Vide : autant que la place le permet`,lamp_icons_only:`icônes seules`,lamp_gestures_hint:`Sur une lampe ; le titre ouvre toujours le détail`,lamp_expandable:`Lampes dépliables (chevron)`,lamp_expanded:`Dépliée au départ`,lamp_expanded_helper:`Un pliage ou dépliage fait sur la carte est retenu sur cet appareil`,amb_device:`Ambilight Manager (appareil ESPHome)`,amb_found:`{found}/{total} entités trouvées`,amb_missing:`manquantes : {list}`,amb_no_device:`Choisis l’appareil ESPHome de l’Ambilight Manager. En attendant : préfixe {prefix}`,amb_yaml_prefix:`Préfixe défini en YAML : {prefix}`,amb_inputs:`Entrées HDMI`,amb_inputs_hint:`noms et icônes`,amb_input_name:`Entrée {n} · nom`,amb_input_icon:`Entrée {n} · icône`,amb_options:`Options`,amb_options_hint:`confirmation, compteur d’envois, halo`,amb_confirm_pi:`Confirmer avant de couper le Pi`,amb_counter:`Compteur d’envois (optionnel)`,amb_counter_helper:`Un capteur du firmware qui change à chaque envoi confirmé`,amb_hyperhdr:`Serveur HyperHDR`,amb_hyperhdr_helper:`Facultatif : sinon le seul qui existe`,amb_halo:`Halo`,amb_devices:`Appareils`,amb_input_n:`Entrée {n}`,amb_inputs_pick:`Touche une entrée pour la nommer et choisir son icône`,amb_display:`Affichage`,amb_display_hint:`nom, confirmation, halo`,amb_name_ph:`Ambilight`,amb_layout:`Disposition`,amb_layout_line:`Ligne, l’entrée en menu`,amb_layout_tiles:`En-tête et rangée d’entrées`,amb_source_display:`Menu d’entrée`,amb_display_both:`Icône et nom`,amb_display_icon:`Icône seule`,amb_display_name:`Nom seul`,amb_show_status:`Ligne sous le nom`,amb_show_pi:`Bouton du Pi`,amb_info:`Valeurs à droite du nom`,amb_info_helper:`Elles passent à la ligne quand elles ne tiennent pas. Touche pour ajouter ou retirer ; les flèches déplacent`,amb_info_temperature:`Température pilote`,amb_info_box:`Boîtier`,amb_info_cpu:`CPU du Pi`,amb_info_fan:`Ventilateur`,amb_info_humidity:`Humidité`,amb_info_pressure:`Pression`,amb_info_rpm:`Vitesse (tr/min)`,amb_input_hidden:`La masquer du menu`,amb_display_hint2:`disposition, valeurs, nom, halo`,hh_mode:`Afficher`,hh_mode_all:`Le hub et tous les bandeaux`,hh_mode_hub:`Le hub seul`,hh_mode_strip:`Un bandeau LED`,hh_server:`Serveur HyperHDR`,hh_instance:`Bandeau LED (instance HyperHDR)`,hh_hub_line:`Ligne du hub`,hh_strip_line:`Lignes des bandeaux`,hh_hub_info:`Deuxième ligne`,hh_hub_values:`Valeurs à droite`,hh_strip_info:`Deuxième ligne`,hh_strip_icons:`État des composants`,hh_order_helper:`Touche pour ajouter ou retirer ; les flèches déplacent`,hh_item_input:`Entrée`,hh_item_video_mode:`Résolution`,hh_item_capture_fps:`fps de capture`,hh_item_temperature:`Température`,hh_item_cpu:`CPU`,hh_item_memory:`RAM`,hh_item_version:`Version`,hh_item_strips:`Bandeaux allumés`,hh_item_source:`Source`,hh_item_device:`Appareil LED`,hh_item_fps:`fps de sortie`,hh_item_leds:`Nombre de LED`,hh_item_brightness:`Luminosité`,hh_item_led_output:`Sortie LED`,hh_item_video_capture:`Capture vidéo`,hh_item_hdr:`HDR`,hh_item_smoothing:`Lissage`,hh_item_black_border:`Bandes noires`,hh_show_strips:`Une ligne par bandeau`,hh_show_power:`Bouton marche des bandeaux`,hh_picture_timeout:`Image dans les détails`,hh_picture_helper:`Affichée à la demande, elle s’arrête seule après ce délai`,hh_minutes:`{n} min`,hh_found:`{servers} serveur · {strips} bandeaux trouvés`,hh_none_found:`Aucun HyperHDR trouvé : ajoutez d’abord l’intégration HA-HyperHDR.`,hh_first:`Vide : le premier trouvé`,hh_options:`Options`,hh_options_hint:`nom, image, halo`,rh_room:`Pièce`,rh_name:`Titre`,rh_lights:`Lumières`,rh_lights_helper:`Vide : les groupes trouvés`,rh_power:`Capteur de puissance`,rh_entity:`Appui long sur le bouton : ouvre`,rh_entity_helper:`Vide : la première lumière`,rh_show_subtitle:`Lumières allumées et conso sous le titre`,rh_show_badges:`Badges sous le titre`,rh_room_helper:`Trouve les entrées nommées « salon-lampes », « salon-présence »… (ou light.salon_leds, binary_sensor.salon_presence…)`,rh_discover:`Trouver les entités de la pièce`,rh_roles_title:`Trouvé pour cette pièce · touchez pour en retirer`,rh_none_found:`Rien trouvé pour cette pièce : choisissez les lumières et le capteur de puissance ci-dessous.`,rh_badges_yaml:`{count} badges ajoutés en YAML (éditeur de code).`,rh_badges_auto:`D’autres badges : listez-les sous badges: en YAML ; un badge sur une entité trouvée remplace le sien.`,rh_role_lampes:`Lampes`,rh_role_leds:`LEDs`,rh_role_interrupteurs:`Interrupteurs`,rh_role_puissance:`Puissance`,rh_role_eclairement:`Éclairement`,rh_role_presence:`Présence`,rh_role_fenetres:`Fenêtres`,rh_role_portes:`Portes`,rh_role_temperature:`Température`,rh_role_humidite:`Humidité`,rh_role_pression:`Pression`,rh_role_co2:`CO₂`,layout:`Disposition`,layout_default:`En-tête et tuile`,layout_collapsible:`Ligne repliable`,expanded:`Dépliée au départ`,expanded_helper:`Ensuite, la carte retient ton choix sur cet appareil`,section_layout:`Disposition`,section_box:`Boîtier Ambilight`,box:`Boîtier Ambilight`,box_auto:`Automatique`,box_off:`Pas de rail`,box_helper:`Un rail en bas de la carte : entrée HDMI, température, ventilateur, marche/arrêt`,box_found:`Trouvé : {name}`,box_none:`Aucun boîtier Ambilight trouvé à proximité`,box_hyperhdr:`Serveur HyperHDR`,box_confirm_off:`Demander avant d’éteindre l’Ambilight`,box_driven:`{count} bandeaux suivent l’écran`,energy_name:`Nom`,energy_section_tariff:`Tarif`,energy_peak_price:`Prix du kWh en heures pleines (TTC)`,energy_off_peak_price:`Prix du kWh en heures creuses (TTC)`,energy_off_peak_hours:`Heures creuses`,energy_off_peak_hours_helper:`Plages séparées par des virgules, ex. 22:00-06:00, 12:30-14:30`,energy_subscription_month:`Abonnement par mois (TTC)`,energy_billing_day:`Jour de début du cycle de facturation`,energy_invoices_hint:`Les factures déjà reçues se déclarent en YAML, sous tariff.invoices.`,energy_section_source:`Source des données`,energy_stat:`Statistique d’énergie`,energy_stat_helper:`Vide : le réseau du tableau Énergie`,energy_cost_stat:`Statistique de coût`,energy_layout:`Disposition`,energy_layout_card:`Carte`,energy_layout_line:`Une ligne dépliable`,energy_period:`Période`,energy_months:`Factures affichées`,energy_glow:`Halo`,energy_period_day:`Jour`,energy_period_week:`Semaine`,energy_period_month:`Mois`,energy_period_year:`Année`,energy_max_devices:`Appareils affichés`,energy_ring:`Anneau`,energy_ring_money:`Où part chaque euro`,energy_ring_off_peak:`Part des heures creuses`,energy_cycle:`Facture`,energy_cycle_last:`La dernière`,energy_cycle_current:`Celle en cours`}};function yo(e,t,n={}){return(vo[fn(e)]??_o)[t].replace(/\{(\w+)\}/g,(e,t)=>t in n?String(n[t]):e)}var bo=4,xo=class extends O{static properties={hass:{attribute:!1},_config:{state:!0},_open:{state:!0},_input:{state:!0}};constructor(){super(),this._open=/* @__PURE__ */ new Set([`inputs`]),this._input=0}static styles=[H,o`
      :host {
        display: block;
      }
      .editor {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        flex: none;
      }
      .status {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin: -4px 0 4px;
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.05);
        font-size: 12.5px;
        line-height: 1.4;
        color: var(--secondary-text-color);
      }
      .status ha-icon {
        --mdc-icon-size: 16px;
        margin-top: 1px;
      }
      .status.ok ha-icon {
        color: var(--success-color, #43a047);
      }
      .status.warn ha-icon {
        color: var(--warning-color, #ffa000);
      }
      .status b {
        color: var(--primary-text-color);
        font-weight: 500;
      }
      .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px;
      }
      .section {
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
        border-radius: 12px;
        overflow: hidden;
      }
      summary {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        cursor: pointer;
        list-style: none;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      .section-title {
        font-weight: 500;
        flex: none;
      }
      .hint {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .chevron {
        margin-left: auto;
        transition: transform 0.2s ease;
      }
      .section[open] > summary .chevron {
        transform: rotate(180deg);
      }
      .section-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 4px 14px 14px;
      }
      .hint-line {
        font-size: 12.5px;
        color: var(--secondary-text-color);
      }
      /* The two devices, joined by their link. */
      .chain {
        display: flex;
        flex-direction: column;
      }
      .chain > .status {
        margin: 8px 0 0;
      }
      .tile {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        border-radius: 16px;
        background: rgba(var(--vivid-rgb-text), 0.04);
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
      }
      .tile-head {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }
      .disc {
        display: grid;
        place-items: center;
        flex: none;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: var(--disc-bg, rgba(var(--vivid-rgb-text), 0.07));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
      }
      .disc ha-icon {
        --mdc-icon-size: 22px;
      }
      .tile-names {
        display: flex;
        flex-direction: column;
        min-width: 0;
        line-height: 1.3;
      }
      .tile-names small {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--secondary-text-color);
      }
      .tile-names b {
        font-size: 15px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .facts {
        display: flex;
        flex-wrap: wrap;
        gap: 0 6px;
        font-size: 12.5px;
        color: var(--secondary-text-color);
      }
      .facts i {
        font-style: normal;
        opacity: 0.6;
      }
      .warn {
        color: var(--warning-color, #ffa000);
      }
      .link {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 10px 12px 10px 15px;
        font-size: 12.5px;
        line-height: 1.4;
        color: var(--secondary-text-color);
      }
      /* The wire from one tile to the other, through the state dot. */
      .link::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 32px;
        width: 2px;
        border-radius: 1px;
        background: var(--link-color, var(--divider-color, rgba(255, 255, 255, 0.12)));
        opacity: 0.6;
      }
      .link.ok {
        --link-color: var(--success-color, #66bb6a);
      }
      .link.warn {
        --link-color: var(--warning-color, #ffa000);
        color: var(--secondary-text-color);
      }
      .link-dot {
        position: relative;
        display: grid;
        place-items: center;
        flex: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--disc-bg);
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color);
      }
      .link-dot ha-icon {
        --mdc-icon-size: 18px;
      }
      .link-text {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
        padding-top: 8px;
      }
      .link-text b {
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .link-text pre {
        margin: 0;
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.06);
        color: var(--primary-text-color);
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        user-select: all;
      }
    `];setConfig(e){this._config=e}connectedCallback(){super.connectedCallback(),go().then(()=>this.requestUpdate())}t(e,t){return yo(this.hass,e,t)}commit(e){let t=e;this._config=t,N(this,`config-changed`,{config:t})}form(e,t,n,r,i={}){return T`<ha-form
      .hass=${this.hass}
      .data=${t}
      .schema=${e}
      .computeLabel=${e=>r[e.name]}
      .computeHelper=${e=>i[e.name]}
      @value-changed=${e=>{e.stopPropagation(),n(e.detail.value)}}
    ></ha-form>`}section(e,t,n,r,i){let a=this._open.has(e);return T`<details
      class="section"
      ?open=${a}
      @toggle=${t=>{let n=t.target.open;if(n===this._open.has(e))return;let r=new Set(this._open);n?r.add(e):r.delete(e),this._open=r}}
    >
      <summary>
        <ha-icon .icon=${t}></ha-icon>
        <span class="section-title">${n}</span>
        <span class="hint">${r}</span>
        <ha-icon class="chevron" .icon=${`mdi:chevron-down`}></ha-icon>
      </summary>
      <div class="section-body">${a?i():D}</div>
    </details>`}status(e,t){return T`<div class="status ${e}">
      <ha-icon .icon=${e===`ok`?`mdi:check-circle-outline`:e===`warn`?`mdi:alert-outline`:`mdi:information-outline`}></ha-icon><span>${t}</span>
    </div>`}picker(e,t){let n=t===`device`?{device:{integration:$n}}:{device:{filter:{integration:ar},entity:{domain:`binary_sensor`}}};return this.form([{name:t,selector:n}],{[t]:e[t]??``},n=>{let r={...e},i=typeof n[t]==`string`?n[t].trim():``;i?r[t]=i:delete r[t],t===`device`&&r.device!==e.device&&delete r.prefix,this.commit(r)},{device:this.t(`amb_device`),hyperhdr:this.t(`amb_hyperhdr`)},{hyperhdr:this.t(`amb_hyperhdr_helper`)})}tile(e,t,n,r,i,a){let o=t?L(t,.7):void 0;return T`<div class="tile">
      <div class="tile-head">
        <span
          class="disc"
          style=${k({"--disc-bg":o?.background,"--disc-shadow":o?.shadow,"--disc-color":o?.iconColor})}
          ><ha-icon .icon=${e}></ha-icon
        ></span>
        <span class="tile-names"
          ><small>${n}</small><b>${r??`—`}</b
          ><span class="facts"
            >${i.filter(e=>e!==void 0&&e!==``).map((e,t)=>T`${t?T`<i>·</i>`:D}<span>${e}</span>`)}</span
          ></span
        >
      </div>
      ${a}
    </div>`}renderDevices(e){let t=this.hass;if(!t)return D;let n=Qn(e,rr(t,e)),r=Ur(t,n),{found:i,total:a,missing:o}=nr(t,n.entities),s=!!(e.device||e.prefix),c=e.device?t.devices?.[e.device]:void 0,l=(c?c.name_by_user||c.name:e.prefix)??void 0,u=s?r.online?o.length?qa:Ka:Ja:void 0,d=s?[B(t,r.online?`amb_online_short`:`amb_offline`),T`<span class=${o.length?`warn`:``}
            >${B(t,`amb_entities`,{found:i,total:a})}</span
          >`]:[this.t(`amb_no_device`,{prefix:Vn})],f=o.length?this.status(`warn`,T`${this.t(`amb_missing`,{list:``})}<span class="mono"
              >${o.slice(0,bo).join(`, `)}${o.length>bo?` … (+${o.length-bo})`:``}</span
            >`):e.prefix?this.status(`info`,T`${this.t(`amb_yaml_prefix`,{prefix:``})}<span class="mono"
                >${e.prefix}</span
              >`):D,p=r.hub,m=Br(t,r),h=p?p.connected?Ka:Ya:void 0,g=p?[B(t,p.connected?`amb_hh_connected`:`amb_hh_away`),p.temperature===void 0||!p.connected?void 0:`${B(t,`amb_cpu`)} ${Za(t,p.temperature,0)}`]:[B(t,`amb_link_none`)];return T`<div class="chain">
      ${this.tile(`mdi:fan`,u,B(t,`amb_box`),l,d,this.picker(e,`device`))}
      ${f} ${this.renderLink(m)}
      ${this.tile(p?_r(p):`mdi:raspberry-pi`,h,B(t,`amb_hyperhdr_server`),p?.name,g,this.picker(e,`hyperhdr`))}
    </div>`}renderLink(e){let t=this.hass,n=mo(e.state),r=L(n.rgb,.6),i=[[`hyperhdr_connected`,e.ids.connected],[`hyperhdr_cpu_temperature`,e.ids.cpuTemperature],[`hyperhdr_power_off`,e.ids.powerOff]].filter(e=>e[1]!==void 0);return T`<div class=${`link ${n.kind}`}>
      <span
        class="link-dot"
        style=${k({"--disc-bg":r.background,"--disc-shadow":r.shadow,"--disc-color":r.iconColor})}
        ><ha-icon .icon=${n.icon}></ha-icon
      ></span>
      <div class="link-text">
        <b>${B(t,n.label)}</b>
        ${e.state===`unseen`?T`<span>${B(t,`amb_link_unseen_hint`)}</span>
                <pre class="mono">
substitutions:
${i.map(([e,t])=>`  ${e}: ${t}`).join(`
`)}</pre>
                <span>${B(t,`amb_link_unseen_after`)}</span>`:D}
        ${e.noPowerOff?T`<span class="warn">${B(t,`amb_link_nopoweroff`)}</span>`:D}
      </div>
    </div>`}renderInputs(e){let t=this.hass,n=Qn(e).inputs,r=Math.min(this._input,4),i=r+1,a=e.inputs?.[r],o=typeof a==`string`?{name:a}:a??{},s=T`<vivid-source-row
      .items=${n.map(e=>({name:e.name,icon:e.icon,available:!0}))}
      .active=${r}
      .labels=${fo(t)}
      @vivid-source-select=${e=>{e.stopPropagation(),this._input=e.detail.index}}
    ></vivid-source-row>`,c=this.form([{type:`grid`,name:``,schema:[{name:`name`,selector:{text:{}}},{name:`icon`,selector:{icon:{placeholder:`mdi:video-input-hdmi`}}}]},{name:`hidden`,selector:{boolean:{}}}],{name:o.name??``,icon:o.icon??``,hidden:o.hidden===!0},t=>{let n=e=>typeof t[e]==`string`?t[e].trim():``,i=Array.from({length:5},(t,n)=>{let r=e.inputs?.[n];return typeof r==`string`?{name:r}:{...r??{}}}),a=n(`name`),o=n(`icon`);for(i[r]={...a?{name:a}:{},...o?{icon:o}:{},...t.hidden===!0?{hidden:!0}:{}};i.length&&Object.keys(i[i.length-1]??{}).length===0;)i.pop();let s={...e};i.length?s.inputs=i:delete s.inputs,this.commit(s)},{name:this.t(`amb_input_name`,{n:i}),icon:this.t(`amb_input_icon`,{n:i}),hidden:this.t(`amb_input_hidden`)});return T`<div class="hint-line">${this.t(`amb_inputs_pick`)}</div>
      ${s}${c}`}renderSettings(e){let t=Qn(e),n=(e,t)=>({select:{mode:`dropdown`,options:e.map(e=>({value:e,label:this.t(`${t}${e}`)}))}});return T`${this.form([{name:`layout`,selector:n(Wn,`amb_layout_`)},...t.layout===`line`?[{name:`source_display`,selector:n(Gn,`amb_display_`)}]:[],{type:`grid`,name:``,schema:[{name:`show_status`,selector:{boolean:{}}},{name:`show_pi`,selector:{boolean:{}}}]}],{layout:t.layout,source_display:t.sourceDisplay,show_status:t.showStatus,show_pi:t.showPi},t=>{let n={...e};t.layout===`tiles`?n.layout=`tiles`:delete n.layout,t.source_display===`icon`||t.source_display===`name`?n.source_display=t.source_display:delete n.source_display;for(let e of[`show_status`,`show_pi`])t[e]===!1?n[e]=!1:delete n[e];this.commit(n)},{layout:this.t(`amb_layout`),source_display:this.t(`amb_source_display`),show_status:this.t(`amb_show_status`),show_pi:this.t(`amb_show_pi`)})}${T`<vivid-order-picker
      .items=${Kn.map(e=>({value:e,label:this.t(`amb_info_${e}`),icon:So[e]}))}
      .value=${t.info}
      .label=${this.t(`amb_info`)}
      .helper=${this.t(`amb_info_helper`)}
      @value-changed=${t=>{t.stopPropagation();let n={...e},r=t.detail.value;r.length===qn.length&&r.every((e,t)=>e===qn[t])?delete n.info:n.info=r,this.commit(n)}}
    ></vivid-order-picker>`}${this.form([{name:`name`,selector:{text:{}}},{name:`confirm_pi_off`,selector:{boolean:{}}},{name:`glow`,selector:Et},{name:`send_counter_entity`,selector:{entity:{domain:`sensor`}}}],{name:e.name??``,confirm_pi_off:e.confirm_pi_off!==!1,send_counter_entity:e.send_counter_entity??``,glow:e.glow??100},t=>{let n={...e},r=typeof t.name==`string`?t.name.trim():``;r?n.name=r:delete n.name,t.confirm_pi_off===!1?n.confirm_pi_off=!1:delete n.confirm_pi_off;let i=typeof t.send_counter_entity==`string`?t.send_counter_entity.trim():``;i?n.send_counter_entity=i:delete n.send_counter_entity,typeof t.glow==`number`&&t.glow!==100?n.glow=t.glow:delete n.glow,this.commit(n)},{name:yo(this.hass,`name`),confirm_pi_off:this.t(`amb_confirm_pi`),send_counter_entity:this.t(`amb_counter`),glow:this.t(`amb_halo`)},{send_counter_entity:this.t(`amb_counter_helper`)})}`}render(){let e=this._config;return e?T`<div class="editor">
      ${this.renderDevices(e)}
      ${this.section(`inputs`,`mdi:video-input-hdmi`,this.t(`amb_inputs`),this.t(`amb_inputs_hint`),()=>this.renderInputs(e))}
      ${this.section(`options`,`mdi:tune-variant`,this.t(`amb_display`),this.t(`amb_display_hint2`),()=>this.renderSettings(e))}
    </div>`:D}},So={temperature:`mdi:thermometer-auto`,box:`mdi:thermometer`,cpu:`mdi:cpu-64-bit`,fan:`mdi:fan`,humidity:`mdi:water-percent`,pressure:`mdi:gauge`,rpm:`mdi:rotate-right`};z(`vivid-ambilight-card-editor`,xo);var Co=[239,83,80];function wo(e,t,n,r){let i=Math.round((e-n)/t)*t+n;return F(Math.round(i*1e3)/1e3,n,r)}z(`vivid-fan-curve`,class extends O{static properties={points:{attribute:!1},temperature:{type:Number},stop:{type:Boolean},hysteresis:{type:Number},overheat:{type:Number},selected:{type:Number},mini:{type:Boolean,reflect:!0},editable:{type:Boolean},colorAt:{attribute:!1},format:{attribute:!1},drag:{state:!0}};constructor(){super(),this.points=[],this.stop=!1,this.mini=!1,this.editable=!1}static styles=[H,o`
      :host {
        display: block;
      }
      svg {
        display: block;
        width: 100%;
        height: auto;
        overflow: visible;
        touch-action: none;
      }
      :host([mini]) svg {
        touch-action: auto;
      }
      .axis {
        font-size: 10px;
        fill: var(--secondary-text-color);
      }
      .grid {
        stroke: rgba(var(--vivid-rgb-text), 0.08);
      }
      .label {
        font-size: 10.5px;
        font-weight: 600;
        fill: var(--primary-text-color);
      }
      .handle {
        cursor: grab;
      }
      .handle text {
        font-size: 10px;
        font-weight: 700;
        pointer-events: none;
      }
    `];get geometry(){let e=this.mini,t=e?200:400,n=e?40:210,[r,i,a,o]=e?[3,3,5,5]:[38,12,14,24],s=this.points.map(e=>e.t),c=Math.min(20,...s.map(e=>e-5)),l=Math.max(60,(this.overheat??0)+5,...s.map(e=>e+5)),u=Math.floor(c/5)*5,d=Math.ceil(l/5)*5;return{width:t,height:n,left:r,right:i,top:a,bottom:o,tMin:u,tMax:d,x:e=>r+(e-u)/(d-u)*(t-r-i),y:e=>a+(1-e/100)*(n-a-o),tOf:e=>u+(e-r)/(t-r-i)*(d-u),sOf:e=>(1-(e-a)/(n-a-o))*100}}get livePoints(){let e=this.drag;return this.points.map((t,n)=>e&&e.index===n?{...t,t:e.t,s:e.s}:t)}fmt(e,t=0){return this.format?this.format(e,t):e.toFixed(t)}toSvg(e){let t=this.renderRoot.querySelector(`svg`)?.getBoundingClientRect();if(!t||!t.width)return;let{width:n,height:r}=this.geometry;return{px:(e.clientX-t.left)/t.width*n,py:(e.clientY-t.top)/t.height*r}}onDown(e,t){if(!this.editable)return;e.preventDefault();let n=this.points[t];n&&(e.currentTarget.setPointerCapture?.(e.pointerId),this.drag={index:t,pointerId:e.pointerId,t:n.t,s:n.s},N(this,`vivid-curve-select`,{index:t}))}onMove(e){let t=this.drag;if(!t||t.pointerId!==e.pointerId)return;let n=this.points[t.index],r=this.toSvg(e);if(!n||!r)return;let{tOf:i,sOf:a}=this.geometry;this.drag={...t,t:wo(i(r.px),n.tStep,n.tMin,n.tMax),s:wo(a(r.py),n.sStep,n.sMin,n.sMax)}}onUp(e){let t=this.drag;if(!t||t.pointerId!==e.pointerId)return;this.drag=void 0;let n=this.points[t.index];n&&(n.t!==t.t||n.s!==t.s)&&N(this,`vivid-curve-change`,{index:t.index,t:t.t,s:t.s})}gradient(e,t,n,r){let i=this.colorAt??(()=>[66,165,245]),a=Array.from({length:9},(e,r)=>t+(n-t)*r/8);return E`<linearGradient id=${e} gradientUnits="userSpaceOnUse" x1=${r(t)} x2=${r(n)} y1="0" y2="0">
      ${a.map((e,t)=>E`<stop offset=${t/8} stop-color=${I(i(e))}></stop>`)}
    </linearGradient>
    <linearGradient id=${`${e}-fade`} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="white" stop-opacity="0.9"></stop>
      <stop offset="1" stop-color="white" stop-opacity="0"></stop>
    </linearGradient>`}render(){if(this.points.length===0)return D;let{width:e,height:t,top:n,bottom:r,left:i,right:a,tMin:o,tMax:s,x:c,y:l}=this.geometry,u=this.livePoints,d=[...u].sort((e,t)=>e.t-t.t),f=d[0],p=d[d.length-1],m=this.stop?[[o,0],[f.t,0],[f.t,f.s]]:[[o,f.s]];m.push(...d.map(e=>[e.t,e.s]),[s,p.s]);let h=m.map(([e,t],n)=>`${n?`L`:`M`}${c(e).toFixed(1)},${l(t).toFixed(1)}`).join(` `),g=`${h} L${c(s).toFixed(1)},${l(0).toFixed(1)} L${c(o).toFixed(1)},${l(0).toFixed(1)} Z`,_=this.mini?`curve-mini`:`curve-full`,v=t-r,y=this.temperature,b=y===void 0?void 0:{t:F(y,o,s),s:ir(u,y,this.stop)},x=this.colorAt??(()=>[66,165,245]),ee=this.mini?D:E`${[0,25,50,75,100].map(t=>E`<line class="grid" x1=${i} x2=${e-a} y1=${l(t)} y2=${l(t)}></line>
            <text class="axis" x=${i-6} y=${l(t)+3} text-anchor="end">${t} %</text>`)}
        ${Array.from({length:Math.floor((s-o)/10)+1},(e,t)=>o+t*10).map(e=>E`<text class="axis" x=${c(e)} y=${t-6} text-anchor="middle">${e} °C</text>`)}`,S=this.mini||this.overheat===void 0||this.overheat>=s?D:E`<rect x=${c(this.overheat)} y=${n} width=${c(s)-c(this.overheat)} height=${v-n}
              fill=${I(Co,.12)}></rect>
            <line x1=${c(this.overheat)} x2=${c(this.overheat)} y1=${n} y2=${v}
              stroke=${I(Co,.8)} stroke-dasharray="3 3"></line>`,te=this.hysteresis??0,ne=this.mini||!this.stop||te<=0?D:E`<rect x=${c(f.t-te)} y=${n} width=${c(f.t)-c(f.t-te)} height=${v-n}
              fill="rgba(var(--vivid-rgb-text), 0.07)"></rect>
            <line x1=${c(f.t-te)} x2=${c(f.t)} y1=${l(f.s)} y2=${l(f.s)}
              stroke=${`url(#${_})`} stroke-width="2" stroke-dasharray="2 3" opacity="0.7"></line>`,C=b?(()=>{let t=x(b.t),r=c(b.t),o=l(b.s),s=`${this.fmt(y??b.t,1)} °C → ${Math.round(b.s)} %`,u=F(r-92-8,i+2,e-a-92);return E`<line x1=${r} x2=${r} y1=${n} y2=${v} stroke="rgba(var(--vivid-rgb-text), 0.35)"
              stroke-dasharray=${this.mini?`2 2`:`3 3`}></line>
            ${this.mini?D:E`<rect x=${u} y=${Math.max(n,o-32)} width=${92} height="20" rx="10"
                    fill="var(--vivid-layer-1)" stroke=${I(t,.6)}></rect>
                  <text class="label" x=${u+46} y=${Math.max(n,o-32)+13.5} text-anchor="middle">${s}</text>`}
            <circle cx=${r} cy=${o} r=${this.mini?9:11} fill=${I(t,.25)}></circle>
            <circle cx=${r} cy=${o} r=${this.mini?4:6} fill=${I(t)} stroke="var(--vivid-layer-0)" stroke-width="2"></circle>`})():D,re=this.mini?D:u.map((e,t)=>{let n=x(e.t),r=this.selected===t||this.drag?.index===t;return E`<g class="handle"
              @pointerdown=${e=>this.onDown(e,t)}
              @pointermove=${e=>this.onMove(e)}
              @pointerup=${e=>this.onUp(e)}
              @pointercancel=${e=>this.onUp(e)}>
            <circle cx=${c(e.t)} cy=${l(e.s)} r="18" fill="transparent"></circle>
            <circle cx=${c(e.t)} cy=${l(e.s)} r=${r?9.5:8} fill=${r?I(n):`var(--vivid-layer-0)`}
              stroke=${I(n)} stroke-width="2.5"></circle>
            <text x=${c(e.t)} y=${l(e.s)+3.5} text-anchor="middle"
              fill=${r?`#fff`:`var(--primary-text-color)`}>${t+1}</text>
          </g>`});return T`<svg viewBox=${`0 0 ${e} ${t}`} role="img" aria-label="Fan curve">
      <defs>
        ${this.gradient(_,o,s,c)}
        <mask id=${`${_}-mask`}>
          <rect x="0" y="0" width=${e} height=${t} fill=${`url(#${_}-fade)`}></rect>
        </mask>
      </defs>
      ${ee}${S}${ne}
      <path d=${g} fill=${`url(#${_})`} opacity="0.22" mask=${`url(#${_}-mask)`}></path>
      <path
        d=${h}
        fill="none"
        stroke=${`url(#${_})`}
        stroke-width=${this.mini?2.2:3}
        stroke-linejoin="round"
        stroke-linecap="round"
      ></path>
      ${C}${re}
    </svg>`}});var To=[{id:`overview`,icon:`mdi:view-dashboard-outline`,label:`amb_tab_overview`},{id:`fan`,icon:`mdi:fan`,label:`amb_tab_fan`},{id:`ir`,icon:`mdi:video-input-hdmi`,label:`amb_tab_ir`},{id:`maint`,icon:`mdi:tune-variant`,label:`amb_tab_maint`}],Eo=[0,25,50,75,100],Do={0:`fan0`,25:`fan25`,50:`fan50`,75:`fan75`,100:`fan100`},Oo=3e3;z(`vivid-ambilight-details`,class extends O{static properties={hass:{attribute:!1},model:{attribute:!1},config:{attribute:!1},phases:{attribute:!1},tab:{state:!0},point:{state:!0},step:{state:!0},armed:{state:!0},open:{state:!0},curveTab:{state:!0}};armTimer;constructor(){super(),this.phases={},this.tab=`overview`,this.point=1,this.step=0,this.open={pi:!0,hyperhdr:!0,fan:!0,ir:!1,system:!0}}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this.armTimer)}static styles=[H,U,o`
      :host {
        display: flex;
        flex-direction: column;
        gap: 12px;
        --surface: var(--vivid-layer-1);
        --inner: var(--vivid-layer-2);
      }
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 4px;
      }
      .disc {
        display: grid;
        place-items: center;
        flex: none;
        --vivid-glow-size: ${a(At(44))};
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--disc-bg, var(--surface));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
      }
      .disc ha-icon {
        --mdc-icon-size: 24px;
        display: inline-flex;
      }
      .disc.spin ha-icon {
        animation: spin var(--spin, 1.2s) linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .names {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .title {
        font-size: 18px;
        font-weight: 600;
      }
      .sub {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .tabs {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 4px;
      }
      .tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 7px 2px;
        border-radius: 14px;
        background: var(--surface);
        color: var(--secondary-text-color);
        font-size: 12px;
        font-weight: 500;
      }
      .tab ha-icon {
        --mdc-icon-size: 17px;
      }
      .tab[aria-selected='true'] {
        background: rgba(var(--vivid-rgb-text), 0.14);
        color: var(--primary-text-color);
        font-weight: 600;
      }
      .pane {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .label {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 8px;
        margin-top: 4px;
        padding: 0 4px;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--secondary-text-color);
      }
      .label em {
        font-style: normal;
        font-weight: 500;
        letter-spacing: 0;
        text-transform: none;
      }
      .alarm {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 12px 9px 9px;
        border-radius: 16px;
        background: rgba(var(--alarm-rgb), 0.14);
        font-size: 12.5px;
        line-height: 1.35;
      }
      .alarm .ai {
        display: grid;
        place-items: center;
        flex: none;
        --vivid-glow-size: ${a(At(30))};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--disc-bg);
        box-shadow: var(--disc-shadow);
        color: var(--disc-color);
      }
      .alarm .ai ha-icon {
        --mdc-icon-size: 17px;
      }
      .alarm b {
        display: block;
        font-size: 13px;
        font-weight: 600;
      }
      .alarm span span {
        color: var(--secondary-text-color);
      }
      .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 36px;
        padding: 0 12px 0 4px;
        box-sizing: border-box;
        border-radius: 18px;
        background: var(--surface);
        font-size: 13px;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
      }
      .badge .bi {
        display: grid;
        place-items: center;
        --vivid-glow-size: ${a(At(28))};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--disc-bg, var(--inner));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
      }
      .badge .bi ha-icon {
        --mdc-icon-size: 16px;
      }
      .badge.na {
        color: var(--secondary-text-color);
      }
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
        padding: 5px 8px 5px 6px;
        box-sizing: border-box;
        border-radius: 16px;
        background: var(--surface);
        font-size: 13.5px;
      }
      .row .icon {
        display: grid;
        place-items: center;
        flex: none;
        --vivid-glow-size: ${a(At(32))};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--disc-bg, var(--inner));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
      }
      .row .icon ha-icon {
        --mdc-icon-size: 17px;
      }
      .row .text {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-width: 0;
      }
      .row .text small {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .row .text small.mono,
      .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px;
      }
      .row .text small.none {
        font-style: italic;
      }
      .switch {
        position: relative;
        flex: none;
        width: 40px;
        height: 24px;
        border-radius: 12px;
        background: rgba(var(--vivid-rgb-text), 0.18);
        transition: background-color 0.2s ease;
      }
      .switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-text-color);
        opacity: 0.85;
        transition: transform 0.2s ease;
      }
      .switch[aria-checked='true'] {
        background: var(--success-color, #66bb6a);
      }
      .switch[aria-checked='true']::after {
        transform: translateX(16px);
        background: #fff;
        opacity: 1;
      }
      .switch.danger {
        background: var(--error-color, #ef5350);
      }
      .switch:disabled,
      .btn:disabled,
      .step:disabled,
      .speed:disabled {
        opacity: 0.45;
        cursor: default;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        flex: none;
        height: 36px;
        padding: 0 13px;
        box-sizing: border-box;
        border-radius: 18px;
        background: var(--inner);
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
      }
      .row .btn {
        height: 32px;
      }
      .btn ha-icon {
        --mdc-icon-size: 16px;
      }
      .btn.danger {
        color: var(--error-color, #ef5350);
      }
      .btn.armed {
        background: var(--error-color, #ef5350);
        color: #fff;
      }
      .btn.primary {
        background: rgb(var(--source-rgb));
        color: #fff;
        font-weight: 600;
      }
      .btn.round {
        width: 34px;
        padding: 0;
      }
      .btns {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .seg {
        display: inline-flex;
        flex: none;
        padding: 3px;
        border-radius: 18px;
        background: var(--surface);
      }
      .seg button {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        height: 30px;
        padding: 0 12px;
        border-radius: 15px;
        font-size: 13px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .seg button ha-icon {
        --mdc-icon-size: 16px;
      }
      .seg button[aria-pressed='true'] {
        background: var(--vivid-layer-0);
        color: var(--primary-text-color);
        font-weight: 600;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      }
      .fanline {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .curvesel {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px 10px;
      }
      .curvesel small {
        flex: 1 1 140px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .curvesel small b {
        color: var(--primary-text-color);
        font-weight: 600;
      }
      .seg .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgb(${a(Xa.join(`, `))});
      }
      .fanline .mini {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        gap: 2px;
        min-width: 0;
      }
      .fanline .mini small {
        font-size: 11.5px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .control {
        flex: 1 1 auto;
        min-width: 0;
        padding: 8px 10px;
        border-radius: 12px;
        background: var(--surface);
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .speeds {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 6px;
      }
      .speed {
        height: 38px;
        border-radius: 19px;
        background: var(--surface);
        font-size: 13px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .speed[aria-pressed='true'] {
        --vivid-glow-size: ${a(At(38))};
        background: var(--disc-bg);
        box-shadow: var(--disc-shadow);
        color: var(--disc-color);
      }
      .curvebox {
        padding: 10px 8px 4px;
        border-radius: 18px;
        background: var(--surface);
      }
      .points {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px 8px;
        padding: 6px 8px;
        border-radius: 16px;
        background: var(--surface);
      }
      .pchips {
        display: flex;
        gap: 4px;
      }
      .pchip {
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--inner);
        font-size: 12.5px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .pchip[aria-pressed='true'] {
        color: #fff;
        background: var(--chip-color);
      }
      .stepper {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
      }
      .pvals {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 6px 10px;
        margin-left: auto;
      }
      .pvals .stepper {
        margin-left: 0;
      }
      .pvals .stepper b {
        min-width: 50px;
      }
      .step {
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--inner);
      }
      .step ha-icon {
        --mdc-icon-size: 16px;
      }
      .stepper b {
        min-width: 56px;
        text-align: center;
        font-size: 13.5px;
        font-variant-numeric: tabular-nums;
      }
      .hint {
        padding: 0 4px;
        font-size: 12px;
        line-height: 1.45;
        color: var(--secondary-text-color);
      }
      .hint b {
        color: var(--primary-text-color);
      }
      .hint .ok {
        color: var(--success-color, #66bb6a);
        font-weight: 600;
      }
      .hint .ko {
        color: #ff7043;
        font-weight: 600;
      }
      .tag {
        flex: none;
        padding: 3px 8px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 600;
        background: rgba(var(--source-rgb), 0.2);
        color: rgb(var(--source-rgb));
      }
      .num {
        display: grid;
        place-items: center;
        flex: none;
        --vivid-glow-size: ${a(At(34))};
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: var(--disc-bg, var(--inner));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
        font-size: 13px;
        font-weight: 700;
      }
      .wizard {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        border-radius: 20px;
        background: var(--surface);
      }
      .wizard .label {
        margin: 0;
        padding: 0;
      }
      .wsteps {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 4px;
      }
      .ws {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        padding: 0 2px;
        text-align: center;
        font-size: 11.5px;
        line-height: 1.25;
        color: var(--secondary-text-color);
      }
      .ws::before {
        content: '';
        position: absolute;
        top: 15px;
        left: -50%;
        right: 50%;
        height: 2px;
        background: var(--inner);
      }
      .ws:first-child::before {
        display: none;
      }
      .ws.done::before,
      .ws.current::before {
        background: rgb(var(--source-rgb));
      }
      .ws i {
        position: relative;
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--inner);
        font-style: normal;
        font-size: 13px;
        font-weight: 700;
      }
      .ws i ha-icon {
        --mdc-icon-size: 16px;
      }
      .ws.done i {
        background: rgb(var(--source-rgb));
        color: #fff;
      }
      .ws.current {
        color: var(--primary-text-color);
        font-weight: 600;
      }
      .ws.current i {
        background: var(--vivid-layer-0);
        color: rgb(var(--source-rgb));
        box-shadow: inset 0 0 0 2px rgb(var(--source-rgb));
      }
      .irstatus {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 10px 12px;
        border-radius: 14px;
        background: rgba(var(--source-rgb), 0.14);
        font-size: 13.5px;
        line-height: 1.4;
      }
      .irstatus ha-icon {
        --mdc-icon-size: 18px;
        flex: none;
        color: rgb(var(--source-rgb));
      }
      .irstatus small {
        display: block;
        margin-bottom: 2px;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        opacity: 0.75;
      }
      .targets {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 5px;
        font-size: 12.5px;
        color: var(--secondary-text-color);
      }
      .target {
        display: grid;
        place-items: center;
        height: 30px;
        min-width: 30px;
        padding: 0 8px;
        box-sizing: border-box;
        border-radius: 15px;
        background: var(--inner);
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .target[aria-pressed='true'] {
        background: rgb(var(--source-rgb));
        color: #fff;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }
      .actions .btn.primary {
        margin-left: auto;
      }
      .section {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .shead {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 4px 2px;
        font-size: 13.5px;
        font-weight: 600;
        text-align: left;
      }
      .shead ha-icon {
        --mdc-icon-size: 18px;
      }
      .shead small {
        font-weight: 400;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .shead .chev {
        margin-left: auto;
        color: var(--secondary-text-color);
      }
      .status-text {
        padding: 8px 10px;
        border-radius: 12px;
        background: var(--surface);
        color: var(--secondary-text-color);
      }
      .diag {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
      }
      .diag div {
        display: flex;
        flex-direction: column;
        min-width: 0;
        padding: 8px 10px;
        border-radius: 12px;
        background: var(--surface);
        font-size: 13.5px;
        font-weight: 600;
      }
      .diag small {
        font-size: 11.5px;
        font-weight: 400;
        color: var(--secondary-text-color);
      }
      .diag span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .yaml {
        margin: 0;
        padding: 8px 10px;
        border-radius: 12px;
        background: var(--surface);
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px;
        line-height: 1.5;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        user-select: all;
      }
      .diag span.bad {
        color: var(--error-color, #ef5350);
      }
      @media (prefers-reduced-motion: reduce) {
        .disc.spin ha-icon {
          animation: none;
        }
      }
    `];entity(e){return this.config?.entities[e]??``}press(e){this.hass&&(P(this,`light`),lt(this.hass,this.entity(e)))}switchTo(e,t){this.hass&&(P(this,`light`),this.hass.callService(`switch`,t?`turn_on`:`turn_off`,{},{entity_id:this.entity(e)}))}setValue(e,t){if(!this.hass)return;let n=F(Math.round(t/e.step)*e.step,e.min,e.max);ct(this.hass,e.entityId,Math.round(n*1e3)/1e3)}confirm(e,t){if(this.armed===e){window.clearTimeout(this.armTimer),this.armed=void 0,P(this,`medium`),t();return}P(this,`warning`),this.armed=e,window.clearTimeout(this.armTimer),this.armTimer=window.setTimeout(()=>{this.armed=void 0},Oo)}setMode(e){let t=this.model,n=t?.fan.options[e];this.hass&&n&&t?.fan.mode!==e&&(P(this,`light`),ot(this.hass,[this.entity(`fanMode`)],n))}icon(e,t,n=.8){let r=t?L(t,n):void 0;return T`<span
      class="icon"
      style=${k({"--disc-bg":r?.background,"--disc-shadow":r?.shadow,"--disc-color":r?.iconColor})}
      ><ha-icon .icon=${e}></ha-icon
    ></span>`}stepper(e,t,n=!1){let r=e.value,i=n||r===void 0;return T`<span class="stepper">
      <button
        type="button"
        class="reset step"
        aria-label="−"
        ?disabled=${i||(r??0)<=e.min}
        @click=${()=>r!==void 0&&this.setValue(e,r-e.step)}
      >
        <ha-icon icon="mdi:minus"></ha-icon>
      </button>
      <b>${t}</b>
      <button
        type="button"
        class="reset step"
        aria-label="+"
        ?disabled=${i||(r??0)>=e.max}
        @click=${()=>r!==void 0&&this.setValue(e,r+e.step)}
      >
        <ha-icon icon="mdi:plus"></ha-icon>
      </button>
    </span>`}switchButton(e,t,n,r=!1){return T`<button
      type="button"
      class="reset switch"
      role="switch"
      aria-label=${n}
      aria-checked=${t?`true`:`false`}
      ?disabled=${r||t===void 0}
      @click=${()=>this.switchTo(e,!t)}
    ></button>`}colorAt=e=>zr(e,this.model?Qa(this.model):55);cpuColorAt=e=>zr(e,this.model?.cpu?.overheat.value??80);format=(e,t)=>q(this.hass,e,t);renderHead(e){let t=this.hass,n=eo(e),r=n?L(n,.85):void 0,i=e.online?uo(e.fan.percentage):void 0,a=e.controlTemperature,o=[e.online?e.fan.mode===`manual`?B(t,`amb_manual`):B(t,`amb_auto`):B(t,`amb_offline`),a===void 0?void 0:Za(t,a),e.fan.percentage===void 0?void 0:`${e.fan.percentage}\u00a0%`].filter(Boolean);return T`<div class="head">
        <span
          class=${W({disc:!0,spin:i!==void 0})}
          style=${k({"--disc-bg":r?.background,"--disc-shadow":r?.shadow,"--disc-color":r?.iconColor,"--spin":i===void 0?void 0:`${i}s`})}
          ><ha-icon .icon=${to(e)}></ha-icon
        ></span>
        <span class="names"
          ><span class="title">${e.name}</span
          ><span class="sub">${o.join(` · `)}</span></span
        >
      </div>
      <div class="tabs" role="tablist">
        ${To.map(e=>T`<button
              type="button"
              class="reset tab"
              role="tab"
              aria-selected=${this.tab===e.id?`true`:`false`}
              @click=${()=>{this.tab=e.id}}
            >
              <ha-icon .icon=${e.icon}></ha-icon>${B(t,e.label)}
            </button>`)}
      </div>`}renderAlarms(e){let t=this.hass,n=lo(t,e),r=t?Br(t,e):void 0;return r?.state===`unseen`&&n.push({color:qa,icon:`mdi:link-variant-off`,title:B(t,`amb_link_unseen`),detail:B(t,`amb_link_see_maint`)}),r?.noPowerOff&&n.push({color:qa,icon:`mdi:power-plug-off-outline`,title:B(t,`amb_link_nopoweroff_t`),detail:B(t,`amb_link_nopoweroff`)}),n.map(e=>{let t=L(e.color,.9);return T`<div class="alarm" style=${k({"--alarm-rgb":e.color.join(`, `)})}>
        <span
          class="ai"
          style=${k({"--disc-bg":t.background,"--disc-shadow":t.shadow,"--disc-color":t.iconColor})}
          ><ha-icon .icon=${e.icon}></ha-icon
        ></span>
        <span><b>${e.title}</b><span>${e.detail}</span></span>
      </div>`})}badge(e,t,n,r=.5){let i=n&&t!==void 0?L(n,r):void 0;return T`<span class=${W({badge:!0,na:t===void 0})}>
      <span
        class="bi"
        style=${k({"--disc-bg":i?.background,"--disc-shadow":i?.shadow,"--disc-color":i?.iconColor})}
        ><ha-icon .icon=${e}></ha-icon></span
      >${t??`—`}
    </span>`}renderClimate(e){let t=this.hass,n=e.temperature??e.temperatureBmp,r=e.fan.rpm;return T`<div class="badges">
      ${this.badge(`mdi:thermometer`,n===void 0?void 0:Za(t,n),n===void 0?void 0:this.colorAt(n))}
      ${e.cpuTemperature===void 0?D:this.badge(`mdi:cpu-64-bit`,Za(t,e.cpuTemperature,0),this.cpuColorAt(e.cpuTemperature))}
      ${this.badge(`mdi:water-percent`,e.humidity===void 0?void 0:`${q(t,e.humidity,0)}\u00a0%`,Ka,.4)}
      ${this.badge(`mdi:gauge`,e.pressure===void 0?void 0:`${q(t,e.pressure,0)}\u00a0hPa`,[144,164,174],.35)}
      ${r!==void 0&&(e.fan.percentage===100||e.fan.stalled)?this.badge(`mdi:fan`,B(t,`amb_rpm`,{n:q(t,r,0)}),e.fan.stalled?Ja:Xa,.5):D}
    </div>`}renderPiRows(e,t){let n=this.hass,r=!e.online||!e.relay.available,i=e.relay.on,a=e.power.clean,o=e.power.stopping,s=a?`piPower`:`relay`,c=e.hub?.entities[`button.reboot`],l=a?e.power.status===void 0?B(n,`amb_power_clean`):po(n,e.power.status):B(n,i?`amb_power_on`:`amb_power_off`);return T`<div class="row">
        ${this.icon(`mdi:raspberry-pi`,o?Xa:i?Ka:void 0,.7)}
        <span class="text"
          >${B(n,a?`amb_pi_title`:`amb_power`)}<small
            >${this.armed===`relay`?B(n,a?`amb_shutdown_confirm`:`amb_tap_again`):l}</small
          ></span
        >
        <button
          type="button"
          class=${W({reset:!0,switch:!0,danger:this.armed===`relay`})}
          role="switch"
          aria-label=${B(n,`amb_power`)}
          aria-checked=${i&&!o?`true`:`false`}
          ?disabled=${r||o}
          @click=${()=>{i?this.config?.confirmPiOff||a?this.confirm(`relay`,()=>this.switchTo(s,!1)):this.switchTo(s,!1):this.switchTo(s,!0)}}
        ></button>
      </div>
      ${t&&a?T`<div class="row">
              ${this.icon(`mdi:power-plug-off`,Ja,.5)}
              <span class="text"
                >${B(n,`amb_relay_hard`)}<small
                  >${B(n,`amb_relay_hard_hint`)}</small
                ></span
              >
              <button
                type="button"
                class=${W({reset:!0,btn:!0,danger:!0,armed:this.armed===`hard`})}
                ?disabled=${r||!i}
                @click=${()=>this.confirm(`hard`,()=>this.switchTo(`relay`,!1))}
              >
                ${this.armed===`hard`?B(n,`amb_tap_again`):B(n,`amb_cut`)}
              </button>
            </div>`:D}
      ${t&&c?T`<div class="row">
              ${this.icon(`mdi:restart`)}
              <span class="text"
                >${B(n,`amb_pi_reboot`)}<small
                  >${B(n,`amb_pi_reboot_hint`)}</small
                ></span
              >
              <button
                type="button"
                class=${W({reset:!0,btn:!0,danger:!0,armed:this.armed===`reboot`})}
                ?disabled=${!e.hub?.connected||this.hass?.states[c]?.state===`unavailable`}
                @click=${()=>this.confirm(`reboot`,()=>{this.hass&&lt(this.hass,c)})}
              >
                ${this.armed===`reboot`?B(n,`amb_tap_again`):B(n,`amb_reboot_btn`)}
              </button>
            </div>`:D}
      ${t?T`<div class="row">
              ${this.icon(`mdi:power-cycle`)}
              <span class="text"
                >${B(n,`amb_pulse`)}<small
                  >${B(n,`amb_pulse_hint`)}</small
                ></span
              >
              <button
                type="button"
                class=${W({reset:!0,btn:!0,danger:!0,armed:this.armed===`pulse`})}
                ?disabled=${r}
                @click=${()=>this.confirm(`pulse`,()=>this.press(`relayPulse`))}
              >
                ${this.armed===`pulse`?B(n,`amb_tap_again`):B(n,`amb_pulse_btn`)}
              </button>
            </div>`:D}`}renderSources(e,t){return T`<vivid-source-row
      size=${t}
      .items=${e.hdmi.inputs.map(t=>({name:t.name,icon:t.icon,available:e.online&&t.available}))}
      .active=${e.hdmi.active}
      .phases=${this.phases}
      .labels=${fo(this.hass)}
      ?disabled=${!e.online}
    ></vivid-source-row>`}renderModeSwitch(e){let t=this.hass,n=!e.online;return T`<span class="seg" role="group">
      ${[`auto`,`manual`].map(r=>T`<button
            type="button"
            class="reset"
            aria-pressed=${e.fan.mode===r?`true`:`false`}
            ?disabled=${n||!e.fan.options[r]}
            @click=${()=>this.setMode(r)}
          >
            <ha-icon .icon=${r===`auto`?`mdi:fan-auto`:`mdi:hand-back-right`}></ha-icon
            >${B(t,r===`auto`?`amb_auto`:`amb_manual`)}
          </button>`)}
    </span>`}drivingCurve(e){return e.fan.source===`cpu`&&e.cpu?`cpu`:`box`}curveOf(e,t){let n=t===`cpu`?e.cpu:void 0;return n?{points:n.points,overheat:n.overheat,temperature:e.cpuTemperature,colorAt:this.cpuColorAt}:{points:e.curve.points,overheat:e.curve.overheat,temperature:e.temperature??e.temperatureBmp,colorAt:this.colorAt}}handles(e){let t=[];for(let n of e){if(n.t.value===void 0||n.s.value===void 0)return;t.push({t:n.t.value,s:n.s.value,tMin:n.t.min,tMax:n.t.max,tStep:n.t.step,sMin:n.s.min,sMax:n.s.max,sStep:n.s.step})}return t}renderMiniCurve(e){let t=this.hass,n=this.curveOf(e,this.drivingCurve(e)),r=this.handles(n.points),i=e.controlTemperature;return T`<span class="mini">
      <small>${e.fan.mode===`manual`?B(t,`amb_manual_hint`):i===void 0?B(t,`amb_curve_waiting`):B(t,`amb_on_curve`,{t:Za(t,i),s:e.fan.target??e.fan.percentage??`—`})}</small>
      ${r&&e.fan.mode!==`manual`?T`<vivid-fan-curve
              mini
              .points=${r}
              .temperature=${i}
              .stop=${e.curve.stopBelowT1===!0}
              .colorAt=${n.colorAt}
            ></vivid-fan-curve>`:D}
    </span>`}renderSpeeds(e){let t=!e.online;return T`<div class="speeds">
      ${Eo.map(n=>{let r=e.fan.mode===`manual`&&e.fan.percentage===n,i=r?L(Xa,.7):void 0;return T`<button
          type="button"
          class="reset speed"
          aria-pressed=${r?`true`:`false`}
          style=${k({"--disc-bg":i?.background,"--disc-shadow":i?.shadow,"--disc-color":i?.iconColor})}
          ?disabled=${t}
          @click=${()=>this.press(Do[n])}
        >
          ${n===0?B(this.hass,`off`):`${n}`}
        </button>`})}
    </div>`}renderOverview(e){let t=this.hass,n=e.hdmi.active;return T`${this.renderAlarms(e)}${this.renderClimate(e)}
      <div class="label">
        ${B(t,`amb_source`)}<em
          >${n===void 0?`—`:e.hdmi.inputs[n]?.name}</em
        >
      </div>
      ${this.renderSources(e,`large`)}
      <div class="label">${B(t,`amb_pi_title`)}</div>
      ${this.renderPiRows(e,!1)}
      <div class="label">${B(t,`amb_fan`)}</div>
      <div class="fanline">${this.renderModeSwitch(e)}${this.renderMiniCurve(e)}</div>
      ${e.fan.mode===`manual`?this.renderSpeeds(e):D}`}renderCurveSwitch(e,t){let n=this.hass,r=this.drivingCurve(e);return T`<div class="curvesel">
      <span class="seg" role="group">
        ${[`box`,`cpu`].map(e=>T`<button
              type="button"
              class="reset"
              aria-pressed=${t===e?`true`:`false`}
              @click=${()=>{this.curveTab=e}}
            >
              <ha-icon
                .icon=${e===`box`?`mdi:package-variant-closed`:`mdi:cpu-64-bit`}
              ></ha-icon
              >${B(n,e===`box`?`amb_curve_box`:`amb_curve_cpu`)}${r===e?T`<span class="dot" aria-hidden="true"></span>`:D}
            </button>`)}
      </span>
      <small
        >${r===t?T`<b>${B(n,`amb_drives`)}</b> · `:D}${B(n,t===`box`?`amb_box_curve_hint`:`amb_cpu_curve_hint`)}</small
      >
    </div>`}renderFan(e){let t=this.hass,n=e.cpu?this.curveTab??this.drivingCurve(e):`box`,r=this.curveOf(e,n),i=this.handles(r.points),a=!e.online,o=r.points[this.point],s=o?.t.value===void 0?void 0:r.colorAt(o.t.value),c=r.points.reduce((e,t)=>t.t.value===void 0?e:e===void 0?t.t.value:Math.min(e,t.t.value),void 0),l=r.points.find(e=>e.t.value===c)?.s.value,u=e.curve.hysteresis.value,d=r.overheat;return T`<div class="fanline">
        ${this.renderModeSwitch(e)}<span class="control mono">${e.fan.control??`—`}</span>
      </div>
      ${e.cpu?this.renderCurveSwitch(e,n):D}
      ${i?T`<div class="curvebox">
              <vivid-fan-curve
                .points=${i}
                .temperature=${r.temperature}
                .stop=${e.curve.stopBelowT1===!0}
                .hysteresis=${u}
                .overheat=${d.value}
                .selected=${this.point}
                .colorAt=${r.colorAt}
                .format=${this.format}
                ?editable=${!a}
                @vivid-curve-select=${e=>{this.point=e.detail.index}}
                @vivid-curve-change=${e=>{let t=r.points[e.detail.index];t&&(t.t.value!==e.detail.t&&this.setValue(t.t,e.detail.t),t.s.value!==e.detail.s&&this.setValue(t.s,e.detail.s))}}
              ></vivid-fan-curve>
            </div>`:D}
      <div class="points">
        <span class="pchips">
          ${r.points.map((e,t)=>T`<button
                type="button"
                class="reset pchip"
                aria-pressed=${t===this.point?`true`:`false`}
                style=${k({"--chip-color":s?I(s):void 0})}
                @click=${()=>{this.point=t}}
              >
                ${t+1}
              </button>`)}
        </span>
        ${o?T`<span class="pvals"
                >${this.stepper(o.t,o.t.value===void 0?`—`:Za(t,o.t.value),a)}
                ${this.stepper(o.s,o.s.value===void 0?`—`:`${q(t,o.s.value,0)}\u00a0%`,a)}</span
              >`:D}
      </div>
      <div class="hint">${B(t,`amb_drag_hint`)}</div>
      <div class="row">
        ${this.icon(`mdi:sine-wave`)}
        <span class="text"
          >${B(t,`amb_hysteresis`)}<small
            >${c!==void 0&&u!==void 0?B(t,`amb_hysteresis_hint`,{on:Za(t,c),off:Za(t,c-u)}):``}</small
          ></span
        >
        ${this.stepper(e.curve.hysteresis,u===void 0?`—`:Za(t,u),a)}
      </div>
      <div class="row">
        ${this.icon(`mdi:thermometer-alert`,Ja,.6)}
        <span class="text"
          >${B(t,n===`cpu`?`amb_cpu_overheat_temp`:`amb_overheat_temp`)}<small
            >${B(t,n===`cpu`?`amb_cpu_overheat_hint`:`amb_overheat_hint`)}</small
          ></span
        >
        ${this.stepper(d,d.value===void 0?`—`:Za(t,d.value,0),a)}
      </div>
      ${n===`box`&&e.cpu?T`<div class="row">
              ${this.icon(`mdi:raspberry-pi`)}
              <span class="text"
                >${B(t,`amb_pi_min`)}<small
                  >${B(t,`amb_pi_min_hint`)}</small
                ></span
              >
              ${this.stepper(e.cpu.minSpeed,e.cpu.minSpeed.value===void 0?`—`:`${q(t,e.cpu.minSpeed.value,0)}\u00a0%`,a)}
            </div>`:D}
      <div class="row">
        ${this.icon(`mdi:fan-off`)}
        <span class="text"
          >${B(t,`amb_stop`)}<small
            >${l===void 0?``:B(t,`amb_stop_hint`,{s:q(t,l,0)})}</small
          ></span
        >
        ${this.switchButton(`stopBelowT1`,e.curve.stopBelowT1,B(t,`amb_stop`),a)}
      </div>
      <div class="label">${B(t,`amb_manual_speed`)}</div>
      ${this.renderSpeeds(e)}
      ${e.fan.mode===`auto`?T`<div class="hint">${B(t,`amb_manual_only`)}</div>`:D}`}renderInputs(e){let t=this.hass;return e.hdmi.inputs.map((n,r)=>{let i=r===e.hdmi.active,a=i?L(zi,.85):void 0,o=n.code;return T`<div class="row">
        <span
          class="num"
          style=${k({"--disc-bg":a?.background,"--disc-shadow":a?.shadow,"--disc-color":a?.iconColor})}
          >${r+1}</span
        >
        <span class="text"
          >${n.name}<small class=${W({mono:!!o,none:o===null})}
            >${o===null?B(t,`amb_no_code`):o??`—`}</small
          ></span
        >
        ${i?T`<span class="tag">${B(t,`amb_active`)}</span>`:D}
        <button
          type="button"
          class="reset btn round"
          title=${n.name}
          aria-label=${n.name}
          ?disabled=${!e.online||!n.available||o===null}
          @click=${()=>N(this,`vivid-source-select`,{index:r})}
        >
          <ha-icon icon="mdi:remote"></ha-icon>
        </button>
      </div>`})}renderWizard(e){let t=this.hass,n=!e.online,r=[{key:`learn1`,label:`amb_step1`},{key:`learn2`,label:`amb_step2`},{key:`learn3`,label:`amb_step3`},{key:`learn4`,label:`amb_step4`}],i=Math.min(this.step,3),a=e.ir.target,o=r[i],s=e=>{let t=r[e];t&&(this.press(t.key),this.step=e===3?0:e+1)},c=i===0?B(t,`amb_step1_hint`):i===2?B(t,`amb_step3_hint`):``;return T`<div class="wizard">
      <div class="label">
        ${B(t,`amb_learn`)}<em>${B(t,`amb_nec_only`)}</em>
      </div>
      <div class="wsteps">
        ${r.map((e,r)=>{let a=r<i?`done`:r===i?`current`:``;return T`<button
            type="button"
            class=${W({reset:!0,ws:!0,[a||`todo`]:!0})}
            ?disabled=${n}
            @click=${()=>s(r)}
          >
            <i>${a===`done`?T`<ha-icon icon="mdi:check-bold"></ha-icon>`:r+1}</i
            >${B(t,e.label)}
          </button>`})}
      </div>
      <div class="irstatus">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <span><small>IR Status</small>${e.ir.status??`—`}</span>
      </div>
      <div class="targets">
        ${B(t,`amb_target`)}
        ${e.hdmi.inputs.map((t,r)=>{let i=e.ir.targetOptions[r]??`HDMI ${r+1}`;return T`<button
            type="button"
            class="reset target"
            aria-pressed=${r===a?`true`:`false`}
            ?disabled=${n}
            @click=${()=>this.hass&&void ot(this.hass,[this.entity(`learnTarget`)],i)}
          >
            ${r+1}
          </button>`})}
      </div>
      <div class="actions">
        <button
          type="button"
          class="reset btn"
          ?disabled=${n}
          @click=${()=>{this.press(`learnCancel`),this.step=0}}
        >
          <ha-icon icon="mdi:cancel"></ha-icon>${B(t,`amb_cancel`)}
        </button>
        <button
          type="button"
          class=${W({reset:!0,btn:!0,danger:!0,armed:this.armed===`clear`})}
          ?disabled=${n||a===void 0}
          @click=${()=>this.confirm(`clear`,()=>this.press(`learnClear`))}
        >
          <ha-icon icon="mdi:delete-outline"></ha-icon>${this.armed===`clear`?B(t,`amb_tap_again`):B(t,`amb_clear`,{n:a===void 0?``:`HDMI ${a+1}`})}
        </button>
        <button
          type="button"
          class="reset btn primary"
          ?disabled=${n}
          @click=${()=>s(i)}
        >
          ${i+1} · ${B(t,o.label)}
        </button>
      </div>
      ${c?T`<div class="hint">${c}</div>`:D}
    </div>`}renderIr(e){let t=this.hass,n=e.hdmi.verified;return T`${this.renderInputs(e)}
      <div class="hint">
        ${e.ir.lastReceived?T`${B(t,`amb_last_received`,{c:``})}<b class="mono">${e.ir.lastReceived}</b>`:D}
        ${n===void 0?D:T` ·
                <span class=${n?`ok`:`ko`}
                  >${B(t,n?`amb_last_ok`:`amb_last_fail`)}</span
                >`}
      </div>
      ${this.renderWizard(e)}`}section(e,t,n,r,i){let a=this.open[e]??!1;return T`<div class="section">
      <button
        type="button"
        class="reset shead"
        aria-expanded=${a?`true`:`false`}
        @click=${()=>{this.open={...this.open,[e]:!a}}}
      >
        <ha-icon .icon=${t}></ha-icon
        >${n}${r?T`<small>· ${r}</small>`:D}
        <ha-icon class="chev" .icon=${a?`mdi:chevron-up`:`mdi:chevron-down`}></ha-icon>
      </button>
      ${a?i():D}
    </div>`}renderLink(e){let t=this.hass;if(!t)return D;let n=Br(t,e),r=mo(n.state),i=[[`hyperhdr_connected`,n.ids.connected],[`hyperhdr_cpu_temperature`,n.ids.cpuTemperature],[`hyperhdr_power_off`,n.ids.powerOff]].filter(e=>e[1]!==void 0);return T`<div class="row">
        ${this.icon(r.icon,r.rgb,.6)}
        <span class="text">${B(t,r.label)}</span>
      </div>
      ${n.state===`unseen`?T`<div class="hint">${B(t,`amb_link_unseen_hint`)}</div>
              <pre class="yaml">
substitutions:
${i.map(([e,t])=>`  ${e}: ${t}`).join(`
`)}</pre>
              <div class="hint">${B(t,`amb_link_unseen_after`)}</div>`:D}`}renderHub(e,t){let n=this.hass,r=e=>e??`—`,i=e.memory===void 0?void 0:`${q(n,e.memory,0)}\u00a0%`;return this.section(`hyperhdr`,`mdi:television-ambient-light`,B(n,`amb_hyperhdr_server`),B(n,e.connected?`amb_hh_connected`:`amb_hh_away`),()=>T`${this.renderLink(t)}
          <div class="diag">
            <div>
              <small>${B(n,`amb_cpu`)}</small
              ><span
                >${r(e.cpu===void 0?void 0:`${q(n,e.cpu,0)}\u00a0%`)}${e.temperature===void 0?``:` · ${Za(n,e.temperature,0)}`}</span
              >
            </div>
            <div><small>${B(n,`amb_ram`)}</small><span>${r(i)}</span></div>
            <div>
              <small>${B(n,`hh_undervoltage`)}</small
              ><span class=${W({bad:e.undervoltage===!0})}
                >${e.undervoltage===void 0?`—`:B(n,e.undervoltage?`hh_undervoltage_detected`:`amb_none`)}</span
              >
            </div>
            <div>
              <small>${B(n,`hh_version`)}</small><span>${r(e.version)}</span>
            </div>
          </div>`)}renderMaint(e){let t=this.hass,n=!e.online,r=(e,r,i)=>T`<button
        type="button"
        class="reset btn"
        ?disabled=${n}
        @click=${()=>this.press(e)}
      >
        <ha-icon .icon=${r}></ha-icon>${B(t,i)}
      </button>`,i=e.tests.pwm,a=e.diag.uptime;return T`${this.section(`pi`,`mdi:raspberry-pi`,B(t,`amb_pi_title`),void 0,()=>this.renderPiRows(e,!0))}
    ${e.hub?this.renderHub(e.hub,e):D}
    ${this.section(`fan`,`mdi:fan`,B(t,`amb_fan_tests`),void 0,()=>T` <div class="btns">
            ${r(`fanSelfTest`,`mdi:test-tube`,`amb_self_test`)}${r(`fanSweep`,`mdi:sync`,`amb_sweep`)}
            ${r(`fanStopTests`,`mdi:stop-circle`,`amb_stop_tests`)}
          </div>
          <div class="status-text mono">${e.tests.status??`—`}</div>
          <div class="row">
            ${this.icon(`mdi:sine-wave`)}<span class="text">${B(t,`amb_pwm`)}</span>
            ${this.stepper(i,i.value===void 0?`—`:`${q(t,i.value,0)}\u00a0Hz`,n)}
          </div>`)}
    ${this.section(`ir`,`mdi:remote`,B(t,`amb_ir_tests`),e.tests.rxFrames===void 0?void 0:B(t,`amb_frames`,{n:q(t,e.tests.rxFrames,0)}),()=>T` <div class="row">
            ${this.icon(`mdi:led-on`)}<span class="text">${B(t,`amb_led_steady`)}</span>
            ${this.switchButton(`ledSteady`,e.tests.ledSteady,B(t,`amb_led_steady`),n)}
          </div>
          <div class="btns">
            ${r(`burst`,`mdi:broadcast`,`amb_burst`)}${r(`echoTest`,`mdi:swap-horizontal`,`amb_echo`)}
            ${r(`sendCaptured`,`mdi:remote`,`amb_send_captured`)}
          </div>
          <div class="row">
            ${this.icon(`mdi:bug-outline`)}<span class="text"
              >${B(t,`amb_ir_debug`)}</span
            >
            ${this.switchButton(`irDebug`,e.tests.irDebug,B(t,`amb_ir_debug`),n)}
          </div>`)}
    ${this.section(`system`,`mdi:chip`,B(t,`amb_system`),void 0,()=>T` <div class="diag">
            <div>
              <small>${B(t,`wifi`)}</small
              ><span
                >${e.diag.rssi===void 0?`—`:`${q(t,e.diag.rssi,0)}\u00a0dBm`}${e.diag.ssid?` · ${e.diag.ssid}`:``}</span
              >
            </div>
            <div><small>${B(t,`ip`)}</small><span>${e.diag.ip??`—`}</span></div>
            <div>
              <small>${B(t,`amb_online_since`)}</small
              ><span>${a===void 0?`—`:pn(t,a)}</span>
            </div>
            <div>
              <small>${B(t,`amb_ir_debug`)}</small
              ><span
                >${e.tests.irDebug===void 0?`—`:B(t,e.tests.irDebug?`on`:`off`)}</span
              >
            </div>
          </div>
          <div class="btns">
            ${r(`refresh`,`mdi:autorenew`,`amb_refresh`)}
            <button
              type="button"
              class=${W({reset:!0,btn:!0,danger:!0,armed:this.armed===`restart`})}
              ?disabled=${n}
              @click=${()=>this.confirm(`restart`,()=>this.press(`restart`))}
            >
              <ha-icon icon="mdi:restart"></ha-icon
              >${this.armed===`restart`?B(t,`amb_tap_again`):B(t,`amb_restart`)}
            </button>
          </div>`)}`}render(){let e=this.model;return!e||!this.config?D:T`<div
      style=${k({"--source-rgb":zi.join(`, `),display:`contents`})}
    >
      ${this.renderHead(e)}
      <div class="pane" style=${k({"--source-rgb":zi.join(`, `)})}>
        ${{overview:()=>this.renderOverview(e),fan:()=>this.renderFan(e),ir:()=>this.renderIr(e),maint:()=>this.renderMaint(e)}[this.tab]()}
      </div>
    </div>`}});var ko={ok:1600,remote:1400,sent:1400,fail:3500},Ao=3e3,jo=12e4,Mo=[38,198,218],No=[171,145,249],Po=[255,167,38],Fo=class extends O{static properties={hass:{attribute:!1},_config:{state:!0},phases:{state:!0},armed:{state:!0},stopping:{state:!0}};model;rawConfig;resolvedFor;dialog;menu;menuOpen=!1;menuIndexes=[];pending;pendingTimer;phaseTimers=/* @__PURE__ */ new Map;armTimer;stopTimer;lastActive;constructor(){super(),this.phases={},this.armed=!1}static getConfigElement(){return document.createElement(`vivid-ambilight-card-editor`)}static getStubConfig(e){let t=Object.keys(e?.devices??{}),n=e&&t.find(t=>{let n=tr(e,t);return n!==void 0&&!!e.states[`switch.${n}relay`]&&!!e.states[`fan.${n}jonsbo_fan`]});return n?{device:n}:{prefix:Vn}}setConfig(e){this.rawConfig=e,this.resolvedFor=void 0,this._config=Qn(e),this.lastActive=void 0}resolveDevices(e){let t=this.rawConfig;t&&t.device&&this.resolvedFor!==e.entities&&(this.resolvedFor=e.entities,this._config=Qn(t,rr(e,t)))}getCardSize(){return this._config?.layout===`tiles`?3:1}getGridOptions(){return this._config?.layout===`tiles`?{columns:12,min_columns:6,rows:3,min_rows:3}:{columns:12,min_columns:6,rows:`auto`,min_rows:1}}static styles=[H,U,o`
      :host {
        display: block;
      }
      ha-card {
        height: 100%;
        box-sizing: border-box;
        background: none;
        border: none;
        box-shadow: none;
        overflow: visible;
      }
      .panel {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
        container-type: inline-size;
      }
      .panel.offline {
        opacity: 0.6;
        filter: grayscale(0.85);
      }
      .panel vivid-source-row {
        --vivid-layer-1: var(--vivid-layer-2);
        --vivid-layer-2: color-mix(in srgb, var(--vivid-layer-0) 45%, var(--vivid-layer-1));
      }
      .head {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .title {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1 1 auto;
        min-width: 0;
        padding: 2px;
        border-radius: 14px;
        text-align: left;
      }
      .disc {
        position: relative;
        display: grid;
        place-items: center;
        flex: none;
        --vivid-glow-size: ${a(At(40))};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--disc-bg, var(--vivid-layer-2));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
        transition:
          background 0.4s ease,
          box-shadow 0.4s ease,
          color 0.4s ease;
      }
      .disc ha-icon {
        --mdc-icon-size: 22px;
        display: inline-flex;
      }
      .disc.spin ha-icon {
        animation: spin var(--spin, 1.2s) linear infinite;
        animation-play-state: var(--vivid-glow-play, running);
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .names {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .name {
        font-size: 15px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .status {
        font-size: 12px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .status.alarm {
        color: var(--error-color, #ef5350);
        font-weight: 600;
      }
      .status.warn {
        color: var(--warning-color, #f9a825);
        font-weight: 600;
      }
      .values {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: none;
        padding: 4px 2px;
        border-radius: 12px;
      }
      .value {
        display: inline-flex;
        align-items: center;
        gap: 1px;
        font-size: 16px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .value ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
        color: rgb(var(--v-rgb, var(--vivid-rgb-text)));
      }
      /* Each value in its own color: a tinted pill, the number lit by it. */
      .value {
        padding: 2px 8px 2px 5px;
        border-radius: 12px;
        background: rgba(var(--v-rgb, var(--vivid-rgb-text)), 0.16);
        color: color-mix(
          in srgb,
          rgb(var(--v-rgb, var(--vivid-rgb-text))) 30%,
          var(--primary-text-color)
        );
      }
      .values .value {
        padding: 2px 6px 2px 4px;
        font-size: 14px;
      }
      .value.none {
        background: rgba(var(--vivid-rgb-text), 0.06);
        color: var(--secondary-text-color);
      }
      .value.none ha-icon {
        color: var(--secondary-text-color);
      }
      .value small {
        margin-left: 1px;
        font-size: 11px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .value.alarm {
        color: var(--error-color, #ef5350);
        box-shadow: inset 0 0 0 1.5px rgba(239, 83, 80, 0.7);
      }

      .pi {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex: none;
        height: 36px;
        padding: 0 4px 0 3px;
        box-sizing: border-box;
        border-radius: 18px;
        background: var(--vivid-layer-2);
        font-size: 12.5px;
        font-weight: 600;
        transition: background 0.2s ease;
      }
      .pi.armed {
        background: color-mix(in srgb, var(--error-color, #ef5350) 22%, var(--vivid-layer-2));
        color: var(--error-color, #ef5350);
      }
      .pi.stopping {
        color: rgb(255, 193, 7);
      }
      .pi.stopping:disabled {
        opacity: 1;
      }
      .pi:disabled {
        opacity: 0.5;
        cursor: default;
      }
      .pid {
        display: grid;
        place-items: center;
        --vivid-glow-size: ${a(At(30))};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(
          --disc-bg,
          color-mix(in srgb, var(--vivid-layer-0) 45%, var(--vivid-layer-1))
        );
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
      }
      .pid ha-icon {
        --mdc-icon-size: 17px;
        display: inline-flex;
      }
      .switch {
        position: relative;
        width: 34px;
        height: 22px;
        border-radius: 11px;
        background: rgba(var(--vivid-rgb-text), 0.18);
        transition: background-color 0.2s ease;
      }
      .switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--primary-text-color);
        opacity: 0.85;
        transition: transform 0.2s ease;
      }
      .switch.on {
        background: var(--success-color, #66bb6a);
      }
      .switch.on::after {
        transform: translateX(12px);
        background: #fff;
        opacity: 1;
      }
      .pi.armed .switch {
        background: var(--error-color, #ef5350);
      }
      /* Narrow cards: the Pi label goes, the values tighten. */
      @container (max-width: 400px) {
        .pi:not(.armed):not(.stopping) .label {
          display: none;
        }
        .head:has(.pi.armed) .values,
        .head:has(.pi.stopping) .values {
          display: none;
        }

        .values {
          gap: 5px;
        }
        .value {
          font-size: 15px;
        }
      }
      /* ------------------------------ line layout ------------------------------ */
      .panel.compact {
        padding: 8px;
      }
      .name-row {
        display: flex;
        align-items: baseline;
        gap: 10px;
        min-width: 0;
      }
      .name-row .name {
        flex: none;
        max-width: 60%;
      }
      .name-row .status {
        flex: 0 1 auto;
        min-width: 0;
      }
      .names:has(.inline) {
        gap: 3px;
      }
      /* Values that do not fit go to the next line. */
      .inline {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px 5px;
        min-width: 0;
      }
      .title:has(.inline) .names {
        flex: 1 1 auto;
      }
      .inline .value {
        flex: none;
        line-height: 16px;
        padding: 1px 7px 1px 4px;
        font-size: 13px;
      }
      .inline .value ha-icon {
        --mdc-icon-size: 14px;
      }
      .inline .value small {
        font-size: 10.5px;
      }
      .source {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex: none;
        max-width: 42%;
        height: 38px;
        padding: 0 8px 0 4px;
        box-sizing: border-box;
        border-radius: 19px;
        background: rgba(var(--source-rgb), 0.14);
        box-shadow: inset 0 0 0 1.5px rgba(var(--source-rgb), 0.45);
        color: color-mix(in srgb, rgb(var(--source-rgb)) 60%, var(--primary-text-color));
        font-size: 13px;
        font-weight: 600;
        --source-rgb: ${a(zi.join(`, `))};
        transition:
          background 0.3s ease,
          box-shadow 0.3s ease;
      }
      .source.bare {
        padding-left: 12px;
      }
      .source.iconic {
        padding-right: 4px;
        gap: 0;
      }
      .source:disabled {
        opacity: 0.5;
        cursor: default;
      }
      .source.sending {
        background: rgba(var(--source-rgb), 0.1);
      }
      .source.ok,
      .source.remote {
        --source-rgb: 102, 187, 106;
      }
      .source.fail {
        --source-rgb: 255, 152, 0;
        animation: shake 0.42s ease;
      }
      .sdisc {
        position: relative;
        display: grid;
        place-items: center;
        flex: none;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: rgba(var(--source-rgb), 0.28);
        color: rgb(var(--source-rgb));
      }
      .sdisc ha-icon {
        --mdc-icon-size: 17px;
        display: inline-flex;
      }
      .stext {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .caret {
        --mdc-icon-size: 16px;
        display: inline-flex;
        flex: none;
        opacity: 0.7;
      }
      .source.iconic .caret {
        display: none;
      }
      /* IR waves leaving the disc while the command is out. */
      .sdisc.waves::before,
      .sdisc.waves::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2px solid rgba(var(--source-rgb), 0.9);
        animation: wave 1.1s ease-out infinite;
        pointer-events: none;
      }
      .sdisc.waves::after {
        animation-delay: 0.55s;
      }
      .sdisc.pop {
        animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes wave {
        from {
          transform: scale(1);
          opacity: 1;
        }
        to {
          transform: scale(1.9);
          opacity: 0;
        }
      }
      @keyframes pop {
        0% {
          transform: scale(0.7);
        }
        60% {
          transform: scale(1.14);
        }
        100% {
          transform: scale(1);
        }
      }
      @keyframes shake {
        0%,
        100% {
          transform: translateX(0);
        }
        25% {
          transform: translateX(-3px);
        }
        50% {
          transform: translateX(3px);
        }
        75% {
          transform: translateX(-2px);
        }
      }
      .piround {
        display: grid;
        place-items: center;
        flex: none;
        --vivid-glow-size: ${a(At(38))};
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: var(--disc-bg, var(--vivid-layer-2));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
        transition:
          background 0.25s ease,
          box-shadow 0.25s ease;
      }
      .piround ha-icon {
        --mdc-icon-size: 19px;
        display: inline-flex;
      }
      .piround.armed {
        background: color-mix(in srgb, var(--error-color, #ef5350) 30%, var(--vivid-layer-2));
        box-shadow: 0 0 0 2px var(--error-color, #ef5350);
        color: var(--error-color, #ef5350);
        animation: pulse 1s ease-in-out infinite;
      }
      .piround.stopping {
        color: rgb(255, 193, 7);
        background: rgba(255, 193, 7, 0.18);
      }
      .piround:disabled {
        cursor: default;
      }
      .piround:disabled:not(.stopping) {
        opacity: 0.5;
      }
      @keyframes pulse {
        50% {
          box-shadow: 0 0 0 5px rgba(239, 83, 80, 0.25);
        }
      }
      /* Narrow line: the values go one by one, then the input name. */
      @container (max-width: 370px) {
        .source:not(.bare) .stext {
          display: none;
        }
        .source:not(.bare) .caret {
          display: none;
        }
        .source:not(.bare) {
          padding-right: 4px;
        }
      }
      .warning {
        padding: 16px;
        color: var(--error-color, #db4437);
      }
      @media (prefers-reduced-motion: reduce) {
        .disc.spin ha-icon,
        .sdisc.waves::before,
        .sdisc.waves::after,
        .sdisc.pop,
        .source.fail,
        .piround.armed {
          animation: none;
        }
      }
    `];disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this.pendingTimer),window.clearTimeout(this.armTimer),window.clearTimeout(this.stopTimer);for(let e of this.phaseTimers.values())window.clearTimeout(e);this.phaseTimers.clear(),this.dialog?.unmount(),this.closeMenu()}shouldUpdate(e){return!this.hass||!this._config?e.has(`_config`):e.size===1&&e.has(`hass`)?Ga(e.get(`hass`),this.hass,this.model?.watched??[]):!0}willUpdate(){let e=this.hass;e&&this.resolveDevices(e);let t=this._config;e&&t&&(this.model=Ur(e,t),this.trackSends(e,t),this.stopping!==void 0&&!this.model.relay.on&&(this.stopping=void 0))}updated(){this.dialog?.open&&this.renderDialogContent(),this.menuOpen&&this.renderMenu()}setPhase(e,t){window.clearTimeout(this.phaseTimers.get(e)),this.phaseTimers.delete(e);let n={...this.phases};t?n[e]=t:delete n[e],this.phases=n,t&&t!==`sending`&&this.phaseTimers.set(e,window.setTimeout(()=>this.setPhase(e,void 0),ko[t]))}trackSends(e,t){let n=Gr(e,t),r=this.pending;if(r){let e=Kr(r,n,Date.now());e!==`pending`&&(this.pending=void 0,window.clearTimeout(this.pendingTimer),this.setPhase(r.index,e),P(this,e===`ok`?`success`:e===`fail`?`failure`:`light`))}else this.lastActive&&n.active!==void 0&&n.activeChanged!==this.lastActive.changed&&n.active!==this.lastActive.index&&this.setPhase(n.active,`remote`);this.lastActive={index:n.active,changed:n.activeChanged}}selectSource=e=>{let t=this.hass,n=this._config,r=this.model?.hdmi.inputs[e.detail.index];if(!t||!n||!r?.available)return;let i=e.detail.index;P(this,`light`),this.pending&&this.pending.index!==i&&this.setPhase(this.pending.index,void 0),this.pending={index:i,at:Date.now(),before:Gr(t,n)},this.setPhase(i,`sending`),window.clearTimeout(this.pendingTimer),this.pendingTimer=window.setTimeout(()=>{this.hass&&this._config&&this.trackSends(this.hass,this._config)},Wr+50),lt(t,r.button)};disarm(){window.clearTimeout(this.armTimer),this.armTimer=void 0,this.armed=!1}togglePi=()=>{let e=this.hass,t=this._config,n=this.model;if(!e||!t||!n?.relay.available)return;let r=n.power.entityId;if(!(this.stopping!==void 0||n.power.stopping)){if(!n.relay.on){P(this,`light`),e.callService(`switch`,`turn_on`,{},{entity_id:r});return}if(t.confirmPiOff&&!this.armed){P(this,`warning`),this.armed=!0,window.clearTimeout(this.armTimer),this.armTimer=window.setTimeout(()=>this.disarm(),Ao);return}this.disarm(),P(this,`medium`),n.power.clean&&(this.stopping=Date.now(),window.clearTimeout(this.stopTimer),this.stopTimer=window.setTimeout(()=>{this.stopping=void 0},jo)),e.callService(`switch`,`turn_off`,{},{entity_id:r})}};openDetails(){this.model&&(this.dialog||(this.dialog=new vn,this.dialog.addEventListener(`vivid-dialog-close-request`,()=>this.dialog?.hide()),this.dialog.addEventListener(`vivid-source-select`,this.selectSource),this.dialog.addEventListener(`vivid-more-info`,(e=>{let t=e.detail.entityId;this.dialog?.hide(),window.setTimeout(()=>$e(this,t),50)}))),P(this,`light`),this.renderDialogContent(),this.dialog.show())}renderDialogContent(){let e=this.dialog,t=this.model,n=this._config;if(e&&t&&n){e.label=t.name,e.closeLabel=B(this.hass,`close`);for(let[t,r]of Object.entries(Ot(n.glow)))e.style.setProperty(t,r);e.content=T`<vivid-ambilight-details
      .hass=${this.hass}
      .model=${t}
      .config=${n}
      .phases=${this.phases}
    ></vivid-ambilight-details>`}}renderDisc(e){let t=eo(e),n=e.alarms.some(e=>e===`overheat`||e===`cpuoverheat`||e===`stalled`),r=t?L(t,n?.95:.8):void 0,i=e.online?uo(e.fan.percentage):void 0;return T`<span
      class=${W({disc:!0,spin:i!==void 0})}
      style=${k({"--disc-bg":r?.background,"--disc-shadow":r?.shadow,"--disc-color":r?.iconColor,"--spin":i===void 0?void 0:`${i}s`})}
      ><ha-icon .icon=${to(e)}></ha-icon
    ></span>`}value(e,t,n,r,i=!1,a=``){return T`<span
      class=${W({value:!0,alarm:i,none:t===void 0})}
      title=${a}
      style=${k({"--v-rgb":t?t.join(`, `):void 0})}
      ><ha-icon .icon=${e}></ha-icon>${n}<small>${r}</small></span
    >`}renderValues(e,t){let n=this.hass,r=e.temperature??e.temperatureBmp,i=e.cpuTemperature,a=e.alarms.includes(`overheat`),o=e.alarms.includes(`cpuoverheat`)&&i!==void 0,s=()=>this.value(`mdi:thermometer`,r===void 0?void 0:zr(r,Qa(e)),r===void 0?`—`:q(n,r,1),`°C`,a,B(n,`amb_curve_box`)),c=()=>i===void 0?D:this.value(`mdi:cpu-64-bit`,zr(i,e.cpu?.overheat.value??80),q(n,i,0),`°C`,o,B(n,`amb_curve_cpu`));return t.map(t=>{switch(t){case`temperature`:{let t=a||o?o:e.fan.source===`cpu`&&i!==void 0;return T`${a||!t?s():D}${t?c():D}`}case`box`:return s();case`cpu`:return c();case`fan`:return this.value(`mdi:fan`,e.fan.stalled?Ja:Xa,e.fan.percentage===void 0?`—`:String(e.fan.percentage),`%`,e.fan.stalled);case`humidity`:return e.humidity===void 0?D:this.value(`mdi:water-percent`,Mo,q(n,e.humidity,0),`%`);case`pressure`:return e.pressure===void 0?D:this.value(`mdi:gauge`,No,q(n,e.pressure,0),`hPa`);case`rpm`:return e.fan.rpm===void 0?D:this.value(`mdi:rotate-right`,Po,q(n,e.fan.rpm,0),`rpm`);default:return D}})}renderPi(e,t){let n=this.hass,r=io(e.pi),i=this.stopping!==void 0||e.power.stopping,a=i?B(n,`amb_stopping`):this.armed?B(n,e.power.clean?`amb_shutdown_confirm`:`amb_cut_confirm`):t?B(n,`amb_pi`):``,o=`${B(n,`amb_pi_title`)} · ${ro(n,e.pi)}`;return t?T`<button
      type="button"
      class=${W({reset:!0,pi:!0,armed:this.armed,stopping:i})}
      role="switch"
      aria-checked=${e.relay.on?`true`:`false`}
      aria-label=${o}
      title=${o}
      ?disabled=${!e.online||!e.relay.available||i}
      @click=${this.togglePi}
    >
      <span
        class="pid"
        style=${k({"--disc-bg":this.armed?void 0:r?.background,"--disc-shadow":this.armed?void 0:r?.shadow,"--disc-color":this.armed?`var(--error-color, #ef5350)`:r?.iconColor})}
        ><ha-icon icon="mdi:raspberry-pi"></ha-icon
      ></span>
      ${a?T`<span class="label">${a}</span>`:D}
      <span class=${W({switch:!0,on:e.relay.on})}></span>
    </button>`:T`<button
        type="button"
        class=${W({reset:!0,piround:!0,on:e.relay.on,armed:this.armed,stopping:i})}
        role="switch"
        aria-checked=${e.relay.on?`true`:`false`}
        aria-label=${o}
        title=${o}
        ?disabled=${!e.online||!e.relay.available||i}
        style=${k({"--disc-bg":this.armed?void 0:r?.background,"--disc-shadow":this.armed?void 0:r?.shadow,"--disc-color":this.armed?void 0:r?.iconColor})}
        @click=${this.togglePi}
      >
        <ha-icon .icon=${i?`mdi:power-sleep`:`mdi:raspberry-pi`}></ha-icon>
      </button>`}renderNames(e,t){let n=this._config,r=this.hass,i=this.stopping!==void 0||e.power.stopping,a=t&&this.armed?{text:B(r,e.power.clean?`amb_shutdown_again`:`amb_cut_again`),tone:`alarm`}:t&&i?{text:e.power.status?po(r,e.power.status):B(r,`amb_stopping`),tone:`warn`}:co(r,e),o=n?.showStatus!==!1||this.armed||i?T`<span class=${W({status:!0,[a.tone??`plain`]:!0})}
          >${a.text}</span
        >`:D,s=t&&n&&n.info.length?n.info:void 0;return s?T`<span class="names">
        <span class="name-row"><span class="name">${e.name}</span>${o}</span>
        <span class="inline">${this.renderValues(e,s)}</span>
      </span>`:T`<span class="names"> <span class="name">${e.name}</span>${o} </span>`}shownInput(e){let t=this.pending?.index??Object.keys(this.phases).map(Number).find(e=>this.phases[e]!==void 0)??e.hdmi.active;return{index:t,phase:t===void 0?void 0:this.phases[t]}}renderSourceChip(e){let t=this.hass,n=this._config;if(!n)return D;let{index:r,phase:i}=this.shownInput(e),a=r===void 0?void 0:e.hdmi.inputs[r],o=fo(t),s=i===`ok`||i===`remote`?`mdi:check-bold`:i===`fail`?`mdi:alert`:a?.icon??`mdi:video-input-hdmi`,c=i&&i!==`remote`?o[i]:a?.name??B(t,`amb_source`),l=n.sourceDisplay,u=l!==`icon`||i!==void 0&&i!==`remote`;return T`<button
      type="button"
      class=${W({reset:!0,source:!0,[i??`idle`]:!0,bare:l===`name`,iconic:!u})}
      aria-haspopup="true"
      aria-expanded=${this.menuOpen?`true`:`false`}
      title=${a?.name??B(t,`amb_source`)}
      ?disabled=${!e.online}
      @click=${this.toggleMenu}
    >
      ${l===`name`&&!i?D:T`<span
              class=${W({sdisc:!0,waves:i===`sending`,pop:i===`ok`||i===`remote`})}
              ><ha-icon .icon=${s}></ha-icon
            ></span>`}
      ${u?T`<span class="stext">${c}</span>`:D}
      <ha-icon class="caret" icon="mdi:chevron-down"></ha-icon>
    </button>`}toggleMenu=e=>{e.stopPropagation(),this.menuOpen?this.closeMenu():this.openMenu()};openMenu(){let e=this.renderRoot.querySelector(`.source`);e&&this.model&&(this.menu||(this.menu=new Ri,this.menu.addEventListener(`vivid-popover-close-request`,()=>this.closeMenu()),this.menu.addEventListener(`vivid-source-select`,(e=>{let t=this.menuIndexes[e.detail.index];this.closeMenu(),t!==void 0&&this.selectSource(new CustomEvent(`x`,{detail:{index:t}}))}))),P(this,`light`),this.menuOpen=!0,this.renderMenu(),this.menu.show(e))}closeMenu(){this.menuOpen=!1,this.menu?.hide()}renderMenu(){let e=this.menu,t=this.model,n=this._config;if(!e||!t||!n)return;for(let[t,r]of Object.entries(Ot(n.glow)))e.style.setProperty(t,r);this.menuIndexes=t.hdmi.inputs.map((e,t)=>t).filter(e=>!n.inputs[e]?.hidden);let r=this.menuIndexes.map(e=>{let n=t.hdmi.inputs[e];return{name:n?.name??``,icon:n?.icon??`mdi:video-input-hdmi`,available:t.online&&(n?.available??!1)}}),i={};this.menuIndexes.forEach((e,t)=>{let n=this.phases[e];n&&(i[t]=n)});let a=t.hdmi.active===void 0?-1:this.menuIndexes.indexOf(t.hdmi.active);e.label=B(this.hass,`amb_source`),e.content=T`<vivid-source-row
      size="large"
      .items=${r}
      .active=${a<0?void 0:a}
      .phases=${i}
      .labels=${fo(this.hass)}
    ></vivid-source-row>`}render(){let e=this._config,t=this.model;if(!e||!this.hass)return D;if(!t||!t.fan.available&&!t.relay.available&&!this.hass.states[e.entities.online])return T`<ha-card
        ><div class="warning">Ambilight manager not found: ${e.entities.relay}</div></ha-card
      >`;let n=t.hdmi.inputs.map(e=>({name:e.name,icon:e.icon,available:t.online&&e.available})),r=T`<button
      type="button"
      class="reset title"
      title=${B(this.hass,`details`)}
      @click=${()=>this.openDetails()}
    >
      ${this.renderDisc(t)}${this.renderNames(t,e.layout===`line`)}
    </button>`,i=e.layout===`line`?T`<div class="head line">
            ${r}${this.renderSourceChip(t)}${e.showPi?this.renderPi(t,!1):D}
          </div>`:T`<div class="head">
              ${r}
              <button
                type="button"
                class="reset values"
                title=${B(this.hass,`details`)}
                @click=${()=>this.openDetails()}
              >
                ${this.renderValues(t,e.info)}
              </button>
              ${e.showPi?this.renderPi(t,!0):D}
            </div>
            <vivid-source-row
              .items=${n}
              .active=${t.hdmi.active}
              .phases=${this.phases}
              .labels=${fo(this.hass)}
              ?disabled=${!t.online}
              @vivid-source-select=${this.selectSource}
            ></vivid-source-row>`;return T`<ha-card>
      <div
        class=${W({panel:!0,offline:!t.online,compact:e.layout===`line`})}
        style=${k(Ot(e.glow))}
      >
        ${i}
      </div>
    </ha-card>`}};z(Bn,Fo),sn({type:Bn,name:`Vivid Ambilight manager`,description:`The box behind the TV: HDMI source by IR with echo confirmation, Raspberry Pi power, box temperature and fan curve.`,preview:!1,documentationURL:`${R}#vivid-ambilight-card`}),z(`vivid-ambilight-rail`,class extends Fo{static properties={...Fo.properties,drive:{attribute:!1},screen:{type:Boolean},screenColors:{attribute:!1},drift:{type:Boolean},lightColors:{attribute:!1}};railKey;set railConfig(e){let t=JSON.stringify(e??null);e&&t!==this.railKey&&(this.railKey=t,this.setConfig(e))}get boxModel(){return this.model}sendInput(e){this.selectSource(new CustomEvent(`vivid-source-select`,{detail:{index:e}}))}static styles=[...Fo.styles,o`
      .rail {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 56px;
        box-sizing: border-box;
        padding: 8px 10px 8px 12px;
        border-top: 1px solid rgba(var(--vivid-rgb-text), 0.1);
        background: rgba(var(--vivid-rgb-text), 0.025);
        container-type: inline-size;
        transition: background-color 0.3s ease;
      }
      .rail.active {
        background: rgba(var(--vivid-rgb-text), 0.045);
      }
      .rail.alert {
        background: rgba(239, 83, 80, 0.12);
        border-top-color: rgba(239, 83, 80, 0.35);
      }
      .rail.offline .rtitle {
        opacity: 0.6;
      }
      .rtitle {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1 1 auto;
        min-width: 0;
        padding: 2px;
        border-radius: 14px;
        text-align: left;
      }
      .rdisc {
        display: grid;
        place-items: center;
        flex: none;
        --vivid-glow-size: ${a(At(32))};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--disc-bg, var(--vivid-layer-2));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
        transition:
          background 0.4s ease,
          box-shadow 0.4s ease;
      }
      .rdisc ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
      }
      .rail .names {
        flex: 1 1 auto;
        gap: 2px;
      }
      .rail .name {
        font-size: 13.5px;
        font-weight: 700;
      }
      .rail:not(.active):not(.alert) .name {
        color: var(--secondary-text-color);
      }
      .rail .inline .value {
        font-size: 12.5px;
      }
      .toggle {
        position: relative;
        flex: none;
        width: 42px;
        height: 24px;
        border-radius: 12px;
        background: rgba(var(--vivid-rgb-text), 0.18);
        transition: background 0.25s ease;
      }
      .toggle::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--secondary-text-color);
        transition:
          transform 0.2s ease,
          background-color 0.2s ease;
      }
      .toggle.on {
        background: var(--toggle-bg);
      }
      .toggle.on::after {
        transform: translateX(18px);
        background: #fff;
      }
      /* Ambilight mode: the screen's colors drift, like a picture. */
      .rdisc.screen,
      .toggle.on.screen {
        animation: vivid-screen-drift 8s linear infinite;
        animation-play-state: var(--vivid-glow-play, running);
      }
      @keyframes vivid-screen-drift {
        to {
          filter: hue-rotate(360deg);
        }
      }
      .toggle.armed {
        background: var(--error-color, #ef5350);
        animation: pulse 1s ease-in-out infinite;
      }
      .toggle.stopping {
        background: rgb(255, 193, 7);
      }
      .toggle:disabled {
        cursor: default;
      }
      .toggle:disabled:not(.stopping) {
        opacity: 0.5;
      }
      .missing {
        padding: 10px 12px;
        font-size: 13px;
        color: var(--error-color, #db4437);
        border-top: 1px solid rgba(var(--vivid-rgb-text), 0.1);
      }
      @media (prefers-reduced-motion: reduce) {
        .toggle.armed,
        .rdisc.screen,
        .toggle.on.screen {
          animation: none;
        }
        .toggle,
        .toggle::after,
        .rdisc,
        .rail {
          transition: none;
        }
      }
    `];updated(){super.updated(),N(this,`vivid-rail-change`)}discStyle(e,t,n){if(t){let e=L(Ja,.95);return{"--disc-bg":e.background,"--disc-shadow":e.shadow,"--disc-color":e.iconColor}}if(!e.online||!e.relay.on||n.length===0)return{};if(n.length===1){let e=Kt(n,!0,80);return{"--disc-bg":e.background,"--disc-shadow":e.shadow,"--disc-color":`#fff`}}return{"--disc-bg":`conic-gradient(from 200deg, ${[...n,n[0]].map(e=>I(e)).join(`, `)})`,"--disc-shadow":Kt(n,!0,80).shadow,"--disc-color":`#fff`}}renderSubtitle(e){let t=this.hass,n=this.stopping!==void 0||e.power.stopping,r=oi(e);return this.armed?T`<span class="status alarm">${B(t,e.power.clean?`amb_shutdown_again`:`amb_cut_again`)}</span>`:n?T`<span class="status warn">${e.power.status?po(t,e.power.status):B(t,`amb_stopping`)}</span>`:r?T`<span class="status alarm">${co(t,e).text}${r.temperature===void 0?``:` · ${Za(t,r.temperature,0)}`}</span>`:e.online?e.relay.on?T`<span class="inline">${this.renderValues(e,[`temperature`,`fan`])}</span>`:T`<span class="status muted"
      >${B(t,`off`)} · ${ro(t,e.pi)}</span
    >`:T`<span class="status muted">${co(t,e).text}</span>`}render(){let e=this._config,t=this.model,n=this.hass;if(!e||!n||!t)return D;if(!t.fan.available&&!t.relay.available&&!n.states[e.entities.online])return T`<div class="missing">${B(n,`rail_missing`)}</div>`;let r=oi(t)!==void 0,i=ci(this.screen,this.lightColors??[],this.screenColors),a=t.online&&t.relay.on,o=this.stopping!==void 0||t.power.stopping,s=`${B(n,`amb_pi_title`)} · ${ro(n,t.pi)}`;return T`<div class=${W({rail:!0,active:a,alert:r,offline:!t.online})}>
      <button
        type="button"
        class="reset rtitle"
        title=${B(n,`details`)}
        @click=${()=>this.openDetails()}
      >
        <span
          class=${W({rdisc:!0,screen:this.screen&&this.drift&&!r&&a})}
          style=${k(this.discStyle(t,r,i))}
          ><ha-icon .icon=${r?`mdi:alert`:`mdi:television-ambient-light`}></ha-icon
        ></span>
        <span class="names"
          ><span class="name">${t.name}</span>${this.renderSubtitle(t)}</span
        >
      </button>
      ${r?D:this.renderSourceChip(t)}
      <button
        type="button"
        class=${W({reset:!0,toggle:!0,on:t.relay.on,screen:this.screen&&this.drift&&t.relay.on,armed:this.armed,stopping:o})}
        role="switch"
        aria-checked=${t.relay.on?`true`:`false`}
        aria-label=${`${t.name} · ${s}`}
        title=${s}
        ?disabled=${!t.online||!t.relay.available||o}
        style=${k({"--toggle-bg":i.length?`linear-gradient(90deg, ${I(i[0])}, ${I(i[i.length-1])})`:`var(--primary-color)`})}
        @click=${this.togglePi}
      ></button>
    </div>`}});var{I:Io}=Fe,Lo=e=>e,Ro=()=>document.createComment(``),zo=(e,t,n)=>{let r=e._$AA.parentNode,i=t===void 0?e._$AB:t._$AA;if(n===void 0)n=new Io(r.insertBefore(Ro(),i),r.insertBefore(Ro(),i),e,e.options);else{let t=n._$AB.nextSibling,a=n._$AM,o=a!==e;if(o){let t;n._$AQ?.(e),n._$AM=e,n._$AP!==void 0&&(t=e._$AU)!==a._$AU&&n._$AP(t)}if(t!==i||o){let e=n._$AA;for(;e!==t;){let t=Lo(e).nextSibling;Lo(r).insertBefore(e,i),e=t}}}return n},Bo=(e,t,n=e)=>(e._$AI(t,n),e),Vo={},Ho=(e,t=Vo)=>e._$AH=t,Uo=e=>e._$AH,Wo=e=>{e._$AR(),e._$AA.remove()},Go=(e,t,n)=>{let r=/* @__PURE__ */ new Map;for(let i=t;i<=n;i++)r.set(e[i],i);return r},Ko=Ve(class extends He{constructor(e){if(super(e),e.type!==Be.CHILD)throw Error(`repeat() can only be used in text expressions`)}dt(e,t,n){let r;n===void 0?n=t:t!==void 0&&(r=t);let i=[],a=[],o=0;for(let t of e)i[o]=r?r(t,o):o,a[o]=n(t,o),o++;return{values:a,keys:i}}render(e,t,n){return this.dt(e,t,n).values}update(e,[t,n,r]){let i=Uo(e),{values:a,keys:o}=this.dt(t,n,r);if(!Array.isArray(i))return this.ut=o,a;let s=this.ut??=[],c=[],l,u,d=0,f=i.length-1,p=0,m=a.length-1;for(;d<=f&&p<=m;)if(i[d]===null)d++;else if(i[f]===null)f--;else if(s[d]===o[p])c[p]=Bo(i[d],a[p]),d++,p++;else if(s[f]===o[m])c[m]=Bo(i[f],a[m]),f--,m--;else if(s[d]===o[m])c[m]=Bo(i[d],a[m]),zo(e,c[m+1],i[d]),d++,m--;else if(s[f]===o[p])c[p]=Bo(i[f],a[p]),zo(e,i[d],i[f]),f--,p++;else if(l===void 0&&(l=Go(o,p,m),u=Go(s,d,f)),l.has(s[d])){if(l.has(s[f])){let t=u.get(o[p]),n=t===void 0?null:i[t];if(n===null){let t=zo(e,i[d]);Bo(t,a[p]),c[p]=t}else c[p]=Bo(n,a[p]),zo(e,i[d],n),i[t]=null;p++}else Wo(i[f]),f--}else Wo(i[d]),d++;for(;p<=m;){let t=zo(e,c[m+1]);Bo(t,a[p]),c[p++]=t}for(;d<=f;){let e=i[d++];e!==null&&Wo(e)}return this.ut=o,Ho(e,c),xe}});async function qo(e,t,n,r){if(!e.callWS||t.length===0)return{};let i=await e.callWS({type:`history/history_during_period`,start_time:new Date(n).toISOString(),end_time:new Date(r).toISOString(),entity_ids:[...t],minimal_response:!0,no_attributes:!0}),a={};for(let[e,t]of Object.entries(i??{}))a[e]=t.map(e=>{let t=e.lu??e.lc,n=Number.parseFloat(e.s);return{t:t===void 0?NaN:t*1e3,v:Number.isFinite(n)?n:void 0}}).filter(e=>Number.isFinite(e.t)).sort((e,t)=>e.t-t.t);return a}async function Jo(e,t,n,r){if(!e.callWS||t.length===0)return{};let i=await e.callWS({type:`history/history_during_period`,start_time:new Date(n).toISOString(),end_time:new Date(r).toISOString(),entity_ids:[...t],minimal_response:!0,no_attributes:!0}),a={};for(let[e,t]of Object.entries(i??{}))a[e]=t.map(e=>{let t=e.lc??e.lu;return{t:t===void 0?NaN:t*1e3,s:e.s}}).filter(e=>Number.isFinite(e.t)).sort((e,t)=>e.t-t.t);return a}function Yo(e,t,n,r=e=>e===`on`){let i=[],a=Math.max(n-t,1),o;for(let s of e){let e=Math.min(Math.max(s.t,t),n);r(s.s)?o??=e:o!==void 0&&(e>o&&i.push([(o-t)/a,(e-t)/a]),o=void 0)}return o!==void 0&&n>o&&i.push([(o-t)/a,1]),i}function Xo(e,t){let n;for(let r of e){if(r.t>t)break;n=r.v}return n}function Zo(e,t,n,r){let i=(n-t)/r;return Array.from({length:r},(n,r)=>{let a=t+r*i,{energy:o,known:s}=Qo(e,a,a+i);return s>0?o/s:void 0})}function Qo(e,t,n){let r=0,i=0,a=Xo(e,t),o=t;for(let s of e)if(!(s.t<=t)){if(s.t>=n)break;a!==void 0&&(r+=a*(s.t-o),i+=s.t-o),a=s.v,o=s.t}return a!==void 0&&(r+=a*(n-o),i+=n-o),{energy:r,known:i}}function $o(e,t,n){return Qo(e,t,n).energy/36e5}function es(e,t){return e.map(e=>({t:e.t,v:e.v===void 0?void 0:e.v*t}))}function ts(e){let t=new Date(e);return t.setHours(0,0,0,0),t.getTime()}async function ns(e,t,n,r){if(!e.callWS||t.length===0)return{};let i=await e.callWS({type:`recorder/statistics_during_period`,start_time:new Date(n).toISOString(),end_time:new Date(r).toISOString(),statistic_ids:[...t],period:`hour`,types:[`mean`]}),a={};for(let[e,t]of Object.entries(i??{})){let n=[],r=[...t].sort((e,t)=>e.start-t.start);r.forEach((e,t)=>{let i=typeof e.mean==`number`&&Number.isFinite(e.mean)?e.mean:void 0;n.push({t:e.start,v:i});let a=r[t+1];(!a||a.start>e.end)&&n.push({t:e.end,v:void 0})}),a[e]=n}return a}function rs(e,t){let n=e.filter(e=>e.t<t);return n.length?[...n,{t,v:void 0}]:[]}var is=36e5,as=3e5,os={"6h":{hours:6,buckets:72,label:`range_6h`,tick:1},"24h":{hours:24,buckets:96,label:`range_24h`,tick:6},"7d":{hours:168,buckets:84,label:`range_7d`,tick:24}},ss=[`#ffb300`,`#ff7043`,`#9575cd`,`#4dd0e1`,`#81c784`,`#f06292`];function cs(e,t){return t<1e3?`${V(e,t,+(t<10))} Wh`:`${V(e,t/1e3,2)} kWh`}function ls(e,t,n){try{return new Intl.NumberFormat(dn(e),{style:`currency`,currency:n,maximumFractionDigits:2}).format(t)}catch{return`${t.toFixed(2)} ${n}`}}function us(e,t){return`${V(e,t,+(t<10))} W`}function ds(e){return dn(e)}function fs(e){if(!(e>0))return 1;let t=10**Math.floor(Math.log10(e));for(let n of[1,2,2.5,5,10])if(n*t>=e)return n*t;return 10*t}z(`vivid-power-history`,class extends O{static properties={hass:{attribute:!1},sources:{attribute:!1},price:{type:Number},currency:{},_range:{state:!0},_day:{state:!0},_week:{state:!0},_failed:{state:!0},_hover:{state:!0}};timer;dayKey=``;weekKey=``;constructor(){super(),this.sources=[],this._range=`24h`,this._failed=!1}static styles=[H,U,o`
      :host {
        display: block;
      }
      .panel {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
      }
      .head {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .title {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        margin-right: auto;
      }
      .title ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        color: var(--amber-color, #ffc107);
      }
      .ranges {
        display: inline-flex;
        padding: 2px;
        border-radius: 10px;
        background: var(--vivid-layer-2);
      }
      .ranges button {
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .ranges button[aria-pressed='true'] {
        background: rgba(var(--vivid-rgb-text), 0.14);
        color: var(--primary-text-color);
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px;
      }
      .stat {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
        padding: 7px 10px;
        border-radius: 12px;
        background: var(--vivid-layer-2);
      }
      .stat .label {
        font-size: 10.5px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .stat .value {
        font-size: 15px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .stat .extra {
        font-size: 11px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .chart {
        position: relative;
        height: 128px;
        margin-right: 36px;
        touch-action: pan-y;
        cursor: crosshair;
      }
      svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .grid line {
        stroke: rgba(var(--vivid-rgb-text), 0.12);
        stroke-width: 1;
        stroke-dasharray: 3 4;
        vector-effect: non-scaling-stroke;
      }
      .area {
        opacity: 0.5;
      }
      .edge {
        fill: none;
        stroke-width: 1.5;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
      }
      .sum {
        fill: none;
        stroke: var(--primary-text-color);
        stroke-opacity: 0.8;
        stroke-width: 1.5;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
      }
      .ylabel {
        position: absolute;
        right: -36px;
        width: 32px;
        transform: translateY(-50%);
        font-size: 10px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }
      .cursor {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--primary-text-color);
        opacity: 0.5;
        pointer-events: none;
      }
      .tooltip {
        position: absolute;
        top: 4px;
        z-index: 1;
        min-width: 130px;
        padding: 8px 10px;
        border-radius: 10px;
        background: var(--vivid-layer-0);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
        font-size: 11.5px;
        pointer-events: none;
      }
      .tooltip .time {
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }
      .tooltip .row {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 6px;
        font-variant-numeric: tabular-nums;
      }
      .tooltip .row.total {
        font-weight: 600;
        margin-top: 3px;
        padding-top: 3px;
        border-top: 1px solid rgba(var(--vivid-rgb-text), 0.12);
      }
      .swatch {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--swatch);
      }
      .axis {
        position: relative;
        height: 14px;
        margin: -4px 36px 0 0;
        font-size: 10px;
        color: var(--secondary-text-color);
      }
      .axis span {
        position: absolute;
        transform: translateX(-50%);
        white-space: nowrap;
      }
      .legend {
        display: grid;
        grid-template-columns: auto minmax(0, auto) minmax(40px, 1fr) auto auto;
        align-items: center;
        gap: 6px 10px;
        font-size: 12px;
      }
      .legend .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .legend .bar {
        height: 6px;
        border-radius: 3px;
        background: rgba(var(--vivid-rgb-text), 0.08);
        overflow: hidden;
      }
      .legend .bar span {
        display: block;
        height: 100%;
        border-radius: 3px;
        background: var(--swatch);
      }
      .legend .value,
      .legend .share {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .legend .share {
        color: var(--secondary-text-color);
        min-width: 3em;
      }
      .muted {
        opacity: 0.45;
      }
      .loading {
        height: 128px;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.05);
      }
    `];connectedCallback(){super.connectedCallback(),this.timer=window.setInterval(()=>void this.load(!0),as)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this.timer),this.dayKey=``,this.weekKey=``}updated(e){(e.has(`sources`)||e.has(`hass`)||e.has(`_range`))&&this.load(!1)}async load(e){let t=this.hass;if(!t?.callWS||this.sources.length===0)return;let n=this.sources.map(e=>e.entityId).join(`,`),r=this.sources.map(e=>e.entityId),i=Date.now();try{(e||n!==this.dayKey)&&(this.dayKey=n,this._day=await qo(t,r,i-24*is,i)),this._range===`7d`&&(e||n!==this.weekKey)&&(this.weekKey=n,this._week=await ns(t,r,i-168*is,i)),this._failed=!1}catch{this._failed=!0}}readings(e,t,n){let r=this._day?.[e.entityId]??[],i=n===`7d`?[...rs(this._week?.[e.entityId]??[],t-24*is),...r]:r,a=Number.parseFloat(this.hass?.states[e.entityId]?.state??``);return es([...i,{t,v:Number.isFinite(a)?a:void 0}],e.factor)}series(e){let t=os[this._range],n=e-t.hours*is,r=ts(e);return{lights:this.sources.map((i,a)=>{let o=this.readings(i,e,this._range);return{source:i,color:ss[a%ss.length]??`#ffb300`,buckets:Zo(o,n,e,t.buckets),energy:$o(o,n,e),today:$o(this.readings(i,e,`24h`),r,e)}}),start:n,spec:t}}timeLabel(e){return new Intl.DateTimeFormat(ds(this.hass),{weekday:this._range===`7d`?`short`:void 0,hour:`2-digit`,minute:`2-digit`}).format(new Date(e))}renderChart(e,t,n,r,i){let a=i.buckets,o=fs(Math.max(0,...t.map(e=>e??0))),s=e=>e/(a-1)*100,c=e=>100-e/o*100,l=[],u=[];t.forEach((e,t)=>{e===void 0?(u.length&&l.push(u),u=[]):u.push(t)}),u.length&&l.push(u);let d=Array(a).fill(0),f=e.map(e=>{let t=d.map((t,n)=>t+(e.buckets[n]??0)),n=l.map(e=>{let n=e.map(e=>`${s(e)},${c(t[e]??0)}`),r=[...e].reverse().map(e=>`${s(e)},${c(d[e]??0)}`);return{area:`M${n.join(` L`)} L${r.join(` L`)} Z`,edge:`M${n.join(` L`)}`}});return t.forEach((e,t)=>d[t]=e),{light:e,paths:n}}),p=l.map(e=>`M${e.map(e=>`${s(e)},${c(t[e]??0)}`).join(` L`)}`).join(` `),m=this._hover,h=(r-n)/a,g=this.hass;return T`<div
        class="chart"
        @pointermove=${this.onPointer}
        @pointerdown=${this.onPointer}
        @pointerleave=${()=>this._hover=void 0}
        role="img"
        aria-label=${B(g,`consumption`)}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <g class="grid">
            ${[0,50,100].map(e=>E`<line x1="0" x2="100" y1=${e} y2=${e}></line>`)}
          </g>
          ${f.map(({light:e,paths:t})=>t.map(t=>E`<path class="area" fill=${e.color} d=${t.area}></path><path class="edge" stroke=${e.color} d=${t.edge}></path>`))}
          ${e.length>1&&p?E`<path class="sum" d=${p}></path>`:D}
        </svg>
        ${[o,o/2,0].map((e,t)=>T`<span class="ylabel" style=${`top: ${t*50}%`}
              >${us(g,e)}</span
            >`)}
        ${m===void 0?D:this.renderTooltip(e,t,m,n+(m+.5)*h,s(m))}
      </div>
      ${this.renderAxis(n,r,i)}`}onPointer=e=>{let t=e.currentTarget.getBoundingClientRect();if(t.width===0)return;let n=Math.min(Math.max((e.clientX-t.left)/t.width,0),1);this._hover=Math.round(n*(os[this._range].buckets-1))};renderTooltip(e,t,n,r,i){let a=this.hass,o=t[n],s=i>55?{right:`${100-i+2}%`}:{left:`${i+2}%`};return T`<div class="cursor" style=${`left: ${i}%`}></div>
      <div class="tooltip" style=${k(s)}>
        <div class="time">${this.timeLabel(r)}</div>
        ${e.map(e=>{let t=e.buckets[n];return T`<div class="row">
            <span class="swatch" style=${`--swatch: ${e.color}`}></span>
            <span>${e.source.name}</span>
            <span>${t===void 0?`—`:us(a,t)}</span>
          </div>`})}
        ${e.length>1?T`<div class="row total">
                <span></span><span>${B(a,`total`)}</span
                ><span>${o===void 0?`—`:us(a,o)}</span>
              </div>`:D}
      </div>`}renderAxis(e,t,n){let r=ds(this.hass),i=t-e,a=[];if(n.tick===24){let n=new Intl.DateTimeFormat(r,{weekday:`short`});for(let r=ts(e);r<t;r+=24*is)a.push({at:r+12*is,label:n.format(new Date(r+12*is))})}else{let i=new Intl.DateTimeFormat(r,{hour:`2-digit`,minute:`2-digit`}),o=n.tick*is,s=ts(e);for(let n=s;n<t;n+=o)n>e&&a.push({at:n,label:i.format(new Date(n))})}return T`<div class="axis">
      ${a.filter(t=>(t.at-e)/i>.05&&(t.at-e)/i<.95).map(t=>T`<span style=${`left: ${((t.at-e)/i*100).toFixed(2)}%`}
              >${t.label}</span
            >`)}
    </div>`}renderStats(e,t,n,r,i){let a=this.hass,o=this.currency??a?.config?.currency??`EUR`,s=e=>this.price===void 0?void 0:ls(a,e/1e3*this.price,o),c=e.reduce((e,t)=>e+t.today,0),l=e.reduce((e,t)=>e+t.energy,0),u=t.map(e=>e??0),d=Math.max(0,...u),f=(i-r)/n.buckets,p=r+(u.indexOf(d)+.5)*f,m=l/((i-r)/is)||0;return T`<div class="stats">
      <div class="stat">
        <span class="label">${B(a,`today`)}</span>
        <span class="value">${cs(a,c)}</span>
        <span class="extra">${s(c)??`\xA0`}</span>
      </div>
      <div class="stat">
        <span class="label"
          >${B(a,`over_range`,{range:B(a,n.label)})}</span
        >
        <span class="value">${cs(a,l)}</span>
        <span class="extra"
          >${s(l)??`${B(a,`average`)} ${us(a,m)}`}</span
        >
      </div>
      <div class="stat">
        <span class="label">${B(a,`peak`)}</span>
        <span class="value">${us(a,d)}</span>
        <span class="extra">${d>0?this.timeLabel(p):`—`}</span>
      </div>
    </div>`}renderLegend(e,t){if(e.length<2)return D;let n=this.hass,r=t.reduce((e,t)=>e+t.energy,0),i=Math.max(...t.map(e=>e.energy),.001);return T`<div class="legend">
      ${e.map(e=>{let a=t.includes(e);return T`<span
            class="swatch ${a?``:`muted`}"
            style=${`--swatch: ${e.color}`}
          ></span>
          <span class="name ${a?``:`muted`}">${e.source.name}</span>
          <span class="bar" style=${`--swatch: ${e.color}`}
            ><span style=${`width: ${a?(e.energy/i*100).toFixed(1):0}%`}></span
          ></span>
          <span class="value ${a?``:`muted`}"
            >${a?cs(n,e.energy):B(n,`no_data`)}</span
          >
          <span class="share"
            >${a&&r>0?`${V(n,e.energy/r*100)} %`:`—`}</span
          >`})}
    </div>`}render(){if(!this.hass?.callWS||this.sources.length===0||this._failed)return D;let e=this.hass,t=T`<div class="head">
      <span class="title"
        ><ha-icon .icon=${`mdi:chart-areaspline`}></ha-icon>${B(e,`consumption`)}</span
      >
      <span class="ranges" role="group" aria-label=${B(e,`period`)}>
        ${Object.keys(os).map(t=>T`<button
              type="button"
              class="reset"
              aria-pressed=${String(t===this._range)}
              @click=${()=>{this._range=t,this._hover=void 0}}
            >
              ${B(e,os[t].label)}
            </button>`)}
      </span>
    </div>`;if(!this._day||this._range===`7d`&&!this._week)return T`<div class="panel">
        ${t}
        <div class="loading"></div>
      </div>`;let n=Date.now(),{lights:r,start:i,spec:a}=this.series(n),o=r.filter(e=>e.buckets.some(e=>e!==void 0)),s=Array.from({length:a.buckets},(e,t)=>{let n=o.map(e=>e.buckets[t]);return n.some(e=>e!==void 0)?n.reduce((e,t)=>e+(t??0),0):void 0});return T`<div class="panel">
      ${t} ${this.renderStats(o,s,a,i,n)}
      ${this.renderChart(o,s,i,n,a)} ${this.renderLegend(r,o)}
    </div>`}});var ps=[{role:`preset`,icon:`mdi:star-outline`,label:`preset`},{role:`playlist`,icon:`mdi:playlist-play`,label:`playlist`},{role:`palette`,icon:`mdi:palette-outline`,label:`palette`}],ms=[{role:`speed`,icon:`mdi:speedometer`,label:`speed`},{role:`intensity`,icon:`mdi:tune-vertical-variant`,label:`intensity`}],hs=[{role:`reverse`,icon:`mdi:swap-horizontal`,label:`reverse`},{role:`freeze`,icon:`mdi:snowflake`,label:`freeze`},{role:`nightlight`,icon:`mdi:weather-night`,label:`nightlight`},{role:`syncSend`,icon:`mdi:upload-network-outline`,label:`sync_send`},{role:`syncReceive`,icon:`mdi:download-network-outline`,label:`sync_receive`}],gs=3e3;z(`vivid-wled-panel`,class extends O{static properties={hass:{attribute:!1},entities:{attribute:!1},effectActive:{type:Boolean,attribute:`effect-active`},settings:{type:Boolean},device:{type:Boolean},_tab:{state:!0},_confirm:{state:!0},_live:{state:!0}};confirmTimer;constructor(){super(),this.effectActive=!1,this.settings=!0,this.device=!0,this._confirm=!1,this._live={}}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this.confirmTimer)}willUpdate(e){if(!e.has(`hass`))return;let t=e.get(`hass`),n={...this._live},r=!1;for(let e of Object.keys(n))t?.states[e]!==this.hass?.states[e]&&(delete n[e],r=!0);r&&(this._live=n)}static styles=[H,U,o`
      :host {
        display: block;
      }
      .tabs {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        gap: 6px;
      }
      .tab {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 8px;
        min-height: var(--vivid-chip-height);
        padding: 6px 10px 6px 12px;
        border-radius: 14px;
        background: var(--vivid-chip-context, var(--vivid-layer-2));
        text-align: left;
        transition: background-color 0.2s ease;
      }
      .tab[aria-expanded='true'] {
        background: rgba(var(--vivid-rgb-text), 0.12);
      }
      .tab ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        color: var(--secondary-text-color);
      }
      .tab .chevron {
        --mdc-icon-size: 16px;
        transition: transform 0.2s ease;
      }
      .tab[aria-expanded='true'] .chevron {
        transform: rotate(180deg);
      }
      .tab .text {
        display: flex;
        flex-direction: column;
        min-width: 0;
        line-height: 1.2;
      }
      .tab .title {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
      }
      .tab .sub {
        font-size: 11px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--primary-color, #03a9f4);
        box-shadow: 0 0 6px var(--primary-color, #03a9f4);
      }
      .weak {
        color: var(--warning-color, #ffa600) !important;
      }
      .panel {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-top: 8px;
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      vivid-select-chip {
        max-width: 100%;
      }
      .range {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) 3.4em;
        align-items: center;
        gap: 10px;
        height: calc(var(--vivid-chip-height) - 2px);
        padding: 0 12px;
        border-radius: calc(var(--vivid-chip-height) / 2);
        background: var(--vivid-chip-context, var(--vivid-layer-2));
        font-size: 13px;
        font-weight: 500;
      }
      .range.idle {
        opacity: 0.55;
      }
      .range ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        color: var(--secondary-text-color);
      }
      .range .value {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .hint {
        font-size: 11px;
        color: var(--secondary-text-color);
        padding: 0 4px;
      }
      input[type='range'] {
        min-width: 0;
        margin: 0;
        height: 24px;
        background: none;
        appearance: none;
        cursor: pointer;
        --track: rgba(var(--vivid-rgb-text), 0.16);
        --fill: var(--primary-text-color);
      }
      input[type='range']:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
        border-radius: 4px;
      }
      input[type='range']::-webkit-slider-runnable-track {
        height: 6px;
        border-radius: 3px;
        background: linear-gradient(90deg, var(--fill) var(--ratio), var(--track) var(--ratio));
      }
      input[type='range']::-webkit-slider-thumb {
        appearance: none;
        width: 16px;
        height: 16px;
        margin-top: -5px;
        border-radius: 50%;
        background: var(--fill);
        box-shadow: 0 0 0 3px var(--vivid-chip-context, var(--vivid-layer-2));
      }
      input[type='range']::-moz-range-track {
        height: 6px;
        border-radius: 3px;
        background: var(--track);
      }
      input[type='range']::-moz-range-progress {
        height: 6px;
        border-radius: 3px;
        background: var(--fill);
      }
      input[type='range']::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border: none;
        border-radius: 50%;
        background: var(--fill);
      }
      .switches {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 6px;
      }
      .switch {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 8px;
        min-height: calc(var(--vivid-chip-height) - 4px);
        padding: 4px 8px 4px 10px;
        border-radius: 12px;
        background: var(--vivid-chip-context, var(--vivid-layer-2));
        font-size: 12px;
        text-align: left;
      }
      .switch ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
        color: var(--secondary-text-color);
      }
      .switch .label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .toggle {
        position: relative;
        width: 28px;
        height: 16px;
        border-radius: 8px;
        background: rgba(var(--vivid-rgb-text), 0.22);
        transition: background-color 0.2s ease;
      }
      .toggle::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--primary-text-color);
        transition: transform 0.2s ease;
      }
      .switch[aria-checked='true'] .toggle {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.6);
      }
      .switch[aria-checked='true'] .toggle::after {
        transform: translateX(12px);
        background: var(--primary-color, #03a9f4);
      }
      .switch[aria-checked='true'] ha-icon {
        color: var(--primary-color, #03a9f4);
      }
      .switch:disabled {
        opacity: 0.45;
        cursor: default;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(136px, 1fr));
        gap: 6px;
      }
      .stat {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        grid-template-rows: auto auto;
        column-gap: 8px;
        align-items: center;
        padding: 7px 10px;
        border-radius: 12px;
        background: var(--vivid-chip-context, var(--vivid-layer-2));
      }
      .stat ha-icon {
        --mdc-icon-size: 18px;
        grid-row: span 2;
        display: inline-flex;
        color: var(--secondary-text-color);
      }
      .stat .value {
        font-size: 13px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .stat .label {
        font-size: 10.5px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .firmware {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }
      .firmware .version {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex: 1 1 100%;
        padding: 0 4px;
        font-size: 12px;
        font-variant-numeric: tabular-nums;
      }
      .firmware .version ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
        color: var(--secondary-text-color);
      }
      .action {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: calc(var(--vivid-chip-height) - 6px);
        padding: 0 12px;
        border-radius: calc(var(--vivid-chip-height) / 2);
        background: var(--vivid-chip-context, var(--vivid-layer-2));
        font-size: 12px;
        font-weight: 600;
      }
      .action ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
      }
      .action.primary {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
        color: var(--primary-color, #03a9f4);
      }
      .action.danger {
        background: rgba(219, 68, 55, 0.2);
        color: var(--error-color, #db4437);
      }
      @media (prefers-reduced-motion: reduce) {
        .tab,
        .tab .chevron,
        .toggle,
        .toggle::after {
          transition: none;
        }
      }
    `];stateOf(e){return e?this.hass?.states[e]:void 0}toggleTab(e){this._tab=this._tab===e?void 0:e}hasSettings(){let e=this.entities??{};return[...ps,...ms,...hs].some(t=>this.stateOf(e[t.role]))}hasDevice(e){return e.signal!==void 0||e.uptime!==void 0||e.firmware!==void 0||e.restartEntity!==void 0}settingsSummary(){let e=this.entities??{},t=this.stateOf(e.preset),n=this.stateOf(e.palette),r=this.stateOf(e.speed),i=[];if(t&&j(t)&&i.push(t.state),this.effectActive&&n&&j(n)&&i.push(n.state),this.effectActive&&r&&j(r)){let e=typeof r.attributes.max==`number`?r.attributes.max:255;i.push(`${B(this.hass,`speed`)} ${Math.round(Number(r.state)/e*100)} %`)}let a=hs.filter(t=>this.stateOf(e[t.role])?.state===`on`).length;return a>0&&i.push(B(this.hass,a===1?`switches_one`:`switches_other`,{count:a})),i.join(` · `)}renderSelect(e){let t=this.entities?.[e.role],n=this.stateOf(t),r=n?.attributes.options;if(!this.hass||!t||!Array.isArray(r)||r.length===0)return D;let i=j(n)&&r.includes(n.state)?n.state:void 0,a=B(this.hass,e.label);return T`<vivid-select-chip
      .icon=${e.icon}
      .value=${i}
      .options=${r}
      .tooltip=${a}
      .placeholder=${a}
      ?disabled=${n?.state===`unavailable`}
      @value-changed=${e=>{this.hass&&ot(this.hass,[t],e.detail.value)}}
    ></vivid-select-chip>`}renderSlider(e){let t=this.entities?.[e.role],n=this.stateOf(t);if(!this.hass||!t||!j(n))return D;let r=n.attributes,i=typeof r.min==`number`?r.min:0,a=typeof r.max==`number`?r.max:255,o=typeof r.step==`number`?r.step:1,s=this._live[t]??Number(n.state);if(!Number.isFinite(s)||a<=i)return D;let c=(s-i)/(a-i),l=B(this.hass,e.label);return T`<label class=${W({range:!0,idle:!this.effectActive})} title=${l}>
      <ha-icon .icon=${e.icon}></ha-icon>
      <input
        type="range"
        aria-label=${l}
        min=${i}
        max=${a}
        step=${o}
        .value=${String(s)}
        style=${`--ratio: ${(c*100).toFixed(1)}%`}
        @input=${e=>{this._live={...this._live,[t]:Number(e.target.value)}}}
        @change=${e=>{this.hass&&ct(this.hass,t,Number(e.target.value))}}
      />
      <span class="value">${Math.round(c*100)} %</span>
    </label>`}renderSwitch(e){let t=this.entities?.[e.role],n=this.stateOf(t);if(!t||!n)return D;let r=n.state===`on`,i=B(this.hass,e.label);return T`<button
      type="button"
      class="reset switch"
      role="switch"
      aria-checked=${String(r)}
      ?disabled=${!j(n)}
      @click=${()=>{this.hass&&(P(this,`light`),et(this.hass,t))}}
    >
      <ha-icon .icon=${e.icon}></ha-icon><span class="label">${i}</span
      ><span class="toggle"></span>
    </button>`}renderSettings(){let e=ps.map(e=>this.renderSelect(e)).filter(e=>e!==D),t=ms.map(e=>this.renderSlider(e)).filter(e=>e!==D),n=hs.map(e=>this.renderSwitch(e)).filter(e=>e!==D);return T`<div class="panel">
      ${e.length?T`<div class="row">${e}</div>`:D} ${t}
      ${t.length&&!this.effectActive?T`<div class="hint">${B(this.hass,`static_effect_hint`)}</div>`:D}
      ${n.length?T`<div class="switches">${n}</div>`:D}
    </div>`}onRestart(e){if(this.hass){if(!this._confirm){this._confirm=!0,window.clearTimeout(this.confirmTimer),this.confirmTimer=window.setTimeout(()=>this._confirm=!1,gs);return}window.clearTimeout(this.confirmTimer),this._confirm=!1,P(this,`warning`),lt(this.hass,e)}}stat(e,t,n,r=``){return n===void 0?D:T`<div class="stat" title=${`${t} : ${n}`}>
      <ha-icon class=${r} .icon=${e}></ha-icon>
      <span class="value ${r}">${n}</span><span class="label">${t}</span>
    </div>`}deviceSummary(e){let t=this.hass,n=e.signal!==void 0&&e.signal<40,r=[];return e.uptime!==void 0&&r.push(pn(t,e.uptime)),e.updateAvailable&&e.latestFirmware&&r.push(B(t,`update_short`,{version:e.latestFirmware})),T`${e.signal===void 0?D:T`<span class=${n?`weak`:``}>${V(t,e.signal)} %</span
            >${r.length?` · `:``}`}${r.join(` · `)}`}renderDevice(e){let t=this.hass,n=e.signal!==void 0&&e.signal<40,r=e.signal===void 0?void 0:`${V(t,e.signal)} %`,i=e.rssi===void 0?B(t,`wifi`):`${B(t,`wifi`)} · ${V(t,e.rssi)} dBm`,a=e.maxCurrent===void 0?void 0:e.maxCurrent>0?`${V(t,e.maxCurrent/1e3,1)} A`:B(t,`limiter_off`);return T`<div class="panel">
      <div class="stats">
        ${this.stat(oa(e.signal),i,r,n?`weak`:``)}
        ${this.stat(`mdi:timer-outline`,B(t,`uptime`),e.uptime===void 0?void 0:pn(t,e.uptime))}
        ${this.stat(`mdi:led-strip-variant`,B(t,`leds`),e.ledCount===void 0?void 0:V(t,e.ledCount))}
        ${this.stat(`mdi:current-dc`,B(t,`current_limit`),a)}
        ${this.stat(`mdi:memory`,B(t,`memory`),e.freeHeap===void 0?void 0:`${V(t,e.freeHeap/1024)} kB`)}
        ${this.stat(`mdi:ip-network-outline`,B(t,`ip`),e.ip)}
      </div>
      <div class="firmware">
        ${e.firmware?T`<span class="version"
                ><ha-icon .icon=${`mdi:chip`}></ha-icon>${B(t,`firmware`)}
                <b>${e.firmware}</b>${e.updateAvailable&&e.latestFirmware?T` → <b>${e.latestFirmware}</b>`:D}</span
              >`:D}
        ${e.updateEntity?T`<button
                type="button"
                class="reset action ${e.updateAvailable?`primary`:``}"
                @click=${()=>N(this,`vivid-more-info`,{entityId:e.updateEntity})}
              >
                <ha-icon
                  .icon=${e.updateAvailable?`mdi:arrow-up-circle`:`mdi:check-circle-outline`}
                ></ha-icon>
                ${B(t,e.updateAvailable?`update`:`up_to_date`)}
              </button>`:D}
        ${e.restartEntity?T`<button
                type="button"
                class="reset action ${this._confirm?`danger`:``}"
                @click=${()=>this.onRestart(e.restartEntity)}
              >
                <ha-icon .icon=${`mdi:restart`}></ha-icon>
                ${B(t,this._confirm?`restart_confirm`:`restart`)}
              </button>`:D}
      </div>
    </div>`}renderTab(e,t,n,r,i=!1){let a=this._tab===e;return T`<button
      type="button"
      class="reset tab"
      aria-expanded=${String(a)}
      @click=${()=>this.toggleTab(e)}
    >
      <ha-icon .icon=${t}></ha-icon>
      <span class="text">
        <span class="title">${n}${i?T`<span class="dot"></span>`:D}</span>
        <span class="sub">${r}</span>
      </span>
      <ha-icon class="chevron" .icon=${`mdi:chevron-down`}></ha-icon>
    </button>`}render(){if(!this.hass||!this.entities)return D;let e=aa(this.hass,this.entities),t=this.settings&&this.hasSettings(),n=this.device&&this.hasDevice(e);if(!t&&!n)return D;let r=this._tab===`settings`&&!t||this._tab===`device`&&!n?void 0:this._tab;return T`<div class="tabs">
        ${t?this.renderTab(`settings`,`mdi:tune-variant`,B(this.hass,`settings`),this.settingsSummary()||B(this.hass,`settings_hint`)):D}
        ${n?this.renderTab(`device`,`mdi:chip`,B(this.hass,`device`),this.deviceSummary(e),e.updateAvailable):D}
      </div>
      ${r===`settings`?this.renderSettings():D}
      ${r===`device`?this.renderDevice(e):D}`}});var _s={wled:`WLED`,adalight:`Adalight`,awa_spi:`AWA SPI`,philipshue:`Hue`,udpraw:`UDP`,udpe131:`E1.31`,udpartnet:`Art-Net`,udph801:`H801`,ws2812spi:`WS2812 SPI`,apa102:`APA102`,file:`File`};function vs(e){let t=e.device;if(t)return[_s[t.type.toLowerCase()]??t.type,t.address].filter(Boolean).join(` · `)}function ys(e,t,n){if(!t.available)return{text:B(e,`unavailable`),tone:`warn`};let r=t.toggles.led_output?.on===!1,i=n.map(n=>{switch(n){case`source`:return t.on?xs(e,t):B(e,`off`);case`device`:return vs(t);case`fps`:{let n=t.ledFps??t.outputFps;return t.on&&n!==void 0?B(e,`hh_fps`,{n:q(e,n,0)}):void 0}case`leds`:return t.ledCount===void 0?void 0:B(e,`hh_leds`,{n:q(e,t.ledCount,0)});case`brightness`:return t.on&&t.brightness!==void 0?`${q(e,t.brightness,0)}\u00a0%`:void 0;default:return}});return t.on&&r&&i.unshift(B(e,`hh_led_output_off`)),{text:As(i).join(` · `)||B(e,t.on?`on`:`off`),tone:t.on&&r?`warn`:`plain`}}function bs(e,t,n,r){if(t.health===`offline`)return{text:B(e,`hh_offline`),tone:`alarm`};let i=n.filter(e=>e.on).length,a=r.map(r=>{switch(r){case`input`:return t.grabber;case`video_mode`:return t.videoMode;case`capture_fps`:return t.captureFps===void 0?void 0:(t.captureFps??0)>0?B(e,`hh_fps`,{n:q(e,t.captureFps,0)}):B(e,`hh_no_signal`);case`temperature`:return t.temperature===void 0?void 0:`${q(e,t.temperature,0)}\u00a0°C`;case`cpu`:return t.cpu===void 0?void 0:`${B(e,`hh_cpu`)} ${q(e,t.cpu,0)}\u00a0%`;case`memory`:return t.memory===void 0?void 0:`${B(e,`hh_ram`)} ${q(e,t.memory,0)}\u00a0%`;case`version`:return t.version;case`strips`:return n.length===0?void 0:i===0?B(e,`hh_strips_none`):i===1?B(e,`hh_strips_one`):B(e,`hh_strips_other`,{count:i});default:return}}),o=`plain`;return t.undervoltage?(a.unshift(B(e,`hh_undervoltage_detected`)),o=`alarm`):(t.temperature??0)>=70&&(a.unshift(B(e,`hh_hot`)),o=t.health===`alarm`?`alarm`:`warn`),{text:As(a).join(` · `)||t.name,tone:o}}function xs(e,t){switch(t.source){case`capture`:return B(e,`hh_capture`);case`effect`:return t.effect??B(e,`hh_effect`);case`color`:return B(e,`hh_color`);case`none`:return B(e,`hh_none`);default:return B(e,`hh_other`)}}function Ss(e,t){return t.available?t.on?[xs(e,t),vs(t),t.brightness===void 0?void 0:`${q(e,t.brightness,0)}\u00a0%`,t.outputFps===void 0?void 0:B(e,`hh_fps`,{n:q(e,t.outputFps,0)})].filter(Boolean).join(` · `):B(e,`off`):B(e,`unavailable`)}function Cs(e,t,n){if(t.health===`offline`)return{text:B(e,`hh_offline`),tone:`alarm`};if(t.undervoltage)return{text:B(e,`hh_undervoltage_detected`),tone:`alarm`};if((t.temperature??0)>=70)return{text:B(e,`hh_hot`),tone:t.health===`alarm`?`alarm`:`warn`};let r=n.filter(e=>e.on).length,i=n.length===0?void 0:r===0?B(e,`hh_strips_none`):r===1?B(e,`hh_strips_one`):B(e,`hh_strips_other`,{count:r});return{text:[t.version,i].filter(Boolean).join(` · `),tone:`plain`}}function ws(e){return e===void 0?Tr:e>=80?Dr:e>=70?Er:Tr}function Ts(e,t,n){let r=e?.states[t];if(r&&e?.formatEntityState)try{return e.formatEntityState(r,n)}catch{}return n}function Es(e,t,n=.85,r=``){let i=t?L(t,n):void 0;return T`<span
    class="disc ${r}"
    style=${k({"--disc-bg":i?.background,"--disc-shadow":i?.shadow,"--disc-color":i?.iconColor})}
    ><ha-icon .icon=${e}></ha-icon
  ></span>`}function Ds(e,t){if(!t||!e?.length)return{};let n=e[0],r=e[e.length-1]??n;return{"--power-bg":`linear-gradient(90deg, ${I(n)}, ${I(r)})`,"--power-shadow":Xt([n,r],.9),"--power-color":`#fff`}}function Os(e,t,n={}){let{rgb:r,on:i=!1,disabled:a=!1,onClick:o,caret:s=!1}=n,c=i&&r?r:void 0;return T`<button
    type="button"
    class=${W({reset:!0,chip:!0,on:!!c})}
    style=${k({"--chip-rgb":c?c.join(`, `):void 0})}
    title=${n.title??t}
    aria-pressed=${o&&!s?i?`true`:`false`:D}
    ?disabled=${a}
    @click=${o}
  >
    <ha-icon .icon=${e}></ha-icon><span>${t}</span>${s?T`<ha-icon class="caret" icon="mdi:chevron-down"></ha-icon>`:D}
  </button>`}var ks=o`
  .disc {
    position: relative;
    display: grid;
    place-items: center;
    flex: none;
    --vivid-glow-size: ${a(At(40))};
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--disc-bg, var(--vivid-layer-2));
    box-shadow: var(--disc-shadow, none);
    color: var(--disc-color, var(--secondary-text-color));
    transition:
      background 0.4s ease,
      box-shadow 0.4s ease,
      color 0.4s ease;
  }
  .disc ha-icon {
    --mdc-icon-size: 22px;
    display: inline-flex;
  }
  .disc.small {
    --vivid-glow-size: ${a(At(34))};
    width: 34px;
    height: 34px;
  }
  .disc.small ha-icon {
    --mdc-icon-size: 19px;
  }
  .names {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-width: 0;
    text-align: left;
  }
  .name {
    font-size: 15px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .status {
    font-size: 12px;
    color: var(--secondary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .status.alarm {
    color: var(--error-color, #ef5350);
    font-weight: 600;
  }
  .status.warn {
    color: var(--warning-color, #f9a825);
    font-weight: 600;
  }
  .power {
    display: grid;
    place-items: center;
    flex: none;
    width: 52px;
    height: 36px;
    border-radius: 18px;
    background: var(--power-bg, var(--vivid-layer-2));
    box-shadow: var(--power-shadow, none);
    color: var(--power-color, var(--secondary-text-color));
    transition:
      background 0.4s ease,
      box-shadow 0.4s ease;
  }
  .power ha-icon {
    --mdc-icon-size: 20px;
    display: inline-flex;
  }
  .power:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 32px;
    padding: 0 10px 0 7px;
    box-sizing: border-box;
    border-radius: 16px;
    background: var(--vivid-layer-2);
    font-size: 12.5px;
    font-weight: 500;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    transition:
      background 0.2s ease,
      box-shadow 0.2s ease;
  }
  .chip ha-icon {
    --mdc-icon-size: 17px;
    display: inline-flex;
    color: var(--secondary-text-color);
  }
  .chip .caret {
    --mdc-icon-size: 15px;
    margin: 0 -3px 0 -2px;
  }
  .chip.on {
    background: color-mix(in srgb, rgb(var(--chip-rgb)) 16%, var(--vivid-layer-2));
    box-shadow: inset 0 0 0 1px rgba(var(--chip-rgb), 0.45);
  }
  .chip.on ha-icon {
    color: rgb(var(--chip-rgb));
  }
  .chip:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .chip.static {
    cursor: default;
  }
  .chip small {
    color: var(--secondary-text-color);
    font-weight: 400;
  }
  /* A wide slider: the fill is the value, the native range input on top. */
  .bar {
    position: relative;
    display: block;
    height: 36px;
    border-radius: 18px;
    background: var(--vivid-layer-2);
    overflow: hidden;
  }
  .bar .fill {
    position: absolute;
    inset: 0 auto 0 0;
    width: var(--value, 50%);
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--bar-color, var(--primary-color)) 45%, transparent),
      var(--bar-color, var(--primary-color))
    );
    transition: width 0.15s ease;
  }
  .bar .knob {
    position: absolute;
    top: 7px;
    bottom: 7px;
    width: 4px;
    border-radius: 2px;
    background: #fff;
    left: max(10px, calc(var(--value, 50%) - 12px));
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.35);
  }
  .bar .text {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    font-size: 13px;
    font-weight: 600;
    pointer-events: none;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }
  .bar .text ha-icon {
    --mdc-icon-size: 18px;
  }
  .bar input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;
    touch-action: pan-y;
  }
  .bar.disabled {
    opacity: 0.5;
  }
  .bar.disabled input {
    cursor: default;
  }
`;function As(e){return e.filter(e=>!!e).map(e=>e.replace(/ /g,`\xA0`))}z(`vivid-hyperhdr-slider`,class extends O{static properties={value:{type:Number},min:{type:Number},max:{type:Number},step:{type:Number},icon:{},label:{},unit:{},digits:{type:Number},color:{},disabled:{type:Boolean},dragging:{state:!0}};sent;constructor(){super(),this.min=0,this.max=100,this.step=1,this.unit=``,this.digits=0,this.disabled=!1}static styles=[H,ks,o`
      :host {
        display: block;
      }
      .stack {
        display: flex;
        flex-direction: column;
        gap: 9px;
        padding: 10px 14px 13px;
        border-radius: 16px;
        background: var(--vivid-layer-1);
      }
      .stack.disabled {
        opacity: 0.5;
      }
      .top {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 13px;
      }
      .top b {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .track {
        position: relative;
        display: block;
        height: 8px;
        border-radius: 4px;
        background: rgba(var(--vivid-rgb-text), 0.1);
      }
      .track .fill {
        position: absolute;
        inset: 0 auto 0 0;
        width: var(--value, 50%);
        border-radius: 4px;
        background: var(--bar-color, var(--primary-color));
      }
      .track .thumb {
        position: absolute;
        top: 50%;
        left: var(--value, 50%);
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #fff;
        transform: translate(-50%, -50%);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
      }
      .track input {
        position: absolute;
        inset: -10px 0;
        width: 100%;
        height: calc(100% + 20px);
        margin: 0;
        opacity: 0;
        cursor: pointer;
        touch-action: pan-y;
      }
    `];willUpdate(e){e.has(`value`)&&this.sent&&this.value!==void 0&&(Math.abs(this.value-this.sent.value)<this.step/2||Date.now()-this.sent.at>4e3)&&(this.sent=void 0)}onInput=e=>{this.dragging=Number(e.target.value)};onChange=e=>{let t=Number(e.target.value);this.dragging=void 0,this.sent={value:t,at:Date.now()},N(this,`vivid-slider-change`,{value:t})};render(){let e=this.dragging??this.sent?.value??this.value,t=e===void 0?0:F((e-this.min)/Math.max(this.max-this.min,1e-9),0,1),n=e===void 0?`—`:`${e.toFixed(this.digits)}${this.unit?`\u00a0${this.unit}`:``}`,r=T`<input
      type="range"
      aria-label=${this.label??``}
      .min=${String(this.min)}
      .max=${String(this.max)}
      .step=${String(this.step)}
      .value=${String(e??this.min)}
      ?disabled=${this.disabled}
      @input=${this.onInput}
      @change=${this.onChange}
    />`,i=k({"--value":`${(t*100).toFixed(2)}%`,"--bar-color":this.color});return this.label&&!this.icon?T`<div class=${W({stack:!0,disabled:this.disabled})} style=${i}>
        <div class="top"><span>${this.label}</span><b>${n}</b></div>
        <label class="track"><span class="fill"></span><span class="thumb"></span>${r}</label>
      </div>`:T`<label class=${W({bar:!0,disabled:this.disabled})} style=${i}>
      <span class="fill"></span>${t>.3?T`<span class="knob"></span>`:D}
      <span class="text"
        >${this.icon?T`<ha-icon .icon=${this.icon}></ha-icon>`:D}${this.label?`${this.label} `:``}${n}</span
      >
      ${r}
    </label>`}});var js=[{id:`overview`,icon:`mdi:view-dashboard-outline`,label:`hh_tab_overview`},{id:`colors`,icon:`mdi:palette-outline`,label:`hh_tab_colors`},{id:`processing`,icon:`mdi:tune-variant`,label:`hh_tab_processing`},{id:`system`,icon:`mdi:raspberry-pi`,label:`hh_tab_system`}],Ms=[[255,138,61],[255,214,170],[255,255,255],[239,83,80],[236,64,122],[171,71,188],[92,107,192],[38,198,218],[102,187,106]];z(`vivid-hyperhdr-details`,class extends O{static properties={hass:{attribute:!1},hub:{attribute:!1},instance:{attribute:!1},instances:{attribute:!1},sampled:{attribute:!1},initialTab:{attribute:!1},pictureTimeout:{attribute:!1},tab:{state:!0},picking:{state:!0}};constructor(){super(),this.pictureTimeout=120,this.instances=[],this.tab=`overview`}willUpdate(e){e.has(`initialTab`)&&this.initialTab&&(this.tab=this.initialTab,this.picking=void 0)}static styles=[H,U,ks,o`
      :host {
        display: flex;
        flex-direction: column;
        gap: 12px;
        --vivid-layer-2: color-mix(in srgb, var(--vivid-layer-0) 45%, var(--vivid-layer-1));
      }
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 4px;
      }
      .head .name {
        font-size: 18px;
      }
      .head .status {
        font-size: 13px;
      }
      .tabs {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 4px;
      }
      .tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 7px 2px;
        border-radius: 14px;
        background: var(--vivid-layer-1);
        color: var(--secondary-text-color);
        font-size: 12px;
        font-weight: 500;
      }
      .tab ha-icon {
        --mdc-icon-size: 17px;
      }
      .tab[aria-selected='true'] {
        background: rgba(var(--vivid-rgb-text), 0.14);
        color: var(--primary-text-color);
        font-weight: 600;
      }
      .pane {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .label {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 8px;
        margin-top: 4px;
        padding: 0 4px;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--secondary-text-color);
      }
      .label em {
        font-style: normal;
        font-weight: 500;
        letter-spacing: 0;
        text-transform: none;
      }
      .sources {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px;
      }
      .source {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        padding: 10px 4px 9px;
        border-radius: 16px;
        background: var(--vivid-layer-1);
        font-size: 13px;
        font-weight: 600;
        min-width: 0;
      }
      .source small {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 11.5px;
        font-weight: 400;
        color: var(--secondary-text-color);
      }
      .source.on {
        background: color-mix(in srgb, rgb(var(--src-rgb)) 14%, var(--vivid-layer-1));
        box-shadow: inset 0 0 0 1.5px rgba(var(--src-rgb), 0.7);
        color: color-mix(in srgb, rgb(var(--src-rgb)) 60%, var(--primary-text-color));
      }
      .source:disabled {
        opacity: 0.5;
        cursor: default;
      }
      .pick {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 8px;
        border-radius: 16px;
        background: var(--vivid-layer-1);
        max-height: 172px;
        overflow-y: auto;
      }
      .pick .chip {
        background: var(--vivid-layer-2);
      }
      .swatch {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--swatch);
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
      }
      .swatch.on {
        box-shadow:
          0 0 0 2px var(--vivid-layer-1),
          0 0 0 4px var(--primary-text-color);
      }
      .sliders {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 8px;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 46px;
        padding: 5px 8px 5px 6px;
        box-sizing: border-box;
        border-radius: 16px;
        background: var(--vivid-layer-1);
        font-size: 13.5px;
        text-align: left;
        width: 100%;
      }
      .row .disc {
        --vivid-glow-size: 32px;
        width: 32px;
        height: 32px;
        background: var(--disc-bg, var(--vivid-layer-2));
      }
      .row .disc ha-icon {
        --mdc-icon-size: 17px;
      }
      .row .names .name {
        font-size: 13.5px;
        font-weight: 500;
      }
      .switch {
        position: relative;
        flex: none;
        width: 40px;
        height: 24px;
        border-radius: 12px;
        background: rgba(var(--vivid-rgb-text), 0.18);
        transition: background-color 0.2s ease;
      }
      .switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-text-color);
        opacity: 0.85;
        transition: transform 0.2s ease;
      }
      .switch.on {
        background: var(--success-color, #66bb6a);
      }
      .switch.on::after {
        transform: translateX(16px);
        background: #fff;
        opacity: 1;
      }
      .options {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .option {
        height: 30px;
        padding: 0 12px;
        border-radius: 15px;
        background: var(--vivid-layer-1);
        color: var(--secondary-text-color);
        font-size: 12.5px;
      }
      .option[aria-pressed='true'] {
        background: rgba(var(--vivid-rgb-text), 0.16);
        color: var(--primary-text-color);
        font-weight: 600;
      }
      .group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .hint {
        padding: 10px 12px;
        border-radius: 14px;
        background: var(--vivid-layer-1);
        font-size: 12.5px;
        color: var(--secondary-text-color);
      }
      .strip-row .power {
        width: 48px;
        height: 32px;
      }
    `];state(e){let t=this.instance?.entities[e]??this.hub?.entities[e];return t?this.hass?.states[t]:void 0}call(e){let t=this.hass;t&&(P(this,`light`),e(t))}color(){let e=this.instance;if(!e)return Tr;let t=this.sampled;return jr(e,t?.length?t.reduce((e,[t,n,r])=>[e[0]+t,e[1]+n,e[2]+r],[0,0,0]).map(e=>Math.round(e/t.length)):void 0)}slider(e,t,n,r={}){let i=this.state(e);if(!i)return D;let a=i.attributes,o=typeof a.step==`number`?a.step:1,s=r.digits??(o<.1?2:+(o<1)),c=Number.parseFloat(i.state);return T`<vivid-hyperhdr-slider
      .value=${Number.isFinite(c)?c:void 0}
      .min=${typeof a.min==`number`?a.min:0}
      .max=${typeof a.max==`number`?a.max:100}
      .step=${o}
      .digits=${s}
      .label=${B(this.hass,t)}
      .unit=${r.unit??(typeof a.unit_of_measurement==`string`?a.unit_of_measurement:``)}
      .color=${I(n)}
      ?disabled=${!j(i)}
      @vivid-slider-change=${e=>this.call(t=>ct(t,i.entity_id,e.detail.value))}
    ></vivid-hyperhdr-slider>`}options(e,t){let n=this.state(e),r=n?.attributes.options;return!n||!Array.isArray(r)||!r.length?D:T`<div class="group">
      <div class="label">${B(this.hass,t)}</div>
      <div class="options">
        ${r.map(e=>T`<button
              type="button"
              class="reset option"
              aria-pressed=${n.state===e?`true`:`false`}
              ?disabled=${!j(n)}
              @click=${()=>this.call(t=>ot(t,[n.entity_id],e))}
            >
              ${Ts(this.hass,n.entity_id,e)}
            </button>`)}
      </div>
    </div>`}switchRow(e){let t=this.instance,n=t?.toggles[e.key];return!t||!n?D:this.rowOf(e.icon,B(this.hass,e.label),e.detail?.(t),n.on,e.rgb,n.available,n.entity)}rowOf(e,t,n,r,i,a,o){return T`<button
      type="button"
      class="reset row"
      role="switch"
      aria-checked=${r?`true`:`false`}
      ?disabled=${!a}
      @click=${()=>this.call(e=>et(e,o))}
    >
      ${Es(e,r?i:void 0,.7)}
      <span class="names"
        ><span class="name">${t}</span
        >${n?T`<span class="status">${n}</span>`:D}</span
      >
      <span class=${W({switch:!0,on:r})}></span>
    </button>`}renderHead(){let e=this.hass,t=this.instance,n=this.hub;if(t){let n=this.color(),r=[Ss(e,t),t.ledCount?B(e,`hh_leds`,{n:t.ledCount}):void 0].filter(Boolean),i=this.sampled,a=t.source===`capture`&&i?.length?Ar(i):[n,n.map(e=>Math.round(e*.7))];return T`<div class="head">
        ${Es(`mdi:television-ambient-light`,t.on?n:void 0,.85)}
        <span class="names"
          ><span class="name">${t.name}</span
          ><span class="status">${r.join(` · `)}</span></span
        >
        <button
          type="button"
          class="reset power"
          role="switch"
          aria-checked=${t.on?`true`:`false`}
          aria-label=${B(e,t.on?`power_off`:`power_on`)}
          ?disabled=${!t.available}
          style=${k(Ds(a,t.on))}
          @click=${()=>this.call(e=>et(e,t.light))}
        >
          <ha-icon icon="mdi:power"></ha-icon>
        </button>
      </div>`}if(!n)return D;let r=Cs(e,n,this.instances);return T`<div class="head">
      ${Es(_r(n),Mr(n.health),.85)}
      <span class="names"
        ><span class="name">${n.name}</span
        ><span class=${W({status:!0,[r.tone]:!0})}>${r.text}</span></span
      >
    </div>`}renderTabs(){return this.instance?T`<div class="tabs" role="tablist">
      ${js.map(e=>T`<button
            type="button"
            class="reset tab"
            role="tab"
            aria-selected=${this.tab===e.id?`true`:`false`}
            @click=${()=>{this.tab=e.id}}
          >
            <ha-icon
              .icon=${e.id===`system`&&this.hub?_r(this.hub):e.icon}
            ></ha-icon
            >${B(this.hass,e.label)}
          </button>`)}
    </div>`:D}sourceTile(e,t,n,r,i,a){let o=this.instance,s=!!o?.on&&o.source===e;return T`<button
      type="button"
      class=${W({reset:!0,source:!0,on:s})}
      style=${k({"--src-rgb":i.join(`, `)})}
      aria-pressed=${s?`true`:`false`}
      ?disabled=${!o?.available}
      @click=${a}
    >
      ${Es(t,s?i:void 0,.75,`small`)}${B(this.hass,n)}<small
        >${r??`\xA0`}</small
      >
    </button>`}renderOverview(e){let t=this.hass,n=this.hub,r=this.color(),i=n?.camera??e.ledCamera,a=this.state(`select.source`),o=a&&a.state!==`auto`&&j(a),s=this.state(`number.brightness_gain`),c=Cr(e.effect),l=e.color??[255,138,61];return T`<div class="pane">
      ${i?T`<vivid-hyperhdr-screen
              onDemand
              .timeout=${this.pictureTimeout}
              .labels=${{show:B(t,`hh_show_screen`),extend:B(t,`hh_extend`),stop:B(t,`hh_stop`),live:B(t,`hh_live`),ended:B(t,`hh_screen_ended`)}}
              .hass=${t}
              .camera=${i}
              .fallback=${Ti(e.on?r:[70,70,70])}
              .tags=${[B(t,`hh_live`),e.toggles.hdr?.on?B(t,`hh_hdr`):void 0]}
            ></vivid-hyperhdr-screen>`:T`<div class="hint">${B(t,`hh_no_picture`)}</div>`}
      <div class="label">
        ${B(t,`hh_source`)}<em
          >${o?B(t,`hh_source_forced`,{source:Ts(t,a.entity_id,a.state)}):B(t,`hh_source_auto`)}</em
        >
      </div>
      <div class="sources">
        ${this.sourceTile(`capture`,`mdi:video-input-hdmi`,`hh_capture`,void 0,Or,()=>{this.picking=void 0,this.call(t=>at(t,e.light,sr))})}
        ${this.sourceTile(`effect`,`mdi:creation`,`hh_effect`,e.source===`effect`?e.effect:void 0,c,()=>{this.picking=this.picking===`effect`?void 0:`effect`})}
        ${this.sourceTile(`color`,`mdi:palette`,`hh_color`,void 0,l,()=>{this.picking=this.picking===`color`?void 0:`color`})}
      </div>
      ${this.picking===`effect`?this.renderEffects(e):D}
      ${this.picking===`color`?this.renderSwatches(e):D}
      ${a&&Array.isArray(a.attributes.options)&&a.attributes.options.length>1?this.options(`select.source`,`hh_source`):D}
      <vivid-hyperhdr-slider
        .value=${e.brightness}
        .min=${0}
        .max=${typeof s?.attributes.max==`number`?s.attributes.max:100}
        icon="mdi:brightness-6"
        .label=${B(t,`brightness`)}
        unit="%"
        .color=${I(e.on?r:[120,120,120])}
        ?disabled=${!e.available}
        @vivid-slider-change=${t=>this.call(n=>s?ct(n,s.entity_id,t.detail.value):nt(n,e.light,t.detail.value))}
      ></vivid-hyperhdr-slider>
    </div>`}renderEffects(e){return T`<div class="pick">
      ${e.effects.map(t=>Os(`mdi:creation`,t,{on:e.source===`effect`&&e.effect===t,rgb:Cr(t),onClick:()=>this.call(n=>at(n,e.light,t))}))}
    </div>`}renderSwatches(e){let t=e.source===`color`?e.color:void 0;return T`<div class="pick">
      ${Ms.map(n=>T`<button
            type="button"
            class=${W({reset:!0,swatch:!0,on:!!t&&t.every((e,t)=>Math.abs(e-(n[t]??0))<6)})}
            style=${k({"--swatch":I(n)})}
            aria-label=${I(n)}
            @click=${()=>this.call(t=>it(t,e.light,{rgb:n}))}
          ></button>`)}
      ${Os(`mdi:palette`,B(this.hass,`hh_open_more`),{onClick:()=>N(this,`vivid-more-info`,{entityId:e.light})})}
    </div>`}renderColors(){let e=this.state(`number.saturation_gain`)||this.state(`number.gamma`)||this.state(`select.color_temperature`);return T`<div class="pane">
      <div class="sliders">
        ${this.slider(`number.saturation_gain`,`hh_saturation`,[186,104,200])}
        ${this.slider(`number.gamma`,`hh_gamma`,Or)}
        ${this.slider(`number.backlight`,`hh_backlight`,[144,164,174])}
      </div>
      ${this.options(`select.color_temperature`,`hh_color_temp`)}
      ${this.options(`select.processing`,`hh_processing`)}
      ${e?D:T`<div class="hint">${B(this.hass,`hh_admin_hint`)}</div>`}
    </div>`}renderProcessing(){let e=this.hass,t=this.state(`number.smoothing_time`),n=this.state(`select.smoothing_type`),r=this.state(`select.blackborder_mode`);return T`<div class="pane">
      <div class="group">${[{key:`smoothing`,icon:`mdi:waveform`,label:`hh_smoothing`,rgb:[186,104,200],detail:()=>[t&&j(t)?`${t.state}\u00a0ms`:void 0,n&&j(n)?Ts(e,n.entity_id,n.state):void 0].filter(Boolean).join(` · `)||void 0},{key:`black_border`,icon:`mdi:border-none-variant`,label:`hh_black_border_long`,rgb:Or,detail:()=>r&&j(r)?Ts(e,r.entity_id,r.state):void 0},{key:`hdr`,icon:`mdi:hdr`,label:`hh_tone_mapping`,rgb:[255,213,79]},{key:`auto_tone_mapping`,icon:`mdi:auto-fix`,label:`hh_auto_tone`,rgb:[255,213,79]},{key:`continuous_output`,icon:`mdi:repeat`,label:`hh_continuous`,rgb:Tr},{key:`anti_flickering`,icon:`mdi:filter-outline`,label:`hh_anti_flicker`,rgb:Tr},{key:`background_effect`,icon:`mdi:wallpaper`,label:`hh_background`,rgb:[126,87,194]},{key:`boot_effect`,icon:`mdi:play-box-outline`,label:`hh_boot`,rgb:[126,87,194]}].map(e=>this.switchRow(e))}</div>
      ${this.slider(`number.smoothing_time`,`hh_smoothing_time`,[186,104,200],{digits:0})}
      ${this.options(`select.smoothing_type`,`hh_smoothing_type`)}
      ${this.slider(`number.blackborder_threshold`,`hh_black_border_long`,Or)}
      ${this.options(`select.blackborder_mode`,`hh_black_border_mode`)}
      ${n?D:T`<div class="hint">${B(e,`hh_admin_hint`)}</div>`}
    </div>`}badge(e,t,n){return Os(e,t,{on:!!n,rgb:n})}renderSystem(){let e=this.hass,t=this.hub,n=this.instance;if(!t)return D;let r=(t.captureFps??0)>0,i=[t.grabber,t.videoMode].filter(Boolean).join(` · `),a=[t.temperature===void 0?D:this.badge(`mdi:thermometer`,`${q(e,t.temperature,1)}\u00a0°C`,ws(t.temperature)),t.cpu===void 0?D:this.badge(`mdi:cpu-64-bit`,`${B(e,`hh_cpu`)} ${q(e,t.cpu,0)}\u00a0%`),t.memory===void 0?D:this.badge(`mdi:memory`,`${B(e,`hh_ram`)} ${q(e,t.memory,0)}\u00a0%`),t.undervoltage===void 0?D:this.badge(t.undervoltage?`mdi:flash-alert`:`mdi:flash`,B(e,t.undervoltage?`hh_undervoltage`:`hh_power_ok`),t.undervoltage?Dr:Tr)],o=n?.toggles.video_capture,s=n?.toggles.led_output;return T`<div class="pane">
      ${n?T`<div class="head" style="padding: 0 2px">
              ${Es(_r(t),Mr(t.health),.8,`small`)}
              <span class="names"
                ><span class="name" style="font-size: 15px">${t.name}</span
                ><span class="status">${Cs(e,t,this.instances).text}</span></span
              >
            </div>`:D}
      <div class="chips">${a}</div>
      ${i?T`<div class="row">
              ${Es(`mdi:video-input-hdmi`,r?Or:void 0,.6)}
              <span class="names"
                ><span class="name">${B(e,`hh_grabber`)} · ${i}</span
                ><span class="status"
                  >${[B(e,r?`hh_signal`:`hh_no_signal`),t.captureFps===void 0?void 0:B(e,`hh_fps`,{n:q(e,t.captureFps,0)})].filter(Boolean).join(` · `)}</span
                ></span
              >
            </div>`:D}
      ${o?this.rowOf(`mdi:video-input-hdmi`,B(e,`hh_capture_switch`),void 0,o.on,Or,o.available,o.entity):D}
      ${s?this.rowOf(`mdi:led-strip-variant`,B(e,`hh_led_output`),void 0,s.on,Tr,s.available,s.entity):D}
      ${n?D:this.renderStrips()}
      ${t.version?T`<div class="row">
              ${Es(`mdi:information-outline`,void 0)}
              <span class="names"
                ><span class="name">${B(e,`hh_version`)} ${t.version}</span
                >${t.architecture?T`<span class="status">${t.architecture}</span>`:D}</span
              >
            </div>`:D}
    </div>`}renderStrips(){if(!this.instances.length)return D;let e=this.hass;return T`<div class="label">${B(e,`hh_strips`)}</div>
      <div class="group">
        ${this.instances.map(t=>{let n=jr(t);return T`<div class="row strip-row">
            <button
              type="button"
              class="reset"
              style="display: flex; align-items: center; gap: 10px; flex: 1 1 auto; min-width: 0; text-align: left"
              @click=${()=>N(this,`vivid-hyperhdr-open`,{instance:t.deviceId})}
            >
              ${Es(`mdi:television-ambient-light`,t.on?n:void 0,.75)}
              <span class="names"
                ><span class="name">${t.name}</span
                ><span class="status">${Ss(e,t)}</span></span
              >
            </button>
            <button
              type="button"
              class="reset power"
              role="switch"
              aria-checked=${t.on?`true`:`false`}
              aria-label=${B(e,t.on?`power_off`:`power_on`)}
              ?disabled=${!t.available}
              style=${k(Ds([n,n.map(e=>Math.round(e*.7))],t.on))}
              @click=${()=>this.call(e=>et(e,t.light))}
            >
              <ha-icon icon="mdi:power"></ha-icon>
            </button>
          </div>`})}
      </div>`}render(){let e=this.instance,t=e?this.tab:`system`;return T`${this.renderHead()}${this.renderTabs()}${t===`overview`&&e?this.renderOverview(e):t===`colors`?this.renderColors():t===`processing`?this.renderProcessing():this.renderSystem()}`}}),z(`vivid-led-group-details`,class extends O{static properties={hass:{attribute:!1},model:{attribute:!1},config:{attribute:!1},side:{attribute:!1},box:{attribute:!1},phases:{attribute:!1},hyperhdrInstance:{state:!0},tab:{state:!0}};constructor(){super(),this.phases={},this.tab=`leds`}static styles=[H,o`
      :host {
        display: flex;
        flex-direction: column;
        gap: 18px;
        container-type: inline-size;
      }
      .summary {
        padding: 4px 0 2px;
      }
      .tabs {
        display: flex;
        gap: 4px;
        padding: 4px;
        border-radius: 16px;
        background: var(--vivid-layer-1);
      }
      .tabs button {
        appearance: none;
        border: none;
        margin: 0;
        font: inherit;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        flex: 1;
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 6px;
        border-radius: 12px;
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 13.5px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tabs button ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        flex: none;
      }
      .tabs button[aria-selected='true'] {
        background: var(--vivid-layer-2);
        color: var(--primary-text-color);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }
      .tabs button:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      /*
       * One column keeps the group order; two columns (wide dialogs) take every
       * other strip, so opening a device panel never moves a strip across.
       */
      .columns {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .column {
        display: contents;
      }
      section {
        order: var(--order, 0);
      }
      @container (min-width: 760px) {
        .columns {
          flex-direction: row;
          align-items: flex-start;
          gap: 20px;
        }
        .column {
          display: flex;
          flex-direction: column;
          gap: 18px;
          flex: 1;
          min-width: 0;
        }
      }
      section {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }
      .device {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-top: 6px;
      }
      .device h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        padding: 0 4px;
        font-size: 15px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .device h3 ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
      }
      .back {
        appearance: none;
        border: none;
        margin: 0 0 0 auto;
        padding: 4px 10px;
        border-radius: 14px;
        background: var(--vivid-layer-1);
        color: var(--primary-text-color);
        font: inherit;
        font-size: 12.5px;
        cursor: pointer;
      }
      .back:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .extras {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 8px;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
        --vivid-chip-context: var(--vivid-layer-2);
      }
    `];onTileGesture=e=>{e.stopPropagation();let{gesture:t,entityId:n}=e.detail;n&&this.hass&&(t===`tap`?et(this.hass,n,{transition:this.config?.members.get(n)?.transition??this.config?.tile.transition}):t===`hold`&&N(this,`vivid-more-info`,{entityId:n}))};get lightOptions(){return{transition:this.config?.tile.transition}}stripOptions(e){return{transition:this.config?.members.get(e.entityId)?.transition??this.config?.tile.transition}}historySources(e){return e.detected.flatMap(e=>{let t=e.power;if(!t)return[];let n=this.hass?.states[t.entityId]?.attributes.unit_of_measurement,r=t.kind===`current`?t.voltage/1e3:n===`kW`?1e3:1;return[{entityId:t.entityId,factor:r,name:e.name}]})}renderHistory(e,t){return!t.details.history||!t.power.enabled||!e.hasPower?D:T`<vivid-power-history
      .hass=${this.hass}
      .sources=${this.historySources(e)}
      .price=${e.price}
      .currency=${t.power.currency}
    ></vivid-power-history>`}renderExtras(e,t){return!e.wled||!e.available||!t.details.wledControls&&!t.details.health?D:T`<vivid-wled-panel
      class="extras"
      .hass=${this.hass}
      .entities=${e.wledEntities}
      .effectActive=${e.effectActive}
      .settings=${t.details.wledControls}
      .device=${t.details.health}
    ></vivid-wled-panel>`}renderStrip(e,t,n){let r=e.ambilight&&e.liveOverride?{available:e.liveOverride.available?[e.liveOverride.entityId]:[],active:e.liveOverride.active}:void 0;return T`<section style=${`--order: ${n}`}>
      <vivid-light-header
        .hass=${this.hass}
        .icon=${e.icon}
        .name=${e.name}
        .lightEntity=${e.entityId}
        .available=${e.available}
        .isOn=${e.isOn}
        .rgb=${e.rgb}
        .brightness=${e.brightness}
        .glowBoost=${t.appearance.glowBoost}
        .showPower=${t.power.enabled}
        .hasPower=${e.power!==void 0}
        .watts=${e.watts}
        .scale=${e.scale}
        .lightOptions=${this.stripOptions(e)}
        .powerEntity=${e.power?.entityId}
        .showLiveOverride=${t.ambilight.enabled}
        .liveOverride=${r}
      ></vivid-light-header>
      <vivid-light-tile
        .hass=${this.hass}
        .entityId=${e.entityId}
        .icon=${e.icon}
        .name=${e.name}
        .showEffects=${t.details.effects}
        .showState=${t.tile.state!==`none`}
        .colorBar=${wn(t.details.colorBar,this.hass?.states[e.entityId])}
        .saturationBar=${t.details.saturationBar}
        .favorites=${t.details.favorites&&e.available?t.tile.favorites:[]}
        .brightnessMin=${t.tile.brightnessMin}
        .brightnessStep=${t.tile.brightnessStep}
        .lightOptions=${this.stripOptions(e)}
        .animateEffects=${t.appearance.animateEffects}
        @vivid-gesture=${this.onTileGesture}
      ></vivid-light-tile>
      ${this.renderExtras(e,t)}
    </section>`}renderLeds(e,t){let n=[0,1].map(t=>e.members.map((e,t)=>({strip:e,order:t})).filter(({order:e})=>e%2===t));return T`${t.details.summary?this.renderSummary(e,t):D}
      ${this.renderHistory(e,t)}
      <div class="columns">
        ${n.map(e=>T`<div class="column">
              ${Ko(e,({strip:e})=>e.entityId,({strip:e,order:n})=>this.renderStrip(e,t,n))}
            </div>`)}
      </div>`}renderTabs(e){return T`<div class="tabs" role="tablist">
      ${e.map(e=>T`<button
            type="button"
            role="tab"
            aria-selected=${String(this.tab===e.key)}
            @click=${()=>{this.tab=e.key}}
          >
            <ha-icon .icon=${e.icon}></ha-icon>${e.label}
          </button>`)}
    </div>`}render(){let e=this.model,t=this.config;if(!e||!t)return D;let n=!!(this.side&&(this.box??this.side.box)),r=!!this.side?.hyperhdr.hub;if(!n&&!r)return this.renderLeds(e,t);let i=[{key:`leds`,icon:`mdi:led-strip-variant`,label:B(this.hass,`led_tab_leds`)},...n?[{key:`manager`,icon:`mdi:television-ambient-light`,label:B(this.hass,`led_tab_manager`)}]:[],...r?[{key:`hyperhdr`,icon:`mdi:television-shimmer`,label:B(this.hass,`led_tab_hyperhdr`)}]:[]],a=i.some(e=>e.key===this.tab)?this.tab:`leds`;return T`${this.renderTabs(i)}
    ${a===`manager`?this.renderBox():a===`hyperhdr`?this.renderHyperHdr():this.renderLeds(e,t)}`}renderBox(){let e=this.side,t=this.box??e?.box;return!e||!t?D:T`<section class="device">
      <vivid-ambilight-details
        .hass=${this.hass}
        .model=${t}
        .config=${e.boxConfig}
        .phases=${this.phases}
      ></vivid-ambilight-details>
    </section>`}renderHyperHdr(){let e=this.side?.hyperhdr;if(!e?.hub)return D;let t=/* @__PURE__ */ new Map;for(let n of this.model?.detected??[]){let r=e.byStrip.get(n.entityId);r&&t.set(r.deviceId,n.name)}let n=e.instances.map(e=>({...e,name:t.get(e.deviceId)??e.name})),r={...e.hub,name:B(this.hass,`led_tab_hyperhdr`)},i=n.find(e=>e.deviceId===this.hyperhdrInstance);return T`<section class="device">
      ${i?T`<h3>
              <button
                type="button"
                class="back"
                @click=${()=>this.hyperhdrInstance=void 0}
              >
                ${B(this.hass,`led_back_server`)}
              </button>
            </h3>`:D}
      ${!i&&r.camera?T`<vivid-hyperhdr-screen
              class="screen"
              .labels=${{show:B(this.hass,`hh_show_screen`),extend:B(this.hass,`hh_extend`),stop:B(this.hass,`hh_stop`),live:B(this.hass,`hh_live`),ended:B(this.hass,`hh_screen_ended`)}}
              .hass=${this.hass}
              .camera=${r.camera}
              .fallback=${this.side?.drive.colors.length?this.side.drive.colors:[[70,70,70]]}
              .tags=${[B(this.hass,`hh_live`)]}
            ></vivid-hyperhdr-screen>`:D}
      <vivid-hyperhdr-details
        .hass=${this.hass}
        .hub=${r}
        .instance=${i}
        .instances=${n}
        .initialTab=${i?`overview`:`system`}
        @vivid-hyperhdr-open=${e=>{e.stopPropagation(),this.hyperhdrInstance=e.detail.instance}}
      ></vivid-hyperhdr-details>
    </section>`}renderSummary(e,t){return T`<vivid-light-header
      class="summary"
      variant="summary"
      .hass=${this.hass}
      .lightEntity=${e.entityId}
      .available=${e.available}
      .isOn=${e.isOn}
      .rgb=${e.rgb}
      .brightness=${e.brightness}
      .glowBoost=${t.appearance.glowBoost}
      .colors=${e.colors}
      .badges=${e.badges}
      .lightOptions=${this.lightOptions}
      .showPower=${t.power.enabled}
      .hasPower=${e.hasPower}
      .watts=${e.watts}
      .scale=${e.groupScale}
      .showLiveOverride=${t.ambilight.enabled}
      .liveOverride=${e.liveOverride}
    ></vivid-light-header>`}});function Ns(e){return e==null||e===``||Array.isArray(e)&&e.length===0||typeof e==`object`&&!Array.isArray(e)&&Object.keys(e).length===0}function Ps(e){return Object.fromEntries(Object.entries(e).filter(([,e])=>!Ns(e)))}function Fs(e,t,n){let r={...e};return Ns(n)?delete r[t]:r[t]=n,r}function J(e,t,n,r,i){let a={...e[t]??{}};Ns(r)||r===i?delete a[n]:a[n]=r;let o={...e},s=Ps(a);return Ns(s)?delete o[t]:o[t]=s,o}var Is={hidden:!1,ambilight:!0,power_mode:`auto`};function Ls(e,t,n){let r=[...e.members??[]],i=r.findIndex(e=>e.entity===t),a={...i>=0?r[i]:{},...n};for(let[e,t]of Object.entries(Is))a[e]===t&&delete a[e];a.power_mode!==`sensor`&&`power_mode`in n&&delete a.power_sensor,a.power_mode!==`voltage`&&`power_mode`in n&&delete a.voltage;let{entity:o,...s}=Ps(a),c={...e};if(Object.keys(s).length===0)i>=0&&r.splice(i,1);else{let e={entity:t,...s};i>=0?r[i]=e:r.push(e)}return r.length===0?delete c.members:c.members=r,c}function Rs(e,t){return e.members?.find(e=>e.entity===t)}function zs(e,t){let n=e.tile?.favorites??[];return n.length>=8?e:J(e,`tile`,`favorites`,[...n,t])}function Bs(e,t){return J(e,`tile`,`favorites`,(e.tile?.favorites??[]).filter((e,n)=>n!==t))}function Vs(e,t){let n=e.badges??[];return n.some(e=>Us(e)===t)?e:{...e,badges:[...n,t]}}function Hs(e,t){let n=(e.badges??[]).filter((e,n)=>n!==t),r={...e};return n.length===0?delete r.badges:r.badges=n,r}function Us(e){return typeof e==`string`?e:e.entity}function Ws(e){return e===!1&&void 0}var Gs={entity:`entity`,name:`name`,icon:`icon`,sensor_pattern:`sensor_pattern`,voltage:`voltage`,power_sensor:`power_sensor`,member_name:`member_name`,color_bar:`color_bar`,state:`state_text`,effects:`effects`,tap_action:`tap_action`,hold_action:`hold_action`,double_tap_action:`double_tap_action`,hash:`details_hash`,sort:`details_sort`,details_color_bar:`color_bar`,saturation_bar:`saturation_bar`,details_saturation_bar:`details_saturation_bar`,summary:`details_summary`,details_effects:`details_effects`,idle:`idle`,max:`max`,price:`price`,price_entity:`price_entity`,details_history:`details_history`,glow:`glow`,glow_boost:`glow_boost`,header:`show_header`,compact:`compact`,gradient:`gradient`,animate_effects:`animate_effects`,brightness_min:`brightness_min`,brightness_step:`brightness_step`,transition:`transition`,badge_add:`badge_add`,details_favorites:`details_favorites`,wled_controls:`details_wled_controls`,health:`details_health`,member_icon:`member_icon`,member_transition:`transition`,layout:`layout`,expanded:`expanded`,box:`box`,box_hyperhdr:`box_hyperhdr`,confirm_off:`box_confirm_off`},Ks={auto:`mode_auto`,sensor:`mode_sensor`,voltage:`mode_voltage`,none:`mode_none`},qs={toggle:`action_toggle`,details:`action_details`,"more-info":`action_more_info`,none:`action_none`},Js=`custom`,Ys=`default`;function Xs(e){if(e!==void 0){if(typeof e==`string`)return e;if(typeof e==`object`&&e){let t=Object.keys(e),n=e.action;if(t.length===1&&n&&ut.includes(n))return n}return Js}}z(`vivid-led-group-editor`,class extends O{static properties={hass:{attribute:!1},_config:{state:!0},_open:{state:!0},_openMembers:{state:!0}};constructor(){super(),this._open=/* @__PURE__ */ new Set([`lights`]),this._openMembers=/* @__PURE__ */ new Set}setConfig(e){this._config=Ea(e)}connectedCallback(){super.connectedCallback(),go().then(()=>this.requestUpdate())}t(e,t){return yo(this.hass,e,t)}commit(e){this._config=e,N(this,`config-changed`,{config:e})}_lastGood;resolve(){if(!this.hass||!this._config?.entity||!this.hass.states[this._config.entity]){this._lastGood=void 0;return}try{let e=za(this._config);return this._lastGood={resolved:e,model:Wa(this.hass,e)},this._lastGood}catch(e){let t=e.message;return this._lastGood?{...this._lastGood,error:t}:void 0}}computeLabel=e=>{let t=Gs[e.name];return t?this.t(t):void 0};form(e,t,n,r){return T`<ha-form
      .hass=${this.hass}
      .data=${t}
      .schema=${e}
      .computeLabel=${this.computeLabel}
      .computeHelper=${r}
      @value-changed=${e=>{e.stopPropagation(),n(e.detail.value)}}
    ></ha-form>`}select(e){return{select:{mode:`dropdown`,options:e}}}renderBanner(e,t){if(!e)return T`<div class="banner neutral">${this.t(`entity_missing`)}</div>`;if(!t)return T`<div class="banner warn">
        <ha-icon .icon=${`mdi:alert-outline`}></ha-icon>${this.t(`entity_not_found`,{entity:e})}
      </div>`;let{resolved:n,model:r}=t,i=this.hass?.states[e],a=Sn(i)?this.t(`capability_hue`):Cn(i)?this.t(`capability_temperature`):this.t(`capability_dimmable`),o=r.detected.filter(e=>e.wled).length,s=r.isGroup?[this.t(`lights_count`,{count:r.detected.length})]:[];o>0&&s.push(r.isGroup?this.t(`wled_count`,{count:o}):this.t(`wled`)),s.push(a);let c=r.detected.filter(e=>e.power).length,l=n.power.enabled&&c>0?r.isGroup?this.t(`power_found`,{found:c,total:r.detected.length}):this.t(`power_found_single`,{origin:this.describePower(r.detected[0])}):void 0;return T`<div class="banner ${r.isGroup?``:`neutral`}">
      <ha-icon .icon=${r.isGroup?`mdi:check-circle`:`mdi:lightbulb-outline`}></ha-icon>
      <span>
        <b>${this.t(r.isGroup?`group_detected`:`single_light`)}</b> · ${s.join(` · `)}
        ${l?T`<br />${l}`:D}
      </span>
    </div>`}renderPills(e,t){let n=this._config??{},r=(e,t,n,r,i=!1)=>T`<button
        type="button"
        class=${W({pill:!0,on:e&&!i,disabled:i})}
        aria-pressed=${String(e&&!i)}
        ?disabled=${i}
        @click=${r}
      >
        <ha-icon .icon=${t}></ha-icon>${n}
      </button>`;return T`<div class="pills">
      ${t.hasLiveOverride?r(e.ambilight.enabled,`mdi:television-ambient-light`,this.t(`toggle_ambilight`),()=>this.commit(J(n,`ambilight`,`enabled`,Ws(n.ambilight?.enabled)))):r(!1,`mdi:television-ambient-light`,this.t(`toggle_ambilight_none`),()=>{},!0)}
      ${r(e.power.enabled,`mdi:flash`,this.t(`toggle_power`),()=>this.commit(J(n,`power`,`enabled`,Ws(n.power?.enabled))))}
      ${t.isGroup?r(t.detailsEnabled,`mdi:dock-window`,this.t(`toggle_details`),()=>this.commit(J(n,`details`,`enabled`,!t.detailsEnabled&&void 0))):D}
    </div>`}renderDefaultPower(e){let t=this._config??{},n=e.detected.some(e=>e.wled)||t.power?.voltage!==void 0;return T` ${this.form([{type:`grid`,name:``,schema:[{name:`sensor_pattern`,selector:{text:{}}},...n?[{name:`voltage`,selector:{number:{min:1,max:48,step:.1,mode:`box`,unit_of_measurement:`V`}}}]:[]]}],{sensor_pattern:t.power?.sensor_pattern,voltage:t.power?.voltage},e=>{let n=J(t,`power`,`sensor_pattern`,e.sensor_pattern);n=J(n,`power`,`voltage`,e.voltage),this.commit(n)},e=>e.name===`sensor_pattern`?this.t(`sensor_pattern_helper`):void 0)}
      <div class="hint">${this.t(n?`power_order_hint`:`power_order_hint_plain`)}</div>
      ${e.detailsEnabled?this.form([{type:`grid`,name:``,schema:[{name:`price`,selector:{number:{min:0,step:1e-4,mode:`box`,unit_of_measurement:`${this.currency()}/kWh`}}},{name:`price_entity`,selector:{entity:{domain:[`sensor`,`input_number`]}}}]}],{price:t.power?.price,price_entity:t.power?.price_entity},e=>{let n=J(t,`power`,`price`,e.price);n=J(n,`power`,`price_entity`,e.price_entity||void 0),this.commit(n)},e=>e.name===`price`?this.t(`price_helper`):e.name===`price_entity`?this.t(`price_entity_helper`):void 0):D}`}currency(){let e=this._config?.power?.currency??this.hass?.config?.currency??`EUR`;try{return new Intl.NumberFormat(dn(this.hass),{style:`currency`,currency:e}).formatToParts(0).find(e=>e.type===`currency`)?.value??e}catch{return e}}describePower(e){let t=e?.power;if(!t)return this.t(`origin_none`);if(t.kind===`current`){let e=Qe(this.hass?.states[t.entityId]);return this.t(`origin_estimated`,{current:e===void 0?`—`:V(this.hass,e),voltage:V(this.hass,t.voltage,1)})}if(e.watts===void 0)return this.t(`origin_unavailable`,{entity:t.entityId});let n=t.origin===`sensor`?`origin_sensor`:t.origin===`pattern`?`origin_pattern`:`origin_device`;return this.t(n,{entity:t.entityId})}renderTags(e,t){let n=[];return e.available||n.push(T`<span class="tag">${this.t(`offline`)}</span>`),t.power.enabled&&(e.watts===void 0?e.power||n.push(T`<span class="tag warn">${this.t(`no_power`)}</span>`):n.push(T`<span class="tag ok"
            ><ha-icon .icon=${`mdi:flash`}></ha-icon>${yn(this.hass,e.watts)}</span
          >`)),e.wled&&n.push(T`<span class="tag">${this.t(`wled`)}</span>`),t.ambilight.enabled&&e.ambilight&&e.liveOverride?.available&&!e.liveOverride.active&&n.push(T`<span class="tag amber">${this.t(`ambilight_tag`)}</span>`),n}renderPowerChoice(e,t){let n=this._config??{},r=Rs(n,e.entityId),i=r?.power_mode??`auto`,a=i===`voltage`&&!(r?.voltage??t.power.voltage);return T`<div class="segmented" role="radiogroup" aria-label=${this.t(`power_mode`)}>
        ${_a.filter(t=>t!==`voltage`||e.wled||i===`voltage`).map(t=>T`<button
              type="button"
              role="radio"
              aria-checked=${String(t===i)}
              class=${W({on:t===i})}
              @click=${()=>this.commit(Ls(n,e.entityId,{power_mode:t}))}
            >
              ${this.t(Ks[t])}
            </button>`)}
      </div>
      ${i===`sensor`?this.form([{name:`power_sensor`,selector:{entity:{domain:`sensor`,device_class:`power`}}}],{power_sensor:r?.power_sensor},t=>this.commit(Ls(n,e.entityId,{power_sensor:t.power_sensor||void 0}))):D}
      ${i===`voltage`?this.form([{name:`voltage`,selector:{number:{min:1,max:48,step:.1,mode:`box`,unit_of_measurement:`V`}}}],{voltage:r?.voltage??t.power.voltage},t=>this.commit(Ls(n,e.entityId,{voltage:t.voltage||void 0}))):D}
      <div class="hint">
        ${i===`none`?this.t(`origin_disabled`):a?this.t(`voltage_missing`):this.describePower(e)}
      </div>`}renderMember(e,t,n){let r=e.isOn&&e.rgb?{background:I(e.rgb),boxShadow:`0 0 10px ${I(e.rgb,.5)}`,color:`#fff`}:{},i=this._openMembers.has(e.entityId),a=()=>{let t=new Set(this._openMembers);i?t.delete(e.entityId):t.add(e.entityId),this._openMembers=t};return T`<div
      class=${W({member:!0,offline:!e.available,hidden:e.hidden,open:i})}
    >
      <div
        class="member-head"
        role="button"
        tabindex="0"
        aria-expanded=${String(i)}
        @click=${a}
        @keydown=${e=>{e.target===e.currentTarget&&(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),a())}}
      >
        <span class="light" style=${k(r)}><ha-icon .icon=${e.icon}></ha-icon></span>
        <span class="member-name">${e.name}</span>
        <span class="tags">${this.renderTags(e,t)}</span>
        ${n&&t.details.sort===`custom`?this.renderMove(e):D}
        <ha-icon class="chevron" .icon=${`mdi:chevron-down`}></ha-icon>
      </div>
      ${i?this.renderMemberBody(e,t,n):D}
    </div>`}renderMemberBody(e,t,n){let r=this._config??{},i=Rs(r,e.entityId);return T`<div class="member-body">
        ${n&&t.ambilight.enabled&&e.liveOverride?T`<label class="switch-row">
            <span>${this.t(`ambilight_member`)}</span>
            <input
              type="checkbox"
              role="switch"
              class="switch"
              .checked=${i?.ambilight!==!1}
              @change=${t=>this.commit(Ls(r,e.entityId,{ambilight:t.target.checked}))}
            />
          </label>`:D}
        ${t.power.enabled?this.renderPowerChoice(e,t):D}
        ${n?T`${this.form([{type:`grid`,name:``,schema:[{name:`member_name`,selector:{text:{}}},{name:`member_icon`,selector:{icon:{}}}]}],{member_name:i?.name,member_icon:i?.icon},t=>this.commit(Ls(r,e.entityId,{name:t.member_name||void 0,icon:t.member_icon||void 0})),t=>t.name===`member_name`?this.t(`member_name_helper`,{name:e.autoName}):void 0)}
                ${this.form([{name:`member_transition`,selector:{number:{min:0,max:30,step:.1,mode:`box`,unit_of_measurement:`s`}}}],{member_transition:i?.transition},t=>this.commit(Ls(r,e.entityId,{transition:t.member_transition})),()=>this.t(`member_transition_helper`,{value:t.tile.transition===void 0?this.t(`none`):`${V(this.hass,t.tile.transition,1)} s`}))}
                <label class="switch-row">
                  <span>${this.t(`member_visible`)}</span>
                  <input
                    type="checkbox"
                    role="switch"
                    class="switch"
                    .checked=${!e.hidden}
                    @change=${t=>this.commit(Ls(r,e.entityId,{hidden:!t.target.checked}))}
                  />
                </label>`:D}
      </div>
    </div>`}renderFavorites(e){let t=this._config??{},n=e.tile.favorites;return T`<div class="label">
        ${this.t(`favorites_title`)} <span class="muted">· ${this.t(`favorites_hint`)}</span>
      </div>
      <div class="favorites">
        ${n.map((e,n)=>{let r=e.rgb??vt(e.kelvin??2700),i=e.rgb?St(e.rgb):`${Math.round(e.kelvin??0)} K`;return T`<button
            type="button"
            class="favorite"
            style=${k({"--swatch":I(r)})}
            title=${this.t(`favorite_remove`,{color:i})}
            aria-label=${this.t(`favorite_remove`,{color:i})}
            @click=${()=>this.commit(Bs(t,n))}
          >
            <ha-icon .icon=${`mdi:close`}></ha-icon>
          </button>`})}
        ${n.length<8?T`<label class="favorite add" title=${this.t(`favorite_add`)}>
                <ha-icon .icon=${`mdi:plus`}></ha-icon>
                <input
                  type="color"
                  aria-label=${this.t(`favorite_add`)}
                  value="#ff8a3d"
                  @change=${e=>{let n=e.target.value;xt(n)&&this.commit(zs(t,n))}}
                />
              </label>`:D}
      </div>`}renderBadges(){let e=this._config??{},t=this.hass;if(!t)return D;let n=e.badges??[];return T`<div class="label">
        ${this.t(`section_badges`)} <span class="muted">· ${this.t(`badges_hint`)}</span>
      </div>
      ${n.length?T`<div class="badge-list">
              ${n.map((n,r)=>{let i=Ki(t,typeof n==`string`?{entity:n}:n);return T`<span class="badge-item">
                  <ha-icon .icon=${i.icon}></ha-icon>
                  <span class="badge-name">${i.name}</span>
                  ${i.label?T`<span class="muted">${i.label}</span>`:D}
                  <button
                    type="button"
                    class="badge-remove"
                    aria-label=${this.t(`badge_remove`,{name:i.name})}
                    title=${this.t(`badge_remove`,{name:i.name})}
                    @click=${()=>this.commit(Hs(e,r))}
                  >
                    <ha-icon .icon=${`mdi:close`}></ha-icon>
                  </button>
                </span>`})}
            </div>`:D}
      ${this.form([{name:`badge_add`,selector:{entity:{}}}],{},t=>{let n=t.badge_add;n&&this.commit(Vs(e,n))})}`}renderLayout(e){let t=this._config??{},n=e.layout===`collapsible`;return this.form([{name:`layout`,selector:this.select([{value:`default`,label:this.t(`layout_default`)},{value:`collapsible`,label:this.t(`layout_collapsible`)}])},...n?[{name:`expanded`,selector:{boolean:{}}}]:[]],{layout:e.layout,expanded:e.expanded},e=>{let n=Fs(t,`layout`,e.layout==="default"?void 0:e.layout);n=Fs(n,`expanded`,e.layout===`collapsible`&&e.expanded?!0:void 0),this.commit(n)},e=>e.name===`expanded`?this.t(`expanded_helper`):void 0)}renderBoxSection(e,t){let n=this.hass;if(!n)return D;let r=this._config??{},i=Xr(n),a=cr(n).servers;if(i.length===0&&typeof e.ambilight.box!=`string`)return D;let o=li(n,e,t),s=e=>n.devices?.[e]?.name_by_user||n.devices?.[e]?.name||e,c=o?`device`in o.target?s(o.target.device):o.target.prefix:void 0,l=o?.drive.driven.length??0,u=this.join([c?this.t(`box_found`,{name:c}):this.t(`box_none`),l>0&&this.t(`box_driven`,{count:l})]),d=e.ambilight.box,f=d===!1?`off`:d??`auto`,p=[{value:`auto`,label:this.t(`box_auto`)},{value:`off`,label:this.t(`box_off`)},...i.map(e=>({value:e,label:s(e)})),...typeof d==`string`&&!i.includes(d)?[{value:d,label:d}]:[]];return this.section(`box`,`mdi:television-ambient-light`,this.t(`section_box`),u,()=>this.form([{name:`box`,selector:this.select(p)},...a.length>1?[{name:`box_hyperhdr`,selector:this.select([{value:`auto`,label:this.t(`box_auto`)},...a.map(e=>({value:e,label:lr(n,e)}))])}]:[],{name:`confirm_off`,selector:{boolean:{}}}],{box:f,box_hyperhdr:e.ambilight.hyperhdr??`auto`,confirm_off:e.ambilight.confirmOff},e=>{let t=e.box===`auto`?void 0:e.box!==`off`&&e.box,n=J(r,`ambilight`,`box`,t);n=J(n,`ambilight`,`hyperhdr`,e.box_hyperhdr===`auto`?void 0:e.box_hyperhdr),n=J(n,`ambilight`,`confirm_off`,e.confirm_off,!0),this.commit(n)},e=>e.name===`box`?this.t(`box_helper`):void 0))}renderAppearance(e,t){let n=this._config??{};return T`${this.renderLayout(e)}${this.form([{name:`glow`,selector:Et},{name:`glow_boost`,selector:Et},{name:`header`,selector:{boolean:{}}},{name:`compact`,selector:{boolean:{}}},...t.isGroup?[{name:`gradient`,selector:{boolean:{}}}]:[],{name:`animate_effects`,selector:{boolean:{}}}],{glow:e.appearance.glow,glow_boost:e.appearance.glowBoost,header:e.appearance.header,compact:e.appearance.compact,gradient:e.appearance.gradient,animate_effects:e.appearance.animateEffects},r=>{let i=r.glow===e.appearance.glow?n:J(n,`appearance`,`glow`,r.glow,100);i=J(i,`appearance`,`glow_boost`,r.glow_boost,100),i=J(i,`appearance`,`header`,r.header,!0),i=J(i,`appearance`,`compact`,r.compact,!1),t.isGroup&&(i=J(i,`appearance`,`gradient`,r.gradient,!0)),i=J(i,`appearance`,`animate_effects`,r.animate_effects,!0),this.commit(i)},e=>e.name===`glow`?this.t(`glow_helper`):e.name===`glow_boost`?this.t(`glow_boost_helper`):void 0)}`}renderMove(e){let t=this._config??{},n=this.resolve()?.model.detected.map(e=>e.entityId)??[],r=n.indexOf(e.entityId),i=e=>{let i=[...n],[a]=i.splice(r,1);a!==void 0&&(i.splice(r+e,0,a),this.commit(J(t,`details`,`order`,i)))};return T`<span class="move" @click=${e=>e.stopPropagation()}>
      <button
        type="button"
        aria-label=${this.t(`move_up`,{name:e.name})}
        title=${this.t(`move_up`,{name:e.name})}
        ?disabled=${r<=0}
        @click=${()=>i(-1)}
      >
        <ha-icon .icon=${`mdi:chevron-up`}></ha-icon>
      </button>
      <button
        type="button"
        aria-label=${this.t(`move_down`,{name:e.name})}
        title=${this.t(`move_down`,{name:e.name})}
        ?disabled=${r===-1||r>=n.length-1}
        @click=${()=>i(1)}
      >
        <ha-icon .icon=${`mdi:chevron-down`}></ha-icon>
      </button>
    </span>`}section(e,t,n,r,i){let a=this._open.has(e);return T`<details
      class="section"
      data-section=${e}
      ?open=${a}
      @toggle=${t=>{let n=t.target.open;if(n===this._open.has(e))return;let r=new Set(this._open);n?r.add(e):r.delete(e),this._open=r}}
    >
      <summary>
        <ha-icon .icon=${t}></ha-icon>
        <span class="section-title">${n}</span>
        <span class="summary-hint">${r}</span>
        <ha-icon class="chevron" .icon=${`mdi:chevron-down`}></ha-icon>
      </summary>
      <div class="section-body">${a?i():D}</div>
    </details>`}join(e){return e.filter(Boolean).join(` · `)}plural(e,t,n){return this.t(e===1?t:n,{count:e})}colorBarLabel(e,t){return e.tile.colorBar===`auto`?this.t(t.tileColorBar===`hue`?`color_auto_hue`:t.tileColorBar===`temperature`?`color_auto_temperature`:`color_auto_none`):this.t(`color_${e.tile.colorBar}`)}actionLabel(e,t){if(e===Js)return this.t(`action_custom`);if(e===Ys)return this.t(t.detailsEnabled?`action_details`:`action_more_info`);let n=qs[e];return n?this.t(n):e}renderTileSection(e,t){let n=this._config??{},r=e.tile.favorites.length,i=n.badges?.length??0,a=this.join([`${this.t(`color_bar`)} : ${this.colorBarLabel(e,t)}`,r>0&&this.plural(r,`favorites_one`,`favorites_other`),i>0&&this.plural(i,`badges_one`,`badges_other`)]),o=pa.map(e=>({value:e,label:this.t(`color_bar_${e}`)}));return this.section(`tile`,`mdi:gesture-tap-box`,this.t(`section_tile`),a,()=>T`
        ${this.form([{type:`grid`,name:``,schema:[{name:`color_bar`,selector:this.select(o)},{name:`state`,selector:this.select(ma.map(e=>({value:e,label:this.t(e===`brightness`?`state_brightness`:`state_none`)})))}]},...e.tile.colorBar!==`none`&&e.tile.colorBar!==`temperature`?[{name:`saturation_bar`,selector:{boolean:{}}}]:[],{name:`effects`,selector:{boolean:{}}}],{color_bar:e.tile.colorBar,state:e.tile.state,saturation_bar:e.tile.saturationBar,effects:e.tile.effects},e=>{let t=J(n,`tile`,`color_bar`,e.color_bar,`auto`);t=J(t,`tile`,`state`,e.state,`brightness`),t=J(t,`tile`,`saturation_bar`,e.saturation_bar,!1),t=J(t,`tile`,`effects`,e.effects,!0),this.commit(t)},e=>e.name===`saturation_bar`?this.t(`saturation_bar_helper`):void 0)}
        ${this.renderFavorites(e)} ${this.renderBadges()}
        <div class="label">${this.t(`brightness_title`)}</div>
        ${this.form([{type:`grid`,name:``,schema:[{name:`brightness_min`,selector:{number:{min:1,max:100,step:1,mode:`box`,unit_of_measurement:`%`}}},{name:`brightness_step`,selector:{number:{min:1,max:50,step:1,mode:`box`,unit_of_measurement:`%`}}},{name:`transition`,selector:{number:{min:0,max:30,step:.1,mode:`box`,unit_of_measurement:`s`}}}]}],{brightness_min:e.tile.brightnessMin,brightness_step:e.tile.brightnessStep,transition:e.tile.transition},e=>{let t=J(n,`tile`,`brightness_min`,e.brightness_min,1);t=J(t,`tile`,`brightness_step`,e.brightness_step,1),t=J(t,`tile`,`transition`,e.transition),this.commit(t)},e=>e.name===`transition`?this.t(`transition_helper`):void 0)}
      `)}renderGesturesSection(e){let t=this._config??{},n=ut.filter(t=>t!==`details`||e.isGroup).map(e=>({value:e,label:this.t(qs[e])})),r=e=>e===Js?[...n,{value:Js,label:this.t(`action_custom`)}]:n,i=this.t(`action_default`,{action:this.t(e.detailsEnabled?`action_details`:`action_more_info`)}),a=Xs(t.tile?.tap_action)??`toggle`,o=Xs(t.tile?.hold_action)??Ys,s=Xs(t.tile?.double_tap_action)??`none`,c=(e,n,r)=>this.commit(J(t,`tile`,e,n,r)),l=this.join([`${this.t(`tap_action`)} : ${this.actionLabel(a,e)}`,`${this.t(`hold_action`)} : ${this.actionLabel(o,e)}`,s!==`none`&&`${this.t(`double_tap_action`)} : ${this.actionLabel(s,e)}`]);return this.section(`gestures`,`mdi:gesture-tap`,this.t(`section_gestures`),l,()=>this.form([{type:`grid`,name:``,schema:[{name:`tap_action`,selector:this.select(r(a))},{name:`hold_action`,selector:this.select([{value:Ys,label:i},...r(o)])}]},{name:`double_tap_action`,selector:this.select(r(s))}],{tap_action:a,hold_action:o,double_tap_action:s},e=>{e.tap_action!==Js&&e.tap_action!==a?c(`tap_action`,e.tap_action,`toggle`):e.hold_action!==Js&&e.hold_action!==o?c(`hold_action`,e.hold_action===Ys?void 0:e.hold_action):e.double_tap_action!==Js&&e.double_tap_action!==s&&c(`double_tap_action`,e.double_tap_action,`none`)}))}renderPowerSection(e,t){if(!e.power.enabled)return D;let n=this._config??{},r=t.detected[0],i=t.isGroup?this.join([this.t(`power_found`,{found:t.detected.filter(e=>e.power).length,total:t.detected.length}),n.power?.voltage!==void 0&&`${V(this.hass,n.power.voltage,1)} V`,n.power?.price_entity?n.power.price_entity:n.power?.price!==void 0&&`${V(this.hass,n.power.price,4)} ${this.currency()}/kWh`]):this.describePower(r);return this.section(`power`,`mdi:flash`,this.t(`section_power`),i,()=>T`
        ${t.isGroup?this.renderDefaultPower(t):r?this.renderPowerChoice(r,e):D}
        <div class="label">${this.t(`section_glow`)}</div>
        ${this.form([{type:`grid`,name:``,schema:[{name:`idle`,selector:{number:{min:0,step:.5,mode:`box`,unit_of_measurement:`W`}}},{name:`max`,selector:{number:{min:1,step:1,mode:`box`,unit_of_measurement:`W`}}}]}],{idle:e.power.scale.idle,max:n.power?.max},e=>{let t=J(n,`power`,`idle`,e.idle,3);t=J(t,`power`,`max`,e.max),this.commit(t)},e=>e.name===`max`?this.t(`max_auto_helper`):void 0)}
      `)}renderLightsSection(e,t){if(!t.isGroup)return D;let n=t.detected.filter(e=>e.hidden).length,r=this.join([this.t(`lights_count`,{count:t.detected.length}),n>0&&this.plural(n,`hidden_one`,`hidden_other`),e.details.sort===`custom`&&this.t(`sort_custom`)]);return this.section(`lights`,`mdi:lightbulb-group`,this.t(`members_title`),r,()=>T`
        <div class="hint">${this.t(`members_tap_hint`)}</div>
        ${t.detected.map(t=>this.renderMember(t,e,!0))}
      `)}renderDetailsSection(e,t){if(!t.isGroup||!t.detailsEnabled)return D;let n=this.join([e.details.hash,this.t({name:`sort_name`,group:`sort_group`,custom:`sort_custom`}[e.details.sort]??`sort_name`)]);return this.section(`details`,`mdi:dock-window`,this.t(`section_details`),n,()=>this.renderDetailsOptions(e,t))}renderAppearanceSection(e,t){let n=e.appearance,r=this.join([e.layout===`collapsible`&&this.t(`layout_collapsible`),`${this.t(`glow`)} : ${n.glow} %`,n.glowBoost!==100&&`${this.t(`glow_boost`)} : ${n.glowBoost} %`,n.compact&&this.t(`compact`).toLowerCase(),!n.header&&this.t(`summary_no_header`),t.isGroup&&!n.gradient&&this.t(`summary_no_gradient`),!n.animateEffects&&this.t(`summary_no_shimmer`)]);return this.section(`appearance`,`mdi:palette-swatch-outline`,this.t(`section_appearance`),r,()=>this.renderAppearance(e,t))}renderDetailsOptions(e,t){let n=t.detected.some(e=>e.wled),r=this._config??{},i=r.details?.hash?.replace(/^#\/?/,``),a={name:`sort_name`,group:`sort_group`,custom:`sort_custom`},o=this.form([{name:`hash`,selector:{text:{}}},{type:`grid`,name:``,schema:[{name:`sort`,selector:this.select(ha.map(e=>({value:e,label:this.t(a[e]??`sort_name`)})))},{name:`details_color_bar`,selector:this.select([{value:Ys,label:this.t(`color_bar_same`)},...pa.map(e=>({value:e,label:this.t(`color_bar_${e}`)}))])}]}],{hash:i,sort:e.details.sort,details_color_bar:r.details?.color_bar??Ys},n=>{let i=(n.hash??``).replace(/^#\/?/,``).replace(/[^\w-]/g,`-`),a=J(r,`details`,`hash`,i);a=J(a,`details`,`sort`,n.sort,`name`),a=J(a,`details`,`color_bar`,n.details_color_bar===Ys?void 0:n.details_color_bar),n.sort===`custom`&&e.details.sort!==`custom`?a=J(a,`details`,`order`,t.detected.map(e=>e.entityId)):n.sort!==`custom`&&(a=J(a,`details`,`order`,void 0)),this.commit(a)},t=>{if(t.name===`hash`&&i)return this.t(`details_hash_helper`,{hash:i});if(t.name===`sort`&&e.details.sort===`custom`)return this.t(`sort_custom_helper`)}),s=this.form([{name:`summary`,selector:{boolean:{}}},...t.hasPower?[{name:`details_history`,selector:{boolean:{}}}]:[],{name:`details_effects`,selector:{boolean:{}}},...e.details.colorBar!==`none`&&e.details.colorBar!==`temperature`?[{name:`details_saturation_bar`,selector:{boolean:{}}}]:[],...e.tile.favorites.length?[{name:`details_favorites`,selector:{boolean:{}}}]:[],...n?[{name:`wled_controls`,selector:{boolean:{}}},{name:`health`,selector:{boolean:{}}}]:[]],{summary:e.details.summary,details_history:e.details.history,details_effects:e.details.effects,details_saturation_bar:e.details.saturationBar,details_favorites:e.details.favorites,wled_controls:e.details.wledControls,health:e.details.health},i=>{let a=J(r,`details`,`summary`,i.summary,!0);a=J(a,`details`,`effects`,i.details_effects,e.tile.effects),i.details_saturation_bar!==void 0&&(a=J(a,`details`,`saturation_bar`,i.details_saturation_bar,!0)),e.tile.favorites.length&&(a=J(a,`details`,`favorites`,i.details_favorites,!0)),n&&(a=J(a,`details`,`wled_controls`,i.wled_controls,!0),a=J(a,`details`,`health`,i.health,!0)),t.hasPower&&(a=J(a,`details`,`history`,i.details_history,!0)),this.commit(a)});return T`${o}
      <div class="label">${this.t(`details_content`)}</div>
      ${s}`}renderPowerWarning(e){let t=this._config??{},n=e.detected.some(e=>e.wled)||t.power?.voltage!==void 0;return T`<div class="banner warn">
      <ha-icon .icon=${`mdi:alert-outline`}></ha-icon>
      <span
        ><b>${this.t(`power_none_title`)}</b>
        ${this.t(n?`power_none_hint`:`power_none_hint_plain`)}</span
      >
    </div>`}render(){if(!this.hass||!this._config)return D;let e=this._config,t=this.resolve(),n=this.form([{name:`entity`,required:!0,selector:{entity:{domain:`light`}}}],{entity:e.entity},t=>this.commit(Fs(e,`entity`,t.entity)));if(!t)return T`<div class="editor">${n}${this.renderBanner(e.entity)}</div>`;let{resolved:r,model:i,error:a}=t;return T`<div class="editor">
      ${n} ${this.renderBanner(e.entity,t)}
      ${a?T`<div class="banner error">
              <ha-icon .icon=${`mdi:alert-circle-outline`}></ha-icon><span>${a}</span>
            </div>`:D}
      ${this.form([{type:`grid`,name:``,schema:[{name:`name`,selector:{text:{}}},{name:`icon`,selector:{icon:{}},context:{icon_entity:`entity`}}]}],{name:e.name,icon:e.icon,entity:e.entity},t=>{let n=Fs(e,`name`,t.name);n=Fs(n,`icon`,t.icon),this.commit(n)})}
      ${this.renderPills(r,i)}
      ${r.power.enabled&&!i.hasPower?this.renderPowerWarning(i):D}
      <div class="sections">
        ${this.renderLightsSection(r,i)} ${this.renderTileSection(r,i)}
        ${this.renderGesturesSection(i)} ${this.renderPowerSection(r,i)}
        ${this.renderDetailsSection(r,i)} ${this.renderBoxSection(r,i)}
        ${this.renderAppearanceSection(r,i)}
      </div>
    </div>`}static styles=[H,o`
      :host {
        display: block;
      }
      .editor {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        flex: none;
      }
      .banner {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 10px 12px;
        border-radius: 10px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
        line-height: 1.45;
        font-size: 13px;
      }
      .banner.neutral {
        background: rgba(var(--vivid-rgb-text), 0.05);
      }
      .banner.warn {
        background: rgba(255, 179, 0, 0.14);
      }
      .banner.error {
        background: rgba(219, 68, 55, 0.14);
      }
      .banner ha-icon {
        color: var(--primary-color);
      }
      .banner.error ha-icon {
        color: var(--error-color, #db4437);
      }
      .banner.warn ha-icon {
        color: var(--warning-color, #ffa600);
      }
      .label {
        font-weight: 500;
        font-size: 14px;
        margin-top: 2px;
      }
      .muted,
      .summary-hint {
        color: var(--secondary-text-color);
        font-weight: 400;
        font-size: 12px;
      }
      .hint {
        color: var(--secondary-text-color);
        font-size: 12px;
        line-height: 1.4;
        overflow-wrap: anywhere;
      }
      .divider {
        height: 1px;
        background: var(--divider-color, rgba(255, 255, 255, 0.12));
      }
      .pills {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .pill {
        appearance: none;
        border: none;
        font: inherit;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 12px;
        border-radius: 18px;
        background: rgba(var(--vivid-rgb-text), 0.06);
        color: var(--secondary-text-color);
        font-size: 13px;
        cursor: pointer;
      }
      .pill.on {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.18);
        color: var(--primary-text-color);
      }
      .pill.on ha-icon {
        color: var(--primary-color);
      }
      .pill.disabled {
        cursor: default;
        background: none;
        border: 1px dashed var(--divider-color, rgba(255, 255, 255, 0.15));
        color: var(--disabled-text-color);
      }
      .pill:focus-visible,
      .segmented button:focus-visible,
      .switch:focus-visible,
      summary:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .favorites {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .favorite {
        appearance: none;
        border: none;
        margin: 0;
        padding: 0;
        position: relative;
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--swatch);
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        color: transparent;
      }
      .favorite:hover,
      .favorite:focus-visible {
        color: #fff;
        filter: brightness(0.85);
      }
      .favorite:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .favorite.add {
        background: none;
        box-shadow: inset 0 0 0 1px var(--divider-color, rgba(255, 255, 255, 0.2));
        color: var(--secondary-text-color);
        overflow: hidden;
      }
      .favorite.add:focus-within {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .favorite.add input {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
      }
      .move {
        display: inline-flex;
        gap: 2px;
        flex: none;
      }
      .move button {
        appearance: none;
        border: none;
        margin: 0;
        padding: 0;
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: rgba(var(--vivid-rgb-text), 0.06);
        color: var(--primary-text-color);
        cursor: pointer;
      }
      .move button:disabled {
        opacity: 0.35;
        cursor: default;
      }
      .move button:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .badge-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .badge-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 4px 4px 10px;
        border-radius: 16px;
        background: rgba(var(--vivid-rgb-text), 0.06);
        font-size: 13px;
      }
      .badge-remove {
        appearance: none;
        border: none;
        margin: 0;
        padding: 0;
        display: grid;
        place-items: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: none;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .badge-remove:hover,
      .badge-remove:focus-visible {
        background: rgba(var(--vivid-rgb-text), 0.1);
        color: var(--primary-text-color);
      }
      .member {
        border-radius: 12px;
        background: rgba(var(--vivid-rgb-text), 0.04);
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.08));
      }
      .member-head {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px 8px 12px;
        border-radius: 12px;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .member-head:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: -2px;
      }
      .member-head .chevron {
        flex: none;
      }
      .member.open .member-head {
        padding-bottom: 4px;
      }
      .light {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        flex: none;
        background: rgba(var(--vivid-rgb-text), 0.08);
        color: var(--secondary-text-color);
      }
      .member-name {
        font-weight: 500;
      }
      .member.offline .member-name {
        color: var(--secondary-text-color);
      }
      .member.hidden .member-head {
        opacity: 0.5;
      }
      .tags {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 4px;
        margin-left: auto;
      }
      .tag {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 2px 8px;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.07);
        color: var(--secondary-text-color);
        font-size: 11px;
        white-space: nowrap;
      }
      .tag ha-icon {
        --mdc-icon-size: 12px;
      }
      .tag.ok {
        color: var(--success-color, #43a047);
      }
      .tag.warn {
        color: var(--warning-color, #ffa600);
        background: rgba(255, 166, 0, 0.12);
      }
      .tag.amber {
        color: var(--amber-color, #ffc107);
        background: rgba(255, 193, 7, 0.12);
      }
      .member-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 4px 12px 12px;
      }
      .switch-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 32px;
        cursor: pointer;
      }
      .switch {
        appearance: none;
        position: relative;
        flex: none;
        width: 36px;
        height: 20px;
        margin: 0;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.25);
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      .switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--primary-text-color);
        transition: transform 0.2s ease;
      }
      .switch:checked {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.55);
      }
      .switch:checked::after {
        transform: translateX(16px);
        background: var(--primary-color);
      }
      .segmented {
        display: flex;
        gap: 3px;
        padding: 3px;
        border-radius: 8px;
        background: rgba(var(--vivid-rgb-text), 0.06);
      }
      .segmented button {
        appearance: none;
        border: none;
        font: inherit;
        flex: 1;
        padding: 6px 4px;
        border-radius: 6px;
        background: none;
        color: var(--secondary-text-color);
        font-size: 12px;
        cursor: pointer;
      }
      .segmented button.on {
        background: rgba(var(--vivid-rgb-text), 0.14);
        color: var(--primary-text-color);
        font-weight: 500;
      }
      .sections {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .section {
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.08));
        border-radius: 12px;
      }
      .section[open] {
        background: rgba(var(--vivid-rgb-text), 0.02);
      }
      summary {
        display: grid;
        grid-template-columns: auto auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        cursor: pointer;
        list-style: none;
        font-weight: 500;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      .section-title {
        white-space: nowrap;
      }
      summary .summary-hint {
        min-width: 0;
        text-align: right;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .chevron {
        transition: transform 0.2s ease;
        color: var(--secondary-text-color);
      }
      .section[open] > summary .chevron,
      .member.open .member-head .chevron {
        transform: rotate(180deg);
      }
      .section-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 0 14px 14px;
      }
      @media (prefers-reduced-motion: reduce) {
        .switch,
        .switch::after,
        .chevron {
          transition: none;
        }
      }
    `]});var Zs=[`location-changed`,`popstate`,`hashchange`];z(fa,class extends O{static properties={hass:{attribute:!1},_config:{state:!0},_expanded:{state:!0}};model;sampler=new Fi(this,()=>this.hass);foldStep;side;dialog;pushedHash=!1;static getConfigElement(){return document.createElement(`vivid-led-group-editor`)}static getStubConfig(e){let t=Object.values(e?.states??{}).filter(e=>A(e.entity_id)===`light`);return{entity:(t.find(e=>Array.isArray(e.attributes.entity_id))??t[0])?.entity_id??`light.example`}}setConfig(e){let t=this._config,n=za(e);this._config=n,t&&t.entity===n.entity&&t.expanded!==n.expanded?(vi(n.entity,n.expanded),this._expanded=n.expanded):this._expanded=_i(n.entity,n.expanded)}getCardSize(){let e=this._config;if(!e)return 3;let t=+!!this.side;if(e.layout===`collapsible`){let n=this._expanded&&!this.screen;return 1+t+(n?1+ +!!e.tile.favorites.length:0)}return+!!e.appearance.header+2+ +!!e.tile.favorites.length+t}getGridOptions(){if(this._config?.layout===`collapsible`)return{columns:12,min_columns:6,rows:`auto`,min_rows:1};let e=this.getCardSize();return{columns:12,min_columns:6,rows:e,min_rows:Math.min(e,2)}}static styles=[H,U,o`
      :host {
        display: block;
      }
      /* The tile and the Ambilight rail share one surface. */
      .surface {
        position: relative;
        overflow: hidden;
        isolation: isolate;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
      }
      .surface.rail vivid-light-tile::part(tile) {
        border-radius: 0;
      }
      .tile-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .chevron {
        display: grid;
        place-items: center;
        width: 28px;
        height: 40px;
        border-radius: 14px;
        color: var(--secondary-text-color);
      }
      .chevron ha-icon {
        --mdc-icon-size: 22px;
        display: inline-flex;
        transition: transform 0.28s ease;
      }
      .chevron.open ha-icon {
        transform: rotate(180deg);
      }
      @media (prefers-reduced-motion: reduce) {
        .chevron ha-icon {
          transition: none;
        }
      }
      ha-card {
        height: 100%;
        box-sizing: border-box;
        background: none;
        border: none;
        box-shadow: none;
        overflow: visible;
      }
      .card {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      vivid-light-header {
        padding: 0 4px;
      }
      .warning {
        padding: 16px;
        color: var(--error-color, #db4437);
      }
    `];connectedCallback(){super.connectedCallback();for(let e of Zs)window.addEventListener(e,this.syncWithLocation);this.syncWithLocation()}disconnectedCallback(){super.disconnectedCallback();for(let e of Zs)window.removeEventListener(e,this.syncWithLocation);this.dialog?.unmount()}shouldUpdate(e){return!this.hass||!this._config?e.has(`_config`):e.size===1&&e.has(`hass`)?Ga(e.get(`hass`),this.hass,this.model?.watched??[]):!0}willUpdate(){if(!this.hass||!this._config)return;let e=Wa(this.hass,this._config);if(this.side=li(this.hass,this._config,e),this.side&&(e.watched=[.../* @__PURE__ */ new Set([...e.watched,...this.side.watched])]),this.model=e,this._config.layout===`collapsible`&&this.side){let e={piOn:di(this.side),screen:this.screen},t=fi(this.foldStep,e);t!==void 0&&t!==this._expanded&&(this._expanded=t,vi(this._config.entity,t)),this.foldStep=e}this.sampler.sync(pi(this.side,e.detected),this.screen)}get screen(){return ui(this.side,this.model?.liveOverride)}get screenColors(){return this.sampler.colors??si}get drift(){return this.sampler.colors===void 0}get rail(){return this.renderRoot.querySelector(`vivid-ambilight-rail`)}toggleFold=()=>{let e=this._config;e&&(P(this,`light`),this._expanded=!this._expanded,vi(e.entity,this._expanded))};takeControl=e=>{e.stopPropagation();let t=this.side?.drive.overrides??[];this.hass&&t.length!==0&&ot(this.hass,t,`1`)};onRailChange=()=>{this.dialog?.open&&this.renderDialogContent()};updated(){this.dialog?.isConnected?this.renderDialogContent():this.syncWithLocation()}appearanceVars(){let e=this._config?.appearance;return e?{...Ot(e.glow),...e.compact?{"--vivid-card-chip-height":`30px`}:{}}:{}}get lightOptions(){return{transition:this._config?.tile.transition}}get detailsHash(){return this.model?.detailsEnabled===!1?void 0:this._config?.details.hash}syncWithLocation=()=>{let e=this.detailsHash;if(!e)return;let t=window.location.hash===e;t&&!this.dialog?.open?this.showDetails():!t&&this.dialog?.open&&(this.pushedHash=!1,this.dialog.hide())};openDetails=()=>{if(!this.model?.detailsEnabled){this.model&&$e(this,this.model.entityId);return}let e=this.detailsHash;if(e&&window.location.hash!==e){window.history.pushState(null,``,e),this.pushedHash=!0,window.dispatchEvent(new CustomEvent(`location-changed`,{detail:{replace:!1}}));return}this.showDetails()};closeDetails=()=>{let e=this.detailsHash;if(e&&window.location.hash===e){this.pushedHash?(this.pushedHash=!1,window.history.back()):(window.history.replaceState(null,``,window.location.pathname+window.location.search),window.dispatchEvent(new CustomEvent(`location-changed`,{detail:{replace:!0}})));return}this.dialog?.hide()};showDetails(){this.model&&(this.dialog||(this.dialog=new vn,this.dialog.addEventListener(`vivid-dialog-close-request`,this.closeDetails),this.dialog.addEventListener(`vivid-more-info`,this.onDialogMoreInfo),this.dialog.addEventListener(`vivid-source-select`,(e=>this.rail?.sendInput(e.detail.index)))),this.renderDialogContent(),this.dialog.show())}renderDialogContent(){if(!this.dialog||!this.model)return;this.dialog.label=this.model.name,this.dialog.closeLabel=B(this.hass,`close`),this.dialog.wide=this.model.members.length>1,this.dialog.removeAttribute(`style`);for(let[e,t]of Object.entries(this.appearanceVars()))this.dialog.style.setProperty(e,t);let e=this.rail;this.dialog.content=T`<vivid-led-group-details
      .hass=${this.hass}
      .model=${this.model}
      .config=${this._config}
      .side=${this.side}
      .box=${e?.boxModel??this.side?.box}
      .phases=${e?.phases??{}}
    ></vivid-led-group-details>`}onDialogMoreInfo=e=>{let t=e.detail.entityId;this.closeDetails(),window.setTimeout(()=>$e(this,t),50)};onMoreInfo=e=>{e.stopPropagation(),$e(this,e.detail.entityId)};onTileGesture=e=>{e.stopPropagation();let t=this._config,n=this.model;t&&n&&this.hass&&mt({tap:t.tile.tapAction,hold:n.holdAction,double_tap:t.tile.doubleTapAction}[e.detail.gesture],{node:this,hass:this.hass,entityId:n.entityId,openDetails:n.detailsEnabled?this.openDetails:void 0})};subtitle(e,t){let n=[];if(this.screen&&n.push(B(this.hass,`led_ambilight_mode`)),e.isGroup&&e.available){let t=e.detected.filter(e=>e.isOn).length;n.push(`${t}/${e.detected.length}`)}return t.power.enabled&&e.hasPower&&e.watts!==void 0&&n.push(yn(this.hass,e.watts)),n.length?n.join(` · `):void 0}toggleAmbilight=()=>{let e=this.model?.liveOverride;this.hass&&e&&e.available.length!==0&&(P(this,`light`),ot(this.hass,e.available,e.active?`0`:`1`))};renderAmbilightChip(e,t){let n=e.liveOverride;if(!t.ambilight.enabled||!n||this.side&&!di(this.side))return D;let r=n.available.length>0,i=!n.active;return T`<vivid-chip
      .icon=${`mdi:television-ambient-light`}
      .tooltip=${r?B(this.hass,i?`led_ambilight_stop`:`led_ambilight_start`):B(this.hass,`live_override_unavailable`)}
      .tone=${i&&r?Kt(this.screen?this.screenColors:si,!0):en(!1)}
      .pressed=${i}
      ?disabled=${!r}
      @click=${this.toggleAmbilight}
    ></vivid-chip>`}renderLineActions(e,t){let n=(this.screen?this.screenColors:void 0)??(e.colors.length?e.colors:e.rgb),r=this.screen;return T`<span slot="actions" class="tile-actions">
      ${this.renderAmbilightChip(e,t)}
      <vivid-chip
        wide
        .icon=${`mdi:power`}
        .tooltip=${B(this.hass,e.isOn?`power_off`:`power_on`)}
        .tone=${Kt(n,e.isOn,e.brightness,t.appearance.glowBoost)}
        .pressed=${e.isOn}
        ?disabled=${!e.available}
        @click=${()=>{this.hass&&(P(this,`light`),et(this.hass,e.entityId,this.lightOptions))}}
      ></vivid-chip>
      ${r?D:T`<button
              type="button"
              class=${`reset chevron${this._expanded?` open`:``}`}
              aria-expanded=${this._expanded?`true`:`false`}
              aria-label=${B(this.hass,this._expanded?`led_collapse`:`led_expand`)}
              title=${B(this.hass,this._expanded?`led_collapse`:`led_expand`)}
              @click=${this.toggleFold}
            >
              <ha-icon .icon=${`mdi:chevron-down`}></ha-icon>
            </button>`}
    </span>`}render(){let e=this._config,t=this.model;if(!e||!this.hass)return D;if(!t||!this.hass.states[e.entity])return T`<ha-card><div class="warning">Entity not found: ${e.entity}</div></ha-card>`;let n=e.layout===`collapsible`,r=this.side,i=this.screen,a=i?this.screenColors:void 0,o=e.appearance.header&&!n?T`<vivid-light-header
            .hass=${this.hass}
            .icon=${t.icon}
            .name=${t.name}
            name-interactive
            .lightEntity=${t.entityId}
            .available=${t.available}
            .isOn=${t.isOn}
            .rgb=${t.rgb}
            .colors=${a??t.colors}
            .brightness=${t.brightness}
            .glowBoost=${e.appearance.glowBoost}
            .lightOptions=${this.lightOptions}
            .showPower=${e.power.enabled}
            .hasPower=${t.hasPower}
            .watts=${t.watts}
            .scale=${t.groupScale}
            .showLiveOverride=${e.ambilight.enabled&&(!r||di(r))}
            .liveOverride=${t.liveOverride}
            @vivid-name-click=${this.openDetails}
            @vivid-more-info=${this.onMoreInfo}
          ></vivid-light-header>`:D,s=T`<vivid-light-tile
      .hass=${this.hass}
      .entityId=${t.entityId}
      .icon=${t.icon}
      .name=${t.name}
      .showEffects=${e.tile.effects&&!i}
      .showState=${e.tile.state!==`none`||n}
      .colorBar=${i?`none`:t.tileColorBar}
      .saturationBar=${e.tile.saturationBar&&!i}
      .doubleTap=${e.tile.doubleTapAction.action!==`none`}
      .favorites=${i?[]:e.tile.favorites}
      .badges=${t.badges}
      @vivid-more-info=${this.onMoreInfo}
      .brightnessMin=${e.tile.brightnessMin}
      .brightnessStep=${e.tile.brightnessStep}
      .lightOptions=${this.lightOptions}
      .animateEffects=${e.appearance.animateEffects}
      .collapsible=${n}
      .collapsed=${n&&(i||!this._expanded)}
      .subtitle=${n?this.subtitle(t,e):void 0}
      .capture=${a}
      .captureDrift=${this.drift}
      .captureLabel=${B(this.hass,`led_screen_colors`)}
      @vivid-take-control=${this.takeControl}
      @vivid-gesture=${this.onTileGesture}
      >${n?this.renderLineActions(t,e):D}</vivid-light-tile
    >`,c=r?T`<div class="surface rail">
          ${s}
          <vivid-ambilight-rail
            .hass=${this.hass}
            .railConfig=${r.rail}
            .drive=${r.drive}
            .screen=${i}
            .screenColors=${this.screenColors}
            .drift=${this.drift}
            .lightColors=${t.colors.length?t.colors:t.rgb?[t.rgb]:[]}
            @vivid-rail-change=${this.onRailChange}
          ></vivid-ambilight-rail>
        </div>`:s;return T`<ha-card>
      <div class="card" style=${k(this.appearanceVars())}>${o}${c}</div>
    </ha-card>`}}),sn({type:fa,name:`Vivid LED group`,description:`Light group with brightness, color, effects, glowing consumption badges and a details dialog per strip. WLED aware.`,preview:!0,documentationURL:`${R}#vivid-led-group`});var Qs=`vivid-lamp-group`,$s=[`light`,`switch`,`group`,`input_boolean`],ec=[`ambiance`,`line`],tc=[`small`,`medium`,`large`],nc=[`toggle`,`details`,`more-info`,`none`];function Y(e){throw Error(`${Qs}: ${e}`)}function rc(e,t){if(e!=null&&e!==``)return typeof e!=`string`&&Y(`"${t}" must be text.`),e.trim()||void 0}function ic(e,t,n){return e==null?n:(typeof e!=`boolean`&&Y(`"${t}" must be true or false.`),e)}function ac(e,t,n){if(e==null||e===``)return;let r=typeof e==`number`?e:Number(e);return(!Number.isFinite(r)||r<n)&&Y(`"${t}" must be a number of at least ${n}.`),r}function oc(e,t,n){if(e!=null&&e!==``)return(typeof e!=`string`||!n.includes(e))&&Y(`"${t}" must be one of: ${n.join(`, `)}.`),e}function sc(e,t){return oc(typeof e==`object`&&e?e.action:e,t,nc)}function cc(e,t){if(e!=null)return(!Array.isArray(e)||e.some(e=>typeof e!=`string`))&&Y(`"${t}" must be a list of entity ids.`),e.map(e=>e.trim()).filter(Boolean)}function lc(e){let t=/* @__PURE__ */ new Map;if(e==null)return t;Array.isArray(e)||Y(`"members" must be a list.`);for(let n of e){(typeof n!=`object`||!n)&&Y(`each member must be an object.`);let e=n,r=rc(e.entity,`members[].entity`);r||Y(`each member needs an "entity".`),t.set(r,{name:rc(e.name,`members[].name`),icon:rc(e.icon,`members[].icon`),iconOff:rc(e.icon_off,`members[].icon_off`),powerSensor:rc(e.power_sensor,`members[].power_sensor`),hidden:ic(e.hidden,`members[].hidden`,!1)})}return t}function uc(e){return e==null?[]:(Array.isArray(e)||Y(`"scenes" must be a list.`),e.map((e,t)=>{(typeof e!=`object`||!e)&&Y(`each scene must be an object.`);let n=e,r=rc(n.name,`scenes[${t}].name`);r||Y(`scenes[${t}] needs a "name".`);let i=cc(n.lamps,`scenes[${t}].lamps`),a=rc(n.scene,`scenes[${t}].scene`);return a&&A(a)!==`scene`&&Y(`"${a}" is not a scene.`),!a&&i===void 0&&Y(`scenes[${t}] needs "lamps" (the lamps it turns on) or a "scene".`),{name:r,icon:rc(n.icon,`scenes[${t}].icon`)??(a?`mdi:palette`:i?.length?`mdi:lamps`:`mdi:power-off`),lamps:a?void 0:i,scene:a}}))}function dc(e){let t=ac(e,`columns`,1);return t!==void 0&&(!Number.isInteger(t)||t>12)&&Y(`"columns" must be a whole number from 1 to 12.`),t}function fc(e){(typeof e!=`object`||!e)&&Y(`invalid configuration.`);let t=e,n=rc(t.entity,`entity`),r=cc(t.entities,`entities`);!n&&!r?.length&&Y(`set "entity" to a group of lamps, or list "entities".`);for(let e of[n,...r??[]])e&&!$s.includes(A(e))&&Y(`"${e}" must be a light, a switch or a group of them.`);t.layout!==void 0&&!ec.includes(t.layout)&&Y(`"layout" must be one of: ${ec.join(`, `)}.`);let i=t.glow===void 0?100:Dt(t.glow);i===void 0&&Y(`"glow" must be a percentage from 0 to 200, or ${wt.join(`, `)}.`);let a=rc(t.price_entity,`price_entity`);return a&&A(a)!==`sensor`&&A(a)!==`input_number`&&Y(`"price_entity" must be a sensor or an input_number.`),{type:String(t.type??``),entity:n,entities:r?.length?r:void 0,name:rc(t.name,`name`),icon:rc(t.icon,`icon`),layout:t.layout??`ambiance`,showHeader:ic(t.show_header,`show_header`,!0),showCount:ic(t.show_count,`show_count`,!0),showToggleAll:ic(t.show_toggle_all,`show_toggle_all`,!0),showNames:ic(t.show_names,`show_names`,!0),showStatus:ic(t.show_status,`show_status`,!0),size:oc(t.size,`size`,tc)??`medium`,columns:dc(t.columns),expandable:ic(t.expandable,`expandable`,!0),expanded:ic(t.expanded,`expanded`,!1),tapAction:sc(t.tap_action,`tap_action`)??`toggle`,holdAction:sc(t.hold_action,`hold_action`)??`details`,showPower:ic(t.show_power,`show_power`,!0),showDuration:ic(t.show_duration,`show_duration`,!0),showEnergy:ic(t.show_energy,`show_energy`,!0),price:ac(t.price,`price`,0),priceEntity:a,maxWatts:ac(t.max_watts,`max_watts`,1)??60,warnBelow:ac(t.warn_below,`warn_below`,0)??1,glow:i,members:lc(t.members),scenes:uc(t.scenes)}}function pc(e,t,n=()=>[]){let r=t.entities??(t.entity?[t.entity]:void 0);if(!r)return n();let i=r.flatMap(t=>qe(e,t));return[...new Set(i)]}function mc(e,t){let n=Zi(t.map(t=>M(e,t)));return t.map((t,r)=>{let i=e.states[t];return{entityId:t,name:n[r]??t,state:i,available:j(i)}})}function hc(e,t){return!!e.entities||t>1||!e.entity}function gc(e,t){return[...e.entity?[e.entity]:[],...e.entities??[],...t]}function _c(e,t){if(e.length!==0)switch(t){case`sum`:return e.reduce((e,t)=>e+t,0);case`min`:return Math.min(...e);case`max`:return Math.max(...e);case`median`:{let t=[...e].sort((e,t)=>e-t),n=Math.floor(t.length/2);return t.length%2?t[n]:(t[n-1]+t[n])/2}default:return e.reduce((e,t)=>e+t,0)/e.length}}function vc(e,t){let n=e?Date.parse(e.last_changed):NaN;return Number.isFinite(n)?Math.max(0,Math.round((t-n)/1e3)):0}function yc(e,t=()=>1){if(!j(e))return;let n=Number.parseFloat(e.state);if(Number.isFinite(n))return n*t(e.attributes.unit_of_measurement)}var bc={"alarm-light":`alarm-light-outline`,"ceiling-light":`ceiling-light-outline`,"ceiling-light-multiple":`ceiling-light-multiple-outline`,"coffee-maker":`coffee-maker-outline`,"coffee-maker-check":`coffee-maker-check-outline`,"desk-lamp":`desk-lamp-off`,fan:`fan-off`,flashlight:`flashlight-off`,"floor-lamp":`floor-lamp-outline`,"floor-lamp-dual":`floor-lamp-dual-outline`,"floor-lamp-torchiere":`floor-lamp-torchiere-outline`,"floor-lamp-torchiere-variant":`floor-lamp-torchiere-variant-outline`,"globe-light":`globe-light-outline`,"head-lightbulb":`head-lightbulb-outline`,"home-lightbulb":`home-lightbulb-outline`,"home-lightning-bolt":`home-lightning-bolt-outline`,kettle:`kettle-outline`,"kettle-alert":`kettle-alert-outline`,"kettle-steam":`kettle-steam-outline`,lamp:`lamp-outline`,lamps:`lamps-outline`,"light-switch":`light-switch-off`,lightbulb:`lightbulb-outline`,"lightbulb-alert":`lightbulb-alert-outline`,"lightbulb-auto":`lightbulb-auto-outline`,"lightbulb-cfl":`lightbulb-cfl-off`,"lightbulb-cfl-spiral":`lightbulb-cfl-spiral-off`,"lightbulb-fluorescent-tube":`lightbulb-fluorescent-tube-outline`,"lightbulb-group":`lightbulb-group-outline`,"lightbulb-multiple":`lightbulb-multiple-outline`,"lightbulb-night":`lightbulb-night-outline`,"lightbulb-on":`lightbulb-on-outline`,"lightbulb-question":`lightbulb-question-outline`,"lightbulb-spot":`lightbulb-spot-off`,"lightbulb-variant":`lightbulb-variant-outline`,"lightning-bolt":`lightning-bolt-outline`,"monitor-speaker":`monitor-speaker-off`,"power-plug":`power-plug-outline`,"power-plug-battery":`power-plug-battery-outline`,radio:`radio-off`,radioactive:`radioactive-off`,"radioactive-circle":`radioactive-circle-outline`,"radiology-box":`radiology-box-outline`,speaker:`speaker-off`,"string-lights":`string-lights-off`,television:`television-off`,"television-classic":`television-classic-off`,"television-speaker":`television-speaker-off`,"track-light":`track-light-off`,"traffic-light":`traffic-light-outline`,"wall-sconce":`wall-sconce-outline`,"wall-sconce-flat":`wall-sconce-flat-outline`,"wall-sconce-flat-variant":`wall-sconce-flat-variant-outline`,"wall-sconce-round":`wall-sconce-round-outline`,"wall-sconce-round-variant":`wall-sconce-round-variant-outline`};function xc(e){let t=bc[e.replace(/^mdi:/,``)];return t?`mdi:${t}`:e}var Sc=5e3,Cc=.6;function wc(e,t){let n=e.states[t]?.attributes.icon;return typeof n==`string`&&n?n:void 0}function Tc(e,t){return e===void 0?Cc:.25+.65*F(e/Math.max(t,1),0,1)}function Ec(e){let t=e?.attributes.brightness;return typeof t==`number`?t/255*100:void 0}function Dc(e,t,n){return e===void 0&&t!==void 0?.25+t/100*.65:Tc(e,n)}function Oc(e,t){if(t.priceEntity){let n=Qe(e.states[t.priceEntity]);if(n!==void 0)return n}return t.price}function kc(e,t,n,r){let i=n.filter(e=>e.available);if(i.length===0)return!1;if(t.lamps){let e=new Set(t.lamps);return i.every(t=>t.isOn===e.has(t.entityId))}let a=t.scene?e.states[t.scene]:void 0,o=a?Date.parse(a.state):NaN;if(!Number.isFinite(o)||r!==void 0&&r>o)return!1;let s=a?.attributes.entity_id,c=new Set(Array.isArray(s)?s.map(String):[]);return i.every(t=>{let n=Date.parse(e.states[t.entityId]?.last_changed??``);if(!Number.isFinite(n))return!0;let r=c.size===0||c.has(t.entityId)?Sc:0;return n<=o+r})}function Ac(e,t,n=Date.now(),r){let i=pc(e,t),a=Zi(i.map(t=>M(e,t))),o=/* @__PURE__ */ new Set([...t.entity?[t.entity]:[],...t.entities??[],...i]),s=i.map((r,i)=>{let s=t.members.get(r),c=e.states[r],l=j(c),u=l&&c.state===`on`,d=s?.icon??wc(e,r)??`mdi:lamp`,f=a[i]??r,p={entityId:r,name:s?.name??f,autoName:f,icon:d,iconOff:s?.iconOff??xc(d),available:l,isOn:u,since:vc(c,n),hidden:s?.hidden??!1,warn:!1,level:0};return(t.showPower||t.warnBelow>0)&&(p.power=ua(e,r,{},{sensor:s?.powerSensor}),p.power&&(p.watts=da(e,p.power),o.add(p.power.entityId))),p.level=u?Dc(p.watts,Ec(c),t.maxWatts):0,p.warn=u&&t.warnBelow>0&&p.watts!==void 0&&p.watts<t.warnBelow&&p.since>=60,p}),c=s.filter(e=>e.available),l=c.filter(e=>e.isOn),u=s.filter(e=>e.watts!==void 0),d=u.length?u.reduce((e,t)=>e+(t.watts??0),0):void 0,f=s.filter(e=>e.power!==void 0).length,p=t.maxWatts*Math.max(f,1);for(let e of t.scenes)e.scene&&o.add(e.scene);t.priceEntity&&o.add(t.priceEntity);let m=t.entity&&Array.isArray(e.states[t.entity]?.attributes.entity_id)?t.entity:void 0,h=t.icon??(m?wc(e,m):void 0)??`mdi:lamps`,g=t.entity??t.entities?.[0];return{name:t.name??(m?M(e,m):void 0)??(i.length===1&&g?M(e,g):B(e,`lamps_title`)),icon:h,iconOff:xc(h),groupEntity:m,all:s,lamps:s.filter(e=>!e.hidden),on:l.length,total:c.length,watts:d,hasPower:f>0,scale:{idle:.5,max:p,steps:[p*.35,p*.7]},level:l.length?Math.max(...l.map(e=>e.level)):0,warnings:s.filter(e=>e.warn).length,scenes:t.scenes.map(t=>({...t,active:kc(e,t,s,r)})),price:Oc(e,t),currency:e.config?.currency??`EUR`,watched:[...o]}}function jc(e,t){let n=/* @__PURE__ */ new Map;for(let t of e){let e=A(t),r=[`light`,`switch`,`input_boolean`].includes(e)?e:`homeassistant`;n.set(r,[...n.get(r)??[],t])}return[...n.entries()].map(([e,n])=>({domain:e,service:t?`turn_on`:`turn_off`,entityIds:n}))}function Mc(e,t){if(e.scene)return[{domain:`scene`,service:`turn_on`,entityIds:[e.scene]}];let n=new Set(e.lamps??[]),r=t.filter(e=>e.available),i=r.filter(e=>n.has(e.entityId)&&!e.isOn),a=r.filter(e=>!n.has(e.entityId)&&e.isOn);return[...jc(i.map(e=>e.entityId),!0),...jc(a.map(e=>e.entityId),!1)]}function Nc(e,t){let n=L(tn,e);return!t||!n.background?n:{...n,background:`linear-gradient(${n.background}, ${n.background}), ${t}`}}function Pc(e){return e.filter(e=>!!e).map(e=>e.replaceAll(` `,`\xA0`)).join(`\xA0· `)}function Fc(e,t){return`${V(e,t,+(t<10))} W`}function Ic(e,t,n){if(!t.available)return B(e,`unavailable`);let r=n.showDuration&&t.since>=60?mn(e,t.since):void 0;if(!t.isOn)return Pc([B(e,`lamp_off`),r]);let i=n.showPower&&t.watts!==void 0?Fc(e,t.watts):void 0;return Pc(t.warn&&n.explainWarning?[i,B(e,`lamp_no_draw`)]:[i,r])||B(e,`lamp_on`)}var Lc=`vivid-lamp-group:expanded:`,Rc=/* @__PURE__ */ new Map;function zc(e){return e.layout===`line`&&e.expandable}function Bc(e){let t=e.entity??e.entities?.join(`,`);return t?`${Lc}${t}`:void 0}function Vc(){try{return globalThis.localStorage??void 0}catch{return}}function Hc(e){return`${+!!e.expanded}:${+!!e.base}`}function Uc(e){let t=/^([01]):([01])$/.exec(e??``);if(t)return{expanded:t[1]===`1`,base:t[2]===`1`}}function Wc(e,t){try{return Uc(e?.getItem(t))}catch{return}}function Gc(e,t=Vc()){if(!zc(e))return!1;let n=Bc(e);if(!n)return e.expanded;let r=Rc.get(n)??Wc(t,n);return r&&r.base===e.expanded?r.expanded:e.expanded}function Kc(e,t,n=Vc()){let r=Bc(e);if(!r)return;let i={expanded:t,base:e.expanded};Rc.set(r,i);try{n?.setItem(r,Hc(i))}catch{}}z(`vivid-lamp-group-details`,class extends O{static properties={hass:{attribute:!1},model:{attribute:!1},showPower:{type:Boolean},showDuration:{type:Boolean},showEnergy:{type:Boolean},spans:{attribute:!1},energy:{attribute:!1}};constructor(){super(),this.showPower=!0,this.showDuration=!0,this.showEnergy=!0}static styles=[H,U,o`
      :host {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .head {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 2px 10px;
        padding: 0 6px 6px;
      }
      .title {
        font-size: 18px;
        font-weight: 600;
      }
      .summary {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .row {
        display: grid;
        grid-template-columns: 40px minmax(0, 1fr) minmax(48px, 28%) 40px;
        align-items: center;
        gap: 12px;
        padding: 6px 10px 6px 6px;
        border-radius: 18px;
        background: var(--vivid-layer-1);
      }
      .row.off {
        background: color-mix(in srgb, var(--vivid-layer-1) 60%, transparent);
      }
      .disc {
        position: relative;
        display: grid;
        place-items: center;
        /* Halo proportions of a 40 px disc (see glowSize). */
        --vivid-glow-size: 1.11;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--disc-bg, rgba(var(--vivid-rgb-text), 0.08));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
        transition:
          background 0.4s ease,
          box-shadow 0.4s ease,
          color 0.4s ease;
      }
      .disc ha-icon {
        --mdc-icon-size: 20px;
        display: inline-flex;
      }
      .warn {
        position: absolute;
        right: -3px;
        bottom: -3px;
        display: grid;
        place-items: center;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--error-color, #db4437);
        color: #fff;
        box-shadow: 0 0 0 2px var(--vivid-layer-1);
      }
      .warn ha-icon {
        --mdc-icon-size: 12px;
      }
      .text {
        display: flex;
        flex-direction: column;
        min-width: 0;
        text-align: left;
      }
      .name {
        font-size: 14px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .status {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        font-size: 12px;
        line-height: 1.35;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        overflow: hidden;
      }
      .status.alert {
        color: var(--error-color, #db4437);
      }
      .timeline {
        position: relative;
        height: 8px;
        border-radius: 4px;
        background: rgba(var(--vivid-rgb-text), 0.08);
        overflow: hidden;
      }
      .timeline span {
        position: absolute;
        top: 0;
        bottom: 0;
        min-width: 3px;
        border-radius: 4px;
        background: var(--span);
      }
      .toggle {
        position: relative;
        width: 40px;
        height: 24px;
        border-radius: 12px;
        background: rgba(var(--vivid-rgb-text), 0.18);
        transition: background-color 0.2s ease;
      }
      .toggle::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-text-color);
        opacity: 0.85;
        transition: transform 0.2s ease;
      }
      .toggle[aria-checked='true'] {
        background: var(--amber-color, ${a(I(tn))});
      }
      .toggle[aria-checked='true']::after {
        transform: translateX(16px);
        background: #fff;
        opacity: 1;
      }
      .toggle:disabled,
      .disc:disabled {
        opacity: 0.45;
        cursor: default;
      }
      .labels {
        display: grid;
        grid-template-columns: 40px minmax(0, 1fr) minmax(48px, 28%) 40px;
        gap: 12px;
        padding: 0 10px 0 6px;
        font-size: 10px;
        color: var(--secondary-text-color);
      }
      .labels .scale {
        grid-column: 3;
        display: flex;
        justify-content: space-between;
      }
      .foot {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 8px;
        padding: 8px 6px 2px;
        font-size: 13px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }
      .foot b {
        color: var(--primary-text-color);
        font-weight: 600;
      }
      @media (prefers-reduced-motion: reduce) {
        .disc,
        .toggle,
        .toggle::after {
          transition: none;
        }
      }
    `];toggle(e){this.hass&&e.available&&(P(this,`light`),N(this,`vivid-lamp-switched`),et(this.hass,e.entityId))}renderTimeline(e){let t=this.spans?.[e.entityId];return T`<div class="timeline" style=${k({"--span":I(tn,.85)})}>
      ${(t??[]).map(([e,t])=>T`<span style=${`left: ${e*100}%; width: ${(t-e)*100}%`}></span>`)}
    </div>`}renderRow(e){let t=this.hass,n=e.isOn?Nc(e.level):void 0,r=this.energy?.lamps[e.entityId],i=Ic(t,e,{showPower:this.showPower,showDuration:this.showDuration,explainWarning:!0});return T`<div class=${W({row:!0,off:!e.isOn})}>
      <button
        type="button"
        class="reset disc"
        style=${k({"--disc-bg":n?.background,"--disc-shadow":n?.shadow,"--disc-color":n?.iconColor})}
        ?disabled=${!e.available}
        aria-label=${`${e.name} · ${B(t,e.isOn?`power_off`:`power_on`)}`}
        @click=${()=>this.toggle(e)}
      >
        <ha-icon .icon=${e.isOn?e.icon:e.iconOff}></ha-icon>
        ${e.warn?T`<span class="warn"><ha-icon icon="mdi:lightbulb-alert-outline"></ha-icon></span>`:D}
      </button>
      <button
        type="button"
        class="reset text"
        title=${r!==void 0&&this.showEnergy?B(t,`energy_today`,{e:cs(t,r)}):e.name}
        @click=${()=>N(this,`vivid-more-info`,{entityId:e.entityId})}
      >
        <span class="name">${e.name}</span>
        <span class=${W({status:!0,alert:e.warn})}>${i}</span>
      </button>
      ${this.renderTimeline(e)}
      <button
        type="button"
        class="reset toggle"
        role="switch"
        aria-checked=${e.isOn?`true`:`false`}
        aria-label=${e.name}
        ?disabled=${!e.available}
        @click=${()=>this.toggle(e)}
      ></button>
    </div>`}renderFoot(){let e=this.model,t=this.energy;if(!e||!this.showEnergy||!e.hasPower||!t)return D;let n=this.hass,r=e.price===void 0?void 0:ls(n,t.total/1e3*e.price,e.currency),[i=``,a=``]=B(n,`energy_today`,{e:`\0`}).split(`\0`);return T`<div class="foot">
      <span>${i}<b>${cs(n,t.total)}</b>${a}</span>
      ${r?T`<span>·</span><span><b>${r}</b></span>`:D}
    </div>`}render(){let e=this.model;if(!e)return D;let t=this.hass,n=[B(t,`lights_on`,{on:e.on,total:e.total}),this.showPower&&e.watts!==void 0?Fc(t,e.watts):void 0,e.warnings?B(t,e.warnings===1?`lamps_warn_one`:`lamps_warn`,{n:e.warnings}):void 0].filter(Boolean);return T`<div class="head">
        <span class="title">${e.name}</span>
        <span class="summary">${n.join(` · `)}</span>
      </div>
      ${Ko(e.lamps,e=>e.entityId,e=>this.renderRow(e))}
      <div class="labels">
        <span class="scale"><span>0 h</span><span>${B(t,`now`)}</span></span>
      </div>
      ${this.renderFoot()}`}});var qc={layout:`ambiance`,show_header:!0,show_count:!0,show_toggle_all:!0,show_names:!0,show_status:!0,size:`medium`,expandable:!0,expanded:!1,tap_action:`toggle`,hold_action:`details`,show_power:!0,show_duration:!0,show_energy:!0,max_watts:60,warn_below:1,glow:100};function Jc(e){let t={...e};for(let[e,n]of Object.entries(t))(n==null||n===``||qc[e]===n||Array.isArray(n)&&n.length===0)&&delete t[e];return t}function Yc(e,t,n){let r=[...e.members??[]],i=r.findIndex(e=>e.entity===t),a={...i===-1?{entity:t}:r[i],...n};for(let[e,t]of Object.entries(a))(t===void 0||t===``||e===`hidden`&&t===!1)&&delete a[e];let o=a,s=Object.keys(o).length===1;return i===-1?s||r.push(o):s?r.splice(i,1):r[i]=o,{...e,members:r}}function Xc(e,t,n){let r=[...e.scenes??[]];return n?r[t]=n:r.splice(t,1),{...e,scenes:r}}z(`vivid-lamp-group-editor`,class extends O{static properties={hass:{attribute:!1},_config:{state:!0},_open:{state:!0},_openLamp:{state:!0}};constructor(){super(),this._open=/* @__PURE__ */ new Set}setConfig(e){this._config=e}connectedCallback(){super.connectedCallback(),go().then(()=>this.requestUpdate())}t(e,t){return yo(this.hass,e,t)}commit(e){let t=Jc(e);this._config=t,N(this,`config-changed`,{config:t})}form(e,t,n,r,i={}){return T`<ha-form
      .hass=${this.hass}
      .data=${t}
      .schema=${e}
      .computeLabel=${e=>r[e.name]}
      .computeHelper=${e=>i[e.name]}
      @value-changed=${e=>{e.stopPropagation(),n(e.detail.value)}}
    ></ha-form>`}section(e,t,n,r,i){let a=this._open.has(e);return T`<details
      class="section"
      ?open=${a}
      @toggle=${t=>{let n=t.target.open;if(n===this._open.has(e))return;let r=new Set(this._open);n?r.add(e):r.delete(e),this._open=r}}
    >
      <summary>
        <ha-icon .icon=${t}></ha-icon>
        <span class="section-title">${n}</span>
        <span class="hint">${r}</span>
        <ha-icon class="chevron" .icon=${`mdi:chevron-down`}></ha-icon>
      </summary>
      <div class="section-body">${a?i():D}</div>
    </details>`}renderMain(e){let t=ec.map(e=>({value:e,label:this.t(`lamp_layout_${e}`)}));return this.form([{name:`entity`,selector:{entity:{domain:$s}}},{name:`entities`,selector:{entity:{domain:$s,multiple:!0}}},{type:`grid`,name:``,schema:[{name:`name`,selector:{text:{}}},{name:`icon`,selector:{icon:{}}}]},{name:`layout`,selector:{select:{mode:`dropdown`,options:t}}}],{entity:e.entity,entities:e.entities,name:e.name,icon:e.icon,layout:e.layout??`ambiance`},t=>this.commit({...e,entity:t.entity,entities:t.entities,name:t.name,icon:t.icon,layout:t.layout}),{entity:this.t(`lamp_entity`),entities:this.t(`lamp_entities`),name:this.t(`name`),icon:this.t(`icon`),layout:this.t(`lamp_layout`)})}renderLamp(e,t){let n=this._openLamp===e.entityId,r=t.members?.find(t=>t.entity===e.entityId),i=()=>{this._openLamp=n?void 0:e.entityId},a=e.power&&e.power.entityId!==r?.power_sensor?e.power.entityId:void 0;return T`<div class=${W({lamp:!0,open:n,hidden:e.hidden})}>
      <button type="button" class="lamp-head" aria-expanded=${String(n)} @click=${i}>
        <span class=${W({dot:!0,on:e.isOn})}
          ><ha-icon .icon=${e.isOn?e.icon:e.iconOff}></ha-icon
        ></span>
        <span class="lamp-name">${e.name}</span>
        <span class="hint">${e.power?e.power.entityId:this.t(`no_power`)}</span>
        <ha-icon class="chevron" .icon=${`mdi:chevron-down`}></ha-icon>
      </button>
      ${n?T`<div class="lamp-body">
        ${this.form([{type:`grid`,name:``,schema:[{name:`name`,selector:{text:{}}},{name:`power_sensor`,selector:{entity:{domain:[`sensor`]}}}]},{type:`grid`,name:``,schema:[{name:`icon`,selector:{icon:{}}},{name:`icon_off`,selector:{icon:{}}}]}],{name:r?.name,power_sensor:r?.power_sensor,icon:r?.icon,icon_off:r?.icon_off},n=>this.commit(Yc(t,e.entityId,{name:n.name||void 0,power_sensor:n.power_sensor||void 0,icon:n.icon||void 0,icon_off:n.icon_off||void 0})),{name:this.t(`member_name`),power_sensor:this.t(`power_sensor`),icon:this.t(`icon_on`),icon_off:this.t(`icon_off`)},{name:this.t(`member_name_helper`,{name:e.autoName}),power_sensor:a?this.t(`lamp_sensor_auto`,{sensor:a}):this.t(`lamp_sensor_none`),icon:this.t(`icon_auto`,{icon:e.icon}),icon_off:this.t(`icon_auto`,{icon:e.iconOff})})}
        <label class="switch-row">
          <span>${this.t(`lamp_visible`)}</span>
          <input
            type="checkbox"
            role="switch"
            class="switch"
            .checked=${!e.hidden}
            @change=${n=>this.commit(Yc(t,e.entityId,{hidden:!n.target.checked}))}
          />
        </label>
      </div>`:D}
    </div>`}renderScene(e,t,n,r){let i=e.scene===void 0?`lamps`:`scene`,a=new Set(e.lamps??[]),o=e=>this.commit(Xc(n,t,e));return T`<div class="scene">
      ${this.form([{type:`grid`,name:``,schema:[{name:`name`,selector:{text:{}}},{name:`icon`,selector:{icon:{}}}]},{name:`kind`,selector:{select:{mode:`dropdown`,options:[{value:`lamps`,label:this.t(`scene_kind_lamps`)},{value:`scene`,label:this.t(`scene_kind_scene`)}]}}},...i===`scene`?[{name:`scene`,selector:{entity:{domain:[`scene`]}}}]:[]],{name:e.name,icon:e.icon,kind:i,scene:e.scene},t=>{let n={name:t.name??``,...t.icon?{icon:t.icon}:{}};t.kind===`scene`?n.scene=t.scene??``:n.lamps=e.lamps??[],o(n)},{name:this.t(`scene_name`),icon:this.t(`icon`),kind:this.t(`scene_kind`),scene:this.t(`scene_entity`)})}
      ${i===`lamps`?T`<div class="label">${this.t(`scene_lamps`)}</div>
              <div class="picks">
                ${r.all.map(t=>T`<button
                      type="button"
                      class=${W({pick:!0,on:a.has(t.entityId)})}
                      aria-pressed=${String(a.has(t.entityId))}
                      @click=${()=>{let n=new Set(a);n.has(t.entityId)?n.delete(t.entityId):n.add(t.entityId),o({...e,lamps:r.all.map(e=>e.entityId).filter(e=>n.has(e))})}}
                    >
                      <ha-icon .icon=${t.icon}></ha-icon>${t.name}
                    </button>`)}
              </div>`:D}
      <div class="scene-actions">
        <button
          type="button"
          class="text-button danger"
          @click=${()=>this.commit(Xc(n,t,void 0))}
        >
          <ha-icon .icon=${`mdi:delete-outline`}></ha-icon>${this.t(`scene_remove`)}
        </button>
      </div>
    </div>`}renderScenes(e,t){let n=e.scenes??[];return T`${n.length?D:T`<div class="hint">${this.t(`scenes_none`)}</div>`}
      ${n.map((n,r)=>this.renderScene(n,r,e,t))}
      <button
        type="button"
        class="text-button"
        @click=${()=>this.commit({...e,scenes:[...n,{name:this.t(`scene_default_name`,{n:n.length+1}),lamps:[]}]})}
      >
        <ha-icon .icon=${`mdi:plus`}></ha-icon>${this.t(`scene_add`)}
      </button>`}renderPower(e){let t=this.hass?.config?.currency??`EUR`;return this.form([{type:`grid`,name:``,schema:[{name:`show_power`,selector:{boolean:{}}},{name:`show_duration`,selector:{boolean:{}}}]},{name:`show_energy`,selector:{boolean:{}}},{type:`grid`,name:``,schema:[{name:`price`,selector:{number:{min:0,step:1e-4,mode:`box`,unit_of_measurement:`${t}/kWh`}}},{name:`price_entity`,selector:{entity:{domain:[`sensor`,`input_number`]}}}]},{type:`grid`,name:``,schema:[{name:`max_watts`,selector:{number:{min:1,max:500,step:1,mode:`box`,unit_of_measurement:`W`}}},{name:`warn_below`,selector:{number:{min:0,max:20,step:.1,mode:`box`,unit_of_measurement:`W`}}}]}],{show_power:e.show_power??!0,show_duration:e.show_duration??!0,show_energy:e.show_energy??!0,price:e.price,price_entity:e.price_entity,max_watts:e.max_watts??60,warn_below:e.warn_below??1},t=>this.commit({...e,...t}),{show_power:this.t(`show_power`),show_duration:this.t(`show_duration`),show_energy:this.t(`show_energy`),price:this.t(`price`),price_entity:this.t(`price_entity`),max_watts:this.t(`max_watts`),warn_below:this.t(`warn_below`)},{price:this.t(`price_helper`),price_entity:this.t(`price_entity_helper`),max_watts:this.t(`max_watts_helper`),warn_below:this.t(`warn_below_helper`)})}renderAppearance(e){let t=Dt(e.glow??100)??100,n=(e.layout??`ambiance`)===`line`,r=!n||(e.expandable??!0),i=tc.map(e=>({value:e,label:this.t(`lamp_size_${e}`)})),a=(e,t)=>({type:`grid`,name:``,schema:t?[e,t]:[e]}),o=e=>({name:e,selector:{boolean:{}}}),s=[...n?[]:[a(o(`show_header`),o(`show_count`))],n?a(o(`show_count`),o(`show_toggle_all`)):a(o(`show_toggle_all`)),...n?[a(o(`expandable`),...e.expandable??!0?[o(`expanded`)]:[])]:[],...r?[a(o(`show_names`),o(`show_status`))]:[],a({name:`size`,selector:{select:{mode:`dropdown`,options:i}}},...r?[{name:`columns`,selector:{number:{min:1,max:12,step:1,mode:`box`}}}]:[]),{name:`glow`,selector:Et}];return this.form(s,{show_header:e.show_header??!0,show_count:e.show_count??!0,show_toggle_all:e.show_toggle_all??!0,show_names:e.show_names??!0,show_status:e.show_status??!0,expandable:e.expandable??!0,expanded:e.expanded??!1,size:e.size??`medium`,columns:e.columns,glow:t},n=>{let r={...e,...n};n.glow===t&&(r.glow=e.glow),this.commit(r)},{show_header:this.t(`lamp_show_header`),show_count:this.t(`lamp_show_count`),show_toggle_all:this.t(`lamp_show_toggle_all`),show_names:this.t(`lamp_show_names`),show_status:this.t(`lamp_show_status`),expandable:this.t(`lamp_expandable`),expanded:this.t(`lamp_expanded`),size:this.t(`lamp_size`),columns:this.t(`lamp_columns`),glow:this.t(`glow`)},{columns:this.t(`lamp_columns_helper`),expanded:this.t(`lamp_expanded_helper`),glow:this.t(`glow_helper`)})}renderGestures(e){let t=e=>typeof e==`object`&&e?e.action:e,n={select:{mode:`dropdown`,options:nc.map(e=>({value:e,label:this.t(e===`more-info`?`action_more_info`:`action_${e}`)}))}};return this.form([{type:`grid`,name:``,schema:[{name:`tap_action`,selector:n},{name:`hold_action`,selector:n}]}],{tap_action:t(e.tap_action)??`toggle`,hold_action:t(e.hold_action)??`details`},t=>this.commit({...e,...t}),{tap_action:this.t(`tap_action`),hold_action:this.t(`hold_action`)})}render(){let e=this._config,t=this.hass;if(!e||!t)return D;let n,r;try{n=fc({...e,type:e.type??`custom:vivid-lamp-group`})}catch(e){r=e.message}let i=n?Ac(t,n):void 0,a=i?.all??[],o=e.scenes?.length??0;return T`<div class="editor">
      ${this.renderMain(e)} ${r?T`<div class="error">${r}</div>`:D}
      ${i&&n?T`<div class="sections">
              ${this.section(`lamps`,`mdi:lamps`,this.t(`lamps_section`),`${a.length} · ${this.t(`lamps_hint`)}`,()=>a.map(t=>this.renderLamp(t,e)))}
              ${this.section(`scenes`,`mdi:palette-outline`,this.t(`scenes_section`),o?String(o):this.t(`scenes_hint`),()=>this.renderScenes(e,i))}
              ${this.section(`power`,`mdi:flash`,this.t(`section_power`),i.hasPower?`${i.all.filter(e=>e.power).length}/${a.length}`:this.t(`no_power`),()=>this.renderPower(e))}
              ${this.section(`appearance`,`mdi:creation`,this.t(`section_appearance`),[e.show_names===!1&&e.show_status===!1?this.t(`lamp_icons_only`):void 0,this.t(`lamp_size_${e.size??`medium`}`),`${Dt(e.glow??100)??100} %`].filter(Boolean).join(` · `),()=>this.renderAppearance(e))}
              ${this.section(`gestures`,`mdi:gesture-tap`,this.t(`section_gestures`),this.t(`lamp_gestures_hint`),()=>this.renderGestures(e))}
            </div>`:D}
    </div>`}static styles=[H,o`
      :host {
        display: block;
      }
      .editor,
      .sections {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        flex: none;
      }
      .error {
        color: var(--error-color, #db4437);
        font-size: 13px;
      }
      .hint {
        color: var(--secondary-text-color);
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
      }
      .label {
        font-size: 13px;
        font-weight: 500;
        margin: 10px 0 6px;
      }
      .section {
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
        border-radius: 12px;
        overflow: hidden;
      }
      summary {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        cursor: pointer;
        list-style: none;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      .section-title {
        font-weight: 500;
        flex: none;
      }
      summary .hint {
        flex: 1;
      }
      .chevron {
        margin-left: auto;
        transition: transform 0.2s ease;
      }
      .section[open] > summary .chevron,
      .lamp.open .chevron {
        transform: rotate(180deg);
      }
      .section-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 4px 14px 14px;
      }
      .lamp {
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.04);
      }
      .lamp.hidden .lamp-name {
        opacity: 0.55;
      }
      .lamp-head {
        appearance: none;
        border: none;
        background: none;
        color: inherit;
        font: inherit;
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        cursor: pointer;
        text-align: left;
      }
      .lamp-name {
        font-weight: 500;
        flex: none;
      }
      .lamp-head .hint {
        flex: 1;
      }
      .dot {
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: rgba(var(--vivid-rgb-text), 0.08);
        color: var(--secondary-text-color);
      }
      .dot.on {
        background: rgba(255, 193, 7, 0.3);
        color: var(--amber-color, #ffc107);
      }
      .lamp-body {
        padding: 2px 10px 10px;
      }
      .switch-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 8px;
        font-size: 14px;
      }
      .scene {
        padding: 10px;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.04);
      }
      .picks {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .pick {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 32px;
        padding: 0 12px;
        border-radius: 16px;
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
        background: none;
        color: var(--secondary-text-color);
        font: inherit;
        font-size: 13px;
        cursor: pointer;
      }
      .pick.on {
        border-color: transparent;
        background: rgba(255, 193, 7, 0.3);
        color: var(--primary-text-color);
      }
      .pick.on ha-icon {
        color: var(--amber-color, #ffc107);
      }
      .scene-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
      }
      .text-button {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        align-self: flex-start;
        padding: 6px 10px;
        border: none;
        border-radius: 8px;
        background: none;
        color: var(--primary-color, #03a9f4);
        font: inherit;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
      }
      .text-button.danger {
        color: var(--error-color, #db4437);
      }
    `]});var Zc=500,Qc=10,$c=3e4,el=`var(--vivid-layer-1)`,tl=`var(--amber-color, rgb(255, 193, 7))`,nl={small:{disc:44,icon:22,mini:28,miniIcon:16,warn:16},medium:{disc:56,icon:28,mini:32,miniIcon:18,warn:20},large:{disc:68,icon:34,mini:40,miniIcon:22,warn:22}};function rl(e,t){return t.kind===`current`?t.voltage/1e3:e.states[t.entityId]?.attributes.unit_of_measurement===`kW`?1e3:1}z(Qs,class extends O{static properties={hass:{attribute:!1},_config:{state:!0},_expanded:{state:!0}};model;dialog;press;ticker;history;loading=!1;switchedAt;constructor(){super(),this._expanded=!1}static getConfigElement(){return document.createElement(`vivid-lamp-group-editor`)}static getStubConfig(e){let t=Object.values(e?.states??{}),n=t.filter(e=>[`switch`,`light`].includes(A(e.entity_id))&&Array.isArray(e.attributes.entity_id)),r=t=>e?.entities?.[String(t)]?.platform===`wled`;return{entity:(n.find(e=>A(e.entity_id)===`switch`)??n.find(e=>!e.attributes.entity_id.every(e=>r(e)))??n[0])?.entity_id??t.find(e=>A(e.entity_id)===`switch`)?.entity_id??`switch.lamps`}}setConfig(e){this._config=fc(e),this._expanded=Gc(this._config),this.history=void 0}getCardSize(){let e=this._config;if(!e)return 3;let t=e.showNames||e.showStatus;return e.layout===`line`?this._expanded?1+(t||e.size===`large`?2:1):1:+!!e.showHeader+ +!!e.scenes.length+(t||e.size===`large`?2:1)}getGridOptions(){if(this._config&&zc(this._config))return{columns:12,min_columns:6,rows:`auto`,min_rows:1};let e=this.getCardSize();return{columns:12,min_columns:6,rows:e,min_rows:e}}static styles=[H,U,o`
      :host {
        display: block;
      }
      ha-card {
        height: 100%;
        box-sizing: border-box;
        background: none;
        border: none;
        box-shadow: none;
        overflow: visible;
      }
      .card {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      vivid-light-header {
        padding: 0 4px;
      }
      .panel {
        --vivid-chip-context: var(--vivid-layer-2);
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 12px;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
      }
      .scenes {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .lamps {
        display: grid;
        grid-template-columns: var(
          --lamp-columns,
          repeat(auto-fit, minmax(max(var(--lamp-min, 66px), calc(var(--lamp-disc) + 10px)), 1fr))
        );
        gap: 12px 4px;
        padding: 2px 0 4px;
      }
      .lamp {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 0;
        padding: 4px 2px;
        border-radius: 16px;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }
      .lamp:active .disc,
      .mini:active {
        transform: scale(0.94);
      }
      .disc {
        position: relative;
        display: grid;
        place-items: center;
        --vivid-glow-size: var(--lamp-disc-glow);
        width: var(--lamp-disc);
        height: var(--lamp-disc);
        margin-bottom: var(--lamp-disc-gap, 4px);
        border-radius: 50%;
        background: var(--disc-bg, var(--vivid-layer-2));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--disabled-text-color, rgba(255, 255, 255, 0.4)));
        transition:
          background 0.4s ease,
          box-shadow 0.4s ease,
          color 0.4s ease,
          transform 0.12s ease;
      }
      .disc ha-icon {
        --mdc-icon-size: var(--lamp-icon);
        display: inline-flex;
      }
      .lamp .name {
        max-width: 100%;
        font-size: 14px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      /* Two lines at most on narrow cards ("off ·" / "35 min"). */
      .lamp .status {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        max-width: 100%;
        font-size: 12px;
        line-height: 1.35;
        text-align: center;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        overflow: hidden;
      }
      /* Four lamps still fit on one row of a phone. */
      .panel {
        container-type: inline-size;
      }
      @container (max-width: 360px) {
        .disc {
          width: calc(var(--lamp-disc) * 0.9);
          height: calc(var(--lamp-disc) * 0.9);
        }
        .disc ha-icon {
          --mdc-icon-size: calc(var(--lamp-icon) * 0.86);
        }
        .lamp .name {
          font-size: 13px;
        }
        .lamp .status {
          font-size: 11px;
        }
      }
      .lamp.off .name {
        color: var(--secondary-text-color);
      }
      .unavailable {
        opacity: 0.45;
      }
      .warn {
        position: absolute;
        right: -2px;
        bottom: -2px;
        display: grid;
        place-items: center;
        width: var(--lamp-warn, 20px);
        height: var(--lamp-warn, 20px);
        border-radius: 50%;
        background: var(--error-color, #db4437);
        color: #fff;
        box-shadow: 0 0 0 2px var(--vivid-layer-1);
      }
      .warn ha-icon {
        --mdc-icon-size: calc(var(--lamp-warn, 20px) * 0.65);
      }
      /* One line, 64 px high; when expandable, the lamp grid unfolds under it. */
      .panel.line-card {
        gap: 0;
        padding: 0;
        --vivid-card-chip-height: 40px;
      }
      .line {
        display: flex;
        align-items: center;
        gap: 10px;
        box-sizing: border-box;
        min-height: 64px;
        padding: 12px 8px 12px 12px;
      }
      .title {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
        flex: 1 1 auto;
        align-self: stretch;
        padding: 0 2px 0 0;
        border-radius: 12px;
        text-align: left;
      }
      .group-disc {
        display: grid;
        place-items: center;
        flex: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        --vivid-glow-size: var(--lamp-group-glow);
        background: var(--disc-bg, var(--vivid-layer-2));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
        transition:
          background 0.4s ease,
          box-shadow 0.4s ease,
          color 0.4s ease;
      }
      .group-disc ha-icon {
        --mdc-icon-size: 22px;
        display: inline-flex;
      }
      .chevron {
        display: grid;
        place-items: center;
        flex: none;
        width: 28px;
        height: 40px;
        margin-left: -4px;
        border-radius: 12px;
        color: var(--secondary-text-color);
      }
      .chevron ha-icon {
        --mdc-icon-size: 22px;
        display: inline-flex;
        transition: transform 0.3s ease;
      }
      .expanded .chevron ha-icon {
        transform: rotate(180deg);
      }
      .fold {
        display: grid;
        grid-template-rows: 0fr;
        opacity: 0;
        transition:
          grid-template-rows 0.3s ease,
          opacity 0.25s ease;
      }
      .expanded .fold {
        grid-template-rows: 1fr;
        opacity: 1;
      }
      .fold-inner {
        min-height: 0;
        overflow: hidden;
      }
      /* Unfolded, the halos may spill out again, once the fold is open. */
      .expanded .fold-inner {
        animation: vivid-unclip 0.3s step-end forwards;
      }
      @keyframes vivid-unclip {
        from {
          overflow: hidden;
        }
        to {
          overflow: visible;
        }
      }
      .fold .lamps {
        padding: 0 12px 14px;
      }
      .names {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .names .name {
        font-size: 16px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .names .sub {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .minis {
        display: flex;
        justify-content: flex-end;
        gap: 4px;
        flex: none;
        /* Room for the alert badge of the last lamp. */
        padding-right: 4px;
      }
      .mini {
        position: relative;
        display: grid;
        place-items: center;
        --vivid-glow-size: var(--lamp-mini-glow);
        width: var(--lamp-mini);
        height: var(--lamp-mini);
        border-radius: 50%;
        background: var(--disc-bg, var(--vivid-layer-2));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--disabled-text-color, rgba(255, 255, 255, 0.4)));
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        transition:
          background 0.4s ease,
          box-shadow 0.4s ease,
          color 0.4s ease,
          transform 0.12s ease;
      }
      .mini ha-icon {
        --mdc-icon-size: var(--lamp-mini-icon);
        display: inline-flex;
      }
      .mini .warn {
        width: calc(var(--lamp-mini) * 0.5);
        height: calc(var(--lamp-mini) * 0.5);
        right: -4px;
        bottom: -4px;
      }
      .mini .warn ha-icon {
        --mdc-icon-size: calc(var(--lamp-mini) * 0.34);
      }
      .warning {
        padding: 16px;
        color: var(--error-color, #db4437);
      }
      @media (prefers-reduced-motion: reduce) {
        .disc,
        .mini,
        .group-disc,
        .chevron ha-icon,
        .fold {
          transition: none;
        }
        .expanded .fold-inner {
          animation: none;
          overflow: visible;
        }
      }
    `];connectedCallback(){super.connectedCallback(),this.startTicker()}disconnectedCallback(){super.disconnectedCallback(),this.cancelPress(),this.stopTicker(),this.dialog?.unmount()}shouldUpdate(e){return!this.hass||!this._config?e.has(`_config`):e.size===1&&e.has(`hass`)?Ga(e.get(`hass`),this.hass,this.model?.watched??[]):!0}willUpdate(){this.hass&&this._config&&(this.model=Ac(this.hass,this._config,Date.now(),this.switchedAt))}updated(){this.dialog?.open&&this.renderDialogContent()}startTicker(){this.ticker??=window.setInterval(()=>{(this._config?.showDuration||this.dialog?.open)&&this.requestUpdate()},$c)}stopTicker(){this.ticker!==void 0&&window.clearInterval(this.ticker),this.ticker=void 0}call(e){let t=this.hass;if(t)for(let{domain:n,service:r,entityIds:i}of e)i.length&&t.callService(n,r,{},{entity_id:i})}toggleAll=()=>{let e=this.model;if(!e)return;let t=e.all.filter(e=>e.available).map(e=>e.entityId);this.switchedAt=Date.now(),this.call(jc(t,e.on===0))};toggleLamp(e){this.hass&&e.available&&(this.switchedAt=Date.now(),et(this.hass,e.entityId))}applyScene(e){this.model&&(P(this,`light`),e.scene||(this.switchedAt=Date.now()),this.call(Mc(e,this.model.all)))}cancelPress(){this.press&&window.clearTimeout(this.press.timer),this.press=void 0}toggleFold=()=>{let e=this._config;e&&zc(e)&&(P(this,`light`),this._expanded=!this._expanded,Kc(e,this._expanded))};run(e,t){let n=this._config;if(!n)return;if(e===`title`&&t===`tap`&&zc(n)){this.toggleFold();return}let r=e===`title`?`details`:t===`tap`?n.tapAction:n.holdAction;if(r===`none`)return;P(this,t===`hold`?`medium`:`light`);let i=this.model?.all.find(t=>t.entityId===e);r===`details`?this.openDetails():r===`more-info`&&i?$e(this,i.entityId):r===`toggle`&&i&&this.toggleLamp(i)}onPointerDown(e,t){if(e.button!==0)return;this.cancelPress();let n={target:t,pointerId:e.pointerId,x:e.clientX,y:e.clientY,held:!1,timer:window.setTimeout(()=>{n.held=!0,this.run(t,`hold`)},Zc)};this.press=n}onPointerMove=e=>{let t=this.press;t&&e.pointerId===t.pointerId&&Math.hypot(e.clientX-t.x,e.clientY-t.y)>Qc&&this.cancelPress()};onPointerUp(e,t){let n=this.press;n&&e.pointerId===n.pointerId&&n.target===t&&(this.cancelPress(),n.held||this.run(t,`tap`))}onKeyDown(e,t){e.key===`Enter`||e.key===` `?(e.preventDefault(),this.run(t,`tap`)):e.key===`ContextMenu`&&(e.preventDefault(),this.run(t,`hold`))}gestures(e){return{down:t=>this.onPointerDown(t,e),up:t=>this.onPointerUp(t,e),key:t=>this.onKeyDown(t,e)}}openDetails(){this.model&&(this.dialog||(this.dialog=new vn,this.dialog.addEventListener(`vivid-dialog-close-request`,()=>this.dialog?.hide()),this.dialog.addEventListener(`vivid-lamp-switched`,()=>{this.switchedAt=Date.now()}),this.dialog.addEventListener(`vivid-more-info`,(e=>{let t=e.detail.entityId;this.dialog?.hide(),window.setTimeout(()=>$e(this,t),50)}))),this.renderDialogContent(),this.dialog.show(),this.loadHistory())}async loadHistory(){let e=this.hass,t=this.model,n=this._config;if(!e||!t||!n||this.loading)return;let r=Date.now(),i=ts(r);if(!(this.history&&this.history.start===i&&r-this.history.fetched<3e5)){this.loading=!0;try{let a=n.showEnergy?t.all.filter(e=>!!e.power):[],[o,s]=await Promise.all([Jo(e,t.lamps.map(e=>e.entityId),i,r),qo(e,a.map(e=>e.power.entityId),i,r)]),c={};for(let t of a){let n=s[t.power.entityId];n&&(c[t.entityId]=$o(es(n,rl(e,t.power)),i,r))}this.history={start:i,fetched:r,changes:o,energy:c},this.renderDialogContent()}catch{}finally{this.loading=!1}}}spans(){let e=this.history,t=this.hass;if(!e||!t||!this.model)return;let n=Date.now(),r={};for(let i of this.model.lamps){let a=[...e.changes[i.entityId]??[]],o=t.states[i.entityId],s=o?Date.parse(o.last_changed):NaN,c=a[a.length-1];o&&Number.isFinite(s)&&(!c||s>c.t)&&a.push({t:s,s:o.state}),r[i.entityId]=Yo(a,e.start,n)}return r}energy(){let e=this.history,t=this.model;if(!e||!t)return;let n=Math.max(0,Date.now()-e.fetched)/36e5,r={},i=0;for(let a of t.all){let t=e.energy[a.entityId];if(t===void 0)continue;let o=t+(a.watts??0)*n;r[a.entityId]=o,i+=o}return{total:i,lamps:r}}renderDialogContent(){let e=this.dialog,t=this.model,n=this._config;if(e&&t&&n){e.label=t.name,e.closeLabel=B(this.hass,`close`),e.removeAttribute(`style`);for(let[t,r]of Object.entries(Ot(n.glow)))e.style.setProperty(t,r);e.content=T`<vivid-lamp-group-details
      .hass=${this.hass}
      .model=${t}
      .showPower=${n.showPower}
      .showDuration=${n.showDuration}
      .showEnergy=${n.showEnergy}
      .spans=${this.spans()}
      .energy=${this.energy()}
    ></vivid-lamp-group-details>`}}cardVars(e){let t=nl[e.size],n=e.showNames||e.showStatus;return{...Ot(e.glow),"--lamp-disc":`${t.disc}px`,"--lamp-icon":`${t.icon}px`,"--lamp-mini":`${t.mini}px`,"--lamp-mini-icon":`${t.miniIcon}px`,"--lamp-disc-glow":At(t.disc),"--lamp-mini-glow":At(t.mini),"--lamp-group-glow":At(40),"--lamp-warn":`${t.warn}px`,...n?{}:{"--lamp-min":`0px`,"--lamp-disc-gap":`0px`},...e.columns?{"--lamp-columns":`repeat(${e.columns}, minmax(0, 1fr))`}:{}}}discStyle(e){let t=e.isOn?Nc(e.level):void 0;return k({"--disc-bg":t?.background,"--disc-shadow":t?.shadow,"--disc-color":t?.iconColor})}renderWarn(e){return e.warn?T`<span
      class="warn"
      title=${B(this.hass,`lamp_no_draw_hint`,{w:Fc(this.hass,this._config?.warnBelow??1)})}
      ><ha-icon icon="mdi:lightbulb-alert-outline"></ha-icon
    ></span>`:D}renderScenes(e){return e.scenes.length?T`<div class="scenes">
      ${e.scenes.map(e=>T`<vivid-chip
            .icon=${e.icon}
            .label=${e.name}
            .tooltip=${e.name}
            .tone=${e.active?Nc(.55):void 0}
            .pressed=${e.active}
            @click=${()=>this.applyScene(e)}
          ></vivid-chip>`)}
    </div>`:D}renderLamp(e,t){let n=this.gestures(e.entityId),r=Ic(this.hass,e,t);return T`<button
      type="button"
      class=${W({reset:!0,lamp:!0,off:!e.isOn,unavailable:!e.available})}
      title=${t.showNames&&t.showStatus?``:`${e.name} · ${r}`}
      aria-pressed=${e.isOn?`true`:`false`}
      aria-label=${`${e.name} · ${r}`}
      ?disabled=${!e.available}
      @pointerdown=${n.down}
      @pointermove=${this.onPointerMove}
      @pointerup=${n.up}
      @pointercancel=${()=>this.cancelPress()}
      @keydown=${n.key}
      @contextmenu=${e=>e.preventDefault()}
    >
      <span class="disc" style=${this.discStyle(e)}>
        <ha-icon .icon=${e.isOn?e.icon:e.iconOff}></ha-icon>${this.renderWarn(e)}
      </span>
      ${t.showNames?T`<span class="name">${e.name}</span>`:D}
      ${t.showStatus?T`<span class="status">${r}</span>`:D}
    </button>`}renderAmbiance(e,t){return T`${t.showHeader?T`<vivid-light-header
          .hass=${this.hass}
          .icon=${e.on?e.icon:e.iconOff}
          .name=${e.name}
          .subtitle=${t.showCount?B(this.hass,`lights_on`,{on:e.on,total:e.total}):void 0}
          ?hide-toggle=${!t.showToggleAll}
          .iconColor=${e.on?tl:void 0}
          name-interactive
          .available=${e.total>0}
          .isOn=${e.on>0}
          .buttonTone=${Nc(e.level,el)}
          .showPower=${t.showPower}
          .hasPower=${e.hasPower}
          .watts=${e.watts}
          .scale=${e.scale}
          .showLiveOverride=${!1}
          @vivid-name-click=${()=>this.openDetails()}
          @vivid-power-click=${this.toggleAll}
        ></vivid-light-header>`:D}
      <div class="panel">
        ${this.renderScenes(e)}
        <div class="lamps">
          ${Ko(e.lamps,e=>e.entityId,e=>this.renderLamp(e,t))}
        </div>
      </div>`}renderMini(e,t){let n=this.gestures(e.entityId),r=Ic(this.hass,e,t);return T`<button
      type="button"
      class=${W({reset:!0,mini:!0,unavailable:!e.available})}
      style=${this.discStyle(e)}
      title=${`${e.name} · ${r}`}
      aria-pressed=${e.isOn?`true`:`false`}
      aria-label=${`${e.name} · ${r}`}
      ?disabled=${!e.available}
      @pointerdown=${n.down}
      @pointermove=${this.onPointerMove}
      @pointerup=${n.up}
      @pointercancel=${()=>this.cancelPress()}
      @keydown=${n.key}
      @contextmenu=${e=>e.preventDefault()}
    >
      <ha-icon .icon=${e.isOn?e.icon:e.iconOff}></ha-icon>${this.renderWarn(e)}
    </button>`}renderLine(e,t){let n=this.hass,r=[t.showCount?`${e.on}/${e.total}`:void 0,t.showPower&&e.watts!==void 0?Fc(n,e.watts):void 0].filter(Boolean).join(` · `),i=this.gestures(`title`),a=zc(t),o=a&&this._expanded,s=B(n,o?`lamp_collapse`:`lamp_expand`),c=e.on?Nc(e.level):void 0;return T`<div class=${W({panel:!0,"line-card":!0,expanded:o})}>
      <div
        class="line"
        @click=${e=>{a&&e.target===e.currentTarget&&this.toggleFold()}}
      >
        <button
          type="button"
          class=${W({reset:!0,title:!0,on:e.on>0})}
          title=${a?s:B(n,`details`)}
          aria-expanded=${a?String(o):D}
          aria-controls=${a?`fold`:D}
          @pointerdown=${i.down}
          @pointermove=${this.onPointerMove}
          @pointerup=${i.up}
          @pointercancel=${()=>this.cancelPress()}
          @keydown=${i.key}
          @contextmenu=${e=>e.preventDefault()}
        >
          <span
            class="group-disc"
            style=${k({"--disc-bg":c?.background,"--disc-shadow":c?.shadow,"--disc-color":c?.iconColor})}
            ><ha-icon .icon=${e.on?e.icon:e.iconOff}></ha-icon
          ></span>
          <span class="names"
            ><span class="name">${e.name}</span>${r?T`<span class="sub">${r}</span>`:D}</span
          >
        </button>
        ${o?D:T`<div class="minis">
                ${Ko(e.lamps,e=>e.entityId,e=>this.renderMini(e,t))}
              </div>`}
        ${t.showToggleAll?this.renderToggleAll(e):D}
        ${a?T`<button
                type="button"
                class="reset chevron"
                title=${s}
                aria-label=${s}
                aria-expanded=${String(o)}
                aria-controls="fold"
                @click=${this.toggleFold}
              >
                <ha-icon .icon=${`mdi:chevron-down`}></ha-icon>
              </button>`:D}
      </div>
      ${a?T`<div class="fold" id="fold" ?inert=${!o} aria-hidden=${String(!o)}>
              <div class="fold-inner">
                <div class="lamps">
                  ${Ko(e.lamps,e=>e.entityId,e=>this.renderLamp(e,t))}
                </div>
              </div>
            </div>`:D}
    </div>`}renderToggleAll(e){let t=this.hass;return T`<vivid-chip
      .icon=${`mdi:power`}
      .tooltip=${B(t,e.on?`power_off`:`power_on`)}
      .tone=${e.on?Nc(e.level,`var(--vivid-layer-2)`):void 0}
      .pressed=${e.on>0}
      ?disabled=${e.total===0}
      @click=${()=>{P(this,`light`),this.toggleAll()}}
    ></vivid-chip>`}render(){let e=this._config,t=this.model;return!e||!this.hass?D:!t||t.all.length===0?T`<ha-card><div class="warning">Entity not found: ${e.entity??e.entities?.join(`, `)??``}</div></ha-card>`:T`<ha-card>
      <div class="card" style=${k(this.cardVars(e))}>
        ${e.layout===`line`?this.renderLine(t,e):this.renderAmbiance(t,e)}
      </div>
    </ha-card>`}}),sn({type:Qs,name:`Vivid lamp group`,description:`Lamps on smart plugs or switches: a glowing button per lamp with what it draws and for how long, quick presets, and the energy and cost of the day.`,preview:!0,documentationURL:`${R}#vivid-lamp-group`});var il=`vivid-hyperhdr-card`,al=[`all`,`hub`,`strip`],ol=[`source`,`device`,`fps`,`leds`,`brightness`],sl=[`source`,`device`,`fps`],cl=[`input`,`video_mode`,`capture_fps`,`temperature`,`cpu`,`memory`,`version`,`strips`],ll=[`input`,`video_mode`,`capture_fps`],ul=[`temperature`,`cpu`,`memory`,`capture_fps`],dl=[`temperature`,`cpu`],fl=[`led_output`,`video_capture`,`hdr`,`smoothing`,`black_border`],pl=[`hdr`],ml=[60,120,300];function hl(e){return typeof e==`string`&&e.trim()?e.trim():void 0}function gl(e,t,n){if(!Array.isArray(e))return[...n];let r=[];for(let n of e)t.includes(n)&&!r.includes(n)&&r.push(n);return r}function _l(e){if(!e||typeof e!=`object`)throw Error(`Invalid configuration`);let t=al.includes(e.mode)?e.mode:`all`,n=Number(e.picture_timeout);return{mode:t,server:hl(e.server),instance:hl(e.instance),name:hl(e.name),hubInfo:gl(e.hub_info,cl,ll),hubValues:gl(e.hub_values,ul,dl),stripInfo:gl(e.strip_info,ol,sl),stripIcons:gl(e.strip_icons,fl,pl),showStrips:e.show_strips!==!1,showPower:e.show_power!==!1,pictureTimeout:ml.includes(n)?n:120,glow:Dt(e.glow)??100}}var vl=class extends O{static properties={hass:{attribute:!1},_config:{state:!0}};static styles=[H,o`
      :host {
        display: block;
      }
      .editor {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .status {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.05);
        font-size: 12.5px;
        line-height: 1.4;
        color: var(--secondary-text-color);
      }
      .status ha-icon {
        --mdc-icon-size: 16px;
        margin-top: 1px;
        flex: none;
      }
      .status.ok ha-icon {
        color: var(--success-color, #43a047);
      }
      .status.warn ha-icon {
        color: var(--warning-color, #ffa000);
      }
      .group {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 12px 14px 14px;
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
        border-radius: 12px;
      }
      .group-title {
        font-weight: 500;
      }
    `];setConfig(e){this._config=e}connectedCallback(){super.connectedCallback(),go().then(()=>this.requestUpdate())}t(e,t){return yo(this.hass,e,t)}commit(e){let t=e;this._config=t,N(this,`config-changed`,{config:t})}form(e,t,n,r={}){return T`<ha-form
      .hass=${this.hass}
      .data=${t}
      .schema=${e}
      .computeLabel=${e=>n[e.name]}
      .computeHelper=${e=>r[e.name]}
      @value-changed=${e=>{e.stopPropagation(),this.onChange(e.detail.value)}}
    ></ha-form>`}onChange(e){let t=this._config;if(!t)return;let n={...t};for(let t of[`server`,`instance`,`name`]){let r=typeof e[t]==`string`?e[t].trim():``;r?n[t]=r:delete n[t]}let r=al.includes(e.mode)?e.mode:`all`;n.mode=r,r!==`strip`&&delete n.instance,delete n.picture;for(let t of[`show_strips`,`show_power`])e[t]===!1?n[t]=!1:delete n[t];let i=Number(e.picture_timeout);i&&i!==120?n.picture_timeout=i:delete n.picture_timeout,typeof e.glow==`number`&&e.glow!==100?n.glow=e.glow:delete n.glow,this.commit(n)}status(){let e=this.hass;if(!e)return D;let t=cr(e),n=Object.values(t.instances).reduce((e,t)=>e+t.length,0),r=t.servers.length>0;return T`<div class="status ${r?`ok`:`warn`}">
      <ha-icon .icon=${r?`mdi:check-circle-outline`:`mdi:alert-outline`}></ha-icon>
      <span
        >${r?this.t(`hh_found`,{servers:t.servers.length,strips:n}):this.t(`hh_none_found`)}</span
      >
    </div>`}picker(e,t,n,r,i=0){let a=this._config??{type:`custom:vivid-hyperhdr-card`},o=a[e],s=Array.isArray(o)?o.filter(e=>t.includes(e)):[...n];return T`<vivid-order-picker
      .items=${t.map(e=>({value:e,label:this.t(`hh_item_${e}`),icon:r[e]}))}
      .value=${s}
      .max=${i}
      .label=${this.t(`hh_${e}`)}
      .helper=${this.t(`hh_order_helper`)}
      @value-changed=${t=>{t.stopPropagation();let r={...a};t.detail.value.length===n.length&&t.detail.value.every((e,t)=>e===n[t])?delete r[e]:r[e]=t.detail.value,this.commit(r)}}
    ></vivid-order-picker>`}render(){let e=this._config;if(!e)return D;let t=al.includes(e.mode)?e.mode:`all`,n=[{name:`mode`,selector:{select:{mode:`list`,options:al.map(e=>({value:e,label:this.t(`hh_mode_${e}`)}))}}},{name:`server`,selector:{device:{filter:{integration:ar},entity:{domain:`binary_sensor`}}}}];t===`strip`&&n.push({name:`instance`,selector:{device:{filter:{integration:ar,model:or}}}}),n.push({name:`name`,selector:{text:{}}});let r=[];t===`all`&&r.push({name:`show_strips`,selector:{boolean:{}}}),t!==`hub`&&r.push({name:`show_power`,selector:{boolean:{}}}),r.push({name:`picture_timeout`,selector:{select:{mode:`dropdown`,options:ml.map(e=>({value:String(e),label:this.t(`hh_minutes`,{n:e/60})}))}}},{name:`glow`,selector:Et});let i={mode:this.t(`hh_mode`),server:this.t(`hh_server`),instance:this.t(`hh_instance`),name:this.t(`name`),show_strips:this.t(`hh_show_strips`),show_power:this.t(`hh_show_power`),picture_timeout:this.t(`hh_picture_timeout`),glow:this.t(`amb_halo`)},a={mode:t,server:e.server??``,instance:e.instance??``,name:e.name??``,show_strips:e.show_strips!==!1,show_power:e.show_power!==!1,picture_timeout:String(e.picture_timeout??120),glow:e.glow??100},o=t!==`strip`,s=t!==`hub`;return T`<div class="editor">
      ${this.status()}
      ${this.form(n,a,i,{server:this.t(`hh_first`),instance:this.t(`hh_first`)})}
      ${o?T`<div class="group">
              <div class="group-title">${this.t(`hh_hub_line`)}</div>
              ${this.picker(`hub_info`,cl,ll,yl)}
              ${this.picker(`hub_values`,ul,dl,yl,3)}
            </div>`:D}
      ${s?T`<div class="group">
              <div class="group-title">${this.t(`hh_strip_line`)}</div>
              ${this.picker(`strip_info`,ol,sl,bl)}
              ${this.picker(`strip_icons`,fl,pl,bl,4)}
            </div>`:D}
      ${this.form(r,a,i,{picture_timeout:this.t(`hh_picture_helper`)})}
    </div>`}},yl={input:`mdi:video-input-hdmi`,video_mode:`mdi:monitor-screenshot`,capture_fps:`mdi:speedometer`,temperature:`mdi:thermometer`,cpu:`mdi:cpu-64-bit`,memory:`mdi:memory`,version:`mdi:tag-outline`,strips:`mdi:television-ambient-light`},bl={source:`mdi:import`,device:`mdi:led-strip-variant`,fps:`mdi:speedometer`,leds:`mdi:dots-horizontal`,brightness:`mdi:brightness-6`,led_output:`mdi:led-on`,video_capture:`mdi:video-input-hdmi`,hdr:`mdi:hdr`,smoothing:`mdi:waveform`,black_border:`mdi:border-none-variant`};z(`vivid-hyperhdr-card-editor`,vl);var xl=`mdi:television-ambient-light`,Sl=[167,139,250],Cl={led_output:{icon:`mdi:led-on`,label:`hh_led_output`,rgb:[102,187,106]},video_capture:{icon:`mdi:video-input-hdmi`,label:`hh_capture_switch`,rgb:Or},hdr:{icon:`mdi:hdr`,label:`hh_hdr`,rgb:[255,213,79]},smoothing:{icon:`mdi:waveform`,label:`hh_smoothing`,rgb:[186,104,200]},black_border:{icon:`mdi:border-none-variant`,label:`hh_black_border`,rgb:Or}},wl=class extends O{static properties={hass:{attribute:!1},_config:{state:!0},sampled:{state:!0}};devices;devicesFor;model;dialog;dialogTarget;constructor(){super(),this.sampled={}}static getConfigElement(){return document.createElement(`vivid-hyperhdr-card-editor`)}static getStubConfig(e){let t=e?cr(e).servers[0]:void 0;return t?{mode:`all`,server:t}:{mode:`all`}}setConfig(e){this._config=_l(e)}getCardSize(){return(this._config?.mode??`all`)!==`all`||this._config?.showStrips===!1?1:1+Math.ceil((this.model?.instances.length??1)*.8)}getGridOptions(){return{columns:12,min_columns:6,rows:`auto`}}static styles=[H,U,ks,o`
      :host {
        display: block;
      }
      ha-card {
        height: 100%;
        box-sizing: border-box;
        background: none;
        border: none;
        box-shadow: none;
        overflow: visible;
      }
      .panel {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 8px;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
        container-type: inline-size;
      }
      .panel.offline .dim {
        opacity: 0.55;
        filter: grayscale(0.8);
      }
      .line,
      .strip .open {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1 1 auto;
        min-width: 0;
        padding: 2px;
        border-radius: 16px;
        text-align: left;
      }
      .strip {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      .strip.row {
        padding: 4px 6px 4px 4px;
        border-radius: 18px;
        background: var(--vivid-layer-2);
        --vivid-layer-2: color-mix(in srgb, var(--vivid-layer-0) 45%, var(--vivid-layer-1));
      }
      .strip.row .name {
        font-size: 14px;
      }
      .values,
      .icons {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        align-items: center;
        gap: 4px 5px;
        flex: none;
        max-width: 45%;
      }
      /* The second line wraps instead of cutting what was asked for. */
      .line .status,
      .strip .status {
        white-space: normal;
        overflow: visible;
        text-overflow: clip;
      }
      .icons {
        gap: 4px;
      }
      .icons:empty {
        display: none;
      }
      .value {
        display: inline-flex;
        align-items: center;
        gap: 1px;
        font-size: 14px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .value ha-icon {
        --mdc-icon-size: 15px;
        display: inline-flex;
        color: rgb(var(--v-rgb));
      }
      /* Each value in its own color: a tinted pill, the number lit by it. */
      .value {
        padding: 2px 8px 2px 5px;
        border-radius: 12px;
        background: rgba(var(--v-rgb), 0.16);
        color: color-mix(in srgb, rgb(var(--v-rgb)) 30%, var(--primary-text-color));
      }
      .value small {
        margin-left: 1px;
        font-size: 11px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      /* A component's state: lit when on, faint when off. */
      .state {
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--disc-bg, transparent);
        color: var(--disc-color, var(--secondary-text-color));
      }
      .state.off {
        opacity: 0.45;
      }
      .state ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
      }
      .rows {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .power {
        width: 48px;
        height: 34px;
        flex: none;
      }
      .row .power {
        height: 32px;
        background: var(
          --power-bg,
          color-mix(in srgb, var(--vivid-layer-0) 70%, var(--vivid-layer-1))
        );
      }
      .warning {
        padding: 16px;
        color: var(--error-color, #db4437);
      }
      /* Narrow cards: the values go before the text does. */
      @container (max-width: 330px) {
        .values .value:not(:first-child) {
          display: none;
        }
        .icons {
          display: none;
        }
      }
    `];disconnectedCallback(){super.disconnectedCallback(),this.dialog?.unmount()}shouldUpdate(e){return!this.hass||!this._config?e.has(`_config`):e.size===1&&e.has(`hass`)?Ga(e.get(`hass`),this.hass,this.model?.watched??[]):!0}willUpdate(){let e=this.hass,t=this._config;if(!e||!t)return;(this.devicesFor!==e.entities||!this.devices)&&(this.devices=cr(e),this.devicesFor=e.entities);let n=t.mode===`strip`?t.instance??(t.server?this.devices.instances[t.server]?.[0]:Object.values(this.devices.instances)[0]?.[0]):void 0;this.model=Sr(e,this.devices,t.server,n)}updated(){this.dialog?.open&&this.renderDialogContent()}colorOf(e){let t=this.sampled[e.deviceId];return jr(e,t?.length?Tl(t):void 0)}powerColors(e){let t=this.sampled[e.deviceId];if(e.source===`capture`&&t?.length)return Ar(t);let n=this.colorOf(e);return[n,n.map(e=>Math.round(e*.7))]}toggle(e,t){t?.stopPropagation();let n=this.hass;n&&e.available&&(P(this,`light`),et(n,e.light))}openDetails(e,t=`overview`){this.model&&(this.dialogTarget={instance:e,tab:e?t:`system`},this.dialog||(this.dialog=new vn,this.dialog.addEventListener(`vivid-dialog-close-request`,()=>this.dialog?.hide()),this.dialog.addEventListener(`vivid-more-info`,(e=>{let t=e.detail.entityId;this.dialog?.hide(),window.setTimeout(()=>$e(this,t),50)})),this.dialog.addEventListener(`vivid-hyperhdr-open`,(e=>{this.openDetails(e.detail.instance)})),this.dialog.addEventListener(`vivid-screen-colors`,(e=>{let t=this.dialogTarget?.instance;t&&(this.sampled={...this.sampled,[t]:e.detail.colors})}))),P(this,`light`),this.renderDialogContent(!0),this.dialog.show())}renderDialogContent(e=!1){let t=this.dialog,n=this.model,r=this._config,i=this.dialogTarget;if(!t||!n||!r||!i)return;let a=n.strips.find(e=>e.deviceId===i.instance);t.label=a?.name??n.hub?.name??`HyperHDR`,t.closeLabel=B(this.hass,`close`);for(let[e,n]of Object.entries(Ot(r.glow)))t.style.setProperty(e,n);t.content=T`<vivid-hyperhdr-details
      .hass=${this.hass}
      .hub=${n.hub}
      .instance=${a}
      .instances=${n.strips}
      .sampled=${a?this.sampled[a.deviceId]:void 0}
      .initialTab=${e?i.tab:void 0}
      .pictureTimeout=${r.pictureTimeout}
    ></vivid-hyperhdr-details>`}renderHubLine(e,t){let n=this.hass,r=this._config;if(!r)return D;let i=bs(n,e,t.strips,r.hubInfo),a=Mr(e.health),o=(e,t,n,r,i)=>T`<span class="value ${i}" style=${k({"--v-rgb":t.join(`, `)})}
        ><ha-icon .icon=${e}></ha-icon>${n}<small>${r}</small></span
      >`,s=e.connected?r.hubValues.map(t=>{switch(t){case`temperature`:return e.temperature===void 0?D:o(`mdi:thermometer`,ws(e.temperature),q(n,e.temperature,0),`°C`,t);case`cpu`:return e.cpu===void 0?D:o(`mdi:cpu-64-bit`,Or,q(n,e.cpu,0),`%`,t);case`memory`:return e.memory===void 0?D:o(`mdi:memory`,Sl,q(n,e.memory,0),`%`,t);case`capture_fps`:return e.captureFps===void 0?D:o(`mdi:video-input-hdmi`,Or,q(n,e.captureFps,0),`fps`,t);default:return D}}):[];return T`<button
      type="button"
      class="reset line"
      title=${B(n,`details`)}
      @click=${()=>this.openDetails(void 0,`system`)}
    >
      ${Es(_r(e),a,e.health===`ok`?.7:.95)}
      <span class="names">
        <span class="name">${r.name??e.name}</span>
        <span class=${W({status:!0,[i.tone]:!0})}>${i.text}</span>
      </span>
      <span class="values">${s}</span>
    </button>`}renderPower(e){let t=this.hass,n=B(t,e.on?`power_off`:`power_on`);return T`<button
      type="button"
      class="reset power"
      role="switch"
      aria-checked=${e.on?`true`:`false`}
      aria-label=${`${e.name} · ${n}`}
      title=${n}
      ?disabled=${!e.available}
      style=${k(Ds(this.powerColors(e),e.on))}
      @click=${t=>this.toggle(e,t)}
    >
      <ha-icon icon="mdi:power"></ha-icon>
    </button>`}renderIcons(e){let t=this.hass;return(this._config?.stripIcons??[]).map(n=>{let r=Cl[n],i=e.toggles[n];if(!i)return D;let a=i.on&&e.on,o=n===`led_output`&&e.on&&!i.on?Dr:a?r.rgb:void 0,s=o?L(o,.55):void 0;return T`<span
        class=${W({state:!0,off:!o})}
        title=${`${B(t,r.label)} · ${B(t,i.on?`on`:`off`)}`}
        style=${k({"--disc-bg":s?.background,"--disc-color":s?.iconColor})}
        ><ha-icon .icon=${n===`led_output`&&!i.on?`mdi:led-off`:r.icon}></ha-icon
      ></span>`})}renderStripLine(e,t){let n=this.hass,r=this._config;if(!r)return D;let i=ys(n,e,r.stripInfo),a=e.on?this.colorOf(e):void 0;return T`<div class=${W({strip:!0,row:t})}>
      <button
        type="button"
        class="reset open"
        title=${B(n,`details`)}
        @click=${()=>this.openDetails(e.deviceId)}
      >
        ${Es(xl,a,.85,t?`small`:``)}
        <span class="names">
          <span class="name">${t?e.name:r.name??e.name}</span>
          <span class=${W({status:!0,[i.tone]:!0})}>${i.text}</span>
        </span>
        <span class="icons">${this.renderIcons(e)}</span>
      </button>
      ${r.showPower?this.renderPower(e):D}
    </div>`}render(){let e=this._config,t=this.model,n=this.hass;if(!e||!n)return D;if(!t?.hub&&!t?.instances.length)return T`<ha-card><div class="warning">${B(n,`hh_not_found`)}</div></ha-card>`;let r=t.hub,i=r?!r.connected:!1,a;if(e.mode===`strip`){let e=t.instances[0];a=e?this.renderStripLine(e,!1):T`<div class="warning">${B(n,`hh_not_found`)}</div>`}else a=e.mode===`hub`?r?this.renderHubLine(r,t):D:T`${r?this.renderHubLine(r,t):D}
      ${e.showStrips&&t.instances.length?T`<div class="rows dim">
              ${t.instances.map(e=>this.renderStripLine(e,!0))}
            </div>`:D}`;return T`<ha-card>
      <div class=${W({panel:!0,offline:i})} style=${k(Ot(e.glow))}>
        ${a}
      </div>
    </ha-card>`}};function Tl(e){return e.reduce((e,[t,n,r])=>[e[0]+t,e[1]+n,e[2]+r],[0,0,0]).map(t=>Math.round(t/e.length))}z(il,wl),sn({type:il,name:`Vivid HyperHDR`,description:`HyperHDR from the HA-HyperHDR integration: an LED strip with the captured picture, the machine it runs on, or both.`,preview:!1,documentationURL:`${R}#vivid-hyperhdr-card`});var El=[{role:`lampes`,aliases:[`lampes`,`lamps`,`lampe`,`lamp`],domains:[`switch`,`light`,`group`],feeds:`light`,badge:`vivid-lamp-badge`},{role:`leds`,aliases:[`leds`,`led`],domains:[`light`,`group`],feeds:`light`,badge:`vivid-led-badge`},{role:`interrupteurs`,aliases:[`interrupteurs`,`switches`,`interrupteur`,`switch`],domains:[`switch`,`light`,`group`],feeds:`light`,badge:`vivid-light-badge`},{role:`puissance`,aliases:[`puissance`,`power`],domains:[`sensor`],feeds:`power`},{role:`eclairement`,aliases:[`eclairement`,`illuminance`,`luminosite`,`lux`],domains:[`sensor`],feeds:`badge`,badge:`vivid-illuminance-badge`},{role:`presence`,aliases:[`presence`,`occupancy`,`mouvement`,`motion`],domains:[`binary_sensor`],feeds:`badge`,badge:`vivid-presence-badge`},{role:`fenetres`,aliases:[`fenetres`,`windows`,`fenetre`,`window`],domains:[`binary_sensor`],feeds:`badge`,badge:`vivid-window-badge`},{role:`portes`,aliases:[`portes`,`doors`,`porte`,`door`],domains:[`binary_sensor`],feeds:`badge`,badge:`vivid-door-badge`},{role:`temperature`,aliases:[`temperature`],domains:[`sensor`],feeds:`badge`,badge:`vivid-temperature-badge`},{role:`humidite`,aliases:[`humidite`,`humidity`],domains:[`sensor`],feeds:`badge`,badge:`vivid-humidity-badge`},{role:`pression`,aliases:[`pression`,`pressure`],domains:[`sensor`],feeds:`badge`,badge:`vivid-pressure-badge`},{role:`co2`,aliases:[`co2`,`air`],domains:[`sensor`],feeds:`badge`,badge:`vivid-air-quality-badge`}],Dl=new Map(El.map(e=>[e.role,e]));function Ol(e){return Dl.get(e)}function kl(e){return e.normalize(`NFD`).replace(/[̀-ͯ]/g,``).toLowerCase().replace(/[^a-z0-9]+/g,`_`).replace(/^_+|_+$/g,``)}var Al=/* @__PURE__ */ new Map;for(let e of El)for(let t of e.aliases)Al.set(kl(t),e.role);function jl(e){return Al.get(kl(e))}function Ml(e,t){let n=kl(t);if(!n)return[];let r=`${n}_`,i=/* @__PURE__ */ new Map,a=(e,t,n)=>{if(!t.startsWith(r))return;let a=Al.get(t.slice(r.length));if(!a)return;let o=Ol(a).domains.indexOf(A(e));if(o===-1)return;let s=[n===`id`?0:1,o,e],c=i.get(a);(!c||Nl(s,c.rank)<0)&&i.set(a,{found:{role:a,entity:e,via:n},rank:s})};for(let[t,n]of Object.entries(e.states)){a(t,kl(Ke(t)),`id`);let r=n.attributes.friendly_name;typeof r==`string`&&a(t,Fl(r),`name`);let i=e.entities?.[t]?.name;typeof i==`string`&&a(t,Fl(i),`name`)}return El.flatMap(e=>{let t=i.get(e.role);return t?[t.found]:[]})}function Nl(e,t){return e[0]-t[0]||e[1]-t[1]||e[2].localeCompare(t[2])}var Pl=/* @__PURE__ */ new Map;function Fl(e){let t=Pl.get(e);return t===void 0&&(Pl.size>5e3&&Pl.clear(),t=kl(e),Pl.set(e,t)),t}var Il=`vivid-room-header`,Ll=[`light`,`switch`,`group`,`input_boolean`];function Rl(e){throw Error(`${Il}: ${e}`)}function zl(e,t){if(e!=null&&e!==``)return typeof e!=`string`&&Rl(`"${t}" must be text.`),e.trim()||void 0}function Bl(e,t,n){return e==null?n:(typeof e!=`boolean`&&Rl(`"${t}" must be true or false.`),e)}function Vl(e,t){if(e!=null)return(!Array.isArray(e)||e.some(e=>typeof e!=`string`))&&Rl(`"${t}" must be a list of entity ids.`),e.map(e=>e.trim()).filter(Boolean)}function Hl(e){if(e!=null)return Array.isArray(e)||Rl(`"badges" must be a list of badge configurations.`),e.map((e,t)=>{(typeof e!=`object`||!e||Array.isArray(e))&&Rl(`badges[${t}] must be a badge configuration.`);let n=e.type;return(typeof n!=`string`||!/^custom:vivid-[a-z0-9-]+$/.test(n.trim()))&&Rl(`badges[${t}] needs a "type" such as custom:vivid-lamp-badge.`),{...e,type:n.trim()}})}function Ul(e){let t=[],n=[];if(e==null)return{roles:t,entities:n};(!Array.isArray(e)||e.some(e=>typeof e!=`string`))&&Rl(`"exclude" must be a list of roles (presence, windows…) or entity ids.`);for(let r of e){let e=r.trim();if(!e)continue;if(e.includes(`.`)){n.push(e);continue}let i=jl(e);i||Rl(`"exclude" has an unknown role "${e}". Roles: ${El.map(e=>e.role).join(`, `)} (or their English names), or an entity id.`),t.includes(i)||t.push(i)}return{roles:t,entities:n}}function Wl(e){(typeof e!=`object`||!e)&&Rl(`invalid configuration.`);let t=e,n=zl(t.room,`room`),r=n===void 0?void 0:kl(n);n!==void 0&&!r&&Rl(`"room" must be a room name such as salon.`);let i=Bl(t.discover,`discover`,r!==void 0);i&&!r&&Rl(`"discover" needs a "room".`);let{roles:a,entities:o}=Ul(t.exclude),s=zl(t.name,`name`),c=Vl(t.lights,`lights`);for(let e of c??[])Ll.includes(A(e))||Rl(`"${e}" must be a light, a switch or a group of them.`);let l=zl(t.power,`power`);l&&A(l)!==`sensor`&&Rl(`"power" must be a sensor.`),!r&&!s&&!c?.length&&!t.badges&&Rl(`set "room" (e.g. salon), or a "name" and its "lights".`);let u=t.glow===void 0?100:Dt(t.glow);return u===void 0&&Rl(`"glow" must be a percentage from 0 to 200, or ${wt.join(`, `)}.`),{type:String(t.type??``),room:r,roomLabel:n,discover:i,excludeRoles:a,excludeEntities:o,name:s,lights:c?.length?c:void 0,power:l,entity:zl(t.entity,`entity`),badges:Hl(t.badges),showSubtitle:Bl(t.show_subtitle,`show_subtitle`,!0),showBadges:Bl(t.show_badges,`show_badges`,!0),glow:u}}var Gl=[255,193,7],Kl=/* @__PURE__ */ new Set([`hs`,`rgb`,`rgbw`,`rgbww`,`xy`]);function ql(e,t){return Ml(e,t)}function Jl(e,t,n=()=>!0){let r=(t.discover&&t.room?Ml(e,t.room):[]).map(e=>({...e,excluded:t.excludeRoles.includes(e.role)||t.excludeEntities.includes(e.entity)})),i=r.filter(e=>!e.excluded),a=e=>Ol(e.role).feeds,o=t.lights??i.filter(e=>a(e)===`light`).map(e=>e.entity),s=t.power??i.find(e=>a(e)===`power`)?.entity,c=(e,t)=>e&&n(e)?[{type:`custom:${e}`,entity:t}]:[],l=[];if(t.discover){let e=t.lights?t.lights.flatMap(e=>{let t=r.find(t=>t.entity===e)?.role;return c(t?Ol(t).badge:Zl(e).replace(/^custom:/,``),e)}):[];l=i.flatMap(e=>a(e)===`light`&&t.lights?[]:c(Ol(e.role).badge,e.entity)),l=[...e,...l]}return{lights:o,power:s,roleBadges:l,found:r}}function Yl(e,t=[]){let n=[...t];return[...e.map(e=>{let t=n.findIndex(t=>typeof t.entity==`string`&&t.entity===e.entity);return t===-1?e:n.splice(t,1)[0]}),...n]}function Xl(e){let t=e.replace(/[_-]+/g,` `).trim();return t.charAt(0).toUpperCase()+t.slice(1)}function Zl(e){let t=jl(Ke(e).split(`_`).pop()??``);return t===`lampes`||t===`leds`||t===`interrupteurs`?`custom:${Ol(t).badge}`:A(e)===`switch`?`custom:vivid-lamp-badge`:`custom:vivid-light-badge`}function Ql(e,t){let n=e.states[t];if(A(t)!==`light`)return 1;let r=n?.attributes?.brightness;return typeof r==`number`?F(r/255,0,1):1}function $l(e,t){return e.states[t]?.state===`on`}function eu(e,t){if(A(t)!==`light`)return!1;let n=e.states[t]?.attributes?.supported_color_modes;return Array.isArray(n)&&n.some(e=>Kl.has(e))}function tu(e,t){let n=[],r=[],i=/* @__PURE__ */ new Set;for(let a of t){let t=[];for(let n of qe(e,a)){if(i.has(n))continue;if(i.add(n),!eu(e,n)){t.push(n);continue}let a=$l(e,n);r.push(nu(n,a?yt(e.states[n])??ht:ht,a?Ql(e,n):0))}if(t.length===0)continue;let o=t.filter(t=>$l(e,t)),s=o.length?o.reduce((t,n)=>t+Ql(e,n),0)/o.length:0;n.push(nu(a,Gl,s,o.length>0))}let a=[...n,...r],o=a.filter(e=>e.on),s=o.length;return o.forEach((e,t)=>{if(s===1){Object.assign(e,{x:50,y:25,rx:45,ry:70});return}let n=Math.min(48,24*(s-1));e.x=ru(50-n/2+n*t/(s-1)),e.y=t%2==0?22:30,e.rx=F(46-4*s,24,45),e.ry=60}),a}function nu(e,t,n,r=n>0){return{id:e,rgb:t,strength:iu(n),on:r,x:50,y:25,rx:45,ry:70}}function ru(e){return Math.round(e*10)/10}function iu(e){return Math.round(e*100)/100}function au(e,t){if(!t)return;let n=e.states[t],r=Qe(n);if(r!==void 0)return n?.attributes.unit_of_measurement===`kW`?r*1e3:r}function ou(e,t,n=()=>!0){let r=Jl(e,t,n),i=[...new Set(r.lights.flatMap(t=>qe(e,t)))],a=i.filter(t=>j(e.states[t])),o=a.filter(t=>$l(e,t)).length,s=t.name??(t.roomLabel?Xl(t.roomLabel):r.lights[0]?M(e,r.lights[0]):``),c=t.entity??r.lights[0],l=/* @__PURE__ */ new Set([...r.lights,...i]);return r.power&&l.add(r.power),c&&l.add(c),{name:s,lights:r.lights,members:i,on:o,total:a.length,unavailable:i.length>0&&a.length===0,power:au(e,r.power),sources:tu(e,r.lights),badges:Yl(r.roleBadges,t.badges),found:r.found,mainEntity:c,watched:[...l]}}function su(e){return{service:e.on>0?`turn_off`:`turn_on`,entities:[...e.lights]}}var cu=[`room`,`name`,`power`,`entity`],lu=[`show_subtitle`,`show_badges`];function uu(e){return{room:e.room??``,discover:e.discover!==!1,name:e.name??``,lights:Array.isArray(e.lights)?e.lights:[],power:e.power??``,entity:e.entity??``,show_subtitle:e.show_subtitle!==!1,show_badges:e.show_badges!==!1,glow:typeof e.glow==`number`?e.glow:100}}function du(e,t){let n={...e};for(let e of cu){let r=typeof t[e]==`string`?t[e].trim():``;r?n[e]=r:delete n[e]}let r=Array.isArray(t.lights)?t.lights.filter(e=>typeof e==`string`&&!!e):[];r.length?n.lights=r:delete n.lights,t.discover===!1?n.discover=!1:delete n.discover;for(let e of lu)t[e]===!1?n[e]=!1:delete n[e];return typeof t.glow==`number`&&t.glow!==100?n.glow=t.glow:typeof t.glow==`number`&&delete n.glow,n}function fu(e){return Array.isArray(e.exclude)?e.exclude.filter(e=>typeof e==`string`):[]}function pu(e,t){return fu(e).some(e=>e.trim()===t.entity||jl(e)===t.role)}function mu(e,t,n){let r=fu(e).filter(e=>e.trim()!==t.entity&&jl(e)!==t.role),i=n?r:[...r,t.role],a={...e};return i.length?a.exclude=i:delete a.exclude,a}var hu=[{name:`room`,selector:{text:{}}},{name:`discover`,selector:{boolean:{}}}],gu=[{name:`name`,selector:{text:{}}},{name:`lights`,selector:{entity:{domain:Ll,multiple:!0}}},{name:`power`,selector:{entity:{domain:[`sensor`]}}},{name:`entity`,selector:{entity:{}}},{type:`grid`,name:``,schema:[{name:`show_subtitle`,selector:{boolean:{}}},{name:`show_badges`,selector:{boolean:{}}}]},{name:`glow`,selector:Et}],_u={room:`rh_room`,discover:`rh_discover`,name:`rh_name`,lights:`rh_lights`,power:`rh_power`,entity:`rh_entity`,show_subtitle:`rh_show_subtitle`,show_badges:`rh_show_badges`,glow:`glow`},vu={room:`rh_room_helper`,lights:`rh_lights_helper`,entity:`rh_entity_helper`,glow:`glow_helper`};z(`vivid-room-header-editor`,class extends O{static properties={hass:{attribute:!1},_config:{state:!0}};static styles=[H,o`
      :host {
        display: block;
      }
      .editor {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .status {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.05);
        font-size: 12.5px;
        line-height: 1.4;
        color: var(--secondary-text-color);
        overflow-wrap: anywhere;
      }
      .status ha-icon {
        --mdc-icon-size: 16px;
        margin-top: 1px;
        flex: none;
      }
      .roles {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .roles-title {
        font-size: 12.5px;
        color: var(--secondary-text-color);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .role {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        max-width: 100%;
        padding: 5px 10px 5px 6px;
        border-radius: 12px;
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
        background: none;
        color: var(--secondary-text-color);
        font: inherit;
        text-align: left;
        cursor: pointer;
      }
      .role.on {
        border-color: transparent;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.14);
        color: var(--primary-text-color);
      }
      .role ha-icon {
        --mdc-icon-size: 18px;
        flex: none;
      }
      .role.on ha-icon {
        color: var(--primary-color, #03a9f4);
      }
      .role:not(.on) .role-name {
        text-decoration: line-through;
      }
      .role:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .role-text {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .role-name {
        font-size: 13px;
        font-weight: 500;
      }
      .role-id {
        font-size: 11px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .status.ok ha-icon {
        color: var(--success-color, #43a047);
      }
      .status.warn ha-icon {
        color: var(--warning-color, #ffa000);
      }
    `];setConfig(e){this._config=e}connectedCallback(){super.connectedCallback(),go().then(()=>this.requestUpdate())}t(e,t){return yo(this.hass,e,t)}onChange(e){if(!this._config)return;let t=du(this._config,e);this._config=t,N(this,`config-changed`,{config:t})}toggleRole(e,t){if(!this._config)return;let n=mu(this._config,e,t);this._config=n,N(this,`config-changed`,{config:n})}roles(){let e=this.hass,t=this._config,n=typeof t?.room==`string`?t.room.trim():``;if(!e||!t||!n||t.discover===!1)return D;let r=ql(e,n);return r.length?T`<div class="roles">
      <div class="roles-title">${this.t(`rh_roles_title`)}</div>
      <div class="chips">
        ${r.map(e=>{let n=!pu(t,e);return T`<button
            class="role ${n?`on`:``}"
            role="switch"
            aria-checked=${n?`true`:`false`}
            title=${e.entity}
            @click=${()=>this.toggleRole(e,!n)}
          >
            <ha-icon .icon=${n?`mdi:check-circle`:`mdi:minus-circle-outline`}></ha-icon>
            <span class="role-text">
              <span class="role-name">${this.t(`rh_role_${e.role}`)}</span>
              <span class="role-id">${e.entity}</span>
            </span>
          </button>`})}
      </div>
    </div>`:T`<div class="status warn">
        <ha-icon .icon=${`mdi:alert-outline`}></ha-icon>
        <span>${this.t(`rh_none_found`)}</span>
      </div>`}form(e,t){return T`<ha-form
      .hass=${this.hass}
      .data=${uu(t)}
      .schema=${e}
      .computeLabel=${e=>_u[e.name]?this.t(_u[e.name]):void 0}
      .computeHelper=${e=>vu[e.name]?this.t(vu[e.name]):void 0}
      @value-changed=${e=>{e.stopPropagation(),this.onChange({...uu(this._config??t),...e.detail.value})}}
    ></ha-form>`}render(){let e=this._config;if(!e)return D;let t=Array.isArray(e.badges)?e.badges.length:0;return T`<div class="editor">
      ${this.form(hu,e)} ${this.roles()} ${this.form(gu,e)}
      <div class="status">
        <ha-icon .icon=${`mdi:information-outline`}></ha-icon>
        <span
          >${t?this.t(`rh_badges_yaml`,{count:t}):``}
          ${this.t(`rh_badges_auto`)}</span
        >
      </div>
    </div>`}});var yu=500,bu=10,xu=.3;z(Il,class extends O{static properties={hass:{attribute:!1},_config:{state:!0}};model;slots=[];slotsKey=``;holdTimer;held=!1;start;static getConfigElement(){return document.createElement(`vivid-room-header-editor`)}static getStubConfig(e){return{room:(e?[`salon`,`chambre`,`bureau`,`cuisine`,`sdb`].find(t=>ql(e,t).length>0):void 0)??`salon`}}setConfig(e){this._config=Wl(e)}getCardSize(){return this._config?.showBadges===!1||!this.model?.badges.length?2:3}getGridOptions(){return{columns:`full`,rows:`auto`,min_columns:6}}disconnectedCallback(){super.disconnectedCallback(),this.cancelHold()}static styles=[H,U,o`
      :host {
        display: block;
      }
      ha-card {
        height: 100%;
        box-sizing: border-box;
        background: none;
        border: none;
        box-shadow: none;
        overflow: visible;
      }
      .header {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 18px 8px 12px;
        border-radius: var(--vivid-tile-radius);
      }
      .header.bare {
        padding-bottom: 14px;
      }
      .halo {
        position: absolute;
        inset: 0;
        overflow: hidden;
        border-radius: inherit;
        pointer-events: none;
        /* Fade the whole layer towards its edges, so a glow that reaches the
           border of the header dissolves into the dashboard instead of being
           cut along a straight line. */
        -webkit-mask-image: radial-gradient(farthest-side, #000 45%, transparent 100%);
        mask-image: radial-gradient(farthest-side, #000 45%, transparent 100%);
      }
      .glow {
        position: absolute;
        /* The color fades from the center to nothing at 75 % of the radii. */
        -webkit-mask-image: radial-gradient(closest-side, #000, transparent 75%);
        mask-image: radial-gradient(closest-side, #000, transparent 75%);
        transition:
          background-color 0.8s ease,
          opacity 0.6s ease,
          left 0.6s ease,
          top 0.6s ease,
          width 0.6s ease,
          height 0.6s ease;
      }
      .top {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        max-width: 100%;
      }
      .title-row {
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 100%;
      }
      .title {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        line-height: 1.25;
        color: var(--primary-text-color);
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .power {
        display: grid;
        place-items: center;
        flex: none;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: rgba(var(--vivid-rgb-text), 0.07);
        color: var(--vivid-muted);
        touch-action: manipulation;
        user-select: none;
        -webkit-user-select: none;
        transition:
          background-color 0.3s ease,
          color 0.3s ease,
          box-shadow 0.3s ease;
      }
      .power ha-icon {
        --mdc-icon-size: 20px;
      }
      .power.on {
        background: rgba(255, 193, 7, 0.28);
        color: rgb(255, 193, 7);
        box-shadow: 0 0 calc(14px * var(--vivid-glow, 1))
          rgba(255, 193, 7, calc(0.5 * var(--vivid-glow-alpha, 1)));
      }
      .power:disabled {
        cursor: default;
        opacity: 0.5;
      }
      .sub {
        font-size: 12.5px;
        line-height: 1.35;
        color: var(--vivid-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        font-variant-numeric: tabular-nums;
      }
      .sub.on {
        color: rgba(var(--vivid-rgb-text), 0.85);
      }
      .badges {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 8px;
        max-width: 100%;
      }
      .badge-error {
        display: inline-grid;
        place-items: center;
        width: 36px;
        height: 36px;
        border-radius: 18px;
        color: var(--error-color, #db4437);
        background: rgba(var(--vivid-rgb-text), 0.06);
        --mdc-icon-size: 18px;
      }
      @media (prefers-reduced-motion: reduce) {
        .glow,
        .power {
          transition: none;
        }
      }
    `];shouldUpdate(e){if(this.hass)for(let e of this.slots)e.element&&(e.element.hass=this.hass);return!this.hass||!this._config?e.has(`_config`):e.size===1&&e.has(`hass`)?Ga(e.get(`hass`),this.hass,this.model?.watched??[]):!0}willUpdate(){this.hass&&this._config&&(this.model=ou(this.hass,this._config,e=>customElements.get(e)!==void 0),this.syncBadges(this._config.showBadges?this.model.badges:[]))}syncBadges(e){let t=JSON.stringify(e);t!==this.slotsKey&&(this.slotsKey=t,this.slots=e.map((e,n)=>this.createBadge(e,`${n}:${t}`)))}createBadge(e,t){let n=e.type.replace(/^custom:/,``),r={key:t},i=document.createElement(n),a=()=>{try{i.setConfig?.({...e}),this.hass&&(i.hass=this.hass)}catch(e){r.error=e.message,r.element=void 0,this.requestUpdate()}};return r.element=i,customElements.get(n)?a():customElements.whenDefined(n).then(()=>{customElements.upgrade(i),a()}),r}callPower(){let e=this.hass,t=this.model;if(!e||!t||t.lights.length===0)return;let{service:n,entities:r}=su(t);P(this,n===`turn_off`?`medium`:`light`),e.callService(`homeassistant`,n,{},{entity_id:r})}cancelHold(){this.holdTimer!==void 0&&window.clearTimeout(this.holdTimer),this.holdTimer=void 0}onDown=e=>{e.button===0&&(this.held=!1,this.start={x:e.clientX,y:e.clientY},this.cancelHold(),this.holdTimer=window.setTimeout(()=>{this.holdTimer=void 0,this.held=!0;let e=this.model?.mainEntity;e&&(P(this,`heavy`),$e(this,e))},yu))};onMove=e=>{this.start&&this.holdTimer!==void 0&&Math.hypot(e.clientX-this.start.x,e.clientY-this.start.y)>bu&&this.cancelHold()};onUp=()=>{this.cancelHold()};onClick=e=>{if(e.stopPropagation(),this.held){this.held=!1;return}this.callPower()};subtitle(e){let t=this.hass;if(e.on===0)return e.lights.length?B(t,`room_all_off`):void 0;let n=[e.on===1?B(t,`room_on_one`):B(t,`room_on_other`,{count:e.on})];return e.power!==void 0&&n.push(`${V(t,e.power)} W`),n.join(` · `)}renderGlow(e,t){let n=e.on?Math.min(.6,xu*(.35+.65*e.strength)*t):0;return T`<span
      class="glow"
      style=${k({left:`${e.x-e.rx}%`,top:`${e.y-e.ry}%`,width:`${e.rx*2}%`,height:`${e.ry*2}%`,backgroundColor:I(e.rgb),opacity:String(Math.round(n*1e3)/1e3)})}
    ></span>`}render(){let e=this._config,t=this.model;if(!e||!t)return D;let n=this.hass,r=t.on>0,i=e.glow/100,a=e.showSubtitle?this.subtitle(t):void 0,o=this.slots,s=B(n,r?`room_turn_off`:`room_turn_on`,{room:t.name});return T`<ha-card>
      <div
        class=${W({header:!0,bare:o.length===0})}
        style=${k(Ot(e.glow))}
      >
        <div class="halo" aria-hidden="true">
          ${i>0?Ko(t.sources,e=>e.id,e=>this.renderGlow(e,i)):D}
        </div>
        <div class="top">
          <div class="title-row">
            <h2 class="title">${t.name}</h2>
            ${t.lights.length?T`<button
                    class=${W({reset:!0,power:!0,on:r})}
                    aria-label=${s}
                    title=${s}
                    aria-pressed=${r?`true`:`false`}
                    ?disabled=${t.unavailable}
                    @pointerdown=${this.onDown}
                    @pointermove=${this.onMove}
                    @pointerup=${this.onUp}
                    @pointercancel=${this.onUp}
                    @pointerleave=${this.onUp}
                    @contextmenu=${e=>e.preventDefault()}
                    @click=${this.onClick}
                  >
                    <ha-icon icon="mdi:power"></ha-icon>
                  </button>`:D}
          </div>
          ${a?T`<div class=${W({sub:!0,on:r})}>${a}</div>`:D}
        </div>
        ${o.length?T`<div class="badges">
                ${Ko(o,e=>e.key,e=>e.element&&!e.error?e.element:T`<span class="badge-error" title=${e.error??``}
                          ><ha-icon icon="mdi:alert-circle-outline"></ha-icon
                        ></span>`)}
              </div>`:D}
      </div>
    </ha-card>`}}),sn({type:Il,name:`Vivid room header`,description:`Title of a room with its power button, the lights on and the consumption, its badges, and a halo in the colors of its lights.`,preview:!0,documentationURL:`${R}#vivid-room-header`});var Su=1440,Cu=/^\d{4}-\d{2}-\d{2}$/;function wu(e){let t=/^\s*(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})\s*$/.exec(e);if(!t)return;let[n,r,i,a]=t.slice(1).map(Number);if(n>24||i>24||r>59||a>59)return;let o=n*60+r,s=i*60+a;if(!(o>Su||s>Su||o===s))return{from:o,to:s}}function Tu(e){let t=e=>`${String(Math.floor(e/60)%24).padStart(2,`0`)}:${String(e%60).padStart(2,`0`)}`;return`${t(e.from)}–${t(e.to)}`}function Eu(e){return e.from<e.to?[[e.from,e.to]]:[[e.from,Su],[0,e.to]]}function Du(e,t,n){let r=0;for(let i of e)for(let[e,a]of Eu(i))r+=Math.max(0,Math.min(n,a)-Math.max(t,e));return Math.min(r,n-t)}function Ou(e,t){return Du(e,t,t+60)/60}function ku(e){return Du(e,0,Su)/Su}function Au(e,t){return Du(e,t,t+1)>0}function ju(e){return e.getHours()*60+e.getMinutes()+e.getSeconds()/60}function Mu(e,t){if(!e.length)return;let n=Au(e,ju(new Date(t))),r=6e4,i=2*Su,a=t=>Au(e,ju(new Date(t)))===n,o=Math.floor(t/r)*r;for(let e=0;e<i&&a(o-r);e++)o-=r;let s=Math.floor(t/r)*r+r;for(let e=0;e<i&&a(s);e++)s+=r;return{offPeak:n,start:o,end:s}}function Nu(e){return e.subscription*12/365}function Pu(e,t,n){return t*e.peak+n*(e.offPeak??e.peak)}function Fu(e,t){e??t(`set "tariff" with at least "peak" (price of a kWh).`),(typeof e!=`object`||Array.isArray(e))&&t(`"tariff" must be a set of options.`);let n=e,r=(e,r)=>{let i=n[e];if(i==null||i===``){r&&t(`"tariff.${e}" is required (price of a kWh, taxes included).`);return}let a=Number(i);return(!Number.isFinite(a)||a<0||a>10)&&t(`"tariff.${e}" must be a price per kWh, from 0 to 10.`),a},i=r(`peak`,!0),a=r(`off_peak`,!1),o=n.off_peak_hours,s=[];if(o!=null){Array.isArray(o)||t(`"tariff.off_peak_hours" must be a list like ["22:00-06:00"].`);for(let e of o){let n=typeof e==`string`?wu(e):void 0;n||t(`"tariff.off_peak_hours": "${String(e)}" must look like "22:00-06:00".`),s.push(n)}}s.length&&a===void 0&&t(`"tariff.off_peak" is required with "off_peak_hours".`);let c=n.subscription,l=c==null||c===``?0:Number(c);(!Number.isFinite(l)||l<0)&&t(`"tariff.subscription" must be the monthly subscription, taxes included.`);let u=n.billing_day,d=u==null||u===``?1:Number(u);(!Number.isInteger(d)||d<1||d>28)&&t(`"tariff.billing_day" must be a day of the month from 1 to 28.`);let f=[],p=n.invoices;return p!=null&&(Array.isArray(p)||t(`"tariff.invoices" must be a list.`),p.forEach((e,n)=>{let r=e??{},i=`"tariff.invoices[${n}]"`,a=String(r.from??``),o=String(r.to??``);(!Cu.test(a)||!Cu.test(o)||o<a)&&t(`${i} needs "from" and "to" dates like 2026-09-12, "to" after "from".`);let s=Number(r.total);(!Number.isFinite(s)||s<0)&&t(`${i} needs "total", the amount paid.`);let c=e=>{let n=r[e];if(n==null||n===``)return;let a=Number(n);return(!Number.isFinite(a)||a<0)&&t(`${i}: "${e}" must be a number.`),a};f.push({from:a,to:o,total:s,peakKwh:c(`peak_kwh`),offPeakKwh:c(`off_peak_kwh`),kwh:c(`kwh`),subscription:c(`subscription`)})}),f.sort((e,t)=>e.from.localeCompare(t.from))),{peak:i,offPeak:a,offPeakRanges:s,subscription:l,billingDay:d,invoices:f}}function Iu(e){return t=>{throw Error(`${e}: ${t}`)}}function Lu(e,t,n){if(e!=null&&e!==``)return(typeof e!=`string`||!/^[\w.]+[:.][\w.]+$/.test(e.trim()))&&n(`"${t}" must be a statistic id, like "linky:12345678901234" or "sensor.energy".`),e.trim()}function Ru(e,t){let n=Iu(e);(typeof t!=`object`||!t)&&n(`invalid configuration.`);let r=t,i=r.name;i!=null&&typeof i!=`string`&&n(`"name" must be text.`);let a=100;if(r.glow!==void 0&&r.glow!==null&&r.glow!==``){let e=Dt(r.glow);e===void 0&&n(`"glow" must be a percentage from 0 to 200, or ${wt.join(`, `)}.`),a=e??100}return{type:String(r.type??``),glow:a,energy:Lu(r.energy,`energy`,n),cost:Lu(r.cost,`cost`,n),tariff:Fu(r.tariff,n),name:typeof i==`string`&&i.trim()?i.trim():void 0}}function zu(e,t,n,r,i){let a=e[t];return a==null||a===``?r:((typeof a!=`string`||!n.includes(a))&&i(`"${t}" must be one of: ${n.join(`, `)}.`),a)}function Bu(e,t,n,r,i,a){let o=e[t];if(o==null||o===``)return n;let s=Number(o);return(!Number.isInteger(s)||s<r||s>i)&&a(`"${t}" must be a whole number from ${r} to ${i}.`),s}var Vu={peak:.2146,off_peak:.1696,off_peak_hours:[`22:00-06:00`],subscription:15.65,billing_day:1};function Hu(e){let t=new Date(e);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}-${String(t.getDate()).padStart(2,`0`)}`}function Uu(e){let[t,n,r]=e.split(`-`).map(Number);return new Date(t,n-1,r).getTime()}function Wu(e,t){let[n,r,i]=e.split(`-`).map(Number);return Hu(new Date(n,r-1,i+t,12).getTime())}function Gu(e,t){return Math.round((Uu(t)-Uu(e))/864e5)}function Ku(e,t,n,r){let i=/* @__PURE__ */ new Map;for(let e of t??[])Number.isFinite(e.change)&&i.set(Hu(e.start),e.change);let a=/* @__PURE__ */ new Map;if(r.offPeakRanges.length)for(let e of n??[]){if(!Number.isFinite(e.change)||e.change<=0)continue;let t=new Date(e.start),n=Hu(e.start),i=Ou(r.offPeakRanges,t.getHours()*60+t.getMinutes()),o=a.get(n)??{peak:0,offPeak:0,hours:0};o.offPeak+=e.change*i,o.peak+=e.change*(1-i),o.hours+=1,a.set(n,o)}let o=[];for(let t of[...e].sort((e,t)=>e.start-t.start)){if(!Number.isFinite(t.change))continue;let e=Hu(t.start),n={date:e,start:Uu(e),kwh:Math.max(0,t.change),statCost:i.get(e)},r=a.get(e);if(r&&r.hours>=3){let e=r.peak+r.offPeak,t=e>0?n.kwh/e:0;n.peakKwh=r.peak*t,n.offPeakKwh=r.offPeak*t}o.push(n)}return o}function qu(e){return e.peakKwh!==void 0&&e.offPeakKwh!==void 0}function Ju(e,t){return e.statCost===void 0?qu(e)?Pu(t,e.peakKwh??0,e.offPeakKwh??0):e.kwh*t.peak:e.statCost}function Yu(e,t){return Ju(e,t)+Nu(t)}function Xu(e,t){let n={kwh:0,energyCost:0,subscription:0,total:0,peakKwh:0,offPeakKwh:0,days:e.length,splitDays:0},r=Nu(t);for(let i of e)n.kwh+=i.kwh,n.energyCost+=Ju(i,t),n.subscription+=r,qu(i)&&(n.peakKwh+=i.peakKwh??0,n.offPeakKwh+=i.offPeakKwh??0,n.splitDays+=1);return n.total=n.energyCost+n.subscription,n}function Zu(e,t,n){let r=e.slice(-n);return r.length?r.reduce((e,n)=>e+Ju(n,t),0)/r.length:0}function Qu(e){return dn(e)}function X(e,t,n=2){let r=e?.config?.currency||`EUR`;try{return new Intl.NumberFormat(Qu(e),{style:`currency`,currency:r,minimumFractionDigits:n,maximumFractionDigits:n}).format(t)}catch{return`${t.toFixed(n)} ${r}`}}function Z(e,t,n){let r=n??+(Math.abs(t)<10);try{return`${new Intl.NumberFormat(Qu(e),{maximumFractionDigits:r,minimumFractionDigits:0}).format(t)} kWh`}catch{return`${t.toFixed(r)} kWh`}}function $u(e,t){let n=Math.round(t*100),r=n>0?`+`:n<0?`−`:``;try{return`${r}${new Intl.NumberFormat(Qu(e)).format(Math.abs(n))} %`}catch{return`${r}${Math.abs(n)} %`}}function ed(e,t){let[n,r,i]=t.split(`-`).map(Number);try{return new Intl.DateTimeFormat(Qu(e),{day:`2-digit`,month:`2-digit`}).format(new Date(n,r-1,i,12))}catch{return`${String(i).padStart(2,`0`)}/${String(r).padStart(2,`0`)}`}}function td(e,t){let[n,r,i]=t.split(`-`).map(Number);try{return new Intl.DateTimeFormat(Qu(e),{weekday:`long`,day:`numeric`,month:`long`}).format(new Date(n,r-1,i,12))}catch{return t}}function nd(e,t,n){try{return new Intl.DateTimeFormat(Qu(e),{month:`long`,year:`numeric`}).format(new Date(t,n-1,15))}catch{return`${t}-${String(n).padStart(2,`0`)}`}}var rd=[121,134,203],id=[255,193,7],ad=[189,189,189],od=[102,187,106],sd=[255,193,7],cd=[255,112,67],ld=[[.55,[38,198,218]],[1,[255,193,7]],[1.35,[255,112,67]],[1.8,[239,83,80]]];function ud(e){return on(ld,e)}var dd=`linear-gradient(90deg, ${ld.map(([,e])=>`rgb(${e.join(`, `)})`).join(`, `)})`;function fd(e){return e===void 0?sd:e<0?od:e<=.1?sd:cd}function Q(e,t){return t===void 0?`rgb(${e.join(`, `)})`:`rgba(${e.join(`, `)}, ${t})`}function pd(e){if(!e.length)return 0;let t=[...e].sort((e,t)=>e-t),n=Math.floor(t.length/2);return t.length%2?t[n]??0:((t[n-1]??0)+(t[n]??0))/2}var md=o`
  :host {
    --energy-peak: rgb(255, 193, 7);
    --energy-off-peak: rgb(121, 134, 203);
    --energy-subscription: rgba(var(--vivid-rgb-text), 0.35);
    --energy-hatch: repeating-linear-gradient(
      135deg,
      rgba(var(--vivid-rgb-text), 0.28) 0 5px,
      rgba(var(--vivid-rgb-text), 0.1) 5px 10px
    );
  }
  .head {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .disc {
    flex: none;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--disc, rgb(255, 112, 67));
    color: #ffffff;
    box-shadow: 0 0 calc(14px * var(--vivid-glow, 1))
      rgba(var(--disc-rgb, 255, 112, 67), calc(0.5 * var(--vivid-glow-alpha, 1)));
  }
  .disc ha-icon {
    --mdc-icon-size: 22px;
    display: inline-flex;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
  }
  .grow {
    flex: 1;
    min-width: 0;
  }
  .head .grow {
    min-width: 140px;
  }
  .title {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sub {
    font-size: 12.5px;
    color: var(--vivid-muted);
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .num {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .chips {
    display: inline-flex;
    gap: 4px;
    flex: none;
  }
  .chip {
    height: 28px;
    padding: 0 10px;
    border-radius: 14px;
    background: rgba(var(--vivid-rgb-text), 0.06);
    color: var(--vivid-muted);
    font-size: 12.5px;
    font-weight: 600;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
  }
  .chip[aria-pressed='true'] {
    background: rgba(255, 193, 7, 0.2);
    color: rgb(255, 193, 7);
  }
  .badge-chip {
    height: 28px;
    padding: 0 12px;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    flex: none;
  }
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    gap: 8px;
  }
  .tile {
    padding: 10px 12px;
    border-radius: 14px;
    background: var(--vivid-layer-2);
    min-width: 0;
  }
  .tile .value {
    font-size: 17px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    font-size: 12px;
    color: var(--secondary-text-color);
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .dot {
    flex: none;
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13.5px;
    min-height: 28px;
  }
  .split {
    display: flex;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    background: rgba(var(--vivid-rgb-text), 0.08);
  }
  .split i {
    display: block;
    height: 100%;
  }
  .peak {
    background: var(--energy-peak);
  }
  .off-peak {
    background: var(--energy-off-peak);
  }
  .subscription {
    background: var(--energy-subscription);
  }
  .message {
    padding: 8px 2px;
    font-size: 13px;
    color: var(--vivid-muted);
    line-height: 1.45;
  }
  .icon-button {
    flex: none;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--secondary-text-color);
  }
  .icon-button:hover {
    background: rgba(var(--vivid-rgb-text), 0.06);
  }
  .icon-button[disabled] {
    opacity: 0.3;
    cursor: default;
  }
  .icon-button ha-icon {
    --mdc-icon-size: 20px;
    display: inline-flex;
  }
`;function hd(e){return`${(Math.max(0,Math.min(1,e))*100).toFixed(1)}%`}function gd(e){let t=e.cycle,n=t.subscription,r=Math.max(0,t.projected-n),i=t.totals;if(e.tariff&&i.days>0&&i.splitDays===i.days&&i.energyCost>0){let t=i.peakKwh*e.tariff.peak,a=i.offPeakKwh*(e.tariff.offPeak??e.tariff.peak),o=t+a>0?t/(t+a):1;return{peak:r*o,offPeak:r*(1-o),subscription:n}}return{energy:r,subscription:n}}z(`vivid-bill-summary`,class extends O{static properties={hass:{attribute:!1},view:{attribute:!1},tariff:{attribute:!1},compact:{type:Boolean}};constructor(){super(),this.compact=!1}static styles=[H,md,o`
      :host {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .amount {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 4px 10px;
      }
      .big {
        font-size: 44px;
        font-weight: 800;
        letter-spacing: -0.02em;
        font-variant-numeric: tabular-nums;
        line-height: 1.05;
      }
      :host([compact]) .big {
        font-size: 30px;
      }
      .progress {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .track {
        position: relative;
        height: 14px;
        border-radius: 7px;
        background: repeating-linear-gradient(
          135deg,
          rgba(255, 112, 67, 0.32) 0 6px,
          rgba(255, 112, 67, 0.12) 6px 12px
        );
      }
      :host([compact]) .track {
        height: 12px;
      }
      .track .done {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        border-radius: inherit;
        background: linear-gradient(90deg, rgb(255, 193, 7), rgb(255, 112, 67));
      }
      .track .end {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        border-radius: 0 7px 7px 0;
        background: var(--vivid-layer-2);
      }
      .track .mark {
        position: absolute;
        top: -5px;
        bottom: -5px;
        width: 2px;
        margin-left: -1px;
        border-radius: 1px;
        background: var(--primary-text-color);
      }
      .labels {
        position: relative;
        height: 16px;
        font-size: 11.5px;
        color: var(--vivid-muted);
      }
      .labels span {
        position: absolute;
        white-space: nowrap;
      }
      .parts {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .rows .row {
        min-height: 24px;
      }
    `];renderProgress(e){let t=e.cycle,n=e.previous?.projected,r=Math.max(t.high,n??0,t.toDate,.01),i=n===void 0?void 0:n/r,a=i===void 0?0:Math.min(.85,Math.max(.35,i));return T`<div class="progress" aria-hidden="true">
      <div class="track">
        <i class="done" style=${k({width:hd(t.toDate/r)})}></i>
        <i class="end" style=${k({width:hd(1-t.high/r)})}></i>
        ${i===void 0?D:T`<i class="mark" style=${k({left:hd(i)})}></i>`}
      </div>
      <div class="labels">
        <span style="left: 0"
          >${B(this.hass,`energy_spent`,{v:X(this.hass,t.toDate)})}</span
        >
        ${n===void 0?D:T`<span style=${k({left:hd(a),transform:`translateX(-50%)`})}
                >${B(this.hass,`energy_previous`,{v:X(this.hass,n)})}</span
              >`}
      </div>
    </div>`}renderParts(e){let t=gd(e),n=Math.max(e.cycle.projected,.01),r=this.hass,i=t.energy===void 0?[{cls:`peak`,value:t.peak??0,label:`${B(r,`energy_peak_short`)} ${X(r,t.peak??0)}`},{cls:`off-peak`,value:t.offPeak??0,label:`${B(r,`energy_off_peak_short`)} ${X(r,t.offPeak??0)}`}]:[{cls:`peak`,value:t.energy,label:B(r,`energy_part_energy`,{v:X(r,t.energy)})}];return i.push({cls:`subscription`,value:t.subscription,label:B(r,`energy_part_subscription`,{v:X(r,t.subscription)})}),T`<div class="parts">
      <div class="split" aria-hidden="true">
        ${i.map(e=>T`<i class=${e.cls} style=${k({width:hd(e.value/n)})}></i>`)}
      </div>
      <div class="legend">
        ${i.map(e=>T`<span><i class="dot ${e.cls}"></i>${e.label}</span>`)}
        ${t.energy!==void 0&&this.tariff?.offPeakRanges.length?T`<span>${B(r,`energy_split_pending`)}</span>`:D}
      </div>
    </div>`}render(){let e=this.view;if(!e)return D;let t=this.hass,n=e.cycle,r=B(t,`energy_bill_range`,{from:ed(t,n.start),to:ed(t,Wu(n.end,-1))}),i=T`<div class="amount">
      <span class="big">${X(t,n.projected)}</span>
      <span class="sub"
        >${B(t,`energy_estimated`,{day:n.dayIndex,total:n.length})}</span
      >
    </div>`;return this.compact?T`<div class="sub">${B(t,`energy_bill`)} · ${r}</div>
        ${i} ${this.renderProgress(e)}
        <div class="rows">
          <div class="row">
            <span class="grow">${B(t,`energy_pace`)}</span
            ><span class="num"
              >${B(t,`energy_per_day`,{v:X(t,e.dailyCost)})}</span
            >
          </div>
          ${e.delta!==void 0&&e.previous?T`<div class="row">
                  <span class="grow"
                    >${B(t,`energy_previous_bill`,{v:X(t,e.previous.projected)})}</span
                  ><span
                    class="num"
                    style=${k({color:Q(fd(e.delta)),fontWeight:`700`})}
                    >${$u(t,e.delta)}</span
                  >
                </div>`:D}
          <div class="row">
            <span class="grow">${B(t,`energy_subscription`)}</span
            ><span class="num">${X(t,n.subscription)}</span>
          </div>
        </div>`:T`${i} ${this.renderProgress(e)}
      <div class="tiles">
        <div class="tile">
          <div class="sub">${B(t,`energy_pace`)}</div>
          <div class="value">
            ${B(t,`energy_per_day`,{v:X(t,e.dailyCost)})}
          </div>
        </div>
        <div class="tile">
          <div class="sub">
            ${e.lastDay?ed(t,e.lastDay.date):B(t,`energy_last_day`)}
          </div>
          <div class="value">${e.lastDay?X(t,e.lastDay.cost):`—`}</div>
        </div>
        <div class="tile">
          <div class="sub">${B(t,`energy_cycle_kwh`)}</div>
          <div class="value">${Z(t,n.totals.kwh,0)}</div>
        </div>
      </div>
      ${this.renderParts(e)}`}});var _d=864e5,vd=class extends O{static properties={hass:{attribute:!1},tariff:{attribute:!1},now:{attribute:!1}};static styles=[H,md,o`
      :host {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .bar {
        position: relative;
        height: 16px;
        border-radius: 8px;
        overflow: hidden;
        background: rgba(255, 193, 7, 0.55);
      }
      .bar i {
        position: absolute;
        top: 0;
        bottom: 0;
        background: var(--energy-off-peak);
      }
      .now {
        position: relative;
        height: 0;
      }
      .now i {
        position: absolute;
        top: -24px;
        width: 2px;
        height: 20px;
        margin-left: -1px;
        border-radius: 1px;
        background: var(--primary-text-color);
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
      }
      .hours {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: var(--vivid-muted);
      }
      .dot {
        border-radius: 50%;
      }
    `];render(){let e=this.tariff;if(!e)return D;let t=this.hass,n=this.now??Date.now(),r=new Date(n),i=r.getHours()*60+r.getMinutes(),a=e.offPeakRanges.flatMap(e=>e.from<e.to?[{from:e.from,to:e.to}]:[{from:e.from,to:1440},{from:0,to:e.to}]),o=Mu(e.offPeakRanges,n),s;if(o){let t=o.offPeak?Mu(e.offPeakRanges,o.end+6e4):void 0,n=o.offPeak?t?.end:o.end,r=n===void 0?void 0:Mu(e.offPeakRanges,n+6e4);r&&r.end-r.start<_d&&(s=Tu({from:yd(r.start),to:yd(r.end)}))}return T`<div class="sub">${td(t,bd(n))}</div>
      ${e.offPeakRanges.length?T`<div class="bar" aria-hidden="true">
                ${a.map(e=>T`<i
                      style=${k({left:`${(e.from/14.4).toFixed(2)}%`,width:`${((e.to-e.from)/14.4).toFixed(2)}%`})}
                    ></i>`)}
              </div>
              <div class="now" aria-hidden="true">
                <i style=${k({left:`${(i/14.4).toFixed(2)}%`})}></i>
              </div>
              <div class="hours">
                <span>0 h</span><span>6 h</span><span>12 h</span><span>18 h</span><span>24 h</span>
              </div>`:D}
      ${e.offPeak===void 0?T`<div class="row">
              <i class="dot peak"></i
              ><span class="grow">${B(t,`energy_single_price`)}</span
              ><span class="num">${X(t,e.peak,4)}</span>
            </div>`:T`<div class="row">
                <i class="dot off-peak"></i
                ><span class="grow">${B(t,`energy_off_peak`)}</span
                ><span class="num">${X(t,e.offPeak,4)}</span>
              </div>
              <div class="row">
                <i class="dot peak"></i><span class="grow">${B(t,`energy_peak`)}</span
                ><span class="num">${X(t,e.peak,4)}</span>
              </div>`}
      ${s?T`<div class="sub">${B(t,`energy_next_off_peak`,{range:s})}</div>`:D}`}};function yd(e){let t=new Date(e);return t.getHours()*60+t.getMinutes()}function bd(e){let t=new Date(e);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}-${String(t.getDate()).padStart(2,`0`)}`}z(`vivid-tariff-timeline`,vd),z(`vivid-recent-days`,class extends O{static properties={hass:{attribute:!1},view:{attribute:!1}};static styles=[H,md,o`
      :host {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .bars {
        position: relative;
        display: flex;
        gap: 4px;
      }
      .day {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .slot {
        height: 64px;
        display: flex;
        align-items: flex-end;
      }
      .slot i {
        display: block;
        width: 18px;
        border-radius: 5px;
      }
      .day span {
        font-size: 10.5px;
        color: var(--vivid-muted);
      }
      .mean {
        position: absolute;
        left: 0;
        right: 0;
        border-top: 1px dashed rgba(var(--vivid-rgb-text), 0.5);
      }
    `];render(){let e=this.view,t=this.hass;if(!e?.days.length)return T`<div class="message">${B(t,`energy_no_data`)}</div>`;let n=Math.max(...e.days.map(e=>e.kwh),.01),r=e.last,i=e=>{let[n,r,i]=e.split(`-`).map(Number);try{return new Intl.DateTimeFormat(dn(t),{weekday:`short`}).format(new Date(n,r-1,i,12))}catch{return e.slice(8)}};return T`<div class="sub">
        ${B(t,`energy_last_days`,{n:e.days.length,v:Z(t,e.meanKwh)})}
      </div>
      <div class="bars" aria-hidden="true">
        ${e.days.map(e=>T`<div class="day">
              <div class="slot">
                <i
                  style=${k({height:`${Math.max(3,e.kwh/n*64).toFixed(0)}px`,background:Q(ud(e.ratio))})}
                ></i>
              </div>
              <span>${i(e.date)}</span>
            </div>`)}
        <i
          class="mean"
          style=${k({top:`${(64-e.meanKwh/n*64).toFixed(0)}px`})}
        ></i>
      </div>
      ${r?T`<div class="row">
                <span class="grow">${td(t,r.date)}</span
                ><span class="num">${Z(t,r.kwh)}</span
                ><span class="num">${X(t,r.cost)}</span>
              </div>
              <div class="row">
                <span class="grow">${B(t,`energy_vs_mean`)}</span
                ><span
                  class="num"
                  style=${k({color:Q(r.ratio>1.1?cd:r.ratio<.9?[102,187,106]:id),fontWeight:`700`})}
                  >${$u(t,r.ratio-1)}</span
                >
              </div>`:D}`}});var xd=3e5,Sd=/* @__PURE__ */ new Map;function Cd(e,t){let n=Date.now(),r=Sd.get(e);if(r&&n-r.at<xd)return r.value;let i=t();return Sd.set(e,{at:n,value:i}),i.catch(()=>Sd.delete(e)),i}function wd(e){return e.callWS?Cd(`prefs`,async()=>{let t=await e.callWS({type:`energy/get_prefs`})??{},n={devices:[]};for(let e of t.energy_sources??[]){if(e.type!==`grid`)continue;let t=e.flow_from?.[0];n.energy??=e.stat_energy_from??t?.stat_energy_from??void 0,n.cost??=e.stat_cost??t?.stat_cost??void 0}return n.devices=(t.device_consumption??[]).flatMap(e=>e.stat_consumption?[{stat:e.stat_consumption,name:e.name||void 0,includedIn:e.included_in_stat||void 0}]:[]),n}):Promise.resolve({devices:[]})}function Td(e,t,n,r,i){if(!e.callWS||!t.length)return Promise.resolve({});let a=[...new Set(t)].sort();return Cd(`stats|${i}|${a.join(`,`)}|${Math.floor(n/6e4)}|${Math.floor(r/36e5)}`,async()=>{let t=await e.callWS({type:`recorder/statistics_during_period`,start_time:new Date(n).toISOString(),end_time:new Date(r).toISOString(),statistic_ids:a,period:i,types:[`change`],units:{energy:`kWh`}}),o={};for(let[e,n]of Object.entries(t??{}))o[e]=n.map(e=>({start:typeof e.start==`number`?e.start:Date.parse(e.start),change:typeof e.change==`number`?e.change:NaN})).filter(e=>Number.isFinite(e.start)&&Number.isFinite(e.change)).sort((e,t)=>e.start-t.start);return o})}async function Ed(e,t=Date.now()){let{hass:n,tariff:r,needs:i}=e,a=await wd(n),o=e.energy??a.energy,s=e.cost??(e.energy?void 0:a.cost),c=Hu(t),l=Uu(Wu(c,-(i.days-1))),u=Uu(Wu(c,1)),d=o?await Td(n,s?[o,s]:[o],l,u,`day`):{},f=o&&i.hourlyDays>0?await Td(n,[o],Uu(Wu(c,-i.hourlyDays)),u,`hour`):{},p=o?f[o]??[]:[],m=o?Ku(d[o]??[],s?d[s]:void 0,p,r):[],h=[];if(i.devices&&a.devices.length){let e=Uu(Wu(c,-((i.deviceDays??i.days)-1))),t=await Td(n,a.devices.map(e=>e.stat),e,u,`day`);h=a.devices.map(e=>{let n=t[e.stat]??[];return{...e,daily:n,kwh:n.reduce((e,t)=>e+Math.max(0,t.change),0)}})}return{sources:a,energyId:o,costId:s,days:m,hourly:p,devices:h,today:c,loadedAt:t}}var Dd=9e5,Od=class{host;inputs;data;error;loading=!1;key;timer;session=0;constructor(e,t){this.host=e,this.inputs=t,e.addController(this)}hostConnected(){this.key=void 0}hostDisconnected(){this.stop()}hostUpdated(){let e=this.inputs();if(!e||!this.host.isConnected)return;let t=JSON.stringify([e.energy,e.cost,e.needs,e.tariff.offPeakRanges]);t!==this.key&&(this.key=t,this.stop(),this.load(),this.timer=window.setInterval(()=>void this.load(),Dd))}async load(){let e=this.inputs();if(!e)return;let t=++this.session;this.loading=!0;try{let n=await Ed(e);if(t!==this.session)return;this.data=n,this.error=n.energyId?void 0:`no_source`}catch(e){if(t!==this.session)return;this.error=e.message||`error`}finally{t===this.session&&(this.loading=!1,this.host.requestUpdate())}}stop(){this.timer!==void 0&&window.clearInterval(this.timer),this.timer=void 0}},kd=class extends O{static properties={hass:{attribute:!1},_config:{state:!0}};energy=new Od(this,()=>this.hass&&this._config?{hass:this.hass,energy:this._config.energy,cost:this._config.cost,tariff:this._config.tariff,needs:this.needs(this._config,this.today())}:void 0);setConfig(e){this._config=this.resolveConfig(e)}getCardSize(){return 5}getGridOptions(){return{columns:12,rows:`auto`,min_columns:6}}today(){return Hu(Date.now())}static styles=[H,U,md,o`
      :host {
        display: block;
      }
      ha-card {
        position: relative;
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .halo {
        position: absolute;
        left: -60px;
        top: -90px;
        width: 320px;
        height: 240px;
        pointer-events: none;
        opacity: calc(0.18 * var(--vivid-glow-alpha, 1));
        -webkit-mask-image: radial-gradient(closest-side, #000, transparent);
        mask-image: radial-gradient(closest-side, #000, transparent);
      }
      .body {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 14px;
        min-width: 0;
      }
    `];shouldUpdate(e){if(e.size===1&&e.has(`hass`)){let t=e.get(`hass`);return!t||t.language!==this.hass?.language||!this.energy.data}return!0}halo(e){return T`<div
      class="halo"
      aria-hidden="true"
      style=${k({background:`rgb(${e.join(`, `)})`})}
    ></div>`}renderHead(e){return T`<div class="head">
      <span
        class="disc"
        style=${k({"--disc":`rgb(${e.color.join(`, `)})`,"--disc-rgb":e.color.join(`, `)})}
        ><ha-icon .icon=${e.icon}></ha-icon
      ></span>
      <div class="grow">
        <div class="title">${e.title}</div>
        ${e.sub?T`<div class="sub">${e.sub}</div>`:D}
      </div>
      ${e.aside??D}
    </div>`}renderState(e){let t=this.energy.error;if(t===`no_source`)return T`<div class="message">${B(this.hass,`energy_no_source`)}</div>`;if(t)return T`<div class="message">${t}</div>`;if(!e)return T`<div class="message">${B(this.hass,`energy_loading`)}</div>`;if(!e.days.length)return T`<div class="message">${B(this.hass,`energy_no_data`)}</div>`}cardClass(){return``}glows(){return!1}render(){let e=this._config;if(!e||!this.hass)return D;let t=this.energy.data,n=this.head(e,t),r=this.renderState(t)??(t?this.renderBody(e,t):D);return T`<ha-card class=${this.cardClass()} style=${k(Ot(e.glow))}>
      ${this.glows()&&e.glow>0?this.halo(n.color):D} ${this.renderHead(n)}
      ${r===D?D:T`<div class="body">${r}</div>`}
    </ha-card>`}};function Ad(e,t,n,r){return T`<div class="chips" role="group">
    ${e.map(e=>T`<button
          type="button"
          class="reset chip"
          aria-pressed=${String(e===t)}
          @click=${()=>r(e)}
        >
          ${n(e)}
        </button>`)}
  </div>`}var jd={peak:`energy_peak_price`,off_peak:`energy_off_peak_price`,off_peak_hours:`energy_off_peak_hours`,subscription:`energy_subscription_month`,billing_day:`energy_billing_day`};z(`vivid-energy-editor`,class extends O{static properties={hass:{attribute:!1},spec:{attribute:!1},_config:{state:!0},_error:{state:!0}};static styles=[H,o`
      :host {
        display: block;
      }
      .hint {
        margin: 8px 0 0;
        color: var(--secondary-text-color);
        font-size: 12px;
      }
      .error {
        margin-top: 8px;
        color: var(--error-color, #db4437);
        font-size: 13px;
      }
    `];setConfig(e){this._config=e}connectedCallback(){super.connectedCallback(),go().then(()=>this.requestUpdate())}t(e){return yo(this.hass,e)}schema(){return[{name:`name`,selector:{text:{}}},...(this.spec?.fields??[]).map(e=>({name:e.name,selector:e.options?{select:{mode:`dropdown`,options:e.options.map(e=>({value:e.value,label:this.t(e.label)}))}}:e.selector??{text:{}}})),{type:`expandable`,name:`tariff`,title:this.t(`energy_section_tariff`),icon:`mdi:cash-multiple`,schema:[{type:`grid`,name:``,schema:[{name:`peak`,selector:{number:{min:0,max:5,step:1e-4,mode:`box`}}},{name:`off_peak`,selector:{number:{min:0,max:5,step:1e-4,mode:`box`}}}]},{name:`off_peak_hours`,selector:{text:{}}},{type:`grid`,name:``,schema:[{name:`subscription`,selector:{number:{min:0,max:1e3,step:.01,mode:`box`}}},{name:`billing_day`,selector:{number:{min:1,max:28,step:1,mode:`box`}}}]}]},{type:`expandable`,name:``,flatten:!0,title:this.t(`energy_section_source`),icon:`mdi:database-outline`,schema:[{name:`energy`,selector:{statistic:{}}},{name:`cost`,selector:{statistic:{}}}]}]}formData(){let e={...this._config??{}},t={...e.tariff??{}};return Array.isArray(t.off_peak_hours)&&(t.off_peak_hours=t.off_peak_hours.join(`, `)),e.tariff=t,e}changed(e){let t={...this._config??{},...e},n={...e.tariff??{}};if(typeof n.off_peak_hours==`string`){let e=n.off_peak_hours.split(/[,;]/).map(e=>e.trim()).filter(Boolean);n.off_peak_hours=e.length?e:void 0}let r=this._config?.tariff;r?.invoices&&(n.invoices=r.invoices);for(let e of Object.keys(n))(n[e]===void 0||n[e]===``)&&delete n[e];t.tariff=n;for(let e of this.spec?.fields??[])e.default!==void 0&&t[e.name]===e.default&&delete t[e.name];for(let e of[`name`,`energy`,`cost`])(t[e]===``||t[e]===void 0||t[e]===null)&&delete t[e];try{this.spec?.validate(t),this._error=void 0}catch(e){this._error=e.message}this._config=t,N(this,`config-changed`,{config:t})}render(){if(!this.hass||!this._config)return D;let e=this.formData();for(let t of this.spec?.fields??[])e[t.name]===void 0&&t.default!==void 0&&(e[t.name]=t.default);let t={name:this.t(`energy_name`),energy:this.t(`energy_stat`),cost:this.t(`energy_cost_stat`)};for(let[e,n]of Object.entries(jd))t[e]=this.t(n);for(let e of this.spec?.fields??[])t[e.name]=this.t(e.label);let n={off_peak_hours:this.t(`energy_off_peak_hours_helper`),energy:this.t(`energy_stat_helper`)};for(let e of this.spec?.fields??[])e.helper&&(n[e.name]=this.t(e.helper));return T`<ha-form
        .hass=${this.hass}
        .data=${e}
        .schema=${this.schema()}
        .computeLabel=${e=>t[e.name]??e.name}
        .computeHelper=${e=>n[e.name]}
        @value-changed=${e=>{e.stopPropagation(),this.changed(e.detail.value)}}
      ></ha-form>
      <p class="hint">${this.t(`energy_invoices_hint`)}</p>
      ${this._error?T`<div class="error">${this._error}</div>`:D}`}});function Md(e){let t=document.createElement(`vivid-energy-editor`);return t.spec=e,t}function Nd(e,t){let[n,r,i]=e.split(`-`).map(Number);return Hu((i>=t?new Date(n,r-1,t,12):new Date(n,r-2,t,12)).getTime())}function Pd(e){let[t,n,r]=e.split(`-`).map(Number);return Hu(new Date(t,n,r,12).getTime())}function Fd(e){return{start:e.from,end:Wu(e.to,1)}}function Id(e,t,n,r,i){let a=e.filter(e=>e.date>=n&&e.date<r),o=Xu(a,t),s=Gu(n,r),c=Nu(t),l=i>=r,u=e.filter(e=>e.date<i),d=Zu(u,t,7),f=Zu(u,t,30),p=l?0:Math.max(0,s-a.length),m=o.energyCost+c*s,h=m+d*p,g=m+f*p,_=t.invoices.find(e=>{let t=Fd(e);return t.start===n&&t.end===r}),v=_?_.total:h;return{start:n,end:r,length:s,dataDays:a.length,lastDate:a.at(-1)?.date,dayIndex:Math.min(s,Math.max(0,Gu(n,i)+1)),ended:l,totals:o,toDate:o.total,projected:v,low:_?_.total:Math.min(h,g),high:_?_.total:Math.max(h,g),subscription:c*s,invoice:_}}function Ld(e,t,n){let r=Nd(n,t.billingDay);return Id(e,t,r,Pd(r),n)}function Rd(e,t,n){let r=Nd(n,t.billingDay),i=[...t.invoices].reverse().find(e=>Wu(e.to,1)===r);if(i){let r=Fd(i);return Id(e,t,r.start,r.end,n)}let a=Id(e,t,Nd(Wu(r,-1),t.billingDay),r,n);return a.dataDays>0?a:void 0}function zd(e,t,n,r=6){let i=[],a=t.offPeak??t.peak;for(let e of t.invoices){let r=Fd(e);if(r.end>n)continue;let o=e.subscription??Nu(t)*Gu(r.start,r.end),s={start:r.start,end:r.end,kind:`invoice`,total:e.total,subscription:o};if(e.peakKwh!==void 0&&e.offPeakKwh!==void 0){let n=e.peakKwh*t.peak,r=e.offPeakKwh*a,i=Math.max(0,e.total-o),c=n+r>0?i/(n+r):0;s.peak=n*c,s.offPeak=r*c,s.kwh=e.peakKwh+e.offPeakKwh}else s.energy=Math.max(0,e.total-o),s.kwh=e.kwh;i.push(s)}let o=Nd(n,t.billingDay),s=i.at(-1)?.end,c=e[0]?.date??o,l;if(s){let e=Nd(s,t.billingDay);l=e===s?s:Pd(e)}else l=Nd(c,t.billingDay);for(;l<o;){let r=Pd(l),a=Id(e,t,l,r,n);a.dataDays>0&&i.push(Bd(a,`computed`,t)),l=r}let u=Id(e,t,o,Pd(o),n);i.push(Bd(u,`current`,t));let d=u.end,f=Pd(d),p=Zu(e.filter(e=>e.date<n),t,7),m=Gu(d,f),h=Nu(t)*m;return i.push({start:d,end:f,kind:`next`,total:p*m+h,energy:p*m,subscription:h}),i.slice(-r)}function Bd(e,t,n){let r=e.totals,i={start:e.start,end:e.end,kind:t,total:t===`current`?e.projected:r.energyCost+Nu(n)*e.dataDays,subscription:t===`current`?e.subscription:Nu(n)*e.dataDays,kwh:r.kwh};if(r.splitDays===r.days&&r.days>0){let e=n.offPeak??n.peak;i.peak=r.peakKwh*n.peak,i.offPeak=r.offPeakKwh*e;let t=i.peak+i.offPeak>0?r.energyCost/(i.peak+i.offPeak):1;i.peak*=t,i.offPeak*=t}else i.energy=r.energyCost;return t===`current`&&(i.spent=e.toDate,i.low=e.low,i.high=e.high),i}function Vd(e,t,n){let r=Ld(e,t,n),i=Rd(e,t,n),a=e.filter(e=>e.date<n),o=a.at(-1);return{tariff:t,cycle:r,previous:i,delta:i&&i.projected>0?r.projected/i.projected-1:void 0,pace:Zu(a,t,7),dailyCost:Zu(a,t,7)+Nu(t),lastDay:o?{date:o.date,kwh:o.kwh,cost:Yu(o,t)}:void 0}}function Hd(e,t,n,r=7){let i=e.filter(e=>e.date<n).slice(-r),a=i.length?i.reduce((e,t)=>e+t.kwh,0)/i.length:0,o=i.map(e=>({date:e.date,kwh:e.kwh,cost:Yu(e,t),ratio:a>0?e.kwh/a:1}));return{days:o,meanKwh:a,last:o.at(-1)}}function Ud(e,t,n,r,i){let a=new Map(e.map(e=>[e.date,e])),o=new Date(n,r-1,1,12),s=new Date(n,r,0,12).getDate(),c=Hu(o.getTime()),l=Wu(c,-30),u=Wu(c,s),d=pd(e.filter(e=>e.date>=l&&e.date<u&&e.date<i).map(e=>Yu(e,t))),f=[],p=0,m=0,h=0;for(let e=1;e<=s;e++){let o=Hu(new Date(n,r-1,e,12).getTime()),s=a.get(o),c={date:o,day:e,today:o===i,future:o>i};s&&(c.cost=Yu(s,t),c.kwh=s.kwh,qu(s)&&s.kwh>0&&(c.offPeakShare=(s.offPeakKwh??0)/s.kwh),c.ratio=d>0?c.cost/d:1,p+=c.cost,m+=s.kwh,h+=1),f.push(c)}return{year:n,month:r,lead:(o.getDay()+6)%7,cells:f,total:p,kwh:m,dataDays:h}}function Wd(e,t){return t===`current`?e.find(e=>e.kind===`current`):[...e].reverse().find(e=>e.kind===`invoice`||e.kind===`computed`)}function Gd(e,t,n,r){let i=Wd(zd(e,t,n,24),r);if(!i)return;let a=e.filter(e=>e.date>=i.start&&e.date<i.end),o=Xu(a,t),s={bar:i,money:[],total:0,kwh:i.kwh};if(i.kind===`current`){let e=Nu(t)*a.length;if(o.splitDays===o.days&&o.days>0){let e=o.peakKwh*t.peak+o.offPeakKwh*(t.offPeak??t.peak),n=e>0?o.energyCost/e:1;s.money.push({key:`peak`,value:o.peakKwh*t.peak*n}),s.money.push({key:`off_peak`,value:o.offPeakKwh*(t.offPeak??t.peak)*n}),s.peakKwh=o.peakKwh,s.offPeakKwh=o.offPeakKwh}else s.money.push({key:`energy`,value:o.energyCost});s.money.push({key:`subscription`,value:e}),s.kwh=o.kwh}else{i.peak!==void 0&&i.offPeak!==void 0?s.money.push({key:`peak`,value:i.peak},{key:`off_peak`,value:i.offPeak}):s.money.push({key:`energy`,value:i.energy??0}),s.money.push({key:`subscription`,value:i.subscription});let e=t.invoices.find(e=>e.from===i.start);e?.peakKwh!==void 0&&e.offPeakKwh!==void 0?(s.peakKwh=e.peakKwh,s.offPeakKwh=e.offPeakKwh):o.splitDays===o.days&&o.days>0&&(s.peakKwh=o.peakKwh,s.offPeakKwh=o.offPeakKwh)}return s.total=s.money.reduce((e,t)=>e+t.value,0),s}function Kd(e,t,n,r){let i=Gd(e,t,n,r);if(!i||i.peakKwh===void 0||i.offPeakKwh===void 0)return;let a=i.peakKwh+i.offPeakKwh;if(a<=0)return;let o=i.money.find(e=>e.key===`peak`)?.value??i.peakKwh*t.peak,s=i.money.find(e=>e.key===`off_peak`)?.value??i.offPeakKwh*(t.offPeak??t.peak);return{start:i.bar.start,end:i.bar.end,kind:i.bar.kind,peakKwh:i.peakKwh,offPeakKwh:i.offPeakKwh,kwhShare:i.offPeakKwh/a,moneyShare:o+s>0?s/(o+s):0,peakCost:o,offPeakCost:s}}var qd=[`day`,`week`,`month`,`year`];function Jd(e,t,n){let r=n&&n<t?n:Wu(t,-1),i=Wu(r,1);return e===`day`?{from:r,to:i}:e===`week`?{from:Wu(r,-6),to:i}:e===`month`?{from:`${r.slice(0,7)}-01`,to:i}:{from:`${r.slice(0,4)}-01-01`,to:i}}function Yd(e,t){let[n,r,i]=t.split(`-`).map(Number);if(e===`day`)return 3;if(e===`week`)return 9;if(e===`month`)return i+2;let a=new Date(n,0,1,12).getTime();return Math.round((new Date(n,r-1,i,12).getTime()-a)/864e5)+2}function Xd(e,t,n){let r=0;for(let i of e){let e=Hu(i.start);e>=t&&e<n&&(r+=Math.max(0,i.change))}return r}function Zd(e,t,n,r,i,a){let o=Xu(e.filter(e=>e.date>=r&&e.date<i),n),s=o.kwh>0?o.energyCost/o.kwh:n.peak,c=/* @__PURE__ */ new Map;for(let e of t){let t=Xd(e.daily,r,i);c.set(e.stat,{stat:e.stat,name:e.name??a(e.stat),kwh:t,cost:t*s,children:[]})}let l=[];for(let e of t){let t=c.get(e.stat);if(!t)continue;let n=e.includedIn?c.get(e.includedIn):void 0;n&&n!==t?n.children.push(t):l.push(t)}let u=(e,t)=>t.kwh-e.kwh;l.sort(u);for(let e of l)e.children.sort(u);let d=l.reduce((e,t)=>e+t.kwh,0);return{from:r,to:i,kwh:o.kwh,cost:o.energyCost,price:s,rows:l,tracked:d,untracked:Math.max(0,o.kwh-d),trackedShare:o.kwh>0?Math.min(1,d/o.kwh):0}}function Qd(e){let t=/* @__PURE__ */ new Map;for(let n of e){let e=Hu(n.start);t.set(e,(t.get(e)??0)+1)}return[...t.entries()].filter(([,e])=>e>=20).map(([e])=>e).sort()}function $d(e,t,n){let r=Array.from({length:24},(e,n)=>({hour:n,kwh:0,offPeakShare:Ou(t.offPeakRanges,n*60)})),i=0;for(let t of e){if(Hu(t.start)!==n)continue;let e=r[new Date(t.start).getHours()];e&&(e.kwh+=Math.max(0,t.change),i+=1)}if(!i)return;let a=0,o=0;for(let e of r)o+=e.kwh*e.offPeakShare,a+=e.kwh*(1-e.offPeakShare);let s=a*t.peak+o*(t.offPeak??t.peak),c=r.map(e=>e.kwh).filter(e=>e>0).sort((e,t)=>e-t).slice(0,3),l=c.length?c.reduce((e,t)=>e+t,0)/c.length:0,u=a+o,d=u>0?s/u:t.peak;return{date:n,hours:r,peakKwh:a,offPeakKwh:o,cost:s,standbyWatts:l*1e3,standbyYear:l*8760*d}}var ef=`vivid-bill-card`,tf=[`card`,`line`];function nf(e){let t=Ru(ef,e),n=e;return{...t,layout:zu(n,`layout`,tf,`card`,Iu(ef))}}var rf=[255,112,67],af=`mdi:receipt-text-outline`,of={days:80,hourlyDays:32};z(ef,class extends kd{static properties={...kd.properties,_open:{state:!0}};constructor(){super(),this._open=!1}static getConfigElement(){return Md({fields:[{name:`layout`,label:`energy_layout`,default:`card`,options:[{value:`card`,label:`energy_layout_card`},{value:`line`,label:`energy_layout_line`}]},{name:`glow`,label:`energy_glow`,selector:Et,default:100}],validate:e=>nf(e)})}static getStubConfig(){return{tariff:Vu}}static styles=[kd.styles,o`
      .line {
        padding: 10px 12px;
        gap: 10px;
      }
      .line .head {
        gap: 10px;
      }
      .line .title {
        font-size: 15px;
      }
      .mini {
        width: 110px;
        flex: none;
        height: 8px;
        border-radius: 4px;
        background: rgba(var(--vivid-rgb-text), 0.08);
        overflow: hidden;
      }
      .mini i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, rgb(255, 193, 7), rgb(255, 112, 67));
      }
      .chevron {
        transition: transform 0.2s ease;
      }
      .chevron[data-open] {
        transform: rotate(180deg);
      }
      @media (max-width: 420px) {
        .mini {
          display: none;
        }
      }
    `];resolveConfig(e){return nf(e)}needs(){return of}getCardSize(){return this._config?.layout===`line`&&!this._open?1:5}glows(){return this._config?.layout!==`line`}view(e,t){return Vd(t.days,e.tariff,t.today)}head(e,t){let n=e.name??B(this.hass,`energy_bill`),r=t?.days.length?this.view(e,t):void 0;if(!r)return{icon:af,color:rf,title:n};let i=r.cycle,a=this.hass;if(e.layout===`line`){let e=[B(a,`energy_day_of`,{day:i.dayIndex,total:i.length}),r.delta===void 0?void 0:$u(a,r.delta),B(a,`energy_per_day`,{v:X(a,r.dailyCost)})].filter(Boolean);return{icon:af,color:rf,title:`${n} · ${X(a,i.projected,0)}`,sub:e.join(` · `),aside:T`<div class="mini" aria-hidden="true">
            <i
              style=${k({width:`${Math.min(100,i.toDate/Math.max(i.projected,.01)*100).toFixed(0)}%`})}
            ></i>
          </div>
          <button
            type="button"
            class="reset icon-button"
            aria-expanded=${String(this._open)}
            aria-label=${B(a,this._open?`energy_collapse`:`energy_expand`)}
            @click=${()=>{this._open=!this._open}}
          >
            <ha-icon class="chevron" ?data-open=${this._open} icon="mdi:chevron-down"></ha-icon>
          </button>`}}let o=r.delta;return{icon:af,color:rf,title:n,sub:B(a,`energy_bill_range`,{from:ed(a,i.start),to:ed(a,Wu(i.end,-1))}),aside:o===void 0?D:T`<span
              class="badge-chip"
              title=${B(a,`energy_vs_previous`,{d:$u(a,o),v:X(a,r.previous?.projected??0)})}
              style=${k({background:Q(fd(o),.2),color:Q(fd(o))})}
              >${$u(a,o)}</span
            >`}}renderBody(e,t){return e.layout===`line`&&!this._open?D:T`<vivid-bill-summary
      .hass=${this.hass}
      .view=${this.view(e,t)}
      .tariff=${e.tariff}
    ></vivid-bill-summary>`}cardClass(){return this._config?.layout===`line`?`line`:``}}),sn({type:ef,name:`Vivid Bill`,description:`The bill in progress: estimated amount, what is spent, the previous bill and the pace.`,preview:!0,documentationURL:`${R}#vivid-bill-card`});var sf=`vivid-bills-card`;function cf(e){return{...Ru(sf,e),count:Bu(e,`count`,4,2,12,Iu(sf))}}var lf=200;z(sf,class extends kd{static getConfigElement(){return Md({fields:[{name:`count`,label:`energy_months`,selector:{number:{min:2,max:12,mode:`box`}},default:4}],validate:e=>cf(e)})}static getStubConfig(){return{tariff:Vu}}static styles=[kd.styles,o`
      .chart {
        display: flex;
        gap: 12px;
        align-items: stretch;
      }
      .column {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        text-align: center;
      }
      .total {
        font-size: 15px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .dim {
        color: var(--vivid-muted);
      }
      .slot {
        position: relative;
        width: min(72px, 100%);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
      .stack {
        display: flex;
        flex-direction: column;
        border-radius: 10px;
        overflow: hidden;
      }
      .stack i {
        display: block;
        flex: none;
      }
      .energy {
        background: rgba(255, 193, 7, 0.55);
      }
      .spent {
        background: rgb(255, 112, 67);
      }
      .rest {
        background: var(--energy-hatch);
        box-shadow: inset 0 0 0 2px rgba(255, 112, 67, 0.9);
        border-radius: 10px 10px 0 0;
      }
      .next {
        background: var(--energy-hatch);
      }
      .next-sub {
        background: rgba(var(--vivid-rgb-text), 0.18);
      }
      .whisker {
        position: absolute;
        left: 50%;
        width: 18px;
        margin-left: -9px;
        border-top: 2px solid var(--primary-text-color);
        border-bottom: 2px solid var(--primary-text-color);
        box-sizing: border-box;
      }
      .whisker::after {
        content: '';
        position: absolute;
        left: 8px;
        top: 0;
        bottom: 0;
        border-left: 2px solid var(--primary-text-color);
      }
      .dates {
        font-size: 12.5px;
        font-weight: 600;
        white-space: nowrap;
      }
      .note {
        font-size: 11.5px;
        color: var(--vivid-muted);
        line-height: 1.3;
      }
    `];resolveConfig(e){return cf(e)}needs(e,t){let n=e.tariff.invoices[0]?.from,r=n?Gu(n,t)+1:31*e.count;return{days:Math.min(400,Math.max(80,Math.min(r,31*e.count+31))),hourlyDays:32}}head(e){return{icon:`mdi:receipt-text-clock-outline`,color:[255,112,67],title:e.name??B(this.hass,`energy_bills`),sub:B(this.hass,`energy_bills_sub`)}}renderBar(e,t,n,r){let i=this.hass,a=e=>`${Math.max(0,e/t*lf).toFixed(1)}px`,o=`${ed(i,e.start)} → ${ed(i,Wu(e.end,-1))}`,s=Gu(e.start,e.end),c,l,u=D,d=X(i,e.total,0);if(e.kind===`current`){let t=Id(n.days,r.tariff,e.start,e.end,n.today),o=t.totals.energyCost;c=T`<i class="rest" style=${k({height:a(Math.max(0,e.total-e.subscription-o))})}></i
        ><i class="spent" style=${k({height:a(o)})}></i
        ><i class="subscription" style=${k({height:a(e.subscription)})}></i>`,l=B(i,`energy_in_progress`,{day:t.dayIndex,total:t.length}),d=`≈ ${d}`,e.low!==void 0&&e.high!==void 0&&e.high-e.low>.5&&(u=T`<i
          class="whisker"
          title=${`${X(i,e.low,0)} – ${X(i,e.high,0)}`}
          style=${k({bottom:a(e.low),height:a(e.high-e.low)})}
        ></i>`)}else e.kind===`next`?(c=T`<i class="next" style=${k({height:a(e.energy??0)})}></i
        ><i class="next-sub" style=${k({height:a(e.subscription)})}></i>`,l=B(i,`energy_next_if_same`),d=`≈ ${d}`):(c=e.peak!==void 0&&e.offPeak!==void 0?T`<i class="peak" style=${k({height:a(e.peak)})}></i
              ><i class="off-peak" style=${k({height:a(e.offPeak)})}></i>`:T`<i class="energy" style=${k({height:a(e.energy??0)})}></i>`,c=T`${c}<i
          class="subscription"
          style=${k({height:a(e.subscription)})}
        ></i>`,l=e.kwh===void 0?``:B(i,`energy_kwh_days`,{k:Z(i,e.kwh,0),d:s}));return T`<div class="column">
      <span class=${e.kind===`next`?`total dim`:`total`}>${d}</span>
      <div class="slot" style=${k({height:`${lf}px`})}>
        ${u}
        <div class="stack">${c}</div>
      </div>
      <span class="dates">${o}</span>
      <span class="note">${l}</span>
    </div>`}renderBody(e,t){let n=zd(t.days,e.tariff,t.today,e.count),r=Math.max(...n.map(e=>Math.max(e.total,e.high??0)),1)*1.04,i=this.hass,a=n.some(e=>e.peak!==void 0),o=n.some(e=>e.kind!==`current`&&e.kind!==`next`&&e.peak===void 0);return T`<div class="chart" role="img" aria-label=${B(i,`energy_bills`)}>
        ${n.map(n=>this.renderBar(n,r,t,e))}
      </div>
      <div class="legend">
        ${a?T`<span><i class="dot peak"></i>${B(i,`energy_peak`)}</span>
                <span><i class="dot off-peak"></i>${B(i,`energy_off_peak`)}</span>`:D}
        ${o?T`<span><i class="dot energy"></i>${B(i,`energy_consumption`)}</span>`:D}
        <span><i class="dot spent"></i>${B(i,`energy_current_energy`)}</span>
        <span><i class="dot subscription"></i>${B(i,`energy_subscription`)}</span>
        <span
          ><i class="dot" style="background: var(--energy-hatch)"></i
          >${B(i,`energy_projection`)}</span
        >
      </div>`}}),sn({type:sf,name:`Vivid Bills`,description:`Past bills, the one in progress with its projection, and the next one at the same pace.`,preview:!0,documentationURL:`${R}#vivid-bills-card`});var uf=`vivid-bill-ring`,df=[`money`,`off_peak`],ff=[`last`,`current`];function pf(e){let t=Ru(uf,e),n=e,r=Iu(uf);return{...t,ring:zu(n,`ring`,df,`money`,r),cycle:zu(n,`cycle`,ff,`last`,r)}}var mf=240,hf=mf/2,gf=3,_f={peak:id,off_peak:rd,energy:[255,112,67],subscription:ad},vf={peak:`energy_peak`,off_peak:`energy_off_peak`,energy:`energy_consumption`,subscription:`energy_subscription`};function yf(e,t,n){let r=n.reduce((e,t)=>e+t.value,0),i=2*Math.PI*e,a=0,o=n.filter(e=>e.value>0);return[E`<circle cx=${hf} cy=${hf} r=${e} fill="none" stroke="currentColor" stroke-opacity="0.1" stroke-width=${t}></circle>`,...o.map(n=>{let s=r>0?n.value/r:0,c=Math.max(0,s*i-(o.length>1?gf:0)),l=E`<circle
        cx=${hf}
        cy=${hf}
        r=${e}
        fill="none"
        stroke=${Q(n.color)}
        stroke-opacity=${n.opacity??1}
        stroke-width=${t}
        stroke-dasharray=${`${c.toFixed(1)} ${i.toFixed(1)}`}
        transform=${`rotate(${(-90+a*360).toFixed(2)} ${hf} ${hf})`}
      ></circle>`;return a+=s,l})]}function bf(e,t,n){let r=n*2*Math.PI-Math.PI/2,i=e-t/2-4,a=e+t/2+4;return E`<line
    x1=${(hf+i*Math.cos(r)).toFixed(1)}
    y1=${(hf+i*Math.sin(r)).toFixed(1)}
    x2=${(hf+a*Math.cos(r)).toFixed(1)}
    y2=${(hf+a*Math.sin(r)).toFixed(1)}
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
  ></line>`}function xf(e){return`${Math.round(e*100)} %`}z(uf,class extends kd{static getConfigElement(){return Md({fields:[{name:`ring`,label:`energy_ring`,default:`money`,options:[{value:`money`,label:`energy_ring_money`},{value:`off_peak`,label:`energy_ring_off_peak`}]},{name:`cycle`,label:`energy_cycle`,default:`last`,options:[{value:`last`,label:`energy_cycle_last`},{value:`current`,label:`energy_cycle_current`}]}],validate:e=>pf(e)})}static getStubConfig(){return{tariff:Vu}}static styles=[kd.styles,o`
      .layout {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 18px;
      }
      svg {
        flex: none;
        width: min(${mf}px, 100%);
        height: auto;
        color: var(--primary-text-color);
      }
      .center-big {
        font-size: 28px;
        font-weight: 800;
        fill: var(--primary-text-color);
      }
      .center-small {
        font-size: 12px;
        fill: var(--secondary-text-color);
      }
      .side {
        flex: 1;
        min-width: 180px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .dot {
        border-radius: 50%;
      }
      .share {
        min-width: 40px;
        text-align: right;
        color: var(--vivid-muted);
      }
      .figure .label {
        font-size: 12px;
        color: var(--vivid-muted);
      }
      .figure .value {
        font-size: 17px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }
      .note {
        font-size: 12.5px;
        line-height: 1.45;
        color: var(--secondary-text-color);
        margin-top: 6px;
      }
    `];resolveConfig(e){return pf(e)}needs(e,t){let n=e.tariff.invoices.at(-1)?.from,r=n?Gu(n,t)+1:70;return{days:Math.min(400,Math.max(70,r)),hourlyDays:e.cycle===`current`?32:70}}head(e,t){let n=this.hass,r=t?.days.length?Gd(t.days,e.tariff,t.today,e.cycle):void 0,i=r?B(n,`energy_bill_range`,{from:ed(n,r.bar.start),to:ed(n,Wu(r.bar.end,-1))}):void 0;return e.ring===`off_peak`?{icon:`mdi:weather-night`,color:rd,title:e.name??B(n,`energy_off_peak_title`),sub:i?`${i} · ${B(n,`energy_off_peak_sub`)}`:void 0}:{icon:`mdi:chart-donut`,color:[255,112,67],title:e.name??B(n,`energy_where_title`),sub:i?`${i} · ${B(n,`energy_where_sub`)}`:void 0}}renderMoney(e,t){let n=this.hass,r=Gd(t.days,e.tariff,t.today,e.cycle);if(!r)return T`<div class="message">${B(n,`energy_no_data`)}</div>`;let i=r.money.map(e=>({...e,color:_f[e.key]})),a=r.peakKwh!==void 0&&r.offPeakKwh!==void 0?yf(mf/2-56,10,[{value:r.peakKwh,color:id,opacity:.75},{value:r.offPeakKwh,color:rd,opacity:.75}]):D,o=r.kwh,s=r.money.find(e=>e.key===`off_peak`)?.value,c=s!==void 0&&r.peakKwh!==void 0&&r.offPeakKwh!==void 0&&r.total>0?B(n,`energy_off_peak_note`,{k:xf(r.offPeakKwh/Math.max(r.peakKwh+r.offPeakKwh,.001)),e:xf(s/r.total)}):void 0;return T`<div class="layout">
      <svg
        viewBox="0 0 ${mf} ${mf}"
        role="img"
        aria-label=${B(n,`energy_where_title`)}
      >
        ${yf(mf/2-22,26,i)} ${a}
        <text class="center-big" x=${hf} y=${124} text-anchor="middle">
          ${X(n,r.total,0)}
        </text>
        ${o===void 0?D:E`<text class="center-small" x=${hf} y=${144} text-anchor="middle">${Z(n,o,0)}</text>`}
      </svg>
      <div class="side">
        ${i.map(e=>T`<div class="row">
              <i class="dot" style="background: ${Q(e.color)}"></i
              ><span class="grow">${B(n,vf[e.key])}</span
              ><span class="num">${X(n,e.value)}</span
              ><span class="num share"
                >${xf(r.total>0?e.value/r.total:0)}</span
              >
            </div>`)}
        ${c?T`<div class="note">${c}</div>`:D}
      </div>
    </div>`}renderOffPeak(e,t){let n=this.hass,r=Kd(t.days,e.tariff,t.today,e.cycle);if(!r)return T`<div class="message">${B(n,`energy_split_waiting`)}</div>`;let i=ku(e.tariff.offPeakRanges),a=mf/2-22;return T`<div class="layout">
      <svg
        viewBox="0 0 ${mf} ${mf}"
        role="img"
        aria-label=${B(n,`energy_kwh_in_off_peak`,{v:xf(r.kwhShare)})}
      >
        ${yf(a,26,[{value:r.offPeakKwh,color:rd},{value:r.peakKwh,color:id}])}
        ${yf(mf/2-56,10,[{value:r.offPeakCost,color:rd,opacity:.75},{value:r.peakCost,color:id,opacity:.75}])}
        ${i>0?bf(a,26,i):D}
        <text class="center-big" x=${hf} y=${124} text-anchor="middle">
          ${xf(r.kwhShare)}
        </text>
        <text class="center-small" x=${hf} y=${144} text-anchor="middle">
          ${B(n,`energy_in_off_peak`)}
        </text>
      </svg>
      <div class="side">
        <div class="figure">
          <div class="label">${B(n,`energy_peak`)}</div>
          <div class="value" style="color: ${Q(id)}">
            ${Z(n,r.peakKwh,0)} · ${X(n,r.peakCost)}
          </div>
        </div>
        <div class="figure">
          <div class="label">${B(n,`energy_off_peak`)}</div>
          <div class="value" style="color: ${Q(rd)}">
            ${Z(n,r.offPeakKwh,0)} · ${X(n,r.offPeakCost)}
          </div>
        </div>
        ${i>0?T`<div class="note">${B(n,`energy_off_peak_target`,{p:xf(i)})}</div>`:D}
      </div>
    </div>`}renderBody(e,t){return e.ring===`off_peak`?this.renderOffPeak(e,t):this.renderMoney(e,t)}}),sn({type:uf,name:`Vivid Bill Ring`,description:`A bill as rings: where each euro goes, or how much falls in off-peak hours.`,preview:!0,documentationURL:`${R}#vivid-bill-ring`});var Sf=`vivid-energy-calendar`;function Cf(e){return Ru(Sf,e)}var wf=100;z(Sf,class extends kd{static properties={...kd.properties,_shown:{state:!0},_selected:{state:!0}};static getConfigElement(){return Md({fields:[],validate:e=>Cf(e)})}static getStubConfig(){return{tariff:Vu}}static styles=[kd.styles,o`
      .grid {
        container-type: inline-size;
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: clamp(3px, 1.2cqw, 8px);
      }
      .weekday {
        text-align: center;
        font-size: 12px;
        font-weight: 600;
        color: var(--vivid-muted);
      }
      .cell {
        box-sizing: border-box;
        min-height: clamp(52px, 13cqw, 96px);
        border-radius: clamp(10px, 2.4cqw, 16px);
        padding: clamp(4px, 1.2cqw, 8px) clamp(5px, 1.4cqw, 10px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 4px;
        text-align: left;
        min-width: 0;
      }
      .cell.data {
        color: #ffffff;
        cursor: pointer;
      }
      .cell.data:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .cell.selected {
        box-shadow:
          0 0 0 2px var(--primary-text-color),
          0 0 16px var(--cell-glow) !important;
      }
      .cell.empty {
        border: 1px dashed rgba(var(--vivid-rgb-text), 0.15);
        color: var(--vivid-muted);
      }
      .cell.today {
        border: 2px solid var(--primary-text-color);
      }
      .cell.past {
        background: rgba(var(--vivid-rgb-text), 0.04);
        color: var(--vivid-muted);
      }
      .day {
        display: flex;
        justify-content: space-between;
        gap: 4px;
        font-size: clamp(10px, 2.2cqw, 12px);
        opacity: 0.85;
        white-space: nowrap;
        overflow: hidden;
      }
      .price {
        font-size: clamp(10px, 3.1cqw, 22px);
        font-weight: 800;
        letter-spacing: -0.01em;
        font-variant-numeric: tabular-nums;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: clip;
      }
      .hphc {
        display: flex;
        height: clamp(4px, 1cqw, 7px);
        border-radius: 4px;
        overflow: hidden;
        background: rgba(0, 0, 0, 0.3);
      }
      .hphc i {
        display: block;
      }
      .detail {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 16px;
        background: var(--vivid-layer-2);
      }
      .detail .top {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 10px;
      }
      .detail b {
        font-size: 15px;
      }
      .detail .amount {
        font-size: 22px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
      }
      .detail .split {
        height: 12px;
        border-radius: 6px;
      }
      .detail .figures {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
      }
      .total {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 10px;
        padding-top: 8px;
        border-top: 1px solid rgba(var(--vivid-rgb-text), 0.1);
      }
      .total .num {
        font-size: 20px;
        font-weight: 800;
      }
      .scale {
        width: 44px;
        height: 10px;
        border-radius: 3px;
      }
    `];resolveConfig(e){return Cf(e)}shown(e){if(this._shown)return this._shown;let[t,n]=e.split(`-`).map(Number);return{year:t,month:n}}firstOf(e){return`${e.year}-${String(e.month).padStart(2,`0`)}-01`}needs(e,t){let n=this.firstOf(this.shown(t)),r=Gu(Wu(n,-30),t)+1;return{days:Math.max(r,62),hourlyDays:Math.min(wf,Gu(n,t)+1)}}move(e){let t=this.today(),n=this.shown(t),r=n.year*12+n.month-1+e,i={year:Math.floor(r/12),month:r%12+1},[a,o]=t.split(`-`).map(Number);i.year*12+i.month>a*12+o||(this._shown=i,this._selected=void 0)}head(e,t){let n=this.hass,r=t?.today??this.today(),i=this.shown(r),[a,o]=r.split(`-`).map(Number),s=t?.days[0]?.date,c=s!==void 0&&this.firstOf(i)<=s,l=i.year===a&&i.month===o;return{icon:`mdi:calendar-month-outline`,color:[38,198,218],title:nd(n,i.year,i.month),sub:B(n,`energy_calendar_sub`),aside:T`<button
          type="button"
          class="reset icon-button"
          ?disabled=${c}
          aria-label=${B(n,`energy_previous_month`)}
          @click=${()=>this.move(-1)}
        >
          <ha-icon icon="mdi:chevron-left"></ha-icon></button
        ><button
          type="button"
          class="reset icon-button"
          ?disabled=${l}
          aria-label=${B(n,`energy_next_month`)}
          @click=${()=>this.move(1)}
        >
          <ha-icon icon="mdi:chevron-right"></ha-icon>
        </button>`}}renderCell(e){let t=this.hass;if(e.cost===void 0)return T`<div
        class=${W({cell:!0,empty:e.future||e.today,today:e.today,past:!e.future&&!e.today})}
      >
        <span class="day" title=${e.today?B(t,`energy_day_today`):``}
          ><span>${e.day}</span></span
        >
      </div>`;let n=ud(e.ratio??1),r=this._selected===e.date,i=`${td(t,e.date)} · ${X(t,e.cost)}`;return T`<button
      type="button"
      class=${W({reset:!0,cell:!0,data:!0,selected:r})}
      style=${k({background:Q(n),boxShadow:`0 0 calc(18px * var(--vivid-glow, 1)) ${Q(n,.35)}`,"--cell-glow":Q(n,.6)})}
      aria-pressed=${String(r)}
      aria-label=${i}
      title=${i}
      @click=${()=>{this._selected=r?void 0:e.date}}
    >
      <span class="day"><span>${e.day}</span></span>
      <span class="price">${X(t,e.cost)}</span>
      ${e.offPeakShare===void 0?D:T`<span class="hphc" aria-hidden="true"
              ><i
                class="off-peak"
                style=${k({width:`${(e.offPeakShare*100).toFixed(0)}%`})}
              ></i
              ><i class="peak" style="flex: 1"></i
            ></span>`}
    </button>`}renderDetail(e){if(!e||e.cost===void 0)return D;let t=this.hass,n=e.offPeakShare;return T`<div class="detail">
      <div class="top">
        <b>${td(t,e.date)}</b
        ><span class="amount">${X(t,e.cost)}</span>
      </div>
      ${n===void 0?T`<div class="figures">
              <span class="sub">${Z(t,e.kwh??0)}</span>
            </div>`:T`<div class="split" aria-hidden="true">
                <i class="off-peak" style=${k({width:`${(n*100).toFixed(1)}%`})}></i
                ><i class="peak" style="flex: 1"></i>
              </div>
              <div class="figures">
                <span style="color: var(--energy-off-peak); font-weight: 700"
                  >${B(t,`energy_off_peak_short`)} ${Math.round(n*100)} %</span
                >
                <span class="sub">${Z(t,e.kwh??0)}</span>
                <span style="color: var(--energy-peak); font-weight: 700"
                  >${B(t,`energy_peak_short`)} ${Math.round((1-n)*100)} %</span
                >
              </div>`}
    </div>`}renderBody(e,t){let n=this.hass,r=this.shown(t.today),i=Ud(t.days,e.tariff,r.year,r.month,t.today),a=Array.from({length:7},(e,t)=>{try{return new Intl.DateTimeFormat(dn(n),{weekday:`short`}).format(new Date(2024,0,1+t,12))}catch{return``}}),o=i.cells.some(e=>e.offPeakShare!==void 0);return T`<div class="grid">
        ${a.map(e=>T`<div class="weekday">${e}</div>`)}
        ${Array.from({length:i.lead},()=>T`<div></div>`)}
        ${i.cells.map(e=>this.renderCell(e))}
      </div>
      ${this.renderDetail(i.cells.find(e=>e.date===this._selected))}
      <div class="legend">
        <span
          ><i class="dot scale" style="background: ${dd}"></i
          >${B(n,`energy_scale`)}</span
        >
        ${o?T`<span><i class="dot off-peak"></i>${B(n,`energy_off_peak`)}</span>
                <span><i class="dot peak"></i>${B(n,`energy_peak`)}</span>`:D}
      </div>
      <div class="total">
        <span class="sub"
          >${B(n,`energy_month_total`)} · ${Z(n,i.kwh,0)}</span
        >
        <span class="num">${X(n,i.total)}</span>
      </div>`}}),sn({type:Sf,name:`Vivid Energy Calendar`,description:`A month of electricity, one colored cell per day with its price and its off-peak share.`,preview:!0,documentationURL:`${R}#vivid-energy-calendar`});var Tf=`vivid-energy-flow`;function Ef(e,t){let n=Ru(e,t),r=t,i=Iu(e);return{...n,period:zu(r,`period`,qd,`month`,i),maxDevices:Bu(r,`max_devices`,6,1,20,i)}}var Df={day:`energy_period_day`,week:`energy_period_week`,month:`energy_period_month`,year:`energy_period_year`};function Of(e,t){return e&&e.states[t]?M(e,t):t}function kf(e,t,n){if(e.length<=t)return[...e];let r=e.slice(0,t-1),i=e.slice(t-1),a=i.reduce((e,t)=>e+t.kwh,0),o=i.reduce((e,t)=>e+t.cost,0);return[...r,{stat:``,name:n,kwh:a,cost:o,children:[]}]}function Af(e,t,n,r){let i=e.map(e=>e);for(let e=0;e<i.length;e++)i[e]=Math.max(i[e],n,e>0?i[e-1]+t:n);for(let e=i.length-1;e>=0;e--){let n=e===i.length-1?r:i[e+1]-t;i[e]=Math.min(i[e],n)}return i}var jf=640,Mf=320,Nf=24,Pf=272,Ff=10,$=[8,150,290,450];function If(e,t,n,r,i,a,o,s){let c=(e+r)/2;return E`<path
    d=${`M${e},${t.toFixed(1)} C${c},${t.toFixed(1)} ${c},${i.toFixed(1)} ${r},${i.toFixed(1)} L${r},${a.toFixed(1)} C${c},${a.toFixed(1)} ${c},${n.toFixed(1)} ${e},${n.toFixed(1)} Z`}
    fill=${o}
    fill-opacity=${s}
  ></path>`}function Lf(e,t,n,r){return E`<text x=${e} y=${t.toFixed(1)} class="label"><tspan class="label-title" x=${e} dy="-0.2em">${n}</tspan><tspan class="label-sub" x=${e} dy="1.25em">${r}</tspan></text>`}var Rf=34,zf=class extends kd{static properties={...kd.properties,_period:{state:!0}};static getConfigElement(){return Md({fields:[{name:`period`,label:`energy_period`,default:`month`,options:qd.map(e=>({value:e,label:`energy_period_${e}`}))},{name:`max_devices`,label:`energy_max_devices`,selector:{number:{min:1,max:20,mode:`box`}},default:6}],validate:e=>Ef(Tf,e)})}static getStubConfig(){return{tariff:Vu}}static styles=[kd.styles,o`
      svg {
        color: var(--primary-text-color);
        width: 100%;
        height: auto;
        overflow: visible;
      }
      .label-title {
        font-size: 13px;
        font-weight: 700;
        fill: var(--primary-text-color);
      }
      .label-sub {
        font-size: 11.5px;
        fill: var(--secondary-text-color);
      }
      .zoom {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        fill: rgb(255, 193, 7);
      }
      .hatch-a {
        fill: rgba(var(--vivid-rgb-text), 0.06);
      }
      .hatch-b {
        fill: rgba(var(--vivid-rgb-text), 0.16);
      }
    `];resolveConfig(e){return Ef(Tf,e)}period(e){return this._period??e.period}needs(e,t){let n=Yd(this.period(e),t);return{days:n,hourlyDays:0,devices:!0,deviceDays:n}}view(e,t){let n=Jd(this.period(e),t.today,t.days.filter(e=>e.date<t.today).at(-1)?.date);return Zd(t.days,t.devices,e.tariff,n.from,n.to,e=>Of(this.hass,e))}head(e,t){return{icon:`mdi:transit-connection-variant`,color:[66,165,245],title:e.name??B(this.hass,`energy_flow`),sub:B(this.hass,`energy_flow_sub`),aside:Ad(qd,this.period(e),e=>B(this.hass,Df[e]),e=>{this._period=e})}}renderBody(e,t){let n=this.hass,r=this.view(e,t);if(!t.devices.length)return T`<div class="message">${B(n,`energy_no_devices`)}</div>`;if(r.kwh<=0)return T`<div class="message">${B(n,`energy_no_data`)}</div>`;let i=Pf/Math.max(r.kwh,r.tracked),a=r.untracked*i,o=Math.max(r.tracked*i,r.tracked>0?3:0),s=Nf+a+(a>0?12:0),c=kf(r.rows,e.maxDevices,B(n,`energy_others`)).filter(e=>e.kwh>0),l=Pf-8*Math.max(0,c.length-1),u=r.tracked>0?l/r.tracked:0,d=Nf,f=c.map(e=>{let t=Math.max(e.kwh*u,3),n={row:e,y:d,height:t};return d+=t+8,n}),p=d-8,m=Af(f.map(e=>e.y+e.height/2),Rf,30,308),h=Q(id),g=e=>`${Math.round(e/Math.max(r.kwh,.001)*100)} %`,_=i>0&&u>0?Math.round(u/i):1,v=e=>X(n,e*r.price);return T`<svg viewBox="0 0 ${jf} ${Mf}" role="img" aria-label=${B(n,`energy_flow`)}>
      <defs>
        <pattern
          id="hatch"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect class="hatch-a" width="8" height="8"></rect>
          <rect class="hatch-b" width="3" height="8"></rect>
        </pattern>
      </defs>
      ${If($[0]+Ff,Nf,296,$[1],Nf,296,`rgb(66, 165, 245)`,.3)}
      <rect
        x=${$[0]}
        y=${Nf}
        width=${Ff}
        height=${Pf}
        rx="4"
        fill="rgb(66, 165, 245)"
      ></rect>
      <rect
        x=${$[1]}
        y=${Nf}
        width=${Ff}
        height=${Pf}
        rx="4"
        fill="currentColor"
        style="color: var(--primary-text-color)"
      ></rect>
      ${a>0?If($[1]+Ff,Nf,Nf+a,$[2],Nf,Nf+a,`url(#hatch)`,1):D}
      ${r.tracked>0?If($[1]+Ff,Nf+a,Nf+a+r.tracked*i,$[2],s,s+o,h,.6):D}
      ${a>0?E`<rect x=${$[2]} y=${Nf} width=${Ff} height=${a.toFixed(1)} rx="4" fill="rgba(158, 158, 158, 0.7)"></rect>`:D}
      ${o>0?E`<rect x=${$[2]} y=${s.toFixed(1)} width=${Ff} height=${o.toFixed(1)} rx="2" fill=${h}></rect>`:D}
      ${f.length?E`<path
              d=${`M${$[2]+Ff},${s.toFixed(1)} L${$[3]},${Nf} L${$[3]},${p.toFixed(1)} L${$[2]+Ff},${(s+o).toFixed(1)} Z`}
              fill=${h}
              fill-opacity="0.07"
              stroke=${Q(id,.5)}
              stroke-dasharray="4 4"
            ></path>
            <text class="zoom" x=${$[3]-6} y=${16} text-anchor="end">${B(n,`energy_zoom`,{z:_})}</text>`:D}
      ${f.map(e=>E`<rect x=${$[3]} y=${e.y.toFixed(1)} width=${Ff} height=${e.height.toFixed(1)} rx="3" fill=${h}></rect>`)}
      ${Lf($[0]+Ff+8,160,B(n,`energy_grid`),`${Z(n,r.kwh,0)} · ${X(n,r.cost)}`)}
      ${Lf($[1]+Ff+8,160+(a>Pf/2?44:0),B(n,`energy_home`),``)}
      ${a>0?Lf($[2]+Ff+8,Nf+a/2,B(n,`energy_untracked`),`${Z(n,r.untracked,0)} · ${g(r.untracked)}`):D}
      ${r.tracked>0?Lf($[2]+Ff+8,Math.min(286,s+o/2+16),B(n,`energy_tracked`),`${Z(n,r.tracked)} · ${g(r.tracked)}`):D}
      ${f.map((e,t)=>{let r=e.y+e.height/2,i=m[t]??r;return E`${Math.abs(i-r)>4?E`<path d=${`M${$[3]+Ff+1},${r.toFixed(1)} L${$[3]+Ff+5},${i.toFixed(1)}`} stroke="currentColor" stroke-opacity="0.35" fill="none"></path>`:D}${Lf($[3]+Ff+8,i,e.row.name,`${Z(n,e.row.kwh)} · ${v(e.row.kwh)}`)}`})}
    </svg>`}};z(Tf,zf),sn({type:Tf,name:`Vivid Energy Flow`,description:`Energy from the meter to the devices, the measured part zoomed in.`,preview:!0,documentationURL:`${R}#vivid-energy-flow`});var Bf=`vivid-energy-ranking`,Vf=qd;z(Bf,class extends zf{static getConfigElement(){return Md({fields:[{name:`period`,label:`energy_period`,default:`month`,options:qd.map(e=>({value:e,label:`energy_period_${e}`}))},{name:`max_devices`,label:`energy_max_devices`,selector:{number:{min:1,max:20,mode:`box`}},default:6}],validate:e=>Ef(Bf,e)})}static getStubConfig(){return{tariff:Vu}}static styles=[zf.styles,o`
      .list {
        container-type: inline-size;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .device {
        display: grid;
        grid-template-columns: 28px minmax(0, 1.6fr) minmax(40px, 1fr) auto auto;
        align-items: center;
        gap: 10px;
        min-height: 34px;
        font-size: 13.5px;
      }
      .device.child {
        grid-template-columns: 28px minmax(0, 1.6fr) minmax(40px, 1fr) auto auto;
        font-size: 12.5px;
        color: var(--secondary-text-color);
        min-height: 28px;
      }
      .device.child .name {
        padding-left: 14px;
      }
      .mini {
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(255, 193, 7, 0.2);
        color: rgb(255, 193, 7);
      }
      .mini ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
      }
      .mini.unknown {
        background: none;
        border: 1px dashed rgba(var(--vivid-rgb-text), 0.3);
        color: var(--vivid-muted);
        box-sizing: border-box;
      }
      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .bar {
        height: 8px;
        border-radius: 4px;
        background: rgba(var(--vivid-rgb-text), 0.06);
        overflow: hidden;
      }
      .bar i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: rgb(255, 193, 7);
      }
      .child .bar i {
        opacity: 0.6;
      }
      .untracked .bar i {
        background: repeating-linear-gradient(
          90deg,
          rgba(var(--vivid-rgb-text), 0.28) 0 6px,
          transparent 6px 10px
        );
      }
      .money {
        min-width: 56px;
        text-align: right;
      }
      .sep {
        height: 1px;
        margin: 6px 0;
        background: rgba(var(--vivid-rgb-text), 0.08);
      }
      @container (max-width: 400px) {
        .device,
        .device.child {
          grid-template-columns: 28px minmax(0, 1fr) auto auto;
        }
        .device .bar {
          display: none;
        }
      }
    `];resolveConfig(e){return Ef(Bf,e)}head(e,t){let n=this.hass,r=t?.days.length?this.view(e,t):void 0;return{icon:`mdi:power-plug-outline`,color:[255,193,7],title:e.name??B(n,`energy_devices`),sub:r?B(n,`energy_devices_sub`,{p:X(n,r.price,3)}):void 0,aside:Ad(Vf,this.period(e),e=>B(n,Df[e]),e=>{this._period=e})}}renderRow(e,t,n=!1){let r=this.hass;return T`<div class=${n?`device child`:`device`}>
      <span class="mini" aria-hidden="true"
        >${n?D:T`<ha-icon icon="mdi:flash"></ha-icon>`}</span
      >
      <span class="name" title=${e.name}>${e.name}</span>
      <div class="bar" aria-hidden="true">
        <i style=${k({width:`${Math.max(1.5,e.kwh/t*100).toFixed(1)}%`})}></i>
      </div>
      <span class="num">${Z(r,e.kwh)}</span>
      <span class="num money">${X(r,e.cost)}</span>
    </div>`}renderBody(e,t){let n=this.hass;if(!t.devices.length)return T`<div class="message">${B(n,`energy_no_devices`)}</div>`;let r=this.view(e,t),i=r.rows.slice(0,e.maxDevices),a=Math.max(...i.map(e=>e.kwh),.001);return T`<div class="list">
        ${i.map(e=>T`${this.renderRow(e,a)}${e.children.map(e=>this.renderRow(e,a,!0))}`)}
        ${r.kwh>0?T`<div class="sep"></div>
                <div class="device untracked">
                  <span class="mini unknown" aria-hidden="true">?</span>
                  <span class="name">${B(n,`energy_untracked`)}</span>
                  <div class="bar" aria-hidden="true"><i style="width: 100%"></i></div>
                  <span class="num">${Z(n,r.untracked,0)}</span>
                  <span class="num money">${X(n,r.untracked*r.price)}</span>
                </div>`:D}
      </div>
      ${r.kwh>0?T`<div class="sub">
              ${B(n,`energy_tracked_share`,{p:`${new Intl.NumberFormat(dn(n),{maximumFractionDigits:1}).format(r.trackedShare*100)} %`})}
            </div>`:D}`}}),sn({type:Bf,name:`Vivid Energy Ranking`,description:`The devices of the Energy dashboard ranked by energy and cost, with what is not measured.`,preview:!0,documentationURL:`${R}#vivid-energy-ranking`});var Hf=`vivid-load-curve`;function Uf(e){return Ru(Hf,e)}var Wf=8,Gf=480,Kf=160;function qf(e,t){return t>=1e3?`${V(e,t/1e3,1)} kW`:`${V(e,t,0)} W`}z(Hf,class extends kd{static properties={...kd.properties,_date:{state:!0}};static getConfigElement(){return Md({fields:[],validate:e=>Uf(e)})}static getStubConfig(){return{tariff:Vu}}static styles=[kd.styles,o`
      svg {
        width: 100%;
        height: auto;
        color: var(--primary-text-color);
      }
      .standby {
        font-size: 11px;
        fill: var(--secondary-text-color);
      }
      .hours {
        position: relative;
        height: 14px;
        font-size: 11px;
        color: var(--vivid-muted);
      }
      .hours span {
        position: absolute;
        transform: translateX(-50%);
      }
    `];resolveConfig(e){return Uf(e)}needs(){return{days:Wf,hourlyDays:Wf}}dates(e){return e?Qd(e.hourly).filter(t=>t<e.today):[]}shownDate(e){let t=this.dates(e);return this._date&&t.includes(this._date)?this._date:t.at(-1)}head(e,t){let n=this.hass,r=this.dates(t),i=this.shownDate(t),a=i?r.indexOf(i):-1,o=e=>{let t=r[a+e];t&&(this._date=t)};return{icon:`mdi:chart-bar`,color:id,title:e.name??(i?td(n,i):B(n,`energy_curve`)),sub:B(n,`energy_curve_sub`),aside:r.length?T`<button
              type="button"
              class="reset icon-button"
              ?disabled=${a<=0}
              aria-label=${B(n,`energy_previous_day`)}
              @click=${()=>o(-1)}
            >
              <ha-icon icon="mdi:chevron-left"></ha-icon></button
            ><button
              type="button"
              class="reset icon-button"
              ?disabled=${a>=r.length-1}
              aria-label=${B(n,`energy_next_day`)}
              @click=${()=>o(1)}
            >
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>`:D}}renderBody(e,t){let n=this.hass,r=this.shownDate(t),i=r?$d(t.hourly,e.tariff,r):void 0;if(!i)return T`<div class="message">${B(n,`energy_curve_waiting`)}</div>`;let a=Math.max(...i.hours.map(e=>e.kwh),.05)*1.1,o=Gf/24,s=e=>Kf-e/a*156,c=e.tariff.offPeakRanges.flatMap(e=>e.from<e.to?[[e.from,e.to]]:[[e.from,1440],[0,e.to]]),l=s(i.standbyWatts/1e3);return T`<svg
        viewBox="0 0 ${Gf} ${Kf}"
        role="img"
        aria-label=${B(n,`energy_curve`)}
      >
        ${c.map(([e,t])=>E`<rect x=${(e/1440*Gf).toFixed(1)} y="0" width=${((t-e)/1440*Gf).toFixed(1)} height=${Kf} fill=${Q(rd)} fill-opacity="0.12"></rect>`)}
        ${i.hours.map(e=>{let t=e.hour*o+1.5,r=s(e.kwh*e.offPeakShare),i=s(e.kwh);return E`<g>
            ${e.offPeakShare>0?E`<rect x=${t.toFixed(1)} y=${r.toFixed(1)} width=${17 .toFixed(1)} height=${(Kf-r).toFixed(1)} rx="2" fill=${Q(rd)}></rect>`:D}
            ${e.offPeakShare<1?E`<rect x=${t.toFixed(1)} y=${i.toFixed(1)} width=${17 .toFixed(1)} height=${Math.max(0,r-i).toFixed(1)} rx="2" fill=${Q(id)}></rect>`:D}
            <title>${`${e.hour} h · ${Z(n,e.kwh,2)}`}</title>
          </g>`})}
        ${i.standbyWatts>0?E`<line x1="0" x2=${Gf} y1=${l.toFixed(1)} y2=${l.toFixed(1)} stroke="currentColor" stroke-opacity="0.6" stroke-dasharray="5 5"></line>
              <text class="standby" x=${476} y=${(l-5).toFixed(1)} text-anchor="end">${B(n,`energy_standby`,{w:qf(n,i.standbyWatts)})}</text>`:D}
      </svg>
      <div class="hours" aria-hidden="true">
        ${[0,6,12,18,24].map(e=>T`<span style="left: ${(e/24*100).toFixed(2)}%">${e} h</span>`)}
      </div>
      <div class="tiles">
        <div class="tile">
          <div class="sub">${B(n,`energy_peak`)}</div>
          <div class="value">${Z(n,i.peakKwh)}</div>
        </div>
        <div class="tile">
          <div class="sub">${B(n,`energy_off_peak`)}</div>
          <div class="value">${Z(n,i.offPeakKwh)}</div>
        </div>
        <div class="tile">
          <div class="sub">${B(n,`energy_cost`)}</div>
          <div class="value">${X(n,i.cost)}</div>
        </div>
        <div class="tile">
          <div class="sub">${B(n,`energy_standby_year`)}</div>
          <div class="value">${X(n,i.standbyYear,0)}</div>
        </div>
      </div>`}}),sn({type:Hf,name:`Vivid Load Curve`,description:`The hourly load curve of a day over the off-peak hours, with the standby.`,preview:!0,documentationURL:`${R}#vivid-load-curve`});var Jf=500,Yf=10,Xf=3e4,Zf=28;function Qf(e,t,n,r=`white`){let i={...Ot(n*(e.glowScale??1)),"--vivid-glow-size":At(t===`pill`?36:Zf)},a=e.active?e.tone:void 0;if(!a)return i;let o=r===`white`&&a.iconColor===`rgba(0, 0, 0, 0.72)`?{...a,iconColor:`#ffffff`}:a;return o.iconColor===`#ffffff`&&(i[`--badge-ink-shadow`]=`drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35))`,i[`--badge-text-shadow`]=`0 1px 2px rgba(0, 0, 0, 0.35)`),e.pulse&&(i[`--pulse-duration`]=e.pulse),e.pulseColor&&(i[`--pulse-color`]=e.pulseColor),t===`pill`?{...i,"--badge-bg":e.soft?`linear-gradient(${o.background}, ${o.background}), var(--ha-card-background, var(--card-background-color, #1c1c1c))`:o.background,"--badge-color":e.soft?`color-mix(in srgb, ${o.iconColor} 70%, var(--primary-text-color, #ffffff))`:o.iconColor,"--badge-shadow":o.shadow,"--badge-border":`transparent`,"--badge-weight":`600`,"--icon-color":o.iconColor}:{...i,"--icon-bg":o.background,"--icon-color":o.iconColor,"--icon-shadow":o.shadow}}var $f=class extends O{static properties={hass:{attribute:!1},_config:{state:!0},_open:{state:!0}};view;detailsPopover;press;ticker;constructor(){super(),this._open=!1}setConfig(e){this._config=this.resolveConfig(e)}static styles=[H,U,o`
      :host {
        display: inline-flex;
        --vivid-badge-size: var(--ha-badge-size, 36px);
      }
      .badge {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: var(--vivid-badge-size);
        min-width: var(--vivid-badge-size);
        padding: 0 4px;
        border-radius: var(--ha-badge-border-radius, calc(var(--vivid-badge-size) / 2));
        background: var(
          --badge-bg,
          var(--ha-card-background, var(--card-background-color, #1c1c1c))
        );
        border: var(--ha-card-border-width, 1px) solid
          var(
            --badge-border,
            var(--ha-card-border-color, var(--divider-color, rgba(255, 255, 255, 0.12)))
          );
        /* Gradients (a split disc look) also cover the border. */
        background-origin: border-box;
        box-shadow: var(--badge-shadow, none);
        color: var(--badge-color, var(--primary-text-color));
        font-size: var(--ha-badge-font-size, 12px);
        font-weight: var(--badge-weight, 500);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        transition:
          box-shadow 0.4s ease,
          transform 0.12s ease;
      }
      .badge.text {
        padding-right: 12px;
      }
      .badge:active {
        transform: scale(0.96);
      }
      .badge:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .badge[aria-expanded='true'] {
        border-color: rgba(var(--vivid-rgb-text), 0.35);
      }
      .icon {
        position: relative;
        display: grid;
        place-items: center;
        width: calc(var(--vivid-badge-size) - 8px);
        height: calc(var(--vivid-badge-size) - 8px);
        border-radius: 50%;
        background: var(--icon-bg, transparent);
        box-shadow: var(--icon-shadow, none);
        color: var(--icon-color, var(--disabled-text-color, rgba(255, 255, 255, 0.4)));
        transition:
          background 0.4s ease,
          box-shadow 0.4s ease,
          color 0.4s ease;
      }
      .icon ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
      }
      .ring {
        position: absolute;
        inset: -1px;
        width: calc(100% + 2px);
        height: calc(100% + 2px);
        transform: rotate(-90deg);
        pointer-events: none;
      }
      .ring circle {
        fill: none;
        stroke-width: 2.4;
      }
      .ring .track {
        stroke: rgba(var(--vivid-rgb-text), 0.12);
      }
      .ring .level {
        stroke: var(--ring-color, currentColor);
        stroke-linecap: round;
        transition: stroke-dasharray 0.6s ease;
      }
      /* A ring growing and fading from the icon: alerts and live presence. */
      .pulse .icon::after {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 50%;
        border: 2px solid var(--pulse-color, currentColor);
        opacity: 0;
        animation: vivid-badge-pulse var(--pulse-duration, 2s) ease-out infinite;
        animation-play-state: var(--vivid-glow-play, running);
      }
      @keyframes vivid-badge-pulse {
        0% {
          transform: scale(0.85);
          opacity: 0.55;
        }
        100% {
          transform: scale(1.45);
          opacity: 0;
        }
      }
      /* White on a gradient that may hold a white light: a soft shadow keeps it readable. */
      .active .icon ha-icon {
        filter: var(--badge-ink-shadow, none);
      }
      .active.pill {
        text-shadow: var(--badge-text-shadow, none);
      }
      /* A drawn stroke for icons without a crossed-out variant. */
      .strike {
        position: absolute;
        width: 22px;
        height: 2px;
        border-radius: 1px;
        background: currentColor;
        transform: rotate(-45deg);
        box-shadow: 0 0 0 1.5px var(--ha-card-background, var(--card-background-color, #1c1c1c));
      }
      .muted {
        color: var(--secondary-text-color);
      }
      .label .muted {
        font-weight: 500;
        text-shadow: none;
      }
      /* On a filled pill, muted words keep the ink, only lighter. */
      .active.pill .label .muted,
      .active.pill .trend {
        color: inherit;
        opacity: 0.75;
      }
      .trend {
        --mdc-icon-size: 14px;
        display: inline-flex;
        margin-left: -3px;
        color: var(--secondary-text-color);
      }
      .unavailable {
        opacity: 0.5;
      }
      @media (prefers-reduced-motion: reduce) {
        .badge,
        .icon {
          transition: none;
        }
        .pulse .icon::after {
          animation: none;
        }
      }
    `];disconnectedCallback(){super.disconnectedCallback(),this.closeDetails(),this.cancelPress(),this.stopTicker()}shouldUpdate(e){return!this.hass||!this._config?e.has(`_config`):e.size===1&&e.has(`hass`)?Ga(e.get(`hass`),this.hass,this.view?.watched??[]):!0}willUpdate(){this.hass&&this._config&&(this.view=this.buildView(this.hass,this._config))}updated(){this._open&&this.refreshDetails(),this.view?.ticking&&this.isConnected?this.startTicker():this.stopTicker()}startTicker(){this.ticker??=window.setInterval(()=>this.requestUpdate(),Xf)}stopTicker(){this.ticker!==void 0&&window.clearInterval(this.ticker),this.ticker=void 0}cancelPress(){this.press&&window.clearTimeout(this.press.timer),this.press=void 0}onPointerDown=e=>{if(e.button!==0)return;this.cancelPress();let t={x:e.clientX,y:e.clientY,held:!1,pointerId:e.pointerId,timer:window.setTimeout(()=>{t.held=!0,this.run(`hold`)},Jf)};this.press=t};onPointerMove=e=>{let t=this.press;t&&e.pointerId===t.pointerId&&Math.hypot(e.clientX-t.x,e.clientY-t.y)>Yf&&this.cancelPress()};onPointerUp=e=>{let t=this.press;t&&e.pointerId===t.pointerId&&(this.cancelPress(),t.held||this.run(`tap`))};onKeyDown=e=>{e.key===`Enter`||e.key===` `?(e.preventDefault(),this.run(`tap`)):(e.key===`ArrowDown`||e.key===`ContextMenu`)&&(e.preventDefault(),this.run(`hold`))};run(e){let t=this._config;if(!t||!this.hass)return;let n=e===`tap`?t.tapAction:t.holdAction;if(P(this,e===`hold`?`medium`:`light`),n.action===`toggle`&&this.toggle){this.toggle();return}mt(n,{node:this,hass:this.hass,entityId:t.entity??t.entities?.[0]??``,openDetails:()=>this.toggleDetails()})}toggleDetails(){this._open?this.closeDetails():this.openDetails()}openDetails(){let e=this.renderRoot.querySelector(`.badge`);e&&(this.detailsPopover||(this.detailsPopover=new Ri,this.detailsPopover.addEventListener(`vivid-popover-close-request`,()=>this.closeDetails()),this.detailsPopover.addEventListener(`vivid-more-info`,(e=>{this.closeDetails(),$e(this,e.detail.entityId)}))),this._open=!0,this.detailsOpened?.(),this.refreshDetails(),this.detailsPopover.show(e))}closeDetails(){this._open&&(this._open=!1,this.detailsPopover?.hide())}refreshDetails(){let e=this.detailsPopover;if(!e||!this.view||!this._config)return;let t=this.view.glowScale??1;for(let[n,r]of Object.entries(Ot(this._config.glow*t)))e.style.setProperty(n,r);e.label=this.view.name,e.content=this.renderDetails()}renderRing(e){if(e.ring===void 0)return D;let t=2*Math.PI*13,n=Math.max(0,Math.min(1,e.ring))*t;return T`<svg class="ring" viewBox="0 0 30 30" aria-hidden="true">
      <circle class="track" cx="15" cy="15" r=${13}></circle>
      <circle
        class="level"
        cx="15"
        cy="15"
        r=${13}
        style=${k({"--ring-color":e.ringColor})}
        stroke-dasharray=${`${n.toFixed(1)} ${t.toFixed(1)}`}
      ></circle>
    </svg>`}render(){let e=this._config,t=this.view;if(!e||!this.hass||!t)return D;let n=`${t.name} · ${t.state}`;return T`<button
      type="button"
      class=${W({reset:!0,badge:!0,text:t.text!==void 0,active:t.active,pill:e.look===`pill`,pulse:t.active&&t.pulse!==void 0,unavailable:!!t.unavailable})}
      style=${k(Qf(t,e.look,e.glow,e.iconColor))}
      title=${n}
      aria-label=${n}
      aria-haspopup="dialog"
      aria-expanded=${String(this._open)}
      @pointerdown=${this.onPointerDown}
      @pointermove=${this.onPointerMove}
      @pointerup=${this.onPointerUp}
      @pointercancel=${()=>this.cancelPress()}
      @pointerleave=${()=>this.cancelPress()}
      @keydown=${this.onKeyDown}
      @contextmenu=${e=>e.preventDefault()}
    >
      <span class="icon">
        ${this.renderRing(t)}
        <ha-icon .icon=${t.icon}></ha-icon>
        ${t.strike?T`<span class="strike"></span>`:D}
      </span>
      ${t.text===void 0?D:T`<span class=${t.textMuted?`label muted`:`label`}
              >${t.prefix?T`<span class="muted">${t.prefix} </span>`:D}${t.text}${t.suffix?T`<span class="muted"> ${t.suffix}</span>`:D}</span
            >`}
      ${t.trend?T`<ha-icon
              class="trend"
              .icon=${t.trend===`up`?`mdi:arrow-up-thin`:`mdi:arrow-down-thin`}
            ></ha-icon>`:D}
    </button>`}},ep=[`disc`,`pill`],tp=[`white`,`auto`],np=[`mean`,`median`,`min`,`max`,`sum`],rp=class{tag;config;constructor(e,t){this.tag=e,(typeof t!=`object`||!t)&&this.fail(`invalid configuration.`),this.config=t}fail(e){throw Error(`${this.tag}: ${e}`)}text(e){let t=this.config[e];if(t!=null&&t!==``)return typeof t!=`string`&&this.fail(`"${e}" must be text.`),t.trim()||void 0}bool(e,t){let n=this.config[e];return n==null?t:(typeof n!=`boolean`&&this.fail(`"${e}" must be true or false.`),n)}number(e,t,n=0,r=1/0){let i=this.config[e];if(i==null||i===``)return t;let a=typeof i==`number`?i:Number(i);return(!Number.isFinite(a)||a<n||a>r)&&this.fail(Number.isFinite(r)?`"${e}" must be a number from ${n} to ${r}.`:`"${e}" must be a number of at least ${n}.`),a}choice(e,t,n){let r=this.config[e];return r==null||r===``?n:((typeof r!=`string`||!t.includes(r))&&this.fail(`"${e}" must be one of: ${t.join(`, `)}.`),r)}action(e,t){try{return ft(this.config[e],e)??t}catch(e){this.fail(e.message)}}glow(){let e=this.config.glow;if(e==null||e===``)return 100;let t=Dt(e);return t===void 0&&this.fail(`"glow" must be a percentage from 0 to 200, or ${wt.join(`, `)}.`),t}};function ip(e,t){let n=e.text(`entity`),r=e.config.entities,i;r!=null&&((!Array.isArray(r)||r.some(e=>typeof e!=`string`))&&e.fail(`"entities" must be a list of entity ids.`),i=r.map(e=>e.trim()).filter(Boolean)),!n&&!i?.length&&!t.entityOptional&&e.fail(`set "entity" to a group or an entity, or list "entities".`);for(let r of[n,...i??[]])r&&!t.domains.includes(A(r))&&e.fail(`"${r}" must be one of: ${t.domains.join(`, `)} entities.`);let a={action:`details`};return{type:String(e.config.type??``),entity:n,entities:i?.length?i:void 0,name:e.text(`name`),icon:e.text(`icon`),iconOff:e.text(`icon_off`),look:e.choice(`look`,ep,`disc`),iconColor:e.choice(`icon_color`,tp,`white`),glow:e.glow(),tapAction:e.action(`tap_action`,t.tapAction??a),holdAction:e.action(`hold_action`,t.holdAction??a)}}var ap=`vivid-light-badge`,op={light:`vivid-light-badge`,led:`vivid-led-badge`,lamp:`vivid-lamp-badge`};function sp(e){let t=typeof e==`string`?e.replace(/^custom:/,``):``;return Object.entries(op).find(([,e])=>e===t)?.[0]??`light`}var cp=[`light`,`switch`,`group`],lp=[`list`,`compact`],up=ap;function dp(e){throw Error(`${up}: ${e}`)}function fp(e,t){if(e!=null&&e!==``)return typeof e!=`string`&&dp(`"${t}" must be text.`),e.trim()||void 0}function pp(e,t,n){try{return ft(e,t)??n}catch(e){dp(e.message)}}function mp(e,t=sp(e?.type)){up=op[t],(typeof e!=`object`||!e)&&dp(`invalid configuration.`);let n=e,r=fp(n.entity,`entity`);r||dp(`set "entity" to a light or a light group.`),cp.includes(A(r))||dp(`"${r}" must be a light, a switch or a group of them.`);for(let e of[`show_count`,`show_zero`])n[e]!==void 0&&typeof n[e]!=`boolean`&&dp(`"${e}" must be true or false.`);let i=n.glow===void 0?100:Dt(n.glow);i===void 0&&dp(`"glow" must be a percentage from 0 to 200, or ${wt.join(`, `)}.`);let a=n.glow_boost;a!==void 0&&(typeof a!=`number`||!Number.isFinite(a)||a<0||a>200)&&dp(`"glow_boost" must be a percentage from 0 to 200.`),n.look!==void 0&&!ep.includes(n.look)&&dp(`"look" must be one of: ${ep.join(`, `)}.`),n.icon_color!==void 0&&!tp.includes(n.icon_color)&&dp(`"icon_color" must be one of: ${tp.join(`, `)}.`),n.layout!==void 0&&!lp.includes(n.layout)&&dp(`"layout" must be one of: ${lp.join(`, `)}.`);let o=n.transition;return o!==void 0&&(typeof o!=`number`||!Number.isFinite(o)||o<0)&&dp(`"transition" must be a positive number of seconds.`),{type:n.type,kind:t,entity:r,name:fp(n.name,`name`),icon:fp(n.icon,`icon`),iconOff:fp(n.icon_off,`icon_off`),showCount:n.show_count??!0,showZero:n.show_zero??!1,glow:i,glowBoost:a??100,look:n.look??`disc`,iconColor:n.icon_color??`white`,layout:n.layout??`list`,transition:o,tapAction:pp(n.tap_action,`tap_action`,{action:`toggle`}),holdAction:pp(n.hold_action,`hold_action`,{action:`details`})}}var hp={"mdi:led-strip-variant":`mdi:led-strip-variant-off`,"mdi:led-strip":`mdi:led-strip-variant-off`,"mdi:lightbulb":`mdi:lightbulb-off`,"mdi:lightbulb-outline":`mdi:lightbulb-off-outline`,"mdi:lightbulb-group":`mdi:lightbulb-group-off`,"mdi:lightbulb-group-outline":`mdi:lightbulb-group-off-outline`,"mdi:lightbulb-multiple":`mdi:lightbulb-multiple-off`,"mdi:lightbulb-multiple-outline":`mdi:lightbulb-multiple-off-outline`,"mdi:desk-lamp":`mdi:desk-lamp-off`,"mdi:string-lights":`mdi:string-lights-off`},gp={led:`mdi:led-strip-variant`,lamp:`mdi:lamps`};function _p(e,t){return t?`mdi:led-strip-variant`:e?`mdi:lightbulb-group`:`mdi:lightbulb`}var vp=/* @__PURE__ */ new Set([`brightness`,`color_temp`,`hs`,`rgb`,`rgbw`,`rgbww`,`xy`,`white`]),yp=/* @__PURE__ */ new Set([`hs`,`rgb`,`rgbw`,`rgbww`,`xy`]);function bp(e){let t=e?.color_mode;if(typeof t==`string`&&t)return!yp.has(t);let n=e?.supported_color_modes;return!(Array.isArray(n)&&n.some(e=>yp.has(e)))}function xp(e){let t=e?.supported_color_modes;return Array.isArray(t)&&t.some(e=>vp.has(e))}function Sp(e,t){let n=e.states[t.entity],r=qe(e,t.entity),i=Array.isArray(n?.attributes.entity_id)&&r.length>0,a=Zi(r.map(t=>M(e,t))),o=r.map((t,n)=>{let r=e.states[t],i=r?.attributes,o=j(r),s=o&&r.state===`on`,c=i?.brightness,l=bp(i),u=i?.color_temp_kelvin;return{entityId:t,name:a[n]??t,available:o,isOn:s,brightness:s?typeof c==`number`?Math.round(c/255*100):100:0,rgb:s?l?rn(typeof u==`number`?u:void 0):yt(r):void 0,dimmable:xp(i),white:l}}),s=o.filter(e=>e.isOn),c=r.length>0&&r.every(t=>e.entities?.[t]?.platform===`wled`),l=n?.attributes.icon,u=gp[t.kind],d=t.icon??u??(typeof l==`string`&&l?l:_p(i,c)),f=hp[d];return{name:t.name??M(e,t.entity),isGroup:i,lights:o,on:s.length,total:o.filter(e=>e.available).length,colors:s.map(e=>e.rgb).filter(e=>e!==void 0),white:s.length>0&&s.every(e=>e.white),brightness:s.length?Math.round(s.reduce((e,t)=>e+t.brightness,0)/s.length):0,icon:d,iconOff:t.iconOff??f??d,strike:t.iconOff===void 0&&f===void 0,watched:[t.entity,...r]}}var Cp=500,wp=6,Tp=1500;z(`vivid-light-badge-details`,class extends O{static properties={hass:{attribute:!1},model:{attribute:!1},transition:{type:Number},layout:{},glowBoost:{type:Number},_preview:{state:!0}};press;holdTimer;constructor(){super(),this.layout=`list`,this._preview={}}static styles=[H,U,o`
      :host {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .head {
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding: 4px 6px 2px;
      }
      .title {
        font-size: 14px;
        font-weight: 600;
      }
      .muted {
        color: var(--secondary-text-color);
        font-size: 12px;
      }
      .offline {
        opacity: 0.5;
      }
      .dot {
        /* Halo proportions of a 32 px disc (see glowSize). */
        --vivid-glow-size: 0.89;
        display: grid;
        place-items: center;
        flex: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--dot-bg, rgba(var(--vivid-rgb-text), 0.1));
        box-shadow: var(--dot-shadow, none);
        color: var(--dot-color, var(--secondary-text-color));
        font-size: 11px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        transition:
          background 0.3s ease,
          box-shadow 0.3s ease;
      }
      .dot ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
      }
      .dot:disabled {
        cursor: default;
      }
      .dot:focus-visible,
      .bar:focus-visible,
      .chip:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .name {
        font-size: 13px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: default;
        -webkit-user-select: none;
        user-select: none;
      }

      /* ---------------------------------- list ---------------------------------- */
      .row {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) minmax(88px, 34%) 38px;
        align-items: center;
        gap: 10px;
        padding: 4px 8px 4px 4px;
        border-radius: 16px;
        background: var(--vivid-layer-1);
      }
      .bar {
        position: relative;
        height: 24px;
        border-radius: 12px;
        overflow: hidden;
        background: var(--vivid-layer-2);
        touch-action: pan-y;
        cursor: ew-resize;
      }
      .bar.static {
        cursor: default;
      }
      .fill {
        position: absolute;
        inset: 0 auto 0 0;
        width: var(--level, 0%);
        border-radius: inherit;
        background: linear-gradient(
          90deg,
          rgba(var(--rgb, 255, 214, 170), 0.3),
          rgba(var(--rgb, 255, 214, 170), 0.95)
        );
        transition: width 0.2s ease;
      }
      .sliding .fill,
      .sliding.chip {
        transition: none;
      }
      .percent {
        justify-self: end;
        font-size: 12px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .percent.off {
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      /* --------------------------------- compact -------------------------------- */
      .chips {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
      }
      .chip {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        padding: 4px 10px 4px 4px;
        border-radius: 20px;
        background:
          linear-gradient(
              90deg,
              rgba(var(--rgb, 255, 214, 170), 0.22) var(--level, 0%),
              transparent var(--level, 0%)
            )
            no-repeat,
          var(--vivid-layer-1);
        touch-action: pan-y;
        transition: background 0.2s ease;
      }
      .chip .dot {
        pointer-events: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .dot,
        .fill,
        .chip {
          transition: none;
        }
      }
    `];disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this.holdTimer),this.press&&window.clearTimeout(this.press.timer)}options(){return{transition:this.transition}}levelOf(e){return this._preview[e.entityId]??e.brightness}commitBrightness(e,t){this.hass&&(this._preview={...this._preview,[e]:t},P(this,`light`),nt(this.hass,e,t,this.options()),window.setTimeout(()=>{let{[e]:t,...n}=this._preview;this._preview=n},Tp))}toggle(e){this.hass&&e.available&&(P(this,`light`),et(this.hass,e.entityId,this.options()))}moreInfo(e){P(this,`medium`),N(this,`vivid-more-info`,{entityId:e})}startPress(e,t,n){if(e.button!==0)return;let r=e.currentTarget;this.press&&window.clearTimeout(this.press.timer);let i={entityId:t.entityId,pointerId:e.pointerId,x:e.clientX,y:e.clientY,start:t.brightness,width:r.getBoundingClientRect().width,moved:!1,held:!1};n&&(i.timer=window.setTimeout(()=>{i.held=!0,this.moreInfo(t.entityId)},Cp)),this.press=i;try{r.setPointerCapture(e.pointerId)}catch{}}sliding(e){let t=this.press;if(t&&t.pointerId===e.pointerId&&!t.held){if(!t.moved){if(Math.abs(e.clientX-t.x)<wp){Math.abs(e.clientY-t.y)>wp&&this.cancelPress();return}t.moved=!0,window.clearTimeout(t.timer),e.currentTarget.classList.add(`sliding`)}return t}}endPress(e){let t=this.press;if(t&&t.pointerId===e.pointerId)return window.clearTimeout(t.timer),this.press=void 0,e.currentTarget.classList.remove(`sliding`),t.held?void 0:t}cancelPress(){this.press&&window.clearTimeout(this.press.timer),this.press=void 0}percentAt(e,t){let n=e.getBoundingClientRect();return Math.round(F((t-n.left)/Math.max(n.width,1),0,1)*100)}percentFrom(e,t){let n=(t-e.x)/Math.max(e.width,1)*100;return Math.round(F(e.start+n,0,100))}onKeyDim(e,t){if(!t.available||!t.dimmable)return;let n=e.key===`ArrowRight`||e.key===`ArrowUp`,r=e.key===`ArrowLeft`||e.key===`ArrowDown`;(n||r)&&(e.preventDefault(),this.commitBrightness(t.entityId,F(this.levelOf(t)+(n?10:-10),0,100)))}holdName(e){window.clearTimeout(this.holdTimer),this.holdTimer=window.setTimeout(()=>this.moreInfo(e),Cp)}stateText(e,t){return e.available?!e.isOn&&t===0?B(this.hass,`off`):e.dimmable?`${t} %`:B(this.hass,`on`):B(this.hass,`unavailable`)}dotStyle(e){let t=(e.white?an:Kt)(e.rgb??ht,e.isOn,e.brightness,this.glowBoost);return k({"--dot-bg":t.background,"--dot-shadow":t.shadow,"--dot-color":t.iconColor})}renderRow(e){let t=this.levelOf(e),n=e.isOn||t>0,r=this.stateText(e,t),i=B(this.hass,e.isOn?`power_off`:`power_on`),a=e.available&&e.dimmable;return T`<div class=${W({row:!0,offline:!e.available})}>
      <button
        type="button"
        class="reset dot"
        style=${this.dotStyle(e)}
        title=${i}
        aria-label=${`${e.name} · ${i}`}
        aria-pressed=${String(e.isOn)}
        ?disabled=${!e.available}
        @click=${()=>this.toggle(e)}
      >
        <ha-icon .icon=${`mdi:power`}></ha-icon>
      </button>
      <span
        class="name"
        title=${e.name}
        @pointerdown=${()=>this.holdName(e.entityId)}
        @pointerup=${()=>window.clearTimeout(this.holdTimer)}
        @pointerleave=${()=>window.clearTimeout(this.holdTimer)}
        @contextmenu=${e=>e.preventDefault()}
        >${e.name}</span
      >
      ${e.dimmable?T`<div
              class=${W({bar:!0,static:!a})}
              role="slider"
              tabindex=${a?0:-1}
              aria-label=${`${e.name} ${B(this.hass,`brightness`)}`}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow=${t}
              aria-valuetext=${r}
              aria-disabled=${String(!a)}
              style=${k({"--level":n?`${t}%`:`0%`,"--rgb":(e.rgb??ht).join(`, `)})}
              @pointerdown=${t=>{a&&this.startPress(t,e,!1)}}
              @pointermove=${t=>{if(!this.sliding(t))return;let n=t.currentTarget;this._preview={...this._preview,[e.entityId]:zn(this.percentAt(n,t.clientX))}}}
              @pointerup=${t=>{if(!this.endPress(t))return;let n=t.currentTarget;this.commitBrightness(e.entityId,zn(this.percentAt(n,t.clientX)))}}
              @pointercancel=${()=>this.cancelPress()}
              @keydown=${t=>this.onKeyDim(t,e)}
            >
              <div class="fill"></div>
            </div>`:T`<span></span>`}
      <span class=${W({percent:!0,off:!n})}>${r}</span>
    </div>`}renderChip(e){let t=this.levelOf(e),n=e.isOn||t>0,r=this.stateText(e,t);return T`<div
      class=${W({chip:!0,offline:!e.available})}
      role="button"
      tabindex=${e.available?0:-1}
      aria-label=${`${e.name} · ${r}`}
      aria-pressed=${String(e.isOn)}
      style=${k({"--level":n?`${t}%`:`0%`,"--rgb":(e.rgb??ht).join(`, `)})}
      @pointerdown=${t=>{e.available&&this.startPress(t,e,!0)}}
      @pointermove=${t=>{let n=this.sliding(t);n&&e.dimmable&&(this._preview={...this._preview,[e.entityId]:zn(this.percentFrom(n,t.clientX))})}}
      @pointerup=${t=>{let n=this.endPress(t);n&&(n.moved?e.dimmable&&this.commitBrightness(e.entityId,zn(this.percentFrom(n,t.clientX))):this.toggle(e))}}
      @pointercancel=${()=>this.cancelPress()}
      @contextmenu=${e=>e.preventDefault()}
      @keydown=${t=>{t.key===`Enter`||t.key===` `?(t.preventDefault(),this.toggle(e)):this.onKeyDim(t,e)}}
    >
      <span class="dot" style=${this.dotStyle(e)}>
        ${n&&e.available&&e.dimmable?T`${t}`:T`<ha-icon .icon=${`mdi:power`}></ha-icon>`}
      </span>
      <span class="name" title=${e.name}>${e.name}</span>
    </div>`}render(){let e=this.model;if(!e)return D;let t=e=>e.entityId;return T`<div class="head">
        <span class="title">${e.name}</span>
        <span class="muted"
          >${B(this.hass,`lights_on`,{on:e.on,total:e.total})}</span
        >
      </div>
      ${this.layout===`compact`?T`<div class="chips">
              ${Ko(e.lights,t,e=>this.renderChip(e))}
            </div>`:Ko(e.lights,t,e=>this.renderRow(e))}`}});var Ep=`default`,Dp=`custom`,Op={entity:`badge_entity`,name:`badge_details_title`,icon:`icon_on`,icon_off:`icon_off`,show_count:`show_count`,show_zero:`show_zero`,look:`badge_look`,icon_color:`icon_color`,layout:`badge_layout`,glow:`glow`,glow_boost:`glow_boost`,transition:`transition`,tap_action:`tap_action`,hold_action:`hold_action`},kp={toggle:`action_toggle`,details:`action_details`,"more-info":`action_more_info`,none:`action_none`};function Ap(e,t){if(e==null||e===``)return Ep;if(typeof e==`string`)return e===t?Ep:e;if(typeof e==`object`){let n=Object.keys(e),r=e.action;if(n.length===1&&r&&ut.includes(r))return r===t?Ep:r}return Dp}z(`vivid-light-badge-editor`,class extends O{static properties={hass:{attribute:!1},_config:{state:!0}};static styles=[H,o`
      :host {
        display: block;
      }
      .error {
        margin-top: 8px;
        color: var(--error-color, #db4437);
        font-size: 13px;
      }
    `];setConfig(e){this._config=e}connectedCallback(){super.connectedCallback(),go().then(()=>this.requestUpdate())}t(e,t){return yo(this.hass,e,t)}computeLabel=e=>{let t=Op[e.name];return t?this.t(t):void 0};autoIcons(){let e=this._config,t=this.hass;if(!t||!e?.entity||!t.states[e.entity])return{};try{mp(e);let n=n=>Sp(t,mp({...e,...n}));return{icon:n({icon:void 0,icon_off:void 0}).icon,off:n({icon_off:void 0})}}catch(e){return{error:e.message}}}choice(e,t){return{select:{mode:`dropdown`,options:e.map(e=>({value:e,label:this.t(`${t}${e}`)}))}}}actions(e,t,n){let r=[{value:Ep,label:this.t(t)},...ut.filter(e=>e!==n).map(e=>({value:e,label:this.t(kp[e])}))];return e===Dp&&r.push({value:Dp,label:this.t(`action_custom`)}),{select:{mode:`dropdown`,options:r}}}onChange(e){let t=this._config??{type:`custom:vivid-light-badge`},n={...t},r=(e,t,r)=>{t===void 0||t===``||t===null||t===r?delete n[e]:n[e]=t};r(`entity`,e.entity),r(`name`,e.name),r(`icon`,e.icon),r(`icon_off`,e.icon_off),r(`show_count`,e.show_count,!0),r(`show_zero`,e.show_zero,!1),e.glow!==Dt(t.glow??100)&&r(`glow`,e.glow,100),r(`glow_boost`,e.glow_boost,100),r(`look`,e.look,`disc`),r(`icon_color`,e.icon_color,`white`),r(`layout`,e.layout,`list`),r(`transition`,e.transition);for(let t of[`tap_action`,`hold_action`]){let n=e[t];n!==Dp&&r(t,n===Ep?void 0:{action:n})}this._config=n,N(this,`config-changed`,{config:this._config})}render(){if(!this.hass||!this._config)return D;let e=this._config,t=this.autoIcons(),n=t.error,r=Ap(e.tap_action,`toggle`),i=Ap(e.hold_action,`details`),a=t.icon??`mdi:lightbulb-group`,o=t.off?.iconOff??a,s=t.off?.strike?this.t(`icon_auto_struck`,{icon:o}):this.t(`icon_auto`,{icon:o}),c=[{name:`entity`,required:!0,selector:{entity:{domain:cp}}},{name:`name`,selector:{text:{}}},{type:`grid`,name:``,schema:[{name:`icon`,selector:{icon:{placeholder:a}}},{name:`icon_off`,selector:{icon:{placeholder:o}}}]},{type:`grid`,name:``,schema:[{name:`tap_action`,selector:this.actions(r,`badge_tap_default`,`toggle`)},{name:`hold_action`,selector:this.actions(i,`badge_hold_default`,`details`)}]},{type:`grid`,name:``,schema:[{name:`look`,selector:this.choice(ep,`look_`)},{name:`layout`,selector:this.choice(lp,`layout_`)}]},{name:`icon_color`,selector:this.choice(tp,`icon_color_`)},{name:`glow`,selector:Et},{name:`glow_boost`,selector:Et},{name:`transition`,selector:{number:{min:0,max:30,step:.1,mode:`box`,unit_of_measurement:`s`}}},{name:`show_count`,selector:{boolean:{}}},{name:`show_zero`,selector:{boolean:{}}}],l={entity:e.entity,name:e.name,icon:e.icon,icon_off:e.icon_off,show_count:e.show_count??!0,show_zero:e.show_zero??!1,glow:Dt(e.glow??100)??100,glow_boost:e.glow_boost??100,look:e.look??`disc`,icon_color:e.icon_color??`white`,layout:e.layout??`list`,transition:e.transition,tap_action:r,hold_action:i};return T`<ha-form
        .hass=${this.hass}
        .data=${l}
        .schema=${c}
        .computeLabel=${this.computeLabel}
        .computeHelper=${e=>e.name===`icon`?this.t(`icon_auto`,{icon:a}):e.name===`icon_off`?s:e.name===`glow`?this.t(`glow_helper`):e.name===`glow_boost`?this.t(`glow_boost_helper`):e.name===`transition`?this.t(`transition_helper`):void 0}
        @value-changed=${e=>{e.stopPropagation(),this.onChange(e.detail.value)}}
      ></ha-form>
      ${n?T`<div class="error">${n}</div>`:D}`}});var jp=1.2,Mp=class extends $f{kind=`light`;model;static getConfigElement(){return document.createElement(`vivid-light-badge-editor`)}static getStubConfig(e){let t=Object.values(e?.states??{}).filter(e=>e.entity_id.startsWith(`light.`));return{entity:(t.find(e=>Array.isArray(e.attributes.entity_id))??t[0])?.entity_id??`light.example`}}resolveConfig(e){return mp(e,this.kind)}buildView(e,t){let n=Sp(e,t);this.model=n;let r=n.on>0,i=t.showCount&&(r||t.showZero),a=n.isGroup?`${n.on}/${n.total}`:`${n.lights[0]?.brightness??0} %`;return{name:n.name,active:r&&n.colors.length>0,icon:r?n.icon:n.iconOff,strike:!r&&n.strike,text:i?a:void 0,textMuted:!r,tone:(n.white?an:Kt)(n.colors,!0,n.brightness,t.glowBoost),soft:n.white,state:r?B(e,`lights_on`,{on:n.on,total:n.total}):B(e,`off`),watched:n.watched,unavailable:n.total===0,glowScale:this.kind===`light`?jp:1}}toggle(){let e=this._config;if(!e||!this.hass||!this.model)return;let t=this.model.on>0?`turn_off`:`turn_on`,n=A(e.entity)===`light`,r=n&&e.transition!==void 0?{transition:e.transition}:{};this.hass.callService(n?`light`:`homeassistant`,t,r,{entity_id:e.entity})}renderDetails(){return T`<vivid-light-badge-details
      .hass=${this.hass}
      .model=${this.model}
      .transition=${this._config?.transition}
      .layout=${this._config?.layout??`list`}
      .glowBoost=${this._config?.glowBoost}
    ></vivid-light-badge-details>`}};function Np(e){return Array.isArray(e.attributes.entity_id)}function Pp(e,t){return Array.isArray(t)&&t.length>0&&t.every(t=>e.entities?.[String(t)]?.platform===`wled`)}var Fp=class extends Mp{kind=`led`;static getStubConfig(e){let t=Object.values(e?.states??{}).filter(e=>e.entity_id.startsWith(`light.`)&&Np(e));return{entity:((e?t.find(t=>Pp(e,t.attributes.entity_id)):void 0)??t[0])?.entity_id??`light.led_strips`}}},Ip=class extends Mp{kind=`lamp`;static getStubConfig(e){let t=Object.values(e?.states??{}).filter(e=>(e.entity_id.startsWith(`light.`)||e.entity_id.startsWith(`switch.`))&&Np(e));return{entity:((e?t.find(t=>!Pp(e,t.attributes.entity_id)):void 0)??t[0])?.entity_id??`light.lamps`}}};z(op.light,Mp),z(op.led,Fp),z(op.lamp,Ip),cn({type:op.led,name:`Vivid LED badge`,description:`LED strips: how many are on, in their colors with a glow that follows the brightness. Tap to switch them all, hold for each strip.`,preview:!0,documentationURL:`${R}#vivid-led-badge`}),cn({type:op.lamp,name:`Vivid lamp badge`,description:`Lamps, smart bulbs or lamps on plugs: how many are on, in Home Assistant amber. Tap to switch them all, hold for each lamp.`,preview:!0,documentationURL:`${R}#vivid-lamp-badge`}),cn({type:op.light,name:`Vivid light badge`,description:`Any other lights (ceiling lights, spots…): how many are on, in their colors. Tap to switch them all, hold for each light.`,preview:!0,documentationURL:`${R}#vivid-light-badge`});var Lp=[66,165,245],Rp=[255,193,7],zp=[239,83,80],Bp=[102,187,106],Vp=[{color:Lp,level:.45,pulse:void 0},{color:Rp,level:.65,pulse:void 0},{color:zp,level:.9,pulse:`1.6s`}],Hp=`default`,Up=`custom`,Wp={toggle:`action_toggle`,details:`action_details`,"more-info":`action_more_info`,none:`action_none`};function Gp(e){if(e==null||e===``)return Hp;if(typeof e==`string`)return e===`details`?Hp:e;if(typeof e==`object`){let t=Object.keys(e),n=e.action;if(t.length===1&&n&&ut.includes(n))return n===`details`?Hp:n}return Up}z(`vivid-badge-editor`,class extends O{static properties={hass:{attribute:!1},spec:{attribute:!1},_config:{state:!0}};static styles=[H,o`
      :host {
        display: block;
      }
      .error {
        margin-top: 8px;
        color: var(--error-color, #db4437);
        font-size: 13px;
      }
    `];setConfig(e){this._config=e}connectedCallback(){super.connectedCallback(),go().then(()=>this.requestUpdate())}t(e){return yo(this.hass,e)}choice(e,t){return{select:{mode:`dropdown`,options:e.map(e=>({value:e,label:this.t(`${t}${e}`)}))}}}actions(e){let t=[{value:Hp,label:this.t(`badge_action_details_default`)},...ut.filter(e=>e!==`details`&&e!==`toggle`).map(e=>({value:e,label:this.t(Wp[e])}))];return e===Up&&t.push({value:Up,label:this.t(`action_custom`)}),{select:{mode:`dropdown`,options:t}}}fields(e,t,n){let r={entity:{domain:[...e.domain],...e.deviceClass?{device_class:[...e.deviceClass]}:{}}};return[{name:`entity`,label:e.entityOptional?`badge_group_auto`:`badge_group`,selector:r},{name:`name`,label:`badge_details_title`,selector:{text:{}}},{name:`icon`,label:e.iconOff?`icon_active`:`icon`,selector:{icon:{}},row:1},...e.iconOff?[{name:`icon_off`,label:`icon_rest`,selector:{icon:{}},row:1}]:[],...e.fields,{name:`look`,label:`badge_look`,choices:{values:ep,labelPrefix:`look_`},default:`disc`,row:90},{name:`icon_color`,label:`icon_color`,choices:{values:tp,labelPrefix:`icon_color_`},default:`white`,row:90},{name:`glow`,label:`glow`,selector:Et,default:100,helper:`glow_helper`},{name:`tap_action`,label:`tap_action`,selector:this.actions(t),row:99},{name:`hold_action`,label:`hold_action`,selector:this.actions(n),row:99}]}schema(e){let t=[],n=/* @__PURE__ */ new Map;for(let r of e){let e={name:r.name,required:r.name===`entity`&&!this.spec?.entityOptional,selector:r.choices?this.choice(r.choices.values,r.choices.labelPrefix):r.selector};if(r.row===void 0){t.push(e);continue}let i=n.get(r.row);i||(i=[],n.set(r.row,i),t.push({type:`grid`,name:``,schema:i})),i.push(e)}return t}onChange(e,t){let n=this._config??{type:this.spec?.type},r={...n};for(let i of e){let e=t[i.name];if(i.name===`tap_action`||i.name===`hold_action`){if(e===Up)continue;e===Hp||e===void 0?delete r[i.name]:r[i.name]={action:e};continue}(i.name!==`glow`||e!==Dt(n.glow??100))&&(e===void 0||e===``||e===null||e===i.default?delete r[i.name]:r[i.name]=e)}this._config=r,N(this,`config-changed`,{config:r})}render(){let e=this.spec,t=this._config;if(!this.hass||!e||!t)return D;let n=Gp(t.tap_action),r=Gp(t.hold_action),i=this.fields(e,n,r),a={};for(let e of i)a[e.name]=t[e.name]??e.default;a.glow=Dt(t.glow??100)??100,a.tap_action=n,a.hold_action=r;let o;try{e.validate({type:e.type,...t})}catch(e){o=e.message}let s=new Map(i.map(e=>[e.name,e.helper])),c=new Map(i.map(e=>[e.name,e.label]));return T`<ha-form
        .hass=${this.hass}
        .data=${a}
        .schema=${this.schema(i)}
        .computeLabel=${e=>{let t=c.get(e.name);return t?this.t(t):void 0}}
        .computeHelper=${e=>{let t=s.get(e.name);return t?this.t(t):void 0}}
        @value-changed=${e=>{e.stopPropagation(),this.onChange(i,e.detail.value)}}
      ></ha-form>
      ${o?T`<div class="error">${o}</div>`:D}`}});function Kp(e){let t=document.createElement(`vivid-badge-editor`);return t.spec=e,t}z(`vivid-badge-rows`,class extends O{static properties={heading:{},summary:{},rows:{attribute:!1},timelineLabels:{attribute:!1},valueWidth:{attribute:`value-width`}};constructor(){super(),this.rows=[]}static styles=[H,U,o`
      :host {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .head {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 2px 8px;
        padding: 4px 6px 2px;
      }
      .title {
        font-size: 14px;
        font-weight: 600;
      }
      .muted {
        color: var(--secondary-text-color);
        font-size: 12px;
      }
      .row {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) var(--value-width, auto);
        align-items: center;
        gap: 10px;
        width: 100%;
        box-sizing: border-box;
        padding: 4px 10px 4px 4px;
        border-radius: 16px;
        background: var(--vivid-layer-1);
        text-align: left;
        cursor: pointer;
      }
      .row.with-bar {
        grid-template-columns: auto minmax(0, 1fr) minmax(64px, 30%) var(--value-width, auto);
      }
      .row:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .row.dim {
        opacity: 0.6;
      }
      .dot {
        /* Halo proportions of a 32 px disc (see glowSize). */
        --vivid-glow-size: 0.89;
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--dot-bg, rgba(var(--vivid-rgb-text), 0.08));
        box-shadow: var(--dot-shadow, none);
        color: var(--dot-color, var(--secondary-text-color));
      }
      .dot ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
      }
      .name {
        font-size: 13px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .value {
        font-size: 12px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        text-align: right;
      }
      .dim .value {
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .bar {
        height: 10px;
        border-radius: 5px;
        overflow: hidden;
        background: rgba(var(--vivid-rgb-text), 0.08);
      }
      .bar span {
        display: block;
        height: 100%;
        width: var(--level);
        border-radius: 5px;
        background: linear-gradient(90deg, var(--from), var(--to));
        transition: width 0.4s ease;
      }
      .timeline {
        position: relative;
        height: 10px;
        border-radius: 5px;
        background: rgba(var(--vivid-rgb-text), 0.08);
      }
      .timeline span {
        position: absolute;
        top: 0;
        bottom: 0;
        min-width: 3px;
        border-radius: 5px;
        background: var(--span);
      }
      .labels {
        display: flex;
        justify-content: space-between;
        font-size: 9px;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }
      @media (prefers-reduced-motion: reduce) {
        .bar span {
          transition: none;
        }
      }
    `];renderMiddle(e){if(e.spans)return T`<div>
        <div class="timeline" style=${k({"--span":I(e.spanColor??[66,165,245],.8)})}>
          ${e.spans.map(([e,t])=>T`<span style=${`left: ${e*100}%; width: ${(t-e)*100}%`}></span>`)}
        </div>
        ${this.timelineLabels?T`<div class="labels">
                <span>${this.timelineLabels[0]}</span><span>${this.timelineLabels[1]}</span>
              </div>`:D}
      </div>`;if(e.bar===void 0)return D;let t=e.barColor??[150,150,150];return T`<div
      class="bar"
      style=${k({"--level":`${Math.round(Math.max(0,Math.min(1,e.bar))*100)}%`,"--from":I(t,.35),"--to":I(t,.95)})}
    >
      <span></span>
    </div>`}renderRow(e){let t=e.bar!==void 0||e.spans!==void 0;return T`<button
      type="button"
      class=${W({reset:!0,row:!0,"with-bar":t,dim:!!e.dim})}
      ?disabled=${!e.entityId}
      aria-label=${`${e.name} · ${e.value}`}
      @click=${()=>{e.entityId&&N(this,`vivid-more-info`,{entityId:e.entityId})}}
    >
      <span
        class="dot"
        style=${k({"--dot-bg":e.tone?.background,"--dot-shadow":e.tone?.shadow,"--dot-color":e.tone?.iconColor})}
        ><ha-icon .icon=${e.icon}></ha-icon
      ></span>
      <span class="name" title=${e.name}>${e.name}</span>
      ${t?this.renderMiddle(e):D}
      <span class="value">${e.value}</span>
    </button>`}updated(){this.valueWidth?this.style.setProperty(`--value-width`,this.valueWidth):this.style.removeProperty(`--value-width`)}render(){return T`<div class="head">
        <span class="title">${this.heading}</span>
        ${this.summary?T`<span class="muted">${this.summary}</span>`:D}
      </div>
      ${Ko(this.rows,(e,t)=>e.entityId??`row-${t}`,e=>this.renderRow(e))}`}});var qp=`vivid-opening-badge`,Jp={window:`vivid-window-badge`,door:`vivid-door-badge`,any:qp},Yp={window:[`window`],door:[`door`,`garage_door`,`opening`],any:[`window`,`door`,`garage_door`,`opening`]};function Xp(e){let t=typeof e==`string`?e.replace(/^custom:/,``):``;return Object.entries(Jp).find(([,e])=>e===t)?.[0]??`any`}var Zp=[`binary_sensor`,`group`];function Qp(e,t=Xp(e?.type)){let n=new rp(Jp[t],e),r=ip(n,{domains:Zp}),i=n.number(`warn_after`,15,0),a=n.number(`alert_after`,45,0);return a<i&&n.fail(`"alert_after" must be at least "warn_after".`),{...r,kind:t,showCount:n.bool(`show_count`,!0),showZero:n.bool(`show_zero`,!1),warnAfter:i,alertAfter:a}}var $p={window:[`mdi:window-open-variant`,`mdi:window-closed-variant`],door:[`mdi:door-open`,`mdi:door-closed`],garage:[`mdi:garage-open-variant`,`mdi:garage-variant`],mixed:[`mdi:home-lock-open`,`mdi:home-lock`]};function em(e,t=`any`){return e===`garage_door`?`garage`:t===`door`?`door`:e===`window`?`window`:e===`door`||e===`opening`?`door`:`mixed`}function tm(e,t){let n=e/60;return n>=t.alertAfter?2:+(n>=t.warnAfter)}function nm(e,t,n=Date.now()){let r=pc(e,t),i=mc(e,r).map(e=>{let r=e.available&&e.state?.state===`on`,i=vc(e.state,n);return{entityId:e.entityId,name:e.name,kind:t.kind===`window`?`window`:em(e.state?.attributes.device_class,t.kind),available:e.available,open:r,since:i,severity:r?tm(i,t):0}}),a=new Set(i.map(e=>e.kind));a.has(`door`)&&a.delete(`garage`);let o=t.kind===`window`?`window`:t.kind===`door`?a.size===1&&a.has(`garage`)?`garage`:`door`:a.size===1?[...a][0]:`mixed`,s=i.filter(e=>e.open);return{name:t.name??(t.entity?M(e,t.entity):B(e,t.kind===`window`?`windows_title`:t.kind===`door`?`doors_title`:`openings_title`)),isGroup:hc(t,r.length),kind:o,items:i,open:s.length,total:i.filter(e=>e.available).length,severity:s.reduce((e,t)=>t.severity>e?t.severity:e,0),longest:s.reduce((e,t)=>Math.max(e,t.since),0),watched:gc(t,r)}}function rm(e,t){let n=e.open>0;if(!t.showCount)return{};if(e.isGroup){if(!n&&!t.showZero)return{};let r=`${e.open}/${e.total}`;return n?{count:r,since:e.longest}:{count:r}}return n?{since:e.longest}:{}}var im=class extends $f{kind=`any`;model;static getConfigElement(){return Kp(cm(`any`))}static getStubConfig(e){return am(e,`any`)}resolveConfig(e){return Qp(e,this.kind)}buildView(e,t){let n=nm(e,t);this.model=n;let[r,i]=$p[n.kind],a=n.open>0,o=Vp[n.severity],s=rm(n,t),c=s.count??(s.since===void 0?void 0:mn(e,s.since)),l=s.count!==void 0&&s.since!==void 0?`· ${mn(e,s.since)}`:void 0;return{name:n.name,active:a,icon:a?t.icon??r:t.iconOff??i,text:c,suffix:l,textMuted:!a,tone:L(o.color,o.level),soft:!0,pulse:o.pulse,state:a?B(e,`open_count`,{open:n.open,total:n.total}):B(e,`all_closed`),watched:n.watched,ticking:a,unavailable:n.total===0}}rows(){let e=this.model;if(!e)return[];let t=this.hass,n=e.items.filter(e=>e.open).sort((e,t)=>t.since-e.since),r=e.items.filter(e=>!e.open).sort((e,t)=>e.since-t.since),i=n.map(e=>{let n=Vp[e.severity];return{entityId:e.entityId,icon:$p[e.kind][0],name:e.name,value:B(t,`open_for`,{d:mn(t,e.since)}),tone:L(n.color,n.level)}}),a=r.length>4?r.slice(0,3):r;for(let e of a)i.push({entityId:e.entityId,icon:$p[e.kind][1],name:e.name,value:e.available?B(t,`closed_for`,{d:mn(t,e.since)}):B(t,`unavailable`),dim:!0});return a.length<r.length&&i.push({icon:$p[e.kind][1],name:B(t,`others`,{n:r.length-a.length}),value:B(t,`closed_plural`),dim:!0}),i}renderDetails(){let e=this.model;return T`<vivid-badge-rows
      .heading=${e?.name}
      .summary=${e&&e.open>0?B(this.hass,`open_count`,{open:e.open,total:e.total}):B(this.hass,`all_closed`)}
      .rows=${this.rows()}
    ></vivid-badge-rows>`}};function am(e,t){let n=Yp[t],r=Object.values(e?.states??{}).filter(e=>e.entity_id.startsWith(`binary_sensor.`)&&n.includes(String(e.attributes.device_class))),i=r.find(e=>Array.isArray(e.attributes.entity_id)),a=t===`door`?`binary_sensor.doors`:`binary_sensor.windows`;return{entity:(i??r[0])?.entity_id??a}}var om=class extends im{kind=`window`;static getConfigElement(){return Kp(cm(`window`))}static getStubConfig(e){return am(e,`window`)}},sm=class extends im{kind=`door`;static getConfigElement(){return Kp(cm(`door`))}static getStubConfig(e){return am(e,`door`)}},cm=e=>({type:`custom:${Jp[e]}`,domain:Zp,deviceClass:Yp[e],iconOff:!0,fields:[{name:`warn_after`,label:`warn_after`,selector:{number:{min:0,max:600,step:5,mode:`box`}},default:15,helper:`open_helper`,row:2},{name:`alert_after`,label:`alert_after`,selector:{number:{min:0,max:600,step:5,mode:`box`}},default:45,row:2},{name:`show_count`,label:`show_open_count`,selector:{boolean:{}},default:!0},{name:`show_zero`,label:`show_zero_closed`,selector:{boolean:{}},default:!1}],validate:t=>void Qp(t,e)});z(qp,im),z(Jp.window,om),z(Jp.door,sm),cn({type:Jp.window,name:`Vivid window badge`,description:`Windows: how many are open, in a color that warms up the longer they stay open. Tap for each window.`,preview:!0,documentationURL:`${R}#vivid-window-badge`}),cn({type:Jp.door,name:`Vivid door badge`,description:`Doors and garage doors: how many are open, in a color that warms up the longer they stay open. Tap for each door.`,preview:!0,documentationURL:`${R}#vivid-door-badge`});var lm=`vivid-presence-badge`,um=[`binary_sensor`,`group`],dm=[`occupancy`,`presence`,`motion`],fm=.55,pm=`2.4s`;function mm(e){let t=new rp(lm,e);return{...ip(t,{domains:um}),showCount:t.bool(`show_count`,!0),showZero:t.bool(`show_zero`,!1),showDuration:t.bool(`show_duration`,!0)}}function hm(e,t,n=Date.now()){let r=pc(e,t),i=mc(e,r).map(e=>({entityId:e.entityId,name:e.name,available:e.available,present:e.available&&e.state?.state===`on`,since:vc(e.state,n)}));return{name:t.name??(t.entity?M(e,t.entity):B(e,`presence_title`)),isGroup:hc(t,r.length),items:i,present:i.filter(e=>e.present).length,total:i.filter(e=>e.available).length,since:i[0]?.since??0,watched:gc(t,r)}}var gm=class extends $f{model;spans={};static getConfigElement(){return Kp(_m)}static getStubConfig(e){return{entity:Object.values(e?.states??{}).find(e=>e.entity_id.startsWith(`binary_sensor.`)&&dm.includes(String(e.attributes.device_class)))?.entity_id??`binary_sensor.presence`}}resolveConfig(e){return mm(e)}buildView(e,t){let n=hm(e,t);this.model=n;let r=n.present>0,i;n.isGroup?t.showCount&&(r||t.showZero)&&(i=`${n.present}/${n.total}`):t.showDuration&&n.total>0&&(i=mn(e,n.since));let[a,o]=n.isGroup?[`mdi:home-account`,`mdi:home-outline`]:[`mdi:motion-sensor`,`mdi:motion-sensor-off`];return{name:n.name,active:r,icon:r?t.icon??a:t.iconOff??o,text:i,textMuted:!r,tone:L(Lp,fm),soft:!0,pulse:pm,state:n.isGroup?B(e,`occupied_count`,{on:n.present,total:n.total}):r?B(e,`present`):B(e,`seen_ago`,{d:mn(e,n.since)}),watched:n.watched,ticking:!n.isGroup&&t.showDuration,unavailable:n.total===0}}detailsOpened(){let e=this.hass,t=this.model;if(!e||!t)return;let n=Date.now(),r=n-216e5,i=t.items.map(e=>e.entityId);Jo(e,i,r,n).then(e=>{let t={};for(let a of i)t[a]=Yo(e[a]??[],r,n);this.spans=t,this.refreshDetails()}).catch(()=>{})}rows(){let e=this.model;if(!e)return[];let t=this.hass;return[...e.items].sort((e,t)=>Number(t.present)-Number(e.present)||e.since-t.since).map(e=>({entityId:e.entityId,icon:e.present?`mdi:motion-sensor`:`mdi:motion-sensor-off`,name:e.name,value:e.available?e.present?B(t,`present_for`,{d:mn(t,e.since)}):B(t,`clear_for`,{d:mn(t,e.since)}):B(t,`unavailable`),tone:e.present?L(Lp,fm):void 0,dim:!e.present,spans:this.spans[e.entityId]??[],spanColor:Lp}))}renderDetails(){let e=this.model;return T`<vivid-badge-rows
      .heading=${e?.name}
      .summary=${e?.isGroup?B(this.hass,`occupied_count`,{on:e.present,total:e.total}):void 0}
      .rows=${this.rows()}
      value-width="96px"
      .timelineLabels=${[B(this.hass,`hours_ago`,{h:6}),B(this.hass,`now`)]}
    ></vivid-badge-rows>`}},_m={type:`custom:${lm}`,domain:um,deviceClass:dm,iconOff:!0,fields:[{name:`show_duration`,label:`show_duration`,selector:{boolean:{}},default:!0},{name:`show_count`,label:`show_open_count`,selector:{boolean:{}},default:!0},{name:`show_zero`,label:`show_zero_clear`,selector:{boolean:{}},default:!1}],validate:e=>void mm(e)};z(lm,gm),cn({type:lm,name:`Vivid presence badge`,description:`Presence in a room (for how long, or seen how long ago) or rooms occupied out of the total, with the last hours of each room. Tap for the details.`,preview:!0,documentationURL:`${R}#vivid-presence-badge`});var vm=`vivid-illuminance-badge`,ym=[`sensor`,`group`];function bm(e){let t=new rp(vm,e);return{...ip(t,{domains:ym}),aggregate:t.choice(`aggregate`,np,`mean`),max:t.number(`max`,2e3,2),gauge:t.bool(`gauge`,!0),showLabel:t.bool(`show_label`,!1)}}var xm=[[0,[92,107,192]],[.45,[171,145,140]],[.75,[255,213,79]],[1,[255,193,7]]];function Sm(e,t){return F(Math.log10(Math.max(e,1))/Math.log10(t),0,1)}function Cm(e){return on(xm,e)}function wm(e){return e<10?`mdi:weather-night`:e<100?`mdi:brightness-5`:e<800?`mdi:brightness-6`:`mdi:brightness-7`}var Tm=[`bright`,`dim`,`dark`],Em={bright:.85,dim:.45,dark:.1},Dm={bright:`mdi:white-balance-sunny`,dim:`mdi:brightness-5`,dark:`mdi:weather-night`},Om={bright:`bright`,light:`bright`,sunny:`bright`,day:`bright`,daylight:`bright`,dim:`dim`,twilight:`dim`,dusk:`dim`,dawn:`dim`,medium:`dim`,dark:`dark`,night:`dark`};function km(e){return e?Om[e.trim().toLowerCase()]:void 0}function Am(e){return Tm.reduce((t,n)=>Math.abs(Em[n]-e)<Math.abs(Em[t]-e)?n:t)}function jm(e,t){let n=pc(e,t),r=mc(e,n),i=r.map(e=>({entityId:e.entityId,name:e.name,value:yc(e.state),level:km(e.state?.state)})),a=i.flatMap(e=>e.value===void 0?[]:[e.value]),o=i.flatMap(e=>e.level?[Em[e.level]]:[]),s=a.length?void 0:_c(o,t.aggregate===`sum`?`mean`:t.aggregate),c=r.find(e=>e.state)?.state?.attributes.unit_of_measurement;return{name:t.name??(t.entity?M(e,t.entity):B(e,`illuminance_title`)),items:i,value:_c(a,t.aggregate),min:_c(a,`min`),max:_c(a,`max`),level:s===void 0?void 0:Am(s),unit:typeof c==`string`&&c?c:`lx`,watched:gc(t,n)}}var Mm=class extends $f{model;static getConfigElement(){return Kp(Nm)}static getStubConfig(e){return{entity:Object.values(e?.states??{}).find(e=>e.entity_id.startsWith(`sensor.`)&&e.attributes.device_class===`illuminance`)?.entity_id??`sensor.illuminance`}}resolveConfig(e){return bm(e)}format(e){return`${V(this.hass,e)} ${this.model?.unit??`lx`}`}levelLabel(e){return B(this.hass,`light_level_${e}`)}buildView(e,t){let n=jm(e,t);this.model=n;let r=n.value;if(r===void 0&&n.level){let e=Em[n.level],r=Cm(e),i=this.levelLabel(n.level);return{name:n.name,active:!0,icon:t.icon??Dm[n.level],text:t.showLabel?i:void 0,tone:L(r,.2+.65*e),soft:!0,ring:t.gauge?e:void 0,ringColor:I(r),state:i,watched:n.watched}}if(r===void 0)return{name:n.name,active:!1,icon:t.icon??`mdi:brightness-5`,state:B(e,`unavailable`),watched:n.watched,unavailable:!0};let i=Sm(r,t.max),a=Cm(i);return{name:n.name,active:!0,icon:t.icon??wm(r),text:this.format(r),tone:L(a,.2+.65*i),soft:!0,ring:t.gauge?i:void 0,ringColor:I(a),state:this.format(r),watched:n.watched}}rows(){let e=this.model,t=this._config;return!e||!t?[]:[...e.items].sort((e,t)=>(t.value??(t.level?Em[t.level]-2:-3))-(e.value??(e.level?Em[e.level]-2:-3))).map(e=>{if(e.value===void 0&&e.level){let t=Em[e.level],n=Cm(t);return{entityId:e.entityId,icon:Dm[e.level],name:e.name,value:this.levelLabel(e.level),tone:L(n,.2+.65*t),bar:t,barColor:n}}if(e.value===void 0)return{entityId:e.entityId,icon:`mdi:brightness-5`,name:e.name,value:B(this.hass,`unavailable`),dim:!0};let n=Sm(e.value,t.max),r=Cm(n);return{entityId:e.entityId,icon:wm(e.value),name:e.name,value:this.format(e.value),tone:L(r,.2+.65*n),bar:n,barColor:r}})}renderDetails(){let e=this.model,t=this._config,n;return e?.value!==void 0&&t&&e.items.length>1&&(n=[`${B(this.hass,`agg_${t.aggregate}`)} ${this.format(e.value)}`,t.aggregate!==`min`&&e.min!==void 0?`${B(this.hass,`agg_min`)} ${V(this.hass,e.min)}`:``,t.aggregate!==`max`&&e.max!==void 0?`${B(this.hass,`agg_max`)} ${V(this.hass,e.max)}`:``].filter(Boolean).join(` · `)),T`<vivid-badge-rows
      .heading=${e?.name}
      .summary=${n}
      .rows=${this.rows()}
      value-width="64px"
    ></vivid-badge-rows>`}},Nm={type:`custom:${vm}`,domain:ym,deviceClass:[`illuminance`],fields:[{name:`aggregate`,label:`aggregate`,choices:{values:np,labelPrefix:`aggregate_`},default:`mean`,row:2},{name:`max`,label:`lux_max`,selector:{number:{min:10,max:1e5,step:10,mode:`box`}},default:2e3,row:2},{name:`gauge`,label:`gauge`,selector:{boolean:{}},default:!0},{name:`show_label`,label:`show_light_label`,selector:{boolean:{}},default:!1,helper:`show_light_label_helper`}],validate:e=>void bm(e)};z(vm,Mm),cn({type:vm,name:`Vivid illuminance badge`,description:`Illuminance of a room or a group: an icon from the moon to the sun, a color and a gauge that follow the light. Tap for each sensor.`,preview:!0,documentationURL:`${R}#vivid-illuminance-badge`});var Pm=[`month`,`hour`],Fm=`vivid-power-badge`,Im=[`sensor`,`group`];function Lm(e){let t=new rp(Fm,e),n=ip(t,{domains:Im}),r=t.number(`idle`,5,0),i=t.number(`max`,3e3,1);i<=r&&t.fail(`"max" must be above "idle".`);let a=t.config.cost,o=a==null||a===``?void 0:t.choice(`cost`,Pm,`month`),s=t.config.tariff===void 0?void 0:Fu(t.config.tariff,e=>t.fail(e));return o&&!s&&t.fail(`"cost" needs a "tariff" with at least the "peak" price.`),{...n,aggregate:t.choice(`aggregate`,np,`sum`),idle:r,max:i,cost:o,tariff:s}}function Rm(e,t,n){let r=e.offPeak??e.peak;if(t===`hour`)return Mu(e.offPeakRanges,n)?.offPeak?r:e.peak;let i=e.offPeakRanges.length?ku(e.offPeakRanges):0;return e.peak*(1-i)+r*i}function zm(e,t,n,r){let i=n===`hour`?1:720;return Math.max(0,e)/1e3*i*Rm(t,n,r)}function Bm(e){return e===`kW`?1e3:e===`MW`?1e6:e===`mW`?.001:1}function Vm(e,t){return Math.abs(t)>=1e3?`${V(e,t/1e3,1)} kW`:`${V(e,t,+(Math.abs(t)<10))} W`}function Hm(e){return{idle:e.idle,max:e.max,steps:[e.max*.25,e.max*.6]}}function Um(e,t){let n=pc(e,t),r=mc(e,n).map(e=>({entityId:e.entityId,name:e.name,watts:yc(e.state,Bm)})),i=r.flatMap(e=>e.watts===void 0?[]:[e.watts]);return{name:t.name??(t.entity?M(e,t.entity):B(e,`power_title`)),items:r,watts:_c(i,t.aggregate),watched:gc(t,n)}}var Wm=class extends $f{model;static getConfigElement(){return Kp(Gm)}static getStubConfig(e){let t=Object.values(e?.states??{}).filter(e=>e.entity_id.startsWith(`sensor.`)&&e.attributes.device_class===`power`);return{entity:(t.find(e=>Array.isArray(e.attributes.entity_id))??t[0])?.entity_id??`sensor.power`}}resolveConfig(e){return Lm(e)}buildView(e,t){let n=Um(e,t);this.model=n;let r=n.watts;if(r===void 0)return{name:n.name,active:!1,icon:t.iconOff??`mdi:flash-outline`,state:B(e,`unavailable`),watched:n.watched,unavailable:!0};let i=Hm(t),a=r>=t.idle,o=Ut(r,i);return{name:n.name,active:a,icon:a?t.icon??`mdi:flash`:t.iconOff??`mdi:flash-outline`,text:Vm(e,r),suffix:t.cost&&t.tariff?`· ${B(e,t.cost===`hour`?`energy_per_hour`:`energy_per_month`,{v:X(e,zm(r,t.tariff,t.cost,Date.now()),t.cost===`hour`?2:1)})}`:void 0,ticking:t.cost===`hour`&&(t.tariff?.offPeakRanges.length??0)>0||void 0,textMuted:!a,tone:L(Wt(r,i),.2+.75*o),soft:!0,pulse:o>=.5?Gt(r,i).pulse:void 0,state:Vm(e,r),watched:n.watched}}rows(){let e=this.model,t=this._config;if(!e||!t)return[];let n=Hm(t),r=Math.max(...e.items.map(e=>e.watts??0),1);return[...e.items].sort((e,t)=>(t.watts??-1)-(e.watts??-1)).map(e=>{if(e.watts===void 0)return{entityId:e.entityId,icon:`mdi:flash-outline`,name:e.name,value:B(this.hass,`unavailable`),dim:!0};let i=Wt(e.watts,n),a=e.watts<t.idle;return{entityId:e.entityId,icon:a?`mdi:flash-outline`:`mdi:flash`,name:e.name,value:Vm(this.hass,e.watts),tone:a?void 0:L(i,.2+.75*Ut(e.watts,n)),bar:Math.max(0,e.watts)/r,barColor:i,dim:a}})}renderDetails(){let e=this.model,t=this._config,n=e?.watts!==void 0&&t?`${B(this.hass,`agg_${t.aggregate}`)} ${Vm(this.hass,e.watts)}`:void 0;return T`<vivid-badge-rows
      .heading=${e?.name}
      .summary=${n}
      .rows=${this.rows()}
      value-width="60px"
    ></vivid-badge-rows>`}},Gm={type:`custom:${Fm}`,domain:Im,deviceClass:[`power`],iconOff:!0,fields:[{name:`aggregate`,label:`aggregate`,choices:{values:np,labelPrefix:`aggregate_`},default:`sum`},{name:`idle`,label:`power_idle`,selector:{number:{min:0,max:1e5,step:1,mode:`box`}},default:5,row:2},{name:`max`,label:`power_max`,selector:{number:{min:1,max:1e5,step:50,mode:`box`}},default:3e3,row:2}],validate:e=>void Lm(e)};z(Fm,Wm),cn({type:Fm,name:`Vivid power badge`,description:`Power drawn by a group of devices, glowing brighter and pulsing faster as it rises, like the LED card. Tap for each device.`,preview:!0,documentationURL:`${R}#vivid-power-badge`});var Km=`vivid-battery-badge`,qm=[`sensor`,`binary_sensor`,`group`],Jm=[`min`,`mean`,`median`],Ym=[`level`,`low_count`];function Xm(e){let t=new rp(Km,e),n=ip(t,{domains:qm,entityOptional:!0}),r=t.number(`low`,15,0,100),i=t.number(`warn`,30,0,100);return i<r&&t.fail(`"warn" must be at least "low".`),{...n,aggregate:t.choice(`aggregate`,Jm,`min`),display:t.choice(`display`,Ym,`level`),low:r,warn:i}}function Zm(e){return Object.values(e.states).filter(e=>{if(e.attributes.device_class!==`battery`)return!1;let t=A(e.entity_id);return t===`binary_sensor`||t===`sensor`&&e.attributes.unit_of_measurement===`%`}).map(e=>e.entity_id).sort()}function Qm(e,t,n){return t||e!==void 0&&e<n.low?2:+(e!==void 0&&e<n.warn)}var $m={0:{color:Bp,level:.25},1:{color:Rp,level:.5},2:{color:zp,level:.9}};function eh(e,t=!1){return e===void 0?t?`mdi:battery-alert-variant-outline`:`mdi:battery`:e>=95?`mdi:battery`:e<5?`mdi:battery-outline`:`mdi:battery-${Math.max(10,Math.min(90,Math.round(e/10)*10))}`}function th(e,t){let n=pc(e,t,()=>Zm(e)),r=mc(e,n).map(e=>{let n=A(e.entityId)===`binary_sensor`,r=n?void 0:yc(e.state),i=n&&e.available&&e.state?.state===`on`;return{entityId:e.entityId,name:e.name,available:e.available&&(n||r!==void 0),level:r,low:i,severity:Qm(r,i,t)}}),i=_c(r.flatMap(e=>e.level===void 0?[]:[e.level]),t.aggregate),a=r.filter(e=>e.severity===2).length;return{name:t.name??(t.entity?M(e,t.entity):B(e,`batteries_title`)),items:r,value:i,lowCount:a,severity:r.reduce((e,t)=>t.severity>e?t.severity:e,Qm(i,!1,t)),watched:gc(t,n)}}var nh=class extends $f{model;static getConfigElement(){return Kp(rh)}static getStubConfig(){return{}}resolveConfig(e){return Xm(e)}buildView(e,t){let n=th(e,t);this.model=n;let{color:r,level:i}=$m[n.severity],a=n.items.find(e=>e.low),o=t.display===`low_count`&&n.lowCount>0?B(e,`low_count`,{n:n.lowCount}):n.value===void 0?n.lowCount>0?B(e,`battery_low`):void 0:`${V(e,n.value)} %`,s=n.items.some(e=>e.available);return{name:n.name,active:s,icon:t.icon??eh(n.value,!!a),text:o,tone:L(r,i),soft:!0,pulse:n.severity===2?`1.8s`:void 0,state:o??B(e,`unavailable`),watched:n.watched,unavailable:!s}}rows(){let e=this.model;if(!e)return[];let t=this.hass,n=e=>e.available?e.level??(e.low?-1:101):1e3;return[...e.items].sort((e,t)=>n(e)-n(t)).map(e=>{let{color:n,level:r}=$m[e.severity];return{entityId:e.entityId,icon:eh(e.level,e.low),name:e.name,value:e.available?e.level===void 0?B(t,e.low?`battery_low`:`battery_ok`):`${V(t,e.level)} %`:B(t,`unavailable`),tone:e.available?L(n,r):void 0,bar:e.level===void 0?void 0:e.level/100,barColor:n,dim:!e.available}})}renderDetails(){let e=this.model,t=e?.items.length??0;return T`<vivid-badge-rows
      .heading=${e?.name}
      .summary=${e?.lowCount?B(this.hass,`battery_summary`,{count:t,low:e.lowCount}):B(this.hass,`battery_summary_ok`,{count:t})}
      .rows=${this.rows()}
      value-width="48px"
    ></vivid-badge-rows>`}},rh={type:`custom:${Km}`,domain:qm,deviceClass:[`battery`],entityOptional:!0,fields:[{name:`display`,label:`battery_display`,choices:{values:Ym,labelPrefix:`battery_display_`},default:`level`,row:2},{name:`aggregate`,label:`aggregate`,choices:{values:Jm,labelPrefix:`aggregate_`},default:`min`,row:2},{name:`low`,label:`battery_low`,selector:{number:{min:0,max:100,step:1,mode:`box`}},default:15,row:3},{name:`warn`,label:`battery_warn`,selector:{number:{min:0,max:100,step:1,mode:`box`}},default:30,row:3}],validate:e=>void Xm(e)};z(Km,nh),cn({type:Km,name:`Vivid battery badge`,description:`The lowest battery of a group, or of the whole home, in an icon that empties and turns red. Tap for every battery from the lowest.`,preview:!0,documentationURL:`${R}#vivid-battery-badge`});var ih={temperature:{low:19,high:23},humidity:{low:40,high:60},pressure:{low:1005,high:1025},co2:{low:400,high:1e3}},ah=[[14,[30,95,208]],[17,[63,155,240]],[19,[143,208,240]],[20,[255,241,168]],[21.5,[255,213,79]],[23,[255,167,38]],[25,[244,81,30]],[28,[211,47,47]]],oh=[[20,[178,235,242]],[35,[77,208,225]],[50,[41,163,224]],[65,[47,125,220]],[80,[47,79,196]],[95,[31,47,150]]],sh=[[40,[63,196,224]],[50,[41,163,224]],[65,[58,142,240]],[80,[84,112,242]],[95,[106,92,245]]],ch={temperature:ah,humidity:oh,pressure:[[975,[91,52,176]],[1e3,[126,92,200]],[1015,[165,140,224]],[1045,[212,198,240]]],co2:[[400,[67,209,122]],[800,[139,211,70]],[1e3,[198,214,48]],[1400,[163,168,28]],[2e3,[107,122,18]],[2500,[75,86,12]]]},lh={temperature:4,humidity:20,pressure:20,co2:1e3};function uh(e,t){return on(ch[e],t)}function dh(e,t){return e===`humidity`?on(sh,t):uh(e,t)}function fh(e,t=!1){return t&&e===`humidity`?sh:ch[e]}function ph(e,t){return e<t.low?t.low-e:e>t.high?e-t.high:0}function mh(e,t,n){return F(ph(t,n)/lh[e],0,1)}function hh(e,t){return t===`°F`?(e-32)*5/9:e}var gh={excellent:800,good:1e3,moderate:1400,poor:2e3};function _h(e){return e<gh.excellent?`excellent`:e<gh.good?`good`:e<gh.moderate?`moderate`:e<gh.poor?`poor`:`toxic`}function vh(e){switch(e){case`excellent`:return`mdi:leaf`;case`good`:return`mdi:molecule-co2`;case`moderate`:case`poor`:return`mdi:window-open-variant`;case`toxic`:return`mdi:biohazard`}}function yh(e){return e<995?`mdi:weather-lightning-rainy`:e<1008?`mdi:weather-rainy`:e<1020?`mdi:weather-partly-cloudy`:`mdi:weather-sunny`}var bh=36e5,xh=24*bh,Sh={"6h":{hours:6,statistics:!1},"24h":{hours:24,statistics:!1},"7d":{hours:168,statistics:!0},"30d":{hours:720,statistics:!0}},Ch={temperature:`°C`,humidity:`%`,pressure:`hPa`,co2:`ppm`};function wh(e,t){return t===`°F`?e*9/5+32:e}function Th(e,t,n){return e===`temperature`?hh(t,n):t}function Eh(e,t,n){return e===`temperature`?wh(t,n):t}function Dh(e,t,n,r){return n===r?t:Eh(e,Th(e,t,n),r)}function Oh(e,t,n){return{low:Eh(e,t.low,n),high:Eh(e,t.high,n)}}function kh(e,t,n){let[r,i,a]=dh(e,Th(e,t,n));return`rgb(${r}, ${i}, ${a})`}function Ah(e,t,n,r){let i=[],a;for(let r of e)r.t<=t?a=r:r.t<=n&&i.push(r);if(a&&i.unshift({...a,t}),r&&r.t>=t){for(;i.length&&(i[i.length-1]?.t??0)>=r.t;)i.pop();i.push(r)}return i}function jh(e){let t=[],n=[];for(let r of e)r.v===void 0?(n.length&&t.push(n),n=[]):n.push({t:r.t,v:r.v});return n.length&&t.push(n),t}function Mh(e){let t=[];for(let n of e)n.v!==void 0&&t.push(n.min??n.v,n.max??n.v);return t}function Nh(e){let t,n;for(let r of e){if(r.v===void 0)continue;let e=r.min??r.v,i=r.max??r.v;(!t||e<t.v)&&(t={t:r.t,v:e}),(!n||i>n.v)&&(n={t:r.t,v:i})}return{min:t,max:n}}function Ph(e,t,n){e.forEach((r,i)=>{let a=e[i+1]?.t??t;r.v!==void 0&&a>r.t&&n(r.v,a-r.t)})}function Fh(e,t){let n=0,r=0;return Ph(e,t,(e,t)=>{n+=e*t,r+=t}),r>0?n/r:void 0}function Ih(e,t,n){let r=0,i=0;return Ph(e,n,(e,n)=>{e<t.low?r+=n:e>t.high&&(i+=n)}),{below:r,above:i}}function Lh(e,t){for(let n=0;n<e.length;n++){let r=e[n];if(!r||r.t>t)return;let i=e[n+1];if(r.t===t)return r.v;if(!i)return;if(!(i.t<t))return r.v===void 0||i.v===void 0?i.t===t?i.v:void 0:r.v+(i.v-r.v)*(t-r.t)/(i.t-r.t)}}function Rh(e,t,n=bh){let r=Lh(e,t-n),i=Lh(e,t);if(r!==void 0&&i!==void 0)return(i-r)/(n/bh)}function zh(e,t){let n=Lh(e,t-xh),r=Lh(e,t);if(n!==void 0&&r!==void 0)return{value:n,diff:r-n}}function Bh(e,t){if(e.length<=t*2||e.length<3)return[...e];let n=e[0]?.t??0,r=e[e.length-1]?.t??0,i=Math.max((r-n)/t,1),a=/* @__PURE__ */ new Set,o=-1,s,c,l=()=>{s&&a.add(s),c&&a.add(c),s=c=void 0};for(let r of e){let e=Math.min(Math.floor((r.t-n)/i),t-1);if(e!==o&&(l(),o=e),r.v===void 0){l(),a.add(r);continue}(!s||r.v<(s.v??1/0))&&(s=r),(!c||r.v>(c.v??-1/0))&&(c=r)}return l(),a.add(e[0]),a.add(e[e.length-1]),e.filter(e=>a.has(e))}function Vh(e,t){let n=e/Math.max(t,1);if(!(n>0))return 1;let r=10**Math.floor(Math.log10(n));for(let e of[1,2,2.5,5,10])if(e*r>=n-1e-9)return e*r;return 10*r}var Hh={temperature:3,humidity:15,pressure:10,co2:400};function Uh(e,t,n,r=4){let i=Math.min(t.low,...e),a=Math.max(t.high,...e),o=Math.max(a-i,n),s=(i+a)/2;i=Math.min(i,s-o/2),a=Math.max(a,s+o/2);let c=(a-i)*.12;i-=c,a+=c;let l=Vh(a-i,r),u=e=>Math.round(e*1e6)/1e6;i=u(Math.floor(i/l)*l),a=u(Math.ceil(a/l)*l);let d=[];for(let e=i;e<=a+l/1e6;e+=l)d.push(u(e));return{lo:i,hi:a,ticks:d}}function Wh(e,t,n,r){let i=t-e||1;return t=>n+(t-e)/i*(r-n)}var Gh=e=>Math.round(e*10)/10;function Kh(e,t,n){return e.map((e,r)=>`${r?`L`:`M`}${Gh(t(e.t))},${Gh(n(e.v))}`).join(` `)}function qh(e,t,n,r){let i=e[0],a=e[e.length-1];return!i||!a?``:`${Kh(e,t,n)} L${Gh(t(a.t))},${Gh(r)} L${Gh(t(i.t))},${Gh(r)} Z`}function Jh(e,t,n){let r=fh(e,!0),i=Eh(e,r[0]?.[0]??0,t),a=Eh(e,r[r.length-1]?.[0]??1,t),o=a-i||1;return{y1:Gh(n(i)),y2:Gh(n(a)),stops:r.map(([n,[r,a,s]])=>({offset:Math.round((Eh(e,n,t)-i)/o*1e3)/1e3,color:`rgb(${r}, ${a}, ${s})`}))}}function Yh(e){let t=new Date(e);return t.setHours(0,0,0,0),t.getTime()}function Xh(e,t){let n=[],r=new Date(Yh(e));for(;;){r.setDate(r.getDate()+1);let i=r.getTime();if(i>=t)break;i>e&&n.push(i)}return n}function Zh(e,t,n){let r=t-e,i=(n,i)=>n>e+r*i&&n<t-r*i,a=[];if(n===`6h`||n===`24h`){let r=n===`6h`?1:4,o=new Date(e);for(o.setMinutes(0,0,0);o.getTime()<t;)o.setHours(o.getHours()+1),o.getHours()%r===0&&i(o.getTime(),.06)&&a.push({t:o.getTime(),format:`hour`});return a}if(n===`7d`){for(let n of[Yh(e),...Xh(e,t)]){let e=new Date(n);e.setHours(12),i(e.getTime(),.03)&&a.push({t:e.getTime(),format:`weekday`})}return a}let o=Xh(e,t),s=o.length-1;return o.filter((e,t)=>(s-t)%5==0&&i(o[t]??0,.04)).map(e=>({t:e,format:`date`}))}function Qh(e){return e===`6h`||e===`24h`?`labeled`:e===`7d`?`plain`:`none`}function $h(e,t,n){return e.map((e,r)=>{let i=t(e);return{row:e,index:r,distance:i===void 0?-1:ph(i,n)}}).sort((e,t)=>t.distance-e.distance||e.index-t.index).map(e=>e.row)}function eg(e,t,n,r,i){return r+Math.min(Math.max((e-t)/Math.max(n-t,1),0),1)*(i-r)}function tg(e,t,n,r=6){let i=[],a=-1/0;return e.forEach((e,o)=>{let s=e.x-e.width/2,c=e.x+e.width/2;s<t||c>n||s<a+r||(i.push(o),a=c)}),i}function ng(e,t){return e.x0<=t.x1&&t.x0<=e.x1&&e.y0<=t.y1&&t.y0<=e.y1}function rg(e,t){let n=0,r=1/0;return e.forEach((e,i)=>{let a=t.reduce((t,n)=>t+(ng(e,n)?n.weight??1:0),0);a<r&&(n=i,r=a)}),n}var ig=e=>typeof e==`number`&&Number.isFinite(e)?e:void 0;async function ag(e,t,n,r){if(!e.callWS||t.length===0)return{};let i=await e.callWS({type:`recorder/statistics_during_period`,start_time:new Date(n).toISOString(),end_time:new Date(r).toISOString(),statistic_ids:[...t],period:`hour`,types:[`mean`,`min`,`max`]}),a={};for(let[e,t]of Object.entries(i??{})){let n=[...t].sort((e,t)=>e.start-t.start),r=[];n.forEach((e,t)=>{let i=ig(e.mean),a={t:(e.start+e.end)/2,v:i};i!==void 0&&(a.min=ig(e.min)??i,a.max=ig(e.max)??i),r.push(a);let o=n[t+1];o&&o.start>e.end&&r.push({t:e.end,v:void 0})}),a[e]=r}return a}async function og(e,t,n,r){let i=Sh[n];if(!i.statistics)return qo(e,t,r-xh-bh,r);let a=r-i.hours*bh-bh,o=r-3*bh,[s,c]=await Promise.all([ag(e,t,a,r),qo(e,t,o,r)]),l=t.filter(e=>!s[e]?.some(e=>e.v!==void 0)),u=l.length?await qo(e,l,a,r):{},d={};for(let e of t)d[e]=u[e]??[...(s[e]??[]).filter(e=>e.t<o),...c[e]??[]];return d}var sg={"6h":`range_6h`,"24h":`range_24h`,"7d":`range_7d`,"30d":`cc_range_30d`},cg={temperature:`cc_temperature`,humidity:`cc_humidity`,pressure:`cc_pressure`,co2:`cc_co2`},lg={temperature:`mdi:thermometer`,humidity:`mdi:water-percent`,pressure:`mdi:gauge`,co2:`mdi:molecule-co2`},ug={temperature:1,humidity:0,pressure:0,co2:0};function dg(e){return dn(e)}function fg(e,t,n){try{return new Intl.NumberFormat(dg(e),{minimumFractionDigits:n,maximumFractionDigits:n}).format(t)}catch{return V(e,t,n)}}function pg(e,t,n,r,i=!1,a=ug[t]){let o=fg(e,n,a);return t===`temperature`&&i?`${o}°`:`${o} ${r}`}function mg(e,t,n,r,i=ug[t]){let a=Math.abs(n)<.5*10**-i?0:n;return`${a>0?`+`:a<0?`−`:`±`}${pg(e,t,Math.abs(a),r,!0,i)}`}function hg(e,t,n,r){return B(e,`cc_per_hour`,{value:mg(e,t,n,r,+(t===`temperature`||t===`pressure`)).replace(/°$/,` ${r}`)})}function gg(e,t){return new Intl.DateTimeFormat(dg(e),{hour:`2-digit`,minute:`2-digit`}).format(new Date(t))}function _g(e,t,n,r=!1){return n===`6h`||n===`24h`?r?new Intl.DateTimeFormat(dg(e),{hour:`2-digit`}).format(new Date(t)):gg(e,t):r?new Intl.DateTimeFormat(dg(e),{weekday:n===`7d`?`short`:void 0,day:n===`30d`?`numeric`:void 0,month:n===`30d`?`short`:void 0}).format(new Date(t)):new Intl.DateTimeFormat(dg(e),{weekday:n===`30d`?void 0:`short`,day:n===`30d`?`numeric`:void 0,month:n===`30d`?`short`:void 0,hour:`2-digit`,minute:`2-digit`}).format(new Date(t))}function vg(e,t,n){let r=n===`hour`?{hour:`2-digit`}:n===`weekday`?{weekday:`short`}:{day:`numeric`,month:`short`};return new Intl.DateTimeFormat(dg(e),r).format(new Date(t))}function yg(e,t){return new Intl.DateTimeFormat(dg(e),{weekday:`short`,day:`numeric`}).format(new Date(t))}function bg(e,t,n,r,i=!1){let a=Math.round(n*10)/10;return pg(e,t,a,r,i,Number.isInteger(a)?0:ug[t])}var xg=o`
  :host {
    display: block;
    /* Behind the chart: dots are cut out of the curve with this color. */
    --vivid-climate-surface: var(--vivid-layer-1);
  }
  .panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    border-radius: var(--vivid-tile-radius);
    background: var(--vivid-climate-surface);
    color: var(--primary-text-color);
  }
  .ranges {
    display: inline-flex;
    flex: none;
    padding: 2px;
    border-radius: 10px;
    background: var(--vivid-layer-2);
  }
  .ranges button {
    padding: 4px 9px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }
  .ranges button[aria-pressed='true'] {
    background: rgba(var(--vivid-rgb-text), 0.14);
    color: var(--primary-text-color);
  }
  .plot {
    position: relative;
    touch-action: pan-y;
    cursor: crosshair;
    user-select: none;
    -webkit-user-select: none;
  }
  svg {
    display: block;
    overflow: visible;
  }
  svg text {
    font-family: inherit;
    font-variant-numeric: tabular-nums;
  }
  .t-primary {
    fill: var(--primary-text-color);
  }
  .t-secondary {
    fill: var(--secondary-text-color);
  }
  .t-strong {
    font-weight: 700;
  }
  .band {
    fill: rgba(var(--vivid-rgb-text), 0.05);
  }
  .grid {
    stroke: rgba(var(--vivid-rgb-text), 0.08);
    stroke-width: 1;
  }
  .baseline {
    stroke: rgba(var(--vivid-rgb-text), 0.2);
    stroke-width: 1;
  }
  .midnight {
    stroke: rgba(var(--vivid-rgb-text), 0.22);
    stroke-width: 1;
    stroke-dasharray: 3 4;
  }
  .area {
    opacity: 0.12;
  }
  .under {
    fill: none;
    stroke: rgba(var(--vivid-rgb-text), 0.16);
    stroke-width: 4.5;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .line {
    fill: none;
    stroke-width: 2.5;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .curve {
    animation: vivid-climate-in 380ms ease-out;
  }
  .dot {
    stroke: var(--vivid-climate-surface);
    stroke-width: 2;
  }
  .cursor {
    stroke: var(--primary-text-color);
    stroke-opacity: 0.45;
    stroke-width: 1;
  }
  .tooltip {
    position: absolute;
    top: 0;
    z-index: 1;
    padding: 7px 10px;
    border-radius: 10px;
    background: var(--vivid-layer-0);
    color: var(--primary-text-color);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
    font-size: 11.5px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    pointer-events: none;
  }
  .tooltip .time {
    color: var(--secondary-text-color);
  }
  .tooltip .value {
    font-size: 14px;
    font-weight: 700;
  }
  .message {
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: rgba(var(--vivid-rgb-text), 0.04);
    color: var(--secondary-text-color);
    font-size: 13px;
    text-align: center;
    padding: 0 16px;
  }
  .loading {
    border-radius: 12px;
    background: rgba(var(--vivid-rgb-text), 0.05);
    animation: vivid-climate-pulse 1.4s ease-in-out infinite;
  }
  @keyframes vivid-climate-in {
    from {
      opacity: 0;
    }
  }
  @keyframes vivid-climate-pulse {
    50% {
      opacity: 0.5;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .curve,
    .loading {
      animation: none;
    }
  }
`,Sg=[`6h`,`24h`,`7d`,`30d`],Cg=3e5,wg=220,Tg={left:40,right:12,top:30,bottom:24},Eg=0;function Dg(e,t){return e.length*t*.56}function Og(e){return e===void 0||e===`unavailable`||e===`unknown`}var kg=class extends O{static properties={hass:{attribute:!1},entityId:{attribute:!1},kind:{attribute:!1},comfort:{attribute:!1},range:{attribute:!1},_range:{state:!0},_samples:{state:!0},_failed:{state:!0},_hover:{state:!0},_width:{state:!0}};gradientId=`vivid-climate-${++Eg}`;timer;loadedKey=``;resizer;constructor(){super(),this.kind=`temperature`,this.range=`24h`,this._range=`24h`,this._failed=!1,this._width=360}static styles=[H,U,xg,o`
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .disc {
        display: grid;
        place-items: center;
        flex: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--disc, rgba(var(--vivid-rgb-text), 0.08));
        color: var(--disc-ink, var(--secondary-text-color));
      }
      .disc ha-icon {
        --mdc-icon-size: 22px;
        display: inline-flex;
      }
      .heading {
        flex: 1;
        min-width: 0;
      }
      .sub {
        font-size: 12.5px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .now {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 2px 10px;
      }
      .now .value {
        font-size: 28px;
        font-weight: 700;
        line-height: 1.15;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .now .value.off {
        font-size: 20px;
        color: var(--secondary-text-color);
      }
      .trend {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 12.5px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      .trend ha-icon {
        --mdc-icon-size: 15px;
        display: inline-flex;
      }
      .top {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px 12px;
      }
      .top .head {
        flex: 1 1 200px;
        min-width: 0;
      }
      .halo {
        paint-order: stroke;
        stroke: var(--vivid-climate-surface);
        stroke-width: 3px;
        stroke-linejoin: round;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
        gap: 6px;
      }
      .stat {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
        padding: 7px 9px;
        border-radius: 12px;
        background: var(--vivid-layer-2);
      }
      .stat .label,
      .stat .extra {
        font-size: 11px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .stat .value {
        font-size: 15px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
    `];connectedCallback(){super.connectedCallback(),this.timer=window.setInterval(()=>void this.load(!0),Cg),this.resizer=new ResizeObserver(e=>{let t=Math.round(e[0]?.contentRect.width??0);t>0&&t!==this._width&&(this._width=t)}),this.resizer.observe(this)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this.timer),this.resizer?.disconnect(),this.loadedKey=``}willUpdate(e){e.has(`range`)&&(this._range=this.range,this._hover=void 0)}updated(e){(e.has(`entityId`)||e.has(`hass`)||e.has(`_range`))&&this.load(!1)}async load(e){let t=this.hass,n=this.entityId;if(!t?.callWS||!n||!t.states[n])return;let r=this._range,i=`${n}|${Sh[r].statistics?r:`day`}`;if(e||i!==this.loadedKey){i!==this.loadedKey&&(this._samples=void 0),this.loadedKey=i;try{let e=await og(t,[n],r,Date.now());if(this.loadedKey!==i)return;this._samples=e[n]??[],this._failed=!1}catch{this.loadedKey===i&&(this._failed=!0)}}}selectRange(e){this._range=e,this._hover=void 0}renderRanges(){let e=this.hass;return T`<span class="ranges" role="group" aria-label=${B(e,`period`)}>
      ${Sg.map(t=>T`<button
            type="button"
            class="reset"
            aria-pressed=${String(t===this._range)}
            @click=${()=>this.selectRange(t)}
          >
            ${B(e,sg[t])}
          </button>`)}
    </span>`}render(){let e=this.hass,t=this.entityId,n=t?e?.states[t]:void 0;if(!e||!n)return T`<div class="panel">
        <div class="message" style="height: 80px">${B(e,`cc_not_found`)}</div>
      </div>`;let r=this.kind,i=n.attributes.unit_of_measurement??Ch[r],a=Oh(r,this.comfort??ih[r],i),o=Number.parseFloat(n.state),s=Og(n.state)||!Number.isFinite(o)?void 0:o,c=Date.now(),l=c-Sh[this._range].hours*bh,u=this._samples,d=u?Ah(u,Math.min(u[0]?.t??c,l),c,{t:c,v:s}):[],f=Ah(d,l,c),p=n.attributes.friendly_name??t??``,m=this.renderHead(p,r,i,s,d,c),h;return h=this._failed&&!u?T`<div class="message" style=${`height: ${wg}px`}>
        ${B(e,`cc_no_history`)}
      </div>`:u?u.some(e=>e.v!==void 0&&e.t>=l-864e5)?T`${this.renderChart(f,r,i,a,l,c,p)}
      ${this.renderStats(f,d,r,i,a,c)}`:T`<div class="message" style=${`height: ${wg}px`}>
        ${B(e,`cc_no_history`)}
      </div>`:T`<div class="loading" style=${`height: ${wg}px`}></div>`,T`<div class="panel">
      <div class="top">${m} ${this.renderRanges()}</div>
      ${h}
    </div>`}renderHead(e,t,n,r,i,a){let o=this.hass,s=r===void 0?void 0:Rh(i,a),c=r===void 0?``:`--disc: ${kh(t,r,n)}; --disc-ink: rgba(0, 0, 0, 0.72)`,l=s===void 0||Math.abs(s)<(t===`temperature`?.05:t===`humidity`?.5:.1)?`mdi:arrow-right`:s>0?`mdi:arrow-top-right`:`mdi:arrow-bottom-right`;return T`<div class="head">
      <span class="disc" style=${c}><ha-icon .icon=${lg[t]}></ha-icon></span>
      <div class="heading">
        <div class="sub">${e} · ${B(o,cg[t])}</div>
        <div class="now">
          ${r===void 0?T`<span class="value off">${B(o,`unavailable`)}</span>`:T`<span class="value">${pg(o,t,r,n)}</span>`}
          ${s===void 0?D:T`<span class="trend"
                  ><ha-icon .icon=${l}></ha-icon>${hg(o,t,s,n)}</span
                >`}
        </div>
      </div>
    </div>`}renderChart(e,t,n,r,i,a,o){let s=this.hass,c=this._range,l=Math.max(this._width-28,200),u=e=>pg(s,t,e,n,!0),d=Eh(t,Hh[t],n)-Eh(t,0,n),f=Uh(Mh(e),r,d),p=Math.max(Tg.left,...f.ticks.map(e=>Dg(bg(s,t,e,n,!0),11)+12)),m=l-Tg.right,h=Tg.top,g=wg-Tg.bottom,_=Wh(i,a,p,m),v=Wh(f.lo,f.hi,g,h),y=Jh(t,n,v),b=Bh(e,Math.round((m-p)/2)),x=jh(b),{min:ee,max:S}=Nh(e),te=e[e.length-1],ne=Math.max(v(r.high),h),C=Math.min(v(r.low),g),re=B(s,`cc_comfort`,{range:`${bg(s,t,r.low,n).replace(/[^\d]+$/,``)}–${bg(s,t,r.high,n)}`}),ie=Qh(c),ae=ie===`none`?[]:Xh(i,a),oe=[],w=te?.v===void 0?void 0:{t:te.t,v:te.v},se=(e,t)=>Math.abs(_(e.t)-_(t.t))<70&&Math.abs(v(e.v)-v(t.v))<26,ce=[],le=(e,t,n)=>{let r=_(e.t),i=v(e.v),a=11.5,o=Dg(t,a);if(r+o/2>m&&r-9-o>0)return ce.push({x0:r-9-o,x1:r+6,y0:i-8,y1:i+6}),E`<text class="t-primary halo" x=${r-9} y=${i+4} font-size=${a} text-anchor="end">${t}</text>`;let s=Math.min(Math.max(r,p+o/2),m+6-o/2),c=n?Math.min(i+18,g+6):Math.max(i-10,12);return ce.push({x0:s-o/2,x1:s+o/2,y0:Math.min(c-10,i-6),y1:Math.max(c+2,i+6)}),E`<text class="t-primary halo" x=${s} y=${c} font-size=${a} text-anchor="middle">${t}</text>`};for(let[e,r,i]of[[ee,`cc_min_label`,!0],[S,`cc_max_label`,!1]]){if(!e||ee&&S&&r===`cc_min_label`&&Math.abs(S.v-ee.v)<1e-9)continue;let a=`${B(s,r,{value:u(e.v)})} · ${_g(s,e.t,c)}`;oe.push(E`<circle class="dot" cx=${_(e.t)} cy=${v(e.v)} r="5" fill=${kh(t,e.v,n)}></circle>`,le(e,a,i))}if(w&&(oe.push(E`<circle class="dot" cx=${_(w.t)} cy=${v(w.v)} r="5.5" fill=${kh(t,w.v,n)}></circle>`),!(ee&&se(ee,w)||S&&se(S,w)))){let e=v(w.v)-12>h-6,t=e?v(w.v)-11:v(w.v)+20,n=Dg(u(w.v),11.5);ce.push({x0:_(w.t)-9-n,x1:_(w.t)+6,y0:t-10,y1:t+2}),oe.push(E`<text class="t-primary t-strong halo" x=${_(w.t)-9} y=${e?v(w.v)-11:v(w.v)+20} font-size="11.5" text-anchor="end">${u(w.v)}</text>`)}let ue=Dg(re,11),de=[];for(let t=p;t<=m;t+=4){let n=Lh(e,eg(t,p,m,i,a));n!==void 0&&de.push({x0:t,x1:t,y0:v(n)-2,y1:v(n)+2})}let fe=C-ne>34,pe=[p+6,m-6-ue],me=[...fe?[ne+14,C-5]:[],...C+16<g?[C+14]:[],...ne-16>h?[ne-4]:[]];me.length||me.push(ne-4);let he=me.flatMap(e=>pe.map(t=>[t,e])).map(([e,t])=>({x0:e,x1:e+ue,y0:t-11,y1:t+3})),ge=he[rg(he,[...de.map(e=>({...e,weight:1})),...ce.map(e=>({...e,weight:100}))])],_e=this._hover,ve=_e===void 0?void 0:Lh(b,_e),ye=c===`6h`||c===`24h`,be=gg(s,a),xe=Ag(s,i,a,c,_,p,ye?m-Dg(be,11):m);return T`<div
      class="plot"
      @pointermove=${e=>this.onPointer(e,p,m,i,a)}
      @pointerdown=${e=>this.onPointer(e,p,m,i,a)}
      @pointerleave=${()=>this._hover=void 0}
    >
      <svg
        width=${l}
        height=${wg}
        viewBox=${`0 0 ${l} ${wg}`}
        role="img"
        aria-label=${B(s,`cc_history_of`,{kind:B(s,cg[t]),name:o,range:B(s,sg[c])})}
      >
        <defs>
          <linearGradient
            id=${this.gradientId}
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2="0"
            y1=${y.y1}
            y2=${y.y2}
          >
            ${y.stops.map(e=>E`<stop offset=${e.offset} stop-color=${e.color}></stop>`)}
          </linearGradient>
        </defs>
        ${C>ne?E`<rect class="band" x=${p} y=${ne} width=${m-p} height=${C-ne}></rect>
`:D}
        ${f.ticks.map(e=>E`<line class=${e===f.lo?`baseline`:`grid`} x1=${p} x2=${m} y1=${v(e)} y2=${v(e)}></line>
            <text class="t-secondary" x=${p-7} y=${v(e)+4} font-size="11" text-anchor="end">${bg(s,t,e,n,!0)}</text>`)}
        ${ae.map(e=>{let t=_(e),n=E`<line class="midnight" x1=${t} x2=${t} y1=${h-14} y2=${g}></line>`;return ie===`labeled`?E`${n}
            ${t-p>60?E`<text class="t-secondary" x=${t-5} y=${h-6} font-size="11" text-anchor="end">${yg(s,e-bh)}</text>`:D}
            ${m-t>50?E`<text class="t-primary" x=${t+5} y=${h-6} font-size="11">${yg(s,e)}</text>`:D}`:n})}
        <g class="curve">
          ${x.map(e=>E`<path class="area" fill=${`url(#${this.gradientId})`} d=${qh(e,_,v,g)}></path>`)}
          ${x.map(e=>E`<path class="under" d=${Kh(e,_,v)}></path>`)}
          ${x.map(e=>E`<path class="line" stroke=${`url(#${this.gradientId})`} d=${Kh(e,_,v)}></path>`)}
          ${oe}
        </g>
        ${C>ne?E`<text class="t-secondary halo" x=${ge.x0} y=${ge.y1-3} font-size="11">${re}</text>`:D}
        ${xe.map(e=>E`<text class="t-secondary" x=${e.x} y=${214} font-size="11" text-anchor="middle">${e.text}</text>`)}
        ${ye?E`<text class="t-primary" x=${m} y=${214} font-size="11" text-anchor="end">${be}</text>`:D}
        ${_e===void 0?D:E`<line class="cursor" x1=${_(_e)} x2=${_(_e)} y1=${h-14} y2=${g}></line>
              ${ve===void 0?D:E`<circle class="dot" cx=${_(_e)} cy=${v(ve)} r="4.5" fill=${kh(t,ve,n)}></circle>`}`}
      </svg>
      ${_e===void 0?D:this.renderTooltip(_e,ve,_(_e),l,t,n)}
    </div>`}onPointer(e,t,n,r,i){let a=e.currentTarget.getBoundingClientRect();a.width!==0&&(this._hover=eg(e.clientX-a.left,t,n,r,i))}renderTooltip(e,t,n,r,i,a){let o=this.hass;return T`<div class="tooltip" style=${n>r*.55?`right: ${r-n+10}px`:`left: ${n+10}px`}>
      <div class="time">${_g(o,e,this._range)}</div>
      <div class="value">${t===void 0?`—`:pg(o,i,t,a)}</div>
    </div>`}renderStats(e,t,n,r,i,a){let o=this.hass,s=this._range,{min:c,max:l}=Nh(e),u=Fh(e,a),d=Ih(e,i,a),f=zh(t,a),p=e=>pg(o,n,e,r,!0),m=B(o,`cc_below`,{value:bg(o,n,i.low,r)}),h=B(o,`cc_above`,{value:bg(o,n,i.high,r)}),g=d.below&&d.above?B(o,`cc_both_sides`,{below:mn(o,d.below/1e3),above:mn(o,d.above/1e3)}):d.below?m:d.above?h:B(o,`cc_always_comfortable`),_=(e,t,n)=>T`<div class="stat">
        <span class="label">${e}</span>
        <span class="value">${t}</span>
        <span class="extra" title=${n}>${n}</span>
      </div>`;return T`<div class="stats">
      ${_(B(o,`cc_min`),c?p(c.v):`—`,c?_g(o,c.t,s):` `)}
      ${_(B(o,`cc_max`),l?p(l.v):`—`,l?_g(o,l.t,s):` `)}
      ${_(B(o,`cc_mean`),u===void 0?`—`:p(u),B(o,`cc_over`,{range:B(o,sg[s])}))}
      ${_(B(o,`cc_outside`),pn(o,(d.below+d.above)/1e3),g)}
      ${_(B(o,`cc_yesterday_at`,{time:_g(o,a-xh,`24h`,!0)}),f?p(f.value):`—`,f?B(o,`cc_vs_yesterday`,{diff:mg(o,n,f.diff,r)}):` `)}
    </div>`}};function Ag(e,t,n,r,i,a,o){let s=Zh(t,n,r).map(t=>{let n=vg(e,t.t,t.format);return{x:i(t.t),text:n,width:Dg(n,11)}});return tg(s,a-20,o-6).map(e=>s[e])}z(`vivid-climate-chart`,kg);var jg=3e5,Mg=70,Ng=18,Pg=52,Fg=22,Ig=24,Lg=0,Rg=class extends O{static properties={hass:{attribute:!1},sources:{attribute:!1},kind:{attribute:!1},comfort:{attribute:!1},range:{attribute:!1},_range:{state:!0},_series:{state:!0},_failed:{state:!0},_hover:{state:!0},_width:{state:!0}};idPrefix=`vivid-climate-rooms-${++Lg}`;timer;loadedKey=``;resizer;constructor(){super(),this.sources=[],this.kind=`temperature`,this.range=`24h`,this._range=`24h`,this._failed=!1,this._width=360}static styles=[H,U,xg,o`
      .top {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 12px;
      }
      .sub {
        flex: 1 1 140px;
        min-width: 0;
        font-size: 12.5px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .room {
        cursor: pointer;
        outline: none;
      }
      .room .hit {
        fill: transparent;
      }
      .room:hover .hit,
      .room:focus-visible .hit {
        fill: rgba(var(--vivid-rgb-text), 0.04);
      }
      .room:focus-visible .hit {
        stroke: var(--vivid-focus);
        stroke-width: 1.5;
      }
      .halo {
        paint-order: stroke;
        stroke: var(--vivid-climate-surface);
        stroke-width: 3px;
        stroke-linejoin: round;
      }
      .tooltip .row {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 2px 8px;
      }
      .tooltip .row b {
        text-align: right;
      }
      .swatch {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
    `];connectedCallback(){super.connectedCallback(),this.timer=window.setInterval(()=>void this.load(!0),jg),this.resizer=new ResizeObserver(e=>{let t=Math.round(e[0]?.contentRect.width??0);t>0&&t!==this._width&&(this._width=t)}),this.resizer.observe(this)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this.timer),this.resizer?.disconnect(),this.loadedKey=``}willUpdate(e){e.has(`range`)&&(this._range=this.range,this._hover=void 0)}updated(e){(e.has(`sources`)||e.has(`hass`)||e.has(`_range`))&&this.load(!1)}ids(){return this.sources.map(e=>e.entityId)}async load(e){let t=this.hass,n=this.ids().filter(e=>t?.states[e]);if(!t?.callWS||n.length===0)return;let r=this._range,i=`${n.join(`,`)}|${Sh[r].statistics?r:`day`}`;if(e||i!==this.loadedKey){i!==this.loadedKey&&(this._series=void 0),this.loadedKey=i;try{let e=await og(t,n,r,Date.now());if(this.loadedKey!==i)return;this._series=e,this._failed=!1}catch{this.loadedKey===i&&(this._failed=!0)}}}select(e){this.dispatchEvent(new CustomEvent(`vivid-climate-room-select`,{detail:{entityId:e},bubbles:!0,composed:!0}))}rows(e,t,n){let r=this.hass,i=this.kind;return $h(this.sources.map(a=>{let o=r?.states[a.entityId],s=o?.attributes.unit_of_measurement??e,c=t=>Dh(i,t,s,e),l=Number.parseFloat(o?.state??``),u=!o||o.state===`unavailable`||o.state===`unknown`,d=u||!Number.isFinite(l)?void 0:c(l),f=Ah(this._series?.[a.entityId]??[],t,n,{t:n,v:d}).map(e=>({t:e.t,v:e.v===void 0?void 0:c(e.v),min:e.min===void 0?void 0:c(e.min),max:e.max===void 0?void 0:c(e.max)}));return{source:a,name:a.name??o?.attributes.friendly_name??a.entityId,current:d,unavailable:u,samples:f}}),t=>t.current===void 0?void 0:Th(i,t.current,e),this.comfort??ih[i])}renderRanges(){let e=this.hass;return T`<span class="ranges" role="group" aria-label=${B(e,`period`)}>
      ${Sg.map(t=>T`<button
            type="button"
            class="reset"
            aria-pressed=${String(t===this._range)}
            @click=${()=>{this._range=t,this._hover=void 0}}
          >
            ${B(e,sg[t])}
          </button>`)}
    </span>`}render(){let e=this.hass;if(!e||this.sources.length===0)return D;let t=this.kind,n=this.sources.map(t=>e.states[t.entityId]?.attributes.unit_of_measurement).find(e=>e!==void 0)??Ch[t],r=Oh(t,this.comfort??ih[t],n),i=T`<div class="top">
      <span class="sub">${B(e,`cc_rooms`,{count:this.sources.length})}</span>
      ${this.renderRanges()}
    </div>`,a=Fg+this.sources.length*Mg+Ig;if(!this._series)return T`<div class="panel">
        ${i}
        ${this._failed?T`<div class="message" style=${`height: ${a}px`}>
                ${B(e,`cc_no_history`)}
              </div>`:T`<div class="loading" style=${`height: ${a}px`}></div>`}
      </div>`;let o=Date.now(),s=o-Sh[this._range].hours*bh,c=this.rows(n,s,o);return T`<div class="panel">
      ${i} ${this.renderChart(c,t,n,r,s,o)}
    </div>`}renderChart(e,t,n,r,i,a){let o=this.hass,s=this._range,c=Math.max(this._width-28,240),l=Math.round(Math.min(Math.max(c*.22,84),130)),u=l+10,d=c-10,f=Fg+e.length*Mg+Ig,p=Eh(t,Hh[t],n)-Eh(t,0,n),m=Uh(e.flatMap(e=>Mh(e.samples)),r,p,2),h=Wh(i,a,u,d),g=e=>pg(o,t,e,n,!0),_=Qh(s),v=_===`none`?[]:Xh(i,a),y=s===`6h`||s===`24h`,b=gg(o,a),x=Ag(o,i,a,s,h,u,y?d-Dg(b,11):d),ee=Fg+e.length*Mg,S=this._hover,te=e.map((e,i)=>{let a=Fg+i*Mg,f=Wh(m.lo,m.hi,a+Pg,a+Ng),p=Jh(t,n,f),_=`${this.idPrefix}-${i}`,v=Bh(e.samples,Math.round((d-u)/2)),y=jh(v),{min:b,max:x}=Nh(e.samples),ee=f(r.high),te=f(r.low),ne=(e,t,n)=>{let r=Dg(n,10.5);return E`<text class="t-secondary halo" x=${Math.min(Math.max(e,u+r/2),d-r/2)} y=${t} font-size="10.5" text-anchor="middle">${n}</text>`},C=e.samples[e.samples.length-1],re=S===void 0?void 0:Lh(v,S),ie=e.current===void 0?B(o,e.unavailable?`unavailable`:`no_data`):g(e.current);return E`<g
        class="room"
        role="button"
        tabindex="0"
        aria-label=${B(o,`cc_show_room`,{name:e.name})}
        @click=${()=>this.select(e.source.entityId)}
        @keydown=${t=>{(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),this.select(e.source.entityId))}}
      >
        <rect class="hit" x="0" y=${a+2} width=${c} height=${66} rx="10"></rect>
        <defs>
          <linearGradient id=${_} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1=${p.y1} y2=${p.y2}>
            ${p.stops.map(e=>E`<stop offset=${e.offset} stop-color=${e.color}></stop>`)}
          </linearGradient>
        </defs>
        <rect class="band" x=${u} y=${ee} width=${d-u} height=${Math.max(te-ee,0)}></rect>
        <line class="grid" x1=${u} x2=${d} y1=${a+Pg} y2=${a+Pg}></line>
        <text class="t-primary" x="4" y=${a+30} font-size="13">${zg(e.name,l-4,13)}</text>
        <text class=${e.current===void 0?`t-secondary`:`t-primary t-strong`} x="4" y=${a+50} font-size=${e.current===void 0?12:17}>${ie}</text>
        <g class="curve">
          ${y.map(e=>E`<path class="under" d=${Kh(e,h,f)}></path>`)}
          ${y.map(e=>E`<path class="line" stroke=${`url(#${_})`} d=${Kh(e,h,f)}></path>`)}
          ${y.length===0?E`<text class="t-secondary" x=${(u+d)/2} y=${a+40} font-size="11" text-anchor="middle">${B(o,`cc_no_history`)}</text>`:D}
          ${x?E`<circle class="dot" cx=${h(x.t)} cy=${f(x.v)} r="3.5" fill=${kh(t,x.v,n)}></circle>
                ${ne(h(x.t),f(x.v)-7,`${g(x.v)} · ${_g(o,x.t,s,!0)}`)}`:D}
          ${b&&x&&b.v!==x.v?E`<circle class="dot" cx=${h(b.t)} cy=${f(b.v)} r="3.5" fill=${kh(t,b.v,n)}></circle>
                ${ne(h(b.t),f(b.v)+15,`${g(b.v)} · ${_g(o,b.t,s,!0)}`)}`:D}
          ${C?.v===void 0?D:E`<circle class="dot" cx=${h(C.t)} cy=${f(C.v)} r="4.5" fill=${kh(t,C.v,n)}></circle>`}
        </g>
        ${re!==void 0&&S!==void 0?E`<circle class="dot" cx=${h(S)} cy=${f(re)} r="4" fill=${kh(t,re,n)}></circle>`:D}
      </g>`});return T`<div
      class="plot"
      @pointermove=${e=>this.onPointer(e,u,d,i,a)}
      @pointerdown=${e=>this.onPointer(e,u,d,i,a)}
      @pointerleave=${()=>this._hover=void 0}
    >
      <svg
        width=${c}
        height=${f}
        viewBox=${`0 0 ${c} ${f}`}
        aria-label=${B(o,`cc_rooms_label`,{kind:B(o,cg[t]),range:B(o,sg[s])})}
      >
        ${v.map(e=>{let t=h(e),n=E`<line class="midnight" x1=${t} x2=${t} y1=${14} y2=${ee}></line>`;return _===`labeled`?E`${n}
            ${t-u>56?E`<text class="t-secondary" x=${t-5} y=${14} font-size="11" text-anchor="end">${yg(o,e-bh)}</text>`:D}
            ${d-t>48?E`<text class="t-primary" x=${t+5} y=${14} font-size="11">${yg(o,e)}</text>`:D}`:n})}
        ${te}
        ${x.map(e=>E`<text class="t-secondary" x=${e.x} y=${f-6} font-size="11" text-anchor="middle">${e.text}</text>`)}
        ${y?E`<text class="t-primary" x=${d} y=${f-6} font-size="11" text-anchor="end">${b}</text>`:D}
        ${S===void 0?D:E`<line class="cursor" x1=${h(S)} x2=${h(S)} y1=${14} y2=${ee}></line>`}
      </svg>
      ${S===void 0?D:this.renderTooltip(e,S,h(S),c,t,n)}
    </div>`}onPointer(e,t,n,r,i){let a=e.currentTarget.getBoundingClientRect();if(a.width===0)return;let o=e.clientX-a.left;this._hover=o<t-4?void 0:eg(o,t,n,r,i)}renderTooltip(e,t,n,r,i,a){let o=this.hass;return T`<div class="tooltip" style=${n>r*.6?`right: ${r-n+10}px`:`left: ${n+10}px`}>
      <div class="time">${_g(o,t,this._range)}</div>
      ${e.map(e=>{let n=Lh(e.samples,t);return T`<div class="row">
          <span
            class="swatch"
            style=${`background: ${n===void 0?`transparent`:kh(i,n,a)}`}
          ></span>
          <span>${e.name}</span>
          <b>${n===void 0?`—`:pg(o,i,n,a,!0)}</b>
        </div>`})}
    </div>`}};function zg(e,t,n){if(Dg(e,n)<=t)return e;let r=Math.max(Math.floor(t/(n*.56))-1,1);return`${e.slice(0,r)}…`}z(`vivid-climate-rooms`,Rg),z(`vivid-climate-details`,class extends O{static properties={hass:{attribute:!1},kind:{attribute:!1},sources:{attribute:!1},comfort:{attribute:!1},range:{attribute:!1},heading:{attribute:!1},summary:{attribute:!1},session:{attribute:!1},_selected:{state:!0}};constructor(){super(),this.kind=`temperature`,this.sources=[],this.range=`24h`,this.session=0}static styles=[H,U,o`
      :host {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 6px 2px;
        min-width: 0;
      }
      .titles {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 2px 8px;
        min-width: 0;
      }
      .title {
        font-size: 14px;
        font-weight: 600;
      }
      .muted {
        color: var(--secondary-text-color);
        font-size: 12px;
      }
      .back {
        display: inline-grid;
        place-items: center;
        flex: none;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--vivid-layer-1);
        color: var(--primary-text-color);
        cursor: pointer;
      }
      .back:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .back ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
      }
    `];willUpdate(e){(e.has(`session`)||e.has(`sources`))&&(this.sources.some(e=>e.entityId===this._selected)||(this._selected=void 0),e.has(`session`)&&(this._selected=void 0))}onRoomSelect=e=>{let t=e.detail?.entityId;t&&(this._selected=t)};chart(e){return T`<vivid-climate-chart
      .hass=${this.hass}
      .entityId=${e}
      .kind=${this.kind}
      .comfort=${this.comfort}
      .range=${this.range}
    ></vivid-climate-chart>`}render(){let e=this.sources.find(e=>e.entityId===this._selected);return e?T`<div class="head">
          <button
            type="button"
            class="reset back"
            aria-label=${B(this.hass,`climate_all_rooms`)}
            title=${B(this.hass,`climate_all_rooms`)}
            @click=${()=>{this._selected=void 0}}
          >
            <ha-icon icon="mdi:chevron-left"></ha-icon>
          </button>
          <div class="titles">
            <span class="title">${e.name??e.entityId}</span>
            <span class="muted">${this.heading}</span>
          </div>
        </div>
        ${this.chart(e.entityId)}`:T`<div class="head">
        <div class="titles">
          <span class="title">${this.heading}</span>
          ${this.summary?T`<span class="muted">${this.summary}</span>`:D}
        </div>
      </div>
      ${this.sources.length>1?T`<vivid-climate-rooms
              .hass=${this.hass}
              .sources=${this.sources}
              .kind=${this.kind}
              .comfort=${this.comfort}
              .range=${this.range}
              @vivid-climate-room-select=${this.onRoomSelect}
            ></vivid-climate-rooms>`:this.chart(this.sources[0]?.entityId)}`}});var Bg={temperature:`vivid-temperature-badge`,humidity:`vivid-humidity-badge`,pressure:`vivid-pressure-badge`,co2:`vivid-air-quality-badge`},Vg=[`sensor`,`group`],Hg={temperature:[`temperature`],humidity:[`humidity`],pressure:[`atmospheric_pressure`,`pressure`],co2:[`carbon_dioxide`]};function Ug(e){let t=typeof e==`string`?e.replace(/^custom:/,``):``;return Object.entries(Bg).find(([,e])=>e===t)?.[0]??`temperature`}var Wg={temperature:`range`,humidity:`max`,pressure:`mean`,co2:`max`},Gg={temperature:.5,humidity:5,pressure:1,co2:void 0},Kg={temperature:36e5,humidity:36e5,pressure:108e5,co2:36e5},qg=9e5,Jg=6e5;function Yg(e,t=Ug(e?.type)){let n=new rp(Bg[t],e),r=ip(n,{domains:Vg}),i=n.config.comfort,a;if(i!=null&&i!==``){let e=Array.isArray(i)?i.map(e=>Number(e)):[],[t,r]=e;(e.length!==2||t===void 0||r===void 0||!Number.isFinite(t)||!Number.isFinite(r)||t>=r)&&n.fail(`"comfort" must be two numbers, low then high (comfort: [19, 23]).`),a={low:t,high:r}}let o=n.config.aggregate;return{...r,kind:t,comfort:a,aggregate:o==null||o===``||o===`auto`?void 0:n.choice(`aggregate`,np,`mean`),range:n.choice(`range`,Sg,`24h`),trend:n.bool(`trend`,!0)}}var Xg={hPa:1,mbar:1,Pa:.01,kPa:10,bar:1e3,inHg:33.8639,mmHg:1.33322,psi:68.9476};function Zg(e,t,n){return e===`temperature`?hh(t,n):e===`pressure`?t*(Xg[n??`hPa`]??1):t}function Qg(e,t,n){return e===`temperature`?n===`°F`?t*9/5+32:t:e===`pressure`?t/(Xg[n??`hPa`]??1):t}function $g(e,t,n){return t?{low:Zg(e,t.low,n),high:Zg(e,t.high,n)}:ih[e]}function e_(e,t){return e===`temperature`?1:e===`pressure`?t===`inHg`||t===`bar`?2:+(t===`kPa`):0}function t_(e){return{temperature:`°C`,humidity:`%`,pressure:`hPa`,co2:`ppm`}[e]}function n_(e,t,n,r){if(!e?.length)return;let i=Xo(e,t-n)??e.find(e=>e.v!==void 0)?.v;return i===void 0?void 0:r-i}function r_(e,t,n,r){if(!e?.length)return;let i=t-n,a=[Xo(e,i),...e.filter(e=>e.t>i&&e.t<=t).map(e=>e.v)].filter(e=>e!==void 0);return a.length?r-Math.min(...a):void 0}function i_(e,t){let n=Gg[e];if(!(n===void 0||t===void 0||Math.abs(t)<=n))return t>0?`up`:`down`}function a_(e){let t=Math.max(Kg[e.kind],e.kind===`humidity`?qg:0);return{ids:Gg[e.kind]===void 0?[]:e.items.map(e=>e.entityId),window:t}}function o_(e,t,n={},r=Date.now()){let i=t.kind,a=pc(e,t),o=mc(e,a).map(e=>{let t=e.state?.attributes.unit_of_measurement,a=typeof t==`string`&&t?t:void 0,o=e.available?Number.parseFloat(e.state?.state??``):NaN;if(!Number.isFinite(o))return{entityId:e.entityId,name:e.name,unit:a};let s=Zg(i,o,a),c=n[e.entityId]?.map(e=>({t:e.t,v:e.v===void 0?void 0:Zg(i,e.v,a)}));return{entityId:e.entityId,name:e.name,value:o,scaled:s,unit:a,delta:n_(c,r,Kg[i],s),rise:i===`humidity`?r_(c,r,qg,s):void 0}}),s=o.find(e=>e.unit)?.unit??t_(i),c=$g(i,t.comfort,s),l=hc(t,a.length),u=o.filter(e=>e.scaled!==void 0),d=e=>e.scaled,f=t.aggregate??(l?Wg[i]:`mean`),p=e=>i===`co2`?d(e):ph(d(e),c),m=u.reduce((e,t)=>!e||p(t)>p(e)?t:e,void 0),h={name:t.name??(t.entity?M(e,t.entity):B(e,`climate_title_${i}`)),kind:i,isGroup:l,items:o,unit:s,comfort:c,display:f,worst:m,rise:u.reduce((e,t)=>t.rise===void 0?e:Math.max(e??t.rise,t.rise),void 0),watched:gc(t,a)};if(!u.length)return h;if(f===`range`)return h.low=u.reduce((e,t)=>d(t)<d(e)?t:e),h.high=u.reduce((e,t)=>d(t)>d(e)?t:e),h;if(h.scaled=_c(u.map(d),f),f===`min`||f===`max`)h.delta=u.find(e=>e.scaled===h.scaled)?.delta;else{let e=u.flatMap(e=>e.delta===void 0?[]:[e.delta]);h.delta=e.length?_c(e,f===`sum`?`sum`:`mean`):void 0}return h}function s_(e,t,n){return{color:uh(e,t),halo:mh(e,t,n)}}function c_(e,t,n){let r=e[0]??[150,150,150],i=e[e.length-1]??r;return{background:e.length>1?`linear-gradient(90deg, ${I(r)} 50%, ${I(i)} 50%)`:I(r),iconColor:Ht(Qt(e)),shadow:t>0?Xt([n??r],t):`none`}}function l_(e,t){let{kind:n,comfort:r}=e,i=e.worst?.scaled;if(i===void 0)return;let a=s_(n,i,r),o=t.trend,s=o&&n===`humidity`&&(e.rise??0)>10,c=o&&n===`pressure`&&e.delta!==void 0&&e.delta<-3;if(e.display===`range`&&e.low?.scaled!==void 0&&e.high?.scaled!==void 0)return{colors:e.low===e.high?[uh(n,e.low.scaled)]:[uh(n,e.low.scaled),uh(n,e.high.scaled)],halo:a.halo,haloColor:a.color,pulse:!1,dropAlert:!1,shower:!1};let l=e.scaled??i,u=s_(n,l,r),d=n===`co2`?_h(l):void 0;return{colors:[u.color],halo:c?1:u.halo,haloColor:u.color,pulse:n===`temperature`&&u.halo>=1||d===`toxic`||s,trend:o?i_(n,e.delta):void 0,level:d,dropAlert:c,shower:s}}var u_={temperature:`mdi:thermometer`,humidity:`mdi:water-percent`,pressure:`mdi:gauge`,co2:`mdi:molecule-co2`},d_=6e5;function f_(e,t,n){try{return new Intl.NumberFormat(dn(e),{minimumFractionDigits:n,maximumFractionDigits:n}).format(t)}catch{return t.toFixed(n)}}var p_=class extends $f{kind=`temperature`;model;history={};historyKey;historyTimer;session=0;static getConfigElement(){return Kp(h_(`temperature`))}static getStubConfig(e){return m_(e,`temperature`)}resolveConfig(e){return Yg(e,this.kind)}connectedCallback(){super.connectedCallback(),this.historyKey=void 0}disconnectedCallback(){super.disconnectedCallback(),this.stopHistory()}stopHistory(){this.historyTimer!==void 0&&window.clearInterval(this.historyTimer),this.historyTimer=void 0}ensureHistory(){let e=this.model;if(!this.hass||!this._config||!e||!this.isConnected)return;let t=this._config.trend?a_(e):{ids:[],window:0},n=`${t.ids.join(`,`)}|${t.window}`;if(n===this.historyKey||(this.historyKey=n,this.stopHistory(),this.history={},!t.ids.length))return;let r=async()=>{let e=this.hass;if(!e)return;let n=Date.now();try{this.history=await qo(e,t.ids,n-t.window-d_,n)}catch{this.history={}}this.requestUpdate()};r(),this.historyTimer=window.setInterval(()=>void r(),Jg)}updated(){super.updated(),this.ensureHistory()}number(e){let t=this.model;if(!t)return``;let n=Qg(t.kind,e,t.unit);return f_(this.hass,n,e_(t.kind,t.unit))}short(e){let t=this.model;return t?t.kind===`temperature`?`${this.number(e)}${this.degree()}`:`${this.number(e)} ${t.unit}`:``}degree(){return this.model?.unit===`°F`?` °F`:`°`}long(e){let t=this.model;return t?`${this.number(e)} ${t.unit}`:``}icon(e,t,n){switch(e.kind){case`temperature`:return`mdi:thermometer`;case`humidity`:return t.shower?`mdi:shower`:`mdi:water-percent`;case`pressure`:return yh(n);case`co2`:return vh(t.level??`excellent`)}}stateText(e,t){let n=[t];return e.level&&n.push(B(this.hass,`air_${e.level}`)),e.shower?n.push(B(this.hass,`climate_shower`)):e.dropAlert?n.push(B(this.hass,`climate_pressure_drop`)):e.trend&&n.push(B(this.hass,e.trend===`up`?`climate_rising`:`climate_falling`)),n.join(` · `)}buildView(e,t){let n=o_(e,t,this.history);this.model=n;let r=l_(n,t);if(!r)return{name:n.name,active:!1,icon:t.icon??u_[n.kind],state:B(e,`unavailable`),watched:n.watched,unavailable:!0};let i,a,o,s;if(n.display===`range`&&n.low?.scaled!==void 0&&n.high?.scaled!==void 0){let t=n.low.scaled,r=n.high.scaled;s=r,i=t===r?this.short(t):`${this.number(t)}–${this.number(r)}${this.degree()}`,a=t===r?this.long(t):`${this.number(t)}–${this.number(r)} ${n.unit} · ${B(e,`climate_rooms`,{n:n.items.length})}`}else s=n.scaled??0,i=this.short(s),a=this.stateText(r,this.long(s)),n.isGroup&&n.kind!==`co2`&&(n.display===`max`||n.display===`min`)&&(o=B(e,`agg_${n.display}`));let c=I(r.haloColor);return{name:n.name,active:!0,icon:t.icon??this.icon(n,r,s),text:i,prefix:o,trend:r.trend,tone:c_(r.colors,r.halo,r.haloColor),pulse:r.pulse?`1.6s`:void 0,pulseColor:c,state:a,watched:n.watched}}detailsOpened(){this.session+=1}renderDetails(){let e=this.model,t=this._config;if(!e||!t)return T``;let n=e.items.map(e=>({entityId:e.entityId,name:e.name}));return T`<vivid-climate-details
      .hass=${this.hass}
      .kind=${e.kind}
      .sources=${n.length?n:t.entity?[{entityId:t.entity}]:[]}
      .comfort=${e.comfort}
      .range=${t.range}
      .heading=${e.name}
      .summary=${this.view?.state}
      .session=${this.session}
    ></vivid-climate-details>`}};function m_(e,t){let n=Hg[t],r=Object.values(e?.states??{}).filter(e=>e.entity_id.startsWith(`sensor.`)&&n.includes(String(e.attributes.device_class)));return{entity:(r.find(e=>Array.isArray(e.attributes.entity_id))??r[0])?.entity_id??`sensor.${t}`}}var h_=e=>({type:`custom:${Bg[e]}`,domain:Vg,deviceClass:Hg[e],fields:[{name:`comfort`,label:`comfort`,selector:{object:{}},helper:e===`co2`?`comfort_helper_co2`:`comfort_helper`},{name:`aggregate`,label:`aggregate`,choices:{values:[`auto`,...np],labelPrefix:`aggregate_`},default:`auto`,helper:`climate_aggregate_helper`,row:2},{name:`range`,label:`climate_range`,choices:{values:Sg,labelPrefix:`climate_range_`},default:`24h`,row:2},...e===`co2`?[]:[{name:`trend`,label:`climate_trend`,selector:{boolean:{}},default:!0,helper:`climate_trend_helper_${e}`}]],validate:t=>void Yg(t,e)}),g_=class extends p_{kind=`temperature`;static getConfigElement(){return Kp(h_(`temperature`))}static getStubConfig(e){return m_(e,`temperature`)}},__=class extends p_{kind=`humidity`;static getConfigElement(){return Kp(h_(`humidity`))}static getStubConfig(e){return m_(e,`humidity`)}},v_=class extends p_{kind=`pressure`;static getConfigElement(){return Kp(h_(`pressure`))}static getStubConfig(e){return m_(e,`pressure`)}},y_=class extends p_{kind=`co2`;static getConfigElement(){return Kp(h_(`co2`))}static getStubConfig(e){return m_(e,`co2`)}};z(Bg.temperature,g_),z(Bg.humidity,__),z(Bg.pressure,v_),z(Bg.co2,y_),cn({type:Bg.temperature,name:`Vivid temperature badge`,description:`Temperature of a room, or the range of several: the disc takes the color of the value, a halo outside the comfort range, and a trend arrow. Tap for the history.`,preview:!0,documentationURL:`${R}#climate-badges`}),cn({type:Bg.humidity,name:`Vivid humidity badge`,description:`Humidity of a room, or the most humid of several: cyan to deep blue, pulsing during a shower. Tap for the history.`,preview:!0,documentationURL:`${R}#climate-badges`}),cn({type:Bg.pressure,name:`Vivid pressure badge`,description:`Atmospheric pressure: the weather it suggests, its three-hour trend and an alert when it drops fast. Tap for the history.`,preview:!0,documentationURL:`${R}#climate-badges`}),cn({type:Bg.co2,name:`Vivid air quality badge`,description:`CO₂ of a room, or the worst of several: healthy to toxic green, with its level in words and a window when it is time to air. Tap for the history.`,preview:!0,documentationURL:`${R}#climate-badges`});function b_(e,t){let n=ip(new rp(e,t),{domains:[`sensor`],entityOptional:!0}),r=Ru(e,t);return{...n,energy:r.energy,cost:r.cost,tariff:r.tariff}}function x_(e){return{background:I(e),iconColor:Ht(e),shadow:Xt([e],.7)}}var S_=[{name:`look`,label:`badge_look`,default:`disc`,options:[{value:`disc`,label:`look_disc`},{value:`pill`,label:`look_pill`}]},{name:`glow`,label:`glow`,selector:{number:{min:0,max:200,step:10,mode:`slider`,unit_of_measurement:`%`}},default:100}],C_=class extends $f{energy=new Od(this,()=>{let e=this.needs();return this.hass&&this._config&&e?{hass:this.hass,energy:this._config.energy,cost:this._config.cost,tariff:this._config.tariff,needs:e}:void 0});today(){return Hu(Date.now())}},w_=`vivid-bill-badge`;z(w_,class extends C_{bill;static getConfigElement(){return Md({fields:S_,validate:e=>b_(w_,e)})}static getStubConfig(){return{tariff:Vu}}resolveConfig(e){return b_(w_,e)}needs(){return of}buildView(e,t){let n=t.name??B(e,`energy_bill`),r=this.energy.data,i=t.icon??`mdi:currency-eur`;if(!r?.days.length)return this.bill=void 0,{name:n,active:!1,icon:i,state:this.energy.error===`no_source`?B(e,`energy_no_source`):B(e,r?`energy_no_data`:`energy_loading`),watched:[],unavailable:!!(r||this.energy.error)};let a=Vd(r.days,t.tariff,r.today);this.bill=a;let o=fd(a.delta),s=a.cycle,c=X(e,s.projected,0);return{name:n,active:!0,icon:i,text:c,suffix:a.delta===void 0?void 0:$u(e,a.delta),tone:x_(o),ring:s.length?s.dayIndex/s.length:void 0,ringColor:Q(o),state:`${c} · ${B(e,`energy_estimated`,{day:s.dayIndex,total:s.length})}`,watched:[]}}renderDetails(){return T`<vivid-bill-summary
      compact
      .hass=${this.hass}
      .view=${this.bill}
      .tariff=${this._config?.tariff}
    ></vivid-bill-summary>`}}),cn({type:w_,name:`Vivid bill badge`,description:`The estimated bill of the cycle in progress, colored by the gap with the previous one.`,preview:!0,documentationURL:`${R}#vivid-bill-badge`});var T_=`vivid-tariff-badge`;z(T_,class extends C_{static getConfigElement(){return Md({fields:S_,validate:e=>b_(T_,e)})}static getStubConfig(){return{tariff:Vu}}resolveConfig(e){return b_(T_,e)}needs(){}buildView(e,t){let n=Date.now(),r=Mu(t.tariff.offPeakRanges,n),i=t.name??B(e,`energy_tariff`);if(!r){let n=X(e,t.tariff.peak,4);return{name:i,active:!0,icon:t.icon??`mdi:cash`,text:n,tone:x_(id),state:`${B(e,`energy_single_price`)} · ${n}`,watched:[]}}let a=r.offPeak?rd:id,o=pn(e,Math.ceil((r.end-n)/6e4)*60),s=B(e,r.offPeak?`energy_off_peak_short`:`energy_peak_short`);return{name:i,active:!0,icon:r.offPeak?t.iconOff??`mdi:weather-night`:t.icon??`mdi:white-balance-sunny`,text:s,suffix:o,tone:x_(a),ring:(n-r.start)/Math.max(1,r.end-r.start),ringColor:Q(a),state:`${B(e,r.offPeak?`energy_off_peak`:`energy_peak`)} · ${B(e,`energy_left`,{d:o})}`,watched:[],ticking:!0}}renderDetails(){return T`<vivid-tariff-timeline
      .hass=${this.hass}
      .tariff=${this._config?.tariff}
      .now=${Date.now()}
    ></vivid-tariff-timeline>`}}),cn({type:T_,name:`Vivid tariff badge`,description:`Off-peak or peak hours right now, and the time left.`,preview:!0,documentationURL:`${R}#vivid-tariff-badge`});var E_=`vivid-energy-badge`,D_=7;z(E_,class extends C_{recent;static getConfigElement(){return Md({fields:S_,validate:e=>b_(E_,e)})}static getStubConfig(){return{tariff:Vu}}resolveConfig(e){return b_(E_,e)}needs(){return{days:10,hourlyDays:0}}buildView(e,t){let n=t.name??B(e,`energy_last_day`),r=t.icon??`mdi:lightning-bolt`,i=this.energy.data,a=i?Hd(i.days,t.tariff,i.today,D_):void 0;this.recent=a;let o=a?.last;if(!o)return{name:n,active:!1,icon:r,state:this.energy.error===`no_source`?B(e,`energy_no_source`):B(e,i?`energy_no_data`:`energy_loading`),watched:[],unavailable:!!(i||this.energy.error)};let s=ud(o.ratio);return{name:n,active:!0,icon:r,text:Z(e,o.kwh,0),trend:o.ratio>1.1?`up`:o.ratio<.9?`down`:void 0,tone:x_(s),state:`${td(e,o.date)} · ${Z(e,o.kwh)} · ${X(e,o.cost)}`,watched:[]}}renderDetails(){return T`<vivid-recent-days .hass=${this.hass} .view=${this.recent}></vivid-recent-days>`}}),cn({type:E_,name:`Vivid energy badge`,description:`The last day of the meter in kWh, colored against the mean of the last seven days.`,preview:!0,documentationURL:`${R}#vivid-energy-badge`});var O_=`0.15.3`;console.info(`%c VIVID CARDS %c v${O_} `,`color: #fff; background: #ff7043; font-weight: 700; border-radius: 4px 0 0 4px; padding: 2px 4px;`,`color: #ff7043; background: #2b2b2b; font-weight: 600; border-radius: 0 4px 4px 0; padding: 2px 4px;`);export{O_ as VERSION};