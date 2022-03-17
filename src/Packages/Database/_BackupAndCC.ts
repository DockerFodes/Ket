import KetClient from "../../Main";
import { channels } from "../../JSON/settings.json";
import { getColor } from "../../Components/Commands/CommandStructure";

export default async function run(ket: KetClient, postgres: PostgresClient) {
    if (!global.PROD) return;
    await sleep(30_000);

    return backupAndCacheController();
    async function backupAndCacheController() {
        //  Backup da database

        for (let i in postgres.tables) {
            await sleep(3000);
            let data = await postgres[postgres.tables[i]].getAll();

            await ket.send({
                ctx: channels.databaseBackup, emoji: 'autorizado', content: {
                    embeds: [{
                        color: getColor('red'),
                        title: postgres.tables[i],
                        description: `Total de documentos: ${data.length}`
                    }],
                    files: [{ name: `${postgres.tables[i]}.json`, file: JSON.stringify(data) || 'nada .-.' }]
                }
            })
        }

        //  cache controller
        let users = (await postgres.users.getAll()).map(u => u.id),
            nonCached: string[] = [];

        ket.users.forEach((u) => {
            if (!users.includes(u.id) && u.id !== ket.user.id)
                return ket.users.delete(u.id);
            delete u.system;
        });

        users.forEach((user: string) => !ket.users.has(user)
            ? nonCached.push(user)
            : null);

        for (let i in nonCached) {
            await sleep(3_000);
            await ket.findUser(nonCached[i]);
        }
    }
}