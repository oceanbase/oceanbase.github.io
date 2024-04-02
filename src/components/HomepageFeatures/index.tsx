import clsx from 'clsx'
import Heading from '@theme/Heading'
import styles from './styles.module.css'
import Translate, { translate } from '@docusaurus/Translate'

type FeatureItem = {
  title: string
  Svg?: React.ComponentType<React.ComponentProps<'svg'>>
  imgSrc?: string
  description: JSX.Element
}

const FeatureList: FeatureItem[] = [
  {
    title: translate({ message: 'Highly Compatible with MySQL' }),
    imgSrc: require('@site/static/img/compatibility.png').default,
    description: (
      <Translate>
        Fully compatible with the MySQL protocol, from data types, SQL syntax, to functions/expressions, and the optimizer, OceanBase allows for migration without modifying application code. It supports the MySQL Binlog protocol, seamlessly integrating with the downstream data ecosystem of MySQL.
      </Translate>
    )
  },
  {
    title: translate({ message: 'Performant and Scalable "MySQL"' }),
    imgSrc: require('@site/static/img/scalable.png').default,
    description: (
      <Translate>
        Balances the scalability of distributed architecture with the performance benefits of centralized structures. In distributed scenarios, it achieves a TPC-C benchmark of 707 million tpmC, and in single-instance primary-secondary configurations with 4-core specifications, its performance is 1.8 times that of MySQL 8.0, reliably handling critical workloads of any scale.
      </Translate>
    )
  },
  {
    title: translate({ message: 'Enhanced Stability and High Availability' }),
    imgSrc: require('@site/static/img/ha.png').default,
    description: (
      <Translate>
        Tested and proven with over 1000 users in production systems, it meets the business continuity requirements under stringent conditions. Its distributed form can achieve automatic failure recovery with RPO=0 and RTO&lt;8s, while single-instance primary-secondary configurations have a failure switch-over time RTO&lt;3s, minimizing business application latency disruptions to the greatest extent.
      </Translate>
    )
  },
  {
    title: translate({ message: 'A New Generation Data Architecture for Multi-tenancy' }),
    imgSrc: require('@site/static/img/tenancy.png').default,
    description: (
      <Translate>
        Natively supports multi-tenant architecture and resource isolation capabilities, allowing a single cluster to serve multiple independent businesses. It provides DBaaS capabilities for typical resource-isolated tenant scenarios such as database integration and SAAS, enhancing resource utilization and greatly simplifying the operational complexity of database infrastructure.
      </Translate>
    )
  },
  {
    title: translate({ message: 'Transparent High-Ratio Data Compression' }),
    imgSrc: require('@site/static/img/compression.png').default,
    description: (
      <Translate>
        Through the LSM-Tree storage engine and advanced data compression technology, it saves up to 70-90% in storage costs, offering superior solutions for historical databases, Hbase, and other large-volume, low-query scenarios.
      </Translate>
    )
  },
  {
    title: translate({ message: 'HTAP for Real-Time Data Analytics' }),
    imgSrc: require('@site/static/img/htap.png').default,
    description: (
      <Translate>
        Supports both transaction processing and real-time analytics workloads on a single set of data. It does not interfere with critical business processes or incur additional costs, providing fast query analysis capabilities for real-time computing, real-time data warehousing, and other scenarios, accelerating real-time business insights.
      </Translate>
    )
  },
]

function Feature({ title, Svg, description, imgSrc: Img }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        {Svg && <Svg className={styles.featureSvg} role="img" />}
        {Img && <img src={Img} className={styles.featureSvg} />}
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
