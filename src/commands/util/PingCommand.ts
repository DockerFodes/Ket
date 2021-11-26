import { CommandStructure } from "../../components/CommandStructure"

export default class PingCommand extends CommandStructure {
    constructor(ket) {
        super(ket, {
            name: 'ping',
            aliases: [],
            cooldown: 3,
            permissions: {
                user: [],
                bot: [],
                onlyDevs: false
            },
            access: {
                DM: true,
                Threads: true
            },
            testCommand: [],
            slashData: null
        })
    }
    async executeVanilla(message) {
        let time = Date.now()
        let msg = await message.channel.createMessage('calculando ping...')
        let totalTime = Date.now() - time
        msg.edit(`tempo de resposta: ${totalTime}ms`)
    }
    async executeSlash(interaction) {

    }
}