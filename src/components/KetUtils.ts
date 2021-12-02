export { }
const db = global.client.db

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

    checkPermissions() {

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