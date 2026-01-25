import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { typeOrmConfig } from '../config/typeorm.config';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { ROLES } from '../utils/constants';

// Load environment variables
config();

async function seed() {
  const dataSource = new DataSource(typeOrmConfig as any);
  await dataSource.initialize();

  console.log('🌱 Starting database seeding...');

  const roleRepository = dataSource.getRepository(Role);
  const userRepository = dataSource.getRepository(User);

  // Create roles
  const roles = [
    {
      roleName: ROLES.ADMIN,
      description: 'Full system access and administrative privileges',
    },
    {
      roleName: ROLES.FORM_TEACHER,
      description: 'View class results, add remarks for assigned class',
    },
    {
      roleName: ROLES.SUBJECT_TEACHER,
      description: 'Enter scores for assigned subjects and classes',
    },
  ];

  console.log('Creating roles...');
  for (const roleData of roles) {
    const existingRole = await roleRepository.findOne({
      where: { roleName: roleData.roleName },
    });

    if (!existingRole) {
      const role = roleRepository.create(roleData);
      await roleRepository.save(role);
      console.log(`✓ Created role: ${roleData.roleName}`);
    } else {
      console.log(`- Role already exists: ${roleData.roleName}`);
    }
  }

  // Create admin user
  console.log('\nCreating admin user...');
  const adminRole = await roleRepository.findOne({
    where: { roleName: ROLES.ADMIN },
  });

  if (!adminRole) {
    console.error('❌ Admin role not found!');
    await dataSource.destroy();
    return;
  }

  const existingAdmin = await userRepository.findOne({
    where: { username: 'admin' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const adminUser = userRepository.create({
      username: 'admin',
      password: hashedPassword,
      roleId: adminRole.id,
      isActive: true,
      mustChangePassword: false, // Admin can change later
    });

    await userRepository.save(adminUser);
    console.log('✓ Created admin user');
    console.log('  Username: admin');
    console.log('  Password: Admin@123');
    console.log('  ⚠️  Please change this password after first login!');
  } else {
    console.log('- Admin user already exists');
  }

  console.log('\n✅ Database seeding completed!');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
