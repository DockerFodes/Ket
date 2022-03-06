import KetClient from "../../Main";
import { Player } from "erela.js";

module.exports = class playerMoveEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(player: Player, oldChannel: string, newChannel: string) {
        if (!newChannel) return player.destroy();

        this.ket.send({ ctx: player.textChannel, content: 'Eu vou ficar contigo até o fim dos tempos <3' });
        player.setVoiceChannel(newChannel);
        setTimeout(() => player.pause(false), 1500);
        return;
    }
}