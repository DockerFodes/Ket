export { };
import Eris from "eris";
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

    async checkCache({ ket, context }) {
        let
            user = (context instanceof Eris.Message ? context.author : context.member.user),
            channel = context.channel,
            guild = channel.guild;

        if (!ket.users.has(user.id)) user = await ket.getRESTUser(user.id);
        if (!ket.guilds.has(guild.id)) await ket.getRESTGuild(guild.id);
        if (!guild.members.has(ket.user.id)) await guild.getRESTMember(ket.user.id);
        if (!guild.channels.has(channel.id)) await ket.getRESTChannel(channel.id);
        return;
    }

    async checkUserGuildData(context: any) {

        let
            userCache = (context instanceof Eris.Message ? context.author : context.member.user);

        await db.servers.find(context.guildID, true)
        return await db.users.find(userCache.id, true);
    }

    async sendGlobalChat(ket, context: /*Eris.Message*/ any) {
        let comando = {
            config: {
                permissions: { bot: ['manageChannels', 'manageWebhooks', 'manageMessages'] },
                access: { Threads: true }
            }
        },
            user = await this.checkUserGuildData(context),
            t = i18next.getFixedT(user.lang);

        await this.checkCache({ ket, context });
        if (await this.checkPermissions({ ket, context, comando }, t) === false) return;

        let
            guildsData = await db.servers.getAll(),
            guilds = guildsData.filter(guild => guild.globalchat && guild.globalchat != context.channel.id),
            msgObj = {
                username: context.author.username,
                avatarURL: context.author.dynamicAvatarURL('jpg', 256),
                content: this.msgFilter(context.filtredContent),
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
            msg,
            msgs: string[] = [];

        if (context.messageReference) {
            context.channel.messages.has(context.messageReference.messageID)
                ? msg = context.channel.messages.get(context.messageReference.messageID)
                : msg = await ket.getMessage(context.messageReference.channelID, context.messageReference.messageID);
                
            !msg ? null : msgObj.embeds = [{
                color: getColor('green'),
                author: { name: msg.author.username, icon_url: msg.author.dynamicAvatarURL('jpg') },
                description: this.msgFilter(msg.filtredContent, 64),
                image: (msg.attachments[0] ? { url: `${msg.attachments[0].url}?size=128` } : null)
            }]
        }

        if (context.stickerItems) msgObj.content = `https://media.discordapp.net/stickers/${context.stickerItems[0].id}.png?size=240`

        if (context.attachments[0]) for (let i in context.attachments) {
            let buffer = await axios({
                url: context.attachments[i].url,
                method: 'get',
                responseType: 'arraybuffer'
            })
            console.log('imagem carregada')
            msgObj.file.push({ file: buffer.data, name: context.attachments[i].filename })
        }

        guilds.forEach(async (g) => {
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
            console.log('webhook enviado')
            return ket.executeWebhook(webhook.id, webhook.token, msgObj).then((msg: Eris.Message) => msgs.push(`${msg.id}|${msg.guildID}`)).catch(() => { });
        })
        let i = 0
        function save() {
            if (i++ > 10) return global.client.log('error', 'Global Chat', `o cache de mensagens de webhooks está inconsistente, desativando save do banco de dados com ${guilds.length - msgs.length} não salvas.`, '')
            if (msgs.length !== guilds.length) return setTimeout(() => save(), 300);
            else db.globalchat.create({
                id: context.id,
                author: context.author.id,
                editcount: 0,
                messages: `{${msgs.join(',')}}`
            })
        }
        return save();
    }

    msgFilter(content: string, maxLength: number = 1990) {
        const isInvite: RegExp = /(http|https|www)?(:\/\/|\.)?(discord\.(gg|io|me|li|club|ga|net|tk|ml)|discordapp\.com\/invite|discord\.com\/invite)\/.+[a-z]/gi,
            isPishing: RegExp = /(http|https|www)?(:\/\/|\.)?(d(l|1)|.*.cord|cor\.|steam|eam|gift|gfit|free|nitro|n1tro|nltro)(\.|)([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/gi,
            isUrl: RegExp = /(?:\b[a-z\d\b.-]*\s*(?:[://]+)(?:\s*[://]{2,}\s*)[^<>\s]*)|\b(?:(?:(?:[^\s!@#$%^&*()_=+[\]{}\|;:'",.<>/?]*)(?:\.|\.\s|\s\.|\s\.\s|@)+)+(?:url|gl|ly|app|ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)|(?:(?:[0-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:[0-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]))(?:[;/][^#?<>\s]*)?(?:\?[^#<>\s]*)?(?:#[^<>\s]*)?(?!\w)/gi;

        if (!content) return '_ _';
        if (isInvite.exec(content)) content = content.replace(isInvite, '`link de convite bloqueado`')
        if (isPishing.exec(content)) content = content.replace(isPishing, '`link de website banido`')
        if (isUrl.exec(content)) {
            let arrayContent: string[] = content.trim().split(/ /g),
                config = require('../json/settings.json');

            arrayContent.forEach(text => {
                if (!isUrl.exec(text)) return;
                for (let i in config.globalchat.allowedLinks)
                    if (text.startsWith(config.globalchat.allowedLinks[i])) return;

                return content = content.replace(text, '`link bloqueado`');
            })
        }

        return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content
    }

    async checkPermissions({ ket, context = null, channel = null, comando, notReply = null }, t) {
        let
            canal: Eris.GuildChannel = !channel ? context.channel : channel,
            guild: Eris.Guild = canal.guild,
            me: Eris.Member = guild.members.get(ket.user.id),
            user: Eris.User = context ? (context instanceof Eris.Message ? context.author : context.member.user.id) : null,
            missingPermissions: string[] = [],
            translatedPerms: string;

        if (!canal) return false;
        if ([10, 11, 12].includes(canal.type) && !comando.config.access.Threads) {
            ket.say({
                context, content: {
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
            ket.say({ context, content: t('permissions:missingPerms', { missingPerms: translatedPerms }), embed: false, emoji: 'negado' })
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
            context = (interaction ? interaction : message),
            channel = context.channel,
            guild = (channel.type === 1 ? null : channel.guild),
            me = guild.members.get(ket.user.id),
            user = (interaction ? interaction.member.user : message.author);

        ket.say({
            context, content: {
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