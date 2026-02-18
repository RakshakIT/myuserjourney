import { storage } from "./storage";

let cachedCodes: { head: string; body: string; ts: number } | null = null;
const CACHE_TTL = 60_000;

function sanitizeId(val: string): string {
  return val.replace(/[^a-zA-Z0-9_\-]/g, "");
}

function escapeHtml(val: string): string {
  return val
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function getTrackingCodeHtml(): Promise<{ head: string; body: string }> {
  if (cachedCodes && Date.now() - cachedCodes.ts < CACHE_TTL) {
    return { head: cachedCodes.head, body: cachedCodes.body };
  }

  const settings = await storage.getSiteSettings();
  if (!settings) return { head: "", body: "" };

  const s = settings as any;
  const headParts: string[] = [];
  const bodyParts: string[] = [];

  if (s.googleTagManagerId) {
    const id = sanitizeId(s.googleTagManagerId);
    headParts.push(`<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');</script>`);
    bodyParts.push(`<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`);
  }

  if (s.googleAnalyticsId) {
    const id = sanitizeId(s.googleAnalyticsId);
    headParts.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');</script>`);
  }

  if (s.googleSearchConsoleCode) {
    const code = escapeHtml(s.googleSearchConsoleCode.trim());
    headParts.push(`<meta name="google-site-verification" content="${code}" />`);
  }

  if (s.googleAdsId) {
    const id = sanitizeId(s.googleAdsId);
    headParts.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('config','${id}');</script>`);
  }

  if (s.facebookPixelId) {
    const id = sanitizeId(s.facebookPixelId);
    headParts.push(`<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');</script>`);
    bodyParts.push(`<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1"/></noscript>`);
  }

  if (s.microsoftAdsId) {
    const id = sanitizeId(s.microsoftAdsId);
    headParts.push(`<script>(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"${id}",enableAutoSpaTracking:true};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");</script>`);
  }

  if (s.tiktokPixelId) {
    const id = sanitizeId(s.tiktokPixelId);
    headParts.push(`<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var i=document.createElement("script");i.type="text/javascript",i.async=!0,i.src=r+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(i,a)};ttq.load('${id}');ttq.page();}(window,document,'ttq');</script>`);
  }

  if (s.linkedinInsightTagId) {
    const id = sanitizeId(s.linkedinInsightTagId);
    headParts.push(`<script type="text/javascript">_linkedin_partner_id="${id}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);</script><script type="text/javascript">(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s);})(window.lintrk);</script>`);
    bodyParts.push(`<noscript><img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=${id}&fmt=gif"/></noscript>`);
  }

  if (s.pinterestTagId) {
    const id = sanitizeId(s.pinterestTagId);
    headParts.push(`<script>!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk('load','${id}');pintrk('page');</script>`);
    bodyParts.push(`<noscript><img height="1" width="1" style="display:none;" alt="" src="https://ct.pinterest.com/v3/?event=init&tid=${id}&noscript=1"/></noscript>`);
  }

  if (s.snapchatPixelId) {
    const id = sanitizeId(s.snapchatPixelId);
    headParts.push(`<script type="text/javascript">(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');snaptr('init','${id}',{});snaptr('track','PAGE_VIEW');</script>`);
  }

  if (s.twitterPixelId) {
    const id = sanitizeId(s.twitterPixelId);
    headParts.push(`<script>!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');twq('config','${id}');</script>`);
  }

  if (s.hotjarSiteId) {
    const id = sanitizeId(s.hotjarSiteId);
    headParts.push(`<script>(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:"${id}",hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');</script>`);
  }

  if (s.clarityProjectId) {
    const id = sanitizeId(s.clarityProjectId);
    headParts.push(`<script type="text/javascript">(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${id}");</script>`);
  }

  if (s.bingVerificationCode) {
    const code = escapeHtml(s.bingVerificationCode.trim());
    headParts.push(`<meta name="msvalidate.01" content="${code}" />`);
  }

  if (s.yandexVerificationCode) {
    const code = escapeHtml(s.yandexVerificationCode.trim());
    headParts.push(`<meta name="yandex-verification" content="${code}" />`);
  }

  if (s.customTrackingHead) {
    headParts.push(s.customTrackingHead);
  }

  if (s.customTrackingBody) {
    bodyParts.push(s.customTrackingBody);
  }

  const result = { head: headParts.join("\n"), body: bodyParts.join("\n") };
  cachedCodes = { ...result, ts: Date.now() };
  return result;
}

export function invalidateTrackingCache() {
  cachedCodes = null;
}

export function injectTrackingCodes(html: string, codes: { head: string; body: string }): string {
  if (codes.head) {
    html = html.replace("</head>", `${codes.head}\n</head>`);
  }
  if (codes.body) {
    html = html.replace("</body>", `${codes.body}\n</body>`);
  }
  return html;
}
