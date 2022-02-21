import Prisma from "../../Components/Database/PrismaConnection";
import KetClient from "../../Main";
import { channels } from "../../JSON/settings.json";

export default function run(ket: KetClient, prisma: Prisma) {
    if (!global.PRODUCTION_MODE) return;
    if (!prisma.ready) {
        sleep(5000);
        return run(ket, prisma);
    }
    async function backupAndCacheController() {
        //  Backup da database
        Object.entries(prisma)
            .filter(([key, value]) => !key.startsWith("_") && !key.startsWith('$'))
            .forEach(async ([key, value]) => {
                if (typeof value !== 'object') return;
                await sleep(1_000);
                await ket.send({
                    ctx: channels.database, emoji: 'autorizado', content: {
                        embeds: [{ description: `Backup da table \`${key}\`` }],
                        file: [{ name: `${key}.json`, file: (await prisma[key].findMany()) || 'nada' }]
                    }
                })
            });

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
            sleep(3000);
            await ket.getRESTUser(nonCached[i]);
        }
    }
    return backupAndCacheController();
}