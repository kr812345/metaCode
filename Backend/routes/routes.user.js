/*const { createUserController, getUserDetailsController, loginUserController, forgetPasswordController, resendOtpToEmail, changePasswordController } = require('../controllers/controller.user');
const { verifyUserMiddleware} = require('../middleware/userAuth');

const userRouter = require('express').Router();

userRouter.post('/signup', createUserController);
userRouter.post('/login', loginUserController);
userRouter.get('/details', verifyUserMiddleware, getUserDetailsController);
// userRouter.post('/send-otp', sendOtpToEmail);
userRouter.post('/resend-otp',resendOtpToEmail)
userRouter.post('/forget',  forgetPasswordController);
userRouter.patch('/change', verifyUserMiddleware, changePasswordController);


module.exports = userRouter;
*/