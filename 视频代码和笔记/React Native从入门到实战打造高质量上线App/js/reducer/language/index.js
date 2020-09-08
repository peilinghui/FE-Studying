import Types from "../../action/types"
import {FLAG_LANGUAGE} from "../../expand/dao/LanguageDao";

const defaultState = {
    languages: [],
    keys: [],
};

export default function onAction(state = defaultState, action) {
    switch (action.type) {
        case Types.LANGUAGE_LOAD_SUCCESS://获取数据成功
            if (action.flag === FLAG_LANGUAGE.flag_key) {
                return {
                    ...state,
                    keys: action.languages
                }
            }else{
                return {
                    ...state,
                    languages: action.languages
                };
            }
        default:
            return state;
    }
}