"use strict";(self.webpackChunkmy_docs_website=self.webpackChunkmy_docs_website||[]).push([[8973],{13982:(n,e,s)=>{s.r(e),s.d(e,{assets:()=>l,contentTitle:()=>t,default:()=>o,frontMatter:()=>i,metadata:()=>r,toc:()=>h});var a=s(74848),c=s(28453);const i={title:"HTAP \u7cfb\u7edf\u67b6\u6784\u8bbe\u8ba1",weight:4},t=void 0,r={id:"user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_03_htap/htap_best_practices",title:"HTAP \u7cfb\u7edf\u67b6\u6784\u8bbe\u8ba1",description:"\u8bf4\u660e\uff1a\u76ee\u524d DBA \u8fdb\u9636\u6559\u7a0b\u7684\u5185\u5bb9\u6682\u65f6\u5bf9\u5e94\u7684\u662f OceanBase \u793e\u533a\u7248\u672c\uff0c\u672c\u5c0f\u8282\u7684\u67b6\u6784\u90e8\u5206\u4e0d\u6d89\u53ca\u5546\u4e1a\u7248\u7684\u4ef2\u88c1\u526f\u672c\u529f\u80fd\u3002\u793e\u533a\u7248\u548c\u5546\u4e1a\u7248\u7684\u80fd\u529b\u533a\u522b\u8be6\u89c1\uff1a\u5b98\u7f51\u94fe\u63a5\u3002",source:"@site/docs/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_03_htap/04_htap_best_practices.md",sourceDirName:"user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_03_htap",slug:"/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_03_htap/htap_best_practices",permalink:"/docs/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_03_htap/htap_best_practices",draft:!1,unlisted:!1,editUrl:"https://github.com/oceanbase/oceanbase.github.io/tree/main/docs/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_03_htap/04_htap_best_practices.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{title:"HTAP \u7cfb\u7edf\u67b6\u6784\u8bbe\u8ba1",weight:4},sidebar:"operation_and_maintenanceSidebar",previous:{title:"\u8bfb\u5199\u5206\u79bb\u7b56\u7565\u53ca\u67b6\u6784\u8bbe\u8ba1",permalink:"/docs/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_03_htap/read_write_separation_best_practices"},next:{title:"SQL \u6027\u80fd\u8bca\u65ad\u548c\u8c03\u4f18",permalink:"/docs/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_03_htap/performance_tuning"}},l={},h=[{value:"\u5b9e\u65f6\u62a5\u8868\u3001\u5b9e\u65f6\u98ce\u63a7\u4e1a\u52a1\u67b6\u6784",id:"\u5b9e\u65f6\u62a5\u8868\u5b9e\u65f6\u98ce\u63a7\u4e1a\u52a1\u67b6\u6784",level:2},{value:"\u51c6\u5b9e\u65f6\u51b3\u7b56\u5206\u6790\u4e1a\u52a1\u67b6\u6784\uff1a",id:"\u51c6\u5b9e\u65f6\u51b3\u7b56\u5206\u6790\u4e1a\u52a1\u67b6\u6784",level:2},{value:"\u8f7b\u91cf\u7ea7\u6570\u4ed3\u4e1a\u52a1\u67b6\u6784",id:"\u8f7b\u91cf\u7ea7\u6570\u4ed3\u4e1a\u52a1\u67b6\u6784",level:2},{value:"OceanBase \u5728\u5b9e\u65f6\u6570\u4ed3\u4e1a\u52a1\u8bbe\u8ba1\u4e2d\u7684\u4f4d\u7f6e\u53ca\u4f5c\u7528",id:"oceanbase-\u5728\u5b9e\u65f6\u6570\u4ed3\u4e1a\u52a1\u8bbe\u8ba1\u4e2d\u7684\u4f4d\u7f6e\u53ca\u4f5c\u7528",level:2}];function d(n){const e={a:"a",blockquote:"blockquote",h2:"h2",img:"img",li:"li",p:"p",strong:"strong",ul:"ul",...(0,c.R)(),...n.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)(e.blockquote,{children:["\n",(0,a.jsxs)(e.p,{children:["\u8bf4\u660e\uff1a\u76ee\u524d DBA \u8fdb\u9636\u6559\u7a0b\u7684\u5185\u5bb9\u6682\u65f6\u5bf9\u5e94\u7684\u662f OceanBase \u793e\u533a\u7248\u672c\uff0c\u672c\u5c0f\u8282\u7684\u67b6\u6784\u90e8\u5206\u4e0d\u6d89\u53ca\u5546\u4e1a\u7248\u7684\u4ef2\u88c1\u526f\u672c\u529f\u80fd\u3002\u793e\u533a\u7248\u548c\u5546\u4e1a\u7248\u7684\u80fd\u529b\u533a\u522b\u8be6\u89c1\uff1a",(0,a.jsx)(e.a,{href:"https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001428510",children:"\u5b98\u7f51\u94fe\u63a5"}),"\u3002"]}),"\n"]}),"\n",(0,a.jsx)(e.p,{children:"OceanBase \u4ece 4.3.3 \u7248\u672c\u5f00\u59cb\uff0c\u652f\u6301\u4e86\u53ea\u8bfb\u5217\u5b58\u526f\u672c\uff0c\u5728\u4e0a\u4e00\u5c0f\u8282\u8bfb\u5199\u5206\u79bb\u67b6\u6784\u7684\u57fa\u7840\u4e0a\uff0c\u6211\u4eec\u7ee7\u7eed\u6765\u770b\u4e0b\u5229\u7528\u5217\u5b58\uff0c\u53ef\u4ee5\u7ee7\u7eed\u5bf9\u67b6\u6784\u8fdb\u884c\u54ea\u4e9b\u4f18\u5316\u3002"}),"\n",(0,a.jsx)(e.h2,{id:"\u5b9e\u65f6\u62a5\u8868\u5b9e\u65f6\u98ce\u63a7\u4e1a\u52a1\u67b6\u6784",children:"\u5b9e\u65f6\u62a5\u8868\u3001\u5b9e\u65f6\u98ce\u63a7\u4e1a\u52a1\u67b6\u6784"}),"\n",(0,a.jsxs)(e.ul,{children:["\n",(0,a.jsxs)(e.li,{children:["\n",(0,a.jsx)(e.p,{children:(0,a.jsx)(e.strong,{children:(0,a.jsx)("font",{color:"red",children:"\u9002\u7528\u573a\u666f\uff1a\u4ee5 TP \u4e1a\u52a1\u4e3a\u4e3b\uff0c\u867d\u7136\u6709\u4e00\u90e8\u5206 AP \u5b9e\u65f6\u5206\u6790\u9700\u6c42\uff0c\u4f46\u6574\u4f53\u9700\u6c42\u4e0d\u5927\u3002"})})}),"\n"]}),"\n",(0,a.jsxs)(e.li,{children:["\n",(0,a.jsx)(e.p,{children:"\u67b6\u6784\u8bbe\u8ba1\u601d\u8def\uff1a\u63a8\u8350\u4f7f\u7528\u884c\u5b58\u526f\u672c\uff0c\u5e76\u5728\u884c\u5b58\u526f\u672c\u4e0a\u521b\u5efa\u5217\u5b58\u7d22\u5f15\u3002"}),"\n"]}),"\n",(0,a.jsxs)(e.li,{children:["\n",(0,a.jsxs)(e.p,{children:["\u521b\u5efa\u5217\u5b58\u7d22\u5f15\u7684\u65b9\u5f0f\u8be6\u89c1\uff1a",(0,a.jsx)(e.a,{href:"https://open.oceanbase.com/blog/11547010336",children:"\u300a\u8fdb\u5165 OLAP \u9886\u57df\u7684\u5165\u573a\u5238 \u2014\u2014 \u5217\u5b58\u5f15\u64ce\u300b"}),"\u3002"]}),"\n"]}),"\n"]}),"\n",(0,a.jsxs)(e.blockquote,{children:["\n",(0,a.jsx)(e.p,{children:"\u8bf4\u660e\uff1a"}),"\n",(0,a.jsx)(e.p,{children:"\u901a\u8fc7\u5217\u5b58\u7d22\u5f15\uff0c\u53ef\u4ee5\u5b9e\u73b0\u5728\u540c\u4e00\u4efd\u6570\u636e\u4e0a\u65e2\u6709\u884c\u5b58\u7528\u4e8e TP\uff0c\u4e5f\u6709\u5217\u5b58\u7528\u4e8e AP\u3002"}),"\n",(0,a.jsx)(e.p,{children:"\u76f8\u6bd4\u4f7f\u7528\u884c\u3001\u5217\u4e24\u4efd\u526f\u672c\u7684\u4f18\u52bf\u662f\uff0c\u53ef\u4ee5\u53ea\u5728\u9700\u8981\u8fdb\u884c AP \u8ba1\u7b97\u7684\u7279\u5b9a\u5217\u4e0a\u521b\u5efa\u7d22\u5f15\uff0c\u65e2\u80fd\u591f\u8fbe\u5230\u52a0\u901f AP \u67e5\u8be2\u7684\u76ee\u7684\uff0c\u4e5f\u80fd\u591f\u6700\u5927\u7a0b\u5ea6\u7684\u964d\u4f4e\u5b58\u50a8\u6210\u672c\u3002"}),"\n"]}),"\n",(0,a.jsx)(e.p,{children:(0,a.jsx)(e.img,{alt:"image.png",src:s(4924).A+"",width:"1098",height:"580"})}),"\n",(0,a.jsx)(e.h2,{id:"\u51c6\u5b9e\u65f6\u51b3\u7b56\u5206\u6790\u4e1a\u52a1\u67b6\u6784",children:"\u51c6\u5b9e\u65f6\u51b3\u7b56\u5206\u6790\u4e1a\u52a1\u67b6\u6784\uff1a"}),"\n",(0,a.jsxs)(e.ul,{children:["\n",(0,a.jsxs)(e.li,{children:["\n",(0,a.jsx)(e.p,{children:(0,a.jsx)(e.strong,{children:(0,a.jsx)("font",{color:"red",children:"\u9002\u7528\u573a\u666f\uff1a\u4ee5 TP \u4e1a\u52a1\u4e3a\u4e3b\uff0c\u540c\u65f6\u4e5f\u6709\u8f83\u591a AP \u9700\u6c42\uff0c\u4e14\u4e0d\u80fd\u63a5\u53d7\u4e0a\u9762\u8fd9\u79cd\u5229\u7528 cgroup \u8d44\u6e90\u7ec4\u7684\u65b9\u5f0f\u8fdb\u884c\u8d44\u6e90\u9694\u79bb\u3002"})})}),"\n"]}),"\n",(0,a.jsxs)(e.li,{children:["\n",(0,a.jsx)(e.p,{children:"\u67b6\u6784\u8bbe\u8ba1\u601d\u8def\uff1a\u53ef\u4ee5\u901a\u8fc7 \u201c\u53ea\u8bfb\u5217\u5b58\u526f\u672c\u201d\uff0c\u5b9e\u73b0 zone \u7ea7\u522b\u7684\u786c\u9694\u79bb\u3002"}),"\n"]}),"\n",(0,a.jsxs)(e.li,{children:["\n",(0,a.jsxs)(e.p,{children:["\u4f7f\u7528\u53ea\u8bfb\u5217\u5b58\u526f\u672c\u7684\u6ce8\u610f\u4e8b\u9879\u8be6\u89c1\uff1a",(0,a.jsx)(e.a,{href:"https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001431875",children:"\u5b98\u7f51\u6587\u6863"}),"\u3002"]}),"\n"]}),"\n"]}),"\n",(0,a.jsxs)(e.blockquote,{children:["\n",(0,a.jsx)(e.p,{children:"\u8bf4\u660e\uff1a"}),"\n",(0,a.jsx)(e.p,{children:"\u53ea\u8bfb\u5217\u5b58\u526f\u672c\u662f\u521a\u521a\uff082024.10.24\uff09\u53d1\u5e03\u7684 4.3.3 \u7248\u672c\u65b0\u589e\u7684\u7279\u6027\uff0c\u63a8\u8350\u5148\u5728 POC \u6d4b\u8bd5\u73af\u5883\u4e2d\u4f7f\u7528\uff0c\u4e0d\u63a8\u8350\u76f4\u63a5\u4e0a\u751f\u4ea7\u73af\u5883\uff0c\u4ee5\u514d\u5f71\u54cd\u7cfb\u7edf\u7a33\u5b9a\u6027\u3002"}),"\n"]}),"\n",(0,a.jsx)(e.p,{children:(0,a.jsx)(e.img,{alt:"image.png",src:s(12503).A+"",width:"1047",height:"574"})}),"\n",(0,a.jsx)(e.h2,{id:"\u8f7b\u91cf\u7ea7\u6570\u4ed3\u4e1a\u52a1\u67b6\u6784",children:"\u8f7b\u91cf\u7ea7\u6570\u4ed3\u4e1a\u52a1\u67b6\u6784"}),"\n",(0,a.jsxs)(e.ul,{children:["\n",(0,a.jsxs)(e.li,{children:["\n",(0,a.jsx)(e.p,{children:(0,a.jsx)(e.strong,{children:(0,a.jsx)("font",{color:"red",children:"\u9002\u7528\u573a\u666f\uff1a\u4ee5 AP \u4e1a\u52a1\u4e3a\u4e3b\uff0c\u4e14\u4e1a\u52a1\u4e2d\u4e0d\u4ec5\u4ec5\u6709\u5927\u67e5\u8be2\uff0c\u8fd8\u6709\u5927\u91cf\u5c0f\u67e5\u8be2\u3002"})})}),"\n"]}),"\n",(0,a.jsxs)(e.li,{children:["\n",(0,a.jsx)(e.p,{children:"\u67b6\u6784\u8bbe\u8ba1\u601d\u8def\uff1a\u4e3b\u8868\u63a8\u8350\u4f7f\u7528\u5217\u5b58\u8868\uff0c\u5e76\u5728\u5217\u5b58\u8868\u4e0a\u521b\u5efa\u884c\u5b58\u7d22\u5f15\u3002"}),"\n"]}),"\n",(0,a.jsxs)(e.li,{children:["\n",(0,a.jsxs)(e.p,{children:["\u5217\u5b58\u8bed\u6cd5\u8fd8\u662f\u8be6\u89c1\uff1a",(0,a.jsx)(e.a,{href:"https://open.oceanbase.com/blog/11547010336",children:"\u300a\u8fdb\u5165 OLAP \u9886\u57df\u7684\u5165\u573a\u5238 \u2014\u2014 \u5217\u5b58\u5f15\u64ce\u300b"}),"\u3002"]}),"\n"]}),"\n"]}),"\n",(0,a.jsxs)(e.blockquote,{children:["\n",(0,a.jsx)(e.p,{children:"\u8bf4\u660e\uff1a"}),"\n",(0,a.jsx)(e.p,{children:"\u5217\u5b58\u8868\u7684\u76ee\u7684\u662f\u52a0\u901f AP \u590d\u6742\u67e5\u8be2\uff0c\u884c\u5b58\u7d22\u5f15\u7684\u76ee\u7684\u662f\u52a0\u901f\u70b9\u67e5\u3002"}),"\n",(0,a.jsx)(e.p,{children:'"\u8f7b\u91cf\u6570\u4ed3" \u4e0d\u662f \u201c\u79bb\u7ebf\u6570\u4ed3\u201d\uff0c\u542b\u4e49\u662f\uff1a\u4e0d\u53ea\u6709\u590d\u6742\u67e5\u8be2\uff0c\u4e5f\u6709\u7b80\u5355\u548c\u8f7b\u91cf\u7684\u70b9\u67e5\u3002'}),"\n"]}),"\n",(0,a.jsx)(e.p,{children:(0,a.jsx)(e.img,{alt:"image.png",src:s(29358).A+"",width:"1242",height:"595"})}),"\n",(0,a.jsx)(e.h2,{id:"oceanbase-\u5728\u5b9e\u65f6\u6570\u4ed3\u4e1a\u52a1\u8bbe\u8ba1\u4e2d\u7684\u4f4d\u7f6e\u53ca\u4f5c\u7528",children:"OceanBase \u5728\u5b9e\u65f6\u6570\u4ed3\u4e1a\u52a1\u8bbe\u8ba1\u4e2d\u7684\u4f4d\u7f6e\u53ca\u4f5c\u7528"}),"\n",(0,a.jsx)(e.p,{children:"\u9488\u5bf9\u4e0a\u9762\u7b2c\u4e09\u79cd\u6570\u4ed3\u573a\u666f\uff0c\u6211\u4eec\u8fd9\u91cc\u505a\u4e00\u4e9b\u7b80\u5355\u7684\u5c55\u5f00\uff0c\u4ecb\u7ecd\u4e0b OceanBase \u5728\u5b9e\u65f6\u6570\u4ed3\u4e1a\u52a1\u8bbe\u8ba1\u4e2d\u9002\u5408\u7684\u4f4d\u7f6e\u53ca\u4f5c\u7528\u3002"}),"\n",(0,a.jsx)(e.p,{children:"\u5728\u6570\u636e\u4ed3\u5e93\uff08Data Warehouse\uff09\u7684\u8bbe\u8ba1\u4e2d\uff0cODS\u3001DWD\u3001DWS \u548c ADS \u662f\u5e38\u89c1\u7684\u5206\u5c42\u67b6\u6784\u4e2d\u7684\u4e0d\u540c\u5c42\u6b21\u3002\u8fd9\u4e9b\u5c42\u6b21\u5404\u81ea\u6709\u4e0d\u540c\u7684\u529f\u80fd\u548c\u7528\u9014\uff0c\u6709\u52a9\u4e8e\u66f4\u597d\u5730\u7ec4\u7ec7\u548c\u7ba1\u7406\u6570\u636e\uff0c\u652f\u6301\u9ad8\u6548\u7684\u6570\u636e\u5904\u7406\u548c\u5206\u6790\u3002"}),"\n",(0,a.jsx)(e.p,{children:"\u5148\u7b80\u5355\u89e3\u91ca\u4e00\u4e0b\u8fd9\u51e0\u4e2a\u5c42\u6b21\uff1a"}),"\n",(0,a.jsxs)(e.ul,{children:["\n",(0,a.jsxs)(e.li,{children:["\n",(0,a.jsx)(e.p,{children:"ODS\uff08Operational Data Store\uff09\u64cd\u4f5c\u6570\u636e\u5b58\u50a8\uff1a\u5b58\u50a8\u8fd1\u5b9e\u65f6\u7684\u539f\u59cb\u6570\u636e\uff0c\u652f\u6301\u8fd0\u8425\u62a5\u8868\u548c\u76d1\u63a7\u3002"}),"\n"]}),"\n",(0,a.jsxs)(e.li,{children:["\n",(0,a.jsx)(e.p,{children:"DWD (Data Warehouse Detail Layer) \u6570\u636e\u4ed3\u5e93\u660e\u7ec6\u5c42\uff1a\u53bb\u9664\u4e86\u5197\u4f59\u548c\u4e0d\u4e00\u81f4\uff0c\u5b58\u50a8\u7ecf\u8fc7\u521d\u6b65\u6e05\u6d17\u548c\u6807\u51c6\u5316\u7684\u660e\u7ec6\u6570\u636e\u3002"}),"\n"]}),"\n",(0,a.jsxs)(e.li,{children:["\n",(0,a.jsx)(e.p,{children:"DWS (Data Warehouse Summary Layer) \u6570\u636e\u4ed3\u5e93\u6c47\u603b\u5c42\uff1a\u5b58\u50a8\u7ecf\u8fc7\u8fdb\u4e00\u6b65\u805a\u5408\u548c\u6c47\u603b\u7684\u6570\u636e\uff0c\u652f\u6301\u590d\u6742\u5206\u6790\u548c\u62a5\u8868\u751f\u6210\u3002"}),"\n"]}),"\n",(0,a.jsxs)(e.li,{children:["\n",(0,a.jsx)(e.p,{children:"ADS (Application Data Store) \u5e94\u7528\u6570\u636e\u5b58\u50a8\u5c42\uff1a\u5b58\u50a8\u7ecf\u8fc7\u9ad8\u5ea6\u805a\u5408\u548c\u52a0\u5de5\u7684\u6570\u636e\uff0c\u7528\u4e8e\u6700\u7ec8\u7684\u524d\u7aef\u5e94\u7528\u548c\u62a5\u8868\u5c55\u793a\u3002"}),"\n"]}),"\n"]}),"\n",(0,a.jsx)(e.p,{children:"\u6570\u4ed3\u4e1a\u52a1\u7684\u4e0a\u6e38\u5f80\u5f80\u6709\u4e00\u4e2a TP \u6570\u636e\u5e93\uff0c\u4ee5\u53ca\u4e1a\u52a1\u65e5\u5fd7\uff0c\u901a\u8fc7 Kafka \u7b49\u751f\u6001\u5de5\u5177\u5199\u5165\u5230\u961f\u5217\uff0c\u518d\u6279\u91cf\u5199\u5165\u5230\u6570\u4ed3\u3002"}),"\n",(0,a.jsxs)(e.ul,{children:["\n",(0,a.jsxs)(e.li,{children:["\n",(0,a.jsx)(e.p,{children:"\u53ef\u4ee5\u8ba9 OceanBase \u4f5c\u4e3a\u6570\u4ed3\u4e3b\u4f53\u3002"}),"\n",(0,a.jsxs)(e.ul,{children:["\n",(0,a.jsxs)(e.li,{children:["\u901a\u8fc7 OceanBase \u7684\u7269\u5316\u89c6\u56fe\u80fd\u529b\uff0c\u5b58\u50a8\u5728 DWD \u548c DWS \u4e2d\u6e05\u6d17\u548c\u6c47\u603b\u6570\u636e\uff0c\u4ece\u800c\u6d88\u9664\u4e0a\u8ff0\u4e0d\u540c\u5c42\u6b21\u95f4\u7684 ETL \u6d41\u7a0b\u3002\n",(0,a.jsx)(e.img,{alt:"image.png",src:s(27841).A+"",width:"1120",height:"501"})]}),"\n"]}),"\n"]}),"\n",(0,a.jsxs)(e.li,{children:["\n",(0,a.jsx)(e.p,{children:"\u53ef\u4ee5\u7528 OceanBase \u4f5c\u4e3a\u6570\u4ed3\u7684\u5b58\u50a8\u65b9\u6848\u3002"}),"\n",(0,a.jsxs)(e.ul,{children:["\n",(0,a.jsxs)(e.li,{children:["\u901a\u8fc7 Flink \u7b49\u7b2c\u4e09\u65b9\u751f\u6001\u5de5\u5177\u8fdb\u884c\u8ba1\u7b97\uff0c\u540c\u65f6\u4e5f\u4f1a\u4f7f\u7528 OceanBase \u8fdb\u884c\u4e00\u90e8\u5206\u590d\u6742\u67e5\u8be2\uff08\u6df7\u5408\u8ba1\u7b97\u6a21\u5f0f\uff09\u3002\n",(0,a.jsx)(e.img,{alt:"image.png",src:s(6712).A+"",width:"1149",height:"501"})]}),"\n"]}),"\n"]}),"\n",(0,a.jsxs)(e.li,{children:["\n",(0,a.jsx)(e.p,{children:"\u5f53\u6570\u636e\u91cf\u5927\uff0c\u4e14\u9700\u8981\u4f7f\u7528\u7b2c\u4e09\u65b9\u751f\u6001\u5de5\u5177\u4f5c\u4e3a\u6570\u636e\u52a0\u5de5\u5c42\u65f6\uff1a"}),"\n",(0,a.jsxs)(e.ul,{children:["\n",(0,a.jsx)(e.li,{children:"\u53ef\u4ee5\u7528 OceanBase \u4f5c ODS \u5c42\uff0c\u89e3\u51b3\u5b9e\u65f6\u5199\u5165\u6027\u80fd\u5dee\u7684\u75db\u70b9\u3002"}),"\n",(0,a.jsxs)(e.li,{children:["\u53ef\u4ee5\u7528 OceanBase \u4f5c ADS \u5c42\uff0c\u89e3\u51b3\u9ad8\u5e76\u53d1\u573a\u666f\u6027\u80fd\u5dee\u7684\u75db\u70b9\u3002\n",(0,a.jsx)(e.img,{alt:"image.png",src:s(2323).A+"",width:"1174",height:"496"})]}),"\n"]}),"\n"]}),"\n"]})]})}function o(n={}){const{wrapper:e}={...(0,c.R)(),...n.components};return e?(0,a.jsx)(e,{...n,children:(0,a.jsx)(d,{...n})}):d(n)}},4924:(n,e,s)=>{s.d(e,{A:()=>a});const a=s.p+"assets/images/001-018f66459e25609a2b10eefc61eb486d.png"},12503:(n,e,s)=>{s.d(e,{A:()=>a});const a=s.p+"assets/images/002-83c9262bf902039a02268d0766086624.png"},29358:(n,e,s)=>{s.d(e,{A:()=>a});const a=s.p+"assets/images/003-77d3ce849ff5bfb95e3436115ccf158b.png"},27841:(n,e,s)=>{s.d(e,{A:()=>a});const a=s.p+"assets/images/004-9ee62da3ac96171cbc6f41b9103c1301.png"},6712:(n,e,s)=>{s.d(e,{A:()=>a});const a=s.p+"assets/images/005-0fb460096fec791adb4186d62b444b05.png"},2323:(n,e,s)=>{s.d(e,{A:()=>a});const a=s.p+"assets/images/006-85c714b0ab1bf43401f59bdd9738ab9e.png"},28453:(n,e,s)=>{s.d(e,{R:()=>t,x:()=>r});var a=s(96540);const c={},i=a.createContext(c);function t(n){const e=a.useContext(i);return a.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function r(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(c):n.components||c:t(n.components),a.createElement(i.Provider,{value:e},n.children)}}}]);