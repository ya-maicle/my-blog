import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: "USER" | "ADMIN";
  isActive: boolean;
};

type ListResponse = {
  total: number;
  users: User[];
  page: number;
  size: number;
};

export default function UsersPage() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(page = 1) {
    setLoading(true);
    const res = await fetch(`/api/admin/users?query=${encodeURIComponent(query)}&page=${page}&size=20`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateUser(id: string, body: Partial<Pick<User, "role" | "isActive">>) {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const msg = await res.text();
      alert("Update failed: " + msg);
    }
    await load(data?.page ?? 1);
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>User Management</h1>
      <div style={{ margin: "12px 0" }}>
        <input
          placeholder="Search by name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: 8, width: 320 }}
        />
        <button onClick={() => load(1)} style={{ marginLeft: 8, padding: "8px 12px" }}>
          Search
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {data && (
        <>
          <p>
            Showing {data.users.length} of {data.total}
          </p>
          <table cellPadding={8} style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Name</th>
                <th align="left">Email</th>
                <th align="left">Role</th>
                <th align="left">Active</th>
                <th align="left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u.id} style={{ borderTop: "1px solid #ddd" }}>
                  <td>{u.name ?? "-"}</td>
                  <td>{u.email ?? "-"}</td>
                  <td>{u.role}</td>
                  <td>{u.isActive ? "Yes" : "No"}</td>
                  <td>
                    {u.role === "USER" ? (
                      <button onClick={() => updateUser(u.id, { role: "ADMIN" })}>Make Admin</button>
                    ) : (
                      <button onClick={() => updateUser(u.id, { role: "USER" })}>Demote</button>
                    )}{" "}
                    {u.isActive ? (
                      <button onClick={() => updateUser(u.id, { isActive: false })}>Deactivate</button>
                    ) : (
                      <button onClick={() => updateUser(u.id, { isActive: true })}>Reactivate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12 }}>
            <button disabled={(data.page ?? 1) <= 1} onClick={() => load((data.page ?? 1) - 1)}>
              Prev
            </button>
            <span style={{ margin: "0 8px" }}>Page {data.page}</span>
            <button
              disabled={data.page * data.size >= data.total}
              onClick={() => load((data.page ?? 1) + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}
