export { };
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client } from "eris"
const { CommandStructure, EmbedBuilder } = require('../../components/Commands/CommandStructure');

module.exports = class GlobalChatCommand extends CommandStructure {
    constructor(ket: Client) {
        super(ket, {
            name: 'globalchat',
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
            data: new SlashCommandBuilder()
                .addSubcommand(c =>
                    c.setName('create')
                )
                .addSubcommand(c =>
                    c.setName('stop'))
                .addSubcommand(c =>
                    c.setName('getinfo'))
        })
    }
    async execute({ ctx, args }) {

    }
}