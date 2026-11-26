import { Redirect } from 'expo-router';

import { db, schema } from '@/data/db';

// Toda abertura decide a primeira tela: sem estudo → Início; com estudo → Hoje (FR-004).
export default function Entrada() {
  const existe = db.select({ id: schema.estudo.id }).from(schema.estudo).limit(1).get();
  return <Redirect href={existe ? '/hoje' : '/inicio'} />;
}
