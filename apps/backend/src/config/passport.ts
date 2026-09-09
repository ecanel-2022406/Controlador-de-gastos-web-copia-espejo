import dotenv from 'dotenv';
dotenv.config(); // <-- Esto debe ir primero que nada

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const nombre = profile.displayName || email?.split('@')[0];

        if (!email) {
          return done(new Error('Google no proporcionó un correo electrónico válido'), undefined);
        }

        let usuario = await prisma.usuario.findUnique({
          where: { email },
        });

        if (!usuario) {
          usuario = await prisma.usuario.create({
            data: {
              email,
              nombre: nombre || 'Usuario Google',
              password: '',
            },
          });
        }

        return done(null, usuario);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);