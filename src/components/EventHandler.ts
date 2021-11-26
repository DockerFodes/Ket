export default class EventHandler {
    ket: any
    events: Array<any>
    eventData: any

    constructor(ket) {
        this.ket = ket
        this.events = []
    }
    add(name: string, func: string, dir: string, data) {
        this.ket.on(name, (...args) => this.execute({ func, args, data }))

        interface Event {
            name: string;
            func: string;
            dir: string;
        }
        let eventData: Event = {
            name: name,
            func: func,
            dir: dir,
        }
        return this.events.push(eventData)
    }
    execute({ func, args, data }) {
        return this.events.filter(evento => evento.func === func).map((event) => {
            delete require.cache[require.resolve(event.dir)]
            try {
                new (require(event.dir))(data).start(...args)
            } catch(e) {
                this.ket.emit('error', e, 'EVENTS-HANDLER');
            }
            return;
        })
    }
    remove(func: string) {
        if (!this.events.filter(evento => evento.module === func)[0]) return false
        delete this.events[this.events.findIndex(event => event.module === func)]
        return true
    }
}