import React from 'react';
import {useLocation} from '@docusaurus/router';
import {useColorMode} from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {applyTrailingSlash} from '@docusaurus/utils-common';
import commentIssues from '@site/src/data/comment-issues.json';
import Utterances from './Utterances';

const discussions: {
  issues: Record<string, number>;
  historicalIssues: Record<string, number[]>;
} = commentIssues;

export default function Comments(): JSX.Element {
  const {pathname} = useLocation();
  const {colorMode} = useColorMode();
  const {siteConfig: {url, baseUrl, trailingSlash}} = useDocusaurusContext();
  // Match Docusaurus SiteMetadata for docs and generated category indexes.
  const canonicalUrl = url + applyTrailingSlash(useBaseUrl(pathname), {baseUrl, trailingSlash});

  return (
    <Utterances
      pathname={pathname}
      canonicalUrl={canonicalUrl}
      issueNumber={discussions.issues[pathname]}
      historicalIssues={discussions.historicalIssues[pathname]}
      colorMode={colorMode}
    />
  );
}
