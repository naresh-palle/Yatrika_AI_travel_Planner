export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("Running DB migrations in instrumentation.ts...");
    const { execSync } = await import("child_process");
    try {
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      console.log("Migration completed successfully.");
    } catch (error) {
      console.error("Migration failed:", error);
    }
  }
}
