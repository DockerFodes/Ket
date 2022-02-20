import KetClient from "../../Main";
import Prisma from "../Database/PrismaConnection";

export default class EventHandler {
    ket: KetClient;
    prisma: Prisma;
    events: { name: string, dir: string, run: any }[];

    constructor(ket: KetClient, prisma: Prisma) {
        this.ket = ket;
        this.prisma = prisma;
        this.events = [];
    }

    add(name: string, dir: string) {
        this.events.push({ name, dir, run: new (require(dir))(this.ket, this.prisma) })

        return name === 'ready'
            ? this.ket.once(name, (...args) => this.execute(name, args))
            : this.ket.on(name, (...args) => this.execute(name, args));
    }
    execute(name: string, args: any[]) {
        return this.events.filter(e => e.name === name).forEach((event) => {
            try {
                if (global.PRODUCTION_MODE) return event.run.on(...args);
                else {
                    delete require.cache[require.resolve(event.dir)];
                    return new (require(event.dir))(this.ket, this.prisma).on(...args);
                }
            } catch (error: any) {
                return console.log(`EVENTS/${event.name}`, 'ERRO GENÉRICO:', String(error.stack).slice(0, 256), 41)
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