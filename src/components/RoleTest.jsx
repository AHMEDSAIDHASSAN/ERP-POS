import { useSelector } from "react-redux";

export default function RoleTest() {
  const user = useSelector((store) => store.user.user);

  const rolePermissions = {
    admin: [
      "Dashboard",
      "Service Management",
      "Staff",
      "Tables/Orders",
      "Tables",
      "Kitchen",
      "Attendance",
    ],
    operation: [
      "Dashboard",
      "Service Management",
      "Tables/Orders",
      "Tables",
      "Kitchen",
    ],
    waiter: ["Tables/Orders", "Tables"],
    staff: ["Kitchen"],
  };

  const userPermissions = rolePermissions[user?.role] || [];

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Role & Permissions Test</h3>
      <div className="space-y-2">
        <p>
          <strong>Current User:</strong> {user?.name}
        </p>
        <p>
          <strong>Role:</strong> {user?.role}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <div>
          <strong>Available Pages:</strong>
          <ul className="list-disc list-inside ml-4 mt-1">
            {userPermissions.map((permission, index) => (
              <li key={index} className="text-green-600">
                {permission}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
