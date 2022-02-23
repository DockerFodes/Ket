import KetClient from "../../Main";
import prompts from "prompts";
import Prisma from "../Database/PrismaConnection";

export default async function (ket: KetClient, prisma: Prisma) {
    termEval();
    async function termEval() {
        delete require.cache[require.resolve(`./CLI`)];
        let commands = require(`./CLI`),
            ramUsage = Math.floor(process.memoryUsage().rss / 1024 / 1024) + "MB"

        const response: any = await prompts({
            name: 'code',
            message: `${ket.user.username}$`,
            type: 'text',
            validate: async (code) => {
                if (!code.startsWith('.')) return true;
                if (!eval(`commands${code.trim().split(/ /g).shift()}`)) return 'Comando não encontrado, digite .help para ver a lista de comandos.';
                else return true;
            }
        }, {
            onCancel: function () {
                console.log('TERMINAL CLIENT', 'Para encerrar o processo digite .exit (para mais informações use .help)', 41);
                return termEval();
            }
        });
        let evaled;
        try {
            if (response.code.startsWith('.')) {
                const args = response.code.trim().split(/ /g);
                return await eval(`commands${args.shift()}({ ket, args })`);
            }

            evaled = await eval(response.code);
            console.log(evaled);
        } catch (e) {
            console.log('TERMINAL CLIENT', e, 41);
        } finally {
            return termEval();
        }
    }
}