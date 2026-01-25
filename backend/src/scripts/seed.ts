import { DataSource } from 'typeorm';
import { typeOrmConfig } from '../config/typeorm.config';
import * as bcrypt from 'bcrypt';

async function seed() {
  // Create DataSource
  const dataSource = new DataSource({
    ...typeOrmConfig,
    type: 'postgres',
  } as any);

  try {
    await dataSource.initialize();
    console.log('✅ Database connected successfully');

    // 1. Create Roles
    console.log('\n📝 Creating roles...');
    const rolesData = [
      { role_name: 'Admin', description: 'System administrator with full access' },
      { role_name: 'Form Teacher', description: 'Class teacher managing student results' },
      { role_name: 'Subject Teacher', description: 'Subject teacher entering subject scores' },
    ];

    for (const roleData of rolesData) {
      const existing = await dataSource.query(
        'SELECT id FROM roles WHERE role_name = $1',
        [roleData.role_name]
      );
      
      if (existing.length === 0) {
        await dataSource.query(
          'INSERT INTO roles (role_name, description, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
          [roleData.role_name, roleData.description]
        );
        console.log(`  ✅ Created role: ${roleData.role_name}`);
      } else {
        console.log(`  ⏭️  Role already exists: ${roleData.role_name}`);
      }
    }

    // Get Admin role ID
    const [adminRole] = await dataSource.query(
      'SELECT id FROM roles WHERE role_name = $1',
      ['Admin']
    );

    // 2. Create Admin User
    console.log('\n👤 Creating admin user...');
    const existingAdmin = await dataSource.query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await dataSource.query(
        'INSERT INTO users (username, password, role_id, is_active, must_change_password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
        ['admin', hashedPassword, adminRole.id, true, false]
      );
      console.log('  ✅ Admin user created');
      console.log('  📋 Username: admin');
      console.log('  🔑 Password: Admin@123');
    } else {
      console.log('  ⏭️  Admin user already exists');
    }

    // 3. Create Academic Session
    console.log('\n📅 Creating academic session...');
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const sessionName = `${currentYear}/${nextYear}`;
    
    const existingSession = await dataSource.query(
      'SELECT id FROM academic_sessions WHERE session_name = $1',
      [sessionName]
    );

    let sessionId: number;
    if (existingSession.length === 0) {
      const [session] = await dataSource.query(
        'INSERT INTO academic_sessions (session_name, start_date, end_date, is_current, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
        [sessionName, `${currentYear}-09-01`, `${nextYear}-07-31`, true]
      );
      sessionId = session.id;
      console.log(`  ✅ Created session: ${sessionName}`);
    } else {
      sessionId = existingSession[0].id;
      console.log(`  ⏭️  Session already exists: ${sessionName}`);
    }

    // 4. Create Terms
    console.log('\n📆 Creating terms...');
    const termsData = [
      { term_name: 'First Term', start_date: `${currentYear}-09-01`, end_date: `${currentYear}-12-15` },
      { term_name: 'Second Term', start_date: `${nextYear}-01-05`, end_date: `${nextYear}-04-15` },
      { term_name: 'Third Term', start_date: `${nextYear}-04-20`, end_date: `${nextYear}-07-31` },
    ];

    for (const termData of termsData) {
      const existing = await dataSource.query(
        'SELECT id FROM terms WHERE session_id = $1 AND term_name = $2',
        [sessionId, termData.term_name]
      );

      if (existing.length === 0) {
        await dataSource.query(
          'INSERT INTO terms (term_name, session_id, start_date, end_date, is_current, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
          [termData.term_name, sessionId, termData.start_date, termData.end_date, termData.term_name === 'First Term']
        );
        console.log(`  ✅ Created term: ${termData.term_name}`);
      } else {
        console.log(`  ⏭️  Term already exists: ${termData.term_name}`);
      }
    }

    // 5. Create Assessment Types
    console.log('\n📊 Creating assessment types...');
    const assessmentsData = [
      { name: 'Test 1', max_score: 20, description: 'First Continuous Assessment Test' },
      { name: 'Test 2', max_score: 20, description: 'Second Continuous Assessment Test' },
      { name: 'Exam', max_score: 60, description: 'End of Term Examination' },
    ];

    for (const assessmentData of assessmentsData) {
      const existing = await dataSource.query(
        'SELECT id FROM assessments WHERE name = $1',
        [assessmentData.name]
      );

      if (existing.length === 0) {
        await dataSource.query(
          'INSERT INTO assessments (name, max_score, description, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
          [assessmentData.name, assessmentData.max_score, assessmentData.description]
        );
        console.log(`  ✅ Created assessment: ${assessmentData.name} (${assessmentData.max_score} marks)`);
      } else {
        console.log(`  ⏭️  Assessment already exists: ${assessmentData.name}`);
      }
    }

    console.log('\n✨ Seeding completed successfully!');
    console.log('\n📌 Summary:');
    console.log('  - 4 Roles created');
    console.log('  - Admin user: admin / Admin@123');
    console.log(`  - Academic Session: ${sessionName}`);
    console.log('  - 3 Terms created');
    console.log('  - 3 Assessment types created');
    console.log('\n🚀 You can now login and start using the system!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();
