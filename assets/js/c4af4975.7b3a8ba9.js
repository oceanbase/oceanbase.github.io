"use strict";(self.webpackChunkmy_docs_website=self.webpackChunkmy_docs_website||[]).push([[8694],{91815:(n,e,s)=>{s.r(e),s.d(e,{assets:()=>t,contentTitle:()=>a,default:()=>o,frontMatter:()=>l,metadata:()=>r,toc:()=>d});var i=s(74848),c=s(28453);const l={title:"\u573a\u666f\u4ecb\u7ecd",weight:1},a=void 0,r={id:"user_manual/operation_and_maintenance/scenario_best_practices/chapter_02_archive_database/introduction",title:"\u573a\u666f\u4ecb\u7ecd",description:"\u5173\u952e\u5b57\uff1a\u751f\u547d\u5468\u671f\u81ea\u52a8\u7ba1\u7406 | \u4f4e\u6210\u672c | \u8d85\u5927\u5bb9\u91cf",source:"@site/docs/user_manual/operation_and_maintenance/scenario_best_practices/chapter_02_archive_database/01_introduction.md",sourceDirName:"user_manual/operation_and_maintenance/scenario_best_practices/chapter_02_archive_database",slug:"/user_manual/operation_and_maintenance/scenario_best_practices/chapter_02_archive_database/introduction",permalink:"/docs/user_manual/operation_and_maintenance/scenario_best_practices/chapter_02_archive_database/introduction",draft:!1,unlisted:!1,editUrl:"https://github.com/oceanbase/oceanbase.github.io/tree/main/docs/user_manual/operation_and_maintenance/scenario_best_practices/chapter_02_archive_database/01_introduction.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"\u573a\u666f\u4ecb\u7ecd",weight:1},sidebar:"operation_and_maintenanceSidebar",previous:{title:"\u8d44\u6e90\u9694\u79bb\u7684\u6548\u679c",permalink:"/docs/user_manual/operation_and_maintenance/scenario_best_practices/chapter_01_multi_tenants/resource_isolation_within_a_tenant/effect_of_resource_isolation"},next:{title:"\u5b58\u50a8\u5f15\u64ce\u80cc\u666f\u77e5\u8bc6",permalink:"/docs/user_manual/operation_and_maintenance/scenario_best_practices/chapter_02_archive_database/background_knowledge"}},t={},d=[{value:"\u5386\u53f2\u6570\u636e\u5f52\u6863\u573a\u666f",id:"\u5386\u53f2\u6570\u636e\u5f52\u6863\u573a\u666f",level:2},{value:"\u884c\u4e1a\u73b0\u72b6\u4e0e\u6311\u6218",id:"\u884c\u4e1a\u73b0\u72b6\u4e0e\u6311\u6218",level:2},{value:"\u89e3\u51b3\u65b9\u6848",id:"\u89e3\u51b3\u65b9\u6848",level:2},{value:"\u65b9\u6848\u4f18\u52bf",id:"\u65b9\u6848\u4f18\u52bf",level:2},{value:"\u7528\u6237\u6848\u4f8b",id:"\u7528\u6237\u6848\u4f8b",level:2},{value:"\u643a\u7a0b\uff08\u5178\u578b\u7528\u6237\u6848\u4f8b\uff09",id:"\u643a\u7a0b\u5178\u578b\u7528\u6237\u6848\u4f8b",level:3},{value:"\u4e1a\u52a1\u6311\u6218",id:"\u4e1a\u52a1\u6311\u6218",level:4},{value:"\u89e3\u51b3\u65b9\u6848",id:"\u89e3\u51b3\u65b9\u6848-1",level:4},{value:"\u7528\u6237\u6536\u76ca",id:"\u7528\u6237\u6536\u76ca",level:4},{value:"\u89c6\u9891\u8d44\u6599",id:"\u89c6\u9891\u8d44\u6599",level:4},{value:"\u5176\u4ed6\u7528\u6237\u6848\u4f8b",id:"\u5176\u4ed6\u7528\u6237\u6848\u4f8b",level:3}];function h(n){const e={a:"a",blockquote:"blockquote",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",p:"p",ul:"ul",...(0,c.R)(),...n.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)(e.blockquote,{children:["\n",(0,i.jsx)(e.p,{children:"\u5173\u952e\u5b57\uff1a\u751f\u547d\u5468\u671f\u81ea\u52a8\u7ba1\u7406 | \u4f4e\u6210\u672c | \u8d85\u5927\u5bb9\u91cf"}),"\n",(0,i.jsx)(e.p,{children:"\u901a\u8fc7 OceanBase \u667a\u80fd\u5316\u7684\u5386\u53f2\u5e93\u8fc1\u79fb\u5e73\u53f0\uff0c\u5e2e\u52a9\u7528\u6237\u5feb\u901f\u3001\u5b89\u5168\u7684\u5b8c\u6210\u51b7\u6570\u636e\u5f52\u6863\uff0c\u4e00\u6b21\u914d\u7f6e\u5373\u53ef\u5b9e\u73b0\u81ea\u52a8\u5316\u7684\u5468\u671f\u7ba1\u63a7\u3002OceanBase \u9ad8\u538b\u7f29\u6bd4\u7684\u5206\u5e03\u5f0f\u5b58\u50a8\u5f15\u64ce\uff0c \u6452\u5f03\u4e86\u4f20\u7edf\u6570\u636e\u5e93\u7684\u5b9a\u957f\u6570\u636e\u5757\u5b58\u50a8\uff0c\u91c7\u7528\u57fa\u4e8e LSM-Tree \u7684\u5b58\u50a8\u67b6\u6784\u548c\u81ea\u9002\u5e94\u538b\u7f29\u6280\u672f\uff0c\u521b\u9020\u6027\u5730\u89e3\u51b3\u4e86\u4f20\u7edf\u6570\u636e\u5e93\u65e0\u6cd5\u5e73\u8861\u201c\u6027\u80fd\u201d\u548c\u201c\u538b\u7f29\u6bd4\u201d\u7684\u96be\u9898\uff0c"}),"\n"]}),"\n",(0,i.jsx)(e.h2,{id:"\u5386\u53f2\u6570\u636e\u5f52\u6863\u573a\u666f",children:"\u5386\u53f2\u6570\u636e\u5f52\u6863\u573a\u666f"}),"\n",(0,i.jsx)(e.p,{children:"\u5728\u8ba2\u5355\u3001\u4ea4\u6613\u3001\u65e5\u5fd7\u7b49\u4e1a\u52a1\u573a\u666f\u4e2d\uff0c\u6570\u636e\u603b\u91cf\u4f1a\u4e0d\u65ad\u589e\u52a0\u3002\u800c\u5bf9\u4e8e\u8fd9\u4e9b\u6570\u636e\u7684\u8bbf\u95ee\u5f80\u5f80\u548c\u65f6\u95f4\u6709\u5f88\u5f3a\u7684\u76f8\u5173\u6027\uff0c\u901a\u5e38\u4e0e\u5f53\u524d\u65f6\u95f4\u8d8a\u63a5\u8fd1\u7684\u6570\u636e\u8d8a \u201c\u70ed\u201d\uff0c\u4e5f\u5c31\u662f\u8bf4\uff0c\u8fd9\u4e9b\u6570\u636e\u53ef\u80fd\u4f1a\u88ab\u9891\u7e41\u5730\u4fee\u6539\u4e0e\u70b9\u67e5\u3002\u70ed\u6570\u636e\u7684\u8bbf\u95ee\u66f4\u591a\u662f\u4e8b\u52a1\u578b\u8d1f\u8f7d\u548c\u5b9e\u65f6\u5206\u6790\u8d1f\u8f7d\uff0c\u5176\u6570\u636e\u91cf\u5728\u6574\u4e2a\u7cfb\u7edf\u4e2d\u7684\u5360\u6bd4\u76f8\u5bf9\u8f83\u4f4e\u3002"}),"\n",(0,i.jsx)(e.p,{children:"\u800c\u5728\u7cfb\u7edf\u4e2d\u5df2\u7ecf\u5b58\u5728\u4e86\u4e00\u6bb5\u65f6\u95f4\u7684\u6570\u636e\uff0c\u88ab\u79f0\u4e3a \u201c\u51b7\u6570\u636e\u201d\uff0c\u8fd9\u4e9b\u6570\u636e\u7684\u88ab\u67e5\u8be2\u6b21\u6570\u76f8\u5bf9\u6ca1\u6709\u90a3\u4e48\u9891\u7e41\uff0c\u4e5f\u5f88\u5c11\u88ab\u4fee\u6539\u3002\u51b7\u6570\u636e\u7684\u8bbf\u95ee\u901a\u5e38\u662f\u5c11\u91cf\u7684\u4e8b\u52a1\u578b\u8d1f\u8f7d\u548c\u4e00\u4e9b\u62a5\u8868\u7edf\u8ba1\u7b49\u5206\u6790\u578b\u8d1f\u8f7d\uff0c\u800c\u4e14\u51b7\u6570\u636e\u901a\u5e38\u662f\u7a33\u5b9a\u8fd0\u884c\u7684 IT \u7cfb\u7edf\u4e2d\u6570\u636e\u91cf\u7684\u4e3b\u8981\u90e8\u5206\u3002"}),"\n",(0,i.jsx)(e.p,{children:"\u7531\u4e8e\u51b7\u70ed\u6570\u636e\u6709\u7740\u660e\u663e\u7684\u533a\u522b\uff0c\u5c06\u5b83\u4eec\u653e\u5728\u4e00\u5957\u76f8\u540c\u89c4\u683c\u7684\u73af\u5883\u4e2d\u540c\u7b49\u5904\u7406\u663e\u7136\u4f1a\u6d6a\u8d39\u7cfb\u7edf\u7684\u8d44\u6e90\uff0c\u5355\u4e2a\u6570\u636e\u5e93\u7684\u5bb9\u91cf\u4e0a\u9650\u8fd8\u53ef\u80fd\u4f1a\u9650\u5236\u6570\u636e\u7684\u5b58\u50a8\u3002\u4f46\u662f\uff0c\u5c06\u51b7\u6570\u636e\u5b9a\u671f\u5f52\u6863\u5230\u66f4\u7ecf\u6d4e\u7684\u5b58\u50a8\u4ecb\u8d28\u4e2d\uff0c\u8bbf\u95ee\u6570\u636e\u65f6\u91c7\u7528\u4ece\u5f52\u6863\u6570\u636e\u4e2d\u8fd8\u539f\u7684\u65b9\u6cd5\uff0c\u53c8\u4f1a\u5bf9\u5386\u53f2\u6570\u636e\u7684\u67e5\u8be2\u6027\u80fd\u548c\u7cfb\u7edf\u7684\u590d\u6742\u5ea6\u5e26\u6765\u8d1f\u9762\u5f71\u54cd\u3002"}),"\n",(0,i.jsx)(e.p,{children:"\u56e0\u6b64\uff0c\u5c06\u6570\u636e\u5206\u4e3a\u7ebf\u4e0a\u5e93\u548c\u5386\u53f2\u5e93\uff0c\u5c06\u5728\u7ebf\u6570\u636e\u5b9a\u671f\u540c\u6b65\u5230\u5386\u53f2\u5e93\u4e2d\u7684\u505a\u6cd5\u6210\u4e3a\u4e86\u8d8a\u6765\u8d8a\u591a\u7cfb\u7edf\u7684\u89e3\u51b3\u65b9\u6848\uff0c\u901a\u8fc7\u5728\u5b58\u50a8\u548c\u8ba1\u7b97\u6210\u672c\u66f4\u4f4e\u7684\u73af\u5883\u4e0a\u90e8\u7f72\u5386\u53f2\u5e93\u6765\u964d\u4f4e\u6210\u672c\u548c\u6ee1\u8db3\u4e1a\u52a1\u9700\u6c42\u3002"}),"\n",(0,i.jsx)(e.h2,{id:"\u884c\u4e1a\u73b0\u72b6\u4e0e\u6311\u6218",children:"\u884c\u4e1a\u73b0\u72b6\u4e0e\u6311\u6218"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u6570\u636e\u589e\u957f\u52a0\u901f\uff1a\u9762\u5bf9\u5feb\u901f\u589e\u957f\u7684\u5728\u7ebf\u6570\u636e\uff0c\u5c24\u5176\u4f8b\u5982\u65b0\u96f6\u552e\u3001\u652f\u4ed8\u7b49\u8ba2\u5355\u548c\u4ea4\u6613\u573a\u666f\uff0c\u6570\u636e\u5f80\u5f80\u591a\u5448\u73b0\u4e3a\u6d41\u6c34\u578b\u7279\u5f81\uff0c\u5373\u5199\u5165\u4e00\u6bb5\u65f6\u95f4\u540e\u4e0d\u4f1a\u518d\u6b21\u8bbf\u95ee\u6216\u66f4\u65b0\u3002"}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u6210\u672c\u9ad8\u6548\u7387\u4f4e\uff1a\u4f4e\u9891\u6216\u96f6\u8bbf\u95ee\u6570\u636e\u5360\u7528\u5728\u7ebf\u4e1a\u52a1\u5e93\u7684\u56fa\u6001\u5b58\u50a8\u7a7a\u95f4\uff0c\u9020\u6210\u5927\u91cf\u786c\u4ef6\u8d44\u6e90\u6d6a\u8d39\uff0c\u5806\u9ad8\u4f01\u4e1a IT \u6210\u672c\uff0c\u5bfc\u81f4\u5728\u7ebf\u6570\u636e\u5e93\u4f53\u79ef\u81c3\u80bf\u3001\u67e5\u8be2\u6548\u7387\u964d\u4f4e\uff0c\u7ed9\u540e\u7eed\u6570\u636e\u53d8\u66f4\u3001\u6269\u5c55\u9020\u6210\u963b\u788d\u3002"}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u4f20\u7edf\u65b9\u6848\u98ce\u9669\u9ad8\uff1a\u4f20\u7edf\u6570\u636e\u5f52\u6863\u65b9\u6848\u5f80\u5f80\u662f\u4e1a\u52a1\u7814\u53d1\u6216 DBA \u91c7\u7528\u811a\u672c\u6216\u7b80\u5355\u7684\u540c\u6b65\u5de5\u5177\u8fdb\u884c\uff0c\u96be\u4ee5\u5728\u5e76\u53d1\u548c\u6548\u7387\u4e0a\u6709\u6548\u63a7\u5236\uff0c\u5f88\u5bb9\u6613\u5bf9\u5728\u7ebf\u6570\u636e\u5e93\u4ea7\u751f\u5f71\u54cd\uff0c\u4e25\u91cd\u7684\u751a\u81f3\u5bfc\u81f4\u751f\u4ea7\u6570\u636e\u8bef\u5220\u4e8b\u6545\u3002"}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u8fd0\u7ef4\u7ba1\u7406\u590d\u6742\uff1a\u591a\u4e2a\u4e1a\u52a1\u5bf9\u5e94\u7684\u4e0d\u540c\u6570\u636e\u5e93\u3001\u751a\u81f3\u4e0d\u540c\u8868\u90fd\u53ef\u80fd\u6709\u5404\u5f02\u7684\u5f52\u6863\u5468\u671f\u548c\u9650\u5b9a\u6761\u4ef6\uff0c\u4f1a\u5bfc\u81f4\u5927\u91cf\u5b9a\u65f6\u4efb\u52a1\u7684\u903b\u8f91\u7ef4\u62a4\u590d\u6742\uff0c\u8017\u65f6\u8017\u529b\u3002"}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(e.h2,{id:"\u89e3\u51b3\u65b9\u6848",children:"\u89e3\u51b3\u65b9\u6848"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u57fa\u4e8e OceanBase \u5bf9\u4f4e\u7aef\u786c\u4ef6\u7684\u53cb\u597d\u517c\u5bb9\uff0c OceanBase \u5386\u53f2\u5e93\u5e73\u53f0\u5b9e\u73b0\u4e86\u5f52\u6863\u4efb\u52a1\u914d\u7f6e\u56fe\u5f62\u5316\uff0c\u5468\u671f\u7ba1\u63a7\u81ea\u52a8\u5316\uff0c\u6570\u636e\u8fc1\u79fb + \u6821\u9a8c + \u5220\u9664\u4e00\u952e\u81ea\u52a8\u7070\u5ea6\u6267\u884c\u7b49\u80fd\u529b\u3002\u7a33\u5b9a\u6027\u65b9\u9762\u63d0\u4f9b\u4e86\u9632\u5bfc\u7206\u3001\u667a\u80fd\u9650\u901f\u3001\u591a\u7c92\u5ea6\u6d41\u63a7\u7b49\u673a\u5236\uff0c\u771f\u6b63\u5b9e\u73b0\u4e86\u6570\u636e\u5f52\u6863\u7684\u667a\u80fd\u5316\u8fd0\u7ef4\u3002"}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u6b64\u65b9\u6848\u5386\u7ecf\u8682\u8681\u96c6\u56e2\u6838\u5fc3\u4e1a\u52a1\u573a\u666f\u9a8c\u8bc1\uff0c\u4ea4\u6613\u652f\u4ed8\u5386\u53f2\u5e93\u5355\u5b9e\u4f8b\u6570\u636e\u8d85\u8fc7 6PB\uff0c\u91c7\u7528\u4e0a\u767e\u53f0\u5927\u5bb9\u91cf\u673a\u68b0\u76d8\u7684\u4f4e\u6210\u672c\u786c\u4ef6\u652f\u6491\uff0c\u78c1\u76d8\u6c34\u4f4d\u81ea\u52a8\u5747\u8861\uff0c\u5e73\u7a33\u8fd0\u884c\u591a\u5e74\uff0c\u8282\u7701\u4e86\u5927\u91cf\u673a\u5668\u8d44\u6e90\u3002"}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(e.p,{children:(0,i.jsx)(e.img,{alt:"image.png",src:s(59763).A+"",width:"1350",height:"728"})}),"\n",(0,i.jsx)(e.h2,{id:"\u65b9\u6848\u4f18\u52bf",children:"\u65b9\u6848\u4f18\u52bf"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u53ef\u89c6\u5316\u7ba1\u7406\uff1a\u4efb\u52a1\u521b\u5efa\u4e0e\u8fd0\u884c\u3001\u8fdb\u5ea6\u5927\u76d8\u3001\u4e00\u952e\u6682\u505c/\u6062\u590d\u7b49\u57fa\u7840\u64cd\u4f5c\u56fe\u5f62\u5316\u3002"}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u667a\u80fd\u5316\u8fd0\u7ef4\uff1a\u4ee4\u724c\u6876\u7b97\u6cd5\u9650\u901f\u63a7\u5236\u3001\u65ad\u70b9\u7eed\u4f20\u3001\u4efb\u52a1\u8c03\u5ea6\u81ea\u52a8\u5316\u7ba1\u63a7\u7b49\u673a\u5236\uff0c\u4ee5\u53ca\u5b95\u673a\u81ea\u52a8\u66ff\u6362\u3001\u81ea\u52a8\u6269\u7f29\u5bb9\u3001\u9632\u5bfc\u7206\u7b49\u81ea\u6108\u624b\u6bb5\uff0c\u5b9e\u73b0\u8fd0\u7ef4\u96f6\u5e72\u9884\u3002"}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u4f4e\u6210\u672c\uff1a\u5927\u5bb9\u91cf SATA \u76d8\u673a\u578b\u53cb\u597d\uff0c\u7ed3\u5408 OceanBase \u9ad8\u538b\u7f29\u5b58\u50a8\u80fd\u529b\uff0c\u5355\u8282\u70b9\u6700\u5927\u5373\u53ef\u5b58\u50a8\u76f8\u5f53\u4e8e\u4f20\u7edf\u6570\u636e\u5e93 400TB \u6570\u636e\u3002"}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u6d77\u91cf\u5b58\u50a8\uff1a\u9002\u7528\u5728\u7ebf\u4e1a\u52a1\u7626\u8eab\uff0c\u771f\u6b63\u505a\u5230\u4e3a\u6570\u636e\u5f52\u6863\u51cf\u8d1f\u3002\u5386\u53f2\u5e93\u96c6\u7fa4\u53ef\u4f5c\u4e3a\u5927\u5bb9\u91cf\u5173\u7cfb\u578b\u6570\u636e\u5e93\u4f7f\u7528\uff0c\u80fd\u7a33\u5b9a\u652f\u6491\u5199\u5165\u91cf\u5de8\u5927\u4f46\u4f4e\u9891\u8bbf\u95ee\u7684\u4e1a\u52a1\u67e5\u8be2\u9700\u6c42\uff0c\u5982\u76d1\u63a7\u3001\u65e5\u5fd7\u3001\u5ba1\u8ba1\u6838\u5bf9\u7b49\u573a\u666f\u3002"}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(e.h2,{id:"\u7528\u6237\u6848\u4f8b",children:"\u7528\u6237\u6848\u4f8b"}),"\n",(0,i.jsx)(e.h3,{id:"\u643a\u7a0b\u5178\u578b\u7528\u6237\u6848\u4f8b",children:"\u643a\u7a0b\uff08\u5178\u578b\u7528\u6237\u6848\u4f8b\uff09"}),"\n",(0,i.jsx)(e.h4,{id:"\u4e1a\u52a1\u6311\u6218",children:"\u4e1a\u52a1\u6311\u6218"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u968f\u7740\u8ba2\u5355\u4e1a\u52a1\u91cf\u7684\u589e\u52a0\uff0c\u4e1a\u52a1\u6570\u636e\u8fc5\u731b\u589e\u957f\uff0c\u4f20\u7edf\u6570\u636e\u5e93\u7684\u5b58\u50a8\u74f6\u9888\u4ee5\u53ca\u6027\u80fd\u4e0d\u4f73\u95ee\u9898\u8d8a\u6765\u8d8a\u660e\u663e\u3002"}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u4e0d\u4ec5\u8fd0\u7ef4\u6210\u672c\u548c\u590d\u6742\u5ea6\u6709\u6240\u589e\u52a0\uff0c\u540c\u65f6\u9700\u8981\u4e0d\u65ad\u5bf9\u5e94\u7528\u8fdb\u884c\u6539\u9020\u548c\u9002\u914d\u4ee5\u89e3\u51b3\u4e0d\u65ad\u5206\u5e93\u5206\u8868\u5e26\u6765\u7684\u95ee\u9898\u3002"}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(e.h4,{id:"\u89e3\u51b3\u65b9\u6848-1",children:"\u89e3\u51b3\u65b9\u6848"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u76f8\u6bd4\u4f20\u7edf\u7684\u96c6\u4e2d\u5f0f\u6570\u636e\u5e93 MySQL\uff0cOceanBase \u5728\u5b58\u50a8\u5c42\u9762\u6781\u81f4\u7684\u538b\u7f29\u80fd\u529b\uff0c\u6709\u6548\u964d\u4f4e\u4f01\u4e1a\u4f7f\u7528\u6570\u636e\u5e93\u7684\u786c\u4ef6\u6210\u672c\u3002"}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"OceanBase \u5177\u5907\u7075\u6d3b\u7684\u8d44\u6e90\u6269\u5c55\u80fd\u529b\uff0c\u6839\u636e\u4e1a\u52a1\u5b9e\u9645\u53d1\u5c55\u60c5\u51b5\u53ef\u4ee5\u52a8\u6001\u7684\u8fdb\u884c\u8ba1\u7b97\u548c\u5b58\u50a8\u80fd\u529b\u7684\u7ebf\u6027\u6269\u5c55\uff0c\u652f\u6491\u6d77\u91cf\u6570\u636e\u7684\u5b58\u50a8\u548c\u8ba1\u7b97\uff0c\u540c\u65f6\u5f88\u597d\u5730\u5e94\u5bf9\u672a\u6765\u7684\u4e1a\u52a1\u589e\u957f\u8981\u6c42\u3002"}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u5728\u6570\u636e\u8fc1\u79fb\u65b9\u9762\uff0c\u56e0 OceanBase \u517c\u5bb9 MySQL \u534f\u8bae\u4e0e\u8bed\u6cd5\uff0c\u56e0\u6b64 OMS \u53ef\u4ee5\u505a\u5230\u5e73\u6ed1\u8fc1\u79fb\uff0c\u53ef\u5927\u5e45\u964d\u4f4e\u4e1a\u52a1\u8fc1\u79fb\u548c\u6539\u9020\u6210\u672c\u3002OMS \u901a\u8fc7\u5168\u91cf\u8fc1\u79fb\u3001\u589e\u91cf\u8fc1\u79fb\u3001\u53cd\u5411\u8fc1\u79fb\uff0c\u4fdd\u969c\u6570\u636e\u8fc1\u8fc7\u7a0b\u4e2d\u7684\u5f3a\u4e00\u81f4\uff0c\u5e76\u63d0\u4f9b\u6570\u636e\u540c\u6b65\u5230 kafka \u7b49\u6d88\u606f\u961f\u5217\u4e2d\u7684\u80fd\u529b\u3002"}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(e.p,{children:(0,i.jsx)(e.img,{alt:"image.png",src:s(64152).A+"",width:"1280",height:"768"})}),"\n",(0,i.jsx)(e.h4,{id:"\u7528\u6237\u6536\u76ca",children:"\u7528\u6237\u6536\u76ca"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u8fd0\u7ef4\u66f4\u52a0\u9ad8\u6548\u4e0e\u4fbf\u6377\uff1a\u5355\u96c6\u7fa4\u66ff\u6362\u6570\u5341\u5957 MySQL \u73af\u5883\uff0c\u8fd0\u7ef4\u7ba1\u7406\u6210\u672c\u5927\u5927\u964d\u4f4e\uff0c\u540c\u65f6\u7ba1\u7406\u66f4\u52a0\u65b9\u4fbf\u3002\u4f7f\u7528\u666e\u901a\u7684 PC \u670d\u52a1\u5668\u5373\u53ef\u6784\u5efa\u8d85\u9ad8\u541e\u5410\u7684 OceanBase \u96c6\u7fa4\uff0c\u65e0\u9700\u5206\u5e93\u5206\u8868\uff0c\u5feb\u901f\u6309\u9700\u6269\u5c55\uff0c\u4e3a\u643a\u7a0b\u5386\u53f2\u5e93\u5728\u6c34\u5e73\u6269\u5c55\u8fc7\u7a0b\u4e2d\u63d0\u4f9b\u4e86\u5e73\u6ed1\u7684\u6210\u672c\u589e\u957f\u66f2\u7ebf\u3002"}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u4f4e\u6210\u672c\uff1a\u652f\u6491\u4e0a\u767e TB \u6570\u636e\u5b58\u50a8\u573a\u666f\u4e14\u6027\u80fd\u548c\u7a33\u5b9a\u6027\u6709\u4fdd\u8bc1\uff0c\u540c\u65f6\u76f8\u6bd4\u8f83\u4e4b\u524d\u7684\u65b9\u6848\uff0cOceanBase \u65b9\u6848\u7684\u5b58\u50a8\u6210\u672c\u964d\u4f4e 85%\uff0c\u964d\u672c\u6548\u679c\u660e\u663e\u3002"}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u6570\u636e\u540c\u6b65\u6027\u80fd\u63d0\u5347\uff1a\u6570\u636e\u8fc1\u79fb\u5bf9\u4e1a\u52a1\u900f\u660e\uff0cOMS \u652f\u6301\u5168\u91cf\u6570\u636e\u8fc1\u79fb\u3001\u589e\u91cf\u6570\u636e\u540c\u6b65\uff0c\u652f\u6301\u4e3b\u6d41\u6570\u636e\u5e93\u7684\u4e00\u7ad9\u5f0f\u6570\u636e\u8fc1\u79fb\u3002\u6570\u636e\u4ece\u4e0a\u6e38\u5199\u5165\u5230\u4e0b\u6e38 OceanBase \u54cd\u5e94\u5ef6\u8fdf\u66f4\u5c0f\uff0c\u6570\u636e\u540c\u6b65\u901f\u5ea6\u66f4\u5feb\uff0c\u540c\u6b65\u5ef6\u8fdf\u65f6\u95f4\u51cf\u5c11 3/4\u3002"}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsx)(e.p,{children:"\u6570\u636e\u5199\u5165\u6027\u80fd\u4f18\u79c0\uff1aOceanBase \u7684\u65e0\u5171\u4eab\u67b6\u6784\u3001\u5206\u533a\u7ea7\u4e3b\u526f\u672c\u6253\u6563\uff0c\u4ee5\u53ca\u5e76\u884c\u6267\u884c\u6846\u67b6\u63d0\u4f9b\u7684 Parallel DML \u80fd\u529b\uff0c\u771f\u6b63\u5b9e\u73b0\u4e86\u9ad8\u6548\u7684\u591a\u8282\u70b9\u5199\u5165\u3002\u5229\u7528\u8be5\u7279\u6027\uff0c\u6570\u636e\u5199\u5165\u6027\u80fd\u63d0\u5347\u6570\u500d\uff0c\u80fd\u591f\u4ece\u5bb9\u5e94\u5bf9\u643a\u7a0b\u5386\u53f2\u5e93\u7684\u8d85\u9ad8\u5e76\u53d1\u6570\u636e\u5199\u5165\u9700\u6c42\u3002"}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(e.h4,{id:"\u89c6\u9891\u8d44\u6599",children:"\u89c6\u9891\u8d44\u6599"}),"\n",(0,i.jsx)(e.p,{children:(0,i.jsx)(e.a,{href:"https://www.oceanbase.com/video/9001003",children:"\u643a\u7a0b\u5386\u53f2\u5e93\u573a\u666f\u964d\u672c\u5b9e\u8df5"})}),"\n",(0,i.jsx)(e.h3,{id:"\u5176\u4ed6\u7528\u6237\u6848\u4f8b",children:"\u5176\u4ed6\u7528\u6237\u6848\u4f8b"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsxs)(e.li,{children:["\u652f\u4ed8\u5b9d\uff1a",(0,i.jsx)(e.a,{href:"https://open.oceanbase.com/blog/5377309696",children:"https://open.oceanbase.com/blog/5377309696"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsx)(e.li,{children:"\u884c\u4e1a\uff1a\u4e92\u8054\u7f51"}),"\n",(0,i.jsx)(e.li,{children:"\u75db\u70b9\uff1a\u5386\u53f2\u5e93\u4f7f\u7528 MySQL \u5206\u5e93\u5206\u8868\uff0c\u6c34\u5e73\u6269\u5c55\u80fd\u529b\u5dee\uff0c\u67e5\u8be2\u548c\u4e8b\u52a1\u5747\u6709\u8bf8\u591a\u9650\u5236\u3002"}),"\n",(0,i.jsx)(e.li,{children:"\u6536\u76ca\uff1a\u5c06\u6570\u636e\u8fc1\u79fb\u5230\u5386\u53f2\u5e93\u540e\uff0c\u5355\u4f4d\u7a7a\u95f4\u78c1\u76d8\u6210\u672c\u964d\u4f4e\u5230\u7ebf\u4e0a\u673a\u5668\u7684 30% \uff0c\u603b\u4f53\u6210\u672c\u4e0b\u964d 80% \u5de6\u53f3\uff0c\u751a\u81f3\u6709\u4e9b\u4e1a\u52a1\u7684\u5b58\u50a8\u6210\u672c\u964d\u4f4e\u5230\u4e86\u539f\u6765\u7684\u5341\u5206\u4e4b\u4e00\u3002"}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["BOSS \u76f4\u8058\uff1a",(0,i.jsx)(e.a,{href:"https://open.oceanbase.com/blog/8983073840",children:"https://open.oceanbase.com/blog/8983073840"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsx)(e.li,{children:"\u884c\u4e1a\uff1a\u4e92\u8054\u7f51"}),"\n",(0,i.jsx)(e.li,{children:"\u75db\u70b9\uff1a\u5386\u53f2\u5e93\u4f7f\u7528 MySQL \u5206\u5e93\u5206\u8868\uff0c\u6c34\u5e73\u6269\u5c55\u80fd\u529b\u5dee\uff0c\u67e5\u8be2\u548c\u4e8b\u52a1\u5747\u6709\u8bf8\u591a\u9650\u5236\u3002"}),"\n",(0,i.jsx)(e.li,{children:"\u6536\u76ca\uff1aOceanBase \u662f\u539f\u751f\u7684\u5206\u5e03\u5f0f\u7cfb\u7edf\uff0c\u6709\u7740\u826f\u597d\u7684\u6269\u5c55\u6027\u3002\u800c\u4e14\u8fd8\u53ef\u4ee5\u5bf9\u7528\u6237\u63d0\u4f9b\u5c11\u6570\u6d3e\u6545\u969c\u65f6 RPO = 0\uff0cRTO < 8s \u7684\u9ad8\u53ef\u7528\u80fd\u529b\uff0c\u8ba9\u6570\u636e\u5e93\u5728\u4f7f\u7528\u8fc7\u7a0b\u4e2d\u66f4\u52a0\u7a33\u5b9a\u3002\u540c\u65f6\uff0c\u8282\u7701\u4e86\u8d85\u8fc770%\u7684\u5b58\u50a8\u8d44\u6e90\u3002"}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\u602a\u517d\u5145\u7535\uff1a",(0,i.jsx)(e.a,{href:"https://open.oceanbase.com/blog/7057790512",children:"https://open.oceanbase.com/blog/7057790512"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsx)(e.li,{children:"\u884c\u4e1a\uff1a\u667a\u80fd\u5236\u9020"}),"\n",(0,i.jsx)(e.li,{children:"\u75db\u70b9\uff1a\u4e1a\u52a1\u7684\u5feb\u901f\u589e\u957f\uff0c\u4e1a\u52a1\u7cfb\u7edf\u67b6\u6784\u9010\u6e10\u53d8\u5f97\u590d\u6742\u3002\u5386\u53f2\u5e93\u4f7f\u7528 MySQL \u5206\u5e93\u5206\u8868\uff0c\u6c34\u5e73\u6269\u5c55\u80fd\u529b\u5dee\uff0c\u67e5\u8be2\u548c\u4e8b\u52a1\u5747\u6709\u8bf8\u591a\u9650\u5236\u3002"}),"\n",(0,i.jsx)(e.li,{children:"\u6536\u76ca\uff1aOceanBase \u65e2\u53ef\u4ee5\u5782\u76f4\u6269\u5bb9\uff0c\u4e5f\u53ef\u4ee5\u6c34\u5e73\u6269\u5bb9\uff0c\u6269\u7f29\u5bb9\u5feb\u901f\u3001\u900f\u660e\u3001\u65b9\u4fbf\u3002\u5b58\u50a8\u6210\u672c\u964d\u4f4e 71%\u3002"}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\u6e05\u534e\u540c\u65b9\u667a\u6167\u80fd\u6e90\uff1a",(0,i.jsx)(e.a,{href:"https://open.oceanbase.com/blog/10581685536",children:"https://open.oceanbase.com/blog/10581685536"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsx)(e.li,{children:"\u884c\u4e1a\uff1a\u80fd\u6e90\u79d1\u6280"}),"\n",(0,i.jsx)(e.li,{children:"\u75db\u70b9\uff1a\u5386\u53f2\u5e93\u4f7f\u7528 MySQL \u5206\u5e93\u5206\u8868\uff0c\u6c34\u5e73\u6269\u5c55\u80fd\u529b\u5dee\uff0c\u67e5\u8be2\u548c\u4e8b\u52a1\u5747\u6709\u8bf8\u591a\u9650\u5236\u3002"}),"\n",(0,i.jsx)(e.li,{children:"\u6536\u76ca\uff1a\u5b58\u50a8\u6210\u672c\u964d\u4f4e 75%\u3002"}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\u6e38\u5361\u7f51\u7edc\uff1a",(0,i.jsx)(e.a,{href:"https://open.oceanbase.com/blog/7746416928",children:"https://open.oceanbase.com/blog/7746416928"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsx)(e.li,{children:"\u884c\u4e1a\uff1a\u6e38\u620f"}),"\n",(0,i.jsx)(e.li,{children:"\u75db\u70b9\uff1aMySQL \u4f7f\u4e0d\u540c\u4e1a\u52a1\u7684\u8d44\u6e90\u5229\u7528\u7387\u53c2\u5dee\u4e0d\u9f50\u3002\u975e\u7206\u6b3e\u6e38\u620f\u8d44\u6e90\u5229\u7528\u7387\u4f4e\u3002"}),"\n",(0,i.jsx)(e.li,{children:"\u6536\u76ca\uff1a\u591a\u79df\u6237\u8d44\u6e90\u9694\u79bb + \u9ad8\u538b\u7f29\uff0c\u786c\u4ef6\u6210\u672c\u53d8\u4e3a\u539f\u6765\u7684\u4e94\u5206\u4e4b\u4e00\u3002\u5927\u5927\u4e86\u8282\u7701\u786c\u4ef6\u6210\u672c\uff0c\u6bcf\u4e2a\u4e1a\u52a1\u96c6\u7fa4\u8282\u7701\u6570\u5341\u4e07\u5143\u3002"}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\u4f5c\u4e1a\u5e2e\uff1a",(0,i.jsx)(e.a,{href:"https://open.oceanbase.com/blog/8811965232",children:"https://open.oceanbase.com/blog/8811965232"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsx)(e.li,{children:"\u884c\u4e1a\uff1a\u6559\u80b2"}),"\n",(0,i.jsx)(e.li,{children:"\u75db\u70b9\uff1aMySQL \u5b58\u50a8\u6210\u672c\u9ad8\u3002"}),"\n",(0,i.jsx)(e.li,{children:"\u6536\u76ca\uff1a\u5b58\u50a8\u6210\u672c\u964d\u4f4e\u8d85\u516d\u6210\uff0c\u5b9e\u65f6\u5206\u6790\u6027\u80fd\u63d0\u5347 4 \u500d\u4ee5\u4e0a\uff0c\u786c\u4ef6\u6210\u672c\u76f8\u6bd4 MySQL \u964d\u4f4e 77.8%\u3002"}),"\n"]}),"\n"]}),"\n"]})]})}function o(n={}){const{wrapper:e}={...(0,c.R)(),...n.components};return e?(0,i.jsx)(e,{...n,children:(0,i.jsx)(h,{...n})}):h(n)}},59763:(n,e,s)=>{s.d(e,{A:()=>i});const i=s.p+"assets/images/001-99a480dd9de863fb336583653357d379.png"},64152:(n,e,s)=>{s.d(e,{A:()=>i});const i=s.p+"assets/images/002-0731c05a9d3a0a1e8d410c8fab11c9db.png"},28453:(n,e,s)=>{s.d(e,{R:()=>a,x:()=>r});var i=s(96540);const c={},l=i.createContext(c);function a(n){const e=i.useContext(l);return i.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function r(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(c):n.components||c:a(n.components),i.createElement(l.Provider,{value:e},n.children)}}}]);