import { Client } from "eris"

module.exports = (ket: Client) => {
    setTimeout(() => {
        let db = global.session.db;
        ket.createMessage(ket.config.channels.database, 'cu')
    }, 60_000 * 30)
}