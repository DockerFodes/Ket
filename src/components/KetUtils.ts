export { };
const
    { inspect } = require('util'),
    db = global.client.db,
    i18next = require('i18next'),
    axios = require('axios');

module.exports = class Utils {
    constructor() { };

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
        let comando = { config: { permissions: { bot: ['manageChannels', 'manageWebhooks', 'manageMessages'] } } },
            user = await this.checkUserGuildData({ message }),
            t = i18next.getFixedT(user.lang);


        await this.checkCache({ ket, message });
        if (await this.checkPermissions({ ket, message, comando }, t) === false) return;

        let
            guilds = await db.servers.getAll(),
            msgObj = {
                username: message.author.username,
                avatarURL: message.author.dynamicAvatarURL('jpg', 256),
                content: this.msgFilter(message.content),
                embed: null,
                file: [],
                allowedMentions: {
                    everyone: false,
                    roles: false,
                    users: false
                }
            };

        if (message.attachments[0]) {
            message.attachments.forEach(async (att) => {
                let buffer = await axios({
                    url: att.url,
                    method: 'get',
                    responseType: 'arraybuffer'
                })
                msgObj.file.push({ file: buffer.data, name: att.filename })
            });
        }

        if (message.messageReference) {
            let msg = await ket.getMessage(message.messageReference.channelID, message.messageReference.messageID);
            msgObj.embed = {
                color: '16717848',
                author: { name: msg.author.username, icon_url: msg.author.dynamicAvatarURL('jpg') },
                description: this.msgFilter(msg.content),
                image: (msg.attachments[0] ? { url: msg.attachments[0].url } : null)
            }
        }
        return guilds.filter(guild => guild.globalchat && guild.globalchat != message.channel.id).forEach(async (g, i) => {
            let
                channel = ket.guilds.get(g.id).channels.get(g.globalchat),
                webhook;
            if (await this.checkPermissions({ ket, channel, comando }, t) === false) return;


            webhook = await channel.getWebhooks();
            webhook = webhook.filter(webhook => webhook.name === 'Ket Global Chat' && webhook.user.id === ket.user.id)[0];

            if (!webhook) webhook = await channel.createWebhook({
                name: 'Ket Global Chat',
                options: { type: 1 }
            });
            function send() {
                if (msgObj.file.length != message.attachments?.length) return setTimeout(() => send(), 10);
                else ket.executeWebhook(webhook.id, webhook.token, msgObj);
            }
            return send();
        });
    }

    msgFilter(content) {
        if (!content) content = '_ _'
        return content
    }

    async checkPermissions({ ket, message = null, channel = null, interaction = null, comando, notReply = null }, t) {

        let
            canal = !channel ? (interaction ? interaction.channel : message.channel) : channel,
            guild = canal.guild,
            me = guild.members.get(ket.user.id),
            user = (interaction ? interaction.member?.user : message?.author),
            missingPermissions: string[] = [],
            translatedPerms: string;

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

    CommandError({ ket, message, interaction, comando, error }) {
        let
            channel = (interaction ? interaction.channel : message.channel),
            guild = (channel.type === 1 ? null : channel.guild),
            me = guild.members.get(ket.user.id),
            user = (interaction ? interaction.member.user : message.author);

        // channel

        ket.createMessage(ket.config.channels.erros, {
            embed: {
                title: `Deu merda no comando ${comando.config.name}`,
                description: `Autor: \`${user.tag}\` (ID: ${user.id})\nGuild: \`${guild?.name}\` (ID: ${guild?.id})\nChannel: \`${channel.name}\` (ID: ${channel.id}, Tipo: ${channel.type}, NSFW: ${channel.nsfw})\nEu: Nick: \`${me.nick}\`, Permissions: ${me.permissions}`,
                fields: [
                    {
                        name: 'Erro:',
                        value: '```js\n' + String(inspect(error)).slice(0, 500) + "\n```"
                    }
                ]
            }
        })
    }
}