import { Router } from "express";
import {
  getMe, updateMe, becomeSeller, listAddresses, addAddress, updateAddress,
  deleteAddress, listUsers, setRole, deleteUser,
} from "../Controllers/usersApis/barrel.js";
import { authMiddleware, adminMiddleware } from "../Middlewares/authMiddleware.js";

const userRouter = Router();
userRouter.use(authMiddleware);

// Current user (static routes before :id)
userRouter.get("/me", getMe);
userRouter.patch("/me", updateMe);
userRouter.post("/become-seller", becomeSeller);
userRouter.get("/me/addresses", listAddresses);
userRouter.post("/me/addresses", addAddress);
userRouter.put("/me/addresses/:addressId", updateAddress);
userRouter.delete("/me/addresses/:addressId", deleteAddress);

// Admin
userRouter.get("/", adminMiddleware, listUsers);
userRouter.patch("/:id/role", adminMiddleware, setRole);
userRouter.delete("/:id", adminMiddleware, deleteUser);

export default userRouter;


// import { Router } from "express";

// import {
//   createUser,
//   getAllUsers,
//   getAUser,
//   editUser,
//   deleteUser,
//   getByqueryParams,
//   editProfile,
// } from "../Controllers/usersApis/barrel.js";

// import {
//   authMiddleware,
//   adminMiddleware, // Changed from ultimateAdminMiddleware
// } from "../Middlewares/authMiddleware.js";

// import {
//   viewLogs,
// } from "../Controllers/logsApis/logsController.js";


// const usersRouter = Router();


// // ======================
// // PUBLIC
// // ======================
// usersRouter.post(
//   "/user/create",
//   createUser
// );


// // ======================
// // USERS
// // ======================
// usersRouter.get(
//   "/users",
//   authMiddleware,
//   getAllUsers
// );

// usersRouter.get(
//   "/user/:id",
//   authMiddleware,
//   getAUser
// );

// usersRouter.get(
//   "/userByquery",
//   authMiddleware,
//   getByqueryParams
// );


// // ======================
// // PROFILE
// // ======================
// usersRouter.put(
//   "/profile/update/:id",
//   authMiddleware,
//   editProfile
// );

// usersRouter.put(
//   "/user/update/:id",
//   authMiddleware,
//   editUser
// );


// // ======================
// // ADMIN ONLY
// // ======================
// usersRouter.delete(
//   "/user/delete/:id",
//   authMiddleware,
//   adminMiddleware,
//   deleteUser
// );


// // ======================
// // SYSTEM LOGS (ADMIN ONLY)
// // ======================
// usersRouter.get(
//   "/system/logs",
//   authMiddleware,
//   adminMiddleware, // Updated to use adminMiddleware
//   viewLogs
// );


// export default usersRouter;