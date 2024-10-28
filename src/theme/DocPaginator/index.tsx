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
              clientID: 'Ov23lilna50sUJEsRr3R',
              clientSecret: '1355fdc76c695064a8d8e4938e984e1a7b31edda',
              owner: 'oceanbase',
              repo: 'oceanbase.github.io',
              admin: ['powerfooI', 'Teingi', 'liboyang0730', 'hnwyllmm'],
              id: md5(location.pathname),
            }}
          />
        )}
      </BrowserOnly>
    </>
  );
}
