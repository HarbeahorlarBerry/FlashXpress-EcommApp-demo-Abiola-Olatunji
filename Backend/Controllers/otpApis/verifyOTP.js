import User from "../../Models/usersSchema.js";
import { hashOtp, issueOtp } from "../../utils/Otp.js";

const MAX_ATTEMPTS = 5;

export const verifyOTP = async (req, res) => {
  const gmail = String(req.body.gmail || "").toLowerCase().trim();
  const otp = String(req.body.otp || "").trim();
  const invalid = () =>
    res.status(400).json({ status: "error", message: "Invalid or expired code" });

  const user = await User.findOne({ gmail });
  if (!user || user.isVerified || !user.otp) return invalid();

  if (user.otpAttempts >= MAX_ATTEMPTS) {
    return res.status(429).json({ status: "error", message: "Too many attempts. Request a new code." });
  }
  if (!user.otpExpires || user.otpExpires < Date.now()) return invalid();

  if (hashOtp(otp) !== user.otp) {
    user.otpAttempts += 1;
    await user.save();
    return invalid();
  }

  user.otp = undefined;
  user.otpExpires = undefined;
  user.otpAttempts = 0;
  user.isVerified = true;
  await user.save();
  res.json({ status: "success", message: "Email verified, you can now log in" });
};

export const resendOTP = async (req, res) => {
  const gmail = String(req.body.gmail || "").toLowerCase().trim();
  const generic = { status: "success", message: "If the account needs verification, a new code was sent" };

  const user = await User.findOne({ gmail });
  if (!user || user.isVerified) return res.json(generic); // don't reveal account state

  if (user.lastOtpSentAt && Date.now() - user.lastOtpSentAt < 2 * 60 * 1000) {
    return res.status(429).json({ status: "error", message: "Please wait 2 minutes before requesting another code" });
  }
  await issueOtp(user, "Your new verification code");
  res.json(generic);
};

// import User from "../../Models/usersSchema.js";
// import { generateOTP, sendMail } from "../../utils/sendEmail.js";

// export const verifyOTP = async (req, res) =>{
//     const { otp, gmail } = req.body

//     try {
//         const user = await User.findOne({ gmail });
//         if (!user) {
//             res.status(400).json({message: "User not found please register first to continue "});
//             return
//         }

//          if (user.isVerified) return res.status(400).json({ message: "OTP is already verified" })

//         if (user.otp !== otp) return res.status(400).json({ message: "OTP is incorrect" })
//         if (user.otpExpires < Date.now()) return res.status(400).json({ message: "OTP is expired" })
        
//         //verify otp
//         user.otp = undefined
//         user.otpExpires = undefined
//         user.isVerified = true

//         await user.save()
//         res.status(200).json({ message: "OTP is verified, please proceed to login" })
//     } catch (error) {
//         res.status(500).json(error)
//     }
// }


// export const resendOTP = async (req, res) => {
//     const { gmail } = req.body
//     try {
//         const user = await User.findOne({ gmail })
//         const { otp, otpExpires } = generateOTP()

//         const time = Date.now()

//         if (!user) {
//             res.status(400).json({ message: "User not found please register first to continue" })
//             return
//         }
//         if (user.isVerified) return res.status(400).json({ message: "OTP is already verified" })
//         if (time - user.lastOtpSentAt < 2 * 60 *1000 ) return res.status(400).json({ message: "Wait for 2mins before resending OTP" })
        
            
//         user.otp = otp
//         user.otpExpires = otpExpires
//         user.lastOtpSentAt = time
//         await user.save()
    
//     await sendMail({
//         mailFrom: `AlieXpressApp ${process.env.EMAIL_USER}`,
//         mailTo: gmail,
//         subject: 'Updated OTP',
//         body:`
//             <p>Here is your OTP ${otp}, proceed to verify</p>
//           `
//     })
//         res.status(200).json({ message: "OTP is resent successfully" })
//     } catch (error) {
//         console.log(error)
//     }
// };