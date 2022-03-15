import { SlashCommandBuilder } from "@discordjs/builders";
import KetClient from "../../Main";
import moment from "moment";
import CommandStructure, { CommandContext, getColor } from "../../Components/Commands/CommandStructure";
import { Message, User } from "eris";

module.exports = class GlobalChatCommand extends CommandStructure {
    constructor(ket: KetClient) {
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
                        .addStringOption(option =>
                            option.setName('language')
                                .setDescription('The Main language of this server.')
                                .addChoice('Português', 'pt')
                                .addChoice('English', 'en')
                                .addChoice('Español', 'es')
                                .setRequired(true)
                        )
                )
                .addSubcommand(c =>
                    c.setName('stop')
                        .setDescription('Stop global chat.')
                )
                .addSubcommand(c =>
                    c.setName('getinfo')
                        .setDescription('Search information about a message.')
                        .addStringOption(option =>
                            option.setName('messageid')
                                .setDescription('The message id.')
                                .setRequired(true)
                        )
                )
        })
    }
    async execute(ctx: CommandContext) {
        if (!ctx.args[0]) return await ctx.send({ content: 'no-args', emoji: 'negado' });

        switch (ctx.args[0].toLowerCase()) {
            case 'start':
                let channel = await this.ket.findChannel(ctx.args[1]);
                if (!channel) return await ctx.send({ emoji: 'negado', content: ctx.t('globalchat.channelNotFound') });
                await ctx.prisma.servers.update({
                    where: { id: ctx.gID },
                    data: {
                        globalchat: channel.id,
                        lang: ctx.args[2]
                    }
                });

                return ctx.send({
                    emoji: 'autorizado', content: {
                        embeds: [{
                            color: getColor('green'),
                            ...ctx.t('globalchat.start', { channel })
                        }]
                    }
                });
            case 'stop':
                await ctx.prisma.servers.update({
                    where: { id: ctx.gID },
                    data: { globalchat: null }
                });

                return ctx.send({
                    emoji: 'autorizado', content: {
                        embeds: [{
                            color: getColor('green'),
                            ...ctx.t('globalchat.stop', { user: ctx.user })
                        }]
                    }
                });
            case 'getinfo':
                let data = await ctx.prisma.globalchat.findMany(),
                    msg = data.find(m => msg.id === ctx.args[1] || m.messages.find((ms) => ms.includes(ctx.args[1])));

                if (isNaN(Number(ctx.args[1])) || !ctx.args[1] || !msg)
                    return ctx.send({ emoji: 'negado', content: ctx.t('globalchat.messageNotFound') });

                let userData = await ctx.prisma.users.find(msg.author),
                    user: User = await this.ket.findUser(userData.id),
                    server = await ctx.prisma.servers.find(msg.guild),
                    message = await this.ket.getMessage(server.globalchat, msg.id)
                        .catch(() => { }) as Message<any>;
                moment.locale(ctx.user.lang);

                return ctx.send({
                    content: {
                        embeds: [{
                            thumbnail: { url: user.dynamicAvatarURL('jpg') },
                            color: getColor('green'),
                            ...ctx.t('globalchat.getinfo', {
                                msg, user,
                                messages: msg.messages,
                                guild: this.ket.guilds.get(server.id),
                                timestamp: moment.utc(message?.timestamp || Date.now()).format('LLLL'),
                                isBanned: userData.banned ? 'BANNED' : 'not banned',
                                messagesCount: data.filter(msg => msg.author === user.id).length
                            })
                        }]
                    }
                })
        }
    }
}
