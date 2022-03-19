import KetClient from "../../Main";
import { PostgresClient } from "../Typings/Database";

export default class EventHandler {
    ket: KetClient;
    postgres: PostgresClient;
    events: { name: string, dir: string, run: any }[];

    constructor(ket: KetClient, postgres: PostgresClient) {
        this.ket = ket;
        this.postgres = postgres;
        this.events = [];
    }

    add(name: string, dir: string, type?: number) {
        this.events.push({ name, dir, run: new (require(dir))(this.ket, this.postgres) })

        if (!type) name === 'ready'
            ? this.ket.once(name, (...args) => this.execute(name, args))
            : this.ket.on(name, (...args) => this.execute(name, args));
        else this.ket.erela.on(name as any, (...args) => this.execute(name, args));
        return;
    }
    execute(name: string, args: any[]) {
        return this.events.filter(e => e.name === name).forEach((event) => {
            try {
                if (global.PROD) return event.run.on(...args);
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