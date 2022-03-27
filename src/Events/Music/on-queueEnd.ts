import { Player } from "erela.js";
import Event from "../../Components/Classes/Event";

module.exports = class queueEnd extends Event {
    public type = 1;
    public dir = __filename;

    async on(player: Player) {
        this.ket.send({ ctx: player.textChannel, content: 'playlist finalizada' });

        return;
    }
}