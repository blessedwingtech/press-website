import { db } from '@/lib/db';
import Navbar from './Navbar';

export default async function NavbarWrapper() {
  const menus = await db.menu.findMany({
    orderBy: { order: 'asc' },
    include: {
      submenus: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return <Navbar menus={menus} />;
}
