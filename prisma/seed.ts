import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');
  
  // Clear existing data
  await prisma.article.deleteMany({});
  await prisma.subMenu.deleteMany({});
  await prisma.menu.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.ad.deleteMany({});
  await prisma.systemSetting.deleteMany({});
  await prisma.adSetting.deleteMany({});

  // Hash passwords
  const salt = bcrypt.genSaltSync(10);
  const adminPassword = bcrypt.hashSync('admin123', salt);
  const journalistPassword = bcrypt.hashSync('journalist123', salt);
  const readerPassword = bcrypt.hashSync('reader123', salt);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Sport',
      email: 'admin@sports.com',
      password: adminPassword,
      role: 'admin',
      status: 'active',
    },
  });

  const journalist = await prisma.user.create({
    data: {
      name: 'Jean Reporter',
      email: 'journalist@sports.com',
      password: journalistPassword,
      role: 'journalist',
      status: 'active',
    },
  });

  const reader = await prisma.user.create({
    data: {
      name: 'Marc Lecteur',
      email: 'reader@sports.com',
      password: readerPassword,
      role: 'reader',
      status: 'active',
    },
  });

  console.log('Users created:', { admin: admin.email, journalist: journalist.email, reader: reader.email });

  // Initialize System Settings
  await prisma.systemSetting.create({
    data: {
      key: 'showDemoData',
      value: 'true',
    },
  });

  // Initialize Ad Settings
  await prisma.adSetting.createMany({
    data: [
      { position: 'header', limit: 3, interval: 10 },
      { position: 'sidebar', limit: 5, interval: 10 },
      { position: 'footer', limit: 3, interval: 10 },
      { position: 'left-sidebar', limit: 5, interval: 10 },
    ],
  });

  console.log('System settings initialized.');

  // Create Menus and Submenus
  const menuSport = await prisma.menu.create({
    data: {
      nom: 'Sport',
      slug: 'sport',
      order: 1,
    },
  });

  const subLigue1 = await prisma.subMenu.create({
    data: {
      nom: 'Ligue 1',
      slug: 'ligue-1',
      order: 1,
      menuId: menuSport.id,
    },
  });

  const subNBA = await prisma.subMenu.create({
    data: {
      nom: 'NBA',
      slug: 'nba',
      order: 2,
      menuId: menuSport.id,
    },
  });

  const menuActualites = await prisma.menu.create({
    data: {
      nom: 'Actualités',
      slug: 'actualites',
      order: 0,
    },
  });

  const subFrance = await prisma.subMenu.create({
    data: {
      nom: 'France',
      slug: 'france',
      order: 1,
      menuId: menuActualites.id,
    },
  });

  const menuPolitique = await prisma.menu.create({
    data: {
      nom: 'Politique',
      slug: 'politique',
      order: 2,
    },
  });

  const menuSante = await prisma.menu.create({
    data: {
      nom: 'Santé',
      slug: 'sante',
      order: 3,
    },
  });

  const menuEconomie = await prisma.menu.create({
    data: {
      nom: 'Économie',
      slug: 'economie',
      order: 4,
    },
  });

  console.log('Menus and Submenus created.');

  // Create Ads
  await prisma.ad.create({
    data: {
      titre: 'Header Banner Sponsor',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=200&fit=crop',
      lien: 'https://www.google.com',
      position: 'header',
      active: true,
      isDemo: true,
    },
  });

  await prisma.ad.create({
    data: {
      titre: 'Sidebar Promo Nike',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      lien: 'https://nike.com',
      position: 'sidebar',
      active: true,
      isDemo: true,
    },
  });

  await prisma.ad.create({
    data: {
      titre: 'Footer Sponsor Adidas',
      imageUrl: 'https://images.unsplash.com/photo-1518002171953-a080ee81be4e?w=800&h=200&fit=crop',
      lien: 'https://adidas.com',
      position: 'footer',
      active: true,
      isDemo: true,
    },
  });

  console.log('Ads created.');

  // Create Articles
  await prisma.article.create({
    data: {
      titre: 'Ligue 1 : Le PSG s’impose dans le Classique face à l’OM',
      slug: 'ligue-1-psg-om-classique',
      contenu: `
        <p>Le Paris Saint-Germain a remporté une victoire éclatante face à l'Olympique de Marseille ce soir au Parc des Princes.</p>
        <h2>Un match maîtrisé de bout en bout</h2>
        <p>Portés par un collectif soudé et des individualités en grande forme, les Parisiens ont su faire la différence dès la première période. L'ouverture du score est intervenue à la 24ème minute sur un magnifique coup franc direct.</p>
        <blockquote>"C'est une victoire importante pour la suite du championnat. Nous avons montré du caractère aujourd'hui." - a déclaré l'entraîneur en conférence de presse.</blockquote>
        <p>Avec cette victoire, le PSG prend le large en tête de la Ligue 1, tandis que l'OM doit se ressaisir avant son prochain déplacement.</p>
      `,
      imagePrincipale: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=500&fit=crop',
      auteurId: journalist.id,
      menuId: menuSport.id,
      submenuId: subLigue1.id,
      datePublication: new Date(),
      isDemo: true,
    },
  });

  await prisma.article.create({
    data: {
      titre: 'NBA : Record de points historique battu ce soir !',
      slug: 'nba-record-points-historique',
      contenu: `
        <p>Un moment de légende s'est produit sur les parquets de la NBA cette nuit.</p>
        <p>Le meneur vedette de la ligue a inscrit un total historique de 71 points en un seul match, surpassant les précédentes performances légendaires. Le public était en délire dans la salle.</p>
        <h2>Une précision chirurgicale</h2>
        <p>Avec un impressionnant 12/15 derrière la ligne des trois points, le joueur a guidé son équipe vers une victoire écrasante en prolongation.</p>
      `,
      imagePrincipale: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=500&fit=crop',
      auteurId: journalist.id,
      menuId: menuSport.id,
      submenuId: subNBA.id,
      datePublication: new Date(),
      isDemo: true,
    },
  });

  await prisma.article.create({
    data: {
      titre: 'Réforme Politique : Les annonces majeures attendues demain',
      slug: 'reforme-politique-annonces-majeures',
      contenu: `
        <p>Le gouvernement s'apprête à présenter les grandes lignes de son nouveau projet de loi sur la modernisation de la fonction publique.</p>
        <p>Cette réforme majeure vise à simplifier les processus administratifs et à accroître l'attractivité des métiers de l'État. Des syndicats se disent déjà vigilants.</p>
      `,
      imagePrincipale: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&h=500&fit=crop',
      auteurId: journalist.id,
      menuId: menuPolitique.id,
      datePublication: new Date(),
      isDemo: true,
    },
  });

  console.log('Articles created.');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
