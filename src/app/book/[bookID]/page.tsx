import fs from 'fs/promises';
import path from 'path';
import Quiz from './components/quiz';

export default async function QuizServer({ params }: { params: { bookID: string } }) {
  const { bookID } = params;

  let questions = [];

  try {
    const filePath = path.resolve(process.cwd(), 'quiz', bookID, 'quiz.json');
    const data = await fs.readFile(filePath, 'utf8');
    questions = JSON.parse(data);
  } catch (error) {
    console.error(`No se pudo leer el cuestionario de ${bookID}:`, error);
  }

  return <Quiz questions={questions} />;
}
