const Poll = require('../models/Poll');
const { safeFindWithPopulate, safeFindByIdWithPopulate, isValidObjectId } = require('../utils/safeQuery');

const PollController = {
    create: async (req, res) => {
        const { question, options, expiresAt, category } = req.body;
        try {
            if (!question || !options || !options.length || !expiresAt) {
                return res.json({
                    message: "Required fields missing",
                    status: false
                });
            }

            const poll = await Poll.create({
                question,
                options,
                createdBy: req.user.id,
                expiresAt,
                category: category || 'general'
            });

            return res.json({
                message: "Poll created successfully",
                status: true,
                poll
            });
        } catch (error) {
            return res.json({
                message: error.message,
                status: false
            });
        }
    },

    all: async (req, res) => {
        try {
            const polls = await safeFindWithPopulate(Poll, {}, ['createdBy']);
            return res.json({
                message: "Polls retrieved successfully",
                status: true,
                polls
            });
        } catch (error) {
            return res.json({
                message: error.message,
                status: false
            });
        }
    },

    vote: async (req, res) => {
        const { optionIdx } = req.body;
        const pollId = req.params.id;
        try {
            const poll = await safeFindByIdWithPopulate(Poll, pollId, []);
            if (!poll) {
                return res.json({
                    message: "Poll not found",
                    status: false
                });
            }

            if (poll.votedBy.includes(req.user.id)) {
                return res.json({
                    message: "You have already voted in this poll",
                    status: false
                });
            }

            if (new Date() > new Date(poll.expiresAt)) {
                return res.json({
                    message: "Poll has expired",
                    status: false
                });
            }

            const selectedOption = poll.options[optionIdx];
            if (!selectedOption) {
                return res.json({
                    message: "Invalid option selected",
                    status: false
                });
            }

            const currentVotes = poll.votes.get(selectedOption) || 0;
            poll.votes.set(selectedOption, currentVotes + 1);
            poll.votedBy.push(req.user.id);
            poll.totalVotes += 1;

            await poll.save();

            return res.json({
                message: "Vote recorded successfully",
                status: true,
                poll
            });
        } catch (error) {
            return res.json({
                message: error.message,
                status: false
            });
        }
    }
};

module.exports = PollController;
