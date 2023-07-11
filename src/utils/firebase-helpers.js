import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  addDoc,
  collection,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore/lite";

// Get all docuemnt ids from the user collection
const checkUsername = async (username) => {
  const querySnapshot = await getDocs(collection(db, "usernames"));
  const usernamesDB = querySnapshot.docs.map((doc) => doc.id.toLowerCase());
  return usernamesDB.includes(username.toLowerCase());
};

// Get users details from /usernames collection and return data and doc.id
const getUserDetails = async (username) => {
  const docRef = doc(db, "usernames", username.toLowerCase());
  const docSnap = await getDoc(docRef);
  return { username: docSnap.id, ...docSnap.data() };
};

// Get user details from the auth'ed user and the requested user
const getAuthAndReqUser = async (authUser, reqUser) => {
  // Auth user
  const authUserDoc = doc(db, "usernames", authUser.toLowerCase());
  const authUserSnap = await getDoc(authUserDoc);
  // Requested user
  const reqUserDoc = doc(db, "usernames", reqUser.toLowerCase());
  const reqUserSnap = await getDoc(reqUserDoc);

  if (!reqUserSnap.exists() || !authUserSnap.exists()) {
    throw { code: "auth/user-not-found" };
  }
  return {
    authUser: { username: authUserSnap.id, ...authUserSnap.data() },
    reqUser: { username: reqUserSnap.id, ...reqUserSnap.data() },
  };
};

// Create a new user with email and password and save it to the database under users collection
const createUser = async (username, email, password) => {
  const allUsernames = await checkUsername(username);
  if (allUsernames) {
    throw { code: "auth/username-already-in-use" };
  }

  try {
    // Adding user to firebase auth
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Adding username and avatar to firebase auth
    await updateProfile(user, {
      displayName: username.toLowerCase(),
      photoURL: `https://api.dicebear.com/5.x/bottts-neutral/svg?seed=${username}&backgroundColor=7d7d7d,d74d4d,7e22ce,60a5fa,22d3ee`,
    });

    // Add username to usernames collection (public)
    await setDoc(doc(db, "usernames", username.toLowerCase()), {
      uid: user.uid,
      photoURL: user.photoURL,
    });

    // Add user to users collection (private)
    await setDoc(doc(db, "users", username.toLowerCase()), {
      username: username.toLowerCase(),
      email: user.email,
      uid: user.uid,
      createdAt: new Date(),
      photoURL: user.photoURL,
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Login a user with email and password
const loginUser = async (email, password) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error) {
    throw error;
  }
};

// Logout a user
const logoutUser = async () => {
  try {
    await signOut(auth);
    window.location.reload();
  } catch (error) {
    throw error;
  }
};

// Create associated clips collection for clip uploads
const addClip = async (data) => {
  const docRef = await addDoc(collection(db, "clips"), {
    username: data.username.toLowerCase(),
    uid: data.uid,
    title: data.title,
    game: data.game,
    date: new Date(),
    url: data.url,
    size: data.size,
    avatar: data.avatar,
  });
  return docRef;
};

// Convert firebase timestamp to readable date
const convertDate = (date) => {
  const newDate = new Date(date.seconds * 1000);
  return newDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Get a specific clip by id
const getClip = async (id) => {
  const docRef = doc(db, "clips", id);
  const docSnap = await getDoc(docRef);
  const likes = await getLikes(id);
  const comments = await getComments(id);
  return { id: docSnap.id, ...docSnap.data(), likes, comments };
};

// Get clips by user id
const getClipsByUsername = async (username) => {
  const q = query(
    collection(db, "clips"),
    where("username", "==", username.toLowerCase()),
    orderBy("date", "desc")
  );
  const querySnapshot = await getDocs(q);
  // Get the likes subcollection for each clip
  const clips = await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      const likes = await getLikes(doc.id);
      return {
        video: {
          id: doc.id,
          ...doc.data(),
        },
        likesArray: likes,
      };
    })
  );
  return clips;
};

// Get all clips where the username is in the following array
const getFollowingClips = async (following) => {
  const q = query(
    collection(db, "clips"),
    where("username", "in", following),
    orderBy("date", "desc")
  );
  const querySnapshot = await getDocs(q);
  // Get the likes subcollection for each clip
  const clips = await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      const likes = await getLikes(doc.id);
      return {
        video: {
          id: doc.id,
          ...doc.data(),
        },
        likesArray: likes,
      };
    })
  );
  return clips;
};

// Get the likes collection for a specific clip
const getLikes = async (id) => {
  const q = query(collection(db, "clips", id, "likes"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.id);
};

// Get the comments collection for a specific clip
const getComments = async (id) => {
  const q = query(
    collection(db, "clips", id, "comments"),
    orderBy("date", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data());
};

// Get the X most recent clips and their likes subcollection
const getRecentClips = async (max) => {
  const q = query(collection(db, "clips"), orderBy("date", "desc"), limit(max));
  const querySnapshot = await getDocs(q);
  // Get the likes subcollection for each clip
  const clips = await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      const likes = await getLikes(doc.id);
      return {
        video: {
          id: doc.id,
          ...doc.data(),
        },
        likesArray: likes,
      };
    })
  );
  return clips;
};

// Get the X most top clips based on likes and their likes subcollection
const getTopClips = async (max) => {
  const q = query(
    collection(db, "clips"),
    orderBy("likes", "desc"),
    limit(max)
  );
  const querySnapshot = await getDocs(q);
  // Get the likes subcollection for each clip
  const clips = await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      const likes = await getLikes(doc.id);
      return {
        video: {
          id: doc.id,
          ...doc.data(),
        },
        likesArray: likes,
      };
    })
  );
  return clips;
};

// Follow another user
const followUser = async (currentUser, followUser) => {
  const docRef = doc(db, "usernames", currentUser.toLowerCase());
  await updateDoc(docRef, {
    following: arrayUnion(followUser.toLowerCase()),
  });
};

// Unfollow another user
const unfollowUser = async (currentUser, unfollowUser) => {
  const docRef = doc(db, "usernames", currentUser.toLowerCase());
  await updateDoc(docRef, {
    following: arrayRemove(unfollowUser.toLowerCase()),
  });
};

// Get users auth token
const getToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
};

// Get all usernames and clips
const getAllUsersAndClips = async () => {
  const userQuery = query(collection(db, "usernames"));
  const clipQuery = query(collection(db, "clips"));
  const userQuerySnapshot = await getDocs(userQuery);
  const clipQuerySnapshot = await getDocs(clipQuery);
  return { userQuerySnapshot, clipQuerySnapshot };
};

// Get total usernames count
const getUsersCount = async () => {
  const q = query(collection(db, "usernames"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
};

// Get total clips count
const getClipsCount = async () => {
  const q = query(collection(db, "clips"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
};

const errorCodes = (code) => {
  switch (code) {
    case "auth/email-already-in-use":
      return "Email already in use";
    case "auth/invalid-email":
      return "Invalid email";
    case "auth/weak-password":
      return "Password is too weak";
    case "auth/user-not-found":
      return "User not found";
    case "storage/unauthorized":
      return "Issue uploading file. Please try again later.";
    case "auth/username-already-in-use":
      return "Username already in use";
    default:
      return "Something went wrong";
  }
};

export {
  createUser,
  loginUser,
  logoutUser,
  errorCodes,
  addClip,
  convertDate,
  getClip,
  getClipsByUsername,
  getUserDetails,
  getRecentClips,
  getTopClips,
  followUser,
  unfollowUser,
  getAuthAndReqUser,
  getFollowingClips,
  getToken,
  getAllUsersAndClips,
  getUsersCount,
  getClipsCount,
};
