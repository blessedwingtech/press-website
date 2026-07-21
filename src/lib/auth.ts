import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';
import * as bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Veuillez entrer un email et un mot de passe.');
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password.trim();

        const user = await db.user.findUnique({
          where: { email }
        });

        if (!user) {
          throw new Error('Aucun utilisateur trouvé avec cet email.');
        }

        if (user.status === 'banned') {
          throw new Error('Ce compte a été banni par un administrateur.');
        }

        const isValid = bcrypt.compareSync(password, user.password);

        if (!isValid) {
          throw new Error('Mot de passe incorrect.');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      
      // Permettre de rafraîchir la session dynamiquement
      if (trigger === 'update' && session) {
        if (session.role) token.role = session.role;
        if (session.name) token.name = session.name;
        if (session.status) token.status = session.status;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET || 'a-very-long-secret-key-for-local-development-security-purposes'
};

// 👇 Extension des types NextAuth (à placer à la fin du fichier)
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    status: string;
  }
  interface Session {
    user: User & {
      id: string;
      role: string;
      status: string;
    };
  }
}