import Prisma from "../../Components/Database/PrismaConnection";
import KetClient from "../../KetClient";
import { channels } from "../../JSON/settings.json";

export default function (ket: KetClient, prisma: Prisma) {
    if (!global.PRODUCTION_MODE) return;
    async function backupAndCacheController() {
        //  Backup da database
        Object.entries(prisma)
            .filter(([key]) => !key.startsWith("_") && !key.startsWith('$'))
            .forEach(async ([key, value]) => typeof value === 'object'
                ? ket.createMessage(channels.database, `Backup da table \`${key}\``,
                    { name: `${key}.json`, file: await prisma[key].findMany() })
                : null);

        //  cache controller
        let users = (await prisma.users.findMany()).map(u => u.id),
            nonCached = [];

        ket.users.forEach((u) => !users.includes(u.id) && u.id !== ket.user.id
            ? ket.users.delete(u.id)
            : null
        );

        users.forEach(user => !ket.users.has(user) ? nonCached.push(user) : null);
        for (let i in nonCached) {
            global.sleep(5);
            await ket.getRESTUser(nonCached[i]);
        }
    }
    setInterval(() => backupAndCacheController(), 60_000 * 30);
    return backupAndCacheController();
}