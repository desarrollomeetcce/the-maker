'use client'
import {
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  DialogActions,
  Box,
  CircularProgress as MuiCircularProgress
} from "@mui/material";
import { useState } from "react";

interface Question {
  question: string;
  options: string[];
  answer: string;
}

export default function Quiz({ questions }: { questions: Question[] }) {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const handleChange = (index: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    setCalculating(true);
    setTimeout(() => {
      let total = 0;
      questions.forEach((q, i) => {
        if (answers[i] === q.answer) total++;
      });
      setScore(total);
      setSubmitted(true);
      setCalculating(false);
      setShowModal(true);
    }, 1000); // simulate loading
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setShowModal(false);
  };

  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Typography variant="h4" gutterBottom>
        Cuestionario
      </Typography>

      {questions.map((q, i) => (
        <Card key={i} className="mb-4">
          <CardContent>
            <FormControl component="fieldset">
              <FormLabel component="legend">
                {i + 1}. {q.question}
              </FormLabel>
              <RadioGroup
                value={answers[i] || ""}
                onChange={(e) => handleChange(i, e.target.value)}
              >
                {q.options.map((opt, j) => (
                  <FormControlLabel
                    key={j}
                    value={opt}
                    control={<Radio disabled={submitted} />}
                    label={opt}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            {submitted && (
              <Typography
                className="mt-2"
                color={answers[i] === q.answer ? "green" : "red"}
              >
                Respuesta correcta: {q.answer}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}

      {!submitted && (
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== questions.length || calculating}
        >
          Enviar respuestas
        </Button>
      )}

      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>Resultados</DialogTitle>
        <DialogContent className="flex flex-col items-center justify-center py-6">
          {calculating ? (
            <CircularProgress />
          ) : (
            <Box position="relative" display="inline-flex">
              <MuiCircularProgress variant="determinate" value={percentage} size={120} thickness={4} />
              <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography variant="h6">
                  {score} / {questions.length}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReset} variant="outlined">
            Repetir cuestionario
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}