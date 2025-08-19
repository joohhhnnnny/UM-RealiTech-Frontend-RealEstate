import { collection, addDoc, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/Firebase.js';
import agentsData from '../json/agents.json';

// Enhanced agent data with realistic properties
const specializations = ['Residential', 'Commercial', 'Luxury', 'Investment', 'Rental', 'Industrial'];
const agencies = ['Real.ph Agency', 'Prime Properties', 'Elite Realty', 'Metro Homes', 'Urban Properties'];

const generateEnhancedAgent = (agent, index) => {
  const specialization = specializations[index % specializations.length];
  const agency = index < 3 ? 'Real.ph Agency' : agencies[Math.floor(Math.random() * agencies.length)];
  
  return {
    ...agent,
    // Basic info enhancements
    agency: agent.agency || agency,
    specialization,
    verified: Math.random() > 0.3, // 70% verified
    isActive: true,
    
    // Performance metrics
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0 rating
    dealsCompleted: Math.floor(Math.random() * 50) + 5, // 5-55 deals
    yearsExperience: Math.floor(Math.random() * 15) + 2, // 2-17 years
    reviewCount: Math.floor(Math.random() * 20) + 3, // 3-23 reviews
    
    // Contact preferences
    responseTime: ['30 minutes', '1 hour', '2 hours', '4 hours'][Math.floor(Math.random() * 4)],
    
    // Additional specializations
    specializations: [
      specialization,
      ...(Math.random() > 0.5 ? [specializations[(index + 1) % specializations.length]] : [])
    ],
    
    // Professional details
    bio: `Professional ${specialization.toLowerCase()} real estate specialist with ${Math.floor(Math.random() * 15) + 2}+ years of experience in the Philippine market. Committed to providing exceptional service and helping clients achieve their property goals.`,
    
    // Profile image (using placeholder for now)
    profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=random&size=200`,
    
    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // Location (you can customize this)
    serviceAreas: ['Metro Manila', 'Makati', 'BGC', 'Ortigas', 'Alabang'],
  };
};

const populateFirestoreAgents = async () => {
  try {
    console.log('🚀 Starting to populate Firestore with agent data...');
    
    // Check if agents collection already has data
    const existingAgents = await getDocs(collection(db, 'agents'));
    
    if (!existingAgents.empty) {
      console.log(`⚠️ Found ${existingAgents.size} existing agents in Firestore.`);
      const shouldProceed = confirm('Agents already exist in Firestore. Do you want to add more agents anyway?');
      if (!shouldProceed) {
        console.log('❌ Operation cancelled by user.');
        return;
      }
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process agents in batches to avoid rate limits
    for (let i = 0; i < agentsData.length; i += 5) {
      const batch = agentsData.slice(i, i + 5);
      
      await Promise.all(
        batch.map(async (agent, batchIndex) => {
          try {
            const enhancedAgent = generateEnhancedAgent(agent, i + batchIndex);
            
            // Use the agent's existing ID if available, otherwise let Firestore generate one
            if (agent.id) {
              await setDoc(doc(db, 'agents', agent.id), enhancedAgent);
              console.log(`✅ Added agent: ${enhancedAgent.name} (ID: ${agent.id})`);
            } else {
              const docRef = await addDoc(collection(db, 'agents'), enhancedAgent);
              console.log(`✅ Added agent: ${enhancedAgent.name} (ID: ${docRef.id})`);
            }
            
            successCount++;
          } catch (error) {
            console.error(`❌ Error adding agent ${agent.name}:`, error);
            errorCount++;
          }
        })
      );
      
      // Small delay between batches to avoid overwhelming Firestore
      if (i + 5 < agentsData.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('\n📊 Population Summary:');
    console.log(`✅ Successfully added: ${successCount} agents`);
    console.log(`❌ Failed to add: ${errorCount} agents`);
    console.log(`📁 Total processed: ${agentsData.length} agents`);
    
    if (successCount > 0) {
      console.log('\n🎉 Firestore population completed successfully!');
      console.log('🔄 Your React app should now show real agent data.');
      alert(`✅ Successfully populated Firestore with ${successCount} agents!\n\nRefresh your app to see the real data.`);
    }
    
  } catch (error) {
    console.error('💥 Fatal error during Firestore population:', error);
    alert(`❌ Failed to populate Firestore: ${error.message}`);
  }
};

// Export for use in other scripts
export { populateFirestoreAgents };

// You can run this script by calling populateFirestoreAgents() from browser console
// or by importing and running it in a React component
