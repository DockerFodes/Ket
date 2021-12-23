export { };
import Eris from "eris";
delete require.cache[require.resolve('../components/KetUtils')];
const
    db = global.client.db,
    KetUtils = new (require('../components/KetUtils'))(),
    i18next = require("i18next");

module.exports = class InteractionCreateEvent {
    ket: any;
    constructor(ket: Eris.Client) {
        this.ket = ket;
    }
    async start(interaction: Eris.Interaction) {
        if (!(interaction instanceof Eris.CommandInteraction) || interaction.type != 2) return;
        if (interaction.channel.type === 1) {
            delete require.cache[require.resolve("../packages/events/_on-messageDMCreate")];
            return new (require("../packages/events/_on-messageDMCreate"))(this).start(interaction);
        };
        let server = await db.servers.find(interaction.channel.guild.id, true),
            user = await db.users.find(interaction.member.user.id);
        if (user?.banned) return;
        if (server.banned) return interaction.channel.guild.leave();

        const ket = this.ket,
            args: string[] = [],
            commandName: string = interaction.data.name,
            comando = ket.commands.get(commandName) || ket.commands.get(ket.aliases.get(commandName));
        let t = global.client.t = i18next.getFixedT(user.lang || 'pt');

        await KetUtils.checkCache({ ket, interaction });
        user = await KetUtils.checkUserGuildData({ interaction });
        t = global.client.t = i18next.getFixedT(user.lang);
        if (await KetUtils.checkPermissions({ ket, interaction, comando }, t) === false) return;

        return new Promise(async (res, rej) => {
            try {
                let target = interaction
                comando.dontType ? null : await interaction.defer();
                await comando.execute({ ket, target, args, comando, commandName, db }, t);
                // KetUtils.sendCommandLog({ ket, message, args, commandName })
            } catch (error) {
                return KetUtils.CommandError({ ket, interaction, args, comando, error }, t)
            }
        })
    }
}