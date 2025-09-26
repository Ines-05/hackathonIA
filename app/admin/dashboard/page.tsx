"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RequestSummary {
  id: string;
  filename: string;
  status: string;
  timestamp: string;
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://192.168.1.1.179:5001/admin/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("admin_token");
          router.push("/admin/login");
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        }
      } catch (error) {
        console.error("Failed to fetch requests", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Tableau de Bord Administrateur</h1>
          <Button variant="outline" onClick={handleLogout} className="border-gray-600 text-white hover:bg-gray-800">
            Déconnexion
          </Button>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Historique des Demandes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="w-[250px] text-gray-300">Fichier</TableHead>
                  <TableHead className="text-gray-300">Statut</TableHead>
                  <TableHead className="text-gray-300">Date de Traitement</TableHead>
                  <TableHead className="text-right text-gray-300">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-gray-700">
                    <TableCell colSpan={4} className="text-center text-white">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : requests.length > 0 ? (
                  requests.map((req) => (
                    <TableRow key={req.id} className="border-gray-700 hover:bg-gray-700">
                      <TableCell className="font-medium text-white">
                        {req.filename}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            req.status === "Traitée" ? "default" : "destructive"
                          }
                          className={req.status === "Traitée" ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {format(new Date(req.timestamp), "dd MMMM yyyy HH:mm", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="link" className="text-blue-400 hover:text-blue-300">
                          <Link href={`/admin/requests/${req.id}`}>
                            Voir les détails
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-gray-700">
                    <TableCell colSpan={4} className="text-center text-white">
                      Aucune demande trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
