let db = {
  screams: [
    {
      userHandle: "user",
      body: "scream body",
      createdAt: "2019-07-10T17:54:39.456Z",
      likeCount: 5,
      commentCount: 2
    }
  ],
  comments: [
    {
      userHandle: "",
      screamId: "",
      body: "",
      createdAt: ""
    }
  ],
  notifcations: [
    {
      recipient: "user",
      sender: "john",
      read: "true | false",
      screamId: " screamid",
      type: "like | comment",
      createdAt: "2019-07-10T17:54:39.456Z"
    }
  ]
};

//schema redux
const userDetails = {
  credential: {
    userId: "",
    emil: "",
    handle: "",
    createdAt: "",
    imageUrl: "",
    bio: "",
    website: "",
    location: ""
  },
  likes: [
    {
      userHandle: "user",
      screamId: ""
    },
    {
      userHandle: "user",
      screamId: ""
    }
  ]
};
