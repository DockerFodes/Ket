delete require.cache[require.resolve('../components/KetUtils')];
const
    Eris = require('eris'),
    db = global.client.db,
    { checkCache, checkUserGuildData, checkPermissions, CommandError } = new (require('../components/KetUtils')),
    i18next = require("i18next");

module.exports = class InteractionCreate {
    ket: any;
    constructor(ket) {
        this.ket = ket;
    }
    async start(interaction) {
        if (!(interaction instanceof Eris.CommandInteraction) || interaction.type != 2) return;
        await interaction.defer();
        let user = await db.users.find(interaction.member.user.id, true);
        const ket = this.ket;

        const comando = ket.commands.get(interaction.data.name);
        if (!comando) return;

        await checkCache({ ket, interaction });
        user = await checkUserGuildData({ interaction });
        let t = global.client.t = i18next.getFixedT(user.lang);
        if (await checkPermissions({ ket, interaction, comando }, t) === false) return;

        try {
            comando.slash({ ket, interaction, comando, db }, t);
        } catch (error) {
            CommandError({ ket, interaction, comando, error });
        }
        return;
    }
}