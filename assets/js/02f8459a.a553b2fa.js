"use strict";(self.webpackChunkmy_docs_website=self.webpackChunkmy_docs_website||[]).push([[8724],{46222:(n,e,a)=>{a.r(e),a.d(e,{assets:()=>r,contentTitle:()=>i,default:()=>_,frontMatter:()=>s,metadata:()=>c,toc:()=>d});var t=a(74848),o=a(28453);const s={title:"\u524d\u8a00",weight:1},i=void 0,c={id:"user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/commonly_used_sql/introduction",title:"\u524d\u8a00",description:"\u80cc\u666f",source:"@site/docs/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/commonly_used_sql/01_introduction.md",sourceDirName:"user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/commonly_used_sql",slug:"/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/commonly_used_sql/introduction",permalink:"/docs/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/commonly_used_sql/introduction",draft:!1,unlisted:!1,editUrl:"https://github.com/oceanbase/oceanbase.github.io/tree/main/docs/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/commonly_used_sql/01_introduction.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"\u524d\u8a00",weight:1},sidebar:"operation_and_maintenanceSidebar",previous:{title:"\u7248\u672c\u5347\u7ea7\u8def\u5f84",permalink:"/docs/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/version_upgrade_path"},next:{title:"\u96c6\u7fa4\u8fd0\u7ef4",permalink:"/docs/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/commonly_used_sql/cluster_operations"}},r={},d=[{value:"\u80cc\u666f",id:"\u80cc\u666f",level:2},{value:"OceanBase 4.x \u89c6\u56fe\u67e5\u8be2\u6ce8\u610f\u4e8b\u9879",id:"oceanbase-4x-\u89c6\u56fe\u67e5\u8be2\u6ce8\u610f\u4e8b\u9879",level:2}];function m(n){const e={a:"a",h2:"h2",img:"img",p:"p",...(0,o.R)(),...n.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(e.h2,{id:"\u80cc\u666f",children:"\u80cc\u666f"}),"\n",(0,t.jsx)(e.p,{children:"\u300aDBA \u8fdb\u9636\u6559\u7a0b\u300b\u4e2d\u7684\u8fd9\u4e00\u7ae0\u8282\u7684\u5185\u5bb9\uff0c\u6e90\u81ea OceanBase \u793e\u533a\u8bba\u575b\u4e2d\u96ea\u5317\u7684\u5efa\u8bae\uff0c\u8fd9\u4f4d\u7528\u6237\u5e0c\u671b\u6211\u4eec\u80fd\u591f\u5728\u6559\u7a0b\u4e2d\u589e\u52a0\u4e00\u4e9b\u8fd0\u7ef4\u5e38\u7528\u7684 SQL \u6216\u8005\u547d\u4ee4\uff0c\u7528\u4e8e\u66ff\u6362 OCP \u5de5\u5177\u7684\u90e8\u5206\u529f\u80fd\uff0c\u4ee5\u4fbf\u5728\u547d\u4ee4\u884c\u6a21\u5f0f\u4e2d\u5bf9\u6570\u636e\u5e93\u8fdb\u884c\u8fd0\u7ef4\u64cd\u4f5c\u3002"}),"\n",(0,t.jsx)(e.p,{children:(0,t.jsx)(e.img,{alt:"image.png",src:a(40496).A+"",width:"796",height:"207"})}),"\n",(0,t.jsx)(e.p,{children:"\u5728\u8fd9\u7bc7\u6587\u6863\u91cc\uff0c\u6211\u4f1a\u628a OceanBase \u6280\u672f\u652f\u6301\u540c\u5b66\u957f\u671f\u603b\u7ed3\u51fa\u6765\u7684\u8fd0\u7ef4\u5e38\u7528 SQL\uff0c\u505a\u4e00\u4e2a\u7b80\u5355\u7684\u6c47\u603b\u548c\u5206\u4eab\uff0c\u5e0c\u671b\u80fd\u591f\u5bf9\u4e60\u60ef\u4f7f\u7528\u547d\u4ee4\u884c\u5bf9 OceanBase \u8fdb\u884c\u8fd0\u7ef4\u7684\u670b\u53cb\u6709\u6240\u5e2e\u52a9\u3002"}),"\n",(0,t.jsx)(e.p,{children:"\u5927\u5bb6\u53ef\u4ee5\u53c2\u8003\u672c\u7ae0\u5404\u5c0f\u8282\u4e2d\u63d0\u4f9b\u7684\u8fd0\u7ef4 SQL\uff0c\u5927\u90e8\u5206\u90fd\u53ef\u4ee5\u76f4\u63a5\u590d\u5236\u4f7f\u7528\uff0c\u5c11\u90e8\u5206\u53ef\u80fd\u9700\u8981\u6839\u636e\u5b9e\u9645\u9700\u6c42\u4fee\u6539 SQL \u4e2d\u7684\u76f8\u5173\u53c2\u6570\u3002"}),"\n",(0,t.jsxs)(e.p,{children:["\u5982\u679c\u5927\u5bb6\u5728\u5bf9 OceanBase \u7684\u8fd0\u7ef4\u8fc7\u7a0b\u4e2d\uff0c\u8fd8\u6709\u54ea\u4e9b\u5e0c\u671b\u4e86\u89e3\u7684\u5185\u5bb9\uff0c\u6b22\u8fce\u5728",(0,t.jsx)(e.a,{href:"https://ask.oceanbase.com/t/topic/35610431",children:"\u300aOceanBase 4.x \u8fd0\u7ef4\u5f00\u53d1\u624b\u518c\u300b\u7528\u6237\u610f\u89c1\u6536\u96c6"}),"\u8fd9\u4e2a\u5e16\u5b50\u91cc\u7559\u8a00\u8bc4\u8bba\uff0c\u6211\u4eec\u4f1a\u6839\u636e\u5927\u5bb6\u7684\u610f\u89c1\u548c\u5efa\u8bae\u4e0d\u65ad\u5b8c\u5584\u8fd9\u4e2a\u300aDBA \u8fdb\u9636\u6559\u7a0b\u300b\u3002"]}),"\n",(0,t.jsx)(e.h2,{id:"oceanbase-4x-\u89c6\u56fe\u67e5\u8be2\u6ce8\u610f\u4e8b\u9879",children:"OceanBase 4.x \u89c6\u56fe\u67e5\u8be2\u6ce8\u610f\u4e8b\u9879"}),"\n",(0,t.jsx)(e.p,{children:"\u7531\u4e8e OceanBase 4.x \u7edf\u4e00\u63a8\u8350\u4f7f\u7528\u89c6\u56fe\u8fdb\u884c\u5143\u4fe1\u606f\u67e5\u8be2\uff0c\u4f46\u7531\u4e8e\u4e00\u4e9b\u60c5\u51b5\u4e0b\u89c6\u56fe\u67e5\u8be2\u6027\u80fd\u8f83\u5dee\uff0c\u5728\u67e5\u8be2\u65f6\u5c3d\u91cf\u589e\u52a0\u67e5\u8be2\u6761\u4ef6\uff0c\u5982\u589e\u52a0 tenant_id = 1001 \u7b49\u3002"}),"\n",(0,t.jsx)(e.p,{children:"\u7cfb\u7edf\u79df\u6237\u4e0b\uff0c\u67e5\u8be2 oceanbase \u6570\u636e\u5e93 cdb \u89c6\u56fe\u6216 dba \u89c6\u56fe\u3002\u7528\u6237\u79df\u6237\u4e0b\uff0cMySQL \u6a21\u5f0f\u4f7f\u7528 root \u767b\u9646\u67e5\u8be2 oceanbase \u6570\u636e\u5e93\uff0c\u6216 Oracle \u6a21\u5f0f\u4f7f\u7528 SYS \u7528\u6237\u767b\u9646\uff0c\u67e5\u8be2 dba \u89c6\u56fe\u3002"}),"\n",(0,t.jsxs)(e.p,{children:["\u6700\u540e\u518d\u9644\u4e00\u4e2a OceanBase \u7684\u5b98\u65b9\u6587\u6863",(0,t.jsx)(e.a,{href:"https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000000218192",children:"\u300a3.x \u4e0e 4.x \u89c6\u56fe\u53d8\u66f4\u300b"}),"\u3002"]})]})}function _(n={}){const{wrapper:e}={...(0,o.R)(),...n.components};return e?(0,t.jsx)(e,{...n,children:(0,t.jsx)(m,{...n})}):m(n)}},40496:(n,e,a)=>{a.d(e,{A:()=>t});const t=a.p+"assets/images/001-11bda6247016b4ae0594b7ea713a5658.png"},28453:(n,e,a)=>{a.d(e,{R:()=>i,x:()=>c});var t=a(96540);const o={},s=t.createContext(o);function i(n){const e=t.useContext(s);return t.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function c(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(o):n.components||o:i(n.components),t.createElement(s.Provider,{value:e},n.children)}}}]);