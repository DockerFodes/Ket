import KetClient from "../../Main";
import { PostgresClient } from "../Typings/Modules";

export default class EventHandler {
    ket: KetClient;
    postgres: PostgresClient;
    events: EventConfig[];

    constructor(ket: KetClient, postgres: PostgresClient) {
        this.ket = ket;
        this.postgres = postgres;
        this.events = [];
    }

    add(dir: string) {
        const event = new (require(dir))(this.ket, this.postgres);

        let splitDir = String(dir).includes('\\')
            ? String(dir).replace(/(\\)/g, '/').split('/')
            : String(dir).split('/');

        let Event: EventConfig = {
            name: String(event.name || splitDir.pop().replace(/(on-|.ts|.js)/g, '')),
            category: String(event.category || splitDir[splitDir.length - 1]),
            type: Number(event.type || 0),
            disabled: event.disabled || false,
            dir: event.dir,
            ket: this.ket,
            postgres: this.postgres,
            on: event.on
        }

        this.events.push(Event);

        switch (Event.type) {
            case -1: this.ket.once(Event.name, (...args) => this.execute(Event.name, args))
                break;
            case 0:
                this.ket.on(Event.name, (...args) => this.execute(Event.name, args))
                break;
            case 1:
                this.ket.erela.on(Event.name as any, (...args) => this.execute(Event.name, args));
        }

        return;
    }
    execute(name: string, args: any[]) {
        return this.events.filter(e => e.name === name).forEach((event) => {
            try {
                if (global.PROD) return event.on(...args);
                else {
                    delete require.cache[require.resolve(event.dir)];
                    return new (require(event.dir))(this.ket, this.postgres).on(...args);
                }
            } catch (error: any) {
                return console.log(`EVENTS/${event.name}`, 'ERRO GENÉRICO:', String(error.stack).slice(0, 256), 31)
            }
        })
    }
    remove(name: string) {
        if (!this.events.find(e => e.name === name)[0]) return false;
        delete this.events[this.events.findIndex(e => e.name === name)];
        return true;
    }

    get size() {
        return this.events.length
    }
}