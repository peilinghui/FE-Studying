import axios from 'axios'

export async function topicMessages(topicId: string, currentUserId: string, cursorAt: string | null, limit: number) {
  const { data } = await axios.get(`/topics/${topicId}/messages`, {
    params: {
      cursorKey: 'createdAt',
      cursorOperator: 'greaterThan',
      cursorValue: cursorAt,
      limit,
      getInfoForUserId: currentUserId,
      sortMode: 'ascending',
      sortKey: 'createdAt'
    },
    cancelToken: axios.CancelToken.source().token
  })
  return data
}

export async function distopicMessages(topicId: string, currentUserId: string, limit: number) {
  const { data } = await axios.get(`/topics/${topicId}/messages`, {
    params: {
      limit,
      getInfoForUserId: currentUserId,
      sortMode: 'ascending',    
    },
  })
  return data
}

//消息暂同
export async function agree(messageId: string, currentUserId: string) {
  axios.post(`/messages/${messageId}/agrees`, { userId: currentUserId })
}

//消息撤回
export async function recall(messageId: string, currentUserId: string) {
  axios.post(`/messages/${messageId}/recall`, { userId: currentUserId })
}
