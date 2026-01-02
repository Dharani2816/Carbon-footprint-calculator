const { db } = require('../config/firebase');

const convertDoc = (doc) => {
  if (!doc.exists) return null;
  const data = doc.data();
  // Convert Firestore Timestamps to JS Dates
  Object.keys(data).forEach(key => {
    if (data[key] && typeof data[key].toDate === 'function') {
      data[key] = data[key].toDate();
    }
  });
  return { id: doc.id, ...data };
};

const User = {
  findOne: async ({ where }) => {
    const { email, id } = where;
    let query = db.collection('users');
    
    if (email) {
      query = query.where('email', '==', email);
    } else if (id) {
      const doc = await db.collection('users').doc(id).get();
      return convertDoc(doc);
    }

    const snapshot = await query.get();
    if (snapshot.empty) return null;
    
    return convertDoc(snapshot.docs[0]);
  },

  create: async (data) => {
    const docRef = await db.collection('users').add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const doc = await docRef.get();
    return convertDoc(doc);
  }
};

const CarbonFootprint = {
  create: async (data) => {
    console.log('📝 [Model] Saving footprint for user:', data.user_id);
    const docRef = await db.collection('carbon_footprints').add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const doc = await docRef.get();
    return convertDoc(doc);
  },

  findAll: async ({ where, order }) => {
    const { user_id } = where;
    let query = db.collection('carbon_footprints').where('user_id', '==', user_id);
    
    // FETCH ALL then SORT IN MEMORY (Avoids Firestore Index Issues)
    const snapshot = await query.get();
    const docs = snapshot.docs.map(doc => convertDoc(doc));
    console.log(`📊 [Model] Found ${docs.length} records for user: ${user_id}`);

    if (order && order[0][0] === 'createdAt' && order[0][1] === 'DESC') {
      docs.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA; // Descending
      });
    }

    return docs;
  },

  findOne: async ({ where, order }) => {
    const { user_id } = where;
    let query = db.collection('carbon_footprints').where('user_id', '==', user_id);
    
    // FETCH ALL then SORT IN MEMORY
    const snapshot = await query.get();
    const docs = snapshot.docs.map(doc => convertDoc(doc));
    
    if (order && order[0][0] === 'createdAt' && order[0][1] === 'DESC') {
      docs.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA; // Descending
      });
    }

    return docs.length > 0 ? docs[0] : null;
  }
};

const syncDatabase = async () => {
    console.log('🔥 Firebase Database Ready');
    return Promise.resolve();
};

module.exports = { User, CarbonFootprint, syncDatabase };
