import KetClient from "../../KetClient";
import prompts from "prompts";
import gradient from "gradient-string";

export default async function(ket: KetClient) {
    termEval();
    async function termEval() {
        const response: any = await prompts({
            name: 'code',
            message: `${ket.user.username}$`,
            type: 'text',
            validate: async (code) => {
                if (!code.startsWith('.')) return true;
                delete require.cache[require.resolve(`./CLI`)];
                const commands = require(`./CLI`);
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
                delete require.cache[require.resolve(`./CLI`)];
                const commands = require(`./CLI`);
                const args = response.code.trim().split(/ /g);
                return await eval(`commands${args.shift()}({ ket, args })`);
            }

            evaled = await eval(`${response.code}`);
            console.log(evaled);
        } catch (e) {
            global.session.log('error', 'TERMINAL CLIENT', `houve um erro ao executar o seu código:`, e);
        } finally {
            return termEval();
        }
    }
}