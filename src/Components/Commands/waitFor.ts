import KetClient from "../../Main";
let timeout: NodeJS.Timeout,
    endCollector: Function = async () => { };

export default {
    collect: async function (ket: KetClient, eventName: string = 'interactionCreate', filter: Function, time: number = 120_000, onEnd?: Function) {
        const eventBind = async (...args) => {
            endCollector = () => {
                if (timeout) clearTimeout(timeout);
                ket.removeListener(eventName, eventBind);
                return (args)
            }
            await filter(...args);
        }

        if (time) timeout = setTimeout(async () => {
            let args = await endCollector()
            onEnd(args);
        }, time);

        ket.on(eventName, eventBind);
    },
    stop: async () => {
        clearTimeout(timeout);
        await endCollector();
    }
}