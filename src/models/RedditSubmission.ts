import mongoose, {Schema, Document} from 'mongoose'
import {nanoid} from 'nanoid'

export interface IRedditSubmission extends Document {
    _id: string
    subreddit: string
    submissionId: string
    name: string
    title: string
    selfText: string
    upVotes: string
    downVotes: string
    submissionCreatedUtc: number
}

const RedditSubmissionSchema: Schema = new Schema({
    _id: {
        type: String,
        default: () => `rs_${nanoid()}`
    },
    subreddit: {type: String, required: true},
    submissionId: {type: String, required: true},
    name: {type: String, required: true},
    title: {type: String, required: true},
    selfText: {type: String, required: true},
    upVotes: {type: Number, required: true},
    downVotes: {type: Number, required: true},
    submissionCreatedUtc: {type: Number, required: true},
}, {
    _id: false,
    timestamps: true,
})

export default mongoose.model<IRedditSubmission>('RedditSubmission', RedditSubmissionSchema)
