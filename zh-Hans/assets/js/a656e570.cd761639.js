"use strict";(self.webpackChunkmy_docs_website=self.webpackChunkmy_docs_website||[]).push([[4600],{366:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>r,contentTitle:()=>s,default:()=>h,frontMatter:()=>i,metadata:()=>c,toc:()=>l});var a=n(4848),o=n(8453);const i={slug:"adaptive-sql-execution-engine",title:"Adaptive Techniques in the OceanBase SQL Execution Engine"},s=void 0,c={permalink:"/zh-Hans/blog/adaptive-sql-execution-engine",editUrl:"https://github.com/oceanbase/oceanbase.github.io/tree/main/blog/tech-adaptive-engine.md",source:"@site/blog/tech-adaptive-engine.md",title:"Adaptive Techniques in the OceanBase SQL Execution Engine",description:'I have been studying the book "An Interpretation of OceanBase Database Source Code" and noticed that it contains very little content about the SQL executor. The book focuses on parallel execution in the executor. This blog post introduces some common adaptive techniques in the executor of OceanBase Database. You can take it as a supplement to the executor part in this book.',date:"2024-06-03T13:23:07.000Z",formattedDate:"2024\u5e746\u67083\u65e5",tags:[],readingTime:11.445,hasTruncateMarker:!0,authors:[],frontMatter:{slug:"adaptive-sql-execution-engine",title:"Adaptive Techniques in the OceanBase SQL Execution Engine"},unlisted:!1,prevItem:{title:"How OB Cloud Achieves Cost Reduction and Efficiency Improvement in Replacing MySQL Scenarios \uff1f",permalink:"/zh-Hans/blog/obcloud"},nextItem:{title:"OceanBase Distributed Pushdown Technology",permalink:"/zh-Hans/blog/distributed-push-down"}},r={authorsImageUrls:[]},l=[{value:"Challenges facing AP performance improvement",id:"challenges-facing-ap-performance-improvement",level:2}];function u(e){const t={blockquote:"blockquote",h2:"h2",li:"li",p:"p",ul:"ul",...(0,o.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)(t.blockquote,{children:["\n",(0,a.jsx)(t.p,{children:'I have been studying the book "An Interpretation of OceanBase Database Source Code" and noticed that it contains very little content about the SQL executor. The book focuses on parallel execution in the executor. This blog post introduces some common adaptive techniques in the executor of OceanBase Database. You can take it as a supplement to the executor part in this book.'}),"\n"]}),"\n",(0,a.jsx)(t.h2,{id:"challenges-facing-ap-performance-improvement",children:"Challenges facing AP performance improvement"}),"\n",(0,a.jsx)(t.p,{children:"If you want to improve the AP performance of a database, you will face three challenges:"}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsx)(t.li,{children:"First, the optimizer cannot ensure that its estimates are always absolutely accurate. The reasons are complex. For example, the statistics are inaccurate in some scenarios, or the cost model is inconsistent with the actual model. These reasons will contribute to a non-optimal execution plan."}),"\n",(0,a.jsx)(t.li,{children:"Second, data skew often occurs in production and business scenarios, which will significantly affect the execution efficiency, especially the parallel execution efficiency."}),"\n",(0,a.jsx)(t.li,{children:"Third, the semantics of NULL are special. Characteristics of widespread NULL values are different from those of normal values in operations such as joins, but this is easily ignored. The executor must perform special processing on NULL values. Otherwise, various bad cases can occur."}),"\n"]}),"\n",(0,a.jsx)(t.p,{children:"Adaptive techniques enable the execution engine to dynamically adjust the execution strategy based on the actual situation, thereby improving the execution performance. In a word, adaptive techniques are introduced to address the preceding challenges. Next, let me introduce some typical adaptive techniques in the executor of OceanBase Database."})]})}function h(e={}){const{wrapper:t}={...(0,o.R)(),...e.components};return t?(0,a.jsx)(t,{...e,children:(0,a.jsx)(u,{...e})}):u(e)}},8453:(e,t,n)=>{n.d(t,{R:()=>s,x:()=>c});var a=n(6540);const o={},i=a.createContext(o);function s(e){const t=a.useContext(i);return a.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function c(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:s(e.components),a.createElement(i.Provider,{value:t},e.children)}}}]);