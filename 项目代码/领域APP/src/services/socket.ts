import io from 'socket.io-client'

export function connect(token: string, userId: string) {
    const socket = io('https://api.public.atrealm.com/push', {
        transports: ['websocket'],
        query: { token, userId },
        reconnection: true
    });
    return new Promise(resolve => {
        socket.on('connect', () => {
            resolve(socket)
        })
    })
}

