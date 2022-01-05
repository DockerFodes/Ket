export { };
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client } from "eris"
import moment from "moment";
const { CommandStructure, Decoration } = require('../../components/Commands/CommandStructure'),
    { getColor, getEmoji } = Decoration;

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
                        .addChannelOption(option => option.setName('channel').setDescription('Mention the chat or paste the id.').setRequired(true))
                        .addStringOption(option => option.setName('language').setDescription('The Main language of this server.'))
                )
                .addSubcommand(c =>
                    c.setName('stop')
                        .setDescription('Stop global chat')
                )
                .addSubcommand(c =>
                    c.setName('getinfo')
                        .setDescription('Search information about a message.')
                        .addStringOption(option =>
                            option.setName('messageid')
                                .setDescription('The message id')
                                .setRequired(true)
                        )
                )
        })
    }
    async execute(ctx) {
        if (!ctx.args[0]) return await this.ket.say({ context: ctx.env, content: 'kur', emoji: 'negado' });

        switch (ctx.args[0].toLowerCase()) {
            case 'start':
                let channel = await this.ket.findChannel(ctx.env, ctx.args[1]);
                if (!channel) return await this.ket.say({ context: ctx.env, emoji: 'negado', content: ctx.t('globalchat.channelNotFound') });
                await global.session.db.servers.update(ctx.gID, {
                    globalchat: channel.id,
                    lang: ctx.args[2] ? ctx.args[2] : (ctx.guild?.preferredLocale && ctx.guild.preferredLocale.startsWith('pt') ? 'pt' : 'en')
                });

                this.ket.say({
                    context: ctx.env, emoji: 'autorizado', content: {
                        embeds: [{
                            color: getColor('green'),
                            ...Object(ctx.t('globalchat.start', { channel }))
                        }]
                    }
                });
                break;
            case 'stop':
                await global.session.db.servers.update(ctx.gID, {
                    globalchat: null
                });

                this.ket.say({
                    context: ctx.env, emoji: 'autorizado', content: {
                        embeds: [{
                            color: getColor('green'),
                            ...Object(ctx.t('globalchat.stop', { user: ctx.user }))
                        }]
                    }
                });
                break;
            case 'getinfo':
                let message = await this.ket.findMessage(ctx.env, ctx.args[1]),
                    messages = await global.session.db.globalchat.getAll(),
                    msgData = messages.find(msg => msg.id === message.id || msg.messages.includes(message.id))

                if (isNaN(Number(ctx.args[1])) && !ctx.env?.messageReference || !message || !msgData)
                    return await this.ket.say({ context: ctx.env, emoji: 'negado', content: ctx.t('globalchat.messageNotFound') });

                let userData = await global.session.db.users.find(msgData.author),
                    user = await this.ket.findUser(ctx.env, msgData.author),
                    timestamp = moment.utc(message.timestamp).format('LLLL'),
                    isBanned = userData.banned ? 'BANNED' : 'not banned',
                    messagesCount = messages.filter(msg => msg.author === user.id).length;

                await this.ket.say({
                    context: ctx.env, content: {
                        embeds: [{
                            thumbnail: { url: user.dynamicAvatarURL('jpg') },
                            color: getColor('green'),
                            ...ctx.t('globalchat.getinfo', { msgData, user, isBanned, timestamp, messagesCount })
                        }]
                    }
                })
                break
        }
    }
}
