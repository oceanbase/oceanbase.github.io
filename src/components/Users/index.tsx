import Translate from "@docusaurus/Translate"
import useBaseUrl from '@docusaurus/useBaseUrl'

import clsx from 'clsx'
import citizen from './citizen.json'
import coop from './coop.json'
import overseas from "./overseas.json"

import Carousel from 'react-bootstrap/Carousel'

import './bs.css'

type Partner = {
  name: string
  description?: string
  logoPath: string
}

const coopPartners: Partner[] = coop
const overseasPartners: Partner[] = overseas
const citizenPartners: Partner[] = citizen

function Logos(props: { partners: Partner[] }) {
  const chunks: Partner[][] = props.partners.reduce((acc, item, index) => {
    const chunkIndex = Math.floor(index / 9)
    if (!acc[chunkIndex]) {
      acc[chunkIndex] = []
    }
    acc[chunkIndex].push(item)
    return acc
  }, [])

  return (
    // <div className={clsx("container padding-vert--md shadow--lw margin-top--lg", styles.containerScroll)}>
    <div className={clsx("container")}>
      <Carousel nextLabel="" prevLabel="">
        {chunks.map((chunk, index) => <Carousel.Item key={index}>
          <div className="row" style={{ padding: 120, paddingTop: 80, paddingBottom: 80 }} >
            {chunk.map((partner) => <div key={partner.name} className="col col--4">
              <div className="text--center" style={{ marginBottom: 32, backgroundColor: 'white' }}>
                <img className="partner__logo" src={useBaseUrl(partner.logoPath)} alt={partner.name} />
              </div>
            </div>)}
          </div>
        </Carousel.Item>)}
      </Carousel>
    </div>
  )
}

export function UsersComp(): JSX.Element {
  return <div>
    <div className="hero" style={{ paddingBottom: 0 }}>
      <div className="container" style={{ alignItems: "center", textAlign: "center" }}>
        <h1 className="hero__title"><Translate>Who is using</Translate> <span>OceanBase</span></h1>
        {/* <p>Please provide information on <Link href='https://github.com/oceanbase/oceanbase/issues/1301'>Who is using OceanBase</Link> to help improving OceanBase better.</p> */}
        <p>Trusted by enterprises for mission-critical use cases</p>
        <p>Payments systems, retailing, logistics, education and more - powered by OceanBase</p>
      </div>
    </div>
    {/* <Logos partners={coopPartners} /> */}
    {/* <Logos partners={overseasPartners} /> */}
    <Logos partners={citizenPartners} />
  </div>
}