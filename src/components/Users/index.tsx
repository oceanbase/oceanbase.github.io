import Link from "@docusaurus/Link"
import Translate from "@docusaurus/Translate"
import useBaseUrl from '@docusaurus/useBaseUrl'

import citizen from './citizen.json'
import coop from './coop.json'
import overseas from "./overseas.json"

type Partner = {
  name: string
  description?: string
  logoPath: string
}

const coopPartners: Partner[] = coop
const overseasPartners: Partner[] = overseas
const citizenPartners: Partner[] = citizen

function Logos(props: { partners: Partner[] }) {
  return (
    <div className="container" style={{ paddingTop: 20 }}>
      <div className="row">
        {props.partners.map((partner, index) => (
          <div key={index} className="col col--3">
            <div className="text--center" style={{ marginTop: 32 }}>
              <img className="partner__logo" src={useBaseUrl(partner.logoPath)} alt={partner.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function UsersComp(): JSX.Element {
  return <div style={{ marginBottom: 100 }}>
    <div className="hero shadow--lw">
      <div className="container" style={{ alignItems: "center", textAlign: "center" }}>
        <h1 className="hero__title"><Translate>Who is using</Translate> <span>OceanBase</span></h1>
        <p>Please provide information on <Link href='https://github.com/oceanbase/oceanbase/issues/1301'>Who is using OceanBase</Link> to help improving OceanBase better.</p>
      </div>
    </div>
    {/* <Logos partners={coopPartners} /> */}
    {/* <Logos partners={overseasPartners} /> */}
    <Logos partners={citizenPartners} />
  </div>
}