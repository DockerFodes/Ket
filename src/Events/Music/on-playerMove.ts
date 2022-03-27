import { ENABLE_LAVALINK } from "../../JSON/settings.json";
import { Player } from "erela.js";
import Event from "../../Components/Classes/Event";

module.exports = class playerMove extends Event {
    public type = 1;
    public dir = __filename;
    public disabled = !ENABLE_LAVALINK;

    async on(player: Player, _oldChannel: string, newChannel: string) {
        if (!newChannel) return player.destroy();

        this.ket.send({ ctx: player.textChannel, content: 'Eu vou ficar contigo até o fim dos tempos <3' });
        player.setVoiceChannel(newChannel);
        setTimeout(() => player.pause(false), 1500);

        return;
    }
}