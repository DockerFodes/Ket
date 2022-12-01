import { infoEmbed } from "../../Components/Commands/CommandStructure";
import Event from "../../Components/Classes/Event";

module.exports = class ShardReady extends Event {
    public dir = __filename;

    public async on(shardID: number) {
        console.log(`SHARD ${shardID}`, 'Connected to Discord', 34);
        this.ket.shardUptime.set(shardID, Date.now());

        if (global.PROD)
            infoEmbed(shardID, this.ket);

        return;
    }
}