import Event from "../../Components/Classes/Event";
import { infoEmbed } from "../../Components/Commands/CommandStructure";

module.exports = class ShardDisconnect extends Event {
    public dir = __filename;

    async on(error: string, shardID: number) {
        console.log(`SHARD ${shardID}`, `Reiniciando: ${error}`, 31);
        this.ket.shardUptime.set(shardID, NaN);

        if (global.PROD)
            infoEmbed(shardID, this.ket);

        return;
    }
}