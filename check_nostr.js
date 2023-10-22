import { generatePrivateKey, nip19, validateEvent, verifySignature, getEventHash,getSignature, finishEvent, getPublicKey, nip44, relayInit, SimplePool } from 'nostr-tools'


const jb55 = "32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245"
const damus = "wss://relay.damus.io"
const scsi = "wss://nostr-pub.wellorder.net"
const purplepag = "wss://purplepag.es"
let nchat = "wss://relay1.nostrchat.io"
const relays = [damus, scsi, purplepag]

const relay = relayInit(scsi)
await relay.connect()
console.log("Checking")
let event_check = await relay.get({
    ids: ["c5cd241bc04f0f287e35cdd2988a8bc7e84d6ee2c509f9acaf9a1c2d46853b43"],
  })
console.log(event_check)