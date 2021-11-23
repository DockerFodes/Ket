module.exports = class ErrorEvent {
    ket: any

    constructor(ket: any) {
        this.ket = ket
    }
    async start(error: string, setor:string = "CLIENT") {
        global.log('error', setor, `Erro detectado:`, error)
        return console.error(error)
    }
}