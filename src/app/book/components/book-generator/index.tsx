"use client";

import { useState } from "react";
import { TextField, Button, Typography, Card, CardContent, IconButton, CircularProgress, Backdrop } from "@mui/material";
import { Add, Delete, PictureAsPdf } from "@mui/icons-material";
import Image from "next/image";
import {
  generateContentAction,
  generateCoverImageAction,
  generateSubtopicsAction,
} from "../../application/Generate";

import './styles.css';

const MAX_CONCURRENT_REQUESTS = 3;

const BookGenerator = () => {
  const [title, setTitle] = useState("");
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [contents, setContents] = useState<(string | null | "error")[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSubtopicChange = (index: number, value: string) => {
    const updated = [...subtopics];
    updated[index] = value;
    setSubtopics(updated);
  };

  const addSubtopic = () => {
    setSubtopics([...subtopics, ""]);
  };

  const removeSubtopic = (index: number) => {
    const updated = subtopics.filter((_, i) => i !== index);
    setSubtopics(updated);
  };

  const generateAll = async () => {
    if (!title.trim()) {
      setStatus("Escribe un título primero.");
      return;
    }

    try {
      setLoadingAll(true);
      setStatus("Generando portada...");
      const image = await generateCoverImageAction(title);
      setCoverImage(image);

      let usedSubtopics = subtopics;
      if (usedSubtopics.length === 0) {
        setStatus("Generando subtemas...");
        usedSubtopics = await generateSubtopicsAction(title);
        setSubtopics(usedSubtopics);
      }

      setContents(Array(usedSubtopics.length).fill(null));
      setStatus("Generando capítulos...");

      let index = 0;

      const queue = Array(MAX_CONCURRENT_REQUESTS).fill(null).map(async function runner() {
        while (index < usedSubtopics.length) {
          const i = index++;
          try {
            const content = await generateContentAction(usedSubtopics[i], title);
            setContents(prev => {
              const updated = [...prev];
              updated[i] = content;
              return updated;
            });
          } catch (e) {
            console.error(`Error generando subtema ${i + 1}:`, e);
            setContents(prev => {
              const updated = [...prev];
              updated[i] = "error";
              return updated;
            });
          }
        }
      });

      await Promise.all(queue);
      setStatus("Todo listo.");
    } catch (error) {
      console.error("Error generando el libro completo:", error);
      setStatus("Error generando el libro");
    } finally {
      setLoadingAll(false);
    }
  };

  const exportToPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("pdf-content");
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `${title.replace(/\s+/g, '_')}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: window.devicePixelRatio || 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto relative">
      <Typography variant="h4" gutterBottom>
        Generador de Libros
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
        <div>
          <Card className="mb-4">
            <CardContent>
              <Typography variant="h6">Título del libro</Typography>
              <TextField fullWidth value={title} onChange={handleTitleChange} placeholder="Escribe un título..." className="mt-2" />
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardContent>
              <Typography variant="h6">Subtemas</Typography>
              <div className="space-y-3 mt-2">
                {subtopics.map((subtopic, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <TextField
                      fullWidth
                      value={subtopic}
                      onChange={(e) => handleSubtopicChange(index, e.target.value)}
                      placeholder={`Subtema ${index + 1}`}
                    />
                    <IconButton onClick={() => removeSubtopic(index)}>
                      <Delete />
                    </IconButton>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button startIcon={<Add />} onClick={addSubtopic}>
                  Agregar Subtema
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div id="pdf-content" className="bg-white text-black">
            {coverImage && (
              <div
                className="w-full max-w-[816px] aspect-[8.5/11] relative mx-auto mb-12"
                style={{
                  pageBreakAfter: "always",
                }}
              >
                <Image
                  src={coverImage}
                  alt="Portada"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}

            {contents.map((content, index) => (
              <div
                key={index}
                className="px-16 pb-24"
                style={{
                  ...(index > 0 ? { pageBreakBefore: "always" } : {}),
                }}
              >
                <Typography
                  variant="h5"
                  align="center"
                  sx={{ fontWeight: "bold", marginBottom: "3rem" }}
                >
                  {subtopics[index]}
                </Typography>

                {content === null ? (
                  <div className="text-center text-gray-500 italic">Generando contenido...</div>
                ) : content === "error" ? (
                  <div className="text-center text-red-500 italic">Error generando este capítulo.</div>
                ) : (
                  <div
                    className="prose max-w-none text-justify"
                    dangerouslySetInnerHTML={{ __html: content }}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex gap-4">
        <Button
          variant="contained"
          onClick={generateAll}
          disabled={loadingAll || !title.trim()}
          className="px-6 py-3 text-lg shadow-lg"
        >
          {loadingAll ? <CircularProgress size={24} color="inherit" /> : "Generar"}
        </Button>
        {contents.filter(c => typeof c === "string").length > 0 && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PictureAsPdf />}
            onClick={exportToPDF}
            className="px-6 py-3 text-lg shadow-lg"
          >
            Descargar PDF
          </Button>
        )}
      </div>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loadingAll}
      >
        <div className="flex flex-col items-center gap-4">
          <CircularProgress color="inherit" />
          <Typography variant="h6">{status}</Typography>
        </div>
      </Backdrop>
    </div>
  );
};

export default BookGenerator;
