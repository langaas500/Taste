import { redirect } from "next/navigation";

export default function WrappedIndex() {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  redirect(`/wrapped/${month}`);
}
