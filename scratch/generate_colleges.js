import fs from 'fs';
import path from 'path';

// Known premium base data (derived from user's parts to ensure no loss)
const baseColleges = [
  { name: "IIT Bombay", category: "IIT", city: "Mumbai", state: "Maharashtra", fees: 220000, rating: 4.9, placements: "25 LPA", nirfRank: 3 },
  { name: "IIT Delhi", category: "IIT", city: "New Delhi", state: "Delhi", fees: 225000, rating: 4.8, placements: "24 LPA", nirfRank: 2 },
  { name: "IIT Madras", category: "IIT", city: "Chennai", state: "Tamil Nadu", fees: 215000, rating: 4.9, placements: "22 LPA", nirfRank: 1 },
  { name: "IIT Kanpur", category: "IIT", city: "Kanpur", state: "Uttar Pradesh", fees: 215000, rating: 4.8, placements: "23 LPA", nirfRank: 4 },
  { name: "IIT Kharagpur", category: "IIT", city: "Kharagpur", state: "West Bengal", fees: 210000, rating: 4.8, placements: "20 LPA", nirfRank: 5 },
  { name: "IIT Roorkee", category: "IIT", city: "Roorkee", state: "Uttarakhand", fees: 205000, rating: 4.7, placements: "19 LPA", nirfRank: 6 },
  { name: "NIT Trichy", category: "NIT", city: "Tiruchirappalli", state: "Tamil Nadu", fees: 165000, rating: 4.7, placements: "15 LPA", nirfRank: 9 },
  { name: "NIT Warangal", category: "NIT", city: "Warangal", state: "Telangana", fees: 160000, rating: 4.6, placements: "14 LPA", nirfRank: 12 },
  { name: "NIT Surathkal", category: "NIT", city: "Mangalore", state: "Karnataka", fees: 165000, rating: 4.6, placements: "15 LPA", nirfRank: 10 },
  { name: "IIIT Hyderabad", category: "IIIT", city: "Hyderabad", state: "Telangana", fees: 320000, rating: 4.8, placements: "28 LPA", nirfRank: 12 },
  { name: "VIT Vellore", category: "VIT", city: "Vellore", state: "Tamil Nadu", fees: 198000, rating: 4.5, placements: "11 LPA", nirfRank: 11 },
  { name: "VIT AP University", category: "VIT", city: "Amaravati", state: "Andhra Pradesh", fees: 185000, rating: 4.4, placements: "9 LPA", nirfRank: 52 },
  { name: "MIT Manipal", category: "MIT", city: "Manipal", state: "Karnataka", fees: 350000, rating: 4.6, placements: "10 LPA", nirfRank: 14 },
  { name: "BITS Pilani", category: "BITS", city: "Pilani", state: "Rajasthan", fees: 480000, rating: 4.9, placements: "30 LPA", nirfRank: 7 },
  { name: "SRM University", category: "Private", city: "Chennai", state: "Tamil Nadu", fees: 250000, rating: 4.4, placements: "9 LPA", nirfRank: 21 },
  { name: "KL University", category: "Private", city: "Vijayawada", state: "Andhra Pradesh", fees: 165000, rating: 4.3, placements: "8 LPA", nirfRank: 44 },
  { name: "Amrita Vishwa Vidyapeetham", category: "University", city: "Coimbatore", state: "Tamil Nadu", fees: 240000, rating: 4.5, placements: "9 LPA", nirfRank: 19 },
  { name: "JNTU Hyderabad", category: "JNTU", city: "Hyderabad", state: "Telangana", fees: 85000, rating: 4.5, placements: "8 LPA", nirfRank: 62 },
  { name: "JNTU Kakinada", category: "JNTU", city: "Kakinada", state: "Andhra Pradesh", fees: 75000, rating: 4.4, placements: "7 LPA", nirfRank: 89 },
  { name: "Andhra University", category: "University", city: "Visakhapatnam", state: "Andhra Pradesh", fees: 65000, rating: 4.3, placements: "6 LPA", nirfRank: 45 },
  { name: "JNTUA Anantapur", category: "JNTU", city: "Anantapur", state: "Andhra Pradesh", fees: 70000, rating: 4.2, placements: "6 LPA", nirfRank: 110 }
];

const statesCities = [
  { state: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"] },
  { state: "Karnataka", cities: ["Bangalore", "Mysore", "Mangalore", "Hubli", "Belgaum"] },
  { state: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"] },
  { state: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"] },
  { state: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati"] },
  { state: "Delhi", cities: ["New Delhi", "Dwarka", "Rohini"] },
  { state: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"] },
  { state: "Uttar Pradesh", cities: ["Noida", "Kanpur", "Lucknow", "Agra", "Varanasi"] },
  { state: "West Bengal", cities: ["Kolkata", "Howrah", "Durgapur", "Asansol"] },
  { state: "Punjab", cities: ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar"] },
  { state: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Kota", "Udaipur"] }
];

const patterns = [
  "{City} Institute of Technology",
  "{City} College of Engineering",
  "National Institute of Engineering, {City}",
  "{City} Global University",
  "Advanced Technology Institute, {City}",
  "{City} State University of Engineering",
  "Sri {City} Technical College",
  "Indian Institute of InfoTech, {City}",
  "{City} Academy of Technical Sciences",
  "Royal College of Engineering, {City}"
];

const images = [
  "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1564981797816-1043664bf78d?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?q=80&w=1200&auto=format&fit=crop"
];

const allCourses = [
  "CSE", "IT", "AI & ML", "Cyber Security", "Data Science", "ECE", "EEE", "Mechanical", "Civil", 
  "Aerospace", "Biotechnology", "Chemical", "Automobile", "Robotics"
];

const generateRandomCourses = () => {
  const count = Math.floor(Math.random() * 3) + 3; // 3 to 5 courses
  const shuffled = allCourses.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const collegesMap = new Map();
let currentId = 1;

// 1. Add base colleges first
baseColleges.forEach(c => {
  const name = c.name;
  if (!collegesMap.has(name)) {
    collegesMap.set(name, {
      id: currentId++,
      name: name,
      category: c.category,
      city: c.city,
      state: c.state,
      location: `${c.city}, ${c.state}`,
      fees: c.fees,
      rating: c.rating,
      placements: c.placements,
      nirfRank: c.nirfRank || Math.floor(Math.random() * 200) + 1,
      image: images[currentId % images.length],
      courses: generateRandomCourses(),
      reviews: Math.floor(Math.random() * 1000) + 500,
      officialWebsite: `https://www.${name.replace(/[^a-zA-Z]/g, '').toLowerCase()}.ac.in`,
      description: `A top-rated engineering institution located in ${c.city}, ${c.state}.`
    });
  }
});

// 2. Generate remaining up to 500
while (collegesMap.size < 500) {
  const stateObj = statesCities[Math.floor(Math.random() * statesCities.length)];
  const city = stateObj.cities[Math.floor(Math.random() * stateObj.cities.length)];
  const state = stateObj.state;
  
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const name = pattern.replace("{City}", city);
  
  if (!collegesMap.has(name)) {
    const isGovt = Math.random() > 0.5;
    const category = isGovt ? "Government" : "Private";
    const rating = (Math.random() * (4.8 - 3.5) + 3.5).toFixed(1);
    const fees = isGovt ? (Math.floor(Math.random() * 50) + 40) * 1000 : (Math.floor(Math.random() * 200) + 100) * 1000;
    const placements = `${Math.floor(Math.random() * 10) + 4} LPA`;
    
    collegesMap.set(name, {
      id: currentId++,
      name: name,
      category: category,
      city: city,
      state: state,
      location: `${city}, ${state}`,
      fees: fees,
      rating: parseFloat(rating),
      placements: placements,
      nirfRank: Math.floor(Math.random() * 300) + 50,
      image: images[currentId % images.length],
      courses: generateRandomCourses(),
      reviews: Math.floor(Math.random() * 500) + 100,
      officialWebsite: `https://www.${name.replace(/[^a-zA-Z]/g, '').toLowerCase().substring(0,10)}.ac.in`,
      description: `Established technical institute serving the ${city} region with strong academics.`
    });
  }
}

const finalCollegesArray = Array.from(collegesMap.values());

const fileContent = `// Auto-generated 500+ Premium College Dataset
// Built dynamically to simulate a massive EdTech Startup database

const colleges = ${JSON.stringify(finalCollegesArray, null, 2)};

export default colleges;
`;

const destPath = path.resolve('./src/data/colleges.js');
fs.writeFileSync(destPath, fileContent, 'utf-8');

console.log(`Successfully generated ${finalCollegesArray.length} unique colleges to ${destPath}`);
