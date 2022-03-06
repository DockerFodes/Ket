import { Player, Track } from "erela.js";
import { Message } from "eris";
import KetClient from "../../Main";

module.exports = class trackStartEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(player: Player, track: Track) {
        let msg = await this.ket.send({ ctx: player.textChannel, content: 'Iniciando música' }) as Message;
        await sleep(track.duration);
        msg.delete().catch(() => { });
        return;
    }
}