module.exports = async function collect({ client, eventName = 'interactionCreate', filter = null, time = 120 * 1000, onEnd = (...any) => { } }) {
    if (!filter || typeof filter !== "function") filter = () => true;
    let endCollector: Function = () => { console.log('não cancelou menó') },
        timeout;
    const event = async (...args) => {
        endCollector = async function () {
            await onEnd(...args)
            client.removeListener(eventName, event);
            if (timeout) clearTimeout(timeout);
        }
        const exec = await filter(...args);
        if (filter && typeof filter === "function" && exec) {
            await endCollector();
            // res([...args]);
        }
    }

    client.on(eventName, event);
    if (time) timeout = setTimeout(async () => await endCollector(), time);
}