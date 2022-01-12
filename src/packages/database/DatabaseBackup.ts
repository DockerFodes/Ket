import { Client } from "eris"

module.exports = (ket: Client) => {
    setInterval(async () => {
        let db = global.session.db;
        for (let [key, value] of Object.entries(db))
            return typeof value === 'object'
                ? ket.createMessage(ket.config.channels.database, `Backup da table ${key}`, { name: `${key}.json`, file: JSON.stringify((await db[key].getAll())) })
                : null

    }, 60000 * 30)
}