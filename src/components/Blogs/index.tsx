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
    title: "Three Papers from OceanBase Accepted at ICDE 2024",
    image: "https://obportal.s3.ap-southeast-1.amazonaws.com/obc-blog/img/434994947c5a4ee3a710cd277357c7c51716519214943.png",
    description: "From May 13 to 18, 2024, the annual IEEE International Conference on Data Engineering (ICDE 2024) was held in Utrecht, the Netherlands. Three papers co-authored by research teams from colleges, OceanBase, and other partners were accepted and presented at the conference.",
    link: "https://en.oceanbase.com/blog/11614155520",
  },
  {
    title: "Haidilao’s 6-step recipe for successful digital transformation with OceanBase",
    image: "https://obportal.s3.ap-southeast-1.amazonaws.com/obc-blog/img/434994947c5a4ee3a710cd277357c7c51693806847104.png",
    description: "In 2018, Haidilao moved to a digital system for its memberships. However, as the company expanded into more markets and its member numbers increased, it found that its existing database system couldn’t handle the load.",
    link: "https://en.oceanbase.com/blog/5800118528",
  },
  {
    title: "Create a Langchain alternative from scratch using OceanBase",
    image: "https://obportal.s3.ap-southeast-1.amazonaws.com/obc-blog/img/d105da79260f4d6a8a03571e4a2b17091691996101186.png",
    description: "In this blog post, I will share the journey of bringing this idea to life. From integrating AI with OceanBase to training the model and creating a chatbot, we will explore the challenges, the solutions, and the insights gained along the way. Whether you’re an AI enthusiast, a database professional, or simply interested in the intersection of these two fields, I invite you to join me on this exciting exploration.",
    link: "https://en.oceanbase.com/blog/5337315328",
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