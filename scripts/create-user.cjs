const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { hash } = require("bcrypt");

const BCRYPT_SALT_ROUNDS = 10;
const root = path.join(__dirname, "..");
process.chdir(root);

const prismaModule = path.join(root, "generated", "prisma", "index.js");
const { PrismaClient, Prisma } = require(prismaModule);

void (async function main() {
  // Тот же t3-`env`, что в Next (`src/env.js`).
  const { env } = await import(pathToFileURL(path.join(root, "src", "env.js")));

  const db = new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    console.error("Использование: pnpm run create-user -- <email> <password>");
    await db.$disconnect();
    process.exit(1);
  }

  const passwordHash = await hash(password, BCRYPT_SALT_ROUNDS);

  try {
    const user = await db.user.create({
      data: {
        email: email.trim(),
        password: passwordHash,
      },
    });
    console.log("Пользователь создан:", user.id, user.email);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      console.error("Пользователь с таким email уже существует.");
      process.exit(1);
    }
    throw e;
  } finally {
    await db.$disconnect();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
