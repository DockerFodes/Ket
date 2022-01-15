import { Client } from "eris";

export { }
const
    prompts = require('prompts'),
    gradient = require('gradient-string'),
    { resolve } = require('path'),
    { readFileSync, unlink } = require('fs');


export async function initialMenu() {
    console.clear();
    let menuResponse = await prompts({
        name: 'value',
        message: gradient('yellow', 'red')(`
    ██╗░░██╗███████╗████████╗  ███╗░░░███╗███████╗███╗░░██╗██╗░░░██╗
    ██║░██╔╝██╔════╝╚══██╔══╝  ████╗░████║██╔════╝████╗░██║██║░░░██║
    █████═╝░█████╗░░░░░██║░░░  ██╔████╔██║█████╗░░██╔██╗██║██║░░░██║
    ██╔═██╗░██╔══╝░░░░░██║░░░  ██║╚██╔╝██║██╔══╝░░██║╚████║██║░░░██║
    ██║░╚██╗███████╗░░░██║░░░  ██║░╚═╝░██║███████╗██║░╚███║╚██████╔╝
    ╚═╝░░╚═╝╚══════╝░░░╚═╝░░░  ╚═╝░░░░░╚═╝╚══════╝╚═╝░░╚══╝░╚═════╝░\n
  ◆ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ❴ ✪ ❵ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ◆\n`),
        type: 'select',
        choices: [
            { title: '- Iniciar Client padrão', value: 1 },
            { title: '- Iniciar Client BETA', value: 2 },
            { title: '- Visualizar LOGS', value: 3 },
            { title: '- Fechar', value: 0 }
        ],
        initial: 0,
    }, {
        onCancel: () => process.exit()
    });
    console.clear();
    switch (menuResponse.value) {
        case 0: return process.exit();
        case 1: return start(process.env.CLIENT_DISCORD_TOKEN);
        case 2: return start(process.env.BETA_CLIENT_DISCORD_TOKEN);
        case 3: return logMenu();
    }
    return;
}
async function logMenu() {
    console.clear();
    let logResponse = await prompts({
        name: 'value',
        message: gradient('yellow', 'red')(`
    ██╗░░░░░░█████╗░░██████╗░░██████╗
    ██║░░░░░██╔══██╗██╔════╝░██╔════╝
    ██║░░░░░██║░░██║██║░░██╗░╚█████╗░
    ██║░░░░░██║░░██║██║░░╚██╗░╚═══██╗
    ███████╗╚█████╔╝╚██████╔╝██████╔╝
    ╚══════╝░╚════╝░░╚═════╝░╚═════╝░\n
  ◆ ▬▬▬▬▬▬▬▬▬▬▬▬▬ ❴ ✪ ❵ ▬▬▬▬▬▬▬▬▬▬▬▬▬ ◆\n`),
        type: 'select',
        choices: [
            { title: '- Logs completos', value: 1 },
            { title: '- Logs de erros', value: 2 },
            { title: '- Voltar', value: 0 },
        ],
        initial: 0,
    }, {
        onCancel: () => initialMenu()
    });
    console.clear();
    if (logResponse.value === 0) return initialMenu();
    let logChoices = [
        { title: '- Voltar', value: 0 },
        { title: '- Apagar', value: 1, disabled: false }
    ];
    let logs: string = 'bunda';
    try {
        let data = await readFileSync(resolve(`${global.session.rootDir}/src/logs/${logResponse.value === 1 ? 'output' : 'errors'}.txt`), 'utf8');
        if (data === undefined) {
            logs = 'Nenhum arquivo de log foi encontrado.';
            logChoices[1].disabled = true;
        }
        else if (data.length === 0) logs = 'Os logs estão vazios.';
        else logs = data;
    } catch (e) {
        logs = 'Nenhum arquivo de log foi encontrado.';
        logChoices[1].disabled = true;
    }
    console.log(gradient.mind(logs));
    let logOptions = await prompts({
        name: 'value',
        message: '',
        type: 'select',
        choices: logChoices,
        initial: 0,
    }, {
        onCancel: () => logMenu()
    });
    if (logOptions.value === 1) {
        try {
            return unlink(`${global.session.rootDir}/src/logs/${logResponse.value === 1 ? 'output' : 'errors'}.txt`, () => {
                console.log('Logs apagados com sucesso');
                return setTimeout(() => logMenu(), 2000);
            })

        } catch (e) {
            return global.session.log('error', 'KET PAINEL', 'Não foi possível apagar o arquivo de log.', e);
        }
    }
    else return logMenu();
}
async function start(DISCORD_TOKEN: string) {
    console.clear();
    return require(`${global.session.rootDir}/index`)(DISCORD_TOKEN);
}

export async function TerminalClient(ket: Client) {
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