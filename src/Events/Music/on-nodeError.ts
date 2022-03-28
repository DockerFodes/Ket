import { ENABLE_LAVALINK } from "../../JSON/settings.json";
import { Node } from "erela.js";
import Event from "../../Components/Classes/Event";

module.exports = class nodeError extends Event {
    public type = 1;
    public dir = __filename;
    public disabled = !ENABLE_LAVALINK;

    public async on(node: Node, error: Error) {
        console.log(`ERELA/${node.options.identifier}`, error, 31);

        return;
    }
}