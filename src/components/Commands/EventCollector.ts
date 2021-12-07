import Eris from "eris"

module.exports = class EventCollector {
    ket: Eris.Client;
    timeout: NodeJS.Timeout;
    constructor(ket: Eris.Client) {
        this.ket = ket;
        this.timeout;
    }
    async collect({ eventName = 'interactionCreate', filter = null, time = 120 * 1000, onEnd = null }) {
        if (!filter || typeof filter !== "function") filter = () => true;
        let endColletor: Function;
        return new Promise((res, rej) => {

            const event = async (...args) => {
                endColletor = async () => {
                    onEnd ? await onEnd(...args) : null
                    this.ket.removeListener(eventName, event);
                    if (this.timeout) clearTimeout(this.timeout);
                }
                const exec = await filter(...args);
                if (filter && typeof filter === "function" && exec) {
                    await endColletor();
                    res([...args]);
                }
            }

            if (time) this.timeout = setTimeout(async () => await endColletor(), time);
            this.ket.on(eventName, event);
        })
    }
}