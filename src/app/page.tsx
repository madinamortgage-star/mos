import { redirect } from "next/navigation";

// Root entry — push visitors into the app. Once auth is wired the middleware
// + (app) layout will gate this behind `/login`.
export default function RootPage() {
  redirect("/home");
}
