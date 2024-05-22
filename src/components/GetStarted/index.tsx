import Translate from '@docusaurus/Translate'
import clsx from 'clsx'
import styles from './styles.module.css'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'

export const GetStarted = (): JSX.Element => {
  return (
    <div >
      <div className="hero" style={{ paddingBottom: 0 }}>
        <div className="container" style={{ alignItems: "center", textAlign: "center" }}>
          <h1 className="hero__title"><Translate>Get started with OceanBase Database</Translate></h1>
          <p className="hero__subtitle"><Translate>How to deploy OceanBase Database in a demo environment, a cluster, or a container for quick hands-on experience. </Translate></p>
          <div className={clsx("shadow--lw padding--md", styles.hyphens)}><Translate>OceanBase Database provides an all-in-one installation package since V4.0.0. You can use this package to install OceanBase Deployer (OBD), OceanBase Database, OceanBase Database Proxy (ODP), OceanBase Agent (OBAgent), Grafana, and Prometheus at a time. Since V4.1.0, you can also use the all-in-one package to install OceanBase Cloud Platform (OCP) Express. You can choose to install some or all of the components as needed.</Translate></div>
        </div>
      </div>
      <div style={{ padding: 64 }}>
        <Tabs className={styles.tabsCenter} lazy>
          <TabItem value="youtube" label="Youtube" >
            <iframe
              className={styles.video}
              src="https://www.youtube.com/embed/Eo8ky14W6lg?si=ICkztNiDZZ5WowCe"
              title="Introduction to OceanBase Database"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </TabItem>
          <TabItem value="bilibili" label="Bilibili">
            <iframe
              className={styles.video}
              src="https://player.bilibili.com/player.html?isOutside=true&aid=697846412&bvid=BV1Jm4y1y7XB&cid=1107074071&p=1"
              allowFullScreen
              title="Introduction to OceanBase Database"
              allow='autoplay; fullscreen; picture-in-picture'
            />
          </TabItem>
        </Tabs>
      </div>
    </div>
  )
}