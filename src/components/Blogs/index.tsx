import clsx from 'clsx'
import styles from "./styles.module.css"
import Link from '@docusaurus/Link'

type BlogPost = {
  title: string
  image: string
  description: string
  link: string
}

const posts: BlogPost[] = [
  {
    title: "Data Compression Technology Explained Balance between Costs & Performance",
    image: "https://obportal.s3.ap-southeast-1.amazonaws.com/obc-blog/img/d105da79260f4d6a8a03571e4a2b17091682305027576.jpg",
    description: "With more and more data being generated, storage and maintenance costs are increasing accordingly. Data compression seems to be a natural choice to reduce storage costs.",
    link: "/blog/compression-ratio",
  },
  {
    title: "Implementing a Vectorized Engine in a Distributed Database",
    image: "https://obportal.s3.ap-southeast-1.amazonaws.com/obc-blog/img/d105da79260f4d6a8a03571e4a2b17091682306489558.jpg",
    description: "When talking to customers, we found that many users want to perform OLAP tasks such as JOIN queries and aggregate analysis while they are processing online transactions. The SQL execution engine of a database must be highly productive in order to deal with OLAP tasks, which often involve the processing of massive data and complicated computing and queries, and are therefore time-consuming.",
    link: "/blog/vectorized-engine",
  },
  {
    title: "Flink CDC + OceanBase integration solution for full and incremental synchronization",
    image: "https://yqintl.alicdn.com/5e631659fe9e02433a696c628bb56f63ddaa6ad2.png",
    description: "OceanBase is a distributed database developed by Ant Group. The project was established in 2010 and developed iteratively. Its earliest application is to Taobao's favorites. In 2014, the OceanBase R&D Team moved from Taobao to Ant Group, mainly responsible for Alipay's internal de-IOE work. It means replacing the Oracle database used by Alipay. Currently, all the data in Ant Group databases have been migrated to OceanBase. On June 1, 2021, OceanBase was officially opened source to the public, and a MySQL-compatible version was launched.",
    link: "/blog/flink-cdc",
  },
  {
    title: "Integrated Architecture of OceanBase Database",
    image: "https://obportal.s3.ap-southeast-1.amazonaws.com/obc-blog/img/d105da79260f4d6a8a03571e4a2b17091682302303091.jpg",
    description: "The architecture of OceanBase Database V4.0 allows you to deploy a distributed database or a MySQL-like standalone database in the same way that you are familiar with. If you deploy a standalone OceanBase database or a single-container tenant in an OceanBase cluster, the database provides the same efficiency and performance as a conventional standalone database does.",
    link: "/blog/integrated-architecture",
  },
  {
    title: "Integrated SQL Engine in OceanBase Database",
    image: "https://obportal.s3.ap-southeast-1.amazonaws.com/obc-blog/img/d105da79260f4d6a8a03571e4a2b17091682302303091.jpg",
    description: "In serial execution, if the table or partition involved is located on the local server, the execution process is exactly the same as that of an SQL statement on a local or standalone server. If the required data is stored on another server, OceanBase Database either fetches the remote data and processes it on the local server or performs remote execution. In remote execution, if all data required in a transaction is located on another server, OceanBase Database forwards the transaction to that server, which will access the storage, process the data, commit the transaction, and then return the results.",
    link: "/blog/integrated-sql-engine",
  },
  {
    title: "The architectural evolution of OceanBase Database",
    image: "https://obportal.s3.ap-southeast-1.amazonaws.com/obc-blog/img/d105da79260f4d6a8a03571e4a2b17091682302303091.jpg",
    description: "The development of the OceanBase Database started in 2010. The first version, OceanBase Database V0.5, consists of a storage layer and a computing layer, as shown in the figure below. The computing layer, which is stateless, provides SQL services, and the storage layer is a storage cluster of two types of servers.",
    link: "/blog/architectural-evolution",
  },
]

export const Blogs = (): JSX.Element => {
  return (
    <div>
      <div className="hero" style={{ marginBottom: 32 }}>
        <div className="container" style={{ alignItems: "center", textAlign: "center" }}>
          <h1 className="hero__title">Blogs</h1>
          <p className="hero__subtitle">A place where you can find updates, best practices, and inspiration about OceanBase and distributed database.</p>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className={"row"}>
          {posts.map((post, index) => <div className={"col col--4"} key={index}>
            <Link className={clsx("card", styles.card)} style={{ cursor: "pointer", marginBottom: 32 }} to={post.link}>
              <div className="card__header" style={{minHeight: 90}}>
                {/* <h2>{index + 1}</h2> */}
                <h3>{post.title}</h3>
              </div>
              <div className="card__image">
                <img
                  src={post.image}
                  alt={post.title}
                  title={post.title}
                  className={styles.cardImage}
                />
              </div>
              <div className="card__body" style={{ height: 200, position: "relative" }}>
                <p className={styles.truncateMultiline}>
                  {post.description}
                </p>
                <div className={styles.navArrow}>
                  &gt;&gt;
                </div>
              </div>
            </Link>
          </div>)}
        </div>
      </div>
    </div>
  )
}