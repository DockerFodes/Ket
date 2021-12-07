import Eris from "eris";
delete require.cache[require.resolve('../components/KetUtils')];
const
    db = global.client.db,
    { checkCache, checkUserGuildData, checkPermissions, CommandError } = new (require('../components/KetUtils'))(),
    i18next = require("i18next");

module.exports = class InteractionCreateEvent {
    ket: any;
    constructor(ket: Eris.Client) {
        this.ket = ket;
    }
    async start(interaction: Eris.Interaction) {
        if (!(interaction instanceof Eris.CommandInteraction) || interaction.type != 2) return;
        let user = await db.users.find(interaction.member.user.id, true);
        const ket = this.ket;

        const comando = ket.commands.get(interaction.data.name);
        if (!comando) return;

        await checkCache({ ket, interaction });
        user = await checkUserGuildData({ interaction });
        let t = global.client.t = i18next.getFixedT(user.lang);
        if (await checkPermissions({ ket, interaction, comando }, t) === false) return;

        comando.dontType ? null : await interaction.defer();
        try {
            return comando.slash({ ket, interaction, comando, db }, t);
        } catch (error) {
            return CommandError({ ket, interaction, comando, error });
        }
    }
}