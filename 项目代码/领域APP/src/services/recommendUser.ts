import axios from "axios";

//第一次进入APP推荐好友
export async function getRecommendUser(currentUserId: string, offset: number, limit: number) {
    const { data: mrrUsers } = await axios.get('/recommendation/users', {
        params: { userId: currentUserId,offset,limit }
    })
    if (mrrUsers.length < 9) {
        const amount = 9 - mrrUsers.length;
        const { data: discoverUsers } = await axios.get('/discover/users', {
            params: {
                userId: currentUserId,
                amount
            }
        })
        return mrrUsers.concat(discoverUsers);
    }
    return mrrUsers;
}
