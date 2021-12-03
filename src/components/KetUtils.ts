export { }
const
    db = global.client.db,
    i18next = require('i18next');

module.exports = class Utils {
    constructor() { };
    async checkUserGuildData({ message = null, interaction = null }) {
        let userID = this.getUserId({ message, interaction })
        // let guildID = this.getGuildId({ message, interaction })

        // await db.servers.find(guildID, true)
        let user = await db.users.find(userID, true)
        return user
    }

    async checkCache({ ket, message, interaction }) {
        let userID = this.getUserId({ message, interaction })

        if (!ket.users.has(userID))
            userID = await ket.getRESTUser(userID)
        return;
    }

    async checkPermissions({ ket, message = null, interaction = null, comando }, t) {
        let clientPerms = message.channel.guild.members.get(ket.user.id)?.permissions;
        let missingPermissions = []
        comando.config.permissions.bot.forEach(perm => {
            if (!clientPerms.has(perm)) missingPermissions.push(perm)
        });
        if (missingPermissions[0]) {
            message.channel.createMessage(`Eu preciso de permissão de \`${missingPermissions.map(value => t(`permissions.${value}`)).join(', ')}\` para poder executar este comando`)
                .catch(async () => {
                    let dmChannel = await message.author.getDMChannel()
                    dmChannel.createMessage
                })
            return false
        }
    }

    getUserId({ message = null, interaction = null }) {
        let userID;
        if (interaction) userID = interaction.user.id;
        else userID = message.author.id;
        return userID;
    }

    getGuildId({ message = null, interaction = null }) {
        let guildID;
        if (interaction) guildID// = interaction.guildID;
        else guildID = message.guildID;
        return guildID;
    }
}