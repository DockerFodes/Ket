import KetClient from "../../KetClient";
import prompts from "prompts";
import gradient from "gradient-string";

export default async function (ket: KetClient) {
    termEval();
    async function termEval() {
        delete require.cache[require.resolve(`./CLI`)];
        let commands = require(`./CLI`);

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
                console.log(gradient('red', 'purple')('Para encerrar o processo digite .exit (para mais informações use .help)'));
                return termEval();
            }
        });
        let evaled,
            db = global.session.db;
        try {
            if (response.code.startsWith('.')) {
                const args = response.code.trim().split(/ /g);
                return await eval(`commands${args.shift()}({ ket, args })`);
            }

            evaled = await eval(`${response.code}`);
            console.log(evaled);
        } catch (e) {
            console.log('TERMINAL CLIENT', e, 41);
        } finally {
            return termEval();
        }
    }
}