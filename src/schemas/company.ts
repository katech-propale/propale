import { ROLES } from '@/constants/roles';
import { z } from 'zod';

export const companySchema = z.object({
  companyName: z.string().min(1, 'Raison sociale est requise'),
  siren: z.string().min(9, 'Numéro SIREN doit être de 9 chiffres').max(9, 'Numéro SIREN doit être de 9 chiffres'),
  apeCode: z.string().min(1, 'Code APE est requis'),
  activitySector: z.string().min(1, 'Secteur d’activité est requis'),
  firstname: z.string().min(1, 'Prénom est requis'),
  lastname: z.string().min(1, 'Nom est requis'),
  position: z.string().min(1, 'Fonction est requise'),
  role: z.enum([ROLES.ADMIN, ROLES.SALES]).optional(),
  email: z.string().email('Email invalide'),
  phone: z.string().min(1, 'Téléphone est requis'),
  address: z.string().optional(),
  postalcode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});


export type CompanyFormInputs = z.infer<typeof companySchema>;