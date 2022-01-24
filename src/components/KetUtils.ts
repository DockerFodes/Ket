import { Message, Webhook } from "eris";
import { inspect } from "util";
import axios from "axios";
import DidYouMean from "didyoumean";
const
    moment = require('moment'),
    db = global.session.db,
    { Decoration, EmbedBuilder } = require('./Commands/CommandStructure'),
    { getEmoji, getColor } = Decoration;

module.exports = class Utils {
    constructor() { }

    async checkCache(ctx) {
        if (!ctx.ket.users.has(ctx.uID)) await ctx.ket.getRESTUser(ctx.uID);
        if (!ctx.ket.guilds.has(ctx.gID)) await ctx.ket.getRESTGuild(ctx.gID);
        if (!ctx.guild.members.has(ctx.ket.user.id)) await ctx.guild.getRESTMember(ctx.ket.user.id);
        if (!ctx.guild.channels.has(ctx.cID)) await ctx.ket.getRESTChannel(ctx.cID);
        return;
    }

    async checkUserGuildData(ctx: any, globalchat: boolean = false) {
        await db.servers.find(ctx.gID, true)
        let user = await db.users.find(ctx.uID);
        if (!user) {
            user = await db.users.create(ctx.uID, { lang: 'pt' }, true)
            try {
                if (globalchat) (await ctx.author.getDMChannel()).createMessage({
                    embeds: [{
                        ...global.t('events:globalchat.welcome', { avatar: ctx.author.dynamicAvatarURL('jpg') }),
                        color: getColor('green'),
                        image: { url: 'https://goyalankit.com/assets/img/el_gato2.gif' }
                    }]
                })
            } catch (e) {

            }
        }
        return user;
    }

    async sendGlobalChat(ctx: any) {
        let command = {
            permissions: { bot: ['manageChannels', 'manageWebhooks', 'manageMessages'] },
            access: { Threads: false }
        };
        await this.checkUserGuildData(ctx, true);
        await this.checkCache(ctx);
        if ((ctx.uID === ctx.ket.user.id && ctx.env.content.startsWith(getEmoji('negado').mention)) || await this.checkPermissions({ ctx, command }) === false || ctx.channel.nsfw || ctx.author.bot && ctx.uID !== ctx.ket.user.id) return;
        let
            message = ctx.env,
            ket = ctx.ket,
            user = ket.users.get(ctx.uID),
            guildsData = await db.servers.getAll(35),
            guilds = guildsData.filter(guild => guild.globalchat && guild.globalchat != message.channel.id),
            msgObj = {
                username: message.author.username,
                avatarURL: message.author.dynamicAvatarURL('jpg'),
                content: ctx.ket.config.DEVS.includes(ctx.uID) ? message.cleanContent : this.msgFilter(message.cleanContent),
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

        if (await this.checkRateLimit(ctx, user) === false) return;

        if (message.messageReference) message.channel.messages.has(message.messageReference.messageID)
            ? msg = message.channel.messages.get(message.messageReference.messageID)
            : msg = await ket.findMessage(message, message.messageReference.messageID);

        if (message.stickerItems) for (let i in message.stickerItems) {
            let buffer = await axios({
                url: `https://media.discordapp.net/stickers/${message.stickerItems[i].id}.png?size=240`,
                method: 'get',
                responseType: 'arraybuffer'
            })
            !buffer ? {} : msgObj.file.push({ file: buffer.data, name: `${message.stickerItems[i].name}.${message.stickerItems[i].format_type === 1 ? 'png' : 'gif'}` });
        }

        if (message?.attachments[0]) for (let i in message.attachments) {
            let buffer = await axios({
                url: message.attachments[i].url,
                method: 'get',
                responseType: 'arraybuffer'
            })
            !buffer ? {} : msgObj.file.push({ file: buffer.data, name: message.attachments[i].filename });
        }

        if (message.author.bot && message.embeds[0]) msgObj.embeds = [message.embeds[0]]

        const sendAllChats = guilds.map(g => {
            return new Promise(async (res, rej) => {
                let
                    channel = ket.guilds.get(g.id)?.channels.get(g.globalchat),
                    webhook = ket.webhooks.get(channel?.id);

                if (!channel || channel?.nsfw || await this.checkPermissions({ ctx, command, channel, notReply: true }) === false) return;
                if (!webhook) {
                    webhook = await channel.getWebhooks().catch(() => { });
                    webhook = webhook?.filter((w: Webhook) => w.name === 'Ket Global Chat' && w.user.id === ket.user.id)[0];
                    if (!webhook) webhook = await channel.createWebhook({ name: 'Ket Global Chat', options: { type: 1 } }).catch(() => { });
                    ket.webhooks.set(channel.id, webhook);
                }
                if (!webhook) return;
                if (message.messageReference && !message.author.bot) {
                    let ref = channel.messages.find(m => m?.author.username === msg?.author.username && this.msgFilter(m?.cleanContent, 1990, true) === this.msgFilter(msg?.cleanContent, 1990, true) && m?.timestamp - msg?.timestamp < 1000 && (msg.attachments[0] ? m.attachments[0].name === msg.attachments[0].name : true)),
                        refAuthor = await db.users.find(msg?.author.id),
                        refContent = this.msgFilter(msg.cleanContent, 64).length === 0 ? "`⬑ - - Ver mensagem - - ⬏`" : this.msgFilter(msg.cleanContent, 64)

                    !msg ? null : msgObj.embeds = [{
                        color: getColor('green'),
                        timestamp: moment(msg.timestamp).format(),
                        author: { name: msg.author.username, icon_url: msg.author.dynamicAvatarURL('jpg') },
                        description: `${refAuthor?.banned
                            ? '`mensagem de usuário banido`'
                            : !ref
                                ? refContent
                                : `[${refContent}](https://discord.com/channels/${g.id}/${g.globalchat}/${ref.id})`}`,
                        thumbnail: (msg.attachments[0] && !refAuthor?.banned ? { url: `${msg.attachments[0].url}?size=240` } : null)
                    }]
                }

                let send = async () => await ket.executeWebhook(webhook.id, webhook.token, msgObj).then((msg: Message) => msgs.push(`${msg.id}|${msg.guildID}`)).catch(() => { });

                // let rateLimit = ket.requestHandler.ratelimits[`/webhooks/${g.globalchat}/:token?&wait=true`];
                // if (rateLimit) {
                //     console.log(Date.now() - rateLimit.reset + ket.options.rest.ratelimiterOffset)
                //     return setTimeout(async () => await send(), Date.now() - rateLimit.reset + ket.options.rest.ratelimiterOffset);
                // }
                res(send());
            })
        })

        await Promise.all(sendAllChats);
        return await db.globalchat.create(message.id, {
            author: message.author.id,
            guild: message.guildID,
            editCount: 'sql 0',
            messages: `{${msgs.join(',')}}`
        })
    }

    msgFilter(content: string, maxLength: number = 1990, ignoreEmojis: boolean = false) {
        const isInvite: RegExp = /(http|https|www|)(:\/\/|.)?(discord\.(gg|io|me|li|club|ga|net|tk|ml)|discordapp\.com\/invite|discord\.com\/invite)\/.+[a-z]/gi,
            isPishing: RegExp = /(http|https|)(:\/\/|)(d(l|1)|.*.cord|cor\.|steam|eam|gift|gfit|free|nitro|n1tro|nltro)(\.|)([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g,
            isUrl: RegExp = /(?:\b[a-z\d\b.-]*\s*(?:[://]+)(?:\s*[://]{2,}\s*)[^<>\s]*)|\b(?:(?:(?:[^\s!@#$%^&*()_=+[\]{}\|;:'",.<>/?]*)(?:\.|\.\s|\s\.|\s\.\s|@)+)+(?:url|gl|ly|app|ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)|(?:(?:[0-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:[0-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]))(?:[;/][^#?<>\s]*)?(?:\?[^#<>\s]*)?(?:#[^<>\s]*)?(?!\w)/g;

        while (content.includes('\u005c')) content = content.replace('\u005c', '');

        ignoreEmojis ? content = content.replace(/<a?(:\w+:)[0-9]+>/g, "$1") : null;

        content.match(isInvite)
            ? content.match(isInvite).forEach(text => content = content.replace(text, ' `convite bloqueado` '))
            : null;

        content.match(isPishing) ?
            content.match(isPishing).forEach(text => text.startsWith('https://media.discordapp.net/attachments/') || text.startsWith('https://cdn.discordapp.com/attachments/') ? null : content = content.replace(text, ' `possível link de pishing` '))
            : null;

        if (content.match(isUrl)) {
            let config = require('../json/settings.json');

            content.split(' ').forEach(text => {
                if (!content.match(text)) return;
                for (let i in config.globalchat.allowedLinks)
                    if (text.replace('www.', '').startsWith(config.globalchat.allowedLinks[i])) return;

                return content = content.replace(text, ' `link bloqueado` ');
            })
        }
        return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content
    }

    async checkRateLimit(ctx, user) {
        !user.rateLimit ? user.rateLimit = 1 : user.rateLimit++;
        !global.rateLimit ? global.rateLimit = setInterval(() => ctx.ket.users.filter(user => user.rateLimit > 0).forEach(u => u.rateLimit--), 5000) : null;

        let messages = await db.globalchat.getAll(10, { key: 'id', type: 'DESC' });
        messages?.filter(m => m.author === ctx.uID)?.forEach(msg => {
            let content = String(ctx.channel.messages.get(msg.id)?.content);
            content.length > 998 ? user.rateLimit++ : null;
            this.checkSimilarity(content, ctx.env.content) >= 0.9 ? user.rateLimit++ : null
        })

        if (user.rateLimit >= 10) {
            await db.users.update(ctx.uID, {
                banned: `[ AUTO-MOD ] - Mal comportamento no chat global, timeout: ${Date.now() + user.rateLimit * 1000 * 60}`
            });
            let userBl = await db.blacklist.find(user.id)
            if (userBl) userBl.warns < 3 ? await db.blacklist.update(user.id, {
                timeout: Date.now() + user.rateLimit * 1000 * 60,
                warns: 'sql warns + 1'
            }) : null
            else await db.blacklist.create(user.id, { timeout: Date.now() + user.rateLimit * 1000 * 60 })
            ctx.ket.send({
                context: ctx.env, emoji: 'sireneRed', content: {
                    embeds: [{
                        color: getColor('red'),
                        title: `Auto-mod - Globalchat`,
                        description: `[ AUTO-MOD ] - ${ctx.author.tag} (ID: ${ctx.author.id}) foi banido por ${moment.duration(user.rateLimit * 1000 * 60).format('h[h] m[m]')} por mal comportamento. O terceiro banimento será permanente.`
                    }]
                }
            });
            return false;
        } else return true;
    }

    async checkPermissions({ ctx = null, channel = null, command = null, notReply = null }) {
        let missingPermissions: string[] = [],
            t = global.t;
        channel ? ctx.channel = channel : null;
        command ? ctx.command = command : null;

        if (!ctx.channel) return false;
        if ([10, 11, 12].includes(ctx.channel.type) && !ctx.command.access.Threads) {
            ctx.ket.send({
                context: ctx.env, content: {
                    embeds: [{
                        color: getColor('red'),
                        title: `${getEmoji('sireneRed').mention} ${t('events:no-threads')}`
                    }]
                }, emoji: 'negado'
            })
            return false
        }

        missingPermissions = ctx.command.permissions.bot.filter((perm) => !ctx.me.permissions.has(perm)).map(value => t(`permissions:${value}`));

        if (missingPermissions[0]) {
            notReply ? null :
                ctx.ket.send({ context: ctx.env, content: t('permissions:missingPerms', { missingPerms: missingPermissions.join(', ') }), embed: false, emoji: 'negado' })
                    .catch(async () => {
                        let dmChannel = await ctx.author.getDMChannel();
                        dmChannel.createMessage(t('permissions:missingPerms', { missingPerms: missingPermissions.join(', ') }))
                            .catch(() => {
                                if (ctx.me.permissions.has('changeNickname')) ctx.me.edit({ nick: "pls give me some permission" }).catch(() => { });
                            });
                    });
            return false;
        } else return true;
    }

    async sendCommandLog(ctx) {
        const { ket, config, command, args, author, uID, guild, gID } = ctx
        let user = await db.users.find(uID),
            embed = new EmbedBuilder()
                .setColor('green')
                .setTitle(`${user?.prefix || config.DEFAULT_PREFIX}${command.name}`)
                .addField('Autor:', `${author.tag} (ID: ${author.id})`, false, 'fix')
                .addField('Servidor:', `# ${guild?.name} (ID: ${gID})`, false, 'cs')
                .addField('Argumentos:', `- ${!args[0] ? 'Nenhum argumento foi usado neste comando' : args.join(' ')}`, false, 'diff');
        ket.createMessage(config.channels.commandLogs, { embed: embed.build() });
    }

    CommandError(ctx, error) {
        const { t, ket, args, config, command, author, uID, guild, gID, me, channel, cID } = ctx
        ket.send({
            context: ctx.env, content: {
                embeds: [{
                    color: getColor('red'),
                    thumbnail: { url: 'https://cdn.discordapp.com/attachments/788376558271201290/918721199029231716/error.gif' },
                    description: t('events:error.description', { error })
                }]
            }, emoji: 'negado', flags: 64
        })

        ket.createMessage(config.channels.erros, {
            embed: {
                color: getColor('red'),
                title: `Erro no ${command.name}`,
                description: `Author: \`${author.tag}\` (ID: ${uID})\nGuild: \`${guild?.name}\` (ID: ${gID})\nChannel: \`${channel?.name}\` (ID: ${cID}, Tipo: ${channel?.type}, NSFW: ${channel?.nsfw})\nEu: Nick: \`${me?.nick}\`, Permissions: ${me?.permissions}`,
                fields: [
                    { name: 'Argumentos:', value: '```diff\n- ' + (!args[0] ? 'Nenhum argumento' : args.join(' ')).slice(0, 1000) + "\n```" },
                    { name: 'Erro:', value: '```js\n' + String(inspect(error)).slice(0, 500) + "\n```" }
                ]
            }
        })
    }

    async commandNotFound(ctx, commandName: string) {
        let totalCommands: string[] = [];
        ctx.ket.commands.forEach((cmd: any) => totalCommands.push(cmd.config.name))
        ctx.command = ctx.ket.commands.get(this.findResult(commandName, totalCommands))
        if (!ctx.command) return false;
        return ctx.command;
    }

    findResult(entrada: string, mapa: string[]) {
        const checkSimilarity = this.checkSimilarity
        function Algorithm2(str: string, array: any, threshold: number = 60) {
            return array
                .map(e => { return { e, v: checkSimilarity(str, e) } })
                .filter(({ v }) => v >= threshold / 100)
                .reduce((_, curr, i, arr) => arr[i].v > curr ? arr[i].v : curr.e, null);
        }

        DidYouMean.threshold = 0.8;
        let result = DidYouMean(entrada, mapa);
        if (!result) result = Algorithm2(entrada, mapa);
        return result;
    }

    checkSimilarity(str1: string, str2: string) {
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
}
