import { AsyncStorage } from 'react-native';

export default class MoonStorage {

  public async put(key: string, value: any, expire?: number) {
    if (typeof value === 'object') {
      await AsyncStorage.setItem(key, 'object__' + JSON.stringify(value));
    } else if (typeof value === 'number') {
      await AsyncStorage.setItem(key, 'number__' + String(value));
    } else {
      await AsyncStorage.setItem(key, 'string__' + value);
    }

    if (expire) {
      await AsyncStorage.setItem('expire__' + key, String(Date.now() + expire * 1000));
    }
  }

  public async get(key: string) {
    const expireAt = await AsyncStorage.getItem('expire__' + key);
    if (expireAt && Number(expireAt) < Date.now()) {
      this.remove(key);
      return null;
    }

    const payload = await AsyncStorage.getItem(key);
    if (!payload) {
      return null;
    }

    const sym = payload.substr(0, 8);
    const value = payload.substr(8);

    if (sym === 'object__') {
      return JSON.parse(value);
    } else if (sym === 'number__') {
      return Number(value);
    } else {
      return value;
    }
  }

  public async remove(key: string) {
    await AsyncStorage.removeItem(key);
    await AsyncStorage.removeItem('expire__' + key);
  }

  public async clear() {
    await AsyncStorage.clear();
  }

}