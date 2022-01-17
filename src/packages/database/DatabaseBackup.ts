import { Client } from "eris"

module.exports = (ket: Client) => {
    setInterval(() => {
        let db = global.session.db;
        Object.entries(db).forEach(async ([key, value]) => typeof value === 'object'
                ? ket.createMessage(ket.config.channels.database, `Backup da table \`${key}\``, { name: `${key}.json`, file: JSON.stringify((await db[key].getAll())) })
                : null)
    }, 60_000 * 30)
}