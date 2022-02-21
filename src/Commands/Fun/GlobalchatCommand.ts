import { SlashCommandBuilder } from "@discordjs/builders";
import KetClient from "../../Main";
import moment from "moment";
import CommandStructure, { CommandContext, getColor } from "../../Components/Commands/CommandStructure";

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
                if (!channel) return await ctx.send({ emoji: 'negado', content: 'globalchat.channelNotFound'.getT() });
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
                            ...Object('globalchat.start'.getT({ channel }))
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
                            ...Object('globalchat.stop'.getT({ user: ctx.user }))
                        }]
                    }
                });
            case 'getinfo':
                let data = await ctx.prisma.globalchat.findMany({ limit: 500 }),
                    msg = data.find(msg => msg.id === ctx.args[1] || msg.messages.find((m) => m.includes(ctx.args[1])));

                if (isNaN(Number(ctx.args[1])) || !ctx.args[1] || !msg)
                    return ctx.send({ emoji: 'negado', content: 'globalchat.messageNotFound'.getT() });

                let userData = await ctx.prisma.users.find(msg.author),
                    user: any = await this.ket.findUser(ctx.env, userData.id),
                    server = await ctx.prisma.servers.find(msg.guild),
                    message: any = await this.ket.getMessage(server.globalchat, msg.id)
                        .catch(() => { });
                moment.locale(ctx.user.lang);

                return ctx.send({
                    content: {
                        embeds: [{
                            thumbnail: { url: user.dynamicAvatarURL('jpg') },
                            color: getColor('green'),
                            ...Object('globalchat.getinfo'.getT({
                                msg, user, guild: this.ket.guilds.get(server.id), messages: msg.messages,
                                timestamp: moment.utc(message?.timestamp || Date.now()).format('LLLL'),
                                isBanned: userData.banned ? 'BANNED' : 'not banned',
                                messagesCount: data.filter(msg => msg.author === user.id).length
                            }))
                        }]
                    }
                })
        }
    }
}
