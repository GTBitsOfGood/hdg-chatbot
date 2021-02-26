module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    await db.collection('userstates').updateMany({}, {$set: {completedModules: []}});
    await db.collection('userstates').updateMany({}, {$set: {completedTimes: [null, null, null, null, null]}});
    await db.collection('userstates').updateMany({}, {$set: {split: false}});
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    await db.collection('userstates').updateMany({}, {$unset: {completedModules: []}});
    await db.collection('userstates').updateMany({}, {$unset: {completedTimes: [null, null, null, null, null]}});
    await db.collection('userstates').updateMany({}, {$unset: {split: false}});
  }
};
