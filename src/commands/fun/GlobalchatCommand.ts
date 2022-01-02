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
                        .setDescription('Start the global chat in this server')
                        .addChannelOption(option => option.setName('channel').setDescription('The channel'))
                )
                .addSubcommand(c =>
                    c.setName('stop')
                        .setDescription('Stop the global chat in this server')
                )
                .addSubcommand(c =>
                    c.setName('getinfo')
                        .setDescription('fetch the info of a message')
                        .addStringOption(option =>
                            option.setName('messageid')
                                .setDescription('The ID of the message')
                                .setRequired(true)
                        )
                )
        })
    }
    async execute(ctx) {
        if(!ctx.args[0]) return this.ket.say({ ctx, content: {  } })
        switch(ctx.args[0].toLowerCase()) {
            case 'create':
            case 'stop':
            case 'getinfo':
        }
        console.log(ctx.args)
    }
}