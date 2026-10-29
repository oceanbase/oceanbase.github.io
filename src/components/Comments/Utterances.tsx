import React, {useEffect, useRef, useState} from 'react';
import {createUtterancesUrl, utterancesOrigin, utterancesRepository} from './utterancesUrl';

type Props = {
  pathname: string;
  canonicalUrl: string;
  issueNumber?: number;
  historicalIssues?: number[];
  colorMode: 'light' | 'dark';
};

type FrameProps = Omit<Props, 'historicalIssues'>;

function UtterancesFrame({pathname, canonicalUrl, issueNumber, colorMode}: FrameProps): JSX.Element {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const preparedSource = useRef<string>();
  const [source, setSource] = useState<string>();
  const [height, setHeight] = useState(250);
  const synchronizeThemeRef = useRef<(() => void) | null>(null);
  const theme = colorMode === 'dark' ? 'github-dark' : 'github-light';
  const currentTheme = useRef(theme);
  currentTheme.current = theme;

  useEffect(() => {
    // StrictMode replays effects; consume an OAuth callback only once per mount.
    if (preparedSource.current) {
      setSource(preparedSource.current);
      return;
    }

    const expectedCanonical = new URL(canonicalUrl).href;
    const prepareSource = () => {
      const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (canonical?.href !== expectedCanonical) return;
      preparedSource.current = createUtterancesUrl({pathname, issueNumber, theme: currentTheme.current});
      observer.disconnect();
      setSource(preparedSource.current);
    };
    // Helmet defers SPA metadata updates. MutationObserver runs after its whole
    // commit, so canonical/title/description all belong to this route.
    const observer = new window.MutationObserver(prepareSource);
    observer.observe(document.head, {childList: true, subtree: true, attributes: true, characterData: true});
    prepareSource();
    return () => observer.disconnect();
  }, [pathname, canonicalUrl, issueNumber]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!source || !frame) return;
    let ready = false;
    let appliedTheme: string | undefined;
    const synchronizeTheme = () => {
      if (!frame.contentWindow || (ready && appliedTheme === currentTheme.current)) return;
      frame.contentWindow.postMessage(
        {type: 'set-theme', theme: currentTheme.current},
        utterancesOrigin,
      );
      if (ready) appliedTheme = currentTheme.current;
    };
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== utterancesOrigin ||
        !frame.contentWindow ||
        event.source !== frame.contentWindow ||
        event.data?.type !== 'resize' ||
        typeof event.data.height !== 'number' ||
        !Number.isFinite(event.data.height) ||
        event.data.height <= 0
      ) return;

      setHeight(event.data.height);
      // Utterances starts measuring after its theme listener is ready.
      ready = true;
      synchronizeTheme();
    };

    synchronizeThemeRef.current = synchronizeTheme;
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      if (synchronizeThemeRef.current === synchronizeTheme) synchronizeThemeRef.current = null;
    };
  }, [source]);

  useEffect(() => {
    synchronizeThemeRef.current?.();
  }, [theme, source]);

  return (
    <div
      className="utterances"
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: 760,
        margin: '0 auto',
        height,
      }}>
      {source && (
        <iframe
          ref={frameRef}
          className="utterances-frame"
          title="Comments"
          src={source}
          scrolling="no"
          loading="eager"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            width: 1,
            minWidth: '100%',
            maxWidth: '100%',
            height: '100%',
            border: 0,
            colorScheme: 'light',
          }}
        />
      )}
    </div>
  );
}

export default function Utterances({
  pathname,
  canonicalUrl,
  issueNumber,
  historicalIssues = [],
  colorMode,
}: Props): JSX.Element {
  return (
    <section className="margin-top--xl" aria-label="评论">
      {historicalIssues.map((issue) => (
        <p key={issue}>
          <a
            href={`https://github.com/${utterancesRepository}/issues/${issue}`}
            target="_blank"
            rel="noopener noreferrer">
            历史评论 #{issue}
          </a>
        </p>
      ))}
      <UtterancesFrame
        key={`${pathname}:${canonicalUrl}:${issueNumber ?? ''}`}
        pathname={pathname}
        canonicalUrl={canonicalUrl}
        issueNumber={issueNumber}
        colorMode={colorMode}
      />
    </section>
  );
}
