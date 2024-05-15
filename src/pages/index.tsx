import clsx from "clsx"
import Link from "@docusaurus/Link"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import Layout from "@theme/Layout"
import HomepageFeatures from "@site/src/components/HomepageFeatures"
import Heading from "@theme/Heading"
import Translate, { translate } from "@docusaurus/Translate"

import styles from "./index.module.css"
import { UsersComp } from '@site/src/components/Users'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">
          <Translate>OceanBase is an enterprise distributed relational database developed by Ant Group.</Translate>
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="docs/tutorial/intro"
          >
            <Translate>Learn about</Translate> OceanBase
          </Link>
          <span className="margin-left--md">
            <a href="https://github.com/oceanbase/oceanbase">
              <img alt="stars" src="https://img.shields.io/badge/dynamic/json?color=white&label=stars&query=stargazers_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2Foceanbase%2Foceanbase" />
            </a>
          </span>
          <span className='margin-left--md'>
            <a href="https://github.com/oceanbase/oceanbase">
              <img alt="forks" src="https://img.shields.io/badge/dynamic/json?color=white&label=forks&query=forks_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2Foceanbase%2Foceanbase" />
            </a>
          </span> 
        </div>
      </div>
    </header>
  )
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="OceanBase is an enterprise distributed relational database."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <UsersComp />
      </main>
    </Layout>
  )
}
