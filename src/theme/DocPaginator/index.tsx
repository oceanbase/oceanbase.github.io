import BrowserOnly from '@docusaurus/BrowserOnly';
import DocPaginator from '@theme-original/DocPaginator';
import type DocPaginatorType from '@theme/DocPaginator';
import React from 'react';
import type {WrapperProps} from '@docusaurus/types';
import Comments from '@site/src/components/Comments';

type Props = WrapperProps<typeof DocPaginatorType>;

export default function DocPaginatorWrapper(props: Props): JSX.Element {
  return (
    <>
      <DocPaginator {...props} />
      <BrowserOnly>{() => <Comments />}</BrowserOnly>
    </>
  );
}
