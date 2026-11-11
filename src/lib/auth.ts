import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { db } from './db';
import * as bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
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
          status: user.status,
          isPro: Boolean(user.isPro),
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const email = user.email?.trim().toLowerCase();
        if (!email) {
          return '/login?error=EmailObligatoire';
        }

        // 1. Vérifier si l'utilisateur existe déjà dans db.user
        const existingUser = await db.user.findUnique({
          where: { email }
        });

        if (existingUser) {
          if (existingUser.status === 'banned') {
            return '/login?error=banned';
          }
          // Utilisateur actif et approuvé : connexion autorisée !
          return true;
        }

        // 2. L'utilisateur n'est pas encore approuvé/créé dans db.user
        // RÈGLE MÉTIER : C'est une demande de compte qui doit être validée par l'admin
        const existingRequest = await db.accountRequest.findUnique({
          where: { email }
        });

        if (!existingRequest) {
          // Générer un nom d'utilisateur unique et propre
          const baseUsername = (user.name || email.split('@')[0])
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .slice(0, 20) || 'user';

          let finalUsername = baseUsername;
          let counter = 1;
          while (
            (await db.user.findFirst({ where: { name: finalUsername } })) ||
            (await db.accountRequest.findFirst({ where: { username: finalUsername } }))
          ) {
            finalUsername = `${baseUsername}${counter}`;
            counter++;
          }

          await db.accountRequest.create({
            data: {
              name: user.name || finalUsername,
              username: finalUsername,
              email: email,
              role: 'reader',
              profilePhoto: user.image || null,
              status: 'CONFIRMED_EMAIL', // Directement certifié par Google
              confirmationToken: `google_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            }
          });
        }

        // Rediriger vers la page login avec notification explicite
        return '/login?google_pending=true';
      }

      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.status = (user as any).status;
        token.isPro = Boolean((user as any).isPro);
      }
      
      // Si connexion Google, synchroniser avec les informations en base de données
      if (account?.provider === 'google' && token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email.toLowerCase() }
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.isPro = Boolean(dbUser.isPro);
        }
      }

      // Permettre de rafraîchir la session dynamiquement
      if (trigger === 'update' && session) {
        if (session.role) token.role = session.role;
        if (session.name) token.name = session.name;
        if (session.status) token.status = session.status;
        if (session.isPro !== undefined) token.isPro = session.isPro;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
        (session.user as any).isPro = Boolean(token.isPro);
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
      isPro?: boolean;
    };
  }
}
