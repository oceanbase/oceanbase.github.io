import Layout from "@theme/Layout"
import Link from "@docusaurus/Link"
import Translate, { translate } from "@docusaurus/Translate"
import useBaseUrl from '@docusaurus/useBaseUrl'

type Partner = {
  name: string
  description?: string
  logoPath: string
}

const partners: Partner[] = [
  {
    name: "CEC",
    logoPath: "/img/partners/cec.png",
  },
  {
    name: "sugon",
    logoPath: "/img/partners/sugon.png",
  },
  {
    name: "inspur",
    logoPath: "/img/partners/inspur.png",
  },
  {
    name: "lenovo",
    logoPath: "/img/partners/lenovo.png",
  },
  {
    name: "紫光恒越",
    logoPath: "/img/partners/ziguanghengyue.png",
  },
  {
    name: "apusic",
    logoPath: "/img/partners/apusic.png",
  },
  {
    name: 'tongtech',
    logoPath: '/img/partners/tongtech.png',
  },
  {
    name: 'primeton',
    logoPath: '/img/partners/primeton.png',
  },
  {
    name: 'bes',
    logoPath: '/img/partners/bes.png',
  },
  {
    name: 'kunpeng',
    logoPath: '/img/partners/kunpeng.png',
  },
  {
    name: 'phytium',
    logoPath: '/img/partners/phytium.png',
  },
  {
    name: 'zhaoxin',
    logoPath: '/img/partners/zhaoxin.png',
  },
]

export default function Users(): JSX.Element {
  return (
    <Layout
      title={"Who is using OceanBase"}
      description="OceanBase is an enterprise distributed relational database."
    >
      <main>
        <div className="hero shadow--lw">
          <div className="container" style={{ alignItems: "center", textAlign: "center" }}>
            <h1 className="hero__title"><Translate>Who is using</Translate> <span>OceanBase</span></h1>
            <p>Please provide information on <Link href='https://github.com/oceanbase/oceanbase/issues/1301'>Who is using OceanBase</Link> to help improving OceanBase better.</p>
          </div>
        </div>
        <Logos />
      </main>
    </Layout>
  )
}

function Logos() {
  return (
    <div className="container" style={{ paddingTop: 20 }}>
      <div className="row">
        {partners.map((partner, index) => (
          <div key={index} className="col col--2">
            <div className="text--center" style={{ marginTop: 20 }}>
              <img className="partner__logo" src={useBaseUrl(partner.logoPath)} alt={partner.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}