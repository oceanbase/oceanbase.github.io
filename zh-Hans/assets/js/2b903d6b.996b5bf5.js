"use strict";(self.webpackChunkmy_docs_website=self.webpackChunkmy_docs_website||[]).push([[413],{9145:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>c,default:()=>p,frontMatter:()=>r,metadata:()=>i,toc:()=>l});var o=t(4848),s=t(8453);const r={title:"\u90e8\u7f72\u65b9\u5f0f",weight:1},c=void 0,i={id:"deploy_oceanbase/deploy_method",title:"\u90e8\u7f72\u65b9\u5f0f",description:"\u76ee\u524d OB \u7684\u90e8\u7f72\u65b9\u5f0f\u4e3b\u8981\u6709\u4e09\u79cd\uff0c\u624b\u52a8\u90e8\u7f72\u3001ODB \u90e8\u7f72\u4ee5\u53ca OCP \u90e8\u7f72\u3002",source:"@site/docs/deploy_oceanbase/deploy_method.md",sourceDirName:"deploy_oceanbase",slug:"/deploy_oceanbase/deploy_method",permalink:"/zh-Hans/docs/deploy_oceanbase/deploy_method",draft:!1,unlisted:!1,editUrl:"https://github.com/oceanbase/oceanbase.github.io/tree/main/docs/deploy_oceanbase/deploy_method.md",tags:[],version:"current",frontMatter:{title:"\u90e8\u7f72\u65b9\u5f0f",weight:1},sidebar:"legacySidebar",previous:{title:"\u6982\u89c8",permalink:"/zh-Hans/docs/about_oceanbase/overview"},next:{title:"\u901a\u8fc7 OBD \u90e8\u7f72\u96c6\u7fa4",permalink:"/zh-Hans/docs/deploy_oceanbase/obd_deploy"}},d={},l=[];function a(e){const n={li:"li",ol:"ol",p:"p",strong:"strong",...(0,s.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n.p,{children:"\u76ee\u524d OB \u7684\u90e8\u7f72\u65b9\u5f0f\u4e3b\u8981\u6709\u4e09\u79cd\uff0c\u624b\u52a8\u90e8\u7f72\u3001ODB \u90e8\u7f72\u4ee5\u53ca OCP \u90e8\u7f72\u3002"}),"\n",(0,o.jsx)(n.p,{children:(0,o.jsx)(n.strong,{children:"\u624b\u52a8\u90e8\u7f72\uff1a"})}),"\n",(0,o.jsx)(n.p,{children:"\u9700\u8981\u81ea\u5df1\u4e0b\u8f7d RPM \u5305\uff0c\u5e76\u4e14\u6307\u5b9a\u914d\u7f6e\u542f\u52a8\u3002\u624b\u52a8\u90e8\u7f72\u5bf9 OB \u7684\u719f\u6089\u7a0b\u5ea6\u8981\u6c42\u6bd4\u8f83\u9ad8\uff0c\u914d\u7f6e\u53d8\u66f4\u9700\u8981\u4fee\u6539\u542f\u52a8\u547d\u4ee4\uff0c\u5426\u5219\u542f\u52a8\u4f1a\u6709\u5f02\u5e38\uff0c\u4e0d\u63a8\u8350\u3002"}),"\n",(0,o.jsx)(n.p,{children:(0,o.jsx)(n.strong,{children:"OBD\u90e8\u7f72\uff1a"})}),"\n",(0,o.jsxs)(n.p,{children:["OBD \u662f OceanBase \u96c6\u7fa4\u5b89\u88c5\u90e8\u7f72\u5de5\u5177\uff0c\u53ef\u4ee5\u901a\u8fc7\u547d\u4ee4\u884c\u6216\u767d\u5c4f\u754c\u9762\u7684\u65b9\u5f0f\u6765\u90e8\u7f72 OB \u96c6\u7fa4\u3002\u64cd\u4f5c\u7b80\u5355\uff0c",(0,o.jsx)(n.strong,{children:"\u63a8\u8350\u4f7f\u7528"}),"\u3002"]}),"\n",(0,o.jsx)(n.p,{children:(0,o.jsx)(n.strong,{children:"OCP\u90e8\u7f72\uff1a"})}),"\n",(0,o.jsxs)(n.p,{children:["OceanBase \u4e91\u5e73\u53f0\uff0c\u53ef\u4ee5\u5bf9 OB \u96c6\u7fa4\u8fdb\u884c\u7ba1\u7406\uff0c\u5305\u62ec\u5b89\u88c5\u90e8\u7f72\u3001\u76d1\u63a7\u544a\u8b66\u3001\u5907\u4efd\u5f52\u6863\u7b49\u7b49\u3002\u64cd\u4f5c\u7b80\u5355\uff0c",(0,o.jsx)(n.strong,{children:"\u5f3a\u70c8\u63a8\u8350\u4f7f\u7528"}),"\u3002"]}),"\n",(0,o.jsx)(n.p,{children:(0,o.jsx)(n.strong,{children:"OBD \u548c OCP \u7684\u533a\u522b\u5bf9\u6bd4\uff1a"})}),"\n",(0,o.jsxs)(n.ol,{children:["\n",(0,o.jsx)(n.li,{children:"\u96c6\u7fa4\u7ba1\u7406\u80fd\u529b\uff0cOBD\u4e3b\u8981\u529f\u80fd\u662f\u5b89\u88c5\u90e8\u7f72\u3001\u7b80\u5355\u7ef4\u62a4\uff1bOCP \u53ef\u4ee5\u5728\u8fd9\u4e2a\u57fa\u7840\u4e0a\u5b9e\u73b0\u66f4\u591a\u7684\u7ba1\u7406\u80fd\u529b\uff0c\u5982\u679c\u662f\u7ebf\u4e0a\u96c6\u7fa4\uff0c\u5efa\u8bae\u4f7f\u7528 OCP\u3002"}),"\n",(0,o.jsx)(n.li,{children:"\u8d44\u6e90\u5360\u7528\uff0cOBD\u66f4\u52a0\u7684\u8f7b\u91cf\uff1bOCP \u56e0\u4e3a\u76d1\u63a7\u3001\u7ba1\u7406\u7b49\u80fd\u529b\uff0c\u9700\u8981\u72ec\u7acb\u7684\u5143\u6570\u636e\u5e93\u548c\u76d1\u63a7\u6570\u636e\u5e93\uff0c\u5e76\u4e14\u4e0d\u5efa\u8bae\u8ddf\u4e1a\u52a1\u96c6\u7fa4\u653e\u5230\u4e00\u8d77\u3002\u6240\u4ee5\u9700\u8981\u521b\u5efa\u72ec\u7acb\u7684 OCP \u96c6\u7fa4\u3002\u5982\u679c\u9700\u8981\u5feb\u901f\u90e8\u7f72\uff0c\u5efa\u8bae\u4f7f\u7528 OBD\u3002"}),"\n"]}),"\n",(0,o.jsx)(n.p,{children:"\u5f53\u7136\uff0cOBD \u90e8\u7f72\u7684\u96c6\u7fa4\u4e5f\u53ef\u4ee5\u901a\u8fc7 OCP \u6765\u7ba1\u7406\uff0c\u4e0d\u8fc7\u63a5\u7ba1\u8981\u6c42\u662f\u7528 admin \u7528\u6237\u90e8\u7f72\u7684\u96c6\u7fa4\u4ee5\u53ca\u53ea\u80fd\u63a5\u7ba1 OBServer\u3002"})]})}function p(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,o.jsx)(n,{...e,children:(0,o.jsx)(a,{...e})}):a(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>c,x:()=>i});var o=t(6540);const s={},r=o.createContext(s);function c(e){const n=o.useContext(r);return o.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:c(e.components),o.createElement(r.Provider,{value:n},e.children)}}}]);