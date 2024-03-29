import { getEmoji, getColor, EmbedBuilder, CommandContext } from '../Commands/CommandStructure';
import { Attachment, ComponentInteraction, GuildTextableChannel, Message, StickerItems, TextableChannel, User } from "eris";
import { DEVS, channels, globalchat } from "../../JSON/settings.json";
import { PostgresClient, serverSchema, userSchema } from '../Typings/Modules';
import Translator from "./Translator";
import DidYouMean from "didyoumean";
import KetClient from "../../Main";
import moment from 'moment';
import axios from "axios";

export default class KetUtils {
    ket: KetClient;
    postgres: PostgresClient;
    constructor(ket: KetClient, postgres?: PostgresClient) {
        this.ket = ket;
        this.postgres = postgres;
    }

    async checkCache(ctx: CommandContext) {
        if (!this.ket.users.has(ctx.uID)) await this.ket.findUser(ctx.uID);

        if (!this.ket.guilds.has(ctx.gID)) {
            let guild = await this.ket.getRESTGuild(ctx.gID);
            this.ket.guilds.add(guild);
        };

        if (!ctx.guild.members.has(ctx.uID)) {
            let member = await this.ket.getRESTGuildMember(ctx.gID, ctx.uID);
            ctx.guild.members.add(member);
        }
        if (!ctx.guild.channels.has(ctx.cID)) {
            let channel = await this.ket.getRESTChannel(ctx.cID) as GuildTextableChannel;
            ctx.guild.channels.add(channel)
        }

        return;
    }

    async checkUserGuildData(ctx: CommandContext, globalchat: boolean = false): Promise<userSchema> {        
        let user: userSchema = await this.postgres.users.find(ctx.uID);

        if (!user) {
            user = await this.postgres.users.create(ctx.uID, null, true);

            if (globalchat) this.ket.send({
                ctx: ctx.uID, content: {
                    embeds: [{
                        ...ctx.t('globalchat.welcome', { avatar: ctx.author.dynamicAvatarURL('jpg') }),
                        color: getColor('green'),
                        image: { url: 'https://goyalankit.com/assets/img/el_gato2.gif' }
                    }]
                }
            }).catch(() => { });
        }

        return user;
    }

    async sendGlobalChat(ctx: CommandContext) {
        let command: CommandConfig = {
            permissions: { bot: ['manageChannels', 'manageWebhooks', 'manageMessages'] },
            access: { Threads: false },
            dir: null
        };

        await this.checkUserGuildData(ctx, true);
        await this.checkCache(ctx);

        if (
            (ctx.uID === this.ket.user.id && (ctx.env as Message).content.startsWith(getEmoji('negado').mention))
            || !(await this.checkPermissions({ ctx, command }))
            || ctx.author.bot && ctx.uID !== this.ket.user.id
            || ctx.channel.nsfw
        ) return;

        let
            message = ctx.env as Message,
            user = this.ket.users.get(ctx.uID),
            guilds = (await this.postgres.servers.getAll())
                .filter((guild: serverSchema) => guild.globalchat && guild.globalchat != message.channel.id),
            username = message.member.nick
                ? `${message.author.username} (${message.member.nick})`.slice(0, 32)
                : message.author.username,
            msgObj = {
                username,
                avatarURL: message.author.dynamicAvatarURL('jpg'),
                content:
                    (DEVS.includes(ctx.uID)
                        ? message.cleanContent
                        : this.msgFilter(message.cleanContent)) || '_ _',
                embeds: [],
                components: [],
                file: [...(await this.getMediaBuffer(message, 0)), ...(await this.getMediaBuffer(message, 1))],
                allowedMentions: {
                    everyone: false,
                    roles: false,
                    users: false
                },
                wait: true
            },
            refMsg: Message,
            msgs: string[] = [];

        if (!(await this.checkRateLimit(ctx, user))) return;

        if (message.messageReference)
            refMsg = await this.ket.findMessage(message.channel, { id: message.messageReference.messageID });

        if (message.author.bot && message?.embeds)
            msgObj.embeds = [message.embeds[0]]

        const sendAllChats = guilds.map((g: serverSchema) => {
            return new Promise(async (res, rej) => {
                let
                    channel = this.ket.guilds.get(g.id)?.channels.get(g.globalchat) as GuildTextableChannel,
                    webhook = this.ket.webhooks.get(channel?.id);

                if (!channel || channel?.nsfw || !(await this.checkPermissions({ ctx, command, channel, notReply: true })))
                    return;

                if (!webhook) {
                    webhook = (await this.ket.getChannelWebhooks(g.globalchat))
                        .find((w) => w.name === 'Ket' && w.user.id === this.ket.user.id);

                    if (!webhook)
                        webhook = await channel.createWebhook({
                            name: 'Ket', avatar: this.ket.user.dynamicAvatarURL('png')
                        }).catch(() => { });

                    this.ket.webhooks.update(webhook);
                }

                if (!webhook) return;

                if (refMsg && !message.author.bot) {
                    let ref = channel.messages.find(msg =>
                        msg?.author.username === username
                        && this.msgFilter(msg?.cleanContent, 1990, true) === this.msgFilter(refMsg?.cleanContent, 1990, true)
                        && msg?.timestamp - refMsg?.timestamp < 1000
                        && (refMsg.attachments[0]
                            ? msg.attachments[0].filename === refMsg.attachments[0].filename
                            : true)
                    ),
                        refAuthor = await this.postgres.users.find(refMsg?.author.id),
                        refContent = this.msgFilter(refMsg.cleanContent, 64).length === 0
                            ? "`⬑ - - Ver mensagem - - ⬏`"
                            : this.msgFilter(refMsg.cleanContent, 64);

                    msgObj.embeds = [{
                        color: getColor('green'),
                        timestamp: moment(refMsg.timestamp).format(),
                        author: { name: refMsg.author.username, icon_url: refMsg.author.dynamicAvatarURL('jpg') },
                        description: `${refAuthor?.banned
                            ? '`mensagem de usuário banido`'
                            : !ref
                                ? refContent
                                : `[${refContent}](https://discord.com/channels/${g.id}/${g.globalchat}/${ref.id})`}`,
                        thumbnail: refMsg.attachments[0] && !refAuthor?.banned ? { url: `${refMsg.attachments[0].url}?size=240` } : null
                    }]
                }

                if (msgObj.content?.length > 0 && g.lang && ctx.server.lang && g.lang !== ctx.server.lang)
                    msgObj.components = [{
                        type: 1,
                        components: [{
                            type: 2,
                            label: `Translate from ${Translator.getLanguage(ctx.server.lang)}`,
                            emoji: { name: this.getLangFromIso(ctx.server.lang).emoji },
                            style: 2,
                            custom_id: `translate/${message.id}/${ctx.server.lang}/${g.lang}`
                        }]
                    }]

                let send = async () => await this.ket.executeWebhook(webhook.id, webhook.token, msgObj)
                    .then((msg: any) => msgs.push(`${msg.id}|${msg.guildID}`))
                    .catch((e) => console.log('GLOBALCHAT', e,));

                let rateLimit = this.ket.requestHandler.ratelimits[`/webhooks/${g.globalchat}/:token?&wait=true`];
                if (rateLimit?.remaining === 0)
                    await sleep(Date.now() - rateLimit.reset + this.ket.requestHandler.options.ratelimiterOffset);

                res(send());

                return;
            })
        })

        await Promise.all(sendAllChats);
        await this.postgres.globalchat.create(message.id, {
            author: ctx.uID,
            guild: ctx.gID,
            editCount: 0,
            //@ts-ignore
            messages: `{${msgs.join(',')}}`
        })

        return;
    }

    msgFilter(content: string, maxLength: number = 1990, ignoreEmojis: boolean = false) {
        const isInvite: RegExp = /(http|https|www|)(:\/\/|.)?(discord\.(gg|io|me|li|club|ga|net|tk|ml)|discordapp\.com\/invite|discord\.com\/invite)\/.+[a-z]/gi,
            isPishing: RegExp = /(http|https|)(:\/\/|)(d(l|1)|.*.cord|cor\.|steam|eam|gift|gfit|free|nitro|n1tro|nltro)(\.|)([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g,
            isUrl: RegExp = /(?:\b[a-z\d\b.-]*\s*(?:[://]+)(?:\s*[://]{2,}\s*)[^<>\s]*)|\b(?:(?:(?:[^\s!@#$%^&*()_=+[\]{}\|;:'",.<>/?]*)(?:\.|\.\s|\s\.|\s\.\s|@)+)+(?:url|gl|ly|app|ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)|(?:(?:[0-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:[0-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]))(?:[;/][^#?<>\s]*)?(?:\?[^#<>\s]*)?(?:#[^<>\s]*)?(?!\w)/g;

        while (content.includes('\u005c')) content = content.replace('\u005c', '');
        content = content.replace(new RegExp('https://media.discordapp.net/attachments/', 'gi'), 'https://cdn.discordapp.com/attachments/');

        if (ignoreEmojis) content = content.replace(/<a?(:\w+:)[0-9]+>/g, "$1")

        if (content.match(isInvite)) content.match(isInvite)
            .forEach(text => content = content.replace(text, ' `blocked invite` '));

        if (content.match(isPishing)) content.match(isPishing)
            .forEach(text => {
                if (text.startsWith('https://cdn.discordapp.com/attachments/')) return;

                content = content.replace(text, ' `possible phishing link` ');
            })

        if (content.match(isUrl)) content
            .split(' ').forEach(text => {
                if (!content.match(text)) return;

                for (let i in globalchat.allowedLinks)
                    if (text.replace('www.', '').startsWith(globalchat.allowedLinks[i])) return;

                return content = content.replace(text, ' `blocked link` ');
            })

        return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content
    }

    async checkRateLimit(ctx: CommandContext, user: User) {
        !user.rateLimit ? user.rateLimit = 1 : user.rateLimit++;

        (await this.postgres.globalchat.getAll(10, { key: 'id', type: 'DESC' }))
            .filter(m => m.author === ctx.uID)
            .forEach(msg => {
                let content = String(ctx.channel.messages.get(msg.id)?.content);

                if (content.length === 0) return;
                if (content.length > 498) user.rateLimit++;
                if (this.checkSimilarity(content, (ctx.env as Message).content) >= 0.9) user.rateLimit++;
            })

        if (user.rateLimit >= 10) {
            await this.postgres.users.update(ctx.uID, {
                banned: `[ AUTO-MOD ] - Mal comportamento no chat global`
            });
            let userBan = await this.postgres.blacklist.find(ctx.uID);

            if (userBan) {
                if (userBan.warns < 3) await this.postgres.blacklist.update(user.id, {
                    timeout: Date.now() + user.rateLimit * 1000 * 60,
                    warns: userBan.warns + 1
                });
            } else await this.postgres.blacklist.create(user.id, {
                timeout: Date.now() + user.rateLimit * 1000 * 60
            })

            ctx.send({
                emoji: 'sireneRed', content: {
                    embeds: [{
                        color: getColor('red'),
                        title: `Auto-mod - Globalchat`,
                        description: `[ AUTO-MOD ] - ${ctx.author.tag} (ID: ${ctx.author.id}) foi banido por ${moment.duration(user.rateLimit * 1000 * 60).format('h[h] m[m]')} por mal comportamento. O terceiro banimento será permanente.`
                    }]
                }
            });

            return false;
        }

        return true;
    }

    async getMediaBuffer(message: Message<any>, type: 0 | 1 = 0) {
        let media: Attachment[] | StickerItems[] = type === 0 ? message.attachments : message.stickerItems,
            files = [];

        for (let i in media) {
            let buffer = await axios({
                url: type === 0 ? (media[i] as Attachment).url : `https://media.discordapp.net/stickers/${media[i].id}.png?size=240`,
                method: 'get',
                responseType: 'arraybuffer'
            })

            if (buffer) files.push({
                file: buffer.data,
                name: type === 0
                    ? (media[i] as Attachment).filename
                    : `${(media[i] as StickerItems).name}.${(media[i] as StickerItems).format_type === 1 ? 'png' : 'gif'}`
            });
        }

        return files;
    }

    async translateMsg(interaction: ComponentInteraction) {
        await interaction.defer(64).catch(() => { });

        let interactionData = interaction.data.custom_id.split('/'),
            data = await Translator.translate(interaction.message.content, interactionData[3], interactionData[2])
                .then(data => data.text)
                .catch((e) => `Houve um erro ao traduzir essa mensagem:\n\n${e.stack}`);

        interaction.createFollowup({
            embeds: [{
                color: getColor('hardpurple'),
                author: {
                    name: 'Google Translate',
                    icon_url: 'https://cdn.discordapp.com/attachments/788376558271201290/948035531604914176/googletranslate.png'
                },
                description: data.encode('fix'),
                footer: {
                    text: `From ${Translator.getLanguage(interactionData[2])} to ${Translator.getLanguage(interactionData[3])}`
                }
            }],
            flags: 64
        })

        return;
    }

    getLangFromIso(lang: string) {
        let languages = {
            en: { name: 'English', emoji: '🇺🇸' },
            es: { name: 'Spanish', emoji: '🇪🇸' },
            pt: { name: 'Portuguese', emoji: '🇧🇷' }
        }
        if (languages[lang]) return languages[lang];

        return;
    }

    async checkPermissions({ ctx = null, channel = null, command = null, notReply = null }: { ctx: CommandContext, channel?: GuildTextableChannel | null, command?: CommandConfig, notReply?: boolean }) {
        command ? ctx.command = command : null;
        channel ? ctx.channel = channel : null;
        let missingPermissions: permissions[] = ['viewChannel', 'readMessageHistory', 'sendMessages', 'embedLinks', 'useExternalEmojis', ...ctx.command.permissions?.bot];

        if (!ctx.channel) return false;

        if ([10, 11, 12].includes(ctx.channel.type) && !ctx.command.access.Threads) {
            ctx.send({
                emoji: 'negado',
                content: {
                    embeds: [{
                        color: getColor('red'),
                        title: `${getEmoji('sireneRed').mention} ${ctx.t('events:no-threads')}`
                    }]
                }
            })

            return false;
        }

        if (ctx.command.permissions?.onlyDevs && !DEVS.includes(ctx.uID))
            return ctx.send({
                emoji: 'negado', content: {
                    embeds: [{
                        color: getColor('red'),
                        description: ctx.t('events:isDev')
                    }]
                }
            })

        missingPermissions = missingPermissions
            ?.filter((perm: permissions) => !ctx.me.permissions.has(perm))
            ?.map((value: string) => ctx.t(`permissions:${value}`));

        if (missingPermissions[0]) {
            let content = ctx.t('permissions:missingPerms', { missingPerms: missingPermissions.join(', ') });

            if (!notReply)
                ctx.send({ content, embed: false, emoji: 'negado' })
                    .catch(async () => {
                        this.ket.send({ ctx: ctx.uID, content, emoji: 'negado' })
                            .catch(() => {
                                if (ctx.me.permissions.has('changeNickname'))
                                    ctx.me.edit({ nick: "pls give me some permission" })
                                        .catch(() => { });
                            });
                    });

            return false;

        }

        return true;
    }

    async sendCommandLog(ctx: CommandContext) {
        let embed = new EmbedBuilder()
            .setColor('green')
            .setTitle(ctx.user.prefix + ctx.commandName)
            .addField('Servidor:', `# ${ctx.guild.name} (ID: ${ctx.gID})`, false, 'cs')
            .addField('Autor:', `${ctx.author.tag} (ID: ${ctx.author.id})`, false, 'fix')
            .addField('Argumentos:', `- ${!ctx.args[0] ? 'Nenhum argumento foi usado neste comando' : ctx.args.join(' ')}`, false, 'diff');

        this.ket.send({ ctx: channels.commandLogs, content: { embeds: [embed.build()] } });

        return;
    }

    CommandError(ctx: CommandContext, error: Error) {
        ctx.send({
            emoji: 'negado',
            content: {
                embeds: [{
                    color: getColor('red'),
                    thumbnail: { url: 'https://cdn.discordapp.com/attachments/788376558271201290/918721199029231716/error.gif' },
                    description: ctx.t('events:error.description', { error: error.message })
                }],
                flags: 64
            }
        })

        this.ket.send({
            ctx: channels.errorLogs,
            content: {
                embeds: [{
                    color: getColor('red'),
                    title: `Erro no ${ctx.commandName}/${ctx.command.name}`,
                    description: `Author: \`${ctx.author.tag}\` (ID: ${ctx.uID})\nGuild: \`${ctx.guild?.name}\` (ID: ${ctx.gID})\nChannel: \`${ctx.channel.name}\` (ID: ${ctx.cID}, Tipo: ${ctx.channel?.type}, NSFW: ${ctx.channel?.nsfw})\nEu: Nick: \`${ctx.me?.nick}\`, Permissions: ${ctx.me?.permissions}`,
                    fields: [
                        { name: 'Argumentos:', value: '```diff\n- ' + (!ctx.args[0] ? 'Nenhum argumento' : ctx.args.join(' ')).slice(0, 1000) + "\n```" },
                        { name: 'Erro:', value: '```js\n' + String(error.stack).slice(0, 500) + "\n```" }
                    ]
                }]
            }
        })

        return;
    }

    async commandNotFound(ctx: CommandContext, commandName: string) {
        let commands = this.ket.commands.map((c: CommandConfig) => c.name)
        ctx.command = this.ket.commands.get(this.findResult(commandName, commands))
        if (!ctx.command) return false;

        return ctx.command;
    }

    findResult(entrada: string, mapa: string[]) {
        const checkSimilarity = this.checkSimilarity
        function Algorithm2(str: string, array, threshold: number = 60) {
            return array
                .map(e => { return { e, v: checkSimilarity(str, e) } })
                .filter(({ v }) => v >= threshold / 100)
                .reduce((_, curr, i, arr) => arr[i].v > curr ? arr[i].v : curr.e, null);
        }

        DidYouMean.threshold = 0.8;
        let result = DidYouMean(entrada, mapa);
        if (!result) result = Algorithm2(entrada, mapa);

        return String(result);
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