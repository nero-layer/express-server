import { generatePrivateKey, nip19, validateEvent, verifySignature, getEventHash,getSignature, finishEvent, getPublicKey, nip44, relayInit, SimplePool } from 'nostr-tools'

import 'dotenv/config'

const damus = "wss://relay.damus.io"
const scsi = "wss://nostr-pub.wellorder.net"
const purplepag = "wss://purplepag.es"
const relays = [damus, scsi, purplepag]

// npub15xlr6r7feh9w74s4936xvmfc3adkcu9lq3fkw974hhqa2r2ka24q3a3hyr
// ["EVENT",{"kind":4,"tags":[["p","a1be3d0fc9cdcaef56152c74666d388f5b6c70bf04536717d5bdc1d50d56eaaa"]],"pubkey":"cda3a18bb150a58387383b7a2d332423994a1979d8ba61be1d26dafaf6a3d6b2","content":"CzCC7mMVT7ZGJOHvOUgTwQ==?iv=p05fBmTDU4t+qFK2JHhZnw==","created_at":1697969153,"id":"b9cc893fdfad5409b3e76006e7efd619f79b726edc30bc05a5c1b4b09ef25a7d","sig":"66e31514d6573dc8a0a2546daefa2cbeb9cd4802ae3836ace6288685c1143015aa8d0c87d27639ce2f28d16725e886eb837f1e26b76f37c0effb93872e7fb715"}]


let nsec = process.env.NOS;//""
console.log("PRINT THAT PRIVATE KEY")
console.log(nsec)
let { type, data } = nip19.decode(nsec)
let sk = data
console.log(type)
console.log(sk)
console.log("Test")
// let sk = generatePrivateKey() // `sk` is a hex string

let pk = getPublicKey(sk) // `pk` is a hex string
let pubkey = "ek36rza32zjc8pec8daz6veyywv55xtemzaxr0saymd04a4r66eqpxphdl"
let message = "I Like Pie"
console.log(Object.keys(nip44))
// let key = nip44.getSharedSecret(sk, pubkey)
let ciphertext = nip44.encrypt(pubkey, message)
let event = {
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    pubkey: pk,
    tags: [],
    // tags: [['p', pubkey]],
    content: "test os nostr-tools"//ciphertext
  }
event.id = getEventHash(event)
let ok = await validateEvent(event)// npub15xlr6r7feh9w74s4936xvmfc3adkcu9lq3fkw974hhqa2r2ka24q3a3hyr
// event.sig = await getSignature(event, pk)
const signedEvent = finishEvent(event, sk)
let veryOk = await verifySignature(signedEvent)
console.log("ok")
console.log(ok)
console.log(veryOk)
console.log(event)
const relay = relayInit(scsi)
await relay.connect()
let published_event = await relay.publish(signedEvent)

console.log(published_event)
console.log("Checking")
let event_check = await relay.get({
    ids: [event.id],
  })
console.log(event_check)