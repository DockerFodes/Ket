import Prisma from "../../Components/Prisma/PrismaConnection";
import KetClient from "../../Main";
import { channels } from "../../JSON/settings.json";
import { getColor } from "../../Components/Commands/CommandStructure";

export default async function run(ket: KetClient, prisma: Prisma) {
    if (!global.PRODUCTION_MODE) return;
    await sleep(30_000);

    return backupAndCacheController();
    async function backupAndCacheController() {
        //  Backup da database
        Object.entries(prisma)
            .filter(([key, value]) => !key.startsWith("_") && !key.startsWith('$'))
            .forEach(async ([key, value], index) => {
                if (typeof value !== 'object') return;
                await sleep((index + 1) * 3000);
                let data = await prisma[key].findMany();
                await ket.send({
                    ctx: channels.database, emoji: 'autorizado', content: {
                        embeds: [{
                            color: getColor('red'),
                            title: key,
                            description: `Documentos: ${data.length}`
                        }],
                        file: [{ name: `${key}.json`, file: JSON.stringify(data) || 'nada' }]
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
            await sleep(3_000);
            await ket.getRESTUser(nonCached[i]);
        }
    }
}