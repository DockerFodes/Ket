export { };
import Eris from "eris";
import { t } from "i18next";
const
    { inspect } = require('util'),
    i18next = require('i18next'),
    axios = require('axios'),
    DidYouMean = require('didyoumean'),
    db = global.client.db,
    { Decoration, EmbedBuilder } = require('./Commands/CommandStructure'),
    Deco = new Decoration();

module.exports = class Utils {
    ket: any;
    constructor(ket: Eris.Client) {
        this.ket = ket;
    }

    async checkCache({ ket, message = null, interaction = null }) {
        let
            user = (interaction ? interaction.member.user : message.author),
            channel = (interaction ? interaction.channel : message.channel),
            guild = channel.guild;

        if (!ket.users.has(user.id)) user = await ket.getRESTUser(user.id);
        if (!ket.guilds.has(guild.id)) await ket.getRESTGuild(guild.id);
        if (!guild.members.has(ket.user.id)) await guild.getRESTMember(ket.user.id);
        if (!guild.channels.has(channel.id)) await ket.getRESTChannel(channel.id);
        return;
    }

    async checkUserGuildData({ message = null, interaction = null }) {
        let
            userCache = (interaction ? interaction.member.user : message.author),
            guildCache = (interaction ? interaction.channel.guild : message.channel.guild);

        await db.servers.find(guildCache.id, true)
        return await db.users.find(userCache.id, true);
    }

    async sendGlobalChat(ket, message) {
        let comando = {
            config: {
                permissions: { bot: ['manageChannels', 'manageWebhooks', 'manageMessages'] },
                access: { Threads: true }
            }
        },
            user = await this.checkUserGuildData({ message }),
            t = i18next.getFixedT(user.lang);

        await this.checkCache({ ket, message });
        if (await this.checkPermissions({ ket, message, comando }, t) === false) return;

        let
            guildsData = await db.servers.getAll(),
            guilds = guildsData.filter(guild => guild.globalchat && guild.globalchat != message.channel.id),
            msgObj = {
                username: message.author.username,
                avatarURL: message.author.dynamicAvatarURL('jpg', 256),
                content: this.msgFilter(message.content),
                embeds: null,
                file: [],
                wait: true,
                allowedMentions: {
                    everyone: false,
                    roles: false,
                    users: false
                }
            },
            msg,
            msgs = [];

        if (message.attachments[0]) {
            await message.attachments.forEach(async (att) => {
                let buffer = await axios({
                    url: att.url,
                    method: 'get',
                    responseType: 'arraybuffer'
                })
                msgObj.file.push({ file: buffer.data, name: att.filename })
            });
        }
        if (message.messageReference) {
            msg = await ket.getMessage(message.messageReference.channelID, message.messageReference.messageID);
            if (!msg) return;
            msgObj.embeds = [{
                color: Deco.getColor('green'),
                author: { name: msg.author.username, icon_url: msg.author.dynamicAvatarURL('jpg') },
                description: this.msgFilter(msg.content),
                image: (msg.attachments[0] ? { url: msg.attachments[0].url } : null)
            }]
        }
        guilds.forEach(async (g, i) => {
            let
                channel = ket.guilds.get(g.id).channels.get(g.globalchat),
                webhook = ket.webhooks.get(message.channel.id);
            if (await this.checkPermissions({ ket, channel, comando }, t) === false) return;
            if (!webhook) {
                webhook = await channel.getWebhooks();
                webhook = webhook.filter(w => w.name === 'Ket Global Chat' && w.user.id === ket.user.id)[0];
                if (!webhook) webhook = await channel.createWebhook({ name: 'Ket Global Chat', options: { type: 1 } });
                ket.webhooks.set(message.channel.id, webhook);
            }
            function send() {
                if (i++ > 50) return global.client.log('error', 'Global Chat', 'Lentidão para gerar imagens, mais de 50 functions chamadas não retornaram', '')
                if (msgObj.file.length != message.attachments?.length) return setTimeout(() => send(), 50);
                else ket.executeWebhook(webhook.id, webhook.token, msgObj).then(msg => msgs.push(`${msg.id}|${msg.guildID}`)).catch((e) => console.error(e));
            }
            return send();
        })
        let i = 0
        function save() {
            if (i++ > 10) return global.client.log('error', 'Global Chat', `o cache de mensagens de webhooks está inconsistente, desativando save do banco de dados com ${guilds.length - msgs.length} não salvas.`, '')
            if (msgs.length !== guilds.length) return setTimeout(() => save(), 300);
            else db.globalchat.create({
                id: message.id,
                author: message.author.id,
                editcount: 0,
                messages: `{${msgs.join(',')}}`
            })
        }
        return save();
    }

    msgFilter(content: string) {
        if (!content) return '_ _';
        const regex = /(https?:\/\/)?(www\.)?(http?:\/\/)?(discord\.(gg|io|me|li|club|ga|net|tk|ml)|discordapp\.com\/invite|discord\.com\/invite)\/.+[a-z]/gi;
        if (regex.exec(content)) content = content.replace(regex, '`convite bloqueado`')
        if (content.includes('http')) {
            let arrayContent = content.trim().split(/ /g),
                config = require('../json/settings.json');
            arrayContent.forEach(text => {
                for (let i in config.globalchat.allowedLinks) {
                    if (text.startsWith(config.globalchat.allowedLinks[i])) return;
                }
                if (text.includes('http')) return content = content.replace(new RegExp(text, 'g'), '`link bloqueado`');
            })
        }
        return content;
    }

    async checkPermissions({ ket, message = null, channel = null, interaction = null, comando, notReply = null }, t) {
        let
            canal = !channel ? (interaction ? interaction.channel : message.channel) : channel,
            guild = canal.guild,
            me = guild.members.get(ket.user.id),
            user = (interaction ? interaction.member?.user : message?.author),
            missingPermissions: string[] = [],
            translatedPerms: string;

        if (!canal) return false;
        if ([10, 11, 12].includes(canal.type) && !comando.config.access.Threads) {
            message.reply({
                embed: {
                    color: Deco.getColor('red'),
                    title: `${Deco.getEmoji('sireneRed').mention} ${t('events:no-threads')}`
                }
            }, 'negado')
            return false
        }

        comando.config.permissions.bot.forEach(perm => {
            if (!me.permissions.has(perm)) missingPermissions.push(perm);
        });
        translatedPerms = missingPermissions.map(value => t(`permissions:${value}`)).join(', ');
        if (missingPermissions[0] && !notReply) {
            (message ? canal : interaction).createMessage(t('permissions:missingPerms', { missingPerms: translatedPerms }))
                .catch(async () => {
                    let dmChannel = await user.getDMChannel();
                    dmChannel.createMessage(t('permissions:missingPerms', { missingPerms: translatedPerms }))
                        .catch(() => {
                            if (me.permissions.has('changeNickname')) me.edit({ nick: "pls give me some permission" }).catch(() => { });
                        });
                });
            return false;
        } else return true
    }

    async sendCommandLog({ ket, message, args, interaction, command, error }) {
        let
            channel = (interaction ? interaction.channel : message.channel),
            guild = (channel.type === 1 ? null : channel.guild),
            member = (interaction ? interaction.member.user : message.author),
            user = await db.users.find(member.id),
            embed = new EmbedBuilder()
                .setColor('green')
                .setTitle(`${user.prefix}${command}`)
                .addField('Autor:', `${member?.tag} (ID: ${member.id})`, false, 'fix')
                .addField('Servidor:', `# ${guild?.name} (ID: ${guild?.id})`, false, 'cs')
                .addField('Argumentos:', `- ${!args[0] ? 'Nenhum argumento foi usado neste comando' : args.join(' ')}`, false, 'diff')
        ket.createMessage(ket.config.channels.commandLogs, { embed: embed.build() })
    }

    CommandError({ ket, message, args, interaction, comando, error }) {
        let
            channel = (interaction ? interaction.channel : message.channel),
            guild = (channel.type === 1 ? null : channel.guild),
            me = guild.members.get(ket.user.id),
            user = (interaction ? interaction.member.user : message.author);

        message.reply({
            embed: {
                color: Deco.getColor('red'),
                thumbnail: { url: 'https://cdn.discordapp.com/attachments/788376558271201290/918721199029231716/error.gif' },
                title: `${Deco.getEmoji('sireneRed').mention} ${t('events:error.title')} ${Deco.getEmoji('sireneBlue').mention}`,
                description: t('events:error.desc', { error: error })
            }
        }, 'negado')

        ket.createMessage(ket.config.channels.erros, {
            embed: {
                color: Deco.getColor('red'),
                title: `Erro no ${comando.config.name}`,
                description: `Author: \`${user?.tag}\` (ID: ${user.id})\nGuild: \`${guild?.name}\` (ID: ${guild?.id})\nChannel: \`${channel?.name}\` (ID: ${channel.id}, Tipo: ${channel?.type}, NSFW: ${channel?.nsfw})\nEu: Nick: \`${me?.nick}\`, Permissions: ${me?.permissions}`,
                fields: [
                    {
                        name: 'Argumentos:',
                        value: '```diff\n- ' + (!args[0] ? 'Nenhum argumento' : args.join(' ')).slice(0, 1000) + "\n```"
                    },
                    {
                        name: 'Erro:',
                        value: '```js\n' + String(inspect(error)).slice(0, 500) + "\n```"
                    }
                ]
            }
        })
    }

    findResult(entrada: string, mapa: string[]) {
        function checkSimilarity(str1: string, str2: string) {
            if (str1 === str2) return 1.0;

            const len1 = str1.length,
                len2 = str2.length;

            const maxDist = ~~(Math.max(len1, len2) / 2) - 1;
            let matches = 0;

            const hash1 = [];
            const hash2 = [];

            for (var i = 0; i < len1; i++)
                for (var j = Math.max(0, i - maxDist); j < Math.min(len2, i + maxDist + 1); j++)
                    if (str1.charAt(i) === str2.charAt(j) && !hash2[j]) {
                        hash1[i] = 1;
                        hash2[j] = 1;
                        matches++;
                        break;
                    }

            if (!matches) return 0.0;

            let t = 0;
            let point = 0;

            for (var k = 0; k < len1; k++);
            if (hash1[k]) {
                while (!hash2[point])
                    point++;

                if (str1.charAt(k) !== str2.charAt(point++))
                    t++;
            }

            t /= 2;

            return ((matches / len1) + (matches / len2) + ((matches - t) / matches)) / 3.0;
        }

        function Algorithm2(str: string, array: any, threshold: number = 60) {
            return array
                .map(e => { return { e, v: checkSimilarity(str, e) } })
                .filter(({ v }) => v >= threshold / 100)
                .reduce((_, curr, i, arr) => arr[i].v > curr ? arr[i].v : curr.e, null);
        }
        
        DidYouMean.threshold = 0.8;
        let result = DidYouMean(entrada, mapa);
        if(!result) result = Algorithm2(entrada, mapa);
        return result
    }
}