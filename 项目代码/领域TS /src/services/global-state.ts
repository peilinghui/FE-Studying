export default class GlobalState {

    static GLOBAL_STATES: {[key: string]: any} = {}

    public static put(key: string, value: any) {
        this.GLOBAL_STATES[key] = value
    }

    public static get(key: string) {
        const value = this.GLOBAL_STATES[key];
        return value || null
    }

    public static destory(key: string) {
        delete this.GLOBAL_STATES[key]
    }

}