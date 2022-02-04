import KetClient from "../../KetClient";
export default class EventHandler {
    ket: KetClient;
    events: { name: string, run: any }[];

    constructor(ket: KetClient) {
        this.ket = ket;
        this.events = [];
    }
    add(name: string, dir: string) {
        name === 'ready'
            ? this.ket.once(name, (...args) => this.execute(name, args))
            : this.ket.on(name, (...args) => this.execute(name, args));
        return this.events.push({ name: name, run: require(dir) })
    }
    execute(name: string, args: any[]) {
        return this.events.filter(e => e.name === name).forEach((event) => {
            try {
                return new (event.run)(this.ket).on(...args);
            } catch (error: any) {
                return console.log(`EVENTS/${event.name}`, 'ERRO GENÉRICO:', String(error.stack).slice(0, 256), 41)
            }
            // .catch((error: Error) => )
            // delete require.cache[require.resolve(event.dir)];
            // try {
            // return new (require(event.dir))(this.ket).on(...args);
            // } catch (e) {
            // return this.ket.emit('error', e);
            // }
        })
    }
    remove(name: string) {
        if (!this.events.find(e => e.name === name)[0]) return false;
        delete this.events[this.events.findIndex(e => e.name === name)];
        return true;
    }
}