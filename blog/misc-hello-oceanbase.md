---
slug: hello-oceanbase
title: "Hello OceanBase! The first lesson for becoming an OceanBase contributor"
---

> About the author: Xia Ke, a contributor of OceanBase Community, has engaged in the design and development of financial core systems for years. He is now working on the investigation of China-made databases in a subsidiary of a stock exchange, and has recently obtained OceanBase Certified Associate (OBCA) and PingCAP Certified TiDB Associate (PCTA) certificates.

# Introduction

The other day I read this post [Decoding OceanBase (11): Expressions and Functions](https://open.oceanbase.com/blog/8600156?currentPage=undefined) by Zhuweng, a Peking University alumnus, director of OceanBase kernel R&D. At the end, he mentioned that creating a built-in function is the first test for new recruits joining the SQL team of OceanBase. Though having no intention of looking for a new job, I was so intrigued by this **first test**. I am not a database administrator, so I have not spent much time working with databases until lately when I started learning about top-notch home-grown database products for job reasons. As far as my job description is concerned, I have "walked out of my circle" to do the test. After reading posts from popular IT communities and participating in open online courses, I was deeply impressed by the vigorous momentum of the database ecosystem in China. I want to say thank you to database developers and engineers who have shared their experience, which enables laymen like me to quickly get on track. Benefiting from their good deeds, I would like to take this opportunity to make my contributions to the OceanBase community, hoping that you might find it useful.

<!-- truncate -->

# Overview

Seeing `Hello OceanBase` in the title, you may think of "Hello World". Yes, that is exactly the vibe I wanted to strike here. This post is a "Hello World" demo that shows you how to create or modify a built-in function in OceanBase Database, or in other words, how to do secondary development based on OceanBase Database Community Edition. In addition to being motivated by `Zhuweng`, I want to take this test also because of the requirement for extending database capabilities by using external functions. Oracle allows users to call external C or JAVA functions, just like calling built-in functions. In a sense, this feature makes a database more capable. Users can call external C or JAVA functions to, for example, implement complex mathematical algorithms, which may otherwise cause troubles by using SQL statements or Oracle built-in functions. Of course, you can always implement those algorithms at the business layer, but maybe we can talk about that in another post. Based on my research on a bunch of home-grown databases, I have come up with similar procedures for using external functions. You can take a look at them in my posts [Implement Oracle external functions in Dameng DM8 Database](https://blog.csdn.net/xk_xx/article/details/123091480?spm=1001.2014.3001.5501) and [Implement PostgreSQL UDFs by using the contrib module](https://blog.csdn.net/xk_xx/article/details/123011397?spm=1001.2014.3001.5501). Calling external functions in DM8 is basically the same as in Oracle, except for some slight implementation differences. Some databases, such as openGauss, MogDB, TDSQL PostgreSQL, and KingbaseES, come with an PostgreSQL kernel, and they inherently support the extension mechanisms of PostgreSQL. To the best of my knowledge, however, OceanBase Database does not support external functions. So, I wondered if I could not find a way out, a way in might do the trick. Let's start with "Hello OceanBase".

# Preparations

## An OceanBase cluster

You can find tons of posts in the community about how to deploy OceanBase Database in all kinds of supported modes. Here are some of my posts in this regard: [Use Docker to deploy OceanBase Database](https://blog.csdn.net/xk_xx/article/details/122757336), [Manually deploy OceanBase Database in standalone mode](https://blog.csdn.net/xk_xx/article/details/122763419), and [Use OBD to locally deploy OceanBase Database in standalone mode](https://blog.csdn.net/xk_xx/article/details/123166584). To implement the demo, I recommend that you pick an easy one and use OceanBase Deployer (OBD) to locally deploy a standalone OceanBase database in a development environment.

## OceanBase source code

You can get the latest source code by running the following command: `git clone https://github.com/oceanbase/oceanbase`

# Code structure

You can take a look at the `Decoding OceanBase` serial posts of the community for details.

Here, let me briefly describe the code related to the `sql/resolver/expr` directory.

## Register a built-in function

![](https://gw.alipayobjects.com/zos/oceanbase/ec1d519b-9b37-4d6e-9b86-68074ff85e3b/image/2022-03-04/78c15e68-ea1b-40f0-b4e7-07b71454a82b.png)

```C++
    #define REG_OP(OpClass)                                                \do {                                                                 \
        OpClass op(alloc);                                                 \if (OB_UNLIKELY(i >= EXPR_OP_NUM)) {                               \
          LOG_ERROR("out of the max expr");                                \
        } else {                                                           \
          NAME_TYPES[i].name_ = op.get_name();                             \
          NAME_TYPES[i].type_ = op.get_type();                             \
          OP_ALLOC[op.get_type()] = ObExprOperatorFactory::alloc<OpClass>; \
          i++;                                                             \
        }                                                                  \
      } while (0)
```

---

## Diagram of the expr class

![](https://gw.alipayobjects.com/zos/oceanbase/69375afc-a8a4-4cdf-b339-5cd3ebfe84be/image/2022-03-04/726f726f-7ed3-4060-b909-6595697154b3.png)

Built-in functions mainly implement the ObExprOperator interface class, which contains many functions.

The `calc_result_type0` and `calc_result0` functions specify the memory allocation and type definition for function registration. The `cg_expr` function registers the function pointer to the `eval_func_` function. The built-in function `rt_expr.eval_func_ = ObExprHello::eval_hello;` is called by using the function pointer. `eval_hello` is the function that actually do the job.

## Develop Hello OceanBase

In this project, you need to modify the files shown in the following figure.

![](https://gw.alipayobjects.com/zos/oceanbase/b33bf6b7-47c4-4d2e-b3f8-31e1a2349567/image/2022-03-04/38ff080c-902e-4976-9b12-6113ba751b0d.png)

### 1. Create the ObExprHello class

Many implementation examples are provided in the `sql/resolver/expr` directory. You can select reference objects as needed.

```C++
    #ifndef _OB_EXPR_HELLO_H_
    #define  _OB_EXPR_HELLO_H_

    #include  "sql/engine/expr/ob_expr_operator.h"

    namespace  oceanbase {
    namespace  sql {
    class  ObExprHello : public  ObStringExprOperator {
    public:
      explicit  ObExprHello(common::ObIAllocator&  alloc);
      virtual  ~ObExprHello();
      virtual  int  calc_result_type0(ObExprResType&  type, common::ObExprTypeCtx&  type_ctx) const;
      virtual  int  calc_result0(common::ObObj&  result, common::ObExprCtx&  expr_ctx) const;

      static  int  eval_hello(const  ObExpr&  expr, ObEvalCtx&  ctx, ObDatum&  expr_datum);
      virtual  int  cg_expr(ObExprCGCtx&  op_cg_ctx, const  ObRawExpr&  raw_expr, ObExpr&  rt_expr) const  override;

    private:
      DISALLOW_COPY_AND_ASSIGN(ObExprHello);
    };

    } /* namespace sql */
    } /* namespace oceanbase */

    #endif
```

The content of the new file `ob_expr_hello.cpp` is as follows:

```C++
    #define  USING_LOG_PREFIX SQL_ENG
    #include  "sql/engine/expr/ob_expr_hello.h"
    static  const  char* SAY_HELLO = "Hello OceanBase!";

    namespace  oceanbase {
    using  namespace  common;
    namespace  sql {

    ObExprHello::ObExprHello(ObIAllocator& alloc) : ObStringExprOperator(alloc, T_FUN_SYS_HELLO, N_HELLO, 0)
    {}

    ObExprHello::~ObExprHello()
    {}

    int  ObExprHello::calc_result_type0(ObExprResType&  type, ObExprTypeCtx&  type_ctx) const
    {
      UNUSED(type_ctx);
      type.set_varchar();
      type.set_length(static_cast<common::ObLength>(strlen(SAY_HELLO)));
      type.set_default_collation_type();
      type.set_collation_level(CS_LEVEL_SYSCONST);
      return  OB_SUCCESS;
    }

    int  ObExprHello::calc_result0(ObObj&  result, ObExprCtx&  expr_ctx) const
    {
      UNUSED(expr_ctx);

      result.set_varchar(common::ObString(SAY_HELLO));
      result.set_collation(result_type_);
      return  OB_SUCCESS;
    }

    int  ObExprHello::eval_hello(const  ObExpr&  expr, ObEvalCtx&  ctx, ObDatum&  expr_datum)
    {
      UNUSED(expr);
      UNUSED(ctx);
      expr_datum.set_string(common::ObString(SAY_HELLO));
      return  OB_SUCCESS;
    }

    int  ObExprHello::cg_expr(ObExprCGCtx&  op_cg_ctx, const  ObRawExpr&  raw_expr, ObExpr&  rt_expr) const
    {
      UNUSED(raw_expr);
      UNUSED(op_cg_ctx);
      rt_expr.eval_func_ = ObExprHello::eval_hello;
      return  OB_SUCCESS;
    }
    }  // namespace sql
    }  // namespace oceanbase
```

### 2. Modify or add the function name definition

- ob_name_def.h

The function name is registered here and can be used for syntax parsing.

![](https://gw.alipayobjects.com/zos/oceanbase/889fe5d5-bcc4-49ee-90c2-65c8d5a8e0d7/image/2022-03-04/0736c95b-c1be-4e3d-984b-2422fd3dee7f.png)![](https://gw.alipayobjects.com/zos/oceanbase/d03c52a3-a866-4f3d-bac7-ac5201428edc/image/2022-03-04/606b6b77-f22a-4b38-9515-3c9cf03a3ffb.png)

### 3. Modify the factory class

ob_expr_operator_factory.cpp

The function pointer is registered at this step, and will be used for calling the specific built-in function at runtime.

![](https://gw.alipayobjects.com/zos/oceanbase/f07b83a3-4d9e-4169-bd6c-620e9a1b02b8/image/2022-03-04/d67d1e07-8e82-4169-b400-19f30d813d19.png)

- Register a built-in function

![](https://gw.alipayobjects.com/zos/oceanbase/e544598d-cb7d-4b8d-ae8a-85fa04f802c8/image/2022-03-04/bb53c1e7-27f7-4370-a7cc-619241c945b2.png)

### 4. Add IDs

- ob_item_type.h

You can take an ID as a key that points to the function pointer.

![](https://gw.alipayobjects.com/zos/oceanbase/597a87f1-1998-41f0-8c5d-29a818026d92/image/2022-03-04/8223570b-4af3-438d-a533-e20eec745e17.png)

### 5. Modify project files

- CMakeLists.txt

Add the new ObExprHello function to the project for compilation.

![](https://gw.alipayobjects.com/zos/oceanbase/7128397f-fcd9-4320-bcb7-982fe9b80a12/image/2022-03-04/458ceecc-d9ba-4fdd-a7ad-c00b89f39935.png)

### 6\. ob_expr_hello.cpp

### ![](https://gw.alipayobjects.com/zos/oceanbase/98290631-db52-4f32-bf1f-4b185907c9ac/image/2022-03-04/2ac97743-4494-4d81-ba5f-25dec9aabe2c.png)

###

### 7.ob_expr_eval_functions.cpp

![](https://gw.alipayobjects.com/zos/oceanbase/b3d7d96d-7c46-445f-883d-473ecb068cd4/image/2022-03-04/d587de86-0571-42bc-8f1e-3081b47b6899.png)

## Compile the function

I'll skip this part. Please read other posts about how to compile the OceanBase source code for details.

And by the way, I have found some compilation errors in the latest code and created a pull request on GitHub, which has been accepted but not yet been merged.

---

## Verify the function

### 1. Replace the observer process

Create a soft connection to points the observer process in the `/root/observer/bin` directory to the observer process in the `/root/.obd/repository/oceanbase-ce/3.1.2/7fafba0fac1e90cbd1b5b7ae5fa129b64dc63aed/bin` directory.

![](https://gw.alipayobjects.com/zos/oceanbase/83dba035-7b05-49c2-828e-0da3bd8c0f8c/image/2022-03-04/d8015f5f-b55c-4bee-bfe1-e16bad69b2ec.png)

### 2. Start the observer process

![](https://gw.alipayobjects.com/zos/oceanbase/9d017a42-5261-4e8a-84e8-e578707c3c41/image/2022-03-04/8de93958-9c77-4932-ac53-55f2389d153f.png)

You may notice that the version is 3.1.3, which is not released yet. We got that result because the latest code was used.

## Test the function

![](https://gw.alipayobjects.com/zos/oceanbase/57787d55-ce12-4960-8e87-f39478f97f68/image/2022-03-04/60705b08-75e1-477b-bf21-5d07bd7902ef.png)

### Suggestions

In the past few months, I have been researching home-grown databases, such as OceanBase Database, TiDB, openGauss, MogDB, and Dameng. They are capable of online transaction processing (OLTP), online analytical processing (OLAP), or hybrid transaction/analytical processing (HTAP). I am not bold enough to compare them as a layman, but as a user, I would like to bring up a few points based on my experience with OceanBase Database.

It took me some time to build the environment, which is acceptable because, after all, it is a distributed system. However, it would be great if users are provided with a tool to quickly build a demo cluster, like the playground of TiDB.

The system is resource-consuming. Users with small-specification devices may suffer deployment failures due to resource insufficiency. They will be grateful if small-specification deployment is supported.

Maybe OceanBase Database can consider supporting user-defined extension interfaces? Some may think that is not a necessary feature, but it is quite useful in some enterprise-level applications, and wins OceanBase a point or two when comparing it to Oracle.

OceanBase Database Enterprise Edition can support more driver APIs for Oracle tenants. For more information, see "Use JDBC to connect to OceanBase Database through JayDeBeApi in Python".

---

## Afterword

Most of posts in the community are intended for database administrators, focusing on deployment, migration, application, performance, and O&M. This one may not attract a large audience. However, I hope it can encourage more better content on the secondary development of open source databases.
