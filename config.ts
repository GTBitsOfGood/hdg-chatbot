export default {
    db: {
      name: process.env.DB_NAME, //need to change
      url: process.env.DB_URL, //need to change
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
      }
    }
};