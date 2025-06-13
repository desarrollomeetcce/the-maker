// app/book-library/page.tsx
"use client";

import { useState } from "react";
import { TextField, Button, Typography, Card, CardContent, CircularProgress, Link, Box, FormControlLabel, Checkbox } from "@mui/material";
import { v4 as uuidv4 } from 'uuid';
import { generateSubtopicsAction, generateFullBookAction } from "../../application/Generate";

const FullBookGenerator = () => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [results, setResults] = useState<{ subtopic: string; url: string }[]>([]);
  const [includeImages, setIncludeImages] = useState(false);

  const handleGenerate = async () => {
    if (!title.trim()) {
      setStatus("Escribe un título para generar los libros.");
      return;
    }

    setLoading(true);
    setStatus("Generando subtemas...");
    setResults([]);

    try {
      const subtopics = await generateSubtopicsAction(title);
      const topicId = uuidv4();
      const topicSlug = title.toLowerCase().replace(/[^\w\d]+/g, '-');
      const resultArray: { subtopic: string; url: string }[] = subtopics.map((sub, i) => {
        const tomo = i + 1;
        const fileSlug = `Tomo-${tomo}-${topicSlug}-${sub}`.toLowerCase().replace(/[^\w\d]+/g, '-');
        const url = `/generated/${topicId}/${fileSlug}.html`;
        return { subtopic: sub, url };
      });

      setResults(resultArray);
      setStatus("Generando libros...");

      let count = 0;
      for (const sub of subtopics) {
        count++;
        const fileSlug = `Tomo-${count}-${topicSlug}-${sub}`.toLowerCase().replace(/[^\w\d]+/g, '-');
        await generateFullBookAction(`${topicSlug.toUpperCase()} Tomo ${sub}`, fileSlug, topicId, includeImages);
      }

      setStatus("Todos los libros han sido generados.");
    } catch (err) {
      console.error(err);
      setStatus("Error al generar los libros.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Typography variant="h4" gutterBottom>
        Biblioteca de libros
      </Typography>

      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6">Título general</Typography>
          <TextField
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Escribe un título principal..."
            className="mt-2"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
              />
            }
            label="Generar con imágenes"
          />
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={loading || !title.trim()}
            className="mt-4"
          >
            {loading ? <CircularProgress size={24} /> : "Generar libros por subtema"}
          </Button>
          {status && <Typography className="mt-4">{status}</Typography>}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Libros generados:</Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((item, index) => (
                <div key={index} className="border p-4 rounded shadow-sm hover:shadow-md transition">
                  <Typography variant="subtitle2" gutterBottom color="textSecondary">
                    Tomo {index + 1}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {item.subtopic}
                  </Typography>
                  <Link href={item.url} target="_blank" rel="noopener noreferrer" underline="hover">
                    Ver libro
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FullBookGenerator;
