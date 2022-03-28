import { ENABLE_LAVALINK } from "../../JSON/settings.json";
import { VoicePacket } from "erela.js";
import Event from "../../Components/Classes/Event";

module.exports = class rawWS extends Event {
    public dir = __filename;
    public disabled = !ENABLE_LAVALINK;

    public async on(packet: VoicePacket) {
        if (this.ket.erela) this.ket.erela.updateVoiceState(packet);

        return;
    }
}