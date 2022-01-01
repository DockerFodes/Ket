export { };
import { Client } from "eris"
const { CommandStructure, EmbedBuilder } = require('../../components/Commands/CommandStructure');

module.exports = class GlobalChatCommand extends CommandStructure {
    constructor(ket: Client) {
        super(ket, {
            name: 'globalchat',
            description: 'cu',
            aliases: ['chatglobal', 'global'],
            category: 'fun',
            cooldown: 5,
            permissions: {
                user: [],
                bot: [],
                onlyDevs: false
            },
            access: {
                DM: false,
                Threads: false
            },
            dontType: false,
            testCommand: [],
        })
    }
    async execute({ ctx, args }) {

    }
}