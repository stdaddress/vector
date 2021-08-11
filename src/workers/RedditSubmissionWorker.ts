import IWorker from "./IWorker";
import {REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_PASSWORD, REDDIT_USERNAME} from "../config/reddit";
import Snoowrap from "snoowrap";
import RedditSubmission from "../models/RedditSubmission";
import Logger from "../logger/Logger";
import chalk from "chalk";

export default class RedditSubmissionWorker implements IWorker {

    private _requester: Snoowrap
    private readonly _subredditName: string

    constructor(subreddit: string) {
        this._requester = new Snoowrap({
            userAgent: 'node',
            clientId: REDDIT_CLIENT_ID,
            clientSecret: REDDIT_CLIENT_SECRET,
            username: REDDIT_USERNAME,
            password: REDDIT_PASSWORD
        })

        this._subredditName = subreddit

        this._fetchNewSubmissions = this._fetchNewSubmissions.bind(this)
    }

    private _log(...msg) {
        Logger.log(`${chalk.red(`[Reddit (${this._subredditName})]`)}`, ...msg)
    }

    async _fetchNewSubmissions({after}: { after?: string }) {
        this._requester.getSubreddit(this._subredditName)
            .getNew({limit: 100, after: after})
            .then(async posts => {
                let insertedCount = 0
                await Promise.all(posts.map(async post => {
                    if (!await RedditSubmission.findOne({name: post.name})) {
                        const redditSubmission = new RedditSubmission({
                            subreddit: this._subredditName,
                            submissionId: post.id,
                            name: post.name,
                            title: post.title,
                            selfText: post.selftext || '_NO_TEXT',
                            upVotes: post.ups,
                            downVotes: post.downs,
                            submissionCreatedUtc: post.created_utc
                        })
                        await redditSubmission.save()
                        insertedCount += 1
                    }
                }))
                if (!posts.isFinished && insertedCount !== 0) {
                    this._log(`Fetched ${insertedCount} new submissions.`)
                    setTimeout(() => this._fetchNewSubmissions({after: posts.pop().name}), 10000)
                } else {
                    this._log(`Finished fetching submissions, waiting 30 seconds before trying again.`)
                    setTimeout(() => this._fetchNewSubmissions({}), 30000)
                }
            })
    }

    start(): Promise<void> {
        this._fetchNewSubmissions({})
        return Promise.resolve(undefined)
    }

}
