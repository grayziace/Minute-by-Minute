"use client";

import { useEffect, useState } from "react";

interface Place {
  id: string;
  name: string;
  placeType: string;
  address: string | null;
}

export function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [name, setName] = useState("");
  const [placeType, setPlaceType] = useState("other");

  useEffect(() => {
    void fetch("/api/places")
      .then((r) => r.json())
      .then((d) => setPlaces(d.places ?? []));
  }, []);

  async function addPlace() {
    if (!name.trim()) return;
    const res = await fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), placeType }),
    });
    const data = await res.json();
    setPlaces((p) => [...p, data.place]);
    setName("");
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-5 pb-32 pt-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl">Places</h1>
      </header>

      <div className="mb-8 space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Place name"
          className="w-full border border-border/50 bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <select
          value={placeType}
          onChange={(e) => setPlaceType(e.target.value)}
          className="w-full border border-border/50 bg-surface px-3 py-2 text-sm outline-none"
        >
          <option value="school">School</option>
          <option value="apartment">Apartment</option>
          <option value="restaurant">Restaurant</option>
          <option value="cafe">Cafe</option>
          <option value="metro">Metro</option>
          <option value="park">Park</option>
          <option value="city">City</option>
          <option value="other">Other</option>
        </select>
        <button
          onClick={() => void addPlace()}
          className="w-full bg-accent py-2 text-xs uppercase tracking-wider text-background"
        >
          Add place
        </button>
      </div>

      <ul className="divide-y divide-border/30">
        {places.map((p) => (
          <li key={p.id} className="py-4">
            <p>{p.name}</p>
            <p className="text-xs uppercase tracking-wider text-muted">{p.placeType}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
