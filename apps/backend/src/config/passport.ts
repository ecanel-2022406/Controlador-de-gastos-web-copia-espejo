import dotenv from 'dotenv';
dotenv.config(); 

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';

// Estrategia de Google OAuth
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

// Estrategia JWT para proteger las rutas de la API (Gastos, etc.)
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: jwtPayload.id }
      });

      if (usuario) {
        return done(null, usuario);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);