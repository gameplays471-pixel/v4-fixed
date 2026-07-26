// Promove um usuário existente a admin. Necessário só pra criar o
// *primeiro* admin — depois disso, dá pra imaginar uma tela "Usuários"
// dentro do próprio painel admin pra promover/rebaixar outras contas.
//
// Uso:
//   bunx tsx scripts/make-admin.ts email@exemplo.com
// ou:
//   bun run scripts/make-admin.ts email@exemplo.com

import { db } from "../src/lib/db";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: tsx scripts/make-admin.ts <email>");
    process.exit(1);
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`Nenhum usuário encontrado com o e-mail "${email}"`);
    process.exit(1);
  }

  await db.user.update({ where: { email }, data: { role: "admin" } });
  console.log(`✅ ${user.name} <${email}> agora é admin.`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
