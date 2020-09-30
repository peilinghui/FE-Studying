import KVDB from './kvdb';

export default class ReadState {
 
    public static async isRead(objectId: string, timestamp: number) {
        const storedTimestamp = await KVDB.get(`ReadState:${objectId}`);
        if (!storedTimestamp) {
            return false;
        }
        return storedTimestamp >= timestamp;
    }

    public static async setReadState(objectId: string, timestamp: number) {
        await KVDB.put(`ReadState:${objectId}`, timestamp);
    }

}