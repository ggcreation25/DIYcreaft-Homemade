/**
 * ===================================================================
 * DIRECT FIRESTORE DATA PUSHER FOR GG CREATION
 * Pushes all authentic projects, channel profile, products, and creator
 * data into Cloud Firestore via Firebase REST API.
 * ===================================================================
 */

const API_KEY = "AIzaSyAmF9iuT55OEJRedcLh36FMr4WXGbR2XwY";
const PROJECT_ID = "login-page-f8c8b";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

async function writeDocument(collection, docId, data) {
  const url = `${BASE_URL}/${collection}/${encodeURIComponent(docId)}?key=${API_KEY}`;
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) {
      fields[k] = toFirestoreValue(v);
    }
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to write ${collection}/${docId} (HTTP ${res.status}): ${errText}`);
  }
  return await res.json();
}

// ── 1. CHANNEL PROFILE ──
const CHANNEL_PROFILE = {
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
  instagram: 'gj_farming23',
  updatedAt: new Date().toISOString()
};

// ── 2. CREATOR USER ──
const CREATOR_USER = {
  uid: 'creator-official-gg',
  name: 'Gokul (GG Creation)',
  email: 'gjgokul2005@gmail.com',
  avatar: 'assets/images/avatar.jpg',
  role: 'Verified Creator & Maker',
  handle: '@GGCreative-x9o',
  bio: 'Official maker of homemade DIY inventions, toy tractor mechanics, and transparent project bills.',
  phone: '+91 9043081667',
  isCreatorAdmin: true,
  updatedAt: new Date().toISOString()
};

// ── 3. AUTHENTIC DIY PROJECTS (All 7 Builds) ──
const PROJECTS = [
  {
    id: 'proj-mahindra-415di',
    projectNumber: 1,
    name: '1. Mahindra 415DI XP PLUS',
    shortName: 'Mahindra 415DI XP PLUS',
    category: 'tractor-diy',
    categoryLabel: 'Mini Tractors',
    image: 'assets/images/project_mahindra_415di.jpg',
    spentTime: '22.0 Hours',
    totalPrice: 12252,
    priceFormatted: '₹ 12,252',
    description: 'Scratch-built miniature Mahindra 415DI XP PLUS red tractor featuring realistic die-cut metal hood, 12V high-torque motor drive, mechanical rack steering, working front grille, authentic headlights, and deep-lug rear tires.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeWatchUrl: 'https://youtube.com/@ggcreative-x9o?si=3LtZbnrBawQbGshe',
    requiredTools: [
      'iBELL 650W Impact Drill Kit (TD13-100)',
      'Sauran AG-801 Angle Grinder (100mm)',
      'INGCO 60W Simple Soldering Iron',
      'NITYA HSS Titanium Coated Drill Bit Set'
    ],
    materials: [
      'Cold-Rolled Sheet Metal (1.5mm) & Square Tubular Chassis Frame',
      '12V 775 High-Torque DC Geared Motor with Brass Pinion Hub',
      'Deep-Tread Heavy Duty Rubber Tractor Wheels (4 pcs)',
      'Front Axle Steering Linkage & Metal Tie Rods',
      'Automotive Red Enamel Paint, Headlight LEDs & Vertical Exhaust'
    ],
    steps: [
      'Cut and weld 20x20mm steel box channel chassis frame with rear motor mount.',
      'Fabricate front beam axle with dual kingpins and manual steering tie rod linkage using iBELL drill.',
      'Mount 12V high-torque motor and wire forward/reverse dual-lead power switch using INGCO soldering iron.',
      'Cut hood and side louvers from sheet metal with Sauran angle grinder and shape Mahindra curves.',
      'Degrease, apply anti-rust primer, and spray 3 coats of glossy Mahindra tractor red enamel.'
    ],
    bill: [
      { item: 'Cold-Rolled Sheet Metal & Frame Box Steel', qty: '1 set', unit: 950, total: 950 },
      { item: '12V 775 High-Torque DC Geared Motor', qty: '1 unit', unit: 1100, total: 1100 },
      { item: 'Heavy-Duty Lug Rubber Tractor Wheels', qty: '4 pcs', unit: 162.5, total: 650 },
      { item: 'Steering Tie Rods, Kingpins & Axle Bearings', qty: '1 kit', unit: 380, total: 380 },
      { item: 'Mahindra Red Enamel Paint, LEDs & Exhaust', qty: '1 lot', unit: 370, total: 370 }
    ],
    pdfComponents: [
      { sNo: 1, name: 'Drill Machine', qty: 1, price: 1300, link: 'https://dl.flipkart.com/s/pBx0lIuuuN', store: 'Flipkart' },
      { sNo: 2, name: 'PVC Pipe', qty: 1, price: 700, link: '', store: 'Local Supply' },
      { sNo: 3, name: 'Angle Grinder Metal Gear', qty: 1, price: 170, link: 'https://dl.flipkart.com/s/pVZRZkuuuN', store: 'Flipkart' },
      { sNo: 4, name: 'Rubber Sheet', qty: 1, price: 260, link: 'https://amzn.in/d/0bpoNrn3', store: 'Amazon' },
      { sNo: 5, name: 'MS Galvanized Fully Threaded Rod – 165 mm', qty: 1, price: 163, link: 'https://dl.flipkart.com/s/30ytxXNNNN', store: 'Flipkart' },
      { sNo: 6, name: 'Servo Motor – 13 kg', qty: 1, price: 1584, link: 'https://robu.in/product/feetech-fs-series-servo-motors-6v/', store: 'Robu.in' },
      { sNo: 7, name: 'Battery – 7.4 V, 2 A', qty: 1, price: 1200, link: 'https://amzn.in/d/04ejyy9R', store: 'Amazon' },
      { sNo: 8, name: 'FS-GT2 Remote Transmitter', qty: 1, price: 2500, link: 'https://robu.in/product/flysky-fs-gt2-transmitter-with-fs-gr3e-receiver/', store: 'Robu.in' },
      { sNo: 9, name: 'Battery – 12 V', qty: 1, price: 900, link: 'https://dl.flipkart.com/s/pBx0lIuuuN', store: 'Flipkart' },
      { sNo: 10, name: 'ESC – 30 A', qty: 1, price: 1310, link: 'https://amzn.in/d/0as8pbV5', store: 'Amazon' },
      { sNo: 11, name: '608Z Bearing', qty: 1, price: 165, link: 'https://dl.flipkart.com/s/pBOegVuuuN', store: 'Flipkart' },
      { sNo: 12, name: 'Workshop Fabrication Charge', qty: 1, price: 2000, link: '', store: 'Workshop Labor' }
    ]
  },
  {
    id: 'proj-jd-5050d-2wd',
    projectNumber: 2,
    name: '2. John Deere 5050 D 2wd',
    shortName: 'John Deere 5050 D 2wd',
    category: 'tractor-diy',
    categoryLabel: 'Mini Tractors',
    image: 'assets/images/project_johndeere_5050d.jpg',
    spentTime: '16.5 Hours',
    totalPrice: 13764,
    priceFormatted: '₹ 13,764',
    description: 'Handcrafted John Deere 5050 D 2WD green & yellow scale model tractor with dual exhaust stack, front weight bumper, custom rear reduction gearbox with brass pinions, and high-visibility steering controls.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeWatchUrl: 'https://youtube.com/@ggcreative-x9o?si=3LtZbnrBawQbGshe',
    requiredTools: [
      'Sauran AG-801 Angle Grinder (100mm)',
      'Qualigen 2000 W Heavy Duty Heat Gun',
      'TechTrove 20W Mini Glue Gun with 15 Sticks',
      'SEE INSIDE Digital Vernier Caliper LCD'
    ],
    materials: [
      'Steel Channel Chassis & Pre-drilled Motor Mounts',
      'John Deere Signature Green & Yellow Automotive Spray Paint',
      'Precision CNC Brass Gearbox Reduction Gears (Measured with SEE INSIDE Caliper)',
      'Front Pivot Steering Axle with Adjustable Tie Rods',
      'High-Viscosity Synthetic SV Gear Grease & Sealant'
    ],
    steps: [
      'Design and precision-measure reduction gearbox shafts using SEE INSIDE digital caliper.',
      'Cut chassis members and axle brackets using Sauran 100mm angle grinder.',
      'Heat-shrink all electrical connections and wire harness using Qualigen 2000W heat gun.',
      'Mount dashboard gauges and battery retaining clips using TechTrove hot melt glue gun.',
      'Spray authentic John Deere green body hood and yellow wheel rim enamel coats.'
    ],
    bill: [
      { item: 'John Deere Green & Yellow Enamel Paint', qty: '2 cans', unit: 320, total: 640 },
      { item: 'Precision CNC Machined Brass Pinions & Shafts', qty: '1 set', unit: 850, total: 850 },
      { item: '12V High-Torque Drive Motor & Wiring', qty: '1 unit', unit: 800, total: 800 },
      { item: 'Tractor Lug Wheels & Hub Mounts', qty: '4 pcs', unit: 110, total: 440 },
      { item: 'Steering Linkages, Hardware & Bearings', qty: '1 kit', unit: 220, total: 220 }
    ],
    pdfComponents: [
      { sNo: 1, name: 'Drill Machine Motor', qty: 1, price: 1700, link: 'https://dl.flipkart.com/s/pBx0lIuuuN', store: 'Flipkart' },
      { sNo: 2, name: 'PVC Pipe', qty: 1, price: 800, link: '', store: 'Local Supply' },
      { sNo: 3, name: 'Angle Grinder Metal Gear', qty: 1, price: 170, link: 'https://dl.flipkart.com/s/pVZRZkuuuN', store: 'Flipkart' },
      { sNo: 4, name: 'Spare Part – CMH Gear Hand Tool', qty: 1, price: 160, link: 'https://dl.flipkart.com/s/pVxJ7JuuuN', store: 'Flipkart' },
      { sNo: 5, name: 'Sheet Metal', qty: 1, price: 170, link: 'https://amzn.in/d/0bpoNrn3', store: 'Amazon' },
      { sNo: 6, name: 'Servo Motor', qty: 1, price: 1584, link: 'https://robu.in/product/feetech-fs-series-servo-motors-6v/', store: 'Robu.in' },
      { sNo: 7, name: '12 V Battery', qty: 1, price: 900, link: 'https://dl.flipkart.com/s/pBx0lIuuuN', store: 'Flipkart' },
      { sNo: 8, name: 'FS-TC6B Remote – 6 Channel', qty: 1, price: 3000, link: '', store: 'Local Supply' },
      { sNo: 9, name: '12 V Secondary Battery', qty: 1, price: 900, link: 'https://dl.flipkart.com/s/pBx0lIuuuN', store: 'Flipkart' },
      { sNo: 10, name: '12 V ESC – 320 A', qty: 1, price: 2050, link: 'https://amzn.in/d/0hFn9CAN', store: 'Amazon' },
      { sNo: 11, name: 'Workshop Custom Machining', qty: 1, price: 2000, link: '', store: 'Workshop Labor' },
      { sNo: 12, name: 'MS Galvanized Fully Threaded Rod – 185 mm', qty: 1, price: 165, link: 'https://dl.flipkart.com/s/30ytxXNNNN', store: 'Flipkart' },
      { sNo: 13, name: '608Z Bearing', qty: 1, price: 165, link: 'https://dl.flipkart.com/s/pBOegVuuuN', store: 'Flipkart' }
    ]
  },
  {
    id: 'proj-jd-5310-4wd',
    projectNumber: 3,
    name: '3. John Deere 5310 4wd',
    shortName: 'John Deere 5310 4wd',
    category: 'tractor-diy',
    categoryLabel: 'Mini Tractors',
    image: 'assets/images/project_johndeere_5310_4wd.jpg',
    spentTime: '28.0 Hours',
    totalPrice: 9965,
    priceFormatted: '₹ 9,965',
    description: 'Heavy-duty 4WD all-wheel drive John Deere 5310 miniature tractor with dual differential driven axles, transfer case gearbox, extra-wide deep mud traction tires, roll cage, and extreme pulling torque.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeWatchUrl: 'https://youtube.com/@ggcreative-x9o?si=3LtZbnrBawQbGshe',
    requiredTools: [
      'IZOM 20V Battery Operated Cordless Drill',
      'OMXE OPAL-801 950w Heavy Duty Angle Grinder',
      'SEE INSIDE Vernier Caliper LCD Display',
      'NITYA HSS Titanium Coated Drill Bit Set'
    ],
    materials: [
      'Dual Front and Rear Axle Steel Differential Gear Assemblies',
      'Center Transfer Case Drive Shaft with Universal Couplers',
      'High-Output 12V 795 DC High-Torque Motor',
      'Deep-Tread 4x4 Mud Gripper Heavy Tractor Tires (4 pcs)',
      'Reinforced 2.5mm Heavy Steel Channel Frame & Roll Cage'
    ],
    steps: [
      'Cut 2.5mm structural steel channel rails using OMXE 950W heavy duty angle grinder.',
      'Bore precision alignment holes for 4WD differential mounting bolts using NITYA titanium drill bits & IZOM cordless drill.',
      'Check axle bevel gear backlash tolerances using SEE INSIDE digital caliper.',
      'Fabricate center 4WD transfer case coupling with universal joint linkages.',
      'Mount roll-over protection structure (ROPS), front counterweights, and test 4x4 traction climb.'
    ],
    bill: [
      { item: 'Dual Steel Differential Axle Assemblies (Front & Rear)', qty: '2 units', unit: 950, total: 1900 },
      { item: '12V 795 High-Output DC Drive Motor', qty: '1 unit', unit: 1200, total: 1200 },
      { item: '4x4 Deep Mud Gripper Rubber Tires', qty: '4 pcs', unit: 175, total: 700 },
      { item: '2.5mm Heavy Steel Channel & Roll Bar', qty: '1 lot', unit: 580, total: 580 },
      { item: 'Universal Joints, Bearings & Fasteners', qty: '1 kit', unit: 420, total: 420 }
    ],
    pdfComponents: [
      { sNo: 1, name: 'Drill Machine', qty: 1, price: 1700, link: 'https://dl.flipkart.com/s/pBx0lIuuuN', store: 'Flipkart' },
      { sNo: 2, name: 'PVC Pipe', qty: 1, price: 900, link: '', store: 'Local Supply' },
      { sNo: 3, name: 'Angle Grinder Metal Gear', qty: 1, price: 170, link: 'https://dl.flipkart.com/s/pVZRZkuuuN', store: 'Flipkart' },
      { sNo: 4, name: 'Rubber Sheet – Size 85', qty: 1, price: 160, link: 'https://amzn.in/d/0bpoNrn3', store: 'Amazon' },
      { sNo: 5, name: 'MS Galvanized Fully Threaded Rod – 165 mm', qty: 1, price: 165, link: 'https://dl.flipkart.com/s/30ytxXNNNN', store: 'Flipkart' },
      { sNo: 6, name: 'Servo Motor – 13 kg', qty: 1, price: 1585, link: 'https://robu.in/product/feetech-fs-series-servo-motors-6v/', store: 'Robu.in' },
      { sNo: 7, name: 'Battery – 12 V', qty: 1, price: 900, link: 'https://dl.flipkart.com/s/pBx0lIuuuN', store: 'Flipkart' },
      { sNo: 8, name: 'ESC Speed Controller', qty: 1, price: 2050, link: '', store: 'Local Supply' },
      { sNo: 9, name: 'Workshop 4WD Assembly Charge', qty: 1, price: 2000, link: '', store: 'Workshop Labor' },
      { sNo: 10, name: 'Spare Part – CMH Gear Hand Tool', qty: 1, price: 170, link: 'https://dl.flipkart.com/s/pVxJ7JuuuN', store: 'Flipkart' },
      { sNo: 11, name: '608Z Bearing', qty: 1, price: 165, link: 'https://dl.flipkart.com/s/pBOegVuuuN', store: 'Flipkart' }
    ]
  },
  {
    id: 'proj-truck-1',
    projectNumber: 4,
    name: '4. Truck 1',
    shortName: 'Truck 1 (Cargo Carrier)',
    category: 'trucks',
    categoryLabel: 'Handmade Trucks',
    image: 'assets/images/project_truck_1.jpg',
    spentTime: '19.0 Hours',
    totalPrice: 920,
    priceFormatted: '₹ 920',
    description: 'Handmade heavy cargo carrier truck featuring multi-axle suspension, open wood-slat cargo bed, detailed cabin with acrylic windshield, working rear tailgate latch, and twin rear drive axles.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeWatchUrl: 'https://youtube.com/@ggcreative-x9o?si=3LtZbnrBawQbGshe',
    requiredTools: [
      'iBELL Tool Kit with Impact Drill TD13-100',
      'IZOM 20V Battery Operated Cordless Drill',
      'INGCO SI0268 60 W Simple Soldering Iron',
      'TechTrove 20W Mini Glue Gun with 15 Sticks',
      'Kiesh Holesaw Cutter Set 11pcs'
    ],
    materials: [
      'Hardwood Slats & Teak Cargo Bed Flooring',
      'Multi-Axle Steel Chassis with Tandem Leaf Spring Mockup',
      '12V Geared Drive Motor with DPDT Forward/Reverse Rocker Switch',
      'Heavy-Duty Multi-spoke Rubber Wheels (6 pcs)',
      'Cabin LEDs, Front Grille Mesh & Brass Tailgate Hinges'
    ],
    steps: [
      'Construct sturdy ladder-frame chassis with mounting brackets for dual rear axles.',
      'Cut circular wheel arch clearances and cab vents using Kiesh hole saw kit.',
      'Assemble hardwood timber cargo bay bed and fix brass tailgate hinge latches.',
      'Wire dual headlights, roof marker lights, and motor circuit with INGCO 60W soldering iron.',
      'Bond cabin interior dashboard and seats using TechTrove 20W hot melt glue gun.'
    ],
    bill: [
      { item: 'Hardwood Timber Slats & Plywood Cab Frame', qty: '1 set', unit: 750, total: 750 },
      { item: '12V Geared DC Drive Motor & Drive Axle', qty: '1 unit', unit: 950, total: 950 },
      { item: 'Multi-Spoke Heavy Rubber Truck Wheels', qty: '6 pcs', unit: 120, total: 720 },
      { item: 'Tandem Leaf Spring & Axle Rod Hardware', qty: '1 kit', unit: 380, total: 380 },
      { item: 'Tailgate Latches, LEDs & Wiring Loom', qty: '1 lot', unit: 300, total: 300 }
    ],
    pdfComponents: [
      { sNo: 1, name: 'PVC Chassis Sheet', qty: 1, price: 300, link: '', store: 'Local Supply' },
      { sNo: 2, name: 'Tyre Set', qty: 1, price: 100, link: '', store: 'Local Supply' },
      { sNo: 3, name: 'TMT Steel Axle Rod', qty: 1, price: 20, link: '', store: 'Local Supply' },
      { sNo: 4, name: 'Assembly & Wiring Work', qty: 1, price: 500, link: '', store: 'Workshop Labor' }
    ]
  },
  {
    id: 'proj-truck-2',
    projectNumber: 5,
    name: '5. Truck 2',
    shortName: 'Truck 2 (Heavy Tipper)',
    category: 'trucks',
    categoryLabel: 'Handmade Trucks',
    image: 'assets/images/project_truck_2.jpg',
    spentTime: '24.0 Hours',
    totalPrice: 1610,
    priceFormatted: '₹ 1,610',
    description: 'Handmade heavy tipper dump truck equipped with motorized screw-jack dump bed tipping mechanism, reinforced metal bed lining, wide-stance offroad tires, and rugged steel bumper.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeWatchUrl: 'https://youtube.com/@ggcreative-x9o?si=3LtZbnrBawQbGshe',
    requiredTools: [
      'OMXE OPAL-801 950w Heavy Duty Angle Grinder',
      'Qualigen 2000 W Heavy Duty Heat Gun',
      'SEE INSIDE Digital Vernier Caliper LCD',
      'Kiesh Holesaw Cutter Set 11pcs',
      'Husaini Mart Silicone Mould Skytail 2 Pack'
    ],
    materials: [
      'Heavy-Gauge Sheet Metal Tipper Bed with Rear Pivot Hinge',
      'Motorized Threaded Rod Lead-Screw Tipping Lift Mechanism',
      'High-Torque 12V 555 DC Geared Motor with Steel Gears',
      'Extra-Wide Heavy Tread Truck Tires (6 pcs)',
      'Cast Resin Counterweights & Industrial Yellow Enamel'
    ],
    steps: [
      'Fabricate high-strength tipper bed from sheet metal cut with OMXE 950W angle grinder.',
      'Cast custom epoxy chassis weights and ballast using Husaini Mart silicone moulds.',
      'Cut precision fuel tank cylinder ports and chassis holes with Kiesh hole saw kit.',
      'Measure lead-screw pitch and actuator travel clearance using SEE INSIDE digital caliper.',
      'Heat-shrink heavy wiring and cure protective clear coat with Qualigen 2000W heat gun.'
    ],
    bill: [
      { item: 'Heavy-Gauge Sheet Metal Tipper Bed & Pivot Pins', qty: '1 unit', unit: 980, total: 980 },
      { item: 'Motorized Lead-Screw Tipping Mechanism & Motor', qty: '1 unit', unit: 1150, total: 1150 },
      { item: 'Wide-Stance Heavy Tread Truck Wheels', qty: '6 pcs', unit: 130, total: 780 },
      { item: 'Chassis Box Steel & Heavy Front Bumper', qty: '1 lot', unit: 450, total: 450 },
      { item: 'Casting Resin, Fasteners & Industrial Enamel', qty: '1 lot', unit: 290, total: 290 }
    ],
    pdfComponents: [
      { sNo: 1, name: 'PVC Bed Lining', qty: 1, price: 200, link: '', store: 'Local Supply' },
      { sNo: 2, name: 'Tyre Sheet', qty: 1, price: 160, link: '', store: 'Local Supply' },
      { sNo: 3, name: 'LED Light Assembly', qty: 1, price: 150, link: '', store: 'Local Supply' },
      { sNo: 4, name: 'Custom Tipper Fabrication', qty: 1, price: 200, link: '', store: 'Workshop Labor' },
      { sNo: 5, name: 'Trolley – PVC', qty: 1, price: 100, link: '', store: 'Local Supply' },
      { sNo: 6, name: 'Trolley Mount Work', qty: 1, price: 200, link: '', store: 'Workshop Labor' },
      { sNo: 7, name: 'Water Tank Barrel', qty: 1, price: 600, link: '', store: 'Local Supply' }
    ]
  },
  {
    id: 'proj-water-pump',
    projectNumber: 6,
    name: '6. Water Pump',
    shortName: 'Water Pump (DIY 12V)',
    category: 'workshop-inventions',
    categoryLabel: 'Workshop Inventions',
    image: 'assets/images/project_water_pump.jpg',
    spentTime: '7.5 Hours',
    totalPrice: 1200,
    priceFormatted: '₹ 1,200',
    description: 'High-flow handmade 12V 775 motor centrifugal water pump with transparent acrylic impeller casing, custom resin curved vane impeller, 1/2-inch PVC inlet/outlet valves, and high-pressure water stream output.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeWatchUrl: 'https://youtube.com/@ggcreative-x9o?si=3LtZbnrBawQbGshe',
    requiredTools: [
      'INGCO SI0268 60 W Simple Soldering Iron',
      'NITYA HSS Titanium Coated Drill Bit Set',
      'Kiesh Holesaw Cutter Set 11pcs',
      'Husaini Mart Silicone Mould Skytail 2 Pack'
    ],
    materials: [
      'High-Speed 12V 775 Ball Bearing DC Motor (12,000 RPM)',
      'Clear Acrylic Sheet (8mm) for Front and Rear Impeller Plates',
      'Custom Epoxy Resin Impeller with Curved Vanes (Cooled in Silicone Mould)',
      '1/2-inch PVC Pipe Fittings, Elbows, and Regulating Ball Valve',
      'Polished Teak Mounting Base, Toggle Switch & Silicone Sealant'
    ],
    steps: [
      'Cut round circular acrylic casing faceplates using Kiesh hole saw kit.',
      'Bore water inlet and shaft pass-through ports using NITYA titanium drill bits.',
      'Cast durable balanced curved impeller vanes using resin and Husaini Mart silicone moulds.',
      'Solder 12V DC motor terminals, battery clip, and power toggle switch using INGCO soldering iron.',
      'Seal chamber with food-safe silicone gasket and test pump high-pressure water discharge flow.'
    ],
    bill: [
      { item: '12V 775 High-Speed Ball Bearing DC Motor', qty: '1 unit', unit: 650, total: 650 },
      { item: 'Clear Acrylic Plates & Precision Shaft Coupler', qty: '1 set', unit: 320, total: 320 },
      { item: 'PVC Pipe Fittings, Ball Valve & Clear Hoses', qty: '1 set', unit: 220, total: 220 },
      { item: 'Casting Resin & Gasket Silicone Sealant', qty: '1 lot', unit: 160, total: 160 },
      { item: 'Teak Wooden Mount Base & Toggle Switch', qty: '1 set', unit: 100, total: 100 }
    ],
    pdfComponents: [
      { sNo: 1, name: 'PVC Pipe Fitting', qty: 1, price: 300, link: '', store: 'Local Supply' },
      { sNo: 2, name: 'Motor – 6 V', qty: 1, price: 250, link: '', store: 'Local Supply' },
      { sNo: 3, name: 'PVC (Pump 2 Housing)', qty: 1, price: 300, link: '', store: 'Local Supply' },
      { sNo: 4, name: 'Motor – 6 V (Pump 2)', qty: 1, price: 350, link: '', store: 'Local Supply' }
    ]
  },
  {
    id: 'proj-jcb-3dx',
    projectNumber: 7,
    name: '7. DIY Homemade JCB 3DX Backhoe Loader',
    shortName: 'DIY JCB 3DX Backhoe',
    category: 'machinery-diy',
    categoryLabel: 'Heavy Machinery',
    image: 'assets/images/project_jcb_build.jpg',
    spentTime: '12.5 Hours',
    totalPrice: 14800,
    priceFormatted: '₹ 14,800',
    description: 'Scratch-built miniature JCB 3DX backhoe loader excavator currently under active fabrication. Handcrafted all-metal yellow chassis, dual-cylinder articulated front loader bucket, functional rear excavator boom, and high-torque DC motor drivetrain.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeWatchUrl: 'https://youtube.com/@ggcreative-x9o?si=3LtZbnrBawQbGshe',
    progressPct: 30,
    progressStatus: 'Currently Finishing 30% (Chassis & Boom Fabrication)',
    requiredTools: [
      'iBELL 650W Impact Drill Kit (TD13-100)',
      'Sauran AG-801 Angle Grinder (100mm)',
      'OMXE OPAL-801 950w Heavy Duty Angle Grinder',
      'INGCO 60W Simple Soldering Iron',
      'SEE INSIDE Digital Vernier Caliper LCD'
    ],
    materials: [
      'Sheet Metal (2mm) & Structural Box Channel (JCB Yellow Chassis)',
      'Front Loader Bucket & Dual-Arm Lifting Linkage',
      'Rear Excavator Boom, Dipper & Pivot Kingpin Mount',
      '12V DC High-Torque Geared Motors & Steering Servo',
      'High-Traction Deep-Tread Construction Lug Tires (4 pcs)'
    ],
    steps: [
      'Cut and weld 25x25mm steel box channel chassis frame with front axle pivot.',
      'Fabricate articulated front loader bucket and lifting arms from 2mm cold-rolled sheet.',
      'Assemble rear excavator swing post and boom arm structural members (30% stage).',
      'Mount 12V high-torque DC geared drivetrain motors and steerable front axle.',
      'Prime and spray signature JCB industrial yellow coating with black accent trim.'
    ],
    bill: [
      { item: 'Cold-Rolled Sheet Metal & Box Channel Steel', qty: '1 set', unit: 2200, total: 2200 },
      { item: '12V High-Torque Drivetrain Motors & Linkages', qty: '2 units', unit: 1350, total: 2700 },
      { item: 'Front Bucket & Rear Excavator Arm Mechanism', qty: '1 lot', unit: 3400, total: 3400 },
      { item: 'High-Traction Construction Lug Tires & Rims', qty: '4 pcs', unit: 650, total: 2600 },
      { item: 'Radio Controller, 30A ESC & JCB Yellow Paint', qty: '1 lot', unit: 3900, total: 3900 }
    ],
    pdfComponents: [
      { sNo: 1, name: 'Cold-Rolled Sheet Metal & Box Channel Frame', qty: 1, price: 2200, link: 'https://amzn.in/d/0bpoNrn3', store: 'Amazon' },
      { sNo: 2, name: '12V High-Torque DC Geared Motor', qty: 2, price: 2700, link: 'https://dl.flipkart.com/s/pBx0lIuuuN', store: 'Flipkart' },
      { sNo: 3, name: 'Front Loader Bucket & Mechanical Boom Linkage', qty: 1, price: 3400, link: 'https://dl.flipkart.com/s/30ytxXNNNN', store: 'Flipkart' },
      { sNo: 4, name: 'Heavy-Duty Construction Lug Wheels (4 pcs)', qty: 4, price: 2600, link: 'https://amzn.in/d/04ejyy9R', store: 'Amazon' },
      { sNo: 5, name: 'FS-GT2 Transmitter & Receiver System', qty: 1, price: 2500, link: 'https://robu.in/product/flysky-fs-gt2-transmitter-with-fs-gr3e-receiver/', store: 'Robu.in' },
      { sNo: 6, name: '30A Motor Speed Controller (ESC)', qty: 1, price: 1400, link: 'https://amzn.in/d/0as8pbV5', store: 'Amazon' }
    ]
  }
];

// ── 4. CATALOG PRODUCTS (11 Affiliate Gear) ──
const PRODUCTS = [
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

async function main() {
  console.log('🚀 Connecting to Cloud Firestore project:', PROJECT_ID);

  // 1. Push Channel Profile
  process.stdout.write('Writing settings/channel_profile... ');
  await writeDocument('settings', 'channel_profile', CHANNEL_PROFILE);
  console.log('✅ Done');

  // 2. Push Creator User
  process.stdout.write('Writing users/creator-official-gg... ');
  await writeDocument('users', 'creator-official-gg', CREATOR_USER);
  console.log('✅ Done');

  // 3. Push All 7 Projects
  console.log(`Writing ${PROJECTS.length} authentic DIY projects to 'projects' collection:`);
  for (const proj of PROJECTS) {
    process.stdout.write(`  - Writing projects/${proj.id} (${proj.name})... `);
    await writeDocument('projects', proj.id, {
      ...proj,
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Done');
  }

  // 4. Push All 11 Products
  console.log(`Writing ${PRODUCTS.length} affiliate tools to 'products' collection:`);
  for (const prod of PRODUCTS) {
    const docId = `product-${prod.id}`;
    process.stdout.write(`  - Writing products/${docId} (${prod.title.substring(0, 35)}...)... `);
    await writeDocument('products', docId, {
      ...prod,
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Done');
  }

  console.log('\n🎉 ALL DATA HAS BEEN SUCCESSFULLY PUSHED INTO CLOUD FIRESTORE!');
}

main().catch(err => {
  console.error('\n❌ Execution error:', err.message);
  process.exit(1);
});
