import { Node } from "erela.js";
import Event from "../../Components/Classes/Event";

module.exports = class nodeConnect extends Event {
    public type = 1;
    public dir = __filename;

    async on(node: Node) {
        console.log(`ERELA/${node.options.identifier}`, `Conectado`, 32);

        return;
    }
}