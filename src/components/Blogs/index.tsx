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
    title: "降低分布式数据库使用门槛，谈谈我们对小型化的思考",
    image: "https://images.unsplash.com/photo-1506624183912-c602f4a21ca7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
    link: "https://www.example.com",
  },
  {
    title: "BOSS 直聘——日增10亿数据的历史库，如何通过OceanBase节省70%存储成本？",
    image: "https://images.unsplash.com/photo-1506624183912-c602f4a21ca7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
    link: "https://www.example.com",
  },
  {
    title: "OceanBase 4.3——实时分析AP的里程碑版本",
    image: "https://images.unsplash.com/photo-1506624183912-c602f4a21ca7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.",
    link: "https://www.example.com",
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
            <div className={clsx("card", styles.card)} style={{ cursor: "pointer", marginBottom: 32 }}>
              <div className="card__header">
                {/* <h2>{index + 1}</h2> */}
                <h3>{post.title}</h3>
              </div>
              <div className="card__image">
                <img
                  src={post.image}
                  alt={post.title}
                  title={post.title}
                />
              </div>
              <div className="card__body">
                <p>
                  {post.description}
                </p>
              </div>
            </div>
          </div>)}
        </div>
      </div>
    </div>
  )
}