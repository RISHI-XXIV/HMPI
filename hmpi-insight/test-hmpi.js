// Test script to demonstrate HMPI calculation
const axios = require('axios');

// Sample heavy metal concentration data (in mg/L)
const sampleData = {
  metalConcentrations: {
    lead: 0.015,      // Above safe limit (0.01)
    arsenic: 0.008,   // Below safe limit (0.01)
    mercury: 0.0005,  // Below safe limit (0.001)
    cadmium: 0.004,   // Above safe limit (0.003)
    chromium: 0.03,   // Below safe limit (0.05)
    nickel: 0.015,    // Below safe limit (0.02)
    copper: 1.5,      // Below safe limit (2.0)
    zinc: 2.0,        // Below safe limit (3.0)
    iron: 0.4,        // Above safe limit (0.3)
    manganese: 0.08   // Below safe limit (0.1)
  },
  location: {
    type: 'Point',
    coordinates: [77.2090, 28.6139], // Delhi coordinates
    address: {
      pincode: '110001',
      district: 'New Delhi',
      state: 'Delhi'
    }
  },
  sampleDate: new Date().toISOString(),
  source: 'borewell',
  saveToDatabase: false
};

async function testHMPICalculation() {
  console.log('\\n=================================');
  console.log('HMPI-Insight Test Script');
  console.log('=================================\\n');
  
  try {
    // First, let's register a test user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    });
    
    const token = registerResponse.data.token;
    console.log('✅ User registered successfully\\n');
    
    // Now calculate HMPI
    console.log('2. Calculating HMPI for sample data...');
    console.log('\\nSample Metal Concentrations (mg/L):');
    console.log('------------------------------------');
    Object.entries(sampleData.metalConcentrations).forEach(([metal, value]) => {
      console.log(`${metal.padEnd(12)}: ${value}`);
    });
    
    const hmpiResponse = await axios.post(
      'http://localhost:5000/api/hmpi/calculate',
      sampleData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const result = hmpiResponse.data;
    
    console.log('\\n3. HMPI Calculation Results:');
    console.log('=============================');
    console.log(`HMPI Value: ${result.hmpi.hmpi}`);
    console.log(`Category: ${result.hmpi.category}`);
    console.log(`Risk Level: ${result.hmpi.riskLevel}`);
    console.log(`\\nRecommendation: ${result.hmpi.recommendation}`);
    
    console.log('\\n4. Water Quality Index (WQI):');
    console.log('==============================');
    console.log(`WQI Value: ${result.wqi.wqi}`);
    console.log(`Quality: ${result.wqi.quality}`);
    
    if (result.hmpi.exceededLimits.length > 0) {
      console.log('\\n5. Metals Exceeding Safe Limits:');
      console.log('==================================');
      result.hmpi.exceededLimits.forEach(metal => {
        console.log(`❌ ${metal.metal}: ${metal.concentration} mg/L (Limit: ${metal.limit} mg/L) - ${metal.exceedanceRatio.toFixed(2)}x over limit`);
      });
    }
    
    console.log('\\n✨ Test completed successfully!\\n');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

// Run the test
testHMPICalculation();
