import Prisma from "../../Components/Database/PrismaConnection";
import KetClient from "../../Main";
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
        let dbUsers = (await prisma.users.findMany()).map(u => u.id),
            nonCached: string[] = [];

        ket.users.forEach((u) => {
            if (!dbUsers.includes(u.id) && u.id !== ket.user.id)
                return ket.users.delete(u.id);
            delete u.system;
        });

        dbUsers.forEach((user: string) => !ket.users.has(user) ? nonCached.push(user) : null);
        for (let i in nonCached) {
            sleep(5);
            await ket.getRESTUser(nonCached[i]);
        }
    }
    return backupAndCacheController();
}