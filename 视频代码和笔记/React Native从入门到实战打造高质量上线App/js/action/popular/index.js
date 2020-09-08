import Types from "../types"
import DataStore,{FLAG_STORAGE} from "../../expand/dao/DataStore"
import {_projectModels, handleData} from "../ActionUtil"

/**
 * 获取最热数据的异步action
 * @param storeName
 * @param url
 * @returns {{type: string, theme: *}}
 */
export function onLoadPopularData(storeName, url, pageSize,favoriteDao) {
    return dispatch => {
        dispatch({
            type: Types.POPULAR_REFRESH,
            storeName
        });
        let dataStore = new DataStore();
        dataStore.fetchData(url,FLAG_STORAGE.flag_popular)//异步action与数据流
            .then(data => {
                handleData(Types.LOAD_POPULAR_SUCCESS,dispatch, storeName, data, pageSize,favoriteDao);
            })
            .catch(error => {
                console.log(error);
                dispatch({
                    type: Types.LOAD_POPULAR_FAIL,
                    storeName,
                    error
                })
            })
    }
}

/**
 *
 * @param storeName
 * @param pageIndex 第几页
 * @param pageSize 每页展示条数
 * @param dataArray 原始数据
 * @param callBack 回调函数，可以通过回调函数来向调用页面通信：比如异常信息的展示，没有更多等待
 */
export function onLoadMorePopular(storeName, pageIndex, pageSize, dataArray = [],favoriteDao, callBack) {
    return dispatch => {
        setTimeout(() => {//模拟网络请求
            if ((pageIndex - 1) * pageSize >= dataArray.length) {//已加载完全部数据
                if (typeof  callBack === "function") {
                    callBack("no more")
                }
                dispatch({
                    type: Types.POPULAR_LOAD_MORE_FAIL,
                    error: "no more",
                    storeName: storeName,
                    pageIndex: --pageIndex,
                    hideLoadingMore:true,
                })
            } else {
                let max = pageSize * pageIndex > dataArray.length ? dataArray.length : pageSize * pageIndex;
                _projectModels(dataArray.slice(0,max),favoriteDao,data=>{
                    dispatch({
                        type: Types.POPULAR_LOAD_MORE_SUCCESS,
                        storeName,
                        pageIndex,
                        projectModes: data,
                        hideLoadingMore:false,
                    })
                })

            }
        }, 500);
    }
}

export function onFlushPopularFavorite(storeName, pageIndex, pageSize, dataArray = [],favoriteDao) {
    return dispatch=> {
        let max = pageSize * pageIndex > dataArray.length ? dataArray.length : pageSize * pageIndex;
        _projectModels(dataArray.slice(0,max),favoriteDao,data=>{
            dispatch({
                type: Types.POPULAR_FLUSH_FAVORITE,
                storeName,
                pageIndex,
                projectModes: data,
            })
        })
    }
}
