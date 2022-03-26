import { PostgresClient } from "../Typings/Modules";
import KetClient from "../../Main";
import prompts from "prompts";

export default async function (ket: KetClient, postgres: PostgresClient) {
    termEval();
    async function termEval() {
        delete require.cache[require.resolve(`./CLI`)];
        let commands = new (require(`./CLI`))(ket, postgres),
            ramUsage = Math.floor(process.memoryUsage().rss / 1024 / 1024) + "MB"

        const response: { code: string } = await prompts({
            name: 'code',
            message: `${ket.user.username}$`,
            type: 'text',
            validate: async (code) => {
                if (!code.startsWith('.')) return true;
                if (!commands.checkCommand(code.split(' ').shift())) return 'Comando não encontrado, digite .help para ver a lista de comandos.';
                else return true;
            }
        }, {
            onCancel: function () {
                console.log('TERMINAL CLIENT', 'Para encerrar o processo digite .exit (para mais informações use .help)', 31);
                return termEval();
            }
        });
        let evaled;
        try {
            if (response.code.startsWith('.')) {
                const args = response.code.trim().split(/ /g);
                return await commands.exec(args.shift(), args)
            }

            evaled = await eval(response.code);
            console.log(evaled);
        } catch (e) {
            console.log('TERMINAL CLIENT', e, 31);
        } finally {
            return termEval();
        }
    }
}