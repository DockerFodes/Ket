import { ENABLE_LAVALINK } from "../../JSON/settings.json";
import { Player } from "erela.js";
import Event from "../../Components/Classes/Event";

module.exports = class trackError extends Event {
    public type = 1;
    public dir = __filename;
    public disabled = !ENABLE_LAVALINK;

    async on(player: Player) {
        this.ket.send({ ctx: player.textChannel, content: `Houve um erro ao reproduzir essa música.` });
        console.log(`ERELA/${player.node.options.identifier}`, 'Errorrrrr');

        return;
    }
}