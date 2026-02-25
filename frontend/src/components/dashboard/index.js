import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user, role, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Not logged in</p>;

  return (
    <>
      <h1>Welcome {user.email}</h1>
      <p>Role: {role}</p>
    </>
  );
}
