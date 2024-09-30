import 'gitalk/dist/gitalk.css';

import BrowserOnly from '@docusaurus/BrowserOnly';
import DocPaginator from '@theme-original/DocPaginator';
import type DocPaginatorType from '@theme/DocPaginator';
import GitalkComponent from 'gitalk/dist/gitalk-component';
import React from 'react';
import type { WrapperProps } from '@docusaurus/types';
import {md5} from 'js-md5';

type Props = WrapperProps<typeof DocPaginatorType>;

export default function DocPaginatorWrapper(props: Props): JSX.Element {
  return (
    <>
      <DocPaginator {...props} />
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => (
          <GitalkComponent
            options={{
              clientID: 'Ov23li5A5dqaNIrrusQQ',
              clientSecret: 'c76f994e086901344abf11b597afbaa3e947e714',
              repo: 'docs-playground',
              owner: 'powerfooI',
              admin: ['powerfooI'],
              id: md5(location.pathname),
            }}
          />
        )}
      </BrowserOnly>
    </>
  );
}
