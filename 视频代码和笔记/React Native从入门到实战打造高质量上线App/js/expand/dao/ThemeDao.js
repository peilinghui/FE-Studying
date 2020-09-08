import {AsyncStorage} from "react-native";
import {ThemeFlags} from "../../res/styles/ThemeFactory";

const THEME_KEY = "theme_key";

export default class ThemeDao {

    /**
     * 获取当前主题
     * @returns {Promise<any> | Promise}
     */
    getTheme() {
        return new Promise((resolve, reject) => {
            AsyncStorage.getItem(THEME_KEY, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                //如果没有主题就返回默认主题
                if (!result) {
                    this.save(ThemeFlags.Default);
                    result = ThemeFlags.Default;
                }
                resolve(ThemeFlags.createTheme(result));
            })
        })
    }

    /**
     * 保存主题
     * @param objectData
     */
    save(ThemeFlag) {
        AsyncStorage.setItem(THEME_KEY,ThemeFlag,(error,result)=>{

        });
    }
}