//2:54
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const FBAuth = require("./util/fb.auth");
const { db } = require("./util/admin");
const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
  getAllComments,
  likeScream,
  unlikeScream,
  deleteScream,
} = require("./handlers/screams");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead,
} = require("./handlers/users");

const app = express();
app.use(cors());
//Scream routes
app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, postOneScream);
app.get("/comments", getAllComments);
app.post("/scream/:screamId/comment", FBAuth, commentOnScream);
app.get("/scream/:screamId", getScream); //get the scream with the comments
app.get("/scream/:screamId/like", FBAuth, likeScream);
app.get("/scream/:screamId/unlike", FBAuth, unlikeScream);
app.delete("/scream/:screamId", FBAuth, deleteScream);
//app.delete("/scream/:screamId", FBAuth, deleteComment);

//user routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/user/:handle", getUserDetails);
app.post("/notifications", FBAuth, markNotificationsRead);

//prefix api
exports.api = functions.region("europe-west1").https.onRequest(app);

//Notifications
//database trigger
exports.createNotificationOnLike = functions
  .region("europe-west1")
  .firestore.document("likes/{id}")
  .onCreate((snapshot) => {
    return (
      db
        .doc(`/screams/${snapshot.data().screamId}`) //get the scream
        .get()
        .then((doc) => {
          if (
            doc.exists &&
            doc.data().userHandel !== snapshot.data().userHandel //not like our own screams
          ) {
            return db.doc(`/notifications/${snapshot.id}`).set({
              //return notification
              createdAt: new Date().toISOString(),
              recipient: doc.data().userHandle, //where
              sender: snapshot.data().userHandle, //who
              type: `like`, //what
              read: false, //status
              screamId: doc.id,
            });
          }
        })
        /*.then(() => {
        return;
      })*/
        .catch((err) => {
          console.error(err);
          return;
        })
    );
  });

exports.deleteNotificationOnUnLike = functions
  .region("europe-west1")
  .firestore.document("likes/{id}")
  .onDelete((snapshot) => {
    return (
      db
        .doc(`/notifications/${snapshot.id}`)
        .delete()
        /*.then(() => {
        return;
      })*/
        .catch((err) => {
          console.error(err);
          return;
        })
    );
  });

//Notifications
//databse trigger
exports.createNotificationOnCommnet = functions
  .region("europe-west1")
  .firestore.document("comments/{id}")
  .onCreate((snapshot) => {
    //listen to
    return (
      db
        .doc(`/screams/${snapshot.data().screamId}`) //get the scream
        .get()
        .then((doc) => {
          if (doc.exists) {
            //snapshot.id = comment.id
            return db.doc(`/notifications/${snapshot.id}`).set({
              //return notification
              createdAt: new Date().toISOString(),
              recipient: doc.data().userHandle, //where
              sender: snapshot.data().userHandle, //who
              type: `comment`, //what
              read: false, //status
              screamId: doc.id,
            });
          }
        })
        /*.then(() => {
        return;
      })*/
        .catch((err) => {
          console.error(err);
          return;
        })
    );
  });

//if the user change the profile image --> change the image on the notifications
exports.onUserImageChange = functions
  .region("europe-west1")
  .firestore.document("/users/${userId}")
  .onUpdate(async (change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      const batch = db.batch();
      try {
        const data = await db
          .collection("screams")
          .where("userHandle", "==", change.before.data().handle)
          .get();
        data.forEach((doc) => {
          const scream = db.doc(`/screams/${doc.id}`);
          batch.update(scream, { userImage: change.after.data().imageUrl });
        });
        return batch.commit();
      } catch (err) {
        return console.error(err);
      }
    } else {
      return true;
    }
  });
//if the user delete the screams --> delete all the notifications of the scream

exports.onScreamDelete = functions
  .region("europe-west1")
  .firestore.document("/screams/${screamId}")
  .onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = db.batch();

    return db
      .collection(`comments`)
      .where("screamId", "==", screamId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db.collection(`likes`).where("screamId", "==", screamId).get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection(`notifications`)
          .where("screamId", "==", screamId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => {
        console.error(err);
      });
  });
