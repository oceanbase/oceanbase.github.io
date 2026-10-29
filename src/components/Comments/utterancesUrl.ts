export const utterancesOrigin = 'https://utteranc.es';
export const utterancesRepository = 'oceanbase/oceanbase.github.io';

type Options = {
  pathname: string;
  issueNumber?: number;
  theme: string;
};

export function createUtterancesUrl({pathname, issueNumber, theme}: Options): string {
  // Preserve the metadata/session protocol without client.js's global styles/listener:
  // https://github.com/utterance/utterances/blob/master/src/client.ts
  // https://github.com/utterance/utterances/blob/master/src/page-attributes.ts
  const pageUrl = new URL(window.location.href);
  pageUrl.pathname = pathname;
  let session = pageUrl.searchParams.get('utterances') || '';
  if (session) {
    try {
      window.localStorage.setItem('utterances-session', session);
    } catch {
      // A blocked storage API must not discard this OAuth return session.
    }
    pageUrl.searchParams.delete('utterances');
    window.history.replaceState(window.history.state, document.title, pageUrl.href);
  } else {
    try {
      session = window.localStorage.getItem('utterances-session') || '';
    } catch {
      // Anonymous comments still load when browser storage is unavailable.
    }
  }

  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  let description = descriptionMeta?.content || '';
  const encodedLength = encodeURIComponent(description).length;
  if (encodedLength > 1000) {
    description = description.slice(0, Math.floor(description.length * 1000 / encodedLength));
  }
  const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"], meta[name="og:title"]');
  const params = new URLSearchParams({
    repo: utterancesRepository,
    theme,
    origin: pageUrl.origin,
    url: canonical?.href || `${pageUrl.origin}${pageUrl.pathname}${pageUrl.search}`,
    pathname: pathname.length < 2 ? 'index' : pathname.slice(1).replace(/\.\w+$/, ''),
    title: document.title,
    description,
    'og:title': ogTitle?.content || '',
    session,
  });
  if (issueNumber !== undefined) {
    params.set('issue-number', String(issueNumber));
  } else {
    params.set('issue-term', 'pathname');
  }
  return `${utterancesOrigin}/utterances.html?${params}`;
}
