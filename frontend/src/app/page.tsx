// import DefaultLayout from "@/components/Layouts/DefaultLayout";
import HomePage from "@/components/HomePage/HomePage";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
// import Dashboard from "./cards/dashboard";

export default async function Home() {
  const res = await getServerSideProps();
  return (
    <>
      <HomePage />
    </>
  );
}

const getServerSideProps = async () => {
  const session = await getServerSession();
  if (session == null) {
    // return redirect("api/auth/signin");
  }
};
