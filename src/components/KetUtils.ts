export { };
const
    { inspect } = require('util'),
    db = global.client.db;

module.exports = class Utils {
    constructor() { };

    async checkCache({ ket, message, interaction }) {
        let
            user = (interaction ? interaction.user : message.author),
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
            userCache = (interaction ? interaction.user : message.author),
            guildCache = (interaction ? interaction.channel.guild : message.channel.guild);

        await db.servers.find(guildCache.id, true)
        return await db.users.find(userCache.id, true);
    }

    async checkPermissions({ ket, message = null, interaction = null, comando }, t) {

        let
            channel = (interaction ? interaction.channel : message.channel),
            guild = channel.guild,
            me = guild.members.get(ket.user.id),
            user = (interaction ? interaction.user : message.author),
            missingPermissions: string[] = [],
            translatedPerms: string;

        comando.config.permissions.bot.forEach(perm => {
            if (!me.permissions.has(perm)) missingPermissions.push(perm);
        });
        translatedPerms = missingPermissions.map(value => t(`permissions:${value}`)).join(', ');
        if (missingPermissions[0]) {
            (message ? channel : interaction).createMessage(t('permissions:missingPerms', { missingPerms: translatedPerms }))
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
            user = (interaction ? interaction.user : message.author);

        channel

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