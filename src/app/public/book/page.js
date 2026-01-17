import { redirect } from "next/navigation";

export default function PublicBookIndex() {
  redirect("/public#book");
}
