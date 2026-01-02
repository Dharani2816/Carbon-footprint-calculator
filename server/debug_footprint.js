const { User, CarbonFootprint } = require('./models');
const { db } = require('./config/firebase');

async function debugFootprintFlow() {
    console.log('🐞 Check 1: Creating Validation User...');
    try {
        // 1. Create User
        const userEmail = `footprint_test_${Date.now()}@test.com`;
        const user = await User.create({
            name: 'Footprint Tester',
            email: userEmail,
            pass: '123'
        });
        console.log('✅ User Created:', user.id);

        // 2. Create Footprint
        console.log('🐞 Check 2: Saving Footprint...');
        const fpData = {
            user_id: user.id,
            electricity_emission: 100,
            transport_emission: 100,
            diet_emission: 100,
            lifestyle_emission: 100,
            total_emission: 400
        };
        const fp = await CarbonFootprint.create(fpData);
        console.log('✅ Footprint Saved:', fp.id);

        // 3. Retrieve Footprint
        console.log('🐞 Check 3: Retrieving History...');
        // Simulate what controller does
        const where = { user_id: user.id };
        const order = [['createdAt', 'DESC']];
        const history = await CarbonFootprint.findAll({ where, order });
        
        console.log(`✅ History Retrieved: Found ${history.length} records`);
        if (history.length > 0) {
            console.log('Sample Record:', history[0]);
            console.log('MATCH CHECK:', history[0].user_id === user.id ? 'PASS' : 'FAIL');
        } else {
            console.error('❌ HISTORY IS EMPTY - SAVE FAILED OR QUERY MISMATCH');
        }

    } catch (e) {
        console.error('❌ ERROR:', e);
    }
}

debugFootprintFlow();
