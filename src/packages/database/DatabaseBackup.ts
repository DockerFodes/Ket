import KetClient from "../../KetClient";

module.exports = (ket: KetClient) => {
    async function backupAndCacheController() {
        //  Backup da database
        let db = global.session.db;
        if (!db) return setTimeout(() => module.exports(ket), 5_000)

        Object.entries(db).forEach(async ([key, value]) => typeof value === 'object'
            ? ket.createMessage(ket.config.channels.database, `Backup da table \`${key}\``, { name: `${key}.json`, file: JSON.stringify((await db[key].getAll())) })
            : null);

        //  cache controller
        let users = (await global.session.postgres.query(`SELECT id from users;`)).rows.map(u => u.id),
            nonCached = [];
        ket.users.forEach((u) => !users.includes(u.id) && u.id !== ket.user.id ? ket.users.delete(u.id) : null);
        users.forEach(user => !ket.users.has(user) ? nonCached.push(user) : null);
        for (let i in nonCached) new Promise((res, rej) => setTimeout(async () => res(await ket.getRESTUser(nonCached[i])), 5_000));

        //  checando banimentos
        (await db.blacklist.getAll()).forEach(async user => !(await db.users.find(user.id)).banned ? db.users.update(user.id, { banned: true }) : null);
    }

    backupAndCacheController();
    setInterval(() => backupAndCacheController(), 60_000 * 30);
}