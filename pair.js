const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { upload } = require('./mega');

// Faster cleanup
function removeFile(FilePath) {
    if (fs.existsSync(FilePath)) {
        fs.rmSync(FilePath, { recursive: true, force: true });
    }
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    
    async function KAMRAN_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        let sock;
        
        try {
            sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }),
                browser: ["Ubuntu", "Chrome", "20.0.04"],
                syncFullHistory: false,
                shouldSyncHistoryMessage: () => false,
            });
            
            sock.ev.on('creds.update', saveCreds);
            
            if (!sock.authState.creds.registered) {
                // Reduced delay from 1500ms to 500ms for faster code generation
                await delay(500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) {
                    res.send({ code });
                }
            }

            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                
                if (connection === "open") {
                    console.log(`Connection opened: ${sock.user.id}`);
                    
                    // Reduced delay: wait only 2-3 seconds for creds to sync
                    await delay(3000);
                    
                    try {
                        let rf = __dirname + `/temp/${id}/creds.json`;
                        
                        // Check if file exists before proceeding
                        if (!fs.existsSync(rf)) {
                            await delay(2000); // Small extra buffer if file not yet written
                        }

                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "IK~" + string_session;
                        
                        // Send Session ID
                        await sock.sendMessage(sock.user.id, { text: md });
                        
                        // Send Welcome Message
                        await sock.sendMessage(sock.user.id, {
                            text: '*Hello there DR KAMRAN User! \ud83d\udc4b\ud83c\udffb* \n\n> Do not share your session id with anyone. use it only for bot deploy.\n\n *Thanks for using DR KAMRAN Bots \ud83c\uddf5\ud83c\uddf0* \n\n> Join WhatsApp Channel :- ⤵️\n \nhttps://whatsapp.com/channel/0029VbAhxYY90x2vgwhXJV3O\n\n _Dont forget to give star to repos ⬇️_ \n\n- *DR KAMRAN Repository ✅* \n\https://github.com/KAMRAN-SMD/KAMRAN-SMD\n\n- *KAMRAN-MD Repository ✅*\n\nhttps://github.com/KAMRAN-SMD/KAMRAN-MD\n\n> *Powered BY DR KAMRAN* 🖤'
                        });

                        // Follow newsletters in background (no await to save time)
                        await sock.newsletterFollow("120363418144382782@newsletter");
await sock.newsletterFollow("120363425580388209@newsletter");
await sock.newsletterFollow("120363424268743982@newsletter");
                        
                        // Close instantly after sending
                        await delay(2000);
                        await sock.ws.close();
                        removeFile('./temp/' + id);

                    } catch (e) {
                        console.error('Processing Error:', e);
                    }
                } 
                else if (connection === "close") {
                    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
                    if (shouldReconnect) {
                        KAMRAN_MD_PAIR_CODE();
                    }
                }
            });
            
        } catch (err) {
            console.error("Pairing Error:", err);
            removeFile('./temp/' + id);
            if (!res.headersSent) res.send({ code: "❗ Error" });
        }
    }
    
    await KAMRAN_MD_PAIR_CODE();
});

module.exports = router;
