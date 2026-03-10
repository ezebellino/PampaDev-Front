import { useState } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { logSystem } from "../lib/utils/logger";

export default function CreateRubroPage() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMin, setDurationMin] = useState(60);
  const [basePrice, setBasePrice] = useState(0);
  const [tags, setTags] = useState("");

  function handleSubmit() {
    const newRubro = {
      id: crypto.randomUUID(),
      name,
      description,
      durationMin,
      basePrice,
      tags: tags.split(",").map((tag) => tag.trim()),
      active: true,
    };

    logSystem({
      level: "info",
      origin: "frontend",
      layer: "ui",
      feature: "rubros",
      message: "Nuevo rubro creado por Dev",
      meta: newRubro,
    });

    nav("/app/rubros");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Crear Rubro" subtitle="Panel Dev" />

      <Card>
        <CardHeader>
          <CardTitle>Datos del rubro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre"
            className="input"
          />

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descripción"
            className="input"
          />

          <input
            type="number"
            value={durationMin}
            onChange={(event) => setDurationMin(Number(event.target.value))}
            placeholder="Duración en minutos"
            className="input"
          />

          <input
            type="number"
            value={basePrice}
            onChange={(event) => setBasePrice(Number(event.target.value))}
            placeholder="Precio base"
            className="input"
          />

          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Tags separados por coma"
            className="input"
          />

          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Crear</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
