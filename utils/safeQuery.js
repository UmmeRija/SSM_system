const mongoose = require('mongoose');

function isValidObjectId(value) {
    if (value === null || value === undefined) return false;
    return mongoose.Types.ObjectId.isValid(value);
}

async function safeFindWithPopulate(Model, filter, populatePaths = [], options = {}) {
    try {
        let query = Model.find(filter);
        populatePaths.forEach(path => query = query.populate(path));
        if (options.sort) query = query.sort(options.sort);
        if (options.skip) query = query.skip(options.skip);
        if (options.limit) query = query.limit(options.limit);
        return await query;
    } catch (error) {
        if (error.name === 'CastError') {
            let query = Model.find(filter);
            if (options.sort) query = query.sort(options.sort);
            if (options.skip) query = query.skip(options.skip);
            if (options.limit) query = query.limit(options.limit);
            return await query;
        }
        throw error;
    }
}

async function safeFindByIdWithPopulate(Model, id, populatePaths = []) {
    if (!isValidObjectId(id)) {
        return null;
    }
    try {
        let query = Model.findById(id);
        populatePaths.forEach(path => query = query.populate(path));
        return await query;
    } catch (error) {
        if (error.name === 'CastError') {
            return await Model.findById(id);
        }
        throw error;
    }
}

module.exports = {
    isValidObjectId,
    safeFindWithPopulate,
    safeFindByIdWithPopulate
};
