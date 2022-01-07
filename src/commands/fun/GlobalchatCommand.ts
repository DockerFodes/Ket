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
                .addSubcommand(c =>
                    c.setName('ban')
                        .setDescription('ban a user')
                        .addStringOption(option =>
                            option.setName('userid')
                                .setDescription('The user id')
                                .setRequired(true)
                        )
                )
        })
    }
    async execute(ctx) {
        if (!ctx.args[0]) return await this.ket.say({ context: ctx.env, content: 'kur', emoji: 'negado' });
        const db = global.session.db;

        switch (ctx.args[0].toLowerCase()) {
            case 'start':
                let channel = await this.ket.findChannel(ctx.env, ctx.args[1]);
                if (!channel) return await this.ket.say({ context: ctx.env, emoji: 'negado', content: ctx.t('globalchat.channelNotFound') });
                await db.servers.update(ctx.gID, {
                    globalchat: channel.id,
                    lang: ctx.args[2] ? ctx.args[2] : (ctx.guild?.preferredLocale && ctx.guild.preferredLocale.startsWith('pt') ? 'pt' : 'en')
                });

                return this.ket.say({
                    context: ctx.env, emoji: 'autorizado', content: {
                        embeds: [{
                            color: getColor('green'),
                            ...Object(ctx.t('globalchat.start', { channel }))
                        }]
                    }
                });
            case 'stop':
                await db.servers.update(ctx.gID, {
                    globalchat: null
                });

                return this.ket.say({
                    context: ctx.env, emoji: 'autorizado', content: {
                        embeds: [{
                            color: getColor('green'),
                            ...Object(ctx.t('globalchat.stop', { user: ctx.user }))
                        }]
                    }
                });
            case 'getinfo':
                let message = await this.ket.findMessage(ctx.env, ctx.args[1]),
                    messages = await db.globalchat.getAll(),
                    msgData = messages.find(msg => msg.id === message.id || msg.messages.includes(message.id))

                if (isNaN(Number(ctx.args[1])) && !ctx.env?.messageReference || !message || !msgData)
                    return await this.ket.say({ context: ctx.env, emoji: 'negado', content: ctx.t('globalchat.messageNotFound') });

                let userData = await db.users.find(msgData.author),
                    user = await this.ket.findUser(ctx.env, msgData.author),
                    timestamp = moment.utc(message.timestamp).format('LLLL'),
                    isBanned = userData.banned ? 'BANNED' : 'not banned',
                    messagesCount = messages.filter(msg => msg.author === user.id).length;

                return this.ket.say({
                    context: ctx.env, content: {
                        embeds: [{
                            thumbnail: { url: user.dynamicAvatarURL('jpg') },
                            color: getColor('green'),
                            ...ctx.t('globalchat.getinfo', { msgData, user, isBanned, timestamp, messagesCount })
                        }]
                    }
                })
            case 'ban':
                let member = await this.ket.findUser(ctx.env, ctx.args[1]);

                await db.users.update(member.id, {
                    banned: true,
                    banReason: ctx.args.slice(2).join(' ')
                })

                return this.ket.say({
                    context: ctx.env, content: {
                        embeds: [{
                            thumbnail: { url: member.dynamicAvatarURL('jpg') },
                            color: getColor('green'),
                            ...ctx.t('globalchat.ban', { member, ctx })
                        }]
                    }
                })
        }
    }
}
