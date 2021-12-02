export {}
const
    prompts = require('prompts'),
    gradient = require('gradient-string'),
    cld = require('child_process'),
    path = require('path'),
    { readFileSync, unlink } = require('fs');

export class KetMenu {
    constructor() { }
    async initialMenu() {
        console.clear()
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
        })
        console.clear()
        switch (menuResponse.value) {
            case 0: return process.exit()
            case 1: return this.start(process.env.CLIENT_DISCORD_TOKEN)
            case 2: return this.start(process.env.BETA_CLIENT_DISCORD_TOKEN)
            case 3: return this.logMenu()
        }
    }
    async logMenu() {
        console.clear()
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
            onCancel: () => this.initialMenu()
        })
        console.clear()
        if (logResponse.value === 0) return this.initialMenu();
        let logChoices = [
            { title: '- Voltar', value: 0 },
            { title: '- Apagar', value: 1, disabled: false }
        ]
        let logs: string = 'bunda'
        try {
            let data = await readFileSync(path.resolve(`${global.dir}/../src/logs/${logResponse.value === 1 ? 'output' : 'errors' }.log`), 'utf8')
            if(data === undefined) {
                logs = 'Nenhum arquivo de log foi encontrado.';
                logChoices[1].disabled = true
            }
            else if(data.length === 0) logs = 'Os logs estão vazios.';
            else logs = data
        } catch(e) {
            logs = 'Nenhum arquivo de log foi encontrado.';
            logChoices[1].disabled = true;
        }
        console.log(gradient.mind(logs))
        let logOptions = await prompts({
            name: 'value',
            message: '',
            type: 'select',
            choices: logChoices,
            initial: 0,
        }, {
            onCancel: () => this.logMenu()
        })
        if(logOptions.value === 1) {
            try {
                unlink(`${global.dir}/../src/logs/${logResponse.value === 1 ? 'output' : 'errors' }.log`, () => {
                    console.log('Logs apagados com sucesso')
                    setTimeout(() => this.logMenu(), 200)
                })

            } catch(e) {
                global.log('error', 'KET PAINEL', 'Não foi possível apagar o arquivo de log.', e)
            }
        }
        else this.logMenu();
    }
    async start(DISCORD_TOKEN: string) {
        let colors = [['red', 'yellow'], ['yellow', 'green'], ['green', 'blue'], ['blue', 'purple']];
        let interval = setInterval(() => {
            console.clear();
            console.log(gradient(colors[Math.floor(Math.random() * colors.length)])('Aguarde um momento, os arquivos estão sendo compilados.'));
        }, 100);
        cld.exec('tsc', () => {
            delete require.cache;
            require('./ProtoTypes').start();
            clearInterval(interval);
            console.clear();
            return require('../../index')(DISCORD_TOKEN);
        })
    }
}

export class TerminalClient {
    ket: any
    commands: any
    constructor(ket) {
        this.ket = ket
        this.commands = new Map()
    }
    registryCommands() {
        this.commands.set([
            ['.help', ],
            ['.exit', ''],
            ['.kill', ''],
            ['.clear', ''],
            ['.compile', ''],
            ['.restart', '']
        ])
    }
    async execute() {
        const ket = this.ket
        termEval()
        async function termEval() {
            const response: any = await prompts({
                name: 'code',
                message: `${ket.user.username}$`,
                type: 'text'
            }, {onCancel: () => console.log(gradient('red', 'purple')('Para encerrar o processo digite .exit (para mais informações use .help)'))});
            let evaled;
            this.commands.get(response.code)

            try {
                switch(response.code) {
                    case '.restart':

                }
                evaled = await eval(response.code)
            } catch(e) {
                global.log('error', 'TERMINAL CLIENT', `houve um erro ao executar o seu código:`, e)
            } finally {
                console.log(evaled)
                termEval()
            }
        }
    }
}