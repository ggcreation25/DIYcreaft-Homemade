/**
 * ===================================================================
 * GG CREATION — CLOUD FIRESTORE SYNC & DATA SEEDER ENGINE
 * Handles:
 *  - "Feed Previous Data": Batch seeding of all 7 DIY projects, 
 *    channel profile info, material invoices, and catalog products to Firestore
 *  - "Get Data": Fetching live projects and profile info from Firestore
 *  - "Update Firestore": Real-time saving of edited profiles, new DIY projects
 * ===================================================================
 */

(function (window) {
  'use strict';

  // ── PREVIOUS OFFICIAL CHANNEL DATA TO FEED ──
  const PREVIOUS_CHANNEL_DATA = {
    name: 'GG Creation',
    handle: '@GGCreative-x9o',
    subs: '34.9k subscribers',
    subscribersCount: 34900,
    videoCount: '18+ Videos',
    bio: 'I am making some product for homemade and make a new product and implementation the product.',
    url: 'https://youtube.com/@ggcreative-x9o?si=3LtZbnrBawQbGshe',
    location: 'Tamil Nadu, India',
    creatorSince: '2022',
    avatar: 'assets/images/avatar.jpg',
    verified: true,
    category: 'Homemade & DIY Innovation',
    contactEmail: 'gjgokul2005@gmail.com',
    whatsapp: '+91 9043081667',
    instagram: 'gj_farming23'
  };

  // ── PREVIOUS PRODUCTS TO FEED (11 Official Tools / Supplies) ──
  const PREVIOUS_PRODUCTS = [
    {
      id: 1,
      title: 'iBELL Tool Kit with Impact Drill TD13-100 (650W, 13mm Chuck)',
      category: 'drills',
      categoryLabel: 'Power Drills',
      price: '₹ 1,749',
      priceNumeric: 1749,
      sub: '650W • 13mm Chuck with Full Accessories Box',
      image: 'assets/images/tool_ibell_impact_drill.jpg',
      store: 'Amazon',
      link: 'https://amzn.in/d/030BfvC0',
      projects: [1, 4]
    },
    {
      id: 2,
      title: 'Sauran AG-801 Angle Grinder 100mm (850W)',
      category: 'grinders',
      categoryLabel: 'Angle Grinders',
      price: '₹ 1,499',
      priceNumeric: 1499,
      sub: '850W • 100mm 4-Inch Disc with Safety Guard',
      image: 'assets/images/tool_sauran_angle_grinder.jpg',
      store: 'Amazon',
      link: 'https://amzn.in/d/078jM6eX',
      projects: [1, 2]
    },
    {
      id: 3,
      title: 'Qualigen 2000 W Heavy Duty Heat Gun with Dual Temperature Mode',
      category: 'heat-guns',
      categoryLabel: 'Heat Guns',
      price: '₹ 899',
      priceNumeric: 899,
      sub: '2000 Watts • Dual Heat 350°C / 550°C Modes',
      image: 'assets/images/tool_qualigen_heat_gun.jpg',
      store: 'Amazon',
      link: 'https://amzn.in/d/0eE0t1V1',
      projects: [2, 5]
    },
    {
      id: 4,
      title: 'TechTrove 20W Mini Hot Melt Glue Gun with 15 Clear Glue Sticks',
      category: 'hot-glue',
      categoryLabel: 'Glue Guns',
      price: '₹ 299',
      priceNumeric: 299,
      sub: '20W PTC Ceramic Heating • Rapid Melt in 3 Mins',
      image: 'assets/images/tool_techtrove_glue_gun.jpg',
      store: 'Amazon',
      link: 'https://amzn.in/d/0fDk2j51',
      projects: [2, 4]
    },
    {
      id: 5,
      title: 'SEE INSIDE Digital Vernier Caliper 150mm / 6 Inch LCD Display',
      category: 'precision',
      categoryLabel: 'Precision Tools',
      price: '₹ 389',
      priceNumeric: 389,
      sub: '0.1mm Resolution • Zero Setting at any position',
      image: 'assets/images/tool_vernier_caliper.jpg',
      store: 'Amazon',
      link: 'https://amzn.in/d/0h4Y8lq3',
      projects: [2, 3, 5]
    },
    {
      id: 6,
      title: 'IZOM 20V Battery Operated Cordless Drill Kit (10mm Chuck)',
      category: 'drills',
      categoryLabel: 'Power Drills',
      price: '₹ 2,199',
      priceNumeric: 2199,
      sub: '20V Max Lithium-Ion Battery • Reversible & Variable Speed',
      image: 'assets/images/tool_izom_cordless_drill.jpg',
      store: 'Amazon',
      link: 'https://amzn.in/d/013l7g7x',
      projects: [3, 4]
    },
    {
      id: 7,
      title: 'OMXE OPAL-801 950W Heavy Duty 4-Inch Angle Grinder',
      category: 'grinders',
      categoryLabel: 'Angle Grinders',
      price: '₹ 1,649',
      priceNumeric: 1649,
      sub: '950W High Copper Armature • 11000 RPM Max Speed',
      image: 'assets/images/tool_omxe_angle_grinder.jpg',
      store: 'Amazon',
      link: 'https://amzn.in/d/06B08wX8',
      projects: [3, 5]
    },
    {
      id: 8,
      title: 'NITYA HSS Titanium Coated Drill Bit Set (13 Pcs, 1.5mm–6.5mm)',
      category: 'precision',
      categoryLabel: 'Precision Tools',
      price: '₹ 329',
      priceNumeric: 329,
      sub: 'Titanium Nitride Coating • 13 Sizes in Storage Case',
      image: 'assets/images/tool_hss_drill_bits.jpg',
      store: 'Amazon',
      link: 'https://amzn.in/d/06n9iB3L',
      projects: [1, 3, 6]
    },
    {
      id: 9,
      title: 'INGCO SI0268 60W Simple Soldering Iron with Chisel Tip',
      category: 'precision',
      categoryLabel: 'Electronics & Soldering',
      price: '₹ 449',
      priceNumeric: 449,
      sub: '60 Watts Rapid Heating • Heat-Resistant Grip',
      image: 'assets/images/tool_ingco_soldering_iron.jpg',
      store: 'Flipkart',
      link: 'https://dl.flipkart.com/s/eZ9bKxNNNN',
      projects: [1, 4, 6]
    },
    {
      id: 10,
      title: 'Kiesh Holesaw Cutter Set 11pcs Woodworking Hole Saw Drill Kit',
      category: 'precision',
      categoryLabel: 'Precision Tools',
      price: '₹ 599',
      priceNumeric: 599,
      sub: '11 PCS • 3/4" to 2 1/2" with Mandrels & Hex Key',
      image: 'assets/images/tool_holesaw_cutter_set.jpg',
      store: 'Flipkart',
      link: 'https://dl.flipkart.com/s/5_1k1JuuuN',
      projects: [4, 5, 6]
    },
    {
      id: 11,
      title: 'Husaini Mart Silicone Mould Skytail 2 Pack Rectangle Mold',
      category: 'moulds',
      categoryLabel: 'Silicone Moulds',
      price: '₹ 349',
      priceNumeric: 349,
      sub: 'Food & Resin Grade Silicone • 2 Flexible Trays',
      image: 'assets/images/tool_silicone_mould_tray.jpg',
      store: 'Flipkart',
      link: 'https://dl.flipkart.com/s/eZYB6xNNNN',
      projects: [5, 6]
    }
  ];

  /**
   * Helper to check if Firestore is accessible
   */
  function isFirestoreReady() {
    return typeof firebase !== 'undefined' && window.db && typeof window.db.collection === 'function';
  }

  /**
   * 1. FEED PREVIOUS DATA TO FIRESTORE
   * Feeds:
   *   a. 7 authentic DIY projects with all bills, steps, and components
   *   b. Channel profile in settings/channel_profile
   *   c. 11 catalog products
   *   d. Default creator profile
   */
  async function feedPreviousDataToFirestore(options = {}) {
    if (!isFirestoreReady()) {
      const msg = 'Firestore is not initialized. Please ensure internet access and valid Firebase credentials.';
      console.warn(msg);
      if (typeof showToast === 'function') showToast(msg, 'error');
      return { success: false, reason: 'firestore_not_ready' };
    }

    const { onProgress, silent = false } = options;
    console.log('🚀 Starting Cloud Firestore Data Feeding Process...');

    try {
      // 1. Prepare Projects Source (from js/projects.js if loaded, or defaults)
      const projectsToFeed = (typeof DEFAULT_PROJECTS !== 'undefined' && Array.isArray(DEFAULT_PROJECTS))
        ? DEFAULT_PROJECTS
        : [];

      let fedProjectsCount = 0;
      let fedProductsCount = 0;

      // ── Feed Projects Collection ──
      for (const proj of projectsToFeed) {
        const docRef = window.db.collection('projects').doc(proj.id);
        const dataToSave = {
          ...proj,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await docRef.set(dataToSave, { merge: true });
        fedProjectsCount++;
        if (onProgress) onProgress({ type: 'project', current: fedProjectsCount, total: projectsToFeed.length });
      }

      // ── Feed Channel Profile in settings/channel_profile ──
      const channelRef = window.db.collection('settings').doc('channel_profile');
      await channelRef.set({
        ...PREVIOUS_CHANNEL_DATA,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // ── Feed Catalog Products ──
      for (const prod of PREVIOUS_PRODUCTS) {
        const prodRef = window.db.collection('products').doc('product-' + prod.id);
        await prodRef.set({
          ...prod,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        fedProductsCount++;
      }

      // ── Feed Creator Admin User Profile doc ──
      const creatorRef = window.db.collection('users').doc('creator-official-gg');
      await creatorRef.set({
        uid: 'creator-official-gg',
        name: 'Gokul (GG Creation)',
        email: 'gjgokul2005@gmail.com',
        avatar: 'assets/images/avatar.jpg',
        role: 'Verified Creator & Maker',
        handle: '@GGCreative-x9o',
        bio: 'Maker of homemade DIY inventions, toy tractor mechanics, and transparent project bills.',
        phone: '+91 9043081667',
        isCreatorAdmin: true,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Mark locally that Firestore has been fed
      localStorage.setItem('gg_firestore_fed_v1', 'true');
      console.log(`✅ Success! Fed ${fedProjectsCount} projects, 1 channel profile, and ${fedProductsCount} products into Firestore.`);

      if (!silent && typeof showToast === 'function') {
        showToast(`Cloud Firestore fed successfully! (${fedProjectsCount} DIY projects + Channel profile)`, 'success');
      }

      // Trigger custom event so active pages refresh data
      window.dispatchEvent(new CustomEvent('gg_firestore_data_updated', {
        detail: { projectsCount: fedProjectsCount, productsCount: fedProductsCount }
      }));

      return {
        success: true,
        projectsCount: fedProjectsCount,
        productsCount: fedProductsCount
      };

    } catch (err) {
      console.error('❌ Error feeding data to Firestore:', err);
      if (!silent && typeof showToast === 'function') {
        if (err.code === 'permission-denied') {
          showToast('Firestore Permission Error! Please update Firestore Rules in Firebase Console.', 'error');
        } else {
          showToast('Failed to feed Firestore: ' + err.message, 'error');
        }
      }
      return { success: false, error: err };
    }
  }

  /**
   * 2. GET PROJECTS DATA FROM FIRESTORE
   * Reads the `projects` collection from Firestore.
   * If Firestore has data, returns it sorted by projectNumber.
   * Otherwise falls back to localStorage or DEFAULT_PROJECTS.
   */
  async function getProjectsFromFirestore() {
    if (!isFirestoreReady()) {
      return (typeof getStoredProjects === 'function') ? getStoredProjects() : [];
    }

    try {
      const snap = await window.db.collection('projects').get();
      if (!snap.empty) {
        const projects = [];
        snap.forEach(doc => {
          projects.push(doc.data());
        });
        // Sort in logical project order
        projects.sort((a, b) => (a.projectNumber || 99) - (b.projectNumber || 99));

        // Save fresh copy to local cache
        localStorage.setItem('gg_projects_list_v5', JSON.stringify(projects));
        return projects;
      } else {
        console.log('Firestore projects collection is empty. Auto-feeding previous data...');
        await feedPreviousDataToFirestore({ silent: true });
        return (typeof DEFAULT_PROJECTS !== 'undefined') ? DEFAULT_PROJECTS : [];
      }
    } catch (err) {
      console.warn('Notice reading projects from Firestore (using local cache):', err.message);
      return (typeof getStoredProjects === 'function') ? getStoredProjects() : [];
    }
  }

  /**
   * 3. UPDATE OR ADD PROJECT IN FIRESTORE
   * Saves a project document directly into Firestore.
   */
  async function updateProjectInFirestore(project) {
    if (!project || !project.id) return false;

    // Update local cache first
    if (typeof currentProjects !== 'undefined' && Array.isArray(currentProjects)) {
      const idx = currentProjects.findIndex(p => p.id === project.id);
      if (idx >= 0) {
        currentProjects[idx] = project;
      } else {
        currentProjects.unshift(project);
      }
      if (typeof saveProjects === 'function') saveProjects(currentProjects);
    }

    if (!isFirestoreReady()) return true;

    try {
      const docRef = window.db.collection('projects').doc(project.id);
      await docRef.set({
        ...project,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log(`Saved project ${project.id} to Firestore.`);
      return true;
    } catch (err) {
      console.error('Failed to update project in Firestore:', err);
      return false;
    }
  }

  /**
   * 4. GET CHANNEL PROFILE FROM FIRESTORE
   */
  async function getChannelProfileFromFirestore() {
    if (!isFirestoreReady()) {
      return JSON.parse(localStorage.getItem('gg_channel_data') || 'null') || PREVIOUS_CHANNEL_DATA;
    }

    try {
      const docSnap = await window.db.collection('settings').doc('channel_profile').get();
      if (docSnap.exists) {
        const data = docSnap.data();
        localStorage.setItem('gg_channel_data', JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn('Could not read channel profile from Firestore:', err.message);
    }
    return JSON.parse(localStorage.getItem('gg_channel_data') || 'null') || PREVIOUS_CHANNEL_DATA;
  }

  /**
   * 5. UPDATE CHANNEL PROFILE IN FIRESTORE
   * Saves updated channel information to Firestore
   */
  async function updateChannelProfileInFirestore(data) {
    if (!data) return false;

    // Save to localStorage
    localStorage.setItem('gg_channel_data', JSON.stringify(data));

    if (!isFirestoreReady()) return true;

    try {
      await window.db.collection('settings').doc('channel_profile').set({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // If user is logged in, also update their user document
      const user = (typeof getAuthUser === 'function') ? getAuthUser() : JSON.parse(localStorage.getItem('gg_user') || 'null');
      if (user && user.uid) {
        await window.db.collection('users').doc(user.uid).set({
          channelName: data.name,
          channelHandle: data.handle,
          channelSubs: data.subs,
          channelBio: data.bio,
          channelUrl: data.url,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch(() => {});
      }

      console.log('Channel profile updated in Cloud Firestore.');
      return true;
    } catch (err) {
      console.error('Failed to update channel profile in Firestore:', err);
      return false;
    }
  }

  /**
   * 6. GET / UPDATE USER PROFILE IN FIRESTORE
   */
  async function getUserProfileFromFirestore(uid) {
    if (!uid || !isFirestoreReady()) return null;
    try {
      const snap = await window.db.collection('users').doc(uid).get();
      return snap.exists ? snap.data() : null;
    } catch (err) {
      console.warn('Notice reading user profile from Firestore:', err.message);
      return null;
    }
  }

  async function updateUserProfileInFirestore(uid, userData) {
    if (!uid || !userData || !isFirestoreReady()) return false;
    try {
      await window.db.collection('users').doc(uid).set({
        ...userData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.error('Failed to update user profile in Firestore:', err);
      return false;
    }
  }

  /**
   * 7. AUTO-SEED CHECK ON STARTUP
   * Checks if Firestore is active and feeds previous data automatically if needed
   */
  async function checkAndAutoSeed() {
    if (!isFirestoreReady()) return;
    try {
      const snap = await window.db.collection('projects').limit(1).get();
      if (snap.empty) {
        console.log('Cloud Firestore is fresh and empty. Auto-feeding previous data now...');
        await feedPreviousDataToFirestore({ silent: true });
      }
    } catch (err) {
      console.log('Firestore auto-seed check notice (check security rules if permission denied):', err.message);
    }
  }

  // Auto initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    // Wait brief tick for Firebase initialization
    setTimeout(checkAndAutoSeed, 800);
  });

  // Export to global scope
  window.GGFirestore = {
    isReady: isFirestoreReady,
    feedPreviousData: feedPreviousDataToFirestore,
    getProjects: getProjectsFromFirestore,
    updateProject: updateProjectInFirestore,
    getChannelProfile: getChannelProfileFromFirestore,
    updateChannelProfile: updateChannelProfileInFirestore,
    getUserProfile: getUserProfileFromFirestore,
    updateUserProfile: updateUserProfileInFirestore,
    PREVIOUS_CHANNEL_DATA,
    PREVIOUS_PRODUCTS
  };

  // Global helper shorthand for easy button onclicks
  window.feedPreviousDataToFirestore = feedPreviousDataToFirestore;

})(window);
