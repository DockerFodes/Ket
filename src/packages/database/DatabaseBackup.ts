import KetClient from "../../KetClient";

module.exports = (ket: KetClient) => {
    let db = global.session.db;
    if(!ket.config.PRODUCTION_MODE) return;
    if (!db) return setTimeout(() => module.exports(ket), 5_000)

    async function backupAndCacheController() {

        //  Backup da database
        Object.entries(db).forEach(async ([key, value]) => typeof value === 'object'
            ? ket.createMessage(ket.config.channels.database, `Backup da table \`${key}\``, { name: `${key}.json`, file: JSON.stringify((await db[key].getAll())) })
            : null);

        //  cache controller
        let users = (await db.users.getAll()).map(u => u.id),
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