"use strict";(self.webpackChunkmy_docs_website=self.webpackChunkmy_docs_website||[]).push([[5724],{1850:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>o,default:()=>m,frontMatter:()=>r,metadata:()=>a,toc:()=>l});var s=t(4848),i=t(8453);const r={title:"\u96c6\u7fa4\u5e38\u7528SQL",weight:3},o="\u96c6\u7fa4\u72b6\u6001\u5e38\u7528 SQL",a={id:"operation_maintenance/common_sql/cluster",title:"\u96c6\u7fa4\u5e38\u7528SQL",description:"- \u67e5\u770b\u96c6\u7fa4\u4e2d\u5404 OBServer \u8282\u70b9\u72b6\u6001\u3001\u542f\u52a8\u65f6\u95f4\u3001\u7248\u672c\u7b49",source:"@site/docs/operation_maintenance/common_sql/cluster.md",sourceDirName:"operation_maintenance/common_sql",slug:"/operation_maintenance/common_sql/cluster",permalink:"/zh-Hans/docs/operation_maintenance/common_sql/cluster",draft:!1,unlisted:!1,editUrl:"https://github.com/oceanbase/oceanbase.github.io/tree/main/docs/operation_maintenance/common_sql/cluster.md",tags:[],version:"current",frontMatter:{title:"\u96c6\u7fa4\u5e38\u7528SQL",weight:3},sidebar:"legacySidebar",previous:{title:"\u5e38\u7528\u53c2\u6570\u914d\u7f6e",permalink:"/zh-Hans/docs/operation_maintenance/common_parameter"},next:{title:"\u96c6\u7fa4\u8d44\u6e90\u5e38\u7528SQL",permalink:"/zh-Hans/docs/operation_maintenance/common_sql/cluster_resource"}},c={},l=[];function d(e){const n={code:"code",h1:"h1",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.h1,{id:"\u96c6\u7fa4\u72b6\u6001\u5e38\u7528-sql",children:(0,s.jsx)(n.strong,{children:"\u96c6\u7fa4\u72b6\u6001\u5e38\u7528 SQL"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"\u67e5\u770b\u96c6\u7fa4\u4e2d\u5404 OBServer \u8282\u70b9\u72b6\u6001\u3001\u542f\u52a8\u65f6\u95f4\u3001\u7248\u672c\u7b49"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-sql",children:"select * from DBA_OB_SERVERS;\n"})}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"\u67e5\u770b\u5404\u4e2a Zone \u72b6\u6001\u3001IDC\u3001Region\u3001TYPE \u7b49\u4fe1\u606f"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-sql",children:"select * from DBA_OB_ZONES;\n"})}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{src:"https://intranetproxy.alipay.com/skylark/lark/0/2023/png/65656351/1684296013159-3f43260f-756c-4d58-bee5-d2d8cde8327e.png#clientId=uab26b267-0ee0-4&from=paste&height=136&id=u271a5307&originHeight=272&originWidth=1526&originalType=binary&ratio=2&rotation=0&showTitle=false&size=61376&status=done&style=none&taskId=uacdcf21f-4801-47a4-b253-da789f62cf3&title=&width=763",alt:"image.png"})}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"\u67e5\u770b\u6570\u636e\u5e93\u7248\u672c"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-sql",children:"show variables like 'version_comment';\n"})}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{src:"https://intranetproxy.alipay.com/skylark/lark/0/2023/png/65656351/1684295609226-259e79a9-ef3b-451f-9087-a460103e174a.png#clientId=uab26b267-0ee0-4&from=paste&height=104&id=u4ad3eb19&originHeight=208&originWidth=1890&originalType=binary&ratio=2&rotation=0&showTitle=false&size=34240&status=done&style=none&taskId=ubbeb30c4-8673-40fa-b428-f9f7acf3d8c&title=&width=945",alt:"image.png"})}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"\u67e5\u770b RootService \u4e3b\u8282\u70b9"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-sql",children:"select svr_ip as RootService from DBA_OB_SERVERS where with_rootserver='yes';\n"})}),"\n"]}),"\n"]})]})}function m(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(d,{...e})}):d(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>o,x:()=>a});var s=t(6540);const i={},r=s.createContext(i);function o(e){const n=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:o(e.components),s.createElement(r.Provider,{value:n},e.children)}}}]);