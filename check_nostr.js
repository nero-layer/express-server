import { generatePrivateKey, nip19, validateEvent, verifySignature, getEventHash,getSignature, finishEvent, getPublicKey, nip44, relayInit, SimplePool } from 'nostr-tools'


const jb55 = "32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245"
const damus = "wss://relay.damus.io"
const scsi = "wss://nostr-pub.wellorder.net"
const purplepag = "wss://purplepag.es"
let nchat = "wss://relay1.nostrchat.io"
const relays = [damus, scsi, purplepag]

const relay = relayInit(damus)
await relay.connect()
console.log("Checking")
let event_check = await relay.get({
    ids: ["7cc100fea7336f156757a09d23290785c857f3ce27d1f57a5d2bad1ebafec1a8"],
  })
console.log(event_check)