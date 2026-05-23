// src/services/api.js

const BASE_URL = 'http://universities.hipolabs.com';

/**
 * Fetch colleges from the API
 * @param {string} query - The search query
 * @returns {Promise<Array>} List of formatted colleges
 */
export const searchColleges = async (query = '') => {
  try {
    const url = new URL(`${BASE_URL}/search`);
    url.searchParams.append('country', 'India');
    if (query) {
      url.searchParams.append('name', query);
    }
    
    // Hipolabs API is notoriously slow sometimes, so we'll add an abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url.toString(), {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match our existing structure, as hipolabs has different fields
    // and lacks some (like fees, rating, image) which we'll mock for MVP feel
    return data.map((uni, index) => {
      // Mock some data consistently based on the name length/chars to keep it pseudo-random but stable
      const nameHash = uni.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      const mockedFees = 50000 + (nameHash % 200000); // random fee between 50k and 250k
      const mockedRating = 3.5 + ((nameHash % 15) / 10); // random rating between 3.5 and 5.0
      
      const courses = ['CSE', 'ECE', 'Mechanical', 'Civil', 'AI & ML', 'IT'];
      // pick 3 random courses based on hash
      const collegeCourses = [
        courses[nameHash % courses.length],
        courses[(nameHash + 1) % courses.length],
        courses[(nameHash + 2) % courses.length]
      ];
      
      // Hipolabs location is usually just 'India', so we'll try to extract it from the name if possible
      let location = uni['state-province'];
      
      if (!location) {
        const nameUpper = uni.name.toUpperCase();
        if (nameUpper.includes('PARUL') || nameUpper.includes('GUJARAT')) location = 'Gujarat';
        else if (nameUpper.includes('DELHI')) location = 'New Delhi';
        else if (nameUpper.includes('MUMBAI') || nameUpper.includes('PUNE') || nameUpper.includes('MAHARASHTRA')) location = 'Maharashtra';
        else if (nameUpper.includes('BANGALORE') || nameUpper.includes('KARNATAKA')) location = 'Karnataka';
        else if (nameUpper.includes('HYDERABAD') || nameUpper.includes('TELANGANA')) location = 'Telangana';
        else if (nameUpper.includes('CHENNAI') || nameUpper.includes('TAMIL NADU')) location = 'Tamil Nadu';
        else if (nameUpper.includes('ANDHRA') || nameUpper.includes('JNTU') || nameUpper.includes('VISHAKAPATNAM')) location = 'Andhra Pradesh';
        else if (nameUpper.includes('KERALA')) location = 'Kerala';
        else if (nameUpper.includes('PUNJAB')) location = 'Punjab';
        else if (nameUpper.includes('RAJASTHAN')) location = 'Rajasthan';
        else if (nameUpper.includes('BENGAL') || nameUpper.includes('KOLKATA')) location = 'West Bengal';
        else {
          const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Chandigarh', 'Jaipur'];
          location = locations[nameHash % locations.length];
        }
      }

      return {
        id: `api_${index}_${nameHash}`,
        name: uni.name,
        location: location,
        fees: mockedFees,
        rating: Number(mockedRating.toFixed(1)),
        placements: `${4 + (nameHash % 16)} LPA`,
        image: `https://images.unsplash.com/photo-${1500000000000 + (nameHash * 100000)}?q=80&w=1200&auto=format&fit=crop`, 
        // Fallback image will be handled by onError in the card
        courses: collegeCourses,
        reviews: 100 + (nameHash % 900),
        description: `Official website: ${uni.web_pages[0] || 'N/A'}`,
        website: uni.web_pages[0] || null
      };
    });

  } catch (error) {
    console.error("Error fetching colleges from API:", error);
    throw error;
  }
}
