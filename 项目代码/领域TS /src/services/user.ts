import axios from 'axios'

export async function updateAvatar(userId: string, fileId: string) {
  const { data } = await axios.put(`/users/${userId}/profile/avatar`, {
    fileId
  })
  return data
}
export async function updateCover(userId: string, fileId: string) {
  const { data } = await axios.put(`/users/${userId}/profile/cover`, {
    fileId
  })
  return data
}

export async function updateProfile(userId: string, profile: { nickname?: string, school?: string, intro?: string, location?: string }) {
  const { data } = await axios.put(`/users/${userId}/profile`, {
    'doc': profile
  })
  return data
}

export async function search(params: { keyword?: string }) {
  const { data } = await axios.get('/users', { params })
  return data
}

export async function getNotifications(userId: string, cursorAt: string | undefined, limit: number) {
  const { data } = await axios.get(`/users/${userId}/notifications`, {
    params: {
      sortKey: 'createdAt',
      sortMode: 'descending',
      cursorKey: 'createdAt',
      cursorOperator: 'lessThan',
      cursorValue: cursorAt,
      limit,
    }
  })
  return data
}

//获取钱包
export async function getAccount(userId: string) {
  const { data } = await axios.get(`/users/${userId}/account`)
  return data
}
//获取钱包交易
export async function getTransactions(userId: string, cursorAt: string | undefined, limit: number) {
  const { data } = await axios.get(`/users/${userId}/account/transactions`, {
    params: {
      sortKey: 'createdAt',
      sortMode: 'descending',
      cursorKey: 'createdAt',
      cursorOperator: 'lessThan',
      cursorValue: cursorAt,
      limit,
    }
  })
  return data
}

export async function removeFigure(userId: string, figure: string) {
  const { data } = await axios.delete(`users/${userId}/figures`, {
    params: { figure }
  })
  return data
}

export async function agreeFigure(userId: string, figure: string, fromUserId: string) {
  const { data } = await axios.post(`/users/${userId}/figures/agree`, {
    figure,
    fromUserId
  })
  return data
}

export async function getFigureAgreedUsers(userId: string, figure: string) {
  const { data } = await axios.get(`/users/${userId}/figures/agreed`, {
    params: {
      figure
    }
  })
  return data
}

export async function removeRelation(currentUserId: string, targetId: string, path: string, callBack: any) {
  const { data } = await axios.delete(`/users/${currentUserId}/relations`, {
    params: {
      targetId,
      path,
    }
  })
  if (data) {
    callBack && callBack();
  }
  return data
}

export async function addRelation(currentUserId: string, targetId: string, path: string, callBack: any) {
  const { data } = await axios.post(`/users/${currentUserId}/relations`, {
    targetId,
    path,
  })
  if (data) {
    callBack && callBack();
  }
  return data
}

export async function getRelations(path: string, userId: string, currentUserId: string,
  offset: number, limit: number) {
  const { data } = await axios.get(`/users/${userId}/relations`, {
    params: {
      path,
      getInfoForUserId: currentUserId,
      offset,
      limit
    }
  })
  return data
}

//好友
export async function getFriends(currentUserId: string,offset: number, limit: number) {
  const { data } = await axios.get(`/users/${currentUserId}/relations/friends`, {
    params: {
      getInfoForUserId: currentUserId,
      getCommonFriendsForUserId: currentUserId,
      offset,
      limit
    }
  })
  return data
}


export async function getReceivedAgrees(userId: string, offset: number, limit: number) {
  const { data } = await axios.get(`/users/${userId}/agrees`, {
    params: {
      path: 'received',
      offset: offset,
      limit: limit,
      sortMode: 'descending',
      sortKey: 'createdAt'
    }
  })
  return data
}

export async function addFigure(userId: string, figure: string) {
  const { data } = await axios.post(`/users/${userId}/figures`, {
    figure
  })
  return data
}

export async function addCard(userId: string, type: string, connectionId: string) {
  const { data } = await axios.post(`/users/${userId}/cards`, {
    type,
    connectionId
  })
  return data
}

export async function removeCard(userId: string, cardId: string) {
  const { data } = await axios.delete(`/users/${userId}/cards`, {
    params: { cardId }
  })
  return data
}

export async function getCards(userId: string) {
  const { data } = await axios.get(`/users/${userId}/cards`)
  return data
}

//获取卡片
export async function getFeatures() {
  const { data } = await axios.get(`/features/connections`)
  return data
}

export async function getFigures(userId: string) {
  const { data } = await axios.get(`/users/${userId}/figures`)
  return data
}


export async function isLanded(userId: string) {
  const { data } = await axios.post(`/users/${userId}/land`, {
    deviceType: 'android'
  })
  return data
}

//共同好友
export async function commonFriends(currentUserId: string, targetId: string) {
  const { data } = await axios.get(`/users/${currentUserId}/relations/common_friends`, {
    params: { targetId }
  })
  return data
}

export async function wechatLogin(accessToken: string, openId: string) {
  const { data } = await axios.post('/auth/login/wechat', { accessToken, openId })
  return data
}


export async function wechatAccessToken(appId: string, appSecret: string, code: string) {
  const { data } = await axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
    params: {
      appid: appId,
      secret: appSecret,
      code,
      grant_type: 'authorization_code',
    }
  }
  )
  return data
}


export async function current() {
  const { data } = await axios.get('/auth/current')
  return data
}

export async function login({ countryCode, mobile, password }: any) {
  const { data } = await axios.post('/auth/login', { countryCode, mobile, password })
  return data
}

export async function detail(userId: string, currentUserId: string) {
  const { data } = await axios.get(`/users/${userId}`, {
    params: { getInfoForUserId: currentUserId }
  })
  return data
}
