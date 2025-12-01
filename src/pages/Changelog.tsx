import { useAssets } from "@/contexts/AssetsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

export default function Changelog() {
  const { changelog, assetsInfo,fetchChangelog } = useAssets();
  const assets = assetsInfo.assets;
  const [search, setSearch] = useState("");

  

  const getActionBadge = (action: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      created: { variant: "default", label: "Creado" },
      updated: { variant: "secondary", label: "Actualizado" },
      relocated: { variant: "outline", label: "Reubicado" },
      cost_updated: { variant: "secondary", label: "Costo Actualizado" },
      status_changed: { variant: "outline", label: "Estado Cambiado" },
      decommissioned: { variant: "destructive", label: "Desincorporado" },
    };
    const config = variants[action] || variants.updated;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      name: "Nombre",
      type: "Tipo",
      subtype: "Subtipo",
      description: "Descripción",
      serialNumber: "Serial",
      responsible: "Responsable",
      location: "Ubicación",
      cost: "Costo",
      status: "Estado",
      asset: "Activo",
    };
    return labels[field] || field;
  };

  const filteredChangelog = changelog.filter((entry) => {
    const asset = assets.find((a) => a.id === entry.asset_id);
    const searchLower = search.toLowerCase();
    return (
      entry.user?.username.toLowerCase().includes(searchLower) ||
      entry.change_type.toLowerCase().includes(searchLower) ||
      asset?.name.toLowerCase().includes(searchLower) ||
      entry.changes.some(
        (c) =>
          String(c.oldValue).toLowerCase().includes(searchLower) ||
          String(c.newValue).toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historial de Cambios</h1>
        <p className="text-muted-foreground mt-1">Registro cronológico de todas las operaciones</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar en Historial</CardTitle>
          <CardDescription>Filtra por usuario, acción o activo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredChangelog.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No se encontraron registros</p>
            </CardContent>
          </Card>
        ) : (
          filteredChangelog.reverse().map((entry) => {
            const asset = assets.find((a) => a.id === entry.asset_id);
            return (
              <Card key={entry.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getActionBadge(entry.change_type)}
                        <span className="font-medium">{asset?.name || "Activo eliminado"}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Por {entry.user.username} •{" "}
                        {new Date(entry.createdAt).toLocaleString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="space-y-1">
                        {entry.changes.map((change, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium text-foreground">
                              {getFieldLabel(change.field)}:
                            </span>{" "}
                            <span className="text-muted-foreground line-through">
                              {change.oldValue || "N/A"}
                            </span>{" "}
                            → <span className="font-medium text-primary">{change.newValue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
