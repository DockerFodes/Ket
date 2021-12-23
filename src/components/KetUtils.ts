export { };
import Eris, { GuildChannel } from "eris";
const
    { inspect } = require('util'),
    i18next = require('i18next'),
    axios = require('axios'),
    DidYouMean = require('didyoumean'),
    db = global.client.db,
    { Decoration, EmbedBuilder } = require('./Commands/CommandStructure'),
    { getEmoji, getColor } = Decoration;

module.exports = class Utils {
    ket: any;
    constructor(ket: Eris.Client) {
        this.ket = ket;
    }

    async checkCache({ ket, target }) {
        let
            user = (target instanceof Eris.Message ? target.author : target.member.user),
            channel = target.channel,
            guild = channel.guild;

        if (!ket.users.has(user.id)) user = await ket.getRESTUser(user.id);
        if (!ket.guilds.has(guild.id)) await ket.getRESTGuild(guild.id);
        if (!guild.members.has(ket.user.id)) await guild.getRESTMember(ket.user.id);
        if (!guild.channels.has(channel.id)) await ket.getRESTChannel(channel.id);
        return;
    }

    async checkUserGuildData(target: any) {

        let
            userCache = (target instanceof Eris.Message ? target.author : target.member.user);

        await db.servers.find(target.guildID, true)
        return await db.users.find(userCache.id, true);
    }

    async sendGlobalChat(ket, target: Eris.Message) {
        let comando = {
            config: {
                permissions: { bot: ['manageChannels', 'manageWebhooks', 'manageMessages'] },
                access: { Threads: true }
            }
        },
            user = await this.checkUserGuildData(target),
            t = i18next.getFixedT(user.lang);

        await this.checkCache({ ket, target });
        if (await this.checkPermissions({ ket, target, comando }, t) === false) return;

        let
            guildsData = await db.servers.getAll(),
            guilds = guildsData.filter(guild => guild.globalchat && guild.globalchat != target.channel.id),
            msgObj = {
                username: target.author.username,
                avatarURL: target.author.dynamicAvatarURL('jpg', 256),
                content: this.msgFilter(target.cleanContent),
                embeds: null,
                file: [],
                stickerIDs: null,
                wait: true,
                allowedMentions: {
                    everyone: false,
                    roles: false,
                    users: false
                }
            },
            msg: Eris.Message,
            msgs = [];

        if (target.attachments[0]) {
            target.attachments.forEach(async (att: Eris.Attachment) => {
                let buffer = await axios({
                    url: att.url,
                    method: 'get',
                    responseType: 'arraybuffer'
                })
                msgObj.file.push({ file: buffer.data, name: att.filename })
            });
        }
        if (target.stickerItems) msgObj.content = `https://media.discordapp.net/stickers/${target.stickerItems[0].id}.png`
        if (target.messageReference) {
            if (target.channel.messages.has(target.messageReference.messageID)) msg = target.channel.messages.get(target.messageReference.messageID);
            else msg = await ket.getMessage(target.messageReference.channelID, target.messageReference.messageID);
            if (!msg) return;
            msgObj.embeds = [{
                color: getColor('green'),
                author: { name: msg.author.username, icon_url: msg.author.dynamicAvatarURL('jpg') },
                description: this.msgFilter(msg.cleanContent, 128),
                image: (msg.attachments[0] ? { url: msg.attachments[0].url } : null)
            }]
        }
        guilds.forEach(async (g, i: number) => {
            let
                channel = ket.guilds.get(g.id).channels.get(g.globalchat),
                webhook = ket.webhooks.get(channel.id);
            if (await this.checkPermissions({ ket, channel, comando }, t) === false) return;
            if (!webhook) {
                webhook = await channel.getWebhooks();
                webhook = webhook.filter(w => w.name === 'Ket Global Chat' && w.user.id === ket.user.id)[0];
                if (!webhook) webhook = await channel.createWebhook({ name: 'Ket Global Chat', options: { type: 1 } });
                ket.webhooks.set(channel.id, webhook);
            }
            function send() {
                if (i++ > 50) return global.client.log('error', 'Global Chat', 'Lentidão para gerar imagens, mais de 50 functions chamadas não retornaram', '')
                if (msgObj.file.length != target.attachments?.length) return setTimeout(() => send(), 50);
                else ket.executeWebhook(webhook.id, webhook.token, msgObj).then((msg: Eris.Message) => msgs.push(`${msg.id}|${msg.guildID}`)).catch(() => { });
            }
            return send();
        })
        let i = 0
        function save() {
            if (i++ > 10) return global.client.log('error', 'Global Chat', `o cache de mensagens de webhooks está inconsistente, desativando save do banco de dados com ${guilds.length - msgs.length} não salvas.`, '')
            if (msgs.length !== guilds.length) return setTimeout(() => save(), 300);
            else db.globalchat.create({
                id: target.id,
                author: target.author.id,
                editcount: 0,
                messages: `{${msgs.join(',')}}`
            })
        }
        return save();
    }

    msgFilter(content: string, maxLength: number = 1990) {
        //modificar node_modules/eris/lib/structures/Message.js:338 para permitir emojis


        const isInvite: RegExp = /(http|https|www)?(:\/\/|\.)?(discord\.(gg|io|me|li|club|ga|net|tk|ml)|discordapp\.com\/invite|discord\.com\/invite)\/.+[a-z]/gi,
            isPishing: RegExp = /(http|https|www)?(:\/\/|\.)?(d(l|1)|.*.cord|cor\.|steam|eam|gift|gfit|free|nitro|n1tro|nltro)(\.|)([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/gi,
            // isUrl1: RegExp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
            isUrl2: RegExp = /(?:\b[a-z\d\b.-]*\s*(?:[://]+)(?:\s*[://]{2,}\s*)[^<>\s]*)|\b(?:(?:(?:[^\s!@#$%^&*()_=+[\]{}\|;:'",.<>/?]*)(?:\.|\.\s|\s\.|\s\.\s|@)+)+(?:url|gl|ly|app|ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)|(?:(?:[0-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:[0-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]))(?:[;/][^#?<>\s]*)?(?:\?[^#<>\s]*)?(?:#[^<>\s]*)?(?!\w)/gi;

        if (!content) return '_ _';
        if (isInvite.exec(content)) content = content.replace(isInvite, '`link de convite bloqueado`')
        if (isPishing.exec(content)) content = content.replace(isPishing, '`link de website banido`')
        // if (isUrl1.exec(content)) content = content.replace(isUrl1, '`link bloqueado`')
        if (isUrl2.exec(content)) content = content.replace(isUrl2, '`link bloqueado`')


        // if (content.includes('http')) {
        //     let arrayContent: string[] = content.trim().split(/ /g),
        //         config = require('../json/settings.json');
        //     arrayContent.forEach(text => {
        //         for (let i in config.globalchat.allowedLinks) {
        //             if (text.startsWith(config.globalchat.allowedLinks[i])) return;
        //         }
        //         if (text.includes('http')) return content = content.replace(new RegExp(text, 'g'), '`link bloqueado`');
        //     })
        // }

        return content.substring(0, maxLength);
    }

    async checkPermissions({ ket, target = null, channel = null, comando, notReply = null }, t) {
        let
            canal: Eris.GuildChannel = !channel ? target.channel : channel,
            guild: Eris.Guild = canal.guild,
            me: Eris.Member = guild.members.get(ket.user.id),
            user: Eris.User = (target instanceof Eris.Message ? target.author : target.member.user.id),
            missingPermissions: string[] = [],
            translatedPerms: string;

        if (!canal) return false;
        if ([10, 11, 12].includes(canal.type) && !comando.config.access.Threads) {
            ket.say({
                target, content: {
                    embeds: {
                        color: getColor('red'),
                        title: `${getEmoji('sireneRed').mention} ${t('events:no-threads')}`
                    }
                }, emoji: 'negado'
            })
            return false
        }

        comando.config.permissions.bot.forEach((perm) => !me.permissions.has(perm) ? missingPermissions.push(perm) : {});
        translatedPerms = missingPermissions.map(value => t(`permissions:${value}`)).join(', ');
        if (missingPermissions[0] && !notReply) {
            ket.say({ target, content: t('permissions:missingPerms', { missingPerms: translatedPerms }), embed: false, emoji: 'negado' })
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

    CommandError({ ket, message, args, interaction, comando, error }, t) {
        let
            target = (interaction ? interaction : message),
            channel = target.channel,
            guild = (channel.type === 1 ? null : channel.guild),
            me = guild.members.get(ket.user.id),
            user = (interaction ? interaction.member.user : message.author);

        ket.say({
            target, content: {
                embeds: {
                    color: getColor('red'),
                    thumbnail: { url: 'https://cdn.discordapp.com/attachments/788376558271201290/918721199029231716/error.gif' },
                    title: `${getEmoji('sireneRed').mention} ${t('events:error.title')} ${getEmoji('sireneBlue').mention}`,
                    description: t('events:error.desc', { error: error })
                }
            }, emoji: 'negado', flags: 64
        })

        ket.createMessage(ket.config.channels.erros, {
            embed: {
                color: getColor('red'),
                title: `Erro no ${comando.config.name}`,
                description: `Author: \`${user?.tag}\` (ID: ${user.id})\nGuild: \`${guild?.name}\` (ID: ${guild?.id})\nChannel: \`${channel?.name}\` (ID: ${channel.id}, Tipo: ${channel?.type}, NSFW: ${channel?.nsfw})\nEu: Nick: \`${me?.nick}\`, Permissions: ${me?.permissions}`,
                fields: [
                    { name: 'Argumentos:', value: '```diff\n- ' + (!args[0] ? 'Nenhum argumento' : args.join(' ')).slice(0, 1000) + "\n```" },
                    { name: 'Erro:', value: '```js\n' + String(inspect(error)).slice(0, 500) + "\n```" }
                ]
            }
        })
    }

    async commandNotFound({ ket, message, comando, commandName }, t) {
        let totalCommands: string[] = [];
        ket.commands.forEach((command: any) => totalCommands.push(command.config.name))
        commandName = this.findResult(commandName, totalCommands)
        comando = ket.commands.get(commandName)
        if (!comando) return false;
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
        if (!result) result = Algorithm2(entrada, mapa);
        return result
    }
}