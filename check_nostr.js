import { generatePrivateKey, nip19, validateEvent, verifySignature, getEventHash,getSignature, finishEvent, getPublicKey, nip44, relayInit, SimplePool } from 'nostr-tools'


const jb55 = "32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245"
const damus = "wss://relay.damus.io"
const scsi = "wss://nostr-pub.wellorder.net"
const purplepag = "wss://purplepag.es"
const relays = [damus, scsi, purplepag]

const relay = relayInit("wss://relay1.nostrchat.io")
await relay.connect()
console.log("Checking")
let event_check = await relay.get({
    ids: ["d0a17bf5cfd45a8a160edfa9fa07a85d4f02343cd17e554c6c6ea532948ef381"],
  })
console.log(event_check)