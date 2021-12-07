import Eris from "eris"
interface event {
    name: string;
    dir: string;
}
module.exports = class EventHandler {
    ket: Eris.Client;
    events: event[];
    eventData: any;

    constructor(ket) {
        this.ket = ket;
        this.events = [];
    }
    add(name: string, dir: string) {
        if (name === 'ready') this.ket.once(name, (...args) => this.execute(name, args));
        this.ket.on(name, (...args) => this.execute(name, args));

        let eventData = {
            name: name,
            dir: dir
        };
        return this.events.push(eventData);
    }
    execute(name: string, args) {
        return this.events.filter(evento => evento.name === name).forEach((event) => {
            delete require.cache[require.resolve(event.dir)];
            try {
                new (require(event.dir))(this.ket).start(...args);
            } catch (e) {
                this.ket.emit('error', e);
            }
            return;
        })
    }
    remove(name: string) {
        if (!this.events.filter(event => event.name === name)[0]) return false;
        delete this.events[this.events.findIndex(event => event.name === name)];
        return true;
    }
}