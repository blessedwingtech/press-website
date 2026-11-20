import { db } from '@/lib/db';
import Navbar from './Navbar';

export default async function NavbarWrapper() {
  try {
    const menus = await db.menu.findMany({
      orderBy: { order: 'asc' },
      include: {
        submenus: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return <Navbar menus={menus || []} />;
  } catch (err) {
    console.error('[NavbarWrapper] Erreur lors de la récupération des rubriques:', err);
    return <Navbar menus={[]} />;
  }
}
