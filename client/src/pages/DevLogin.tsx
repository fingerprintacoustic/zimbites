import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function DevLogin() {
  const [openId, setOpenId] = useState("");

  const handleLogin = (id?: string) => {
    const targetId = id || openId;
    if (!targetId) return;
    window.location.href = `/api/dev/login?openId=${encodeURIComponent(targetId)}`;
  };

  const demoAccounts = [
    { role: "Admin", id: "admin-demo-001" },
    { role: "Customer", id: "customer-demo-001" },
    { role: "Restaurant", id: "restaurant-demo-001" },
    { role: "Driver", id: "driver-demo-001" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Development Login</CardTitle>
          <CardDescription>Enter an OpenID to sign in to the demo environment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">OpenID</Label>
            <Input
              placeholder="Enter OpenID (e.g. customer-demo-001)"
              value={openId}
              onChange={(e) => setOpenId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button className="w-full" onClick={() => handleLogin()} disabled={!openId}>
              Sign In
            </Button>
          </div>

          <div className="pt-4">
            <p className="text-sm font-medium mb-2">Quick Select Demo Accounts:</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <Button
                  key={acc.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleLogin(acc.id)}
                >
                  {acc.role}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
