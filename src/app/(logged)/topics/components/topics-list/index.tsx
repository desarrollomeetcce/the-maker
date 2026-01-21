'use client'
import { useTransition, useState } from "react";
import {
    Typography,
    Button,
    CircularProgress,
    Link,
    FormControlLabel,
    Checkbox,
    ToggleButton,
    ToggleButtonGroup,
    TextField,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { generateFullBookAction } from "@/app/(logged)/book/application/Generate";

interface TopicWithSubtopics {
    id: string;
    title: string;
    slug: string;
    subtopics: {
        id: string;
        title: string;
        generated: boolean;
        htmlPath: string;
        quizPath: string;
        topicId: string
    }[];
}

export default function TopicsList({ topics }: { topics: TopicWithSubtopics[] }) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<string | null>(null);
    const [includeImages, setIncludeImages] = useState(true);
    const [useWebImages, setUseWebImages] = useState(false);
    const [filter, setFilter] = useState<'all' | 'generated' | 'pending'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const handleRegenerate = (
        topic: TopicWithSubtopics,
        subtopic: TopicWithSubtopics["subtopics"][0],
        index: number
    ) => {
        startTransition(async () => {
            const fileSlug = `Tomo-${index + 1}-${topic.slug}-${subtopic.title}`
                .toLowerCase()
                .replace(/[\W_]+/g, "-");

            try {
                await generateFullBookAction(
                    `${topic.title.toUpperCase()} Tomo ${subtopic.title}`,
                    fileSlug,
                    topic.id,
                    includeImages,
                    useWebImages ? "pixabay" : "dalle"
                );
                setStatus(`Tomo ${index + 1} regenerado.`);
            } catch (e) {
                console.error(e);
                setStatus(`Error al regenerar Tomo ${index + 1}`);
            }
        });
    };

    const filteredTopics = topics.map((topic) => ({
        ...topic,
        subtopics: topic.subtopics.filter((sub) => {
            const matchesFilter =
                filter === "all"
                    ? true
                    : filter === "generated"
                        ? sub.generated
                        : !sub.generated;

            const matchesSearch = sub.title.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesFilter && matchesSearch;
        }),
    }));

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <Typography variant="h4" gutterBottom>
                Mis temas y libros generados
            </Typography>

            <div className="flex flex-col sm:flex-row gap-4 items-start mb-6">
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={includeImages}
                            onChange={(e) => setIncludeImages(e.target.checked)}
                        />
                    }
                    label="Incluir imágenes"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={useWebImages}
                            onChange={(e) => setUseWebImages(e.target.checked)}
                        />
                    }
                    label="Buscar imágenes en la web"
                />
                <ToggleButtonGroup
                    value={filter}
                    exclusive
                    onChange={(_, value) => value && setFilter(value)}
                    size="small"
                    sx={{
                        ml: 'auto',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 1,
                    }}
                >
                    <ToggleButton
                        value="all"
                        sx={{
                            color: 'white',
                            borderColor: 'white',
                            '&.Mui-selected': {
                                backgroundColor: 'white',
                                color: 'black',
                            },
                        }}
                    >
                        Todos
                    </ToggleButton>
                    <ToggleButton
                        value="generated"
                        sx={{
                            color: 'white',
                            borderColor: 'white',
                            '&.Mui-selected': {
                                backgroundColor: 'white',
                                color: 'black',
                            },
                        }}
                    >
                        Generados
                    </ToggleButton>
                    <ToggleButton
                        value="pending"
                        sx={{
                            color: 'white',
                            borderColor: 'white',
                            '&.Mui-selected': {
                                backgroundColor: 'white',
                                color: 'black',
                            },
                        }}
                    >
                        Pendientes
                    </ToggleButton>
                </ToggleButtonGroup>


            </div>

            <TextField
                variant="outlined"
                placeholder="Buscar tema o subtema..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                sx={{
                    input: { color: 'white' },
                    label: { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'white',
                        },
                        '&:hover fieldset': {
                            borderColor: '#ccc',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#90caf9',
                        },
                    },
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 1,
                }}
            />


            {status && (
                <Typography color="secondary" className="mb-4">
                    {status}
                </Typography>
            )}

            {filteredTopics
                .filter((topic) => topic.subtopics.length > 0)
                .map((topic) => (
                    <Accordion key={topic.id} className="mb-4">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">{topic.title}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {topic.subtopics.length === 0 ? (
                                <Typography color="textSecondary">
                                    No hay subtemas en este filtro.
                                </Typography>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {topic.subtopics.map((sub, i) => (
                                        <div key={sub.id} className="border p-4 rounded shadow-sm">
                                            <Typography
                                                variant="subtitle2"
                                                gutterBottom
                                                color="textSecondary"
                                            >
                                                Tomo {i + 1}: {sub.title}
                                            </Typography>
                                            {sub.generated ? (
                                                <>
                                                    <Link
                                                        href={sub.htmlPath}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        underline="hover"
                                                    >
                                                        <Button variant="outlined" fullWidth>
                                                            Ver libro
                                                        </Button>
                                                    </Link>
                                                    <Link
                                                        href={'/book/'+sub.topicId}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        underline="hover"
                                                    >
                                                        <Button variant="outlined" fullWidth className="mt-2">
                                                            Ver cuestionario
                                                        </Button>
                                                    </Link>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    color="warning"
                                                    fullWidth
                                                    disabled={isPending}
                                                    onClick={() => handleRegenerate(topic, sub, i)}
                                                >
                                                    {isPending ? <CircularProgress size={20} /> : "Regenerar"}
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </AccordionDetails>
                    </Accordion>
                ))}
        </div>
    );
}
