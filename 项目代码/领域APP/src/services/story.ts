import axios from "axios";
import moment from "moment";

export async function getRecommendationTopic(userId: string) {
	
	const { data } = await axios.get(`/recommendation/topics`, {
		params: {
			userId: userId,
			source: 'followee',
			cursorKey: 'createdAt',
			cursorOperator: 'greaterThan',
			cursorValue: (moment().subtract('days',2)).toISOString(),
		}
	})
	return data
}
