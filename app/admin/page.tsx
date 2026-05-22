import type { Metadata } from "next";
import { AdminScreen } from "./admin-screen";

export const metadata: Metadata = {
  title: "管理员后台 | 爱上背单词",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return <AdminScreen />;
}
