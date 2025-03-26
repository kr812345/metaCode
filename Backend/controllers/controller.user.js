const { createUserDto, validateCreateUserDto, getUserDto } = require("../DTOs/user.dto");
const { sendResponse, generateToken, generateOTP } = require("../Helpers/helpers.commonFunc");
const { saltRounds, html, forgothtml } = require("../Helpers/helpers.constant");
const logger = require("../Helpers/loggerFunction");
const { createUserService, getUserDetailsByIdService, getUserDetailsByEmailService, updateUserDetailsByIdService } = require("../Services/services.user");
const bcrypt = require("bcrypt");
const { createUserDictonaryServices } = require("../Services/services.userDictonary");
const { sendEmail } = require("../Helpers/helpersNotification");
require('dotenv').config(); 

const loginUserController = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Fetch user by email
        const user = await getUserDetailsByEmailService(email.toLowerCase());
        if (!user) {
            return sendResponse(res, null, 400, false, "Invalid credentials");
        }
        // Check if the user is verified
        if (!user.isVerified) {
            return sendResponse(res, null, 400, false, "User not verified");
        }
        // Check if the password matches
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return sendResponse(res, null, 400, false, "Invalid credentials");
        }
        // Generate token if password is valid and user is verified
        const accessToken = await generateToken({
            user: {
                _id: user._id,
                userType: user.userType,
                email: user.email,
            },
            isVerified: true
        });
        // Send response with token and user info
        sendResponse(res, null, 200, true, "Login successful", { token: accessToken, user: getUserDto(user) });
    } catch (err) {
        sendResponse(res, err);
    }
};

const createUserController = async (req, res) => {
    try {
        console.log("Request received:", req.body);

        // Validate request body
        if (!validateCreateUserDto(req.body)) {
            console.log("Invalid request body:", req.body);

            const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (!isValidEmail(req.body.email.toLowerCase())) {
                console.log("Invalid email format:", req.body.email);
                sendResponse(res, null, 400, false, "Invalid email format");
                return;
            }
            sendResponse(res, null, 400, false, "Invalid request body");
            return;
        }

        // Normalize email and check for existing user
        const email = req.body.email.toLowerCase();
        console.log("Validated email:", email);

        let userDetails = await getUserDetailsByEmailService(email);
        console.log("User details fetched:", userDetails);

        if (userDetails) {
            if (userDetails.isVerified) {
                console.log("User already verified:", userDetails);
                sendResponse(res, null, 400, false, "User already exists");
                return;
            } else {
                console.log("User exists but not verified:", userDetails);

                const emailOtp = generateOTP();
                console.log("Generated OTP:", emailOtp);

                const token = await generateToken({
                    user: {
                        _id: userDetails._id,
                        userType: userDetails.userType,
                        email: userDetails.email,
                    },
                    isVerified: false,
                });
                console.log("Generated token:", token);

                await updateUserDetailsByIdService(userDetails._id, { emailOtp });
                console.log("User details updated with OTP:", userDetails._id);

                sendEmail(userDetails.email, "login otp", html(emailOtp));
                console.log("Email sent to:", userDetails.email);

                sendResponse(res, null, 200, true, "OTP sent successfully on email",{ token,user:userDetails});
                return;
            }
        } else {
            console.log("User does not exist. Creating a new user.");

            let userType = "care-giver";
            if (req.body.userType) {
                userType = req.body.userType;
            }
            console.log("User type:", userType);

            // Encrypt the password
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
            console.log("Password hashed.");

            const emailOtp = generateOTP();
            console.log("Generated OTP for new user:", emailOtp);

            userDetails = await createUserService({
                ...createUserDto({
                    ...req.body,
                    email,
                    password: hashedPassword,
                    userType
                }),
                userType,
                emailOtp,
                ...(userType === "care-giver" && { coachType: req.body.coachType })
            });
            console.log("New user created:", userDetails);

            sendEmail(userDetails.email, "login otp", html(emailOtp));
            console.log("Email sent to new user:", userDetails.email);

            await createUserDictonaryServices({ userId: userDetails._id });
            console.log("User dictionary created for:", userDetails._id);

            const token = await generateToken({
                user: {
                    _id: userDetails._id,
                    userType: userDetails.userType,
                    email: userDetails.email,
                },
                isVerified: false,
            });
            console.log("Generated token for new user:", token);

            sendResponse(res, null, 201, true, "User created successfully. OTP sent on email for verification", { token: token, user:userDetails });
            return;
        }
    } catch (err) {
        console.error("Error in createUserController:", err);
        sendResponse(res, err);
    }
};


const getUserDetailsController = async (req, res) => {
    try {
        const user = await getUserDetailsByIdService(req.user._id);
        if (!user) {
            sendResponse(res, null, 400, false, "user not found");
            return
        } else {
            sendResponse(res, null, 200, true, "user details fetched successfully", getUserDto(user));
            return
        }
    } catch (err) {
        sendResponse(res, err);
    }
}

// write a controller to verify Otp
const verifyOtpController = async (req, res) => {
    try {
        const userDetails = await getUserDetailsByIdService(req.user._id);
        if (!userDetails) {
            return sendResponse(res, null, 400, false, "user not found");
        } else {
            if (!userDetails.isVerified) {
                if (userDetails.emailOtp === req.body.emailOtp) {
                    const token = await generateToken({
                        user: {
                            _id: userDetails._id,
                            userType: userDetails.userType,
                            email: userDetails.email,
                        },
                        isVerified: true
                    });
                    await updateUserDetailsByIdService(userDetails._id, { isVerified: true });
                    return sendResponse(res, null, 200, true, "user verified successfully", { token });
                } else {
                    return sendResponse(res, null, 400, false, "invalid otp");
                }
            } else {
                if (req.user.tokenType == "forget") {
                    const token = await generateToken({
                        user: {
                            _id: userDetails._id,
                            userType: userDetails.userType,
                            email: userDetails.email,
                            tokenType: "forget"
                        },
                        isVerified: true
                    });
                    await updateUserDetailsByIdService(userDetails._id, { isVerified: true });
                    sendResponse(res, null, 200, true, "otp verified successfully", { token });
                    return
                } else {
                    sendResponse(res, null, 400, false, "user already verified");
                    return
                }
            }
        }
    } catch (err) {
        console.log(err);
        sendResponse(res, err);
    }
}

const resendOtpToEmail = async (req, res) => {
    try {
        const user = await getUserDetailsByEmailService(req.body.email?.toLowerCase());
        if (!user) {
            sendResponse(res, null, 400, false, "User not found");
            return
        }
       
        const emailOtp = generateOTP();

        await updateUserDetailsByIdService(user._id, { emailOtp });
        sendEmail(user.email, "login otp", html(emailOtp));
        sendResponse(res, null, 200, true, "OTP sent successfully on email");
        return
    } catch (error) {
        console.log(error);
        logger.error(error);
        sendResponse(res, error);
    }

}


const forgetPasswordController = async (req, res) => {
    try {
        const { email } = req.body;

        // Fetch user by email
        const user = await getUserDetailsByEmailService(email);
        console.log(user);

        if (!user) {
            return sendResponse(res, null, 400, false, "Invalid credentials");
        }
        // Check if the user is verified
        if (!user.isVerified) {
            return sendResponse(res, null, 400, false, "User not verified");
        }

            
        const token = await generateToken(
            { user: { _id: user._id, email: user.email }, isVerified: user.isVerified },
            process.env.JWT_SECRET_KEY,
            "15m" // Token expires in 15 minutes
        );

        // Create a password reset link
        const resetLink = `devdoot/reset-password?token=${token}.com`;
        console.log(resetLink,'yeh lo');

        sendEmail(email, "Click on this link to reset the password ", forgothtml(resetLink));
        sendResponse(res, null, 200, true, "Reset Password Mail Sent Successfully");


    } catch (err) {
        console.log(err);
        logger.error(err);
        sendResponse(res, err);
    }
};



const changePasswordController = async (req, res) => {
    try {
        const { newPassword } = req.body; 
        const userId = req.user._id; 
        // Validate new password

        if (!newPassword || newPassword.length < 8) {
            return sendResponse(res, null, 400, false, "Password must be at least 8 characters long");
        }

        // Hash the new password
        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

     
        const isUpdated = await updateUserDetailsByIdService(userId, { password: hashedPassword });

        if (!isUpdated) {
            return sendResponse(res, null, 500, false, "Password update failed");
        }

        // Respond with success
        return sendResponse(res, null, 200, true, "Your password has been changed successfully");
    } catch (err) {
        console.error(err);
        return sendResponse(res, err, 500, false, "An error occurred");
    }
};


module.exports = {
    createUserController,
    getUserDetailsController,
    loginUserController,
    verifyOtpController,
    forgetPasswordController,
    resendOtpToEmail,
    changePasswordController
};