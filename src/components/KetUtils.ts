export { }
const db = global.client.db

module.exports = class Utils {
    ket: any;
    constructor(ket) {
        this.ket = ket;
    };
    async saveData(message) {
        // let server = await db.servers.find(message.guildID, false)
        // if(!server) await db.servers.create({
        //     id: message.guildID
        // })

        let user = await db.users.find(message.author.id, false)
        if (!user) await db.users.create({
            id: message.author.id
        })
    };
    checkPermissions() {

    };
}