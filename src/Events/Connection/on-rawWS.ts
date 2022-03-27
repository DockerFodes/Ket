import { VoicePacket } from "erela.js";
import Event from "../../Components/Classes/Event";

module.exports = class rawWS extends Event {
    public dir = __filename;

    async on(packet: VoicePacket) {
        if (this.ket.erela) this.ket.erela.updateVoiceState(packet);
        return;
    }
}