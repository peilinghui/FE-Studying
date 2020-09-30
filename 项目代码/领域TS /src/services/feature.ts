import axios from 'axios'

export async function getSuggestionFigures() {
  const { data } = await axios.get('/features/suggestion/figures')
  return data
}

export async function getRealmInvCode(realmId: string, userId: string) {
  const { data } = await axios.get('features/invcode/realm', {
    params: {
      realmId, userId
    }
  })
  return data
}

export async function getShareRealmUrl(realmId: string, userId: string) {
  const { data } = await axios.get('/features/share/realm', {
    params: {
      realmId, userId
    }
  })
  return data.url
}

//微信提取钱包的钱
export async function weChatPayWithdraw(userId: string, realName: string, amount: number) {
  const { data } = await axios.post('/services/wechat/pay/withdraw', {
      userId,
      realName,
      amount,
    })
  return data
}

export async function processJoinRequest(notificationId: string, userId: string, decision: string) {
  const { data } = await axios.post(`/notifications/${notificationId}/decision`, {
    userId, decision
  })
  return data
}

export async function getMiniProgramCode(scene:string) {
  const { data } = await axios.get('/services/wechat/mp/code', {
    params: {
      scene,
      page:'pages/joined-realm/joined-realm',
      target: 'realmLite',
      base64: 1
    }
  })
  return data.image
}

//获取小程序二维码
export async function getMiniProgramQRCode(path: string) {
  const { data } = await axios.get('/services/wechat/mp/qrcode', {
    params: {
      path,
      target: 'realmLite',
      base64: 1
    }
  })
  return data.image
}

//已经授权过小程序
export async function IsAuthorizedByMiniProgram(userId: string,) {
  const { data } = await axios.get('/services/wechat/mp/check_authorized_user', {
    params: {
      userId,
      target: 'realmLite',
    }
  })
  return data
}

export async function getMobileApps() {
  const { data } = await axios.get('/features/mobile_apps')
  return data
}

//扫描登录web端
export async function checkStatus(webUrl: string) {
  const { data } = await axios.get(webUrl, {})
  return data.image
}