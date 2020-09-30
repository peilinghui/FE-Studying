import axios from 'axios'

export async function getRealms(currentUserId: string) {
  const { data } = await axios.get('/discover/realms', {
    params: { userId: currentUserId }
  })
  return data
}

export async function getUsers(currentUserId: string) {
  const { data } = await axios.get('/discover/users', {
    params: { userId: currentUserId }
  })
  return data
}

export async function fetchDiscoverData(userId: string) {
  let { data: latestRealms } = await axios.get(`/recommendation/realms/latest`, { params: { userId } });
  latestRealms = latestRealms.filter((data: any) => {
    if (!data.realm.statistics) {
      return false;
    }
    return true;
  })
  latestRealms = latestRealms.map((data: any, index: number) => {
    return data.realm
  });
  return { latestRealms };
}

//获取发现中的话题
export async function getTopics(currentUserId: string,limit: number) {
  const { data } = await axios.get('/discover/topics', {
    params: { 
      limit,
      offset:0,
      userId: currentUserId
    }
  })
  return data
}

//添加已读的话题
export async function addViewedTopics(userId: string, topicIds: any) {
  const { data } = await axios.post('/discover/topics/viewed', {
    userId,topicIds,
  })
  return data
}

//清空所有的已读话题
export async function clearViewedTopics(userId: string) {
  const { data } = await axios.delete(`/discover/topics/viewed`, {
    params: {
      userId
    }
  })
  return data
}