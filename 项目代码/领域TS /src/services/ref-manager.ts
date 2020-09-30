let sharedRefs: { [key: string]: any } = {};

export default class ReferenceManager {

    static setRef(name: string, ref: any) {
        sharedRefs[name] = ref;
    }

    static getRef(name: string) {
        if (!sharedRefs[name]) {
            return null;
        }
        if (Array.isArray(sharedRefs[name])) {
            if (sharedRefs[name].length > 0) {
                return sharedRefs[name][sharedRefs[name].length - 1];
            } else {
                return null;
            }
        } 
        return sharedRefs[name];
    }

    static removeRef(name: string) {
        if (sharedRefs[name]) {
            delete sharedRefs[name];
        }
    }

    static addStackRef(name: string, ref: any) {
        if (!sharedRefs[name]) {
            sharedRefs[name] = [];
        }
        sharedRefs[name].push(ref);
    }

    static popStackRef(name: string) {
        if (Array.isArray(sharedRefs[name])) {
            sharedRefs[name].pop();
        }
    }

}