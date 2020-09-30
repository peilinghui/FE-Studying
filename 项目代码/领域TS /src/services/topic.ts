import axios from 'axios'
import { buildTopicCardHeight } from '../components/TopicCard'

export async function setNotification(topicId: string, currentUserId: string, status: boolean) {
  const { data } = await axios.put(`/topics/${topicId}/notification`, {
    userId: currentUserId,
    status: status ? 1 : 0,
  })
  return data
}

export async function getUserSettings(topicId: string, currentUserId: string) {
  const { data } = await axios.get(`/topics/${topicId}/user_settings`, {
    params: {
      userId: currentUserId
    }
  })
  return data
}

export async function archive(topicId: string) {
  const { data } = await axios.put(`/topics/${topicId}/Archive`, {
    isArchived: 1,
  })
  return data
}

export async function createTopic(realmId: string, type: string, content: string, tag: string, elements: any[], currentUserId: string) {
  const { data } = await axios.post(`/realms/${realmId}/topics`, {
    type, content, elements, tag, userId: currentUserId
  })
  return data
}

export async function topicTags(realmId: string) {
  const { data } = await axios.get(`/realms/${realmId}/topic_tags`)
  return data
}

//获取讨论成员
export async function topicMembers(topicId: string) {
  const { data } = await axios.get(`/topics/${topicId}/members`)
  return data
}

//获取领域话题
export async function realmTopics(realmId: string, currentUserId: string, cursorAt: string | null, limit: number, value: string) {
  const { data } = await axios.get(`/realms/${realmId}/topics`, {
    params: {
      cursorKey: 'createdAt',
      cursorOperator: 'lessThan',
      cursorValue: cursorAt,
      limit,
      getInfoForUserId: currentUserId,
      tag: value === '最新讨论' ? '' : value,
    }
  })

  await buildTopicCardHeight(data)
  return data
}

export async function getRealmTopicsSmall(realmId: string, currentUserId: string, cursorAt: string | null, limit: number) {
  const { data } = await axios.get(`/realms/${realmId}/topics`, {
    params: {
      cursorKey: 'createdAt',
      cursorOperator: 'lessThan',
      cursorValue: cursorAt,
      limit,
      getInfoForUserId: currentUserId,
      sortMode: 'descending',
      sortKey: 'statistics.numOfMessages'
    }
  })

  await buildTopicCardHeight(data)
  return data
}

//获取用户参与的话题
export async function userRealmTopics(realmId: string, currentUserId: string, cursorAt: string | null, limit: number, userId: string) {
  const { data } = await axios.get(`/realms/${realmId}/topics`, {
    params: {
      cursorKey: 'createdAt',
      cursorOperator: 'lessThan',
      cursorValue: cursorAt,
      limit,
      getInfoForUserId: currentUserId,
      userId
    }
  })

  await buildTopicCardHeight(data)
  return data
}



export async function joinedTopics(currentUserId: string, cursorAt: string | null, limit: number) {
  const { data } = await axios.get(`/users/${currentUserId}/topics`, {
    params: {
      cursorKey: 'lastMsgAt',
      cursorOperator: 'lessThan',
      cursorValue: cursorAt,
      limit,
      sortKey: 'lastMsgAt',
      sortMode: 'descending',
      getInfoForUserId: currentUserId,
      myView: 1
    }
  })
  return data
}

export async function detail(topicId: string, currentUserId: string) {
  const { data } = await axios.get(`/topics/${topicId}`, {
    params: {
      getInfoForUserId: currentUserId
    },
    cancelToken: axios.CancelToken.source().token
  })
  return data
}

export async function reply(topicId: string, type: string, content: string, currentUserId: string, elements: []) {
  const { data } = await axios.post(`/topics/${topicId}/messages`, {
    type,
    content,
    elements,
    userId: currentUserId
  })
  return data
}

export async function agree(topicId: string, currentUserId: string) {
  axios.post(`/topics/${topicId}/agrees`, { userId: currentUserId })
}
