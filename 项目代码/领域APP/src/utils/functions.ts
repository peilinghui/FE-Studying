import sum from 'hash-sum';

let DELAY_JOBS: { [key: string]: number } = {};

export function delayJob(name: string, callback: CallableFunction, delay: number) {
    if (DELAY_JOBS[name]) {
        clearTimeout(DELAY_JOBS[name]);
    }
    DELAY_JOBS[name] = setTimeout(callback, delay);
}

export function objectHash(obj: any) {
    return sum(obj);
}

export const delay = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout))

export const action = (type: string, payload: any) => ({ type, payload });

export function groupBy(array: any, f: any) {
	const groups: { [key: string]: any } = {};
	array.forEach(function(o: any) {
		const group = JSON.stringify(f(o));
		groups[group] = groups[group] || [];
		groups[group].push(o);
	});
	return Object.keys(groups).map(function(group) {
		return groups[group];
	});
}

export function flatten(arr :any){
    let res : any = [];
    for(let i=0;i<arr.length;i++){
        if(Array.isArray(arr[i])){
            res = res.concat(flatten(arr[i]));
        }else{
            res.push(arr[i]);
        }
    }
    return res;
}

//以 fetchList 为基准进行处理，处理已读 未读 作用，标记已读 未读 消息
export function combineAtrr(arr: Array<any>, fetchList: Array<any>) {
	if(arr&&fetchList){
		//合并数组，标记read 属性
		for (let i = 0; i <= fetchList.length - 1; i++) {
			for (let j = 0; j <= arr.length - 1; j++) {
				if ( fetchList[i]._id === arr[j]._id) {
					fetchList[i].read = arr[j].read
				}
				if(!fetchList[i].read){
					fetchList[i].read=0;
				}
			}
		}
		//数组分组
		const groupList = groupBy(fetchList, function(item: any) {
			return [item.read];
		});
		//groupList 数组排序 read===0排序在前
		groupList.sort((a, b) => {
				const value1 = a.read;
				const value2 = b.read;
				return value2 - value1;
			}
		)
		
		//将二维数组的第一个标记 readText
		groupList.map((item, index) => {
			for (let i = 0; i < item.length; i++) {
				//排序第一 并且 标记为 未读状态
				if (index === 0 && item[0].read === 0) {
					item[0].readText = '新的'
					
				} else {
					if(item[0].read===1){
						item[0].readText = '从前的'
					}
				}
			}
		})
		// 将二维数组 转换成一维数组
		const res = flatten(groupList);
		return res;
	}else return []
	
	
}
