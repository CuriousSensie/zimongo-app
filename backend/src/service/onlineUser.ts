import User from "../models/User";

const toggleUserOnline = async (userId: any, online: any) => {
  try {
    if (!userId) {
      return;
    }
    return await User.findOneAndUpdate({ _id: userId }, { online });
  } catch (error) {
    return console.error(error);
  }
};
export default toggleUserOnline;