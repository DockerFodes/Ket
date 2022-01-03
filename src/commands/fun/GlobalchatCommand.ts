export { };
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client } from "eris"
import moment from "moment";
const { CommandStructure, Decoration } = require('../../components/Commands/CommandStructure'),
    { getColor, getEmoji } = Decoration,
    db = global.session.db;

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
                    c.setName('start')
                        .setDescription('Start global chat on an existing channel')
                        .addChannelOption(option => option.setName('channel').setDescription('The channel'))
                )
                .addSubcommand(c =>
                    c.setName('stop')
                        .setDescription('Stop global chat')
                )
                .addSubcommand(c =>
                    c.setName('getinfo')
                        .setDescription('Search information about a message')
                        .addStringOption(option =>
                            option.setName('messageid')
                                .setDescription('The message id')
                                .setRequired(true)
                        )
                )
        })
    }
    async execute(ctx) {
        console.log(ctx.args);
        if (!ctx.args[0]) return this.ket.say({ context: ctx.env, content: { content: 'cu', flags: 0 }, emoji: 'negado' });

        switch (ctx.args[0].toLowerCase()) {
            case 'start':
                let channel = await this.ket.findChannel(ctx.env, ctx.args[1]);
                if (!channel) return this.ket.say({ context: ctx.env, emoji: 'negado', content: ctx.t('globalchat.channelNotFound') });
                await db.servers.update(ctx.gID, {
                    globalchat: channel.id
                })

                return this.ket.say({
                    context: ctx.env, emoji: 'autorizado', content: {
                        embeds: [{
                            color: getColor('green'),
                            ...Object(ctx.t('globalchat.start', { channel }))
                        }]
                    }
                })
            case 'stop':
                await db.servers.update(ctx.gID, {
                    globalchat: null
                })

                return this.ket.say({
                    context: ctx.env, emoji: 'autorizado', content: {
                        embeds: [{
                            color: getColor('green'),
                            ...Object(ctx.t('globalchat.stop', { user: ctx.user }))
                        }]
                    }
                })
            case 'getinfo':
                let message = await this.ket.findMessage(ctx.env, ctx.args[1]),
                    msgData = await db.globalchat.getAll();
                msgData = msgData.find(msg => msg.id === message.id || msg.messages.includes(message.id))

                if (isNaN(Number(ctx.args[1])) && !ctx.env?.messageReference || !message || !msgData)
                    return this.ket.say({ context: ctx.env, emoji: 'negado', content: ctx.t('globalchat.messageNotFound') });

                let userData = await db.users.find(msgData.author),
                    user = await this.ket.findUser(ctx.env, msgData.author),
                    timestamp = moment.utc(message.timestamp).format('LLLL'),
                    isBanned = userData.banned ? 'BANIDO' : 'não banido',
                    messages = msgData.filter(msg => msg.author === user.id).length;

                return this.ket.say({
                    context: ctx.env, content: {
                        embeds: [{
                            color: getColor('green'),
                            ...Object(ctx.t('globalchat.getinfo', { msgData, user, isBanned, timestamp, messages }))
                        }]
                    }
                })

        }
    }
}