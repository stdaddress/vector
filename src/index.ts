import mongoose from "mongoose"
import {MONGODB_URL} from "./config/mongodb";
import RedditSubmissionWorker from "./workers/RedditSubmissionWorker";
import RedditSubmission from "./models/RedditSubmission";
import Sentiment from 'sentiment'

const subreddits = ['ethereum', 'Bitcoin', 'CryptoCurrency', 'kucoin']
const subredditWorkers = subreddits.map(subreddit => {
    const worker = new RedditSubmissionWorker(subreddit)
    worker.start()
    return worker
})

// Run sentiment analysis on all data fetched from API

// RedditSubmission.find({})
//     .then(submissions => {
//         submissions.map(submission => {
//             const sentiment = new Sentiment()
//             const result = sentiment.analyze(submission.title)
//             if (result.score) {
//                 console.log(result.score, '|', 'ups', submission.upVotes, submission.title)
//             }
//         })
//     })

mongoose.connect(MONGODB_URL)
    .then(() => console.log('MongoDB connected.'))
