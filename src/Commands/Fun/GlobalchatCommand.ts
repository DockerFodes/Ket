import CommandStructure, { CommandContext, getColor } from "../../Components/Commands/CommandStructure";
import { SlashCommandBuilder } from "@discordjs/builders";
import { User } from "eris";
import KetClient from "../../Main";
import moment from "moment";

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
        if (!ctx.args[0]) return await ctx.send({ content: ctx.noargs });

        switch (ctx.args[0].toLowerCase()) {
            case 'start':
                let channel = await this.ket.findChannel(ctx.args[1]);
                if (!channel) return await ctx.send({ emoji: 'negado', content: ctx.t('globalchat.channelNotFound') });

                await ctx.postgres.servers.update(ctx.gID, {
                    globalchat: channel.id,
                    lang: ctx.args[2]
                });

                ctx.send({
                    emoji: 'autorizado', content: {
                        embeds: [{
                            color: getColor('green'),
                            ...ctx.t('globalchat.start', { channel })
                        }]
                    }
                });
                return;

            case 'stop':
                await ctx.postgres.servers.update(ctx.gID, { globalchat: null });

                ctx.send({
                    emoji: 'autorizado', content: {
                        embeds: [{
                            color: getColor('green'),
                            ...ctx.t('globalchat.stop', { user: ctx.user })
                        }]
                    }
                });
                return;

            case 'getinfo':
                let messages = await ctx.postgres.globalchat.getAll(500, { key: 'id', type: 'DESC' }),
                    msg = messages.find(m => m.id === ctx.args[1] || m.messages.find((ms) => ms.includes(ctx.args[1])));

                if (!msg || !ctx.args[1] || isNaN(Number(ctx.args[1])))
                    return ctx.send({ emoji: 'negado', content: ctx.t('globalchat.messageNotFound') });

                moment.locale(ctx.user.lang);
                let userData = await ctx.postgres.users.find(msg.author),
                    user = await this.ket.findUser(userData.id) as User,
                    server = await ctx.postgres.servers.find(msg.guild);

                ctx.send({
                    content: {
                        embeds: [{
                            thumbnail: { url: user.dynamicAvatarURL('jpg') },
                            color: getColor('green'),
                            ...ctx.t('globalchat.getinfo', {
                                msg, user,
                                messages: msg.messages,
                                guild: this.ket.guilds.get(server.id),
                                isBanned: userData.banned ? 'BANNED' : 'not banned',
                                messagesCount: messages.filter(msg => msg.author === user.id).length
                            })
                        }]
                    }
                })
                return;
        }

        return;
    }
}
