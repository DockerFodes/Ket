import KetClient from "../../Main";
import { VoicePacket } from "erela.js";

module.exports = class Event {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(packet: VoicePacket) {
        this.ket.erela.updateVoiceState(packet);
        return;
    }
}