import { infoEmbed } from "../../Components/Commands/CommandStructure";
import Event from "../../Components/Classes/Event";

module.exports = class ShardDisconnect extends Event {
    public dir = __filename;

    public async on(error: string, shardID: number) {
        console.log(`SHARD ${shardID}`, `Restarting: ${error}`, 31);
        this.ket.shardUptime.set(shardID, NaN);

        if (global.PROD)
            infoEmbed(shardID, this.ket);

        return;
    }
}