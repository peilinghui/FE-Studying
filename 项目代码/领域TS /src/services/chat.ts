import axios from 'axios'

export async function addMessage(branchId: string, type: string, content: string, currentUserId: string, elements: []) {
  const { data } = await axios.post(`/chats/${branchId}/messages`, {
    type, content, elements, userId: currentUserId
  })
  return data
}

export async function addBranch(chatId: string, body: any) {
  const { data } = await axios.post(`/chats/${chatId}/branches`, body)
  return data
}

export async function ensureChat(currentUserId: string, targetId: string) {
  const { data } = await axios.post('/chats', {
    userId: currentUserId,
    targetId
  })
  return data
}

export async function getMessages(branchId: string) {
  const { data } = await axios.get(`/chats/${branchId}/messages`, {
    params: { sortMode: 'descending', sortKey: 'createdAt' }
  })
  return data
}

export async function getBranches(chatId: string) {
  const { data } = await axios.get(`/chats/${chatId}/branches`, {
    params: { sortMode: 'descending', sortKey: 'lastMsgAt' }
  })
  return data
}

export async function userChats(currentUserId: string) {
  const { data } = await axios.get(`/users/${currentUserId}/chats`, {
    params: {
      sortKey: 'lastMsgAt',
      sortMode: 'descending',
      getInfoForUserId: currentUserId,
      myView: 1
    }

  })
  return data
}
