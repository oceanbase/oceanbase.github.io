import clsx from 'clsx'
import styles from "./styles.module.css"

type BlogPost = {
  title: string
  image: string
  description: string
  link: string
}

const posts: BlogPost[] = [
  {
    title: "7 Key Technologies to Ensure High Availability in OceanBase Database",
    image: "https://obportal.s3.ap-southeast-1.amazonaws.com/obc-blog/img/d105da79260f4d6a8a03571e4a2b17091682305027576.jpg",
    description: "This article describes the high-availability technologies used in OceanBase Database and answers the some questions about OceanBase Database.",
    link: "https://en.oceanbase.com/blog/2615184384",
  },
  {
    title: "How Alipay Handles Traffic Surge during Double 11 with OceanBase",
    image: "https://images.unsplash.com/photo-1506624183912-c602f4a21ca7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
    description: "Alipay was born in the “IOE” age when the conventional combination of IBM midrange computers, Oracle databases, and EMC storage devices was preferred by companies. The original database system of Alipay used a centralized architecture without sharding that unsurprisingly drowned in the traffic of the first Double 11 shopping festival.",
    link: "https://en.oceanbase.com/blog/2596694784",
  },
  {
    title: "Using OceanBase to build a real-time user analytics pipeline",
    image: "https://obportal.s3.ap-southeast-1.amazonaws.com/obc-blog/img/434994947c5a4ee3a710cd277357c7c51694138540756.png",
    description: "In the digital era we live in, data is everywhere — it’s collected from sources like web and mobile applications, IoT devices, social media interactions, and CRM systems. As a SaaS product owner myself, I’ve seen how this vast array of data sources can become overwhelming when it comes to user behavior analysis and visualization. The challenge is not just in collecting the data, but also in managing and making sense of it.",
    link: "https://en.oceanbase.com/blog/5862202624",
  },
  {
    title: "Unveiling the Secrets of Microservices Architecture",
    image: "https://images.unsplash.com/photo-1506624183912-c602f4a21ca7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
    link: "https://www.example.com",
  },
  {
    title: "Distributed database: the key to building a successful SaaS platform",
    image: "https://images.unsplash.com/photo-1506624183912-c602f4a21ca7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
    link: "https://www.example.com",
  },
  {
    title: "Vector storage: the foundation to build a high-performance LLM application",
    image: "https://images.unsplash.com/photo-1506624183912-c602f4a21ca7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
    link: "https://www.example.com",
  },
]

export const Blogs = (): JSX.Element => {
  return (
    <div>
      <div className="hero" style={{ marginBottom: 64 }}>
        <div className="container" style={{ alignItems: "center", textAlign: "center" }}>
          <h1 className="hero__title">Blogs</h1>
          <p className="hero__subtitle">A place where you can find updates, best practices, and inspiration about OceanBase and distributed database.</p>
        </div>
      </div>
      <div className="container" style={{ marginBottom: 64 }}>
        <div className={"row"}>
          {posts.map((post, index) => <div className={"col col--4"} key={index}>
            <a className={clsx("card", styles.card)} style={{ cursor: "pointer", marginBottom: 32 }} href={post.link} target="_blank">
              <div className="card__header">
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
            </a>
          </div>)}
        </div>
      </div>
    </div>
  )
}