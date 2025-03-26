const UserModel = require("../models/model.user")

const createUserService = async (body) => {
    const finalBody = new UserModel(body)
    return await finalBody.save()
}


const getUserDetailsByEmailService = async (email) => {
    return await UserModel.findOne({ email })

}

const getUserDetailsByIdService = async (userId) => {
    return await UserModel.findOne({ _id: userId })
}

const updateUserDetailsByIdService = async (userId, body) => {
    return await UserModel.findOneAndUpdate({ _id: userId }, body)
}
module.exports = {
    createUserService,
    getUserDetailsByEmailService,
    getUserDetailsByIdService,
    updateUserDetailsByIdService
}