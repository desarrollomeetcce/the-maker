"use client";

import { useRef, useState } from "react";
import { TextField, Button, Typography, Card, CardContent, CircularProgress, Link, Box, FormControlLabel, Checkbox, IconButton } from "@mui/material";
import { v4 as uuidv4 } from 'uuid';
import { generateSubtopicsAction, generateFullBookAction } from "../../application/Generate";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { upsertSubtopic, removeSubtopicByTitle, saveTopicWithSubtopics } from "../../application/ManageTopics";
import debounce from "lodash.debounce";

const FullBookGenerator = () => {
  const debouncedUpdate = useRef(
  debounce(async (index: number, title: string) => {
    try {
      if (topicId && title.trim()) {
        await upsertSubtopic(topicId, title); // ya conoces la ruta y paths internamente
      }
    } catch (error) {
      console.error("Error actualizando subtema:", error);
    }
  }, 600)
).current;


  const [title, setTitle] = useState("");
  const [loadingSubtopics, setLoadingSubtopics] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [includeImages, setIncludeImages] = useState(false);
  const [generateImges, setGenerateImages] = useState(true);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [topicSlug, setTopicSlug] = useState<string | null>(null);
  const [results, setResults] = useState<{
    subtopic: string;
    url: string;
    loading: boolean;
    generated: boolean;
    newTopicId: string;
  }[]>([]);

  const handleGenerateSubtopics = async () => {
    if (!title.trim()) {
      setStatus("Escribe un título para generar los subtemas.");
      return;
    }

    setLoadingSubtopics(true);
    setStatus("Generando subtemas...");
    setResults([]);

    try {
      const subtopics = await generateSubtopicsAction(title);
      const newTopicId = uuidv4();
      const newTopicSlug = title.toLowerCase().replace(/[^\w\d]+/g, '-');

      // 🔹 Guarda el topic y subtemas en la base de datos
      await saveTopicWithSubtopics(newTopicId, title, newTopicSlug, subtopics);


      setTopicId(newTopicId);
      setTopicSlug(newTopicSlug);

      const resultArray = subtopics.map((sub, i) => {
        const tomo = i + 1;
        const fileSlug = `Tomo-${tomo}-${newTopicSlug}-${sub}`.toLowerCase().replace(/[^\w\d]+/g, '-');
        const url = `/generated/${newTopicId}/${fileSlug}.html`;
        return { subtopic: sub, url, loading: false, generated: false, newTopicId };
      });

      setResults(resultArray);

      setStatus("Subtemas generados. Puedes editar, eliminar o agregar nuevos.");
    } catch (err) {
      console.error(err);
      setStatus("Error al generar los subtemas.");
    } finally {
      setLoadingSubtopics(false);
    }
  };

  const handleSubtopicChange = (index: number, newText: string) => {
    const updatedResults = [...results];
    updatedResults[index].subtopic = newText;
    updatedResults[index].generated = false;
    setResults(updatedResults);
    debouncedUpdate(index, newText);
  };

  const handleAddSubtopic = async () => {
    if (!topicId) return;
    const newResult = {
      subtopic: "",
      url: "",
      loading: false,
      generated: false,
      newTopicId: ""
    };
    const response = await upsertSubtopic(topicId, "");
    setResults([...results, newResult]);
  };

  const handleRemoveSubtopic = async (index: number) => {
    if (!topicId) return;
    const sub = results[index];
    if (sub.subtopic) {
      await removeSubtopicByTitle(topicId, sub.subtopic);

    }
    const updatedResults = results.filter((_, i) => i !== index);
    setResults(updatedResults);
  };

  const handleGenerateBook = async (index: number) => {
    if (!topicId || !topicSlug) return;

    const updatedResults = [...results];
    updatedResults[index].loading = true;
    setResults([...updatedResults]);

    const sub = results[index].subtopic;
    const tomo = index + 1;
    const fileSlug = `Tomo-${tomo}-${topicSlug}-${sub}`.toLowerCase().replace(/[^\w\d]+/g, '-');

    try {
      await generateFullBookAction(`${title.toUpperCase()} Tomo ${sub}`, fileSlug, topicId, includeImages, generateImges ? "dalle" : "pixabay");
      updatedResults[index].generated = true;
      updatedResults[index].url = `/generated/${topicId}/${fileSlug}.html`;
      setStatus(`Tomo ${tomo} generado.`);
    } catch (err) {
      console.error(err);
      setStatus(`Error al generar Tomo ${tomo}.`);
    } finally {
      updatedResults[index].loading = false;
      setResults([...updatedResults]);
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
          <FormControlLabel
            control={
              <Checkbox
                checked={!generateImges}
                onChange={(e) => setGenerateImages(!e.target.checked)}
              />
            }
            label="Buscar imagenes en la web"
          />
          <Box className="flex gap-4 items-center mt-4">
            <Button
              variant="contained"
              onClick={handleGenerateSubtopics}
              disabled={loadingSubtopics || !title.trim()}
            >
              {loadingSubtopics ? <CircularProgress size={24} /> : "Generar subtemas"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddSubtopic}
            >
              Agregar subtema
            </Button>
          </Box>
          {status && <Typography className="mt-4">{status}</Typography>}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Subtemas:</Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((item, index) => (
                <div key={index} className="border p-4 rounded shadow-sm relative">
                  <Typography variant="subtitle2" gutterBottom color="textSecondary">
                    Tomo {index + 1}
                  </Typography>
                  <TextField
                    fullWidth
                    value={item.subtopic}
                    onChange={(e) => handleSubtopicChange(index, e.target.value)}
                    label="Subtema"
                    className="mb-2"
                  />
                  <div className="relative">
                    <IconButton
                      onClick={() => handleRemoveSubtopic(index)}
                      className="absolute top-2 right-2"
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>

                    {item.generated ? (
                      <div className="flex flex-col gap-2 mt-2">
                        <Link
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                        >
                          <Button variant="outlined" fullWidth>
                            Ver libro generado
                          </Button>
                        </Link>
                        <Link
                          href={`/book/${topicId}`} // <-- corregido: debe usar topicId
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                        >
                          <Button variant="outlined" fullWidth>
                            Ver cuestionario
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Button
                        variant="outlined"
                        onClick={() => handleGenerateBook(index)}
                        disabled={item.loading || !item.subtopic.trim()}
                        className="mt-2"
                        fullWidth
                      >
                        {item.loading ? <CircularProgress size={20} /> : "Generar libro"}
                      </Button>
                    )}
                  </div>

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
